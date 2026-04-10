import { Card } from '@/components/Card'
import { useCategoryMappings, useMacroCategories, useCategoryMutations } from '@/hooks/useCategories'
import { EmptyState } from '@/components/EmptyState'

export function CategoryMappings() {
  const mappings = useCategoryMappings()
  const categories = useMacroCategories()
  const { upsertMapping, deleteMapping } = useCategoryMutations()

  if (!mappings || !categories) return null

  if (mappings.length === 0) {
    return (
      <EmptyState
        icon="🗂️"
        title="No mappings yet"
        description="Import a bank statement to automatically generate category mappings"
      />
    )
  }

  return (
    <Card padding="none">
      {mappings.map((mapping, i) => (
        <div key={mapping.id}>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{mapping.originalCategory}</p>
              <select
                value={mapping.mappedCategory}
                onChange={e => upsertMapping(mapping.originalCategory, e.target.value)}
                className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-200 bg-transparent border-none outline-none w-full"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
                <option value="Uncategorized">❓ Uncategorized</option>
              </select>
            </div>
            <button
              onClick={() => deleteMapping(mapping.id)}
              className="flex-shrink-0 p-1.5 text-gray-300 dark:text-slate-600 hover:text-expense transition-colors rounded-lg"
              aria-label="Delete mapping"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {i < mappings.length - 1 && (
            <div className="mx-4 border-t border-gray-50 dark:border-white/[0.05]" />
          )}
        </div>
      ))}
    </Card>
  )
}
