import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { macroCategoryRepository } from '@/db/repositories/categoryRepository'

// Route-level code splitting — each page loads only when navigated to
const DashboardPage       = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const TransactionsPage    = lazy(() => import('@/pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })))
const TransactionDetailPage = lazy(() => import('@/pages/TransactionDetailPage').then(m => ({ default: m.TransactionDetailPage })))
const ChartsPage          = lazy(() => import('@/pages/ChartsPage').then(m => ({ default: m.ChartsPage })))
const AddTransactionPage  = lazy(() => import('@/pages/AddTransactionPage').then(m => ({ default: m.AddTransactionPage })))
const ImportPage          = lazy(() => import('@/pages/ImportPage').then(m => ({ default: m.ImportPage })))
const SettingsPage        = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-white/[0.1] border-t-primary-500 animate-spin" />
    </div>
  )
}

export function App() {
  useEffect(() => {
    macroCategoryRepository.seedDefaults().catch(console.error)
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
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
      </Suspense>
    </BrowserRouter>
  )
}
