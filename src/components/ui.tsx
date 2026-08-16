import type { CSSProperties, ReactNode } from 'react';
import { palette } from '../game/palette';

export const pixelFont = "'Pixelify Sans', monospace";
export const pixelDisplayFont = "'Silkscreen', monospace";

export const cardOuter: CSSProperties = {
  width: '100%',
  background: palette.cardBg,
  border: `4px solid ${palette.cardBorder}`,
  boxShadow: `0 0 0 4px ${palette.cardRing}, 8px 8px 0 0 ${palette.cardShadow}`,
  color: palette.inkDark,
};

export const barStyle: CSSProperties = {
  background: palette.barBg,
  borderBottom: `4px solid ${palette.cardBorder}`,
  padding: '10px 18px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
};

export function CardBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={barStyle}>
      <span style={{ fontFamily: pixelDisplayFont, fontSize: 13, color: palette.barTitle, whiteSpace: 'nowrap' }}>
        {title}
      </span>
      {subtitle && (
        <span style={{ fontFamily: pixelDisplayFont, fontSize: 10, color: palette.barSubtitle, whiteSpace: 'nowrap' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

export function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div style={cardOuter}>
      <CardBar title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}

interface PixelButtonProps {
  onClick?: () => void;
  children: ReactNode;
  bg: string;
  color?: string;
  fontSize?: number;
  padding?: string;
  align?: 'left' | 'center';
  fontFamily?: string;
  minHeight?: number;
  style?: CSSProperties;
  disabled?: boolean;
  title?: string;
}

// Every button in the source prototype shares this same recipe: solid
// border, hard drop-shadow, small lift on hover. Factored out once instead
// of repeating the six-property style object at every call site.
export function PixelButton({
  onClick,
  children,
  bg,
  color = palette.ink,
  fontSize = 12,
  padding = '13px 20px',
  align = 'left',
  fontFamily = pixelDisplayFont,
  minHeight,
  style,
  disabled,
  title,
}: PixelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="focus-ring"
      style={{
        cursor: disabled ? 'default' : 'pointer',
        fontFamily,
        fontSize,
        padding,
        textAlign: align,
        border: `3px solid ${palette.cardBorder}`,
        background: bg,
        color,
        boxShadow: `0 4px 0 0 ${palette.cardBorder}`,
        minHeight,
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
