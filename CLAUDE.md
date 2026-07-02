# CLAUDE.md

Guidance for Claude Code when working in this repository.

BudgetTracker is a **mobile-first, local-first PWA** for personal finance: import bank
statements, categorize spending, visualize finances — fully offline, all data on-device.

## Commands

```bash
npm run dev            # Vite dev server → http://localhost:5173
npm run build          # tsc type-check + vite production build
npm test               # Vitest (watch)
npm run test:coverage  # coverage report
npm run typecheck      # tsc --noEmit only
```

Before committing, both `npm run typecheck` and `npm test` must be green.

## Tech stack

React 18 + Vite · TailwindCSS · React Router v6 · Zustand (UI state only) ·
Dexie.js/IndexedDB · ECharts · SheetJS (xlsx) · Vitest + Testing Library · vite-plugin-pwa.

## Architecture rules (do not break these)

- **Layered, one-way dependencies:** UI components → hooks → services/repositories.
  Components never touch the DB directly; hooks bridge features to data.
- **Repository pattern:** all DB access goes through the interfaces in `src/db/interfaces.ts`.
  This is the seam for a future Convex swap — keep it clean.
- **Pure business logic:** analytics, parsing, and intelligence services are side-effect-free
  functions, tested directly in `tests/`.
- **Small files:** each module does one thing; keep files under ~200 lines.
- **Reactive data via `useLiveQuery`** (dexie-react-hooks) — do not duplicate DB data in
  Zustand. The store holds only UI state (selectedMonth, filters, toast, privacyMode).

## Layout

```
src/
  components/   Shared UI primitives          pages/        Route-level components
  features/     Feature composites            hooks/        Data hooks (useLiveQuery)
  services/     Pure business logic           db/           Dexie schema + repositories
    parsing/    Bank parsers + factory        store/        Zustand UI store
  types/        TS definitions                lib/          Shared utilities
tests/          parsing/ + services/ unit tests
```

## Common tasks

- **New bank format:** implement `IFileParser` in `src/services/parsing/`, register it in
  `parserFactory.ts` (before `genericParser`), add tests, update `IMPORT_FORMATS.md`.
- **DB schema change:** bump `this.version(n)` in `src/db/schema.ts`. New optional,
  non-indexed fields need no store change and leave existing records valid.

## Reference docs

- `ARCHITECTURE.md` — layer map, data flow, intelligence services, theme, PWA, testing
- `DATA_MODEL.md` — Dexie schema and entity shapes
- `IMPORT_FORMATS.md` — supported bank formats and parser guide
- `ROADMAP.md` — planned work
