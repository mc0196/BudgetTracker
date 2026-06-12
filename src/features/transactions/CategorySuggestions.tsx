import { useCategorySuggestions } from '@/hooks/useCategorySuggestions'
import { useMacroCategories } from '@/hooks/useCategories'
import { categoryIcon } from '@/lib/categoryIcons'
import { haptics } from '@/lib/haptics'

interface CategorySuggestionsProps {
  description: string
  /** Currently selected category — suggestions matching it are hidden */
  selected: string
  onSelect: (category: string) => void
}

/** Tappable category chips shown while typing a transaction description. */
export function CategorySuggestions({ description, selected, onSelect }: CategorySuggestionsProps) {
  const suggestions = useCategorySuggestions(description)
  const categories = useMacroCategories()

  const visible = suggestions.filter(s => s.category !== selected)
  if (visible.length === 0) return null

  const iconFor = (name: string) =>
    categories?.find(c => c.name === name)?.icon ?? categoryIcon(name)

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide animate-fade-in" aria-label="Suggested categories">
      <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-600">
        Suggested
      </span>
      {visible.map(s => (
        <button
          key={s.category}
          onClick={() => {
            haptics.light()
            onSelect(s.category)
          }}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-50 dark:bg-primary-400/[0.12] text-primary-700 dark:text-primary-300 text-xs font-semibold press-scale min-h-[36px]"
        >
          <span aria-hidden>{iconFor(s.category)}</span>
          {s.category}
        </button>
      ))}
    </div>
  )
}
