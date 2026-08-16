import { useEffect, useReducer, useState } from 'react';
import { TARGETS, THEMES } from './game/data';
import { choreList, hardWeek, hoursFor, isDusk, pctFor } from './game/derived';
import { checkReturnAfterGap } from './game/lastSeen';
import { palette } from './game/palette';
import { gameReducer } from './game/reducer';
import { loadState, saveState } from './game/storage';
import { DESKTOP_GRID, MOBILE_GRID, highlightBed } from './canvas/draw';
import { useIsMobile, usePrefersReducedMotion } from './hooks/useMediaQuery';
import { StartScreen } from './components/StartScreen';
import { FarmScreen } from './components/FarmScreen';
import { TendScreen } from './components/TendScreen';
import { DayEndScreen } from './components/DayEndScreen';
import { WorldFrame } from './components/WorldFrame';
import { LiveRegion } from './components/LiveRegion';
import { MoodMusicBoard } from './components/MoodMusicBoard';
import { JournalBoard } from './components/JournalBoard';
import { WelcomeBackBanner } from './components/WelcomeBackBanner';
import { PixelButton, pixelDisplayFont, pixelFont } from './components/ui';

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Runs once on mount, independent of the reducer entirely — a farm
  // that's been idle for days shouldn't read as "you fell behind," so the
  // gap check lives outside GameState and only ever adds a dismissible
  // welcome, never a penalty.
  useEffect(() => {
    const returnedAfterGap = checkReturnAfterGap();
    if (returnedAfterGap && state.started) setShowWelcomeBack(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chores = choreList(state);
  const pct = pctFor(state, state.week);
  const hrs = hoursFor(state, state.week);
  const theme = THEMES[state.plot];
  const tg = TARGETS[state.target];
  const dusk = isDusk(state);
  const hard = hardWeek(state);
  const activeIndex = state.active ? chores.findIndex((c) => c.id === state.active) : -1;
  const highlightBedIndex = isMobile ? highlightBed(activeIndex, state.screen, state.taps) : -1;
  const grid = isMobile ? MOBILE_GRID : DESKTOP_GRID;
  const totalBeds = grid.cols * grid.rows;

  const weekBadge = `WEEK ${state.week} OF ${state.weeks}`;
  const loadBadge = isMobile ? `${pct}% OF FULL · ${hrs} HRS` : `${pct}% OF A FULL WEEK · ${hrs} HRS`;
  const weatherBadge = hard ? 'LIGHT RAIN OVER THE EAST BEDS' : dusk ? 'SUN GOING DOWN' : 'CLEAR, A LITTLE WIND';
  // Revisiting setup via EDIT SETUP also lands on screen === 'start', so
  // "fresh, no save yet" copy needs to check started too, not just screen.
  const freshStart = state.screen === 'start' && !state.started;
  const seasonLabel = freshStart ? 'NO SAVE FILE' : `WEEK ${state.week} / ${state.weeks} · ${tg.short.toUpperCase()}`;
  const footer = freshStart
    ? 'A RAMP-UP PLAN THAT LOOKS LIKE A FARM · TAP ANYWHERE ON THE PLOT TO WATER'
    : 'TAP THE PLOT TO WATER · NOTHING HERE CAN BE FAILED';

  const liveText = freshStart
    ? 'Setting up a new farm. No save file yet.'
    : state.screen === 'start'
      ? `Editing farm setup. Week ${state.week} of ${state.weeks}, ${tg.n}.`
      : `Week ${state.week} of ${state.weeks}. Carrying about ${pct}% of ${tg.n}, around ${hrs} hours. ${state.tended.length} of ${chores.length} chores tended today.`;

  const onPlotActivate = (_index: number) => {
    if (isMobile && state.screen === 'tend' && state.taps < 3) {
      dispatch({ type: 'POUR' });
    }
  };

  let panel = null;
  if (state.screen === 'farm') {
    panel = <FarmScreen state={state} dispatch={dispatch} chores={chores} isMobile={isMobile} />;
  } else if (state.screen === 'tend') {
    panel = <TendScreen state={state} dispatch={dispatch} chores={chores} isMobile={isMobile} />;
  } else if (state.screen === 'dayend') {
    panel = <DayEndScreen state={state} dispatch={dispatch} isMobile={isMobile} totalBeds={totalBeds} />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: palette.bgPage,
        backgroundImage: `radial-gradient(circle at 50% 0%, ${palette.bgPageRadial} 0%, ${palette.bgPage} 70%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 20px 48px',
        fontFamily: pixelFont,
        color: '#f6e6c8',
      }}
    >
      <LiveRegion text={liveText} />

      <div style={{ width: '100%', maxWidth: 880, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
          <span style={{ fontFamily: pixelDisplayFont, fontSize: isMobile ? 17 : 22, letterSpacing: 1, color: palette.headerTitle, textShadow: '2px 2px 0 #4a2c18', whiteSpace: 'nowrap' }}>
            REGROW
          </span>
          {!isMobile && <span style={{ fontSize: 15, color: palette.headerSubtitle, whiteSpace: 'nowrap' }}>tend your way back</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: pixelDisplayFont, fontSize: isMobile ? 9 : 11, color: '#7c6c8c', textAlign: 'right', whiteSpace: 'nowrap' }}>{seasonLabel}</span>
          {state.screen !== 'start' && (
            <PixelButton
              onClick={() => dispatch({ type: 'EDIT_SETUP' })}
              bg="rgba(45,28,16,.55)"
              color="#e8d3ae"
              fontSize={isMobile ? 9 : 10}
              padding={isMobile ? '6px 8px' : '7px 10px'}
              style={{ boxShadow: 'none', border: `2px solid ${palette.cardRing}` }}
            >
              EDIT SETUP
            </PixelButton>
          )}
        </div>
      </div>

      {showWelcomeBack && <WelcomeBackBanner onDismiss={() => setShowWelcomeBack(false)} />}

      <div style={{ width: '100%', maxWidth: 880, marginBottom: 12 }}>
        <MoodMusicBoard />
      </div>

      {state.screen !== 'start' && (
        <div style={{ width: '100%', maxWidth: 880, marginBottom: 18 }}>
          <JournalBoard state={state} dispatch={dispatch} />
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 880 }}>
        {state.screen === 'start' ? (
          <StartScreen state={state} dispatch={dispatch} />
        ) : (
          <WorldFrame
            isMobile={isMobile}
            theme={theme}
            dusk={dusk}
            growTarget={pct / 100}
            hardWeek={hard}
            highlightBedIndex={highlightBedIndex}
            companion="cat"
            reducedMotion={reducedMotion}
            onPlotActivate={onPlotActivate}
            week={state.week}
            weekBadge={weekBadge}
            loadBadge={loadBadge}
            weatherBadge={weatherBadge}
            panel={panel}
          />
        )}
      </div>

      <div style={{ maxWidth: 880, width: '100%', marginTop: 22, fontSize: 14, color: palette.footerText, fontFamily: pixelDisplayFont, lineHeight: 1.9 }}>
        {footer}
      </div>
    </div>
  );
}

export default App;
