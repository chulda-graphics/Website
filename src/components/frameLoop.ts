type FrameDriver = {
  request: (callback: FrameRequestCallback) => number;
  cancel: (handle: number) => void;
};

/** A demand-driven loop: inactive scenes own no frames and resume without a time jump. */
export function createFrameLoop(draw: (seconds: number) => boolean, driver: FrameDriver = {
  request: callback => requestAnimationFrame(callback),
  cancel: handle => cancelAnimationFrame(handle),
}) {
  let frame: number | null = null;
  let previous: number | null = null;
  let active = true;
  let disposed = false;
  function invalidate() {
    if (active && !disposed && frame === null) frame = driver.request(tick);
  }
  function tick(now: number) {
    frame = null;
    if (!active || disposed) return;
    const seconds = previous === null ? 0 : Math.min(Math.max(0, (now - previous) / 1000), .04);
    previous = now;
    if (draw(seconds)) invalidate();
    else previous = null;
  }
  function stop() {
    if (frame !== null) driver.cancel(frame);
    frame = null;
    previous = null;
  }
  return {
    invalidate,
    setActive(value: boolean) { active = value; if (value) invalidate(); else stop(); },
    destroy() { disposed = true; stop(); },
  };
}
