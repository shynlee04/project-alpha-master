/**
 * @fileoverview Mobile Tab Bar Component
 * @module components/layout/MobileTabBar
 *
 * Bottom navigation bar for mobile IDE panels.
 * Provides tab-based navigation between Files, Editor, Preview, Terminal, and Chat.
 *
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-2 Create Mobile Tab Bar
 *
 * Design: Fixed bottom bar with 5 panel icons, touch-friendly targets (≥44px)
 * Following iOS/Android bottom navigation patterns
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Folder,
    Code2,
    Monitor,
    Terminal,
    MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Panel types available in mobile IDE
 */
export type MobilePanelType = 'files' | 'editor' | 'preview' | 'terminal' | 'chat';

/**
 * Tab configuration with icon and label
 */
interface TabConfig {
    id: MobilePanelType;
    icon: React.ElementType;
    labelKey: string;
    fallbackLabel: string;
}

/**
 * Tab definitions - order determines display order in tab bar
 */
const TABS: TabConfig[] = [
    { id: 'files', icon: Folder, labelKey: 'ide.tabs.files', fallbackLabel: 'Files' },
    { id: 'editor', icon: Code2, labelKey: 'ide.tabs.editor', fallbackLabel: 'Edit' },
    { id: 'preview', icon: Monitor, labelKey: 'ide.tabs.preview', fallbackLabel: 'Preview' },
    { id: 'terminal', icon: Terminal, labelKey: 'ide.tabs.terminal', fallbackLabel: 'Term' },
    { id: 'chat', icon: MessageSquare, labelKey: 'ide.tabs.chat', fallbackLabel: 'Chat' },
];

interface MobileTabBarProps {
    /** Currently active panel */
    activePanel: MobilePanelType;
    /** Callback when panel is selected */
    onPanelChange: (panel: MobilePanelType) => void;
    /** Optional additional class names */
    className?: string;
    /** Whether to show labels under icons (default: true) */
    showLabels?: boolean;
}

/**
 * MobileTabBar - Bottom navigation for mobile IDE
 *
 * Features:
 * - 5 panel tabs with icons and labels
 * - Touch targets ≥44px (WCAG 2.5.5 compliance)
 * - Active state with primary color indicator
 * - Safe area inset support for notched devices
 * - i18n support for labels
 *
 * @example
 * ```tsx
 * <MobileTabBar
 *   activePanel={activePanel}
 *   onPanelChange={setActivePanel}
 * />
 * ```
 */
export const MobileTabBar: React.FC<MobileTabBarProps> = ({
    activePanel,
    onPanelChange,
    className,
    showLabels = true,
}) => {
    const { t } = useTranslation();

    return (
        <nav
            className={cn(
                // Base styles
                'fixed bottom-0 left-0 right-0 z-40',
                'bg-sidebar border-t border-border',
                // Flex layout for tabs
                'flex items-center justify-around',
                // Height with safe area padding for notched devices
                'h-14 pb-[env(safe-area-inset-bottom)]',
                // Only show on mobile (<768px)
                'md:hidden',
                // Animation for entrance
                'animate-in slide-in-from-bottom-4 duration-300',
                className
            )}
            role="tablist"
            aria-label="IDE Panel Navigation"
        >
            {TABS.map((tab) => {
                const isActive = activePanel === tab.id;
                const Icon = tab.icon;
                const label = t(tab.labelKey, tab.fallbackLabel);

                return (
                    <button
                        key={tab.id}
                        onClick={() => onPanelChange(tab.id)}
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`panel-${tab.id}`}
                        className={cn(
                            // Base button styles
                            'flex flex-col items-center justify-center',
                            // Touch target size (min 44px)
                            'min-w-[44px] min-h-[44px] w-full h-full',
                            // Remove button styling
                            'border-0 bg-transparent',
                            // Touch optimization
                            'touch-manipulation select-none',
                            // Transition for smooth state changes
                            'transition-colors duration-200',
                            // Focus visible styles for accessibility
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            // Color based on active state
                            isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground active:text-foreground'
                        )}
                    >
                        {/* Active indicator bar */}
                        {isActive && (
                            <div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                                aria-hidden="true"
                            />
                        )}

                        {/* Icon */}
                        <Icon
                            className={cn(
                                'h-5 w-5 shrink-0',
                                isActive ? 'animate-in zoom-in-95 duration-200' : ''
                            )}
                            aria-hidden="true"
                        />

                        {/* Label */}
                        {showLabels && (
                            <span
                                className={cn(
                                    'text-[10px] mt-0.5 font-mono',
                                    'truncate max-w-[48px]'
                                )}
                            >
                                {label}
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
};

/**
 * Hook for managing mobile panel state with persistence
 *
 * @param defaultPanel - Initial panel to show
 * @returns Tuple of [activePanel, setActivePanel]
 */
export function useMobilePanel(
    defaultPanel: MobilePanelType = 'files'
): [MobilePanelType, React.Dispatch<React.SetStateAction<MobilePanelType>>] {
    const [activePanel, setActivePanel] = React.useState<MobilePanelType>(defaultPanel);

    return [activePanel, setActivePanel];
}

export default MobileTabBar;
