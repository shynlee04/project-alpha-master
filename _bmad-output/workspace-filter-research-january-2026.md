# Multi-Select Filter Components Research - January 2026

**Date**: 2026-01-02
**Research Focus**: React multi-select filter patterns for workspace filtering (IDE, Knowledge, Notes, Study)
**MCP Tool Turns**: 7 (Context7 x2, Web Search x5)

---

## Executive Summary

This document consolidates January 2026 best practices for multi-select filter components in React applications, specifically tailored for workspace filtering scenarios. Research conducted through 7 MCP tool turns covering official documentation (Radix UI, TanStack Router), web searches for latest patterns, and analysis of existing Via-gent codebase patterns.

**Key Findings**:
- **Radix UI DropdownMenu** with CheckboxItem provides excellent accessibility foundation
- **Shadcn/ui multi-select** pattern (community-built) offers modern implementation with Command + Popover
- **TanStack Router** search params provide production-grade state persistence
- **Filter badges/chips** industry standard: Material Design 3 "Filter Chips" pattern
- **Performance critical**: Virtualization required for 1000+ items (react-virtualized/react-window)
- **Mobile pattern**: Bottom sheet/drawer filters with "Apply" button (batch filtering)

---

## 1. Multi-Select Dropdown Patterns

### 1.1 Radix UI Dropdown Menu + CheckboxItem

**Source**: Radix UI Primitives documentation (via Context7)

**Best Practice Pattern**:
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/presentation/components/ui/dropdown-menu';

function MultiSelectFilter({
  options,
  selected,
  onChange,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Filters {selected.length > 0 && `(${selected.length})`}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.id}
            checked={selected.includes(option.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...selected, option.id]);
              } else {
                onChange(selected.filter((id) => id !== option.id));
              }
            }}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}

        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange([])}>
              Clear all filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Accessibility Features** (built-in to Radix UI):
- ARIA attributes auto-managed (`aria-checked`, `aria-selected`, `role="menuitemcheckbox"`)
- Keyboard navigation (Arrow keys, Space, Enter, Escape)
- Focus trap and focus restoration
- Screen reader announcements

**Custom Hook Pattern**:
```tsx
function useMultiSelect(initial: string[] = []) {
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isSelected = (id: string) => selected.includes(id);

  const clear = () => setSelected([]);

  const setAll = (ids: string[]) => setSelected(ids);

  const toggleAll = (allIds: string[]) => {
    const allSelected = allIds.every((id) => selected.includes(id));
    setSelected(allSelected ? [] : allIds);
  };

  return { selected, toggle, isSelected, clear, setAll, toggleAll };
}
```

### 1.2 Shadcn/ui Multi-Select with Command

