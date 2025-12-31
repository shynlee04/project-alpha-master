---
date: 2025-12-31
time: 00:26:30
phase: Research Complete
team: Team-A
agent_mode: bmad-core-bmad-master
---

# Agent Interaction Protocols

## Executive Summary

This document defines formal specifications for inter-agent communication, context sharing, and coordination mechanisms within the Frontier RAG Knowledge Synthesis Expert System. The protocols establish standardized message formats, communication patterns, and error handling strategies for effective multi-agent collaboration.

## 1. Agent Communication Architecture

### 1.1 Communication Patterns

| Pattern | Use Case | Reliability |
|---------|----------|-------------|
| **Request-Response** | Direct agent queries | High |
| **Publish-Subscribe** | Event-driven updates | Medium |
| **Streaming** | Long-running synthesis | High |
| **Broadcast** | System-wide notifications | Low |

### 1.2 Message Format Specification

```typescript
interface AgentMessage<T = unknown> {
  // Core identification
  id: string;                    // Unique message identifier
  correlationId: string;         // For request-response tracking
  conversationId: string;        // Session-level grouping
  
  // Sender/receiver information
  from: AgentType;
  to: AgentType[];
  cc?: AgentType[];
  
  // Message content
  type: MessageType;
  priority: 'low' | 'normal' | 'high' | 'critical';
  payload: T;
  
  // Context and metadata
  context: MessageContext;
  metadata: MessageMetadata;
  
  // Temporal information
  createdAt: Date;
  expiresAt?: Date;
  ttl?: number; // Time-to-live in seconds
}

type MessageType = 
  | 'task-request'
  | 'task-response'
  | 'task-failure'
  | 'context-update'
  | 'heartbeat'
  | 'shutdown'
  | 'escalation'
  | 'notification';

interface MessageContext {
  sessionId: string;
  userId: string;
  taskId: string;
  maxIterations: number;
  timeout: number;
  dependencies: AgentType[];
  parentTaskId?: string;
}

interface MessageMetadata {
  version: string;
  protocol: 'v1';
  tracing: {
    spanId: string;
    traceId: string;
    parentSpanId?: string;
  };
  retry: {
    attempts: number;
    maxAttempts: number;
    backoffMs: number;
  };
}
```

## 2. Inter-Agent Communication Protocols

### 2.1 Sequential Coordination Protocol

For workflows requiring ordered task execution with explicit dependencies:

```typescript
interface SequentialCoordination {
  workflowType: 'sequential';
  agents: AgentExecution[];
  dependencies: DependencyGraph;
  synchronization: {
    barrier: boolean;
    checkpoint: boolean;
  };
}

interface AgentExecution {
  agent: AgentType;
  task: string;
  input: unknown;
  output: unknown;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startCondition: {
    type: 'all-predecessors' | 'specific-agent' | 'time-delay';
    predecessors?: string[];
    delayMs?: number;
  };
}

interface DependencyGraph {
  nodes: AgentType[];
  edges: Array<{
    from: AgentType;
    to: AgentType;
    type: 'data' | 'control' | 'feedback';
  }>;
}
```

### 2.2 Parallel Execution Protocol

For independent tasks that can execute concurrently:

```typescript
interface ParallelCoordination {
  workflowType: 'parallel';
  agents: AgentExecution[];
  fanout: {
    strategy: 'broadcast' | 'load-balanced' | 'round-robin';
    maxConcurrent: number;
  };
  fanin: {
    strategy: 'all-complete' | 'first-complete' | 'threshold-complete';
    threshold?: number;
  };
}
```

### 2.3 Hierarchical Protocol

For master-agent coordination with sub-agent delegation:

```typescript
interface HierarchicalCoordination {
  workflowType: 'hierarchical';
  coordinator: AgentType;
  workers: Array<{
    agent: AgentType;
    scope: string[];
    authority: {
      canDelegate: boolean;
      maxDelegationDepth: number;
    };
  }>;
  escalation: {
    autoEscalate: boolean;
    escalationConditions: string[];
    escalationTarget?: AgentType;
  };
}
```

