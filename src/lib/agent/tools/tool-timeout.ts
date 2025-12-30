/**
 * @fileoverview Tool Execution Timeout & Graceful Degradation
 * @module lib/agent/tools/tool-timeout
 * @governance EPIC-31-4
 *
 * Enforces 30s default timeout for tool execution with AbortController.
 * Provides warning at 25s threshold and graceful cleanup.
 *
 * Story 31.4: Tool Execution Timeout & Graceful Degradation
 */

/**
 * Tool timeout configuration
 */
export interface ToolTimeoutConfig {
  /**
   * Default timeout in milliseconds
   */
  default: number;

  /**
   * Warning threshold in milliseconds
   */
  warning: number;

  /**
   * Maximum timeout in milliseconds (absolute max)
   */
  max: number;

  /**
   * Tool-specific timeouts
   */
  toolSpecific: {
    [toolName: string]: number;
  };
}

/**
 * Default timeout configuration
 */
export const DEFAULT_TIMEOUT_CONFIG: ToolTimeoutConfig = {
  default: 30000,      // 30s default
  warning: 25000,      // 25s warning threshold
  max: 600000,         // 10min absolute max
  toolSpecific: {
    'write_file': 5000,      // 5s for file writes
    'run_command': 120000,   // 2min for shell commands
    'read_file': 3000,       // 3s for file reads
    'list_directory': 5000,  // 5s for directory listing
    'search_files': 10000,   // 10s for file search
  },
};

/**
 * Get timeout for a specific tool
 *
 * @param toolName - Tool name
 * @param config - Timeout configuration
 * @returns Timeout in milliseconds
 */
export function getToolTimeout(
  toolName: string,
  config: ToolTimeoutConfig = DEFAULT_TIMEOUT_CONFIG
): number {
  // Check for tool-specific timeout
  if (config.toolSpecific[toolName] !== undefined) {
    return config.toolSpecific[toolName];
  }

  // Use default timeout
  return config.default;
}

/**
 * Get warning threshold for a tool
 *
 * @param toolName - Tool name
 * @param config - Timeout configuration
 * @returns Warning threshold in milliseconds
 */
export function getWarningThreshold(
  toolName: string,
  config: ToolTimeoutConfig = DEFAULT_TIMEOUT_CONFIG
): number {
  const timeout = getToolTimeout(toolName, config);

  // Use 83% of timeout as warning threshold (25s for 30s timeout)
  return Math.floor(timeout * 0.83);
}

/**
 * Execute tool with timeout
 *
 * @param toolName - Tool name
 * @param toolFn - Tool function to execute
 * @param config - Timeout configuration
 * @returns Tool execution result
 * @throws Error if timeout occurs
 *
 * @example
 * ```typescript
 * const result = await executeWithTimeout(
 *   'write_file',
 *   async (signal) => {
 *     return await writeFile(path, content, { signal });
 *   }
 * );
 * ```
 */
