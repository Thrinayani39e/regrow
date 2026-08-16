// Feature-detected and best-effort only — the Vibration API isn't
// supported on iOS Safari at all, and support elsewhere varies, so this
// is pure progressive enhancement. Kept to very short pulses; the goal is
// a bit of tactile confirmation, not a buzz someone notices as an
// interruption.
function vibrate(pattern: number | number[]): void {
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    // Some browsers throw if called outside a user gesture — safe to ignore.
  }
}

export function hapticTap(): void {
  vibrate(8);
}

export function hapticSettle(): void {
  vibrate([10, 30, 10]);
}
