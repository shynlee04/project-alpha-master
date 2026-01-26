/**
 * @fileoverview Skill Category Component
 * @module components/about/skills/SkillCategory
 * @governance EPIC-29-5
 *
 * Category grouping for skills with icon, name, and skill cards.
 *
 * Story 29.5: Skills Matrix Implementation
 */

import { type LucideIcon } from 'lucide-react';
import { SkillCard, type SkillLevel } from './SkillCard';

export interface Skill {
  name: string;
  level: SkillLevel;
  years?: number;
  projectEvidence?: string;
}

export interface SkillCategoryProps {
  /**
   * Category ID
   */
  id: string;

  /**
   * Category name (translation key)
   */
  nameKey: string;

  /**
   * Category description (translation key)
   */
  descriptionKey: string;

  /**
   * Icon component
   */
  icon: LucideIcon;

  /**
   * Color for icon and accent
   */
  color?: string;

  /**
   * Skills in this category
   */
  skills: Skill[];

  /**
   * Whether to show project evidence
   */
  showEvidence?: boolean;
}

export function SkillCategory({
  id,
  nameKey,
  descriptionKey,
  icon: Icon,
  color = 'var(--primary)',
  skills,
  showEvidence = false,
}: SkillCategoryProps) {
  return (
    <div className="skill-category">
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="p-2 rounded-lg bg-muted"
          style={{ color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-foreground">
            {nameKey}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            {descriptionKey}
          </p>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {skills.map((skill, index) => (
          <SkillCard
            key={`${id}-${skill.name}-${index}`}
            {...skill}
            expandable={showEvidence}
          />
        ))}
      </div>
    </div>
  );
}
