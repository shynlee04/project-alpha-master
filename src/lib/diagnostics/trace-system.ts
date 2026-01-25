/**
 * DIAGNOSTIC TRACE SYSTEM
 * 
 * Structured observability for FSA project management.
 * Every critical flow produces a traceId with structured events.
 * 
 * Usage:
 *   import { createDiagnosticTrace, traceEvent } from '@/lib/diagnostics';
 *   
 *   const trace = createDiagnosticTrace('createProjectFromFolder', { projectId });
 *   trace.step('verifyHandle', { ok: true });
 *   trace.step('persistProject', { ok: false, errorCode: 'DEXIE_WRITE_FAILED' });
 *   trace.complete();
 */

import { db } from '@/infrastructure/persistence/dexie-db';
import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';
import { adaptDiagnosticTraceToEvent } from '@/domain/adapters';

// ============================================================================
// TYPES
// ============================================================================

export type FlowName = 
  | 'createProjectFromFolder'
  | 'loadProject'
  | 'notesImport'
  | 'ideInitialization'
  | 'folderSelection'
  | 'handleRestoration'
  | 'syncOperation';

export type StepName = string;

export type ErrorCode =
  | 'FSA_PERMISSION_REVOKED'
  | 'FSA_PERMISSION_DENIED'
  | 'FSA_HANDLE_INVALID'
  | 'DEXIE_RECORD_MISSING'
  | 'DEXIE_WRITE_FAILED'
  | 'HYDRATION_RACE'
  | 'PLATFORM_DETECTION_MISMATCH'
  | 'STORAGE_TYPE_MISMATCH'
  | 'DUPLICATE_PROJECT'
  | 'ROUTE_REDIRECT_LOOP'
  | 'ASYNC_TIMEOUT'
  | 'UNKNOWN';

export interface TraceEvent {
  traceId: string;
  flow: FlowName;
  step: StepName;
  timestamp?: number;
  ok: boolean;
  errorCode?: ErrorCode;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface Trace {
  traceId: string;
  flow: FlowName;
  startTime: number;
  events: TraceEvent[];
  endTime?: number;
  status: 'running' | 'success' | 'failed';
}

// ============================================================================
// DIAGNOSTIC TRACE STORE (IndexedDB)
// ============================================================================

const DIAGNOSTIC_TRACE_STORE = 'diagnosticTraces';
const MAX_TRACES_STORED = 50;

async function initDiagnosticStore(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    await db.version(1).stores({
      [DIAGNOSTIC_TRACE_STORE]: 'traceId, flow, timestamp'
    });
  } catch {
    // Store may already exist
  }
}

// ============================================================================
// TRACE CREATION
// ============================================================================

let _traceCounter = 0;

export function createDiagnosticTrace(
  flow: FlowName,
  metadata?: Record<string, unknown>
): Trace {
  const timestamp = Date.now();
  const traceId = `trace-${timestamp}-${++_traceCounter % 1000}`;
  
  const trace: Trace = {
    traceId,
    flow,
    startTime: timestamp,
    events: [],
    status: 'running'
  };
  
  // Emit start event
  traceEvent({
    traceId,
    flow,
    step: 'START',
    ok: true,
    metadata
  });
  
  // Register active trace
  _activeTraces.set(traceId, trace);
  
  return trace;
}

// ============================================================================
// TRACE EMISSION
// ============================================================================

const _activeTraces = new Map<string, Trace>();

export function traceEvent(event: Omit<TraceEvent, 'timestamp'>): void {
  const fullEvent: TraceEvent = {
    ...event,
    timestamp: Date.now()
  };
  
  // Store in memory (for active traces)
  const activeTrace = _activeTraces.get(event.traceId);
  if (activeTrace) {
    activeTrace.events.push(fullEvent);
  }
  
  // Log to console with structured format
  console.log(
    `[TRACE:${event.flow}] ${event.step} | ${event.ok ? '✅' : '❌'} | traceId=${event.traceId}` +
    (event.errorCode ? ` | error=${event.errorCode}` : '') +
    (event.metadata ? ` | ${JSON.stringify(event.metadata)}` : '')
  );
  
  // Store in IndexedDB for diagnostics panel
  persistTraceEvent(fullEvent);
}

