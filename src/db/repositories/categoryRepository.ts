import { db } from '@/db/schema'
import type { ICategoryMappingRepository, IMacroCategoryRepository } from '@/db/interfaces'
import type { CategoryMapping, MacroCategory } from '@/types'
import { randomId } from '@/lib/utils'

// ─── Category Mapping Repository ─────────────────────────────────────────────

export class DexieCategoryMappingRepository implements ICategoryMappingRepository {
  async getAll(): Promise<CategoryMapping[]> {
    return db.categoryMappings.toArray()
  }

  async getByOriginal(originalCategory: string): Promise<CategoryMapping | undefined> {
    return db.categoryMappings.where('originalCategory').equals(originalCategory).first()
  }

  async upsert(originalCategory: string, mappedCategory: string): Promise<CategoryMapping> {
    const existing = await this.getByOriginal(originalCategory)
    if (existing) {
      await db.categoryMappings.update(existing.id, { mappedCategory })
      return { ...existing, mappedCategory }
    }
    const record: CategoryMapping = {
      id: randomId(),
      originalCategory,
      mappedCategory,
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

export const categoryMappingRepository = new DexieCategoryMappingRepository()
export const macroCategoryRepository = new DexieMacroCategoryRepository()
