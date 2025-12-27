/**
 * @fileoverview Terminal Panel Component
 * @module components/layout/TerminalPanel
 * 
 * Bottom panel containing terminal, output, and problems tabs.
 * Part of the IDE layout refactoring to reduce IDELayout.tsx complexity.
 * 
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-6 Terminal Panel Mobile
 * 
 * @example
 * ```tsx
 * <TerminalPanel
 *   activeTab={terminalTab}
 *   onTabChange={setTerminalTab}
 * />
 * ```
 */

import { Suspense, lazy, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '../../lib/utils';
import { type TerminalTab } from '../../lib/workspace';
import { useDeviceType } from '@/hooks/useMediaQuery';

/**
 * SSR-safe lazy import for XTerminal.
 * 
 * CRITICAL: @xterm/xterm is a browser-only CommonJS package that crashes
 * when bundled into SSR (Node.js can't import CommonJS named exports as ESM).
 * 
 * Using import.meta.env.SSR to completely exclude the import from SSR bundle.
 * Vite statically replaces this during build, enabling tree-shaking.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let XTerminal: ComponentType<any> | null = null;

if (!import.meta.env.SSR) {
    // Only define the lazy import on client-side
    XTerminal = lazy(() =>
        import('../ide/XTerminal').then(module => ({ default: module.XTerminal }))
    );
}

/**
 * Props for the TerminalPanel component.
 * 
 * @interface TerminalPanelProps
 */
export interface TerminalPanelProps {
    /** Currently active tab */
    activeTab: TerminalTab;
    /** Callback when tab changes */
    onTabChange: (tab: TerminalTab) => void;
    /** Whether initial sync has completed */
    initialSyncCompleted?: boolean;
    /** Permission state for file system access */
    permissionState?: 'unknown' | 'prompt' | 'granted' | 'denied';
    /** Optional className for outer container */
    className?: string;
}

/**
 * TerminalPanel - Bottom panel with terminal tabs.
 * 
 * Contains:
 * - Terminal tab (xterm.js instance)
 * - Output tab (coming soon)
 * - Problems tab (coming soon)
 * 
 * @param props - Component props
 * @returns Terminal panel JSX element
 */
export function TerminalPanel({
    activeTab,
    onTabChange,
    initialSyncCompleted,
    permissionState,
    className,
}: TerminalPanelProps): React.JSX.Element {
    const { t } = useTranslation();
    // MRT-6: Mobile responsive detection for touch targets
    const { isMobile } = useDeviceType();

    return (
        <div className={cn("h-full flex flex-col border-t border-border", className)}>
            {/* Tab Bar - MRT-6: 44px height on mobile for WCAG touch targets */}
            <div className={cn(
                "px-4 flex items-center gap-6 border-b border-border/50",
                isMobile ? 'h-11 gap-2' : 'h-8 gap-6'
            )}>
                <TabButton
                    label={t('ide.terminal')}
                    isActive={activeTab === 'terminal'}
                    onClick={() => onTabChange('terminal')}
                    isMobile={isMobile}
                />
                <TabButton
                    label={t('ide.output')}
                    isActive={activeTab === 'output'}
                    onClick={() => onTabChange('output')}
                    isMobile={isMobile}
                />
                <TabButton
                    label={t('ide.problems')}
                    isActive={activeTab === 'problems'}
                    onClick={() => onTabChange('problems')}
                    isMobile={isMobile}
                />
            </div>

            {/* Tab Content */}
            <div className="flex-1 bg-background min-h-0 relative">
                {activeTab === 'terminal' ? (
                    XTerminal ? (
                        <Suspense fallback={
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                {t('terminal.loading', 'Loading terminal...')}
                            </div>
                        }>
                            <XTerminal
                                initialSyncCompleted={initialSyncCompleted}
                                permissionState={permissionState}
                            />
                        </Suspense>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                            {t('terminal.loading', 'Loading terminal...')}
                        </div>
                    )
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        {activeTab === 'output'
                            ? t('ide.outputSoon')
                            : t('ide.problemsSoon')}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Sub-components
// ============================================================================

interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
    /** MRT-6: Mobile flag for touch target sizing */
    isMobile?: boolean;
}

/**
 * TabButton - Individual tab button in the terminal panel.
 * MRT-6: Enhanced with mobile touch targets
 */
function TabButton({
    label,
    isActive,
    onClick,
    isMobile = false,
}: TabButtonProps): React.JSX.Element {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'font-medium flex items-center justify-center transition-colors',
                // MRT-6: Touch optimization for mobile
                isMobile && 'touch-manipulation',
                // MRT-6: Larger touch targets on mobile (44x44 minimum)
                isMobile ? 'min-w-[44px] min-h-[44px] px-3 text-sm' : 'h-full text-xs',
                // Active/inactive state styling
                isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
            )}
        >
            {label}
        </button>
    );
}
