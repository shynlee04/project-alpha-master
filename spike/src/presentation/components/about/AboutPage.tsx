import { PortfolioLayout } from './layout/PortfolioLayout';
import { HeroSection } from './sections/HeroSection';
import { JourneySection } from './sections/JourneySection';
import { ShowcaseSection } from './sections/ShowcaseSection';
import { SkillsUniverse } from './sections/SkillsUniverse';
import { ContactSection } from './sections/ContactSection';
// import './AboutPage.css'; // Deprecated in favor of Tailwind in new components

/**
 * AboutPage Component
 * 
 * REDESIGN: EPIC-30 Personal Portfolio
 * Uses the new PortfolioLayout and atomic section architecture.
 */
export function AboutPage() {
  return (
    <PortfolioLayout>
      <HeroSection />
      <ShowcaseSection />
      <SkillsUniverse />
      <JourneySection />
      <ContactSection />
    </PortfolioLayout>
  );
}