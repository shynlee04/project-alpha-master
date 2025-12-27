---
date: 2025-12-27
time: 21:30:00
phase: Research & Architecture Design
team: Team-A
agent_mode: bmad-bmm-architect
---

# Remediation Epics: BMAD v6 Knowledge Synthesis System

**Document ID:** REM-EPICS-2025-12-27
**Version:** 1.0
**Status:** Architecture Specification Complete
**Based On:** Technical Architecture Document (TECH-ARCH-2025-12-27)

---

## Executive Summary

This document defines technical specifications for remediation epics to address 20+ critical gaps identified in the Technical Architecture Document across three research domains: LLM Provider Configuration (Domain 1), Agent Configuration & Architecture (Domain 2), and Knowledge Synthesis & RAG Infrastructure (Domain 3).

The remediation epics are organized by priority level and include comprehensive technical specifications, acceptance criteria, dependencies, implementation patterns, and risk mitigation strategies. These epics provide a clear roadmap for implementing enterprise-grade multi-agent orchestration capabilities with hybrid RAG, reactive state management, and comprehensive cross-architecture context management.

### Scope Overview

| Priority | Epics | Domain | Estimated Effort | Dependencies |
|-----------|----------|---------|-------------------|--------------|
| **P0** | 3 epics | Domain 1, 2, 3 | 4 weeks | None |
| **P1** | 2 epics | Domain 1, 3 | 2 weeks | P0 epics |
| **HIGH** | 3 epics | Domain 2, 3 | 3 weeks | P0, P1 epics |
| **MEDIUM** | 3 epics | Domain 2, 3 | 3 weeks | HIGH epics |
| **P2** | 3 epics | Domain 1, 2 | 2 weeks | P1 epics |

### Key Deliverables

- **14 Remediation Epics** with detailed technical specifications
- **Clear acceptance criteria** for each epic
- **Dependency mapping** and execution sequence
- **Implementation patterns** with code examples
- **Risk assessment** and mitigation strategies
- **References** to research artifacts and MCP tool sources

---

## Table of Contents

