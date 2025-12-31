---
date: 2025-12-30
time: 23:58:00+07:00
phase: Research-Phase-2
team: BMAD-Master-Orchestrator
agent_mode: bmad-core-bmad-master
---

# Agent Interaction Protocols: Multi-Agent Coordination Framework

## Executive Summary

This document provides formal specifications for inter-agent communication, context sharing, and coordination mechanisms within the Frontier RAG Knowledge Synthesis Expert System. The protocols define standardized message formats, interaction patterns, state synchronization strategies, and error handling procedures that enable reliable collaboration between specialized agents (Research Specialist, Knowledge Synthesizer, Content Generation, Pedagogical Agent, and Expert Advisor).

The interaction framework implements a message-based communication architecture with support for both synchronous request-response patterns and asynchronous event-driven coordination. Key design principles include context isolation to prevent cross-contamination, structured handoff artifacts for phase transitions, and comprehensive logging for debugging and optimization.

## 1. Communication Architecture Overview

### 1.1 Message-Based Communication Pattern

The agent communication system implements a unified message-based architecture where all inter-agent interactions occur through structured message passing. This approach provides several advantages: decoupled agents that can operate independently, explicit tracking of communication flows, and inherent support for both synchronous and asynchronous communication patterns.

Messages are typed with specific purposes (request, response, query, coordination, feedback, escalation) and carry structured payloads with sender/recipient metadata, priority indicators, and context references. The message bus implementation uses an event emitter pattern for local message routing and IndexedDB persistence for cross-session message history.

```typescript
// Core Message Types
type MessageType = 
  | 'REQUEST'      // Explicit task request with expected response
  | 'RESPONSE'     // Response to a REQUEST message
  | 'QUERY'        // Information query without side effects
  | 'INFORMATION'  // Unidirectional information sharing
  | 'COORDINATION' // Coordination signal for parallel operations
  | 'FEEDBACK'     // Feedback on previously performed action
  | 'ESCALATION'   // Error or complexity escalation to higher authority
  | 'HEARTBEAT'    // Liveness check for agent availability
  | 'CONTEXT_SYNC' // Context synchronization between agents
  | 'WORKFLOW_CTL' // Workflow control signals (pause, resume, cancel);

interface AgentMessage {
  // Identity
  id: string;                    // Globally unique message ID
  conversationId: string;        // Conversation thread for related messages
  correlationId?: string;        // Correlation ID for distributed tracing
  
  // Routing
  type: MessageType;
  sender: AgentId;
  recipients: AgentId[];         // Single recipient or broadcast array
  priority: 'low' | 'normal' | 'high' | 'critical';
  
  // Content
  payload: unknown;              // Type-safe payload based on message type
  intent: string;                // Semantic intent for routing/analytics
  
  // Context
  contextRef?: ContextReference; // Reference to shared context
  workflowState?: WorkflowState; // Current workflow state if applicable
  
  // Metadata
  timestamp: number;
  expiresAt?: number;            // TTL for time-sensitive messages
  retryCount: number;
  
  // Error handling
  errorInfo?: ErrorInfo;
  attachments?: MessageAttachment[];
}

interface ContextReference {
  type: 'session' | 'thread' | 'global' | 'working';
  id: string;
  version: number;
  accessLevel: 'read' | 'read_write';
}

interface MessageAttachment {
  name: string;
  mimeType: string;
  size: number;
  checksum: string;              // For integrity verification
  data: string;                  // Base64 encoded or reference URL
}
```

### 1.2 Message Bus Implementation

The message bus serves as the central routing infrastructure for agent communication. It handles message validation, routing, delivery confirmation, and error recovery. The bus implementation supports both in-memory messaging for real-time communication and persistent messaging for cross-session workflows.

```typescript
class AgentMessageBus {
  private handlers: Map<string, MessageHandler[]>;
  private subscriptionManager: SubscriptionManager;
  private messageStore: IndexedDBMessageStore;
  private deliveryTracker: DeliveryTracker;
  private eventEmitter: EventEmitter3;
  
  constructor(config: MessageBusConfig) {
    this.handlers = new Map();
    this.subscriptionManager = new SubscriptionManager();
    this.messageStore = new IndexedDBMessageStore('agent-messages');
    this.deliveryTracker = new DeliveryTracker();
    this.eventEmitter = new EventEmitter3();
    
    // Set up delivery confirmation listeners
    this.deliveryTracker.on('delivered', this.handleDeliveryConfirmed.bind(this));
    this.deliveryTracker.on('failed', this.handleDeliveryFailed.bind(this));
  }
  
  async publish(message: AgentMessage): Promise<PublishResult> {
    // Validate message structure
    const validation = this.validateMessage(message);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }
    
    // Enrich message with routing metadata
    const enriched = await this.enrichMessage(message);
    
    // Store message for persistence and auditing
    const storedId = await this.messageStore.store(enriched);
    
    // Route to recipients
    const deliveryResults = await this.routeMessage(enriched);
    
    // Track deliveries
    this.deliveryTracker.track(storedId, deliveryResults);
    
    // Emit publish event for monitoring
    this.eventEmitter.emit('message:published', {
      messageId: storedId,
      type: enriched.type,
      recipients: enriched.recipients
    });
    
    return {
      success: true,
      messageId: storedId,
      deliveryResults
    };
  }
  
  async subscribe(
    agentId: AgentId,
    filter: MessageFilter,
    handler: MessageHandler
  ): Promise<Subscription> {
    const subscription = await this.subscriptionManager.create({
      agentId,
      filter,
      handler,
      acknowledgeRequired: filter.priority === 'critical'
    });
    
    // Register handler
    const key = this.getHandlerKey(filter);
    if (!this.handlers.has(key)) {
      this.handlers.set(key, []);
    }
    this.handlers.get(key)!.push(handler);
    
    return subscription;
  }
  
  async request<ResponseType>(
    request: Omit<AgentMessage, 'id' | 'timestamp'>
  ): Promise<ResponseMessage<ResponseType>> {
    const message: AgentMessage = {
      ...request,
      id: generateMessageId(),
      type: 'REQUEST',
      timestamp: Date.now(),
      retryCount: 0
    } as AgentMessage;
    
    // Set up response tracking
    const responsePromise = this.waitForResponse<ResponseType>(
      message.id,
      request.timeout || 30000
    );
    
    // Publish request
    const publishResult = await this.publish(message);
    if (!publishResult.success) {
      throw new MessagePublishError('Failed to publish request', publishResult.errors);
    }
    
    // Wait for response with timeout
    try {
      return await responsePromise;
    } catch (error) {
      // Handle timeout - may need to cancel request
      await this.cancelRequest(message.id);
      throw error;
    }
  }
  
  private async routeMessage(message: AgentMessage): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];
    
    for (const recipient of message.recipients) {
      const handlerKey = this.getHandlerKey({
        recipient,
        type: message.type,
        priority: message.priority
      });
      
      const handlers = this.handlers.get(handlerKey) || [];
      
      if (handlers.length > 0) {
        // Direct delivery to registered handlers
        for (const handler of handlers) {
          try {
            const result = await this.deliverToHandler(handler, message);
            results.push({ recipient, success: true, result });
          } catch (error) {
            results.push({ 
              recipient, 
              success: false, 
              error: (error as Error).message 
            });
          }
        }
      } else {
        // Queue for later delivery (recipient may not be online)
        await this.queueForDelivery(message, recipient);
        results.push({ recipient, success: true, queued: true });
      }
    }
    
    return results;
  }
}
```

