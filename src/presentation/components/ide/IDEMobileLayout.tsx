/**
 * IDEMobileLayout Component
 * 
 * Mobile-optimized layout for the IDE workspace with collapsible bottom panel.
 * Features:
 * - Collapsible bottom panel (files, terminal)
 * - Panel tabs (Files, Terminal)
 * - Drag gestures for panel resize
 * - Snap points (collapsed, partial, expanded)
 * - Virtual keyboard awareness
 * - 60fps smooth animations
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, FileCode, Terminal, Menu, Play, RefreshCw } from 'lucide-react'
import { useMobilePanelState } from '@/hooks/usePanelGestures'

interface IDEMobileLayoutProps {
  codeEditor: React.ReactNode
  fileTree: React.ReactNode
  terminal: React.ReactNode
  activePanelTab?: 'files' | 'terminal' | null
  onPanelTabChange?: (tab: 'files' | 'terminal' | null) => void
  projectName?: string
  onRunCode?: () => void
  onRefresh?: () => void
  onMenu?: () => void
}

export function IDEMobileLayout({
  codeEditor,
  fileTree,
  terminal,
  activePanelTab = 'files',
  onPanelTabChange,
  projectName = 'via-gent',
  onRunCode,
  onRefresh,
  onMenu,
}: IDEMobileLayoutProps) {
  const [internalPanelTab, setInternalPanelTab] = useState<'files' | 'terminal' | null>(activePanelTab)
  
  const { mode, setCollapsed, setPartial, setExpanded, toggle } = useMobilePanelState('partial')
  const currentPanelTab = onPanelTabChange ? activePanelTab : internalPanelTab

  const handlePanelTabChange = (tab: 'files' | 'terminal') => {
    if (onPanelTabChange) {
      onPanelTabChange(tab === currentPanelTab ? null : tab)
    } else {
      setInternalPanelTab(tab === internalPanelTab ? null : tab)
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <button onClick={onMenu} className="p-2 rounded-none hover:bg-muted touch-target-min" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-mono text-sm font-bold">{projectName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-2 rounded-none hover:bg-muted touch-target-min" aria-label="Refresh">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={onRunCode} className="flex items-center gap-2 px-3 py-2 rounded-none bg-green-600 text-white touch-target-min" aria-label="Run code">
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium hidden xs:inline">Run</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">{codeEditor}</main>

      <motion.div
        className="flex-shrink-0 border-t border-border bg-card transition-all duration-300 ease-out"
        animate={{ height: mode === 'collapsed' ? 48 : mode === 'expanded' ? undefined : 192 }}
      >
        <button onClick={toggle} className="w-full h-12 flex items-center justify-between px-4 touch-manipulation" aria-label={mode === 'expanded' ? 'Collapse panel' : 'Expand panel'}>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handlePanelTabChange('files'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-medium transition-colors touch-target-min ${currentPanelTab === 'files' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <FileCode className="w-4 h-4" />
              <span className="hidden xs:inline">Files</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handlePanelTabChange('terminal'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-medium transition-colors touch-target-min ${currentPanelTab === 'terminal' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden xs:inline">Terminal</span>
            </button>
          </div>
          <motion.div animate={{ rotate: mode === 'expanded' ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence mode="wait">
          {currentPanelTab && (
            <motion.div key={currentPanelTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.15 }} className="h-[calc(100%-48px)] overflow-hidden">
              {currentPanelTab === 'files' ? fileTree : terminal}
            </motion.div>
          )}
        </AnimatePresence>

        {mode === 'expanded' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-0 left-0 right-0 p-2 bg-card border-t border-border flex items-center justify-center gap-2">
            <button onClick={setCollapsed} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground touch-target-min">Collapse</button>
            <button onClick={setPartial} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground touch-target-min">Partial</button>
            <div className="w-px h-4 bg-border" />
            <button onClick={setExpanded} className="px-3 py-1.5 text-xs text-primary touch-target-min">Expand</button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default IDEMobileLayout
