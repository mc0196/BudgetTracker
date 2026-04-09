import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  name: string
  icon?: string
  color?: string
  size?: 'sm' | 'md'
  className?: string
}

export function CategoryBadge({ name, icon, size = 'sm', className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className,
      )}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {name}
    </span>
  )
}
