/** Default emoji per macro-category, used where the MacroCategory record isn't loaded. */
export const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': '🍽️',
  'Transport':     '🚗',
  'Shopping':      '🛍️',
  'Housing':       '🏠',
  'Health':        '💊',
  'Entertainment': '🎬',
  'Travel':        '✈️',
  'Utilities':     '💡',
  'Income':        '💰',
  'Education':     '📚',
  'Other':         '📦',
  'Uncategorized': '❓',
}

export function categoryIcon(category: string, fallback = '📦'): string {
  return CATEGORY_ICONS[category] ?? fallback
}
