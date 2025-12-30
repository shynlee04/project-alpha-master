# **SWEEPING VALIDATION CHECKLIST**
## *Post-Development Cycle Quality Gates for Project Alpha v2.0*

**Purpose:** Brutal reality check after every development cycle (story/epic completion).  
**Rule:** If ANY checkpoint fails → Fix before proceeding. No exceptions.

---

## **🔴 LEVEL 1: STATE INTEGRITY** *(Single Source of Truth)*

- [ ] **No Dual-Source State Leaks**
  - Zustand = ONLY source of truth (no localStorage fallbacks, no useState duplicates)
  - Test: Change setting → ALL UI updates → Navigate → Return → State persists

- [ ] **Persist Middleware Naming Collision**
  - Each store uses unique storage key: `${storeName}-storage`
  - Test: IndexedDB → No key collisions between stores

- [ ] **Selector Hydration Race Conditions**
  - Components show skeleton until `hasHydrated` flag is true
  - Test: Hard refresh → No flash of empty state

- [ ] **State Flow Completeness**
  - User Action → Zustand Mutation → Dexie Persist → IndexedDB Confirm
  - Test: Mutate → Kill tab → Reopen → State restored

---

## **🟠 LEVEL 2: CODE HYGIENE** *(Zero Zombie Code)*

- [ ] **No Unused Imports**
  - `pnpm build` → 0 module resolution errors
  - Barrel exports used for all public APIs

- [ ] **No Orphaned Event Listeners**
  - ALL useEffects have cleanup: `return () => eventBus.off(...)`
  - Test: Open/close panel 10× → No memory leak (Chrome Task Manager)

- [ ] **No Dead Code Branches**
  - Search for legacy flags (`USE_LEGACY_SYNC`, etc.) → Delete ALL branches
  - TODOs with deadlines: "DELETE AFTER EPIC X"

- [ ] **No Duplicate Utilities**
  - Single function per concern (consolidate `formatDate`, `formatTimestamp`, etc.)
  - Test: `grep -r "toLocaleString" src/lib/` → Only 1 implementation

---

## **🟡 LEVEL 3: NAMING CONSISTENCY** *(No Archaeology Required)*

- [ ] **Prop Naming Standardization**
  - `agentId` EVERYWHERE (no `id`, `agentUUID`, `agent_id`)
  - Test: `grep -rE "(agentId|agentUUID|agent_id)" src/` → Only agentId

- [ ] **Boolean Prop Unification**
  - Single name per prop (`showHidden`, not `includeHidden`/`hideHidden`)
  - Test: All component usages use same prop name

- [ ] **Event Handler Convention**
  - `handle{Event}` for internal, `on{Event}` for props
  - Test: ESLint rule enforces pattern

- [ ] **API Response Shape Stability**
  - Zod schema at ALL API boundaries
  - Test: Mock response → Verify ALL consumers handle shape

---

## **🟢 LEVEL 4: DEPENDENCY SANITY** *(No Circular Hell)*

- [ ] **No Circular Imports**
  - `pnpm madge --circular src/` → 0 circular dependencies
  - Fix: Extract shared types to `types.ts`

- [ ] **Barrel Export Compliance**
  - ALL imports via `index.ts` (no deep paths like `@/lib/agent/models/Agent`)
  - Test: `grep -r "from '@/lib/agent/models" src/` → 0 results

- [ ] **Component Decoupling**
  - UI imports adapter, adapter imports hook (no direct hook coupling)
  - Test: Changing hook signature doesn't break UI

- [ ] **Store Cross-Import Prevention**
  - Stores subscribe to NO other stores (extract shared to Context)
  - Test: React DevTools → No infinite re-render loops

---

## **🔵 LEVEL 5: INTEGRATION REALITY** *(Works in Production, Not Just Dev)*

- [ ] **FSA Handle Lifecycle**
  - ALL writes wrapped in `fileHandle.queryPermission()` check
  - Test: Close browser → Reopen → Trigger save → Re-prompt works

