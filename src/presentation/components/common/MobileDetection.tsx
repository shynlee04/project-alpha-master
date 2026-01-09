/**
 * MobileDetection Component
 * 
 * A wrapper component that conditionally renders mobile or desktop
 * content based on the current responsive breakpoint.
 */

import { ReactNode, useState, useEffect } from 'react'
import { useResponsiveBreakpoint, Breakpoint } from '@/hooks/useResponsiveBreakpoint'

interface MobileDetectionProps {
  /** Content to render on mobile only */
  mobileOnly?: ReactNode
  /** Content to render on desktop/tablet only */
  desktopOnly?: ReactNode
  /** Content to render (shown when breakpoint doesn't match mobileOnly or desktopOnly) */
  children: ReactNode
  /** Custom breakpoint threshold (default: 768px) */
  breakpoint?: number
}

/**
 * Component that conditionally renders content based on device type
 */
export function MobileDetection({
  mobileOnly,
  desktopOnly,
  children,
  breakpoint = 768,
}: MobileDetectionProps) {
  const currentBreakpoint = useResponsiveBreakpoint()
  const isMobile = currentBreakpoint === 'mobile'

  if (isMobile && mobileOnly) {
    return <>{mobileOnly}</>
  }

  if (!isMobile && desktopOnly) {
    return <>{desktopOnly}</>
  }

  return <>{children}</>
}

/**
 * Hook-based approach for mobile detection
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}

/**
 * Higher-Order Component (HOC) for mobile-only components
 */
export function withMobileOnly<P extends object>(
  MobileComponent: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
) {
  return function WithMobileOnlyComponent(props: P) {
    const isMobile = useIsMobile()

    if (isMobile) {
      return <MobileComponent {...props} />
    }

    if (FallbackComponent) {
      return <FallbackComponent {...props} />
    }

    return null
  }
}

/**
 * Responsive container that switches layout based on breakpoint
 */
interface ResponsiveContainerProps {
  /** Mobile layout component */
  mobile: ReactNode
  /** Desktop layout component */
  desktop: ReactNode
  /** Breakpoint for switching (default: 768) */
  breakpoint?: number
}

export function ResponsiveContainer({
  mobile,
  desktop,
  breakpoint = 768,
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile(breakpoint)

  return <>{isMobile ? mobile : desktop}</>
}

/**
 * Breakpoint-aware content renderer
 */
interface BreakpointContentProps {
  /** Content for mobile (< 768px) */
  mobile?: ReactNode
  /** Content for tablet (768px - 1024px) */
  tablet?: ReactNode
  /** Content for desktop (>= 1024px) */
  desktop?: ReactNode
  /** Default content when no breakpoint matches */
  default?: ReactNode
}

export function BreakpointContent({
  mobile,
  tablet,
  desktop,
  default: defaultContent,
}: BreakpointContentProps) {
  const breakpoint = useResponsiveBreakpoint()

  switch (breakpoint) {
    case 'mobile':
      return mobile ?? defaultContent ?? null
    case 'tablet':
      return tablet ?? defaultContent ?? null
    case 'desktop':
      return desktop ?? defaultContent ?? null
    default:
      return defaultContent ?? null
  }
}

/**
 * Orientation-aware content renderer
 */
interface OrientationContentProps {
  /** Content for portrait orientation */
  portrait: ReactNode
  /** Content for landscape orientation */
  landscape: ReactNode
}

export function OrientationContent({ portrait, landscape }: OrientationContentProps) {
  const isPortrait = typeof window !== 'undefined' 
    ? window.innerHeight > window.innerWidth 
    : true

  return <>{isPortrait ? portrait : landscape}</>
}
