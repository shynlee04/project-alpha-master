# Database/Persistence Package Updates - 2026-01-25

**Research Date**: 2026-01-25
**Researcher**: analyst-ext agent
**Status**: Complete

---

## Current vs Latest Versions

| Package | Current | Latest | Action Needed | Release Date |
|----------|----------|---------|---------------|--------------|
| dexie | ^4.2.1 | 4.2.1 | **None** - Up to date | Oct 13, 2024 |
| dexie-react-hooks | ^4.2.0 | 4.2.0 | **None** - Up to date | Aug 18, 2024 |
| idb | ^8.0.3 | 8.0.3 | **None** - Up to date | May 7, 2025 |
| @orama/orama | ^3.1.18 | 3.1.18 | **None** - Up to date | Dec 19, 2024 |
| @orama/plugin-data-persistence | ^3.1.18 | 3.1.18 | **None** - Up to date | Dec 19, 2024 |
| eventemitter3 | ^5.0.1 | 5.0.4 | **Patch** - Update recommended | Jan 19, 2025 |

### Summary
- **5 packages up to date** ✅
- **1 package needs update** (patch release)
- **0 major version updates available**

---

## New Plugins/Extensions Found

### Orama Ecosystem Packages (Not Currently Installed)

| Package | Version | Description | Use Case |
|----------|----------|-------------|-----------|
| @orama/stemmers | 3.1.18 | Stemmers for Orama | Language-specific word stemming for better search results |
| @orama/stopwords | 3.1.18 | Stop-words for Orama | Filter out common words to improve search relevance |
| @orama/tokenizers | 3.1.18 | Additional tokenizers for Orama | Includes **Mandarin/Chinese** tokenizers for Asian language support |
| @orama/plugin-match-highlight | 3.1.18 | Search match highlighting | Highlight matching text in search results for better UX |
| @orama/switch | 3.1.18 | Multi-backend query interface | Run queries on Orama Cloud, OramaCore, and Orama JS with single interface |

### Recommendations for Orama Enhancement

Based on current project needs (Notes/IDE/Knowledge workspaces), the following Orama plugins would add value:

1. **@orama/plugin-match-highlight** - Highly recommended
   - **Why**: Notes workspace would benefit from highlighted search matches in markdown documents
   - **Impact**: Better UX when searching through notes and markdown files
   - **Integration**: Works with existing @orama/orama 3.1.18 installation

2. **@orama/tokenizers** - Recommended for future i18n support
   - **Why**: Project supports English and Vietnamese; includes Chinese/Mandarin support
   - **Impact**: Enables better search for non-Latin languages
   - **Integration**: Plug-and-play with existing installation

3. **@orama/stopwords** - Recommended for search quality
   - **Why**: Filter common words to improve search relevance
   - **Impact**: More accurate search results in Knowledge/Notes workspaces
   - **Integration**: Simple plugin addition to Orama configuration

4. **@orama/switch** - Optional for future cloud integration
   - **Why**: Allows switching between local and cloud search backends
   - **Impact**: Future-proof for potential cloud search capabilities
   - **Priority**: Low - Not needed until cloud sync is implemented

---

## Breaking Changes/Compatibility Notes

### Dexie v4.2.x ↔ dexie-react-hooks v4.2.0
**Status**: ✅ No breaking changes

- Dexie 4.2.x maintains API compatibility with 4.2.0
- Y.js support moved to separate `y-dexie` addon (not relevant to current codebase)
- No migration needed from current versions
- **Important**: Always upgrade `dexie` and `dexie-react-hooks` together to ensure version alignment

### idb v8.0.x
**Status**: ✅ No breaking changes from v7.x

- idb 8.0.x maintains backward compatibility
- Currently used as fallback/store layer - no direct API changes needed
- IndexedDB API remains stable across browsers (Chrome 122+, Firefox 120+, Safari 16.4+)

### @orama/orama v3.1.18
**Status**: ✅ No breaking changes

- Stable release with minor bug fixes
- Document pinning feature added (v3.1.16)
- Seqproto serialization format for disk persistence (v3.1.13)
- All plugins maintain version alignment (3.1.18)