- [ ] **WebContainer Boot Guards**
  - ALL WC operations check `wcStatus === 'ready'`
  - Test: Hard refresh → Tool calls wait for boot (no crash)

- [ ] **IndexedDB Quota Handling**
  - Try/catch on ALL db writes → Show toast on quota exceeded
  - Test: Fill 500MB → Error UI appears

- [ ] **API Key Validation**
  - Build throws if env vars missing (no silent 401s)
  - Test: Deploy to staging → Agent works

---

## **⚫ LEVEL 6: ARCHITECTURE COMPLIANCE** *(No Shortcut Violations)*

- [ ] **Layer Boundaries Enforced**
  - Components NEVER access `db.` directly (only via store actions)
  - Test: `grep -r "await db\." src/components/` → 0 results

- [ ] **Tool Approval Integrity**
  - EVERY write requires user approval (no auto-approve shortcuts)
  - Test: Agent writes file → Approval shows BEFORE execution

- [ ] **Agent Context Injection**
  - SystemPromptComposer runs on EVERY message (workspace context included)
  - Test: Start chat → Agent knows open files without asking

- [ ] **Streaming Buffer Compliance**
  - 50ms buffer enforced (no excessive re-renders)
  - Test: React DevTools → <10 renders/sec during stream

---

## **📱 LEVEL 7: MOBILE REALITY** *(Not Just "Small Desktop")*

- [ ] **SharedArrayBuffer Detection**
  - Runtime check: `crossOriginIsolated === true`
  - Test: Open on iPhone → "Desktop Required" modal (not blank page)

- [ ] **Touch Targets**
  - ALL buttons ≥44×44px, file tree items ≥40px height
  - Test: Real phone (not DevTools mobile view)

- [ ] **Responsive Breakpoints**
  - Mobile <640px: Single-panel stack
  - Tablet 640-1024px: 2-column layout
  - Desktop ≥1024px: Full 3-panel resizable
  - Test: Resize window → Layout adapts WITHOUT reload

- [ ] **Offline Storage**
  - IndexedDB quota warning at 80% usage
  - Auto-prune old conversations (FIFO, keep last 50)
  - Test: Fill 500MB → Warning → Prune works

---

## **🌐 LEVEL 8: I18N WIRING** *(No Hardcoded Strings)*

- [ ] **String Externalization**
  - NO hardcoded JSX strings (all use `t("key")`)
  - Test: Toggle language → ALL text changes (no English leaks)

- [ ] **Translation Completeness**
  - Error messages translated (en.json + vi.json)
  - Pluralization works: `t("file.count", { count: 5 })`
  - Date/time: Locale-aware (not en-US hardcoded)

- [ ] **Fallback Handling**
  - Missing key → Shows English (not "[key]" string)
  - Browser language detection → Sets initial locale
  - Test: Delete vi.json key → Still shows English

---

## **⚡ LEVEL 9: PERFORMANCE UNDER LOAD** *(Production Scale, Not Toy Data)*

- [ ] **Large Project Handling**
  - WebContainer boot <5s (not 20s timeout)
  - File tree virtualized (not full DOM)
  - File save latency <500ms
  - Test: Open 300-file React project → Boot succeeds

- [ ] **Long Conversation History**
  - IndexedDB query <100ms (indexed by threadId)
  - Scroll 60fps (virtualized message list)
  - Test: Load 100-message thread → Smooth scroll

- [ ] **Network Interruption Recovery**
  - Agent stream stops → Toast: "Connection lost. Retry?"
  - File save offline → Queued in SyncManager
  - WebContainer crash → Auto-restart (max 3 attempts)
  - Test: Disconnect WiFi mid-save → Reconnect → Sync completes

---

## **🔐 LEVEL 10: SECURITY + PRIVACY** *(Zero Trust)*

- [ ] **API Key Encryption**
  - Keys in IndexedDB as AES-256-GCM (not plaintext)
  - NO keys in console.log, network tab, or error messages
  - Test: Network tab → No raw Authorization header

