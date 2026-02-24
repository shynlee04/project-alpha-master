/**
 * @fileoverview Thread/Chat Zod Schema - Domain Layer
 * @module domain/schemas/thread.schema
 *
 * Canonical Zod schema for Thread and Message entities.
 * Types are derived from schemas using z.infer for single source of truth.
 *
 * ARCHITECTURE: Project-centric model
 * - Thread belongs to Project via projectId
 * - NO workspaceId - platform determines plugin availability
 *
 * @phase 02 - Schema Definitions
 */

import { z } from 'zod';

// ============================================================================
// Tool Call Schema
// ============================================================================

/**
 * Tool call within a message - records agent tool execution
 */
export const ThreadToolCallSchema = z.object({
  /** Tool call ID */
  id: z.string(),
  /** Tool name (e.g., 'file_read', 'execute_command') */
  name: z.string(),
  /** Execution status */
  status: z.enum(['pending', 'running', 'success', 'error']),
  /** Tool input parameters */
  input: z.unknown().optional(),
  /** Tool output */
  output: z.unknown().optional(),
  /** Execution duration in ms */
  duration: z.number().optional(),
});

// ============================================================================
// Message Schema
// ============================================================================

/**
 * Thread Message Schema
 *
 * Individual message within a conversation thread.
 */
export const ThreadMessageSchema = z.object({
  /** Message ID (UUID) */
  id: z.string().uuid(),
  /** Message role */
  role: z.enum(['user', 'assistant', 'system']),
  /** Message content (markdown) */
  content: z.string(),
  /** Timestamp (Unix ms) */
  timestamp: z.number(),
  /** Agent ID if assistant message */
  agentId: z.string().optional(),
  /** Agent display name */
  agentName: z.string().optional(),
  /** Model identifier (e.g., 'gpt-4', 'claude-3') */
  agentModel: z.string().optional(),
  /** Tool calls made by assistant */
  toolCalls: z.array(ThreadToolCallSchema).optional(),
});

// ============================================================================
// Thread Schema
// ============================================================================

/**
 * Thread - Canonical Zod Schema
 *
 * Conversation thread containing messages.
 *
 * ARCHITECTURE:
 * - L3 (Persisted State) - stored in Dexie
 * - Read via useLiveQuery()
 * - Write via db.threads.put()
 *
 * Project-centric: Thread belongs to Project via projectId only.
 */
export const ThreadSchema = z.object({
  /** Thread ID (UUID) */
  id: z.string().uuid(),
  /** Project ID (foreign key) - the ONLY anchor */
  projectId: z.string().uuid(),
  /** Thread title (auto-generated or user-defined) */
  title: z.string(),
  /** Preview text (first 100 chars of last message) */
  preview: z.string(),
  /** Messages in this thread */
  messages: z.array(ThreadMessageSchema),
  /** Agent IDs used in this thread */
  agentsUsed: z.array(z.string()),
  /** Total message count */
  messageCount: z.number().int().nonnegative(),
  /** Scroll position for UI restoration */
  scrollPosition: z.number().default(0),
  /** Parent thread ID for branching (optional) */
  parentId: z.string().uuid().optional(),
  /** Creation timestamp (Unix ms) */
  createdAt: z.number(),
  /** Last update timestamp (Unix ms) */
  updatedAt: z.number(),
});

// ============================================================================
// Thread Hierarchy Schema
// ============================================================================

/**
 * Thread hierarchy node type (for recursive schema)
 */
export interface ThreadHierarchyNode {
  id: string;
  children: ThreadHierarchyNode[];
}

/**
 * Thread hierarchy node for nested thread display
 */
export const ThreadHierarchyNodeSchema: z.ZodType<ThreadHierarchyNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    children: z.array(ThreadHierarchyNodeSchema),
  })
);

// ============================================================================
// Derived Types
// ============================================================================

/** Tool call type */
export type ThreadToolCall = z.infer<typeof ThreadToolCallSchema>;

/** Message type */
export type ThreadMessage = z.infer<typeof ThreadMessageSchema>;

/** Thread type */
export type Thread = z.infer<typeof ThreadSchema>;

// ============================================================================
// Param Schemas
// ============================================================================

/**
 * Thread creation parameters
 * Excludes auto-generated fields: id, createdAt, updatedAt, messageCount
 */
export const ThreadCreateParamsSchema = ThreadSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  messageCount: true,
  preview: true,
  scrollPosition: true,
});

/** Thread creation parameters type */
export type ThreadCreateParams = z.infer<typeof ThreadCreateParamsSchema>;

/**
 * Thread update parameters
 */
export const ThreadUpdateParamsSchema = ThreadSchema.partial().required({
  id: true,
});

/** Thread update parameters type */
export type ThreadUpdateParams = z.infer<typeof ThreadUpdateParamsSchema>;
