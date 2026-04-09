import { useState } from 'react'
import { Card } from '@/components/Card'
import { useMacroCategories, useCategoryMutations } from '@/hooks/useCategories'
import type { MacroCategory } from '@/types'

const ICON_OPTIONS = ['🍽️', '🚗', '🛍️', '🏠', '💊', '🎬', '✈️', '💡', '💰', '📚', '📦', '❓', '🏋️', '🐾', '👶', '💳', '🎮']

export function MacroCategoryEditor() {
  const categories = useMacroCategories()
  const { createCategory, deleteCategory } = useCategoryMutations()

  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('📦')
  const [newColor, setNewColor] = useState('indigo')

  const handleAdd = async () => {
    if (!newName.trim()) return
    await createCategory({ name: newName.trim(), icon: newIcon, color: newColor })
    setNewName('')
    setNewIcon('📦')
    setNewColor('indigo')
    setIsAdding(false)
  }

  if (!categories) return null

  return (
    <div className="space-y-3">
      <Card padding="none">
        {categories.map((cat, i) => (
          <div key={cat.id}>
            <CategoryRow
              category={cat}
              onDelete={() => deleteCategory(cat.id)}
            />
            {i < categories.length - 1 && <div className="mx-4 border-t border-gray-50" />}
          </div>
        ))}
      </Card>

      {isAdding ? (
        <Card>
          <div className="space-y-3">
            <input
              autoFocus
              type="text"
              placeholder="Category name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-400"
            />

            {/* Icon picker */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Icon</p>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewIcon(icon)}
                    className={`text-xl p-1 rounded-lg transition-colors ${
                      newIcon === icon ? 'bg-primary-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex-1 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium disabled:opacity-50"
              >
                Add category
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
        >
          + Add category
        </button>
      )}
    </div>
  )
}

interface CategoryRowProps {
  category: MacroCategory
  onDelete: () => void
}

function CategoryRow({ category, onDelete }: CategoryRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-xl" aria-hidden>{category.icon}</span>
      <span className="flex-1 text-sm font-medium text-gray-800">{category.name}</span>
      <button
        onClick={onDelete}
        className="p-1.5 text-gray-300 hover:text-expense transition-colors rounded-lg"
        aria-label={`Delete ${category.name}`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}
