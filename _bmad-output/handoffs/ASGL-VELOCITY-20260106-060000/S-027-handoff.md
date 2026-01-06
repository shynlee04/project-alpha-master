# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-027
**Title**: Advanced Search with Filters
**Date**: 2026-01-06T09:30:00+07:00
**Priority**: P1 - HIGH

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add advanced search with filters (file type, date range, tags, author) and search results highlighting.

## Context
Basic search exists but lacks filtering. Users need to narrow results by file type, date modified, tags, author.

## Root Cause
```typescript
// Basic search only matches text
// No filter UI exists
// No search result highlighting
// No saved searches
```

## Files to Create/Modify
- **Create**: `src/presentation/components/search/AdvancedSearchDialog.tsx` - Search UI with filters
- **Create**: `src/presentation/components/search/SearchFilters.tsx` - Filter controls
- **Create**: `src/presentation/components/search/SearchResults.tsx` - Results with highlighting
- **Create**: `src/presentation/components/search/SavedSearches.tsx` - Saved search queries
- **Create**: `src/lib/search/search-indexer.ts` - Full-text search index
- **Create**: `src/hooks/useAdvancedSearch.ts` - Hook for search state
- **Modify**: `src/routes/hub.tsx` - Add advanced search button

## Search Features

### Filters
1. **File Type**:
   - Code files (.ts, .tsx, .js, .jsx)
   - Markup (.html, .md, .css)
   - Data (.json, .yaml, .xml)
   - Assets (.png, .jpg, .svg)

2. **Date Range**:
   - Last modified today
   - Last 7 days
   - Last 30 days
   - Last 90 days
   - Custom range (date picker)

3. **Tags**:
   - Multi-select tag filter
   - Tag autocomplete
   - Show tag counts

4. **Author**:
   - Created by me
   - Created by [specific user]
   - Modified by me
   - Modified by [specific user]

5. **File Size**:
   - < 10KB
   - 10KB - 100KB
   - 100KB - 1MB
   - > 1MB

### Search Results
- Highlight matching text in results
- Show file path, preview, relevance score
- Group results by project/folder
- Sort by relevance, date, name
- Pagination (20 results per page)

### Saved Searches
- Save current search with name
- Quick access from search dialog
- Edit/delete saved searches
- Auto-suggest based on history

## Constraints
- Keyboard shortcut: Cmd+Shift+F to open
- Debounced search (300ms delay)
- Index search results for performance
- Mobile: Full-screen search dialog
- i18n strings via t() function
- 8-bit gaming style (no blur)
- Highlight matches with yellow background

## Acceptance Criteria
- [ ] Advanced search dialog with Cmd+Shift+F
- [ ] File type filter (code, markup, data, assets)
- [ ] Date range filter (today, 7d, 30d, 90d, custom)
- [ ] Tags filter with multi-select
- [ ] Author filter (created/modified by)
- [ ] File size filter
- [ ] Search results with highlighted matches
- [ ] Group by project/folder
- [ ] Sort options (relevance, date, name)
- [ ] Pagination (20 per page)
- [ ] Saved searches with quick access
- [ ] Mobile: Full-screen search UI
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build search UI
- `brainstorming` - Design search algorithm
- `global-coding-style` - Search indexing
- `frontend-accessibility` - Keyboard navigation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify search components
ls -la src/presentation/components/search/

# Verify search indexer
ls -la src/lib/search/search-indexer.ts
```

## Related Issues
- Search UX improvements
- Ralph Loop Cycle 5A: Productivity features

## Next Action
Create advanced search dialog with filters (type, date, tags, author), result highlighting, and saved searches.

---
**Handoff ID**: S-027-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
