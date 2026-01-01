# Search Input Component Research - January 2026

**Document ID**: RESEARCH-SEARCH-2026-01
**Date**: 2026-01-02
**Research Team**: BMAD Development Coordinator
**Status**: Research Complete - Ready for Implementation

---

## Executive Summary

This document consolidates best practices for implementing search input components in React applications as of January 2026. Research conducted using 5+ MCP tool turns covering Radix UI patterns, cmdk library, accessibility standards, performance optimization, and mobile-responsive design patterns.

**Key Findings**:
- **cmdk** by Pacocoursey is the industry standard for command palette implementations
- **300ms debounce delay** is the 2026 standard for search inputs
- **Fuse.js** and **fast-fuzzy** are preferred for fuzzy matching
- **react-window** remains the best choice for virtualization
- **WAI-ARIA Combobox pattern** is the accessibility standard

---

## Table of Contents

1. [Command Palette Patterns](#1-command-palette-patterns)
2. [Debounced Search Implementation](#2-debounced-search-implementation)
3. [Search Result Highlighting & Fuzzy Matching](#3-search-result-highlighting--fuzzy-matching)
4. [Accessibility Patterns](#4-accessibility-patterns)
5. [Radix UI Integration](#5-radix-ui-integration)
6. [Mobile-Responsive Patterns](#6-mobile-responsive-patterns)
7. [Performance Optimization](#7-performance-optimization)
8. [Loading States & Empty States](#8-loading-states--empty-states)
9. [Implementation Recommendations](#9-implementation-recommendations)

---

## 1. Command Palette Patterns

### 1.1 Library of Choice: cmdk

**cmdk** (Command Menu Kit) by Pacocoursey is the industry-standard, headless React component library for building command menus.

**Key Features**:
- Fast, composable, unstyled command menu for React
- Built-in keyboard navigation (standard + Vim bindings)
- Automatic filtering and sorting
- IME composition handling for CJK languages
- Full accessibility support out of the box

**Installation**:
```bash
npm install cmdk
```

### 1.2 Keyboard Shortcuts

#### Standard Shortcuts (2026 Convention)

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open/close command palette (universal standard) |
| `Esc` | Close command palette |
| `ArrowDown` / `ArrowUp` | Navigate items |
| `Meta+ArrowDown` / `Meta+ArrowUp` | Jump to last/first item |
| `Alt+ArrowDown` / `Alt+ArrowUp` | Navigate between groups |
| `Home` / `End` | Jump to first/last item |
| `Enter` | Select current item |

#### Vim Bindings (Enabled by Default)

| Shortcut | Action |
|----------|--------|
| `Ctrl+j` / `Ctrl+k` | Navigate down/up |
| `Ctrl+n` / `Ctrl+p` | Navigate down/up (alternative) |

**Disable Vim Bindings**:
```tsx
<Command vimBindings={false}>
```

### 1.3 Global Keyboard Shortcut Implementation

**Best Practice 2026**: Use `useEffect` with proper cleanup to prevent memory leaks.

```tsx
import * as React from 'react'
import { Command } from 'cmdk'

const CommandMenu = () => {
  const [open, setOpen] = React.useState(false)

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <Command.Dialog open={open} onOpenChange={setOpen}>
      <Command.Portal>
        <Command.Overlay className="fixed inset-0 bg-black/50" />
        <Command.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
          <Command.Input placeholder="Type a command or search..." />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            {/* Your command items */}
          </Command.List>
        </Command.Content>
      </Command.Portal>
    </Command.Dialog>
  )
}
```

### 1.4 Avoiding Keyboard Shortcut Conflicts

**Critical Best Practice**: cmdk includes **IME composition handling** for CJK languages (Chinese, Japanese, Korean), preventing interference with text input.

```tsx
// cmdk internally checks for isComposing before triggering shortcuts
// This prevents Cmd+K from firing when user is typing in CJK input methods
```

**Conflict Prevention**:
- Check if user is in an input/textarea before triggering global shortcuts
- Use `e.preventDefault()` to override browser defaults
- Test with IME input methods for international users

### 1.5 Basic Command Menu Structure

```tsx
import { Command } from 'cmdk'

const CommandMenu = () => {
  return (
    <Command label="Command Menu">
      <Command.Input placeholder="Type a command or search..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Letters">
          <Command.Item>a</Command.Item>
          <Command.Item>b</Command.Item>
          <Command.Item value="c">c (with custom value)</Command.Item>
        </Command.Group>

        <Command.Group heading="Numbers">
          <Command.Item>1</Command.Item>
          <Command.Item>2</Command.Item>
        </Command.Group>
      </Command.List>
    </Command>
  )
}
```

### 1.6 Controlled State Pattern

```tsx
const [value, setValue] = React.useState('apple')

return (
  <Command value={value} onValueChange={setValue}>
    <Command.Input />
    <Command.List>
      <Command.Item>Orange</Command.Item>
      <Command.Item>Apple</Command.Item>
    </Command.List>
  </Command>
)
```

### 1.7 Loop Navigation

```tsx
<Command loop />
```
Enables wraparound when reaching the end of the list (circular navigation).

---

## 2. Debounced Search Implementation

### 2.1 Standard Debounce Delay: 300ms

**2026 Standard**: **300ms** is the industry-standard debounce delay for search inputs. This balances responsiveness with performance optimization.

**Why 300ms?**
- Fast enough to feel responsive to users
- Slow enough to prevent excessive API calls
- Validated by multiple 2025 research sources
- Aligns with human typing patterns (average pause between keystrokes)

### 2.2 Custom useDebounce Hook

**Recommended Implementation** (2025 pattern):

```tsx
import { useState, useEffect } from 'react'

/**
 * Custom hook to debounce a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 */
function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up timer to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up timer if value changes before delay expires
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
```

### 2.3 Usage Example with Search Input

```tsx
import { useState } from 'react'
import useDebounce from './hooks/useDebounce'

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform API call or filtering with debounced value
      performSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### 2.4 Preventing Excessive Filtering

**Key Optimization**: Debouncing prevents:
- Excessive re-renders of search results
- Unnecessary API calls to backend
- CPU overhead from repeated filtering operations

**Performance Impact**:
- **Without debounce**: 10 keystrokes = 10 filter operations
- **With 300ms debounce**: 10 keystrokes = 1-2 filter operations

### 2.5 Using Lodash Debounce (Alternative)

```tsx
import { useCallback, useEffect } from 'react'
import { debounce } from 'lodash'

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('')

  // Memoize debounced function to prevent re-creation on each render
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      performSearch(term)
    }, 300),
    []
  )

  useEffect(() => {
    return () => {
      // Cleanup: Cancel pending debounced calls on unmount
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  return (
    <input
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value)
        debouncedSearch(e.target.value)
      }}
    />
  )
}
```

**Critical Note**: When using lodash.debounce with React hooks, you must use `useCallback` to prevent the debounced function from being recreated on every render.

---

## 3. Search Result Highlighting & Fuzzy Matching

### 3.1 Fuzzy Matching Libraries

#### Fuse.js (Recommended)

**Fuse.js** is the most popular fuzzy search library for JavaScript/TypeScript in 2026.

**Installation**:
```bash
npm install fuse.js
```

**Basic Usage**:
```tsx
import Fuse from 'fuse.js'

const data = [
  { title: 'Apple', description: 'A red fruit' },
  { title: 'Banana', description: 'A yellow fruit' },
  { title: 'Orange', description: 'A citrus fruit' }
]

const fuse = new Fuse(data, {
  keys: ['title', 'description'],
  threshold: 0.3, // Lower = more strict matching (0.0 = exact, 1.0 = match anything)
  includeScore: true,
  includeMatches: true
})

const results = fuse.search('aple') // Will match "Apple" despite typo
```

#### Fast-Fuzzy (Performance-Optimized Alternative)

**fast-fuzzy** is a lightweight, lightning-quick alternative to Fuse.js.

**Installation**:
```bash
npm install fast-fuzzy
```

**Basic Usage**:
```tsx
import { search } from 'fast-fuzzy'

const data = ['Apple', 'Banana', 'Orange']

const results = search('aple', data, {
  keySelector: (item) => item,
  threshold: 0.3
})
```

### 3.2 Search Result Highlighting

**Best Practice**: Highlight matching text to show users why a result appears.

**Implementation with Fuse.js**:
```tsx
import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'

const SearchWithHighlight = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const fuse = useMemo(() => new Fuse(data, {
    keys: ['title', 'description'],
    includeMatches: true
  }), [])

  const results = useMemo(() => {
    if (!searchTerm) return data
    return fuse.search(searchTerm).map(result => result.item)
  }, [searchTerm, fuse])

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-black">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {results.map((item, index) => (
          <li key={index}>
            {highlightMatch(item.title, searchTerm)}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 3.3 Search Result Ranking & Scoring

**Fuse.js Scoring Algorithm**:
- Scores range from 0 (perfect match) to 1 (no match)
- Takes into account: typo tolerance, location of match, word boundaries
- Returns results sorted by relevance score

**Custom Scoring Function**:
```tsx
const fuse = new Fuse(data, {
  keys: ['title', 'description'],
  threshold: 0.3,
  includeScore: true,
  // Weight title matches higher than description matches
  fieldNormWeight: 0.5,
  // Boost exact word matches
  shouldSort: true,
  sortFn: (a, b) => (a.score || 0) - (b.score || 0)
})
```

**Best Practice**: Filter results by score threshold to exclude low-quality matches:
```tsx
const results = fuse.search(searchTerm)
  .filter(result => (result.score || 0) < 0.4) // Only include matches with score < 0.4
  .map(result => result.item)
```

### 3.4 Keywords for Better Matching

**cmdk Pattern**: Add keywords to items to improve discoverability.

```tsx
<Command.Item
  value="settings"
  keywords={['preferences', 'config', 'options']}
>
  Settings
</Command.Item>
```

**Usage**: Searching for "preferences", "config", or "options" will all match the "Settings" item.

### 3.5 Custom Filter Function

**cmdk Custom Filter**:
```tsx
<Command
  filter={(value, search) => {
    if (value.includes(search)) return 1
    return 0
  }}
>
```

**Filter Function Signature**:
- `value`: The item value
- `search`: The search query
- Returns: Score between 0-1 (1 = perfect match, 0 = no match)

### 3.6 Manual Filtering (Server-Side/Async)

**For large datasets or server-side search**:
```tsx
const [loading, setLoading] = useState(false)
const [items, setItems] = useState([])

useEffect(() => {
  async function getItems() {
    setLoading(true)
    const res = await api.get('/dictionary')
    setItems(res)
    setLoading(false)
  }
  getItems()
}, [])

return (
  <Command shouldFilter={false}>
    <Command.Input />
    <Command.List>
      {loading && <Command.Loading>Fetching words…</Command.Loading>}
      {filteredItems.map((item) => (
        <Command.Item key={item} value={item}>
          {item}
        </Command.Item>
      ))}
    </Command.List>
  </Command>
)
```

---

## 4. Accessibility Patterns

### 4.1 WAI-ARIA Combobox Pattern

**Standard**: All search inputs should follow the **WAI-ARIA 1.2 Combobox pattern**.

**Required ARIA Attributes**:

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `role="combobox"` | Identifies element as a combobox | `<input role="combobox" />` |
| `aria-autocomplete="list"` | Indicates list autocomplete behavior | `<input aria-autocomplete="list" />` |
| `aria-controls` | References the listbox element | `<input aria-controls="search-results" />` |
| `aria-expanded` | Indicates if listbox is open | `<input aria-expanded="true" />` |
| `aria-label` or `aria-labelledby` | Accessible name for the input | `<input aria-label="Search" />` |
| `aria-activedescendant` | References currently selected option | `<input aria-activedescendant="option-1" />` |

**Listbox Items**:
- `role="option"` on each item
- `aria-selected="true"` on selected item
- `aria-disabled="true"` on disabled items

### 4.2 cmdk Built-In Accessibility

**cmdk includes full accessibility support out of the box**:
- Proper ARIA attributes automatically applied
- Screen reader announcements for navigation
- Focus management for keyboard navigation
- IME composition handling for CJK languages

**No additional ARIA attributes required when using cmdk**.

### 4.3 Keyboard Navigation Best Practices

**Required Keyboard Interactions**:

| Key | Action | Required? |
|-----|--------|-----------|
| `ArrowDown` / `ArrowUp` | Navigate through items | **Required** |
| `Home` / `End` | Jump to first/last item | Recommended |
| `Enter` | Select current item | **Required** |
| `Esc` | Close menu | **Required** |
| `Tab` | Move focus to next element | **Required** |
| `Shift + Tab` | Move focus to previous element | **Required** |

**Focus Management**:
- When menu opens, focus should move to input field
- When menu closes, focus should return to trigger element
- Focus should be visible at all times (no outline removal)

### 4.4 Screen Reader Announcements

**Best Practice**: Use visually hidden labels for screen readers.

```tsx
<label htmlFor="search-input" className="sr-only">
  Search commands
</label>
<input
  id="search-input"
  type="text"
  aria-label="Search commands or use arrow keys to navigate"
/>
```

**CSS for Visually Hidden**:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 4.5 Live Region Updates

**For dynamic search results**:
```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  Found {results.length} results for "{searchTerm}"
</div>
```

**Live Region Settings**:
- `aria-live="polite"`: Announces changes when user is idle (recommended)
- `aria-live="assertive"`: Interrupts user immediately (use sparingly)
- `aria-atomic="true"`: Announces entire region as one unit

### 4.6 Contrast & Visual Accessibility

**WCAG 2.1 AA Standards**:
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text (18pt+)
- Focus indicators must be visible

**Best Practice**: Use a visible focus outline:
```css
input:focus, button:focus {
  outline: 2px solid #your-brand-color;
  outline-offset: 2px;
}
```

---

## 5. Radix UI Integration

### 5.1 Using Radix UI Dialog with cmdk

**Pattern**: Wrap cmdk in a Radix UI Dialog for modal behavior.

```tsx
import * as Dialog from '@radix-ui/react-dialog'
import { Command } from 'cmdk'

const CommandDialog = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
          <Command label="Command Menu">
            <Command.Input placeholder="Type a command or search..." />
            <Command.List>
              <Command.Empty>No results found.</Command.Empty>
              {/* Your command items */}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### 5.2 Radix UI Dialog Accessibility

**Radix UI Dialog includes**:
- Focus trap (keyboard cycles within dialog)
- Focus restoration on close
- `Esc` key to close
- `aria-labelledby` and `aria-describedby` management

**Keyboard Interactions**:
- `Tab`: Moves focus to next focusable element
- `Shift + Tab`: Moves focus to previous element
- `Esc`: Closes dialog and returns focus to trigger

### 5.3 Composing Radix UI Components

**Best Practice**: Compose Radix UI primitives to create custom components.

```tsx
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'

export const CommandDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ children, ...props }, forwardedRef) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
    <DialogPrimitive.Content {...props} ref={forwardedRef}>
      {children}
      <DialogPrimitive.Close aria-label="Close">
        <Cross2Icon />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
```

---

## 6. Mobile-Responsive Patterns

### 6.1 Mobile Design Trends 2026

**Key Trends**:
- **Bottom Navigation**: Easy thumb reach on mobile devices
- **Minimalist Design**: Clean, uncluttered interfaces
- **Dark Mode**: Standard expectation for apps
- **Touch-Friendly Targets**: Minimum 44x44px tap targets
- **Voice Search Integration**: Growing adoption of voice input

### 6.2 Responsive Command Menu

**Best Practice**: Full-screen modal on mobile, centered dialog on desktop.

```tsx
const CommandMenu = () => {
  return (
    <Dialog.Root>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-white rounded-lg shadow-lg
          w-full max-w-md
          p-4
          max-h-[80vh]
          overflow-y-auto
        ">
          <Command>
            <Command.Input placeholder="Search..." />
            <Command.List>
              <Command.Empty>No results found.</Command.Empty>
              {/* Items */}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### 6.3 Mobile-Specific Adjustments

**Full-Screen on Mobile**:
```tsx
const CommandMenu = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <Dialog.Root>
      <Dialog.Content className={cn(
        "bg-white",
        isMobile ? "fixed inset-0 rounded-none" : "rounded-lg max-w-md"
      )}>
        <Command>
          {/* ... */}
        </Command>
      </Dialog.Content>
    </Dialog.Root>
  )
}
```

### 6.4 Touch-Friendly Targets

**Minimum 44x44px** for all interactive elements (iOS/Android standard).

```css
.CommandItem {
  min-height: 44px;
  padding: 12px 16px;
}
```

### 6.5 Virtual Keyboard Handling

**Best Practice**: Adjust layout when virtual keyboard is open on mobile.

```tsx
const [keyboardOpen, setKeyboardOpen] = useState(false)

useEffect(() => {
  const handleResize = () => {
    // Check if visual viewport is smaller than layout viewport
    const visualViewport = window.visualViewport
    if (visualViewport) {
      setKeyboardOpen(visualViewport.height < window.innerHeight * 0.75)
    }
  }

  window.visualViewport?.addEventListener('resize', handleResize)
  return () => window.visualViewport?.removeEventListener('resize', handleResize)
}, [])
```

### 6.6 Search Input Icon Visibility

**Mobile Pattern**: Search icon visible when input is empty, clear button when input has text.

```tsx
const SearchInput = () => {
  const [value, setValue] = useState('')

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10 pr-10"
        placeholder="Search..."
      />
      {value === '' && (
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2" />
      )}
      {value !== '' && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  )
}
```

---

## 7. Performance Optimization

### 7.1 Virtualization for Large Lists

**react-window** is the standard library for virtualizing large lists.

**Installation**:
```bash
npm install react-window
```

**Basic Usage**:
```tsx
import { FixedSizeList } from 'react-window'

const SearchResults = ({ items }) => {
  const Row = ({ index, style }) => (
    <div style={style} className="p-4">
      {items[index].title}
    </div>
  )

  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

**Performance Impact**:
- **Without virtualization**: 10,000 items = 10,000 DOM nodes
- **With virtualization**: 10,000 items = ~20 DOM nodes (only visible items)

### 7.2 When to Use Virtualization

**Guidelines**:
- Use virtualization for **100+ items** in search results
- Consider virtualization at **50+ items** on mobile devices
- Always measure performance with React DevTools Profiler

**Example with cmdk**:
```tsx
<Command shouldFilter={false}>
  <Command.Input />
  <Command.List>
    {searchResults.length > 100 ? (
      <FixedSizeList
        height={400}
        itemCount={searchResults.length}
        itemSize={50}
        width="100%"
      >
        {({ index, style }) => (
          <Command.Item
            key={searchResults[index].id}
            value={searchResults[index].value}
            style={style}
          >
            {searchResults[index].label}
          </Command.Item>
        )}
      </FixedSizeList>
    ) : (
      searchResults.map((item) => (
        <Command.Item key={item.id} value={item.value}>
          {item.label}
        </Command.Item>
      ))
    )}
  </Command.List>
</Command>
```

### 7.3 Memoization Strategies

**Use React.memo** for list items to prevent unnecessary re-renders:
```tsx
const CommandItem = React.memo(({ item, onSelect }) => {
  return (
    <Command.Item value={item.value} onSelect={onSelect}>
      {item.label}
    </Command.Item>
  )
})
```

**Use useMemo** for expensive computations:
```tsx
const filteredResults = useMemo(() => {
  return data.filter(item => item.title.includes(searchTerm))
}, [data, searchTerm])
```

### 7.4 Code Splitting

**Lazy load search components**:
```tsx
import { lazy, Suspense } from 'react'

const CommandMenu = lazy(() => import('./CommandMenu'))

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommandMenu />
    </Suspense>
  )
}
```

### 7.5 Search Index Optimization

**For client-side search**, consider:
- Pre-compute search indexes on app load
- Use Web Workers for expensive search operations
- Cache search results in memory

**Example with Web Worker**:
```tsx
// search.worker.ts
import { expose } from 'comlink'
import Fuse from 'fuse.js'

const searchWorker = {
  fuse: null as Fuse<any> | null,

  init(data: any[]) {
    this.fuse = new Fuse(data, { keys: ['title', 'description'] })
  },

  search(query: string) {
    return this.fuse?.search(query) || []
  }
}

expose(searchWorker)
```

```tsx
// Main thread
import { wrap } from 'comlink'
import SearchWorker from './search.worker?worker'

const worker = wrap<{ init: (data: any[]) => void, search: (query: string) => any[] }>(new SearchWorker())

await worker.init(data)
const results = await worker.search('apple')
```

---

## 8. Loading States & Empty States

### 8.1 Loading States During Async Search

**Best Practice**: Show loading indicator during async search operations.

```tsx
const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!searchTerm) {
      setResults([])
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      const res = await api.search(searchTerm)
      setResults(res)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <Command>
      <Command.Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Command.List>
        {loading && <Command.Loading>Searching…</Command.Loading>}
        {!loading && results.length === 0 && <Command.Empty>No results found.</Command.Empty>}
        {!loading && results.map((item) => (
          <Command.Item key={item.id} value={item.value}>
            {item.label}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  )
}
```

### 8.2 Skeleton Loading Pattern

**2025 Trend**: Use skeleton screens instead of spinners for perceived performance.

```tsx
const SearchResultsSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 8.3 Empty State Best Practices

**5 Proven Strategies for "No Results" Pages** (Baymard Institute):

1. **Explain why there are no results**
   ```tsx
   <Command.Empty>
     No results found for "{searchTerm}"
     <div className="text-sm text-gray-500 mt-2">
       Try checking your spelling or using different keywords
     </div>
   </Command.Empty>
   ```

2. **Provide alternative search suggestions**
   ```tsx
   <Command.Empty>
     No results found for "{searchTerm}"
     <div className="mt-4">
       <p className="text-sm text-gray-600">Did you mean:</p>
       <ul className="mt-2 space-y-1">
         {suggestions.map((suggestion) => (
           <li key={suggestion}>
             <button onClick={() => setSearchTerm(suggestion)}>
               {suggestion}
             </button>
           </li>
         ))}
       </ul>
     </div>
   </Command.Empty>
   ```

3. **Link to popular items or categories**
   ```tsx
   <Command.Empty>
     No results found
     <div className="mt-4">
       <p className="text-sm text-gray-600 mb-2">Popular searches:</p>
       <div className="flex gap-2 flex-wrap">
         {popularSearches.map((term) => (
           <button
             key={term}
             onClick={() => setSearchTerm(term)}
             className="px-3 py-1 bg-gray-100 rounded-full text-sm"
           >
             {term}
           </button>
         ))}
       </div>
     </div>
   </Command.Empty>
   ```

4. **Allow users to revise the query easily**
   ```tsx
   <Command.Empty>
     No results found for "{searchTerm}"
     <div className="mt-4 flex items-center gap-2">
       <input
         type="text"
         defaultValue={searchTerm}
         className="border rounded px-3 py-2"
         placeholder="Try different keywords"
       />
       <button>Search</button>
     </div>
   </Command.Empty>
   ```

5. **Provide a clear call-to-action**
   ```tsx
   <Command.Empty>
     No results found
     <div className="mt-4">
       <button className="text-blue-600 hover:underline">
         Browse all items
       </button>
     </div>
   </Command.Empty>
   ```

### 8.4 Empty State Visual Design

**Best Practices**:
- Use clear, friendly illustrations or icons
- Keep text concise and actionable
- Maintain sufficient color contrast (WCAG AA)
- Ensure empty state is visually distinct from loading state

```tsx
const EmptyState = ({ searchTerm }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <SearchIcon className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No results found
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        We couldn't find anything matching "{searchTerm}"
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setSearchTerm('')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Clear search
        </button>
      </div>
    </div>
  )
}
```

---

## 9. Implementation Recommendations

### 9.1 Recommended Tech Stack

**For Project Alpha** (as of January 2026):

| Component | Library | Version |
|-----------|---------|---------|
| **Command Menu** | cmdk | Latest (pacocoursey/cmdk) |
| **Dialog/Modal** | @radix-ui/react-dialog | Latest |
| **Fuzzy Search** | Fuse.js | 7.x |
| **Virtualization** | react-window | 1.x |
| **Debounce** | Custom useDebounce hook | - |

### 9.2 Complete Implementation Example

**File: `src/components/ui/CommandMenu.tsx`**

```tsx
import * as React from 'react'
import { Command } from 'cmdk'
import * as Dialog from '@radix-ui/react-dialog'
import { useDebounce } from '@/hooks/useDebounce'
import Fuse from 'fuse.js'

interface CommandItem {
  id: string
  label: string
  value: string
  keywords?: string[]
  icon?: React.ReactNode
  action?: () => void
}

interface CommandMenuProps {
  items: CommandItem[]
  triggerLabel?: string
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  items,
  triggerLabel = 'Search…'
}) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const debouncedSearch = useDebounce(search, 300)

  // Keyboard shortcut to toggle menu (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Fuzzy search with Fuse.js
  const fuse = React.useMemo(
    () =>
      new Fuse(items, {
        keys: ['label', 'keywords', 'value'],
        threshold: 0.3,
        includeScore: true
      }),
    [items]
  )

  const filteredItems = React.useMemo(() => {
    if (!debouncedSearch) return items
    return fuse.search(debouncedSearch).map((result) => result.item)
  }, [debouncedSearch, fuse, items])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="px-4 py-2 border rounded">
        {triggerLabel} <kbd className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">⌘K</kbd>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <Command label="Command Menu" className="flex-1 flex flex-col">
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search…"
              className="border-b px-4 py-3 text-lg outline-none"
            />

            <Command.List className="flex-1 overflow-y-auto p-2">
              <Command.Empty>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    No results found
                  </p>
                  <p className="text-sm text-gray-600">
                    We couldn't find anything matching "{debouncedSearch}"
                  </p>
                </div>
              </Command.Empty>

              {filteredItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.value}
                  onSelect={() => {
                    item.action?.()
                    setOpen(false)
                    setSearch('')
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100"
                >
                  {item.icon && (
                    <span className="text-gray-500">{item.icon}</span>
                  )}
                  <span className="flex-1">{item.label}</span>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### 9.3 Usage Example

**File: `src/routes/index.tsx`**

```tsx
import { CommandMenu } from '@/components/ui/CommandMenu'
import { HomeIcon, SettingsIcon, FileIcon } from '@/components/ui/icons'

const commandItems = [
  {
    id: 'home',
    label: 'Go to Home',
    value: 'home',
    keywords: ['dashboard', 'main'],
    icon: <HomeIcon />,
    action: () => navigate({ to: '/' })
  },
  {
    id: 'settings',
    label: 'Open Settings',
    value: 'settings',
    keywords: ['preferences', 'config'],
    icon: <SettingsIcon />,
    action: () => navigate({ to: '/settings' })
  },
  {
    id: 'files',
    label: 'Browse Files',
    value: 'files',
    keywords: ['explorer', 'documents'],
    icon: <FileIcon />,
    action: () => navigate({ to: '/files' })
  }
]

const App = () => {
  return (
    <div>
      <CommandMenu items={commandItems} />
      {/* Rest of your app */}
    </div>
  )
}
```

### 9.4 Testing Checklist

**Manual Testing**:
- [ ] Cmd+K / Ctrl+K opens and closes menu
- [ ] Typing filters items correctly
- [ ] Arrow keys navigate items
- [ ] Enter selects item
- [ ] Esc closes menu
- [ ] Clicking outside closes menu
- [ ] Tab moves focus correctly
- [ ] Screen reader announces all interactions
- [ ] Focus is visible at all times
- [ ] Empty state displays when no results
- [ ] Loading state displays during async search
- [ ] Mobile layout works (full-screen on small screens)

**Automated Testing** (with React Testing Library):
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandMenu } from './CommandMenu'

describe('CommandMenu', () => {
  it('should open on Cmd+K', () => {
    render(<CommandMenu items={commandItems} />)

    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(screen.getByRole('dialog')).toBeVisible()
  })

  it('should filter items based on search input', () => {
    render(<CommandMenu items={commandItems} />)

    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'settings' } })

    expect(screen.getByText('Open Settings')).toBeVisible()
    expect(screen.queryByText('Go to Home')).not.toBeInTheDocument()
  })

  it('should show empty state when no results match', () => {
    render(<CommandMenu items={commandItems} />)

    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'nonexistent' } })

    expect(screen.getByText(/no results found/i)).toBeVisible()
  })
})
```

### 9.5 Performance Metrics

**Target Metrics** (2026 Standards):
- **Time to interactive**: < 100ms after Cmd+K press
- **Filter latency**: < 16ms (60fps) for 1000 items
- **Keyboard response**: < 50ms for arrow key navigation
- **Debounce delay**: 300ms (standard)

**Benchmarking**:
```tsx
// Measure filtering performance
const start = performance.now()
const results = fuse.search(searchTerm)
const end = performance.now()
console.log(`Filtering took ${end - start}ms`)
```

---

## 10. Key Takeaways

1. **cmdk** is the industry standard for command palettes in 2026
2. **300ms debounce delay** is the proven best practice for search inputs
3. **Fuse.js** provides the best balance of features and performance for fuzzy matching
4. **WAI-ARIA Combobox pattern** is the accessibility standard for search inputs
5. **Virtualization** (react-window) is essential for 100+ search results
6. **Mobile-first design**: Full-screen modal on mobile, centered dialog on desktop
7. **Empty states** should be actionable and helpful (5 proven strategies)
8. **Keyboard shortcuts** must handle IME composition for CJK languages
9. **Accessibility is built-in** to cmdk and Radix UI components
10. **Performance optimization** requires debouncing, memoization, and virtualization

---

## Sources & References

### MCP Tool Usage (5+ Turns):

1. **Context7**: Radix UI primitives documentation
   - Dialog accessibility patterns
   - Keyboard interactions
   - ARIA attributes

2. **MiniMax Web Search** (5 searches):
   - React debounced search 2026 best practices
   - Command palette keyboard shortcuts
   - Fuzzy search highlighting (Fuse.js, fast-fuzzy)
   - Virtual scrolling with react-window
   - ARIA accessibility patterns

3. **DeepWiki**:
   - pacocoursey/cmdk repository
   - Keyboard shortcuts API
   - Vim bindings
   - IME composition handling
   - Mobile responsiveness patterns

### Additional Sources:

- **cmdk Documentation**: https://github.com/pacocoursey/cmdk
- **Fuse.js Documentation**: https://www.fusejs.io/
- **Radix UI Primitives**: https://www.radix-ui.com/primitives
- **WAI-ARIA Combobox Pattern**: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- **react-window**: https://github.com/bvaughn/react-window
- **Baymard Institute**: No Results Page UX Research

### Research Date: 2026-01-02

---

**Next Steps**:
1. Create epic/story for implementing search input components across Project Alpha
2. Update UI component library with CommandMenu component
3. Add search functionality to Knowledge, Notes, and Study workspaces
4. Implement global keyboard shortcut (Cmd+K) for command palette
5. Add search to existing Agent selectors for agent discovery

**Document Status**: ✅ Research Complete - Ready for Development
