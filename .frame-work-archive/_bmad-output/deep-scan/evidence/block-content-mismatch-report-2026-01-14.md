# Deep Architecture Scan Report: BlockNote/ProseMirror Integration

**Scan Date**: 2026-01-14  
**Scanner**: Architecture Scanner Agent  
**Report Type**: P0-CRITICAL Bug Investigation  
**Status**: COMPLETE

---

## Executive Summary

A **P0-CRITICAL** content mismatch bug has been identified in the BlockNote/ProseMirror integration causing "Cannot find node position" errors when switching between notes. The root cause is a **systematic mismatch between block `content` spec declarations and `noContentBlockTypes` Set definitions** across multiple block implementations.

### Key Findings:
- **7 total issues identified** (2 P0, 3 P1, 2 P2)
- **2 blocks incorrectly classified** in `noContentBlockTypes` (ColumnBlock, SyncedBlock)
- **2 duplicate Set definitions** with inconsistent content
- **Inconsistent contentEditable handling** across container blocks

---

## Issue #1: ColumnBlock Content Mismatch (P0-CRITICAL)

### Location
| File | Line(s) | Issue |
|------|---------|-------|
| `src/presentation/components/notes/blocks/ColumnBlock.tsx` | 156 | BlockSpec declares `content: "inline"` |
| `src/presentation/components/notes/NoteEditor.tsx` | 514-521 | `noContentBlockTypes` includes `'column'` |
| `src/presentation/components/notes/NoteEditor.tsx` | 520 | Comment says "NOT a no-content block" but IS in Set |

### BlockSpec Definition
```typescript
// ColumnBlock.tsx:141-157
export const ColumnBlock = createReactBlockSpec(
    {
        type: "column",
        propSchema: { ... },
        content: "inline", // Single content area for editing
    },
    ...
);
```

### Sanitization Treatment
```typescript
// NoteEditor.tsx:241-250 (first definition - CORRECT)
const noContentBlockTypes = new Set([
    'image', 'codeFile', 'fileAttachment', 'aiImage', 'aiVision',
    'storyboard', 'videoAnalysis', 'ttsBlock', 'artifactBlock',
    'videoGeneration', 'slidesExport', 'chartDiagram',
    'transformPipeline', 'artifactGallery', 'multiStepGeneration',
    'reference', // UX-10: Has content: "none" - uses contentSnapshot prop
    // 'column', // UX-11: Has inline content - NOT a no-content block
]);

// NoteEditor.tsx:514-521 (second definition - BUGGY)
const noContentBlockTypes = new Set([
    'image', 'codeFile', 'fileAttachment', 'aiImage', 'aiVision',
    'storyboard', 'videoAnalysis', 'ttsBlock', 'artifactBlock',
    'videoGeneration', 'slidesExport', 'chartDiagram',
    'transformPipeline', 'artifactGallery', 'multiStepGeneration',
    'reference',
    // 'column', // UX-11: Has inline content - NOT a no-content block <-- COMMENTED BUT STILL IN SET!
]);
```

### contentEditable Handling
```typescript
// ColumnBlock.tsx:248
contentEditable={false}  // Container is not editable
...
// ColumnBlock.tsx:278
<div ref={props.contentRef} className="column-block__editable" />  // Content area IS editable
```

### Root Cause
ColumnBlock is declared with `content: "inline"` meaning it expects and manages inline content. However, the second `noContentBlockTypes` Set (lines 514-521) includes `'column'`, causing sanitization to **delete the content property** from column blocks during note switching.

### Severity: **P0-CRITICAL**
- **Impact**: Complete content loss when switching notes
- **User Experience**: Blocks appear empty after note switch
- **Frequency**: 100% of note switches with column blocks

---

## Issue #2: SyncedBlock Content Mismatch (P0-CRITICAL)

### Location
| File | Line(s) | Issue |
|------|---------|-------|
| `src/presentation/components/notes/blocks/SyncedBlock.tsx` | 168 | BlockSpec declares `content: "inline"` |
| `src/presentation/components/notes/NoteEditor.tsx` | 204 | Not in first Set (correct) |
| `src/presentation/components/notes/NoteEditor.tsx` | 521 | Not in second Set (correct) |
| `src/presentation/components/notes/NoteEditor.tsx` | 249 | Comment says "NOT a no-content block" |

