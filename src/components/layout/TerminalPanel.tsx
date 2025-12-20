/**
 * @fileoverview Terminal Panel Component
 * @module components/layout/TerminalPanel
 * 
 * Bottom panel containing terminal, output, and problems tabs.
 * Part of the IDE layout refactoring to reduce IDELayout.tsx complexity.
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
import { type TerminalTab } from '../../lib/workspace';

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
    /** Project path for terminal working directory */
    projectPath?: string;
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
    projectPath,
}: TerminalPanelProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="h-full flex flex-col border-t border-slate-800">
            {/* Tab Bar */}
            <div className="h-8 px-4 flex items-center gap-6 border-b border-slate-800/50">
                <TabButton
                    label={t('ide.terminal')}
                    isActive={activeTab === 'terminal'}
                    onClick={() => onTabChange('terminal')}
                />
                <TabButton
                    label={t('ide.output')}
                    isActive={activeTab === 'output'}
                    onClick={() => onTabChange('output')}
                />
                <TabButton
                    label={t('ide.problems')}
                    isActive={activeTab === 'problems'}
                    onClick={() => onTabChange('problems')}
                />
            </div>

            {/* Tab Content */}
            <div className="flex-1 bg-slate-950 min-h-0 relative">
                {activeTab === 'terminal' ? (
                    XTerminal ? (
                        <Suspense fallback={
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                {t('terminal.loading', 'Loading terminal...')}
                            </div>
                        }>
                            <XTerminal projectPath={projectPath} />
                        </Suspense>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                            {t('terminal.loading', 'Loading terminal...')}
                        </div>
                    )
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
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
}

/**
 * TabButton - Individual tab button in the terminal panel.
 */
function TabButton({
    label,
    isActive,
    onClick,
}: TabButtonProps): React.JSX.Element {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                isActive
                    ? 'text-xs font-medium text-cyan-400 border-b-2 border-cyan-400 h-full flex items-center'
                    : 'text-xs font-medium text-slate-500 hover:text-slate-300 h-full flex items-center'
            }
        >
            {label}
        </button>
    );
}
