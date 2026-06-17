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
  mappedSubcategory?: string // Optional subcategory within mappedCategory (by name)
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
  originalCategory: string   // Normalized bank category (unique)
  mappedCategory: string     // Name of a MacroCategory
  mappedSubcategory?: string // Learned subcategory (by name), if the user assigned one
  createdAt: string
}
```

This table is what makes re-importing idempotent with respect to categories — once you've mapped "SUPERMERCATI E IPERMERCATI" → "Food & Dining", every subsequent import applies it automatically.

The mapping also **learns the subcategory**: when the user assigns a subcategory to a transaction, `mappedSubcategory` is stored here (keyed on `originalCategory`) and reapplied — alongside the macro-category — on every future import of the same bank category. The relationship is 1:1 per `originalCategory` (last write wins).

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

## Subcategory

Optional second level beneath a `MacroCategory`. Stored in its own table (added in Dexie schema v2).

```typescript
interface Subcategory {
  id: string
  parentCategoryId: string  // FK → MacroCategory.id
  name: string              // Renameable; English defaults
  createdAt: string
}
```

**Design decisions:**
- At most **3 subcategories per parent** (`MAX_SUBCATEGORIES_PER_CATEGORY`), enforced in the UI.
- Subcategories are **optional**: a transaction may have no `mappedSubcategory`.
- Default subcategories are seeded for the built-in categories on first launch (see `DEFAULT_SUBCATEGORIES` in `categoryRepository.ts`), after the categories themselves so the parent ids exist.
- Like categories, transactions reference a subcategory **by name** (`Transaction.mappedSubcategory`), not by id — consistent with the rest of the model and resilient to renames/deletes (soft reference).

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
      ↑                    (mappedCategory,                            ↑
   (parentCategoryId)       mappedSubcategory)                  (mappedCategory,
      │                                                          mappedSubcategory)
  Subcategory  ──────────────(name)──────────────────────────────────┘
```

- `Transaction.mappedCategory` references `MacroCategory.name` and `Transaction.mappedSubcategory` references `Subcategory.name` (both denormalized for query simplicity)
- `Subcategory.parentCategoryId` is the only id-based FK in the model (→ `MacroCategory.id`)
- `CategoryMapping` is the join table that drives auto-categorization at import time, learning both the macro-category and the subcategory
- If a `MacroCategory` or `Subcategory` is deleted, existing transactions keep their name strings (soft reference)
