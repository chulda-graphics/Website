export function shuffleFrames<T>(items: readonly T[], random = Math.random): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Spread frames across quadrants while varying their actual positions and sizes. */
export function createPlacement(index: number, random = Math.random) {
  return {
    x: (index % 2 ? 1 : -1) * (140 + random() * 260),
    y: (index % 4 < 2 ? 1 : -1) * (60 + random() * 160),
    width: 280 + random() * 100,
  };
}

export function flightDepth(depth: number, distance: number, total: number) {
  const raw = depth - distance + 510;
  return { z: ((raw % total) + total) % total - 510, cycle: Math.floor(raw / total) };
}
