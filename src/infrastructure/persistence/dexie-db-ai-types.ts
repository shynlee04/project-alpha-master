/**
 * @fileoverview AI Foundation Database Record Types
 * @module lib/state/dexie-db-ai-types
 * @governance EPIC-27-1c
 * @ai-observable true
 *
 * AI agent orchestration and conversation thread types.
 * Extracted from dexie-db.ts for better code organization.
 *
 * Story 27-1: State Architecture Stabilization
 * Story 27-1c: Persistence Migration (idb → Dexie)
 *
 * @ai-contracts
 * - TaskContext table for AI agent task tracking (Epic 25)
 * - ToolExecution table for AI tool audit trail (Epic 25)
 */

import type { Table } from 'dexie';

// ============================================================================
// AI Foundation Types (Epic 25 Prep)
// ============================================================================

/**
 * Status of an AI task
 * @ai-observable
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * TaskContext for AI agent orchestration
 * Stores context about what an AI agent is working on.
 *
 * @ai-observable
 * @epic Epic 25 - AI Foundation Sprint
 */
export interface TaskContextRecord {
    id: string;
    projectId: string;
    agentId: string;           // Which agent is executing
    status: TaskStatus;
    description: string;       // Human-readable task description
    targetFiles: string[];     // Files the agent is working on
    checkpoint?: unknown;      // LangGraph checkpoint data
    createdAt: Date;
    updatedAt: Date;
}

/**
 * ToolExecution audit trail
 * Records every tool call made by AI agents for observability.
 *
 * @ai-observable
 * @epic Epic 25 - AI Foundation Sprint
 */
export interface ToolExecutionRecord {
    id: string;
    taskId: string;            // Reference to TaskContext
    toolName: string;          // e.g., 'file_read', 'execute_command'
    input: unknown;            // Tool input parameters
    output?: unknown;          // Tool output (null if pending)
    status: 'pending' | 'success' | 'error';
    duration?: number;         // Execution time in ms
    createdAt: Date;
}

/**
 * CredentialRecord for encrypted API key storage
 * Used by CredentialVault for secure provider credentials.
 *
 * @epic Epic 25 - AI Foundation Sprint
 * @story 25-0 - ProviderAdapterFactory
 */
export interface CredentialRecord {
    providerId: string;         // Primary key (e.g., 'openrouter', 'openai')
    encrypted: string;          // Base64-encoded encrypted API key
    iv: string;                 // Base64-encoded initialization vector
    createdAt: Date;
}

// ============================================================================
// Conversation Threads (MVP-2 Chat Interface)
// ============================================================================

/**
 * Tool call record within a thread message
 * @epic MVP
 * @story MVP-2 - Chat Interface with Rich Streaming
 */
export interface ThreadToolCallRecord {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'success' | 'error';
    input?: unknown;
    output?: unknown;
    duration?: number;
}

/**
 * Message within a conversation thread
 * @epic MVP
 * @story MVP-2 - Chat Interface with Rich Streaming
 */
export interface ThreadMessageRecord {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    agentId?: string;
    agentName?: string;
    agentModel?: string;
    timestamp: number;
    toolCalls?: ThreadToolCallRecord[];
}

/**
 * Conversation thread record for Dexie persistence
 * Enables full-text indexing for search.
 *
 * @epic MVP
 * @story MVP-2 - Chat Interface with Rich Streaming
 */
export interface ConversationThreadRecord {
    id: string;                 // Primary key
    projectId: string;          // Index for project-scoped queries
    title: string;
    preview: string;            // First 100 chars of last message
    messages: ThreadMessageRecord[];
    agentsUsed: string[];       // Agent IDs used in this thread
    messageCount: number;
    scrollPosition: number;     // Chat scroll position for restoration (Story 24-3)
    createdAt: number;
    updatedAt: number;          // Index for sorting
}

// ============================================================================
// Table Type Exports
// ============================================================================

export type TaskContextTable = Table<TaskContextRecord, string>;
export type ToolExecutionTable = Table<ToolExecutionRecord, string>;
export type CredentialsTable = Table<CredentialRecord, string>;
export type ConversationThreadsTable = Table<ConversationThreadRecord, string>;
