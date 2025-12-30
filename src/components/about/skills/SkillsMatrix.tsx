/**
 * @fileoverview Skills Matrix Component
 * @module components/about/skills/SkillsMatrix
 * @governance EPIC-29-5
 *
 * Complete skills matrix with 4 categories: Agentic Systems, Frontend, Backend, Process.
 *
 * Story 29.5: Skills Matrix Implementation
 */

import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import { Bot, Code, Server, GitBranch } from 'lucide-react';
import { SkillCategory, type Skill } from './SkillCategory';
import { type SkillLevel } from './SkillCard';
import { cn } from '@/lib/utils';

export interface SkillsMatrixProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function SkillsMatrix({ className }: SkillsMatrixProps) {
  const { t } = useTranslation();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Define all skills by category
  const skillsData = [
    {
      id: 'agentic',
      nameKey: t('about.skills.agentic', 'Agentic Systems'),
      descriptionKey: t('about.skills.agenticDesc', 'Multi-agent orchestration, LLM integration, BMAD framework'),
      icon: Bot,
      color: 'var(--primary)',
      skills: [
        { name: 'BMAD Framework', level: 'expert' as SkillLevel, years: 1, projectEvidence: 'Designed and implemented enterprise-grade BMAD V6 framework with 15+ specialized agent modes' },
        { name: 'Multi-Agent Orchestration', level: 'expert' as SkillLevel, years: 1, projectEvidence: 'Built production multi-agent system coordinating complex workflows with 15+ AI agents' },
        { name: 'LLM Integration', level: 'advanced' as SkillLevel, years: 1, projectEvidence: 'Integrated OpenAI, Anthropic, and Gemini models via TanStack AI SDK' },
        { name: 'TanStack AI', level: 'advanced' as SkillLevel, years: 1, projectEvidence: 'Leveraged TanStack AI SDK for provider-agnostic AI agent implementation' },
      ],
    },
    {
      id: 'frontend',
      nameKey: t('about.skills.frontend', 'Frontend Engineering'),
      descriptionKey: t('about.skills.frontendDesc', 'React 18, TypeScript, TanStack ecosystem'),
      icon: Code,
      color: 'var(--info)',
      skills: [
        { name: 'React 18', level: 'expert' as SkillLevel, years: 1, projectEvidence: 'Built complete IDE interface with React 18, hooks, and concurrent rendering' },
        { name: 'TypeScript', level: 'advanced' as SkillLevel, years: 1, projectEvidence: 'Full-stack TypeScript implementation with strict type safety' },
        { name: 'TanStack Router', level: 'advanced' as SkillLevel, years: 1, projectEvidence: 'File-based routing with type-safe navigation and code splitting' },
        { name: 'TailwindCSS + Radix UI', level: 'proficient' as SkillLevel, years: 1, projectEvidence: 'Implemented design system with TailwindCSS and accessible Radix UI components' },
      ],
    },
    {
      id: 'backend',
      nameKey: t('about.skills.backend', 'Backend Architecture'),
      descriptionKey: t('about.skills.backendDesc', 'WebContainer, IndexedDB, API design'),
      icon: Server,
      color: 'var(--success)',
      skills: [
        { name: 'WebContainer API', level: 'expert' as SkillLevel, years: 1, projectEvidence: 'Integrated StackBlitz WebContainer for browser-based code execution' },
        { name: 'IndexedDB + Dexie', level: 'advanced' as SkillLevel, years: 1, projectEvidence: 'Built complete IndexedDB persistence layer with Dexie ORM' },
        { name: 'File System Access API', level: 'advanced' as SkillLevel, years: 1, projectEvidence: 'Local-first file system with browser File System Access API' },
        { name: 'Vite + HMR', level: 'proficient' as SkillLevel, years: 1, projectEvidence: 'Fast development workflow with Vite and Hot Module Replacement' },
      ],
    },
    {
      id: 'process',
      nameKey: t('about.skills.process', 'Process & Methodology'),
      descriptionKey: t('about.skills.processDesc', 'Agile, Documentation, Testing'),
      icon: GitBranch,
      color: 'var(--accent)',
      skills: [
        { name: 'Agile/Scrum', level: 'expert' as SkillLevel, years: 5, projectEvidence: 'Led agile development cycles with sprint planning and retrospectives' },
        { name: 'Document-Driven Dev', level: 'expert' as SkillLevel, years: 1, projectEvidence: 'Comprehensive documentation with BMAD framework: architecture, specs, retrospectives' },
        { name: 'Testing', level: 'advanced' as SkillLevel, years: 1, projectEvidence: 'Unit, integration, and E2E testing with Vitest and Playwright' },
        { name: 'CI/CD', level: 'proficient' as SkillLevel, years: 1, projectEvidence: 'Automated build and deployment pipelines' },
      ],
    },
  ];

  return (
    <section
      className={cn(
        'skills-matrix bg-background',
        'py-12 md:py-16 lg:py-20',
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {t('about.skills.title', 'Technical Capabilities')}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('about.skills.subtitle', 'Full-stack expertise across agentic systems, frontend, backend, and process')}
          </p>
        </div>

        {/* Skills Grid */}
        <div
          className={cn(
            'grid gap-6 md:gap-8',
            // Mobile: 1 column
            'grid-cols-1',
            // Tablet: 2 columns
            isTablet && 'md:grid-cols-2',
            // Desktop: 2 columns (2x2 layout)
            isDesktop && 'lg:grid-cols-2'
          )}
        >
          {skillsData.map((category) => (
            <div
              key={category.id}
              className="bg-card border border-border rounded-lg p-6"
            >
              <SkillCategory
                {...category}
                showEvidence={isDesktop}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
