/**
 * EPIC_ID: 29
 * STORY_ID: 29-2
 * CREATED_AT: 2025-12-30T15:38:00Z
 * UPDATED_AT: 2025-12-30T16:10:00Z
 *
 * HeroSection Component
 *
 * Main hero section component for About page.
 * Features particle background, identity text, CTAs, and scroll indicator.
 * Fully responsive with 8-bit gaming aesthetic.
 *
 * @example
 * ```tsx
 * <HeroSection
 *   avatarUrl="https://example.com/avatar.jpg"
 *   avatarAlt="Professional photo"
 *   enableParticles={true}
 * />
 * ```
 */

import { useTranslation } from 'react-i18next';
import { ParticleBackground } from './ParticleBackground';
import { ScrollIndicator } from './ScrollIndicator';
import { useResponsive } from '@/hooks/useResponsive';

export interface HeroSectionProps {
  /**
   * Optional avatar image URL
   * If not provided, avatar section is hidden
   */
  avatarUrl?: string;
  
  /**
   * Avatar alt text for accessibility
   * Required if avatarUrl is provided
   */
  avatarAlt?: string;
  
  /**
   * Primary CTA label
   * Defaults to "View Projects" via i18n
   */
  primaryCTALabel?: string;
  
  /**
   * Primary CTA navigation target
   * Defaults to "#projects"
   */
  primaryCTATarget?: string;
  
  /**
   * Secondary CTA label
   * Defaults to "Contact Me" via i18n
   */
  secondaryCTALabel?: string;
  
  /**
   * Secondary CTA navigation target
   * Defaults to "#contact"
   */
  secondaryCTATarget?: string;
  
  /**
   * Particle animation enabled
   * Defaults to true
   */
  enableParticles?: boolean;
  
  /**
   * Particle count (performance optimization)
   * Defaults to 50 (desktop), 25 (mobile)
   */
  particleCount?: number;
  
  /**
   * Custom className for styling overrides
   */
  className?: string;
}

/**
 * HeroSection Component
 *
 * Displays the main hero section for the About page with:
 * - Optional avatar image
 * - Identity heading and subtitle
 * - Primary and secondary CTA buttons
 * - Animated scroll indicator
 * - Particle background (optional)
 *
 * @param props - Component props
 * @returns Section element with hero content
 */
