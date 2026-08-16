import { palette } from '../game/palette';
import { pixelDisplayFont } from './ui';

// Shown once, on the first render after a multi-day gap (see
// game/lastSeen.ts) — no day count, no "you missed X," nothing to imply
// the plot needed the person here every day to survive. The farm-sim
// framing does the work: a farm left alone doesn't die between visits,
// it just waits.
export function WelcomeBackBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="status"
      style={{
        width: '100%',
        maxWidth: 880,
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        background: 'rgba(127,174,78,.16)',
        border: '2px solid #7fae4e',
        padding: '10px 14px',
        animation: 'rgUp .3s ease',
      }}
    >
      <span style={{ fontSize: 15, color: '#e6ecd9', lineHeight: 1.4 }}>
        good to see you. the farm waited — nothing wilted, nothing's owed. pick up wherever feels right.
      </span>
      <button
        type="button"
        className="focus-ring"
        onClick={onDismiss}
        style={{
          cursor: 'pointer',
          fontFamily: pixelDisplayFont,
          fontSize: 9,
          padding: '7px 10px',
          border: '2px solid #7fae4e',
          background: 'transparent',
          color: palette.headerTitle,
          flex: '0 0 auto',
        }}
      >
        OKAY
      </button>
    </div>
  );
}
