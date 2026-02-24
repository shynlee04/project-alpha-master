/**
 * Type Adapter Layer - Domain Layer
 *
 * Converts between incompatible types from SDKs, databases, and external systems.
 * This layer isolates type mismatches and provides type-safe transformations.
 *
 * @layer Domain
 * @module adapters
 */

import type { FlashcardSetRecord } from '@/infrastructure/persistence/dexie-db-study-types';
import type { AnyClientTool } from '@tanstack/ai';
import type { Block } from '@blocknote/core';
import type { DiagnosticTraceEventRecord } from '@/infrastructure/persistence/dexie-db-session-types';
import type { TraceEvent, FlowName, ErrorCode } from '@/lib/diagnostics/trace-system';

/**
 * Validate if a value is a BlockNote Block
 */
export function isBlock(value: unknown): value is Block {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value.type === 'paragraph' ||
      value.type === 'heading' ||
      value.type === 'list' ||
      value.type === 'bulletList' ||
      value.type === 'numberedList' ||
      value.type === 'quote' ||
      value.type === 'codeBlock' ||
      value.type === 'divider' ||
      value.type === 'image')
  );
}

/**
 * Validate if a value is an AnyClientTool from TanStack AI
 */
export function isAnyClientTool(value: unknown): value is AnyClientTool {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'description' in value
  );
}

/**
 * Adapter: FlashcardSetRecord to FlashcardRecord[] (placeholder)
 *
 * NOTE: FlashcardSetRecord contains cardIds, but FlashcardRecord
 * represents individual cards. This adapter returns card IDs that
 * need to be fetched separately to get full card data.
 *
 * @param set - FlashcardSetRecord from database
 * @returns Array of FlashcardRecord stubs (id + relationship info only)
 */
export function adaptFlashcardSetToRecords(
  set: FlashcardSetRecord
): Array<{ id: string; setId: string; projectId?: string }> {
  // Return minimal stub - full cards must be fetched separately
  return (set.cardIds || []).map((cardId) => ({
    id: cardId,
    setId: set.id,
    projectId: set.projectId,
  }));
}

/**
 * Adapter: unknown[] to AnyClientTool[]
 *
 * Converts unknown array from tool registry to typed AnyClientTool array.
 * Uses type guard for runtime validation.
 *
 * @param tools - Unknown array from tool registry
 * @returns Array of AnyClientTool
 */
export function adaptToolsToClientTools(tools: unknown[]): AnyClientTool[] {
  return tools.filter(isAnyClientTool);
}

/**
 * Adapter: unknown[] to Block[]
 *
 * Converts unknown array from BlockNote parser to typed Block array.
 * Uses type guard for runtime validation.
 *
 * @param blocks - Unknown array from BlockNote
 * @returns Array of BlockNote Block
 */
export function adaptBlocksFromUnknown(blocks: unknown[]): Block[] {
  return blocks.filter(isBlock);
}

/**
 * Adapter: DiagnosticTraceEventRecord to TraceEvent
 *
 * Converts database record to TraceEvent domain type.
 * Casts flow: string to FlowName enum with validation.
 *
 * @param record - DiagnosticTraceEventRecord from database
 * @returns TraceEvent domain type
 */
/**
 * Adapter: DiagnosticTraceEventRecord to TraceEvent
 *
 * Converts database record to TraceEvent domain type.
 * Casts flow: string to FlowName enum with validation.
 *
 * @param record - DiagnosticTraceEventRecord from database
 * @returns TraceEvent domain type
 */
export function adaptDiagnosticTraceToEvent(
  record: DiagnosticTraceEventRecord
): TraceEvent {
  // Validate flow value
  const validFlows: FlowName[] = [
    'createProjectFromFolder',
    'loadProject',
    'notesImport',
    'ideInitialization',
    'folderSelection',
    'handleRestoration',
    'syncOperation',
  ];

  const flow: FlowName = validFlows.includes(record.flow as FlowName)
    ? (record.flow as FlowName)
    : 'syncOperation'; // Default fallback

  // Cast error code
  const errorCode: ErrorCode | undefined = record.errorCode
    ? (record.errorCode as ErrorCode)
    : undefined;

  return {
    traceId: record.traceId,
    flow,
    step: record.step,
    timestamp: record.timestamp,
    ok: record.ok,
    errorCode,
    errorMessage: record.errorMessage,
    metadata: record.metadata,
  };
}

/**
 * Adapter: Async Block parser
 *
 * Wraps async BlockNote parser that returns Promise<Block[]>
 * Use this where synchronous Block[] is expected but async parser is available.
 *
 * @param markdown - Markdown string
 * @param asyncParser - Async parser function that returns Promise<Block[]>
 * @returns Promise<Block[]>
 */
export async function adaptMarkdownToBlocks(
  markdown: string,
  asyncParser: (markdown: string) => Promise<Block[]>
): Promise<Block[]> {
  return await asyncParser(markdown);
}
