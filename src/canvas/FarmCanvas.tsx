import { useEffect, useRef } from 'react';
import { hapticTap } from '../haptics';
import type { Theme } from '../game/types';
import {
  DESKTOP_GRID,
  DESKTOP_PET_HITBOX,
  MOBILE_GRID,
  MOBILE_PET_HITBOX,
  createSceneState,
  drawDesktop,
  drawMobile,
  growPop,
  heartPop,
  petThePet,
  splash,
  type Companion,
} from './draw';

const COMPANION_LABEL: Record<Companion, string> = { cat: 'cat', chicken: 'chicken', none: '' };

interface FarmCanvasProps {
  isMobile: boolean;
  theme: Theme;
  dusk: boolean;
  growTarget: number;
  hardWeek: boolean;
  highlightBedIndex: number;
  companion: Companion;
  reducedMotion: boolean;
  onPlotActivate: (index: number) => void;
  // Which plots have been watered resets when the week turns (same moment
  // `tended` resets in the reducer) — tending is a weekly rhythm, not a
  // one-time unlock.
  week: number;
}

// Ported from Component.setCanvas + draw() + onCanvasClick, re-hosted as a
// React component: a RAF loop drives the continuous version, a single draw
// call drives the prefers-reduced-motion fallback, and canvas clicks +
// a parallel keyboard-accessible plot list both funnel into the same
// activatePlot() so mouse, touch and keyboard all do the same thing.
export function FarmCanvas({
  isMobile,
  theme,
  dusk,
  growTarget,
  hardWeek,
  highlightBedIndex,
  companion,
  reducedMotion,
  onPlotActivate,
  week,
}: FarmCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef(createSceneState());
  const grid = isMobile ? MOBILE_GRID : DESKTOP_GRID;

  useEffect(() => {
    sceneRef.current.wetSet.clear();
  }, [week]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = isMobile ? MOBILE_GRID : DESKTOP_GRID;
    if (canvas.width !== g.w || canvas.height !== g.h) {
      canvas.width = g.w;
      canvas.height = g.h;
    }
  }, [isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = sceneRef.current;

    const drawOnce = (t: number) => {
      if (isMobile) {
        drawMobile({
          canvas, scene, t, theme, dusk, growTarget, hardWeek, companion,
          ambient: !reducedMotion, highlightBed: highlightBedIndex,
        });
      } else {
        drawDesktop({
          canvas, scene, t, theme, dusk, growTarget, hardWeek, companion,
          ambient: !reducedMotion,
        });
      }
    };

    if (reducedMotion) {
      // Skip the animation loop entirely: seed the eased fields at their
      // resting targets so a single draw renders the "settled" frame, no
      // sway/twinkle/dusk-fade motion.
      scene.duskF = dusk ? 1 : 0;
      scene.growT = growTarget;
      scene.walk = dusk ? 1 : 0;
      drawOnce(0);
      return;
    }

    let raf = 0;
    const loop = (ts: number) => {
      drawOnce(ts);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isMobile, reducedMotion, theme, dusk, growTarget, hardWeek, companion, highlightBedIndex]);

  const activatePlot = (index: number, x: number, y: number) => {
    if (!reducedMotion) splash(sceneRef.current, x, y);
    const wasDry = !sceneRef.current.wetSet.has(index);
    sceneRef.current.wetSet.add(index);
    if (wasDry && !reducedMotion) growPop(sceneRef.current, x, y);
    hapticTap();
    onPlotActivate(index);
  };

  const petHitbox = isMobile ? MOBILE_PET_HITBOX : DESKTOP_PET_HITBOX;

  const petCompanion = () => {
    petThePet(sceneRef.current, performance.now());
    if (!reducedMotion) {
      heartPop(sceneRef.current, petHitbox.x + petHitbox.w / 2, petHitbox.y + petHitbox.h / 3);
    }
    hapticTap();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * grid.w;
    const y = ((e.clientY - r.top) / r.height) * grid.h;

    if (
      companion !== 'none' &&
      x >= petHitbox.x && x <= petHitbox.x + petHitbox.w &&
      y >= petHitbox.y && y <= petHitbox.y + petHitbox.h
    ) {
      petCompanion();
      return;
    }

    if (!reducedMotion) splash(sceneRef.current, x, y);
    const col = Math.floor((x - grid.ox) / grid.cw);
    const row = Math.floor((y - grid.oy) / grid.chh);
    if (col >= 0 && col < grid.cols && row >= 0 && row < grid.rows) {
      const index = row * grid.cols + col;
      const wasDry = !sceneRef.current.wetSet.has(index);
      sceneRef.current.wetSet.add(index);
      if (wasDry && !reducedMotion) growPop(sceneRef.current, x, y);
      hapticTap();
      onPlotActivate(index);
    }
  };

  const totalPlots = grid.cols * grid.rows;

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: `${grid.w} / ${grid.h}` }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        aria-hidden="true"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          cursor: 'crosshair',
        }}
      />
      {/* Keyboard-accessible equivalent of tapping a plot on the canvas —
          real, focusable buttons, not a decorative aria-label on the
          canvas. Hidden until a button receives focus. */}
      <div role="group" aria-label="Farm plots" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: totalPlots }, (_, i) => {
          const col = i % grid.cols;
          const row = Math.floor(i / grid.cols);
          const cx = grid.ox + col * grid.cw + grid.cw / 2;
          const cy = grid.oy + row * grid.chh + grid.chh / 2;
          return (
            <button
              key={i}
              type="button"
              className="sr-only-focusable"
              style={{ pointerEvents: 'auto' }}
              onClick={() => activatePlot(i, cx, cy)}
            >
              {i === highlightBedIndex ? `Water the bed you're tending (plot ${i + 1})` : `Water plot ${i + 1}`}
            </button>
          );
        })}
      </div>
      {companion !== 'none' && (
        <div role="group" aria-label="Farm companion" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <button type="button" className="sr-only-focusable" style={{ pointerEvents: 'auto' }} onClick={petCompanion}>
            {`Pet the ${COMPANION_LABEL[companion]}`}
          </button>
        </div>
      )}
    </div>
  );
}