export function HeroSection({
  avatarUrl,
  avatarAlt,
  primaryCTALabel,
  primaryCTATarget = '#projects',
  secondaryCTALabel,
  secondaryCTATarget = '#contact',
  enableParticles = true,
  particleCount,
  className = ''
}: HeroSectionProps) {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  
  /**
   * Determine particle count based on screen size
   * Uses useResponsive hook for consistent breakpoint detection
   *
   * @returns Particle count (25 for mobile, 50 for desktop/tablet)
   */
  const getParticleCount = (): number => {
    if (particleCount !== undefined) return particleCount;
    return isMobile ? 25 : 50;
  };

  /**
   * Smooth scroll to target element
   * Uses native scrollIntoView with smooth behavior
   *
   * @param targetId - ID of the target element to scroll to
   */
  const handleScroll = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className={`hero-section ${className}`}
      aria-labelledby="hero-heading"
      role="region"
      style={{
        position: 'relative',
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--spacing-desktop) * 8 var(--spacing-desktop) * 4',
        overflow: 'hidden',
      }}
    >
      {/* Particle Background */}
      {enableParticles && (
        <ParticleBackground particleCount={getParticleCount()} />
      )}

      {/* Hero Content */}
      <div
        className="hero-content"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Avatar (Optional) */}
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={avatarAlt || t('about.hero.avatarAlt')}
            aria-hidden="true"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: 'var(--radius)',
              marginBottom: 'var(--spacing-desktop) * 3',
              boxShadow: 'var(--shadow-pixel)',
              animation: 'fade-in-up var(--animation-duration-medium) var(--animation-easing-8bit) forwards',
              opacity: 0,
            }}
          />
        )}

        {/* Identity H1 */}
        <h1
          id="hero-heading"
          style={{
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: 1.2,
            color: 'hsl(var(--primary))',
            marginBottom: 'var(--spacing-desktop) * 2',
            animation: 'fade-in-up var(--animation-duration-medium) var(--animation-easing-8bit) 100ms forwards',
            opacity: 0,
          }}
        >
          {t('about.hero.identity')}
        </h1>

        {/* Subtitle H2 */}
        <p
          style={{
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: 1.5,
            color: 'hsl(var(--muted-foreground))',
            maxWidth: '800px',
            margin: '0 auto var(--spacing-desktop) * 4',
            animation: 'fade-in-up var(--animation-duration-medium) var(--animation-easing-8bit) 200ms forwards',
            opacity: 0,
          }}
        >
          {t('about.hero.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div
          className="cta-container"
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 'var(--spacing-desktop) * 2',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fade-in-up var(--animation-duration-medium) var(--animation-easing-8bit) 300ms forwards',
            opacity: 0,
          }}
        >
          {/* Primary CTA */}
          <button
            onClick={() => handleScroll(primaryCTATarget)}
            className="cta-button primary"
            aria-label={primaryCTALabel || t('about.hero.primaryCTA')}
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              padding: 'var(--spacing-desktop) * 2',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: 1,
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-pixel-primary)',
              transition: 'all var(--animation-duration-medium) var(--animation-easing-8bit)',
              minWidth: '180px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-pixel-primary)';
            }}
          >
            {primaryCTALabel || t('about.hero.primaryCTA')}
          </button>

          {/* Secondary CTA */}
          <button
            onClick={() => handleScroll(secondaryCTATarget)}
            className="cta-button secondary"
            aria-label={secondaryCTALabel || t('about.hero.secondaryCTA')}
            style={{
              backgroundColor: 'transparent',
              color: 'hsl(var(--foreground))',
              padding: 'var(--spacing-desktop) * 2',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: 1,
              border: '2px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-pixel)',
              transition: 'all var(--animation-duration-medium) var(--animation-easing-8bit)',
              minWidth: '180px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0, 0, 0, 0.5)';
              e.currentTarget.style.borderColor = 'hsl(var(--primary))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-pixel)';
              e.currentTarget.style.borderColor = 'hsl(var(--border))';
            }}
          >
            {secondaryCTALabel || t('about.hero.secondaryCTA')}
          </button>
        </div>

        {/* Scroll Indicator */}
        <div
          style={{
            marginTop: 'var(--spacing-desktop) * 4',
            animation: 'fade-in-up var(--animation-duration-medium) var(--animation-easing-8bit) 400ms forwards',
            opacity: 0,
          }}
        >
          <ScrollIndicator targetId="stats-bar" />
        </div>
      </div>

      {/* Inline Styles for Responsive Breakpoints */}
      <style>{`
        @media (max-width: 767px) {
          .hero-section {
            padding: var(--spacing-mobile) * 4 var(--spacing-mobile) * 2 !important;
            min-height: 80vh !important;
          }
          
          #hero-heading {
            font-size: 32px !important;
          }
          
          .hero-content p {
            font-size: 16px !important;
            max-width: 100% !important;
          }
          
          .cta-container {
            flex-direction: column !important;
            gap: var(--spacing-mobile) * 1.5 !important;
          }
          
          .cta-button {
            width: 100% !important;
            min-width: unset !important;
          }
          
          img[aria-hidden="true"] {
            width: 80px !important;
            height: 80px !important;
            margin-bottom: var(--spacing-mobile) * 2 !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .hero-section {
            padding: var(--spacing-tablet) * 6 var(--spacing-tablet) * 3 !important;
            min-height: 70vh !important;
          }
          
          #hero-heading {
            font-size: 40px !important;
          }
          
          .hero-content p {
            font-size: 18px !important;
            max-width: 90% !important;
          }
          
          .cta-container {
            gap: var(--spacing-tablet) * 1.5 !important;
          }
          
          .cta-button {
            min-width: 160px !important;
          }
          
          img[aria-hidden="true"] {
            width: 100px !important;
            height: 100px !important;
            margin-bottom: var(--spacing-tablet) * 2 !important;
          }
        }

        @media (min-width: 1440px) {
          .hero-section {
            padding: var(--spacing-lg) * 8 var(--spacing-lg) * 4 !important;
            max-width: 1280px !important;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll-bounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(8px);
            opacity: 0.5;
          }
        }

        .scroll-indicator {
          animation: scroll-bounce 2s var(--animation-easing-8bit) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-indicator {
            animation: none !important;
          }
          
          .hero-content > *,
          img[aria-hidden="true"] {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}