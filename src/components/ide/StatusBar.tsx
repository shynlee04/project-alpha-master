/**
 * @fileoverview IDE StatusBar Component
 * @module components/ide/StatusBar
 *
 * @epic Epic 23 Story P1.1
 * @integrates Epic-10 Story 10-7 - Subscribes to sync events
 * @integrates Epic-25 Story 25-1 - Will display agent status
 * @integrates Epic-26 Story 26-5 - Will show provider connection
 *
 * VS Code-style footer status bar displaying:
 * - WebContainer boot status
 * - File sync status with progress
 * - LLM provider connection (mock)
 * - Cursor position (Ln/Col)
 * - File encoding and type
 *
 * @roadmap
 * - Epic 25: Add AgentStatusSegment with token counter
 * - Epic 26: Wire ProviderStatus to real API key validation
 * - Epic 28: Add git branch segment when Epic 7 is complete
 *
 * @example
 * ```tsx
 * // In IDELayout.tsx
 * <div className="flex flex-col h-screen">
 *   <IDEHeaderBar ... />
 *   <main className="flex-1" />
 *   <StatusBar />
 * </div>
 * ```
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { WebContainerStatus } from '@/components/ide/statusbar/WebContainerStatus';
import { AgentStatusSegment } from '@/components/ide/statusbar/AgentStatusSegment';
import { SyncStatusSegment } from '@/components/ide/statusbar/SyncStatusSegment';
import { ProviderStatus } from '@/components/ide/statusbar/ProviderStatus';
import { CursorPosition } from '@/components/ide/statusbar/CursorPosition';
import { FileTypeIndicator } from '@/components/ide/statusbar/FileTypeIndicator';

// ============================================================================
// Types
// ============================================================================

interface StatusBarProps extends React.HTMLAttributes<HTMLElement> {
    /** Callback to retry sync on error */
    onSyncRetry?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * StatusBar - VS Code-style footer status bar
 *
 * Fixed at bottom of viewport with primary color background.
 * Height: 24px (var(--status-bar-height)) matching VS Code.
 *
 * Layout:
 * - Left region: WebContainer, Agent, Sync, Provider status
 * - Right region: Cursor position, Encoding, File type
 */
export function StatusBar({ className, onSyncRetry, ...props }: StatusBarProps) {
    return (
        <footer
            className={cn(
                'bg-primary flex items-center justify-between',
                'select-none shrink-0',
                className
            )}
            style={{ height: 'var(--status-bar-height)' }}
            role="status"
            aria-label="IDE Status Bar"
            {...props}
        >
            {/* Left region - Connection statuses */}
            <div className="flex items-center h-full">
                <WebContainerStatus />
                <AgentStatusSegment />
                <SyncStatusSegment onRetry={onSyncRetry} />
                <ProviderStatus />
            </div>

            {/* Right region - Editor info */}
            <div className="flex items-center h-full">
                <CursorPosition />
                <FileTypeIndicator />
            </div>
        </footer>
    );
}