### 1.3 Agent Identification and Capabilities

Each agent in the system has a unique identifier and declares its capabilities, specializations, and availability. This metadata is used for intelligent routing - messages are directed to agents with appropriate capabilities, and load balancing distributes work across available agents.

```typescript
interface AgentCapabilities {
  // Domain specializations
  domains: string[];              // e.g., 'research', 'synthesis', 'pedagogy'
  
  // Processing capabilities
  canProcess: {
    text: boolean;
    image: boolean;
    audio: boolean;
    video: boolean;
    structured: boolean;
  };
  
  // Output formats supported
  outputFormats: ('text' | 'markdown' | 'html' | 'json' | 'audio' | 'image')[];
  
  // Performance characteristics
  performance: {
    avgResponseTime: number;      // milliseconds
    maxConcurrentTasks: number;
    supportsStreaming: boolean;
  };
  
  // Availability
  availability: {
    status: 'online' | 'busy' | 'offline' | 'degraded';
    currentLoad: number;          // 0-1 scale
    lastHeartbeat: number;
  };
}

interface AgentRegistration {
  agentId: AgentId;
  name: string;
  description: string;
  capabilities: AgentCapabilities;
  config: AgentConfig;
  metadata: AgentMetadata;
}

class AgentRegistry {
  private agents: Map<AgentId, AgentRegistration>;
  private capabilityIndex: Map<string, Set<AgentId>>;
  
  async register(registration: AgentRegistration): Promise<void> {
    // Validate registration
    this.validateRegistration(registration);
    
    // Store registration
    this.agents.set(registration.agentId, registration);
    
    // Update capability index
    for (const domain of registration.capabilities.domains) {
      if (!this.capabilityIndex.has(domain)) {
        this.capabilityIndex.set(domain, new Set());
      }
      this.capabilityIndex.get(domain)!.add(registration.agentId);
    }
    
    // Announce availability
    await this.messageBus.publish({
      type: 'INFORMATION',
      sender: registration.agentId,
      recipients: ['*'],  // Broadcast
      priority: 'normal',
      payload: {
        event: 'agent_registered',
        agentId: registration.agentId,
        capabilities: registration.capabilities
      }
    });
  }
  
  async findAgents(
    criteria: AgentSearchCriteria
  ): Promise<AgentId[]> {
    const candidates = new Set<AgentId>();
    
    // Match by domain
    if (criteria.domains && criteria.domains.length > 0) {
      for (const domain of criteria.domains) {
        const domainAgents = this.capabilityIndex.get(domain);
        if (domainAgents) {
          domainAgents.forEach(id => candidates.add(id));
        }
      }
    }
    
    // Filter by capability
    if (criteria.canProcess) {
      const filtered = new Set<AgentId>();
      for (const agentId of candidates) {
        const agent = this.agents.get(agentId);
        if (agent && this.matchesCapabilities(agent.capabilities, criteria.canProcess)) {
          filtered.add(agentId);
        }
      }
      candidates.clear();
      filtered.forEach(id => candidates.add(id));
    }
    
    // Filter by availability
    if (criteria.status) {
      const filtered = new Set<AgentId>();
      for (const agentId of candidates) {
        const agent = this.agents.get(agentId);
        if (agent && agent.capabilities.availability.status === criteria.status) {
          filtered.add(agentId);
        }
      }
      candidates.clear();
      filtered.forEach(id => candidates.add(id));
    }
    
    // Load balancing
    if (criteria.loadBalanced) {
      const sorted = Array.from(candidates).sort((a, b) => {
        const agentA = this.agents.get(a)!;
        const agentB = this.agents.get(b)!;
        return agentA.capabilities.availability.currentLoad - 
               agentB.capabilities.availability.currentLoad;
      });
      return sorted.slice(0, criteria.maxResults || 5);
    }
    
    return Array.from(candidates).slice(0, criteria.maxResults || 10);
  }
  
  async updateHeartbeat(agentId: AgentId): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.capabilities.availability.lastHeartbeat = Date.now();
      
      // Check for stale heartbeat
      const staleThreshold = 60000;  // 1 minute
      if (Date.now() - agent.capabilities.availability.lastHeartbeat > staleThreshold) {
        agent.capabilities.availability.status = 'offline';
      }
    }
  }
}
```

## 2. Context Sharing Mechanisms

### 2.1 Hierarchical Context Structure

The context management system implements a hierarchical structure with four levels: session context (current session in memory), thread context (conversation threads persisted to disk), global context (long-term knowledge in IndexedDB), and working context (active task context). Each level has different persistence characteristics and access patterns.

