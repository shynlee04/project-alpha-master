# **REAL-WORLD DECAY CHECKLIST**
## *Multi-Story Architecture Rot Detection for Brownfield Context Loss*

This is the **"code actually breaks during development"** checklist—focused on **incremental drift, partial context, and zombie code accumulation** that happens when AI agents work across **multiple stories without full memory**.

***

## **🔴 LEVEL 1: STATE FRAGMENTATION** *(The Silent Killer)*

```yaml
☐ Dual-Source State Leaks:
  # Story 2 adds agent config to Zustand
  # Story 8 adds "quick settings" to localStorage
  # Story 12 adds "temp agent" to useState in header
  ├─ Symptom: User changes setting → Some UI updates, some doesn't
  ├─ Root: Three sources of truth (Zustand + localStorage + useState)
  ├─ Test: Change agent name → Check ALL UI locations → Do they match?
  └─ Fix Pattern: Migrate ALL to Zustand, delete localStorage fallback

☐ Orphaned Persist Middleware:
  # Story 3 adds persist() to useIDEStore
  # Story 11 adds persist() to useAgentsStore
  # Story 15 refactors but forgets to update persist keys
  ├─ Symptom: Data overwrites across stores (both use same "ide-storage" key)
  ├─ Root: Copy-paste middleware without unique storage names
  ├─ Test: Open DevTools → IndexedDB → Check storage key collisions
  └─ Fix: Enforce naming convention: `${storeName}-storage`

☐ Stale Selectors After Refactor:
  # Story 5 moves `openFiles` from useIDEStore → useFileStore
  # Story 12 adds feature using OLD selector: useIDEStore(s => s.openFiles)
  ├─ Symptom: Component shows undefined, console errors
  ├─ Root: AI uses outdated architecture.md context
  ├─ Test: Global search for `.openFiles` → Verify ALL use new store
  └─ Audit: Run `grep -r "useIDEStore.*openFiles" src/`

☐ Hydration Race Conditions:
  # Story 4 adds Dexie hydration to useAgentsStore
  # Story 9 adds UI that reads agent config BEFORE hydration completes
  ├─ Symptom: First render shows empty list, then flashes full list
  ├─ Root: Component mounts before `persist` middleware loads data
  ├─ Test: Hard refresh → Check if loading state shows during hydration
  └─ Fix: Add `hasHydrated` flag, show skeleton until true
```

**Why this kills projects**: Each story makes "local" changes, unaware of **global state topology**.

***

## **🟠 LEVEL 2: ZOMBIE IMPORTS & DEAD CODE** *(The Cruft Accumulator)*

```yaml
☐ Unused Imports That Break Builds:
  # Story 6 refactors FileTree, removes FileNode interface
  # Story 13 imports FileNode from old location (now 404)
  ├─ Symptom: `Module not found: Can't resolve './types/FileNode'`
  ├─ Root: AI hallucinates import paths from stale context
  ├─ Audit: Run `pnpm build` → Fix ALL module resolution errors
  └─ Enforce: Barrel exports (`src/lib/workspace/index.ts`)

☐ Orphaned Event Listeners:
  # Story 7 adds eventBus.on('file:changed', ...) in useEffect
  # Story 10 removes eventBus but forgets cleanup
  ├─ Symptom: Memory leak, handlers fire on unmounted components
  ├─ Root: No return cleanup in useEffect
  ├─ Test: Open/close panel 10 times → Check Chrome Task Manager
  └─ Fix: ALWAYS `return () => eventBus.off('file:changed', handler)`

☐ Dead Conditional Branches:
  # Story 4 adds: if (USE_LEGACY_SYNC) { ... }
  # Story 14 sets USE_LEGACY_SYNC = false permanently
  # Story 20 still has 50 lines of legacy code
  ├─ Symptom: Dead code bloats bundle, confuses maintainers
  ├─ Root: No one deletes old paths after migration
  ├─ Audit: Search for `USE_LEGACY_SYNC` → Delete ALL branches
  └─ Prevention: Add TODO with deadline: "DELETE AFTER EPIC 5"

