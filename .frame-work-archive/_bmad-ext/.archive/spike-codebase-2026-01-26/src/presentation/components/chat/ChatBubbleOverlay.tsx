/**
 * @fileoverview Chat Bubble Overlay Component
 * @module presentation/components/chat/ChatBubbleOverlay
 *
 * Full-screen overlay for mobile chat interface.
 * Used by ChatBubble for displaying chat on mobile devices.
 *
 * @story E1-4 - Notion-style Chat Bubble
 * @epic E1 - Cross-Workspace Chat Integration
 */

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * Props for the chat bubble overlay
 */
export interface ChatBubbleOverlayProps {
  /** Whether overlay is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Chat content to render */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ChatBubbleOverlay - Full-screen overlay for mobile chat
 *
 * Features:
 * - Full-screen viewport coverage
 * - Slide-up animation (300ms cubic-bezier)
 * - Click outside to dismiss
 * - Escape key to close
 * - Prevents body scroll when open
 *
 * @example
 * ```tsx
 * <ChatBubbleOverlay
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <UnifiedChatPanel mode="agent" projectId={projectId} />
 * </ChatBubbleOverlay>
 * ```
 */
export function ChatBubbleOverlay({
  isOpen,
  onClose,
  children,
  className,
}: ChatBubbleOverlayProps) {
  const { t } = useTranslation();

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-background",
        "animate-in slide-in-from-bottom duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label={t('chat.open', 'Chat')}
    >
      {/* Header with close button */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold text-foreground">
          {t('chat.title', 'Chat')}
        </h2>
        <button
          onClick={onClose}
          className={cn(
            "rounded-sm p-1.5",
            "hover:bg-secondary active:bg-secondary/80",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label={t('chat.close', 'Close chat')}
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Chat content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default ChatBubbleOverlay;
