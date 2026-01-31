/**
 * @fileoverview Skill Card Component
 * @module components/about/skills/SkillCard
 * @governance EPIC-29-5
 *
 * Individual skill card with name, level, years, and evidence.
 *
 * Story 29.5: Skills Matrix Implementation
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SkillLevel = 'expert' | 'advanced' | 'proficient' | 'learning';

export interface SkillCardProps {
  /**
   * Skill name
   */
  name: string;

  /**
   * Skill level
   */
  level: SkillLevel;

  /**
   * Years of experience
   */
  years?: number;

  /**
   * Project evidence (optional)
   */
  projectEvidence?: string;

  /**
   * Whether the card is expandable
   */
  expandable?: boolean;
}

/**
 * Get level color and label
 */
function getLevelInfo(level: SkillLevel) {
  switch (level) {
    case 'expert':
      return { color: 'bg-success', label: 'Expert', border: 'border-success' };
    case 'advanced':
      return { color: 'bg-primary', label: 'Advanced', border: 'border-primary' };
    case 'proficient':
      return { color: 'bg-info', label: 'Proficient', border: 'border-info' };
    case 'learning':
      return { color: 'bg-muted-foreground', label: 'Learning', border: 'border-muted-foreground' };
    default:
      return { color: 'bg-muted', label: 'Unknown', border: 'border-muted' };
  }
}

export function SkillCard({
  name,
  level,
  years,
  projectEvidence,
  expandable = false,
}: SkillCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const levelInfo = getLevelInfo(level);

  return (
    <div
      className={cn(
        'skill-card',
        'bg-card border border-border rounded-lg p-4',
        'transition-all duration-300 ease-in-out',
        'hover:shadow-md hover:border-primary/50'
      )}
    >
      {/* Header: Name + Level Badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm md:text-base font-semibold text-foreground flex-1">
          {name}
        </h3>
        <span
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            levelInfo.color,
            'text-background'
          )}
        >
          {levelInfo.label}
        </span>
      </div>

      {/* Years of Experience */}
      {years !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Experience</span>
            <span>{years} {years === 1 ? 'year' : 'years'}</span>
          </div>
          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out',
                level === 'expert' && 'w-full bg-success',
                level === 'advanced' && 'w-3/4 bg-primary',
                level === 'proficient' && 'w-1/2 bg-info',
                level === 'learning' && 'w-1/4 bg-muted-foreground'
              )}
            />
          </div>
        </div>
      )}

      {/* Expandable Project Evidence */}
      {expandable && projectEvidence && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-primary hover:underline mb-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Project evidence
              </>
            )}
          </button>
          {isExpanded && (
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">
              {projectEvidence}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
