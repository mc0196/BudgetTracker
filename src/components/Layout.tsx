import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Toast } from './Toast'

export function Layout() {
  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      {/* Main content area — padded at bottom to clear nav bar */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <BottomNav />
      <Toast />
    </div>
  )
}
