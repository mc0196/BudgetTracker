import { useState, useEffect, useRef } from 'react'

/**
 * Animates a numeric value from 0 to `target` using easeOutQuart.
 * Re-triggers whenever `target` changes.
 */
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }

    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutQuart — fast start, smooth landing
      const eased = 1 - Math.pow(1 - progress, 4)
      setValue(target * eased)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setValue(target)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}
