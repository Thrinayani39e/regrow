import type { Theme } from '../game/types';

export type Companion = 'cat' | 'chicken' | 'none';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  c: string;
}

// Mutable, per-canvas animation state that eases toward the "true" values
// (dusk/grow/walk) frame by frame — mirrors the instance fields the
// original DCLogic component mutated directly (this.duskF, this.growT,
// this.walk, this.fx, this.wetSet). Kept as one plain object so a single
// useRef can own it across the RAF loop's lifetime.
export interface SceneState {
  duskF: number;
  growT: number;
  walk: number;
  fx: Particle[];
  wetSet: Set<number>;
}

export function createSceneState(): SceneState {
  return { duskF: 0, growT: 0, walk: 0, fx: [], wetSet: new Set() };
}

// Ported from Component.splash (Regrow.dc.html line 455-457).
export function splash(scene: SceneState, x: number, y: number, col?: string): void {
  for (let i = 0; i < 14; i++) {
    scene.fx.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.6,
      vy: -Math.random() * 1.6,
      life: 30 + Math.random() * 20,
      c: col || 'rgba(150,200,235,.9)',
    });
  }
}

// Ported from Component.disc (line 307).
export function disc(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, col: string): void {
  g.fillStyle = col;
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)));
    g.fillRect(cx - w, cy + y, w * 2 + 1, 1);
  }
}

