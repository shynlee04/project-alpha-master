# Story: CC-AR-05 - Replace Monaco POC with Real Monaco Editor

**Story ID:** CC-AR-05
**Epic:** EPIC-CC-AR02AR03
**Priority:** P1
**Team:** Team B
**Effort:** 4-6 hours
**Status:** READY
**Created:** 2026-01-26
**Depends On:** CC-AR-03 (Store Hydration Fix)
**Unblocks:** CC-AR-06, CC-AR-08

---

## Problem Statement

`MonacoPlugin.tsx` is a POC stub that uses a plain `<textarea>` instead of the real `@monaco-editor/react` component. This means:

1. No syntax highlighting
2. No IntelliSense/autocomplete
3. No code folding
4. No minimap
5. No real code editing capability

### Evidence (Lines 175-192)

```tsx
{/* Editor Content (POC: Textarea placeholder for Monaco) */}
{/* In full implementation, this would be <Editor /> from @monaco-editor/react */}
<div className="flex-1 overflow-auto p-4 bg-background">
  <textarea
    value={content}
    onChange={(e) => {
      setContent(e.target.value);
      setIsModified(true);
    }}
    className="w-full h-full bg-transparent text-foreground font-mono text-sm resize-none outline-none border-none"
    ...
  />
</div>
```

---

## Solution

Replace the `<textarea>` with `<Editor />` from `@monaco-editor/react`:

1. Import Editor from @monaco-editor/react
2. Implement language detection from file extension
3. Wire up file loading from ProjectContext.gateway
4. Wire up file saving with Cmd+S keyboard shortcut
5. Configure Monaco options (theme, font, etc.)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/plugins/monaco/MonacoPlugin.tsx` | Replace textarea with @monaco-editor/react |

---

## Pre-Research Required (MCP Tools)

Before implementation, use MCP tools to research:
1. `@monaco-editor/react` 2026 patterns and best practices
2. Monaco Editor theme configuration for dark mode
3. Language detection from file extensions
4. automaticLayout option for responsive sizing

---

## Acceptance Criteria

- [ ] **AC1**: `@monaco-editor/react` imported and used (NOT textarea)
- [ ] **AC2**: Syntax highlighting works for TypeScript (.ts, .tsx)
- [ ] **AC3**: Syntax highlighting works for JavaScript (.js, .jsx)
- [ ] **AC4**: Syntax highlighting works for JSON (.json)
- [ ] **AC5**: Syntax highlighting works for Markdown (.md)
- [ ] **AC6**: Syntax highlighting works for CSS (.css)
- [ ] **AC7**: Syntax highlighting works for HTML (.html)
- [ ] **AC8**: File loads from `gateway.read()` when selected
- [ ] **AC9**: File saves via `context.saveFile()` on button click
- [ ] **AC10**: Cmd+S / Ctrl+S keyboard shortcut triggers save
- [ ] **AC11**: Language auto-detected from file extension
- [ ] **AC12**: Dark theme applied (vs-dark)
- [ ] **AC13**: TypeScript: 0 new errors (`pnpm tsc --noEmit`)

---

## Implementation Guide

### Step 1: Remove textarea POC and Import Monaco

```typescript
// Replace line 22:
// import Editor from '@monaco-editor/react';  // Currently commented out

// With:
import Editor from '@monaco-editor/react';
```

### Step 2: Add Language Detection Function

```typescript
/**
 * Detect language from file extension
 */
const detectLanguage = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescriptreact',
    js: 'javascript',
    jsx: 'javascriptreact',
    json: 'json',
    md: 'markdown',
    css: 'css',
    html: 'html',
    py: 'python',
    rs: 'rust',
    go: 'go',
    yaml: 'yaml',
    yml: 'yaml',
  };
  return langMap[ext || ''] || 'plaintext';
};
```

### Step 3: Add State for Language

```typescript
const [language, setLanguage] = useState<string>('plaintext');
```

### Step 4: Load File When Selected

```typescript
// Update useEffect for file loading
useEffect(() => {
  if (!activePath || !gateway) return;
  
  (async () => {
    try {
      setIsLoading(true);
      const fileContent = await gateway.read(activePath);
      const decoder = new TextDecoder();
      setContent(decoder.decode(fileContent));
      setLanguage(detectLanguage(activePath));
      setIsModified(false);
      setError(null);
    } catch (err) {
      setError(`Failed to load file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  })();
}, [activePath, gateway]);
```

### Step 5: Add Keyboard Shortcut for Save

```typescript
// Add keyboard shortcut effect
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleSave]);
```

### Step 6: Replace textarea with Editor (Lines 177-192)

```tsx
{/* Monaco Editor */}
<div className="flex-1">
  <Editor
    height="100%"
    language={language}
    value={content}
    onChange={(value) => {
      if (value !== undefined) {
        setContent(value);
        setIsModified(true);
      }
    }}
    theme="vs-dark"
    options={{
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, Consolas, monospace',
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      renderWhitespace: 'selection',
    }}
  />
</div>
```

---

## Validation Commands

```bash
# TypeScript check
pnpm tsc --noEmit

# Verify @monaco-editor/react import
grep -n "from '@monaco-editor/react'" src/plugins/monaco/MonacoPlugin.tsx

# Verify no textarea
grep -n "<textarea" src/plugins/monaco/MonacoPlugin.tsx
# Should return 0 results
```

---

## Testing (Manual - Validation Deferred per User Directive)

1. Open a .tsx file, verify syntax highlighting
2. Open a .json file, verify JSON formatting
3. Edit file, press Cmd+S, verify save works
4. Check console for no errors

---

## Evidence Required

- [ ] TypeScript output saved to file (0 errors)
- [ ] Grep output showing @monaco-editor/react import
- [ ] Grep output confirming no textarea

---

## Notes

- Depends on CC-AR-03 (hydration fix) being complete
- @monaco-editor/react should already be installed (check package.json)
- If not installed: `pnpm add @monaco-editor/react`

---

*Created: 2026-01-26*
*Team: Team B*
*Sprint Manager: bmad-sprint-manager*