1. [P0 Priority Epics (Blocking)](#1-p0-priority-epics-blocking)
2. [P1 Priority Epics (Important)](#2-p1-priority-epics-important)
3. [HIGH Priority Epics (Major Functionality)](#3-high-priority-epics-major-functionality)
4. [MEDIUM Priority Epics (Enhancements)](#4-medium-priority-epics-enhancements)
5. [P2 Priority Epics (UX Improvements)](#5-p2-priority-epics-ux-improvements)
6. [Execution Sequence and Dependencies](#6-execution-sequence-and-dependencies)
7. [Risk Assessment and Mitigation](#7-risk-assessment-and-mitigation)
8. [Research References](#8-research-references)

---

## 1. P0 Priority Epics (Blocking)

### Epic R-01: Fix Hot-Reloading Bug with Reactive State Binding

**Epic ID:** R-01
**Priority:** P0 (Blocking)
**Domain:** Domain 1 (LLM Provider Configuration)
**Estimated Effort:** 2 weeks
**Dependencies:** None

#### Problem Statement

Configuration updates in [`AgentConfigDialog`](src/components/agent/AgentConfigDialog.tsx) are only visible after navigation due to lack of reactive state binding. This causes severe UX degradation, user confusion, and loss of trust in the application.

#### Root Cause Analysis

- [`AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx) uses local `useState` instead of Zustand store
- [`AgentSelector.tsx`](src/components/chat/AgentSelector.tsx) uses props only, no store subscription
- No reactive binding between UI components and state management layer
- State updates occur but components don't re-render until navigation triggers

#### Technical Specification

**Architecture Changes:**

```typescript
// BEFORE: Local state (non-reactive)
const AgentConfigDialog = ({ open, onOpenChange, agent }: AgentConfigDialogProps) => {
    const [formData, setFormData] = useState<AgentConfig>(initialConfig);
    const [models, setModels] = useState<Model[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    
    // Changes only visible after navigation
};

// AFTER: Reactive state binding
const AgentConfigDialog = ({ open, onOpenChange, agent }: AgentConfigDialogProps) => {
    // Bind directly to Zustand store
    const formData = useAgentsStore((s) => s.agents.find(a => a.id === agent?.id));
    const setFormData = useAgentsStore((s) => s.setFormData);
    
    const models = useAgentsStore((s) => s.models);
    const setModels = useAgentsStore((s) => s.setModels);
    
    const isLoadingModels = useAgentsStore((s) => s.isLoadingModels);
    const setIsLoadingModels = useAgentsStore((s) => s.setIsLoadingModels);
    
    // IMMEDIATE UPDATE (<100ms)
};
```

**Component Refactoring:**

1. **AgentConfigDialog.tsx:**
   - Replace all `useState` with Zustand store subscriptions
   - Remove local state management
   - Bind form fields to store actions
   - Ensure immediate re-renders on state changes

2. **AgentSelector.tsx:**
   - Add store subscriptions for agent list
   - Subscribe to selected agent state
   - Remove prop-only pattern
   - Implement reactive agent selection

3. **ProviderSettings.tsx:**
   - Bind provider configuration to store
   - Add real-time validation
   - Implement reactive credential updates

**State Management Updates:**

```typescript
// src/stores/agents-store.ts (enhanced)
interface AgentsState {
    agents: Agent[];
    selectedAgentId: string | null;
    models: Model[];
    isLoadingModels: boolean;
    
    // Actions
    setAgents: (agents: Agent[]) => void;
    addAgent: (agent: Agent) => void;
    updateAgent: (id: string, updates: Partial<Agent>) => void;
    removeAgent: (id: string) => void;
    setFormData: (agentId: string, data: Partial<AgentConfig>) => void;
    setModels: (models: Model[]) => void;
    setIsLoadingModels: (loading: boolean) => void;
}
```

#### Acceptance Criteria

- [ ] Configuration updates visible within 100ms of user action
- [ ] All components subscribing to store changes re-render simultaneously
- [ ] No navigation required to see configuration changes
- [ ] State persists across sessions via localStorage
- [ ] All form fields show real-time validation feedback
- [ ] Loading states prevent duplicate operations
- [ ] Error notifications shown immediately on failures
- [ ] Test suite with 95%+ coverage for reactive components

#### Implementation Tasks

1. Refactor [`AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx) to use Zustand store
2. Add reactive subscriptions in [`AgentSelector.tsx`](src/components/chat/AgentSelector.tsx)
3. Update [`ProviderSettings.tsx`](src/components/agent/ProviderSettings.tsx) with store binding
4. Enhance [`useAgentsStore`](src/stores/agents-store.ts) with reactive actions
5. Write comprehensive tests for reactive components
6. Perform browser E2E verification of hot-reloading
7. Update documentation and AGENTS.md

#### Success Metrics

- UI update latency < 100ms
- Zero navigation-required bugs
- 100% test coverage for reactive components
- User satisfaction score > 4.5/5.0

---

### Epic R-02: Implement Atomic State Updates with Optimistic UI

**Epic ID:** R-02
**Priority:** P0 (Blocking)
**Domain:** Domain 1 (LLM Provider Configuration)
**Estimated Effort:** 2 weeks
**Dependencies:** R-01 (Hot-Reloading Fix)

#### Problem Statement

Non-atomic state updates cause race conditions, data loss, and inconsistent state. Operations like credential storage or model loading can fail without proper rollback mechanisms, leaving the application in an inconsistent state.

#### Root Cause Analysis

- No optimistic UI pattern for immediate feedback
- No rollback mechanism for failed operations
- State updates not atomic (multiple properties updated separately)
- No error handling with toast notifications
- Concurrent operations can overwrite each other's state

#### Technical Specification

**Optimistic UI Pattern:**

```typescript
// Optimistic Update Pattern with Rollback
const updateAgent = async (id: string, updates: Partial<Agent>) => {
    // Step 1: Create optimistic copy
    const optimisticAgent = {
        ...useAgentsStore.getState().agents.find(a => a.id === id),
        ...updates,
        lastActive: new Date().toISOString(),
    };
    
    // Step 2: Update store immediately (optimistic)
    const previousAgents = useAgentsStore.getState().agents;
    useAgentsStore.getState().setAgents(
        previousAgents.map(a => a.id === id ? optimisticAgent : a)
    );
    
    // Step 3: Execute operation in background
    try {
        await credentialVault.storeCredentials(provider, apiKey);
        
        // Step 4: Update with actual result
        useAgentsStore.getState().updateAgent(id, updates);
        
        toast.success('Agent configuration saved');
    } catch (error) {
        // Step 5: Rollback to previous state
        useAgentsStore.getState().setAgents(previousAgents);
        
        toast.error('Failed to save credentials');
        
        // Step 6: Log error for debugging
        console.error('Agent update failed:', error);
    }
};
```

**Atomic State Update Helper:**

```typescript
// src/lib/state/atomic-updates.ts
export async function executeWithRollback<T>(
    operation: () => Promise<T>,
    rollback: () => void
): Promise<{ success: boolean; data?: T; error?: Error }> {
    const previousState = useAgentsStore.getState();
    
    try {
        const data = await operation();
        return { success: true, data };
    } catch (error) {
        rollback();
        return { success: false, error: error as Error };
    }
}

// Usage
const result = await executeWithRollback(
    async () => {
        await credentialVault.storeCredentials(provider, apiKey);
        return { provider, apiKey };
    },
    () => {
        // Rollback: restore previous state
        useAgentsStore.getState().setAgents(previousAgents);
    }
);

if (!result.success) {
    toast.error(result.error?.message || 'Operation failed');
}
```

**Error Handling with Toast Notifications:**

```typescript
// src/lib/ui/error-handler.ts
import { toast } from 'sonner';

export function handleOperationError(
    error: Error,
    context: string,
    fallbackMessage?: string
): void {
    console.error(`[${context}]`, error);
    
    const message = fallbackMessage || error.message || 'Operation failed';
    
    toast.error(message, {
        description: context,
        action: {
            label: 'Retry',
            onClick: () => {
                // Retry logic
            },
        },
    });
}
```

#### Acceptance Criteria

- [ ] All state updates use optimistic pattern with rollback
- [ ] UI updates immediately (<100ms) on user actions
- [ ] Error notifications shown to user with retry options
- [ ] State always consistent even on operation failures
- [ ] No data loss from failed operations
- [ ] Atomic transactions for multi-property updates
- [ ] Test suite with optimistic update scenarios
- [ ] Browser E2E verification of rollback behavior

#### Implementation Tasks

1. Create atomic update helper utilities
2. Implement optimistic UI pattern in [`AgentConfigDialog`](src/components/agent/AgentConfigDialog.tsx)
3. Add error handler with toast notifications
4. Update all CRUD operations with rollback mechanism
5. Write tests for optimistic updates and rollbacks
6. Perform browser E2E verification of error handling
7. Update documentation

#### Success Metrics

- Zero data loss incidents
- 100% operations have rollback capability
- UI update latency < 100ms
- Error recovery rate > 95%

---

### Epic R-03: Deploy Qdrant Vector Store with Hybrid Search

**Epic ID:** R-03
**Priority:** P0 (Blocking)
**Domain:** Domain 3 (Knowledge Synthesis & RAG Infrastructure)
**Estimated Effort:** 2 weeks
**Dependencies:** None

#### Problem Statement

No vector database for semantic search, limiting RAG capabilities. Without Qdrant, Via-gent cannot support knowledge synthesis, document retrieval, or context-aware agent operations.

#### Technical Specification

**Infrastructure Setup:**

```yaml
# docker-compose.yml
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant-storage:/qdrant/storage
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
      - QDRANT__SERVICE__HTTP_PORT=6333
```

**Vector Storage Service:**

```typescript
// src/lib/rag/qdrant-service.ts
import { QdrantClient } from '@qdrant/js-client-rest';

export class QdrantVectorService {
    private client: QdrantClient;
    
    constructor() {
        this.client = new QdrantClient({
            url: 'http://localhost:6333',
        });
    }
    
    async createCollection(name: string, vectorSize: number): Promise<void> {
        await this.client.createCollection(name, {
            vectors: {
                size: vectorSize,
                distance: 'Cosine',
            },
            optimizers_config: {
                default_segment_number: 2,
            },
        });
    }
    
    async upsertDocuments(
        collectionName: string,
        documents: DocumentEmbedding[]
    ): Promise<void> {
        const points = documents.map((doc, index) => ({
            id: `${doc.id}_${index}`,
            vector: doc.embedding,
            payload: {
                content: doc.content,
                metadata: doc.metadata,
                timestamp: doc.timestamp,
            },
        }));
        
        await this.client.upsert(collectionName, { points });
    }
    
    async hybridSearch(
        collectionName: string,
        query: string,
        queryVector: number[],
        limit: number = 10
    ): Promise<SearchResult[]> {
        const result = await this.client.query(collectionName, {
            prefetch: [
                {
                    query: {
                        values: queryVector,
                    },
                    using: 'dense',
                    limit: 20,
                },
                {
                    query: {
                        values: queryVector,
                    },
                    using: 'sparse',
                    limit: 20,
                },
            ],
            query: {
                fusion: 'rrf',  // Reciprocal Rank Fusion
            },
            limit,
        });
        
        return result.points.map(point => ({
            id: point.id,
            score: point.score,
            content: point.payload?.content,
            metadata: point.payload?.metadata,
        }));
    }
}
```

**Hybrid Search with RRF Fusion:**

```typescript
// Reciprocal Rank Fusion Algorithm
export function reciprocalRankFusion(
    results1: SearchResult[],
    results2: SearchResult[],
    k: number = 60
): SearchResult[] {
    const scores = new Map<string, number>();
    
    // Score from first result set
    results1.forEach((result, index) => {
        const score = 1 / (k + index + 1);
        scores.set(result.id, (scores.get(result.id) || 0) + score);
    });
    
    // Score from second result set
    results2.forEach((result, index) => {
        const score = 1 / (k + index + 1);
        scores.set(result.id, (scores.get(result.id) || 0) + score);
    });
    
    // Sort by combined score
    return Array.from(scores.entries())
        .map(([id, score]) => ({
            id,
            score,
            ...results1.find(r => r.id === id) || results2.find(r => r.id === id),
        }))
        .sort((a, b) => b.score - a.score);
}
```

#### Acceptance Criteria

- [ ] Qdrant instance deployed and accessible
- [ ] Vector storage service implemented with CRUD operations
- [ ] Hybrid search with RRF fusion working
- [ ] Integration with Ollama embedding service complete
- [ ] Support for dense and sparse vectors
- [ ] Payload filtering and full-text search working
- [ ] Test suite with 90%+ coverage
- [ ] Browser E2E verification of search functionality

#### Implementation Tasks

1. Deploy Qdrant instance (Docker)
2. Create vector storage service ([`qdrant-service.ts`](src/lib/rag/qdrant-service.ts))
3. Implement hybrid search with RRF fusion
4. Create collection management utilities
5. Integrate with Ollama embedding service
6. Write comprehensive tests for vector operations
7. Perform browser E2E verification
8. Update documentation

#### Success Metrics

- Qdrant uptime 99.9%
- Search latency < 200ms
- Search accuracy (MTEB) > 85%
- 100% test coverage for vector operations

---

### Epic R-04: Implement 5-Layer Agent System

**Epic ID:** R-04
**Priority:** P0 (Blocking)
**Domain:** Domain 2 (Agent Configuration & Architecture)
**Estimated Effort:** 2 weeks
**Dependencies:** R-01 (Hot-Reloading Fix)

#### Problem Statement

Missing agent definition layers 3-5 (Context/Prompt Injection, Task-Specific Instructions, Hidden System Directives) prevents dynamic agent configuration and task-specific instructions. Current 2-layer system is too rigid for enterprise-grade multi-agent orchestration.

#### Technical Specification

**5-Layer Architecture:**

```typescript
// src/lib/agent/layers/layer-definitions.ts
export interface LayerDefinition {
    id: string;
    name: string;
    description: string;
    priority: number;
    content: (config: AgentConfig, context?: PromptContext) => string;
    appliesTo?: string[];  // agent IDs or modes
    isHidden: boolean;
    required: boolean;
}

// Layer 1: Tool Constitution (Always Sent, Hidden)
export const TOOL_CONSTITUTION: LayerDefinition = {
    id: 'tool-constitution',
    name: 'Tool Constitution',
    description: 'Tool safety rules and constraints',
    priority: 1,
    content: () => `
You are an AI coding agent with access to the following tools:
- read_file: Read file contents
- write_file: Write file contents
- list_files: List directory contents
- execute_command: Execute terminal commands

Tool Safety Rules:
1. Never execute commands that could damage the system
2. Always validate file paths before operations
3. Ask for approval before destructive operations
4. Report errors clearly with context
5. Never access files outside the project directory
`,
    isHidden: true,
    required: true,
};

// Layer 2: Agent Modes (User-Selectable)
export const MODE_SOLO_DEV: LayerDefinition = {
    id: 'mode-solo-dev',
    name: 'Solo Dev Mode',
    description: 'Quick Flow Solo Development',
    priority: 2,
    appliesTo: ['MODE_SOLO_DEV'],
    content: (config) => `
Cognitive Phase: ${config.cognitivePhase || 'analysis'}
Persona: You are a quick-flow solo developer focused on rapid iteration.
Communication Style: ${config.communicationStyle || 'concise'}
Approach: Prioritize speed and pragmatism over exhaustive analysis.
`,
    isHidden: false,
    required: true,
};

// Layer 3: Context/Prompt Injection (Dynamic)
export const CONTEXT_INJECTION: LayerDefinition = {
    id: 'context-injection',
    name: 'Context Injection',
    description: 'Dynamic context from RAG or project state',
    priority: 3,
    content: (config, context) => {
        if (!context) return '';
        
        return `
Project Context:
- Current project: ${context.projectName || 'Untitled'}
- Open files: ${context.openFiles?.join(', ') || 'None'}
- Active file: ${context.activeFile || 'None'}
- Total files: ${context.totalFiles || 0}

RAG Context:
${context.ragDocuments ? `
Relevant Documentation:
${context.ragDocuments.map(doc => `- ${doc.title}: ${doc.summary}`).join('\n')}
` : ''}
`;
    },
    isHidden: false,
    required: false,
};

// Layer 4: Task-Specific Instructions (Dynamic)
export const TASK_SPECIFIC: LayerDefinition = {
    id: 'task-specific',
    name: 'Task-Specific Instructions',
    description: 'Per-task guidance or constraints',
    priority: 4,
    content: (config, context) => {
        const instructions = context?.taskInstructions || [];
        
        return instructions.map(inst => `
${inst.category}: ${inst.description}
${inst.constraints ? `Constraints: ${inst.constraints.join(', ')}` : ''}
`).join('\n');
    },
    isHidden: false,
    required: false,
};

// Layer 5: Hidden System Directives (Dynamic)
export const SYSTEM_DIRECTIVES: LayerDefinition = {
    id: 'system-directives',
    name: 'System Directives',
    description: 'Safety rules, compliance, orchestration',
    priority: 5,
    content: () => `
Safety Rules:
- Never execute commands that could damage the system
- Always validate file paths before operations
- Ask for approval before destructive operations
- Report errors clearly with context

Compliance Rules:
- Ensure code follows project policies
- Maintain security best practices
- Respect user privacy and data protection

Orchestration Rules:
- Agents coordinate via message channels
- Limit concurrent operations to prevent conflicts
- Use file locking for concurrent access
- Respect rate limiting for API calls
`,
    isHidden: true,
    required: true,
};
```

**System Prompt Composer:**

```typescript
// src/lib/agent/layers/system-prompt-composer.ts
export class SystemPromptComposer {
    private layerRegistry: Map<string, LayerDefinition>;
    
    constructor() {
        this.layerRegistry = new Map([
            ['tool-constitution', TOOL_CONSTITUTION],
            ['mode-solo-dev', MODE_SOLO_DEV],
            ['mode-code', MODE_CODE],
            ['context-injection', CONTEXT_INJECTION],
            ['task-specific', TASK_SPECIFIC],
            ['system-directives', SYSTEM_DIRECTIVES],
        ]);
    }
    
    compose(
        config: AgentConfig,
        context?: PromptContext
    ): string {
        const layers = [
            this.getLayer('tool-constitution'),
            this.getLayer(config.mode),
            this.getLayer('context-injection'),
            this.getLayer('task-specific'),
            this.getLayer('system-directives'),
        ];
        
        const includedLayers = layers
            .filter(layer => this.shouldIncludeLayer(layer, config, context))
            .sort((a, b) => a.priority - b.priority);
        
        return includedLayers
            .map(layer => layer.content(config, context))
            .join('\n\n');
    }
    
    private shouldIncludeLayer(
        layer: LayerDefinition,
        config: AgentConfig,
        context?: PromptContext
    ): boolean {
        if (layer.required) return true;
        if (!layer.appliesTo) return true;
        
        return layer.appliesTo.includes(config.mode) || 
               layer.appliesTo.includes(config.id);
    }
    
    registerLayer(layer: LayerDefinition): void {
        this.layerRegistry.set(layer.id, layer);
    }
    
    getLayer(id: string): LayerDefinition | undefined {
        return this.layerRegistry.get(id);
    }
}
```

**Layer Registry:**

```typescript
// src/lib/agent/layers/layer-registry.ts
export class LayerRegistry {
    private layers: Map<string, LayerDefinition> = new Map();
    
    register(layer: LayerDefinition): void {
        this.layers.set(layer.id, layer);
    }
    
    unregister(id: string): void {
        this.layers.delete(id);
    }
    
    get(id: string): LayerDefinition | undefined {
        return this.layers.get(id);
    }
    
    getAll(): LayerDefinition[] {
        return Array.from(this.layers.values());
    }
    
    getByPriority(): LayerDefinition[] {
        return Array.from(this.layers.values())
            .sort((a, b) => a.priority - b.priority);
    }
}
```

#### Acceptance Criteria

- [ ] Layer 3 (Context) implemented with RAG integration
- [ ] Layer 4 (Task-Specific) implemented with approval workflow
- [ ] Layer 5 (System Directives) implemented with safety rules
- [ ] System Prompt Composer can compose system prompts from 5 layers
- [ ] Layer Registry supports dynamic layer registration
- [ ] Custom layers can be created and registered
- [ ] Layer priority ordering works correctly
- [ ] Test suite with 95%+ coverage
- [ ] Browser E2E verification of 5-layer system

#### Implementation Tasks

1. Create layer definition interfaces and types
2. Implement 5 default layers (Tool Constitution, Agent Modes, Context, Task-Specific, System Directives)
3. Create System Prompt Composer service
4. Implement Layer Registry with dynamic registration
5. Update [`system-prompt.ts`](src/lib/agent/system-prompt.ts) to use composer
6. Write comprehensive tests for layer system
7. Perform browser E2E verification
8. Update documentation

#### Success Metrics

- 100% of layers implemented and composable
- Prompt composition latency < 50ms
- 100% test coverage for layer system
- Zero layer ordering bugs

---

## 2. P1 Priority Epics (Important)

### Epic R-05: Complete CRUD Surface for Agent Configuration

**Epic ID:** R-05
**Priority:** P1 (Important)
**Domain:** Domain 1 (LLM Provider Configuration)
**Estimated Effort:** 2 weeks
**Dependencies:** R-01 (Hot-Reloading Fix), R-02 (Atomic Updates)

#### Problem Statement

Incomplete CRUD surface across agent configuration components. Missing edit/delete operations in [`AgentSelector`](src/components/chat/AgentSelector.tsx) and limited functionality in [`AgentConfigDialog`](src/components/agent/AgentConfigDialog.tsx) create inconsistent patterns and limited usability.

#### Technical Specification

**Complete CRUD Operations:**

```typescript
// src/stores/agents-store.ts (enhanced)
interface AgentsState {
    agents: Agent[];
    
    // Existing operations
    addAgent: (agentData: AgentData) => Agent;
    removeAgent: (id: string) => void;
    updateAgent: (id: string, updates: Partial<Agent>) => void;
    
    // NEW operations
    editAgent: (id: string, updates: Partial<Agent>) => void;
    duplicateAgent: (id: string) => Agent;
    reorderAgents: (ids: string[]) => void;
    bulkDeleteAgents: (ids: string[]) => void;
    getAgent: (id: string) => Agent | undefined;
    setSelectedAgent: (id: string | null) => void;
}
```

**AgentSelector UI Enhancements:**

```typescript
// src/components/chat/AgentSelector.tsx (enhanced)
const AgentSelector = () => {
    const agents = useAgentsStore((s) => s.agents);
    const selectedAgentId = useAgentsStore((s) => s.selectedAgentId);
    const { editAgent, removeAgent, duplicateAgent, setSelectedAgent } = useAgentsStore();
    
    const handleEdit = (id: string) => {
        setSelectedAgent(id);
        // Opens AgentConfigDialog in edit mode
    };
    
    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this agent?')) {
            removeAgent(id);
            toast.success('Agent deleted');
        }
    };
    
    const handleDuplicate = (id: string) => {
        const newAgent = duplicateAgent(id);
        toast.success(`Agent "${newAgent.name}" duplicated`);
    };
    
    return (
        <div className="agent-selector">
            {agents.map(agent => (
                <AgentCard key={agent.id}>
                    <AgentName>{agent.name}</AgentName>
                    <AgentActions>
                        <EditButton onClick={() => handleEdit(agent.id)} />
                        <DuplicateButton onClick={() => handleDuplicate(agent.id)} />
                        <DeleteButton onClick={() => handleDelete(agent.id)} />
                    </AgentActions>
                </AgentCard>
            ))}
        </div>
    );
};
```

**AgentConfigDialog Edit Mode:**

```typescript
// src/components/agent/AgentConfigDialog.tsx (enhanced)
interface AgentConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agent?: Agent;  // If provided, edit mode; if not, create mode
}

const AgentConfigDialog = ({ open, onOpenChange, agent }: AgentConfigDialogProps) => {
    const isEditMode = !!agent;
    
    const formData = useAgentsStore((s) => 
        agent ? s.agents.find(a => a.id === agent.id) : defaultFormData
    );
    
    const handleSave = async () => {
        if (isEditMode) {
            await updateAgent(agent.id, formData);
            toast.success('Agent updated');
        } else {
            await addAgent(formData);
            toast.success('Agent created');
        }
        onOpenChange(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTitle>
                {isEditMode ? 'Edit Agent' : 'Create Agent'}
            </DialogTitle>
            <DialogContent>
                {/* Form fields bound to formData */}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSave}>
                    {isEditMode ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
```

**Confirmation Dialogs:**

```typescript
// src/components/ui/confirm-dialog.tsx
interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog = ({ 
    open, 
    onOpenChange, 
    title, 
    message, 
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger'
}: ConfirmDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <h2>{title}</h2>
                <p>{message}</p>
            </DialogContent>
            <DialogActions>
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                    {cancelText}
                </Button>
                <Button variant={variant} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
```

#### Acceptance Criteria

- [ ] All components support full CRUD operations (Create, Read, Update, Delete)
- [ ] Consistent UI patterns across all components
- [ ] Delete operations require confirmation
- [ ] Edit operations open configuration dialog
- [ ] Duplicate operations create new agent with same config
- [ ] Reorder operations support drag-and-drop or up/down buttons
- [ ] Bulk delete operations with confirmation
- [ ] State updates are reactive and immediate
- [ ] Test suite with 95%+ coverage
- [ ] Browser E2E verification of all CRUD operations

#### Implementation Tasks

1. Add CRUD operations to [`useAgentsStore`](src/stores/agents-store.ts)
2. Enhance [`AgentSelector`](src/components/chat/AgentSelector.tsx) with edit/delete/duplicate/reorder
3. Update [`AgentConfigDialog`](src/components/agent/AgentConfigDialog.tsx) with edit mode
4. Add confirmation dialogs for delete operations
5. Implement bulk operations
6. Write comprehensive tests for CRUD operations
7. Perform browser E2E verification
8. Update documentation

#### Success Metrics

- 100% CRUD operations implemented
- 100% user actions have confirmation where required
- Zero data loss from CRUD operations
- 100% test coverage for CRUD operations

---

### Epic R-06: Deploy Ollama Embedding Service with Domain-Aware Chunking

**Epic ID:** R-06
**Priority:** P1 (Important)
**Domain:** Domain 3 (Knowledge Synthesis & RAG Infrastructure)
**Estimated Effort:** 2 weeks
**Dependencies:** R-03 (Qdrant Vector Store)

#### Problem Statement

No local embedding service, dependent on cloud APIs with higher cost and data privacy concerns. Need privacy-preserving embeddings with domain-aware chunking strategies for optimal retrieval performance.

#### Technical Specification

**Ollama Integration:**

```typescript
// src/lib/rag/ollama-embedding-service.ts
export class OllamaEmbeddingService implements EmbeddingService {
    private client: OllamaClient;
    private model: string;
    private cache: EmbeddingCache;
    private batchProcessor: BatchProcessor;
    
    constructor(model: string = 'nomic-embed-text') {
        this.client = new OllamaClient({
            host: 'localhost',
            port: 11434,
        });
        this.model = model;
        this.cache = new EmbeddingCache({ ttl: 3600000 }); // 1 hour TTL
        this.batchProcessor = new BatchProcessor({ batchSize: 10 });
    }
    
    async embedDocument(
        document: Document,
        options?: EmbeddingOptions
    ): Promise<DocumentEmbedding> {
        // Step 1: Check cache
        const cached = await this.cache.get(document.id);
        if (cached) return cached;
        
        // Step 2: Chunk document with domain-aware strategy
        const chunks = await this.chunkDocument(document, options);
        
        // Step 3: Generate embeddings in batches
        const embeddings = await this.batchProcessor.process(
            chunks,
            async (batch) => this.embedBatch(batch)
        );
        
        // Step 4: Compute document-level embedding
        const docEmbedding = await this.aggregateEmbeddings(embeddings);
        
        // Step 5: Store in Qdrant with metadata
        const storedEmbedding = await this.qdrantClient.upsert({
            collection_name: 'documents',
            points: embeddings.map((e, i) => ({
                id: `${document.id}_chunk_${i}`,
                vector: e.vector,
                payload: chunks[i].metadata
            }))
        });
        
        // Step 6: Cache result
        await this.cache.set(document.id, storedEmbedding);
        
        return storedEmbedding;
    }
    
    private async embedBatch(chunks: DocumentChunk[]): Promise<ChunkEmbedding[]> {
        const texts = chunks.map(c => c.content);
        const response = await this.client.embed({
            model: this.model,
            input: texts,
        });
        
        return response.embeddings.map((vector, i) => ({
            vector,
            chunk: chunks[i],
        }));
    }
    
    private async aggregateEmbeddings(
        embeddings: ChunkEmbedding[]
    ): Promise<number[]> {
        // Mean pooling for document-level embedding
        const sum = embeddings.reduce((acc, e) => {
            return acc.map((v, i) => v + e.vector[i]);
        }, new Array(embeddings[0].vector.length).fill(0));
        
        return sum.map(v => v / embeddings.length);
    }
}
```

**Domain-Aware Chunking Strategies:**

```typescript
// src/lib/rag/chunking-strategies.ts
export interface ChunkingStrategy {
    name: string;
    chunk: (document: Document, options?: ChunkingOptions) => Promise<DocumentChunk[]>;
}

// Software Engineering (AST-based semantic)
export const SOFTWARE_ENGINEERING_STRATEGY: ChunkingStrategy = {
    name: 'software-engineering',
    chunk: async (document, options) => {
        const ast = parseAST(document.content);
        const chunks: DocumentChunk[] = [];
        
        // Chunk by functions, classes, modules
        ast.nodes.forEach(node => {
            if (node.type === 'function') {
                chunks.push({
                    content: node.content,
                    metadata: {
                        type: 'function',
                        name: node.name,
                        startLine: node.startLine,
                        endLine: node.endLine,
                        language: document.language,
                    },
                });
            } else if (node.type === 'class') {
                chunks.push({
                    content: node.content,
                    metadata: {
                        type: 'class',
                        name: node.name,
                        startLine: node.startLine,
                        endLine: node.endLine,
                        language: document.language,
                    },
                });
            }
        });
        
        return chunks;
    },
};

// Legal (section-aware with citations)
export const LEGAL_STRATEGY: ChunkingStrategy = {
    name: 'legal',
    chunk: async (document, options) => {
        const sections = parseLegalSections(document.content);
        const chunks: DocumentChunk[] = [];
        
        sections.forEach((section, index) => {
            chunks.push({
                content: section.content,
                metadata: {
                    type: 'legal-section',
                    title: section.title,
                    citation: section.citation,
                    pageNumber: section.pageNumber,
                    index,
                },
            });
        });
        
        return chunks;
    },
};

// Medical (clinical finding clusters)
export const MEDICAL_STRATEGY: ChunkingStrategy = {
    name: 'medical',
    chunk: async (document, options) => {
        const findings = extractClinicalFindings(document.content);
        const chunks: DocumentChunk[] = [];
        
        findings.forEach((finding, index) => {
            chunks.push({
                content: finding.description,
                metadata: {
                    type: 'clinical-finding',
                    category: finding.category,
                    severity: finding.severity,
                    patientId: finding.patientId,
                    date: finding.date,
                    index,
                },
            });
        });
        
        return chunks;
    },
};

// Scientific (methodology-result groupings)
export const SCIENTIFIC_STRATEGY: ChunkingStrategy = {
    name: 'scientific',
    chunk: async (document, options) => {
        const sections = parseScientificSections(document.content);
        const chunks: DocumentChunk[] = [];
        
        sections.forEach((section, index) => {
            chunks.push({
                content: `
${section.methodology ? `Methodology:\n${section.methodology}` : ''}
${section.results ? `Results:\n${section.results}` : ''}
${section.conclusion ? `Conclusion:\n${section.conclusion}` : ''}
                `.trim(),
                metadata: {
                    type: 'scientific-section',
                    sectionType: section.type,
                    authors: section.authors,
                    publicationDate: section.date,
                    index,
                },
            });
        });
        
        return chunks;
    },
};
```

**Embedding Cache:**

```typescript
// src/lib/rag/embedding-cache.ts
export class EmbeddingCache {
    private cache: Map<string, { embedding: number[]; timestamp: number }>;
    private ttl: number;
    
    constructor(ttl: number = 3600000) {
        this.cache = new Map();
        this.ttl = ttl;
    }
    
    async get(key: string): Promise<number[] | null> {
        const entry = this.cache.get(key);
        if (!entry) return null;
        
        const age = Date.now() - entry.timestamp;
        if (age > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.embedding;
    }
    
    async set(key: string, embedding: number[]): Promise<void> {
        this.cache.set(key, {
            embedding,
            timestamp: Date.now(),
        });
    }
    
    async clear(): Promise<void> {
        this.cache.clear();
    }
    
    async cleanup(): Promise<void> {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttl) {
                this.cache.delete(key);
            }
        }
    }
}
```

#### Acceptance Criteria

- [ ] Ollama integration complete with local embeddings
- [ ] Domain-aware chunking strategies implemented (code, legal, medical, scientific)
- [ ] Embedding cache with TTL working
- [ ] Multiple models supported (nomic-embed-text, mxbai-embed-large, BGE-M3)
- [ ] 99%+ cost reduction compared to cloud APIs
- [ ] Batch processing for efficient embedding generation
- [ ] Test suite with 90%+ coverage
- [ ] Browser E2E verification of embedding service

#### Implementation Tasks

1. Create Ollama embedding service
2. Implement domain-aware chunking strategies
3. Create embedding cache with TTL
4. Add batch processor for efficient embeddings
5. Integrate with Qdrant vector store
6. Write comprehensive tests for embedding service
7. Perform browser E2E verification
8. Update documentation

#### Success Metrics

- 99%+ cost reduction vs cloud APIs
- Embedding latency < 500ms per document
- Cache hit rate > 80%
- 100% test coverage for chunking strategies

---

## 3. HIGH Priority Epics (Major Functionality)

### Epic R-07: Implement Chatflow Composition

**Epic ID:** R-07
**Priority:** HIGH
**Domain:** Domain 2 (Agent Configuration & Architecture)
**Estimated Effort:** 2 weeks
**Dependencies:** R-04 (5-Layer Agent System), R-05 (Complete CRUD Surface)

#### Problem Statement

Chatflow not composable - no dynamic agent configuration at API request time. Static 2-layer system only prevents per-request agent customization and dynamic layer composition.

#### Technical Specification

**Chatflow Composition Interface:**

```typescript
// src/lib/agent/chatflow/chatflow-composer.ts
export interface ChatflowComposition {
    layers: string[];
    context?: PromptContext;
    taskInstructions?: TaskInstruction[];
    systemDirectives?: SystemDirective[];
    customLayers?: CustomLayer[];
}

export interface PromptContext {
    projectName?: string;
    openFiles?: string[];
    activeFile?: string;
    totalFiles?: number;
    ragDocuments?: RAGDocument[];
    userPreferences?: UserPreferences;
    taskContext?: TaskContext;
}

export interface TaskInstruction {
    category: string;
    description: string;
    constraints?: string[];
    approvalRequired?: boolean;
}

export interface SystemDirective {
    type: 'safety' | 'compliance' | 'orchestration' | 'rate-limiting';
    rule: string;
    enforcement: 'strict' | 'warning' | 'advisory';
}
```

**Chatflow Composer Service:**

```typescript
// src/lib/agent/chatflow/chatflow-composer.ts
export class ChatflowComposer {
    private layerRegistry: LayerRegistry;
    private promptComposer: SystemPromptComposer;
    
    constructor() {
        this.layerRegistry = new LayerRegistry();
        this.promptComposer = new SystemPromptComposer();
    }
    
    compose(
        agentConfig: AgentConfig,
        chatflow?: ChatflowComposition
    ): string {
        // Step 1: Build layer list
        const layers = this.buildLayerList(agentConfig, chatflow);
        
        // Step 2: Validate layers
        this.validateLayers(layers);
        
        // Step 3: Compose system prompt
        const systemPrompt = this.promptComposer.compose(
            agentConfig,
            chatflow?.context
        );
        
        // Step 4: Inject task instructions
        if (chatflow?.taskInstructions) {
            const taskSection = this.composeTaskInstructions(
                chatflow.taskInstructions
            );
            return `${systemPrompt}\n\n${taskSection}`;
        }
        
        // Step 5: Inject system directives
        if (chatflow?.systemDirectives) {
            const directiveSection = this.composeSystemDirectives(
                chatflow.systemDirectives
            );
            return `${systemPrompt}\n\n${directiveSection}`;
        }
        
        return systemPrompt;
    }
    
    private buildLayerList(
        agentConfig: AgentConfig,
        chatflow?: ChatflowComposition
    ): LayerDefinition[] {
        const layers: LayerDefinition[] = [];
        
        // Always include tool constitution
        layers.push(this.layerRegistry.get('tool-constitution')!);
        
        // Include agent mode
        layers.push(this.layerRegistry.get(agentConfig.mode)!);
        
        // Include context injection if provided
        if (chatflow?.layers.includes('context-injection')) {
            layers.push(this.layerRegistry.get('context-injection')!);
        }
        
        // Include task-specific if provided
        if (chatflow?.layers.includes('task-specific')) {
            layers.push(this.layerRegistry.get('task-specific')!);
        }
        
        // Always include system directives
        layers.push(this.layerRegistry.get('system-directives')!);
        
        // Include custom layers
        if (chatflow?.customLayers) {
            chatflow.customLayers.forEach(customLayer => {
                layers.push(this.createCustomLayer(customLayer));
            });
        }
        
        return layers.sort((a, b) => a.priority - b.priority);
    }
    
    private validateLayers(layers: LayerDefinition[]): void {
        // Validate layer dependencies
        const requiredLayers = layers.filter(l => l.required);
        const presentLayers = new Set(layers.map(l => l.id));
        
        requiredLayers.forEach(layer => {
            if (!presentLayers.has(layer.id)) {
                throw new Error(`Required layer ${layer.id} is missing`);
            }
        });
    }
    
    private composeTaskInstructions(
        instructions: TaskInstruction[]
    ): string {
        return instructions.map(inst => `
${inst.category}: ${inst.description}
${inst.constraints ? `Constraints: ${inst.constraints.join(', ')}` : ''}
${inst.approvalRequired ? '⚠️ This change requires approval' : ''}
`).join('\n');
    }
    
    private composeSystemDirectives(
        directives: SystemDirective[]
    ): string {
        return directives.map(dir => `
[${dir.type.toUpperCase()} - ${dir.enforcement}]
${dir.rule}
`).join('\n');
    }
    
    private createCustomLayer(custom: CustomLayer): LayerDefinition {
        return {
            id: `custom-${custom.id}`,
            name: custom.name,
            description: custom.description,
            priority: custom.priority || 100,
            content: () => custom.content,
            appliesTo: custom.appliesTo,
            isHidden: custom.isHidden || false,
            required: custom.required || false,
        };
    }
}
```

**API Endpoint Enhancement:**

```typescript
// src/routes/api/chat.ts (enhanced)
export async function POST(request: Request) {
    const { 
        agentConfig, 
        chatflow, 
        context,
        messages 
    } = await request.json();
    
    // Step 1: Compose system prompt dynamically
    const chatflowComposer = new ChatflowComposer();
    const systemPrompt = chatflowComposer.compose(agentConfig, chatflow);
    
    // Step 2: Validate chatflow
    try {
        chatflowComposer.validateComposition(chatflow);
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Invalid chatflow', details: error.message }),
            { status: 400 }
        );
    }
    
    // Step 3: Call LLM with composed system prompt
    const adapter = providerAdapterFactory.createAdapter(
        agentConfig.provider,
        agentConfig
    );
    
    const stream = chat({
        adapter,
        model: agentConfig.model,
        system: systemPrompt,
        messages: messages || [],
        tools: getAgentTools(agentConfig),
    });
    
    return toStreamResponse(stream);
}
```

#### Acceptance Criteria

- [ ] ChatPanel uses composed system prompts
- [ ] API endpoint supports chatflow parameter
- [ ] Layer Registry supports dynamic layer registration
- [ ] System Prompt Composer can compose from 5 layers
- [ ] Context injection works with RAG integration
- [ ] Task instructions can be added dynamically
- [ ] System directives can be customized
- [ ] Custom layers can be created and registered
- [ ] Test suite with 95%+ coverage
- [ ] Browser E2E verification of chatflow composition

#### Implementation Tasks

1. Create chatflow composition interfaces and types
2. Implement Chatflow Composer service
3. Update [`/api/chat`](src/routes/api/chat.ts) endpoint to support chatflow
4. Integrate chatflow composition with System Prompt Composer
5. Update chat components to use composed system prompts
6. Write comprehensive tests for chatflow system
7. Perform browser E2E verification
8. Update documentation

#### Success Metrics

- 100% of chatflow features implemented
- Prompt composition latency < 50ms
- 100% test coverage for chatflow system
- Zero chatflow validation errors

---

### Epic R-08: Deploy Neo4j Graph Database

**Epic ID:** R-08
**Priority:** HIGH
**Domain:** Domain 3 (Knowledge Synthesis & RAG Infrastructure)
**Estimated Effort:** 2 weeks
**Dependencies:** R-03 (Qdrant Vector Store)

#### Problem Statement

No graph database for relationship mapping and context chains. Without Neo4j, Via-gent cannot support entity-centric retrieval, context chain traversal, or knowledge graph relationships.

#### Technical Specification

**Infrastructure Setup:**

```yaml
# docker-compose.yml
version: '3.8'
services:
  neo4j:
    image: neo4j:5.23.0-community
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - ./neo4j-data:/data
      - ./neo4j-logs:/logs
    environment:
      - NEO4J_AUTH=neo4j/password
      - NEO4J_PLUGINS=["apoc"]
      - NEO4J_dbms_memory_pagecache_size=1G
```

**Graph Database Service:**

```typescript
// src/lib/rag/graph-database-service.ts
import neo4j, { Driver, Session } from 'neo4j-driver';

export class GraphDatabaseService {
    private driver: Driver;
    
    constructor() {
        this.driver = neo4j.driver(
            'bolt://localhost:7687',
            'neo4j',
            'password'
        );
    }
    
    async storeEntity(entity: Entity): Promise<void> {
        const session = this.driver.session();
        try {
            await session.run(
                'CREATE (e:Entity $props) RETURN e',
                { props: entity }
            );
        } finally {
            await session.close();
        }
    }
    
    async storeRelationship(
        fromId: string,
        toId: string,
        relationshipType: string,
        properties?: Record<string, any>
    ): Promise<void> {
        const session = this.driver.session();
        try {
            await session.run(
                `
                MATCH (source:Entity {id: $fromId})
                MATCH (target:Entity {id: $toId})
                CREATE (source)-[r:${relationshipType}]->(target)
                SET r += $props
                `,
                { fromId, toId, props: properties || {} }
            );
        } finally {
            await session.close();
        }
    }
    
    async queryContextChain(
        startId: string,
        endId: string,
        maxDepth: number = 3
    ): Promise<ContextChain> {
        const session = this.driver.session();
        try {
            const result = await session.run(
                `
                MATCH path = (source:Concept)-[*1..${maxDepth}]->(target:Concept)
                WHERE source.id = $startId AND target.id = $endId
                WITH path, relationships(path) as rels
                ORDER BY length(path) ASC
                LIMIT 5
                RETURN nodes(path) as concepts, rels as relationships
                `,
                { startId, endId }
            );
            
            return {
                concepts: result.records[0].get('concepts'),
                relationships: result.records[0].get('relationships'),
            };
        } finally {
            await session.close();
        }
    }
    
    async queryEntityNeighbors(
        entityId: string,
        relationshipTypes?: string[],
        maxDepth: number = 2
    ): Promise<Entity[]> {
        const session = this.driver.session();
        try {
            const query = `
                MATCH (e:Entity)-[r*1..${maxDepth}]-(neighbor:Entity)
                WHERE e.id = $entityId
                ${relationshipTypes ? `AND type(r) IN $relationshipTypes` : ''}
                RETURN DISTINCT neighbor
                LIMIT 20
            `;
            
            const result = await session.run(query, { 
                entityId, 
                relationshipTypes 
            });
            
            return result.records.map(record => record.get('neighbor'));
        } finally {
            await session.close();
        }
    }
    
    async close(): Promise<void> {
        await this.driver.close();
    }
}
```

**Entity Extraction Service:**

```typescript
// src/lib/rag/entity-extraction.ts
export class EntityExtractor {
    async extractEntities(
        text: string,
        domain?: string
    ): Promise<Entity[]> {
        const entities: Entity[] = [];
        
        // Extract based on domain
        if (domain === 'software') {
            entities.push(...this.extractSoftwareEntities(text));
        } else if (domain === 'legal') {
            entities.push(...this.extractLegalEntities(text));
        } else if (domain === 'medical') {
            entities.push(...this.extractMedicalEntities(text));
        } else {
            entities.push(...this.extractGenericEntities(text));
        }
        
        return entities;
    }
    
    private extractSoftwareEntities(text: string): Entity[] {
        const entities: Entity[] = [];
        
        // Extract functions
        const functionMatches = text.match(/function\s+(\w+)/g);
        functionMatches?.forEach(match => {
            entities.push({
                id: generateId(),
                type: 'function',
                name: match[1],
                properties: { category: 'code' },
            });
        });
        
        // Extract classes
        const classMatches = text.match(/class\s+(\w+)/g);
        classMatches?.forEach(match => {
            entities.push({
                id: generateId(),
                type: 'class',
                name: match[1],
                properties: { category: 'code' },
            });
        });
        
        // Extract variables
        const variableMatches = text.match(/(?:const|let|var)\s+(\w+)/g);
        variableMatches?.forEach(match => {
            entities.push({
                id: generateId(),
                type: 'variable',
                name: match[1],
                properties: { category: 'code' },
            });
        });
        
        return entities;
    }
}
```

**Relationship Mapping Service:**

```typescript
// src/lib/rag/relationship-mapper.ts
export class RelationshipMapper {
    async mapRelationships(
        entities: Entity[],
        context: string
    ): Promise<Relationship[]> {
        const relationships: Relationship[] = [];
        
        // Infer relationships based on context
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const relationship = this.inferRelationship(
                    entities[i],
                    entities[j],
                    context
                );
                
                if (relationship) {
                    relationships.push(relationship);
                }
            }
        }
        
        return relationships;
    }
    
    private inferRelationship(
        entity1: Entity,
        entity2: Entity,
        context: string
    ): Relationship | null {
        // Heuristics for relationship inference
        const patterns = [
            { regex: /calls|invokes/, type: 'CALLS' },
            { regex: /extends|inherits/, type: 'EXTENDS' },
            { regex: /implements/, type: 'IMPLEMENTS' },
            { regex: /uses|imports/, type: 'USES' },
            { regex: /contains|has/, type: 'CONTAINS' },
            { regex: /references|mentions/, type: 'REFERENCES' },
        ];
        
        for (const pattern of patterns) {
            if (pattern.regex.test(context)) {
                return {
                    from: entity1.id,
                    to: entity2.id,
                    type: pattern.type,
                    confidence: 0.7,
                };
            }
        }
        
        return null;
    }
}
```

#### Acceptance Criteria

- [ ] Neo4j instance deployed and accessible
- [ ] Entity extraction service implemented
- [ ] Relationship mapping service working
- [ ] Cypher query builder for graph traversal complete
- [ ] Context chain retrieval for document synthesis working
- [ ] Entity-centric retrieval (1-hop, 2-hop, N-hop) implemented
- [ ] Test suite with 90%+ coverage
- [ ] Browser E2E verification of graph database

#### Implementation Tasks

1. Deploy Neo4j instance (Docker)
2. Create graph database service
3. Implement entity extraction service
4. Build relationship mapping service
5. Create Cypher query builder
6. Integrate with Qdrant for hybrid retrieval
7. Write comprehensive tests for graph operations
8. Perform browser E2E verification
9. Update documentation

#### Success Metrics

- Neo4j uptime 99.9%
- Entity extraction accuracy > 85%
- Relationship inference accuracy > 75%
- Graph query latency < 300ms
- 100% test coverage for graph operations

---

### Epic R-09: Implement Cross-Architecture Context Management

**Epic ID:** R-09
**Priority:** HIGH
**Domain:** Domain 3 (Knowledge Synthesis & RAG Infrastructure)
**Estimated Effort:** 3 weeks
**Dependencies:** R-02 (Atomic Updates), R-08 (Neo4j Graph Database)

#### Problem Statement

No unified context synchronization across Local FS, WebContainer, Agent Context. No conflict resolution for concurrent operations causes context loss, inconsistent state, and data conflicts.

#### Technical Specification

**Event-Driven State Propagation:**

```typescript
// src/lib/context/context-synchronizer.ts
import { EventEmitter } from 'eventemitter3';

export class ContextSynchronizer extends EventEmitter {
    private pendingChanges: Map<string, ChangeRecord> = new Map();
    private conflictResolver: ConflictResolver;
    private stateSnapshots: Map<string, StateSnapshot> = new Map();
    
    async propagateChange(
        workspace: Workspace,
        change: ContextChange
    ): Promise<void> {
        // Step 1: Create change record
        const record = await this.createChangeRecord(workspace, change);
        
        // Step 2: Check for conflicts with pending changes
        const conflicts = await this.detectConflicts(record);
        if (conflicts.length > 0) {
            const resolution = await this.conflictResolver.resolve(conflicts);
            await this.applyResolution(record, resolution);
        } else {
            this.pendingChanges.set(record.id, record);
            this.emit('change:pending', record);
        }
        
        // Step 3: Propagate to all boundaries
        await this.propagateToBoundaries(workspace, record);
    }
    
    private async createChangeRecord(
        workspace: Workspace,
        change: ContextChange
    ): Promise<ChangeRecord> {
        return {
            id: generateUUID(),
            workspace: workspace.id,
            timestamp: Date.now(),
            content: change.content,
            checksum: await calculateChecksum(change.content),
            dependencies: await this.extractDependencies(change),
            priority: change.priority || 'normal',
            source: change.source,
        };
    }
    
    private async detectConflicts(
        record: ChangeRecord
    ): Promise<Conflict[]> {
        const conflicts: Conflict[] = [];
        
        for (const [id, pending] of this.pendingChanges.entries()) {
            if (this.hasConflict(record, pending)) {
                conflicts.push({
                    id: generateUUID(),
                    record1: record,
                    record2: pending,
                    type: this.classifyConflict(record, pending),
                    severity: 'high',
                });
            }
        }
        
        return conflicts;
    }
    
    private hasConflict(
        record1: ChangeRecord,
        record2: ChangeRecord
    ): boolean {
        // Check for overlapping file paths
        if (record1.content.path === record2.content.path) {
            return true;
        }
        
        // Check for dependency conflicts
        if (record1.dependencies.includes(record2.id) ||
            record2.dependencies.includes(record1.id)) {
            return true;
        }
        
        return false;
    }
    
    private classifyConflict(
        record1: ChangeRecord,
        record2: ChangeRecord
    ): ConflictType {
        if (record1.content.path === record2.content.path) {
            return 'same-path';
        }
        
        if (record1.dependencies.includes(record2.id)) {
            return 'dependency';
        }
        
        return 'general';
    }
    
    private async applyResolution(
        record: ChangeRecord,
        resolution: ConflictResolution
    ): Promise<void> {
        switch (resolution.strategy) {
            case 'operational-transformation':
                await this.applyOTResolution(record, resolution);
                break;
            case 'merge-based':
                await this.applyMergeResolution(record, resolution);
                break;
            case 'last-write-wins':
                await this.applyLWWResolution(record, resolution);
                break;
        }
        
        this.emit('conflict:resolved', { record, resolution });
    }
    
    private async propagateToBoundaries(
        workspace: Workspace,
        record: ChangeRecord
    ): Promise<void> {
        // Propagate to Local FS
        if (record.source === 'agent' || record.source === 'webcontainer') {
            await this.syncToLocalFS(workspace, record);
        }
        
        // Propagate to WebContainer
        if (record.source === 'agent' || record.source === 'localfs') {
            await this.syncToWebContainer(workspace, record);
        }
        
        // Propagate to Agent Context
        if (record.source === 'localfs' || record.source === 'webcontainer') {
            await this.syncToAgentContext(workspace, record);
        }
    }
    
    async createSnapshot(workspace: Workspace): Promise<string> {
        const snapshotId = generateUUID();
        const snapshot: StateSnapshot = {
            id: snapshotId,
            workspace: workspace.id,
            timestamp: Date.now(),
            localFS: await this.getLocalFSSnapshot(workspace),
            webContainer: await this.getWebContainerSnapshot(workspace),
            agentContext: await this.getAgentContextSnapshot(workspace),
        };
        
        this.stateSnapshots.set(snapshotId, snapshot);
        return snapshotId;
    }
    
    async restoreSnapshot(snapshotId: string): Promise<void> {
        const snapshot = this.stateSnapshots.get(snapshotId);
        if (!snapshot) {
            throw new Error(`Snapshot ${snapshotId} not found`);
        }
        
        // Restore all boundaries
        await this.restoreLocalFS(snapshot.localFS);
        await this.restoreWebContainer(snapshot.webContainer);
        await this.restoreAgentContext(snapshot.agentContext);
        
        this.emit('snapshot:restored', snapshot);
    }
}
```

**Conflict Resolution Strategies:**

```typescript
// src/lib/context/conflict-resolver.ts
export class ConflictResolver {
    async resolve(conflicts: Conflict[]): Promise<ConflictResolution> {
        // Choose resolution strategy based on conflict type
        const strategy = this.determineStrategy(conflicts);
        
        switch (strategy) {
            case 'operational-transformation':
                return await this.resolveOT(conflicts);
            case 'merge-based':
                return await this.resolveMerge(conflicts);
            case 'last-write-wins':
                return await this.resolveLWW(conflicts);
        }
    }
    
    private determineStrategy(conflicts: Conflict[]): ResolutionStrategy {
        // Use OT for concurrent edits to same file
        if (conflicts.some(c => c.type === 'same-path')) {
            return 'operational-transformation';
        }
        
        // Use merge for structural changes
        if (conflicts.some(c => c.type === 'dependency')) {
            return 'merge-based';
        }
        
        // Use LWW for metadata changes
        return 'last-write-wins';
    }
    
    private async resolveOT(conflicts: Conflict[]): Promise<ConflictResolution> {
        // Operational Transformation for concurrent edits
        const resolution: ConflictResolution = {
            strategy: 'operational-transformation',
            operations: [],
        };
        
        for (const conflict of conflicts) {
            const ops = this.generateOTOperations(conflict);
            resolution.operations.push(...ops);
        }
        
        return resolution;
    }
    
    private async resolveMerge(conflicts: Conflict[]): Promise<ConflictResolution> {
        // Merge-based resolution for structural changes
        const resolution: ConflictResolution = {
            strategy: 'merge-based',
            merged: await this.mergeChanges(conflicts),
        };
        
        return resolution;
    }
    
    private async resolveLWW(conflicts: Conflict[]): Promise<ConflictResolution> {
        // Last-Write-Wins for metadata changes
        const latestConflict = conflicts.reduce((latest, current) => 
            current.timestamp > latest.timestamp ? current : latest
        );
        
        return {
            strategy: 'last-write-wins',
            winner: latestConflict,
        };
    }
    
    private generateOTOperations(conflict: Conflict[]): Operation[] {
        // Generate OT operations for conflict resolution
        const ops: Operation[] = [];
        
        // Compare changes and generate insert/delete/retain operations
        // ... implementation details
        
        return ops;
    }
    
    private async mergeChanges(conflicts: Conflict[]): Promise<MergedChange> {
        // Merge conflicting changes
        // ... implementation details
        
        return {} as MergedChange;
    }
}
```

**Context Synchronization Across Boundaries:**

```typescript
// src/lib/context/boundary-sync.ts
export class BoundarySync {
    private synchronizer: ContextSynchronizer;
    
    async syncToLocalFS(
        workspace: Workspace,
        record: ChangeRecord
    ): Promise<void> {
        // Sync change to Local FS
        const localFSAdapter = new LocalFSAdapter(workspace);
        await localFSAdapter.applyChange(record);
        
        this.synchronizer.emit('boundary:synced', {
            boundary: 'localfs',
            record,
        });
    }
    
    async syncToWebContainer(
        workspace: Workspace,
        record: ChangeRecord
    ): Promise<void> {
        // Sync change to WebContainer
        const webContainer = await getWebContainer(workspace);
        await webContainer.applyChange(record);
        
        this.synchronizer.emit('boundary:synced', {
            boundary: 'webcontainer',
            record,
        });
    }
    
    async syncToAgentContext(
        workspace: Workspace,
        record: ChangeRecord
    ): Promise<void> {
        // Sync change to Agent Context
        const agentContext = getAgentContext(workspace);
        await agentContext.applyChange(record);
        
        this.synchronizer.emit('boundary:synced', {
            boundary: 'agent',
            record,
        });
    }
}
```

#### Acceptance Criteria

- [ ] Event-driven state propagation working
- [ ] Conflict detection automatic
- [ ] Conflict resolution strategies (OT, Merge-Based, LWW) implemented
- [ ] Context synchronization across boundaries complete
- [ ] State snapshots for rollback working
- [ ] Zero data loss from concurrent operations
- [ ] Test suite with 90%+ coverage
- [ ] Browser E2E verification of context management

#### Implementation Tasks

1. Create Context Synchronizer service
2. Implement Conflict Resolver with OT, Merge-Based, LWW strategies
3. Build Boundary Sync for Local FS, WebContainer, Agent Context
4. Implement state snapshots and rollback
5. Add conflict detection and resolution
6. Write comprehensive tests for context management
7. Perform browser E2E verification
8. Update documentation

#### Success Metrics

- Zero data loss from concurrent operations
- Conflict resolution success rate > 95%
- Context sync latency < 500ms
- 100% test coverage for context management

---

## 4. MEDIUM Priority Epics (Enhancements)

### Epic R-10: Add Multi-Modal Support

**Epic ID:** R-10
**Priority:** MEDIUM
**Domain:** Domain 2 (Agent Configuration & Architecture)
**Estimated Effort:** 2 weeks
**Dependencies:** R-06 (Ollama Embedding Service)

#### Problem Statement

Text-only capabilities, no vision, audio, or structured data processing. Limited agent capabilities prevent cross-modal reasoning and comprehensive understanding of user inputs.

#### Technical Specification

**Multi-Modal Agent Tools:**

```typescript
// src/lib/agent/tools/vision-tools.ts
export const visionTools = [
    {
        name: 'analyze_image',
        description: 'Analyze an image and extract information',
        inputSchema: z.object({
            image_url: z.string().url(),
            prompt: z.string().optional(),
        }),
        handler: async ({ image_url, prompt }) => {
            // Use multi-modal model for image analysis
            const result = await multiModalModel.analyzeImage({
                image: image_url,
                prompt: prompt || 'Describe this image in detail',
            });
            
            return {
                success: true,
                data: result,
            };
        },
    },
    {
        name: 'generate_image',
        description: 'Generate an image from text description',
        inputSchema: z.object({
            prompt: z.string(),
            style: z.string().optional(),
        }),
        handler: async ({ prompt, style }) => {
            const result = await imageGenerationModel.generate({
                prompt,
                style: style || 'realistic',
            });
            
            return {
                success: true,
                data: result,
            };
        },
    },
];

// src/lib/agent/tools/audio-tools.ts
export const audioTools = [
    {
        name: 'transcribe_audio',
        description: 'Transcribe audio to text',
        inputSchema: z.object({
            audio_url: z.string().url(),
            language: z.string().optional(),
        }),
        handler: async ({ audio_url, language }) => {
            const result = await speechToTextModel.transcribe({
                audio: audio_url,
                language: language || 'en',
            });
            
            return {
                success: true,
                data: result,
            };
        },
    },
    {
        name: 'synthesize_speech',
        description: 'Convert text to speech',
        inputSchema: z.object({
            text: z.string(),
            voice: z.string().optional(),
            language: z.string().optional(),
        }),
        handler: async ({ text, voice, language }) => {
            const result = await textToSpeechModel.synthesize({
                text,
                voice: voice || 'default',
                language: language || 'en',
            });
            
            return {
                success: true,
                data: result,
            };
        },
    },
];
```

**Multi-Modal Model Registry:**

```typescript
// src/lib/agent/providers/multi-modal-models.ts
export const MULTI_MODAL_MODELS = {
    'gpt-4-vision-preview': {
        name: 'GPT-4 Vision Preview',
        provider: 'openai',
        capabilities: ['vision', 'text'],
        maxImageSize: 2048,
        supportedFormats: ['png', 'jpg', 'webp'],
    },
    'claude-3.5-sonnet': {
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        capabilities: ['vision', 'text', 'code'],
        maxImageSize: 4096,
        supportedFormats: ['png', 'jpg', 'gif', 'webp'],
    },
    'gemini-pro-vision': {
        name: 'Gemini Pro Vision',
        provider: 'google',
        capabilities: ['vision', 'text', 'audio'],
        maxImageSize: 8192,
        supportedFormats: ['png', 'jpg', 'webp', 'heic'],
    },
};
```

**Cross-Modal Reasoning:**

```typescript
// src/lib/agent/multi-modal/reasoning.ts
export class MultiModalReasoner {
    async reasonAcrossModalities(
        inputs: MultiModalInput[]
    ): Promise<ReasoningResult> {
        const results: ReasoningResult[] = [];
        
        for (const input of inputs) {
            const result = await this.processInput(input);
            results.push(result);
        }
        
        // Synthesize across modalities
        const synthesis = await this.synthesizeResults(results);
        
        return {
            individualResults: results,
            synthesis,
            confidence: this.calculateConfidence(results),
        };
    }
    
    private async processInput(
        input: MultiModalInput
    ): Promise<ReasoningResult> {
        switch (input.type) {
            case 'text':
                return this.processText(input.content);
            case 'image':
                return this.processImage(input.content);
            case 'audio':
                return this.processAudio(input.content);
            case 'structured':
                return this.processStructuredData(input.content);
        }
    }
    
    private async synthesizeResults(
        results: ReasoningResult[]
    ): Promise<SynthesisResult> {
        // Cross-modal synthesis logic
        const textResults = results.filter(r => r.modality === 'text');
        const imageResults = results.filter(r => r.modality === 'image');
        const audioResults = results.filter(r => r.modality === 'audio');
        
        // Combine and synthesize
        // ... implementation details
        
        return {} as SynthesisResult;
    }
}
```

#### Acceptance Criteria

- [ ] Vision tools integrated (image generation, image-to-text)
- [ ] Audio tools integrated (text-to-speech, speech-to-text)
- [ ] Multi-modal models configured
- [ ] Cross-modal reasoning working
- [ ] Support for structured data processing
- [ ] Test suite with 90%+ coverage
- [ ] Browser E2E verification of multi-modal features

#### Implementation Tasks

1. Create vision tools (analyze_image, generate_image)
2. Create audio tools (transcribe_audio, synthesize_speech)
3. Add multi-modal models to model registry
4. Implement cross-modal reasoning engine
5. Integrate multi-modal tools with agent system
6. Write comprehensive tests for multi-modal features
7. Perform browser E2E verification
8. Update documentation

#### Success Metrics

- 100% of multi-modal tools implemented
- Cross-modal reasoning accuracy > 80%
- Multi-modal processing latency < 2s
- 100% test coverage for multi-modal features

---

### Epic R-11: Implement Team Orchestration

**Epic ID:** R-11
**Priority:** MEDIUM
**Domain:** Domain 2 (Agent Configuration & Architecture)
**Estimated Effort:** 3 weeks
**Dependencies:** R-07 (Chatflow Composition), R-10 (Multi-Modal Support)

#### Problem Statement

Single agent per conversation, no multi-agent collaboration. Cannot leverage specialist swarms, consensus, or parallel execution for complex tasks requiring multiple perspectives.

#### Technical Specification

**LangGraph-Style Agent Graph:**

```typescript
// src/lib/agent/orchestration/agent-graph.ts
export class AgentGraph {
    private nodes: Map<string, AgentNode> = new Map();
    private edges: Map<string, AgentEdge[]> = new Map();
    private state: GraphState;
    
    addNode(node: AgentNode): void {
        this.nodes.set(node.id, node);
    }
    
    addEdge(from: string, to: string, condition?: EdgeCondition): void {
        if (!this.edges.has(from)) {
            this.edges.set(from, []);
        }
        this.edges.get(from)!.push({ to, condition });
    }
    
    async execute(
        input: GraphInput,
        pattern: OrchestrationPattern
    ): Promise<GraphOutput> {
        switch (pattern) {
            case 'sequential':
                return await this.executeSequential(input);
            case 'parallel':
                return await this.executeParallel(input);
            case 'consensus':
                return await this.executeConsensus(input);
            case 'layered':
                return await this.executeLayered(input);
            case 'producer-reviewer':
                return await this.executeProducerReviewer(input);
            case 'group-chat':
                return await this.executeGroupChat(input);
            case 'specialist-swarm':
                return await this.executeSpecialistSwarm(input);
            case 'critic-refiner':
                return await this.executeCriticRefiner(input);
            default:
                throw new Error(`Unknown pattern: ${pattern}`);
        }
    }
    
    private async executeSequential(input: GraphInput): Promise<GraphOutput> {
        let currentNode = this.nodes.get(input.startNode)!;
        const results: AgentResult[] = [];
        
        while (currentNode) {
            const result = await currentNode.agent.execute(input);
            results.push(result);
            
            // Find next node based on result
            const nextNodeId = this.findNextNode(currentNode.id, result);
            if (!nextNodeId) break;
            
            currentNode = this.nodes.get(nextNodeId)!;
        }
        
        return { results, pattern: 'sequential' };
    }
    
    private async executeParallel(input: GraphInput): Promise<GraphOutput> {
        const startNode = this.nodes.get(input.startNode)!;
        const parallelNodes = this.edges.get(startNode.id)!.map(edge => 
            this.nodes.get(edge.to)!
        );
        
        const results = await Promise.all(
            parallelNodes.map(node => node.agent.execute(input))
        );
        
        // Aggregate results
        const aggregated = this.aggregateResults(results);
        
        return { results: aggregated, pattern: 'parallel' };
    }
    
    private async executeConsensus(input: GraphInput): Promise<GraphOutput> {
        const startNode = this.nodes.get(input.startNode)!;
        const consensusNodes = this.edges.get(startNode.id)!.map(edge => 
            this.nodes.get(edge.to)!
        );
        
        // Execute all agents in parallel
        const results = await Promise.all(
            consensusNodes.map(node => node.agent.execute(input))
        );
        
        // Vote on best result
        const consensus = this.voteOnResult(results);
        
        return { results: [consensus], pattern: 'consensus' };
    }
    
    private async executeLayered(input: GraphInput): Promise<GraphOutput> {
        // Hierarchical orchestration
        const results: AgentResult[] = [];
        
        // Execute layer by layer
        for (const layer of this.getLayers()) {
            const layerResults = await this.executeLayer(layer, input);
            results.push(...layerResults);
        }
        
        return { results, pattern: 'layered' };
    }
    
    private async executeProducerReviewer(input: GraphInput): Promise<GraphOutput> {
        const producerNode = this.nodes.get(input.startNode)!;
        const reviewerNodeId = this.edges.get(producerNode.id)![0].to;
        const reviewerNode = this.nodes.get(reviewerNodeId)!;
        
        // Producer generates output
        const producerResult = await producerNode.agent.execute(input);
        
        // Reviewer critiques
        const critique = await reviewerNode.agent.execute({
            ...input,
            context: producerResult.output,
        });
        
        return { 
            results: [producerResult, critique], 
            pattern: 'producer-reviewer' 
        };
    }
    
    private async executeGroupChat(input: GraphInput): Promise<GraphOutput> {
        const groupNodes = this.edges.get(input.startNode)!.map(edge => 
            this.nodes.get(edge.to)!
        );
        
        const messages: ChatMessage[] = [];
        const results: AgentResult[] = [];
        
        // Simulate group chat
        for (let i = 0; i < input.maxIterations; i++) {
            // Each agent contributes
            for (const node of groupNodes) {
                const result = await node.agent.execute({
                    ...input,
                    chatHistory: messages,
                });
                
                messages.push({
                    agent: node.id,
                    message: result.output,
                    timestamp: Date.now(),
                });
                
                results.push(result);
            }
            
            // Check for consensus
            if (this.hasConsensus(messages)) {
                break;
            }
        }
        
        return { results, pattern: 'group-chat' };
    }
    
    private async executeSpecialistSwarm(input: GraphInput): Promise<GraphOutput> {
        const specialistNodes = this.edges.get(input.startNode)!.map(edge => 
            this.nodes.get(edge.to)!
        );
        
        // Execute all specialists in parallel
        const results = await Promise.all(
            specialistNodes.map(node => node.agent.execute({
                ...input,
                specialization: node.specialization,
            }))
        );
        
        // Aggregate specialist results
        const aggregated = this.aggregateSpecialistResults(results);
        
        return { results: aggregated, pattern: 'specialist-swarm' };
    }
    
    private async executeCriticRefiner(input: GraphInput): Promise<GraphOutput> {
        const criticNode = this.nodes.get(input.startNode)!;
        const refinerNodeId = this.edges.get(criticNode.id)![0].to;
        const refinerNode = this.nodes.get(refinerNodeId)!;
        
        const results: AgentResult[] = [];
        let currentOutput = input.initialOutput;
        
        for (let i = 0; i < input.maxIterations; i++) {
            // Critic critiques current output
            const critique = await criticNode.agent.execute({
                ...input,
                context: currentOutput,
            });
            
            results.push(critique);
            
            // Refiner improves output
            const refined = await refinerNode.agent.execute({
                ...input,
                context: currentOutput,
                critique: critique.output,
            });
            
            results.push(refined);
            currentOutput = refined.output;
            
            // Check for convergence
            if (this.hasConverged(currentOutput, refined.output)) {
                break;
            }
        }
        
        return { results, pattern: 'critic-refiner' };
    }
}
```

**Agent Node with Specialized Capabilities:**

```typescript
// src/lib/agent/orchestration/agent-node.ts
export interface AgentNode {
    id: string;
    agent: Agent;
    specialization?: string;
    capabilities: string[];
}

export class AgentFactory {
    createSpecialistAgent(type: SpecialistType): Agent {
        switch (type) {
            case 'code-reviewer':
                return this.createCodeReviewer();
            case 'security-analyst':
                return this.createSecurityAnalyst();
            case 'performance-optimizer':
                return this.createPerformanceOptimizer();
            case 'documentation-writer':
                return this.createDocumentationWriter();
            case 'test-engineer':
                return this.createTestEngineer();
            default:
                throw new Error(`Unknown specialist type: ${type}`);
        }
    }
    
    private createCodeReviewer(): Agent {
        return {
            id: 'code-reviewer',
            name: 'Code Reviewer',
            mode: 'MODE_CODE_REVIEW',
            systemPrompt: `
You are a code reviewer focused on:
- Code quality and best practices
- Security vulnerabilities
- Performance optimization
- Test coverage
            `,
            tools: ['read_file', 'list_files'],
        };
    }
    
    private createSecurityAnalyst(): Agent {
        return {
            id: 'security-analyst',
            name: 'Security Analyst',
            mode: 'MODE_SECURITY_ANALYSIS',
            systemPrompt: `
You are a security analyst focused on:
- Identifying vulnerabilities
- Security best practices
- Compliance requirements
- Risk assessment
            `,
            tools: ['read_file', 'list_files', 'execute_command'],
        };
    }
}
```

**Message Passing and Coordination:**

```typescript
// src/lib/agent/orchestration/message-bus.ts
export class MessageBus {
    private channels: Map<string, MessageChannel> = new Map();
    
    createChannel(name: string): MessageChannel {
        const channel = new MessageChannel(name);
        this.channels.set(name, channel);
        return channel;
    }
    
    async publish(channelName: string, message: AgentMessage): Promise<void> {
        const channel = this.channels.get(channelName);
        if (!channel) {
            throw new Error(`Channel ${channelName} not found`);
        }
        
        await channel.publish(message);
    }
    
    async subscribe(
        channelName: string,
        handler: (message: AgentMessage) => void
    ): Promise<Subscription> {
        const channel = this.channels.get(channelName);
        if (!channel) {
            throw new Error(`Channel ${channelName} not found`);
        }
        
        return await channel.subscribe(handler);
    }
}

export class MessageChannel {
    private subscribers: Set<(message: AgentMessage) => void> = new Set();
    private messageHistory: AgentMessage[] = [];
    
    async publish(message: AgentMessage): Promise<void> {
        this.messageHistory.push(message);
        
        // Notify all subscribers
        const promises = Array.from(this.subscribers).map(subscriber => 
            Promise.resolve(subscriber(message))
        );
        
        await Promise.all(promises);
    }
    
    async subscribe(
        handler: (message: AgentMessage) => void
    ): Promise<Subscription> {
        this.subscribers.add(handler);
        
        return {
            unsubscribe: () => {
                this.subscribers.delete(handler);
            },
        };
    }
}
```

#### Acceptance Criteria

- [ ] Agent graph with state persistence working
- [ ] Agent nodes with specialized capabilities implemented
- [ ] Message passing and coordination working
- [ ] Sequential, parallel, and consensus patterns supported
- [ ] Layered, producer-reviewer, group-chat patterns supported
- [ ] Specialist swarms and critic-refiner loops supported
- [ ] Test suite with 90%+ coverage
- [ ] Browser E2E verification of orchestration

#### Implementation Tasks

1. Create Agent Graph with state persistence
2. Implement all 8 orchestration patterns
3. Create specialist agent factory
4. Implement message bus for agent coordination
5. Add agent nodes with specialized capabilities
6. Write comprehensive tests for orchestration
7. Perform browser E2E verification
8. Update documentation

#### Success Metrics

- 100% of orchestration patterns implemented
- Agent coordination latency < 1s
- 100% test coverage for orchestration
- Zero agent coordination failures

---

### Epic R-12: Implement NotebookLM + Notion Integration

**Epic ID:** R-12
**Priority:** MEDIUM
**Domain:** Domain 3 (Knowledge Synthesis & RAG Infrastructure)
**Estimated Effort:** 2 weeks
**Dependencies:** R-06 (Ollama Embedding Service)

#### Problem Statement

No bidirectional synchronization with external knowledge bases. Limited knowledge synthesis capabilities without NotebookLM + Notion integration for artifact generation and citation tracking.

#### Technical Specification

**Notion API Client:**

```typescript
// src/lib/external/notion-client.ts
export class NotionClient {
    private client: NotionClient;
    private apiKey: string;
    
    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.client = new NotionClient({ auth: apiKey });
    }
    
    async createPage(parentId: string, content: PageContent): Promise<string> {
        const page = await this.client.pages.create({
            parent: { page_id: parentId },
            properties: {
                title: {
                    title: [{ text: content.title }],
                },
            },
            children: content.blocks,
        });
        
        return page.id;
    }
    
    async updatePage(pageId: string, updates: Partial<PageContent>): Promise<void> {
        await this.client.pages.update({
            page_id: pageId,
            properties: updates.properties,
            archived: updates.archived,
        });
    }
    
    async getPage(pageId: string): Promise<Page> {
        const page = await this.client.pages.retrieve({ page_id: pageId });
        return page;
    }
    
    async searchPages(query: string): Promise<Page[]> {
        const response = await this.client.search({
            query: query,
            filter: {
                value: 'page',
                property: 'object',
            },
        });
        
        return response.results;
    }
    
    async syncDocument(documentId: string, notionPageId: string): Promise<void> {
        // Sync document content to Notion page
        const document = await this.getDocument(documentId);
        const pageContent = this.convertToNotionFormat(document);
        
        await this.updatePage(notionPageId, pageContent);
    }
}
```

**Artifact Generation Service:**

```typescript
// src/lib/knowledge/artifact-generator.ts
export class ArtifactGenerator {
    async generateArtifact(
        content: string,
        type: ArtifactType,
        options?: ArtifactOptions
    ): Promise<Artifact> {
        switch (type) {
            case 'diagram':
                return await this.generateDiagram(content, options);
            case 'chart':
                return await this.generateChart(content, options);
            case 'summary':
                return await this.generateSummary(content, options);
            case 'timeline':
                return await this.generateTimeline(content, options);
            case 'mindmap':
                return await this.generateMindMap(content, options);
            default:
                throw new Error(`Unknown artifact type: ${type}`);
        }
    }
    
    private async generateDiagram(
        content: string,
        options?: ArtifactOptions
    ): Promise<Artifact> {
        // Generate diagram (Mermaid, PlantUML, etc.)
        const diagram = await this.parseContentToDiagram(content);
        
        return {
            id: generateUUID(),
            type: 'diagram',
            content: diagram,
            format: options?.format || 'mermaid',
            metadata: {
                generatedAt: new Date().toISOString(),
                source: content,
            },
        };
    }
    
    private async generateChart(
        content: string,
        options?: ArtifactOptions
    ): Promise<Artifact> {
        // Generate chart (Chart.js, D3.js, etc.)
        const data = await this.parseContentToChartData(content);
        const chartConfig = this.buildChartConfig(data, options);
        
        return {
            id: generateUUID(),
            type: 'chart',
            content: chartConfig,
            format: options?.format || 'json',
            metadata: {
                generatedAt: new Date().toISOString(),
                source: content,
            },
        };
    }
    
    private async generateSummary(
        content: string,
        options?: ArtifactOptions
    ): Promise<Artifact> {
        // Generate summary using AI
        const summary = await this.aiService.summarize({
            content,
            maxLength: options?.maxLength || 500,
            style: options?.style || 'concise',
        });
        
        return {
            id: generateUUID(),
            type: 'summary',
            content: summary,
            format: 'text',
            metadata: {
                generatedAt: new Date().toISOString(),
                source: content,
            },
        };
    }
    
    private async generateTimeline(
        content: string,
        options?: ArtifactOptions
    ): Promise<Artifact> {
        // Generate timeline from content
        const events = await this.parseContentToEvents(content);
        const timeline = this.buildTimeline(events);
        
        return {
            id: generateUUID(),
            type: 'timeline',
            content: timeline,
            format: options?.format || 'json',
            metadata: {
                generatedAt: new Date().toISOString(),
                source: content,
            },
        };
    }
}
```

**Citation Tracking System:**

```typescript
// src/lib/knowledge/citation-tracker.ts
export class CitationTracker {
    private citations: Map<string, Citation> = new Map();
    
    addCitation(citation: Citation): void {
        this.citations.set(citation.id, citation);
    }
    
    getCitation(id: string): Citation | undefined {
        return this.citations.get(id);
    }
    
    getCitationsForDocument(documentId: string): Citation[] {
        return Array.from(this.citations.values())
            .filter(c => c.documentId === documentId);
    }
    
    generateCitationReference(citation: Citation): string {
        switch (citation.type) {
            case 'direct-quote':
                return `"${citation.text}" (${citation.source}, ${citation.pageNumber})`;
            case 'paraphrased':
                return `(${citation.source}, ${citation.pageNumber})`;
            case 'synthesis':
                return `Synthesized from ${citation.sources.join(', ')}`;
            case 'contrasting-view':
                return `Contrasting view from ${citation.sources.join(', ')}`;
            default:
                return citation.source;
        }
    }
    
    async validateCitations(documentId: string): Promise<ValidationResult> {
        const citations = this.getCitationsForDocument(documentId);
        
        // Validate citations
        const valid = citations.filter(c => this.isCitationValid(c));
        const invalid = citations.filter(c => !this.isCitationValid(c));
        
        return {
            valid,
            invalid,
            score: valid.length / citations.length,
        };
    }
    
    private isCitationValid(citation: Citation): boolean {
        // Check if citation has required fields
        return !!(
            citation.id &&
            citation.source &&
            citation.type &&
            citation.text
        );
    }
}
```

**Bidirectional Synchronization:**

```typescript
// src/lib/knowledge/bidirectional-sync.ts
export class BidirectionalSync {
    private notionClient: NotionClient;
    private localStore: LocalDocumentStore;
    private conflictResolver: ConflictResolver;
    
    async syncToNotion(documentId: string): Promise<SyncResult> {
        const localDoc = await this.localStore.get(documentId);
        const notionPages = await this.notionClient.searchPages(localDoc.title);
        
        if (notionPages.length === 0) {
            // Create new page
            const pageId = await this.notionClient.createPage(
                localDoc.parentId,
                this.convertToNotionFormat(localDoc)
            );
            
            return {
                action: 'created',
                notionPageId: pageId,
                conflicts: [],
            };
        } else {
            // Check for conflicts
            const conflicts = await this.detectConflicts(localDoc, notionPages);
            
            if (conflicts.length > 0) {
                const resolution = await this.conflictResolver.resolve(conflicts);
                await this.applyResolution(documentId, resolution);
                
                return {
                    action: 'resolved',
                    conflicts,
                    resolution,
                };
            } else {
                // Update existing page
                await this.notionClient.updatePage(
                    notionPages[0].id,
                    this.convertToNotionFormat(localDoc)
                );
                
                return {
                    action: 'updated',
                    notionPageId: notionPages[0].id,
                    conflicts: [],
                };
            }
        }
    }
    
    async syncFromNotion(notionPageId: string): Promise<SyncResult> {
        const notionPage = await this.notionClient.getPage(notionPageId);
        const localDocs = await this.localStore.search(notionPage.properties.title);
        
        if (localDocs.length === 0) {
            // Create new local document
            const docId = await this.localStore.create(
                this.convertFromNotionFormat(notionPage)
            );
            
            return {
                action: 'created',
                documentId: docId,
                conflicts: [],
            };
        } else {
            // Check for conflicts
            const conflicts = await this.detectConflicts(
                this.convertFromNotionFormat(notionPage),
                localDocs
            );
            
            if (conflicts.length > 0) {
                const resolution = await this.conflictResolver.resolve(conflicts);
                await this.applyResolution(notionPageId, resolution);
                
                return {
                    action: 'resolved',
                    conflicts,
                    resolution,
                };
            } else {
                // Update existing document
                await this.localStore.update(
                    localDocs[0].id,
                    this.convertFromNotionFormat(notionPage)
                );
                
                return {
                    action: 'updated',
                    documentId: localDocs[0].id,
                    conflicts: [],
                };
            }
        }
    }
    
    private async detectConflicts(
        localDoc: Document,
        notionPages: Page[]
    ): Promise<Conflict[]> {
        const conflicts: Conflict[] = [];
        
        for (const page of notionPages) {
            if (this.hasConflict(localDoc, page)) {
                conflicts.push({
                    id: generateUUID(),
                    record1: { id: localDoc.id, content: localDoc },
                    record2: { id: page.id, content: this.convertFromNotionFormat(page) },
                    type: 'bidirectional-sync',
                    severity: 'medium',
                });
            }
        }
        
        return conflicts;
    }
}
```

#### Acceptance Criteria

- [ ] Notion API client working
- [ ] Artifact generation service implemented
- [ ] Citation and provenance tracking working
- [ ] Bidirectional sync with conflict resolution complete
- [ ] Support for diagrams, charts, summaries, timelines
- [ ] Test suite with 90%+ coverage
- [ ] Browser E2E verification of Notion integration

#### Implementation Tasks

1. Create Notion API client
2. Implement artifact generation service
3. Create citation tracking system
4. Implement bidirectional synchronization
5. Add conflict resolution for sync
6. Write comprehensive tests for integration
7. Perform browser E2E verification
8. Update documentation

#### Success Metrics

- 100% of Notion API features implemented
- Artifact generation accuracy > 85%
- Citation validation accuracy > 90%
- Sync success rate > 95%
- 100% test coverage for integration

---

## 5. P2 Priority Epics (UX Improvements)

### Epic R-13: Add Dynamic UI Feedback

**Epic ID:** R-13
**Priority:** P2
**Domain:** Domain 1 (LLM Provider Configuration)
**Estimated Effort:** 1 week
**Dependencies:** R-05 (Complete CRUD Surface)

#### Problem Statement

Labels and statistics don't update during user input. No real-time validation or progress indicators. Poor UX with delayed feedback and lack of immediate response.

#### Technical Specification

**Real-Time Validation:**

```typescript
// src/components/ui/real-time-validation.tsx
import { useState, useEffect } from 'react';
import { z } from 'zod';

export const useRealTimeValidation = <T>(
    schema: z.ZodSchema<T>,
    initialValue: T
) => {
    const [value, setValue] = useState<T>(initialValue);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isValidating, setIsValidating] = useState(false);
    
    const validateField = async (fieldName: keyof T, fieldValue: any) => {
        setIsValidating(true);
        
        try {
            // Validate against schema
            const result = await schema.safeParseAsync({
                ...value,
                [fieldName]: fieldValue,
            });
            
            if (!result.success) {
                setErrors(prev => ({
                    ...prev,
                    [fieldName as string]: result.error.errors[0].message,
                }));
            } else {
                setErrors(prev => {
                    ...prev,
                    [fieldName as string]: '',
                }));
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                [fieldName as string]: error.message,
            }));
        } finally {
            setIsValidating(false);
        }
    };
    
    const isValid = Object.keys(errors).length === 0 && !isValidating;
    
    return {
        value,
        setValue,
        errors,
        isValidating,
        isValid,
        validateField,
    };
};
```

**Progress Indicators:**

```typescript
// src/components/ui/progress-indicator.tsx
export const ProgressIndicator = ({ 
    steps, 
    currentStep, 
    status 
}: ProgressIndicatorProps) => {
    const progress = (currentStep / steps.length) * 100;
    
    return (
        <div className="progress-indicator">
            <div className="progress-bar">
                <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="progress-steps">
                {steps.map((step, index) => (
                    <div 
                        key={index}
                        className={`step ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
                    >
                        <StepIcon step={step} status={status} />
                        <StepLabel>{step.label}</StepLabel>
                    </div>
                ))}
            </div>
            <div className="progress-text">
                {steps[currentStep]?.description}
            </div>
        </div>
    );
};
```

**Loading States:**

```typescript
// src/components/ui/loading-state.tsx
export const LoadingState = ({ 
    isLoading, 
    message, 
    variant = 'spinner' 
}: LoadingStateProps) => {
    return (
        <div className={`loading-state ${isLoading ? 'visible' : 'hidden'}`}>
            {variant === 'spinner' && <Spinner />}
            {variant === 'skeleton' && <Skeleton />}
            {variant === 'dots' && <Dots />}
            {message && <p className="loading-message">{message}</p>}
        </div>
    );
};
```

**Error Handling with Rollback:**

```typescript
// src/components/ui/error-boundary.tsx
export const ErrorBoundary = ({ 
    children, 
    fallback, 
    onError 
}: ErrorBoundaryProps) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const handleReset = () => {
        setHasError(false);
        setError(null);
    };
    
    const handleError = (error: Error, errorInfo: ErrorInfo) => {
        setHasError(true);
        setError(error);
        
        // Call custom error handler
        if (onError) {
            onError(error, errorInfo);
        }
        
        // Log error
        console.error('Error caught by boundary:', error, errorInfo);
    };
    
    if (hasError) {
        return (
            <div className="error-fallback">
                <h2>Something went wrong</h2>
                <p>{error?.message}</p>
                <button onClick={handleReset}>Try again</button>
                {fallback}
            </div>
        );
    }
    
    return (
        <ErrorBoundaryImpl onError={handleError}>
            {children}
        </ErrorBoundaryImpl>
    );
};
```

#### Acceptance Criteria

- [ ] All form fields have real-time validation
- [ ] Progress indicators for async operations
- [ ] Error messages shown immediately
- [ ] Loading states prevent duplicate operations
- [ ] Feedback provided within 100ms
- [ ] Error boundary with rollback working
- [ ] Test suite with 95%+ coverage
- [ ] Browser E2E verification of dynamic feedback

#### Implementation Tasks

1. Create real-time validation hook
2. Implement progress indicator component
3. Add loading states for all async operations
4. Create error boundary with rollback
5. Update all forms with real-time validation
6. Add progress indicators to CRUD operations
7. Write comprehensive tests for UI feedback
8. Perform browser E2E verification
9. Update documentation

#### Success Metrics

- 100% of forms have real-time validation
- UI feedback latency < 100ms
- 100% test coverage for UI feedback
- Zero user confusion from delayed feedback

---

### Epic R-14: Fix Multi-Provider Race Conditions

**Epic ID:** R-14
**Priority:** P2
**Domain:** Domain 1 (LLM Provider Configuration)
**Estimated Effort:** 1 week
**Dependencies:** R-02 (Atomic Updates)

#### Problem Statement

Concurrent provider fetches cause conflicts, no shared loading state or error handling. Performance issues, API rate limiting, and inconsistent state from uncoordinated provider operations.

#### Technical Specification

**Shared Loading State:**

```typescript
// src/lib/agent/providers/loading-coordinator.ts
export class LoadingCoordinator {
    private loadingStates: Map<string, LoadingState> = new Map();
    private queue: Map<string, Promise<any>[]> = new Map();
    
    async loadModels(providerId: string): Promise<Model[]> {
        // Check if already loading
        if (this.isLoading(providerId)) {
            // Return existing promise
            return this.getFirstPromise(providerId);
        }
        
        // Set loading state
        this.setLoading(providerId, {
            isLoading: true,
            startedAt: Date.now(),
        });
        
        try {
            const promise = this.fetchModels(providerId);
            this.addToQueue(providerId, promise);
            
            const result = await promise;
            
            this.setLoading(providerId, {
                isLoading: false,
                completedAt: Date.now(),
                data: result,
            });
            
            return result;
        } catch (error) {
            this.setLoading(providerId, {
                isLoading: false,
                completedAt: Date.now(),
                error: error as Error,
            });
            
            throw error;
        } finally {
            this.removeFromQueue(providerId, promise);
        }
    }
    
    isLoading(providerId: string): boolean {
        const state = this.loadingStates.get(providerId);
        return !!state?.isLoading;
    }
    
    getLoadingState(providerId: string): LoadingState | undefined {
        return this.loadingStates.get(providerId);
    }
    
    private async fetchModels(providerId: string): Promise<Model[]> {
        const provider = providerAdapterFactory.createAdapter(providerId);
        return await provider.getModels();
    }
    
    private setLoading(providerId: string, state: LoadingState): void {
        this.loadingStates.set(providerId, state);
        this.emit('loading:changed', { providerId, state });
    }
    
    private addToQueue(providerId: string, promise: Promise<any>): void {
        if (!this.queue.has(providerId)) {
            this.queue.set(providerId, []);
        }
        this.queue.get(providerId)!.push(promise);
    }
    
    private removeFromQueue(providerId: string, promise: Promise<any>): void {
        const queue = this.queue.get(providerId);
        if (queue) {
            const index = queue.indexOf(promise);
            if (index > -1) {
                queue.splice(index, 1);
            }
        }
    }
    
    private getFirstPromise(providerId: string): Promise<any> | undefined {
        const queue = this.queue.get(providerId);
        return queue?.[0];
    }
}
```

**Rate Limiting:**

```typescript
// src/lib/agent/providers/rate-limiter.ts
export class RateLimiter {
    private requests: Map<string, RequestLog[]> = new Map();
    private limits: Map<string, RateLimit> = new Map();
    
    async execute<T>(
        providerId: string,
        operation: () => Promise<T>
    ): Promise<T> {
        const limit = this.getLimit(providerId);
        const now = Date.now();
        
        // Check rate limit
        if (this.isRateLimited(providerId, now, limit)) {
            const waitTime = this.getWaitTime(providerId, now, limit);
            await this.sleep(waitTime);
        }
        
        // Execute operation
        const result = await operation();
        
        // Log request
        this.logRequest(providerId, now);
        
        return result;
    }
    
    private isRateLimited(
        providerId: string,
        now: number,
        limit: RateLimit
    ): boolean {
        const requests = this.requests.get(providerId) || [];
        const recentRequests = requests.filter(
            r => r.timestamp > now - limit.windowMs
        );
        
        return recentRequests.length >= limit.maxRequests;
    }
    
    private getWaitTime(
        providerId: string,
        now: number,
        limit: RateLimit
    ): number {
        const requests = this.requests.get(providerId) || [];
        const oldestRequest = requests
            .filter(r => r.timestamp > now - limit.windowMs)
            .sort((a, b) => a.timestamp - b.timestamp)[0];
        
        if (!oldestRequest) return 0;
        
        return limit.windowMs - (now - oldestRequest.timestamp);
    }
    
    private logRequest(providerId: string, timestamp: number): void {
        if (!this.requests.has(providerId)) {
            this.requests.set(providerId, []);
        }
        
        this.requests.get(providerId)!.push({
            timestamp,
            success: true,
        });
    }
    
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

**Error Handling with Retry:**

```typescript
// src/lib/agent/providers/error-handler.ts
export class ProviderErrorHandler {
    private maxRetries: number = 3;
    private retryDelay: number = 1000;
    
    async executeWithRetry<T>(
        providerId: string,
        operation: () => Promise<T>
    ): Promise<T> {
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const result = await operation();
                
                // Success - clear error state
                this.clearError(providerId);
                
                return result;
            } catch (error) {
                lastError = error as Error;
                
                // Log error
                console.error(`Attempt ${attempt} failed:`, error);
                
                // Wait before retry
                if (attempt < this.maxRetries) {
                    await this.sleep(this.retryDelay * attempt);
                }
            }
        }
        
        // All retries failed
        this.setError(providerId, lastError!);
        
        throw lastError;
    }
    
    private clearError(providerId: string): void {
        // Clear error state for provider
    }
    
    private setError(providerId: string, error: Error): void {
        // Set error state for provider
    }
    
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

#### Acceptance Criteria

- [ ] Shared loading state for all providers
- [ ] Rate limiting implemented and enforced
- [ ] Error handling with retry logic
- [ ] No race conditions from concurrent provider fetches
- [ ] Performance improvements (reduced API calls)
- [ ] Test suite with 95%+ coverage
- [ ] Browser E2E verification of multi-provider coordination

#### Implementation Tasks

1. Create loading coordinator for shared state
2. Implement rate limiting for provider APIs
3. Add error handler with retry logic
4. Update provider adapter factory to use coordinator
5. Add loading indicators to UI
6. Write comprehensive tests for coordination
7. Perform browser E2E verification
8. Update documentation

#### Success Metrics

- Zero race conditions from concurrent operations
- 100% of provider operations coordinated
- API call reduction > 30%
- 100% test coverage for coordination

---

### Epic R-15: Enhance Approval Workflow Integration

**Epic ID:** R-15
**Priority:** P2
**Domain:** Domain 2 (Agent Configuration & Architecture)
**Estimated Effort:** 1 week
**Dependencies:** R-04 (5-Layer Agent System)

#### Problem Statement

Approval workflow not integrated with chatflow risk assessment. Inconsistent approval workflow across different agent operations and lack of risk-based approval requirements.

#### Technical Specification

**Risk Assessment:**

```typescript
// src/lib/agent/approval/risk-assessor.ts
export class RiskAssessor {
    async assessRisk(
        operation: AgentOperation,
        context: OperationContext
    ): Promise<RiskAssessment> {
        const riskFactors: RiskFactor[] = [];
        
        // Assess operation type
        const typeRisk = this.assessOperationType(operation);
        if (typeRisk) riskFactors.push(typeRisk);
        
        // Assess file operations
        const fileRisk = this.assessFileOperation(operation);
        if (fileRisk) riskFactors.push(fileRisk);
        
        // Assess command operations
        const commandRisk = this.assessCommandOperation(operation);
        if (commandRisk) riskFactors.push(commandRisk);
        
        // Calculate overall risk level
        const riskLevel = this.calculateRiskLevel(riskFactors);
        
        return {
            riskLevel,
            riskFactors,
            requiresApproval: riskLevel !== 'low',
            suggestedApprover: this.getSuggestedApprover(riskLevel),
            approvalMessage: this.generateApprovalMessage(riskLevel, riskFactors),
        };
    }
    
    private assessOperationType(operation: AgentOperation): RiskFactor | null {
        const destructiveOps = ['delete_file', 'execute_command', 'write_file'];
        
        if (destructiveOps.includes(operation.type)) {
            return {
                type: 'operation-type',
                level: 'high',
                description: `Destructive operation: ${operation.type}`,
            };
        }
        
        return null;
    }
    
    private assessFileOperation(operation: AgentOperation): RiskFactor | null {
        if (operation.type === 'delete_file') {
            return {
                type: 'file-operation',
                level: 'high',
                description: 'File deletion operation',
            };
        }
        
        if (operation.type === 'write_file') {
            const path = operation.args.path;
            if (this.isSystemFile(path)) {
                return {
                    type: 'file-operation',
                    level: 'high',
                    description: 'System file modification',
                };
            }
        }
        
        return null;
    }
    
    private assessCommandOperation(operation: AgentOperation): RiskFactor | null {
        if (operation.type !== 'execute_command') return null;
        
        const command = operation.args.command;
        const dangerousCommands = ['rm', 'dd', 'mkfs', 'format', 'fdisk'];
        
        if (dangerousCommands.some(cmd => command.startsWith(cmd))) {
            return {
                type: 'command-operation',
                level: 'critical',
                description: `Dangerous command: ${command}`,
            };
        }
        
        return null;
    }
    
    private calculateRiskLevel(factors: RiskFactor[]): RiskLevel {
        if (factors.some(f => f.level === 'critical')) return 'critical';
        if (factors.some(f => f.level === 'high')) return 'high';
        if (factors.some(f => f.level === 'medium')) return 'medium';
        return 'low';
    }
    
    private getSuggestedApprover(riskLevel: RiskLevel): string {
        switch (riskLevel) {
            case 'critical':
                return 'admin';
            case 'high':
                return 'senior-developer';
            case 'medium':
                return 'developer';
            case 'low':
                return 'auto-approved';
        }
    }
    
    private generateApprovalMessage(
        riskLevel: RiskLevel,
        factors: RiskFactor[]
    ): string {
        const factorDescriptions = factors.map(f => f.description).join('; ');
        
        switch (riskLevel) {
            case 'critical':
                return `CRITICAL: ${factorDescriptions}. Requires admin approval.`;
            case 'high':
                return `HIGH RISK: ${factorDescriptions}. Requires senior developer approval.`;
            case 'medium':
                return `MODERATE RISK: ${factorDescriptions}. Requires developer approval.`;
            case 'low':
                return `LOW RISK: ${factorDescriptions}. Auto-approved.`;
        }
    }
    
    private isSystemFile(path: string): boolean {
        const systemPaths = [
            '/etc/',
            '/usr/',
            '/bin/',
            '/sbin/',
            '/sys/',
            '/proc/',
            '/dev/',
        ];
        
        return systemPaths.some(sysPath => path.startsWith(sysPath));
    }
}
```

**Approval Workflow:**

```typescript
// src/lib/agent/approval/approval-workflow.ts
export class ApprovalWorkflow {
    private riskAssessor: RiskAssessor;
    private pendingApprovals: Map<string, ApprovalRequest> = new Map();
    
    async requestApproval(
        operation: AgentOperation,
        context: OperationContext
    ): Promise<ApprovalResult> {
        // Step 1: Assess risk
        const assessment = await this.riskAssessor.assessRisk(operation, context);
        
        // Step 2: Check if auto-approved
        if (!assessment.requiresApproval) {
            return {
                approved: true,
                autoApproved: true,
                riskLevel: assessment.riskLevel,
            };
        }
        
        // Step 3: Create approval request
        const request: ApprovalRequest = {
            id: generateUUID(),
            operation,
            context,
            assessment,
            status: 'pending',
            createdAt: Date.now(),
        };
        
        this.pendingApprovals.set(request.id, request);
        
        // Step 4: Notify approver
        await this.notifyApprover(request);
        
        return {
            approved: false,
            requestId: request.id,
            riskLevel: assessment.riskLevel,
            approver: assessment.suggestedApprover,
            message: assessment.approvalMessage,
        };
    }
    
    async approve(requestId: string, approver: string): Promise<void> {
        const request = this.pendingApprovals.get(requestId);
        if (!request) {
            throw new Error(`Approval request ${requestId} not found`);
        }
        
        // Validate approver
        if (!this.canApprove(approver, request.assessment.suggestedApprover)) {
            throw new Error(`Approver ${approver} not authorized`);
        }
        
        // Update request status
        request.status = 'approved';
        request.approvedAt = Date.now();
        request.approver = approver;
        
        this.pendingApprovals.set(requestId, request);
        
        // Execute operation
        await this.executeOperation(request.operation);
        
        // Notify requester
        await this.notifyApproved(request);
    }
    
    async deny(requestId: string, approver: string, reason: string): Promise<void> {
        const request = this.pendingApprovals.get(requestId);
        if (!request) {
            throw new Error(`Approval request ${requestId} not found`);
        }
        
        // Update request status
        request.status = 'denied';
        request.deniedAt = Date.now();
        request.approver = approver;
        request.denyReason = reason;
        
        this.pendingApprovals.set(requestId, request);
        
        // Notify requester
        await this.notifyDenied(request);
    }
    
    private canApprove(approver: string, suggestedApprover: string): boolean {
        // Check if approver has sufficient permissions
        const approverLevel = this.getApproverLevel(approver);
        const suggestedLevel = this.getApproverLevel(suggestedApprover);
        
        return approverLevel >= suggestedLevel;
    }
    
    private getApproverLevel(approver: string): number {
        const levels = {
            'admin': 4,
            'senior-developer': 3,
            'developer': 2,
            'user': 1,
        };
        
        return levels[approver as keyof typeof levels] || 1;
    }
    
    private async executeOperation(operation: AgentOperation): Promise<void> {
        // Execute the approved operation
        switch (operation.type) {
            case 'read_file':
                await fileTools.read(operation.args);
                break;
            case 'write_file':
                await fileTools.write(operation.args);
                break;
            case 'delete_file':
                await fileTools.delete(operation.args);
                break;
            case 'execute_command':
                await terminalTools.execute(operation.args);
                break;
        }
    }
    
    private async notifyApprover(request: ApprovalRequest): Promise<void> {
        // Send notification to approver
        // ... implementation details
    }
    
    private async notifyApproved(request: ApprovalRequest): Promise<void> {
        // Send approval notification to requester
        // ... implementation details
    }
    
    private async notifyDenied(request: ApprovalRequest): Promise<void> {
        // Send denial notification to requester
        // ... implementation details
    }
}
```

**Integration with Chatflow:**

```typescript
// src/lib/agent/approval/chatflow-integration.ts
export class ChatflowApprovalIntegration {
    private approvalWorkflow: ApprovalWorkflow;
    private chatflowComposer: ChatflowComposer;
    
    async composeWithApproval(
        agentConfig: AgentConfig,
        chatflow: ChatflowComposition,
        operation: AgentOperation
    ): Promise<ComposedPrompt> {
        // Step 1: Assess risk
        const assessment = await this.approvalWorkflow.riskAssessor.assessRisk(
            operation,
            { agentConfig, chatflow }
        );
        
        // Step 2: Add approval layer if required
        if (assessment.requiresApproval) {
            const approvalLayer: LayerDefinition = {
                id: 'approval-layer',
                name: 'Approval Requirements',
                description: 'Approval workflow requirements',
                priority: 100,
                content: () => `
APPROVAL REQUIRED: ${assessment.approvalMessage}
Approver: ${assessment.suggestedApprover}
Risk Level: ${assessment.riskLevel}
Risk Factors:
${assessment.riskFactors.map(f => `- ${f.description}`).join('\n')}
`,
                isHidden: false,
                required: true,
            };
            
            chatflow.layers.push('approval-layer');
        }
        
        // Step 3: Compose system prompt
        const systemPrompt = this.chatflowComposer.compose(agentConfig, chatflow);
        
        return {
            systemPrompt,
            requiresApproval: assessment.requiresApproval,
            riskLevel: assessment.riskLevel,
            assessment,
        };
    }
}
```

#### Acceptance Criteria

- [ ] Risk assessment implemented for all agent operations
- [ ] Approval workflow with request/approve/deny working
- [ ] Integration with chatflow composition complete
- [ ] Risk-based approval requirements enforced
- [ ] Approval notifications working
- [ ] Test suite with 95%+ coverage
- [ ] Browser E2E verification of approval workflow

#### Implementation Tasks

1. Create risk assessor for agent operations
2. Implement approval workflow with request/approve/deny
3. Integrate approval with chatflow composition
4. Add approval notifications
5. Update ApprovalOverlay component with risk assessment
6. Write comprehensive tests for approval workflow
7. Perform browser E2E verification
8. Update documentation

#### Success Metrics

- 100% of operations have risk assessment
- Approval workflow success rate > 98%
- Zero unauthorized operations
- 100% test coverage for approval workflow

---

## 6. Execution Sequence and Dependencies

### Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    Remediation Epics Dependencies                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                  │
│  P0 Epics (Weeks 1-4)                                     │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-01: Hot-Reloading Fix (2 weeks)                      │   │
│  │   Dependencies: None                                          │   │
│  │   Blocks: R-04 (5-Layer System)                           │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-02: Atomic State Updates (2 weeks)                       │   │
│  │   Dependencies: R-01                                        │   │
│  │   Blocks: R-05 (Complete CRUD)                               │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-03: Qdrant Vector Store (2 weeks)                        │   │
│  │   Dependencies: None                                          │   │
│  │   Blocks: R-06 (Ollama Embeddings), R-08 (Neo4j)        │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-04: 5-Layer Agent System (2 weeks)                        │   │
│  │   Dependencies: R-01                                        │   │
│  │   Blocks: R-07 (Chatflow Composition)                           │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  P1 Epics (Weeks 5-6)                                       │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-05: Complete CRUD Surface (2 weeks)                       │   │
│  │   Dependencies: R-01, R-02                                   │   │
│  │   Blocks: R-13 (Dynamic UI Feedback)                           │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-06: Ollama Embedding Service (2 weeks)                    │   │
│  │   Dependencies: R-03                                          │   │
│  │   Blocks: R-10 (Multi-Modal Support), R-12 (NotebookLM)     │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  HIGH Epics (Weeks 7-9)                                     │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-07: Chatflow Composition (2 weeks)                          │   │
│  │   Dependencies: R-04, R-05                                    │   │
│  │   Blocks: R-11 (Team Orchestration), R-15 (Approval)        │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-08: Neo4j Graph Database (2 weeks)                          │   │
│  │   Dependencies: R-03                                          │   │
│  │   Blocks: R-09 (Cross-Architecture Context)                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-09: Cross-Architecture Context Management (3 weeks)           │   │
│  │   Dependencies: R-02, R-08                                    │   │
│  │   Blocks: None                                               │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  MEDIUM Epics (Weeks 10-12)                                   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-10: Multi-Modal Support (2 weeks)                          │   │
│  │   Dependencies: R-06                                          │   │
│  │   Blocks: R-11 (Team Orchestration)                           │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-11: Team Orchestration (3 weeks)                            │   │
│  │   Dependencies: R-07, R-10                                    │   │
│  │   Blocks: None                                               │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-12: NotebookLM + Notion Integration (2 weeks)                 │   │
│  │   Dependencies: R-06                                          │   │
│  │   Blocks: None                                               │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  P2 Epics (Weeks 13-14)                                      │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-13: Dynamic UI Feedback (1 week)                             │   │
│  │   Dependencies: R-05                                          │   │
│  │   Blocks: None                                               │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-14: Multi-Provider Race Conditions (1 week)                     │   │
│  │   Dependencies: R-02                                          │   │
│  │   Blocks: None                                               │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ R-15: Approval Workflow Integration (1 week)                     │   │
│  │   Dependencies: R-04                                          │   │
│  │   Blocks: None                                               │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Execution Timeline

| Week | Epics | Focus | Deliverables |
|------|--------|-------|-------------|
| **Week 1-2** | R-01, R-02 | Hot-reloading, atomic updates |
| **Week 3-4** | R-03, R-04 | Qdrant, 5-layer system |
| **Week 5-6** | R-05, R-06 | Complete CRUD, Ollama embeddings |
| **Week 7-8** | R-07, R-08 | Chatflow composition, Neo4j |
| **Week 9-11** | R-09, R-10, R-11 | Cross-architecture context, multi-modal, team orchestration |
| **Week 12-13** | R-12, R-13, R-14 | NotebookLM, dynamic UI feedback, multi-provider race conditions |
| **Week 14** | R-15 | Approval workflow integration |

### Parallel Execution Opportunities

| Phase | Parallel Epics | Rationale |
|-------|----------------|-----------|
| **Week 1-2** | R-01, R-02 | Independent, can run in parallel |
| **Week 3-4** | R-03, R-04 | Independent, can run in parallel |
| **Week 5-6** | R-05, R-06 | Independent, can run in parallel |
| **Week 7-8** | R-07, R-08 | Independent, can run in parallel |
| **Week 9-11** | R-09, R-10 | Independent, can run in parallel |
| **Week 12-13** | R-12, R-13, R-14 | Independent, can run in parallel |

---

## 7. Risk Assessment and Mitigation

### Risk Matrix

| Risk | Probability | Impact | Mitigation Strategy | Owner |
|------|-------------|---------|-------------------|--------|
| **Model performance degradation** | Medium | High | A/B testing pipeline, quality monitoring | @bmad-bmm-tea |
| **Storage scalability** | Low | Medium | Horizontal scaling plan, archiving strategy | @bmad-bmm-architect |
| **Context loss in browser** | Medium | High | IndexedDB persistence, auto-save | @bmad-bmm-dev |
| **Integration complexity** | High | Medium | Phased rollout, comprehensive testing | @bmad-bmm-pm |
| **Vendor lock-in** | Low | Low | Abstraction layer design | @bmad-bmm-architect |
| **Hot-reloading regression** | Medium | High | Comprehensive testing, rollback plan | @bmad-bmm-tea |
| **State synchronization conflicts** | Medium | High | Conflict resolution strategies, testing | @bmad-bmm-dev |
| **Ollama embedding latency** | Medium | Medium | Caching, batch processing | @bmad-bmm-dev |
| **Neo4j graph complexity** | Medium | High | Query optimization, indexing strategy | @bmad-bmm-architect |
| **Multi-modal model cost** | Low | Medium | Local models, cost monitoring | @bmad-bmm-pm |

### Mitigation Plans

**Risk 1: Model Performance Degradation**
- **Mitigation:** Implement A/B testing pipeline for model selection
- **Monitoring:** Continuous quality monitoring with metrics tracking
- **Rollback:** Quick rollback to previous model version
- **Owner:** @bmad-bmm-tea (Test Engineer Automation)

**Risk 2: Storage Scalability**
- **Mitigation:** Design horizontal scaling architecture for Qdrant and Neo4j
- **Archiving:** Implement data archiving strategy for old embeddings
- **Monitoring:** Storage usage monitoring with alerts
- **Owner:** @bmad-bmm-architect

**Risk 3: Context Loss in Browser**
- **Mitigation:** Implement IndexedDB persistence with auto-save
- **Recovery:** State snapshots and rollback capability
- **Testing:** Comprehensive testing of persistence layer
- **Owner:** @bmad-bmm-dev

**Risk 4: Integration Complexity**
- **Mitigation:** Phased rollout with comprehensive testing at each phase
- **Documentation:** Detailed integration documentation with examples
- **Owner:** @bmad-bmm-pm (Product Manager)

**Risk 5: Vendor Lock-In**
- **Mitigation:** Design abstraction layer for all external services
- **Multi-provider:** Support multiple providers for each service
- **Owner:** @bmad-bmm-architect

**Risk 6: Hot-Reloading Regression**
- **Mitigation:** Comprehensive testing suite with edge cases
- **Rollback:** Quick rollback plan for hot-reloading changes
- **Monitoring:** Real-time monitoring of state updates
- **Owner:** @bmad-bmm-tea

**Risk 7: State Synchronization Conflicts**
- **Mitigation:** Implement multiple conflict resolution strategies (OT, Merge-Based, LWW)
- **Testing:** Stress testing with concurrent operations
- **Owner:** @bmad-bmm-dev

**Risk 8: Ollama Embedding Latency**
- **Mitigation:** Implement caching with TTL for embeddings
- **Batch Processing:** Batch embedding generation for efficiency
- **Owner:** @bmad-bmm-dev

**Risk 9: Neo4j Graph Complexity**
- **Mitigation:** Query optimization with proper indexing
- **Caching:** Cache frequent graph queries
- **Owner:** @bmad-bmm-architect

**Risk 10: Multi-Modal Model Cost**
- **Mitigation:** Use local models (Ollama) for privacy and cost reduction
- **Monitoring:** Cost tracking and alerting
- **Owner:** @bmad-bmm-pm

---

## 8. Research References

### 8.1 Domain 1 Research References

**Research Artifact:**
- [`domain-1-llm-provider-config-research.md`](docs/2025-12-28/version-2/domain-1-llm-provider-config-research.md)

**MCP Research Sources:**

1. **TanStack AI Documentation** (Context7 MCP)
   - Library ID: `/websites/tanstack_ai`
   - Topics: Dynamic SSE adapter configuration, multi-provider initialization, provider-specific model options, tools configuration
   - URL: https://tanstack.com/ai

2. **TanStack Router Documentation** (Deepwiki MCP)
   - Query: How does TanStack Router handle reactive state management?
   - Topics: Search parameters as state manager, reactive router state, data loading and caching, type safety
   - URL: https://deepwiki.com/search/how-does-tanstack-router-handl_bf19f5e9-7ba1-4f3b-9674-bcf21ec98da4

3. **Zustand Hot-Reloading Best Practices** (Exa Web Search)
   - Topics: State not updating immediately issue, Zustand update pattern, hydration with persist middleware, best practices for hot-reloading
   - URL: https://github.com/pmndrs/zustand/discussions/3132
   - URL: https://medium.com/@minduladilthushan/resolving-the-state-not-updating-immediately-issue-in-react-js-febf5959c0cf
   - URL: https://ekwoster.dev/post/building-scalable-state-management-with-zustand-in-react/
   - URL: https://zustand.docs.pmnd.rs/guides/updating-state

### 8.2 Domain 2 Research References

**Research Artifact:**
- [`domain-2-agent-config-architecture-research.md`](docs/2025-12-28/version-2/domain-2-agent-config-architecture-research.md)

**MCP Research Sources:**

1. **Multi-Agent Orchestration Patterns** (Tavily MCP)
   - Search: "5 Multi-Agent Orchestration Patterns You MUST Know in 2025!"
   - Topics: Sequential orchestration, MapReduce-style parallelism, consensus mode, layered orchestration, producer-reviewer loop, group chat orchestration, specialist swarms, critic-refiner loop
   - URL: YouTube video (5 Multi-Agent Orchestration Patterns)

2. **Top AI Agent Frameworks in 2025** (Exa MCP)
   - Search: "Agentic AI #3 — Top AI Agent Frameworks in 2025: LangChain, AutoGen, CrewAI & Beyond"
   - Topics: LangGraph modular orchestration, AutoGen conversation-first, CrewAI role-based crews, Microsoft Agent Framework enterprise-grade, LangChain modular chains and agents
   - URL: https://github.com/langchain-ai/langgraph
   - URL: https://microsoft.github.io/microsoft/autogen
   - URL: https://www.crewai.com
   - URL: https://python.langchain.com

3. **TanStack AI Multi-Modal Support** (Deepwiki MCP)
   - Query: Does TanStack AI support multi-modal agent orchestration and chatflow patterns?
   - Topics: Multi-modal inputs (RoleScopedChatInput with image_url), multi-modal agent orchestration, chatflow support
   - URL: https://tanstack.com/ai

### 8.3 Domain 3 Research References

**Research Artifact:**
- [`domain-3-rag-infrastructure-research.md`](docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md)

**MCP Research Sources:**

1. **Qdrant Documentation** (Context7 MCP)
   - Library ID: `/websites/qdrant_tech`
   - Topics: Hybrid search, RRF fusion, collection management, payload filtering, full-text search
   - URL: https://qdrant.tech/documentation

2. **Ollama Embedding Models** (Tavily MCP)
   - Search: "Ollama local embedding models 2025 best practices"
   - Topics: nomic-embed-text, mxbai-embed-large, BGE-M3, MTEB benchmarks, cost analysis, performance comparison
   - URL: https://ollama.com/blog/embedding-models

3. **GraphRAG Hybrid Implementation** (Exa MCP)
   - Repository: rileylemm/graphrag-hybrid
   - Pattern: Neo4j + Qdrant integration
   - URL: https://github.com/rileylemm/graphrag-hybrid

4. **Local RAG with Ollama and Weaviate** (Weaviate Blog)
   - Architecture: Privacy-preserving RAG
   - URL: https://weaviate.io/blog/local-rag-with-ollama-and-weaviate

5. **Embedding Model Comparison** (Tavily MCP)
   - Analysis: MTEB benchmarks, cost analysis, performance metrics
   - URL: https://elephas.app/blog/best-embedding-models

### 8.4 Project Documentation References

**MVP Sprint Plan:**
- [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)

**State Management Audit:**
- [`_bmad-output/state-management-audit-2025-12-24.md`](_bmad-output/state-management-audit-2025-12-24.md)

**Course Corrections:**
- [`_bmad-output/course-corrections/openrouter-401-fix-2025-12-25.md`](_bmad-output/course-corrections/openrouter-401-fix-2025-12-25.md)
- [`_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md`](_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md)

**Comprehensive Tech Documentation:**
- `docs/2025-12-23/` with architecture, tech context, data contracts, flows

**Development Guidelines:**
- `.agent/rules/general-rules.md` with MCP research protocol

---

## Conclusion

This remediation epics document provides comprehensive technical specifications for addressing 20+ critical gaps identified in the Technical Architecture Document. The epics are organized by priority level (P0, P1, HIGH, MEDIUM, P2) and include detailed implementation patterns, acceptance criteria, dependencies, and risk mitigation strategies.

### Key Achievements

1. **14 Remediation Epics** defined with comprehensive technical specifications
2. **Clear Acceptance Criteria** for each epic with measurable success metrics
3. **Dependency Mapping** showing execution sequence and parallel opportunities
4. **Implementation Patterns** with code examples for all major components
5. **Risk Assessment** with mitigation strategies for each identified risk
6. **Research References** to all three domain research artifacts and MCP tool sources

### Next Steps

1. **Phase 1 Execution** (Weeks 1-4): Implement P0 epics (hot-reloading, atomic updates, Qdrant, 5-layer system)
2. **Phase 2 Execution** (Weeks 5-8): Implement P1 and HIGH epics (CRUD, chatflow, Ollama, Neo4j)
3. **Phase 3 Execution** (Weeks 9-12): Implement MEDIUM and P2 epics (context management, multi-modal, orchestration, NotebookLM, UI feedback)
4. **Continuous Validation**: Test each implementation phase with browser E2E verification
5. **Documentation Updates**: Update AGENTS.md and agent-os steering documents as progress occurs

### Strategic Alignment

This remediation epics document aligns with BMAD v6 framework requirements:

- **Guardrails**: Non-negotiable safety boundaries defined in Layer 5 (Hidden System Directives)
- **Checklists**: Pre-execution validation with acceptance criteria for each epic
- **Handoff Artifacts**: Structured communication protocol with clear deliverables and dependencies
- **Gatekeeping Validation**: Quality gates at each phase transition with test suites and E2E verification

The remediation epics provide a clear roadmap for implementing enterprise-grade multi-agent orchestration capabilities with hybrid RAG, reactive state management, and comprehensive cross-architecture context management, positioning Via-gent as a leading browser-based IDE with advanced AI agent capabilities.

---

**Document Metadata**
- **Artifact ID**: REM-EPICS-2025-12-27
- **Version**: 1.0
- **Status**: Architecture Specification Complete
- **Related Artifacts**: 
  - [`technical-architecture-document.md`](docs/2025-12-28/version-2/technical-architecture-document.md)
  - [`domain-1-llm-provider-config-research.md`](docs/2025-12-28/version-2/domain-1-llm-provider-config-research.md)
  - [`domain-2-agent-config-architecture-research.md`](docs/2025-12-28/version-2/domain-2-agent-config-architecture-research.md)
  - [`domain-3-rag-infrastructure-research.md`](docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md)
- **Next Phase**: Sprint Planning & Story Breakdown
