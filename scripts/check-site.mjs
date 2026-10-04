import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import ts from 'typescript';

async function loadTS(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { createFrameLoop } = await loadTS('../src/components/frameLoop.ts');
let nextId = 0, continuous = true;
const queued = new Map();
const deltas = [];
const loop = createFrameLoop(dt => { deltas.push(dt); return continuous; }, {
  request: callback => { queued.set(++nextId, callback); return nextId; },
  cancel: id => queued.delete(id),
});
function frame(time) {
  const pending = [...queued.values()]; queued.clear(); pending.forEach(callback => callback(time));
}
loop.invalidate(); loop.invalidate();
assert.equal(queued.size, 1, 'Repeated invalidation must not create duplicate frame loops');
frame(100); frame(116);
assert.equal(deltas.at(-1), .016);
loop.setActive(false);
assert.equal(queued.size, 0, 'Hidden scenes cancel their scheduled frame');
loop.invalidate();
assert.equal(queued.size, 0, 'Input cannot wake an inactive scene');
loop.setActive(true); frame(10000);
assert.equal(deltas.at(-1), 0, 'Resuming must not integrate the hidden time');
continuous = false; frame(10016);
assert.equal(queued.size, 0, 'Reduced-motion scenes stop after one requested render');
loop.invalidate(); frame(20000);
assert.equal(deltas.at(-1), 0, 'Manual reduced-motion updates do not accumulate idle time');
assert.equal(queued.size, 0);
loop.destroy(); loop.invalidate(); loop.setActive(true);
assert.equal(queued.size, 0, 'Unmounted scenes cannot restart');

const { projects, assets } = await loadTS('../src/content.ts');
const { travelPhotos } = await loadTS('../src/travelPhotos.ts');
assert.equal(new Set(projects.map(project => project.slug)).size, projects.length, 'Project routes must be unique');
assert.ok(projects.length > 0);
for (const project of projects) {
  assert.match(project.slug, /^[a-z0-9-]+$/);
  assert.ok(project.sections.length > 0);
}
const sources = [...Object.values(assets), ...travelPhotos.map(photo => photo.src), '/assets/draco/draco_decoder.wasm', '/assets/draco/draco_wasm_wrapper.js'];
for (const src of sources) {
  assert.ok(src.startsWith('/assets/'), `Asset must be local: ${src}`);
  assert.ok((await stat(new URL(`../public${src}`, import.meta.url))).size > 0, `Missing or empty asset: ${src}`);
}
for (const photo of travelPhotos) assert.ok(photo.width > 0 && photo.height > 0, 'Photos need intrinsic dimensions');
console.log(`Site checks passed: frame suspension/resumption, reduced-motion scheduling, route uniqueness, ${sources.length} local assets.`);
