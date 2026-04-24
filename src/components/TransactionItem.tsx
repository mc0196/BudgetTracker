import { useRef, useState } from 'react'
import { truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/haptics'
import { PrivateAmount } from '@/components/PrivateAmount'
import type { Transaction } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': '🍽️',
  'Transport':     '🚗',
  'Shopping':      '🛍️',
  'Housing':       '🏠',
  'Health':        '💊',
  'Entertainment': '🎬',
  'Travel':        '✈️',
  'Utilities':     '💡',
  'Income':        '💰',
  'Education':     '📚',
  'Other':         '📦',
  'Uncategorized': '❓',
}

const SWIPE_REVEAL = -72   // px to reveal delete button
const SWIPE_DELETE = -160  // px to auto-trigger delete

interface TransactionItemProps {
  transaction: Transaction
  onClick?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
}

export function TransactionItem({ transaction, onClick, onDelete }: TransactionItemProps) {
  const { amount, type, description, mappedCategory, date } = transaction
  const isIncome = type === 'income'

  const [swipeX, setSwipeX] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHorizontal = useRef(false)

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontal.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    if (!isHorizontal.current && Math.abs(dx) < Math.abs(dy)) return

    if (Math.abs(dx) > 4) {
      isHorizontal.current = true
    }

    if (isHorizontal.current && dx < 0) {
      const base = isRevealed ? SWIPE_REVEAL : 0
      const next = Math.max(base + dx, SWIPE_DELETE)
      setSwipeX(next)
    }
  }

  const handleTouchEnd = () => {
    if (!isHorizontal.current) return

    if (swipeX < SWIPE_DELETE + 20 && onDelete) {
      haptics.error()
      setSwipeX(-500)
      setTimeout(() => onDelete(transaction.id), 180)
    } else if (swipeX < SWIPE_REVEAL / 2) {
      haptics.light()
      setSwipeX(SWIPE_REVEAL)
      setIsRevealed(true)
    } else {
      setSwipeX(0)
      setIsRevealed(false)
    }
  }

  const handleDeleteTap = () => {
    haptics.error()
    setSwipeX(-500)
    setTimeout(() => onDelete?.(transaction.id), 180)
  }

  const handleItemTap = () => {
    if (isRevealed) {
      setSwipeX(0)
      setIsRevealed(false)
      return
    }
    haptics.light()
    onClick?.(transaction)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Delete action — revealed on swipe */}
      {onDelete && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={handleDeleteTap}
            className="h-full px-5 bg-expense flex items-center justify-center"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Transaction row */}
      <button
        type="button"
        onClick={handleItemTap}
        onTouchStart={onDelete ? handleTouchStart : undefined}
        onTouchMove={onDelete ? handleTouchMove : undefined}
        onTouchEnd={onDelete ? handleTouchEnd : undefined}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swipeX === 0 || swipeX === SWIPE_REVEAL || swipeX <= -400
            ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'none',
        }}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#13131e]',
          'text-left',
          onClick && 'active:bg-gray-50 dark:active:bg-white/[0.04]',
        )}
      >
        {/* Category icon */}
        <span
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg',
            isIncome
              ? 'bg-income-light dark:bg-income-subtle'
              : 'bg-expense-light dark:bg-expense-subtle',
          )}
          aria-hidden
        >
          {CATEGORY_ICONS[mappedCategory] ?? (isIncome ? '↑' : '↓')}
        </span>

        {/* Description & category */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
            {truncate(description, 40)}
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500">{mappedCategory}</p>
        </div>

        {/* Amount & date */}
        <div className="flex-shrink-0 text-right">
          <PrivateAmount
            value={amount}
            prefix={isIncome ? '+' : '-'}
            className={cn(
              'text-sm font-semibold',
              isIncome
                ? 'text-income dark:text-income-bright'
                : 'text-expense dark:text-expense-bright',
            )}
          />
          <p className="text-xs text-gray-400 dark:text-slate-500">{dateLabel}</p>
        </div>
      </button>
    </div>
  )
}

export function TransactionDivider() {
  return <div className="mx-4 border-t border-gray-50 dark:border-white/[0.05]" />
}
