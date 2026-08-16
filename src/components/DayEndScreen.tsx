import { useEffect, useRef } from 'react';
import { TARGETS } from '../game/data';
import { hoursFor, pctFor } from '../game/derived';
import { palette } from '../game/palette';
import type { Action } from '../game/reducer';
import type { GameState } from '../game/types';
import { Card, PixelButton, pixelDisplayFont } from './ui';

interface DayEndScreenProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  isMobile: boolean;
  totalBeds: number;
}

// Ported from the "isDayEnd" block — desktop card in Regrow.dc.html
// 189-208, mobile bottom sheet in Regrow iOS.dc.html 190-207. tallyGrown
// uses the settled target percentage rather than the canvas's live-easing
// growT (that value lives inside FarmCanvas's own animation loop and isn't
// worth plumbing out just for this one number).
export function DayEndScreen({ state, dispatch, isMobile, totalBeds }: DayEndScreenProps) {
  const pct = pctFor(state, state.week);
  const tg = TARGETS[state.target];
  const seasonDone = state.week >= state.weeks;

  const dayEndTitle = state.turning ? 'THE WEEK TURNS' : "DAY'S END";
  const dayEndLine = state.turning
    ? 'the plot fills in a little overnight.'
    : seasonDone
      ? 'last light on the last week of the season.'
      : "sun's down. the beds are watered.";
  const dayEndSub = state.turning
    ? "no fanfare. just a few more sprouts than there were yesterday, which is how it actually happens."
    : `you took on about ${pct}% of ${tg.n} this week — and stopped there on purpose. stopping on purpose is the skill.`;
  const turnLabel = state.turning ? 'GOOD MORNING' : seasonDone ? 'CLOSE THE SEASON' : 'LET THE WEEK TURN';
  const tallyGrown = `${Math.max(1, Math.round((pct / 100) * totalBeds))} of ${totalBeds} beds coming in`;
  const tallyNext = seasonDone
    ? 'the season closes here. you can always start another one.'
    : `next week: about ${pctFor(state, state.week + 1)}% — ${hoursFor(state, state.week + 1)} hrs.`;

  // The 900ms delay here used to be a bare setTimeout with no way to
  // cancel it: click LET THE WEEK TURN, then GOOD MORNING right away
  // (before the 900ms fires), then END DAY + LET THE WEEK TURN again —
  // the first timer was still live and could fire ADVANCE_WEEK mid
  // transition #2, silently skipping the week forward an extra time and
  // wiping that day's tended chores while the person was looking at
  // something else entirely.
  //
  // Naively canceling the timer on unmount fixes that, but overcorrects:
  // clicking GOOD MORNING early would unmount the component, cancel the
  // pending ADVANCE_WEEK, and the week would just never advance at all —
  // worse than the original bug. Clicking GOOD MORNING is a request to
  // finish the transition *now*, so if the timer hasn't fired yet, the
  // advance is applied immediately instead of being left to a background
  // timer; if it already fired, this is a no-op. Either way the week
  // advances exactly once per turn, and never after the person has moved
  // on to something else. STAY OUT A BIT (BACK_TO_FARM) is the one path
  // that's meant to cancel the transition outright rather than complete
  // it early — unmounting still clears the ref for that case, and the
  // reducer's own BACK_TO_FARM resets `turning` regardless.
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAdvanceTimeout = () => {
    if (advanceTimeoutRef.current !== null) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  };

  useEffect(() => () => clearAdvanceTimeout(), []);

  const handleTurnWeek = () => {
    if (state.turning) {
      if (advanceTimeoutRef.current !== null) {
        clearAdvanceTimeout();
        dispatch({ type: 'ADVANCE_WEEK' });
      }
      dispatch({ type: 'FINISH_TURN' });
      return;
    }
    if (advanceTimeoutRef.current !== null) return;
    dispatch({ type: 'START_TURN' });
    advanceTimeoutRef.current = setTimeout(() => {
      advanceTimeoutRef.current = null;
      dispatch({ type: 'ADVANCE_WEEK' });
    }, 900);
  };

  const journalHint = 'want to leave a stamp or a line about this week? open JOURNAL, up by the header.';

  const tallyBox = (
    <div style={{ border: `3px solid ${palette.tagBorder}`, padding: isMobile ? 11 : 14, display: 'flex', flexDirection: 'column', gap: isMobile ? 5 : 8 }}>
      <div style={{ fontFamily: pixelDisplayFont, fontSize: isMobile ? 9 : 10, color: palette.tagText }}>THIS WEEK'S PLOT</div>
      <div style={{ fontSize: isMobile ? 17 : 18 }}>{tallyGrown}</div>
      <div style={{ fontSize: isMobile ? 14 : 15, color: palette.inkMuted }}>{tallyNext}</div>
    </div>
  );

  const buttons = (
    <>
      <PixelButton
        onClick={handleTurnWeek}
        bg={palette.btnGreenBg}
        color={palette.btnGreenText}
        fontSize={isMobile ? 11 : 12}
        padding="13px 20px"
        minHeight={isMobile ? 48 : undefined}
        style={{ boxShadow: `0 5px 0 0 ${palette.cardBorder}` }}
      >
        {turnLabel}
      </PixelButton>
      <PixelButton
        onClick={() => dispatch({ type: 'BACK_TO_FARM' })}
        bg={palette.btnTanBg}
        fontSize={isMobile ? 11 : 12}
        padding="13px 20px"
        minHeight={isMobile ? 48 : undefined}
        style={{ boxShadow: `0 5px 0 0 ${palette.cardBorder}` }}
      >
        STAY OUT A BIT
      </PixelButton>
    </>
  );

  if (isMobile) {
    return (
      <div style={{ padding: '14px 12px 30px', background: 'linear-gradient(180deg, rgba(24,16,30,0) 0%, rgba(24,16,30,.9) 22%, rgba(24,16,30,.97) 100%)', animation: 'rgUp .35s ease' }}>
        <div style={{ background: palette.cardBg, border: `4px solid ${palette.cardBorder}`, boxShadow: `0 0 0 3px ${palette.cardRing}`, color: palette.inkDark, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: palette.barBg, borderBottom: `4px solid ${palette.cardBorder}`, padding: '8px 12px', fontFamily: pixelDisplayFont, fontSize: 10, color: palette.barTitle, flex: '0 0 auto' }}>
            {dayEndTitle}
          </div>
          <div style={{ padding: '15px 14px 18px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: '1 1 auto' }}>
            <div style={{ fontSize: 23, lineHeight: 1.35 }}>{dayEndLine}</div>
            <div style={{ fontSize: 15, lineHeight: 1.45, color: palette.inkMuted }}>{dayEndSub}</div>
            {!state.turning && <div style={{ fontSize: 13, color: palette.inkMuted }}>{journalHint}</div>}
            {tallyBox}
            {buttons}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card title={dayEndTitle}>
      <div style={{ padding: 22, display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 26, lineHeight: 1.3 }}>{dayEndLine}</div>
          <div style={{ fontSize: 17, color: palette.inkMuted, lineHeight: 1.5 }}>{dayEndSub}</div>
          {!state.turning && <div style={{ fontSize: 14, color: palette.inkMuted }}>{journalHint}</div>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>{buttons}</div>
        </div>
        <div style={{ flex: '0 1 260px' }}>{tallyBox}</div>
      </div>
    </Card>
  );
}
