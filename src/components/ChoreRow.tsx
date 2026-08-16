import type { Action } from '../game/reducer';
import { palette } from '../game/palette';
import type { Chore } from '../game/types';
import { ICONS } from '../canvas/sprites';
import { PixelButton, pixelDisplayFont } from './ui';

interface ChoreRowProps {
  chore: Chore;
  done: boolean;
  dispatch: React.Dispatch<Action>;
  dense?: boolean;
}

// Shared between the desktop inline chore list (Regrow.dc.html 113-124) and
// the mobile bottom-sheet picker (Regrow iOS.dc.html 127-137) — same row,
// slightly denser sizing on mobile.
export function ChoreRow({ chore, done, dispatch, dense }: ChoreRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: dense ? 11 : 14,
        padding: dense ? '11px 0' : '13px 4px',
        borderBottom: `2px dashed ${palette.tagBorder}`,
        opacity: done ? 0.5 : 1,
      }}
    >
      <img
        src={ICONS[chore.icon]}
        alt=""
        style={{ width: dense ? 28 : 34, height: dense ? 28 : 34, imageRendering: 'pixelated', flex: '0 0 auto' }}
      />
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <div style={{ fontSize: dense ? 18 : 20, lineHeight: 1.4 }}>{chore.name}</div>
        <div style={{ fontSize: dense ? 14 : 15, lineHeight: 1.4, color: palette.inkMuted }}>{chore.sub}</div>
      </div>
      {!dense && (
        <span
          style={{
            fontFamily: pixelDisplayFont,
            fontSize: 9,
            color: palette.tagText,
            border: `2px solid ${palette.tagBorder}`,
            padding: '4px 6px',
            whiteSpace: 'nowrap',
          }}
        >
          {chore.tag}
        </span>
      )}
      {chore.own && (
        <button
          type="button"
          className="focus-ring"
          title="pull this one up"
          onClick={() => dispatch({ type: 'REMOVE_CUSTOM', id: chore.id })}
          style={{
            cursor: 'pointer',
            fontFamily: pixelDisplayFont,
            fontSize: 11,
            width: dense ? 34 : 30,
            height: dense ? 34 : 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${palette.tagBorder}`,
            background: palette.btnRemoveBg,
            color: palette.tagText,
            flex: '0 0 auto',
          }}
        >
          x
        </button>
      )}
      <PixelButton
        onClick={() => (done ? undefined : dispatch({ type: 'GO_TEND', id: chore.id }))}
        disabled={done}
        bg={done ? palette.btnTendedBg : palette.btnGreenBg}
        fontSize={11}
        padding={dense ? '0 13px' : '11px 15px'}
        minHeight={dense ? 44 : undefined}
        style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}
      >
        {done ? 'TENDED' : 'TEND'}
      </PixelButton>
    </div>
  );
}
