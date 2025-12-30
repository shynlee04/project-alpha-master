import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { User, Mail, Linkedin, Github, Users, Clock, Cpu, Building2 } from 'lucide-react';
import { StatsBar } from './stats';
import { JourneySection } from './journey';
import { SkillsMatrix } from './skills';
import { ProjectShowcase } from './projects';
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

      {/* Contact Section - Will be enhanced in Story 29-8 */}
      <section className="about-section about-project">
        <div className="about-section-header">
          <Rocket className="section-icon" size={24} />
          <h2 className="section-title">{t('about.project.title')}</h2>
        </div>
        <div className="about-section-content">
          <div className="project-highlight">
            <div className="project-highlight-content">
              <h3 className="project-highlight-title">Via-gent</h3>
              <p className="project-highlight-description">
                {t('about.project.description')}
              </p>
              <div className="project-highlight-stats">
                <div className="stat-item">
                  <span className="stat-value">15+</span>
                  <span className="stat-label">{t('about.project.highlights')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">&lt;1</span>
                  <span className="stat-label">Month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="about-section about-contact">
        <div className="about-section-header">
          <Mail className="section-icon" size={24} />
          <h2 className="section-title">{t('about.contact.title')}</h2>
        </div>
        <div className="about-section-content">
          <div className="contact-links">
            <a href="mailto:contact@via-gent.dev" className="contact-link">
              <Mail size={20} />
              <span>{t('about.contact.email')}</span>
            </a>
            <a href="https://linkedin.com/in/viagent" target="_blank" rel="noopener noreferrer" className="contact-link">
              <Linkedin size={20} />
              <span>{t('about.contact.linkedin')}</span>
            </a>
            <a href="https://github.com/viagent" target="_blank" rel="noopener noreferrer" className="contact-link">
              <Github size={20} />
              <span>{t('about.contact.github')}</span>
            </a>
          </div>
        </div>
      </section>
      </div>
    </ErrorBoundary>
  );
}