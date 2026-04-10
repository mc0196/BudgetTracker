# Architecture

## Guiding Principles

1. **Local-first** — all data lives in IndexedDB; the app works fully offline
2. **Repository pattern** — data access is behind interfaces, enabling future Convex swap
3. **Layer separation** — UI never calls DB directly; hooks bridge features to repositories
4. **Small files** — each module does one thing; no files over ~200 lines
5. **Pure business logic** — analytics and parsing are side-effect-free functions, easy to test

---

## Layer Map

```
UI Layer           Pages + shared components (display only, no business logic)
    ↕  (props/events)
Application Layer  Feature components + custom hooks (orchestrate data and actions)
    ↕  (async calls)
Domain Layer       Types, analytics service, category service (pure logic)
    ↕  (interfaces)
Data Layer         Repository implementations (Dexie / future Convex) + parsers
```

Cross-layer rules:
- Components only call hooks
- Hooks call repositories and services
- Services are pure functions or thin orchestrators
- Repositories own all DB access

---

## Data Flow: Import

```
File drop
  → parserFactory.getParser(file)      picks Intesa or Generic parser
  → parser.parse(file)                 returns ImportPreview (no DB write)
  → ImportPreview component            user reviews and selects rows
  → importService.commit(preview)      resolves categories, deduplicates, bulk-inserts
  → Dexie bulk write                   triggers useLiveQuery re-renders everywhere
```

---

## Database: Dexie.js (IndexedDB)

Schema lives in `src/db/schema.ts`.  Tables:

| Table | Primary key | Notable indexes |
|---|---|---|
| `transactions` | `id` (UUID) | `date`, `type`, `mappedCategory` |
| `categoryMappings` | `id` | `originalCategory` (unique) |
| `macroCategories` | `id` | `name` (unique) |
| `budgets` | `id` | `month`, `category` |

`useLiveQuery` from `dexie-react-hooks` makes all components automatically reactive — any write to Dexie triggers a re-render in every component that reads affected data.

---

## Future Convex Integration

To replace Dexie with Convex:

1. Implement `ITransactionRepository`, `ICategoryMappingRepository`, etc. from `src/db/interfaces.ts` using Convex queries/mutations
2. Swap the singleton exports in `src/db/index.ts` to point to the Convex implementations
3. No hook, service, or UI code needs to change

The interface layer is the only seam you need to touch.

---

## State Management

Zustand store (`src/store/index.ts`) holds only **UI state**:
- `selectedMonth` — persisted to localStorage
- `transactionFilters` — current filter state on Transactions page
- `toast` — ephemeral notification

Reactive data (transactions, categories, budgets) comes directly from Dexie via `useLiveQuery` hooks — no duplicated state.

---

## PWA Strategy

- `vite-plugin-pwa` generates the service worker and manifest automatically
- Workbox `CacheFirst` strategy for static assets
- IndexedDB data is already local — no extra offline strategy needed
- `display: standalone` + `viewport-fit: cover` for immersive mobile experience

---

## Testing Strategy

- All business logic (analytics, parsers, category service) is pure and tested directly
- No mocking of React components for logic tests
- `fake-indexeddb` makes repository tests runnable in jsdom without a real browser
- Integration tests (import → DB → analytics) can be added in `tests/integration/`