☐ Duplicate Utility Functions:
  # Story 3 creates `formatDate()` in `src/lib/utils.ts`
  # Story 11 creates `formatTimestamp()` doing same thing
  # Story 18 creates `dateFormatter()` again
  ├─ Symptom: Three functions, same logic, different bugs
  ├─ Root: AI doesn't search codebase before creating utils
  ├─ Audit: Run `grep -r "toLocaleString\|format.*Date" src/lib/`
  └─ Fix: Consolidate to ONE function, update all callers
```

**Why this kills projects**: Each story adds code, no one subtracts. Codebase bloats **30% per epic**.

***

## **🟡 LEVEL 3: PROP/ARG NAMING INCONSISTENCY** *(The Integration Hell)*

```yaml
☐ Inconsistent ID Naming:
  # Story 2: <AgentCard agentId={...} />
  # Story 8: <AgentSettings id={...} />
  # Story 12: <AgentToolbar agentUUID={...} />
  ├─ Symptom: Refactors break, hard to trace data flow
  ├─ Root: No naming convention enforced
  ├─ Audit: Search for `agentId`, `id`, `agentUUID` → Standardize
  └─ Fix: Enforce `agentId` everywhere (grep + rename)

☐ Boolean Prop Ambiguity:
  # Story 5: <FileTree showHidden={true} />
  # Story 9: <FileTree includeHidden={true} />
  # Story 14: <FileTree hideHidden={false} /> (inverted logic!)
  ├─ Symptom: Component behavior unpredictable
  ├─ Root: AI doesn't check existing props before adding
  ├─ Audit: Check all <FileTree /> usages → Unify prop name
  └─ Fix: Pick ONE name (`showHidden`), delete others

☐ Event Handler Naming Chaos:
  # Story 3: onClick={handleSave}
  # Story 7: onClick={onSaveClick}
  # Story 11: onClick={saveHandler}
  ├─ Symptom: Hard to search, inconsistent patterns
  ├─ Root: No linter rule for handler naming
  ├─ Convention: `handle{Event}` for internal, `on{Event}` for props
  └─ Audit: Enforce via ESLint rule or manual review

☐ API Response Shape Drift:
  # Story 4: API returns { data: { files: [...] } }
  # Story 10: Refactor to { files: [...] } (unwrapped)
  # Story 15: Component still expects `response.data.files`
  ├─ Symptom: Runtime error: "Cannot read files of undefined"
  ├─ Root: Response shape changes without updating consumers
  ├─ Test: Mock API response → Verify ALL consumers handle new shape
  └─ Fix: Add Zod schema validation at API boundary
```

**Why this kills projects**: Every integration requires **archaeology** to find correct prop names.

***

## **🟢 LEVEL 4: SPAGHETTI DEPENDENCIES** *(The Circular Import Trap)*

```yaml
☐ Circular Import Deadlock:
  # Story 6: src/lib/agent/tools.ts imports from executor.ts
  # Story 12: executor.ts imports from tools.ts (NEW)
  ├─ Symptom: "Cannot access before initialization" runtime error
  ├─ Root: Bi-directional imports without factory pattern
  ├─ Test: Run build → Check for circular dependency warnings
  └─ Fix: Extract shared types to `types.ts`, import only types

☐ Deep Import Path Coupling:
  # Story 5: import { Agent } from '@/lib/agent/models/Agent'
  # Story 13: Refactor moves Agent → '@/lib/agent/Agent'
  # Story 20: 15 files still use old path
  ├─ Symptom: Module resolution errors after refactor
  ├─ Root: No barrel exports (index.ts)
  ├─ Prevention: ALWAYS export via index.ts
  └─ Audit: `grep -r "from '@/lib/agent/models" src/`

☐ Component Over-Coupling:
  # Story 8: <ChatPanel /> directly imports useAgentChat()
  # Story 10: <AgentToolbar /> also imports useAgentChat()
  # Story 15: Hook signature changes → Both break
  ├─ Symptom: Changing one hook breaks multiple components
  ├─ Root: No adapter layer between state and UI
  ├─ Fix: Create `useChatAdapter()` wrapping useAgentChat
  └─ Pattern: UI imports adapter, adapter imports hook

