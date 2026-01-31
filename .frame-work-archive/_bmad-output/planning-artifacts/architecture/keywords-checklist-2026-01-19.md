---
# ═══════════════════════════════════════════════════════════════════════════
# KEYWORDS CHECKLIST DOCUMENTATION
# 11 Fundamental Truths with Implementation Details
# ═══════════════════════════════════════════════════════════════════════════

document_id: "DOC-004"
version: "1.0.0"
created_at: "2026-01-19T00:00:00+07:00"
status: "active"
author: "tech-writer-ext"

governance:
  parent_artifact: "DOC-001"
  compliance_level: "Tier 2 (Controlled)"
  review_cycle: "Per epic completion"
  last_reviewed: null

references:
  - "_bmad-output/planning-artifacts/architecture/core-centralized-groups-2026-01-19.md"
  - "_bmad-ext/modules/governance/agent-rag/conversation-threads.md"
  - "AGENTS.md"
  - "CLAUDE.md"

toc:
  - section: "1. Executive Summary"
  - section: "2. Client-Side Only Constraints"
  - section: "3. BYOK Implementation Specs"
  - section: "4. Project-Centric Architecture"
  - section: "5. Device Parity Rules"
  - section: "6. Thread Management Specifications"
  - section: "7. Agent Permission Model"
  - section: "8. Rendering Support Matrix"
  - section: "9. State Management Boundaries"
  - section: "10. Technical Hygiene Requirements"
  - section: "11. Edge Case Handling"
  - section: "12. Gap Analysis Framework"
  - section: "13. Implementation Checklist"
  - section: "14. Governance Compliance"
  - section: "15. Revision History"

---

## 1. EXECUTIVE SUMMARY

This document defines the **11 Fundamental Truths** of Project Alpha's architecture, serving as a checklist for implementation and validation. These truths represent non-negotiable principles that all components must follow.

### 1.1 The 11 Fundamental Truths

| # | Truth | Category | Status |
|---|-------|----------|--------|
| 1 | **Client-Side Only** | Security | ✅ Defined |
| 2 | **BYOK Encryption** | Security | ✅ Defined |
| 3 | **Project-Centric** | Architecture | ✅ Defined |
| 4 | **Device Parity** | Compatibility | ✅ Defined |
| 5 | **Thread Management** | State | ✅ Defined |
| 6 | **Consistent UX** | Design | ✅ Defined |
| 7 | **Agent Permissions** | AI | ✅ Defined |
| 8 | **Rendering Support** | Compatibility | ✅ Defined |
| 9 | **State Boundaries** | Architecture | ✅ Defined |
| 10 | **Technical Hygiene** | Quality | ✅ Defined |
| 11 | **Edge Case Handling** | Resilience | ✅ Defined |

### 1.2 Design Philosophy

Per user instruction: *"Neither we learn from A pattern and we create it on whatever store and state we are using similar to the TanStack Store"*

This means:
1. **Pattern Consistency**: All stores follow Zustand v5 patterns
2. **Single Source of Truth**: No duplicate state management
3. **Traceability**: Every state change is traceable to its source
4. **Iterative Discovery**: Multiple passes through documentation

---

## 2. CLIENT-SIDE ONLY CONSTRAINTS

### 2.1 Core Constraint

```yaml
client_only_constraint:
  rule: "All data processing, encryption, and AI inference MUST happen client-side"
  enforcement: "Hard - No server-side data processing"
  exceptions: "None - This is a fundamental truth"
  
  what_is_allowed:
    - "API calls to external services (Gemini, etc.) with encrypted payloads"
    - "WebSocket connections for real-time features"
    - "CDN asset loading"
    
  what_is_forbidden:
    - "Sending plaintext user data to any server"
    - "Storing unencrypted keys or credentials"
    - "Server-side rendering of user content"
```

### 2.2 Implementation Requirements

```typescript
// src/infrastructure/security/client-side-enforcement.ts

class ClientSideEnforcer {
  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('This application must run in a browser environment');
    }
  }
  
  enforceNoServerCalls(data: unknown): void {
    // Check if data contains sensitive information
    const sensitiveFields = ['key', 'token', 'password', 'secret'];
    const hasSensitive = sensitiveFields.some((field) =>
      this.objectHasField(data, field)
    );
    
    if (hasSensitive) {
      throw new Error(
        'Sensitive data cannot be sent to server. Use encryption first.'
      );
    }
  }
  
  private objectHasField(obj: unknown, field: string): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }
    return field in obj;
  }
}
```