// Ported from Component.lerpC (lines 308-314).
export function lerpC(a: string, b: string, f: number): string {
  const p = (h: string): number[] =>
    h[0] === '#'
      ? [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
      : h.replace(/[^0-9,]/g, '').split(',').map(Number);
  const A = p(a);
  const B = p(b);
  return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(',') + ')';
}

// Ported from Component.plotStage (lines 315-318); span/offset are the two
// numbers that differ between the desktop (20, 0.85) and mobile (14, 0.9)
// versions.
export function plotStage(i: number, frac: number, span: number, offset: number): number {
  const v = frac * span - i * offset;
  return Math.max(0, Math.min(4, Math.floor(v)));
}

export function drawFx(g: CanvasRenderingContext2D, scene: SceneState): void {
  scene.fx = scene.fx.filter((p) => p.life > 0);
  scene.fx.forEach((p) => {
    p.life--;
    p.y += p.vy;
    p.vy += 0.08;
    p.x += p.vx;
    g.fillStyle = p.c;
    g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
  });
}

export interface DrawParams {
  canvas: HTMLCanvasElement;
  scene: SceneState;
  t: number;
  theme: Theme;
  dusk: boolean;
  growTarget: number; // pctFor(week)/100
  hardWeek: boolean;
  companion: Companion;
  ambient: boolean;
}

// Ported from Component.draw in Regrow.dc.html (lines 319-454) — 320x180
// logical canvas, 6x3 plot grid.
export function drawDesktop(p: DrawParams): void {
  const g = p.canvas.getContext('2d');
  if (!g) return;
  const W = 320;
  const H = 180;
  const t = p.t;
  g.imageSmoothingEnabled = false;
  const th = p.theme;
  const scene = p.scene;
  const hard = p.hardWeek;

  scene.duskF = scene.duskF + ((p.dusk ? 1 : 0) - scene.duskF) * 0.04;
  const d = scene.duskF;
  scene.growT += (p.growTarget - scene.growT) * 0.035;

  // sky
  const top = lerpC('#a8cbdf', '#3b3164', d);
  const mid = lerpC('#d8e3dd', '#a3567f', d);
  const low = lerpC('#f7e3bd', '#f0a06a', d);
  for (let y = 0; y < 96; y += 4) {
    const f = y / 96;
    g.fillStyle = f < 0.5 ? lerpC(top, mid, f * 2) : lerpC(mid, low, (f - 0.5) * 2);
    g.fillRect(0, y, W, 4);
  }
  // sun / moon
  const sunY = Math.round(26 + d * 54);
  const sunX = 252;
  disc(g, sunX, sunY, 9, lerpC('#ffe9a8', '#ffb46a', d));
  disc(g, sunX, sunY, 6, lerpC('#fff6d8', '#ffd79a', d));
  // stars
  if (d > 0.45) {
    g.fillStyle = 'rgba(255,246,214,' + (d - 0.45) * 1.4 + ')';
    for (let i = 0; i < 22; i++) {
      const x = (i * 47) % W;
      const y = (i * 29) % 54;
      if ((i + Math.floor(t / 700)) % 5 !== 0) g.fillRect(x, y, 1, 1);
    }
  }
  // hills
  for (let x = 0; x < W; x++) {
    const y = Math.round(88 - 7 * Math.sin(x / 46) - 4 * Math.sin(x / 13));
    g.fillStyle = lerpC(th.hill, '#4a4470', d * 0.7);
    g.fillRect(x, y, 1, H - y);
  }
  // grass
  g.fillStyle = lerpC(th.grass, '#3f5a52', d * 0.65);
  g.fillRect(0, 100, W, H - 100);
  g.fillStyle = lerpC(th.grass2, '#374f4a', d * 0.65);
  g.fillRect(0, 116, W, H - 116);
  for (let i = 0; i < 44; i++) {
    const x = (i * 61) % W;
    const y = 102 + ((i * 37) % 70);
    const sw = Math.round(Math.sin(t / 700 + i) * 1);
    g.fillStyle = lerpC('#95c96f', '#4b6a5c', d * 0.7);
    g.fillRect(x + sw, y, 1, 2);
    g.fillRect(x + 2, y + 1, 1, 1);
  }
  // path
  g.fillStyle = lerpC('#c0a074', '#584a5c', d * 0.6);
  for (let y = 104; y < H; y += 2) {
    g.fillRect(46 + Math.round(Math.sin(y / 16) * 3), y, 12, 2);
  }

  // farmhouse
  const hx = 24;
  const hy = 52;
  g.fillStyle = lerpC('#e3c69c', '#8b7f9a', d * 0.55);
  g.fillRect(hx, hy + 16, 44, 30);
  for (let r = 0; r < 16; r++) {
    const w = 6 + r * 2.9;
    g.fillStyle = r < 2 ? '#6e2f28' : lerpC('#b1543f', '#6d3a52', d * 0.5);
    g.fillRect(Math.round(hx + 22 - w / 2), hy + r, Math.round(w), 1);
  }
  g.fillStyle = '#7d4a2a';
  g.fillRect(hx + 18, hy + 32, 10, 14);
  g.fillStyle = lerpC('#9fcbdc', '#ffdf9a', d);
  g.fillRect(hx + 5, hy + 22, 9, 8);
  g.fillRect(hx + 31, hy + 22, 9, 8);
  g.fillStyle = '#5c3a22';
  g.fillRect(hx + 34, hy - 4, 6, 12);
  for (let i = 0; i < 3; i++) {
    const pr = ((t / 1400) + i * 0.33) % 1;
    g.fillStyle = 'rgba(226,216,226,' + (0.5 - pr * 0.45) + ')';
    disc(g, hx + 37 + Math.round(Math.sin(pr * 6) * 3), Math.round(hy - 6 - pr * 22), 2 + Math.round(pr * 2), 'rgba(226,216,226,' + (0.45 - pr * 0.4) + ')');
  }

  // fence
  g.fillStyle = lerpC('#a87b4e', '#5a4a5e', d * 0.55);
  for (let x = 0; x < W; x += 16) {
    g.fillRect(x, 104, 3, 12);
  }
  g.fillRect(0, 107, W, 2);
  g.fillRect(0, 112, W, 2);

  // plots — 6 cols x 3 rows
  const cols = 6;
  const rows = 3;
  const cw = 36;
  const chh = 18;
  const ox = 84;
  const oy = 118;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const i = r * cols + col;
      const x = ox + col * cw;
      const y = oy + r * chh;
      const wet = scene.wetSet.has(i);
      g.fillStyle = lerpC(wet ? '#4e3220' : th.soil2, '#3b2f42', d * 0.6);
      g.fillRect(x, y, 30, 14);
      g.fillStyle = lerpC(wet ? '#5f3c25' : th.soil, '#4a3c4e', d * 0.6);
      g.fillRect(x + 1, y + 1, 28, 12);
      const stage = plotStage(i, scene.growT, 20, 0.85);
      const wilt = hard && (i === 4 || i === 11);
      const sway = Math.round(Math.sin(t / 620 + i * 0.8) * 1);
      const cx = x + 15 + sway;
      const base = y + 12;
      const cropCol = wilt ? '#9a8a52' : lerpC(th.crop, '#3f6a58', d * 0.6);
      const leafCol = wilt ? '#b0a05e' : lerpC(th.leaf, '#4c7a64', d * 0.6);
      if (stage >= 1) {
        g.fillStyle = cropCol;
        g.fillRect(cx, base - 3, 1, 3);
      }
      if (stage >= 2) {
        g.fillStyle = cropCol;
        g.fillRect(cx, base - 6, 1, 6);
        g.fillStyle = leafCol;
        g.fillRect(cx - 2, base - 5, 2, 1);
        g.fillRect(cx + 1, base - 6, 2, 1);
      }
      if (stage >= 3) {
        g.fillStyle = cropCol;
        g.fillRect(cx, base - 9, 1, 9);
        g.fillStyle = leafCol;
        g.fillRect(cx - 3, base - 8, 3, 2);
        g.fillRect(cx + 1, base - 9, 3, 2);
      }
      if (stage >= 4) {
        g.fillStyle = lerpC(th.fruit, '#9a5a72', d * 0.5);
        g.fillRect(cx - 3, base - 11, 2, 2);
        g.fillRect(cx + 2, base - 8, 2, 2);
      }
      if (stage === 0) {
        g.fillStyle = '#3e2a1a';
        g.fillRect(cx, base - 1, 1, 1);
      }
    }
  }

  // companion
  if (p.companion !== 'none') {
    const bx = 74;
    const by = 128;
    const flick = Math.round(Math.sin(t / 500) * 2);
    if (p.companion === 'cat') {
      g.fillStyle = lerpC('#e08b4a', '#8a6a72', d * 0.5);
      g.fillRect(bx, by, 8, 6);
      g.fillRect(bx + 6, by - 4, 5, 5);
      g.fillRect(bx + 6, by - 6, 1, 2);
      g.fillRect(bx + 9, by - 6, 1, 2);
      g.fillRect(bx - 2, by - 2 + flick, 2, 1);
      g.fillStyle = '#3a2418';
      g.fillRect(bx + 7, by - 3, 1, 1);
      g.fillRect(bx + 10, by - 3, 1, 1);
    } else {
      g.fillStyle = lerpC('#f3ecdd', '#a89ab0', d * 0.5);
      g.fillRect(bx, by, 8, 7);
      g.fillRect(bx + 6, by - 4, 5, 5);
      g.fillStyle = '#d3543f';
      g.fillRect(bx + 8, by - 6, 3, 2);
      g.fillRect(bx + 11, by - 1, 2, 1);
      g.fillStyle = '#3a2418';
      g.fillRect(bx + 9, by - 2, 1, 1);
    }
  }

  // farmer
  scene.walk += ((p.dusk ? 1 : 0) - scene.walk) * 0.012;
  const fx = Math.round(58 - scene.walk * 18);
  const fy = 152 - Math.round(scene.walk * 18) + Math.round(Math.sin(t / 380) * 1);
  g.fillStyle = '#6a4a30';
  g.fillRect(fx, fy - 14, 8, 3);
  g.fillStyle = '#f0c8a0';
  g.fillRect(fx + 1, fy - 11, 6, 4);
  g.fillStyle = lerpC('#4f7fb0', '#3b4a72', d * 0.5);
  g.fillRect(fx + 1, fy - 7, 6, 6);
  g.fillStyle = '#3a3350';
  g.fillRect(fx + 1, fy - 1, 2, 3);
  g.fillRect(fx + 5, fy - 1, 2, 3);

  // weather
  if (hard) {
    const cxx = 214 + Math.round(Math.sin(t / 2600) * 6);
    disc(g, cxx, 32, 9, lerpC('#c4c8d6', '#6f6a86', d * 0.5));
    disc(g, cxx + 14, 34, 11, lerpC('#c4c8d6', '#6f6a86', d * 0.5));
    disc(g, cxx + 28, 32, 8, lerpC('#b3b7c6', '#645f7c', d * 0.5));
    g.fillStyle = 'rgba(150,180,205,.75)';
    for (let i = 0; i < 26; i++) {
      const rx = cxx - 4 + (i * 13) % 44;
      const ry = 44 + ((i * 23 + t / 9) % 84);
      g.fillRect(Math.round(rx), Math.round(ry), 1, 3);
    }
  }
  // fireflies
  if (d > 0.3 && p.ambient) {
    for (let i = 0; i < 10; i++) {
      const x = 30 + ((i * 71) % 260) + Math.sin(t / 900 + i) * 7;
      const y = 92 + ((i * 43) % 60) + Math.cos(t / 700 + i * 2) * 5;
      const a = (0.35 + 0.65 * Math.abs(Math.sin(t / 500 + i))) * (d - 0.3) * 1.4;
      g.fillStyle = 'rgba(255,232,140,' + a + ')';
      g.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }
  // droplets fx
  drawFx(g, scene);
  // dusk wash
  if (d > 0.02) {
    g.fillStyle = 'rgba(48,32,72,' + d * 0.22 + ')';
    g.fillRect(0, 0, W, H);
  }
}

