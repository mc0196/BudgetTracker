import { Link } from 'react-router-dom'

const STEPS = [
  { icon: '🏦', text: 'Import a bank statement (CSV or Excel) — Intesa Sanpaolo is auto-detected' },
  { icon: '🏷️', text: 'Review categories — your choices are remembered for future imports' },
  { icon: '📊', text: 'Track spending, budgets and trends, all offline on your device' },
]

/** First-launch empty state shown on the dashboard when there is no data yet. */
export function OnboardingHero() {
  return (
    <div className="animate-slide-up">
      <div className="rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 p-6 text-white shadow-lg shadow-primary-500/20">
        <p className="text-3xl mb-2" aria-hidden>👋</p>
        <h2 className="text-xl font-bold">Welcome to BudgetTracker</h2>
        <p className="text-sm text-white/80 mt-1 leading-relaxed">
          Your personal finances, tracked entirely on your device. No account, no cloud — it even works offline.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3.5 bg-white dark:bg-[#13131e] rounded-2xl border border-gray-100 dark:border-white/[0.07]"
          >
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 dark:bg-white/[0.06] flex items-center justify-center text-lg" aria-hidden>
              {step.icon}
            </span>
            <p className="text-sm text-gray-600 dark:text-slate-400 leading-snug">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2.5">
        <Link
          to="/import"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary-500 text-white text-base font-semibold shadow-lg shadow-primary-500/25 press-scale"
        >
          <span aria-hidden>📥</span> Import bank statement
        </Link>
        <Link
          to="/add"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white dark:bg-white/[0.06] text-gray-700 dark:text-slate-300 text-base font-semibold border border-gray-200 dark:border-white/[0.08] press-scale"
        >
          <span aria-hidden>✏️</span> Add a transaction manually
        </Link>
      </div>
    </div>
  )
}
