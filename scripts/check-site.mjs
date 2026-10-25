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

const { projects, assets, profile } = await loadTS('../src/content.ts');
const { workFrames } = await loadTS('../src/workFrames.ts');
assert.equal(new Set(projects.map(project => project.slug)).size, projects.length, 'Project routes must be unique');
assert.ok(projects.length > 0);
for (const project of projects) {
  assert.match(project.slug, /^[a-z0-9-]+$/);
  assert.ok(project.sections.length > 0);
}
const sources = [...new Set([...Object.values(assets), ...profile.toolGroups.flatMap(group => group.items.map(tool => tool.icon)), ...projects.flatMap(project => [...(project.cover ? [project.cover] : []), ...(project.stills ?? []).map(frame => frame.src)]), ...workFrames.map(photo => photo.src), '/assets/draco/draco_decoder.wasm', '/assets/draco/draco_wasm_wrapper.js'])];
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

const { normalizePath } = await loadTS('../src/routes.ts');
assert.equal(normalizePath('/travel'), '/about');
assert.equal(normalizePath('/travel/'), '/about');
assert.equal(normalizePath('/project/project-02/'), '/project/project-02');
assert.equal(normalizePath('/'), '/');
console.log('Route checks passed: retired world links resolve to About; portfolio routes preserved.');

// A cancelled cover transition must never leave the real player hidden.
const { captureProjectCover } = await loadTS('../src/components/projectTransition.ts');
const originalDOM = { document: globalThis.document, window: globalThis.window,
  innerHeight: globalThis.innerHeight, getComputedStyle: globalThis.getComputedStyle };
const posters = new Set(), listeners = new Map();
let finishCover, failAnimation = false, reveals = 0;
const box = { left: 40, top: 200, width: 320, height: 180, bottom: 380 };
const sourceImage = { complete: true, naturalWidth: 1280, currentSrc: '/cover.webp' };
let paused = false, capturedFrame = false;
const playingVideo = { readyState: 2, currentTime: 5, videoWidth: 1280, videoHeight: 720, pause() { paused = true; } };
const card = { querySelector: selector => selector === 'img' ? sourceImage : playingVideo, getBoundingClientRect: () => box, closest: () => null };
const target = { style: { visibility: '' }, setAttribute() {}, removeAttribute() {}, getBoundingClientRect: () => ({ ...box, top: 100, width: 640, height: 360 }), closest: () => null };
try {
  Object.assign(globalThis, {
    innerHeight: 900, getComputedStyle: () => ({ borderTopLeftRadius: '24px' }),
    window: { scrollY: 0, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) },
    document: {
      body: { append: poster => posters.add(poster) },
      createElement: () => {
        const poster = { style: {}, append() {}, setAttribute() {}, getContext: () => ({ drawImage() { capturedFrame = true; } }), remove() { posters.delete(poster); },
          animate() {
            if (failAnimation) throw new Error('Animation unavailable');
            let reject;
            const finished = new Promise((resolve, fail) => { finishCover = resolve; reject = fail; });
            return { finished, cancel: () => reject(new Error('Cancelled')) };
          },
        };
        return poster;
      },
    },
  });
  sourceImage.complete = false;
  assert.equal(captureProjectCover(card), null, 'Unloaded covers use the normal route transition');
  assert.equal(posters.size, 0);
  sourceImage.complete = true;
  const completed = captureProjectCover(card);
  completed.play(target, () => reveals++);
  assert.equal(target.style.visibility, 'hidden');
  finishCover(); await Promise.resolve();
  assert.equal(target.style.visibility, '');
  assert.equal(posters.size, 0);
  assert.equal(listeners.size, 0);
  assert.equal(reveals, 1);
  const interrupted = captureProjectCover(card);
  interrupted.play(target, () => reveals++);
  listeners.get('wheel')(); interrupted.cancel(); await Promise.resolve();
  assert.equal(target.style.visibility, '', 'Scrolling restores the player immediately');
  assert.equal(posters.size, 0);
  assert.equal(listeners.size, 0);
  assert.equal(reveals, 2, 'Cancellation and the rejected animation promise clean up only once');
  failAnimation = true;
  captureProjectCover(card).play(target, () => reveals++);
  assert.equal(target.style.visibility, '', 'Animation failures cannot hide video content');
  assert.equal(posters.size, 0);
  assert.equal(listeners.size, 0);
  failAnimation = false;
  const returning = captureProjectCover(card, true);
  assert.equal(returning.returning, true);
  assert.equal(paused, true, 'Minimising stops playback');
  assert.equal(capturedFrame, true, 'A playing video returns from its current frame');
  returning.play(target, () => reveals++);
  listeners.get('scroll')();
  assert.equal(target.style.visibility, 'hidden', 'The route reset scroll event must not abort the return');
  globalThis.window.scrollY = 20;
  listeners.get('scroll')(); await Promise.resolve();
  assert.equal(target.style.visibility, '', 'Actual scrolling restores the thumbnail');
  assert.equal(posters.size, 0);
  assert.equal(listeners.size, 0);
} finally { Object.assign(globalThis, originalDOM); }
console.log('Project transition checks passed: opening, minimising, playback capture, scroll reset, interruption, failure cleanup.');
