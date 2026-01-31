/**
 * @fileoverview Expandable Chat Panel Component
 * @module presentation/components/chat/ExpandableChatPanel
 *
 * Perplexity-style expandable panel with smooth transitions.
 * Toggles between collapsed (20-30%) and expanded (60-70%) sizes.
 *
 * @story E1-3 - Perplexity-style Expandable Panel
 * @epic E1 - Cross-Workspace Chat Integration
 */

import { useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  type ImperativePanelGroupHandle
} from '@/presentation/components/ui/resizable';
import { UnifiedChatPanel } from './UnifiedChatPanel';

/**
 * Props for the expandable chat panel
 */
export interface ExpandableChatPanelProps {
  /** Default collapsed size (percentage, default: 30) */
  collapsedSize?: number;
  /** Default expanded size (percentage, default: 60) */
  expandedSize?: number;
  /** Minimum panel size (percentage, default: 15) */
  minSize?: number;
  /** Maximum panel size (percentage, default: 85) */
  maxSize?: number;
  /** Panel position for arrow direction */
  position?: 'left' | 'right';
  /** Auto-save ID for persistence */
  autoSaveId?: string;
  /** Additional CSS classes */
  className?: string;
  /** Props to pass to UnifiedChatPanel */
  chatProps: React.ComponentProps<typeof UnifiedChatPanel>;
}

/**
 * ExpandableChatPanel - Perplexity-style expandable chat panel
 *
 * Features:
 * - Smooth 300ms cubic-bezier transitions
 * - Toggle between collapsed (30%) and expanded (60%)
 * - Arrow indicator showing expansion state
 * - Drag handle for custom sizing
 * - Preserves chat history during expansion
 *
 * @example
 * ```tsx
 * <ExpandableChatPanel
 *   collapsedSize={30}
 *   expandedSize={60}
 *   position="right"
 *   autoSaveId="notes-chat-panel"
 *   chatProps={{
 *     mode: 'agent',
 *     projectId: projectId,
 *     projectName: projectMetadata?.name,
 *     workspaceType: 'notes'
 *   }}
 * />
 * ```
 */
export function ExpandableChatPanel({
  collapsedSize = 30,
  expandedSize = 60,
  minSize = 15,
  maxSize = 85,
  position = 'right',
  autoSaveId = 'expandable-chat-panel',
  className,
  chatProps,
}: ExpandableChatPanelProps) {
  const { t } = useTranslation();
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle between collapsed and expanded states
  const toggleExpansion = useCallback(() => {
    const panelGroup = panelGroupRef.current;
    if (!panelGroup) return;

    const layout = panelGroup.getLayout();
    if (layout.length === 0) return;

    // Panel index 0 is our chat panel
    const currentSize = layout[0];
    const targetSize = isExpanded ? collapsedSize : expandedSize;

    // Only animate if we're not already at target size
    if (Math.abs(currentSize - targetSize) > 1) {
      panelGroup.setLayout([targetSize, 100 - targetSize]);
    }

    setIsExpanded(prev => !prev);
  }, [isExpanded, collapsedSize, expandedSize]);

  // Handle layout changes (from drag or programmatic)
  const handleLayout = useCallback((layout: number[]) => {
    if (layout.length > 0) {
      const panelSize = layout[0];
      // Update expansion state based on current size
      // Consider "expanded" if size is closer to expandedSize than collapsedSize
      const expandedDiff = Math.abs(panelSize - expandedSize);
      const collapsedDiff = Math.abs(panelSize - collapsedSize);
      setIsExpanded(expandedDiff < collapsedDiff);
    }
  }, [expandedSize, collapsedSize]);

  // Arrow icon based on position and expansion state
  const ArrowIcon = position === 'left' ? ChevronRight : ChevronLeft;
  const arrowRotation = isExpanded
    ? (position === 'left' ? 180 : 0)
    : (position === 'left' ? 0 : 180);

  return (
    <ResizablePanelGroup
      ref={panelGroupRef}
      direction="horizontal"
      autoSaveId={autoSaveId}
      onLayout={handleLayout}
      className={cn("h-full", className)}
    >
      {/* Main content area (other panels) */}
      <ResizablePanel
        id="expandable-chat-content"
        defaultSize={100 - collapsedSize}
        minSize={100 - maxSize}
        maxSize={100 - minSize}
      />

      {/* Drag handle with visual indicator */}
      <ResizableHandle
        withHandle={true}
        className="relative"
      />

      {/* Expandable chat panel */}
      <ResizablePanel
        id="expandable-chat-panel"
        defaultSize={collapsedSize}
        minSize={minSize}
        maxSize={maxSize}
        className={cn(
          "relative transition-[flex-basis] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        )}
      >
        {/* Toggle button with arrow indicator */}
        <button
          onClick={toggleExpansion}
          className={cn(
            "absolute z-20 flex items-center justify-center",
            "bg-primary text-primary-foreground",
            "border border-border shadow-lg",
            "hover:bg-primary/90 active:bg-primary/80",
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            "rounded-sm",
            // Position based on panel position
            position === 'left'
              ? "right-2 top-1/2 -translate-y-1/2"
              : "left-2 top-1/2 -translate-y-1/2",
            // Size
            "h-8 px-1.5"
          )}
          aria-label={isExpanded ? t('common.collapse') : t('common.expand')}
          title={isExpanded ? t('common.collapse') : t('common.expand')}
        >
          <ArrowIcon
            className={cn(
              "size-4 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              isExpanded && "rotate-180"
            )}
            style={{
              transform: `rotate(${arrowRotation}deg)`
            }}
          />
        </button>

        {/* Chat panel content */}
        <div className="h-full overflow-hidden">
          <UnifiedChatPanel {...chatProps} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default ExpandableChatPanel;
