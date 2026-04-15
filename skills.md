# Skills — BudgetTracker (Advanced)

## Mission

Build a **mobile-first, local-first financial tracking PWA** that is:

* fast
* reliable
* offline-capable
* extensible (Convex-ready)
* maintainable at scale

All decisions must optimize for:

1. Simplicity
2. Data integrity
3. Long-term maintainability

---

## Engineering Principles

* Prefer **explicit over implicit**
* Prefer **composition over abstraction**
* Avoid premature optimization
* Design for **change and extensibility**
* Every layer must be independently replaceable

---

## Architecture Constraints (STRICT)

### Layer Separation (MANDATORY)

The codebase MUST follow this structure:

* UI Layer (`/components`, `/pages`)
* Application Layer (`/features`)
* Domain Layer (`/types`, business logic)
* Data Layer (`/services`, `/db`)

**Forbidden:**

* UI calling DB directly
* Business logic inside components
* Cross-layer leakage

---

## Data Layer Rules (CRITICAL)

* Use a **Repository Pattern**
* All persistence goes through repositories
* No direct IndexedDB/Dexie usage outside `/db`

### Required abstraction:

```ts
interface TransactionRepository {
  getAll(): Promise<Transaction[]>;
  insert(tx: Transaction): Promise<void>;
  bulkInsert(txs: Transaction[]): Promise<void>;
  query(filter: TransactionFilter): Promise<Transaction[]>;
}
```

This abstraction MUST allow future replacement with Convex.

---

## Domain Modeling

### Transaction (canonical model)

```ts
type Transaction = {
  id: string;
  amount: number; // always positive
  type: "income" | "expense";
  date: string; // ISO format YYYY-MM-DD
  description: string;
  originalCategory: string;
  mappedCategory: string;
};
```

### Rules:

* Never store raw/unparsed data
* Always normalize at import boundary
* Never trust external data

---

## Import System (HIGH RISK AREA)

### Required pipeline:

1. File validation
2. Schema detection
3. Field mapping
4. Normalization
5. Preview
6. Commit

### Rules:

* Must support unknown column names
* Must fail gracefully
* Must never corrupt DB
* Must be test-covered

---

## Category System (CORE FEATURE)

* Categories are **user-controlled**
* Always allow override
* Maintain mapping table:

```ts
type CategoryMapping = {
  original: string;
  mapped: string;
};
```

### Rules:

* Never hardcode categories
* Always fallback to "Uncategorized"
* Mapping must be editable

---

## UI/UX System

### Mobile-First Constraints

* Design for thumb interaction
* Use bottom navigation
* Max 1 primary action per screen
* Avoid modal overload

### Component Rules

* Max 200 lines per component
* Separate logic into hooks
* Reusable components must be pure

---

## Frontend Design Skill

### Design Language

* **Style:** Clean, minimal, financial-grade — inspired by Revolut, N26, Monzo
* **Mood:** Confident, trustworthy, modern — never playful or cluttered
* **Density:** Comfortable — enough whitespace to breathe, not so much it wastes space

### Color System (Tailwind tokens — dark mode priority)

* **Background layers:** `#0b0b13` (page) → `#13131e` (card) → `#1a1a28` (header/nav)
* **Income:** `text-income` / `text-income-bright` (dark) — green tones
* **Expense:** `text-expense` / `text-expense-bright` (dark) — red tones
* **Primary accent:** `primary-500` (violet/indigo) — CTAs, active states, highlights
* **Text hierarchy:** `slate-100` → `slate-300` → `slate-500` → `slate-600`
* **Borders:** `white/[0.07]` on cards, `white/[0.08]` on headers/dividers

### Typography

* **Headings:** `font-bold`, `text-xl` max on mobile headers
* **Body:** `text-sm` standard, `text-xs` for metadata/labels
* **Numbers/amounts:** always `tabular-nums font-semibold`
* **Labels/tags:** `uppercase tracking-wide text-xs font-medium`

### Spacing & Layout

* Page padding: `px-4`
* Card padding: `p-4` (md), `p-3` (sm) via `Card` component
* Vertical rhythm: `space-y-3` between cards, `space-y-4` inside cards
* Safe area: always use `pt-safe` on full-screen pages, `pb-[env(safe-area-inset-bottom)]` on nav

### Cards & Surfaces

* Use `Card` component for all surfaces — never raw `div` with manual shadow
* Rounded: `rounded-2xl` for cards, `rounded-xl` for inputs/buttons, `rounded-full` for badges/avatars
* Elevation: `shadow-sm` light mode only — dark mode uses border contrast instead