☐ Zustand Store Cross-Imports:
  # Story 7: useIDEStore reads from useAgentsStore
  # Story 11: useAgentsStore reads from useIDEStore
  ├─ Symptom: Infinite re-render loop
  ├─ Root: Stores subscribing to each other
  ├─ Test: Open panel → Check React DevTools for loop warnings
  └─ Fix: Extract shared state to useWorkspaceContext()
```

**Why this kills projects**: Refactoring becomes **impossible** without breaking 10+ files.

***

## **🔵 LEVEL 5: INTEGRATION ASSUMPTIONS** *(The "It Works Locally" Bug)*

```yaml
☐ FSA Handle Expiration Ignorance:
  # Story 3: Implement FSA file save
  # Story 10: Add auto-save every 5 seconds
  # Story 15: User closes browser → Handle expires → Auto-save crashes
  ├─ Symptom: "InvalidStateError: Handle is closed"
  ├─ Root: No handle.queryPermission() check before write
  ├─ Test: Close browser → Reopen → Trigger save → Should re-prompt
  └─ Fix: Wrap ALL FSA writes in permission check

☐ WebContainer Boot State Race:
  # Story 4: Initialize WebContainer in useEffect
  # Story 9: Component tries to read WC file BEFORE boot completes
  ├─ Symptom: "WebContainer not ready" error
  ├─ Root: No `wcStatus === 'ready'` guard
  ├─ Test: Hard refresh → Check if tool calls wait for boot
  └─ Fix: Add `useWaitForWebContainer()` hook wrapper

☐ IndexedDB Quota Silent Failure:
  # Story 6: Persist chat history to IndexedDB
  # Story 12: Add 100-message conversation → Quota exceeded
  # Story 18: No error shown, data silently not saved
  ├─ Symptom: User thinks data is saved, but it's lost
  ├─ Root: No try/catch on db.messages.add()
  ├─ Test: Fill 500MB IndexedDB → Trigger save → Check error UI
  └─ Fix: Show toast "Storage full. Clear old conversations?"

☐ API Key Missing in Production:
  # Story 2: Hardcode test API key in .env.local (dev)
  # Story 20: Deploy to production → No key configured
  ├─ Symptom: Agent always returns 401 Unauthorized
  ├─ Root: Key exists locally, but not in Cloudflare secrets
  ├─ Test: Deploy to staging → Try agent → Verify works
  └─ Fix: Validate env vars at build time (throw if missing)
```

**Why this kills projects**: Works on **dev machine**, fails in **production** or **second session**.

***

## **⚫ LEVEL 6: ARCHITECTURE DRIFT** *(The Slow Collapse)*

```yaml
☐ Bypass Pattern Violations:
  # Architecture says: "Components → Zustand → Dexie"
  # Story 14: Component directly writes to IndexedDB (shortcut)
  ├─ Symptom: State out of sync between Zustand and Dexie
  ├─ Root: AI finds "faster" solution without reading arch doc
  ├─ Audit: Search for `db.` in components → Should ONLY be in stores
  └─ Fix: Move db calls to store actions, update component

☐ Tool Approval Bypass:
  # Architecture says: "writeFile requires user approval"
  # Story 18: AI adds auto-approve for "small files" (< 1KB)
  ├─ Symptom: Security model silently weakened
  ├─ Root: Convenience trumps consistency
  ├─ Test: Agent writes file → No approval shown → RED FLAG
  └─ Fix: Remove bypass, enforce EVERY write needs approval

☐ Layer 3 Context Injection Missing:
  # Architecture defines 5-layer agent system
  # Story 20: Agent gets no workspace context (open files missing)
  ├─ Symptom: Agent asks "what files do you have?" (should know)
  ├─ Root: SystemPromptComposer not called in new chat flow
  ├─ Test: Start chat → Check if agent knows open files without asking
  └─ Fix: Verify composeSystemPrompt() runs on EVERY message

