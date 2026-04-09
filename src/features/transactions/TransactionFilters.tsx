import { useState } from 'react'
import { useUsedCategories } from '@/hooks/useCategories'
import type { TransactionFilters, TransactionType } from '@/types'
import { cn } from '@/lib/utils'

interface TransactionFiltersProps {
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
}

export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersProps) {
  const categories = useUsedCategories()
  const [searchInput, setSearchInput] = useState(filters.search ?? '')

  const setType = (type: TransactionType | undefined) => {
    onChange({ ...filters, type })
  }

  const setCategory = (category: string | undefined) => {
    onChange({ ...filters, category })
  }

  const handleSearch = (value: string) => {
    setSearchInput(value)
    onChange({ ...filters, search: value || undefined })
  }

  return (
    <div className="space-y-3 px-4 py-3 bg-white border-b border-gray-100">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          placeholder="Search transactions…"
          value={searchInput}
          onChange={e => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 text-sm border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-2">
        {(['all', 'income', 'expense'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t === 'all' ? undefined : t)}
            className={cn(
              'flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors',
              (t === 'all' && !filters.type) || filters.type === t
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-500',
            )}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Category filter */}
      {categories && categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setCategory(undefined)}
            className={cn(
              'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors',
              !filters.category
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-500',
            )}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat === filters.category ? undefined : cat)}
              className={cn(
                'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                filters.category === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-500',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
