import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/components/flight.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { createFlight, accelerateFlight, advanceFlight, CRUISE_SPEED } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const simulate = (state, seconds, fps = 60, reduced = false) => {
  for (let frame = 0; frame < seconds * fps; frame++) advanceFlight(state, 1 / fps, reduced);
  return state;
};

const cruise = simulate(createFlight(), 10);
assert.ok(Math.abs(cruise.distance - 10 * CRUISE_SPEED) < 1e-8, 'Flight advances without scrolling');
const boosted = createFlight();
accelerateFlight(boosted, 500);
simulate(boosted, 1);
assert.ok(boosted.speed > CRUISE_SPEED * 2, 'Scrolling accelerates the plane');
simulate(boosted, 10);
assert.ok(Math.abs(boosted.speed - CRUISE_SPEED) < .01, 'Scroll boost settles to cruising, not zero');

const distances = [30, 60, 120].map(fps => {
  const state = createFlight(); accelerateFlight(state, -500);
  return simulate(state, 5, fps).distance;
});
assert.ok(Math.max(...distances) - Math.min(...distances) < 1e-8, 'Flight is independent of refresh rate');
const reduced = simulate(createFlight(), 10, 60, true);
assert.equal(reduced.distance, 0, 'Reduced motion disables automatic flight');
accelerateFlight(reduced, 200, true);
assert.equal(reduced.distance, 300, 'Reduced motion retains manual exploration');
console.log('Flight checks passed: cruise, boost, decay, refresh rates, reduced motion.');
