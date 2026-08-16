// Colors ported from the original prototype, with a handful of targeted
// adjustments for WCAG AA contrast (checked against their actual background
// pairing — see the build notes). Everything else is unchanged from the
// prototype's inline styles.
export const palette = {
  bgPage: '#191521',
  bgPageRadial: '#2b2337',

  cardBg: '#e8cfa0',
  cardBorder: '#4a2c18',
  cardRing: '#8a5a33',
  cardShadow: 'rgba(0,0,0,.4)',

  // Header bar (e.g. "NEW FARM", "WHAT NEEDS TENDING TODAY"): darkened a
  // touch from the original #8a5a33 so its title/subtitle text clears 4.5:1.
  barBg: '#754d2b',
  barTitle: '#ffe9c0',
  barSubtitle: '#f0d9b0',

  ink: '#3c2513',
  inkDark: '#4a2f1c',
  // Body copy on the tan card. Original #7a5636 measured 4.32:1 (fails AA
  // for normal-size text) — darkened to clear 4.5:1.
  inkMuted: '#62452b',
  // Small caps labels on the tan card. Original #8a5a33-as-text measured
  // 3.86:1 — darkened to clear 4.5:1.
  tagText: '#684426',
  tagBorder: '#c9ac7c',

  // Outbound links on the tan card (e.g. the Spotify search fallback).
  // btnWaterBg (#c8874a) as text measured 1.97:1 there — too light to read
  // as a link at all, let alone pass AA — darkened to clear 4.5:1.
  linkOnCard: '#7a4a1a',

  headerTitle: '#f3d9a4',
  headerSubtitle: '#9b8ba8',
  // Footer strip on the dark page background. Original #6b5c7d measured
  // 2.95:1 — lightened to clear 4.5:1.
  footerText: '#90859e',

  btnGreenBg: '#7fae4e',
  btnGreenText: '#23330f',
  btnTanBg: '#d9bd8d',
  btnAmberBg: '#f2b45c',
  btnWaterBg: '#c8874a',
  btnRemoveBg: '#e0c495',
  btnTendedBg: '#c9ac7c',
  inputBg: '#f4e3c2',

  dropFull: '#6fa8d0',
  dropEmpty: '#d9bd8d',
} as const;
