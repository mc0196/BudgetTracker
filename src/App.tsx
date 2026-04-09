import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { DashboardPage } from '@/pages/DashboardPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { TransactionDetailPage } from '@/pages/TransactionDetailPage'
import { ChartsPage } from '@/pages/ChartsPage'
import { AddTransactionPage } from '@/pages/AddTransactionPage'
import { ImportPage } from '@/pages/ImportPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { macroCategoryRepository } from '@/db/repositories/categoryRepository'

export function App() {
  // Seed default macro-categories on first launch
  useEffect(() => {
    macroCategoryRepository.seedDefaults().catch(console.error)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Full-screen routes (no bottom nav) */}
        <Route path="/add" element={<AddTransactionPage />} />
        <Route path="/transactions/:id" element={<TransactionDetailPage />} />

        {/* Tabbed layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
