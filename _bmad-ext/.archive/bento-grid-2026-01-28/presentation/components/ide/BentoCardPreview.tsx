import { useState } from 'react';
import { CodeBlock } from '@/presentation/components/chat/CodeBlock';
import { useTranslation } from 'react-i18next';

/**
 * BentoCardPreview - Interactive document preview component for bento cards
 *
 * Story: LT-4.19 (Light Theme Migration)
 * UPDATED_AT: 2026-01-04T10:30:00Z
 *
 * Features:
 * - Expand/collapse functionality
 * - Code snippet previews using CodeBlock component
 * - Configuration examples
 * - Tutorial content with quick start actions
 * - 8-bit design system styling with light/dark theme support
 */

export interface BentoCardPreviewProps {
  type: 'code' | 'config' | 'tutorial';
  title: string;
  content: string;
  language?: string;
  onQuickStart?: () => void;
  className?: string;
}

export function BentoCardPreview({
  type,
  title,
  content,
  language = 'typescript',
  onQuickStart,
  className = '',
}: BentoCardPreviewProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bento-card-preview ${className}`}>
      {/* Preview Header */}
      <button
        onClick={toggleExpanded}
        className="flex items-center justify-between w-full px-3 py-2 bg-[var(--secondary)] border-b border-[var(--border)] hover:bg-[var(--secondary-600)] transition-colors duration-150 ease-out rounded-none"
        aria-expanded={isExpanded ? 'true' : 'false'}
        aria-controls={`preview-content-${title}`}
      >
        <span className="text-[var(--primary)] font-semibold text-sm">
          {title}
        </span>
        <span className="text-[var(--muted-foreground)]">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {/* Preview Content */}
      <div
        id={`preview-content-${title}`}
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="p-3">
          {type === 'code' && (
            <CodeBlock
              code={content}
              language={language}
              className="bg-[var(--background)] border border-[var(--border)] rounded-none"
            />
          )}
          
          {type === 'config' && (
            <pre className="text-[var(--foreground)] text-sm whitespace-pre-wrap bg-[var(--background)] border border-[var(--border)] p-3 rounded-none overflow-x-auto">
              {content}
            </pre>
          )}
          
          {type === 'tutorial' && (
            <div className="text-[var(--foreground)] text-sm leading-relaxed">
              {content}
            </div>
          )}
        </div>
      </div>

      {/* Quick Start Action */}
      {onQuickStart && (
        <button
          onClick={onQuickStart}
          className="w-full mt-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:bg-[var(--primary-600)] transition-colors duration-150 ease-out rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
          aria-label={t('bentoCardPreview.quickStart')}
        >
          {t('bentoCardPreview.quickStart')}
        </button>
      )}
    </div>
  );
}
