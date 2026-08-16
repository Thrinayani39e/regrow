import type { ReactNode } from 'react';
import { palette } from '../game/palette';
import type { Theme } from '../game/types';
import { FarmCanvas } from '../canvas/FarmCanvas';
import type { Companion } from '../canvas/draw';
import { pixelDisplayFont } from './ui';

interface WorldFrameProps {
  isMobile: boolean;
  theme: Theme;
  dusk: boolean;
  growTarget: number;
  hardWeek: boolean;
  highlightBedIndex: number;
  companion: Companion;
  reducedMotion: boolean;
  onPlotActivate: (index: number) => void;
  weekBadge: string;
  loadBadge: string;
  weatherBadge: string;
  panel: ReactNode;
}

const badgeBoxDesktop = {
  background: 'rgba(45,28,16,.82)',
  border: `2px solid ${palette.btnWaterBg}`,
  padding: '6px 10px',
  fontFamily: pixelDisplayFont,
  fontSize: 11,
  color: '#ffe9c0',
  lineHeight: 1.7,
} as const;

// Ported from the shared "isWorld" block present in both prototypes: a
// canvas + status badges that stay mounted across the farm/tend/dayend
// screens, with the active screen's panel laid either below it (desktop,
// Regrow.dc.html 100-104) or overlaid as a bottom sheet on top of it
// (mobile, Regrow iOS.dc.html 90-103).
export function WorldFrame({
  isMobile,
  theme,
  dusk,
  growTarget,
  hardWeek,
  highlightBedIndex,
  companion,
  reducedMotion,
  onPlotActivate,
  weekBadge,
  loadBadge,
  weatherBadge,
  panel,
}: WorldFrameProps) {
  const canvas = (
    <FarmCanvas
      isMobile={isMobile}
      theme={theme}
      dusk={dusk}
      growTarget={growTarget}
      hardWeek={hardWeek}
      highlightBedIndex={highlightBedIndex}
      companion={companion}
      reducedMotion={reducedMotion}
      onPlotActivate={onPlotActivate}
    />
  );

  if (isMobile) {
    return (
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', border: `4px solid ${palette.cardBorder}`, boxShadow: `0 0 0 4px ${palette.cardRing}, 8px 8px 0 0 ${palette.cardShadow}` }}>
        {canvas}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '14px 14px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            gap: 10,
            background: 'linear-gradient(180deg, rgba(20,14,28,.72) 0%, rgba(20,14,28,0) 100%)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, fontFamily: pixelDisplayFont }}>
            <span style={{ fontSize: 9, whiteSpace: 'nowrap', background: 'rgba(45,28,16,.8)', border: `2px solid ${palette.btnWaterBg}`, padding: '4px 7px', color: '#ffe9c0' }}>
              {weekBadge}
            </span>
            <span style={{ fontSize: 8, whiteSpace: 'nowrap', background: 'rgba(45,28,16,.8)', border: `2px solid ${palette.cardRing}`, padding: '4px 7px', color: '#f0be7c' }}>
              {loadBadge}
            </span>
            <span style={{ fontSize: 8, lineHeight: 1.6, maxWidth: 150, textAlign: 'right', color: '#cbb8a0', textShadow: '1px 1px 0 #2a1c10' }}>
              {weatherBadge}
            </span>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>{panel}</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ position: 'relative', border: `4px solid ${palette.cardBorder}`, boxShadow: `0 0 0 4px ${palette.cardRing}, 8px 8px 0 0 ${palette.cardShadow}`, background: palette.bgPageRadial }}>
        {canvas}
        <div style={{ position: 'absolute', top: 12, left: 12, ...badgeBoxDesktop }}>
          {weekBadge}
          <br />
          <span style={{ color: '#e8b477' }}>{loadBadge}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 12, right: 12, ...badgeBoxDesktop, fontSize: 10, maxWidth: 230, color: '#e8d3ae' }}>
          {weatherBadge}
        </div>
      </div>
      {panel}
    </div>
  );
}
