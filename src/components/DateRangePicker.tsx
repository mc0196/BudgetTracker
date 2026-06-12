import { useState } from 'react'
import { endOfMonth, startOfMonth, startOfYear, subMonths } from 'date-fns'
import { cn, formatDate } from '@/lib/utils'
import { haptics } from '@/lib/haptics'
import type { DateRange } from '@/types'

export type RangePreset = 'month' | 'lastMonth' | '3m' | '6m' | 'year' | 'custom'

const PRESETS: { id: Exclude<RangePreset, 'custom'>; label: string }[] = [
  { id: 'month', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
  { id: '3m', label: '3 months' },
  { id: '6m', label: '6 months' },
  { id: 'year', label: 'This year' },
]

export function presetRange(preset: Exclude<RangePreset, 'custom'>): DateRange {
  const now = new Date()
  switch (preset) {
    case 'month':
      return { start: formatDate(startOfMonth(now)), end: formatDate(endOfMonth(now)) }
    case 'lastMonth': {
      const prev = subMonths(now, 1)
      return { start: formatDate(startOfMonth(prev)), end: formatDate(endOfMonth(prev)) }
    }
    case '3m':
      return { start: formatDate(startOfMonth(subMonths(now, 2))), end: formatDate(endOfMonth(now)) }
    case '6m':
      return { start: formatDate(startOfMonth(subMonths(now, 5))), end: formatDate(endOfMonth(now)) }
    case 'year':
      return { start: formatDate(startOfYear(now)), end: formatDate(endOfMonth(now)) }
  }
}

interface DateRangePickerProps {
  value: DateRange
  preset: RangePreset
  onChange: (range: DateRange, preset: RangePreset) => void
}

export function DateRangePicker({ value, preset, onChange }: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(preset === 'custom')

  const selectPreset = (id: Exclude<RangePreset, 'custom'>) => {
    haptics.light()
    setShowCustom(false)
    onChange(presetRange(id), id)
  }

  const selectCustom = () => {
    haptics.light()
    setShowCustom(true)
    onChange(value, 'custom')
  }

  const updateCustom = (patch: Partial<DateRange>) => {
    let { start, end } = { ...value, ...patch }
    if (start && end && start > end) [start, end] = [end, start]
    onChange({ start, end }, 'custom')
  }

  return (
    <div>
      {/* Preset chips — horizontally scrollable */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1" role="tablist" aria-label="Date range">
        {PRESETS.map(p => (
          <Chip key={p.id} label={p.label} selected={preset === p.id && !showCustom} onClick={() => selectPreset(p.id)} />
        ))}
        <Chip label="Custom" selected={preset === 'custom' || showCustom} onClick={selectCustom} />
      </div>

      {/* Custom range inputs */}
      {showCustom && (
        <div className="flex items-center gap-2 mt-3 animate-slide-down">
          <RangeInput
            label="From"
            value={value.start}
            max={value.end}
            onChange={d => updateCustom({ start: d })}
          />
          <span className="text-gray-300 dark:text-slate-600" aria-hidden>→</span>
          <RangeInput
            label="To"
            value={value.end}
            min={value.start}
            onChange={d => updateCustom({ end: d })}
          />
        </div>
      )}
    </div>
  )
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={selected}
      className={cn(
        'flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 min-h-[44px]',
        selected
          ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
          : 'bg-white dark:bg-white/[0.06] text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-white/[0.06]',
      )}
    >
      {label}
    </button>
  )
}

function RangeInput({
  label, value, min, max, onChange,
}: { label: string; value: string; min?: string; max?: string; onChange: (date: string) => void }) {
  return (
    <label className="flex-1">
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500 mb-1 px-1">
        {label}
      </span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={e => e.target.value && onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-primary-400"
      />
    </label>
  )
}
