/**
 * @fileoverview Project Showcase Component
 * @module components/about/projects/ProjectShowcase
 * @governance EPIC-29-6
 *
 * Project showcase section featuring Via-gent and other projects.
 *
 * Story 29.6: Project Showcase Implementation
 */

import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import { Rocket } from 'lucide-react';
import { ViaGentCard } from './ViaGentCard';
import { cn } from '@/lib/utils';

export interface ProjectShowcaseProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function ProjectShowcase({ className }: ProjectShowcaseProps) {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  return (
    <section
      className={cn(
        'project-showcase bg-background',
        'py-12 md:py-16 lg:py-20',
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Rocket className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Featured Project
            </h2>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete browser-based development environment featuring local code execution,
            integrated AI agents, and real-time collaboration
          </p>
        </div>

        {/* Project Cards */}
        <div className={cn(
          'grid gap-8',
          // Single project for now, but prepared for multiple
          'grid-cols-1'
        )}>
          <ViaGentCard showArchitecture={false} />
        </div>

        {/* Architecture Diagram Placeholder */}
        {/* Will be enhanced in future iterations with interactive SVG */}
      </div>
    </section>
  );
}
