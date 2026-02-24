/**
 * @fileoverview Spike Logger Implementation
 * @module harness/instrumentation/logger
 *
 * Logging infrastructure with dual-stream output (human-readable + JSON).
 *
 * ANNOTATION: 2026-01-11 - Implementation for test spike harness - Task requirements
 */

import * as fs from 'fs';
import * as path from 'path';
import { Writable } from 'stream';

/**
 * Log level enum
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Tool call log entry
 */
export interface ToolCallLog {
  timestamp: string;
  runId: string;
  toolName: string;
  inputs: Record<string, unknown>;
  permissionsEvaluated: PermissionResult[];
  output: unknown;
  latency: number;
  error?: string;
}

/**
 * Permission evaluation result
 */
export interface PermissionResult {
  permission: string;
  granted: boolean;
  reason?: string;
  profile?: string;
}

/**
 * State transition log entry
 */
export interface StateTransitionLog {
  timestamp: string;
  runId: string;
  fromState: AgentState;
  toState: AgentState;
  reason: string;
  duration?: number;
}

/**
 * Agent state enum
 */
export enum AgentState {
  IDLE = 'IDLE',
  INITIALIZING = 'INITIALIZING',
  EXECUTING = 'EXECUTING',
  WAITING_FOR_INPUT = 'WAITING_FOR_INPUT',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

/**
 * Spike logger configuration
 */
export interface SpikeLoggerConfig {
  humanLogPath: string;
  jsonLogPath: string;
  runId?: string;
  append?: boolean;
  verbose?: boolean;
}

/**
 * Logger for test spike harness
 * Provides dual-stream logging (human-readable + JSON)
 */
export class SpikeLogger {
  private config: SpikeLoggerConfig;
  private humanLogStream: fs.WriteStream | null = null;
  private jsonLogStream: fs.WriteStream | null = null;
  private runStartTime: number;
  private runId: string;
  private metrics: RunMetrics;

  constructor(config: SpikeLoggerConfig) {
    this.config = config;
    this.runId = config.runId || this.generateRunId();
    this.runStartTime = Date.now();
    this.metrics = this.initializeMetrics();
    this.initializeStreams();
  }

  /**
   * Generate a unique run ID
   */
  private generateRunId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `run-${timestamp}-${random}`;
  }

  /**
   * Initialize log streams
   */
  private initializeStreams(): void {
    const humanLogDir = path.dirname(this.config.humanLogPath);
    const jsonLogDir = path.dirname(this.config.jsonLogPath);

    try {
      if (!fs.existsSync(humanLogDir)) {
        fs.mkdirSync(humanLogDir, { recursive: true });
      }
      if (!fs.existsSync(jsonLogDir)) {
        fs.mkdirSync(jsonLogDir, { recursive: true });
      }
    } catch {
      // Directory creation failed, will use stderr fallback
    }

    try {
      this.humanLogStream = fs.createWriteStream(this.config.humanLogPath, {
        flags: this.config.append ? 'a' : 'w',
      });
      this.jsonLogStream = fs.createWriteStream(this.config.jsonLogPath, {
        flags: this.config.append ? 'a' : 'w',
      });
    } catch {
      // Stream creation failed, will use console fallback
    }

    this.logInfo(`[HARNESS] Test run started: ${this.runId}`);
    this.logInfo(`[HARNESS] Human log: ${this.config.humanLogPath}`);
    this.logInfo(`[HARNESS] JSON log: ${this.config.jsonLogPath}`);
  }

  /**
   * Initialize run metrics
   */
  private initializeMetrics(): RunMetrics {
    return {
      totalToolCalls: 0,
      successfulToolCalls: 0,
      failedToolCalls: 0,
      totalLatency: 0,
      permissionDenied: 0,
      stateTransitions: 0,
      errors: [],
      toolCalls: [],
      stateTransitionsLog: [],
    };
  }

  /**
   * Get formatted timestamp
   */
  private getTimestamp(): string {
    const now = new Date();
    const iso = now.toISOString();
    const elapsed = ((Date.now() - this.runStartTime) / 1000).toFixed(3);
    return `[${iso}] (+${elapsed}s)`;
  }

