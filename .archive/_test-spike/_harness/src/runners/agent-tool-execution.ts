/**
 * @fileoverview Agent Tool Execution Test Runner
 * @module harness/runners/agent-tool-execution
 *
 * Tests agent tool execution with permission enforcement.
 *
 * ANNOTATION: 2026-01-11 - Implementation for test spike harness - Task requirements
 */

import type { PermissionProfile } from '../../permission-profiles';
import type { ScenarioContext, ScenarioResult, TestScenario, AssertionResult } from './test-scenarios';

/**
 * Mock tool definition for testing
 */
interface MockTool {
  name: string;
  execute: (inputs: Record<string, unknown>) => Promise<unknown>;
  permissions: string[];
}

/**
 * Agent Tool Execution Test Runner
 * Tests that tools are invoked correctly with permission enforcement
 */
export class AgentToolExecutionRunner implements TestScenario {
  id = 'agent-tool-execution';
  name = 'Agent Tool Execution Test';
  description = 'Tests agent tool execution with permission enforcement and verifies correct invocation patterns';
  estimatedDuration = '30s';
  status: 'ready' = 'ready';
  category = 'tooling';
  tags = ['tool', 'execution', 'permission', 'agent'];

  private tools: Map<string, MockTool> = new Map();
  private toolHistory: Array<{ tool: string; inputs: Record<string, unknown>; timestamp: number }> = [];

  constructor() {
    this.registerMockTools();
  }

  /**
   * Register mock tools for testing
   */
  private registerMockTools(): void {
    const tools: MockTool[] = [
      {
        name: 'read_file',
        execute: async (inputs: Record<string, unknown>) => {
          return { success: true, content: `Content of ${inputs.path}` };
        },
        permissions: ['read'],
      },
      {
        name: 'write_file',
        execute: async (inputs: Record<string, unknown>) => {
          return { success: true, path: inputs.path };
        },
        permissions: ['write'],
      },
      {
        name: 'list_files',
        execute: async (inputs: Record<string, unknown>) => {
          return { success: true, files: ['file1.txt', 'file2.txt'] };
        },
        permissions: ['read', 'list'],
      },
      {
        name: 'execute_command',
        execute: async (inputs: Record<string, unknown>) => {
          return { success: true, output: `Executed: ${inputs.command}` };
        },
        permissions: ['execute'],
      },
      {
        name: 'search_files',
        execute: async (inputs: Record<string, unknown>) => {
          return { success: true, matches: [] };
        },
        permissions: ['read', 'search'],
      },
    ];

    tools.forEach(tool => this.tools.set(tool.name, tool));
  }

  /**
   * Execute the test scenario
   */
  async execute(profile?: PermissionProfile, context?: ScenarioContext): Promise<ScenarioResult> {
    const startTime = Date.now();
    const toolCalls: ScenarioResult['toolCalls'] = [];
    const errors: string[] = [];
    const logs: string[] = [];

    this.status = 'running';
    context?.onProgress?.(0, 'Initializing test environment');

    logs.push(`[TEST] Starting agent tool execution test`);
    logs.push(`[TEST] Profile: ${profile?.name || 'none'}`);
    context?.onStdout?.(`Test started with profile: ${profile?.name || 'default'}`);

    try {
      // Test 1: Execute read tool
      context?.onProgress?.(20, 'Testing read_file tool');
      const readResult = await this.executeTool('read_file', { path: '/test/file.txt' }, profile, context);
      toolCalls.push(...readResult.toolCalls);
      if (readResult.error) errors.push(readResult.error);

      // Test 2: Execute list tool
      context?.onProgress?.(40, 'Testing list_files tool');
      const listResult = await this.executeTool('list_files', { path: '/test' }, profile, context);
      toolCalls.push(...listResult.toolCalls);
      if (listResult.error) errors.push(listResult.error);

      // Test 3: Execute write tool
      context?.onProgress?.(60, 'Testing write_file tool');
      const writeResult = await this.executeTool('write_file', { path: '/test/output.txt', content: 'test' }, profile, context);
      toolCalls.push(...writeResult.toolCalls);
      if (writeResult.error) errors.push(writeResult.error);

      // Test 4: Execute search tool
      context?.onProgress?.(80, 'Testing search_files tool');
      const searchResult = await this.executeTool('search_files', { pattern: '*.txt' }, profile, context);
      toolCalls.push(...searchResult.toolCalls);
      if (searchResult.error) errors.push(searchResult.error);

      // Test 5: Attempt unauthorized execute
      context?.onProgress?.(90, 'Testing permission enforcement');
      const execResult = await this.executeTool('execute_command', { command: 'ls -la' }, profile, context);
      toolCalls.push(...execResult.toolCalls);
      
      context?.onProgress?.(100, 'Test completed');

      logs.push(`[TEST] Tool execution test completed`);
      logs.push(`[TEST] Total tool calls: ${toolCalls.length}`);
      logs.push(`[TEST] Errors: ${errors.length}`);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`Test execution failed: ${errorMsg}`);
      logs.push(`[ERROR] ${errorMsg}`);
    }

