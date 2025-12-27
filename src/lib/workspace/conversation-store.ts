/**
 * Conversation Store
 * 
 * @module lib/workspace/conversation-store
 * @governance EPIC-27-1c
 * 
 * Story 27-1c: Migrated to use Dexie.js
 */

import { getPersistenceDB, type ConversationRecord } from '../persistence'

export type ConversationMessageRole = 'user' | 'assistant' | 'system'

export interface ConversationMessage {
  id: string
  role: ConversationMessageRole
  content: string
  timestamp: number
}

export interface ToolResultRecord {
  id: string
  toolName: string
  input: unknown
  output: unknown
  timestamp: number
}

export interface ConversationState {
  projectId: string
  messages: ConversationMessage[]
  toolResults: ToolResultRecord[]
  updatedAt: Date
}

function toConversationState(record: ConversationRecord): ConversationState {
  return {
    projectId: record.projectId,
    messages: (record.messages ?? []) as ConversationMessage[],
    toolResults: (record.toolResults ?? []) as ToolResultRecord[],
    updatedAt: record.updatedAt,
  }
}

export async function getConversation(projectId: string): Promise<ConversationState | null> {
  const db = await getPersistenceDB()
  if (!db) return null

  const record = await db.get<ConversationRecord>('conversations', projectId)
  if (!record) return null

  return toConversationState(record)
}

export async function saveConversation(state: ConversationState): Promise<boolean> {
  const db = await getPersistenceDB()
  if (!db) return false

  const record: ConversationRecord = {
    id: state.projectId,
    projectId: state.projectId,
    messages: state.messages,
    toolResults: state.toolResults,
    updatedAt: state.updatedAt,
  }

  await db.put('conversations', record)
  return true
}

export async function appendConversationMessage(
  projectId: string,
  message: ConversationMessage,
): Promise<boolean> {
  const db = await getPersistenceDB()
  if (!db) return false

  // Get existing conversation
  const existing = await db.get<ConversationRecord>('conversations', projectId)

  const next: ConversationRecord = existing
    ? {
      ...existing,
      messages: [...((existing.messages ?? []) as ConversationMessage[]), message],
      updatedAt: new Date(),
    }
    : {
      id: projectId,
      projectId,
      messages: [message],
      toolResults: [],
      updatedAt: new Date(),
    }

  await db.put('conversations', next)
  return true
}

export async function appendToolResult(
  projectId: string,
  toolResult: ToolResultRecord,
): Promise<boolean> {
  const db = await getPersistenceDB()
  if (!db) return false

  // Get existing conversation
  const existing = await db.get<ConversationRecord>('conversations', projectId)

  const next: ConversationRecord = existing
    ? {
      ...existing,
      toolResults: [...((existing.toolResults ?? []) as ToolResultRecord[]), toolResult],
      updatedAt: new Date(),
    }
    : {
      id: projectId,
      projectId,
      messages: [],
      toolResults: [toolResult],
      updatedAt: new Date(),
    }

  await db.put('conversations', next)
  return true
}

export async function clearConversation(projectId: string): Promise<boolean> {
  const db = await getPersistenceDB()
  if (!db) return false

  await db.delete('conversations', projectId)
  return true
}

export async function listRecentConversations(limit = 20): Promise<ConversationState[]> {
  const db = await getPersistenceDB()
  if (!db) return []

  // Get all and sort by updatedAt (Dexie doesn't support idb-style iteration)
  const all = await db.getAll<ConversationRecord>('conversations')

  return all
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
    .map(toConversationState)
}
