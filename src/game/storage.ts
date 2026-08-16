import { initialState, type GameState } from './types';

const STORAGE_KEY = 'regrow.save.v1';

function isPartialGameState(value: unknown): value is Partial<GameState> {
  return !!value && typeof value === 'object' && 'screen' in value;
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    if (!isPartialGameState(parsed)) return initialState;
    // Merge over initialState rather than trust the saved shape outright —
    // a save from before a field existed (e.g. the journal added later)
    // should fill in that field's default, not get discarded wholesale or
    // crash on the missing key.
    const merged: GameState = { ...initialState, ...parsed };
    // A "turning" transition is mid-animation, transient UI state — never
    // resume directly into it, land back on the farm instead.
    if (merged.turning) return { ...merged, screen: 'farm', turning: false };
    return merged;
  } catch {
    return initialState;
  }
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can fail (quota, private-browsing lockdown) — losing
    // persistence isn't fatal, the app still works for the session.
  }
}
