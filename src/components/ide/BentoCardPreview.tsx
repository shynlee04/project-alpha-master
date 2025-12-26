import React, { useState } from 'react';
import { CodeBlock } from '@/components/chat/CodeBlock';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * BentoCardPreview - Interactive document preview component for bento cards
 * 
 * Features:
 * - Expand/collapse functionality
 * - Code snippet previews using CodeBlock component
 * - Configuration examples
 * - Tutorial content with quick start actions
 * - 8-bit design system styling
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
        className="flex items-center justify-between w-full px-3 py-2 bg-[#27272a] border-b border-[#3f3f46] hover:bg-[#3f3f46] transition-colors duration-150 ease-out rounded-none"
        aria-expanded={isExpanded ? 'true' : 'false'}
        aria-controls={`preview-content-${title}`}
      >
        <span className="text-[#f97316] font-semibold text-sm">
          {title}
        </span>
        <span className="text-[#71717a]">
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
              className="bg-[#09090b] border border-[#27272a] rounded-none"
            />
          )}
          
          {type === 'config' && (
            <pre className="text-[#a1a1aa] text-sm whitespace-pre-wrap bg-[#09090b] border border-[#27272a] p-3 rounded-none overflow-x-auto">
              {content}
            </pre>
          )}
          
          {type === 'tutorial' && (
            <div className="text-[#a1a1aa] text-sm leading-relaxed">
              {content}
            </div>
          )}
        </div>
      </div>

      {/* Quick Start Action */}
      {onQuickStart && (
        <button
          onClick={onQuickStart}
          className="w-full mt-2 px-4 py-2 bg-[#f97316] text-white font-medium hover:bg-[#fb923c] transition-colors duration-150 ease-out rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
          aria-label={t('bentoCardPreview.quickStart')}
        >
          {t('bentoCardPreview.quickStart')}
        </button>
      )}
    </div>
  );
}
