export type Screen = 'start' | 'farm' | 'tend' | 'dayend';
export type Feel = 'easy' | 'right' | 'much';
export type Companion = 'cat' | 'chicken' | 'none';

export interface CustomChore {
  id: string;
  name: string;
  sub?: string;
}

export type StampKey = 'heart' | 'star' | 'cloud' | 'moon' | 'paw' | 'mug';

export interface JournalEntry {
  week: number;
  stamp: StampKey | null;
  note: string;
}

export interface GameState {
  screen: Screen;
  target: number;
  weeks: number;
  startLevel: number;
  plot: number;
  week: number;
  tended: string[];
  active: string | null;
  taps: number;
  feel: Feel | null;
  adjust: number;
  turning: boolean;
  justGrew: boolean;
  custom: CustomChore[];
  draft: string;
  picker: boolean;
  journal: JournalEntry[];
  journalStamp: StampKey | null;
  journalNote: string;
  // True once BREAK GROUND has ever been pressed — distinguishes "first
  // time setup" from "revisiting setup to tweak something," which changes
  // the start screen's copy and button label but not its behavior.
  started: boolean;
  companion: Companion;
}

export const initialState: GameState = {
  screen: 'start',
  target: 0,
  weeks: 8,
  startLevel: 28,
  plot: 0,
  week: 1,
  tended: [],
  active: null,
  taps: 0,
  feel: null,
  adjust: 0,
  turning: false,
  justGrew: false,
  custom: [],
  draft: '',
  picker: false,
  journal: [],
  journalStamp: null,
  journalNote: '',
  started: false,
  companion: 'cat',
};

export interface Target {
  n: string;
  h: number;
  short: string;
}

export interface Level {
  n: string;
  v: number;
}

export interface Theme {
  n: string;
  grass: string;
  grass2: string;
  hill: string;
  soil: string;
  soil2: string;
  crop: string;
  leaf: string;
  fruit: string;
}

export type IconKey = 'can' | 'sprout' | 'sun';

export interface Chore {
  id: string;
  icon: IconKey;
  name: string;
  tag: string;
  sub: string;
  own?: boolean;
}
