import { useState } from 'react'
import { Card } from '@/components/Card'
import { useMacroCategories, useSubcategories, useCategoryMutations } from '@/hooks/useCategories'
import { MAX_SUBCATEGORIES_PER_CATEGORY } from '@/db/repositories/categoryRepository'
import type { MacroCategory, Subcategory } from '@/types'

const ICON_OPTIONS = ['🍽️', '🚗', '🛍️', '🏠', '💊', '🎬', '✈️', '💡', '💰', '📚', '📦', '❓', '🏋️', '🐾', '👶', '💳', '🎮']

export function MacroCategoryEditor() {
  const categories = useMacroCategories()
  const subcategories = useSubcategories()
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
              subcategories={(subcategories ?? []).filter(s => s.parentCategoryId === cat.id)}
              onDelete={() => deleteCategory(cat.id)}
            />
            {i < categories.length - 1 && (
              <div className="mx-4 border-t border-gray-50 dark:border-white/[0.05]" />
            )}
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
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary-400"
            />

            <div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mb-1.5">Icon</p>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewIcon(icon)}
                    className={`text-xl p-1 rounded-lg transition-colors ${
                      newIcon === icon
                        ? 'bg-primary-100 dark:bg-primary-400/20'
                        : 'hover:bg-gray-100 dark:hover:bg-white/[0.06]'
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
                className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-white/[0.1] text-sm text-gray-600 dark:text-slate-400"
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
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.1] text-sm font-medium text-gray-400 dark:text-slate-500 hover:border-primary-300 dark:hover:border-primary-400/50 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        >
          + Add category
        </button>
      )}
    </div>
  )
}

interface CategoryRowProps {
  category: MacroCategory
  subcategories: Subcategory[]
  onDelete: () => void
}

function CategoryRow({ category, subcategories, onDelete }: CategoryRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-xl" aria-hidden>{category.icon}</span>
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-1 flex items-center gap-2 min-w-0 text-left"
          aria-expanded={expanded}
        >
          <span className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{category.name}</span>
          {subcategories.length > 0 && (
            <span className="text-[11px] text-gray-400 dark:text-slate-500 shrink-0">
              {subcategories.length} sub
            </span>
          )}
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 text-gray-300 dark:text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-300 dark:text-slate-600 hover:text-expense transition-colors rounded-lg"
          aria-label={`Delete ${category.name}`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-3 pl-12">
          <SubcategoryManager parentCategoryId={category.id} subcategories={subcategories} />
        </div>
      )}
    </div>
  )
}

interface SubcategoryManagerProps {
  parentCategoryId: string
  subcategories: Subcategory[]
}

function SubcategoryManager({ parentCategoryId, subcategories }: SubcategoryManagerProps) {
  const { createSubcategory, updateSubcategory, deleteSubcategory } = useCategoryMutations()
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const atLimit = subcategories.length >= MAX_SUBCATEGORIES_PER_CATEGORY

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name || atLimit) return
    await createSubcategory(parentCategoryId, name)
    setNewName('')
    setIsAdding(false)
  }

  return (
    <div className="space-y-1.5">
      {subcategories.map(sub => (
        <SubcategoryRow
          key={sub.id}
          subcategory={sub}
          onRename={name => updateSubcategory(sub.id, { name })}
          onDelete={() => deleteSubcategory(sub.id)}
        />
      ))}

      {subcategories.length === 0 && !isAdding && (
        <p className="text-xs text-gray-400 dark:text-slate-500">No subcategories yet.</p>
      )}

      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            placeholder="Subcategory name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') setIsAdding(false)
            }}
            className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-xs text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary-400"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-medium disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="px-2 py-1.5 text-xs text-gray-500 dark:text-slate-400"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          disabled={atLimit}
          className="text-xs font-medium text-primary-500 dark:text-primary-400 disabled:text-gray-300 dark:disabled:text-slate-600 disabled:cursor-not-allowed"
        >
          {atLimit ? `Max ${MAX_SUBCATEGORIES_PER_CATEGORY} subcategories` : '+ Add subcategory'}
        </button>
      )}
    </div>
  )
}

interface SubcategoryRowProps {
  subcategory: Subcategory
  onRename: (name: string) => void
  onDelete: () => void
}

function SubcategoryRow({ subcategory, onRename, onDelete }: SubcategoryRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(subcategory.name)

  const commit = () => {
    const name = draft.trim()
    if (name && name !== subcategory.name) onRename(name)
    else setDraft(subcategory.name)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2">
      {editing ? (
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(subcategory.name)
              setEditing(false)
            }
          }}
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-xs text-gray-900 dark:text-slate-100 focus:outline-none focus:border-primary-400"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex-1 text-left text-xs text-gray-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04]"
        >
          {subcategory.name}
        </button>
      )}
      <button
        onClick={onDelete}
        className="p-1 text-gray-300 dark:text-slate-600 hover:text-expense transition-colors rounded-lg"
        aria-label={`Delete ${subcategory.name}`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}
