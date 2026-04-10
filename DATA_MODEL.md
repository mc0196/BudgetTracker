# Data Model

## Transaction

The canonical representation of a single financial event.

```typescript
interface Transaction {
  id: string              // UUID, generated locally
  amount: number          // Always positive
  type: 'income' | 'expense'
  date: string            // ISO date: 'YYYY-MM-DD'
  description: string     // Original transaction description from bank
  originalCategory: string  // Raw category string from the bank export
  mappedCategory: string    // User-facing macro-category after mapping
  importSource?: string   // e.g. "Intesa Sanpaolo — 2026-04"
  notes?: string          // Optional user annotation
  createdAt: string       // ISO timestamp of when record was inserted
}
```

**Design decisions:**
- `amount` is always positive; `type` carries the sign semantics — avoids signed-amount ambiguity
- `date` is a string (not Date object) to avoid timezone issues and simplify indexing
- `originalCategory` is preserved verbatim from the import for audit/re-mapping purposes

---

## CategoryMapping

Persists the user's choice for how a bank category maps to a macro-category.

```typescript
interface CategoryMapping {
  id: string
  originalCategory: string  // Normalized bank category (unique)
  mappedCategory: string    // Name of a MacroCategory
  createdAt: string
}
```

This table is what makes re-importing idempotent with respect to categories — once you've mapped "SUPERMERCATI E IPERMERCATI" → "Food & Dining", every subsequent import applies it automatically.

---

## MacroCategory

User-defined high-level spending buckets.

```typescript
interface MacroCategory {
  id: string
  name: string    // Unique display name
  color: string   // Tailwind color token (e.g. "orange")
  icon: string    // Emoji
  createdAt: string
}
```

Default categories are seeded on first launch (see `DEFAULT_CATEGORIES` in `categoryRepository.ts`).

---

## Budget

A spending limit for a given month, optionally scoped to one category.

```typescript
interface Budget {
  id: string
  month: string       // 'YYYY-MM'
  limit: number       // Maximum spend in euros
  category?: string   // If undefined, applies to total expenses
  createdAt: string
}
```

There can be at most one budget per `(month, category)` pair — `budgetRepository.upsert` enforces this.

---

## Relationships

```
MacroCategory  ←─(name)─  CategoryMapping  ←─(originalCategory)─  Transaction
                                                                        ↑
                                                                    (mappedCategory)
```

- `Transaction.mappedCategory` references `MacroCategory.name` (denormalized for query simplicity)
- `CategoryMapping` is the join table that drives auto-categorization at import time
- If a `MacroCategory` is deleted, existing transactions keep their `mappedCategory` string (soft reference)
