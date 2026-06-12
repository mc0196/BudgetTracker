# BudgetTracker

A mobile-first, local-first Progressive Web App for personal finance tracking.

Import bank statements, track spending by category, and visualize your finances — all offline, all on your device.

## Features

- Import Intesa Sanpaolo exports (CSV/XLS) — extensible to other banks
- Auto-categorization with keyword rules + manual override + fuzzy category suggestions while typing
- Dashboard with income, expenses, net balance
- Budget tracking with visual progress bars and 80%/100% alerts
- Charts: spending pie, income/expense bar, daily/weekly line — all with date range picker
- Add transactions manually with a thumb-friendly numpad
- Recurring transaction detection (weekly / monthly / yearly)
- Anomaly detection — flags unusually large amounts per category
- Dark mode (system / light / dark preference, persisted)
- Swipe-to-delete with 5-second undo
- Full offline support via IndexedDB (Dexie.js) + PWA service worker

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — the app works entirely in-browser.

### Build for production

```bash
npm run build
npm run preview
```

### Run tests

```bash
npm test                  # watch mode
npm run test:coverage     # coverage report
npm run typecheck         # TypeScript type-check only
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS |
| Routing | React Router v6 |
| State | Zustand |
| Database | Dexie.js (IndexedDB) |
| Charts | ECharts (echarts-for-react) |
| File parsing | SheetJS (xlsx) |
| Testing | Vitest + Testing Library |
| PWA | vite-plugin-pwa |

## Project Structure

```
src/
  components/      Shared UI primitives (Card, Toast, BottomNav, …)
  features/        Feature-specific composite components
    dashboard/
    transactions/
    charts/
    import/
    settings/
  pages/           Route-level page components
  hooks/           Data hooks (useTransactions, useAnalytics, …)
  services/        Business logic (parsing, analytics, import, intelligence)
    parsing/       Bank-specific parsers + factory
  db/              Dexie schema + repository implementations
    repositories/
  store/           Zustand UI store
  types/           TypeScript type definitions
  lib/             Shared utilities

tests/
  parsing/         Parser unit tests
  services/        Business logic unit tests
```

## Adding a New Bank Format

1. Create `src/services/parsing/myBankParser.ts` implementing `IFileParser`
2. Add it to the `PARSERS` array in `parserFactory.ts` (before `genericParser`)
3. Add tests in `tests/parsing/myBankParser.test.ts`
4. Update `IMPORT_FORMATS.md`

See [IMPORT_FORMATS.md](./IMPORT_FORMATS.md) for the full guide.
