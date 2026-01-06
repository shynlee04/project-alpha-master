import type { ToolExecutionContext } from './types';
import type { ToolExecutionLogRecord } from '../../state/dexie-db';
import {
  db,
  addToolExecutionLog,
  updateToolExecutionLog,
  getToolExecutionLogs,
  clearToolExecutionLogs
} from '../../state/dexie-db';

/**
 * ToolExecutionLogger - Manages logging of tool executions for:
 * 1. Audit trail of all tool calls
 * 2. Trust memory for auto-approving previously approved tools
 * 3. Debugging and performance analysis
 */
export class ToolExecutionLogger {
  /**
   * Log the start of a tool execution.
   * Returns the generated log ID for later updates.
   */
  async logExecution(
    context: ToolExecutionContext,
    toolName: string,
    args: Record<string, unknown>,
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide' // PERSIST-S002: Workspace isolation
  ): Promise<string> {
    const logId = crypto.randomUUID();

    const logEntry: ToolExecutionLogRecord = {
      id: logId,
      conversationId: (context as any).conversationId || 'unknown',
      messageId: (context as any).messageId || 'unknown',
      workspaceId, // PERSIST-S002: Workspace isolation
      toolName,
      args,
      status: 'pending',
      timestamp: Date.now(),
      createdAt: Date.now(),
      approved: (context as any).wasApproved || false
    };

    await addToolExecutionLog(logEntry);

    return logId;
  }

  /**
   * Update a log entry with execution results.
   */
  async updateExecution(
    logId: string,
    updates: {
      status: 'executed' | 'error' | 'denied';
      result?: { success: boolean; output?: string; error?: string; duration?: number };
      approved?: boolean;
    }
  ): Promise<void> {
    await updateToolExecutionLog(logId, updates);
  }

  /**
   * Complete a tool execution with success result.
   */
  async logSuccess(
    logId: string,
    context: ToolExecutionContext,
    result: unknown,
    duration: number
  ): Promise<void> {
    await this.updateExecution(logId, {
      status: 'executed',
      result: {
        success: true,
        output: typeof result === 'string' ? result : JSON.stringify(result),
        duration
      },
      approved: (context as any).wasApproved || false
    });
  }

  /**
   * Complete a tool execution with error result.
   */
  async logError(
    logId: string,
    context: ToolExecutionContext,
    error: string,
    duration: number
  ): Promise<void> {
    await this.updateExecution(logId, {
      status: 'error',
      result: {
        success: false,
        error,
        duration
      },
      approved: (context as any).wasApproved || false
    });
  }

  /**
   * Get all execution logs for a conversation.
   */
  async getLogsForConversation(conversationId: string): Promise<ToolExecutionLogRecord[]> {
    return getToolExecutionLogs(conversationId);
  }

  /**
   * Get recent logs across all conversations (for debugging).
   */
  async getRecentLogs(limit: number = 100): Promise<ToolExecutionLogRecord[]> {
    const allLogs = await db.toolExecutionLogs
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();

    return allLogs;
  }

  /**
   * Clear logs for a specific conversation or all logs.
   */
  async clearConversationLogs(conversationId?: string): Promise<void> {
    await clearToolExecutionLogs(conversationId);
  }

  /**
   * Check if a tool is trusted for a conversation.
   * A tool is trusted if it was previously executed successfully and approved.
   */
  async isTrustedTool(conversationId: string, toolName: string): Promise<boolean> {
    const logs = await this.getLogsForConversation(conversationId);

    // Look for at least one successful, approved execution of this tool
    const trustedLogs = logs.filter(
      log =>
        log.toolName === toolName &&
        log.approved === true &&
        log.status === 'executed'
    );

    return trustedLogs.length > 0;
  }

  /**
   * Get list of trusted tool names for a conversation.
   */
  async getTrustedTools(conversationId: string): Promise<string[]> {
    const logs = await this.getLogsForConversation(conversationId);

    // Find unique tool names that were successfully approved
    const trustedTools = new Set<string>();

    for (const log of logs) {
      if (log.approved === true && log.status === 'executed') {
        trustedTools.add(log.toolName);
      }
    }

    return Array.from(trustedTools);
  }

  /**
   * Get audit trail summary for a conversation.
   */
  async getAuditSummary(conversationId: string): Promise<{
    totalExecutions: number;
    approvedCount: number;
    deniedCount: number;
    errorCount: number;
    averageDuration: number;
    toolsUsed: string[];
  }> {
    const logs = await this.getLogsForConversation(conversationId);

    const approvedLogs = logs.filter(log => log.approved === true);
    const deniedLogs = logs.filter(log => log.approved === false);
    const errorLogs = logs.filter(log => log.status === 'error');

    const durations = logs
      .filter(log => log.result?.duration !== undefined)
      .map(log => log.result!.duration!);

    const averageDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    const toolsUsed = [...new Set(logs.map(log => log.toolName))];

    return {
      totalExecutions: logs.length,
      approvedCount: approvedLogs.length,
      deniedCount: deniedLogs.length,
      errorCount: errorLogs.length,
      averageDuration,
      toolsUsed
    };
  }

  /**
   * Export audit trail as JSON.
   */
  async exportAuditTrail(conversationId: string): Promise<string> {
    const logs = await this.getLogsForConversation(conversationId);
    const summary = await this.getAuditSummary(conversationId);

    return JSON.stringify({
      conversationId,
      exportedAt: new Date().toISOString(),
      summary,
      logs
    }, null, 2);
  }
}

// Export singleton instance
export const toolExecutionLogger = new ToolExecutionLogger();