**Source**: Community GitHub issue (#948), Web Search results

**Pattern**: Combobox-style multi-select with search functionality

```tsx
import { Command } from 'cmdk';
import { Popover } from '@radix-ui/react-popover';
import { X } from 'lucide-react';

function MultiSelectCombobox({
  options,
  selected,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selected.length === 0
            ? 'Select filters...'
            : `${selected.length} selected`}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-200 p-0" align="start">
        <Command>
          <Command.Input
            placeholder="Search filters..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />

          <Command.List>
            <Command.Empty>No filters found.</Command.Empty>

            {/* Select All / Deselect All */}
            <Command.Item
              onSelect={() => {
                const allSelected = filteredOptions.every((opt) =>
                  selected.includes(opt.id)
                );
                onChange(allSelected ? [] : filteredOptions.map((opt) => opt.id));
              }}
            >
              {filteredOptions.every((opt) => selected.includes(opt.id))
                ? 'Deselect All'
                : 'Select All'}
            </Command.Item>

            <Command.Separator />

            {filteredOptions.map((option) => (
              <Command.Item
                key={option.id}
                value={option.id}
                onSelect={() => {
                  const newSelected = selected.includes(option.id)
                    ? selected.filter((id) => id !== option.id)
                    : [...selected, option.id];
                  onChange(newSelected);
                }}
              >
                <div className="flex items-center gap-2">
                  <Check
                    className={cn(
                      'h-4 w-4',
                      selected.includes(option.id)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {option.label}
                </div>
              </Command.Item>
            ))}
          </Command.List>
        </Command>

        {/* Selected filters as removable chips */}
        {selected.length > 0 && (
          <div className="border-t p-2">
            <div className="flex flex-wrap gap-2">
              {selected.map((id) => {
                const option = options.find((opt) => opt.id === id);
                return (
                  <Badge key={id} variant="secondary">
                    {option?.label}
                    <button
                      onClick={() =>
                        onChange(selected.filter((s) => s !== id))
                      }
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
```

**Advantages**:
- Search within dropdown (cmdk fuzzy search)
- Keyboard-first navigation (Cmd+K pattern)
- More compact than separate search + filter
- Better for large option sets (50+ items)

**Disadvantages**:
- Requires external package (`cmdk`)
- More complex setup
- Steeper learning curve

### 1.3 Via-gent Codebase Pattern

**Analysis of Existing Components**:

**UnifiedAgentSelector.tsx** (Lines 1-333):
- Uses Radix UI `Select` component for single-select
- Dropdown menu variant for minimal UI
- Per-workspace state persistence via `useAgentSelectionStore`
- Status indicator (color-coded dots)
- Variant system: full, compact, minimal

**CollectionSelector.tsx** (Lines 1-164):
- Radix UI Dialog pattern for multi-select
- Checkbox list with labels
- "Done" and "Cancel" buttons
- Empty state handling
- Source-to-collection management

**Key Patterns**:
- Checkbox groups with visual feedback
- Modal dialog for multi-select (good for mobile)
- Empty state messaging critical
- Action buttons for commit/cancel

---

## 2. Filter Badge Display (Chips, Tags, Pills)

### 2.1 Material Design 3 Filter Chips

**Source**: Web Search (Material Design 3 documentation)

**Best Practice**: "Filter chips allow users to quickly filter content by allowing users to select from multiple chips."

**Implementation Pattern**:
```tsx
import { X } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

function FilterChip({
  label,
  onRemove,
  variant = 'default'
}: FilterChipProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        'gap-1 pr-1 pl-2 py-1',
        'hover:bg-accent-foreground/10',
        'transition-colors',
        'cursor-pointer'
      )}
    >
      <span className="text-xs font-medium">{label}</span>
      <button
        onClick={onRemove}
        className="rounded-full hover:bg-destructive/20 p-0.5"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

function FilterChips({
  filters,
  onRemove,
  onClearAll
}: {
  filters: Array<{ id: string; label: string }>;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">
        Active filters:
      </span>

      {filters.map((filter) => (
        <FilterChip
          key={filter.id}
          label={filter.label}
          onRemove={() => onRemove(filter.id)}
        />
      ))}

      <button
        onClick={onClearAll}
        className="text-xs text-destructive hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
```

**Accessibility**:
- `aria-label` on remove buttons
- Keyboard focus visible on chips
- Screen reader announces "Active filters: [count]"
- Color contrast ratios (WCAG AA minimum)

### 2.2 Badge vs. Chip vs. Tag vs. Pill

**Source**: Web Search (UX design articles)

**Terminology** (Jan 2026 industry consensus):
- **Badge**: Status indicator (count, notification) - NON-interactive
- **Chip/Tag**: Interactive filter element - removable, selectable
- **Pill**: Visual style descriptor (rounded rectangle)

**Usage**:
- Use **chips** for multi-select filters (Material Design 3)
- Use **badges** for counts ("5 selected")
- Use **tags** for categorization (blog posts, labels)

**Via-gent Recommendation**:
```tsx
// For workspace filtering - use CHIPS (interactive, removable)
<FilterChip label="IDE" onRemove={() => removeFilter('ide')} />

// For count display - use BADGE (non-interactive)
<Badge variant="secondary">{selectedFilters.length} filters</Badge>

// For categorization - use TAGS (static labels)
<div className="flex gap-2">
  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
    JavaScript
  </span>
</div>
```

### 2.3 Responsive Badge Display

**Pattern for Mobile vs Desktop**:
```tsx
function FilterChipsResponsive({ filters, onRemove, onClearAll }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    // Mobile: Show count + "Filters" button (opens drawer)
    return (
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filters {filters.length > 0 && `(${filters.length})`}
      </Button>
    );
  }

  // Desktop: Show all chips
  return <FilterChips filters={filters} onRemove={onRemove} onClearAll={onClearAll} />;
}
```

---

## 3. Select All / Deselect All Patterns

### 3.1 UX Best Practices

**Source**: Web Search (UX Stack Exchange, Nielson Norman Group)

**Recommendations** (Jan 2026 consensus):

1. **Placement**: Top of filter list, before individual options
2. **Label**: "Select All" changes to "Deselect All" when all selected
3. **Indeterminate State**: When some (but not all) selected, show dash in checkbox
4. **Performance**: Debounce Select All for 1000+ items (prevent UI freeze)

```tsx
function SelectAllCheckbox({
  options,
  selected,
  onToggle
}: {
  options: { id: string }[];
  selected: string[];
  onToggle: () => void;
}) {
  const allSelected = options.length > 0 &&
    options.every((opt) => selected.includes(opt.id));

  const someSelected = options.some((opt) => selected.includes(opt.id));

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Checkbox
        checked={allSelected}
        // Indeterminate state when some selected
        ref={(ref) => {
          if (ref) {
            ref.indeterminate = someSelected && !allSelected;
          }
        }}
        onCheckedChange={onToggle}
        aria-label={allSelected ? 'Deselect all' : 'Select all'}
      />
      <span className="text-sm font-medium">
        {allSelected ? 'Deselect All' : 'Select All'}
      </span>
    </div>
  );
}
```

### 3.2 Bulk Selection with Filters

**Pattern**: When filter list is itself filterable (search within filters)

```tsx
function FilterableMultiSelect({ options, selected, onChange }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allFilteredSelected = filteredOptions.every((opt) =>
    selected.includes(opt.id)
  );

  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      // Deselect only filtered options
      const filteredIds = new Set(filteredOptions.map((opt) => opt.id));
      onChange(selected.filter((id) => !filteredIds.has(id)));
    } else {
      // Select only filtered options (preserving existing selections)
      const filteredIds = filteredOptions.map((opt) => opt.id);
      onChange([...new Set([...selected, ...filteredIds])]);
    }
  };

  return (
    <div>
      <Input
        placeholder="Search filters..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <SelectAllCheckbox
        options={filteredOptions}
        selected={selected}
        onToggle={toggleAllFiltered}
      />

      {filteredOptions.map((option) => (
        <FilterCheckbox
          key={option.id}
          option={option}
          selected={selected}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
```

**UX Consideration**: When search filters the list, "Select All" should only affect visible items (not entire dataset).

---

## 4. State Persistence Across Navigation

### 4.1 TanStack Router Search Params (RECOMMENDED)

**Source**: TanStack Router documentation (via Context7)

**Best Practice**: URL search params for shareable, bookmarkable filter state

```tsx
import { useSearch, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

// Define search param schema
const workspaceSearchSchema = z.object({
  workspaces: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  sortBy: z.enum(['name', 'date', 'size']).default('name'),
  searchQuery: z.string().optional(),
});

// In route definition
export const Route = createFileRoute('/hub')({
  validateSearch: zodValidator(workspaceSearchSchema),
  search: {
    middlewares: [
      stripSearchParams({
        sortBy: 'name', // Strip default values from URL
        workspaces: [],
        status: [],
      }),
    ],
  },
});

// Component
function WorkspaceFilters() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/hub' });

  const updateFilters = (newFilters: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...newFilters,
      }),
    });
  };

  const clearFilters = () => {
    navigate({
      search: (prev) => {
        const { workspaces, status, searchQuery, ...rest } = prev;
        return rest;
      },
    });
  };

  return (
    <div>
      <MultiSelectFilter
        options={workspaceOptions}
        selected={search.workspaces || []}
        onChange={(workspaces) => updateFilters({ workspaces })}
      />

      <MultiSelectFilter
        options={statusOptions}
        selected={search.status || []}
        onChange={(status) => updateFilters({ status })}
      />

      {(search.workspaces?.length || 0) + (search.status?.length || 0) > 0 && (
        <Button onClick={clearFilters}>Clear all</Button>
      )}
    </div>
  );
}
```

**Advantages**:
- Shareable URLs (send filtered view to team members)
- Browser back button support
- Persistent across page reloads
- Bookmarkable filtered views
- Server-side rendering compatible

### 4.2 Local Storage Persistence (Alternative)

**Use Case**: User-specific filter preferences, not shareable

```tsx
import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

function WorkspaceFiltersLocalStorage() {
  const [filters, setFilters] = useLocalStorage('workspace-filters', {
    workspaces: [],
    status: [],
  });

  // Sync with URL on mount (optional)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const workspacesFromUrl = urlParams.getAll('workspaces');
    if (workspacesFromUrl.length > 0) {
      setFilters((prev) => ({ ...prev, workspaces: workspacesFromUrl }));
    }
  }, []);

  return (
    <MultiSelectFilter
      selected={filters.workspaces}
      onChange={(workspaces) =>
        setFilters((prev) => ({ ...prev, workspaces }))
      }
    />
  );
}
```

**Via-gent Recommendation**: Use TanStack Router search params for hub/workspace filtering (shareability), localStorage for user preferences (e.g., default workspace).

### 4.3 Zustand Store (Current Via-gent Pattern)

**Analysis**: `useAgentSelectionStore` pattern from existing codebase

```tsx
// src/infrastructure/persistence/stores/agents/agent-selection-store.ts
interface AgentSelectionState {
  lastSelectedAgentIds: Record<WorkspaceType, string>;
  defaultAgentIds: Record<WorkspaceType, string>;

  getAgentForWorkspace: (workspaceType: WorkspaceType) => Agent | undefined;
  setActiveAgent: (agentId: string, workspaceType: WorkspaceType) => void;
}

// Usage in UnifiedAgentSelector.tsx (Lines 107-112)
const getAgentForWorkspace = useAgentSelectionStore((state) => state.getAgentForWorkspace);
const setActiveAgent = useAgentSelectionStore((state) => state.setActiveAgent);
const lastSelectedAgentIds = useAgentSelectionStore((state) => state.lastSelectedAgentIds);
const defaultAgentIds = useAgentSelectionStore((state) => state.defaultAgentIds);
```

**Recommendation for Workspace Filters**:
```tsx
// src/infrastructure/persistence/stores/workspace-filter-store.ts
interface WorkspaceFilterState {
  // Per-workspace filter state
  filters: Record<WorkspaceType, {
    selectedIds: string[];
    dateRange?: { start: Date; end: Date };
    tags?: string[];
  }>;

  // Actions
  setFilter: (workspaceType: WorkspaceType, filter: WorkspaceFilterState['filters'][WorkspaceType]) => void;
  clearFilter: (workspaceType: WorkspaceType) => void;
  getSelectedIds: (workspaceType: WorkspaceType) => string[];
}

export const useWorkspaceFilterStore = create<WorkspaceFilterState>()(
  persist(
    (set, get) => ({
      filters: {
        ide: { selectedIds: [] },
        knowledge: { selectedIds: [] },
        notes: { selectedIds: [] },
        study: { selectedIds: [] },
      },

      setFilter: (workspaceType, filter) =>
        set((state) => ({
          filters: { ...state.filters, [workspaceType]: filter },
        })),

      clearFilter: (workspaceType) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [workspaceType]: { selectedIds: [] },
          },
        })),

      getSelectedIds: (workspaceType) =>
        get().filters[workspaceType]?.selectedIds || [],
    }),
    {
      name: 'workspace-filter-storage',
      storage: createJSONStorage(() => createDexieStorage('workspaceFilters')),
    }
  )
);
```

---

## 5. Search + Filter Integration Patterns

### 5.1 Separated Search + Filter (RECOMMENDED)

**Source**: Web Search (UX research, enterprise filtering patterns)

**Best Practice**: Separate search bar (global text search) + filter panel (structured filters)

```
┌─────────────────────────────────────────────────┐
│ 🔍 Search projects...                    [⚙️]  │ <- Search bar + filter trigger
├─────────────────────────────────────────────────┤
│ [x] IDE     [x] Knowledge    [ ] Notes    [x] Study │ <- Active filter chips
├─────────────────────────────────────────────────┤
│ Project 1 (IDE)                                 │
│ Project 2 (Knowledge)                           │
│ ...                                            │
└─────────────────────────────────────────────────┘
```

**Advantages**:
- Clear mental model (search = text, filters = structured)
- Better for complex filter combinations
- Industry standard (Gmail, GitHub, Jira)

**Implementation**:
```tsx
function SearchAndFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesWorkspace =
        selectedWorkspaces.length === 0 ||
        selectedWorkspaces.includes(project.workspaceType);

      return matchesSearch && matchesWorkspace;
    });
  }, [projects, searchQuery, selectedWorkspaces]);

  return (
    <div>
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setIsFilterPanelOpen(true)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {selectedWorkspaces.length > 0 && (
            <Badge variant="secondary">{selectedWorkspaces.length}</Badge>
          )}
        </Button>
      </div>

      {/* Active filter chips */}
      <FilterChips
        filters={selectedWorkspaces.map((id) => ({
          id,
          label: workspaceLabels[id],
        }))}
        onRemove={(id) =>
          setSelectedWorkspaces((prev) => prev.filter((x) => x !== id))
        }
        onClearAll={() => setSelectedWorkspaces([])}
      />

      {/* Filter panel (dialog on mobile, sidebar on desktop) */}
      <FilterPanel
        open={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        selected={selectedWorkspaces}
        onChange={setSelectedWorkspaces}
      />

      {/* Results */}
      <ProjectList projects={filteredProjects} />
    </div>
  );
}
```

### 5.2 Combined Search + Filter (Enterprise UX)

**Source**: Web Search (Medium article "When Search Meets Filter")

**Pattern**: Single input with dropdown for structured filters

```
┌─────────────────────────────────────────────────┐
│ 🔍 is:IDE is:Knowledge after:2024-01-01        │ <- Unified search input
├─────────────────────────────────────────────────┤
│ Suggestions:                                    │
│   is:IDE                                        │
│   is:Knowledge                                  │
│   after:2024-01-01                              │
└─────────────────────────────────────────────────┘
```

**Advantages**:
- Powerful for power users
- Familiar to developers (GitHub search syntax)
- Compact UI

**Disadvantages**:
- Steeper learning curve
- Not discoverable for casual users
- Complex parsing logic

**Via-gent Recommendation**: Use separated pattern for broad audience, combined pattern for power-user features (IDE workspace search).

---

## 6. Accessibility (ARIA, Keyboard Navigation)

### 6.1 Radix UI Built-in Accessibility

**Source**: Radix UI Dropdown Menu documentation

**Features** (auto-managed):
- `role="menu"`, `role="menuitemcheckbox"`
- `aria-checked` state on checkboxes
- `aria-expanded` on dropdown trigger
- Focus management (trap, restore, initial)
- Keyboard navigation (Arrow keys, Home, End, Space, Enter, Escape)

**Custom ARIA Labels**:
```tsx
<DropdownMenuTrigger aria-label="Open workspace filters">
  <Button>Filters</Button>
</DropdownMenuTrigger>

<DropdownMenuCheckboxItem
  aria-label={`Filter by ${option.label}`}
  checked={selected.includes(option.id)}
>
  {option.label}
</DropdownMenuCheckboxItem>
```

### 6.2 Keyboard Navigation Patterns

**Standard Keybindings** (expected behavior):

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Toggle checkbox, open dropdown |
| `Escape` | Close dropdown |
| `ArrowDown` | Move to next item |
| `ArrowUp` | Move to previous item |
| `Home` | Jump to first item |
| `End` | Jump to last item |
| `Tab` | Exit dropdown (move to next focusable element) |

**Implementation** (Radix UI handles this automatically):
```tsx
// Custom keyboard shortcuts
function MultiSelectWithKeyboard() {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + A to select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      toggleAll();
    }

    // Ctrl/Cmd + D to deselect all
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      clearAll();
    }

    // Escape to close dropdown
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {/* Filter UI */}
    </div>
  );
}
```

### 6.3 Screen Reader Announcements

**Pattern**: Live region for filter count updates

```tsx
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

function FilterWithAnnouncements() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div>
      <VisuallyHidden>
        <span role="status" aria-live="polite">
          {selected.length} filters selected
        </span>
      </VisuallyHidden>

      {/* Filter UI */}
    </div>
  );
}
```

**Aria-live regions**: Use `polite` for non-urgent updates (filter count), `assertive` for errors only.

---

## 7. Mobile-Responsive Filter UI

### 7.1 Bottom Sheet / Drawer Pattern

**Source**: Web Search (Mobile Filter UX Design Patterns)

**Best Practice**: Full-screen or bottom sheet filter panel on mobile

```
┌─────────────────────────────┐
│ ──────────────────────────  │ <- Drag handle
│ Filters (3)           [Done]│ <- Header with close
├─────────────────────────────┤
│ [✓] IDE                     │
│ [✓] Knowledge               │
│ [  ] Notes                  │
│ [✓] Study                   │
├─────────────────────────────┤
│ [Clear All]                 │ <- Action button
└─────────────────────────────┘
```

**Implementation** (Shadcn Sheet):
```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/presentation/components/ui/sheet';

function MobileFilterSheet({
  options,
  selected,
  onChange,
  onClearAll,
}: MobileFilterProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!isMobile) {
    // Desktop: Use dropdown
    return (
      <DropdownMenu>
        {/* Desktop filter UI */}
      </DropdownMenu>
    );
  }

  // Mobile: Use bottom sheet
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {selected.length > 0 && <Badge>{selected.length}</Badge>}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filters {selected.length > 0 && `(${selected.length})`}</SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 p-4 border rounded-lg"
            >
              <Checkbox
                checked={selected.includes(option.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selected, option.id]);
                  } else {
                    onChange(selected.filter((id) => id !== option.id));
                  }
                }}
              />
              <span className="flex-1">{option.label}</span>
            </label>
          ))}
        </div>

        {selected.length > 0 && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              onClearAll();
              // Close sheet
              document.querySelector('[data-state="open"]')?.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Escape' })
              );
            }}
          >
            Clear All Filters
          </Button>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

### 7.2 Batch Filtering (Mobile-First)

**Source**: Web Search (Mobile Filter UX best practices)

**Pattern**: "Apply" button to commit filters (no live filtering on mobile)

```tsx
function MobileFilterBatch({ options, selected, onApply }) {
  const [pendingSelected, setPendingSelected] = useState(selected);

  const handleApply = () => {
    onApply(pendingSelected);
    // Close sheet
  };

  const handleClear = () => {
    setPendingSelected([]);
  };

  return (
    <Sheet>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        {/* Filter checkboxes */}
        <div className="py-4 space-y-2">
          {options.map((option) => (
            <label key={option.id} className="flex items-center gap-2">
              <Checkbox
                checked={pendingSelected.includes(option.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setPendingSelected([...pendingSelected, option.id]);
                  } else {
                    setPendingSelected(pendingSelected.filter((id) => id !== option.id));
                  }
                }}
              />
              {option.label}
            </label>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleClear}>
            Clear
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Apply {pendingSelected.length > 0 && `(${pendingSelected.length})`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**UX Consideration**: On mobile, filtering can be slow (network latency, data processing). Batch filtering with "Apply" button provides better performance perception.

---

## 8. Performance for Large Datasets (1000+ Items)

### 8.1 Virtualization (REQUIRED)

**Source**: Web Search (React performance optimization articles)

**Problem**: Rendering 1000+ checkboxes causes UI freeze

**Solution**: Virtual scrolling (render only visible items)

**Implementation** (react-window):
```tsx
import { FixedSizeList } from 'react-window';

function VirtualizedMultiSelect({
  options,
  selected,
  onChange,
}: VirtualizedMultiSelectProps) {
  const ITEM_HEIGHT = 48; // Height of each checkbox row
  const LIST_HEIGHT = 400; // Visible area height

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const option = options[index];

    return (
      <div style={style} className="flex items-center gap-2 px-2">
        <Checkbox
          checked={selected.includes(option.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              onChange([...selected, option.id]);
            } else {
              onChange(selected.filter((id) => id !== option.id));
            }
          }}
        />
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <FixedSizeList
      height={LIST_HEIGHT}
      itemCount={options.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

**Performance Gain**: Renders ~20 items instead of 1000+ (50x reduction)

### 8.2 Debounced Search

**Pattern**: Delay filter application while typing

```tsx
import { useDebouncedCallback } from 'use-debounce';

function FilterWithDebounce() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input (300ms delay)
  const debouncedSetSearch = useDebouncedCallback(
    (value: string) => {
      setDebouncedQuery(value);
    },
    300 // 300ms delay
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [options, debouncedQuery]);

  return (
    <div>
      <Input
        placeholder="Search filters..."
        value={searchQuery}
        onChange={handleChange}
      />
      {searchQuery !== debouncedQuery && (
        <span className="text-xs text-muted-foreground">
          Searching...
        </span>
      )}
      <MultiSelectFilter
        options={filteredOptions}
        selected={selected}
        onChange={onChange}
      />
    </div>
  );
}
```

### 8.3 Memoization Strategies

**Pattern**: Prevent unnecessary re-renders with `useMemo` and `useCallback`

```tsx
function OptimizedMultiSelect({
  options,
  selected,
  onChange,
}: OptimizedMultiSelectProps) {
  // Memoize filtered options to prevent recalculation
  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Memoize toggle handler to prevent child re-renders
  const handleToggle = useCallback((id: string) => {
    const newSelected = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    onChange(newSelected);
  }, [selected, onChange]);

  // Memoize select all handler
  const handleToggleAll = useCallback(() => {
    const allSelected = filteredOptions.every((opt) => selected.includes(opt.id));
    onChange(allSelected ? [] : filteredOptions.map((opt) => opt.id));
  }, [filteredOptions, selected, onChange]);

  return (
    <div>
      {/* Filter UI */}
    </div>
  );
}
```

---

## 9. Implementation Recommendations for Via-gent

### 9.1 Workspace Filter Component

**Recommended Architecture**:

```
src/presentation/components/workspace/
├── WorkspaceFilter.tsx                 # Main component (120 lines)
├── WorkspaceFilterBadge.tsx            # Badge display (50 lines)
├── WorkspaceFilterSheet.tsx            # Mobile sheet (80 lines)
├── WorkspaceFilterDropdown.tsx         # Desktop dropdown (100 lines)
├── hooks/
│   ├── useWorkspaceFilters.ts         # Filter state hook (60 lines)
│   └── useWorkspaceFilterSync.ts      # URL sync hook (40 lines)
└── types.ts                            # Filter types (30 lines)
```

**Component Interface**:
```tsx
// WorkspaceFilter.tsx
interface WorkspaceFilterProps {
  /** Workspace type (auto-detected if not provided) */
  workspaceType?: WorkspaceType;

  /** Available filter options */
  options: WorkspaceFilterOption[];

  /** Initial selected filter IDs */
  defaultSelected?: string[];

  /** Callback when selection changes */
  onChange?: (selected: string[]) => void;

  /** Display variant */
  variant?: 'dropdown' | 'sheet' | 'inline';

  /** Enable URL persistence */
  persistToUrl?: boolean;
}

interface WorkspaceFilterOption {
  id: string;
  label: string;
  icon?: React.ComponentType;
  count?: number;
  color?: string;
}
```

### 9.2 State Management Strategy

**Recommended**: TanStack Router search params (primary) + Zustand (fallback)

```tsx
// hooks/useWorkspaceFilters.ts
export function useWorkspaceFilters(workspaceType: WorkspaceType) {
  const navigate = useNavigate();
  const search = useSearch({ from: '/hub' });

  // URL-based filters (primary)
  const urlFilters = search.workspaces || [];

  // Local state for non-URL-persisted filters
  const [localFilters, setLocalFilters] = useState<string[]>([]);

  const selected = useMemo(() => {
    // Priority: URL > local > default
    return urlFilters.length > 0 ? urlFilters : localFilters;
  }, [urlFilters, localFilters]);

  const setSelected = useCallback((ids: string[]) => {
    // Update URL for shareability
    navigate({
      search: (prev) => ({ ...prev, workspaces: ids }),
    });
  }, [navigate]);

  const clearFilters = useCallback(() => {
    navigate({
      search: (prev) => {
        const { workspaces, ...rest } = prev;
        return rest;
      },
    });
  }, [navigate]);

  return {
    selected,
    setSelected,
    clearFilters,
    isFiltered: selected.length > 0,
  };
}
```

### 9.3 Component Examples

**Example 1: Hub Workspace Filter**
```tsx
// Hub page - filter project cards by workspace
function HubPage() {
  const { selected, setSelected, clearFilters, isFiltered } =
    useWorkspaceFilters('hub');

  const filteredProjects = useMemo(() => {
    if (!isFiltered) return projects;

    return projects.filter((project) =>
      selected.includes(project.workspaceType)
    );
  }, [projects, selected, isFiltered]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>

        <WorkspaceFilter
          workspaceType="hub"
          options={workspaceOptions}
          defaultSelected={selected}
          onChange={setSelected}
          persistToUrl
        />
      </div>

      {isFiltered && (
        <WorkspaceFilterBadge
          selected={selected}
          onRemove={(id) =>
            setSelected(selected.filter((x) => x !== id))
          }
          onClearAll={clearFilters}
          className="mb-4"
        />
      )}

      <ProjectGrid projects={filteredProjects} />
    </div>
  );
}
```

**Example 2: Knowledge Page Filter**
```tsx
// Knowledge page - filter sources by collection + tags
function KnowledgePage() {
  const { selected, setSelected } = useWorkspaceFilters('knowledge');

  return (
    <div className="flex gap-4">
      {/* Sidebar filters */}
      <aside className="w-64">
        <WorkspaceFilter
          workspaceType="knowledge"
          options={collectionOptions}
          variant="inline"
          defaultSelected={selected}
          onChange={setSelected}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <SourceList filters={selected} />
      </main>
    </div>
  );
}
```

### 9.4 Accessibility Checklist

- [ ] All filter controls keyboard accessible (Tab, Enter, Space, Arrow keys)
- [ ] ARIA labels on all interactive elements
- [ ] Screen reader announcements for filter count changes
- [ ] Focus visible on all focusable elements
- [ ] Color contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] Filter changes announced via live regions
- [ ] Escape key closes filter dropdown/sheet
- [ ] Touch targets minimum 44x44px on mobile

---

## 10. Testing Strategy

### 10.1 Unit Tests

```tsx
// WorkspaceFilter.test.tsx
describe('WorkspaceFilter', () => {
  it('should render filter options', () => {
    const { getByLabelText } = render(
      <WorkspaceFilter
        options={workspaceOptions}
        selected={[]}
        onChange={vi.fn()}
      />
    );

    workspaceOptions.forEach((option) => {
      expect(getByLabelText(option.label)).toBeInTheDocument();
    });
  });

  it('should call onChange when option is toggled', () => {
    const handleChange = vi.fn();
    const { getByLabelText } = render(
      <WorkspaceFilter
        options={workspaceOptions}
        selected={[]}
        onChange={handleChange}
      />
    );

    fireEvent.click(getByLabelText('IDE'));

    expect(handleChange).toHaveBeenCalledWith(['ide']);
  });

  it('should select all options when Select All is clicked', () => {
    const handleChange = vi.fn();
    const { getByLabelText } = render(
      <WorkspaceFilter
        options={workspaceOptions}
        selected={[]}
        onChange={handleChange}
      />
    );

    fireEvent.click(getByLabelText('Select all'));

    expect(handleChange).toHaveBeenCalledWith(
      workspaceOptions.map((opt) => opt.id)
    );
  });
});
```

### 10.2 Accessibility Tests

```tsx
// Accessibility tests with jest-axe
describe('WorkspaceFilter Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <WorkspaceFilter
        options={workspaceOptions}
        selected={[]}
        onChange={vi.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard navigable', () => {
    const { getByLabelText } = render(
      <WorkspaceFilter
        options={workspaceOptions}
        selected={[]}
        onChange={vi.fn()}
      />
    );

    const trigger = getByLabelText('Open filters');
    trigger.focus();

    // Open dropdown
    fireEvent.keyDown(trigger, { key: 'Enter' });

    // Navigate to first item
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    // Toggle selection
    fireEvent.keyDown(trigger, { key: ' ' });

    // Close dropdown
    fireEvent.keyDown(trigger, { key: 'Escape' });
  });
});
```

---

## 11. Migration Strategy

### 11.1 Phase 1: Foundation (Week 1)
- [ ] Create `WorkspaceFilter` base component
- [ ] Implement `useWorkspaceFilters` hook
- [ ] Set up TanStack Router search param schema
- [ ] Write unit tests for core functionality

### 11.2 Phase 2: Hub Integration (Week 2)
- [ ] Integrate `WorkspaceFilter` into Hub page
- [ ] Implement filter badge display
- [ ] Test URL persistence
- [ ] Mobile responsive design

### 11.3 Phase 3: Workspace Rollout (Week 3-4)
- [ ] Knowledge workspace filters (collections, tags)
- [ ] Notes workspace filters (notebooks, dates)
- [ ] Study workspace filters (sets, due dates)
- [ ] IDE workspace filters (projects, file types)

### 11.4 Phase 4: Polish (Week 5)
- [ ] Performance optimization (virtualization for 1000+ items)
- [ ] Accessibility audit
- [ ] User testing and feedback
- [ ] Documentation and examples

---

## 12. References and Resources

### 12.1 Official Documentation
- **Radix UI Primitives**: https://www.radix-ui.com/primitives
- **TanStack Router**: https://tanstack.com/router
- **Shadcn/ui Components**: https://ui.shadcn.com/docs/components
- **Material Design 3 Chips**: https://m3.material.io/components/chips

### 12.2 Community Articles
- "Multi-Select Filter Components in React" - Dev.to (2026)
- "Mobile Filter UX Design Patterns" - Pencil & Paper (2024)
- "When Search Meets Filter" - Medium (2024)
- "Filter UI Design Best Practices" - Aufait UX (2026)

### 12.3 Code Examples
- Shadcn/ui Multi-Select: https://github.com/shadcn-ui/ui/issues/948
- TanStack Router Search Params: https://github.com/TanStack/router
- react-window virtualization: https://github.com/bvaughn/react-window

### 12.4 Via-gent Codebase
- `src/presentation/components/agent/UnifiedAgentSelector.tsx` - Selector pattern
- `src/presentation/components/knowledge/CollectionSelector.tsx` - Multi-select dialog
- `src/presentation/components/ui/dropdown-menu.tsx` - Radix UI wrapper
- `src/infrastructure/persistence/stores/agents/agent-selection-store.ts` - State pattern

---

## 13. Conclusion

**January 2026 Best Practices Summary**:

1. **Component Pattern**: Radix UI DropdownMenu + CheckboxItem (accessibility-first)
2. **State Management**: TanStack Router search params (URL persistence)
3. **Filter Display**: Material Design 3 Filter Chips (removable badges)
4. **Mobile Pattern**: Bottom sheet with "Apply" button (batch filtering)
5. **Performance**: Virtualization for 1000+ items (react-window)
6. **Accessibility**: ARIA labels, keyboard nav, screen reader support (built-in to Radix)
7. **Search + Filter**: Separated concerns (search bar + filter panel)

**Recommended for Via-gent**:
- Use Radix UI primitives for accessibility
- Persist filters via TanStack Router (shareability)
- Mobile-first responsive design (bottom sheet)
- Virtualization for large datasets
- Follow Via-gent coding standards (120-line component limit, TypeScript, i18n)

**Next Steps**:
1. Implement `WorkspaceFilter` base component
2. Integrate with Hub page (P0 priority)
3. Roll out to Knowledge, Notes, Study workspaces
4. Conduct accessibility audit
5. User testing and iteration

---

**Document Control**:
- **Version**: 1.0.0
- **Date**: 2026-01-02
- **Author**: BMAD Master + MCP Research Tools
- **Status**: Final
- **Next Review**: 2026-02-01 (post-implementation)
