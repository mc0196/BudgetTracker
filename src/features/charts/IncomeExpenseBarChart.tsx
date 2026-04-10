import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useMonthSeries } from '@/hooks/useAnalytics'
import { formatCompact, monthLabel } from '@/lib/utils'
import { EmptyState } from '@/components/EmptyState'

export function IncomeExpenseBarChart() {
  const series = useMonthSeries(6)
  const isDark = document.documentElement.classList.contains('dark')

  if (!series || series.length === 0) {
    return <EmptyState icon="📊" title="No data yet" />
  }

  const data = series.map(s => ({
    name: monthLabel(s.month).split(' ')[0].slice(0, 3), // "Apr"
    income: s.totalIncome,
    expenses: s.totalExpenses,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'} vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickFormatter={formatCompact}
          width={40}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatCompact(value),
            name.charAt(0).toUpperCase() + name.slice(1),
          ]}
          contentStyle={{
            borderRadius: '12px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}`,
            backgroundColor: isDark ? '#1a1a28' : '#ffffff',
            color: isDark ? '#cbd5e1' : '#1f2937',
            boxShadow: isDark ? '0 4px 16px rgb(0 0 0 / 0.5)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
        />
        <Legend iconType="circle" iconSize={8} />
        <Bar dataKey="income" fill="#16a34a" name="Income" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#dc2626" name="Expenses" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
