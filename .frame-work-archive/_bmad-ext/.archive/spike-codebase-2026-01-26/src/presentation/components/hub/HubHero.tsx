/**
 * @fileoverview Hub hero section with typing animation
 * @module presentation/components/hub/HubHero
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * HubHero Component
 *
 * Displays the hero section with:
 * - Version/subtitle line with terminal icon
 * - Typing effect for welcome message
 * - Blinking cursor animation
 * - Responsive typography (mobile vs desktop)
 *
 * Part of the Hub's 8-bit gaming aesthetic.
 *
 * @component
 * @example
 * ```tsx
 * <HubHero />
 * ```
 */
export const HubHero: React.FC = () => {
  const { t } = useTranslation();

  // Typing effect state
  const fullText = t('hub.welcome', 'INITIALIZING SYSTEM...');
  const [typedText, setTypedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  // Typing animation
  useEffect(() => {
    let index = 0;
    const typeInterval = setInterval(() => {
      setTypedText((prev) => {
        if (index < fullText.length) {
          index++;
          return fullText.slice(0, index);
        }
        clearInterval(typeInterval);
        return prev;
      });
    }, 40); // 40ms per character

    return () => clearInterval(typeInterval);
  }, [fullText]);

  // Cursor blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <section className="space-y-2 mb-4 pt-4 md:pt-0">
      {/* Subtitle with version info */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
        <Terminal className="w-3 h-3" />
        <span>{t('hub.subtitle', 'v2.5.0-BETA // READY FOR INPUT')}</span>
      </div>

      {/* Main title with typing effect */}
      <h1 className="text-3xl md:text-5xl font-pixel text-primary tracking-tight h-auto min-h-[1.2em] flex flex-wrap items-center break-words">
        {typedText}
        <span className={cn(
          "inline-block w-[0.6em] h-[1em] bg-primary ml-1",
          cursorVisible ? "opacity-100" : "opacity-0"
        )} />
      </h1>
    </section>
  );
};
