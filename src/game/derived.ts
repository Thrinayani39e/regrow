import { TARGETS } from './data';
import type { Chore, Feel, GameState } from './types';

// Ported from Component.pctFor in Regrow.dc.html (lines 281-285) — pure
// function of state, unchanged logic.
export function pctFor(state: GameState, w: number): number {
  const f = (w - 1) / Math.max(1, state.weeks - 1);
  return Math.max(
    8,
    Math.min(100, Math.round(state.startLevel + (100 - state.startLevel) * f + (w > 1 ? state.adjust : 0)))
  );
}

export function hoursFor(state: GameState, w: number): number {
  return Math.max(1, Math.round((TARGETS[state.target].h * pctFor(state, w)) / 100));
}

export function hardWeek(state: GameState): boolean {
  return state.feel === 'much';
}

export function isDusk(state: GameState): boolean {
  return state.screen === 'dayend' || state.turning;
}

export function choreList(state: GameState): Chore[] {
  const pct = pctFor(state, state.week);
  const hrs = hoursFor(state, state.week);
  const tg = TARGETS[state.target];
  const base: Chore[] = [
    {
      id: 'water',
      icon: 'can',
      name: 'water the east beds',
      tag: 'THE LOAD',
      sub: `${hrs} hrs of ${tg.short} this week — spread thin, not stacked`,
    },
    {
      id: 'coop',
      icon: 'sprout',
      name: 'check on the coop',
      tag: 'PEOPLE',
      sub:
        pct < 45
          ? 'one meeting or one errand. that is the whole ceiling.'
          : 'two meetings — one of them can be a call you take walking',
    },
    {
      id: 'tree',
      icon: 'sun',
      name: 'sit under the tree',
      tag: 'REQUIRED',
      sub: 'a real break in the middle of the day. yes, this counts as a chore.',
    },
  ];
  const custom: Chore[] = (state.custom || []).map((c) => ({
    id: c.id,
    icon: 'sprout',
    name: c.name,
    tag: 'YOURS',
    own: true,
    sub: c.sub || 'yours — planted because you wanted it, not because it was owed.',
  }));
  return base.concat(custom);
}

export interface FeelReply {
  r: string;
  s: string;
}

// Ported verbatim from renderVals()'s feelCopy (Regrow.dc.html lines
// 474-479) — already well-written, encodes the adaptive-pacing logic.
export function feelCopy(state: GameState): Record<Feel, FeelReply> {
  const pct = pctFor(state, state.week);
  return {
    easy: {
      r: "good. we'll let a little more sun in next week.",
      s: `week ${Math.min(state.week + 1, state.weeks)} nudges up to about ${Math.min(100, pct + 9)}% — still under what you could do today. that gap is the point.`,
    },
    right: {
      r: "then we keep this pace. that's the whole trick.",
      s: `week ${Math.min(state.week + 1, state.weeks)} sits around ${Math.min(100, pct + Math.round((100 - state.startLevel) / Math.max(1, state.weeks - 1)))}%. steady beats fast — steady is what doesn't send you back.`,
    },
    much: {
      r: "okay. next week gets lighter, and that's allowed.",
      s: "we'll pull the load back a notch and hold there. a rainy week isn't a lost one — the plot is still yours, it just gets a slower season.",
    },
  };
}
