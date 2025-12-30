import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { User } from 'lucide-react';
import { StatsBar } from './stats';
import { JourneySection } from './journey';
import { SkillsMatrix } from './skills';
import { ProjectShowcase } from './projects';
import { AchievementTimeline } from './timeline';
import { ContactSection } from './contact';
import './AboutPage.css';

/**
 * AboutPage Component
 *
 * A professional "About Me" page with 8-bit gaming style aesthetic.
 * Features bilingual support, responsive design, and theme compatibility.
 *
 * UPDATED_AT: 2025-12-30T16:23:00Z
 */
export function AboutPage() {
  const { t } = useTranslation();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Stats data configuration
  const statsData = [
    {
      id: 'agents',
      value: '15+',
      labelKey: 'about.stats.agents',
      icon: Users,
      color: 'var(--primary)',
      showTooltip: true,
      tooltip: t('about.stats.agentsTooltip'),
    },
    {
      id: 'timeline',
      value: '<1',
      labelKey: 'about.stats.timeline',
      icon: Clock,
      color: 'var(--success)',
      showTooltip: true,
      tooltip: t('about.stats.timelineTooltip'),
    },
    {
      id: 'techStack',
      value: '10+',
      labelKey: 'about.stats.techStack',
      icon: Cpu,
      color: 'var(--info)',
      showTooltip: true,
      tooltip: t('about.stats.techStackTooltip'),
    },
    {
      id: 'architecture',
      value: 'Enterprise',
      labelKey: 'about.stats.architecture',
      icon: Building2,
      color: 'var(--accent)',
      showTooltip: true,
      tooltip: t('about.stats.architectureTooltip'),
    },
  ];

  return (
    <ErrorBoundary fallback={<div className="error-fallback">Error loading About page</div>}>
      <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-hero-icon">
            <User size={isMobile ? 48 : 64} strokeWidth={2} />
          </div>
          <h1 className="about-hero-title">
            {t('about.hero.greeting')} <span className="highlight">{t('about.hero.name')}</span>
          </h1>
          <p className="about-hero-tagline">{t('about.hero.tagline')}</p>
          <p className="about-hero-subtitle">{t('about.hero.subtitle')}</p>
        </div>
      </section>

      {/* Stats Bar */}
      <StatsBar stats={statsData} fixed={isDesktop} />

      {/* Journey Section */}
      <JourneySection />

      {/* Skills Matrix Section */}
      <SkillsMatrix showEvidence={false} />

      {/* Project Showcase Section */}
      <ProjectShowcase />

      {/* Achievement Timeline Section */}
      <AchievementTimeline />

      {/* Contact Section */}
      <ContactSection />
      </div>
    </ErrorBoundary>
  );
}