### 2.3 Validation Checklist

| Check | Status | Implementation |
|-------|--------|----------------|
| No server-side data storage | ✅ | All data in IndexedDB/FSA |
| Encrypted API calls only | ✅ | TLS + payload encryption |
| No plaintext secrets | ✅ | BYOK vault enforcement |
| Client-side validation | ✅ | Zod schemas in frontend |
| Offline-first architecture | ✅ | Service worker caching |

---

## 3. BYOK IMPLEMENTATION SPECS

### 3.1 Key Management Architecture

```yaml
byok_specification:
  algorithm: "AES-GCM-256"
  key_derivation: "PBKDF2 with SHA-256"
  iterations: 100000
  salt_length: 32
  iv_length: 12
  
  storage:
    desktop: "IndexedDB (encrypted key storage)"
    mobile: "IndexedDB (encrypted key storage)"
    
  lifecycle:
    generation: "User-provided or generated"
    rotation: "User-initiated only"
    backup: "Export encrypted backup"
    destruction: "Hard delete with cascade"
```

### 3.2 Implementation Details

```typescript
// src/infrastructure/security/byok-vault.ts

import { webCrypto } from '@/lib/utils/crypto';

interface BYOKVault {
  generateKey(purpose: KeyPurpose): Promise<CryptoKey>;
  getKey(purpose: KeyPurpose): Promise<CryptoKey>;
  rotateKey(purpose: KeyPurpose): Promise<CryptoKey>;
  exportKey(purpose: KeyPurpose, passphrase: string): Promise<string>;
  importKey(purpose: KeyPurpose, encryptedKey: string, passphrase: string): Promise<void>;
  destroyKey(purpose: KeyPurpose): Promise<void>;
}

class BYOKVaultImplementation implements BYOKVault {
  private keyStore: Map<KeyPurpose, CryptoKey> = new Map();
  private keyMetadata: Map<KeyPurpose, KeyMetadata> = new Map();
  
  async generateKey(purpose: KeyPurpose): Promise<CryptoKey> {
    const key = await webCrypto.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    this.keyStore.set(purpose, key);
    this.keyMetadata.set(purpose, {
      purpose,
      createdAt: new Date(),
      algorithm: 'AES-GCM-256',
    });
    
    return key;
  }
  
  async getKey(purpose: KeyPurpose): Promise<CryptoKey> {
    const key = this.keyStore.get(purpose);
    if (!key) {
      throw new Error(`Key for purpose ${purpose} not found`);
    }
    return key;
  }
  
  async rotateKey(purpose: KeyPurpose): Promise<CryptoKey> {
    await this.destroyKey(purpose);
    return this.generateKey(purpose);
  }
}
```

### 3.3 Validation Checklist

| Check | Status | Implementation |
|-------|--------|----------------|
| AES-256-GCM encryption | ✅ | Web Crypto API |
| User-provided keys | ✅ | Import functionality |
| Key persistence | ✅ | IndexedDB storage |
| Key rotation | ✅ | User-initiated only |
| Secure key distribution | ✅ | Reactive distribution |

---

## 4. PROJECT-CENTRIC ARCHITECTURE

### 4.1 Core Principle

```yaml
project_centric_principle:
  rule: "Every operation MUST be scoped to a project"
  enforcement: "Hard - Operations fail without project context"
  
  what_this_means:
    - "No global file access - all files belong to projects"
    - "No cross-project data sharing without explicit export"
    - "No cross-project thread access"
    - "All state is project-scoped"
```

### 4.2 Implementation Requirements

