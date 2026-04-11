interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-3xl mb-1">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">{title}</h3>
      {description && (
        <p className="text-xs text-gray-400 dark:text-slate-500 max-w-[220px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
