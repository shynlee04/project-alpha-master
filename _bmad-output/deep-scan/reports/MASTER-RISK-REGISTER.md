# Master Risk Register

**Date**: 2026-01-04
**Workflow**: Evidence Synthesis
**Status**: ACTIVE

## Executive Summary

The Deep Scan analysis has identified **Critical** architectural and state management risks that threaten system stability and maintainability. While Internationalization (UX) health is high, the codebase suffers from significant Layer Violations (114 counts) and oversized "God" entities in both State (12 stores) and UI (20 components).

**Overall Health Score**: 68/100 ⚠️

---

## Domain: State Management
**Health Score**: 65/100
**Status**: 🔴 Critical Risks Detected

### 🔴 Critical Risks
*   **God Stores**: 12 stores exceed the 300-line limit.
    *   `src/infrastructure/persistence/stores/study/quiz-store.ts` (658 lines)
    *   `src/infrastructure/persistence/stores/canvas-store.ts` (623 lines)
    *   `src/infrastructure/persistence/stores/flashcard-store.ts` (531 lines)
    *   **Impact**: High regression risk, difficult testing, state coupling.

### 🟡 Warning Risks
*   **Migration Bloat**: `migration-backup.ts` (549 lines) and `local-storage-migrator.ts` (509 lines) indicate complex migration logic that may be brittle.

---

## Domain: Architecture
**Health Score**: 55/100
**Status**: 🔴 Critical Violations

### 🔴 Critical Risks
*   **Layer Violations**: 114 instances of Presentation layer directly importing Infrastructure.
    *   **Impact**: Tight coupling, inability to swap infrastructure, difficult unit testing.
*   **God Components**: 20 UI components exceed 300 lines.
    *   `src/presentation/components/ui/resizable.tsx` (745 lines)
    *   `src/presentation/components/chat/ChatConversation.tsx` (522 lines)
    *   **Impact**: Render performance issues, complex props drilling, "spaghetti" UI logic.

---

## Domain: Persistence
**Health Score**: 70/100
**Status**: 🟡 Warning

### 🟡 Warning Risks
*   **Direct DB Access in UI**: Found direct `db.` calls in `HubHomePage.tsx` and related components.
    *   **Impact**: Bypasses Store/Repository abstraction, leads to inconsistent state.

---

## Domain: Security
**Health Score**: 85/100
**Status**: 🟢 Good

### 🟡 Warning Risks
*   **Unsanitized HTML**: 3 instances of `dangerouslySetInnerHTML` in `StreamdownRenderer`, `DeepThinkUI`, and `RAGSearchPanel`.
    *   **Impact**: XSS vulnerability if input is not strictly sanitized before rendering.

---

## Domain: Type Safety
**Health Score**: 60/100
**Status**: 🟡 Warning

### 🟡 Warning Risks
*   **"Any" Pollution**: 263 usages of `: any` or `as any`.
    *   **Impact**: Defeats TypeScript benefits, hides runtime errors.

---

## Domain: User Experience (UX)
**Health Score**: 90/100
**Status**: 🟢 Excellent

### 🟢 Strengths
*   **High i18n Adoption**: ~3601 usages of translation hooks (`t(`), indicating mature internationalization support.

---

## Recommended Actions (Top 5)

1.  **Refactor God Stores**: Split `quiz-store` and `canvas-store` into slices (Action: `@store-refactorer`).
2.  **Enforce Layers**: create a lint rule or barrier to prevent `src/presentation` imports of `src/infrastructure` (Action: `@architecture-scanner`).
3.  **Split UI Components**: Decompose `ChatConversation` and `resizable.tsx` (Action: `@component-splitter`).
4.  **Fix DB Access**: Move `HubHomePage` DB calls to `project-store` or a new repository (Action: `@store-refactorer`).
5.  **Type Remediation**: Launch a campaign to reduce `any` usage by 50% (Action: `@typescript-fixer`).