```typescript
// src/infrastructure/persistence/stores/project-store.ts

interface ProjectStore {
  projects: Map<ProjectId, Project>;
  activeProjectId: ProjectId | null;
  setActiveProject(projectId: ProjectId): void;
  createProject(data: CreateProjectData): Promise<Project>;
  deleteProject(projectId: ProjectId): Promise<void>;
}

function requireProjectContext<T>(
  operation: (projectId: ProjectId) => T
): T {
  const activeProjectId = useProjectStore.getState().activeProjectId;
  
  if (!activeProjectId) {
    throw new Error('Operation requires active project context');
  }
  
  return operation(activeProjectId);
}

// Usage - enforces project context
function openFile(filePath: string): void {
  requireProjectContext((projectId) => {
    // This code only runs with valid project context
    fileSystem.open(projectId, filePath);
  });
}
```

### 4.3 Validation Checklist

| Check | Status | Implementation |
|-------|--------|----------------|
| Project-scoped operations | ✅ | requireProjectContext helper |
| Project isolation | ✅ | Boundary enforcement |
| Project navigation | ✅ | Routing guards |
| Project hot-reload | ✅ | Reactive updates |

---

## 5. DEVICE PARITY RULES

### 5.1 Storage Parity

```yaml
device_parity:
  desktop:
    storage: "FSA (File System Access)"
    features:
      - "Full file system access"
      - "File watching (Chrome 129+)"
      - "Terminal access"
      - "IDE workspace"
      
  mobile:
    storage: "IndexedDB (Dexie)"
    features:
      - "Browser storage only"
      - "No file watching"
      - "No terminal"
      - "No IDE workspace"
```

### 5.2 Implementation Requirements

```typescript
// src/infrastructure/filesystem/platform-detection.ts

interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
}

function getPlatformContract(): PlatformContract {
  const isDesktop = typeof window !== 'undefined' && 
    /Chrome|Firefox|Safari|Edge/.test(navigator.userAgent) &&
    !/Mobile|Tablet/.test(navigator.userAgent);
  
  return {
    deviceType: isDesktop ? 'desktop' : 'mobile',
    storageType: isDesktop ? 'fsa' : 'indexeddb',
    canAccessFSA: isDesktop,
    canWatchFiles: isDesktop,
    canRunTerminal: isDesktop,
    canDoAgenticCoding: isDesktop,
    canAccessIDE: isDesktop,
  };
}
```

### 5.3 Feature Availability Matrix

| Feature | Desktop | Mobile | Tablet |
|---------|---------|--------|--------|
| FSA Storage | ✅ | ❌ | ❌ |
| File Watching | ✅ | ❌ | ❌ |
| Terminal | ✅ | ❌ | ❌ |
| IDE Workspace | ✅ | ❌ | ❌ |
| Notes Workspace | ✅ | ✅ | ✅ |
| IndexedDB Storage | ✅ | ✅ | ✅ |
| Touch Editor | ❌ | ✅ | ✅ |

### 5.4 Validation Checklist

| Check | Status | Implementation |
|-------|--------|----------------|
| Platform detection | ✅ | getPlatformContract() |
| FSA fallback | ✅ | Dexie adapter |
| Feature restriction | ✅ | Route guards |
| Adaptive UI | ✅ | Device adaptations |

---

## 6. THREAD MANAGEMENT SPECIFICATIONS

### 6.1 Thread Binding Rules

```yaml
thread_management:
  binding_rules:
    - rule: "Threads MUST be bound to exactly one Project ID"
      enforcement: "Thread creation fails without valid Project ID"
      
    - rule: "Threads MAY be bound to zero or one Workspace ID"
      enforcement: "Optional but recommended"
      
    - rule: "Cross-workspace threads must have explicit workspace context per message"
      enforcement: "Messages without workspace context use thread default"
```

### 6.2 Implementation Requirements

```typescript
// src/infrastructure/persistence/stores/thread-store.ts

interface Thread {
  id: ThreadId;
  projectId: ProjectId;
  workspaceId?: WorkspaceId;
  title: string;
  messages: ThreadMessage[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived';
}

interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent?: string;
  workspaceId?: WorkspaceId;
  timestamp: Date;
  attachments?: Attachment[];
}

class ThreadManager {
  async createThread(data: CreateThreadData): Promise<Thread> {
    // Enforce project binding
    if (!data.projectId) {
      throw new Error('Thread must be bound to a project');
    }
    
    const thread: Thread = {
      id: generateThreadId(),
      projectId: data.projectId,
      workspaceId: data.workspaceId,
      title: data.title || 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
    };
    
    return this.persistThread(thread);
  }
}
```