## 3. Context Sharing Mechanisms

### 3.1 Shared Context Structure

```typescript
interface SharedContext {
  // Session information
  session: {
    id: string;
    userId: string;
    createdAt: Date;
    lastActivity: Date;
  };
  
  // Task context
  task: {
    id: string;
    goal: string;
    constraints: string[];
    progress: number;
  };
  
  // Knowledge context
  knowledge: {
    retrievedDocuments: RetrievedDocument[];
    synthesisHistory: SynthesisStep[];
    citations: Citation[];
  };
  
  // Agent state
  agentStates: Map<AgentType, AgentState>;
  
  // User preferences
  preferences: {
    outputFormat: OutputFormat;
    detailLevel: 'brief' | 'detailed' | 'comprehensive';
    language: string;
  };
}

interface RetrievedDocument {
  id: string;
  source: string;
  relevanceScore: number;
  content: string;
  metadata: Record<string, unknown>;
}

interface SynthesisStep {
  agent: AgentType;
  action: string;
  input: unknown;
  output: unknown;
  timestamp: Date;
}

interface AgentState {
  status: 'idle' | 'processing' | 'waiting' | 'error';
  currentTask?: string;
  progress: number;
  lastActivity: Date;
  resourceUsage: {
    memory: number;
    cpu: number;
  };
}
```

### 3.2 Context Propagation Protocol

```typescript
interface ContextPropagation {
  strategy: 'broadcast' | 'ondemand' | 'incremental';
  
  broadcast: {
    triggers: ContextChangeTrigger[];
    scope: 'all' | 'relevant-only';
  };
  
  ondemand: {
    cacheTimeout: number;
    prefetch: boolean;
  };
  
  incremental: {
    diffOnly: boolean;
    compression: 'none' | 'gzip';
  };
}

type ContextChangeTrigger = 
  | 'document-retrieved'
  | 'synthesis-completed'
  | 'citation-added'
  | 'user-feedback-received';
```

## 4. Message Passing Implementation

### 4.1 Message Bus Configuration

```typescript
import { EventEmitter } from 'eventemitter3';

class AgentMessageBus extends EventEmitter {
  private queues: Map<string, AgentMessage[]>;
  private processing: Set<string>;
  private deadLetterQueue: AgentMessage[];
  
  constructor(private config: MessageBusConfig) {
    super();
    this.queues = new Map();
    this.processing = new Set();
    this.deadLetterQueue = [];
  }
  
  async publish(message: AgentMessage): Promise<void> {
    // Validate message format
    this.validateMessage(message);
    
    // Route to appropriate queue
    const queueKey = this.getQueueKey(message);
    this.ensureQueue(queueKey);
    
    // Add to queue
    this.queues.get(queueKey)!.push(message);
    
    // Emit event for monitoring
    this.emit('message:published', message);
    
    // Trigger processing if not already running
    if (!this.processing.has(queueKey)) {
      this.processQueue(queueKey);
    }
  }
  
  async subscribe(
    agent: AgentType,
    filter: MessageFilter
  ): Promise<MessageSubscription> {
    const subscriptionId = crypto.randomUUID();
    
    return {
      id: subscriptionId,
      agent,
      filter,
      handler: async (message: AgentMessage) => {
        if (this.matchesFilter(message, filter)) {
          await this.deliverToAgent(agent, message);
        }
      },
    };
  }
  
  private async processQueue(queueKey: string): Promise<void> {
    this.processing.add(queueKey);
    
    while (this.queues.get(queueKey)?.length > 0) {
      const message = this.queues.get(queueKey)!.shift()!;
      
      try {
        await this.processMessage(message);
        this.emit('message:processed', message);
      } catch (error) {
        await this.handleProcessingError(message, error);
      }
    }
    
    this.processing.delete(queueKey);
  }
  
  private async processMessage(message: AgentMessage): Promise<void> {
    const startTime = Date.now();
    
    // Route to target agents
    for (const target of message.to) {
      try {
        await this.deliverToAgent(target, message);
        this.emit('message:delivered', { message, target });
      } catch (error) {
        // Handle delivery failure
        await this.retryDelivery(message, target, error);
      }
    }
    
    // Update metrics
    this.recordProcessingTime(message.id, Date.now() - startTime);
  }
}
```

