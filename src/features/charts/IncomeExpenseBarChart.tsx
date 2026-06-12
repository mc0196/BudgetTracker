import ReactECharts from 'echarts-for-react'
import { useMonthlySeriesForDateRange } from '@/hooks/useAnalytics'
import { formatCompact, formatCurrency, monthLabel } from '@/lib/utils'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useIsDark } from '@/hooks/useIsDark'
import type { DateRange } from '@/types'

interface IncomeExpenseBarChartProps {
  range: DateRange
}

export function IncomeExpenseBarChart({ range }: IncomeExpenseBarChartProps) {
  const series = useMonthlySeriesForDateRange(range)
  const isDark = useIsDark()

  if (series === undefined) {
    return <Skeleton className="h-[200px] rounded-2xl" />
  }

  if (series.length === 0 || series.every(s => s.transactionCount === 0)) {
    return <EmptyState icon="📊" title="No data yet" description="Import or add transactions to compare months" />
  }

  const data = series.map(s => ({
    name: monthLabel(s.month).split(' ')[0].slice(0, 3),
    income: s.totalIncome,
    expenses: s.totalExpenses,
  }))

  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'
  const labelColor = isDark ? '#64748b' : '#9ca3af'
  const tooltipBg = isDark ? '#1a1a28' : '#ffffff'
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'

  const option = {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 500,
    animationEasing: 'cubicOut' as const,
    grid: { top: 8, right: 8, bottom: 24, left: 44, containLabel: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' } },
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: { color: isDark ? '#cbd5e1' : '#1f2937', fontSize: 13 },
      formatter: (params: Array<{ seriesName: string; value: number; marker: string }>) =>
        params.map(p => `${p.marker} ${p.seriesName} &nbsp;<b>${formatCurrency(p.value)}</b>`).join('<br/>'),
      extraCssText: 'border-radius:12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); padding: 10px 14px;',
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: labelColor, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: labelColor, fontSize: 11, formatter: formatCompact },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: [
      {
        name: 'Income',
        type: 'bar',
        barMaxWidth: 14,
        barGap: '20%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#34d399' },
              { offset: 1, color: '#16a34a' },
            ],
          },
        },
        emphasis: { itemStyle: { opacity: 0.85 } },
        data: data.map(d => d.income),
      },
      {
        name: 'Expenses',
        type: 'bar',
        barMaxWidth: 14,
        barGap: '20%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#f87171' },
              { offset: 1, color: '#dc2626' },
            ],
          },
        },
        emphasis: { itemStyle: { opacity: 0.85 } },
        data: data.map(d => d.expenses),
      },
    ],
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-income" />
          <span className="text-xs text-gray-500 dark:text-slate-500 font-medium">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-expense" />
          <span className="text-xs text-gray-500 dark:text-slate-500 font-medium">Expenses</span>
        </div>
      </div>
      <ReactECharts
        option={option}
        style={{ height: 200 }}
        opts={{ renderer: 'canvas', devicePixelRatio: window.devicePixelRatio }}
        notMerge
      />
    </div>
  )
}
