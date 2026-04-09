import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useDailySeries } from '@/hooks/useAnalytics'
import { formatCompact } from '@/lib/utils'
import { EmptyState } from '@/components/EmptyState'
import { format, parseISO } from 'date-fns'

interface TimeSeriesChartProps {
  month: string
}

export function TimeSeriesChart({ month }: TimeSeriesChartProps) {
  const series = useDailySeries(month)

  if (!series || series.length === 0) {
    return <EmptyState icon="📈" title="No data for this month" />
  }

  // Only show days that have activity to avoid sparse chart
  const data = series
    .filter(d => d.income > 0 || d.expenses > 0)
    .map(d => ({
      date: format(parseISO(d.date), 'd MMM'),
      expenses: d.expenses,
      income: d.income,
    }))

  if (data.length === 0) {
    return <EmptyState icon="📈" title="No transactions this month" />
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          interval="preserveStartEnd"
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
            border: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#dc2626"
          strokeWidth={2}
          dot={false}
          name="Expenses"
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
          name="Income"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
