export type Screen = 'start' | 'farm' | 'tend' | 'dayend';
export type Feel = 'easy' | 'right' | 'much';

export interface CustomChore {
  id: string;
  name: string;
  sub?: string;
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
