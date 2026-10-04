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
const { workFrames } = await loadTS('../src/workFrames.ts');
assert.equal(new Set(projects.map(project => project.slug)).size, projects.length, 'Project routes must be unique');
assert.ok(projects.length > 0);
for (const project of projects) {
  assert.match(project.slug, /^[a-z0-9-]+$/);
  assert.ok(project.sections.length > 0);
}
const sources = [...new Set([...Object.values(assets), ...projects.flatMap(project => [...(project.cover ? [project.cover] : []), ...(project.stills ?? []).map(frame => frame.src)]), ...workFrames.map(photo => photo.src), '/assets/draco/draco_decoder.wasm', '/assets/draco/draco_wasm_wrapper.js'])];
for (const src of sources) {
  assert.ok(src.startsWith('/assets/'), `Asset must be local: ${src}`);
  assert.ok((await stat(new URL(`../public${src}`, import.meta.url))).size > 0, `Missing or empty asset: ${src}`);
}
for (const photo of workFrames) assert.ok(photo.width > 0 && photo.height > 0, 'Photos need intrinsic dimensions');
console.log(`Site checks passed: frame suspension/resumption, reduced-motion scheduling, route uniqueness, ${sources.length} local assets.`);

const { createPlacement, flightDepth, shuffleFrames } = await loadTS('../src/components/flightLayout.ts');
const shuffled = shuffleFrames(workFrames, () => .25);
assert.equal(new Set(shuffled.map(frame => frame.src)).size, workFrames.length, 'Shuffle must keep every work screenshot exactly once');
assert.notDeepEqual(shuffled, workFrames, 'Entry order should be shuffled');
for (let i = 0; i < 20; i++) {
  const placement = createPlacement(i);
  assert.ok(Math.abs(placement.x) >= 140 && Math.abs(placement.x) <= 400);
  assert.ok(Math.abs(placement.y) >= 60 && Math.abs(placement.y) <= 220);
  assert.ok(placement.width >= 280 && placement.width <= 380);
}
const total = workFrames.length * 560;
const before = flightDepth(0, 509, total), after = flightDepth(0, 511, total);
assert.equal(before.cycle, 0);
assert.equal(after.cycle, -1);
assert.ok(before.z < -505 && after.z > 2900, 'Placement changes occur between invisible ends of the flight path');
assert.equal(flightDepth(0, total + 511, total).z, after.z, 'Gallery loops continuously');
console.log('Work gallery checks passed: complete shuffle, bounded placement, invisible recycling, repeated loops.');

// Silent player doubles exercise audio lifecycle without using a speaker.
const { createSoundEngine, soundSources } = await loadTS('../src/components/soundEngine.ts');
for (const src of Object.values(soundSources)) assert.ok((await stat(new URL(`../public${src}`, import.meta.url))).size > 0);
let clock = 0, allowed = true, notifications = 0;
const players = [];
const sound = createSoundEngine({
  now: () => clock, allowed: () => allowed,
  create: src => {
    const player = { src, currentTime: 0, volume: 1, plays: 0, pauses: 0, pending: [],
      play() { this.plays++; return new Promise((resolve, reject) => this.pending.push({ resolve, reject })); },
      pause() { this.pauses++; }
    };
    players.push(player); return player;
  }
});
const unsubscribe = sound.subscribe(() => notifications++);
sound.play('click');
assert.equal(players.length, 0, 'Muted by default; no audio allocation or downloads');
sound.setEnabled(true);
sound.play('click');
assert.equal(players.length, 1);
assert.equal(players[0].volume, .6);
sound.play('navigate');
assert.equal(players.length, 1, 'Rapid incidental cues are throttled');
clock = 110; sound.play('click');
const pauses = players[0].pauses;
players[0].pending[0].resolve(); await Promise.resolve();
assert.equal(players[0].pauses, pauses, 'An older play promise cannot stop a newer cue on the same player');
sound.play('confirm');
assert.equal(players.length, 2, 'Confirmation can preempt a click');
assert.ok(players[0].pauses > pauses, 'New cues stop the previous sound');
sound.setEnabled(false);
const stopped = players[1].pauses;
players[1].pending[0].resolve(); await Promise.resolve();
assert.ok(players[1].pauses > stopped, 'A pending play cannot restart audio after muting');
sound.setEnabled(true); allowed = false; clock = 250;
sound.play('navigate');
assert.equal(players.length, 2, 'Hidden pages and playing videos suppress new cues');
allowed = true; sound.play('navigate');
players[2].pending[0].reject(new Error('Autoplay denied')); await Promise.resolve(); await Promise.resolve();
assert.equal(notifications, 3);
unsubscribe(); sound.setEnabled(false);
assert.equal(notifications, 3);
console.log('Sound checks passed: default mute, lazy loading, throttling, single voice, async races, video suppression, rejection handling, assets.');
