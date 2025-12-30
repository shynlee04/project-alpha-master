/**
 * @fileoverview Stats Bar Component
 * @module components/about/stats/StatsBar
 * @governance EPIC-29-3
 *
 * Horizontal bar displaying key statistics with animated counters.
 * Fixed position on desktop, horizontal scroll on mobile.
 *
 * Story 29.3: Stats Bar Implementation
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import { type StatItemProps, StatItem } from './StatItem';
import { cn } from '@/lib/utils';

export interface StatsBarProps {
  /**
   * Array of stat items to display
   */
  stats: Omit<StatItemProps, 'animatedValue'>[];

  /**
   * Whether to fix position on desktop (scroll following)
   */
  fixed?: boolean;

  /**
   * Animation duration in milliseconds for count-up
   */
  animationDuration?: number;

  /**
   * Delay before starting animation (ms)
   */
  animationDelay?: number;
}

/**
 * Animated counter hook
 * Animates a number value from 0 to target
 */
function useAnimatedCounter(
  target: number,
  duration: number,
  delay: number,
  isActive: boolean
): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrent(0);
      return;
    }

    // Delay animation start
    const timeoutId = setTimeout(() => {
      const startTime = Date.now();
      const startValue = 0;
      const endValue = target;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCurrent(startValue + (endValue - startValue) * easeOut);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCurrent(endValue);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [target, duration, delay, isActive]);

  return current;
}

export function StatsBar({
  stats,
  fixed = false,
  animationDuration = 2000,
  animationDelay = 0,
}: StatsBarProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll-into-view detection
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      {
        threshold: 0.3, // Trigger when 30% visible
        rootMargin: '0px 0px -100px 0px', // Offset for better UX
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div
      ref={ref}
      className={cn(
        'w-full bg-card border-y border-border',
        // Fixed positioning on desktop
        fixed && isDesktop && 'sticky top-0 z-10',
        // Shadow when fixed
        fixed && isDesktop && 'shadow-md'
      )}
    >
      {/* Mobile: Horizontal scroll */}
      <div
        className={cn(
          // Mobile and tablet: horizontal scroll container
          (isMobile || isTablet) && 'overflow-x-auto',
          // Desktop: centered container
          isDesktop && 'max-w-6xl mx-auto'
        )}
      >
        <div
          className={cn(
            // Grid layout
            'grid',
            // Mobile: horizontal cards with min-width
            (isMobile || isTablet) && 'grid-flow-col auto-cols-max gap-4 px-4 py-6',
            // Desktop: 4 columns
            isDesktop && 'grid-cols-4 gap-6 py-8'
          )}
        >
          {stats.map((stat) => {
            // Extract numeric value for animation
            const numericValue =
              typeof stat.value === 'number'
                ? stat.value
                : parseInt(String(stat.value).replace(/\D/g, '')) || 0;

            // Animate numeric values
            const animatedValue = useAnimatedCounter(
              numericValue,
              animationDuration,
              animationDelay,
              isVisible
            );

            // Preserve original format for display
            const displayValue =
              typeof stat.value === 'string' && stat.value.includes('+')
                ? (animatedValue > 0 ? animatedValue : 0) + '+'
                : stat.value;

            return (
              <StatItem
                key={stat.id}
                {...stat}
                value={displayValue}
                animatedValue={isVisible ? animatedValue : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Progress bar indicator (desktop only) */}
      {isDesktop && (
        <div className="h-1 bg-muted w-full overflow-hidden">
          <div
            className={cn(
              'h-full bg-gradient-to-r from-primary to-accent',
              'transition-all duration-1000 ease-out',
              isVisible ? 'w-full' : 'w-0'
            )}
          />
        </div>
      )}
    </div>
  );
}
