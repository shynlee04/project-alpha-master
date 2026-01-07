# Implementation Plan: Notes Workspace 4-Level Progressive Entry Point

**Date**: 2026-01-07
**Epic**: Notes Workspace Enhancement
**Priority**: P0 (Critical)
**Estimated Duration**: 20 hours
**Status**: READY FOR EXECUTION

---

## Executive Summary

This plan implements a **4-level progressive entry point system** for the Notes workspace while remediating **132 style violations** (P0 glassmorphism and hardcoded strings).

### User Requirements

1. **Case 1**: Desktop user, no system file sync, direct Notes access
2. **Case 2**: Desktop user, folder sync with all file types (md, doc, docx, png, jpg, pdf, etc.)
3. **Case 3**: Smartphone user, reactive project persistence, Notion-like block style
4. **Case 4**: AI content generation features that direct users to API key settings when missing

### Critical Constraints

- **NO glassmorphism** - 8-bit design system only (solid colors, hard-edged shadows)
- **All strings via `t()`** - No hardcoded text
- **Zero tolerance for errors** - Horizontal testing methodology
- **Autonomous execution** - No questions during implementation

---

## Phase 1: Fix P0 Style Violations (Priority: CRITICAL)

### 1.1 Remove Glassmorphism (`backdrop-blur`) - 15 violations

| File | Line(s) | Change Required |
|------|---------|----------------|
| `LoadingSpinner.tsx` | 205 | `bg-neutral-950/95 backdrop-blur-sm` → `bg-neutral-950` |
| `NotesPage.tsx` | 346, 497 | `bg-background/80 backdrop-blur-sm` → `bg-card` |
| `WorkflowVisualizer.tsx` | 310 | `bg-background/95 backdrop-blur` → `bg-card` |

**Pattern:**
```typescript
// BEFORE (forbidden)
<div className="bg-background/80 backdrop-blur-sm">

// AFTER (8-bit solid)
<div className="bg-card border border-border">
```

### 1.2 Replace Hardcoded Strings - 47 violations

**Highest Priority: `AISlashCommand.tsx` (22 violations)**

| Hardcoded String | Translation Key |
|-----------------|-----------------|
| "AI Magic" | `notes.ai.magic` |
| "Generate content with AI" | `notes.ai.magic.description` |
| "Summarize Note" | `notes.ai.summary` |
| "Generate a summary" | `notes.ai.summary.description` |
| "Generate Outline" | `notes.ai.outline` |
| "Create an outline" | `notes.ai.outline.description` |
| "Explain Like I'm 5" | `notes.ai.explain` |
| "Explain in simple terms" | `notes.ai.explain.description` |
| "Generate Questions" | `notes.ai.questions` |
| "Create study questions" | `notes.ai.questions.description` |
| "Expand" | `notes.ai.expand` |
| "Expand on content" | `notes.ai.expand.description` |
| "Improve" | `notes.ai.improve` |
| "Improve writing" | `notes.ai.improve.description` |
| "Translate" | `notes.ai.translate` |
| "Translate to another language" | `notes.ai.translate.description` |
| "AI returned empty content" | `notes.ai.error.empty` |
| "Failed to parse AI response" | `notes.ai.error.parse` |
| "No content to summarize" | `notes.ai.error.noContent` |
| "Please select an AI agent" | `notes.ai.error.noAgent` |
| "Failed to generate content" | `notes.ai.error.generate` |
| "Content generated successfully" | `notes.ai.success` |

**Other Files with Violations:**
- `NotesPage.tsx` (4 strings) - Add `notes.import.*` keys
- `GitSettings.tsx` (5 strings) - Add `git.*` keys
- `NotesFilePicker.tsx` (4 strings) - Add `notes.fileSync.*` keys

**Pattern:**
```typescript
// BEFORE
const title = "AI Magic";

// AFTER
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
const title = t('notes.ai.magic');
```

### 1.3 Replace Hardcoded Colors - 25+ violations

**Files:**
- `XTerminal.tsx` (lines 25-44)
- `edgeTypes.tsx` (line 20)
- `YOLOModeToggle.tsx` (lines 163, 170, 173)

**Pattern:**
```typescript
// BEFORE
stroke: '#a855f7'

// AFTER
stroke: 'var(--color-primary, #a855f7)'
```

---

## Phase 2: Implement Case 4 - AI Gateway with API Key Detection

### 2.1 Create Centralized API Key Status Checker

**New File:** `src/lib/agent/providers/api-key-status.ts`

