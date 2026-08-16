import type { Feel, GameState } from './types';

export type Action =
  | { type: 'SET_TARGET'; index: number }
  | { type: 'SET_START_LEVEL'; value: number }
  | { type: 'SET_PLOT'; index: number }
  | { type: 'FEWER_WEEKS' }
  | { type: 'MORE_WEEKS' }
  | { type: 'BEGIN' }
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
    case 'FEWER_WEEKS':
      return { ...state, weeks: Math.max(4, state.weeks - 1) };
    case 'MORE_WEEKS':
      return { ...state, weeks: Math.min(16, state.weeks + 1) };
    case 'BEGIN':
      return { ...state, screen: 'farm' };
    case 'SET_DRAFT':
      return { ...state, draft: action.value };
    case 'ADD_OWN':
      return {
        ...state,
        custom: state.custom.concat([{ id: action.id, name: action.name }]),
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
      return { ...state, taps: state.taps + 1 };
    case 'PICK_FEEL': {
      const id = state.active;
      return {
        ...state,
        feel: action.feel,
        adjust: Math.max(-24, Math.min(16, state.adjust + action.delta)),
        tended: id && state.tended.indexOf(id) < 0 ? state.tended.concat([id]) : state.tended,
      };
    }
    case 'BACK_TO_FARM':
      return { ...state, screen: 'farm', active: null, picker: false };
    case 'END_DAY':
      return { ...state, screen: 'dayend', picker: false };
    case 'OPEN_PICKER':
      return { ...state, picker: true };
    case 'CLOSE_PICKER':
      return { ...state, picker: false };
    case 'START_TURN':
      return { ...state, turning: true };
    case 'ADVANCE_WEEK':
      return { ...state, week: Math.min(state.weeks, state.week + 1), tended: [], turning: true };
    case 'FINISH_TURN':
      return { ...state, screen: 'farm', turning: false, justGrew: true };
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}