☐ Streaming Buffer Bypass:
  # Architecture says: "Buffer tokens every 50ms"
  # Story 22: New chat panel bypasses buffer for "instant feel"
  ├─ Symptom: UI jank, excessive re-renders (100+ per second)
  ├─ Root: Performance optimization skipped
  ├─ Test: Profile React DevTools → Check render count during stream
  └─ Fix: Re-enable 50ms buffer as designed
```

**Why this kills projects**: Each "small exception" compounds into **architectural chaos**.

***

## **GRANDIOSE DECAY DETECTION PROTOCOL**

### **After Every 3 Stories, Run This Audit:**

```bash
#!/bin/bash
# arch-lint.sh - Run after Stories 3, 6, 9, 12, 15, 18, 21...

echo "🔍 ARCHITECTURE DRIFT AUDIT"

# 1. Check for dual-source state
echo "\n[STATE] Searching for localStorage usage in components..."
grep -r "localStorage\." src/components/ --include="*.tsx" | wc -l
# EXPECTED: 0 (should only be in stores)

# 2. Check for circular imports
echo "\n[IMPORTS] Running Madge circular dependency check..."
pnpm madge --circular src/
# EXPECTED: No circular dependencies

# 3. Check for zombie imports
echo "\n[DEAD CODE] Searching for unused imports..."
pnpm eslint src/ --rule 'no-unused-vars: error'
# EXPECTED: 0 errors

# 4. Check for IndexedDB direct access in components
echo "\n[BOUNDARY] Components should NOT access db directly..."
grep -r "await db\." src/components/ --include="*.tsx" | wc -l
# EXPECTED: 0

# 5. Check for inconsistent prop naming
echo "\n[NAMING] Checking for inconsistent agent ID props..."
grep -rE "(agentId|agentUUID|agent_id)" src/components/ --include="*.tsx" | \
  grep -v "agentId" | wc -l
# EXPECTED: 0 (only agentId should exist)

# 6. Check for permission checks before FSA writes
echo "\n[FSA] Checking if all fileHandle.write() has permission check..."
grep -r "fileHandle\.write" src/ --include="*.ts" -A 5 | \
  grep -L "queryPermission" | wc -l
# EXPECTED: 0

# 7. Check for unguarded WebContainer calls
echo "\n[WC] Checking if WC operations check 'ready' status..."
grep -r "webcontainer\." src/ --include="*.ts" -B 5 | \
  grep -L "wcStatus.*ready" | wc -l
# EXPECTED: 0

echo "\n✅ Audit complete. Fix violations before next story."
```

***

## **CONTEXT-LOSS MITIGATION CHECKLIST**

**When AI starts a new story, FORCE it to:**

```yaml
☐ Read Current State Schema:
  "Before implementing Story X, list ALL Zustand stores and their properties from src/lib/state/*.ts"

☐ Check Existing Utilities:
  "Search src/lib/utils/ for functions similar to what you need before creating new ones"

☐ Verify Naming Conventions:
  "Check last 3 PRs for prop naming patterns (agentId vs id vs uuid)"

☐ Map Integration Points:
  "Which existing components will call this new feature? List their current prop interfaces."

☐ Confirm Boundary Compliance:
  "Does this story write to IndexedDB? If yes, which Zustand store action will handle it?"
