import { ImportProgress, type ImportProgressState } from './ImportProgress'

/** Full-screen progress shown while the import is being written to the DB. */
export function CommittingScreen({ progress }: { progress: ImportProgressState | null }) {
  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Import</h1>
      <div className="flex flex-col items-center pt-12">
        <span className="text-5xl mb-4" aria-hidden>📥</span>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Saving your transactions</h2>
        <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Keep the app open — almost done</p>
        <div className="w-full max-w-sm">
          <ImportProgress label={progress?.label ?? 'Preparing…'} percent={progress?.percent ?? 0} />
        </div>
      </div>
    </div>
  )
}

/** Success screen after an import completes. */
export function DoneScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Import</h1>
      <div className="flex flex-col items-center gap-4 py-16 text-center animate-scale-in">
        <span className="text-5xl" aria-hidden>✅</span>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Import complete!</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">Your transactions have been saved.</p>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-2xl bg-primary-500 text-white text-sm font-semibold press-scale"
        >
          Import another file
        </button>
      </div>
    </div>
  )
}

const FORMATS = [
  { icon: '🏦', name: 'Intesa Sanpaolo', ext: 'CSV / XLS', note: 'Auto-detected' },
  { icon: '📄', name: 'Generic CSV', ext: 'CSV', note: 'Column mapping required' },
  { icon: '📊', name: 'Generic Excel', ext: 'XLSX / XLS', note: 'Column mapping required' },
]

/** Static list of supported bank formats shown on the idle screen. */
export function SupportedFormats() {
  return (
    <div className="mt-6 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Supported formats</h2>
      <div className="flex flex-col gap-2">
        {FORMATS.map(f => (
          <div key={f.name} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/[0.04] rounded-xl">
            <span className="text-2xl" aria-hidden>{f.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{f.name}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{f.ext}</p>
            </div>
            <span className="text-xs text-income dark:text-income-bright font-medium">{f.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