- [ ] **File Content Privacy**
  - NO file content sent to non-LLM endpoints
  - Local FS files NEVER uploaded (FSA stays local)
  - Test: Network monitor → Only AI provider endpoints receive data

- [ ] **COOP/COEP Headers**
  - Dev server: `securityHeadersPlugin` sets headers
  - Production: `security-headers.ts` middleware
  - Fallback: "Browser Not Supported" error if missing
  - Test: DevTools → COEP: require-corp

---

## **📋 LEVEL 11: DOCUMENTATION COMPLETENESS** *(No Mystery Code)*

- [ ] **API Documentation**
  - All endpoints documented with request/response schemas
  - Example requests/responses included

- [ ] **User Guides**
  - Feature walkthroughs written
  - Troubleshooting sections complete

- [ ] **Developer Documentation**
  - Architecture diagrams up-to-date
  - Component props documented
  - Change logs maintained

---

## **🧪 LEVEL 12: TEST COVERAGE** *(Quality Gates)*

- [ ] **Unit Test Coverage**
  - Target: >80% coverage
  - Critical paths: 100% coverage

- [ ] **Integration Tests**
  - Cross-layer scenarios documented
  - E2E flows tested

- [ ] **Test Execution**
  - `pnpm test` passes with 0 failures
  - No skipped tests without justification

---

## **🚀 BRUTAL 3-DEVICE RULE**

**MUST pass on ALL three before declaring DONE:**

### 1. Desktop Chrome (macOS/Windows) - Full IDE mode
- Open 300-file project → WC boots <10s
- Edit in Monaco → VS Code sees changes immediately
- Agent writes file → Approval → Code written
- Reload → Exact same state (tabs, scroll, cursor)
- Network offline → Save queues → Reconnect → Sync completes

### 2. Mobile Safari (iOS 16+) - Demo mode, chat-only
- Demo mode banner shows (not blank screen)
- Chat with agent works
- Edit code gracefully blocked with explanation
- Toggle to Vietnamese → All text changes
- Close → Reopen → Chat history restored

### 3. Android Chrome (mid-range) - Demo mode, offline test
- Demo mode works
- Offline storage test passes
- Touch targets ≥44×44px

**If ANY device fails → Story is NOT done.**

---

## **🎯 THE 3-QUESTION TEST**

After implementing ANY story, ask:

### 1. Can I delete this feature in 1 command?
- If removal requires >5 file changes → **Coupled too tightly**
- Fix: Extract to isolated module with barrel export

### 2. Does this feature work on page refresh?
- If state is lost → **Missing persistence**
- Fix: Add to Zustand persist middleware

### 3. Does this feature work offline?
- If requires network → **Missing fallback UI**
- Fix: Add `navigator.onLine` check + error state

---

## **⚠️ AI AGENT RED FLAGS**

**When code claims "Done" but:**

- [ ] No cross-layer E2E test → Layers work alone, fail together
- [ ] No mobile device test → Works in DevTools, fails on iPhone
- [ ] No i18n key extraction → English hardcoded in error paths
- [ ] No performance profiling → Works with 5 files, crashes with 500
- [ ] No network disconnect test → Assumes always-online
- [ ] No IndexedDB quota test → Assumes infinite storage
- [ ] No FSA permission expiry test → Assumes handles never expire
- [ ] No SharedArrayBuffer check → Assumes all browsers support it

---

## **🔄 DECAY DETECTION TIMELINE**

| Story Count | Rot Level | Action Required |
|-------------|-------------|----------------|
| 0-5 | Green | Continue development |
| 6-10 | Yellow | Run full audit (2-3 duplicate utils, 1 zombie import) |
| 11-15 | Orange | STOP → Fix state split + prop naming inconsistency |
| 16-20 | Red | STOP → Fix circular imports + architecture bypasses |
| 21+ | Critical | STOP → Refactor required (10+ files break on changes) |

**At Yellow or above → STOP adding features, run full audit.**

