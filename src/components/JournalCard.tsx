import { palette } from '../game/palette';
import type { Action } from '../game/reducer';
import type { GameState, JournalEntry, StampKey } from '../game/types';
import { STAMPS } from '../canvas/sprites';
import { pixelDisplayFont, pixelFont } from './ui';

interface JournalCardProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  isMobile: boolean;
}

const STAMP_LIST: { key: StampKey; label: string }[] = [
  { key: 'heart', label: 'heart' },
  { key: 'star', label: 'star' },
  { key: 'cloud', label: 'rain cloud' },
  { key: 'moon', label: 'moon' },
  { key: 'paw', label: 'paw print' },
  { key: 'mug', label: 'mug' },
];

// A small scrapbook attached to day's end rather than a separate screen —
// this is meant to sit right next to "how did this week go," not become
// its own destination. Stamps reuse the same px() sprite technique as the
// rest of the farm's icons (see sprites.ts); an entry is only saved if the
// person actually leaves a stamp or a note (checked in the reducer's
// ADVANCE_WEEK), and it rides along on the existing GameState/localStorage
// persistence for free — no new storage plumbing needed.
export function JournalCard({ state, dispatch, isMobile }: JournalCardProps) {
  const toggleStamp = (key: StampKey) => {
    dispatch({ type: 'SET_JOURNAL_STAMP', stamp: state.journalStamp === key ? null : key });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontFamily: pixelDisplayFont, fontSize: isMobile ? 9 : 10, color: palette.tagText }}>
        LEAVE SOMETHING FOR THIS WEEK (OPTIONAL)
      </div>
      <div role="group" aria-label="Pick a stamp for this week" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {STAMP_LIST.map((s) => (
          <button
            key={s.key}
            type="button"
            className="focus-ring"
            onClick={() => toggleStamp(s.key)}
            aria-pressed={state.journalStamp === s.key}
            aria-label={`${s.label} stamp`}
            title={`${s.label} stamp`}
            style={{
              cursor: 'pointer',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${palette.cardBorder}`,
              background: state.journalStamp === s.key ? palette.btnAmberBg : palette.cardBg,
            }}
          >
            <img src={STAMPS[s.key]} alt="" style={{ width: 22, height: 22, imageRendering: 'pixelated' }} />
          </button>
        ))}
      </div>
      <div>
        <label htmlFor="journal-note" style={{ display: 'block', fontSize: isMobile ? 13 : 14, color: palette.inkMuted, marginBottom: 6 }}>
          a line about this week, if you want one
        </label>
        <textarea
          id="journal-note"
          value={state.journalNote}
          onChange={(e) => dispatch({ type: 'SET_JOURNAL_NOTE', value: e.target.value })}
          maxLength={140}
          rows={2}
          placeholder="whatever's true — this doesn't get graded"
          style={{
            width: '100%',
            fontFamily: pixelFont,
            fontSize: isMobile ? 15 : 16,
            padding: '9px 10px',
            border: `3px solid ${palette.cardBorder}`,
            background: palette.inputBg,
            color: palette.inkDark,
            outline: 'none',
            resize: 'none',
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: palette.inkMuted }}>saved when the week turns — leave it blank and nothing's kept.</div>
    </div>
  );
}

export function JournalScrapbook({ journal, isMobile }: { journal: JournalEntry[]; isMobile: boolean }) {
  if (journal.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontFamily: pixelDisplayFont, fontSize: isMobile ? 9 : 10, color: palette.tagText }}>THE SEASON SO FAR</div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {journal.map((entry, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 auto',
              width: 116,
              border: `2px solid ${palette.tagBorder}`,
              background: palette.cardBg,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {entry.stamp && <img src={STAMPS[entry.stamp]} alt="" style={{ width: 16, height: 16, imageRendering: 'pixelated' }} />}
              <span style={{ fontFamily: pixelDisplayFont, fontSize: 9, color: palette.tagText }}>WEEK {entry.week}</span>
            </div>
            {entry.note && (
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.35,
                  color: palette.inkMuted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {entry.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
