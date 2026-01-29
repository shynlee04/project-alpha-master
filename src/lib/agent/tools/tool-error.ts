/**
 * PHASE 2 STUB: Tool Error
 * Original code archived to: _phase2-archive/lib/agent/tools/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

export class ToolError extends Error {
  public readonly toolName: string;
  public readonly code: string;
  public readonly errorCode: string; // Alias for code

  constructor(toolName: string, message: string, code: string = 'TOOL_ERROR') {
    super(message);
    this.name = 'ToolError';
    this.toolName = toolName;
    this.code = code;
    this.errorCode = code;
  }
}

export function isToolError(error: unknown): error is ToolError {
  return error instanceof ToolError;
}