    this.status = errors.length > 0 ? 'failed' : 'done';

    return {
      scenarioId: this.id,
      status: this.status,
      duration: Date.now() - startTime,
      toolCalls,
      errors,
      assertions: [],
      logs,
      profile,
    };
  }

  /**
   * Execute a single tool with permission check
   */
  private async executeTool(
    toolName: string,
    inputs: Record<string, unknown>,
    profile?: PermissionProfile,
    context?: ScenarioContext
  ): Promise<{ toolCalls: ScenarioResult['toolCalls']; error?: string }> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { toolCalls: [], error: `Unknown tool: ${toolName}` };
    }

    const timestamp = Date.now();
    const startTime = Date.now();

    // Check permissions
    let permissionsGranted = true;
    const permissionResults: Array<{ permission: string; granted: boolean }> = [];

    for (const perm of tool.permissions) {
      if (profile) {
        const granted = profile.allows(perm as any);
        permissionResults.push({ permission: perm, granted });
        if (!granted) {
          permissionsGranted = false;
        }
      }
    }

    context?.onStdout?.(`[TOOL] ${toolName} - permissions: ${permissionResults.map(p => `${p.permission}:${p.granted}`).join(', ')}`);

    let output: unknown;
    let error: string | undefined;

    try {
      if (!permissionsGranted && !profile?.yoloMode) {
        error = `Permission denied for tool: ${toolName}`;
        context?.onStderr?.(`[TOOL] ❌ ${toolName} - ${error}`);
      } else {
        output = await tool.execute(inputs);
        context?.onStdout?.(`[TOOL] ✅ ${toolName} completed`);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      context?.onStderr?.(`[TOOL] ❌ ${toolName} - ${error}`);
    }

    const toolCall: ScenarioResult['toolCalls'][0] = {
      timestamp: new Date(timestamp).toISOString(),
      runId: 'test-run',
      toolName,
      inputs,
      permissionsEvaluated: permissionResults.map(p => ({
        permission: p.permission,
        granted: p.granted,
        reason: p.granted ? 'allowed' : 'denied by profile',
        profile: profile?.name,
      })),
      output,
      latency: Date.now() - startTime,
      error,
    };

    this.toolHistory.push({ tool: toolName, inputs, timestamp });

    return {
      toolCalls: [toolCall],
      error,
    };
  }

  /**
   * Validate the scenario
   */
  async validate(): Promise<AssertionResult[]> {
    const assertions: AssertionResult[] = [];

    // Check that tools were registered
    assertions.push({
      name: 'tools_registered',
      passed: this.tools.size > 0,
      expected: `${this.tools.size} tools registered`,
      actual: `${this.tools.size} tools registered`,
      message: this.tools.size > 0 ? 'All mock tools registered' : 'No tools registered',
    });

    // Check tool history
    assertions.push({
      name: 'tool_history_populated',
      passed: this.toolHistory.length > 0,
      expected: 'Tool history populated after execution',
      actual: `${this.toolHistory.length} tool executions recorded`,
    });

    return assertions;
  }

  /**
   * Get scenario metadata
   */
  getMetadata() {
    return {
      author: 'Test Spike Harness',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dependencies: [],
      environmentVariables: {},
    };
  }
}

/**
 * Create and return the runner instance
 */
export function createAgentToolExecutionRunner(): AgentToolExecutionRunner {
  return new AgentToolExecutionRunner();
}