```typescript
interface ContextHierarchy {
  session: SessionContext;        // Current session (ephemeral, in-memory)
  thread: ThreadContext;          // Conversation thread (session-persistent)
  global: GlobalContext;          // Long-term knowledge (persistent)
  working: WorkingContext;        // Active task context (ephemeral)
}

class HierarchicalContextManager {
  private sessionContext: SessionContextStore;
  private threadContext: ThreadContextStore;
  private globalContext: GlobalContextStore;
  private workingContext: WorkingContextStore;
  private conflictResolver: ContextConflictResolver;
  private compressionEngine: ContextCompressionEngine;
  
  constructor() {
    this.sessionContext = new SessionContextStore();
    this.threadContext = new ThreadContextStore();
    this.globalContext = new GlobalContextStore();
    this.workingContext = new WorkingContextStore();
    this.conflictResolver = new ContextConflictResolver();
    this.compressionEngine = new ContextCompressionEngine();
  }
  
  async getContext(
    level: ContextLevel,
    contextId: string
  ): Promise<ContextData | null> {
    switch (level) {
      case 'session':
        return this.sessionContext.get(contextId);
      case 'thread':
        return this.threadContext.get(contextId);
      case 'global':
        return this.globalContext.get(contextId);
      case 'working':
        return this.workingContext.get(contextId);
    }
  }
  
  async shareContext(
    sharingAgent: AgentId,
    contextType: ContextType,
    data: unknown,
    policy: SharingPolicy
  ): Promise<ContextShareResult> {
    const context: SharedContext = {
      id: generateContextId(),
      type: contextType,
      data,
      owner: sharingAgent,
      policy,
      createdAt: Date.now(),
      version: 1
    };
    
    // Store in appropriate level based on policy
    if (policy.persistent) {
      if (policy.scope === 'global') {
        await this.globalContext.store(context);
      } else {
        await this.threadContext.store(context);
      }
    } else {
      await this.sessionContext.store(context);
    }
    
    // Notify relevant agents based on policy
    if (policy.notifyOnUpdate) {
      await this.notifyRelevantAgents(context, policy);
    }
    
    // Create reference for other agents to access
    const reference: ContextReference = {
      type: this.getContextLevel(policy),
      id: context.id,
      version: context.version,
      accessLevel: policy.accessLevel
    };
    
    return {
      shareId: generateShareId(),
      context,
      reference,
      sharedWith: policy.sharedWith
    };
  }
  
  async retrieveSharedContext(
    requestingAgent: AgentId,
    filters: ContextRetrievalFilter
  ): Promise<RetrievedContexts> {
    const contexts: RetrievedContext[] = [];
    
    // Search across all levels
    const [sessionResults, threadResults, globalResults] = await Promise.all([
      this.sessionContext.query({
        types: filters.types,
        owner: filters.owner,
        minRelevanceScore: filters.minScore
      }),
      this.threadContext.query({
        types: filters.types,
        owner: filters.owner,
        minRelevanceScore: filters.minScore
      }),
      this.globalContext.query({
        types: filters.types,
        owner: filters.owner,
        minRelevanceScore: filters.minScore
      })
    ]);
    
    // Process and merge results
    for (const result of [...sessionResults, ...threadResults, ...globalResults]) {
      // Check access permissions
      if (!this.hasAccess(requestingAgent, result.context)) {
        continue;
      }
      
      // Resolve conflicts if multiple versions exist
      const resolved = await this.resolveIfNeeded(result.context);
      
      contexts.push({
        context: resolved,
        source: result.source,
        relevanceScore: result.relevanceScore,
        retrievedAt: Date.now()
      });
    }
    
    // Sort by relevance
    contexts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return {
      contexts: contexts.slice(0, filters.maxResults || 20),
      totalAvailable: contexts.length,
      metadata: {
        retrievedAt: Date.now(),
        queryFilters: filters,
        freshnessScore: this.calculateFreshness(contexts)
      }
    };
  }
  
  async prepareContextForAgent(
    targetAgent: AgentId,
    request: AgentContextRequest
  ): Promise<PreparedContext> {
    // Determine required context based on request
    const requirements = this.analyzeRequirements(request);
    
    // Fetch from appropriate hierarchy levels
    let context = await this.fetchAccordingToHierarchy(requirements);
    
    // Apply attention filtering based on agent specialization
    context = await this.applyAgentFiltering(context, targetAgent);
    
    // Check token limits and compress if necessary
    if (this.exceedsTokenLimit(context, request.maxTokens)) {
      context = await this.compressionEngine.compress(context, {
        targetTokens: request.maxTokens * 0.8,
        strategy: 'importance-based',
        preserveStructure: true
      });
    }
    
    // Verify completeness against requirements
    const completeness = this.assessCompleteness(context, requirements);
    if (!completeness.sufficient) {
      // Request additional context
      const gaps = completeness.gaps;
      const additional = await this.fetchContextGaps(gaps, requirements);
      context = this.mergeContexts(context, additional);
    }
    
    return {
      content: context,
      tokenCount: this.countTokens(context),
      compressionRatio: this.calculateCompression(context),
      completenessScore: completeness.score,
      sources: this.extractSources(context)
    };
  }
}
```

### 2.2 Context Conflict Resolution

When multiple agents modify shared context simultaneously, conflict resolution ensures data consistency while preserving agent autonomy. The system implements a multi-strategy approach: last-writer-wins for simple data, operational transformation for structured data, and manual resolution for critical conflicts.

```typescript
class ContextConflictResolver {
  private strategies: Map<ConflictType, ConflictResolutionStrategy>;
  private mergePolicies: Map<string, MergePolicy>;
  
  constructor() {
    this.strategies = new Map([
      ['last-writer-wins', new LastWriterWinsStrategy()],
      ['operational-transform', new OperationalTransformStrategy()],
      ['three-way-merge', new ThreeWayMergeStrategy()],
      ['semantic-merge', new SemanticMergeStrategy()],
      ['manual-resolution', new ManualResolutionStrategy()]
    ]);
    
    this.mergePolicies = new Map([
      ['append-only', new AppendOnlyMergePolicy()],
      ['overwrite', new OverwriteMergePolicy()],
      ['preserve-all', new PreserveAllMergePolicy()],
      ['intelligent', new IntelligentMergePolicy()]
    ]);
  }
  
  async resolve(
    conflicts: ContextConflict[]
  ): Promise<ConflictResolutionResult[]> {
    const results: ConflictResolutionResult[] = [];
    
    for (const conflict of conflicts) {
      const strategy = this.selectStrategy(conflict);
      const result = await strategy.resolve(conflict);
      results.push(result);
      
      // Log resolution for learning
      await this.logResolution(conflict, result);
    }
    
    return results;
  }
  
  private selectStrategy(conflict: ContextConflict): ConflictResolutionStrategy {
    // Auto-select based on conflict characteristics
    if (conflict.isStructural) {
      return this.strategies.get('operational-transform')!;
    }
    
    if (conflict.importance === 'critical') {
      return this.strategies.get('manual-resolution')!;
    }
    
    if (conflict.dataType === 'text' && conflict.autoMergeable) {
      return this.strategies.get('semantic-merge')!;
    }
    
    // Default to three-way merge for complex data
    return this.strategies.get('three-way-merge')!;
  }
  
  async learnFromResolutions(): Promise<void> {
    // Analyze past resolutions to improve strategy selection
    const resolutionHistory = await this.getResolutionHistory();
    const patterns = this.analyzePatterns(resolutionHistory);
    
    // Update strategy selection heuristics
    this.updateStrategySelectionModel(patterns);
  }
}
```

### 2.3 Context Versioning and History

