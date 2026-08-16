# Regrow

A phased-return planner for burnout, illness, or leave recovery, built as a small farm-sim UI.

## Stack

- Vite + React + TypeScript
- No backend — state lives in a single `useReducer` store, persisted to `localStorage`
- Canvas 2D for the farm scene (no rendering libraries)

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Type-checks with `tsc -b` and produces a static bundle in `dist/` via Vite — no environment variables or backend required.

## Accessibility

- Every plot on the canvas has a real, focusable keyboard equivalent (`src/canvas/FarmCanvas.tsx`) — not just a decorative `aria-label` on the canvas.
- An `aria-live="polite"` status region (`src/components/LiveRegion.tsx`) summarizes week/load/tended-chore state for screen readers, since the canvas itself is opaque to assistive tech.
- The ambient animation loop is gated on `prefers-reduced-motion`; with it set, the canvas renders a single static frame instead of animating.
- Card/bar/footer text colors were checked against their actual background pairing for WCAG AA contrast (4.5:1) and adjusted where they fell short — see `src/game/palette.ts`.

## Manual QA checklist

- [x] Full loop: start screen → pick target/weeks/level/plot → break ground → farm → tend a chore → water it → answer the feel-check → end the day → let the week turn → back on the farm with the plot visibly grown
- [x] Reload mid-run restores from `localStorage` instead of resetting to the start screen
- [x] Below the mobile breakpoint, the farm screen switches to the bottom-sheet chore picker instead of the desktop inline list
- [x] `prefers-reduced-motion: reduce` stops the canvas's ambient animation
- [x] Keyboard-only navigation reaches every interactive element, including watering a plot
- [x] Card body text passes WCAG AA contrast against its background
