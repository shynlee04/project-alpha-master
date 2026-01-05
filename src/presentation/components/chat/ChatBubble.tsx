/**
 * @fileoverview Chat Bubble Component
 * @module presentation/components/chat/ChatBubble
 *
 * Notion-style floating chat bubble for mobile devices.
 * Expands to full-screen chat overlay when tapped.
 *
 * @story E1-4 - Notion-style Chat Bubble
 * @epic E1 - Cross-Workspace Chat Integration
 */

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { ChatBubbleOverlay } from './ChatBubbleOverlay';

/**
 * Props for the chat bubble
 */
export interface ChatBubbleProps {
  /** Chat panel to render in overlay */
  chatPanel: React.ReactNode;
  /** Initial unread count */
  unreadCount?: number;
  /** Position of bubble */
  position?: 'bottom-right' | 'bottom-left';
  /** Show only on mobile (default: true) */
  mobileOnly?: boolean;
}

/**
 * ChatBubble - Floating chat bubble for mobile
 *
 * Features:
 * - Fixed position in corner (bottom-right by default)
 * - Unread message count badge
 * - Smooth scale animation on hover
 * - Full-screen chat overlay on tap
 * - Click outside or Escape to dismiss
 * - Accessible (keyboard navigation, ARIA labels)
 *
 * @example
 * ```tsx
 * <ChatBubble
 *   unreadCount={3}
 *   position="bottom-right"
 *   chatPanel={
 *     <UnifiedChatPanel
 *       mode="agent"
 *       projectId={projectId}
 *       workspaceType="notes"
 *     />
 *   }
 * />
 * ```
 */
export function ChatBubble({
  chatPanel,
  unreadCount: externalUnreadCount = 0,
  position = 'bottom-right',
  mobileOnly = true,
}: ChatBubbleProps) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const [isOpen, setIsOpen] = useState(false);
  const [internalUnreadCount, setInternalUnreadCount] = useState(externalUnreadCount);

  // Sync external unread count
  useEffect(() => {
    setInternalUnreadCount(externalUnreadCount);
  }, [externalUnreadCount]);

  // Handle open
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    // Clear unread count when opening
    setInternalUnreadCount(0);
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Don't render on desktop if mobileOnly is true
  if (mobileOnly && !isMobile) {
    return null;
  }

  // Position classes
  const positionClasses = cn(
    "fixed z-40",
    position === 'bottom-right' ? "bottom-8 right-4" : "bottom-8 left-4"
  );

  // Badge visibility
  const showBadge = internalUnreadCount > 0;

  return (
    <>
      {/* Floating bubble button */}
      <button
        onClick={handleOpen}
        className={cn(
          positionClasses,
          "flex size-14 items-center justify-center",
          "rounded-full bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "hover:scale-110 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        aria-label={t('chat.open', 'Open chat')}
        title={t('chat.open', 'Open chat')}
      >
        {/* Message icon */}
        <MessageSquare className="size-6" strokeWidth={2} />

        {/* Unread badge */}
        {showBadge && (
          <span
            className={cn(
              "absolute -top-1 -right-1",
              "flex min-h-5 min-w-5 items-center justify-center",
              "rounded-full bg-destructive px-1.5 py-0.5",
              "text-[10px] font-bold text-destructive-foreground",
              "ring-2 ring-background",
              "animate-in zoom-in duration-200"
            )}
            aria-label={t('chat.unread', '{{count}} unread').replace('{{count}}', String(internalUnreadCount))}
          >
            {internalUnreadCount > 9 ? '9+' : internalUnreadCount}
          </span>
        )}
      </button>

      {/* Full-screen overlay */}
      <ChatBubbleOverlay isOpen={isOpen} onClose={handleClose}>
        {chatPanel}
      </ChatBubbleOverlay>
    </>
  );
}

export default ChatBubble;