All shared contexts maintain version history for audit trails, rollback capabilities, and collaborative editing support. The versioning system tracks changes at the field level, enabling granular restoration and difference analysis.

```typescript
interface ContextVersion {
  versionId: string;
  contextId: string;
  version: number;
  data: unknown;
  changes: ContextChange[];
  author: AgentId;
  timestamp: number;
  commitMessage?: string;
  tags: string[];
}

interface ContextChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: 'add' | 'modify' | 'delete' | 'move';
  timestamp: number;
}

class ContextVersionManager {
  private versions: Dexie.Table<ContextVersion, string>;
  private changeTracker: ChangeTracker;
  
  async createVersion(
    contextId: string,
    data: unknown,
    author: AgentId,
    message?: string
  ): Promise<ContextVersion> {
    // Get current version number
    const latest = await this.getLatestVersion(contextId);
    const newVersionNumber = (latest?.version || 0) + 1;
    
    // Track changes from previous version
    const changes = latest 
      ? this.changeTracker.diff(latest.data, data)
      : this.changeTracker.initialDiff(data);
    
    // Create version record
    const version: ContextVersion = {
      versionId: generateVersionId(),
      contextId,
      version: newVersionNumber,
      data,
      changes,
      author,
      timestamp: Date.now(),
      commitMessage: message,
      tags: []
    };
    
    // Store version
    await this.versions.add(version);
    
    // Update indexes
    await this.updateIndexes(contextId, version);
    
    return version;
  }
  
  async getVersionHistory(
    contextId: string,
    options?: VersionHistoryOptions
  ): Promise<ContextVersion[]> {
    let query = this.versions
      .where('contextId')
      .equals(contextId)
      .reverse()
      .sortBy('version');
    
    if (options?.fromVersion) {
      query = query.then(versions => 
        versions.filter(v => v.version >= options.fromVersion!)
      );
    }
    
    if (options?.limit) {
      query = query.then(versions => versions.slice(0, options.limit!));
    }
    
    if (options?.tag) {
      query = query.then(versions => 
        versions.filter(v => v.tags.includes(options.tag!))
      );
    }
    
    return query;
  }
  
  async revertToVersion(
    contextId: string,
    versionId: string,
    author: AgentId
  ): Promise<ContextVersion> {
    const targetVersion = await this.versions.get(versionId);
    if (!targetVersion) {
      throw new VersionNotFoundError(versionId);
    }
    
    // Create new version with reverted data
    const reverted = await this.createVersion(
      contextId,
      targetVersion.data,
      author,
      `Reverted to version ${targetVersion.version}`
    );
    
    // Add revert tag
    reverted.tags.push('revert');
    await this.versions.put(reverted);
    
    return reverted;
  }
  
  async compareVersions(
    contextId: string,
    versionA: number,
    versionB: number
  ): Promise<VersionComparison> {
    const [verA, verB] = await Promise.all([
      this.getVersion(contextId, versionA),
      this.getVersion(contextId, versionB)
    ]);
    
    const changes = this.changeTracker.diff(verA.data, verB.data);
    
    return {
      fromVersion: verA.version,
      toVersion: verB.version,
      changes,
      summary: this.summarizeChanges(changes),
      impactScore: this.calculateImpactScore(changes)
    };
  }
}
```

## 3. Coordination Patterns

### 3.1 Coordinator-Worker Pattern

The Coordinator-Worker pattern handles hierarchical task decomposition where a coordinator agent breaks down complex tasks and distributes subtasks to worker agents. The coordinator maintains overall task state and synthesizes results from workers.

```typescript
interface CoordinatorTask {
  id: string;
  description: string;
  decomposition?: TaskDecomposition;
  subtasks: Subtask[];
  state: CoordinatorTaskState;
  result?: SynthesizedResult;
  metadata: TaskMetadata;
}

interface Subtask {
  id: string;
  agentType: AgentId;
  description: string;
  dependencies: string[];        // IDs of subtasks that must complete first
  priority: number;
  assignedAgent?: AgentId;
  state: SubtaskState;
  result?: SubtaskResult;
  maxRetries: number;
  timeout: number;
}

class CoordinatorWorkerPattern {
  private taskManager: TaskManager;
  private resultSynthesizer: ResultSynthesizer;
  private dependencyResolver: DependencyResolver;
  
  async execute(
    task: CoordinatorTask,
    coordinatorAgent: AgentId,
    availableWorkers: WorkerAgent[]
  ): Promise<CoordinatorTaskResult> {
    // Phase 1: Decompose task if not already done
    if (!task.decomposition) {
      task.decomposition = await this.decomposeTask(task);
    }
    
    // Phase 2: Resolve dependencies and determine execution order
    const executionPlan = this.dependencyResolver.resolve(
      task.subtasks,
      availableWorkers
    );
    
    // Phase 3: Assign subtasks to workers
    const assignments = await this.assignSubtasks(
      executionPlan,
      availableWorkers,
      coordinatorAgent
    );
    
    // Phase 4: Execute according to plan
    const results = await this.executePlan(assignments);
    
    // Phase 5: Synthesize results
    const synthesized = await this.resultSynthesizer.synthesize({
      task,
      subtaskResults: results
    });
    
    return {
      taskId: task.id,
      success: synthesized.success,
      result: synthesized.result,
      subtaskResults: results,
      metrics: {
        totalSubtasks: task.subtasks.length,
        successfulSubtasks: results.filter(r => r.success).length,
        failedSubtasks: results.filter(r => !r.success).length,
        totalDuration: this.calculateTotalDuration(results)
      }
    };
  }
  
  private async decomposeTask(task: CoordinatorTask): Promise<TaskDecomposition> {
    const decompositionPrompt = `
      Decompose the following task into independent subtasks:
      
      Task: ${task.description}
      
      Requirements:
      1. Each subtask should be independently executable
      2. Specify dependencies between subtasks
      3. Suggest appropriate agent types for each subtask
      4. Estimate complexity (1-10) for each subtask
    `;
    
    const decomposition = await this.llm.complete(decompositionPrompt, {
      schema: TaskDecompositionSchema
    });
    
    return decomposition;
  }
  
  private async assignSubtasks(
    executionPlan: ExecutionPlan,
    workers: WorkerAgent[],
    coordinatorId: AgentId
  ): Promise<SubtaskAssignment[]> {
    const assignments: SubtaskAssignment[] = [];
    
    for (const stage of executionPlan.stages) {
      // Find eligible workers for each subtask
      for (const subtask of stage.subtasks) {
        const eligibleWorkers = workers.filter(worker => 
          worker.canHandle(subtask.agentType) &&
          worker.isAvailable() &&
          this.matchesWorkerToSubtask(worker, subtask)
        );
        
        // Select best worker based on load and specialization
        const selectedWorker = this.selectOptimalWorker(
          eligibleWorkers,
          subtask
        );
        
        const assignment: SubtaskAssignment = {
          subtaskId: subtask.id,
          workerId: selectedWorker.agentId,
          priority: subtask.priority,
          timeout: subtask.timeout
        };
        
        assignments.push(assignment);
        
        // Update worker load
        selectedWorker.currentLoad += this.estimateLoad(subtask);
      }
    }
    
    return assignments;
  }
  
  private async executePlan(
    assignments: SubtaskAssignment[]
  ): Promise<SubtaskExecutionResult[]> {
    const results: SubtaskExecutionResult[] = [];
    const executing = new Map<string, Promise<SubtaskExecutionResult>>();
    
    for (const assignment of assignments) {
      // Start execution (dependencies already satisfied by plan)
      const execution = this.executeSubtask(assignment);
      executing.set(assignment.subtaskId, execution);
      
      // Collect results as they complete
      execution.then(result => {
        results.push(result);
        executing.delete(assignment.subtaskId);
      });
    }
    
    // Wait for all to complete
    await Promise.all(executing.values());
    
    return results;
  }
}
```

