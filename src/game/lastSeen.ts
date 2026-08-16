// Deliberately separate from GameState/the reducer — this is bookkeeping
// about the *person*, not the farm, and shouldn't have to thread through
// every reducer action just to stay current. A gap of a few days shouldn't
// trigger anything (that's just normal life); a longer gap is the moment
// "returning after a while" copy should replace silence, framed as a
// welcome rather than a tally of how long it's been.
const LAST_SEEN_KEY = 'regrow.lastSeen.v1';
const GAP_THRESHOLD_MS = 4 * 24 * 60 * 60 * 1000; // 4 days

export function checkReturnAfterGap(): boolean {
  let prev: number | null = null;
  try {
    const raw = localStorage.getItem(LAST_SEEN_KEY);
    prev = raw ? Number(raw) : null;
  } catch {
    prev = null;
  }
  const now = Date.now();
  try {
    localStorage.setItem(LAST_SEEN_KEY, String(now));
  } catch {
    // No persistence, no big deal — just means this check won't fire on a
    // future visit either, which is a safe direction to fail in.
  }
  return typeof prev === 'number' && Number.isFinite(prev) && now - prev > GAP_THRESHOLD_MS;
}