### 4.2 Message Delivery Reliability

```typescript
interface DeliveryGuarantees {
  atLeastOnce: boolean;
  atMostOnce: boolean;
  exactlyOnce: boolean;
}

const deliveryConfig: DeliveryGuarantees = {
  atLeastOnce: true,  // Default for task messages
  atMostOnce: false,  // For notifications
  exactlyOnce: false, // For synthesis (handled at application level)
};

// Retry configuration
const retryConfig = {
  maxAttempts: 3,
  initialBackoffMs: 1000,
  maxBackoffMs: 30000,
  backoffMultiplier: 2,
  jitter: true,
};
```

## 5. Error Handling and Recovery

### 5.1 Error Classification

```typescript
enum AgentErrorCode {
  // Input errors
  INVALID_MESSAGE = 'AGENT_001',
  MISSING_CONTEXT = 'AGENT_002',
  TIMEOUT = 'AGENT_003',
  
  // Processing errors
  SYNTHESIS_FAILED = 'AGENT_010',
  RETRIEVAL_FAILED = 'AGENT_011',
  VALIDATION_FAILED = 'AGENT_012',
  
  // Communication errors
  DELIVERY_FAILED = 'AGENT_020',
  ROUTING_FAILED = 'AGENT_021',
  
  // System errors
  RESOURCE_EXHAUSTED = 'AGENT_030',
  UNEXPECTED_FAILURE = 'AGENT_099',
}

interface AgentError {
  code: AgentErrorCode;
  message: string;
  details: Record<string, unknown>;
  recoverable: boolean;
  retryable: boolean;
  fallbackStrategy?: FallbackStrategy;
}
```

### 5.2 Recovery Strategies

```typescript
interface FallbackStrategy {
  strategy: 'retry' | 'escalate' | 'alternate-path' | 'degrade';
  
  retry?: {
    attempts: number;
    backoff: number;
    conditions: AgentErrorCode[];
  };
  
  escalate?: {
    target: AgentType;
    includeContext: boolean;
  };
  
  alternatePath?: {
    agents: AgentType[];
    conditions: AgentErrorCode[];
  };
  
  degrade?: {
    reducedCapabilities: string[];
    notifyUser: boolean;
  };
}
```

## 6. Agent Coordination Examples

### 6.1 Research → Synthesis Handoff

```typescript
async function coordinateResearchToSynthesis(
  researchAgent: AgentType,
  synthesizerAgent: AgentType,
  task: ResearchTask
): Promise<SynthesisResult> {
  // Phase 1: Research
  const researchMessage: AgentMessage<ResearchTask> = {
    id: crypto.randomUUID(),
    correlationId: task.id,
    conversationId: task.sessionId,
    from: 'coordinator',
    to: [researchAgent],
    type: 'task-request',
    priority: 'high',
    payload: task,
    context: {
      sessionId: task.sessionId,
      userId: task.userId,
      taskId: task.id,
      maxIterations: 3,
      timeout: 60000,
      dependencies: [],
    },
    metadata: {
      version: '1.0',
      protocol: 'v1',
      tracing: {
        spanId: createSpanId(),
        traceId: task.traceId,
      },
      retry: { attempts: 0, maxAttempts: 3, backoffMs: 1000 },
    },
    createdAt: new Date(),
  };
  
  const researchResult = await messageBus.publish(researchMessage);
  
  // Phase 2: Synthesis with research context
  const synthesisMessage: AgentMessage<SynthesisTask> = {
    id: crypto.randomUUID(),
    correlationId: task.id,
    conversationId: task.sessionId,
    from: 'coordinator',
    to: [synthesizerAgent],
    type: 'task-request',
    priority: 'high',
    payload: {
      ...task,
      context: {
        researchFindings: researchResult.findings,
        sources: researchResult.sources,
      },
    },
    context: {
      sessionId: task.sessionId,
      userId: task.userId,
      taskId: `synthesis-${task.id}`,
      maxIterations: 2,
      timeout: 120000,
      dependencies: [researchAgent],
    },
    metadata: {
      version: '1.0',
      protocol: 'v1',
      tracing: {
        spanId: createSpanId(),
        traceId: task.traceId,
        parentSpanId: researchMessage.metadata.tracing.spanId,
      },
      retry: { attempts: 0, maxAttempts: 3, backoffMs: 2000 },
    },
    createdAt: new Date(),
  };
  
  return await messageBus.publish(synthesisMessage);
}
```

