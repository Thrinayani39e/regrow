import type { Feel, Level, Target, Theme } from './types';

// Ported verbatim from Regrow.dc.html — no changes needed.
export const TARGETS: Target[] = [
  { n: 'a full work week', h: 40, short: 'work' },
  { n: 'a full course load', h: 32, short: 'classes' },
  { n: 'the house + caregiving', h: 36, short: 'home stuff' },
  { n: 'work and school both', h: 46, short: 'work + school' },
];

export const LEVELS: Level[] = [
  { n: 'almost nothing yet', v: 12 },
  { n: 'a little, on good days', v: 28 },
  { n: 'maybe half of it', v: 48 },
];

export const THEMES: Theme[] = [
  { n: 'meadow', grass: '#7fb45c', grass2: '#69a04c', hill: '#9ac46b', soil: '#7b4f30', soil2: '#5c3a22', crop: '#4f9c46', leaf: '#67b356', fruit: '#e2596b' },
  { n: 'riverside', grass: '#72ae78', grass2: '#5d9a66', hill: '#8fc39a', soil: '#6f4d38', soil2: '#523827', crop: '#489580', leaf: '#5fb39a', fruit: '#7fc8e8' },
  { n: 'orchard', grass: '#98b358', grass2: '#82a049', hill: '#b2c46b', soil: '#83573a', soil2: '#63402a', crop: '#5f9c3e', leaf: '#7fb84c', fruit: '#f0a63f' },
];

export interface FeelOption {
  key: Feel;
  n: string;
  tag: string;
  delta: number;
}

export const FEEL_OPTIONS: FeelOption[] = [
  { key: 'easy', n: 'barely broke a sweat', tag: 'COULD TAKE MORE', delta: 8 },
  { key: 'right', n: 'about right', tag: 'HOLD THE PACE', delta: 0 },
  { key: 'much', n: 'that took a lot out of me', tag: 'EASE OFF', delta: -11 },
];