```typescript
/**
 * Centralized API Key Status Checker
 * Single source of truth for credential availability
 */

import { CredentialVault } from './credential-vault';

export interface APIKeyStatus {
  providerId: string;
  hasKey: boolean;
  isValid: boolean;
  lastChecked: Date;
}

export class APIKeyStatusChecker {
  private vault: CredentialVault;
  private cache: Map<string, APIKeyStatus> = new Map();
  private cacheTimeout = 60000; // 1 minute

  async checkProvider(providerId: string): Promise<APIKeyStatus> {
    const cached = this.cache.get(providerId);
    if (cached && Date.now() - cached.lastChecked.getTime() < this.cacheTimeout) {
      return cached;
    }

    const credential = await this.vault.getCredential(providerId);
    const status: APIKeyStatus = {
      providerId,
      hasKey: !!credential,
      isValid: !!credential?.apiKey,
      lastChecked: new Date(),
    };

    this.cache.set(providerId, status);
    return status;
  }

  async checkAllProviders(): Promise<Map<string, APIKeyStatus>> {
    const providers = useProviderStore.getState().providers;
    const results = new Map<string, APIKeyStatus>();

    for (const [id] of Object.entries(providers)) {
      results.set(id, await this.checkProvider(id));
    }

    return results;
  }

  hasAnyKey(): boolean {
    return Array.from(this.cache.values()).some(s => s.hasKey);
  }
}

export const apiKeyStatusChecker = new APIKeyStatusChecker();
```

### 2.2 Create API Key Required Guard Component

**New File:** `src/presentation/components/common/APIKeyRequiredGuard.tsx`

```typescript
/**
 * API Key Required Guard
 * Redirects to settings when API keys are missing
 */

import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { KeyRound, Settings } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { apiKeyStatusChecker } from '@/lib/agent/providers/api-key-status';

interface APIKeyRequiredGuardProps {
  providerId?: string;
  children: React.ReactNode;
}

export function APIKeyRequiredGuard({ providerId, children }: APIKeyRequiredGuardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (providerId) {
        const status = await apiKeyStatusChecker.checkProvider(providerId);
        setHasKey(status.hasKey);
      } else {
        const allStatus = await apiKeyStatusChecker.checkAllProviders();
        setHasKey(Array.from(allStatus.values()).some(s => s.hasKey));
      }
    };
    checkKey();
  }, [providerId]);

  if (hasKey === null) {
    return <div className="flex items-center justify-center h-48">{t('common.loading')}</div>;
  }

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <KeyRound className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">{t('errors.apiKeyRequired.title')}</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {t('errors.apiKeyRequired.description')}
        </p>
        <Button onClick={() => navigate({ to: '/settings' })}>
          <Settings className="w-4 h-4 mr-2" />
          {t('errors.apiKeyRequired.action')}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 2.3 Update AI Entry Points

**Files to Modify:**

1. **`UnifiedChatPanel.tsx`** - Wrap agent mode output with `APIKeyRequiredGuard`
2. **`AISlashCommand.tsx`** - Add key check in `executeAICommand`
3. **`AgentManager.tsx`** - Add visual indicator for missing API keys

---

## Phase 3: Implement Case 2 - Multi-Format File Sync

### 3.1 Extend File Sync Service

**Modify:** `src/lib/filesync/services/notes-file-sync-service.ts`

```typescript
// Add supported formats
const SUPPORTED_FORMATS = {
  markdown: ['.md'],
  documents: ['.doc', '.docx', '.txt', '.rtf'],
  images: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  pdf: ['.pdf'],
};

// Add import converters
async convertToMarkdown(file: File, format: string): Promise<string> {
  switch (format) {
    case 'pdf':
      return await this.convertPDFToMarkdown(file);
    case 'image':
      return await this.convertImageToMarkdown(file);
    case 'docx':
      return await this.convertDocxToMarkdown(file);
    default:
      return await file.text();
  }
}
```

### 3.2 Create Format Converter

**New File:** `src/lib/filesync/converters/markdown-converter.ts`

```typescript
/**
 * Multi-format to Markdown converter
 */

export class MarkdownConverter {
  async convertPDF(file: File): Promise<string> {
    // Use PDF.js to extract text
    const pdfjsLib = await import('pdfjs-dist');
    // Implementation...
  }

  async convertImage(file: File): Promise<string> {
    // For images: embed as markdown image syntax
    return `![${file.name}](${fileURL})\n\n`;
  }