### Interactive Elements

* Buttons: `rounded-2xl py-3 px-4 text-sm font-semibold` for primary actions
* Primary CTA: `bg-primary-500 text-white`
* Destructive: `bg-expense text-white` or `text-expense` on subtle bg
* Touch targets: minimum `44px` height/width
* Press feedback: `press-scale` utility + `active:brightness-95`
* Haptics: `haptics.light()` on navigation/tap, `haptics.success()` on confirm, `haptics.error()` on delete

### Icons & Imagery

* Use inline SVG for nav and action icons — no external icon library
* Category icons: emoji in a `w-10 h-10 rounded-full` colored badge
* Income badge bg: `bg-income-light dark:bg-income-subtle`
* Expense badge bg: `bg-expense-light dark:bg-expense-subtle`

### Motion & Transitions

* Prefer `transition-colors` for color changes
* Spring easing for swipe/gesture: `cubic-bezier(0.16, 1, 0.3, 1)`
* Skeleton loaders instead of spinners for content areas
* Entrance animations: `slideDown` (toasts), `scaleIn` (modals), `fadeIn` (pages)

### Forms & Inputs

* Input style: `rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04]`
* Focus ring: `focus:border-primary-400 focus:outline-none`
* Placeholder: `text-gray-400 dark:placeholder:text-slate-600`
* Currency prefix: absolute-positioned `€` inside input, `pl-7`

### Empty & Loading States

* Empty: centered icon (emoji, large) + title `text-base font-semibold` + description `text-sm text-slate-400`
* Loading: `SkeletonTransactionRow` / `SkeletonMonthlyOverview` — never raw spinners in content areas
* Error: subtle red badge with message + retry link

### Dark Mode Rules

* Dark mode is the primary design target — light mode is secondary
* Never use `bg-white` on full-page backgrounds in dark — use the `#0b0b13` / `#13131e` scale
* Always pair every light class with a `dark:` variant
* Recharts tooltips: must use `contentStyle` with dark bg when `isDark` is true

### Anti-Patterns (FORBIDDEN)

* No gradient backgrounds unless for hero/hero-stat cards
* No shadows in dark mode (use border contrast)
* No more than 2 font sizes on a single card
* No centered text in list items
* No full-width modals — use bottom sheets or inline flows
* No emoji as primary nav icons

---

## Performance Strategy

* Use memoization (`useMemo`, `useCallback`) when needed
* Avoid unnecessary state
* Use selector-based state access (Zustand)
* Lazy load charts and heavy modules

---

## Testing Strategy (MANDATORY)

### Tools:

* Vitest

### Coverage Requirements:

Test ALL:

* parsing logic
* aggregation logic
* category mapping
* edge cases (empty data, invalid input)

### Example:

```ts
describe("calculateMonthlyTotal", () => {
  it("correctly sums expenses", () => {
    ...
  });
});
```

---

## State Management

* Use Zustand
* State must be: minimal, normalized, derived when possible

**Avoid:**

* duplicated state
* derived state stored as state

---

## Code Quality Rules

### Naming

* Clear, intention-revealing names
* No abbreviations
* No generic names (data, stuff, temp)

### Functions

* Max 30-40 lines
* Single responsibility
* No side effects unless explicit

---

## Anti-Patterns (STRICTLY FORBIDDEN)

* Direct DB calls in components
* Any usage of `any`
* Hardcoded values
* Massive files (>300 lines)
* Hidden side effects
* Implicit data transformations

---

## Decision Framework

When multiple solutions exist:

1. Choose simplest working solution
2. Prefer readability over cleverness
3. Prefer explicit data flow
4. Prefer testability

---

## Future-Proofing

Code MUST be designed to support:

* Convex integration
* Multi-device sync
* AI categorization
* Recurring transaction detection

---

## Observability (ADVANCED)

* Log critical operations: imports, errors, DB writes
* Provide debug-friendly structure

---

## File & Folder Rules

* Feature-based grouping
* Co-locate related files
* Avoid deep nesting (>3 levels)

---

## AI Collaboration Rules

When generating code:

* Always explain non-trivial decisions
* Always include types
* Always include basic tests
* Never generate placeholder code unless requested

---

## Definition of Done

A feature is complete ONLY if:

* Code is clean and typed
* Tests are written
* Edge cases handled
* UI works on mobile
* No console errors
* No TODOs left

---

## Golden Rule

> "Write code as if another developer will maintain it in 6 months — and that developer is you."
