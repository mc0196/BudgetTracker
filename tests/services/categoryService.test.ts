import { describe, it, expect } from 'vitest'
import { suggestCategory, suggestSubcategory } from '@/services/categoryService'
import { normalizeCategory } from '@/lib/utils'

describe('suggestCategory', () => {
  it('identifies supermarkets as Food & Dining', () => {
    expect(suggestCategory('ESSELUNGA SPA', 'spesa')).toBe('Food & Dining')
    expect(suggestCategory('CONAD SUPERMERCATO')).toBe('Food & Dining')
  })

  it('identifies transport', () => {
    expect(suggestCategory('TRENITALIA SPA')).toBe('Transport')
    expect(suggestCategory('TELEPASS AUTOSTRADE')).toBe('Transport')
    expect(suggestCategory('UBER ITALY')).toBe('Transport')
  })

  it('identifies streaming as Utilities', () => {
    expect(suggestCategory('NETFLIX.COM')).toBe('Utilities')
    expect(suggestCategory('SPOTIFY AB')).toBe('Utilities')
  })

  it('returns null for unrecognized descriptions', () => {
    expect(suggestCategory('RANDOM UNKNOWN MERCHANT XYZ')).toBeNull()
  })

  it('is case-insensitive', () => {
    expect(suggestCategory('esselunga spa')).toBe('Food & Dining')
    expect(suggestCategory('ESSELUNGA SPA')).toBe('Food & Dining')
  })

  it('uses both description and category for matching', () => {
    expect(suggestCategory('', 'supermercato')).toBe('Food & Dining')
  })
})

describe('suggestSubcategory', () => {
  it('suggests a subcategory within a known macro-category', () => {
    expect(suggestSubcategory('Housing', 'AFFITTO MENSILE')).toBe('Rent')
    expect(suggestSubcategory('Housing', 'RATA MUTUO CASA')).toBe('Mortgage')
    expect(suggestSubcategory('Food & Dining', 'ESSELUNGA SPA')).toBe('Groceries')
    expect(suggestSubcategory('Food & Dining', 'RISTORANTE DA MARIO')).toBe('Restaurants')
  })

  it('matches on the original category too, case-insensitively', () => {
    expect(suggestSubcategory('Transport', '', 'benzina eni')).toBe('Fuel')
  })

  it('returns null when no rule matches the macro-category', () => {
    expect(suggestSubcategory('Housing', 'SOMETHING UNRELATED')).toBeNull()
  })

  it('returns null for a macro-category without rules', () => {
    expect(suggestSubcategory('Other', 'affitto')).toBeNull()
  })
})

describe('normalizeCategory', () => {
  it('trims whitespace', () => {
    expect(normalizeCategory('  food  ')).toBe('Food')
  })

  it('title-cases the category', () => {
    expect(normalizeCategory('food and dining')).toBe('Food And Dining')
  })

  it('handles empty strings', () => {
    expect(normalizeCategory('')).toBe('')
  })
})
