/**
 * @fileoverview Tool Error Handling
 * @module lib/agent/tools/tool-error
 *
 * Error classification, retry logic, and error handling for tool execution.
 *
 * @story 4-4 - Tool Error Handling with Retry Logic
 * @epic 4 - Smart Agent Tools
 */

import type { ToolCallInfo } from './types';

/**
 * Error category classification
 */
export type ErrorCategory = 'TRANSIENT' | 'PERMANENT' | 'UNKNOWN';

/**
 * Metadata for tool errors
 */
export interface ToolErrorMetadata {
  /** Tool identifier */
  toolId: string;
  /** Human-readable tool name */
  toolName: string;
  /** Tool parameters (sanitized) */
  parameters: Record<string, unknown>;
  /** Error category */
  category: ErrorCategory;
  /** Whether the error is retryable */
  retryable: boolean;
  /** Original error */
  originalError: Error;
  /** Number of retry attempts made */
  attemptCount: number;
}

/**
 * Result of tool execution
 */
export interface ExecutionResult<T = unknown> {
  /** Whether execution succeeded */
  success: boolean;
  /** Result data if successful */
  data?: T;
  /** Error details if failed */
  error?: ToolError;
  /** Number of attempts made */
  attemptCount: number;
  /** Duration in milliseconds */
  duration: number;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  maxRetries: number;
  /** Base delay before retry (ms) */
  baseDelay: number;
  /** Maximum delay (ms) */
  maxDelay: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 1,
  baseDelay: 1000,
  maxDelay: 5000,
};

/**
 * ToolError - Custom error class for tool execution failures
 */
export class ToolError extends Error {
  /** Error code for categorization */
  readonly errorCode: string;
  /** Detailed error metadata */
  readonly metadata: ToolErrorMetadata;

  constructor(
    message: string,
    errorCode: string,
    metadata: Omit<ToolErrorMetadata, 'originalError'>,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ToolError';
    this.errorCode = errorCode;
    this.metadata = {
      ...metadata,
      originalError: originalError ?? this,
    };

    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ToolError);
    }
  }

  /**
   * Serialize to JSON for logging/persistence
   */
  toJSON(): string {
    return JSON.stringify({
      message: this.message,
      errorCode: this.errorCode,
      metadata: {
        toolId: this.metadata.toolId,
        toolName: this.metadata.toolName,
        category: this.metadata.category,
        retryable: this.metadata.retryable,
        attemptCount: this.metadata.attemptCount,
      },
    });
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(json: string): ToolError {
    const data = JSON.parse(json);
    return new ToolError(
      data.message,
      data.errorCode,
      {
        toolId: data.metadata.toolId,
        toolName: data.metadata.toolName,
        parameters: {},
        category: data.metadata.category,
        retryable: data.metadata.retryable,
        attemptCount: data.metadata.attemptCount,
      }
    );
  }
}

/**
 * Classify an error into a category
 */
export function classifyError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();

  // Transient errors (retryable)
  const transientPatterns = [
    'eagain',
    'ewouldblock',
    'ebusy',
    'resource busy',
    'locked',
    'etimedout',
    'timeout',
    'temporary',
    'temporarily unavailable',
    'econnreset',
    'econnaborted',
    'enetdown',
    'enetunreach',
    'ehostdown',
    'ehostunreach',
  ];

  if (transientPatterns.some(pattern => message.includes(pattern))) {
    return 'TRANSIENT';
  }

  // Permanent errors (not retryable)
  const permanentPatterns = [
    'enoent',
    'no such file',
    'not found',
    'eacces',
    'permission denied',
    'eperm',
    'eisdir',
    'is a directory',
    'enotdir',
    'not a directory',
    'einval',
    'invalid',
    'epath',
    'bad path',
    'ebadf',
    'bad file descriptor',
    'efbig',
    'file too large',
    'enospc',
    'no space',
    'edquot',
    'quota exceeded',
    'erofs',
    'read-only',
  ];

  if (permanentPatterns.some(pattern => message.includes(pattern))) {
    return 'PERMANENT';
  }

  // Default to UNKNOWN (conservative - retry)
  return 'UNKNOWN';
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const category = classifyError(error);
  // Transient and unknown errors are retryable
  return category === 'TRANSIENT' || category === 'UNKNOWN';
}

/**
 * Sensitive path patterns to redact in error messages
 */
const SENSITIVE_PATH_PATTERNS = [
  /\.ssh\//gi,
  /\.aws\//gi,
  /\.config\/auth/gi,
  /\.netrc/gi,
  /\/etc\/passwd/gi,
  /\/etc\/shadow/gi,
];

/**
 * Redact sensitive paths from a message
 */
function redactSensitivePaths(message: string): string {
  let redacted = message;
  for (const pattern of SENSITIVE_PATH_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]/');
  }
  return redacted;
}

/**
 * Create a ToolError from an original error
 */
export function createToolError(
  toolId: string,
  toolName: string,
  parameters: Record<string, unknown>,
  originalError: Error,
  attemptCount: number = 1
): ToolError {
  const category = classifyError(originalError);
  const retryable = isRetryableError(originalError);

  // Extract error code from message
  const errorCode = extractErrorCode(originalError.message);

  // Sanitize parameters (remove sensitive values)
  const sanitizedParams = sanitizeParameters(parameters);

  // Sanitize error message (redact sensitive paths)
  const sanitizedMessage = redactSensitivePaths(originalError.message);

  return new ToolError(
    `${toolName} failed: ${sanitizedMessage}`,
    errorCode,
    {
      toolId,
      toolName,
      parameters: sanitizedParams,
      category,
      retryable,
      attemptCount,
    },
    originalError
  );
}

