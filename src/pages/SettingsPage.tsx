import { useState } from 'react'
import { CategoryMappings } from '@/features/settings/CategoryMappings'
import { MacroCategoryEditor } from '@/features/settings/MacroCategoryEditor'
import { ImportHistory } from '@/features/settings/ImportHistory'
import { BudgetSettings } from '@/features/settings/BudgetSettings'
import { DataSettings } from '@/features/settings/DataSettings'
import { AppearanceSettings } from '@/features/settings/AppearanceSettings'
import { haptics } from '@/lib/haptics'

type SettingsTab = 'categories' | 'mappings' | 'budget' | 'imports' | 'app'

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'categories', label: 'Categories' },
  { id: 'mappings', label: 'Mappings' },
  { id: 'budget', label: 'Budget' },
  { id: 'imports', label: 'Imports' },
  { id: 'app', label: 'App & Data' },
]

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('categories')

  const handleTab = (id: SettingsTab) => {
    haptics.light()
    setTab(id)
  }

  return (
    <div>
      <div className="sticky top-0 z-10 px-4 py-4 bg-white/90 dark:bg-[#13131e]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.08]">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
      </div>

      {/* Tab bar — scrollable pills */}
      <div
        className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide bg-white dark:bg-[#13131e] border-b border-gray-100 dark:border-white/[0.08]"
        role="tablist"
        aria-label="Settings sections"
      >
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => handleTab(t.id)}
            role="tab"
            aria-selected={tab === t.id}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 min-h-[40px] ${
              tab === t.id
                ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                : 'bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={tab} className="px-4 py-4 animate-fade-in">
        {tab === 'categories' && <MacroCategoryEditor />}
        {tab === 'mappings' && <CategoryMappings />}
        {tab === 'budget' && <BudgetSettings />}
        {tab === 'imports' && <ImportHistory />}
        {tab === 'app' && (
          <div className="space-y-3">
            <AppearanceSettings />
            <DataSettings />
          </div>
        )}
      </div>
    </div>
  )
}
