import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useCategoryStats } from '@/hooks/useAnalytics'
import { formatCurrency } from '@/lib/utils'
import { EmptyState } from '@/components/EmptyState'

interface SpendingPieChartProps {
  month: string
}

export function SpendingPieChart({ month }: SpendingPieChartProps) {
  const stats = useCategoryStats(month)
  const isDark = document.documentElement.classList.contains('dark')

  if (!stats || stats.length === 0) {
    return <EmptyState icon="🥧" title="No expense data" description="Import transactions to see spending breakdown" />
  }

  // Show top 6 categories, merge rest into "Other"
  const top = stats.slice(0, 6)
  const rest = stats.slice(6)
  const data =
    rest.length > 0
      ? [
          ...top,
          {
            category: 'Other',
            total: rest.reduce((s, c) => s + c.total, 0),
            count: rest.reduce((s, c) => s + c.count, 0),
            percentage: rest.reduce((s, c) => s + c.percentage, 0),
            color: '#9ca3af',
          },
        ]
      : top

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="total"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Spent']}
            contentStyle={{
              borderRadius: '12px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}`,
              backgroundColor: isDark ? '#1a1a28' : '#ffffff',
              color: isDark ? '#cbd5e1' : '#1f2937',
              boxShadow: isDark ? '0 8px 24px rgb(0 0 0 / 0.5)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2 mt-2">
        {data.map(entry => (
          <div key={entry.category} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700 dark:text-slate-300">{entry.category}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900 dark:text-slate-100 tabular-nums">
                {formatCurrency(entry.total)}
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
                {entry.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