### 6.2 Multi-Agent Parallel Execution

```typescript
async function coordinateParallelResearch(
  agents: AgentType[],
  query: string,
  sessionId: string
): Promise<ResearchResult[]> {
  const messages = agents.map((agent, index) => ({
    id: crypto.randomUUID(),
    correlationId: sessionId,
    conversationId: sessionId,
    from: 'coordinator',
    to: [agent],
    type: 'task-request' as const,
    priority: 'normal',
    payload: {
      query,
      perspective: ['technical', 'practical', 'theoretical'][index],
    },
    context: {
      sessionId,
      userId: 'system',
      taskId: `parallel-research-${index}`,
      maxIterations: 1,
      timeout: 30000,
      dependencies: [],
    },
    metadata: {
      version: '1.0',
      protocol: 'v1',
      tracing: {
        spanId: createSpanId(),
        traceId: sessionId,
      },
      retry: { attempts: 0, maxAttempts: 2, backoffMs: 500 },
    },
    createdAt: new Date(),
  }));
  
  // Publish all messages in parallel
  const results = await Promise.all(
    messages.map(msg => messageBus.publish(msg))
  );
  
  return results;
}
```

## 7. Performance Considerations

### 7.1 Message Throughput Targets

| Metric | Target | Measurement Window |
|--------|--------|-------------------|
| Messages per second | 1000 | Per agent |
| End-to-end latency (P50) | < 100ms | Request-response |
| End-to-end latency (P95) | < 500ms | Request-response |
| End-to-end latency (P99) | < 2000ms | Request-response |
| Error rate | < 0.1% | Per day |

### 7.2 Resource Management

```typescript
interface ResourceManager {
  concurrencyLimit: number;  // Max concurrent messages per agent
  memoryLimit: number;       // Max memory per agent (bytes)
  cpuLimit: number;          // Max CPU time per agent (ms)
  
  monitoring: {
    sampleRate: number;      // Metrics sampling rate
    alertThresholds: ResourceThresholds;
  };
}

const resourceConfig: ResourceManager = {
  concurrencyLimit: 10,
  memoryLimit: 512 * 1024 * 1024, // 512MB
  cpuLimit: 30000,                // 30 seconds
  monitoring: {
    sampleRate: 0.1,
    alertThresholds: {
      memory: 0.8,  // Alert at 80% memory usage
      cpu: 0.9,     // Alert at 90% CPU usage
      latency: 1000, // Alert at 1 second latency
    },
  },
};
```

## 8. Security Considerations

### 8.1 Message Security

```typescript
interface SecurityConfig {
  authentication: {
    required: boolean;
    method: 'api-key' | 'oauth' | 'jwt';
    rotationPeriod: number;
  };
  
  authorization: {
    policy: 'deny-by-default' | 'allow-by-default';
    agentCapabilities: Map<AgentType, Capability[]>;
  };
  
  encryption: {
    inTransit: boolean;
    atRest: boolean;
    algorithm: 'aes-256-gcm' | 'chacha20-poly1305';
  };
  
  audit: {
    enabled: boolean;
    retentionDays: number;
    sensitiveFields: string[];
  };
}
```

## 9. References

- **EventEmitter3**: https://github.com/primus/eventemitter3
- **LangGraph Coordination**: https://langchain-ai.github.io/langgraph/
- **Message Queue Patterns**: https://www.enterpriseintegrationpatterns.com/

---

**Document Version**: 1.0  
**Status**: Approved for Implementation  
**Next Review**: 2026-01-15