### eventemitter3 v5.0.4
**Status**: ⚠️ Patch update with type definition fixes

**Changes from v5.0.1 to v5.0.4**:
- v5.0.1: ESM support added, `types` condition moved
- v5.0.2: Fixed ESM import type definitions
- v5.0.3: Fixed TypeScript type definitions
- v5.0.4: Restored TypeScript definitions to pre-5.0.2 state

**Breaking change from 4.x to 5.0.0** (already handled):
- `umd` directory renamed to `dist`
- `eventemitter3.min.js` → `eventemitter3.umd.min.js`
- TypeScript-specific import syntax no longer supported

**Compatibility**: Current codebase (v5.0.1) is compatible with v5.0.4 update - just patch fixes for type safety.

---

## IndexedDB API Changes Compatibility

### Browser Support Matrix (as of Jan 2025)

| Browser | Version | FSA Support | IndexedDB v2 | Notes |
|---------|----------|--------------|---------------|-------|
| Chrome/Edge | 122+ | ✅ | ✅ | FSA permission persistence supported |
| Firefox | 120+ | ⚠️ Partial | ✅ | FSA behind flag | 
| Safari | 16.4+ | ❌ No | ✅ | FSA not supported |
| Mobile Safari | 16.4+ | ❌ No | ✅ | FSA not supported |

### IndexedDB API Status
- **No breaking changes** in IndexedDB v2 API across modern browsers
- FSA (File System Access API) stable for desktop Chrome/Edge 122+
- **Project alignment**: Current ADR-033 decision (Desktop=FSA, Mobile=IndexedDB) remains valid

### Dexie + IndexedDB Compatibility
- Dexie 4.2.1 fully compatible with all modern IndexedDB implementations
- No migration needed for browser updates
- FSA adapter for desktop works as intended (per ADR-033)

---

## Event Bus Alternatives/Updates

### Current Implementation: eventemitter3
- **Version**: ^5.0.1
- **Latest**: 5.0.4
- **Status**: Stable, actively maintained

### Event Bus Landscape (Jan 2025)

| Library | Latest Version | Maintenance | Performance | Bundle Size | Recommendation |
|---------|----------------|---------------|--------------|--------------|----------------|
| eventemitter3 | 5.0.4 | ✅ Active | Fast | ~2KB minzipped | **Keep** - Already using |
| mitt | 3.0.1 | ✅ Active | Very Fast | ~200B | Alternative for simpler needs |
| nanobus | 5.0.0 | ✅ Active | Fast | ~500B | Alternative for simpler needs |
| RxJS | 7.8.1 | ✅ Active | Slower | ~25KB | Overkill for current needs |
| Observable | 4.0.0 | ⚠️ Stale | Fast | ~1KB | Not recommended |

### Analysis
**eventemitter3 remains the best choice** because:
1. Already integrated and tested in codebase
2. Active maintenance (latest release Jan 2025)
2. Lightweight and performant
3. Familiar API (Node.js EventEmitter compatible)
4. Strong TypeScript support (fixed in v5.0.4)

**No migration recommended** - just patch update to v5.0.4.

---

## Recommended Updates

### Priority 1: Patch Update Required
1. **eventemitter3**: `^5.0.1` → `^5.0.4`
   - **Reason**: TypeScript type definition fixes (v5.0.2, v5.0.3, v5.0.4)
   - **Impact**: Improves type safety in IDE workspace event handling
   - **Breaking**: None (patch release)
   - **Command**: `pnpm update eventemitter3@^5.0.4`

### Priority 2: Optional Orama Plugin Additions (No Core Changes)
1. **@orama/plugin-match-highlight**
   - **Version**: 3.1.18
   - **Reason**: Enhanced UX for Notes/Knowledge workspace search
   - **Breaking**: None
   - **Command**: `pnpm add @orama/plugin-match-highlight@^3.1.18`

2. **@orama/stopwords**
   - **Version**: 3.1.18
   - **Reason**: Improved search relevance for content-heavy workspaces
   - **Breaking**: None
   - **Command**: `pnpm add @orama/stopwords@^3.1.18`

