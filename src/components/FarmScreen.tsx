import { useState } from 'react';
import { hardWeek } from '../game/derived';
import { palette } from '../game/palette';
import { MAX_CHORE_NAME_LENGTH, MAX_CUSTOM_CHORES, type Action } from '../game/reducer';
import type { Chore, GameState } from '../game/types';
import { CRISIS_MESSAGE, detectsCrisisLanguage } from '../game/safety';
import { ICONS } from '../canvas/sprites';
import { ChoreRow } from './ChoreRow';
import { Card, PixelButton, pixelFont, pixelDisplayFont } from './ui';

interface FarmScreenProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  chores: Chore[];
  isMobile: boolean;
}

function DraftField({ state, dispatch, dense }: { state: GameState; dispatch: React.Dispatch<Action>; dense?: boolean }) {
  const [crisis, setCrisis] = useState(false);
  const atCap = state.custom.length >= MAX_CUSTOM_CHORES;

  const addOwn = () => {
    const name = state.draft.trim();
    if (!name || atCap) return;
    // Not blocking the entry — this field is theirs, not moderated — but
    // the app's own reply shouldn't be a cheerful "added to your chores!"
    // in the face of language like this, so that reply is swapped out for
    // a resource note instead of (silently) staying quiet about it.
    if (detectsCrisisLanguage(name)) {
      setCrisis(true);
    }
    dispatch({ type: 'ADD_OWN', id: `own${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: dense ? '0' : '16px 0 4px' }}>
      <div style={{ fontFamily: pixelDisplayFont, fontSize: dense ? 9 : 10, color: palette.tagText }}>
        PLANT SOMETHING OF YOUR OWN
      </div>
      <div style={{ display: 'flex', gap: dense ? 8 : 10, flexWrap: 'wrap' }}>
        <input
          value={state.draft}
          onChange={(e) => {
            setCrisis(false);
            dispatch({ type: 'SET_DRAFT', value: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addOwn();
          }}
          maxLength={MAX_CHORE_NAME_LENGTH}
          disabled={atCap}
          placeholder={
            atCap
              ? 'that’s a full plot for now — pull one up to plant another'
              : dense
                ? 'a walk, guitar, sunday cooking'
                : 'something you actually want back — a walk, guitar, sunday cooking'
          }
          aria-label="Plant something of your own"
          style={{
            flex: '1 1 320px',
            minWidth: 0,
            fontFamily: pixelFont,
            fontSize: dense ? 16 : 17,
            padding: dense ? '12px 10px' : '11px 12px',
            border: `3px solid ${palette.cardBorder}`,
            background: atCap ? palette.btnTendedBg : palette.inputBg,
            color: palette.inkDark,
            outline: 'none',
          }}
        />
        <PixelButton
          onClick={addOwn}
          disabled={!state.draft.trim() || atCap}
          bg={state.draft.trim() && !atCap ? palette.btnGreenBg : palette.btnTendedBg}
          fontSize={dense ? 10 : 11}
          padding={dense ? '0 14px' : '12px 18px'}
          minHeight={dense ? 44 : undefined}
        >
          {dense ? 'SOW' : 'SOW IT'}
        </PixelButton>
      </div>
      {crisis ? (
        <div
          role="status"
          style={{
            fontSize: dense ? 13 : 15,
            lineHeight: 1.5,
            color: palette.inkDark,
            background: palette.inputBg,
            border: `2px solid ${palette.cardBorder}`,
            padding: 10,
          }}
        >
          {CRISIS_MESSAGE}
        </div>
      ) : (
        <div style={{ fontSize: dense ? 14 : 15, lineHeight: 1.4, color: palette.inkMuted }}>
          {state.custom.length
            ? 'these get tended the same as the rest — and they count.'
            : "a walk, sketching, calling someone back. recovery isn't only the load you owe."}
        </div>
      )}
    </div>
  );
}

// Ported from the "isFarm" block: desktop inline chore card
// (Regrow.dc.html 106-139) vs mobile bottom-sheet picker
// (Regrow iOS.dc.html 104-150), switching on isMobile.
export function FarmScreen({ state, dispatch, chores, isMobile }: FarmScreenProps) {
  const allDone = chores.every((c) => state.tended.indexOf(c.id) >= 0);
  const doneCount = `${state.tended.length}/${chores.length} TENDED`;
  const farmNote = hardWeek(state)
    ? 'rain over the east beds this week. nothing to fix — the plants know what to do with a slow week.'
    : allDone
      ? "that's everything the plot needed. the rest of the day is just yours."
      : state.tended.length === 0
        ? 'nothing tended yet today, and that can just be true — even checking in on the plot counts.'
        : "you don't have to do these in order. or all at once.";

  if (isMobile) {
    if (!state.picker) {
      return (
        <div
          style={{
            padding: '14px 12px 30px',
            background: 'linear-gradient(180deg, rgba(24,16,30,0) 0%, rgba(24,16,30,.86) 26%, rgba(24,16,30,.95) 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: pixelDisplayFont, fontSize: 9, color: '#e0c9a4' }}>
            <span>{doneCount}</span>
            <span>{allDone ? 'ALL TENDED' : 'TAP TO CHOOSE'}</span>
          </div>
          <PixelButton
            onClick={() => dispatch({ type: 'OPEN_PICKER' })}
            bg={palette.btnGreenBg}
            color={palette.btnGreenText}
            fontSize={12}
            minHeight={56}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <img src={ICONS.can} alt="" style={{ width: 26, height: 26, imageRendering: 'pixelated' }} />
            <span>PICK SOMETHING TO TEND</span>
          </PixelButton>
          <PixelButton
            onClick={() => dispatch({ type: 'END_DAY' })}
            bg={allDone ? palette.btnAmberBg : palette.btnTanBg}
            fontSize={10}
            minHeight={44}
          >
            END THE DAY
          </PixelButton>
        </div>
      );
    }
    return (
      <div style={{ padding: '14px 12px 30px', background: 'linear-gradient(180deg, rgba(24,16,30,0) 0%, rgba(24,16,30,.86) 26%, rgba(24,16,30,.95) 100%)' }}>
        <div style={{ background: palette.cardBg, border: `4px solid ${palette.cardBorder}`, boxShadow: `0 0 0 3px ${palette.cardRing}`, color: palette.inkDark, maxHeight: '62vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: palette.barBg, borderBottom: `4px solid ${palette.cardBorder}`, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: '0 0 auto' }}>
            <span style={{ fontFamily: pixelDisplayFont, fontSize: 10, color: palette.barTitle, whiteSpace: 'nowrap' }}>WHAT NEEDS TENDING</span>
            <button
              type="button"
              className="focus-ring"
              onClick={() => dispatch({ type: 'CLOSE_PICKER' })}
              style={{ cursor: 'pointer', fontFamily: pixelDisplayFont, fontSize: 10, padding: '6px 9px', border: '2px solid #e0bc8e', background: 'transparent', color: palette.barTitle }}
            >
              CLOSE
            </button>
          </div>
          <div style={{ padding: '2px 12px 14px', overflow: 'auto', flex: '1 1 auto' }}>
            {chores.map((c) => (
              <ChoreRow key={c.id} chore={c} done={state.tended.indexOf(c.id) >= 0} dispatch={dispatch} dense />
            ))}
            <div style={{ paddingTop: 12 }}>
              <DraftField state={state} dispatch={dispatch} dense />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card title="WHAT NEEDS TENDING TODAY" subtitle={doneCount}>
      <div style={{ padding: '8px 14px 16px', display: 'flex', flexDirection: 'column' }}>
        {chores.map((c) => (
          <ChoreRow key={c.id} chore={c} done={state.tended.indexOf(c.id) >= 0} dispatch={dispatch} />
        ))}
        <DraftField state={state} dispatch={dispatch} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            paddingTop: 14,
            borderTop: `2px dashed ${palette.tagBorder}`,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 16, color: palette.inkMuted, maxWidth: 460 }}>{farmNote}</div>
          <PixelButton onClick={() => dispatch({ type: 'END_DAY' })} bg={allDone ? palette.btnAmberBg : palette.btnTanBg} fontSize={12} padding="13px 20px" style={{ boxShadow: `0 5px 0 0 ${palette.cardBorder}` }}>
            END THE DAY
          </PixelButton>
        </div>
      </div>
    </Card>
  );
}
