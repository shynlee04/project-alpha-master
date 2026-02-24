# NeuralNote: BMAD v6 Governance Framework
## Roles, Responsibilities & Validation Standards

**Document Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-01-02  
**Framework:** BMAD v6 Mobile-Adapted  

---

## Table of Contents

1. [Team Structure & Roles](#1-team-structure--roles)
2. [The 12-Level Sweeping Validation Framework](#2-the-12-level-sweeping-validation-framework)
3. [Code Ownership & Module Accountability](#3-code-ownership--module-accountability)
4. [Decision-Making & Approvals](#4-decision-making--approvals)
5. [Workflow & Integration Ceremony](#5-workflow--integration-ceremony)

---

## 1. Team Structure & Roles

### 1.1 Core Team Personas

#### @pmOrchestrator (Product Manager)
**description:** Vision, prioritization, user story acceptance.  
**Authority:** PRD ownership, scope decisions, story grooming.

**Responsibilities:**
- [ ] Own and evolve `PRD.md`; ensure user stories map to acceptance criteria.
- [ ] Prioritize backlog; decide Epic sequencing.
- [ ] Review completed stories against AC before marking DONE.
- [ ] Facilitate stakeholder communication.
- [ ] Track OKRs and product metrics.

**Escalation Path:** If architecture blocks a user story → discuss with @architectAgent.

---

#### @architectAgent (Systems Architect)
**description:** Technical integrity, performance, security, API contracts.  
**Authority:** Architecture decisions, module boundaries, schema approvals.

**Responsibilities:**
- [ ] Own `architecture.md` and `schema.sql`.
- [ ] Review PRs for layer violations (UI calling DB, Services using React, etc.).
- [ ] Approve major refactorings; minimize breaking changes.
- [ ] Profile and optimize hot paths (vector search, LLM inference).
- [ ] Conduct security audit (encryption, key storage, permissions).
- [ ] Level 1, 4, 6, 10 validation: State, Dependencies, Architecture, Security.

**Escalation Path:** If performance target unachievable → flag to @pmOrchestrator.

---

#### @mobileDevAgent (Mobile Developer)
**description:** UI, UX, application logic implementation.  
**Authority:** Component design, feature implementation, code quality.

**Responsibilities:**
- [ ] Implement user-facing features (Editor, Database UI, Canvas, Chat).
- [ ] Write Tamagui/React Native components; enforce <150-line limit.
- [ ] Implement Services (BlockService, DatabaseService, etc.).
- [ ] Write Jest unit tests for all logic; maintain >80% coverage.
- [ ] Level 2, 3, 8 validation: Hygiene, Naming, i18n.

**Escalation Path:** If component too complex → discuss module split with @architectAgent.

---

#### @nativeModuleAgent (Native/JSI Specialist)
**description:** Bridge to native (C++), performance-critical code.  
**Authority:** JSI bindings, native module integration, database tuning.

**Responsibilities:**
- [ ] Own native module integrations: op-sqlite, sqlite-vec, MediaPipe, ExecuTorch.
- [ ] Zero "Bridge" serialization overhead; profile JSI calls.
- [ ] Implement Worklets for GPU-accelerated rendering (Graph, Canvas).
- [ ] Database schema & query optimization; VACUUM, ANALYZE.
- [ ] Memory profiling; ensure LLM doesn't OOM on 4GB phones.
- [ ] Level 5, 9 validation: Integration, Performance.

**Escalation Path:** If model too large for target device → propose quantization strategy.

---

#### @qaAutomationAgent (QA & Test Automation)
**description:** Quality gates, test coverage, performance measurement.  
**Authority:** Test strategy, validation checklist, CI/CD pipeline.

**Responsibilities:**
- [ ] Write Maestro E2E flows for all user journeys.
- [ ] Maintain Jest test suite; enforce >80% coverage.
- [ ] Run `scripts/validate.sh` before each PR merge.
- [ ] Benchmark performance: startup time, search latency, memory.
- [ ] Visual regression testing (compare screenshots across devices).
- [ ] Level 7, 12 validation: Mobile UX, Testing.

**Escalation Path:** If test flaky → flag to @mobileDevAgent.

---

### 1.2 Collaboration Patterns

**Weekly Sync:** 30 min standup
- @pmOrchestrator: Story grooming, blockers
- @architectAgent: Technical decisions, review backlog
- @mobileDevAgent: Progress, impediments
- @nativeModuleAgent: Performance, integration
- @qaAutomationAgent: Test coverage, automation

**PR Review Protocol:**
1. @mobileDevAgent pushes PR.
2. @architectAgent reviews for L1, L4, L6, L10.
3. @nativeModuleAgent reviews if touches native code (L5, L9).
4. @qaAutomationAgent reviews for L7, L12.
5. @pmOrchestrator verifies AC before merge.

---

## 2. The 12-Level Sweeping Validation Framework

### 2.1 Overview

Every code review, before every merge, the code passes all 12 levels. Each level has a **Validator** (see table below) and a **Linter/Automation** if applicable.

| Level | Domain | Validator | Automation |
|-------|--------|-----------|-----------|
| **1** | State Integrity | @architectAgent | ESLint, Zustand patterns |
| **2** | Code Hygiene | @mobileDevAgent | ESLint, file size linter |
| **3** | Naming & Types | @mobileDevAgent | TypeScript compiler |
| **4** | Dependency Integrity | @architectAgent | ESLint no-cycle |
| **5** | Integration & Permissions | @nativeModuleAgent | Manual audit |
| **6** | Architecture | @architectAgent | Manual code review |
| **7** | Mobile UX | @qaAutomationAgent | Device testing + Maestro |
| **8** | i18n | @mobileDevAgent | i18next config audit |
| **9** | Performance | @nativeModuleAgent | Profiling, benchmarks |
| **10** | Security | @architectAgent | Keystore audit, encryption |
| **11** | Docs | @pmOrchestrator | README, AGENTS.md, KDoc |
| **12** | Testing | @qaAutomationAgent | Jest coverage, Maestro flows |

---

### 2.2 Level Definitions & Acceptance Criteria

#### **Level 1: State Integrity**
*Ensure single source of truth; prevent state fragmentation and race conditions.*

**Rule Set:**
- [ ] **All persistent state in Zustand stores** (not useState for user data).
- [ ] **MMKV for sync persistence** (not AsyncStorage, not SharedPreferences directly).
- [ ] **No prop drilling >2 levels** (use Zustand selector instead).
- [ ] **No duplicated state** (e.g., don't store user's notes in both Redux and local state).
- [ ] **Optimistic updates:** UI updates before DB; rollback on error.

**Linter Check:**
```bash
# ESLint rule: forbid useState for persistence
eslint --rule "no-restricted-syntax: ['error', { selector: ..., message: 'Use Zustand for persistent state' }]" src/
```

**Example (FAIL):**
```typescript
// ❌ State fragmented
function Editor() {
  const [blocks, setBlocks] = useState([]);  // Local state
  const zustandBlocks = useStore(s => s.blocks);  // Zustand state
  // Two sources of truth → inconsistency risk
}
```

**Example (PASS):**
```typescript
// ✅ Single source of truth
function Editor() {
  const blocks = useStore(s => s.blocks);  // Zustand only
  const updateBlock = useStore(s => s.updateBlock);
  // Optimistic: update local store, sync to DB in background
}
```

**Reviewer:** @architectAgent  
**Automation:** ESLint rule

---

#### **Level 2: Code Hygiene & Complexity**
*Ensure readability, maintainability, avoid god functions/classes.*

**Rule Set:**
- [ ] **Composables <150 lines** (excluding imports, type defs).
- [ ] **Classes <300 lines**.
- [ ] **Functions <50 lines** (single responsibility principle).
- [ ] **No console.log in production** (use structured logging to MMKV).
- [ ] **No magic numbers** (constants defined, named).
- [ ] **Consistent indentation** (2 spaces, enforced by Prettier).

**Linter Check:**
```bash
# Prettier + Custom linter
npx prettier --check src/
npx eslint --rule "max-lines: ['error', { max: 150, skipBlankLines: true, skipComments: true }]" src/components/
```

**Reviewer:** @mobileDevAgent  
**Automation:** Prettier, eslint-plugin-max-lines

---

#### **Level 3: Naming & Type Safety**
*Ensure explicit typing, consistent naming, no implicit `any`.*

**Rule Set:**
- [ ] **Strict TypeScript** (`strict: true` in tsconfig.json).
- [ ] **No `any` types** (use `unknown` with type guards if needed).
- [ ] **Consistent naming:** `blockId` (not `bid`, `block_id`, `Block_ID`).
  - Properties: camelCase (`userId`, `createdAt`)
  - Types/Interfaces: PascalCase (`User`, `CreateBlockRequest`)
  - Constants: UPPER_SNAKE_CASE (`MAX_BLOCKS`, `DEFAULT_TIMEOUT`)
  - Files: kebab-case (`block-editor.tsx`, `user-service.ts`)
- [ ] **Enums for magic strings** (not `if (type === "page")`; use `enum BlockType`).
- [ ] **Interfaces for public APIs** (Services, Hooks).

**Linter Check:**
```bash
npx tsc --noEmit --strict --noImplicitAny
npx eslint --rule "@typescript-eslint/no-explicit-any: 'error'" src/
```

**Example (FAIL):**
```typescript
// ❌ Implicit any
function getUser(id: any): any {
  return db.findById(id);
}

// ❌ Inconsistent naming
const userId = 123;
const user_name = "Alice";
```

**Example (PASS):**
```typescript
// ✅ Explicit types
function getUser(id: string): Promise<User> {
  return db.findById(id);
}

// ✅ Consistent naming
const userId = "123";
const userName = "Alice";

// ✅ Enum instead of magic string
enum BlockType {
  PAGE = "page",
  HEADING = "heading",
  PARAGRAPH = "paragraph"
}
```

**Reviewer:** @mobileDevAgent + TypeScript compiler  
**Automation:** TypeScript compiler, ESLint rules

---

#### **Level 4: Dependency Integrity**
*No circular dependencies; clear module boundaries; easy imports.*

**Rule Set:**
- [ ] **No circular imports** (A → B → A).
- [ ] **Imports scoped to module** (use barrel exports).
  - ✅ `import { blockService } from '@/services'`
  - ❌ `import { blockService } from '../../../services/index.ts'`
- [ ] **Peer dependencies explicit** (declared in package.json).
- [ ] **No cross-module state access** (go through services).

**Linter Check:**
```bash
npx eslint-plugin-import --rule "import/no-cycle: 'error'" src/
npx depcheck  # Check for unused deps
```

**Example (FAIL):**
```typescript
// ❌ Circular
// blockService.ts
import { uiStore } from './ui.store';  // ← Service knows about UI state
export const blockService = { ... };

// ui.store.ts
import { blockService } from './block.service';  // ← UI state knows about services
export const uiStore = { ... };
```

**Example (PASS):**
```typescript
// ✅ Unidirectional
// blockService.ts (pure, no dependencies on stores)
export const blockService = { ... };

// ui.store.ts (depends on service)
import { blockService } from '@/services';
export const uiStore = create((set) => ({
  updateBlock: (id, content) => blockService.update(id, content)
}));
```

**Reviewer:** @architectAgent  
**Automation:** ESLint plugin-import

---

#### **Level 5: Integration & Permissions**
*Ensure graceful permission handling, no silent failures.*

**Rule Set:**
- [ ] **All OS permissions gated** before use.
  - Camera: `PermissionsAndroid.check(CAMERA)` before access.
  - FileSystem: Scoped Storage (Android 10+) or SAF.
  - Mic: `PermissionsAndroid.check(RECORD_AUDIO)` before recording.
- [ ] **Graceful degradation** (app works if optional permission denied).
- [ ] **No access to /system or /data** (app-scoped directories only).
- [ ] **Intent validation** (don't blindly open URLs).

**Linter Check:** Manual audit.

**Example (FAIL):**
```typescript
// ❌ No permission check
const takePicture = async () => {
  const photo = await Camera.takePicture();  // Crash if Camera permission denied
};
```

**Example (PASS):**
```typescript
// ✅ Permission gated
const takePicture = async () => {
  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.CAMERA
  );
  if (!hasPermission) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      showError("Camera permission required");
      return;
    }
  }
  const photo = await Camera.takePicture();
};
```

**Reviewer:** @nativeModuleAgent  
**Automation:** Manual

---

#### **Level 6: Architecture & Layer Boundaries**
*Ensure clean separation: UI ↔ Stores ↔ Services ↔ DB.*

**Rule Set:**
- [ ] **No database calls in Composables** (use Hooks/Services).
- [ ] **No UI code in Services** (Services = pure logic, no React/Tamagui imports).
- [ ] **Unidirectional data flow:** UI → Store → Service → DB.
- [ ] **Error handling at service layer** (Composables don't throw/catch).
- [ ] **Services return Promise<T>** (async operations explicit).

**Example (FAIL):**
```typescript
// ❌ DB call in Composable
function BlockList() {
  const [blocks, setBlocks] = useState([]);
  
  useEffect(() => {
    // Direct DB call in component
    const result = db.execute("SELECT * FROM blocks");
    setBlocks(result);
  }, []);
  
  return <FlatList data={blocks} ... />;
}

// ❌ UI code in Service
export const blockService = {
  async updateBlock(id, content) {
    const result = await db.update(id, content);
    // Service shouldn't touch UI
    Toast.show("Block updated!");  // ❌ NO UI library calls
    return result;
  }
};
```

**Example (PASS):**
```typescript
// ✅ Service layer
export const blockService = {
  async updateBlock(id: string, content: string): Promise<Block> {
    const result = await db.execute(
      "UPDATE blocks SET content = ? WHERE id = ?",
      [content, id]
    );
    return result;  // Return data only
  }
};

// ✅ Store bridges
const editorStore = create(set => ({
  updateBlock: async (id, content) => {
    const updated = await blockService.updateBlock(id, content);
    set({ currentBlock: updated });
  }
}));

// ✅ Composable uses store
function BlockEditor() {
  const currentBlock = useStore(s => s.currentBlock);
  const updateBlock = useStore(s => s.updateBlock);
  
  const handleSave = () => {
    updateBlock(currentBlock.id, editingText)
      .then(() => showNotification("Saved!"))
      .catch(err => showError(err.message));
  };
  
  return <TextInput onBlur={handleSave} ... />;
}
```

**Reviewer:** @architectAgent  
**Automation:** ESLint import restrictions

---

#### **Level 7: Mobile UX & Responsiveness**
*Ensure accessible, responsive design; smooth interactions.*

**Rule Set:**
- [ ] **Touch targets ≥48dp** (checked in Tamagui theme).
- [ ] **Dark mode supported** (text ≥4.5:1 contrast).
- [ ] **Safe Area respected** (notches, home bar, status bar).
- [ ] **IME handling** (keyboard doesn't hide inputs; `keyboardShouldPersistTaps`).
- [ ] **No janky scrolling** (use FlashList, not FlatList).
- [ ] **Rotations handled** (portrait & landscape layouts).

**Linter Check:** Device testing + Maestro visual checks.

**Example (PASS):**
```typescript
// ✅ Accessible button
<Button size="lg" minHeight={48} minWidth={48}>
  Save
</Button>

// ✅ Dark mode
const colors = {
  light: { text: '#000000', bg: '#FFFFFF' },
  dark: { text: '#FFFFFF', bg: '#1A1A1A' }
};
const isDark = useColorScheme() === 'dark';
const { text, bg } = colors[isDark ? 'dark' : 'light'];

// ✅ Safe area
<SafeAreaView>
  <View>Content here</View>
</SafeAreaView>

// ✅ FlashList for performance
import { FlashList } from "@shopify/flash-list";
<FlashList data={blocks} renderItem={...} estimatedItemSize={100} />
```

**Reviewer:** @qaAutomationAgent  
**Automation:** Maestro flows, device screenshots

---

#### **Level 8: Internationalization (i18n)**
*No hardcoded strings; support multiple languages.*

**Rule Set:**
- [ ] **All user-facing strings via `i18n.t()`**.
- [ ] **Pluralization supported** ("1 note" vs "5 notes").
- [ ] **Date/number formatting locale-aware**.
- [ ] **Config language files** (en.json, vi.json, etc.).
- [ ] **No hardcoded dates** (use `new Intl.DateTimeFormat()`).

**Linter Check:**
```bash
npx i18next-scanner  # Find hardcoded strings
```

**Example (FAIL):**
```typescript
// ❌ Hardcoded string
<Text>Welcome to NeuralNote</Text>
<Text>{blockCount} blocks</Text>

// ❌ Hardcoded date
<Text>{new Date().toLocaleDateString()}</Text>  // Only works for user's device locale
```

**Example (PASS):**
```typescript
// ✅ Via i18n
import i18n from '@/i18n';

<Text>{i18n.t('welcome.title')}</Text>
<Text>{i18n.t('blocks.count', { count: blockCount })}</Text>

// ✅ With formatter
const dateFormatter = new Intl.DateTimeFormat(i18n.language, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
<Text>{dateFormatter.format(new Date())}</Text>
```

**Config (en.json):**
```json
{
  "welcome": {
    "title": "Welcome to NeuralNote"
  },
  "blocks": {
    "count": "{{count}} block",
    "count_plural": "{{count}} blocks"
  }
}
```

**Reviewer:** @mobileDevAgent  
**Automation:** i18next-scanner

---

#### **Level 9: Performance & Efficiency**
*Ensure smooth UX; target <1.2s startup, 60fps scrolling.*

**Rule Set:**
- [ ] **Startup <1.2s** (cold launch; measure with `am start -W`).
- [ ] **Scrolling 60fps** (use FlashList, memoization).
- [ ] **Inference TTFT <1.5s** (Time To First Token).
- [ ] **Search <500ms** (10k blocks).
- [ ] **No full re-renders on list scroll**.
- [ ] **Memory <150MB idle** (no memory leaks).

**Benchmarking Script:**
```bash
#!/bin/bash
# scripts/benchmark.sh

echo "📊 Startup Time"
adb shell am start -W com.neuralnote/.MainActivity | grep "Total time"

echo "📊 Memory"
adb shell dumpsys meminfo com.neuralnote | head -20

echo "📊 Search Latency (10k blocks)"
time npm run test:performance -- --search

echo "📊 Inference Latency"
time npm run test:performance -- --inference
```

**Reviewer:** @nativeModuleAgent  
**Automation:** Benchmark script in CI

---

#### **Level 10: Security & Data Protection**
*Encrypt data at rest; no sensitive data in logs.*

**Rule Set:**
- [ ] **Encryption at rest:** AES-256-GCM for all user data.
- [ ] **Keystore:** Keys stored in Android Keystore (hardware-backed if available).
- [ ] **No sensitive data in logs** (no passwords, API keys, personal info).
- [ ] **External intents validated** (don't open untrusted URLs).
- [ ] **No crash reporting** (log locally only).
- [ ] **SQLCipher or equivalent** for database encryption.

**Example (PASS):**
```typescript
// ✅ Encryption
const encryptedContent = await encryptionService.encrypt(
  JSON.stringify(block.content)
);
db.execute("UPDATE blocks SET content = ? WHERE id = ?", [encryptedContent, id]);

// ✅ No sensitive logs
// ❌ logger.info(`API Key: ${apiKey}`);
logger.info("API request started");  // Safe

// ✅ Intent validation
const openUrl = (url: string) => {
  const parsed = new URL(url);  // Throw if invalid
  if (!['http', 'https'].includes(parsed.protocol)) {
    throw new Error("Unsafe URL");
  }
  Linking.openURL(url);
};
```

**Reviewer:** @architectAgent  
**Automation:** Manual audit

---

#### **Level 11: Documentation & Onboarding**
*README explains architecture, KDoc on APIs.*

**Rule Set:**
- [ ] **README.md** explains project, tech stack, setup, running tests.
- [ ] **AGENTS.md** (this file) defines roles & responsibilities.
- [ ] **architecture.md** explains design, data model, performance.
- [ ] **KDoc on public APIs** (Services, Hooks, major Composables).
- [ ] **Algorithm documentation** (chunking, force layout, etc.).

**Example (KDoc):**
```typescript
/**
 * Generates a semantic brief from a set of notes.
 * 
 * @param blockIds - IDs of blocks to synthesize
 * @param options - Generation options (max tokens, temperature)
 * @returns Promise<Brief> - Generated brief with citations
 * @throws {Error} If blocks not found or model loading fails
 * 
 * @example
 * const brief = await synthesisService.generateBrief(['block-1', 'block-2']);
 * console.log(brief.content);  // "..."
 */
export async function generateBrief(
  blockIds: string[],
  options?: GenerationOptions
): Promise<Brief> {
  // implementation
}
```

**Reviewer:** @pmOrchestrator  
**Automation:** Typedoc for KDoc generation

---

#### **Level 12: Testing & Coverage**
*>80% unit test coverage; E2E flows for user journeys.*

**Rule Set:**
- [ ] **Jest unit tests** for Services, utilities, Hooks.
- [ ] **Maestro E2E flows** for: create note, chat, synthesis, export.
- [ ] **Coverage >80%** (critical paths 100%).
- [ ] **No flaky tests** (deterministic, <1s each).
- [ ] **Integration tests** for DB operations.

**Test File Naming:**
- Services: `src/services/__tests__/block.service.test.ts`
- Hooks: `src/hooks/__tests__/useBlockEditor.test.ts`
- Utils: `src/utils/__tests__/validators.test.ts`

**Example (Jest):**
```typescript
// block.service.test.ts
describe('BlockService', () => {
  beforeEach(() => {
    db.reset();  // Clear test DB
  });

  it('should create a block with required fields', async () => {
    const block = await blockService.createBlock('ws-1', null, 'page', {
      text: 'Hello'
    });
    
    expect(block.id).toBeDefined();
    expect(block.content.text).toBe('Hello');
  });

  it('should update a block', async () => {
    const block = await blockService.createBlock(...);
    const updated = await blockService.updateBlock(block.id, {
      text: 'Updated'
    });
    
    expect(updated.content.text).toBe('Updated');
  });
});
```

**Example (Maestro):**
```yaml
# __tests__/maestro/create_note.flow.yaml
appId: com.neuralnote

steps:
  - launchApp
  - tapOn:
      id: "fab-create-note"
  - inputText: "My First Note"
  - tapOn:
      id: "btn-save"
  - assertVisible:
      text: "My First Note"
```

**Reviewer:** @qaAutomationAgent  
**Automation:** Jest runner, Maestro in CI

---

### 2.3 Validation Automation Checklist

Run before every merge:

```bash
#!/bin/bash
# scripts/validate.sh

set -e

echo "🔍 Level 1: State Integrity"
npx eslint --rule "no-restricted-globals: error" src/stores/ src/hooks/

echo "🔍 Level 2-4: Code Quality"
npx prettier --check src/
npx eslint src/
npx tsc --noEmit

echo "🔍 Level 8: i18n"
npx i18next-scanner --config i18next-scanner.config.js

echo "🔍 Level 12: Tests"
npm run test -- --coverage --threshold 80

echo "🔍 Level 9: Performance Check"
npm run build:analyzer

echo "✅ All validations passed!"
```

---

## 3. Code Ownership & Module Accountability

### 3.1 Module Ownership Matrix

| Module | Owner | Co-Owner | Reviewer |
|--------|-------|----------|----------|
| `src/components/editor/` | @mobileDevAgent | - | @architectAgent |
| `src/components/database/` | @mobileDevAgent | - | @architectAgent |
| `src/components/graph/` | @nativeModuleAgent | @mobileDevAgent | @qaAutomationAgent |
| `src/components/canvas/` | @nativeModuleAgent | @mobileDevAgent | @qaAutomationAgent |
| `src/stores/` | @architectAgent | @mobileDevAgent | - |
| `src/services/` | @mobileDevAgent | @architectAgent | - |
| `src/services/rag.service.ts` | @nativeModuleAgent | @mobileDevAgent | - |
| `src/native/` | @nativeModuleAgent | - | @architectAgent |
| `__tests__/` | @qaAutomationAgent | @mobileDevAgent | - |
| `docs/` | @pmOrchestrator | @architectAgent | - |

### 3.2 Code Review Requirement

**Before merge:**
1. Owner's PR passes automated tests.
2. Co-owner (if any) approves changes.
3. Reviewer approves for architectural/quality standards.
4. @pmOrchestrator verifies story acceptance criteria.

**Approval Weight:**
- Reviewer approval: Mandatory (1 approval needed)
- Owner approval: Mandatory
- All comments resolved: Yes

---

## 4. Decision-Making & Approvals

### 4.1 Scope of Authority

| Decision | Owner | Override By | Escalation |
|----------|-------|-------------|-----------|
| Feature implementation | @mobileDevAgent | @pmOrchestrator | - |
| Architecture change | @architectAgent | @pmOrchestrator | Team consensus |
| Performance optimization | @nativeModuleAgent | @architectAgent | - |
| Testing strategy | @qaAutomationAgent | @mobileDevAgent | - |
| Product scope/MVP | @pmOrchestrator | - | Stakeholder review |

### 4.2 Change Request Process

**For Major Architectural Changes:**
1. Create a `DECISION.md` document (5-10 pages).
2. @architectAgent leads review; get @nativeModuleAgent + @mobileDevAgent feedback.
3. Present at weekly sync; discuss tradeoffs.
4. @pmOrchestrator approves impact on schedule.
5. Archive decision in `/docs/decisions/` for future reference.

**Example Decision Document:**
```markdown
# Decision: Use sqlite-vec for Vector Search (vs. Separate Vector DB)

## Context
We need vector similarity search for RAG retrieval.

## Options Considered
1. **sqlite-vec** (C++ extension, embedded in SQLite)
   - Pros: No separate DB; lower latency; <300MB storage
   - Cons: Less mature; limited query expressiveness
2. **ChromaDB** (Embedded server)
   - Pros: description-built; great API
   - Cons: +200MB footprint; network overhead
3. **MilvusLite** (Lightweight vector DB)
   - Pros: Optimized for vectors
   - Cons: +150MB; overkill for mobile

## Decision
**Use sqlite-vec.** Reduces complexity; embedded in our existing SQLite.

## Tradeoffs
- Accept: Less query flexibility (acceptable for Phase 1)
- Accept: Smaller initial community (but rapidly growing)

## Next Steps
- Benchmark vector search latency on target devices
- Prototype hybrid retrieval (vector + BM25) in Week 3
```

---

## 5. Workflow & Integration Ceremony

### 5.1 Sprint Cycle (2 weeks)

**Week 1:**

**Monday 09:00** - Sprint Planning (30 min)
- @pmOrchestrator presents groomed stories
- Team estimates (T-shirt sizing: XS, S, M, L, XL)
- Assign to owners; commit to sprint

**Daily 10:00** - Standup (15 min)
- Status: Done / In Progress / Blocked
- Impediments: Ask for help
- Performance metrics from yesterday

**Thursday 14:00** - Mid-Sprint Sync (30 min)
- Review progress vs. sprint goal
- Identify risks early
- Adjust if needed

**Week 2:**

**Wednesday 14:00** - Sprint Review (30 min)
- Demo completed stories
- Discuss feedback
- Update metrics/OKRs

**Thursday 15:00** - Retrospective (30 min)
- What went well?
- What didn't?
- Action items for next sprint

---

### 5.2 Integration & Release Process

**Daily Integration:**
1. Feature branch pushed → CI runs `scripts/validate.sh`
2. PR created; automated checks run
3. Code owners review (max 2 days)
4. Merge to main if all pass

**Weekly Build:**
- Every Friday 17:00: `eas build --platform android`
- Generate APK/AAB
- Upload to Firebase App Distribution for testing

**Monthly Release:**
- First Friday of month: `eas submit --platform android`
- Submit to Google Play Store
- Public release 2 days later

---

## Appendix: Glossary

- **Level:** One of 12 quality dimensions (State, Hygiene, Types, etc.)
- **Validator:** Team member responsible for auditing a Level.
- **Linter:** Automated tool enforcing a Level.
- **BMAD:** Build, Measure, Act, Decide (agile framework adapted for AI development).
- **Sweeping Validation:** All 12 levels checked before merge.
- **Sprint:** 2-week iteration cycle.
- **PR:** Pull Request; code change request.
- **AC:** Acceptance Criteria; definition of done for a story.

---

**Document Prepared By:** Product & Architecture Team  
**Last Updated:** 2026-01-02  
**Next Review:** End of Phase 1 (May 2026)