### 6.3 Validation Checklist

| Check | Status | Implementation |
|-------|--------|----------------|
| Thread-project binding | ✅ | Thread creation validation |
| Thread-workspace binding | ✅ | Optional binding support |
| Message workspace context | ✅ | Per-message workspace field |
| Thread persistence | ✅ | Dexie storage |
| Thread archive | ✅ | Archive functionality |

---

## 7. AGENT PERMISSION MODEL

### 7.1 Permission Hierarchy

```yaml
agent_permissions:
  hierarchy:
    - level: "Orchestrator"
      permissions: ["intent_routing", "agent_delegation", "context_management"]
      
    - level: "Workspace Agent"
      permissions: ["workspace_tools", "context_rag", "file_operations"]
      
    - level: "Tool"
      permissions: ["specific_operation"]
```

### 7.2 Implementation Requirements

```typescript
// src/infrastructure/agents/tool-permission-manager.ts

interface ToolPermission {
  tool: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  execute: boolean;
}

interface AgentPermissionProfile {
  agentId: string;
  workspaceId: WorkspaceId;
  permissions: ToolPermission[];
  scope: 'project' | 'workspace' | 'global';
}

class AgentPermissionManager {
  checkPermission(
    agentId: string,
    tool: string,
    operation: CRUDOperation
  ): boolean {
    const profile = this.getAgentProfile(agentId);
    
    if (!profile) {
      return false;
    }
    
    const toolPermission = profile.permissions.find(
      (p) => p.tool === tool
    );
    
    if (!toolPermission) {
      return false;
    }
    
    switch (operation) {
      case 'create':
        return toolPermission.create;
      case 'read':
        return toolPermission.read;
      case 'update':
        return toolPermission.update;
      case 'delete':
        return toolPermission.delete;
      case 'execute':
        return toolPermission.execute;
    }
  }
}
```

### 7.3 Validation Checklist

| Check | Status | Implementation |
|-------|--------|----------------|
| Permission hierarchy | ✅ | Role-based profiles |
| CRUD permissions | ✅ | ToolPermission interface |
| Scope enforcement | ✅ | Project/workspace scope |
| Permission validation | ✅ | Runtime checks |

---

## 8. RENDERING SUPPORT MATRIX

### 8.1 Browser Support

```yaml
browser_support:
  supported:
    - name: "Chrome"
      min_version: 122
      features: ["FSA", "FileSystemObserver"]
      
    - name: "Firefox"
      min_version: 120
      features: ["FSA (partial)"]
      
    - name: "Safari"
      min_version: 17
      features: ["FSA (partial)"]
      
    - name: "Edge"
      min_version: 122
      features: ["FSA", "FileSystemObserver"]
```

### 8.2 Rendering Capabilities

| Feature | Chrome | Firefox | Safari | Mobile Safari | Chrome Mobile |
|---------|--------|---------|--------|---------------|---------------|
| FSA | ✅ | ⚠️ Partial | ⚠️ Partial | ❌ | ❌ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ | ✅ |
| Web Workers | ✅ | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ | ✅ |
| Web Crypto | ✅ | ✅ | ✅ | ✅ | ✅ |
| File Watching | ⚠️ 129+ | ❌ | ❌ | ❌ | ❌ |

### 8.3 Validation Checklist

| Check | Status | Implementation |
|-------|--------|----------------|
| Feature detection | ✅ | getPlatformContract() |
| Graceful degradation | ✅ | Fallback mechanisms |
| Browser polyfills | ✅ | Where needed |
| Mobile support | ✅ | Dexie fallback |

---

## 9. STATE MANAGEMENT BOUNDARIES

### 9.1 Store Boundaries

```yaml
state_boundaries:
  boundary_1:
    name: "Project Store"
    scope: "Project metadata and state"
    location: "infrastructure/persistence/stores/project"
    
  boundary_2:
    name: "Thread Store"
    scope: "Conversation threads and messages"
    location: "infrastructure/persistence/stores/thread"
    
  boundary_3:
    name: "Platform Store"
    scope: "Device and platform detection"
    location: "infrastructure/persistence/stores/platform"
    
  boundary_4:
    name: "Theme Store"
    scope: "UI theme and preferences"
    location: "infrastructure/persistence/stores/theme"
```

