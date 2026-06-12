/**
 * Category suggestions for manual entry — pure functions, no side effects.
 *
 * Ranks macro-categories for a partially-typed description using:
 *   1. the user's transaction history (same/similar descriptions)
 *   2. saved CategoryMappings (fuzzy match on the original bank category)
 *   3. the static keyword rules (via categoryService.suggestCategory)
 */

import { suggestCategory } from './categoryService'
import type { CategoryMapping, Transaction } from '@/types'

export interface CategorySuggestion {
  category: string
  /** 0..1, higher = more confident */
  score: number
  source: 'history' | 'mapping' | 'keyword'
}

const MIN_INPUT_LENGTH = 2
/** Suggestions below this score are noise */
const MIN_SCORE = 0.3

function bigrams(text: string): Set<string> {
  const grams = new Set<string>()
  for (let i = 0; i < text.length - 1; i++) grams.add(text.slice(i, i + 2))
  return grams
}

/** Sørensen–Dice similarity over character bigrams, 0..1 */
export function diceSimilarity(a: string, b: string): number {
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0
  const gramsA = bigrams(a)
  const gramsB = bigrams(b)
  let overlap = 0
  for (const g of gramsA) if (gramsB.has(g)) overlap++
  return (2 * overlap) / (gramsA.size + gramsB.size)
}

const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g')

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '') // strip accents: "caffè" ≈ "caffe"
    .replace(/\s+/g, ' ')
    .trim()
}

/** Similarity of the typed input against a stored text (description / bank category) */
function matchScore(input: string, target: string): number {
  if (!target) return 0
  // Prefix / containment beats pure fuzzy while the user is still typing
  if (target.startsWith(input)) return 1
  if (target.includes(input)) return 0.9
  if (input.includes(target) && target.length >= 4) return 0.8
  return diceSimilarity(input, target)
}

/**
 * Returns up to `max` ranked category suggestions for a partial description.
 */
export function suggestCategoriesForInput(
  input: string,
  transactions: Transaction[],
  mappings: CategoryMapping[] = [],
  max = 3,
): CategorySuggestion[] {
  const query = normalize(input)
  if (query.length < MIN_INPUT_LENGTH) return []

  const scores = new Map<string, CategorySuggestion>()

  const consider = (category: string, score: number, source: CategorySuggestion['source']) => {
    if (!category || category === 'Uncategorized' || score < MIN_SCORE) return
    const existing = scores.get(category)
    if (!existing || score > existing.score) {
      scores.set(category, { category, score, source })
    }
  }

  // 1. Transaction history — strongest signal
  for (const t of transactions) {
    const score = matchScore(query, normalize(t.description))
    consider(t.mappedCategory, score, 'history')
  }

  // 2. Saved category mappings (bank category names)
  for (const m of mappings) {
    const score = matchScore(query, normalize(m.originalCategory)) * 0.9
    consider(m.mappedCategory, score, 'mapping')
  }

  // 3. Static keyword rules as fallback
  const keywordMatch = suggestCategory(input)
  if (keywordMatch) consider(keywordMatch, 0.5, 'keyword')

  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
}
