/**
 * NotesMobileLayout Component
 * 
 * Mobile-optimized layout for the Notes workspace with tab-based navigation.
 * Features:
 * - Bottom navigation bar (Notes, Search, AI)
 * - Content tabs (All, Favorites, Tags)
 * - 44px minimum touch targets
 * - Framer Motion transitions (200ms)
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, Search, Sparkles, FileText, Star, Tag, Plus } from 'lucide-react'

// Tab configuration
const CONTENT_TABS = [
  { id: 'all', label: 'All', icon: <FileText className="w-5 h-5" /> },
  { id: 'favorites', label: 'Favorites', icon: <Star className="w-5 h-5" /> },
  { id: 'tags', label: 'Tags', icon: <Tag className="w-5 h-5" /> },
] as const

// Bottom navigation tabs
const BOTTOM_NAV_TABS = [
  { id: 'notes', label: 'Notes', icon: <Folder className="w-5 h-5" />, badge: null },
  { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" />, badge: null },
  { id: 'ai', label: 'AI', icon: <Sparkles className="w-5 h-5" />, badge: null },
] as const

interface NotesMobileLayoutProps {
  /** The content to render (note list, search results, or AI chat) */
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
  /** Callback for create new note action */
  onCreateNote?: () => void
}

export function NotesMobileLayout({
  children,
  activeContentTab = 'all',
  onContentTabChange,
  activeNavTab = 'notes',
  onNavTabChange,
  title = 'Notes',
  onCreateNote,
}: NotesMobileLayoutProps) {
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
      {/* Header - Fixed */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-border bg-card">
        <h1 className="text-lg font-bold">{title}</h1>
        <button
          onClick={onCreateNote}
          className="p-2 rounded-none bg-primary text-primary-foreground touch-target-min flex items-center justify-center"
          aria-label="Create new note"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Content Tabs */}
        <div className="flex border-b border-border bg-muted/30 sticky top-0 z-10">
          {CONTENT_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleContentTabChange(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors touch-target-min flex items-center justify-center gap-1 ${
                currentContentTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={`Switch to ${tab.label} tab`}
              aria-selected={currentContentTab === tab.id}
              role="tab"
            >
              {tab.icon}
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentContentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              role="tabpanel"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
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
                {/* Badge indicator */}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
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
 * NotesMobileLayout with integrated note list state
 */
interface NotesMobileWithStateProps {
  /** Mock notes for demo */
  notes?: Array<{
    id: string
    title: string
    preview: string
    updatedAt: Date
    isFavorite: boolean
    tags: string[]
  }>
}

export function NotesMobileLayoutWithState({
  notes = [],
}: NotesMobileWithStateProps) {
  const [activeContentTab, setActiveContentTab] = useState('all')
  const [activeNavTab, setActiveNavTab] = useState('notes')

  // Filter notes based on active tab
  const filteredNotes = notes.filter((note) => {
    if (activeContentTab === 'favorites') return note.isFavorite
    if (activeContentTab === 'tags') return note.tags.length > 0
    return true
  })

  const handleCreateNote = () => {
    // TODO: Implement create note
    console.log('Create note')
  }

  return (
    <NotesMobileLayout
      activeContentTab={activeContentTab}
      onContentTabChange={setActiveContentTab}
      activeNavTab={activeNavTab}
      onNavTabChange={setActiveNavTab}
      onCreateNote={handleCreateNote}
    >
      {/* Note List */}
      <div className="space-y-2">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notes yet</p>
            <p className="text-sm">Tap + to create your first note</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-card border border-border rounded-none touch-target-min"
            >
              <h3 className="font-medium mb-1">{note.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {note.preview}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {note.isFavorite && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-muted rounded-none"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </NotesMobileLayout>
  )
}

export default NotesMobileLayout