### 3.2 Sequential Pipeline Pattern

The Sequential Pipeline pattern processes tasks through a series of stages where each stage's output feeds into the next. This pattern is ideal for workflows with inherent dependencies like research → synthesis → generation.

```typescript
interface PipelineStage {
  id: string;
  name: string;
  agentType: AgentId;
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
  config: StageConfig;
}

interface PipelineExecution {
  pipelineId: string;
  stages: PipelineStageExecution[];
  input: PipelineInput;
  output: PipelineOutput;
  state: PipelineState;
  metrics: PipelineMetrics;
}

class SequentialPipelinePattern {
  private stageRegistry: PipelineStageRegistry;
  private stateManager: PipelineStateManager;
  private errorHandler: PipelineErrorHandler;
  
  async execute(
    pipeline: PipelineDefinition,
    input: PipelineInput,
    context: ExecutionContext
  ): Promise<PipelineExecutionResult> {
    const execution: PipelineExecution = {
      pipelineId: pipeline.id,
      stages: [],
      input,
      output: null as unknown as PipelineOutput,
      state: 'pending',
      metrics: {
        startTime: Date.now(),
        stageDurations: [],
        totalInputTokens: 0,
        totalOutputTokens: 0
      }
    };
    
    try {
      execution.state = 'running';
      let stageInput = input;
      
      for (const stage of pipeline.stages) {
        // Check for cancellation
        if (execution.state === 'cancelled') {
          return this.createCancelledResult(execution);
        }
        
        // Execute stage
        const stageResult = await this.executeStage(
          stage,
          stageInput,
          context
        );
        
        // Record metrics
        execution.stageDurations.push({
          stageId: stage.id,
          duration: stageResult.duration,
          success: stageResult.success,
          tokens: {
            input: stageResult.inputTokens,
            output: stageResult.outputTokens
          }
        });
        
        execution.metrics.totalInputTokens += stageResult.inputTokens;
        execution.metrics.totalOutputTokens += stageResult.outputTokens;
        
        if (!stageResult.success) {
          // Handle stage failure
          const handled = await this.errorHandler.handleStageFailure(
            execution,
            stage,
            stageResult.error
          );
          
          if (handled.retry) {
            // Retry stage
            stageResult = await this.executeStage(
              stage,
              stageInput,
              context,
              { retry: true }
            );
          } else if (handled.skip) {
            // Skip stage and use fallback
            stageResult = await this.executeStage(
              stage,
              stageInput,
              context,
              { useFallback: true }
            );
          } else {
            // Propagate failure
            execution.state = 'failed';
            execution.output = this.createErrorOutput(stageResult.error);
            return this.createFailedResult(execution);
          }
        }
        
        // Validate and transform output for next stage
        const validation = stage.outputSchema.safeParse(stageResult.output);
        if (!validation.success) {
          throw new StageOutputValidationError(stage.id, validation.error);
        }
        
        stageInput = this.transformOutput(
          validation.data,
          pipeline.stages.find(s => s.id === stage.nextStageId)?.inputSchema
        );
        
        execution.stages.push({
          stageId: stage.id,
          input: stageResult.input,
          output: validation.data,
          success: stageResult.success,
          duration: stageResult.duration
        });
      }
      
      execution.state = 'completed';
      execution.output = stageInput as PipelineOutput;
      
      return this.createSuccessResult(execution);
      
    } catch (error) {
      execution.state = 'failed';
      execution.output = this.createErrorOutput(error);
      return this.createFailedResult(execution);
    } finally {
      execution.metrics.endTime = Date.now();
      execution.metrics.totalDuration = 
        execution.metrics.endTime - execution.metrics.startTime;
      
      // Persist execution record
      await this.stateManager.persist(execution);
    }
  }
  
  private async executeStage(
    stage: PipelineStage,
    input: unknown,
    context: ExecutionContext,
    options?: StageExecutionOptions
  ): Promise<StageExecutionResult> {
    const startTime = Date.now();
    
    // Get agent for this stage
    const agent = await this.agentRegistry.findAvailable({
      capabilities: [stage.agentType],
      maxLoad: 0.8
    });
    
    try {
      // Execute stage with agent
      const output = await agent.execute({
        task: {
          type: 'pipeline_stage',
          pipelineId: stage.id,
          stageName: stage.name,
          input
        },
        config: stage.config,
        context
      });
      
      const inputTokens = this.countTokens(input);
      const outputTokens = this.countTokens(output);
      
      return {
        success: true,
        output,
        duration: Date.now() - startTime,
        inputTokens,
        outputTokens
      };
      
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        duration: Date.now() - startTime,
        inputTokens: this.countTokens(input),
        outputTokens: 0
      };
    }
  }
}
```

### 3.3 Parallel Fan-Out Pattern

The Parallel Fan-Out pattern executes independent tasks concurrently across multiple agents, then collects and merges results. This pattern maximizes throughput for embarrassingly parallel workloads.

