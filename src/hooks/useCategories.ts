import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { categoryMappingRepository, macroCategoryRepository } from '@/db/repositories/categoryRepository'
import type { MacroCategory, CategoryMapping } from '@/types'

export function useMacroCategories(): MacroCategory[] | undefined {
  return useLiveQuery(() => macroCategoryRepository.getAll())
}

export function useCategoryMappings(): CategoryMapping[] | undefined {
  return useLiveQuery(() => categoryMappingRepository.getAll())
}

export function useCategoryMutations() {
  const createCategory = (cat: Omit<MacroCategory, 'id' | 'createdAt'>) =>
    macroCategoryRepository.create(cat)

  const updateCategory = (id: string, patch: Partial<MacroCategory>) =>
    macroCategoryRepository.update(id, patch)

  const deleteCategory = (id: string) => macroCategoryRepository.delete(id)

  const upsertMapping = (originalCategory: string, mappedCategory: string) =>
    categoryMappingRepository.upsert(originalCategory, mappedCategory)

  const deleteMapping = (id: string) => categoryMappingRepository.delete(id)

  return { createCategory, updateCategory, deleteCategory, upsertMapping, deleteMapping }
}

/** Returns all unique mapped categories currently used in transactions */
export function useUsedCategories(): string[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.transactions.toArray()
    const cats = new Set(all.map(t => t.mappedCategory).filter(Boolean))
    return Array.from(cats).sort()
  })
}
