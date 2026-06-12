import { useMemo } from 'react'
import { useAllTransactions } from './useTransactions'
import { detectAnomalies, type AnomalyInfo } from '@/services/anomalyService'

/**
 * Anomaly map (transaction id → info) computed over the full history,
 * so a single transaction's "unusual" flag stays stable across filters.
 * undefined while loading.
 */
export function useAnomalies(): Map<string, AnomalyInfo> | undefined {
  const all = useAllTransactions()
  return useMemo(() => (all ? detectAnomalies(all) : undefined), [all])
}