```

***

## **THE BRUTAL 3-QUESTION TEST**

**After implementing ANY story, ask:**

1. **Can I delete this feature in 1 command?**
   - If removal requires >5 file changes → **Coupled too tightly**
   - Fix: Extract to isolated module with barrel export

2. **Does this feature work on page refresh?**
   - If state is lost → **Missing persistence**
   - Fix: Add to Zustand persist middleware

3. **Does this feature work offline?**
   - If requires network → **Missing fallback UI**
   - Fix: Add `navigator.onLine` check + error state

***

## **REALISTIC DECAY TIMELINE**

| Story Count | Typical Rot Level | Symptoms |
|-------------|-------------------|----------|
| 0-5 | **Green** | Code clean, patterns consistent |
| 6-10 | **Yellow** | 2-3 duplicate utils, 1 zombie import |
| 11-15 | **Orange** | State split across 2 sources, prop naming inconsistent |
| 16-20 | **Red** | Circular imports appear, architecture bypassed |
| 21+ | **Critical** | Refactors break 10+ files, no one understands state flow |

**At Yellow or above → STOP adding features, run full audit.**

***

**This is the checklist that accounts for:**
- ✅ **Partial context** (AI forgets decisions from Story 3 by Story 15)
- ✅ **Copy-paste mutations** (middleware configs duplicated wrong)
- ✅ **Convenience shortcuts** (bypassing architecture for "quick fix")
- ✅ **Integration assumptions** (works alone, breaks together)
- ✅ **Naming drift** (agentId → id → agentUUID across stories)
- ✅ **Zombie accumulation** (code added but never removed)

**Use this BETWEEN stories, not after Epic completion. By then, it's archaeological excavation.**
# **AI AGENT CRITICAL FAILURE CHECKLIST**
## *Real-World Validation for Complex Browser-Native Architecture (Dec 2025)*

Based on your architecture's multi-layered complexity (WebContainer + FSA + Zustand + Dexie + TanStack AI + Mobile + i18n), here are the **high-level validation gates** where AI agents typically fail:

***

## **🔴 LEVEL 1: CROSS-BOUNDARY WIRING** *(Most Critical)*

```yaml
☐ State Flow Validation (End-to-End):
  User Action → Zustand Mutation → Dexie Persist → IndexedDB Confirm
  ├─ NO stale UI after mutation (hot-reload bug BF-01)
  ├─ NO optimistic update without rollback (atomic update BF-02)
  ├─ NO localStorage as truth source (Zustand = single source)
  └─ Verify: Change agent name → Navigate away → Return → Name persists

☐ File Sync Pipeline (Dual-Write):
  Monaco Edit → Zustand setActiveFileContent → SyncManager
  ├─ Local FS write completes (FSA API)
  ├─ WebContainer FS write completes (parallel, not sequential)
  ├─ SHA-256 verification (conflict detection)
  └─ Verify: Edit in Monaco → Open same file in VS Code → Content matches immediately

☐ Agent Tool Execution Chain:
  Chat Input → TanStack AI → Tool Call JSON → Tool Registry → Facade → Execution
  ├─ Tool approval overlay shows BEFORE execution (not after)
  ├─ Tool result returns to agent context (not dropped)
  ├─ Audit log writes to Dexie (ToolAuditLog table)
  └─ Verify: Ask agent "read package.json" → See approval → Content quoted in response

☐ Permission Lifecycle (FSA):
  Grant → Use → Expire (browser close) → Re-grant → Resume
  ├─ Handle state: NotGranted, Prompting, Granted, Denied, Expired
  ├─ UI matches state (not hardcoded "Open Project" button)
  ├─ Re-grant triggers FULL session restore (not partial)
  └─ Verify: Grant → Close browser → Reopen → Click "Restore Access" → Files reload
```

**Why AI fails here**: Assumes each layer works in isolation. Doesn't test **handoffs** between layers.

***

## **🟠 LEVEL 2: MOBILE CONSTRAINTS** *(Reality Check)*

```yaml
☐ SharedArrayBuffer Detection:
  ├─ Runtime check: crossOriginIsolated === true
  ├─ If false on mobile → Show "Desktop Required" modal (not blank page)
  ├─ Demo Mode activates: Chat works, Editor read-only, Terminal hidden
  └─ Verify: Open on iPhone → Modal explains limitation → Chat still works

☐ Touch Targets (Accessibility):
  ├─ ALL buttons: min 44×44px (not 32×32px)
  ├─ Panel resize handles: 10px invisible hit zone
  ├─ File tree items: 40px height (not 24px)
  └─ Verify: Test on real phone (not just DevTools mobile view)

☐ Viewport Breakpoints (Tailwind):
  ├─ Mobile <640px: Sidebar hidden, single-panel stack
  ├─ Tablet 640-1024px: Sidebar icon-only, 2-column layout
  ├─ Desktop ≥1024px: Full 3-panel resizable layout
  └─ Verify: Resize browser window → Layout adapts WITHOUT page reload

