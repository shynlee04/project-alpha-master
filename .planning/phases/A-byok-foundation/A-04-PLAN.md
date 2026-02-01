---
phase: A-byok-foundation
plan: 04
type: execute
wave: 3
depends_on: ["A-03"]
files_modified: []
autonomous: false
user_setup: []

must_haves:
  truths:
    - "User can save Gemini API key and it persists"
    - "User can save OpenRouter API key and it persists"
    - "Keys are encrypted in IndexedDB"
    - "credentialVault.getCredentials() returns saved key"
  artifacts: []
  key_links: []
---

<objective>
Verify Phase A: BYOK Foundation is complete and working.

Purpose: Confirm API keys can be saved, encrypted, and retrieved.
Output: Manual verification that success criteria are met.
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
@.planning/phases/A-byok-foundation/A-03-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Run governance checks</name>
  <files></files>
  <action>
    Execute verification commands:
    
    1. TypeScript check:
       ```bash
       pnpm typecheck:fast
       ```
       Expected: No new errors in infrastructure/ai/ or presentation/components/agent/
    
    2. Governance check:
       ```bash
       pnpm governance
       ```
       Expected: Pass (no new file size or import violations)
    
    3. Circular dependency check:
       ```bash
       pnpm deps:circular
       ```
       Expected: No new circular dependencies involving infrastructure/ai/
  </action>
  <verify>All commands pass or show acceptable results.</verify>
  <done>Automated verification complete.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Full BYOK credential vault with:
    - AES-256-GCM encryption (credential-vault.ts)
    - IndexedDB persistence (credential-storage.ts)
    - Provider settings UI (ProviderSettings.tsx)
    - API key input dialog (ProviderConfigDialog.tsx)
  </what-built>
  <how-to-verify>
    1. Start development server:
       ```bash
       pnpm dev
       ```
    
    2. Navigate to Provider Settings:
       - Open app at http://localhost:5173
       - Go to Settings → Providers (or find ProviderSettings in UI)
    
    3. Test Gemini API key:
       - Click "Edit" on Google Gemini provider
       - Enter your Gemini API key
       - Click Save
       - Verify status badge changes from "missing" to "configured"
    
    4. Test persistence:
       - Refresh the page (Cmd/Ctrl+R)
       - Return to Provider Settings
       - Verify Gemini still shows "configured"
    
    5. (Optional) Test OpenRouter:
       - If OpenRouter provider exists, repeat steps 3-4
    
    6. Verify IndexedDB:
       - Open DevTools → Application → IndexedDB
       - Find credentials table
       - Verify encrypted credential exists (not plain text)
  </how-to-verify>
  <resume-signal>
    Type "approved" if all tests pass.
    If issues found, describe what failed and any error messages.
  </resume-signal>
</task>

</tasks>

<verification>
Phase A success criteria from A-CONTEXT.md:
- [ ] User can input Gemini API key in settings
- [ ] User can input OpenRouter API key in settings
- [ ] Keys persist after browser refresh
- [ ] `credentialVault.getCredentials('gemini')` returns the key
- [ ] `credentialVault.getCredentials('openrouter')` returns the key
- [ ] TypeScript errors: 0 new errors introduced
- [ ] Working features: Project CRUD, FileTree still work
</verification>

<success_criteria>
- [ ] pnpm typecheck:fast passes
- [ ] pnpm governance passes
- [ ] Manual verification approved by user
- [ ] API keys persist after browser refresh
- [ ] Keys are encrypted in IndexedDB (not plain text)
- [ ] ProviderSettings shows correct status badges
</success_criteria>

<output>
After completion, create `.planning/phases/A-byok-foundation/A-04-SUMMARY.md`
Then update `.planning/STATE.md` to reflect Phase A completion.
</output>
