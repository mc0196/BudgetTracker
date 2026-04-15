import ReactECharts from 'echarts-for-react'
import { useDailySeries } from '@/hooks/useAnalytics'
import { formatCompact, formatCurrency } from '@/lib/utils'
import { EmptyState } from '@/components/EmptyState'
import { useIsDark } from '@/hooks/useIsDark'
import { format, parseISO } from 'date-fns'

interface TimeSeriesChartProps {
  month: string
}

export function TimeSeriesChart({ month }: TimeSeriesChartProps) {
  const series = useDailySeries(month)
  const isDark = useIsDark()

  if (!series || series.length === 0) {
    return <EmptyState icon="📈" title="No data for this month" />
  }

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

  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'
  const labelColor = isDark ? '#64748b' : '#9ca3af'
  const tooltipBg = isDark ? '#1a1a28' : '#ffffff'
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'

  const option = {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 600,
    animationEasing: 'cubicOut' as const,
    grid: { top: 8, right: 8, bottom: 24, left: 44, containLabel: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: { color: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', width: 1, type: 'dashed' },
      },
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
      data: data.map(d => d.date),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: labelColor, fontSize: 11, interval: 'auto' },
      boundaryGap: false,
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
        name: 'Expenses',
        type: 'line',
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: data.length <= 10,
        lineStyle: { width: 2, color: '#f87171' },
        itemStyle: { color: '#f87171', borderWidth: 2, borderColor: isDark ? '#13131e' : '#fff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(248,113,113,0.25)' },
              { offset: 1, color: 'rgba(248,113,113,0.0)' },
            ],
          },
        },
        data: data.map(d => d.expenses),
      },
      {
        name: 'Income',
        type: 'line',
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: data.length <= 10,
        lineStyle: { width: 2, color: '#34d399' },
        itemStyle: { color: '#34d399', borderWidth: 2, borderColor: isDark ? '#13131e' : '#fff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(52,211,153,0.20)' },
              { offset: 1, color: 'rgba(52,211,153,0.0)' },
            ],
          },
        },
        data: data.map(d => d.income),
      },
    ],
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f87171' }} />
          <span className="text-xs text-gray-500 dark:text-slate-500 font-medium">Expenses</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#34d399' }} />
          <span className="text-xs text-gray-500 dark:text-slate-500 font-medium">Income</span>
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