☐ Offline Storage Limits (IndexedDB):
  ├─ Quota check at 80% usage (show warning banner)
  ├─ Auto-prune old conversations (FIFO, keep last 50)
  ├─ Export/Import for large datasets (>500MB)
  └─ Verify: Fill 500MB IndexedDB → Warning appears → Prune works
```

**Why AI fails here**: Assumes mobile = "small desktop". Ignores **hardware limits** (no SharedArrayBuffer, storage quotas).

***

## **🟡 LEVEL 3: LOCALIZATION WIRING** *(i18n Edge Cases)*

```yaml
☐ i18n Completeness (Vietnamese + English):
  ├─ NO hardcoded strings in JSX (all use t("key"))
  ├─ Error messages translated (en.json + vi.json)
  ├─ Pluralization works: t("file.count", { count: 5 })
  ├─ Date/time formatting: locale-aware (not en-US hardcoded)
  └─ Verify: Toggle language → ALL text changes (no English leaks)

☐ Context-Specific Tone (Vietnamese):
  ├─ Student mode: "Bạn" (friendly)
  ├─ Teacher mode: "Thầy/Cô" (respectful)
  ├─ Dev mode: Technical, concise (no fluff)
  └─ Verify: Agent responds in correct tone based on user profile

☐ Fallback Handling:
  ├─ Missing key → Fallback to English (not "[key]" string)
  ├─ Browser language detection → Set initial locale
  ├─ Persist language choice to localStorage
  └─ Verify: Delete vi.json key → Still shows English, not broken
```

**Why AI fails here**: Forgets to extract new keys. Uses hardcoded strings in error paths.

***

## **🟢 LEVEL 4: INTEGRATION CONFLICTS** *(The "It Works Alone" Trap)*

```yaml
☐ Multi-Provider API Race Conditions:
  ├─ Two agents (OpenRouter + Gemini) send requests simultaneously
  ├─ Shared loading state (useAgentsStore) prevents double-spinner
  ├─ Rate limit handling: retry with exponential backoff
  └─ Verify: Send 2 messages to different agents → Both respond, no crash

☐ WebContainer + Monaco Editor Coordination:
  ├─ Monaco edit triggers WC file write (not reverse)
  ├─ WC npm install doesn't trigger Monaco re-render
  ├─ Preview iframe (localhost:3000) updates on save
  └─ Verify: Edit component → Save → Preview refreshes in <2s

☐ Zustand + Dexie Middleware Sync:
  ├─ Zustand mutation → Dexie persist (within 100ms)
  ├─ Dexie restore → Zustand hydration (on page load)
  ├─ Zod validation runs BEFORE hydration (catches corrupt data)
  └─ Verify: Mutate state → Kill tab → Reopen → State restored
```

**Why AI fails here**: Tests each system in isolation. Never tests **simultaneous operations**.

***

## **🔵 LEVEL 5: PERFORMANCE UNDER LOAD** *(Real-World Stress)*

```yaml
☐ Large Project Handling (100+ files):
  ├─ WebContainer boot: <5s (not 20s timeout)
  ├─ File tree renders with virtualization (not full DOM)
  ├─ File save latency: <500ms (not 2s)
  └─ Verify: Open 300-file React project → Boot succeeds → Save instant

☐ Long Conversation History (50+ messages):
  ├─ IndexedDB query: <100ms (indexed by threadId)
  ├─ Scroll performance: 60fps (virtualized message list)
  ├─ Chat export: <5s for 1000 messages
  └─ Verify: Load 100-message thread → Scroll smooth, no jank

☐ Network Interruption Recovery:
  ├─ Agent streaming stops → Toast: "Connection lost. Retry?"
  ├─ File save during offline → Queue in SyncManager, retry on reconnect
  ├─ WebContainer crash → Auto-restart (max 3 attempts)
  └─ Verify: Disconnect WiFi mid-save → Reconnect → Sync completes
```

**Why AI fails here**: Tests with toy data (5 files, 3 messages). Never simulates **production scale**.

***

## **⚫ LEVEL 6: SECURITY + PRIVACY VALIDATION** *(Zero Trust)*

```yaml
☐ API Key Encryption:
  ├─ Keys stored in IndexedDB as AES-256-GCM (not plaintext)
  ├─ Master key in localStorage (PIN-derived in Phase 2)
  ├─ NO keys in console.log, network tab, or error messages
  └─ Verify: Inspect Network tab → No Authorization header with raw key

