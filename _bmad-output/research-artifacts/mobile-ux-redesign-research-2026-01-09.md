# Mobile UX Redesign Research Document
## Via-gent Project - Project Alpha Master

**Research Date**: January 9, 2026  
**Document Version**: 1.0.0  
**Status**: Complete Research Analysis  
**Prepared For**: Via-gent Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Tab Navigation Patterns](#tab-navigation-patterns)
3. [Bottom Sheet Implementation](#bottom-sheet-implementation)
4. [Mobile IDE Layouts](#mobile-ide-layouts)
5. [Recommended Libraries](#recommended-libraries)
6. [Design Specifications](#design-specifications)
7. [Implementation Roadmap](#implementation-roadmap)
8. [References](#references)

---

## 1. Executive Summary

### Key Findings

This comprehensive research analyzes mobile UX patterns for three critical components of the Via-gent project: **NotesPage.tsx**, **KnowledgePage.tsx**, and **IDEResizableLayout.tsx**. The research draws from authoritative sources including Apple's Human Interface Guidelines, Google's Material Design documentation, industry best practices from 2024-2025, and React/Tailwind implementation patterns.

#### Primary Recommendations

1. **Tab Navigation**: Implement bottom tab bars with 3-5 destinations, following Apple's Human Interface Guidelines and Material Design specifications. Use **React Navigation** for native-like performance with **Framer Motion** for smooth transitions.

2. **Bottom Sheets**: For IDE panels (file tree, terminal), implement modal bottom sheets with **@gorhom/react-native-bottom-sheet** patterns (adapted for web) or **react-spring-bottom-sheet** for React web applications. Include snap points at 25%, 50%, and 90% screen height.

3. **Mobile IDE Layout**: Adopt a collapsible panel strategy where file tree and terminal appear in bottom sheets on mobile. Prioritize touch targets of 44px minimum, implement virtual keyboard awareness, and use responsive breakpoints at 768px.

4. **State Management**: Use **Zustand** with React Context for tab state management, ensuring persistent navigation state across component re-renders.

### Research Sources

- **15+ authoritative sources** consulted including Apple HIG, Material Design, GitHub repositories, technical tutorials, and industry publications
- **2024-2025 mobile UX trends** emphasized throughout
- **React/Tailwind/CSS implementation approaches** provided for each pattern

---

## 2. Tab Navigation Patterns

### 2.1 Bottom Navigation Bar Fundamentals

#### Platform Guidelines Compliance

**Apple Human Interface Guidelines (HIG)**:
- Bottom tab bars should display 3-5 top-level destinations
- Each destination requires an icon and optional text label
- Tab bar remains visible when navigating to nested content
- Active tab indicated by filled icon or secondary label color

**Material Design 3 Specifications**:
- Bottom navigation displays three to five destinations
- Each destination represented by icon and optional text label
- Use distinct icons for each destination
- Maintain consistent navigation behavior across all screens

#### Key Principles

1. **Thumb-First Design Philosophy**: Research shows 49% of users navigate mobile apps using only their thumb, making thumb reach the primary consideration for navigation placement. The most accessible area is the bottom third of the screen.

2. **Progressive Disclosure Strategy**: Present only essential navigation options initially, with additional options revealed through user interaction patterns.

3. **Consistent Navigation Patterns**: Maintain consistent navigation behavior throughout the application. Users should never have to relearn how navigation works on different screens.

#### Recommended Tab Count

| Tab Count | Recommendation | Notes |
|-----------|----------------|-------|
| 2 tabs | Not recommended | Too few for bottom navigation |
| 3-5 tabs | Optimal | Sweet spot for mobile navigation |
| 5+ tabs | Consider alternative | May require grouping or overflow menu |

### 2.2 Tab Bar Implementation

#### Touch Target Specifications

**WCAG 2.1 / Mobile Guidelines**:
- Minimum touch target size: **44×44 pixels** (Apple HIG)
- Google recommends: **48×48 pixels** for optimal touch accuracy
- Minimum spacing between touch targets: **8 pixels**

#### Tailwind CSS Implementation

```tsx
// Mobile Tab Bar Component
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface MobileTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center flex-1 h-full min-w-[44px] py-2 px-1 touch-manipulation"
            aria-label={`Navigate to ${tab.label}`}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <div className="relative">
              <motion.div
                initial={false}
                animate={{
                  scale: activeTab === tab.id ? 1.1 : 1,
                  color: activeTab === tab.id ? 'rgb(59, 130, 246)' : 'rgb(107, 114, 128)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="flex items-center justify-center"
              >
                {tab.icon}
              </motion.div>
              
              {/* Badge Indicator */}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-xs font-bold text-white bg-red-500 rounded-full px-1">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            
            {/* Label */}
            <span
              className={`text-xs mt-1 font-medium transition-colors duration-200 ${
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </span>
            
            {/* Active Indicator */}
            <AnimatePresence>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 w-8 h-1 bg-primary rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
      
      {/* Safe Area for iPhone Home Indicator */}
      <div className="h-safe-area-bottom bg-background" />
    </nav>
  );
};

export default MobileTabBar;
```

#### Badge Indicator Pattern

```tsx
// Badge Component with Tailwind
const TabBadge: React.FC<{ count: number; max?: number }> = ({ count, max = 99 }) => {
  const displayCount = count > max ? `${max}+` : count;
  
  return (
    <span className="absolute -top-2 -right-2 flex items-center justify-center 
                      min-w-[18px] h-[18px] px-1 text-xs font-bold text-white
                      bg-red-500 rounded-full border-2 border-background">
      {displayCount}
    </span>
  );
};
```

### 2.3 Tab State Management

#### Zustand Store Implementation

```tsx
// stores/useTabNavigationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TabNavigationState {
  activeTab: string;
  previousTab: string | null;
  tabHistory: string[];
  setActiveTab: (tabId: string) => void;
  getPreviousTab: () => string | null;
  clearHistory: () => void;
}

export const useTabNavigationStore = create<TabNavigationState>()(
  persist(
    (set, get) => ({
      activeTab: 'notes',
      previousTab: null,
      tabHistory: ['notes'],
      
      setActiveTab: (tabId: string) => {
        const { activeTab, tabHistory } = get();
        if (activeTab !== tabId) {
          set({
            previousTab: activeTab,
            activeTab: tabId,
            tabHistory: [...tabHistory.slice(-9), tabId], // Keep last 10 tabs
          });
        }
      },
      
      getPreviousTab: () => {
        return get().previousTab;
      },
      
      clearHistory: () => {
        set({ previousTab: null, tabHistory: [get().activeTab] });
      },
    }),
    {
      name: 'tab-navigation-storage',
      partialize: (state) => ({
        activeTab: state.activeTab,
        tabHistory: state.tabHistory,
      }),
    }
  )
);
```

### 2.4 Tab Transition Animations

#### Framer Motion Variants

```tsx
// animations/tabAnimations.ts
import { Variants } from 'framer-motion';

export const tabContentVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export const tabIndicatorVariants: Variants = {
  initial: { width: 0 },
  animate: { width: '2rem' },
};
```

---

## 3. Bottom Sheet Implementation

### 3.1 Bottom Sheet Design Patterns

#### Modal Bottom Sheets

Bottom sheets are surfaces containing supplementary content, anchored to the bottom of the screen. They provide users with quick access to contextual actions and information.

**Key Features**:
- Modal presentation with backdrop overlay
- Dismissible via drag gestures or close button
- Multiple snap points (25%, 50%, 90% height)
- Support for scrollable content
- Handle bar for visual affordance

#### Sheet Height Options

| Snap Point | Height | Use Case |
|------------|--------|----------|
| Collapsed | 25% | Quick actions, preview |
| Half | 50% | Form inputs, lists |
| Expanded | 90% | Full content, detailed views |
| Full | 100% | Modal replacement |

### 3.2 React Spring Bottom Sheet Implementation

#### Installation and Setup

```bash
npm install react-spring-bottom-sheet
# or
pnpm add react-spring-bottom-sheet
```

#### Implementation Example

```tsx
// components/BottomSheet.tsx
import React, { useCallback, useState } from 'react';
import {
  BottomSheet,
  BottomSheetRef,
  useScrollPosition,
  useVirtualKeyboard,
} from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import { motion } from 'framer-motion';

interface IDEBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  snapPoints?: number[];
  children: React.ReactNode;
}

const IDEBottomSheet: React.FC<IDEBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  snapPoints = [0.25, 0.5, 0.9],
  children,
}) => {
  const [currentSnap, setCurrentSnap] = useState(0);
  const scrollPosition = useScrollPosition({ isEnabled: isOpen });
  const keyboard = useVirtualKeyboard({ isEnabled: isOpen });

  const handleOnDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <BottomSheet
      open={isOpen}
      onDismiss={handleOnDismiss}
      snapPoints={snapPoints}
      onSnapStart={(snapIndex) => setCurrentSnap(snapIndex)}
      defaultSnap={({ snapClosest, minHeight, maxHeight }) => {
        const current = snapClosest({ minHeight, maxHeight });
        return current.snap;
      }}
      expandOnContentDrag
      sibling={
        <div className="fixed inset-0 bg-black/50 transition-opacity" />
      }
    >
      {/* Handle Bar */}
      <div
        className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing"
        draggable
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-4 pb-3 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto px-4"
        style={{
          paddingBottom: keyboard.height || 'var(--keyboard-inset-height, 0px)',
        }}
      >
        {children}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-border bg-background">
        <div className="flex justify-end gap-2">
          <button
            onClick={handleOnDismiss}
            className="px-4 py-2 text-sm font-medium text-muted-foreground 
                     hover:bg-muted rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white 
                     bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default IDEBottomSheet;
```

### 3.3 Framer Motion Bottom Sheet (Alternative)

```tsx
// components/FramerMotionBottomSheet.tsx
import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

interface FramerMotionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const FramerMotionBottomSheet: React.FC<FramerMotionBottomSheetProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const constraintsRef = useRef(null);
  const y = useMotionValue(100);
  const opacity = useTransform(y, [100, 0], [0, 0.5]);

  const sheetVariants = {
    hidden: { y: '100%' },
    visible: {
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      y: '100%',
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={constraintsRef}
            className="fixed bottom-0 left-0 right-0 z-50 
                     bg-background rounded-t-2xl shadow-xl
                     max-h-[90vh] overflow-hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sheetVariants}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            style={{ y }}
          >
            {/* Handle */}
            <div className="flex justify-center py-3 cursor-grab">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Content */}
            <div className="px-4 pb-8 overflow-y-auto max-h-[calc(90vh-60px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FramerMotionBottomSheet;
```

### 3.4 @gorhom/react-native-bottom-sheet Patterns (For Reference)

While designed for React Native, this library provides excellent patterns applicable to web implementations:

**Features**:
- Modal presentation view with stack sheet modals
- Smooth gesture interactions and snapping animations
- Seamless keyboard handling
- Pull to refresh for scrollables
- Support for FlatList, SectionList, ScrollView
- React Navigation integration

**GitHub Stars**: 8.7k | **Contributors**: 68 | **Releases**: 122+

---

## 4. Mobile IDE Layouts

### 4.1 Responsive IDE Design Principles

#### Layout Strategy for Mobile

1. **Collapsible Panels**: File tree and terminal panels should collapse into bottom sheets on mobile
2. **Touch-Optimized Controls**: All interactive elements must meet 44px minimum touch target
3. **Keyboard Awareness**: Properly handle virtual keyboard appearance/disappearance
4. **Adaptive Breakpoints**: Use 768px as the primary mobile/tablet breakpoint

#### Layout Structure

```
┌─────────────────────────────────────┐
│ Header / Toolbar                    │
├─────────────────────────────────────┤
│                                     │
│         Main Content Area           │
│         (Editor / Preview)          │
│                                     │
├─────────────────────────────────────┤
│         Bottom Action Bar           │
│         (3-5 action buttons)        │
├─────────────────────────────────────┤
│         Tab Navigation              │
│         (Notes | Knowledge | IDE)   │
└─────────────────────────────────────┘
```

### 4.2 File Tree on Mobile

#### Collapsible File Tree Implementation

```tsx
// components/FileTree.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  expanded?: boolean;
}

interface FileTreeProps {
  files: FileNode[];
  onFileSelect: (fileId: string) => void;
  selectedFileId?: string;
}

const FileTreeItem: React.FC<{
  node: FileNode;
  level: number;
  selectedFileId?: string;
  onFileSelect: (fileId: string) => void;
}> = ({ node, level, selectedFileId, onFileSelect }) => {
  const [isExpanded, setIsExpanded] = useState(node.expanded || false);
  const isSelected = selectedFileId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node.id);
    }
  };

  return (
    <div className="select-none">
      <motion.div
        className={`flex items-center py-2 px-2 cursor-pointer touch-manipulation
                   ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}
                   rounded-lg transition-colors`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        whileTap={{ scale: 0.98 }}
        onClick={handleToggle}
      >
        {/* Expand/Collapse Icon */}
        <span className="mr-1 text-muted-foreground">
          {node.type === 'folder' ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4" />
          )}
        </span>

        {/* File/Folder Icon */}
        <span className="mr-2">
          {node.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-500" />
            ) : (
              <Folder className="w-4 h-4 text-blue-500" />
            )
          ) : (
            <File className="w-4 h-4 text-muted-foreground" />
          )}
        </span>

        {/* File Name */}
        <span className="text-sm font-medium truncate">{node.name}</span>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <FileTreeItem
                key={child.id}
                node={child}
                level={level + 1}
                selectedFileId={selectedFileId}
                onFileSelect={onFileSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FileTree: React.FC<FileTreeProps> = ({ files, onFileSelect, selectedFileId }) => {
  return (
    <div className="py-2">
      {files.map((node) => (
        <FileTreeItem
          key={node.id}
          node={node}
          level={0}
          selectedFileId={selectedFileId}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
};

export default FileTree;
```

### 4.3 Code Editor on Mobile

#### Mobile Code Editor Considerations

1. **Line Numbers**: Optional on mobile to save horizontal space
2. **Syntax Highlighting**: Use mobile-optimized color schemes (high contrast)
3. **Font Size**: Minimum 14px, preferably 16px for readability
4. **Keyboard**: Provide code-specific keyboard with common symbols
5. **Zoom**: Prevent pinch-to-zoom on the editor area

```tsx
// components/MobileCodeEditor.tsx
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MobileCodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

const MobileCodeEditor: React.FC<MobileCodeEditorProps> = ({
  code,
  language,
  onChange,
  readOnly = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [code]);

  return (
    <motion.div
      className="relative bg-code-background rounded-lg overflow-hidden"
      whileFocusWithin={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Line Numbers (Optional - Hidden on very small screens) */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-code-lineNumbers 
                      border-r border-code-border select-none overflow-hidden">
        {code.split('\n').map((_, i) => (
          <div
            key={i}
            className="text-right pr-2 text-xs text-code-lineNumber 
                     leading-6 font-mono"
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code Area */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className="w-full pl-10 pr-4 py-3 bg-transparent text-code-text 
                 font-mono text-sm leading-6 resize-none outline-none
                 placeholder:text-code-placeholder"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        translate="no"
        style={{ minHeight: '200px' }}
      />

      {/* Language Badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-muted 
                    rounded text-xs font-medium text-muted-foreground">
        {language}
      </div>
    </motion.div>
  );
};

export default MobileCodeEditor;
```

### 4.4 Virtual Keyboard Handling

```tsx
// hooks/useVirtualKeyboard.ts
import { useState, useEffect, useCallback } from 'react';

interface VirtualKeyboardState {
  isVisible: boolean;
  height: number;
}

export const useVirtualKeyboard = () => {
  const [keyboardState, setKeyboardState] = useState<VirtualKeyboardState>({
    isVisible: false,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const windowHeight = window.innerHeight;
        const viewportHeight = visualViewport.height;
        const keyboardHeight = windowHeight - viewportHeight;
        
        setKeyboardState({
          isVisible: keyboardHeight > 100,
          height: keyboardHeight,
        });
      }
    };

    // Listen to visual viewport changes
    window.visualViewport?.addEventListener('resize', handleResize);
    
    // Fallback for older browsers
    window.addEventListener('resize', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return keyboardState;
};
```

---

## 5. Recommended Libraries

### 5.1 Navigation Libraries

| Library | description | Stars | Recommendation |
|---------|---------|-------|----------------|
| **React Navigation** | Native-like tab and stack navigation | 24k+ | ⭐ Primary Choice |
| **React Native Tab View** | Material Design swipeable tabs | 2k+ | Alternative |
| **React Router** | Web-first routing | 50k+ | Web fallback |

### 5.2 Animation Libraries

| Library | description | Stars | Recommendation |
|---------|---------|-------|----------------|
| **Framer Motion** | React animations, gestures | 30k+ | ⭐ Primary Choice |
| **React Spring** | Physics-based animations | 28k+ | Alternative |
| **Motion One** | Modern web animations | 5k+ | Lightweight option |

### 5.3 Bottom Sheet Libraries

| Library | Platform | Stars | Recommendation |
|---------|----------|-------|----------------|
| **react-spring-bottom-sheet** | React Web | 1.5k+ | ⭐ Primary Choice |
| **@gorhom/react-native-bottom-sheet** | React Native | 8.7k+ | Native reference |
| **react-modal-sheet** | React Web | 800+ | Alternative |

### 5.4 State Management

| Library | description | Recommendation |
|---------|---------|----------------|
| **Zustand** | Lightweight global state | ⭐ Primary Choice |
| **React Context** | Built-in React state | For simple cases |
| **Jotai** | Atomic state | Alternative |

### 5.5 Tailwind CSS Utilities

| Plugin/Package | description |
|----------------|---------|
| **clsx** | Conditional class names |
| **tailwind-merge** | Merge Tailwind classes |
| **class-variance-authority (CVA)** | Component variants |
| **tailwindcss-animate** | Animation utilities |

---

## 6. Design Specifications

### 6.1 Touch Target Sizes

| Element | Minimum Size | Recommended Size |
|---------|--------------|------------------|
| Tab icons | 24×24px | 28×28px |
| Tab hit area | 44×44px | 48×48px |
| Action buttons | 44×44px | 48×48px |
| File tree items | 44px height | 48px height |
| Close buttons | 44×44px | 48×48px |

### 6.2 Spacing System

| Context | Padding | Margin | Gap |
|---------|---------|--------|-----|
| Tab bar items | px-4 | - | gap-1 |
| Bottom sheet content | px-4 py-3 | - | gap-2 |
| File tree items | px-2 py-2 | - | gap-2 |
| Code editor | px-4 py-3 | - | - |

### 6.3 Animation Specifications

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Tab switch | 200-300ms | spring (stiffness: 400, damping: 30) |
| Bottom sheet open | 300-400ms | spring (damping: 25, stiffness: 300) |
| Bottom sheet drag | Immediate | Custom physics |
| Menu appearance | 150-200ms | ease-out |

### 6.4 Color Specifications

**Dark Theme (Default)**:
```css
:root {
  --background: #0a0a0a;
  --foreground: #ededed;
  --muted: #262626;
  --muted-foreground: #a3a3a3;
  --border: #262626;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --code-background: #0d1117;
  --code-text: #c9d1d9;
  --code-lineNumbers: #6e7681;
}
```

### 6.5 Typography Specifications

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Tab labels | 12px | 500 | 1.4 |
| Sheet titles | 18px | 600 | 1.4 |
| File names | 14px | 500 | 1.5 |
| Code | 14-16px | 400 | 1.6 |
| Code line numbers | 12px | 400 | 1.6 |

### 6.6 Breakpoint Strategy

| Breakpoint | Width | Strategy |
|------------|-------|----------|
| Mobile | < 768px | Bottom tabs + collapsible sheets |
| Tablet | 768-1024px | Side navigation + bottom sheets |
| Desktop | > 1024px | Traditional IDE layout |

---

## 7. Implementation Roadmap

### Phase 1: Tab Navigation Foundation (Week 1)

#### Tasks

| Task | Effort | Priority | Dependencies |
|------|--------|----------|--------------|
| Create MobileTabBar component | 4h | P0 | None |
| Implement Zustand tab store | 2h | P0 | MobileTabBar |
| Add Framer Motion transitions | 3h | P1 | MobileTabBar |
| Badge indicator implementation | 2h | P2 | MobileTabBar |
| Integration with NotesPage.tsx | 4h | P0 | MobileTabBar, Zustand store |
| Integration with KnowledgePage.tsx | 4h | P0 | MobileTabBar, Zustand store |

**Estimated Effort**: 19 hours

#### Acceptance Criteria
- [ ] Bottom tab bar displays 3-5 navigation options
- [ ] Tab state persists across re-renders
- [ ] Smooth Framer Motion transitions between tabs
- [ ] Badge indicators display unread counts
- [ ] Touch targets meet 44px minimum
- [ ] Active tab clearly indicated visually

### Phase 2: Bottom Sheet System (Week 2)

#### Tasks

| Task | Effort | Priority | Dependencies |
|------|--------|----------|--------------|
| Create BottomSheet component base | 6h | P0 | None |
| Implement snap points (25%, 50%, 90%) | 3h | P0 | BottomSheet base |
| Add drag gesture support | 4h | P0 | BottomSheet base |
| Virtual keyboard integration | 3h | P1 | BottomSheet base |
| File tree bottom sheet | 4h | P0 | BottomSheet component |
| Terminal bottom sheet | 4h | P1 | BottomSheet component |
| Backdrop overlay | 2h | P1 | BottomSheet component |

**Estimated Effort**: 26 hours

#### Acceptance Criteria
- [ ] Bottom sheets snap to defined points
- [ ] Drag gestures smoothly animate sheet position
- [ ] Sheet closes on backdrop tap or drag down
- [ ] Virtual keyboard properly adjusts content
- [ ] File tree and terminal usable in bottom sheets
- [ ] Backdrop provides proper visual separation

### Phase 3: IDE Layout Mobile Optimization (Week 3)

#### Tasks

| Task | Effort | Priority | Dependencies |
|------|--------|----------|--------------|
| Responsive layout container | 4h | P0 | None |
| FileTree mobile component | 6h | P0 | BottomSheet |
| MobileCodeEditor component | 6h | P0 | None |
| Virtual keyboard handling | 4h | P0 | useVirtualKeyboard hook |
| IDEResizableLayout mobile variant | 8h | P0 | All above |
| Touch-friendly code input | 4h | P1 | MobileCodeEditor |

**Estimated Effort**: 32 hours

#### Acceptance Criteria
- [ ] Layout adapts to mobile viewport
- [ ] File tree collapsible via bottom sheet
- [ ] Code editor touch-optimized
- [ ] Virtual keyboard doesn't obscure content
- [ ] All interactive elements 44px minimum
- [ ] No horizontal scrolling required

### Phase 4: Polish & Accessibility (Week 4)

#### Tasks

| Task | Effort | Priority | Dependencies |
|------|--------|----------|--------------|
| Accessibility audit | 4h | P0 | All components |
| Screen reader support | 6h | P0 | All components |
| Keyboard navigation | 4h | P1 | Tab bar, bottom sheets |
| Performance optimization | 4h | P1 | Animation components |
| Cross-browser testing | 4h | P0 | Safari, Chrome mobile |
| Documentation | 4h | P2 | All components |

**Estimated Effort**: 26 hours

#### Acceptance Criteria
- [ ] WCAG 2.1 AA compliance
- [ ] All gestures have keyboard alternatives
- [ ] Screen readers announce navigation changes
- [ ] 60fps animations on target devices
- [ ] Works on iOS Safari and Chrome mobile
- [ ] Component API documented

### Total Effort Estimate

| Phase | Effort |
|-------|--------|
| Phase 1: Tab Navigation | 19 hours |
| Phase 2: Bottom Sheets | 26 hours |
| Phase 3: IDE Layout | 32 hours |
| Phase 4: Polish | 26 hours |
| **Total** | **103 hours** |

---

## 8. References

### Tab Navigation

1. **React Navigation - Native Bottom Tabs**  
   https://reactnavigation.org/blog/2025/01/29/using-react-navigation-with-native-bottom-tabs/  
   *Published: January 29, 2025*

2. **Bottom Navigation Bar in Mobile Apps - Complete Guide**  
   https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/  
   *Author: AppMySite Team*

3. **Bottom Tab Bar Navigation Design Best Practices**  
   https://uxplanet.org/bottom-tab-bar-navigation-design-best-practices-48d46a3b0c36  
   *Author: Saadia Minhas, Published: April 2, 2024*

4. **Bottom Navigation - Material Design**  
   https://m2.material.io/components/bottom-navigation  
   *Google Material Design Guidelines*

5. **The Complete Guide to Creating User-Friendly Mobile Navigation**  
   https://medium.com/@secuodsoft/the-complete-guide-to-creating-user-friendly-mobile-navigation-in-2025-59c9dd620c1d  
   *Published: 2025*

### Bottom Sheets

6. **React Native Bottom Sheet (@gorhom)**  
   https://github.com/gorhom/react-native-bottom-sheet  
   *Stars: 8.7k, Contributors: 68*

7. **React Spring Bottom Sheet**  
   https://github.com/stipsan/react-spring-bottom-sheet  
   *Accessible, performant, spring-based*

8. **React Modal Sheet**  
   https://github.com/Temzasse/react-modal-sheet  
   *Flexible bottom sheet for React apps*

9. **Building a Bottom Sheet Animation in React Native**  
   https://medium.com/@dewantanjilhossain/building-a-powerful-bottom-sheet-animation-in-react-native-with-reanimated-and-gesture-handler-ea33442fe2f8  
   *Published: November 11, 2025*

10. **Managing Multiple Bottom Sheets in React Native**  
    https://paufau.medium.com/managing-multiple-bottom-sheets-in-react-native-e1e95c35a872  
    *Author: Pavel Pakseev, Published: July 18, 2025*

### Mobile IDE Patterns

11. **How to Build a Web IDE Like CodeSandbox**  
    https://levelup.gitconnected.com/how-to-build-a-web-ide-ab2563f24647  
    *Published: June 15, 2024*

12. **Top 7 Code Editor Apps for Developers in 2025**  
    https://levinci.group/levinci-blog/top-7-code-editors-apps-in-2025/  
    *Published: 2025*

### Animation & State Management

13. **Framer Motion Documentation**  
    https://motion.dev/docs/react-animation  
    *Motion One - Formerly Framer Motion*

14. **Creating React Animations with Motion**  
    https://blog.logrocket.com/creating-react-animations-with-motion/  
    *Published: 2024*

15. **Zustand State Management**  
    https://github.com/pmndrs/zustand  
    *Lightweight React state management*

### Design Guidelines

16. **Apple Human Interface Guidelines - Tab Bars**  
    https://developer.apple.com/design/human-interface-guidelines/tab-bars

17. **Responsive Web Design Best Practices 2024**  
    https://medium.com/@abdulsamad18090/responsive-web-design-best-practices-for-2024-492a42635a4c

18. **Tailwind CSS - Rapidly Build Modern Websites**  
    https://tailwindcss.com/

---

## Appendix A: Component File Structure

```
src/
├── components/
│   ├── navigation/
│   │   ├── MobileTabBar.tsx
│   │   ├── TabBadge.tsx
│   │   └── TabContent.tsx
│   ├── bottom-sheet/
│   │   ├── BottomSheet.tsx
│   │   ├── BottomSheetHeader.tsx
│   │   └── BottomSheetContent.tsx
│   ├── ide/
│   │   ├── FileTree.tsx
│   │   ├── FileTreeItem.tsx
│   │   ├── MobileCodeEditor.tsx
│   │   └── TerminalPanel.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── IconButton.tsx
│       └── Badge.tsx
├── hooks/
│   ├── useTabNavigation.ts
│   ├── useVirtualKeyboard.ts
│   ├── useScrollLock.ts
│   └── useBottomSheet.ts
├── stores/
│   ├── useTabNavigationStore.ts
│   └── useIDEStore.ts
├── animations/
│   ├── tabAnimations.ts
│   └── bottomSheetAnimations.ts
└── types/
    ├── navigation.ts
    ├── bottomSheet.ts
    └── ide.ts
```

---

## Appendix B: Tailwind CSS Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        // ... other colors
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

---

**Document Prepared By**: Mobile UX Research Team  
**Review Status**: Ready for Implementation  
**Next Steps**: Begin Phase 1 - Tab Navigation Foundation

---

*This research document provides comprehensive guidance for implementing mobile UX patterns in the Via-gent project. All recommendations are based on 2024-2025 best practices and authoritative platform guidelines.*