```typescript
interface FanOutTask {
  id: string;
  input: unknown;
  expectedOutputSchema: z.ZodSchema;
  priority: number;
  timeout: number;
  retryPolicy: RetryPolicy;
}

interface FanOutResult {
  taskId: string;
  success: boolean;
  output?: unknown;
  error?: ErrorInfo;
  duration: number;
  attempts: number;
}

class ParallelFanOutPattern {
  private taskQueue: PriorityQueue<FanOutTask>;
  private resultAggregator: ResultAggregator;
  private loadBalancer: AgentLoadBalancer;
  
  async execute(
    tasks: FanOutTask[],
    agentPool: AgentPool,
    options?: FanOutOptions
  ): Promise<FanOutExecutionResult> {
    const startTime = Date.now();
    const results: FanOutResult[] = [];
    const executing = new Map<string, Promise<FanOutResult>>();
    
    // Initialize task queue with priority
    this.taskQueue = new PriorityQueue(
      tasks.map(t => ({ item: t, priority: t.priority }))
    );
    
    // Create execution context
    const executionContext: FanOutContext = {
      startTime,
      totalTasks: tasks.length,
      completedTasks: 0,
      failedTasks: 0,
      results: [],
      options: options || {}
    };
    
    // Start worker pool
    const workers = this.createWorkerPool(agentPool, options?.maxConcurrency || 10);
    
    // Main execution loop
    await this.executeWithWorkers(executionContext, workers, results, executing);
    
    // Wait for all in-flight tasks
    if (executing.size > 0) {
      await Promise.all(executing.values());
    }
    
    // Aggregate results
    const aggregated = this.resultAggregator.aggregate(results, options?.aggregationMethod);
    
    return {
      success: aggregated.success,
      output: aggregated.output,
      metrics: {
        totalDuration: Date.now() - startTime,
        tasksCompleted: results.filter(r => r.success).length,
        tasksFailed: results.filter(r => !r.success).length,
        averageTaskDuration: this.calculateAverageDuration(results),
        throughput: results.length / ((Date.now() - startTime) / 1000)
      },
      individualResults: results
    };
  }
  
  private async executeWithWorkers(
    context: FanOutContext,
    workers: WorkerPool,
    results: FanOutResult[],
    executing: Map<string, Promise<FanOutResult>>
  ): Promise<void> {
    while (this.taskQueue.size > 0 || executing.size > 0) {
      // Get available worker
      const worker = await workers.getAvailable();
      if (!worker) {
        // Wait for a worker to become available
        await workers.waitForAvailable();
        continue;
      }
      
      // Get next task from queue
      const queueItem = this.taskQueue.poll();
      if (!queueItem) {
        // No more tasks, release worker
        workers.release(worker);
        continue;
      }
      
      const task = queueItem.item;
      
      // Create execution promise
      const executionPromise = this.executeTask(task, worker);
      executing.set(task.id, executionPromise);
      
      // Handle completion
      executionPromise.then(result => {
        results.push(result);
        context.completedTasks++;
        
        if (!result.success) {
          context.failedTasks++;
        }
        
        executing.delete(task.id);
        workers.release(worker);
        
        // Emit progress event
        this.emit('progress', {
          completed: context.completedTasks,
          failed: context.failedTasks,
          total: context.totalTasks
        });
      });
    }
  }
  
  private async executeTask(
    task: FanOutTask,
    worker: WorkerAgent
  ): Promise<FanOutResult> {
    let attempts = 0;
    let lastError: Error | null = null;
    
    while (attempts <= task.retryPolicy.maxRetries) {
      try {
        const startTime = Date.now();
        
        const output = await worker.execute({
          type: 'fanout_task',
          taskId: task.id,
          input: task.input
        });
        
        // Validate output
        const validation = task.expectedOutputSchema.safeParse(output);
        if (!validation.success) {
          throw new OutputValidationError(validation.error);
        }
        
        return {
          taskId: task.id,
          success: true,
          output: validation.data,
          duration: Date.now() - startTime,
          attempts: attempts + 1
        };
        
      } catch (error) {
        lastError = error as Error;
        attempts++;
        
        if (attempts <= task.retryPolicy.maxRetries) {
          // Wait before retry
          await this.sleep(this.calculateBackoff(attempts, task.retryPolicy));
        }
      }
    }
    
    return {
      taskId: task.id,
      success: false,
      error: {
        message: lastError?.message || 'Unknown error',
        code: 'TASK_FAILED',
        retryable: attempts < task.retryPolicy.maxRetries
      },
      duration: 0,
      attempts
    };
  }
}
```

## 4. State Synchronization

### 4.1 Agent State Management

Each agent maintains internal state that must be synchronized with the coordination system. State synchronization ensures that agents can recover from interruptions, collaborate effectively, and maintain consistency across distributed operations.

```typescript
interface AgentState {
  agentId: AgentId;
  status: AgentStatus;
  currentTask?: TaskContext;
  context: AgentWorkingContext;
  metrics: AgentMetrics;
  lastSynchronized: number;
}

interface TaskContext {
  taskId: string;
  subtaskId?: string;
  priority: number;
  startedAt: number;
  progress: number;
  checkpoints: TaskCheckpoint[];
}

class AgentStateManager {
  private stateStore: PersistentAgentStateStore;
  private syncCoordinator: StateSyncCoordinator;
  private checkpointManager: CheckpointManager;
  
  async saveState(agentId: AgentId, state: AgentState): Promise<void> {
    // Create checkpoint before saving
    if (state.currentTask) {
      const checkpoint = await this.checkpointManager.create(
        agentId,
        state.currentTask
      );
      state.currentTask.checkpoints.push(checkpoint);
    }
    
    // Persist state
    await this.stateStore.save(agentId, {
      ...state,
      lastSynchronized: Date.now()
    });
    
    // Notify sync coordinator
    await this.syncCoordinator.notifyStateChange(agentId, state);
  }
  
  async restoreState(agentId: AgentId): Promise<AgentState | null> {
    const state = await this.stateStore.load(agentId);
    
    if (!state) {
      return null;
    }
    
    // Restore from checkpoint if available
    if (state.currentTask?.checkpoints.length) {
      const latestCheckpoint = state.currentTask.checkpoints[
        state.currentTask.checkpoints.length - 1
      ];
      
      const restored = await this.checkpointManager.restore(latestCheckpoint);
      if (restored) {
        state.currentTask = restored;
      }
    }
    
    // Verify state consistency
    const consistencyCheck = this.verifyStateConsistency(state);
    if (!consistencyCheck.valid) {
      // Attempt recovery
      const recovered = await this.recoverState(state);
      return recovered;
    }
    
    return state;
  }
  
  async syncWithPeers(agentId: AgentId): Promise<void> {
    // Get latest state from sync coordinator
    const peerStates = await this.syncCoordinator.getLatestStates();
    
    // Merge with local state
    const localState = await this.stateStore.load(agentId);
    const mergedState = this.mergeStates(localState, peerStates);
    
    // Save merged state
    await this.stateStore.save(agentId, mergedState);
    
    // Update peers with local changes
    await this.syncCoordinator.broadcastState(agentId, mergedState);
  }
}
```

