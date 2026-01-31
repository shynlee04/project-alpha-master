/**
 * EPIC_ID: 29
 * STORY_ID: 29-2
 * CREATED_AT: 2025-12-30T15:36:00Z
 * UPDATED_AT: 2025-12-30T16:06:00Z
 *
 * ScrollIndicator Component
 *
 * Animated scroll indicator with bounce animation.
 * Respects reduced motion preference and provides smooth scroll functionality.
 *
 * @example
 * ```tsx
 * <ScrollIndicator targetId="projects" />
 * ```
 */

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface ScrollIndicatorProps {
  /**
   * Scroll target element ID
   * Defaults to "stats-bar"
   */
  targetId?: string;
  
  /**
   * Animation enabled
   * Defaults to true
   */
  animate?: boolean;
}

/**
 * ScrollIndicator Component
 *
 * Displays an animated chevron-down icon that scrolls to a target element when clicked.
 * Respects user's reduced motion preference by disabling animations.
 *
 * @param props - Component props
 * @returns Button element with scroll functionality
 */
export function ScrollIndicator({
  targetId = 'stats-bar',
  animate = true
}: ScrollIndicatorProps) {
  const [respectsReducedMotion, setRespectsReducedMotion] = useState(false);

  /**
   * Check for reduced motion preference on mount and listen for changes
   * Updates state when preference changes
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setRespectsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setRespectsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * Smooth scroll to target element
   * Uses native scrollIntoView with smooth behavior
   */
  const handleScroll = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={handleScroll}
      className="scroll-indicator"
      aria-label="Scroll to next section"
      role="button"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
        padding: 'var(--spacing-mobile)',
        color: 'hsl(var(--muted-foreground))',
        opacity: respectsReducedMotion ? 1 : 0.6,
        transition: 'opacity 0.3s ease',
        animation: animate && !respectsReducedMotion 
          ? 'scroll-bounce 2s var(--animation-easing-8bit) infinite' 
          : 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = respectsReducedMotion ? '1' : '0.6';
      }}
    >
      <ChevronDown 
        size={24} 
        strokeWidth={2}
        style={{
          display: 'block',
        }}
      />
    </button>
  );
}