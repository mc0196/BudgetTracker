import { useState } from 'react'
import { Card } from '@/components/Card'
import { DateRangePicker, presetRange, type RangePreset } from '@/components/DateRangePicker'
import { SpendingPieChart } from '@/features/charts/SpendingPieChart'
import { IncomeExpenseBarChart } from '@/features/charts/IncomeExpenseBarChart'
import { TimeSeriesChart } from '@/features/charts/TimeSeriesChart'
import type { DateRange } from '@/types'

export function ChartsPage() {
  const [preset, setPreset] = useState<RangePreset>('month')
  const [range, setRange] = useState<DateRange>(() => presetRange('month'))

  const handleRangeChange = (next: DateRange, nextPreset: RangePreset) => {
    setRange(next)
    setPreset(nextPreset)
  }

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 px-4 py-3.5 bg-gray-50/90 dark:bg-[#0b0b13]/90 backdrop-blur-xl border-b border-gray-100/60 dark:border-white/[0.05]">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Analytics</h1>
      </div>

      <div className="px-4 pt-4 space-y-4 pb-6">
        <DateRangePicker value={range} preset={preset} onChange={handleRangeChange} />

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base" aria-hidden>🍩</span>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Spending by Category</h2>
          </div>
          <SpendingPieChart range={range} />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base" aria-hidden>📊</span>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Income vs Expenses by Month</h2>
          </div>
          <IncomeExpenseBarChart range={range} />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base" aria-hidden>📈</span>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Activity Over Time</h2>
          </div>
          <TimeSeriesChart range={range} />
        </Card>
      </div>
    </div>
  )
}
