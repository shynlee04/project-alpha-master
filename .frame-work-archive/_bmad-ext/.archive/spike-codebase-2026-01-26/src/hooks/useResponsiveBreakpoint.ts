/**
 * useResponsiveBreakpoint Hook
 * 
 * Detects the current responsive breakpoint (mobile, tablet, desktop)
 * based on window.innerWidth.
 */

import { useState, useEffect } from 'react'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

const BREAKPOINTS = {
  mobile: 768,  // < 768px
  tablet: 1024, // < 1024px
}

export function useResponsiveBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.mobile) {
        setBreakpoint('mobile')
      } else if (width < BREAKPOINTS.tablet) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    // Initial check
    checkBreakpoint()

    // Listen for resize events
    window.addEventListener('resize', checkBreakpoint)

    // Cleanup
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [])

  return breakpoint
}

/**
 * Hook to check if device is mobile specifically
 * Convenience wrapper around useResponsiveBreakpoint
 */
export function useIsMobile(): boolean {
  const breakpoint = useResponsiveBreakpoint()
  return breakpoint === 'mobile'
}

/**
 * Hook to check if device is in portrait orientation
 */
export function useIsPortrait(): boolean {
  const [isPortrait, setIsPortrait] = useState(true)

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)

    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  return isPortrait
}
