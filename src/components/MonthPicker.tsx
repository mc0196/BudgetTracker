import { useState, useRef, useEffect } from 'react'
import { addMonths, subMonths, format, parseISO } from 'date-fns'
import { useUIStore } from '@/store'
import { formatMonth, monthLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

/** Generates a list of months from `count` months ago up to today */
function buildMonthOptions(count = 36): string[] {
  const now = new Date()
  const months: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    months.push(format(subMonths(now, i), 'yyyy-MM'))
  }
  return months
}

export function MonthPicker() {
  const { selectedMonth, setSelectedMonth } = useUIStore()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentMonthStr = format(new Date(), 'yyyy-MM')

  const prev = () => {
    const d = subMonths(parseISO(`${selectedMonth}-01`), 1)
    setSelectedMonth(formatMonth(d))
  }

  const next = () => {
    const d = addMonths(parseISO(`${selectedMonth}-01`), 1)
    const future = format(d, 'yyyy-MM')
    if (future <= currentMonthStr) setSelectedMonth(future)
  }

  const isCurrentMonth = selectedMonth === currentMonthStr

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const months = buildMonthOptions(36)

  // Group by year for the dropdown
  const byYear: Record<string, string[]> = {}
  for (const m of months) {
    const y = m.slice(0, 4)
    if (!byYear[y]) byYear[y] = []
    byYear[y].push(m)
  }
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a))

  return (
    <div className="relative flex items-center gap-1" ref={dropdownRef}>
      {/* Prev arrow */}
      <button
        onClick={prev}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Mese precedente"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Month label — click to open dropdown */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-xl text-sm font-semibold transition-colors',
          open ? 'bg-primary-50 text-primary-600' : 'text-gray-800 hover:bg-gray-100',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="min-w-[110px] text-center">{monthLabel(selectedMonth)}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cn('w-4 h-4 text-gray-400 transition-transform', open && 'rotate-180')}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        disabled={isCurrentMonth}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Mese successivo"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          role="listbox"
        >
          <div className="max-h-72 overflow-y-auto p-3 space-y-3">
            {years.map(year => (
              <div key={year}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1.5">
                  {year}
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {byYear[year].map(month => {
                    const isSelected = month === selectedMonth
                    const isFuture = month > currentMonthStr
                    return (
                      <button
                        key={month}
                        disabled={isFuture}
                        onClick={() => {
                          setSelectedMonth(month)
                          setOpen(false)
                        }}
                        className={cn(
                          'py-1.5 rounded-xl text-xs font-medium transition-colors',
                          isSelected
                            ? 'bg-primary-500 text-white'
                            : isFuture
                            ? 'text-gray-200 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-100',
                        )}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {format(parseISO(`${month}-01`), 'MMM')}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
