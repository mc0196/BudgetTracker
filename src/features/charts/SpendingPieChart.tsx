import ReactECharts from 'echarts-for-react'
import { useCategoryStatsForRange } from '@/hooks/useAnalytics'
import { formatCurrency } from '@/lib/utils'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useIsDark } from '@/hooks/useIsDark'
import type { DateRange } from '@/types'

interface SpendingPieChartProps {
  range: DateRange
}

export function SpendingPieChart({ range }: SpendingPieChartProps) {
  const stats = useCategoryStatsForRange(range)
  const isDark = useIsDark()

  if (stats === undefined) {
    return <Skeleton className="h-[220px] rounded-2xl" />
  }

  if (stats.length === 0) {
    return (
      <EmptyState
        icon="🍩"
        title="No expenses in this period"
        description="Try a wider date range, or import a bank statement"
      />
    )
  }

  const top = stats.slice(0, 6)
  const rest = stats.slice(6)
  const data = rest.length > 0
    ? [
        ...top,
        {
          category: 'Other',
          total: rest.reduce((s, c) => s + c.total, 0),
          count: rest.reduce((s, c) => s + c.count, 0),
          percentage: rest.reduce((s, c) => s + c.percentage, 0),
          color: '#64748b',
        },
      ]
    : top

  const tooltipBg = isDark ? '#1a1a28' : '#ffffff'
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'

  const option = {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 600,
    animationEasing: 'cubicOut' as const,
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: { color: isDark ? '#cbd5e1' : '#1f2937', fontSize: 13 },
      formatter: (params: { name: string; value: number; percent: number }) =>
        `<b>${params.name}</b><br/>${formatCurrency(params.value)} &nbsp;<span style="opacity:0.5">${params.percent.toFixed(0)}%</span>`,
      extraCssText: 'border-radius:12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); padding: 10px 14px;',
    },
    series: [
      {
        type: 'pie',
        radius: ['48%', '78%'],
        center: ['50%', '50%'],
        padAngle: 3,
        itemStyle: { borderRadius: 8 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.4)',
          },
        },
        data: data.map(d => ({
          name: d.category,
          value: d.total,
          itemStyle: { color: d.color },
        })),
      },
    ],
  }

  return (
    <div>
      <ReactECharts
        option={option}
        style={{ height: 220 }}
        opts={{ renderer: 'canvas', devicePixelRatio: window.devicePixelRatio }}
        notMerge
      />

      {/* Custom legend */}
      <div className="space-y-2 mt-1">
        {data.map(entry => (
          <div key={entry.category} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700 dark:text-slate-300">{entry.category}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 tabular-nums">
                {formatCurrency(entry.total)}
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-600 tabular-nums w-8 text-right">
                {entry.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
