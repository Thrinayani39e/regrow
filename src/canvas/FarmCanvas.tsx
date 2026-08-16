import { useEffect, useRef } from 'react';
import { hapticTap } from '../haptics';
import type { Theme } from '../game/types';
import {
  DESKTOP_GRID,
  MOBILE_GRID,
  createSceneState,
  drawDesktop,
  drawMobile,
  splash,
  type Companion,
} from './draw';

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
}: FarmCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef(createSceneState());
  const grid = isMobile ? MOBILE_GRID : DESKTOP_GRID;

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
    sceneRef.current.wetSet.add(index);
    hapticTap();
    onPlotActivate(index);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * grid.w;
    const y = ((e.clientY - r.top) / r.height) * grid.h;
    if (!reducedMotion) splash(sceneRef.current, x, y);
    const col = Math.floor((x - grid.ox) / grid.cw);
    const row = Math.floor((y - grid.oy) / grid.chh);
    if (col >= 0 && col < grid.cols && row >= 0 && row < grid.rows) {
      sceneRef.current.wetSet.add(row * grid.cols + col);
      hapticTap();
      onPlotActivate(row * grid.cols + col);
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
    </div>
  );
}
