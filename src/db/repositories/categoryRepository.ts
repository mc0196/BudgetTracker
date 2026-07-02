import { db } from '@/db/schema'
import type {
  ICategoryMappingRepository,
  IMacroCategoryRepository,
  ISubcategoryRepository,
} from '@/db/interfaces'
import type { CategoryMapping, MacroCategory, Subcategory } from '@/types'
import { randomId } from '@/lib/utils'

// ─── Category Mapping Repository ─────────────────────────────────────────────

export class DexieCategoryMappingRepository implements ICategoryMappingRepository {
  async getAll(): Promise<CategoryMapping[]> {
    return db.categoryMappings.toArray()
  }

  async getByOriginal(originalCategory: string): Promise<CategoryMapping | undefined> {
    return db.categoryMappings.where('originalCategory').equals(originalCategory).first()
  }

  /**
   * Inserts or updates a mapping.
   *
   * `mappedSubcategory` semantics:
   *   - omitted (undefined) → leave any previously learned subcategory untouched
   *   - '' (empty string)   → clear the learned subcategory
   *   - non-empty string    → store it
   */
  async upsert(
    originalCategory: string,
    mappedCategory: string,
    mappedSubcategory?: string,
  ): Promise<CategoryMapping> {
    const existing = await this.getByOriginal(originalCategory)
    if (existing) {
      const patch: Partial<CategoryMapping> = { mappedCategory }
      if (mappedSubcategory !== undefined) {
        patch.mappedSubcategory = mappedSubcategory || undefined
      }
      await db.categoryMappings.update(existing.id, patch)
      return { ...existing, ...patch }
    }
    const record: CategoryMapping = {
      id: randomId(),
      originalCategory,
      mappedCategory,
      mappedSubcategory: mappedSubcategory || undefined,
      createdAt: new Date().toISOString(),
    }
    await db.categoryMappings.add(record)
    return record
  }

  async delete(id: string): Promise<void> {
    await db.categoryMappings.delete(id)
  }

  async bulkUpsert(
    mappings: Array<{ originalCategory: string; mappedCategory: string }>,
  ): Promise<void> {
    for (const { originalCategory, mappedCategory } of mappings) {
      await this.upsert(originalCategory, mappedCategory)
    }
  }
}

// ─── Macro Category Repository ────────────────────────────────────────────────

/** Default built-in categories seeded on first run */
export const DEFAULT_CATEGORIES: Omit<MacroCategory, 'id' | 'createdAt'>[] = [
  { name: 'Food & Dining', color: 'orange', icon: '🍽️' },
  { name: 'Transport', color: 'blue', icon: '🚗' },
  { name: 'Shopping', color: 'pink', icon: '🛍️' },
  { name: 'Housing', color: 'yellow', icon: '🏠' },
  { name: 'Health', color: 'green', icon: '💊' },
  { name: 'Entertainment', color: 'purple', icon: '🎬' },
  { name: 'Travel', color: 'cyan', icon: '✈️' },
  { name: 'Utilities', color: 'gray', icon: '💡' },
  { name: 'Income', color: 'emerald', icon: '💰' },
  { name: 'Education', color: 'indigo', icon: '📚' },
  { name: 'Other', color: 'stone', icon: '📦' },
  { name: 'Uncategorized', color: 'slate', icon: '❓' },
]

export class DexieMacroCategoryRepository implements IMacroCategoryRepository {
  async getAll(): Promise<MacroCategory[]> {
    return db.macroCategories.orderBy('name').toArray()
  }

  async getByName(name: string): Promise<MacroCategory | undefined> {
    return db.macroCategories.where('name').equals(name).first()
  }

  async create(category: Omit<MacroCategory, 'id' | 'createdAt'>): Promise<MacroCategory> {
    const record: MacroCategory = {
      ...category,
      id: randomId(),
      createdAt: new Date().toISOString(),
    }
    await db.macroCategories.add(record)
    return record
  }

  async update(id: string, patch: Partial<MacroCategory>): Promise<MacroCategory> {
    await db.macroCategories.update(id, patch)
    const updated = await db.macroCategories.get(id)
    if (!updated) throw new Error(`Category ${id} not found`)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.macroCategories.delete(id)
  }

  /** Seeds default categories if the table is empty */
  async seedDefaults(): Promise<void> {
    const count = await db.macroCategories.count()
    if (count > 0) return
    const now = new Date().toISOString()
    const records: MacroCategory[] = DEFAULT_CATEGORIES.map(c => ({
      ...c,
      id: randomId(),
      createdAt: now,
    }))
    await db.macroCategories.bulkAdd(records)
  }
}

// ─── Subcategory Repository ───────────────────────────────────────────────────

/** Max subcategories allowed per macro-category */
export const MAX_SUBCATEGORIES_PER_CATEGORY = 3

/**
 * Default subcategories seeded per built-in category (keyed by category name).
 * Names default to English and are renameable; capped at 3 per parent.
 */
export const DEFAULT_SUBCATEGORIES: Record<string, string[]> = {
  'Food & Dining': ['Groceries', 'Restaurants', 'Cafés'],
  Transport: ['Fuel', 'Public Transit', 'Parking'],
  Shopping: ['Clothing', 'Electronics', 'Home'],
  Housing: ['Rent', 'Mortgage', 'Maintenance'],
  Health: ['Pharmacy', 'Doctor', 'Fitness'],
  Entertainment: ['Streaming', 'Events', 'Games'],
  Travel: ['Flights', 'Hotels', 'Local Transport'],
  Utilities: ['Electricity', 'Internet', 'Water'],
  Income: ['Salary', 'Refunds', 'Investments'],
  Education: ['Courses', 'Books', 'Tuition'],
}

export class DexieSubcategoryRepository implements ISubcategoryRepository {
  async getAll(): Promise<Subcategory[]> {
    return db.subcategories.toArray()
  }

  async getByParent(parentCategoryId: string): Promise<Subcategory[]> {
    return db.subcategories.where('parentCategoryId').equals(parentCategoryId).toArray()
  }

  async create(subcategory: Omit<Subcategory, 'id' | 'createdAt'>): Promise<Subcategory> {
    const record: Subcategory = {
      ...subcategory,
      id: randomId(),
      createdAt: new Date().toISOString(),
    }
    await db.subcategories.add(record)
    return record
  }

  async update(id: string, patch: Partial<Subcategory>): Promise<Subcategory> {
    await db.subcategories.update(id, patch)
    const updated = await db.subcategories.get(id)
    if (!updated) throw new Error(`Subcategory ${id} not found`)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.subcategories.delete(id)
  }

  /**
   * Seeds default subcategories for built-in categories if the table is empty.
   * Resolves each parent category by name to obtain its id.
   */
  async seedDefaults(): Promise<void> {
    const count = await db.subcategories.count()
    if (count > 0) return
    const categories = await db.macroCategories.toArray()
    const now = new Date().toISOString()
    const records: Subcategory[] = []
    for (const cat of categories) {
      const names = DEFAULT_SUBCATEGORIES[cat.name]
      if (!names) continue
      for (const name of names) {
        records.push({ id: randomId(), parentCategoryId: cat.id, name, createdAt: now })
      }
    }
    if (records.length > 0) await db.subcategories.bulkAdd(records)
  }
}

export const categoryMappingRepository = new DexieCategoryMappingRepository()
export const macroCategoryRepository = new DexieMacroCategoryRepository()
export const subcategoryRepository = new DexieSubcategoryRepository()
