export const CRUISE_SPEED = 95;
export type FlightState = { distance: number; speed: number; boost: number; bank: number; pitch: number };
export const createFlight = (): FlightState => ({ distance: 0, speed: CRUISE_SPEED, boost: 0, bank: 0, pitch: 0 });

export function accelerateFlight(state: FlightState, input: number, reducedMotion = false) {
  if (reducedMotion) { state.distance += Math.abs(input) * 1.5; return; }
  state.boost = Math.min(1800, state.boost + Math.abs(input) * 3);
}

// Integrate acceleration and drag in seconds, so 30/60/120 Hz travel identically.
export function advanceFlight(state: FlightState, seconds: number, reducedMotion = false) {
  if (reducedMotion) { state.speed = 0; state.boost = 0; return; }
  const dt = Math.max(0, seconds);
  const drag = Math.exp(-2 * dt), response = Math.exp(-8 * dt);
  const excess = state.speed - CRUISE_SPEED;
  state.distance += CRUISE_SPEED * dt + excess * (1 - response) / 8
    + 8 * state.boost / 6 * ((1 - drag) / 2 - (1 - response) / 8);
  state.speed = CRUISE_SPEED + excess * response + 8 * state.boost / 6 * (drag - response);
  state.boost *= drag;
}
