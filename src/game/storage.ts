import { initialState, type GameState } from './types';

const STORAGE_KEY = 'regrow.save.v1';

const REQUIRED_KEYS: (keyof GameState)[] = [
  'screen', 'target', 'weeks', 'startLevel', 'plot', 'week', 'tended',
  'active', 'taps', 'feel', 'adjust', 'turning', 'justGrew', 'custom',
  'draft', 'picker',
];

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false;
  return REQUIRED_KEYS.every((key) => key in (value as object));
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    if (!isGameState(parsed)) return initialState;
    // A "turning" transition is mid-animation, transient UI state — never
    // resume directly into it, land back on the farm instead.
    if (parsed.turning) return { ...parsed, screen: 'farm', turning: false };
    return parsed;
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
