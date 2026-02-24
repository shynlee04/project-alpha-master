# Past Fix Attempts Evidence Report

**Generated**: 2026-01-18
**Searcher**: dev-ext (orchestrated 6 parallel searches)

---

## Issue 1: Hardcoded API Keys

| File | Evidence Found | Status |
|------|----------------|--------|
| `src/lib/init/seed-workspace-permissions.ts` | API key at line 33: `AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ` | **UNFIXED** |
| `src/lib/agent/providers/agent-validation-service.ts` | API key at line 27 with architectural gap analysis reference | **UNFIXED** |
| `src/lib/init/seed-api-keys.ts` | API key at line 49 | **UNFIXED** |
| Migration archive | `_bmad-ext/.archive/providers/api-key-migration-2026-01-13/` | **EXISTS** |
| Migration test | `migrate-api-keys-to-vault.test.ts` (427 lines) | **PASSING** |
| Credential vault | `credential-vault.ts`, `credential-encryption.ts` | **IMPLEMENTED** |

### Evidence Details

**Migration Existed (BYOK-03)**:
- Migration system was implemented to move API keys to encrypted vault
- Tests pass, rollback mechanisms exist
- **CRITICAL GAP**: Hardcoded keys remain in source files despite migration

**No TODO/FIXME Comments**:
- Zero FIXME, TODO, HACK, or XXX markers in any of the 3 affected files
- Developers appear unaware the security issue persists

### Conclusion
**PREVIOUS ATTEMPT: Partial** - Migration infrastructure exists but source files were never cleaned up.

---

## Issue 2: Direct Dexie Calls

| File | Evidence Found | Status |
|------|----------------|--------|
| `note-crud-slice.ts` | Direct `db` imports at lines 18-19, 49-52, 93-96 | **REFACTORING IN PROGRESS** |
| `note-metadata-slice.ts` | Direct `db` imports at lines 13, 46, 88 | **REFACTORING IN PROGRESS** |
| `note-indexing-slice.ts` | Direct `db` imports at lines 14, 61 | **REFACTORING IN PROGRESS** |
| `dexie-db.ts` | Legacy `db` export marked `@deprecated` | **MARKED DEPRECATED** |
| `dexie-db-migrations.ts` | Extensive migration history (v1-v22) | **ACTIVE** |

### Evidence Details

**Previous Fixes Applied (C-01, C-02)**:
```typescript
// FIX C-01: Previously loaded ALL projects' notes and set currentProjectId=null,
// causing state boundary failure. Now properly isolates to browser-mode project.
```

**Migration History**:
- v20: PERSIST-S002 - Workspace isolation (CRITICAL)
- v21: PS-03 - Database consolidation
- v22: UX-13 - Database backed blocks

**Legacy Export Pattern**:
```typescript
/**
 * @deprecated Use getDb() instead
 */
export const db = new Proxy({} as ViaGentDatabase, {
  get(_target, prop) {
    const instance = getDb();
    if (!instance) {
      throw new Error('[Dexie] Database not available during SSR...');
    }
    return instance[prop as keyof ViaGentDatabase];
  }
});
```

### Conclusion
**PREVIOUS ATTEMPT: In Progress** - Note slices still use direct `db` calls but legacy patterns are marked deprecated with guidance to migrate.

---

## Issue 3: Chrome 129+ Bug (Version Check)

| File | Evidence Found | Status |
|------|----------------|--------|
| `handle-persistence.ts` | Fixed: `chromeVersion >= 129` with comment "CC-V2-B01: Fixed Chrome version check" | **FIXED** |
| `permission-lifecycle.ts` | Fixed: Regex extract + `>= 129` check | **FIXED** |
| `chrome-130-bug-resolution-2026-01-16.md` | Resolution artifact documenting fix | **EXISTS** |
| `chrome-130-bug-2026-01-16.md` | Governance report | **EXISTS** |
| `epic-inf-04-fix-fsa-handle-persistence-2026-01-18.md` | EPIC-INF-04: Handle persistence integration | **IN PROGRESS** |

### Evidence Details

**Original Bug**:
```typescript
// BEFORE (BUGGY):
navigator.userAgent.includes('Chrome/129')  // Exact match - failed for Chrome 130+
```

**Fix Applied (CC-V2-B01)**:
```typescript
// AFTER (FIXED):
const chromeMatch = navigator.userAgent.match(/Chrome\/(\d+)/);
const chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : 0;
return chromeVersion >= 129;
```

**Remaining Issue** (EPIC-INF-04):
- Handle persistence service exists but is disconnected from route/component lifecycle
- Route loader doesn't restore handle
- `restoreAccess()` uses null state

### Conclusion
**PREVIOUS ATTEMPT: Partial** - Version check bug fixed, but handle restoration workflow still disconnected.

---

## Issue 4: PlatformContract Duplicate

| File | Evidence Found | Status |
|------|----------------|--------|
| `platform-contract.ts` | 340 lines, contains `PlatformContract` interface | **ACTIVE** |
| `storage-types.ts` | 168 lines, duplicate `PlatformContract` interface | **DUPLICATE** |
| `platform-detection.ts` | 318 lines, detection functions with 5s cache | **ACTIVE** |
| `cycle1-architecture-scout-2026-01-18.md` | Recommends consolidation to `platform-types.ts` | **DOCUMENTED** |
| `platform-contract-infection-scan-2026-01-21.md` | 19 locations using `getPlatformContract()` | **SCANNED** |
| `spike-duplicate-implementation-2026-01-22/` | Archived spike with copied code | **ARCHIVED** |

### Evidence Details