### 4.2 Workflow State Machine

Workflow execution follows a state machine pattern that ensures consistent transitions and enables recovery from failures. The state machine tracks the overall workflow progress and individual task states.

```typescript
type WorkflowStatus = 
  | 'pending'
  | 'initializing'
  | 'running'
  | 'paused'
  | 'waiting'
  | 'completing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'rolled_back';

interface WorkflowState {
  workflowId: string;
  status: WorkflowStatus;
  currentPhase: string;
  tasks: Map<string, TaskState>;
  context: WorkflowContext;
  history: WorkflowTransition[];
  metadata: WorkflowMetadata;
}

class WorkflowStateMachine {
  private states: Map<WorkflowStatus, WorkflowStateHandler>;
  private transitionRules: TransitionRules;
  private eventRecorder: WorkflowEventRecorder;
  
  constructor() {
    this.initializeStateHandlers();
    this.initializeTransitionRules();
  }
  
  async transition(
    workflowId: string,
    event: WorkflowEvent
  ): Promise<TransitionResult> {
    const currentState = await this.getState(workflowId);
    
    // Validate transition
    const validation = this.validateTransition(currentState.status, event.type);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }
    
    // Execute exit actions for current state
    await this.executeStateActions(currentState.status, 'exit', workflowId, event);
    
    // Record transition
    const transition: WorkflowTransition = {
      fromStatus: currentState.status,
      toStatus: event.targetStatus,
      event: event.type,
      timestamp: Date.now(),
      metadata: event.metadata
    };
    
    // Update state
    const newState = await this.updateState(workflowId, {
      status: event.targetStatus,
      currentPhase: event.targetPhase || currentState.currentPhase
    });
    
    // Record transition in history
    await this.recordTransition(workflowId, transition);
    
    // Execute entry actions for new state
    await this.executeStateActions(event.targetStatus, 'entry', workflowId, event);
    
    // Emit state change event
    this.emit('stateChanged', {
      workflowId,
      from: transition.fromStatus,
      to: transition.toStatus,
      event: event.type
    });
    
    return {
      success: true,
      newStatus: event.targetStatus,
      transition
    };
  }
  
  private validateTransition(
    currentStatus: WorkflowStatus,
    eventType: WorkflowEventType
  ): ValidationResult {
    const allowedTransitions = this.transitionRules.get(currentStatus);
    
    if (!allowedTransitions.includes(eventType)) {
      return {
        valid: false,
        error: `Invalid transition: Cannot transition from ${currentStatus} via ${eventType}`
      };
    }
    
    return { valid: true };
  }
  
  async recoverWorkflow(workflowId: string): Promise<RecoveryResult> {
    const state = await this.getState(workflowId);
    
    // Identify last valid checkpoint
    const checkpoint = await this.findLastValidCheckpoint(workflowId);
    
    // Restore from checkpoint
    const restoredState = await this.restoreFromCheckpoint(checkpoint);
    
    // Resume execution from restored state
    const resumeEvent: WorkflowEvent = {
      type: 'RESUME',
      targetStatus: 'running',
      metadata: {
        recoveryFrom: checkpoint.id,
        recoveredAt: Date.now()
      }
    };
    
    await this.transition(workflowId, resumeEvent);
    
    return {
      success: true,
      recoveredFrom: checkpoint.id,
      restoredTasks: restoredState.tasks.size,
      lostProgress: this.calculateLostProgress(state, restoredState)
    };
  }
}
```

## 5. Error Handling and Recovery

### 5.1 Error Classification and Handling

The system implements a comprehensive error classification scheme that enables appropriate handling strategies based on error type, severity, and context. Errors are categorized as recoverable, transient, or fatal, with specific handling procedures for each category.

```typescript
type ErrorCategory = 
  | 'validation'           // Input validation failures
  | 'communication'        // Message delivery failures
  | 'timeout'              // Operation timeouts
  | 'resource'             // Resource exhaustion
  | 'authorization'        // Permission/authorization failures
  | 'data_integrity'       // Data corruption or inconsistency
  | 'agent_unavailable'    // Agent not available
  | 'dependency'           // Dependency failure
  | 'internal'             // Internal system errors
  | 'configuration'        // Configuration errors;

interface AgentError {
  category: ErrorCategory;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: ErrorContext;
  timestamp: number;
  requestId?: string;
  stackTrace?: string;
}

class AgentErrorHandler {
  private errorClassifier: ErrorClassifier;
  private recoveryStrategies: Map<ErrorCategory, RecoveryStrategy>;
  private errorLogger: ErrorLogger;
  private metricsCollector: ErrorMetricsCollector;
  
  async handleError(
    error: AgentError,
    context: ErrorContext
  ): Promise<ErrorHandlingResult> {
    // Classify error if not already classified
    if (!error.category) {
      error.category = this.errorClassifier.classify(error);
    }
    
    // Log error
    await this.errorLogger.log(error, context);
    
    // Collect metrics
    await this.metricsCollector.record(error);
    
    // Get recovery strategy
    const strategy = this.recoveryStrategies.get(error.category);
    
    if (!strategy) {
      // No specific strategy - use default
      return this.defaultHandling(error, context);
    }
    
    // Execute recovery strategy
    return strategy.execute(error, context);
  }
  
  async handleMessageDeliveryFailure(
    message: AgentMessage,
    error: AgentError
  ): Promise<MessageFailureHandling> {
    // Determine if retry is appropriate
    if (error.retryable && message.retryCount < 3) {
      // Schedule retry with backoff
      const delay = this.calculateBackoff(message.retryCount);
      
      await this.scheduleRetry({
        message,
        error,
        delay,
        maxRetries: 3 - message.retryCount
      });
      
      return { action: 'retried', retryScheduled: true, delay };
    }
    
    // Check if dead letter queue is appropriate
    if (message.priority === 'critical' || !error.retryable) {
      await this.moveToDeadLetterQueue(message, error);
      return { action: 'dead_letter', queued: true };
    }
    
    // Return failure to sender
    await this.notifySenderOfFailure(message, error);
    return { action: 'failed', senderNotified: true };
  }
  
  async handleAgentFailure(
    agentId: AgentId,
    failure: AgentFailure
  ): Promise<AgentFailureHandling> {
    // Mark agent as unavailable
    await this.agentRegistry.markUnavailable(agentId, failure.reason);
    
    // Handle in-flight tasks
    const inFlightTasks = await this.taskManager.getTasksForAgent(agentId);
    
    // Reassign high-priority tasks
    const highPriorityTasks = inFlightTasks.filter(t => t.priority >= 8);
    for (const task of highPriorityTasks) {
      await this.reassignTask(task.id, getReplacementAgent(agentId));
    }
    
    // Pause or continue low-priority tasks
    const lowPriorityTasks = inFlightTasks.filter(t => t.priority < 8);
    for (const task of lowPriorityTasks) {
      await this.pauseTask(task.id, `Agent ${agentId} failed: ${failure.reason}`);
    }
    
    // Attempt agent recovery
    const recoveryAttempted = await this.attemptAgentRecovery(agentId);
    
    return {
      agentId,
      tasksReassigned: highPriorityTasks.length,
      tasksPaused: lowPriorityTasks.length,
      recoveryAttempted,
      timestamp: Date.now()
    };
  }
}
```

