import { useMemo } from 'react'
import { useAllTransactions } from './useTransactions'
import { detectRecurringTransactions, type RecurringItem } from '@/services/recurringService'

/** Recurring patterns detected over the full history. undefined while loading. */
export function useRecurring(): RecurringItem[] | undefined {
  const all = useAllTransactions()
  return useMemo(() => (all ? detectRecurringTransactions(all) : undefined), [all])
}
