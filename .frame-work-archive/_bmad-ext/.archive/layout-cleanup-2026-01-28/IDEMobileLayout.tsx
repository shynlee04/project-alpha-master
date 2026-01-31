/**
 * IDEMobileLayout Component
 *
 * Mobile-optimized layout for the IDE workspace with bottom navigation panels.
 * Features:
 * - Bottom navigation bar (Files, Terminal, Chat, Settings)
 * - Single-panel focus mode for phone optimization
 * - 44px minimum touch targets (WCAG 2.5.5)
 * - 200ms Framer Motion transitions
 * - State persistence across panel switches
 *
 * @epic EPIC-MOBILE (Mobile UX Integration)
 * @story MOBILE-03
 */

import { useState, useEffect, lazy, Suspense } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, Terminal, Sparkles, Settings, Play, RefreshCw, Menu } from 'lucide-react'

// Lazy-loaded IDE components for performance
const FileTree = lazy(() => import('./FileTree').then((m) => ({ default: m.FileTree })))
const XTerminal = lazy(() => import('./XTerminal').then((m) => ({ default: m.XTerminal })))
const AgentChatPanel = lazy(() => import('./AgentChatPanel').then((m) => ({ default: m.AgentChatPanel })))
const SettingsPanel = lazy(() => import('./SettingsPanel').then((m) => ({ default: m.SettingsPanel })))

// Error boundary
import { WithErrorBoundary } from '@/presentation/components/common/ErrorBoundary'

// Hooks
import { useIDEStore } from '@/infrastructure/persistence/stores'
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace'

// Types
type MobileIDEPanel = 'files' | 'terminal' | 'chat' | 'settings'

interface IDEMobileLayoutProps {
  /** Project ID for state management */
  projectId?: string
  /** Active panel (controlled) */
  activePanel?: MobileIDEPanel
  /** Panel change callback */
  onPanelChange?: (panel: MobileIDEPanel) => void
  /** Show/hide header (default: true) */
  showHeader?: boolean
}

/**
 * Hook for managing mobile panel state with localStorage persistence
 */
function useIDEMobilePanel(
  defaultPanel: MobileIDEPanel
): [MobileIDEPanel, React.Dispatch<React.SetStateAction<MobileIDEPanel>>] {
  const [panel, setPanel] = useState<MobileIDEPanel>(() => {
    if (typeof window === 'undefined') return defaultPanel
    const saved = localStorage.getItem('mobile-ide-panel')
    // Validate saved value is a valid MobileIDEPanel before using it
    const validPanels = ['files', 'terminal', 'chat', 'settings'] as const
    return saved && validPanels.includes(saved as MobileIDEPanel)
      ? (saved as MobileIDEPanel)
      : defaultPanel
  })

  useEffect(() => {
    localStorage.setItem('mobile-ide-panel', panel)
  }, [panel])

  return [panel, setPanel]
}

/**
 * Loading skeleton for panels
 */
function PanelLoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        <span className="text-sm font-mono">Loading {label}...</span>
      </div>
    </div>
  )
}

/**
 * Error fallback for panels
 */
function PanelErrorFallback({ label }: { label: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <p className="text-sm font-medium text-destructive">{label} Error</p>
        <p className="text-xs text-muted-foreground mt-1">
          Please refresh to try again
        </p>
      </div>
    </div>
  )
}

/**
 * Bottom navigation tabs for IDE
 */
const BOTTOM_NAV_TABS = [
  { id: 'files', label: 'Files', icon: Folder },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'chat', label: 'AI Chat', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

/**
 * IDEMobileLayout - Main mobile IDE layout orchestrator
 *
 * @example
 * ```tsx
 * <IDEMobileLayout projectId="my-project" />
 * ```
 */
export function IDEMobileLayout({
  projectId,
  activePanel,
  onPanelChange,
  showHeader = true,
}: IDEMobileLayoutProps) {
  // State management
  const [internalPanel, setInternalPanel] = useIDEMobilePanel('files')
  // Use activePanel from props in controlled mode, fallback to internal state
  // This prevents currentPanel from being undefined when activePanel is not provided
  const currentPanel = onPanelChange && activePanel !== undefined ? activePanel : internalPanel
  // In controlled mode, use parent's callback; otherwise use internal state setter
  const setCurrentPanel = onPanelChange ?? setInternalPanel

  // IDE store state
  // PERF-02: Use useShallow to prevent re-renders on unrelated state changes
  const { activeFile: activeFilePath, setActiveFile, addOpenFile } = useIDEStore(
    useShallow((s) => ({
      activeFile: s.activeFile,
      setActiveFile: s.setActiveFile,
      addOpenFile: s.addOpenFile,
    }))
  )

  // FileTree refresh state
  const [fileTreeRefreshKey, setFileTreeRefreshKey] = useState(0)

  // Workspace sync state
  const { syncStatus, projectMetadata } = useWorkspaceSync()

  // Handle panel change
  const handlePanelChange = (panelId: MobileIDEPanel) => {
    setCurrentPanel(panelId)
  }

  // Handle file selection from FileTree
  const handleFileSelect = async (path: string, _handle: FileSystemFileHandle) => {
    // Add to open files and set as active
    addOpenFile(path)
    setActiveFile(path)
  }

  // Get project name with fallback
  const displayName = projectMetadata?.name || projectId || 'via-gent'

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      {/* Header */}
      {showHeader && (
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-none hover:bg-muted touch-target-min"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-mono text-sm font-bold">{displayName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-none hover:bg-muted touch-target-min"
              aria-label="Refresh"
              onClick={() => setFileTreeRefreshKey((k) => k + 1)}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-none bg-green-600 text-white touch-target-min"
              aria-label="Run code"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium hidden xs:inline">Run</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPanel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Suspense fallback={<PanelLoadingSkeleton label={currentPanel ?? 'panel'} />}>
              <WithErrorBoundary fallback={<PanelErrorFallback label={currentPanel ?? 'panel'} />}>
                {currentPanel === 'files' && (
                  <div className="h-full overflow-auto bg-sidebar">
                    <div className="p-2">
                      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        Explorer
                      </h2>
                      <FileTree
                        selectedPath={activeFilePath ?? undefined}
                        onFileSelect={handleFileSelect}
                        refreshKey={fileTreeRefreshKey}
                      />
                    </div>
                  </div>
                )}

                {currentPanel === 'terminal' && (
                  <XTerminal
                    initialSyncCompleted={syncStatus !== 'idle'}
                    permissionState="granted"
                  />
                )}

                {currentPanel === 'chat' && (
                  <AgentChatPanel
                    projectId={projectId ?? null}
                    projectName={displayName}
                    workspaceType="ide"
                  />
                )}

                {currentPanel === 'settings' && <SettingsPanel />}
              </WithErrorBoundary>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="flex-shrink-0 h-16 border-t border-border bg-card safe-area-pb">
        <div className="flex h-full max-w-md mx-auto">
          {BOTTOM_NAV_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = currentPanel === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => handlePanelChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors touch-target-min ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={`Navigate to ${tab.label}`}
                aria-selected={isActive}
                role="tab"
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="ide-nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
                <span className="text-xs">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default IDEMobileLayout