☐ File Content Privacy:
  ├─ NO file content sent to non-LLM endpoints (no analytics server)
  ├─ Only chat messages + tool args sent to OpenAI/Anthropic
  ├─ Local FS files NEVER uploaded (FSA handles stay local)
  └─ Verify: Network monitor → Only AI provider endpoints receive data

☐ COOP/COEP Headers (SharedArrayBuffer):
  ├─ Dev server (Vite): securityHeadersPlugin sets headers
  ├─ Production (Cloudflare): security-headers.ts middleware
  ├─ Fallback: If headers missing → Show "Browser Not Supported" error
  └─ Verify: Open DevTools → Check response headers → COEP: require-corp
```

**Why AI fails here**: Focuses on feature logic. Forgets **data flow audits**.

***

## **GRANDIOSE META-CHECKLIST** *(The One Check to Rule Them All)*

```yaml
☐ THE PHONE TEST:
  1. Open app on real iPhone (not simulator)
  2. See demo mode banner (not blank screen)
  3. Chat with agent about code (works)
  4. Try to edit code (gracefully blocked with explanation)
  5. Toggle to Vietnamese → All text changes
  6. Close browser → Reopen → Chat history restored
  ✅ If ALL 6 pass → Mobile story is DONE

☐ THE DEVELOPER TEST:
  1. Open 300-file React project from local disk
  2. WebContainer boots in <10s (red flag at 10s+)
  3. Edit App.tsx in Monaco → Verify in VS Code immediately
  4. Ask agent: "Add a logout button" → See diff → Approve → Code written
  5. Reload browser → Exact same state (tabs, scroll, cursor position)
  6. Network goes offline → Save queues → Reconnect → Sync completes
  ✅ If ALL 6 pass → Desktop story is DONE

☐ THE STUDENT TEST (Phase 2):
  1. Upload 3 PDFs (50 pages total)
  2. Parsing completes in <60s
  3. Ask: "Compare views on [topic]" → Response has [1][2] citations
  4. Tap [1] → PDF viewer jumps to exact paragraph
  5. Generate flashcards → Review 10 cards → Mark "Know"
  6. Close app on phone → Reopen next day → Progress saved
  ✅ If ALL 6 pass → Knowledge Synthesis MVP is DONE
```

***

## **AI AGENT RED FLAGS** 🚩

**When AI-generated code claims "Done" but:**

1. **No cross-layer E2E test** → Layers work alone, fail together
2. **No mobile device test** → Works in DevTools, fails on iPhone
3. **No i18n key extraction** → English hardcoded in error paths
4. **No performance profiling** → Works with 5 files, crashes with 500
5. **No network disconnect test** → Assumes always-online
6. **No IndexedDB quota test** → Assumes infinite storage
7. **No FSA permission expiry test** → Assumes handles never expire
8. **No SharedArrayBuffer check** → Assumes all browsers support it

***

## **FINAL VALIDATION: THE 3-DEVICE RULE**

```bash
# MUST pass on ALL three:
1. Desktop Chrome (macOS/Windows) - Full IDE mode
2. Mobile Safari (iOS 16+)         - Demo mode, chat-only
3. Android Chrome (mid-range)      - Demo mode, offline storage test

# If ANY device fails → Story is NOT done
```

***

**This is the difference between "spec-compliant" and "actually works in December 2025 on real hardware with real users."**

Your AI agents can write perfect TypeScript. But they'll miss:
- The FSA handle that expired because the user's browser auto-updated overnight
- The IndexedDB quota that fills up on Android devices with 32GB storage
- The Vietnamese pluralization rule that breaks on numbers ending in 1
- The WebContainer that boots fine with 50 files but times out with 500
- The mobile Safari that has FSA API but doesn't support COEP headers

**Use this checklist as the ACTUAL definition of done—not the wordy specification, but the brutal reality check.**