export async function executeWithTimeout<T>(
  toolName: string,
  toolFn: (signal: AbortSignal) => Promise<T>,
  config: ToolTimeoutConfig = DEFAULT_TIMEOUT_CONFIG
): Promise<T> {
  const timeout = getToolTimeout(toolName, config);
  const warningThreshold = getWarningThreshold(toolName, config);

  // Create abort controller
  const controller = new AbortController();
  const signal = controller.signal;

  // Set up timeout
  let timeoutId: NodeJS.Timeout | undefined;
  let warningId: NodeJS.Timeout | undefined;

  const cleanup = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (warningId) clearTimeout(warningId);
    controller.abort();
  };

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Tool "${toolName}" timed out after ${timeout}ms`));
    }, timeout);
  });

  // Create warning promise (resolves when warning threshold reached)
  const warningPromise = new Promise<void>((resolve) => {
    warningId = setTimeout(() => {
      console.warn(`Tool "${toolName}" taking longer than expected (${warningThreshold}ms)`);
      // Trigger warning callback if provided
      if (config.onWarning) {
        config.onWarning(toolName, warningThreshold);
      }
      resolve();
    }, warningThreshold);
  });

  try {
    // Race between tool execution, timeout, and warning
    const result = await Promise.race([
      toolFn(signal),
      timeoutPromise,
    ]);

    // Clear warning timeout
    if (warningId) clearTimeout(warningId);

    return result;
  } catch (error) {
    // Check if aborted
    if (signal.aborted) {
      throw new Error(`Tool "${toolName}" was aborted`);
    }

    throw error;
  } finally {
    // Cleanup
    if (timeoutId) clearTimeout(timeoutId);
    if (warningId) clearTimeout(warningId);
    controller.abort();
  }
}

/**
 * Execute tool with timeout and progress callbacks
 *
 * @param toolName - Tool name
 * @param toolFn - Tool function to execute
 * @param callbacks - Progress and warning callbacks
 * @param config - Timeout configuration
 * @returns Tool execution result
 */
export async function executeWithTimeoutAndProgress<T>(
  toolName: string,
  toolFn: (signal: AbortSignal, onProgress: (progress: number) => void) => Promise<T>,
  callbacks: {
    onProgress?: (progress: number) => void;
    onWarning?: (toolName: string, elapsed: number) => void;
    onComplete?: (duration: number) => void;
  },
  config: ToolTimeoutConfig = DEFAULT_TIMEOUT_CONFIG
): Promise<T> {
  const timeout = getToolTimeout(toolName, config);
  const warningThreshold = getWarningThreshold(toolName, config);
  const startTime = Date.now();

  // Create abort controller
  const controller = new AbortController();
  const signal = controller.signal;

  // Progress reporting interval
  let progressInterval: NodeJS.Timeout | undefined;

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error(`Tool "${toolName}" timed out after ${timeout}ms`));
    }, timeout);
  });

  // Create warning promise
  const warningPromise = new Promise<void>((resolve) => {
    setTimeout(() => {
      callbacks.onWarning?.(toolName, warningThreshold);
      resolve();
    }, warningThreshold);
  });

  // Progress interval
  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min((elapsed / timeout) * 100, 100);
    callbacks.onProgress?.(progress);
  }, 100);

  try {
    // Execute tool with progress
    const result = await Promise.race([
      toolFn(signal, (progress) => {
        callbacks.onProgress?.(progress);
      }),
      timeoutPromise,
    ]);

    // Clear intervals
    if (progressInterval) clearInterval(progressInterval);

    // Report completion
    const duration = Date.now() - startTime;
    callbacks.onComplete?.(duration);

    return result;
  } catch (error) {
    // Clear intervals
    if (progressInterval) clearInterval(progressInterval);

    // Check if aborted
    if (signal.aborted) {
      throw new Error(`Tool "${toolName}" was aborted`);
    }

    throw error;
  } finally {
    // Always abort controller
    controller.abort();
  }
}

/**
 * Format timeout duration as human-readable string
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration
 */
export function formatTimeoutDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = Math.floor(ms / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}min`;
  }

  return `${minutes}min ${remainingSeconds}s`;
}

/**
 * Get timeout options for user selection
 *
 * @param currentTimeout - Current timeout in milliseconds
 * @param config - Timeout configuration
 * @returns Array of timeout options
 */
export function getTimeoutOptions(
  currentTimeout: number,
  config: ToolTimeoutConfig = DEFAULT_TIMEOUT_CONFIG
): Array<{ value: number; label: string; isCurrent: boolean }> {
  const options = [
    config.default,
    60000,    // 1min
    120000,   // 2min
    300000,   // 5min
    600000,   // 10min
  ];

  // Filter to max timeout
  const filtered = options.filter((t) => t <= config.max);

  return filtered.map((timeout) => ({
    value: timeout,
    label: formatTimeoutDuration(timeout),
    isCurrent: timeout === currentTimeout,
  }));
}

/**
 * Timeout configuration extended with callbacks
 */
export interface ToolTimeoutConfigWithCallbacks extends ToolTimeoutConfig {
  onWarning?: (toolName: string, elapsed: number) => void;
  onProgress?: (toolName: string, progress: number) => void;
  onComplete?: (toolName: string, duration: number) => void;
}
