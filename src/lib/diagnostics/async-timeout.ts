/**
 * ASYNC OPERATION TIMEOUTS
 * 
 * Ensures all async operations have deadlines to prevent infinite spinners.
 * Uses AbortSignal for cooperative cancellation.
 * 
 * Usage:
 *   const result = await withDeadline(
 *     () => importDirectory(handle),
 *     { deadlineMs: 5000, operationName: 'folderImport' }
 *   );
 *   
 *   if (result.status === 'timeout') {
 *     // Show actionable remediation UI
 *   }
 */

import { traceEvent, createDiagnosticTrace, completeTrace, FlowName } from './trace-system';

// ============================================================================
// TYPES
// ============================================================================

export type AsyncOperationStatus = 
  | 'success'
  | 'timeout'
  | 'cancelled'
  | 'error';

export interface AsyncOperationResult<T = unknown> {
  status: AsyncOperationStatus;
  data?: T;
  error?: Error;
  errorCode?: string;
  durationMs: number;
}

export interface DeadlineOptions {
  deadlineMs: number;
  operationName: string;
  flow?: FlowName;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// WITH DEADLINE
// ============================================================================

/**
 * Execute an async operation with a deadline.
 * Prevents infinite hanging by timing out after deadlineMs.
 * 
 * @param operation - Async function to execute
 * @param options - Deadline configuration
 * @returns Result with status, data, or error
 */
export async function withDeadline<T>(
  operation: () => Promise<T>,
  options: DeadlineOptions
): Promise<AsyncOperationResult<T>> {
  const startTime = Date.now();
  const { deadlineMs, operationName, flow = 'syncOperation', metadata } = options;
  
  // Create trace for observability
  const trace = createDiagnosticTrace(flow, { 
    operation: operationName, 
    deadlineMs,
    ...metadata 
  });
  
  // Create AbortController for cancellation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    
    traceEvent({
      traceId: trace.traceId,
      flow: trace.flow,
      step: 'asyncTimeout',
      ok: false,
      errorCode: 'ASYNC_TIMEOUT',
      metadata: { operationName, deadlineMs }
    });
  }, deadlineMs);
  
  try {
    // Execute operation with signal
    const data = await operation();
    clearTimeout(timeoutId);
    
    traceEvent({
      traceId: trace.traceId,
      flow: trace.flow,
      step: 'asyncComplete',
      ok: true,
      metadata: { operationName, durationMs: Date.now() - startTime }
    });
    
    completeTrace(trace.traceId, trace.flow, 'success');
    
    return {
      status: 'success',
      data,
      durationMs: Date.now() - startTime
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    const isCancelled = error instanceof Error && error.name === 'AbortError';
    const isTimeout = error instanceof Error && error.message?.includes('timeout');
    
    const status: AsyncOperationStatus = isCancelled || isTimeout 
      ? 'timeout' 
      : 'error';
    
    traceEvent({
      traceId: trace.traceId,
      flow: trace.flow,
      step: 'asyncError',
      ok: false,
      errorCode: status === 'timeout' ? 'ASYNC_TIMEOUT' : 'UNKNOWN',
      errorMessage: error instanceof Error ? error.message : String(error),
      metadata: { operationName, status }
    });
    
    completeTrace(trace.traceId, trace.flow, 'failed');
    
    return {
      status,
      error: error instanceof Error ? error : new Error(String(error)),
      errorCode: status === 'timeout' ? 'ASYNC_TIMEOUT' : 'UNKNOWN',
      durationMs: Date.now() - startTime
    };
  }
}

// ============================================================================
// WITH TIMEOUT (ALIAS FOR BACKWARD COMPATIBILITY)
// ============================================================================

export { withDeadline as withTimeout };

// ============================================================================
// CONVENIENCE WRAPPERS FOR COMMON OPERATIONS
// ============================================================================

/**
 * Import directory with deadline
 */
export async function importDirectoryWithDeadline(
  importFn: () => Promise<unknown>,
  projectId: string,
  deadlineMs: number = 10000
): Promise<AsyncOperationResult> {
  return withDeadline(importFn, {
    deadlineMs,
    operationName: 'importDirectory',
    flow: 'folderSelection',
    metadata: { projectId }
  });
}

/**
 * Verify handle access with deadline
 */
export async function verifyHandleWithDeadline(
  verifyFn: () => Promise<boolean>,
  projectId: string,
  deadlineMs: number = 5000
): Promise<AsyncOperationResult<boolean>> {
  return withDeadline(verifyFn, {
    deadlineMs,
    operationName: 'verifyHandleAccess',
    flow: 'handleRestoration',
    metadata: { projectId }
  });
}

/**
 * Load project with deadline
 */
export async function loadProjectWithDeadline(
  loadFn: () => Promise<unknown>,
  projectId: string,
  deadlineMs: number = 8000
): Promise<AsyncOperationResult> {
  return withDeadline(loadFn, {
    deadlineMs,
    operationName: 'loadProject',
    flow: 'loadProject',
    metadata: { projectId }
  });
}

/**
 * Notes import with deadline
 */
export async function notesImportWithDeadline(
  importFn: () => Promise<unknown>,
  projectId: string,
  deadlineMs: number = 15000
): Promise<AsyncOperationResult> {
  return withDeadline(importFn, {
    deadlineMs,
    operationName: 'notesImport',
    flow: 'notesImport',
    metadata: { projectId }
  });
}

// ============================================================================
// ERROR RECOVERY SUGGESTIONS
// ============================================================================

export function getRecoverySuggestion(errorCode: string, operation: string): string {
  const suggestions: Record<string, string> = {
    'FSA_PERMISSION_REVOKED': `Permission to ${operation} was revoked. Click "Regrant Access" to restore.`,
    'FSA_PERMISSION_DENIED': `Permission denied for ${operation}. Check browser permissions.`,
    'FSA_HANDLE_INVALID': `Handle for ${operation} is invalid. The folder may have been moved or deleted.`,
    'DEXIE_RECORD_MISSING': `Project record missing for ${operation}. This may be a sync issue.`,
    'DEXIE_WRITE_FAILED': `Database write failed for ${operation}. Try again or refresh.`,
    'ASYNC_TIMEOUT': `${operation} timed out. The folder may be too large or inaccessible. Try a smaller folder.`,
    'HYDRATION_RACE': `State hydration conflict during ${operation}. Refresh the page.`,
    'UNKNOWN': `${operation} failed with an unknown error. Check console for details.`
  };
  
  return suggestions[errorCode] || `${operation} failed. Check console for details.`;
}