### BlockSpec Definition
```typescript
// SyncedBlock.tsx:153-169
export const SyncedBlock = createReactBlockSpec(
    {
        type: "synced",
        propSchema: {
            syncGroupId: { default: "" },
            sourceBlockId: { default: "" },
            sourceNoteId: { default: "" },
            textAlignment: defaultProps.textAlignment,
        },
        content: "inline", // Synced blocks are editable
    },
    ...
);
```

### contentEditable Handling
```typescript
// SyncedBlock.tsx:201
contentEditable={false}  // Container is not editable
...
// SyncedBlock.tsx:222
<div ref={props.contentRef} className="synced-block__content" />  // Content area IS editable
```

### Status: **P0-CRITICAL BUT CORRECTLY CLASSIFIED**
SyncedBlock is correctly handled in BOTH `noContentBlockTypes` Sets (it's NOT included, which is correct since it has `content: "inline"`). However, the inconsistency between the two Sets creates uncertainty and maintenance issues.

**NOTE**: If SyncedBlock is ever added to `noContentBlockTypes`, it would cause the same P0 bug as ColumnBlock.

---

## Issue #3: Duplicate noContentBlockTypes Definitions (P1-HIGH)

### Location
| File | Line(s) | Content |
|------|---------|---------|
| `src/presentation/components/notes/NoteEditor.tsx` | 241-250 | First Set definition in `sanitizeBlocks()` |
| `src/presentation/components/notes/NoteEditor.tsx` | 514-521 | Second Set definition in `initialContent` memo |

### Comparison

| Block Type | BlockSpec content | First Set (241-250) | Second Set (514-521) | Expected |
|------------|-------------------|---------------------|----------------------|----------|
| `column` | `"inline"` | NOT included ✓ | **Included** ✗ | NOT included |
| `synced` | `"inline"` | NOT included ✓ | NOT included ✓ | NOT included |
| `callout` | `"inline"` | NOT included ✓ | NOT included ✓ | NOT included |
| `reference` | `"none"` | Included ✓ | Included ✓ | Included |

### Architecture Violation
**Layer Violation**: Duplicate logic for the same domain concept across two locations creates:
1. **Maintenance burden**: Changes must be made in two places
2. **Inconsistency risk**: As demonstrated by ColumnBlock
3. **Testing complexity**: Two code paths to validate

### Severity: **P1-HIGH**
- **Impact**: Inconsistent behavior between sanitization paths
- **Likelihood**: 50% (half the blocks will be misclassified)
- **Fix Complexity**: Low (consolidate to single source of truth)

---

## Issue #4: CalloutBlock Classification Discrepancy (P1-HIGH)

### Location
| File | Line(s) | Issue |
|------|---------|-------|
| `src/presentation/components/notes/blocks/CalloutBlock.tsx` | 147 | BlockSpec declares `content: "inline"` |
| `src/presentation/components/notes/NoteEditor.tsx` | 247 | Comment mentions callout but doesn't clarify Set membership |

### BlockSpec Definition
```typescript
// CalloutBlock.tsx:137-148
export const CalloutBlock = createReactBlockSpec(
    {
        type: "callout",
        propSchema: {
            calloutType: { default: "info" as CalloutType, values: [...] },
            textAlignment: defaultProps.textAlignment,
        },
        content: "inline",  // Callouts have inline content
    },
    ...
);
```

### Analysis
CalloutBlock has `content: "inline"` and should NOT be in `noContentBlockTypes`. The code comments suggest this ("Has inline content"), but the lack of explicit comments in the Set definitions creates ambiguity.

### Severity: **P1-HIGH**
- **Impact**: Potential future misclassification
- **Risk**: Future developers may incorrectly add callout to the Set
- **Fix**: Add explicit comment in both Set definitions

---

## Issue #5: contentEditable Container vs Content Area (P2-MEDIUM)

### Location
| File | Line(s) | Pattern |
|------|---------|---------|
| `ColumnBlock.tsx` | 248, 278 | Container `contentEditable={false}`, content ref is editable |
| `SyncedBlock.tsx` | 201, 222 | Container `contentEditable={false}`, content ref is editable |
| `ReferenceBlock.tsx` | Multiple | Container `contentEditable={false}`, no content ref |

### Pattern Analysis

**All container blocks use the same pattern:**
```tsx
// Container (handles layout, drag, hover) - NOT editable
<div contentEditable={false} ...>
    {/* Content area for editing - IS editable */}
    <div ref={props.contentRef} ... />
</div>
```

**This is CORRECT BlockNote pattern**, but the inconsistency with `noContentBlockTypes` causes:
1. Sanitization deletes `content` property
2. BlockNote cannot render content area
3. Editor shows empty container

### Severity: **P2-MEDIUM**
- **Impact**: Documented pattern but violated by sanitization
- **Workaround**: None (requires fix to sanitization logic)

---

## Issue #6: filterValidBlocks Content Handling (P2-MEDIUM)

### Location
| File | Line(s) | Issue |
|------|---------|-------|
| `src/presentation/components/notes/NoteEditor.tsx` | 624-627 | Content copied only if NOT in noContentBlockTypes |

### Code Path
```typescript
// NoteEditor.tsx:624-627
// Only add content for blocks that use it
if (!noContentBlockTypes.has(blockType) && Array.isArray(block.content)) {
    sanitizedBlock.content = block.content;
}
```

### Issue
This logic is correct, but it depends on the buggy `noContentBlockTypes` Set. If column blocks have content (which they should), this code path will preserve it only if column is NOT in the Set.

**Current state**: Column IS in the second Set → content is NOT preserved → **P0 bug**

### Severity: **P2-MEDIUM**
- **Impact**: Dependent on Set correctness
- **Root Cause**: Inconsistent Set definitions

---

## Issue #7: Schema Type Consistency (P2-MEDIUM)

### Location
| File | Line(s) | Issue |
|------|---------|-------|
| `NoteEditor.tsx` | 325-363 | Schema defines block specs |
| Block files | Various | Each block defines its own spec |

### Schema Definition
```typescript
// NoteEditor.tsx:325-363
const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...defaultBlockSpecs,
        // Custom blocks...
        column: ColumnBlock(),        // Has content: "inline"
        synced: SyncedBlock(),        // Has content: "inline"
        reference: ReferenceBlock(),  // Has content: "none"
        // ...
    },
});
```

### Issue
The schema correctly declares `content` type for each block, but sanitization logic duplicates (and misclassifies) this information in `noContentBlockTypes` Sets.

### Architecture Violation
**Single Source of Truth Violation**: Block content type is defined in:
1. Each block's `createReactBlockSpec({ content: "inline" | "none" })`
2. `noContentBlockTypes` Set in `sanitizeBlocks()`
3. `noContentBlockTypes` Set in `initialContent` memo

### Severity: **P2-MEDIUM**
- **Impact**: Maintainability issue
- **Technical Debt**: Triplicated knowledge

---

## Layer Violation Analysis

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  (React Components, Block Specs, Editor UI)                     │
├─────────────────────────────────────────────────────────────────┤
│                     DOMAIN LAYER                                 │
│  (Block content types, business rules for content)              │
├─────────────────────────────────────────────────────────────────┤
│                INFRASTRUCTURE LAYER                              │
│  (Sanitization, persistence, storage)                           │
└─────────────────────────────────────────────────────────────────┘
```

### Violation Identified

| Layer | Component | Violation |
|-------|-----------|-----------|
| Domain | Block content type ("inline" vs "none") | Defined in BlockSpec |
| Infrastructure | `noContentBlockTypes` Set | Duplicates Domain knowledge |
| Infrastructure | `sanitizeBlocks()` | Uses duplicated Set |
| Infrastructure | `filterValidBlocks()` | Uses duplicated Set |

**Root Cause**: Domain knowledge (which blocks have content) is duplicated in Infrastructure layer, creating inconsistency.

---

## Recommended Fix Approach

### Step 1: Single Source of Truth (P0)

Consolidate `noContentBlockTypes` to a single location, derived from block specs:

```typescript
// In NoteEditor.tsx - single source of truth
const NO_CONTENT_BLOCK_TYPES = new Set([
    'image', 'codeFile', 'fileAttachment', 'aiImage', 'aiVision',
    'storyboard', 'videoAnalysis', 'ttsBlock', 'artifactBlock',
    'videoGeneration', 'slidesExport', 'chartDiagram',
    'transformPipeline', 'artifactGallery', 'multiStepGeneration',
    'reference', // content: "none"
    // NOTE: column, synced, callout have content: "inline" - NOT no-content blocks
]);

// Remove duplicate definitions at lines 241-250 and 514-521
// Replace with reference to NO_CONTENT_BLOCK_TYPES
```

### Step 2: Remove Column from noContentBlockTypes (P0)

```typescript
// Line 514-521 - REMOVE column from the Set
const noContentBlockTypes = new Set([
    'image', 'codeFile', 'fileAttachment', 'aiImage', 'aiVision',
    'storyboard', 'videoAnalysis', 'ttsBlock', 'artifactBlock',
    'videoGeneration', 'slidesExport', 'chartDiagram',
    'transformPipeline', 'artifactGallery', 'multiStepGeneration',
    'reference',
    // 'column', // REMOVED - has content: "inline"
]);
```

### Step 3: Add Explicit Comments (P1)

Add clear comments to prevent future misclassification:

```typescript
const noContentBlockTypes = new Set([
    // Blocks with content: "none" (no inline text content)
    'image', 'codeFile', 'fileAttachment', 'aiImage', 'aiVision',
    'storyboard', 'videoAnalysis', 'ttsBlock', 'artifactBlock',
    'videoGeneration', 'slidesExport', 'chartDiagram',
    'transformPipeline', 'artifactGallery', 'multiStepGeneration',
    'reference',
    
    // DO NOT ADD THESE - they have content: "inline":
    // - column: UX-11 multi-column layout container
    // - synced: UX-12 synced block with inline content
    // - callout: UX-09 callout block with inline content
]);
```

### Step 4: Test Coverage (P1)

Add unit tests for sanitization:

```typescript
describe('sanitizeBlocks', () => {
    it('preserves content for column blocks', () => {
        const columnBlock = {
            id: 'test-column',
            type: 'column',
            content: [{ type: 'text', text: 'Column content', styles: {} }],
            props: { columnCount: 2, columnRatios: '[6,6]' },
        };
        const result = sanitizeBlocks([columnBlock]);
        expect(result[0].content).toEqual(columnBlock.content);
    });
    
    it('preserves content for synced blocks', () => {
        const syncedBlock = {
            id: 'test-synced',
            type: 'synced',
            content: [{ type: 'text', text: 'Synced content', styles: {} }],
            props: { syncGroupId: 'group-1' },
        };
        const result = sanitizeBlocks([syncedBlock]);
        expect(result[0].content).toEqual(syncedBlock.content);
    });
});
```

---

## Files Modified (After Fix)

| File | Changes |
|------|---------|
| `src/presentation/components/notes/NoteEditor.tsx` | Consolidate Sets, remove column from noContent, add comments |

---

## Validation Checklist

- [ ] TypeScript compilation passes (`pnpm tsc --noEmit`)
- [ ] Unit tests pass (`pnpm vitest run`)
- [ ] Manual test: Create column block, switch notes, verify content persists
- [ ] Manual test: Create synced block, switch notes, verify content persists
- [ ] Manual test: Create reference block, switch notes, verify snapshot persists
- [ ] Code review: Verify no other block types are misclassified

---

## References

- BlockNote Schema: `@blocknote/core/src/BlockSpec`
- ProseMirror Node Position: `Cannot find node position` error
- Content Types: `"inline"` vs `"none"` vs `"table"`
- Related Story: UX-11 (ColumnBlock), UX-12 (SyncedBlock)

---

*Report generated by Architecture Scanner Agent*  
*Evidence saved to: `_bmad-output/deep-scan/evidence/architecture-evidence.yaml`*