  /**
   * Log to human-readable stream
   */
  private writeHumanLog(level: LogLevel, message: string): void {
    const entry = `${this.getTimestamp()} [${level.padEnd(5)}] ${message}\n`;
    
    if (this.humanLogStream) {
      try {
        this.humanLogStream.write(entry);
      } catch {
        process.stderr.write(entry);
      }
    } else {
      process.stderr.write(entry);
    }
  }

  /**
   * Log to JSON stream
   */
  private writeJsonLog(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const entry: JsonLogEntry = {
      timestamp: new Date().toISOString(),
      runId: this.runId,
      elapsed: Date.now() - this.runStartTime,
      level,
      message,
      data,
    };

    const jsonLine = JSON.stringify(entry) + '\n';
    
    if (this.jsonLogStream) {
      try {
        this.jsonLogStream.write(jsonLine);
      } catch {
        process.stderr.write(jsonLine);
      }
    } else {
      process.stderr.write(jsonLine);
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (this.config.verbose) {
      this.writeHumanLog(LogLevel.DEBUG, message);
      this.writeJsonLog(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * Log info message
   */
  logInfo(message: string, data?: Record<string, unknown>): void {
    this.writeHumanLog(LogLevel.INFO, message);
    this.writeJsonLog(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   */
  logWarn(message: string, data?: Record<string, unknown>): void {
    this.writeHumanLog(LogLevel.WARN, message);
    this.writeJsonLog(LogLevel.WARN, message, data);
  }

  /**
   * Log error message
   */
  logError(message: string, error?: Error, data?: Record<string, unknown>): void {
    const fullMessage = error ? `${message}: ${error.message}` : message;
    this.writeHumanLog(LogLevel.ERROR, fullMessage);
    
    if (error?.stack) {
      this.writeHumanLog(LogLevel.ERROR, `Stack: ${error.stack}`);
    }

    this.writeJsonLog(LogLevel.ERROR, fullMessage, {
      ...data,
      errorMessage: error?.message,
      errorStack: error?.stack,
    });

    this.metrics.errors.push({
      timestamp: new Date().toISOString(),
      message: fullMessage,
      stack: error?.stack,
    });
  }

  /**
   * Log a tool call
   */
  logToolCall(call: ToolCallLog): void {
    this.metrics.totalToolCalls++;
    this.metrics.totalLatency += call.latency;

    if (call.error) {
      this.metrics.failedToolCalls++;
      this.writeHumanLog(LogLevel.ERROR, `[TOOL] ❌ ${call.toolName} failed after ${call.latency}ms`);
    } else {
      this.metrics.successfulToolCalls++;
      this.writeHumanLog(LogLevel.INFO, `[TOOL] ✅ ${call.toolName} completed in ${call.latency}ms`);
    }

    // Log permission denials
    const denied = call.permissionsEvaluated.filter(p => !p.granted);
    if (denied.length > 0) {
      this.metrics.permissionDenied += denied.length;
      denied.forEach(p => {
        this.writeHumanLog(LogLevel.WARN, `  └─ Permission denied: ${p.permission}`);
      });
    }

    this.writeJsonLog(LogLevel.INFO, `Tool call: ${call.toolName}`, {
      toolName: call.toolName,
      latency: call.latency,
      success: !call.error,
      permissions: call.permissionsEvaluated,
    });

    this.metrics.toolCalls.push(call);
  }

  /**
   * Log a permission check
   */
  logPermissionCheck(permission: string, result: PermissionResult): void {
    const status = result.granted ? '✅' : '❌';
    this.writeHumanLog(
      result.granted ? LogLevel.DEBUG : LogLevel.WARN,
      `[PERM] ${status} ${permission} - ${result.reason || 'granted'}`
    );

    this.writeJsonLog(LogLevel.INFO, `Permission check: ${permission}`, {
      permission,
      granted: result.granted,
      reason: result.reason,
      profile: result.profile,
    });
  }

  /**
   * Log a state transition
   */
  logStateTransition(from: AgentState, to: AgentState, reason: string): void {
    this.metrics.stateTransitions++;
    const duration = Date.now() - this.runStartTime;

    this.writeHumanLog(LogLevel.INFO, `[STATE] ${from} → ${to} (${reason})`);

    const transition: StateTransitionLog = {
      timestamp: new Date().toISOString(),
      runId: this.runId,
      fromState: from,
      toState: to,
      reason,
      duration,
    };

    this.writeJsonLog(LogLevel.INFO, `State transition: ${from} → ${to}`, {
      fromState: from,
      toState: to,
      reason,
      duration,
    });

    this.metrics.stateTransitionsLog.push(transition);
  }

  /**
   * Log stdout from a tool execution
   */
  logStdout(toolName: string, output: string): void {
    const lines = output.split('\n').filter(l => l.trim());
    lines.slice(-10).forEach(line => {
      this.writeHumanLog(LogLevel.INFO, `[${toolName}] ${line}`);
    });
  }

  /**
   * Log stderr from a tool execution
   */
  logStderr(toolName: string, error: string): void {
    const lines = error.split('\n').filter(l => l.trim());
    lines.slice(-5).forEach(line => {
      this.writeHumanLog(LogLevel.WARN, `[${toolName}] ⚠️  ${line}`);
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): RunMetrics {
    return {
      ...this.metrics,
      successRate: this.metrics.totalToolCalls > 0
        ? (this.metrics.successfulToolCalls / this.metrics.totalToolCalls * 100).toFixed(2) + '%'
        : 'N/A',
      averageLatency: this.metrics.totalToolCalls > 0
        ? (this.metrics.totalLatency / this.metrics.totalToolCalls).toFixed(2) + 'ms'
        : 'N/A',
    };
  }

  /**
   * Get run ID
   */
  getRunId(): string {
    return this.runId;
  }

  /**
   * Finalize the logger (close streams)
   */
  async finalize(): Promise<RunMetrics> {
    const duration = Date.now() - this.runStartTime;
    
    this.logInfo(`[HARNESS] Test run completed: ${this.runId}`);
    this.logInfo(`[HARNESS] Duration: ${duration}ms`);
    this.logInfo(`[HARNESS] Total tool calls: ${this.metrics.totalToolCalls}`);
    this.logInfo(`[HARNESS] Success rate: ${this.getMetrics().successRate}`);

    if (this.humanLogStream) {
      await new Promise<void>((resolve) => {
        this.humanLogStream!.end(resolve);
      });
    }

    if (this.jsonLogStream) {
      await new Promise<void>((resolve) => {
        this.jsonLogStream!.end(resolve);
      });
    }

    return this.getMetrics();
  }

  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, unknown>): SpikeLogger {
    const childLogger = new SpikeLogger({
      humanLogPath: this.config.humanLogPath,
      jsonLogPath: this.config.jsonLogPath,
      runId: this.runId,
      append: true,
      verbose: this.config.verbose,
    });

    childLogger.logInfo(`[CHILD] Logger child created with context: ${JSON.stringify(context)}`);

    return childLogger;
  }
}

/**
 * JSON log entry structure
 */
interface JsonLogEntry {
  timestamp: string;
  runId: string;
  elapsed: number;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Run metrics interface
 */
export interface RunMetrics {
  totalToolCalls: number;
  successfulToolCalls: number;
  failedToolCalls: number;
  totalLatency: number;
  permissionDenied: number;
  stateTransitions: number;
  errors: Array<{ timestamp: string; message: string; stack?: string }>;
  toolCalls: ToolCallLog[];
  stateTransitionsLog: StateTransitionLog[];
  successRate?: string;
  averageLatency?: string;
}

/**
 * Create a console-only logger for testing without file system
 */
export function createConsoleLogger(runId?: string): SpikeLogger {
  return new SpikeLogger({
    humanLogPath: '/dev/null',
    jsonLogPath: '/dev/null',
    runId: runId || `test-${Date.now()}`,
    verbose: true,
  });
}