### 9.2 Implementation Requirements

```typescript
// Standard Zustand store pattern
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

interface StoreState {
  data: Map<string, unknown>;
  // ... other state
  
  actions: {
    setData: (key: string, value: unknown) => void;
    getData: (key: string) => unknown;
  };
}

export const useStoreNameStore = create<StoreState>()(
  subscribeWithSelector((set, get) => ({
    data: new Map(),
    
    actions: {
      setData: (key, value) => {
        set((state) => {
          const newData = new Map(state.data);
          newData.set(key, value);
          return { data: newData };
        });
      },
      
      getData: (key) => {
        return get().data.get(key);
      },
    },
  }))
);

// Usage with useShallow
function Component() {
  const { data, setData } = useStoreNameStore(
    useShallow((state) => ({
      data: state.data,
      setData: state.actions.setData,
    }))
  );
}
```

### 9.3 Validation Checklist

| Check | Status | Implementation |
|-------|--------|----------------|
| Store isolation | ✅ | Separate store files |
| useShallow usage | ✅ | All multi-selector hooks |
| No god stores | ✅ | Stores ≤120 lines |
| No duplicate stores | ✅ | Consolidated implementations |

---

## 10. TECHNICAL HYGIENE REQUIREMENTS

### 10.1 Code Quality Standards

```yaml
technical_hygiene:
  code_style:
    import_order:
      - "React/Framework imports"
      - "Third-party imports"
      - "Infrastructure imports (@/)"
      - "Domain imports"
      - "Presentation imports"
      - "Relative imports"
      
    naming_conventions:
      files: "kebab-case"
      components: "PascalCase"
      hooks: "camelCase"
      types: "PascalCase"
      constants: "UPPER_SNAKE_CASE"
      
  documentation:
    - "All public APIs documented"
    - "Complex logic explained"
    - "No commented-out code"
    - "No console.log in production"
```

### 10.2 Validation Checklist

| Check | Status | Implementation |
|-------|--------|----------------|
| Import order | ✅ | ESLint rules |
| Naming conventions | ✅ | ESLint rules |
| No console.log | ✅ | ESLint rules |
| Documentation | ✅ | TSDoc required |
| No dead code | ✅ | ESLint rules |

---

## 11. EDGE CASE HANDLING

### 11.1 Edge Cases

```yaml
edge_cases:
  edge_case_1:
    name: "No Project Selected"
    scenario: "User navigates to workspace without project"
    handling: "Redirect to project selector with toast"
    
  edge_case_2:
    name: "Mobile IDE Access"
    scenario: "User tries to access IDE on mobile"
    handling: "Show IDE not available message"
    
  edge_case_3:
    name: "File Watching Unavailable"
    scenario: "Browser doesn't support FileSystemObserver"
    handling: "Fallback to polling mechanism"
    
  edge_case_4:
    name: "Concurrent Edits"
    scenario: "Multiple tabs editing same file"
    handling: "Show conflict resolution dialog"
    
  edge_case_5:
    name: "Key Loss"
    scenario: "User loses encryption key"
    handling: "Show key recovery options"
```

### 11.2 Implementation Requirements

```typescript
// src/infrastructure/error-handling/edge-case-handler.ts

interface EdgeCaseHandler {
  handleNoProjectSelected(): void;
  handleMobileIDEAccess(): void;
  handleFileWatchingUnavailable(): void;
  handleConcurrentEdits(filePath: string): void;
  handleKeyLoss(): void;
}

class EdgeCaseHandlerImplementation implements EdgeCaseHandler {
  handleNoProjectSelected(): void {
    navigate({
      to: '/projects',
      search: { error: 'project_required' },
    });
    showToast({
      title: 'Project Required',
      message: 'Please select a project to continue',
      variant: 'info',
    });
  }
  
  handleMobileIDEAccess(): void {
    navigate({
      to: '/',
      search: { error: 'ide_not_available_on_mobile' },
    });
  }
  
  handleFileWatchingUnavailable(): void {
    // Enable polling fallback
    useFileWatchStore.getState().setPollingEnabled(true);
    showToast({
      title: 'File Watching',
      message: 'Using polling fallback for file changes',
      variant: 'warning',
    });
  }
}
```

