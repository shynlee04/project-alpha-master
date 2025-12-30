import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import { User, Code, Zap, Rocket, Mail, Linkedin, Github } from 'lucide-react';
import './AboutPage.css';

/**
 * AboutPage Component
 * 
 * A professional "About Me" page with 8-bit gaming style aesthetic.
 * Features bilingual support, responsive design, and theme compatibility.
 */
export function AboutPage() {
  const { t } = useTranslation();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
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

      {/* Story Section */}
      <section className="about-section about-story">
        <div className="about-section-header">
          <Code className="section-icon" size={24} />
          <h2 className="section-title">{t('about.story.title')}</h2>
        </div>
        <div className="about-section-content">
          <div className="about-card">
            <div className="about-card-header">
              <Zap className="card-icon" size={20} />
              <h3 className="card-title">{t('about.story.background')}</h3>
            </div>
            <p className="card-text">
              {t('about.story.achievement')}
            </p>
          </div>
          <div className="about-card">
            <div className="about-card-header">
              <Rocket className="card-icon" size={20} />
              <h3 className="card-title">{t('about.story.transition')}</h3>
            </div>
            <p className="card-text">
              {t('about.project.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="about-section about-skills">
        <div className="about-section-header">
          <Zap className="section-icon" size={24} />
          <h2 className="section-title">{t('about.skills.title')}</h2>
        </div>
        <div className="about-section-content">
          <div className="skills-grid">
            <div className="skill-item">
              <div className="skill-icon">⚛️</div>
              <h3 className="skill-title">{t('about.skills.frontend')}</h3>
              <p className="skill-description">React 18, TypeScript, TanStack Router</p>
            </div>
            <div className="skill-item">
              <div className="skill-icon">🤖</div>
              <h3 className="skill-title">{t('about.skills.backend')}</h3>
              <p className="skill-description">AI Integration, WebContainer API, IndexedDB</p>
            </div>
            <div className="skill-item">
              <div className="skill-icon">🎯</div>
              <h3 className="skill-title">{t('about.skills.framework')}</h3>
              <p className="skill-description">BMAD V6, Multi-Agent Orchestration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Section */}
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
  );
}