---

## **🛠️ AUTOMATED AUDIT SCRIPT**

```bash
#!/bin/bash
# sweep-audit.sh - Run after EVERY story/epic completion

echo "🔍 SWEEPING VALIDATION AUDIT"

# 1. State integrity
echo "\n[STATE] Checking for localStorage in components..."
grep -r "localStorage\." src/components/ --include="*.tsx" | wc -l
# EXPECTED: 0

# 2. Code hygiene
echo "\n[HYGIENE] Checking for unused imports..."
pnpm eslint src/ --rule 'no-unused-vars: error'
# EXPECTED: 0 errors

echo "\n[HYGIENE] Checking for duplicate utilities..."
grep -r "toLocaleString\|format.*Date" src/lib/ | wc -l
# EXPECTED: 1 (single implementation)

# 3. Naming consistency
echo "\n[NAMING] Checking for inconsistent agent ID props..."
grep -rE "(agentId|agentUUID|agent_id)" src/components/ --include="*.tsx" | \
  grep -v "agentId" | wc -l
# EXPECTED: 0

# 4. Dependency sanity
echo "\n[DEPS] Checking for circular imports..."
pnpm madge --circular src/
# EXPECTED: No circular dependencies

echo "\n[DEPS] Checking for deep import paths..."
grep -r "from '@/lib/agent/models" src/ | wc -l
# EXPECTED: 0

# 5. Integration reality
echo "\n[INTEGRATION] Checking FSA permission checks..."
grep -r "fileHandle\.write" src/ --include="*.ts" -A 5 | \
  grep -L "queryPermission" | wc -l
# EXPECTED: 0

echo "\n[INTEGRATION] Checking WebContainer ready guards..."
grep -r "webcontainer\." src/ --include="*.ts" -B 5 | \
  grep -L "wcStatus.*ready" | wc -l
# EXPECTED: 0

# 6. Architecture compliance
echo "\n[ARCH] Checking for direct db access in components..."
grep -r "await db\." src/components/ --include="*.tsx" | wc -l
# EXPECTED: 0

echo "\n✅ Audit complete. Fix violations before next story."
```

---

## **📝 VALIDATION GATE STATUS**

| Level | Status | Issues | Warnings | Validated By |
|-------|--------|--------|----------|-------------|
| 1: State Integrity | ⬜ PENDING | 0 | 0 | - |
| 2: Code Hygiene | ⬜ PENDING | 0 | 0 | - |
| 3: Naming Consistency | ⬜ PENDING | 0 | 0 | - |
| 4: Dependency Sanity | ⬜ PENDING | 0 | 0 | - |
| 5: Integration Reality | ⬜ PENDING | 0 | 0 | - |
| 6: Architecture Compliance | ⬜ PENDING | 0 | 0 | - |
| 7: Mobile Reality | ⬜ PENDING | 0 | 0 | - |
| 8: I18N Wiring | ⬜ PENDING | 0 | 0 | - |
| 9: Performance Under Load | ⬜ PENDING | 0 | 0 | - |
| 10: Security + Privacy | ⬜ PENDING | 0 | 0 | - |
| 11: Documentation Completeness | ⬜ PENDING | 0 | 0 | - |
| 12: Test Coverage | ⬜ PENDING | 0 | 0 | - |

**Overall Status:** ⬜ PENDING  
**Last Validated:** -  
**Validated By:** -  

---

## **🎯 DEFINITION OF DONE**

A story/epic is **DONE** when:

- ✅ All 12 levels passed (0 critical issues)
- ✅ 3-device rule passed (Desktop + Mobile + Android)
- ✅ 3-question test passed (Deletable, Persistent, Offline-capable)
- ✅ No AI agent red flags
- ✅ Automated audit script passes with 0 violations
- ✅ Code reviewed and approved
- ✅ Tests pass with >80% coverage
- ✅ Documentation updated

**This is the difference between "spec-compliant" and "actually works in December 2025 on real hardware with real users."**
