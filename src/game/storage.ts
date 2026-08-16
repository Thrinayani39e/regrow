import { TARGETS, THEMES } from './data';
import { MAX_CHORE_NAME_LENGTH, MAX_CUSTOM_CHORES } from './reducer';
import { initialState, type Companion, type CustomChore, type Feel, type GameState, type JournalEntry, type Screen, type StampKey } from './types';

const STORAGE_KEY = 'regrow.save.v1';

const SCREENS: Screen[] = ['start', 'farm', 'tend', 'dayend'];
const FEELS: Feel[] = ['easy', 'right', 'much'];
const STAMPS: StampKey[] = ['heart', 'star', 'cloud', 'moon', 'paw', 'mug'];
const COMPANIONS: Companion[] = ['cat', 'chicken', 'none'];

function isPartialGameState(value: unknown): value is Partial<GameState> {
  return !!value && typeof value === 'object' && 'screen' in value;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

// For the nullable enum fields (feel, journalStamp): null is a legitimate
// value distinct from "invalid," and an invalid value should fall back to
// null, never to some arbitrary member of the enum.
function asNullableEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

function sanitizeCustom(value: unknown): CustomChore[] {
  if (!Array.isArray(value)) return [];
  const out: CustomChore[] = [];
  for (const item of value) {
    if (out.length >= MAX_CUSTOM_CHORES) break;
    if (!item || typeof item !== 'object') continue;
    const id = (item as Record<string, unknown>).id;
    const name = (item as Record<string, unknown>).name;
    if (typeof id !== 'string' || !id) continue;
    if (typeof name !== 'string' || !name.trim()) continue;
    out.push({ id, name: name.slice(0, MAX_CHORE_NAME_LENGTH) });
  }
  return out;
}

function sanitizeJournal(value: unknown): JournalEntry[] {
  if (!Array.isArray(value)) return [];
  const out: JournalEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const week = typeof rec.week === 'number' && Number.isFinite(rec.week) ? Math.round(rec.week) : null;
    if (week === null) continue;
    const stamp = rec.stamp === null ? null : typeof rec.stamp === 'string' && (STAMPS as string[]).includes(rec.stamp) ? (rec.stamp as StampKey) : null;
    const note = typeof rec.note === 'string' ? rec.note.slice(0, 140) : '';
    out.push({ week, stamp, note });
  }
  return out;
}

function sanitizeTended(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

// A save can be corrupted (hand-edited, truncated write, quota partial
// write), or simply older/newer than the shape this build expects. Rather
// than trust it — or wholesale discard it and lose someone's progress over
// one bad field — every field is individually validated and clamped back
// into range, with initialState's value as the fallback. In particular,
// `target`/`plot` are indexes into TARGETS/THEMES: left unclamped, an
// out-of-range value doesn't just look wrong, it crashes the app the
// moment anything does TARGETS[state.target].h (white screen, unrecoverable
// without clearing storage by hand).
function sanitizeState(parsed: Partial<GameState>): GameState {
  const weeks = clampInt(parsed.weeks, 4, 16, initialState.weeks);
  const custom = sanitizeCustom(parsed.custom);
  const tended = sanitizeTended(parsed.tended);
  const validChoreIds = new Set(['water', 'coop', 'tree', ...custom.map((c) => c.id)]);

  const screen = asEnum(parsed.screen, SCREENS, initialState.screen);
  const active = typeof parsed.active === 'string' && validChoreIds.has(parsed.active) ? parsed.active : null;

  return {
    screen,
    target: clampInt(parsed.target, 0, TARGETS.length - 1, initialState.target),
    weeks,
    startLevel: clampInt(parsed.startLevel, 0, 100, initialState.startLevel),
    plot: clampInt(parsed.plot, 0, THEMES.length - 1, initialState.plot),
    week: clampInt(parsed.week, 1, weeks, initialState.week),
    tended: tended.filter((id) => validChoreIds.has(id)),
    active,
    taps: clampInt(parsed.taps, 0, 3, initialState.taps),
    feel: asNullableEnum(parsed.feel, FEELS),
    adjust: clampInt(parsed.adjust, -24, 16, initialState.adjust),
    // A "turning" transition is mid-animation, transient UI state — never
    // resume directly into it, land back on the farm instead.
    turning: false,
    justGrew: asBool(parsed.justGrew, initialState.justGrew),
    custom,
    draft: asString(parsed.draft, initialState.draft).slice(0, MAX_CHORE_NAME_LENGTH),
    picker: asBool(parsed.picker, initialState.picker),
    journal: sanitizeJournal(parsed.journal),
    journalStamp: asNullableEnum(parsed.journalStamp, STAMPS),
    journalNote: asString(parsed.journalNote, initialState.journalNote).slice(0, 140),
    started: asBool(parsed.started, false) || screen !== 'start',
    companion: asEnum(parsed.companion, COMPANIONS, initialState.companion),
  };
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    if (!isPartialGameState(parsed)) return initialState;
    return sanitizeState(parsed);
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