**Duplicate Interfaces**:
| Aspect | `platform-contract.ts` | `storage-types.ts` |
|--------|----------------------|-------------------|
| Type Name | `DeviceType` | `PlatformType` |
| Values | `'desktop' \| 'mobile' \| 'tablet'` | `'desktop' \| 'mobile' \| 'tablet'` |
| Modifiers | `readonly` | None |
| Caching | Singleton | None |

**Recommended Action (From Architecture Scout)**:
1. Consolidate to single file: `src/infrastructure/filesystem/platform-types.ts`
2. Define all types once
3. Delete `platform-contract.ts` and `storage-types.ts`
4. Update 19 import locations

**Infection Scan Results**:
| ID | File | Status |
|----|------|--------|
| PLAT-002 | `notes.lazy.tsx:43-46` | Resolved |
| PLAT-003 | `MainSidebar.tsx` | Resolved |
| PLAT-004 | Multiple routes | Resolved |

### Conclusion
**PREVIOUS ATTEMPT: Documented** - Issue identified and solution designed, but consolidation not yet executed.

---

## Issue 5: XSS Vulnerabilities (Missing DOMPurify)

| File | Evidence Found | Status |
|------|----------------|--------|
| `DeepThinkUI.tsx:221` | `dangerouslySetInnerHTML` with naive `renderMarkdown()` | **HIGH RISK** |
| `CommandPalette.tsx:269` | `dangerouslySetInnerHTML` for command descriptions | **HIGH RISK** |
| `ChartDiagramBlock.tsx:502` | `dangerouslySetInnerHTML` for Mermaid SVG | **MEDIUM** |
| `RAGSearchPanel.tsx:63` | `dangerouslySetInnerHTML` with biome-ignore | **MEDIUM** |
| `StreamdownRenderer.tsx:124` | `dangerouslySetInnerHTML` with loose security level | **MEDIUM** |
| `security.ts` | API key masking, injection detection (logging only) | **IMPLEMENTED** |
| `command-sanitizer.ts` | Command injection prevention (303 lines) | **IMPLEMENTED** |

### Evidence Details

**Critical: Naive Markdown Renderer**:
```typescript
function renderMarkdown(markdown: string): string {
  // Basic markdown rendering - NO XSS SANITIZATION
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    // ... naive regex replacements - VULNERABLE TO XSS
}
```

**Existing Sanitization**:
- `rehype-sanitize` installed but **NOT USED** in vulnerable files
- DOMPurify **NOT INSTALLED**
- i18n config: `escapeValue: false // React already safes from xss` (doesn't apply to dangerouslySetInnerHTML)

**BlockNote Sanitization**:
- Structural validation only (block types, known properties)
- Does NOT address HTML XSS in rendered output

### Conclusion
**PREVIOUS ATTEMPT: None** - No sanitization implemented for dangerouslySetInnerHTML usages. Critical vulnerability remains.

---

## Issue 6: Event Listener Isolation

| File | Evidence Found | Status |
|------|----------------|--------|
| `cross-workspace-event-bus.ts` | EventEmitter3-based event bus (584 lines) | **ACTIVE** |
| `use-cross-workspace-events.ts` | Hooks with dead `getState()` calls (lines 50-52, 90-91) | **BUG IDENTIFIED** |
| `cross-workspace-events-analysis.md` | Root cause analysis DIAG-04 (447 lines) | **COMPLETE** |
| `event-bus-analysis.md` | Audit findings (145 lines) | **COMPLETE** |
| `workspace-switch-isolation.test.ts` | Isolation tests (435 lines) | **PASSING** |
| All workspace page components | Hooks commented out: `// useAllCrossWorkspaceEvents();` | **DISABLED** |

### Evidence Details

**Dead Code Identified**:
```typescript
// Lines 50-52 - USELESS getState() CALL
// Force store re-hydration by calling get()
// This triggers Zustand re-renders in all subscribed components
useAgentsStore.getState();  // ← Return value DISCARDED, no effect
```

**Root Cause (DIAG-04)**:
- `getState()` calls are dead code in Zustand v5
- Don't trigger re-renders when state changes
- Components don't receive updates

**Workarounds Applied**:
1. Hooks disabled in all workspace pages (Phase 1 Detachment)
2. Study workspace marked: `// useWorkspaceAccess causes infinite loops`
3. Event bus audit documented cleanup concerns in `code-analysis-bridge.ts` and `prompt-composer.ts`

**Audit Findings**:
- Event debouncing needed for `sync:progress` (fires every 100ms)
- Full objects passed instead of IDs (payload size issue)

### Conclusion
**PREVIOUS ATTEMPT: Mitigated by Disabling** - Root cause identified, hooks disabled to prevent issues, but fix not yet implemented.

---

## Summary Table

| Issue | Previous Attempt | Status | Gap |
|-------|-----------------|--------|-----|
| Hardcoded API Keys | Migration infrastructure | Partial | Source files not cleaned up |
| Direct Dexie Calls | Deprecation markers | In Progress | Note slices still use direct calls |
| Chrome 129+ Bug | Version check fix | Partial | Handle restoration disconnected |
| PlatformContract Duplicate | Documentation/Scanning | Documented | Consolidation not executed |
| XSS Vulnerabilities | None | Unfixed | DOMPurify not installed |
| Event Listener Isolation | Hooks disabled | Mitigated | Root cause fix pending |

---

## Recommendations

1. **API Keys**: Complete migration by removing hardcoded keys from seed files
2. **Dexie Calls**: Continue migration to repository pattern for note slices
3. **Chrome 129+**: Complete EPIC-INF-04 to integrate handle restoration
4. **PlatformContract**: Execute consolidation plan from architecture scout
5. **XSS**: Install DOMPurify, sanitize all dangerouslySetInnerHTML usages
6. **Event Isolation**: Implement proper Zustand subscriptions or force-update pattern