### 5.2 Human-in-the-Loop Patterns

For critical operations and high-uncertainty scenarios, the system supports human-in-the-loop escalation patterns that enable human review and approval before continuing.

```typescript
interface HumanEscalation {
  escalationId: string;
  originalRequest: AgentMessage;
  reason: EscalationReason;
  urgency: 'low' | 'normal' | 'high' | 'critical';
  context: EscalationContext;
  requiredApproverRole?: string;
  deadline?: number;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired';
  review?: HumanReview;
}

class HumanInTheLoopManager {
  private escalationStore: EscalationStore;
  private notificationService: NotificationService;
  private approvalWorkflow: ApprovalWorkflow;
  
  async escalate(
    request: AgentMessage,
    reason: EscalationReason,
    context: EscalationContext
  ): Promise<HumanEscalation> {
    const escalation: HumanEscalation = {
      escalationId: generateEscalationId(),
      originalRequest: request,
      reason,
      urgency: this.determineUrgency(reason, context),
      context,
      requiredApproverRole: reason.requiredApproverRole,
      deadline: reason.deadline ? Date.now() + reason.deadline : undefined,
      status: 'pending'
    };
    
    // Store escalation
    await this.escalationStore.store(escalation);
    
    // Notify approvers
    await this.notificationService.notifyApprovers(escalation);
    
    // Create approval workflow
    await this.approvalWorkflow.create(escalation);
    
    return escalation;
  }
  
  async submitReview(
    escalationId: string,
    review: HumanReview
  ): Promise<ReviewResult> {
    const escalation = await this.escalationStore.get(escalationId);
    if (!escalation) {
      throw new EscalationNotFoundError(escalationId);
    }
    
    // Validate reviewer permissions
    const hasPermission = await this.validateReviewerPermission(
      review.reviewerId,
      escalation.requiredApproverRole
    );
    
    if (!hasPermission) {
      throw new UnauthorizedReviewError();
    }
    
    // Update escalation
    escalation.status = review.approved ? 'approved' : 'rejected';
    escalation.review = review;
    await this.escalationStore.update(escalation);
    
    // Complete approval workflow
    await this.approvalWorkflow.complete(escalationId, review);
    
    // Notify original requester
    await this.notificationService.notifyRequester(escalation);
    
    return {
      success: true,
      escalationId,
      decision: review.approved ? 'approved' : 'rejected',
      nextAction: review.approved ? 'continue' : 'halt'
    };
  }
  
  async monitorPendingEscalations(): Promise<PendingEscalationReport> {
    const pending = await this.escalationStore.getPending();
    const now = Date.now();
    
    const overdue = pending.filter(e => e.deadline && now > e.deadline);
    const urgent = pending.filter(e => e.urgency === 'critical' || e.urgency === 'high');
    
    return {
      totalPending: pending.length,
      overdueCount: overdue.length,
      urgentCount: urgent.length,
      overdueEscalations: overdue,
      urgentEscalations: urgent
    };
  }
}
```

## 6. Performance and Monitoring

### 6.1 Metrics Collection

The system collects comprehensive metrics on agent interactions, message delivery, and coordination patterns to enable performance optimization and capacity planning.

```typescript
interface AgentInteractionMetrics {
  agentId: AgentId;
  period: TimePeriod;
  messages: {
    sent: number;
    received: number;
    failed: number;
    avgLatency: number;
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
  };
  tasks: {
    completed: number;
    failed: number;
    avgDuration: number;
    byPriority: Record<number, TaskMetrics>;
  };
  context: {
    operations: number;
    conflicts: number;
    avgRetrievalTime: number;
    cacheHitRate: number;
  };
}

class MetricsCollector {
  private metricsStore: MetricsStore;
  private realTimeEmitter: EventEmitter;
  
  async recordMessageMetrics(agentId: AgentId, metrics: MessageMetrics): Promise<void> {
    await this.metricsStore.record('message', {
      agentId,
      timestamp: Date.now(),
      ...metrics
    });
    
    // Emit for real-time monitoring
    this.realTimeEmitter.emit('message:metrics', { agentId, metrics });
  }
  
  async getAgentMetrics(
    agentId: AgentId,
    period: TimePeriod
  ): Promise<AgentInteractionMetrics> {
    return this.metricsStore.aggregate('agent', {
      agentId,
      period
    });
  }
  
  async getSystemHealth(): Promise<SystemHealthReport> {
    const [agentStatuses, queueDepths, errorRates] = await Promise.all([
      this.getAgentStatuses(),
      this.getQueueDepths(),
      this.getErrorRates()
    ]);
    
    return {
      timestamp: Date.now(),
      overallStatus: this.calculateOverallStatus(errorRates),
      agents: agentStatuses,
      queues: queueDepths,
      errors: errorRates,
      recommendations: this.generateRecommendations(agentStatuses, queueDepths, errorRates)
    };
  }
}
```

## 7. References

### Multi-Agent Frameworks

- LangGraph State Management: https://langchain-ai.github.io/langgraph/concepts/state/
- CrewAI Agent Communication: https://docs.crewai.com/agents/communication
- AutoGen Multi-Agent Conversation: https://microsoft.github.io/autogen/docs/topics/agentchat
- OpenAI Agents SDK Handoffs: https://openai.github.io/openai-agents-python/handoffs/

### Message Queue Patterns

- Enterprise Integration Patterns: https://www.enterpriseintegrationpatterns.com/
- RabbitMQ Patterns: https://www.rabbitmq.com/getstarted.html

### State Machine Design

- Workflow State Machines: https://docs.aws.amazon.com/step-functions/latest/dg/concepts-standard.html
- XState Framework: https://stately.ai/docs/state-machines

---

*Document Version: 1.0*
*Research Phase: 2 (Agent Interaction Protocols)*
*Last Updated: 2025-12-30*
*Next Review: 2025-01-15*
