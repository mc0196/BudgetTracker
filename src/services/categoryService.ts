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
 * Cold-start keyword rules for subcategories, grouped by macro-category.
 * Used to pre-suggest a subcategory on the very first import, before the
 * learning table has anything to reapply. Best-effort: the suggested name
 * is stored by-name and matches the default English subcategory labels.
 */
const SUBCATEGORY_KEYWORD_RULES: Record<string, Array<{ subcategory: string; keywords: string[] }>> = {
  'Food & Dining': [
    { subcategory: 'Groceries', keywords: ['supermercato', 'esselunga', 'carrefour', 'lidl', 'aldi', 'conad', 'coop'] },
    { subcategory: 'Restaurants', keywords: ['restaurant', 'ristorante', 'pizzeria', 'trattoria', 'osteria', 'sushi', 'mcdonald', 'burger', 'paninoteca'] },
    { subcategory: 'Cafés', keywords: ['bar ', 'caffe', 'caffè', 'gelat'] },
  ],
  Transport: [
    { subcategory: 'Fuel', keywords: ['benzina', 'carburante', 'eni', 'agip', 'q8', 'tamoil'] },
    { subcategory: 'Public Transit', keywords: ['atm', 'atac', 'trenitalia', 'italo', 'frecciarossa', 'bus', 'metro'] },
    { subcategory: 'Parking', keywords: ['parcheggio', 'parking', 'autostrada', 'telepass'] },
  ],
  Shopping: [
    { subcategory: 'Clothing', keywords: ['abbigliamento', 'h&m', 'zara', 'primark', 'zalando'] },
    { subcategory: 'Electronics', keywords: ['mediaworld', 'unieuro'] },
    { subcategory: 'Home', keywords: ['ikea'] },
  ],
  Housing: [
    { subcategory: 'Rent', keywords: ['affitto', 'rent'] },
    { subcategory: 'Mortgage', keywords: ['mutuo'] },
    { subcategory: 'Maintenance', keywords: ['condominio', 'immobiliare'] },
  ],
  Health: [
    { subcategory: 'Pharmacy', keywords: ['farmacia', 'pharmacy'] },
    { subcategory: 'Doctor', keywords: ['medico', 'ospedale', 'clinica', 'dentista', 'ottica'] },
    { subcategory: 'Fitness', keywords: ['palestra', 'gym', 'fitness'] },
  ],
  Entertainment: [
    { subcategory: 'Streaming', keywords: ['netflix', 'spotify'] },
    { subcategory: 'Events', keywords: ['cinema', 'teatro', 'concerto', 'museo', 'festival'] },
    { subcategory: 'Games', keywords: ['steam', 'playstation', 'xbox', 'giochi', 'games'] },
  ],
  Travel: [
    { subcategory: 'Flights', keywords: ['ryanair', 'easyjet', 'alitalia', 'ita airways', 'voli', 'aeroporto'] },
    { subcategory: 'Hotels', keywords: ['hotel', 'airbnb', 'booking', 'expedia'] },
  ],
  Utilities: [
    { subcategory: 'Electricity', keywords: ['enel', 'a2a', 'luce'] },
    { subcategory: 'Internet', keywords: ['tim', 'vodafone', 'wind', 'fastweb', 'internet', 'telefon'] },
    { subcategory: 'Water', keywords: ['acqua'] },
  ],
  Income: [
    { subcategory: 'Salary', keywords: ['stipendio', 'salary', 'accredito stipendio'] },
    { subcategory: 'Refunds', keywords: ['rimborso', 'cashback'] },
    { subcategory: 'Investments', keywords: ['dividendo'] },
  ],
  Education: [
    { subcategory: 'Courses', keywords: ['corso', 'udemy', 'coursera'] },
    { subcategory: 'Books', keywords: ['libri'] },
    { subcategory: 'Tuition', keywords: ['università', 'universita', 'tasse universitarie', 'scuola'] },
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

/**
 * Suggests a subcategory within a known macro-category, using cold-start
 * keyword rules. Returns null when no rule matches (subcategory stays empty
 * until the user assigns one, which is then learned).
 */
export function suggestSubcategory(
  macroCategory: string,
  description: string,
  originalCategory?: string,
): string | null {
  const rules = SUBCATEGORY_KEYWORD_RULES[macroCategory]
  if (!rules) return null
  const text = `${description} ${originalCategory ?? ''}`.toLowerCase()

  for (const { subcategory, keywords } of rules) {
    if (keywords.some(k => text.includes(k))) {
      return subcategory
    }
  }

  return null
}

// ─── Mapping service ──────────────────────────────────────────────────────────

/** Result of resolving a raw bank category to the internal taxonomy. */
export interface ResolvedCategory {
  mapped: string
  subcategory?: string
}

export class CategoryService {
  /** In-memory cache to avoid repeated DB reads during bulk imports */
  private cache = new Map<string, ResolvedCategory>()

  /** Load all mappings into cache */
  async warm(): Promise<void> {
    const mappings = await categoryMappingRepository.getAll()
    for (const m of mappings) {
      this.cache.set(m.originalCategory, {
        mapped: m.mappedCategory,
        subcategory: m.mappedSubcategory,
      })
    }
  }

  invalidateCache(): void {
    this.cache.clear()
  }

  /**
   * Resolves the macro-category (and learned/suggested subcategory) for a
   * given original category.
   * Order: cache → DB → keyword suggestion → 'Uncategorized'
   */
  async resolve(originalCategory: string, description?: string): Promise<ResolvedCategory> {
    const normalized = normalizeCategory(originalCategory)

    // 1. Cache hit
    if (this.cache.has(normalized)) {
      return this.cache.get(normalized)!
    }

    // 2. DB lookup — replays previously learned macro + subcategory
    const mapping = await categoryMappingRepository.getByOriginal(normalized)
    if (mapping) {
      const resolved: ResolvedCategory = {
        mapped: mapping.mappedCategory,
        subcategory: mapping.mappedSubcategory,
      }
      this.cache.set(normalized, resolved)
      return resolved
    }

    // 3. Keyword suggestion (cold start) for both macro and subcategory
    const suggestion = suggestCategory(description ?? '', normalized)
    if (suggestion) {
      const subSuggestion = suggestSubcategory(suggestion, description ?? '', normalized) ?? undefined
      // Persist for next time
      await categoryMappingRepository.upsert(normalized, suggestion, subSuggestion)
      const resolved: ResolvedCategory = { mapped: suggestion, subcategory: subSuggestion }
      this.cache.set(normalized, resolved)
      return resolved
    }

    return { mapped: 'Uncategorized' }
  }

  /**
   * Batch-resolves categories for an array of parsed transactions.
   * Applies auto-categorization and persists new mappings.
   */
  async batchResolve(
    transactions: ParsedTransaction[],
  ): Promise<Array<{ original: string; mapped: string; subcategory?: string }>> {
    // Collect unique original categories
    const unique = new Set(transactions.map(t => t.originalCategory))
    const resolved = new Map<string, ResolvedCategory>()

    for (const original of unique) {
      resolved.set(original, await this.resolve(original, ''))
    }

    return transactions.map(t => {
      const r = resolved.get(t.originalCategory)
      return {
        original: t.originalCategory,
        mapped: r?.mapped ?? 'Uncategorized',
        subcategory: r?.subcategory,
      }
    })
  }

  /**
   * Manually set a mapping and persist it. Passing `mappedSubcategory`
   * teaches the subcategory so it is reapplied on future imports.
   * (omitted → preserve learned value; '' → clear it)
   */
  async setMapping(
    originalCategory: string,
    mappedCategory: string,
    mappedSubcategory?: string,
  ): Promise<CategoryMapping> {
    const normalized = normalizeCategory(originalCategory)
    const mapping = await categoryMappingRepository.upsert(
      normalized,
      mappedCategory,
      mappedSubcategory,
    )
    this.cache.set(normalized, {
      mapped: mapping.mappedCategory,
      subcategory: mapping.mappedSubcategory,
    })
    return mapping
  }
}

export const categoryService = new CategoryService()
