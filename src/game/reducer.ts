import type { Companion, Feel, GameState, StampKey } from './types';

export const MAX_CUSTOM_CHORES = 12;
export const MAX_CHORE_NAME_LENGTH = 60;

export type Action =
  | { type: 'SET_TARGET'; index: number }
  | { type: 'SET_START_LEVEL'; value: number }
  | { type: 'SET_PLOT'; index: number }
  | { type: 'SET_COMPANION'; companion: Companion }
  | { type: 'FEWER_WEEKS' }
  | { type: 'MORE_WEEKS' }
  | { type: 'BEGIN' }
  | { type: 'EDIT_SETUP' }
  | { type: 'SET_DRAFT'; value: string }
  | { type: 'ADD_OWN'; id: string; name: string }
  | { type: 'REMOVE_CUSTOM'; id: string }
  | { type: 'GO_TEND'; id: string }
  | { type: 'POUR' }
  | { type: 'PICK_FEEL'; feel: Feel; delta: number }
  | { type: 'BACK_TO_FARM' }
  | { type: 'END_DAY' }
  | { type: 'OPEN_PICKER' }
  | { type: 'CLOSE_PICKER' }
  | { type: 'START_TURN' }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'FINISH_TURN' }
  | { type: 'SET_JOURNAL_STAMP'; stamp: StampKey | null }
  | { type: 'SET_JOURNAL_NOTE'; value: string }
  | { type: 'HYDRATE'; state: GameState };

// Every transition here mirrors a setState call from Component in
// Regrow.dc.html / Regrow iOS.dc.html — same shapes, same clamping, same
// order of operations (see turnWeek's two-phase dusk transition in
// particular).
export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_TARGET':
      return { ...state, target: action.index };
    case 'SET_START_LEVEL':
      return { ...state, startLevel: action.value };
    case 'SET_PLOT':
      return { ...state, plot: action.index };
    case 'SET_COMPANION':
      return { ...state, companion: action.companion };
    case 'FEWER_WEEKS':
      return { ...state, weeks: Math.max(4, state.weeks - 1) };
    case 'MORE_WEEKS':
      return { ...state, weeks: Math.min(16, state.weeks + 1) };
    case 'BEGIN':
      return { ...state, screen: 'farm', started: true };
    // Revisit the setup screen without resetting anything else — target,
    // weeks, level and plot are all still just fields on this same state,
    // so navigating back to 'start' and back to 'farm' again is enough.
    case 'EDIT_SETUP':
      return { ...state, screen: 'start' };
    case 'SET_DRAFT':
      return { ...state, draft: action.value };
    case 'ADD_OWN':
      // Cap enforced here too, not just via the disabled button — this is
      // the actual boundary a spammed dispatch has to cross.
      if (state.custom.length >= MAX_CUSTOM_CHORES) return { ...state, draft: '' };
      return {
        ...state,
        custom: state.custom.concat([{ id: action.id, name: action.name.slice(0, MAX_CHORE_NAME_LENGTH) }]),
        draft: '',
      };
    case 'REMOVE_CUSTOM':
      return {
        ...state,
        custom: state.custom.filter((x) => x.id !== action.id),
        tended: state.tended.filter((x) => x !== action.id),
      };
    case 'GO_TEND':
      return { ...state, screen: 'tend', active: action.id, taps: 0, feel: null, picker: false };
    case 'POUR':
      // Clamped rather than left to grow unbounded — watering is a
      // 3-step animation, not a counter, so a 4th+ tap (spam-click, or a
      // dispatch racing a re-render) shouldn't push it past "full."
      return { ...state, taps: Math.min(3, state.taps + 1) };
    case 'PICK_FEEL': {
      // Idempotent: once a feel-check is answered, answering again
      // (e.g. two click events landing before the "asking" buttons
      // unmount) must not double-apply the pacing adjustment.
      if (state.feel) return state;
      const id = state.active;
      return {
        ...state,
        feel: action.feel,
        adjust: Math.max(-24, Math.min(16, state.adjust + action.delta)),
        tended: id && state.tended.indexOf(id) < 0 ? state.tended.concat([id]) : state.tended,
      };
    }
    case 'BACK_TO_FARM':
      // Always clears turning, even if this fires mid-transition (e.g.
      // "STAY OUT A BIT" clicked before the week-turn animation settles) —
      // being on the farm screen while turning stays true would leave the
      // canvas stuck rendering dusk.
      return { ...state, screen: 'farm', active: null, picker: false, turning: false };
    case 'END_DAY':
      return { ...state, screen: 'dayend', picker: false };
    case 'OPEN_PICKER':
      return { ...state, picker: true };
    case 'CLOSE_PICKER':
      return { ...state, picker: false };
    case 'START_TURN':
      if (state.turning) return state;
      return { ...state, turning: true };
    case 'ADVANCE_WEEK': {
      // Only meaningful mid-transition. Without this guard, a stale
      // setTimeout dispatch (see DayEndScreen's handleTurnWeek — the
      // 900ms delay is cancelable, but defense in depth here costs
      // nothing) could silently advance the week and wipe today's tended
      // chores after the user has already navigated away.
      if (!state.turning) return state;
      // The journal entry (if any) belongs to the week that's ending, not
      // the one about to start — and it's optional, so an empty draft just
      // doesn't create an entry rather than saving a blank one.
      const hasEntry = state.journalStamp !== null || state.journalNote.trim().length > 0;
      const journal = hasEntry
        ? state.journal.concat([{ week: state.week, stamp: state.journalStamp, note: state.journalNote.trim() }])
        : state.journal;
      return {
        ...state,
        week: Math.min(state.weeks, state.week + 1),
        tended: [],
        turning: true,
        journal,
        journalStamp: null,
        journalNote: '',
      };
    }
    case 'FINISH_TURN':
      if (!state.turning) return state;
      return { ...state, screen: 'farm', turning: false, justGrew: true };
    case 'SET_JOURNAL_STAMP':
      return { ...state, journalStamp: action.stamp };
    case 'SET_JOURNAL_NOTE':
      return { ...state, journalNote: action.value.slice(0, 140) };
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}
