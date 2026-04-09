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