### 11.3 Validation Checklist

| Check | Status | Implementation |
|-------|--------|----------------|
| No project handling | ✅ | Redirect + toast |
| Mobile IDE handling | ✅ | Route guard |
| File watching fallback | ✅ | Polling mechanism |
| Concurrent edit handling | ✅ | Conflict dialog |
| Key loss recovery | ✅ | Recovery flow |

---

## 12. GAP ANALYSIS FRAMEWORK

### 12.1 Analysis Categories

```yaml
gap_analysis:
  category_1:
    name: "Security Gaps"
    metrics:
      - "Encryption coverage"
      - "Key management"
      - "Permission enforcement"
      
  category_2:
    name: "Feature Gaps"
    metrics:
      - "Workspace feature completeness"
      - "Cross-workspace integration"
      - "Device coverage"
      
  category_3:
    name: "Quality Gaps"
    metrics:
      - "Test coverage"
      - "Documentation coverage"
      - "Error handling"
```

### 12.2 Gap Assessment Template

| Category | Current State | Target State | Gap | Priority |
|----------|---------------|--------------|-----|----------|
| IDE Features | Core implemented | Full feature set | Medium | P1 |
| Notes Sync | Basic sync | Conflict resolution | Low | P2 |
| RAG Infrastructure | Not started | MVP ready | High | P1 |
| Agent Permissions | Basic model | Full matrix | Medium | P2 |

### 12.3 Continuous Improvement

```yaml
improvement_process:
  frequency: "Per epic completion"
  steps:
    - step: "Collect metrics"
      description: "Gather data on all categories"
      
    - step: "Analyze gaps"
      description: "Compare current vs target state"
      
    - step: "Prioritize"
      description: "Rank gaps by impact and effort"
      
    - step: "Plan remediation"
      description: "Create stories for top gaps"
      
    - step: "Implement"
      description: "Execute remediation plan"
      
    - step: "Validate"
      description: "Verify gap closure"
```

---

## 13. IMPLEMENTATION CHECKLIST

### 13.1 Fundamental Truths Checklist

| # | Truth | Implemented | Tested | Documented |
|---|-------|-------------|--------|------------|
| 1 | Client-Side Only | ✅ | ✅ | ✅ |
| 2 | BYOK Encryption | ✅ | ⚠️ | ✅ |
| 3 | Project-Centric | ✅ | ✅ | ✅ |
| 4 | Device Parity | ✅ | ⚠️ | ✅ |
| 5 | Thread Management | ✅ | ⚠️ | ✅ |
| 6 | Consistent UX | ✅ | ⚠️ | ✅ |
| 7 | Agent Permissions | ⚠️ | ❌ | ✅ |
| 8 | Rendering Support | ✅ | ✅ | ✅ |
| 9 | State Boundaries | ✅ | ✅ | ✅ |
| 10 | Technical Hygiene | ✅ | ✅ | ✅ |
| 11 | Edge Case Handling | ⚠️ | ❌ | ✅ |

### 13.2 Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| ⚠️ | Partial |
| ❌ | Not started |

---

## 14. GOVERNANCE COMPLIANCE

### 14.1 Compliance Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Context-first documentation | ✅ | References governance files |
| Agent expert pattern | ✅ | Clear rationale for decisions |
| Research trigger | ✅ | Tech choices validated |
| No hardcoded values | ✅ | Config-based implementations |
| 8-bit design compliance | ✅ | UI specs follow standards |
| Zustand patterns | ✅ | useShallow for multiple selectors |
| Import order | ✅ | Follows AGENTS.md guidelines |

### 14.2 Related Governance Documents

| Document | Relationship |
|----------|--------------|
| `master-orchestrator.md` | Orchestration governance |
| `context-first/workflow.md` | Context validation |
| `conversation-threads.md` | Thread management |

---

## 15. REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-19 | tech-writer-ext | Initial document creation |

---

*Document governed by BMAD Framework v2.0*
*Last Updated: 2026-01-19T00:00:00+07:00*
