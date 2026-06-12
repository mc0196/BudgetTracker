import { describe, it, expect } from 'vitest'
import { suggestCategoriesForInput, diceSimilarity } from '@/services/suggestionService'
import type { CategoryMapping, Transaction } from '@/types'

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: Math.random().toString(),
    amount: 50,
    type: 'expense',
    date: '2026-03-01',
    description: 'ESSELUNGA MILANO',
    originalCategory: 'Supermercati',
    mappedCategory: 'Food & Dining',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeMapping(original: string, mapped: string): CategoryMapping {
  return { id: Math.random().toString(), originalCategory: original, mappedCategory: mapped, createdAt: '' }
}

describe('diceSimilarity', () => {
  it('returns 1 for identical strings', () => {
    expect(diceSimilarity('netflix', 'netflix')).toBe(1)
  })

  it('returns 0 for completely different strings', () => {
    expect(diceSimilarity('abc', 'xyz')).toBe(0)
  })

  it('scores close strings higher than distant ones', () => {
    const close = diceSimilarity('esselunga', 'esselunga milano')
    const far = diceSimilarity('esselunga', 'farmacia rossi')
    expect(close).toBeGreaterThan(far)
  })
})

describe('suggestCategoriesForInput', () => {
  it('returns nothing for input shorter than 2 chars', () => {
    expect(suggestCategoriesForInput('e', [makeTx()])).toEqual([])
  })

  it('suggests the category of historical transactions with matching descriptions', () => {
    const txs = [makeTx(), makeTx(), makeTx({ description: 'FARMACIA ROSSI', mappedCategory: 'Health' })]
    const suggestions = suggestCategoriesForInput('esselunga', txs)
    expect(suggestions[0].category).toBe('Food & Dining')
    expect(suggestions[0].source).toBe('history')
  })

  it('matches case-insensitively and ignores accents', () => {
    const txs = [makeTx({ description: 'CAFFÈ VERGNANO', mappedCategory: 'Food & Dining' })]
    const suggestions = suggestCategoriesForInput('caffe', txs)
    expect(suggestions[0]?.category).toBe('Food & Dining')
  })

  it('matches partial input as a prefix while typing', () => {
    const txs = [makeTx({ description: 'NETFLIX.COM', mappedCategory: 'Entertainment' })]
    const suggestions = suggestCategoriesForInput('netf', txs)
    expect(suggestions[0]?.category).toBe('Entertainment')
  })

  it('uses saved category mappings as a signal', () => {
    const mappings = [makeMapping('Supermercati E Ipermercati', 'Food & Dining')]
    const suggestions = suggestCategoriesForInput('supermercato', [], mappings)
    expect(suggestions[0]?.category).toBe('Food & Dining')
    expect(suggestions[0]?.source).toBe('mapping')
  })

  it('falls back to keyword rules when there is no history', () => {
    const suggestions = suggestCategoriesForInput('trenitalia roma', [])
    expect(suggestions[0]?.category).toBe('Transport')
    expect(suggestions[0]?.source).toBe('keyword')
  })

  it('never suggests Uncategorized', () => {
    const txs = [makeTx({ description: 'BOH STRANO', mappedCategory: 'Uncategorized' })]
    const suggestions = suggestCategoriesForInput('boh strano', txs)
    expect(suggestions.find(s => s.category === 'Uncategorized')).toBeUndefined()
  })

  it('returns at most `max` suggestions ranked by score', () => {
    const txs = [
      makeTx({ description: 'BAR CENTRALE', mappedCategory: 'Food & Dining' }),
      makeTx({ description: 'BAR SPORT', mappedCategory: 'Entertainment' }),
      makeTx({ description: 'BARBIERE LUIGI', mappedCategory: 'Health' }),
      makeTx({ description: 'BARCLAYS FEE', mappedCategory: 'Other' }),
    ]
    const suggestions = suggestCategoriesForInput('bar', txs, [], 3)
    expect(suggestions.length).toBeLessThanOrEqual(3)
    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i - 1].score).toBeGreaterThanOrEqual(suggestions[i].score)
    }
  })
})
