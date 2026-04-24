import { useMemo } from 'react'
import { subMonths, format } from 'date-fns'
import { useMonthlyStats, useCategoryStats, useMonthSeries } from '@/hooks/useAnalytics'
import { useBudgetProgress } from '@/hooks/useBudget'
import { useUIStore } from '@/store'
import { formatCurrency } from '@/lib/utils'

interface SpendingInsightsProps {
  month: string
}

interface Insight {
  icon: string
  text: string
  color: 'green' | 'red' | 'blue' | 'amber'
}

export function SpendingInsights({ month }: SpendingInsightsProps) {
  const stats        = useMonthlyStats(month)
  const categoryStats = useCategoryStats(month)
  const budgetProgress = useBudgetProgress(month)
  const series        = useMonthSeries(2)

  const privacyMode = useUIStore(s => s.privacyMode)

  const insights = useMemo<Insight[]>(() => {
    if (!stats) return []

    const list: Insight[] = []

    // 1. Month-over-month expense comparison
    const prevMonthStr = format(subMonths(new Date(`${month}-01`), 1), 'yyyy-MM')
    const prevStats = series.find(s => s.month === prevMonthStr)
    if (prevStats && prevStats.totalExpenses > 0 && stats.totalExpenses > 0) {
      const delta = ((stats.totalExpenses - prevStats.totalExpenses) / prevStats.totalExpenses) * 100
      if (Math.abs(delta) >= 5) {
        if (delta > 0) {
          list.push({
            icon: '📈',
            text: `Spending up ${delta.toFixed(0)}% vs last month (${formatCurrency(prevStats.totalExpenses)})`,
            color: 'red',
          })
        } else {
          list.push({
            icon: '📉',
            text: `Spending down ${Math.abs(delta).toFixed(0)}% vs last month — great job!`,
            color: 'green',
          })
        }
      }
    }

    // 2. Top spending category
    if (categoryStats && categoryStats.length > 0) {
      const top = categoryStats[0]
      list.push({
        icon: '🏆',
        text: `Top category: ${top.category} — ${formatCurrency(top.total)} (${top.percentage.toFixed(0)}% of expenses)`,
        color: 'blue',
      })
    }

    // 3. Budget status
    if (budgetProgress && budgetProgress.length > 0) {
      const total = budgetProgress.find(b => !b.budget.category)
      if (total) {
        const { progress } = total
        if (progress.isOver) {
          list.push({
            icon: '⚠️',
            text: `Over budget by ${formatCurrency(progress.spent - progress.limit)}`,
            color: 'red',
          })
        } else if (progress.percentage >= 80) {
          list.push({
            icon: '🎯',
            text: `${formatCurrency(progress.remaining)} left in budget (${(100 - progress.percentage).toFixed(0)}%)`,
            color: 'amber',
          })
        } else {
          list.push({
            icon: '✅',
            text: `On track — ${formatCurrency(progress.remaining)} remaining in budget`,
            color: 'green',
          })
        }
      }
    }

    // 4. Savings rate (if there's income)
    if (stats.totalIncome > 0 && stats.netBalance > 0) {
      const rate = (stats.netBalance / stats.totalIncome) * 100
      if (rate >= 10) {
        list.push({
          icon: '💎',
          text: `Saving ${rate.toFixed(0)}% of income this month`,
          color: 'green',
        })
      }
    }

    return list.slice(0, 3)
  }, [stats, categoryStats, budgetProgress, series, month])

  if (insights.length === 0 || privacyMode) return null

  const colorClasses: Record<Insight['color'], string> = {
    green: 'bg-income-light dark:bg-income-subtle text-income-dark dark:text-income-bright',
    red:   'bg-expense-light dark:bg-expense-subtle text-expense-dark dark:text-expense-bright',
    blue:  'bg-primary-50 dark:bg-primary-400/[0.10] text-primary-700 dark:text-primary-300',
    amber: 'bg-amber-50 dark:bg-amber-400/[0.10] text-amber-700 dark:text-amber-300',
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-600 px-1">
        Insights
      </p>
      {insights.map((insight, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 px-4 py-3 rounded-2xl ${colorClasses[insight.color]}`}
        >
          <span className="text-base flex-shrink-0 mt-px">{insight.icon}</span>
          <p className="text-sm font-medium leading-snug">{insight.text}</p>
        </div>
      ))}
    </div>
  )
}
