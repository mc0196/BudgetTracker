/**
 * Category service — handles mapping bank categories to macro-categories.
 *
 * The mapping pipeline:
 *   1. Exact match in categoryMappings table
 *   2. Smart suggestion based on known keywords (used on import)
 *   3. Fallback: 'Uncategorized'
 */

import { categoryMappingRepository } from '@/db/repositories/categoryRepository'
import type { CategoryMapping, ParsedTransaction } from '@/types'
import { normalizeCategory } from '@/lib/utils'

// ─── Keyword-based auto-suggestions ──────────────────────────────────────────

/**
 * Simple keyword rules for auto-categorization.
 * Keys are macro-category names; values are lowercase keyword fragments.
 *
 * Rules are checked in order; first match wins.
 */
const KEYWORD_RULES: Record<string, string[]> = {
  'Food & Dining': [
    'supermercato', 'esselunga', 'carrefour', 'lidl', 'aldi', 'conad', 'coop',
    'restaurant', 'ristorante', 'pizzeria', 'bar ', 'caffe', 'caffè', 'mcdonald',
    'burger', 'sushi', 'trattoria', 'osteria', 'paninoteca', 'gelat',
  ],
  Transport: [
    'atm', 'atac', 'trenitalia', 'italo', 'frecciarossa', 'bus', 'metro',
    'parcheggio', 'parking', 'autostrada', 'telepass', 'benzina', 'carburante',
    'eni', 'agip', 'q8', 'tamoil', 'taxi', 'uber', 'bolt',
  ],
  Shopping: [
    'amazon', 'zalando', 'h&m', 'zara', 'ikea', 'mediaworld', 'unieuro',
    'primark', 'decathlon', 'abbigliamento', 'negozio', 'store', 'shop',
  ],
  Housing: [
    'affitto', 'rent', 'condominio', 'mutuo', 'immobiliare',
    'gas', 'luce', 'acqua', 'tari', 'bolletta',
  ],
  Utilities: [
    'enel', 'a2a', 'eni gas', 'tim', 'vodafone', 'wind', 'fastweb',
    'internet', 'telefon', 'televisione', 'sky', 'netflix', 'spotify',
    'amazon prime',
  ],
  Health: [
    'farmacia', 'pharmacy', 'medico', 'ospedale', 'clinica', 'dentista',
    'ottica', 'palestra', 'gym', 'fitness',
  ],
  Entertainment: [
    'cinema', 'teatro', 'concerto', 'museo', 'netflix', 'spotify', 'steam',
    'playstation', 'xbox', 'giochi', 'games', 'festival',
  ],
  Travel: [
    'hotel', 'airbnb', 'booking', 'expedia', 'ryanair', 'easyjet', 'alitalia',
    'ita airways', 'agenzia viaggi', 'voli', 'aeroporto',
  ],
  Education: [
    'università', 'universita', 'libri', 'corso', 'udemy', 'coursera',
    'tasse universitarie', 'scuola',
  ],
  Income: [
    'stipendio', 'salary', 'bonifico in entrata', 'accredito stipendio',
    'rimborso', 'cashback', 'dividendo',
  ],
}

/**
 * Suggests a macro-category for a raw bank description/category.
 * Returns null if no suggestion can be made.
 */
export function suggestCategory(description: string, originalCategory?: string): string | null {
  const text = `${description} ${originalCategory ?? ''}`.toLowerCase()

  for (const [category, keywords] of Object.entries(KEYWORD_RULES)) {
    if (keywords.some(k => text.includes(k))) {
      return category
    }
  }

  return null
}

// ─── Mapping service ──────────────────────────────────────────────────────────

export class CategoryService {
  /** In-memory cache to avoid repeated DB reads during bulk imports */
  private cache = new Map<string, string>()

  /** Load all mappings into cache */
  async warm(): Promise<void> {
    const mappings = await categoryMappingRepository.getAll()
    for (const m of mappings) {
      this.cache.set(m.originalCategory, m.mappedCategory)
    }
  }

  invalidateCache(): void {
    this.cache.clear()
  }

  /**
   * Resolves the macro-category for a given original category.
   * Order: cache → DB → keyword suggestion → 'Uncategorized'
   */
  async resolve(originalCategory: string, description?: string): Promise<string> {
    const normalized = normalizeCategory(originalCategory)

    // 1. Cache hit
    if (this.cache.has(normalized)) {
      return this.cache.get(normalized)!
    }

    // 2. DB lookup
    const mapping = await categoryMappingRepository.getByOriginal(normalized)
    if (mapping) {
      this.cache.set(normalized, mapping.mappedCategory)
      return mapping.mappedCategory
    }

    // 3. Keyword suggestion
    const suggestion = suggestCategory(description ?? '', normalized)
    if (suggestion) {
      // Persist for next time
      await categoryMappingRepository.upsert(normalized, suggestion)
      this.cache.set(normalized, suggestion)
      return suggestion
    }

    return 'Uncategorized'
  }

  /**
   * Batch-resolves categories for an array of parsed transactions.
   * Applies auto-categorization and persists new mappings.
   */
  async batchResolve(
    transactions: ParsedTransaction[],
  ): Promise<Array<{ original: string; mapped: string }>> {
    // Collect unique original categories
    const unique = new Set(transactions.map(t => t.originalCategory))
    const resolved = new Map<string, string>()

    for (const original of unique) {
      const mapped = await this.resolve(original, '')
      resolved.set(original, mapped)
    }

    return transactions.map(t => ({
      original: t.originalCategory,
      mapped: resolved.get(t.originalCategory) ?? 'Uncategorized',
    }))
  }

  /** Manually set a mapping and persist it */
  async setMapping(originalCategory: string, mappedCategory: string): Promise<CategoryMapping> {
    const normalized = normalizeCategory(originalCategory)
    const mapping = await categoryMappingRepository.upsert(normalized, mappedCategory)
    this.cache.set(normalized, mappedCategory)
    return mapping
  }
}

export const categoryService = new CategoryService()
