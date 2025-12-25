import { useState, useEffect, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import {
    Files,
    Bot,
    Search,
    Settings,
    ChevronLeft,
    ChevronRight,
    Terminal,
    GitBranch
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/styles/design-tokens.css'

/**
 * IconSidebar - VS Code-style activity bar with collapsible content panel
 *
 * Features:
 * - Responsive activity bar with icons (mobile: 40px, tablet+: 48px)
 * - Responsive collapsible content panel (mobile: 200px, tablet: 240px, desktop: 280px)
 * - Keyboard shortcut support (Ctrl+B to toggle)
 * - LocalStorage persistence
 * - Smooth animations
 * - 8-bit pixel aesthetic
 * - Mobile-first responsive design (P1.7)
 * - Touch-friendly button sizes (minimum 44x44px for mobile)
 */

// Panel IDs
type PanelId = 'explorer' | 'agents' | 'search' | 'terminal' | 'git' | 'settings' | null

// Context for sidebar state
interface SidebarContextType {
    activePanel: PanelId
    setActivePanel: (panel: PanelId) => void
    isCollapsed: boolean
    toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error('useSidebar must be used within SidebarProvider')
    }
    return context
}

// Sidebar Provider
export function SidebarProvider({
    children,
    defaultPanel = 'explorer',
    defaultCollapsed = false
}: {
    children: React.ReactNode
    defaultPanel?: PanelId
    defaultCollapsed?: boolean
}) {
    const [activePanel, setActivePanel] = useState<PanelId>(() => {
        if (typeof window === 'undefined') return defaultPanel
        const stored = localStorage.getItem('viagent-sidebar-panel')
        return (stored as PanelId) || defaultPanel
    })

    const [isCollapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') return defaultCollapsed
        return localStorage.getItem('viagent-sidebar-collapsed') === 'true'
    })

    // Persist state
    useEffect(() => {
        localStorage.setItem('viagent-sidebar-panel', activePanel || '')
        localStorage.setItem('viagent-sidebar-collapsed', String(isCollapsed))
    }, [activePanel, isCollapsed])

    // Keyboard shortcut: Ctrl+B to toggle sidebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault()
                setCollapsed(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleSetActivePanel = (panel: PanelId) => {
        if (panel === activePanel) {
            // Toggle collapse when clicking same panel
            setCollapsed(prev => !prev)
        } else {
            setActivePanel(panel)
            setCollapsed(false)
        }
    }

    return (
        <SidebarContext.Provider
            value={{
                activePanel,
                setActivePanel: handleSetActivePanel,
                isCollapsed,
                toggleCollapsed: () => setCollapsed(prev => !prev)
            }}
        >
            {children}
        </SidebarContext.Provider>
    )
}

// Activity Bar (responsive: mobile 40px, tablet+ 48px)
export function ActivityBar({ className }: { className?: string }) {
    const { t } = useTranslation()
    const { activePanel, setActivePanel, isCollapsed, toggleCollapsed } = useSidebar()

    const items = [
        { id: 'explorer' as PanelId, icon: Files, label: t('sidebar.explorer', 'Explorer') },
        { id: 'agents' as PanelId, icon: Bot, label: t('sidebar.agents', 'Agents') },
        { id: 'search' as PanelId, icon: Search, label: t('sidebar.search', 'Search') },
        { id: 'terminal' as PanelId, icon: Terminal, label: t('sidebar.terminal', 'Terminal') },
        { id: 'git' as PanelId, icon: GitBranch, label: t('sidebar.git', 'Git') },
    ]

    const bottomItems = [
        { id: 'settings' as PanelId, icon: Settings, label: t('sidebar.settings', 'Settings') },
    ]

    return (
        <div
            className={cn(
                "flex flex-col bg-background border-r border-border h-full",
                className
            )}
            style={{ width: 'var(--sidebar-activity-bar)' }}
        >
            {/* Top icons */}
            <div className="flex-1 flex flex-col py-2">
                {items.map((item) => (
                    <ActivityBarItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activePanel === item.id && !isCollapsed}
                        onClick={() => setActivePanel(item.id)}
                    />
                ))}
            </div>

            {/* Bottom icons */}
            <div className="flex flex-col pb-2 border-t border-border pt-2">
                {bottomItems.map((item) => (
                    <ActivityBarItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activePanel === item.id && !isCollapsed}
                        onClick={() => setActivePanel(item.id)}
                    />
                ))}

                {/* Collapse toggle */}
                <ActivityBarItem
                    icon={isCollapsed ? ChevronRight : ChevronLeft}
                    label={isCollapsed ? t('sidebar.expand', 'Expand') : t('sidebar.collapse', 'Collapse')}
                    isActive={false}
                    onClick={toggleCollapsed}
                />
            </div>
        </div>
    )
}

// Activity Bar Item
function ActivityBarItem({
    icon: Icon,
    label,
    isActive,
    onClick
}: {
    icon: React.ElementType
    label: string
    isActive: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={cn(
                "relative flex items-center justify-center transition-colors group",
                isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
            style={{
                width: 'var(--sidebar-activity-bar)',
                height: 'var(--sidebar-activity-bar-height)'
            }}
        >
            {/* Active indicator bar */}
            {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary" />
            )}
            <Icon className="w-5 h-5" />
        </button>
    )
}

// Sidebar Content Panel (responsive: mobile 200px, tablet 240px, desktop 280px, collapsible)
export function SidebarContent({
    children,
    className
}: {
    children: React.ReactNode
    className?: string
}) {
    const { isCollapsed } = useSidebar()

    return (
        <div
            className={cn(
                "bg-card border-r border-border overflow-hidden transition-all duration-300 ease-in-out",
                isCollapsed && "w-0",
                className
            )}
            style={!isCollapsed ? { width: 'var(--sidebar-content-panel)' } : undefined}
        >
            <div className={cn(
                "h-full flex flex-col",
                isCollapsed && "invisible"
            )}
            style={{ width: 'var(--sidebar-content-panel)' }}>
                {children}
            </div>
        </div>
    )
}

// Sidebar Header (responsive: mobile h-8, tablet+ h-10)
export function SidebarHeader({
    title,
    actions
}: {
    title: string
    actions?: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between h-8 md:h-10 px-3 md:px-4 py-1.5 md:py-2 border-b border-border bg-secondary/30">
            <span className="text-xs md:text-sm font-pixel uppercase tracking-wider text-muted-foreground">
                {title}
            </span>
            {actions && (
                <div className="flex items-center gap-1">
                    {actions}
                </div>
            )}
        </div>
    )
}

// Export everything
export { SidebarContext }
export type { PanelId, SidebarContextType }
