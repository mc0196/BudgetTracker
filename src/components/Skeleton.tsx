import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-100 dark:bg-white/[0.07] rounded-xl',
        className,
      )}
    />
  )
}

export function SkeletonTransactionRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className="h-3.5 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-1/3 rounded-lg" />
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <Skeleton className="h-3.5 w-14 rounded-lg" />
        <Skeleton className="h-3 w-9 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonMonthlyOverview() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[92px] rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-[80px] rounded-2xl" />
        <Skeleton className="h-[80px] rounded-2xl" />
      </div>
    </div>
  )
}

export function SkeletonRecentList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-[#13131e] rounded-2xl border border-gray-100 dark:border-white/[0.07] overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <Skeleton className="h-4 w-16 rounded-lg" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <SkeletonTransactionRow />
          {i < rows - 1 && (
            <div className="mx-4 border-t border-gray-50 dark:border-white/[0.05]" />
          )}
        </div>
      ))}
    </div>
  )
}
