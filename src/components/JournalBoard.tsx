import { useState } from 'react';
import { palette } from '../game/palette';
import type { Action } from '../game/reducer';
import type { GameState } from '../game/types';
import { JournalCard, JournalScrapbook } from './JournalCard';
import { Card, pixelDisplayFont } from './ui';

interface JournalBoardProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

// Same toggle-button-plus-panel pattern as MoodMusicBoard, so the journal
// is reachable any time during the week (not just gated behind ending the
// day) — a persistent entry point next to Mood Music, not one more thing
// bolted onto the day-end screen.
export function JournalBoard({ state, dispatch }: JournalBoardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ width: '100%', maxWidth: 880 }}>
      <button
        type="button"
        className="focus-ring"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="journal-panel"
        style={{
          cursor: 'pointer',
          fontFamily: pixelDisplayFont,
          fontSize: 10,
          padding: '8px 12px',
          border: `2px solid ${palette.cardRing}`,
          background: open ? palette.btnAmberBg : 'rgba(45,28,16,.55)',
          color: open ? palette.ink : '#e8d3ae',
        }}
      >
        {open ? 'CLOSE JOURNAL' : `JOURNAL${state.journal.length ? ` (${state.journal.length})` : ''}`}
      </button>

      {open && (
        <div id="journal-panel" role="region" aria-label="Farm journal" style={{ marginTop: 10, animation: 'rgUp .25s ease' }}>
          <Card title="THIS WEEK'S PAGE">
            <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <JournalCard state={state} dispatch={dispatch} isMobile={false} />
              <JournalScrapbook journal={state.journal} isMobile={false} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