3. **@orama/tokenizers**
   - **Version**: 3.1.18
   - **Reason**: Future-proof for i18n (Vietnamese, Chinese support)
   - **Breaking**: None
   - **Command**: `pnpm add @orama/tokenizers@^3.1.18`

### No Updates Required (Already Up to Date)
- ✅ dexie (^4.2.1)
- ✅ dexie-react-hooks (^4.2.0)
- ✅ idb (^8.0.3)
- ✅ @orama/orama (^3.1.18)
- ✅ @orama/plugin-data-persistence (^3.1.18)

---

## Order of Updates (If Applying All)

### Step 1: Patch Update (Low Risk)
```bash
# Update eventemitter3 for type safety fixes
pnpm update eventemitter3@^5.0.4
pnpm typecheck
pnpm test
```

### Step 2: Optional Orama Enhancements (Additive, No Breaking)
```bash
# Install match highlighting plugin
pnpm add @orama/plugin-match-highlight@^3.1.18

# Install stopwords for better search
pnpm add @orama/stopwords@^3.1.18

# Install tokenizers for i18n support
pnpm add @orama/tokenizers@^3.1.18

# Verify all tests pass
pnpm typecheck
pnpm test
pnpm test:e2e
```

### Step 3: Integration (If Step 2 Performed)
Update Orama configuration in `src/infrastructure/persistence/orama/` (or equivalent):
```typescript
import createOrama from '@orama/orama';
import { matchHighlight } from '@orama/plugin-match-highlight';
import { stopwords } from '@orama/stopwords/stopwords-en'; // Example
import { tokenizer } from '@orama/tokenizers';

const db = await createOrama({
  schema: { /* ... */ },
  plugins: [
    matchHighlight(),
    stopwords(language),
    tokenizer(/* options */)
  ]
});
```

---

## Dexie v5 Beta/Stable Status

### Current Status (Jan 2025)
- **Dexie v5**: **NOT** in beta or stable yet
- **Current stable**: 4.2.1 (Oct 2024)
- **Discussions**: No announcements of v5 development in public channels
- **Roadmap**: Maintainer focusing on:
  - Dexie Cloud enhancements
  - Y.js integration via `y-dexie` addon
  - Bug fixes and performance improvements

### Recommendation
- **No action needed** - Dexie 4.2.1 is current stable release
- Monitor [Dexie discussions](https://github.com/dexie/Dexie.js/discussions) for v5 announcements
- When v5 becomes available, expect:
  - Breaking changes in schema API (based on v3→v4 history)
  - New IndexedDB v3 API features
  - Migration guide will be provided

---

## Summary and Action Items

### Immediate Actions (Priority 1)
- [ ] Update `eventemitter3` to `^5.0.4` for type safety improvements
- [ ] Run `pnpm typecheck` and `pnpm test` after update
- [ ] Update documentation if any type-related changes needed

### Optional Enhancements (Priority 2)
- [ ] Evaluate need for `@orama/plugin-match-highlight` in Notes/Knowledge workspaces
- [ ] Consider `@orama/stopwords` for improved search relevance
- [ ] Consider `@orama/tokenizers` for future i18n expansion

### Monitoring (Ongoing)
- [ ] Watch for Dexie v5 beta/stable announcements
- [ ] Monitor Orama ecosystem for new plugins
- [ ] Check IndexedDB v3 API progress in browsers

### No Action Required
- ✅ Dexie ecosystem (dexie, dexie-react-hooks) - current
- ✅ Orama core and data persistence - current
- ✅ idb - current
- ✅ IndexedDB/FSA compatibility - no breaking changes

---

## Research Sources

- Dexie.js GitHub Releases: https://github.com/dexie/Dexie.js/releases
- Dexie Discussions: https://github.com/dexie/Dexie.js/discussions
- Orama GitHub Releases: https://github.com/oramasearch/orama/releases
- idb GitHub Tags: https://github.com/jakearchibald/idb/tags
- EventEmitter3 GitHub Releases: https://github.com/primus/eventemitter3/releases
- npm registry queries (via npm CLI)

---

**Report Generated**: 2026-01-25
**Next Review**: Recommended after Q2 2025 (April 2025)