  async convertDocx(file: File): Promise<string> {
    // Use mammoth.js for Word documents
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
  }
}
```

### 3.3 Update File Picker UI

**Modify:** `src/presentation/components/notes/NotesFilePicker.tsx`

Add format selection:
```typescript
const [selectedFormats, setSelectedFormats] = useState({
  markdown: true,
  pdf: true,
  images: true,
  documents: false,
});
```

---

## Phase 4: Implement Case 3 - Mobile Reactive Notion-Like

### 4.1 Create Mobile-Optimized Note Editor

**New File:** `src/presentation/components/notes/MobileNoteEditor.tsx`

```typescript
/**
 * Mobile-optimized BlockNote editor
 * Touch targets >= 48px
 * Simplified toolbar
 */

import { useResponsive } from '@/hooks/useResponsive';
import { BlockNoteView } from '@blocknote/react';

export function MobileNoteEditor() {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className="mobile-note-editor">
        <MobileToolbar />
        <BlockNoteView className="touch-friendly" />
      </div>
    );
  }

  return <DesktopNoteEditor />;
}
```

### 4.2 Add Touch-Friendly Toolbar

**New File:** `src/presentation/components/notes/MobileToolbar.tsx`

```typescript
/**
 * Touch-friendly toolbar with 48px minimum touch targets
 */

const TOOLBAR_BUTTONS = [
  { icon: 'bold', action: 'bold', label: 'Bold' },
  { icon: 'italic', action: 'italic', label: 'Italic' },
  { icon: 'list', action: 'bullet', label: 'List' },
  { icon: 'heading', action: 'heading', label: 'Heading' },
];

export function MobileToolbar() {
  return (
    <div className="flex gap-2 p-2 border-t bg-card">
      {TOOLBAR_BUTTONS.map(btn => (
        <button
          key={btn.action}
          className="w-12 h-12 flex items-center justify-center rounded active:bg-muted"
          aria-label={btn.label}
        >
          <Icon name={btn.icon} />
        </button>
      ))}
    </div>
  );
}
```

---

## Phase 5: Implement Case 1 - Desktop No-Sync Direct Access

### 5.1 Enhance Empty State

**Modify:** `src/routes/notes.lazy.tsx`

Add "Quick Start" button that creates in-memory project:
```typescript
// If 0 Notes-enabled projects, show enhanced empty state with:
// - "Quick Start" button (creates in-memory project)
// - "Connect Folder" button (file sync)
// - "Mobile App" badge (responsive indicator)
```

---

## Validation Steps

### TypeScript Checks
```bash
pnpm typecheck  # Production code only
```

### Style Compliance Checks
```bash
# Check for glassmorphism
grep -r "backdrop-blur" src --include='*.tsx'

# Check for hardcoded strings
grep -r ">[A-Z][a-z]" src --include='*.tsx' | grep -v "t('"
```

### E2E Test Scenarios
1. Case 1: `/notes` without project → Verify empty state
2. Case 2: Upload PDF → Verify markdown conversion
3. Case 3: Mobile viewport → Verify touch targets >= 48px
4. Case 4: Click AI without API key → Verify settings redirect

---

## Risk Mitigation

### Breaking Changes to Avoid
1. DO NOT modify `CredentialVault` encryption
2. DO NOT change file sync service contract
3. DO NOT modify i18n key structure (additive only)

### Rollback Strategies
1. Feature flags for new functionality
2. Facade pattern for backward compatibility
3. Incremental rollout (one phase at a time)

---

## New Components Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| `APIKeyRequiredGuard` | `presentation/components/common/` | API key gateway |
| `MobileNoteEditor` | `presentation/components/notes/` | Mobile-optimized editor |
| `MobileToolbar` | `presentation/components/notes/` | Touch-friendly toolbar |
| `MarkdownConverter` | `lib/filesync/converters/` | Format conversion |
| `APIKeyStatusChecker` | `lib/agent/providers/` | Centralized status |

---

## Files to Modify Summary

| File | Changes | Priority |
|------|---------|----------|
| `AISlashCommand.tsx` | 22 hardcoded strings | P0 |
| `NotesPage.tsx` | 2 glassmorphism + 4 strings | P0 |
| `WorkflowVisualizer.tsx` | 1 glassmorphism | P0 |
| `LoadingSpinner.tsx` | 1 glassmorphism | P0 |
| `notes.lazy.tsx` | Case 1 empty state | P1 |
| `UnifiedChatPanel.tsx` | API key guard | P1 |
| `NotesFilePicker.tsx` | Multi-format support | P1 |
| `en.json`, `vi.json` | Add translation keys | P0 |

---

**Status:** READY FOR EXECUTION
**Next Action:** Begin Phase 1 implementation
