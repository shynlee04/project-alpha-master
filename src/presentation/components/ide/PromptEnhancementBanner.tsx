/**
 * PromptEnhancementBanner Component
 * Loading banner shown during prompt enhancement
 * Max 120 lines
 */

import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PromptEnhancementBannerProps {
  isEnhancing: boolean;
}

export function PromptEnhancementBanner({ isEnhancing }: PromptEnhancementBannerProps) {
  const { t } = useTranslation();

  if (!isEnhancing) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-3 p-4 bg-surface-dark border border-border-dark rounded-lg shadow-xl">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        <span className="text-sm font-medium text-foreground">{t('agent.enhancing')}</span>
      </div>
    </div>
  );
}
