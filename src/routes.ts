/** Retired world links lead to the About page instead of a dead end. */
export function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, '') || '/';
  return normalized === '/travel' ? '/about' : normalized;
}
