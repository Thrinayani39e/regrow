import { LEVELS, TARGETS, THEMES } from '../game/data';
import type { Action } from '../game/reducer';
import { palette } from '../game/palette';
import type { GameState } from '../game/types';
import { THUMBS } from '../canvas/sprites';
import { Card, PixelButton, pixelDisplayFont, pixelFont } from './ui';

interface StartScreenProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

// Ported from the "isStart" block in Regrow.dc.html (lines 34-95).
export function StartScreen({ state, dispatch }: StartScreenProps) {
  const weekDots = Array.from({ length: state.weeks }, (_, i) => ({
    h: 6 + Math.round((i / Math.max(1, state.weeks - 1)) * 18),
  }));

  return (
    <Card title="NEW FARM" subtitle="FILE 1 — EMPTY">
      <div style={{ padding: '22px 24px 26px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 21 }}>when you're all the way back, what does a full week look like?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
            {TARGETS.map((opt, i) => (
              <PixelButton
                key={opt.n}
                onClick={() => dispatch({ type: 'SET_TARGET', index: i })}
                bg={i === state.target ? palette.btnAmberBg : palette.btnTanBg}
                fontFamily={pixelFont}
                fontSize={17}
                padding="12px 14px"
                style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <span>{opt.n}</span>
                <span style={{ fontFamily: pixelDisplayFont, fontSize: 9, color: palette.tagText }}>
                  {opt.h} HRS / WEEK
                </span>
              </PixelButton>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22 }}>
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 21 }}>how long should the season be?</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <PixelButton
                onClick={() => dispatch({ type: 'FEWER_WEEKS' })}
                bg={palette.btnWaterBg}
                fontSize={14}
                padding="0"
                style={{ width: 38, height: 38, textAlign: 'center' }}
              >
                −
              </PixelButton>
              <div style={{ fontFamily: pixelDisplayFont, fontSize: 16, minWidth: 96, textAlign: 'center' }}>
                {state.weeks} WEEKS
              </div>
              <PixelButton
                onClick={() => dispatch({ type: 'MORE_WEEKS' })}
                bg={palette.btnWaterBg}
                fontSize={14}
                padding="0"
                style={{ width: 38, height: 38, textAlign: 'center' }}
              >
                +
              </PixelButton>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 26 }}>
                {weekDots.map((d, i) => (
                  <div key={i} style={{ width: 7, background: '#5f8f45', height: d.h }} />
                ))}
              </div>
            </div>
            <div style={{ fontSize: 15, color: palette.inkMuted }}>
              nothing bad happens if it takes longer. seasons stretch.
            </div>
          </div>

          <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 21 }}>and today, honestly?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LEVELS.map((lv) => (
                <PixelButton
                  key={lv.n}
                  onClick={() => dispatch({ type: 'SET_START_LEVEL', value: lv.v })}
                  bg={lv.v === state.startLevel ? palette.btnAmberBg : palette.btnTanBg}
                  fontFamily={pixelFont}
                  fontSize={17}
                  padding="9px 13px"
                >
                  {lv.n}
                </PixelButton>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 21 }}>pick your plot</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {THEMES.map((p, i) => (
              <button
                key={p.n}
                type="button"
                className="focus-ring"
                onClick={() => dispatch({ type: 'SET_PLOT', index: i })}
                style={{
                  cursor: 'pointer',
                  fontFamily: pixelFont,
                  fontSize: 16,
                  padding: 0,
                  border: `3px solid ${palette.cardBorder}`,
                  background: palette.cardBg,
                  color: palette.ink,
                  boxShadow: `0 4px 0 0 ${palette.cardBorder}`,
                  overflow: 'hidden',
                  width: 150,
                  textAlign: 'left',
                  outline: i === state.plot ? `3px solid ${palette.btnAmberBg}` : 'none',
                  outlineOffset: 2,
                }}
              >
                <img
                  src={THUMBS[i]}
                  alt=""
                  style={{ display: 'block', width: '100%', height: 64, objectFit: 'cover', imageRendering: 'pixelated' }}
                />
                <span style={{ display: 'block', padding: '6px 10px' }}>{p.n}</span>
              </button>
            ))}
          </div>
        </div>

        <PixelButton
          onClick={() => dispatch({ type: 'BEGIN' })}
          bg={palette.btnGreenBg}
          color={palette.btnGreenText}
          fontSize={15}
          padding="14px 26px"
          style={{ alignSelf: 'flex-start', boxShadow: `0 5px 0 0 ${palette.cardBorder}` }}
        >
          BREAK GROUND
        </PixelButton>
      </div>
    </Card>
  );
}
