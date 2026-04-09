import { describe, it, expect } from 'vitest'
import { suggestCategory } from '@/services/categoryService'
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
