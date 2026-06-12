import { useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from './BottomNav'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' as const } },
}

export function Layout() {
  const location = useLocation()
  // Key on the top-level segment so /transactions/123 shares the same transition as /transactions
  const pageKey = '/' + (location.pathname.split('/')[1] ?? '')
  const mainRef = useRef<HTMLElement>(null)

  return (
    <div className="flex flex-col h-dvh bg-gray-50 dark:bg-[#0b0b13]">
      <main
        ref={mainRef}
        className="flex-1 min-h-0 overflow-y-auto pt-safe pb-24"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pageKey}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-full"
            onAnimationStart={() => { if (mainRef.current) mainRef.current.scrollTop = 0 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  )
}
