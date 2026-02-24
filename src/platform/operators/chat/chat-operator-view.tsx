/**
 * @fileoverview ChatOperatorView - Platform-aware Chat Operator Wrapper
 * @module platform/operators/chat/chat-operator-view
 *
 * This component wraps the ChatPanel and integrates with PlatformProvider context.
 * It is designed for use in PlatformLayout where the operator is always visible.
 *
 * Key features:
 * - Gets projectId from usePlatform() context (NO manual props)
 * - Initializes ChatOperator on mount
 * - Handles loading/error states
 * - Cleans up on unmount
 *
 * NO workspaceId - uses projectId only (per governance mandate)
 *
 * @created 2026-02-02
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Platform Operator Architecture
 */

import { useEffect, useState } from 'react';
import { MessageSquare, Loader2, AlertTriangle } from 'lucide-react';
import { usePlatform } from '@/platform/core/platform-context';
import { chatOperator } from '@/plugins/chat/ChatOperator';
import { ChatPanel } from '@/plugins/chat/components/ChatPanel';

// ============================================================================
// Types
// ============================================================================

interface ChatOperatorViewProps {
  /** Optional CSS class for styling */
  className?: string;
}

// ============================================================================
// ChatOperatorView Component
// ============================================================================

/**
 * ChatOperatorView - Platform-aware wrapper for ChatPanel
 *
 * Gets projectId from PlatformProvider context and initializes the
 * ChatOperator singleton on mount. Renders appropriate loading/error
 * states based on platform context.
 *
 * @example
 * ```tsx
 * // In PlatformLayout:
 * <ChatOperatorView className="h-full" />
 * ```
 */
export function ChatOperatorView({ className }: ChatOperatorViewProps) {
  const { projectId, isLoading: platformLoading, error: platformError } = usePlatform();
  const [operatorReady, setOperatorReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize ChatOperator when project is available
  useEffect(() => {
    let mounted = true;

    async function initializeOperator() {
      if (!projectId) {
        setOperatorReady(false);
        return;
      }

      try {
        // Initialize the operator if not already initialized
        await chatOperator.init();
        
        if (mounted) {
          setOperatorReady(true);
          setInitError(null);
          console.log('[ChatOperatorView] Operator initialized for project:', projectId);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat operator';
          setInitError(errorMessage);
          console.error('[ChatOperatorView] Initialization error:', errorMessage);
        }
      }
    }

    void initializeOperator();

    // Cleanup on unmount
    return () => {
      mounted = false;
    };
  }, [projectId]);

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (platformLoading) {
    return (
      <div className={mergeClasses('flex items-center justify-center h-full bg-background text-muted-foreground', className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
          <p className="text-sm font-mono">Loading platform...</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // Error State
  // ==========================================================================

  if (platformError || initError) {
    const errorMessage = platformError?.message || initError || 'Unknown error';
    return (
      <div className={mergeClasses('flex items-center justify-center h-full bg-background text-destructive', className)}>
        <div className="text-center p-4">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-mono font-bold">Chat Error</p>
          <p className="text-xs mt-1 opacity-70">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // No Project State
  // ==========================================================================

  if (!projectId) {
    return (
      <div className={mergeClasses('flex items-center justify-center h-full bg-background text-muted-foreground', className)}>
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-mono text-sm">No project selected</p>
          <p className="text-xs mt-1 opacity-70">Select a project to start chatting</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // Operator Initializing State
  // ==========================================================================

  if (!operatorReady) {
    return (
      <div className={mergeClasses('flex items-center justify-center h-full bg-background text-muted-foreground', className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
          <p className="text-sm font-mono">Initializing chat...</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // Ready State - Render ChatPanel
  // ==========================================================================

  return (
    <div className={mergeClasses('h-full', className)}>
      <ChatPanel projectId={projectId} className="h-full" />
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Merge CSS classes without @/lib/utils dependency
 * Simple utility to avoid banned imports
 */
function mergeClasses(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ============================================================================
// Default Export
// ============================================================================

export default ChatOperatorView;
