/**
 * @fileoverview UX Redesign Spike - Primary + Helper Surface Model
 * @spike UX-SPIKE-2026-01-14
 * @status IN_PROGRESS
 * 
 * This spike implements the new layout paradigm:
 * - Primary Surface: Main work area (one per screen)
 * - Helper Surface: Contextual panel (toggleable, one at a time)
 * - Focus Mode: Collapse helpers to icon rail
 * - Progressive Disclosure: Show complexity only when needed
 * 
 * CONSTRAINTS (8-bit aesthetic):
 * - NO blur, NO transparency, NO rounded corners >2px
 * - Solid backgrounds only (bg-card, bg-background)
 * - Pixel shadows (4px 4px 0 0)
 * - 44px minimum touch targets
 * - 16px min font on inputs (no iOS zoom)
 */

import { createFileRoute } from '@tanstack/react-router';
import React, { useState, createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  Files,
  MessageSquare,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Home,
  Code2,
  BookOpen,
  Notebook,
  Brain,
  Terminal,
  Eye,
  Menu,
} from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type WorkspaceType = 'hub' | 'ide' | 'notes' | 'knowledge' | 'study';
type HelperType = 'files' | 'chat' | 'search' | 'inspector' | 'sources' | 'threads' | null;
type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface LayoutContextValue {
  // Current state
  workspace: WorkspaceType;
  helper: HelperType;
  focusMode: boolean;
  device: DeviceType;
  
  // Actions
  setWorkspace: (ws: WorkspaceType) => void;
  setHelper: (h: HelperType) => void;
  toggleHelper: (h: HelperType) => void;
  toggleFocusMode: () => void;
}

interface WorkspaceShellProps {
  children: ReactNode;
  workspace: WorkspaceType;
  defaultHelper?: HelperType;
}

interface PrimarySurfaceProps {
  children: ReactNode;
  className?: string;
}

interface HelperSurfaceProps {
  children: ReactNode;
  title: string;
  className?: string;
}

interface ActivityRailProps {
  className?: string;
}

interface BottomNavigationProps {
  className?: string;
}

// =============================================================================
// LAYOUT CONTEXT
// =============================================================================

const LayoutContext = createContext<LayoutContextValue | null>(null);

function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
}

function LayoutProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceType>('hub');
  const [helper, setHelper] = useState<HelperType>(null);
  const [focusMode, setFocusMode] = useState(false);
  
  // Detect device type
  const [device, setDevice] = useState<DeviceType>('desktop');
  
  React.useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      if (width < 768) setDevice('mobile');
      else if (width < 1024) setDevice('tablet');
      else setDevice('desktop');
    };
    updateDevice();
    window.addEventListener('resize', updateDevice);
    return () => window.removeEventListener('resize', updateDevice);
  }, []);
  
  const toggleHelper = (h: HelperType) => {
    setHelper(prev => prev === h ? null : h);
  };
  
  const toggleFocusMode = () => {
    setFocusMode(prev => !prev);
    if (!focusMode) setHelper(null); // Close helper when entering focus mode
  };
  
  return (
    <LayoutContext.Provider value={{
      workspace,
      helper,
      focusMode,
      device,
      setWorkspace,
      setHelper,
      toggleHelper,
      toggleFocusMode,
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

// =============================================================================
// ACTIVITY RAIL (Icon-only navigation, desktop focus mode)
// =============================================================================

function ActivityRail({ className }: ActivityRailProps) {
  const { workspace, setWorkspace, toggleHelper, helper, focusMode } = useLayout();
  
  const workspaceItems = [
    { id: 'hub', icon: Home, label: 'Hub' },
    { id: 'ide', icon: Code2, label: 'IDE' },
    { id: 'notes', icon: Notebook, label: 'Notes' },
    { id: 'knowledge', icon: Brain, label: 'Knowledge' },
    { id: 'study', icon: BookOpen, label: 'Study' },
  ] as const;
  
  const helperItems = [
    { id: 'files', icon: Files, label: 'Files' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'search', icon: Search, label: 'Search' },
  ] as const;
  
  return (
    <aside className={cn(
      'flex flex-col h-full border-r-2 border-border bg-sidebar',
      'w-12 shrink-0',
      className
    )}>
      {/* Workspace Navigation */}
      <nav className="flex-1 py-2 space-y-1">
        {workspaceItems.map(item => {
          const Icon = item.icon;
          const isActive = workspace === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setWorkspace(item.id)}
              className={cn(
                'flex items-center justify-center w-full h-10',
                'transition-colors duration-150',
                'border-l-2',
                isActive
                  ? 'bg-accent border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </nav>
      
      {/* Separator */}
      <div className="mx-2 border-t border-border" />
      
      {/* Helper Toggles */}
      <nav className="py-2 space-y-1">
        {helperItems.map(item => {
          const Icon = item.icon;
          const isActive = helper === item.id;
          return (
            <button
              key={item.id}
              onClick={() => toggleHelper(item.id)}
              className={cn(
                'flex items-center justify-center w-full h-10',
                'transition-colors duration-150',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
              title={item.label}
              aria-label={`Toggle ${item.label}`}
              aria-pressed={isActive}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </nav>
      
      {/* Settings */}
      <div className="p-2 border-t border-border">
        <button
          className="flex items-center justify-center w-full h-10 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}

// =============================================================================
// BOTTOM NAVIGATION (Mobile only, 48px height)
// =============================================================================

function BottomNavigation({ className }: BottomNavigationProps) {
  const { workspace, setWorkspace } = useLayout();
  
  const items = [
    { id: 'hub', icon: Home, label: 'Hub' },
    { id: 'ide', icon: Code2, label: 'IDE' },
    { id: 'notes', icon: Notebook, label: 'Notes' },
    { id: 'knowledge', icon: Brain, label: 'Knowledge' },
    { id: 'study', icon: BookOpen, label: 'Study' },
  ] as const;
  
  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-40',
      'flex items-center justify-around',
      'h-14 pb-[env(safe-area-inset-bottom)]',
      'bg-sidebar border-t-2 border-border',
      'md:hidden', // Only on mobile
      className
    )}>
      {items.map(item => {
        const Icon = item.icon;
        const isActive = workspace === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setWorkspace(item.id)}
            className={cn(
              'flex flex-col items-center justify-center',
              'min-w-[44px] min-h-[44px] flex-1',
              'transition-colors duration-150',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 font-mono">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// =============================================================================
// WORKSPACE SHELL (Consistent container for all workspaces)
// =============================================================================

function WorkspaceShell({ children, workspace, defaultHelper }: WorkspaceShellProps) {
  const { device, helper, focusMode, setHelper, setWorkspace } = useLayout();
  
  // Set workspace and default helper on mount
  React.useEffect(() => {
    setWorkspace(workspace);
    if (defaultHelper && device === 'desktop') {
      setHelper(defaultHelper);
    }
  }, [workspace, defaultHelper, device, setWorkspace, setHelper]);
  
  return (
    <div className="flex h-dvh w-full bg-background text-foreground overflow-hidden">
      {/* Activity Rail - Desktop only, or Focus Mode */}
      {device === 'desktop' && (
        <ActivityRail />
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Mobile Header */}
        {device === 'mobile' && (
          <MobileHeader />
        )}
        
        {/* Content */}
        <main className="flex-1 flex min-w-0 min-h-0 overflow-hidden">
          {children}
        </main>
      </div>
      
      {/* Bottom Navigation - Mobile only */}
      {device === 'mobile' && (
        <BottomNavigation />
      )}
    </div>
  );
}

// =============================================================================
// MOBILE HEADER
// =============================================================================

function MobileHeader() {
  const { toggleHelper, helper } = useLayout();
  
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b-2 border-border bg-sidebar shrink-0">
      <div className="flex items-center gap-3">
        <img src="/via-gent-logo.svg" alt="Via-gent" className="w-8 h-8" />
        <span className="font-bold font-pixel text-lg text-foreground">Via-gent</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => toggleHelper('chat')}
          className={cn(
            'flex items-center justify-center w-10 h-10',
            'transition-colors',
            helper === 'chat' ? 'text-primary' : 'text-muted-foreground'
          )}
          aria-label="Toggle Chat"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
        <button
          onClick={() => toggleHelper('files')}
          className={cn(
            'flex items-center justify-center w-10 h-10',
            'transition-colors',
            helper === 'files' ? 'text-primary' : 'text-muted-foreground'
          )}
          aria-label="Toggle Files"
        >
          <Files className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

// =============================================================================
// PRIMARY SURFACE (Main work area)
// =============================================================================

function PrimarySurface({ children, className }: PrimarySurfaceProps) {
  const { helper, device } = useLayout();
  const hasHelper = helper !== null && device !== 'mobile';
  
  return (
    <div className={cn(
      'flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden',
      'bg-background',
      // Shrink when helper is open (desktop/tablet)
      hasHelper && device === 'desktop' && 'max-w-[calc(100%-320px)]',
      hasHelper && device === 'tablet' && 'max-w-[60%]',
      className
    )}>
      {children}
    </div>
  );
}

// =============================================================================
// HELPER SURFACE (Contextual side panel)
// =============================================================================

function HelperSurface({ children, title, className }: HelperSurfaceProps) {
  const { helper, setHelper, device } = useLayout();
  
  if (helper === null) return null;
  
  // Mobile: Render as Sheet (overlay)
  if (device === 'mobile') {
    return (
      <HelperDrawer title={title} onClose={() => setHelper(null)}>
        {children}
      </HelperDrawer>
    );
  }
  
  // Desktop/Tablet: Render as side panel
  return (
    <aside className={cn(
      'flex flex-col h-full border-l-2 border-border bg-card',
      device === 'desktop' ? 'w-80' : 'w-[40%]',
      'shrink-0 overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-border shrink-0">
        <h2 className="font-semibold text-sm">{title}</h2>
        <button
          onClick={() => setHelper(null)}
          className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </aside>
  );
}

// =============================================================================
// HELPER DRAWER (Mobile overlay - opaque, not transparent!)
// =============================================================================

function HelperDrawer({ 
  children, 
  title, 
  onClose 
}: { 
  children: ReactNode; 
  title: string; 
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop - SOLID, no blur! */}
      <div 
        className="fixed inset-0 z-40 bg-black/80"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer - slides up from bottom */}
      <div className={cn(
        'fixed inset-x-0 bottom-0 z-50',
        'bg-card border-t-2 border-border',
        'max-h-[80vh] rounded-t-none', // NO rounded corners (8-bit)
        'flex flex-col',
        'animate-in slide-in-from-bottom duration-300'
      )}>
        {/* Handle */}
        <div className="flex items-center justify-center py-2">
          <div className="w-12 h-1 bg-border" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between h-12 px-4 border-b border-border">
          <h2 className="font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </div>
    </>
  );
}

// =============================================================================
// FOCUS MODE TOGGLE
// =============================================================================

function FocusModeToggle({ className }: { className?: string }) {
  const { focusMode, toggleFocusMode } = useLayout();
  
  return (
    <button
      onClick={toggleFocusMode}
      className={cn(
        'flex items-center justify-center w-10 h-10',
        'border-2 border-border',
        'transition-colors',
        focusMode 
          ? 'bg-primary text-primary-foreground border-primary' 
          : 'text-muted-foreground hover:bg-accent',
        className
      )}
      aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
      aria-pressed={focusMode}
    >
      {focusMode ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </button>
  );
}

// =============================================================================
// DEMO: IDE WORKSPACE USING NEW MODEL
// =============================================================================

function IDEWorkspaceDemo() {
  const { helper } = useLayout();
  
  return (
    <WorkspaceShell workspace="ide" defaultHelper="files">
      <PrimarySurface>
        {/* IDE Primary Content */}
        <div className="flex flex-col h-full">
          {/* Tab Bar */}
          <div className="flex items-center h-10 px-2 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-1">
              <button className="px-3 h-8 text-sm border-b-2 border-primary text-foreground">
                index.tsx
              </button>
              <button className="px-3 h-8 text-sm text-muted-foreground hover:text-foreground">
                Button.tsx
              </button>
            </div>
          </div>
          
          {/* Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Monaco placeholder */}
            <div className="flex-1 bg-[#0f0f11] p-4 font-mono text-sm text-muted-foreground overflow-auto">
              <pre>{`// Welcome to ViaGent IDE
// This is a spike for the new UX model

import React from 'react';

export function App() {
  return (
    <div className="container">
      <h1>Hello, ViaGent!</h1>
    </div>
  );
}`}</pre>
            </div>
            
            {/* Terminal (collapsed by default in new model) */}
            <div className="h-32 border-t border-border bg-card">
              <div className="flex items-center h-8 px-4 border-b border-border">
                <Terminal className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Terminal</span>
              </div>
              <div className="p-2 font-mono text-xs text-muted-foreground">
                $ npm run dev
              </div>
            </div>
          </div>
        </div>
      </PrimarySurface>
      
      {/* Helper Surface - Files */}
      {helper === 'files' && (
        <HelperSurface title="Explorer">
          <div className="p-2 space-y-1">
            <div className="flex items-center gap-2 px-2 py-1 text-sm text-foreground bg-accent">
              <Files className="h-4 w-4" />
              <span>src</span>
            </div>
            <div className="pl-4 space-y-1">
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:bg-accent cursor-pointer">
                <Code2 className="h-4 w-4" />
                <span>index.tsx</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:bg-accent cursor-pointer">
                <Code2 className="h-4 w-4" />
                <span>Button.tsx</span>
              </div>
            </div>
          </div>
        </HelperSurface>
      )}
      
      {/* Helper Surface - Chat */}
      {helper === 'chat' && (
        <HelperSurface title="AI Assistant">
          <div className="p-4 space-y-4">
            <div className="p-3 bg-muted/30 text-sm">
              <p className="text-muted-foreground mb-2">You:</p>
              <p>How do I create a button component?</p>
            </div>
            <div className="p-3 bg-primary/10 text-sm">
              <p className="text-primary mb-2">AI:</p>
              <p>Here's a simple button component...</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
            <input
              type="text"
              placeholder="Ask anything..."
              className="w-full h-10 px-3 text-base bg-background border-2 border-border focus:border-primary outline-none"
            />
          </div>
        </HelperSurface>
      )}
      
      {/* Helper Surface - Search */}
      {helper === 'search' && (
        <HelperSurface title="Search">
          <div className="p-4">
            <input
              type="text"
              placeholder="Search in files..."
              className="w-full h-10 px-3 text-base bg-background border-2 border-border focus:border-primary outline-none"
            />
            <div className="mt-4 text-sm text-muted-foreground">
              Type to search across all files...
            </div>
          </div>
        </HelperSurface>
      )}
    </WorkspaceShell>
  );
}

// =============================================================================
// SPIKE ROUTE
// =============================================================================

export const Route = createFileRoute('/_spike/ux-redesign-2026-01-14')({
  component: function SpikeUXRedesign() {
    return (
      <LayoutProvider>
        <IDEWorkspaceDemo />
      </LayoutProvider>
    );
  },
});

// =============================================================================
// EXPORTS FOR MIGRATION
// =============================================================================

export {
  LayoutProvider,
  LayoutContext,
  useLayout,
  WorkspaceShell,
  PrimarySurface,
  HelperSurface,
  HelperDrawer,
  ActivityRail,
  BottomNavigation,
  FocusModeToggle,
};

export type {
  WorkspaceType,
  HelperType,
  DeviceType,
  LayoutContextValue,
  WorkspaceShellProps,
  PrimarySurfaceProps,
  HelperSurfaceProps,
};
