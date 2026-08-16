import { FEEL_OPTIONS } from '../game/data';
import { feelCopy } from '../game/derived';
import { palette } from '../game/palette';
import type { Action } from '../game/reducer';
import type { Chore, GameState } from '../game/types';
import { ICONS } from '../canvas/sprites';
import { Card, GhostButton, PixelButton, pixelFont, pixelDisplayFont } from './ui';

interface TendScreenProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  chores: Chore[];
  isMobile: boolean;
}

const sheetWrap = {
  padding: '14px 12px 30px',
  background: 'linear-gradient(180deg, rgba(24,16,30,0) 0%, rgba(24,16,30,.9) 24%, rgba(24,16,30,.97) 100%)',
  animation: 'rgUp .3s ease',
} as const;

const sheetCard = {
  background: palette.cardBg,
  border: `4px solid ${palette.cardBorder}`,
  boxShadow: `0 0 0 3px ${palette.cardRing}`,
  color: palette.inkDark,
} as const;

// Ported from the "isTend" block's three sub-states (watering / asking /
// answered) — desktop card in Regrow.dc.html 141-187, mobile bottom sheets
// in Regrow iOS.dc.html 152-188. The mobile watering panel additionally
// keeps a real, always-visible pour button (the iOS design relies solely on
// tapping the highlighted canvas bed) so watering has a genuine keyboard
// path, not just the hidden plot-button list.
export function TendScreen({ state, dispatch, chores, isMobile }: TendScreenProps) {
  const active = state.active ? chores.find((c) => c.id === state.active) : null;
  const tendTitle = active ? active.name.toUpperCase() : 'TENDING';
  const watering = state.taps < 3;
  const asking = state.taps >= 3 && !state.feel;
  const reply = state.feel ? feelCopy(state)[state.feel] : { r: '', s: '' };

  if (watering) {
    const pourLine = isMobile
      ? ['tap the glowing bed to give it a pour.', 'coming up — once more.', "one more and it's soaked through."][Math.min(2, state.taps)]
      : ["the soil's dry. give it a pour.", 'coming up.', "one more and it's soaked through."][Math.min(2, state.taps)];
    const drops = [0, 1, 2].map((i) => i < state.taps);

    if (isMobile) {
      return (
        <div style={{ ...sheetWrap, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <div style={{ fontFamily: pixelDisplayFont, fontSize: 10, color: '#f0be7c' }}>{tendTitle}</div>
          <div style={{ fontSize: 20, lineHeight: 1.4, textAlign: 'center', color: '#f6e6c8' }}>{pourLine}</div>
          <PixelButton
            onClick={() => dispatch({ type: 'POUR' })}
            bg={palette.btnWaterBg}
            fontSize={12}
            padding="12px 16px"
            style={{ display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 5px 0 0 ${palette.cardBorder}` }}
          >
            <img src={ICONS.can} alt="" style={{ width: 32, height: 32, imageRendering: 'pixelated' }} />
            <span>{state.taps === 0 ? 'TIP THE CAN' : 'AGAIN'}</span>
          </PixelButton>
          <div style={{ display: 'flex', gap: 7, paddingTop: 2 }}>
            {drops.map((full, i) => (
              <div key={i} style={{ width: 38, height: 14, border: `2px solid ${palette.cardBorder}`, background: full ? palette.dropFull : palette.dropEmpty }} />
            ))}
          </div>
          <GhostButton onClick={() => dispatch({ type: 'BACK_TO_FARM' })}>PUT THE CAN DOWN</GhostButton>
        </div>
      );
    }

    return (
      <Card title={tendTitle}>
        <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
            <PixelButton
              onClick={() => dispatch({ type: 'POUR' })}
              bg={palette.btnWaterBg}
              fontSize={12}
              padding="12px 16px"
              style={{ display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 5px 0 0 ${palette.cardBorder}` }}
            >
              <img src={ICONS.can} alt="" style={{ width: 40, height: 40, imageRendering: 'pixelated', animation: 'rgFloat 2.4s ease-in-out infinite' }} />
              <span>{state.taps === 0 ? 'TIP THE CAN' : 'AGAIN'}</span>
            </PixelButton>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 20 }}>{pourLine}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {drops.map((full, i) => (
                  <div key={i} style={{ width: 26, height: 12, border: `2px solid ${palette.cardBorder}`, background: full ? palette.dropFull : palette.dropEmpty }} />
                ))}
              </div>
            </div>
          </div>
          <GhostButton onClick={() => dispatch({ type: 'BACK_TO_FARM' })} style={{ alignSelf: 'flex-start' }}>
            PUT THE CAN DOWN
          </GhostButton>
        </div>
      </Card>
    );
  }

  if (asking) {
    const body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: isMobile ? 21 : 22, lineHeight: 1.4 }}>so — how did that stretch actually go?</div>
        <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
          {FEEL_OPTIONS.map((f) => (
            <PixelButton
              key={f.key}
              onClick={() => dispatch({ type: 'PICK_FEEL', feel: f.key, delta: f.delta })}
              bg={palette.btnTanBg}
              fontFamily={pixelFont}
              fontSize={18}
              padding={isMobile ? '13px 12px' : '14px'}
              style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 4 : 6, lineHeight: 1.5 }}
            >
              <span>{f.n}</span>
              <span style={{ fontFamily: pixelDisplayFont, fontSize: isMobile ? 8 : 9, color: palette.tagText }}>{f.tag}</span>
            </PixelButton>
          ))}
        </div>
        <div style={{ fontSize: isMobile ? 14 : 15, color: palette.inkMuted }}>
          {isMobile ? 'no wrong answer here. the plan bends to you.' : 'no wrong answer here. the plan bends to you, not the other way.'}
        </div>
        <GhostButton onClick={() => dispatch({ type: 'BACK_TO_FARM' })} style={{ alignSelf: 'flex-start' }}>
          ANSWER THIS LATER
        </GhostButton>
      </div>
    );

    if (isMobile) {
      return (
        <div style={sheetWrap}>
          <div style={{ ...sheetCard, padding: '14px 12px 16px' }}>{body}</div>
        </div>
      );
    }
    return (
      <Card title={tendTitle}>
        <div style={{ padding: '20px 22px 24px' }}>{body}</div>
      </Card>
    );
  }

  // answered
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 14, animation: 'rgFade .4s ease' }}>
      <div style={{ fontSize: isMobile ? 22 : 24, lineHeight: 1.35 }}>{reply.r}</div>
      <div style={{ fontSize: isMobile ? 15 : 16, lineHeight: isMobile ? 1.45 : undefined, color: palette.inkMuted }}>{reply.s}</div>
      <PixelButton
        onClick={() => dispatch({ type: 'BACK_TO_FARM' })}
        bg={palette.btnGreenBg}
        color={palette.btnGreenText}
        fontSize={isMobile ? 11 : 12}
        padding="13px 20px"
        minHeight={isMobile ? 48 : undefined}
        style={{ alignSelf: isMobile ? undefined : 'flex-start', boxShadow: `0 5px 0 0 ${palette.cardBorder}` }}
      >
        BACK TO THE FARM
      </PixelButton>
    </div>
  );

  if (isMobile) {
    return (
      <div style={sheetWrap}>
        <div style={{ ...sheetCard, padding: '16px 14px' }}>{content}</div>
      </div>
    );
  }
  return (
    <Card title={tendTitle}>
      <div style={{ padding: '20px 22px 24px' }}>{content}</div>
    </Card>
  );
}