export interface MobileDrawParams extends DrawParams {
  highlightBed: number; // -1 if none
}

// Ported from Regrow iOS.dc.html's Component.draw (lines 318-451) — 200x420
// logical canvas, 3x4 plot grid, plus the pulsing highlightBed() ring.
export function drawMobile(p: MobileDrawParams): void {
  const g = p.canvas.getContext('2d');
  if (!g) return;
  const W = 200;
  const H = 420;
  const t = p.t;
  g.imageSmoothingEnabled = false;
  const th = p.theme;
  const scene = p.scene;
  const hard = p.hardWeek;

  scene.duskF = scene.duskF + ((p.dusk ? 1 : 0) - scene.duskF) * 0.04;
  const d = scene.duskF;
  scene.growT += (p.growTarget - scene.growT) * 0.035;

  const top = lerpC('#a8cbdf', '#3b3164', d);
  const mid = lerpC('#d8e3dd', '#a3567f', d);
  const low = lerpC('#f7e3bd', '#f0a06a', d);
  for (let y = 0; y < 170; y += 4) {
    const f = y / 170;
    g.fillStyle = f < 0.5 ? lerpC(top, mid, f * 2) : lerpC(mid, low, (f - 0.5) * 2);
    g.fillRect(0, y, W, 4);
  }
  const sunY = Math.round(46 + d * 84);
  const sunX = 150;
  disc(g, sunX, sunY, 10, lerpC('#ffe9a8', '#ffb46a', d));
  disc(g, sunX, sunY, 7, lerpC('#fff6d8', '#ffd79a', d));
  if (d > 0.45) {
    g.fillStyle = 'rgba(255,246,214,' + (d - 0.45) * 1.4 + ')';
    for (let i = 0; i < 26; i++) {
      const x = (i * 47) % W;
      const y = (i * 31) % 92;
      if ((i + Math.floor(t / 700)) % 5 !== 0) g.fillRect(x, y, 1, 1);
    }
  }
  for (let x = 0; x < W; x++) {
    const y = Math.round(152 - 8 * Math.sin(x / 34) - 4 * Math.sin(x / 11));
    g.fillStyle = lerpC(th.hill, '#4a4470', d * 0.7);
    g.fillRect(x, y, 1, H - y);
  }
  g.fillStyle = lerpC(th.grass, '#3f5a52', d * 0.65);
  g.fillRect(0, 164, W, H - 164);
  g.fillStyle = lerpC(th.grass2, '#374f4a', d * 0.65);
  g.fillRect(0, 188, W, H - 188);
  for (let i = 0; i < 70; i++) {
    const x = (i * 53) % W;
    const y = 166 + ((i * 41) % 246);
    const sw = Math.round(Math.sin(t / 700 + i) * 1);
    g.fillStyle = lerpC('#95c96f', '#4b6a5c', d * 0.7);
    g.fillRect(x + sw, y, 1, 2);
    g.fillRect(x + 2, y + 1, 1, 1);
  }
  // path down the left
  g.fillStyle = lerpC('#c0a074', '#584a5c', d * 0.6);
  for (let y = 168; y < H; y += 2) {
    g.fillRect(8 + Math.round(Math.sin(y / 18) * 3), y, 13, 2);
  }

  // farmhouse
  const hx = 96;
  const hy = 96;
  g.fillStyle = lerpC('#e3c69c', '#8b7f9a', d * 0.55);
  g.fillRect(hx, hy + 16, 46, 32);
  for (let r = 0; r < 16; r++) {
    const w = 6 + r * 3.0;
    g.fillStyle = r < 2 ? '#6e2f28' : lerpC('#b1543f', '#6d3a52', d * 0.5);
    g.fillRect(Math.round(hx + 23 - w / 2), hy + r, Math.round(w), 1);
  }
  g.fillStyle = '#7d4a2a';
  g.fillRect(hx + 19, hy + 34, 10, 14);
  g.fillStyle = lerpC('#9fcbdc', '#ffdf9a', d);
  g.fillRect(hx + 5, hy + 22, 9, 8);
  g.fillRect(hx + 33, hy + 22, 9, 8);
  g.fillStyle = '#5c3a22';
  g.fillRect(hx + 36, hy - 4, 6, 12);
  for (let i = 0; i < 3; i++) {
    const pr = ((t / 1400) + i * 0.33) % 1;
    disc(g, hx + 39 + Math.round(Math.sin(pr * 6) * 3), Math.round(hy - 6 - pr * 24), 2 + Math.round(pr * 2), 'rgba(226,216,226,' + (0.45 - pr * 0.4) + ')');
  }

  // fence
  g.fillStyle = lerpC('#a87b4e', '#5a4a5e', d * 0.55);
  for (let x = 0; x < W; x += 16) {
    g.fillRect(x, 176, 3, 13);
  }
  g.fillRect(0, 179, W, 2);
  g.fillRect(0, 185, W, 2);

  // beds — 3 x 4
  const cols = 3;
  const rows = 4;
  const cw = 56;
  const chh = 26;
  const ox = 26;
  const oy = 200;
  const hi = p.highlightBed;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const i = r * cols + col;
      const x = ox + col * cw;
      const y = oy + r * chh;
      const wet = scene.wetSet.has(i);
      g.fillStyle = lerpC(wet ? '#4e3220' : th.soil2, '#3b2f42', d * 0.6);
      g.fillRect(x, y, 50, 22);
      g.fillStyle = lerpC(wet ? '#5f3c25' : th.soil, '#4a3c4e', d * 0.6);
      g.fillRect(x + 2, y + 2, 46, 18);
      if (i === hi) {
        const pulse = 0.45 + 0.45 * Math.abs(Math.sin(t / 380));
        g.fillStyle = 'rgba(255,232,150,' + pulse + ')';
        g.fillRect(x, y, 50, 2);
        g.fillRect(x, y + 20, 50, 2);
        g.fillRect(x, y, 2, 22);
        g.fillRect(x + 48, y, 2, 22);
      }
      const stage = plotStage(i, scene.growT, 14, 0.9);
      const wilt = hard && (i === 2 || i === 7);
      const sway = Math.round(Math.sin(t / 620 + i * 0.8) * 1);
      const cx = x + 25 + sway;
      const base = y + 19;
      const cropCol = wilt ? '#9a8a52' : lerpC(th.crop, '#3f6a58', d * 0.6);
      const leafCol = wilt ? '#b0a05e' : lerpC(th.leaf, '#4c7a64', d * 0.6);
      const stems = [-14, 0, 14];
      stems.forEach((off, si) => {
        const sx = cx + off + (si === 1 ? 0 : sway);
        if (stage >= 1) {
          g.fillStyle = cropCol;
          g.fillRect(sx, base - 4, 2, 4);
        }
        if (stage >= 2) {
          g.fillStyle = cropCol;
          g.fillRect(sx, base - 8, 2, 8);
          g.fillStyle = leafCol;
          g.fillRect(sx - 3, base - 7, 3, 2);
          g.fillRect(sx + 2, base - 8, 3, 2);
        }
        if (stage >= 3) {
          g.fillStyle = cropCol;
          g.fillRect(sx, base - 12, 2, 12);
          g.fillStyle = leafCol;
          g.fillRect(sx - 4, base - 11, 4, 2);
          g.fillRect(sx + 2, base - 12, 4, 2);
        }
        if (stage >= 4) {
          g.fillStyle = lerpC(th.fruit, '#9a5a72', d * 0.5);
          g.fillRect(sx - 4, base - 15, 3, 3);
          g.fillRect(sx + 3, base - 11, 3, 3);
        }
        if (stage === 0) {
          g.fillStyle = '#3e2a1a';
          g.fillRect(sx, base - 1, 2, 1);
        }
      });
    }
  }

  // companion
  if (p.companion !== 'none') {
    const bx = 6;
    const by = 264;
    const flick = Math.round(Math.sin(t / 500) * 2);
    if (p.companion === 'cat') {
      g.fillStyle = lerpC('#e08b4a', '#8a6a72', d * 0.5);
      g.fillRect(bx, by, 9, 7);
      g.fillRect(bx + 7, by - 5, 6, 6);
      g.fillRect(bx + 7, by - 7, 1, 2);
      g.fillRect(bx + 11, by - 7, 1, 2);
      g.fillRect(bx - 2, by - 2 + flick, 2, 1);
      g.fillStyle = '#3a2418';
      g.fillRect(bx + 8, by - 3, 1, 1);
      g.fillRect(bx + 11, by - 3, 1, 1);
    } else {
      g.fillStyle = lerpC('#f3ecdd', '#a89ab0', d * 0.5);
      g.fillRect(bx, by, 9, 8);
      g.fillRect(bx + 7, by - 5, 6, 6);
      g.fillStyle = '#d3543f';
      g.fillRect(bx + 9, by - 7, 3, 2);
      g.fillRect(bx + 12, by - 1, 2, 1);
      g.fillStyle = '#3a2418';
      g.fillRect(bx + 10, by - 2, 1, 1);
    }
  }

  // farmer on the path
  scene.walk += ((p.dusk ? 1 : 0) - scene.walk) * 0.012;
  const fx = 10;
  const fy = 232 - Math.round(scene.walk * 36) + Math.round(Math.sin(t / 380) * 1);
  g.fillStyle = '#6a4a30';
  g.fillRect(fx, fy - 16, 10, 3);
  g.fillStyle = '#f0c8a0';
  g.fillRect(fx + 1, fy - 13, 8, 5);
  g.fillStyle = lerpC('#4f7fb0', '#3b4a72', d * 0.5);
  g.fillRect(fx + 1, fy - 8, 8, 7);
  g.fillStyle = '#3a3350';
  g.fillRect(fx + 1, fy - 1, 3, 4);
  g.fillRect(fx + 6, fy - 1, 3, 4);

  if (hard) {
    const cxx = 40 + Math.round(Math.sin(t / 2600) * 6);
    disc(g, cxx, 44, 10, lerpC('#c4c8d6', '#6f6a86', d * 0.5));
    disc(g, cxx + 15, 46, 12, lerpC('#c4c8d6', '#6f6a86', d * 0.5));
    disc(g, cxx + 30, 44, 9, lerpC('#b3b7c6', '#645f7c', d * 0.5));
    g.fillStyle = 'rgba(150,180,205,.75)';
    for (let i = 0; i < 34; i++) {
      const rx = cxx - 4 + (i * 13) % 46;
      const ry = 58 + ((i * 29 + t / 9) % 150);
      g.fillRect(Math.round(rx), Math.round(ry), 1, 4);
    }
  }
  if (d > 0.3 && p.ambient) {
    for (let i = 0; i < 12; i++) {
      const x = 12 + ((i * 67) % 176) + Math.sin(t / 900 + i) * 7;
      const y = 168 + ((i * 53) % 210) + Math.cos(t / 700 + i * 2) * 5;
      const a2 = (0.35 + 0.65 * Math.abs(Math.sin(t / 500 + i))) * (d - 0.3) * 1.4;
      g.fillStyle = 'rgba(255,232,140,' + a2 + ')';
      g.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }
  drawFx(g, scene);
  if (d > 0.02) {
    g.fillStyle = 'rgba(48,32,72,' + d * 0.22 + ')';
    g.fillRect(0, 0, W, H);
  }
}

// Ported from the iOS prototype's Component.highlightBed (lines 453-457):
// while actively watering (screen === 'tend' && taps < 3), pick which bed
// glows based on the tended chore's position in the chore list.
export function highlightBed(choreIndex: number, screen: string, taps: number): number {
  if (screen !== 'tend' || taps >= 3) return -1;
  return choreIndex < 0 ? 4 : (choreIndex * 5 + 1) % 12;
}

export const DESKTOP_GRID = { cols: 6, rows: 3, cw: 36, chh: 18, ox: 84, oy: 118, w: 320, h: 180 };
export const MOBILE_GRID = { cols: 3, rows: 4, cw: 56, chh: 26, ox: 26, oy: 200, w: 200, h: 420 };