async function persistTraceEvent(event: TraceEvent): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    await initDiagnosticStore();
    const traceDoc = {
      traceId: event.traceId,
      flow: event.flow,
      step: event.step,
      timestamp: event.timestamp,
      ok: event.ok,
      errorCode: event.errorCode,
      errorMessage: event.errorMessage,
      metadata: event.metadata
    };
    
    await db.diagnosticTraces.put(traceDoc);
    
    // Cleanup old traces
    const count = await db.diagnosticTraces.count();
    if (count > MAX_TRACES_STORED) {
      const oldest = await db.diagnosticTraces.orderBy('timestamp').first();
      if (oldest) {
        await db.diagnosticTraces.delete(oldest.traceId);
      }
    }
  } catch (error) {
    console.warn('[TRACE] Failed to persist trace event:', error);
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR COMMON FLOWS
// ============================================================================

/**
 * Verify FSA handle access - returns trace event
 */
export async function traceVerifyHandleAccess(
  traceId: string,
  flow: FlowName,
  handle: FileSystemDirectoryHandle | null,
  expectedProjectId: string
): Promise<{ ok: boolean; errorCode?: ErrorCode }> {
  if (!handle) {
    traceEvent({
      traceId,
      flow,
      step: 'verifyHandle',
      ok: false,
      errorCode: 'FSA_HANDLE_INVALID',
      metadata: { expectedProjectId }
    });
    return { ok: false, errorCode: 'FSA_HANDLE_INVALID' };
  }
  
  try {
    // Try to access the handle
    const name = handle.name;
    
    traceEvent({
      traceId,
      flow,
      step: 'verifyHandle',
      ok: true,
      metadata: { projectId: expectedProjectId, handleName: name }
    });
    
    return { ok: true };
  } catch (error) {
    const errorCode = error instanceof Error && error.name === 'NotAllowedError'
      ? 'FSA_PERMISSION_REVOKED'
      : 'UNKNOWN';
    
    traceEvent({
      traceId,
      flow,
      step: 'verifyHandle',
      ok: false,
      errorCode,
      errorMessage: error instanceof Error ? error.message : String(error),
      metadata: { expectedProjectId }
    });
    
    return { ok: false, errorCode };
  }
}

/**
 * Verify Dexie record exists - returns trace event
 */
export async function traceVerifyDexieRecord(
  traceId: string,
  flow: FlowName,
  projectId: string,
  storeName: string
): Promise<{ ok: boolean; errorCode?: ErrorCode; record?: unknown }> {
  try {
    const record = await (db as any)[storeName].get(projectId);
    
    if (!record) {
      traceEvent({
        traceId,
        flow,
        step: 'verifyDexieRecord',
        ok: false,
        errorCode: 'DEXIE_RECORD_MISSING',
        metadata: { projectId, storeName }
      });
      return { ok: false, errorCode: 'DEXIE_RECORD_MISSING' };
    }
    
    traceEvent({
      traceId,
      flow,
      step: 'verifyDexieRecord',
      ok: true,
      metadata: { projectId, storeName }
    });
    
    return { ok: true, record };
  } catch (error) {
    traceEvent({
      traceId,
      flow,
      step: 'verifyDexieRecord',
      ok: false,
      errorCode: 'DEXIE_WRITE_FAILED',
      errorMessage: error instanceof Error ? error.message : String(error),
      metadata: { projectId, storeName }
    });
    
    return { ok: false, errorCode: 'DEXIE_WRITE_FAILED' };
  }
}

/**
 * Verify FSA handle persistence - returns trace event
 */
export async function traceVerifyHandlePersistence(
  traceId: string,
  flow: FlowName,
  projectId: string
): Promise<{ ok: boolean; errorCode?: ErrorCode }> {
  try {
    const hasHandle = await handlePersistenceService.canSilentRestore(projectId);
    
    if (!hasHandle) {
      traceEvent({
        traceId,
        flow,
        step: 'verifyHandlePersistence',
        ok: false,
        errorCode: 'FSA_HANDLE_INVALID',
        metadata: { projectId }
      });
      return { ok: false, errorCode: 'FSA_HANDLE_INVALID' };
    }
    
    traceEvent({
      traceId,
      flow,
      step: 'verifyHandlePersistence',
      ok: true,
      metadata: { projectId }
    });
    
    return { ok: true };
  } catch (error) {
    traceEvent({
      traceId,
      flow,
      step: 'verifyHandlePersistence',
      ok: false,
      errorCode: 'UNKNOWN',
      errorMessage: error instanceof Error ? error.message : String(error),
      metadata: { projectId }
    });
    
    return { ok: false, errorCode: 'UNKNOWN' };
  }
}

// ============================================================================
// TRACE COMPLETION
// ============================================================================

export function completeTrace(traceId: string, flow: FlowName, status: 'success' | 'failed'): void {
  traceEvent({
    traceId,
    flow,
    step: status === 'success' ? 'COMPLETE' : 'FAILED',
    ok: status === 'success'
  });
  
  _activeTraces.delete(traceId);
}

// ============================================================================
// DIAGNOSTICS PANEL DATA
// ============================================================================

export async function getRecentTraces(limit: number = 10): Promise<Trace[]> {
  if (typeof window === 'undefined') return [];
  
  try {
    await initDiagnosticStore();
    const traces = await db.diagnosticTraces
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
    
    // Group by traceId
    const grouped = new Map<string, Trace>();
    
    for (const event of traces) {
      if (!grouped.has(event.traceId)) {
        grouped.set(event.traceId, {
          traceId: event.traceId,
          flow: event.flow as FlowName,
          startTime: event.timestamp ?? 0,
          events: [],
          status: event.step === 'COMPLETE' ? 'success' : 
                  event.step === 'FAILED' ? 'failed' : 'running'
        });
      }
      grouped.get(event.traceId)!.events.push(adaptDiagnosticTraceToEvent(event));
    }
    
    return Array.from(grouped.values()).sort((a, b) => 
      b.startTime - a.startTime
    );
  } catch {
    return [];
  }
}

export async function clearTraces(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    await initDiagnosticStore();
    await db.diagnosticTraces.clear();
  } catch (error) {
    console.warn('[TRACE] Failed to clear traces:', error);
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export { createDiagnosticTrace as default };
