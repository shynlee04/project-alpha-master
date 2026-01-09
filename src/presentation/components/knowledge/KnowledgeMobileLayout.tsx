/**
 * KnowledgeMobileLayout Component
 * 
 * Mobile-optimized layout for the Knowledge workspace with tab-based navigation.
 * Features:
 * - Bottom navigation bar (Browse, Search, AI)
 * - Content tabs (Browse, Collections, Recent)
 * - Grid layout for sources display
 * - 44px minimum touch targets
 * - Framer Motion transitions (200ms)
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Library, Search, Sparkles, Grid, FolderOpen, FileText, Plus, Share2, MoreVertical } from 'lucide-react'

// Content tabs specific to Knowledge
const CONTENT_TABS = [
  { id: 'browse', label: 'Browse', icon: <Grid className="w-5 h-5" /> },
  { id: 'collections', label: 'Collections', icon: <FolderOpen className="w-5 h-5" /> },
  { id: 'recent', label: 'Recent', icon: <FileText className="w-5 h-5" /> },
] as const

// Bottom navigation tabs
const BOTTOM_NAV_TABS = [
  { id: 'browse', label: 'Browse', icon: <Library className="w-5 h-5" /> },
  { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
  { id: 'ai', label: 'AI Chat', icon: <Sparkles className="w-5 h-5" /> },
] as const

interface KnowledgeMobileLayoutProps {
  /** The content to render */
  children: React.ReactNode
  /** Current active content tab */
  activeContentTab?: string
  /** Callback when content tab changes */
  onContentTabChange?: (tab: string) => void
  /** Current active bottom nav tab */
  activeNavTab?: string
  /** Callback when bottom nav tab changes */
  onNavTabChange?: (tab: string) => void
  /** Title to display in header */
  title?: string
  /** Callback for add source action */
  onAddSource?: () => void
}

export function KnowledgeMobileLayout({
  children,
  activeContentTab = 'browse',
  onContentTabChange,
  activeNavTab = 'browse',
  onNavTabChange,
  title = 'Knowledge',
  onAddSource,
}: KnowledgeMobileLayoutProps) {
  const [internalContentTab, setInternalContentTab] = useState(activeContentTab)
  const [internalNavTab, setInternalNavTab] = useState(activeNavTab)

  const currentContentTab = onContentTabChange ? activeContentTab : internalContentTab
  const currentNavTab = onNavTabChange ? activeNavTab : internalNavTab

  const handleContentTabChange = (tabId: string) => {
    if (onContentTabChange) {
      onContentTabChange(tabId)
    } else {
      setInternalContentTab(tabId)
    }
  }

  const handleNavTabChange = (tabId: string) => {
    if (onNavTabChange) {
      onNavTabChange(tabId)
    } else {
      setInternalNavTab(tabId)
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-border bg-card">
        <h1 className="text-lg font-bold">{title}</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddSource}
            className="p-2 rounded-none bg-primary text-primary-foreground touch-target-min flex items-center justify-center"
            aria-label="Add new source"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content Tabs */}
      <div className="flex border-b border-border bg-muted/30 overflow-x-auto sticky top-0 z-10">
        {CONTENT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleContentTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors touch-target-min ${
              currentContentTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={`Switch to ${tab.label} tab`}
            aria-selected={currentContentTab === tab.id}
            role="tab"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <motion.div
          key={currentContentTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="tabpanel"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 h-16 border-t border-border bg-card safe-area-pb">
        <div className="flex h-full max-w-md mx-auto">
          {BOTTOM_NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors touch-target-min ${
                currentNavTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={`Navigate to ${tab.label}`}
              aria-selected={currentNavTab === tab.id}
              role="tab"
            >
              <div className="relative">
                {tab.icon}
                {/* Active indicator */}
                {currentNavTab === tab.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

/**
 * KnowledgeMobileLayout with integrated sources grid
 */
interface KnowledgeSource {
  id: string
  title: string
  type: 'pdf' | 'url' | 'text' | 'collection'
  thumbnail?: string
  itemCount?: number
  lastAccessed?: Date
}

interface KnowledgeMobileWithStateProps {
  /** Mock sources for demo */
  sources?: KnowledgeSource[]
  /** Mock collections for demo */
  collections?: Array<{
    id: string
    name: string
    sourceCount: number
  }>
}

export function KnowledgeMobileLayoutWithState({
  sources = [],
  collections = [],
}: KnowledgeMobileWithStateProps) {
  const [activeContentTab, setActiveContentTab] = useState('browse')
  const [activeNavTab, setActiveNavTab] = useState('browse')

  const handleAddSource = () => {
    // TODO: Implement add source
    console.log('Add source')
  }

  return (
    <KnowledgeMobileLayout
      activeContentTab={activeContentTab}
      onContentTabChange={setActiveContentTab}
      activeNavTab={activeNavTab}
      onNavTabChange={setActiveNavTab}
      onAddSource={handleAddSource}
    >
      {/* Browse Tab - Sources Grid */}
      {activeContentTab === 'browse' && (
        <div className="grid grid-cols-2 gap-3">
          {sources.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Library className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No sources yet</p>
              <p className="text-sm">Tap + to add your first source</p>
            </div>
          ) : (
            sources.map((source) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square bg-card border border-border rounded-none p-4 touch-target-min flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-none ${
                    source.type === 'pdf' ? 'bg-red-500/20 text-red-500' :
                    source.type === 'url' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {source.type === 'pdf' && <FileText className="w-5 h-5" />}
                    {source.type === 'url' && <Share2 className="w-5 h-5" />}
                    {source.type === 'text' && <Library className="w-5 h-5" />}
                  </div>
                  <button
                    className="p-1 text-muted-foreground hover:text-foreground"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-medium text-sm line-clamp-2">{source.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{source.type}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Collections Tab */}
      {activeContentTab === 'collections' && (
        <div className="space-y-2">
          {collections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No collections yet</p>
              <p className="text-sm">Group your sources into collections</p>
            </div>
          ) : (
            collections.map((collection) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-card border border-border rounded-none touch-target-min flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-none">
                    <FolderOpen className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {collection.sourceCount} sources
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="More options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Recent Tab */}
      {activeContentTab === 'recent' && (
        <div className="space-y-2">
          {sources.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Your recently accessed sources will appear here</p>
            </div>
          ) : (
            sources.slice(0, 5).map((source) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-card border border-border rounded-none touch-target-min flex items-center gap-3"
              >
                <div className={`p-2 rounded-none ${
                  source.type === 'pdf' ? 'bg-red-500/20 text-red-500' :
                  source.type === 'url' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-green-500/20 text-green-500'
                }`}>
                  {source.type === 'pdf' && <FileText className="w-5 h-5" />}
                  {source.type === 'url' && <Share2 className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{source.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {source.lastAccessed?.toLocaleDateString() || 'Recently'}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </KnowledgeMobileLayout>
  )
}

export default KnowledgeMobileLayout