/**
 * Extract error code from error message
 */
function extractErrorCode(message: string): string {
  // Look for common error codes in message
  const codePatterns = [
    { pattern: /ENOENT/i, code: 'ENOENT' },
    { pattern: /EACCES/i, code: 'EACCES' },
    { pattern: /EBUSY/i, code: 'EBUSY' },
    { pattern: /EAGAIN/i, code: 'EAGAIN' },
    { pattern: /ETIMEDOUT/i, code: 'ETIMEDOUT' },
    { pattern: /EINVAL/i, code: 'EINVAL' },
    { pattern: /EISDIR/i, code: 'EISDIR' },
    { pattern: /ENOTDIR/i, code: 'ENOTDIR' },
  ];

  for (const { pattern, code } of codePatterns) {
    if (pattern.test(message)) {
      return code;
    }
  }

  // Return generic code based on category
  const category = classifyError(new Error(message));
  switch (category) {
    case 'TRANSIENT':
      return 'ETRANS';
    case 'PERMANENT':
      return 'EPERM';
    default:
      return 'EUNKNOWN';
  }
}

/**
 * Sanitize parameters to remove sensitive values
 */
function sanitizeParameters(params: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'credential'];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 100) {
      // Truncate long string values
      sanitized[key] = value.substring(0, 100) + '...';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Create a result from tool call info
 */
export function createResultFromToolCall<T>(
  toolCall: ToolCallInfo,
  success: boolean,
  data?: T,
  error?: Error,
  duration?: number
): ExecutionResult<T> {
  if (success) {
    return {
      success: true,
      data,
      attemptCount: 1,
      duration: duration ?? 0,
    };
  }

  const toolError = error
    ? createToolError(
        toolCall.toolId,
        toolCall.toolName,
        toolCall.parameters,
        error,
        1
      )
    : undefined;

  return {
    success: false,
    error: toolError,
    attemptCount: 1,
    duration: duration ?? 0,
  };
}

/**
 * Get display name for tool
 */
function getToolDisplayName(toolId: string): string {
  const displayNames: Record<string, string> = {
    read_file: 'Read File',
    write_file: 'Write File',
    list_files: 'List Files',
    delete_file: 'Delete File',
    execute_command: 'Execute Command',
    create_directory: 'Create Directory',
    read_directory: 'Read Directory',
  };
  return displayNames[toolId] ?? toolId.replace(/_/g, ' ');
}

/**
 * ToolExecutor - Executes tools with retry logic and race condition prevention
 */
export class ToolExecutor {
  private config: RetryConfig;
  private executionQueue: Map<string, Promise<ExecutionResult>> = new Map();

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Execute a tool with retry logic
   */
  async execute<T>(
    toolId: string,
    executor: () => Promise<T>
  ): Promise<ExecutionResult<T>> {
    const startTime = performance.now();

    // Check queue for race condition prevention
    const queueKey = toolId;
    if (this.executionQueue.has(queueKey)) {
      // Wait for existing execution
      await this.executionQueue.get(queueKey);
    }

    // Create new execution promise (race condition guard)
    const executionPromise = this.executeWithRetry(toolId, executor, startTime);
    this.executionQueue.set(queueKey, executionPromise);

    try {
      const result = await executionPromise;
      return result;
    } finally {
      this.executionQueue.delete(queueKey);
    }
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetry<T>(
    toolId: string,
    executor: () => Promise<T>,
    startTime: number
  ): Promise<ExecutionResult<T>> {
    let lastError: Error | undefined;
    const maxAttempts = this.config.maxRetries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const data = await executor();
        const duration = performance.now() - startTime;

        return {
          success: true,
          data,
          attemptCount: attempt,
          duration,
        };
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (!isRetryableError(lastError) || attempt >= maxAttempts) {
          // Not retryable or max retries reached
          const duration = performance.now() - startTime;
          const toolError = createToolError(
            toolId,
            getToolDisplayName(toolId),
            {},
            lastError,
            attempt
          );

          return {
            success: false,
            error: toolError,
            attemptCount: attempt,
            duration,
          };
        }

        // Wait before retrying
        const delay = Math.min(
          this.config.baseDelay,
          this.config.maxDelay
        );
        await this.sleep(delay);
      }
    }

    // Should not reach here
    const duration = performance.now() - startTime;
    return {
      success: false,
      error: lastError ? createToolError(toolId, getToolDisplayName(toolId), {}, lastError, 1) : undefined,
      attemptCount: 1,
      duration,
    };
  }

  /**
   * Sleep for specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): { toolId: string; queued: boolean }[] {
    const status: { toolId: string; queued: boolean }[] = [];
    this.executionQueue.forEach((_, toolId) => {
      status.push({ toolId, queued: true });
    });
    return status;
  }
}

/**
 * Execute tool function with error handling
 */
export async function executeTool<T>(
  toolId: string,
  _toolName: string,
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<ExecutionResult<T>> {
  const executor = new ToolExecutor(config);
  return executor.execute(toolId, fn);
}
