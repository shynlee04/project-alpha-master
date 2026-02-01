---
phase: A-byok-foundation
plan: 03
type: execute
wave: 2
depends_on: ["A-01", "A-02"]
files_modified:
  - src/presentation/components/agent/ProviderSettings.tsx
  - src/presentation/components/agent/ProviderConfigDialog.tsx
  - src/presentation/components/agent/ProviderStatusBadge.tsx
  - src/presentation/components/agent/ProviderDeletionWarningDialog.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "User can see provider settings UI"
    - "User can input API key for Gemini"
    - "API key input triggers vault storage"
    - "Provider status badge shows configured/missing"
  artifacts:
    - path: "src/presentation/components/agent/ProviderSettings.tsx"
      provides: "Main provider settings component"
      min_lines: 400
    - path: "src/presentation/components/agent/ProviderConfigDialog.tsx"
      provides: "API key input dialog"
    - path: "src/presentation/components/agent/ProviderStatusBadge.tsx"
      provides: "Visual status indicator"
  key_links:
    - from: "src/presentation/components/agent/ProviderSettings.tsx"
      to: "@/infrastructure/persistence/stores/use-app-store"
      via: "import"
      pattern: "from '@/infrastructure/persistence/stores/use-app-store'"
    - from: "src/presentation/components/agent/ProviderConfigDialog.tsx"
      to: "storeVaultCredential"
      via: "store action call"
      pattern: "storeVaultCredential"
---

<objective>
Restore ProviderSettings UI from archive to enable API key input.

Purpose: Give users a UI to input and manage their API keys.
Output: Working ProviderSettings component with dialogs for key management.
</objective>

<execution_context>
@/Users/apple/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/apple/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/A-byok-foundation/A-CONTEXT.md
@.planning/phases/A-byok-foundation/A-01-SUMMARY.md
@.planning/phases/A-byok-foundation/A-02-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Restore ProviderStatusBadge and ProviderDeletionWarningDialog</name>
  <files>
    src/presentation/components/agent/ProviderStatusBadge.tsx
    src/presentation/components/agent/ProviderDeletionWarningDialog.tsx
  </files>
  <action>
    1. Copy supporting components from archive:
       - `_phase2-archive/presentation/components/agent/ProviderStatusBadge.tsx` 
         → `src/presentation/components/agent/ProviderStatusBadge.tsx`
       - `_phase2-archive/presentation/components/agent/ProviderDeletionWarningDialog.tsx`
         → `src/presentation/components/agent/ProviderDeletionWarningDialog.tsx`
    
    2. These components use UI primitives - verify imports exist:
       - `@/presentation/components/ui/button`
       - `@/presentation/components/ui/dialog`
       
    3. No import path changes should be needed - archived code already uses canonical paths.
  </action>
  <verify>
    Both files exist and compile without errors.
    ProviderStatusBadge has type export for ProviderStatus.
  </verify>
  <done>Supporting components restored.</done>
</task>

<task type="auto">
  <name>Task 2: Restore ProviderConfigDialog</name>
  <files>src/presentation/components/agent/ProviderConfigDialog.tsx</files>
  <action>
    1. Copy `_phase2-archive/presentation/components/agent/ProviderConfigDialog.tsx`
       → `src/presentation/components/agent/ProviderConfigDialog.tsx`
    
    2. Verify/update imports:
       - UI primitives should work as-is
       - Store import: `@/infrastructure/persistence/stores/use-app-store`
       - Types: `@/infrastructure/persistence/stores/providers/types`
       
    3. Key functionality to verify:
       - Dialog accepts API key input
       - On submit, calls store action to save credential
       - The store action should now call real vault (from A-01, A-02)
    
    4. If ProviderConfigDialog references `storeVaultCredential` directly, verify
       that action exists in app store. If not, it may use a different pattern
       (e.g., `addProvider` or `updateProvider` with apiKey field).
  </action>
  <verify>
    File exists and compiles.
    Dialog has form for API key input.
    Submit handler calls appropriate store action.
  </verify>
  <done>ProviderConfigDialog restored with vault integration.</done>
</task>

<task type="auto">
  <name>Task 3: Replace ProviderSettings stub with restored implementation</name>
  <files>src/presentation/components/agent/ProviderSettings.tsx</files>
  <action>
    1. Current file is a STUB showing "Phase 2 - Staged"
    
    2. Replace with archived implementation:
       - `_phase2-archive/presentation/components/agent/ProviderSettings.tsx`
         → `src/presentation/components/agent/ProviderSettings.tsx`
    
    3. Verify imports work:
       - `@/presentation/components/ui/button` ✓ (should exist)
       - `@/infrastructure/persistence/stores/use-app-store` ✓ (should exist)
       - `@/infrastructure/persistence/stores/agents` ✓ (should exist)
       - `./ProviderConfigDialog` ✓ (from Task 2)
       - `./ProviderStatusBadge` ✓ (from Task 1)
       - `./ProviderDeletionWarningDialog` ✓ (from Task 1)
       - `@/infrastructure/persistence/stores/providers/types` ✓ (should exist)
       - `@/domain/types/llm/model-types` ✓ (should exist)
       - `@/lib/agent/providers/hardcoded-models` - CHECK if this exists
       - `@/presentation/components/ui/dialog` ✓ (should exist)
       - `@/presentation/components/ui/select` ✓ (should exist)
       - `@/infrastructure/persistence/stores/agents/types` ✓ (should exist)
    
    4. If `hardcoded-models` doesn't exist at expected path, check archive:
       `_phase2-archive/lib/agent/providers/hardcoded-models.ts`
       
       If found, copy to `src/lib/agent/providers/hardcoded-models.ts` (keep @/lib path
       for now - migration to canonical path is future work, not Phase A scope).
  </action>
  <verify>
    - File compiles without errors
    - Component renders provider list with status badges
    - Edit button opens ProviderConfigDialog
    - Delete button opens confirmation dialog
    - Run: `pnpm typecheck:fast` shows no new errors in ProviderSettings
  </verify>
  <done>ProviderSettings fully restored with working UI.</done>
</task>

</tasks>

<verification>
1. Run: `pnpm typecheck:fast` - no new errors in presentation/components/agent/
2. Run: `pnpm lint:fix` - no lint errors
3. Check component renders:
   - Import works: `import { ProviderSettings } from '@/presentation/components/agent/ProviderSettings'`
   - Component shows provider cards (Google Gemini at minimum)
</verification>

<success_criteria>
- [ ] 4 component files exist in src/presentation/components/agent/
- [ ] ProviderSettings shows provider list (not placeholder)
- [ ] ProviderConfigDialog has API key input field
- [ ] ProviderStatusBadge shows configured/missing states
- [ ] All imports resolve without errors
- [ ] TypeScript compiles without new errors
</success_criteria>

<output>
After completion, create `.planning/phases/A-byok-foundation/A-03-SUMMARY.md`
</output>
