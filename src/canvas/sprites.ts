import { THEMES } from '../game/data';
import type { Theme } from '../game/types';

// Ported from Component.px in Regrow.dc.html (lines 239-246) — pure
// function, no changes needed.
export function px(map: string[], pal: Record<string, string>, s = 4): string {
  const w = map[0].length;
  const h = map.length;
  const c = document.createElement('canvas');
  c.width = w * s;
  c.height = h * s;
  const g = c.getContext('2d')!;
  map.forEach((row, y) =>
    row.split('').forEach((ch, x) => {
      const col = pal[ch];
      if (col) {
        g.fillStyle = col;
        g.fillRect(x * s, y * s, s, s);
      }
    })
  );
  return c.toDataURL();
}

export interface Icons {
  can: string;
  sprout: string;
  sun: string;
}

// Ported from Component.makeIcons (lines 247-258).
export function makeIcons(): Icons {
  const can = px(
    ['........', '..#####.', '.#ooooo#', '##ooooo#', '#oooooo#', '#oooooo#', '.#####..', '........'],
    { '#': '#3c5c72', o: '#7fa8c4' }
  );
  const sprout = px(
    ['...g....', '.g.g.g..', '.gg#gg..', '...#....', '..###...', '.bbbbbb.', '.bbbbbb.', '..bbbb..'],
    { g: '#67b356', '#': '#3f7a35', b: '#7b4f30' }
  );
  const sun = px(
    ['...y....', '.y.y.y..', '..yyy...', '.yyyyy..', 'yyyyyyy.', '.yyyyy..', '.y.y.y..', '...y....'],
    { y: '#f2c05a' }
  );
  return { can, sprout, sun };
}

export interface Stamps {
  heart: string;
  star: string;
  cloud: string;
  moon: string;
  paw: string;
  mug: string;
}

// Journal stamps — same px() sprite technique as the rest of the farm's
// icons. Colors are deliberately darkened/desaturated versions of the
// scene's fruit-red, sun-yellow, weather-blue, night-purple, cat-orange and
// water-can-brown hues: the lighter originals measured under 2:1 contrast
// against the tan card and amber-selected button (checked via the same
// contrast formula used for the text palette) and all but disappeared at
// icon size — these clear 3:1+ against both.
export function makeStamps(): Stamps {
  const heart = px(
    ['........', '.##..##.', '########', '########', '.######.', '..####..', '...##...', '........'],
    { '#': '#a83f2e' }
  );
  const star = px(
    ['........', '...##...', '...##...', '.#.##.#.', '########', '.#.##.#.', '...##...', '........'],
    { '#': '#8a5a1f' }
  );
  const cloud = px(
    ['........', '..cccc..', '.cccccc.', 'cccccccc', 'cccccccc', '.r.r.r..', 'r.r.r.r.', '........'],
    { c: '#5c6270', r: '#2f5e82' }
  );
  const moon = px(
    ['........', '..####..', '.######.', '.##m###.', '########', '.######.', '..####..', '........'],
    { '#': '#6b5a7a', m: '#4f4260' }
  );
  const paw = px(
    ['........', '.#.#.#..', '.#.#.#..', '..###...', '.#####..', '.#####..', '..###...', '........'],
    { '#': '#8a4318' }
  );
  const mug = px(
    ['........', '.####...', '.#..##..', '.#...#..', '.#..##..', '.####...', '........', '........'],
    { '#': '#7a4a1a' }
  );
  return { heart, star, cloud, moon, paw, mug };
}

// Ported from Component.makeThumbs (lines 259-270).
export function makeThumbs(themes: Theme[]): string[] {
  return themes.map((th) => {
    const c = document.createElement('canvas');
    c.width = 60;
    c.height = 26;
    const g = c.getContext('2d')!;
    g.fillStyle = '#f3d3a4';
    g.fillRect(0, 0, 60, 10);
    g.fillStyle = th.hill;
    g.fillRect(0, 8, 60, 6);
    g.fillStyle = th.grass;
    g.fillRect(0, 12, 60, 14);
    for (let i = 0; i < 3; i++) {
      g.fillStyle = th.soil2;
      g.fillRect(6 + i * 18, 16, 14, 7);
      g.fillStyle = th.soil;
      g.fillRect(7 + i * 18, 17, 12, 5);
      g.fillStyle = th.crop;
      g.fillRect(12 + i * 18, 13, 2, 4);
      g.fillStyle = th.leaf;
      g.fillRect(10 + i * 18, 13, 2, 1);
      g.fillRect(14 + i * 18, 13, 2, 1);
    }
    return c.toDataURL();
  });
}

// Generated once at module load (matches the plan's "call once and
// memoize" guidance) — these are pure functions of constant data.
export const ICONS: Icons = makeIcons();
export const THUMBS: string[] = makeThumbs(THEMES);
export const STAMPS: Stamps = makeStamps();
