/**
 * @fileoverview Achievement Timeline Component
 * @module components/about/timeline/AchievementTimeline
 * @governance EPIC-29-7
 *
 * Timeline of career achievements with dates and metrics.
 *
 * Story 29.7: Achievement Timeline Implementation
 */

import { useTranslation } from 'react-i18next';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Achievement {
  id: string;
  date: string;
  title: string;
  description: string;
  metrics?: { label: string; value: string | number }[];
}

export interface AchievementTimelineProps {
  /**
   * Achievements to display
   */
  achievements?: Achievement[];
}

export function AchievementTimeline({ achievements }: AchievementTimelineProps) {
  const defaultAchievements: Achievement[] = [
    {
      id: 'bmad-design',
      date: '2025-01',
      title: 'BMAD Framework Design',
      description: 'Designed and implemented enterprise-grade multi-agent orchestration system',
      metrics: [
        { label: 'Agents', value: '15+' },
        { label: 'Lines of Code', value: '50K+' },
      ],
    },
    {
      id: 'via-gent-mvp',
      date: '2025-01',
      title: 'Via-gent MVP',
      description: 'Built full production system in under 1 month',
      metrics: [
        { label: 'Timeline', value: '<1 month' },
        { label: 'Features', value: '20+' },
      ],
    },
    {
      id: 'webcontainer-integration',
      date: '2024-12',
      title: 'WebContainer Integration',
      description: 'Browser-based IDE implementation with local code execution',
      metrics: [
        { label: 'Performance', value: 'A+' },
        { label: 'UX Score', value: '95+' },
      ],
    },
    {
      id: 'state-architecture',
      date: '2024-12',
      title: 'State Architecture',
      description: 'Zustand + Dexie unified state management system',
      metrics: [
        { label: 'Stores', value: '5+' },
        { label: 'Efficiency', value: '98%' },
      ],
    },
    {
      id: 'i18n-implementation',
      date: '2024-12',
      title: 'Internationalization',
      description: 'Full English and Vietnamese support with RTL capability',
      metrics: [
        { label: 'Languages', value: '2+' },
        { label: 'Coverage', value: '100%' },
      ],
    },
    {
      id: 'documentation-driven',
      date: '2024-12',
      title: 'Documentation-Driven Development',
      description: 'Comprehensive artifact system with ADRs and retrospectives',
      metrics: [
        { label: 'Artifacts', value: '100+' },
        { label: 'Quality', value: 'A+' },
      ],
    },
  ];

  const displayAchievements = achievements || defaultAchievements;

  return (
    <section className="achievement-timeline bg-background py-12 md:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Award className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Key Achievements
            </h2>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Milestones and metrics from the development journey
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-border transform md:-translate-x-1/2" />

          {/* Achievement Items */}
          <div className="space-y-8 md:space-y-12">
            {displayAchievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className={cn(
                  'relative md:grid md:grid-cols-2 md:gap-8',
                  // Alternating layout for desktop
                  index % 2 === 0 ? 'md:text-left' : 'md:text-right'
                )}
              >
                {/* Date Badge */}
                <div className={cn(
                  'mb-3 md:mb-0',
                  'flex items-center gap-3 md:gap-4'
                )}>
                  <div className="relative z-10">
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-background" />
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {achievement.date}
                  </div>
                </div>

                {/* Content */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {achievement.description}
                  </p>

                  {/* Metrics */}
                  {achievement.metrics && achievement.metrics.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {achievement.metrics.map((metric, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full"
                        >
                          <span className="text-xs text-muted-foreground">
                            {metric.label}:
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
