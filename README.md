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
