/**
 * @fileoverview Journey Section Component
 * @module components/about/journey/JourneySection
 * @governance EPIC-29-4
 *
 * Professional journey section with background, transition, and value proposition cards.
 *
 * Story 29.4: Journey Section Implementation
 */

import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import { GraduationCap, Lightbulb, Target } from 'lucide-react';
import { JourneyCard } from './JourneyCard';
import { cn } from '@/lib/utils';

export interface JourneySectionProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function JourneySection({ className }: JourneySectionProps) {
  const { t } = useTranslation();
  const { isTablet, isDesktop } = useResponsive();

  return (
    <section
      className={cn(
        'journey-section bg-background',
        'py-12 md:py-16 lg:py-20',
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {t('about.journey.title', 'My Journey')}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('about.journey.subtitle', 'From Education Management to AI Agent Architecture')}
          </p>
        </div>

        {/* Opening Statement */}
        <div className="mb-8 md:mb-10 p-6 bg-card border border-border rounded-lg">
          <p className="text-sm md:text-base text-secondary-foreground leading-relaxed italic">
            {t('about.journey.opening')}
          </p>
        </div>

        {/* Journey Cards Grid */}
        <div
          className={cn(
            'grid gap-6',
            // Mobile: 1 column
            'grid-cols-1',
            // Tablet: 2 columns
            isTablet && 'md:grid-cols-2',
            // Desktop: 3 columns
            isDesktop && 'lg:grid-cols-3'
          )}
        >
          {/* Background Card */}
          <JourneyCard
            title={t('about.journey.background.title', 'Professional Background')}
            description={t('about.journey.background.description')}
            icon={GraduationCap}
            variant="background"
          />

          {/* Transition Card */}
          <JourneyCard
            title={t('about.journey.transition.title', 'Career Transformation')}
            description={t('about.journey.transition.description')}
            icon={Lightbulb}
            variant="transition"
          />

          {/* Value Proposition Card */}
          <JourneyCard
            title={t('about.journey.value.title', 'What I Bring')}
            description={t('about.journey.value.description')}
            icon={Target}
            variant="value"
          />
        </div>

        {/* Closing Statement */}
        <div className="mt-8 md:mt-10 text-center">
          <p className="text-sm md:text-base text-muted-foreground italic">
            {t('about.journey.closing')}
          </p>
        </div>
      </div>
    </section>
  );
}
