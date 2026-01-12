/**
 * @fileoverview State Management Test Runner
 * @module harness/runners/state-management
 *
 * Tests agent state management, snapshots, and restore functionality.
 *
 * ANNOTATION: 2026-01-11 - Implementation for test spike harness - Task requirements
 */

import type { ScenarioContext, ScenarioResult, TestScenario, AssertionResult } from './test-scenarios';

/**
 * State snapshot interface
 */
interface StateSnapshot {
  id: string;
  timestamp: number;
  messages: Array<{ role: string; content: string }>;
  context: Record<string, unknown>;
  mode: string;
  stepHistory: Array<{ step: number; action: string; result: string }>;
}

/**
 * Agent state for testing
 */
interface TestAgentState {
  messages: Array<{ role: string; content: string }>;
  context: Record<string, unknown>;
  mode: string;
  currentStep: number;
  restorePoints: Map<string, StateSnapshot>;
}

/**
 * State Management Test Runner
 * Tests state snapshot, restore, and deterministic behavior
 */
export class StateManagementRunner implements TestScenario {
  id = 'state-management';
  name = 'State Management Test';
  description = 'Tests agent state management, snapshots, restore functionality, and state transitions';
  estimatedDuration = '45s';
  status: 'ready' = 'ready';
  category = 'state';
  tags = ['state', 'snapshot', 'restore', 'determinism'];

  private agentState: TestAgentState;

  constructor() {
    this.agentState = {
      messages: [],
      context: {},
      mode: 'default',
      currentStep: 0,
      restorePoints: new Map(),
    };
  }

  /**
   * Execute the test scenario
   */
  async execute(_profile?: unknown, context?: ScenarioContext): Promise<ScenarioResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const logs: string[] = [];

    this.status = 'running';
    context?.onProgress?.(0, 'Initializing state management test');

    logs.push('[TEST] Starting state management test');
    context?.onStdout?.('State management test started');

    try {
      // Phase 1: Create initial state
      context?.onProgress?.(10, 'Creating initial state');
      await this.simulateAgentOperation('initialize', context);
      logs.push('[TEST] Initial state created');
      
      // Phase 2: Create first restore point
      context?.onProgress?.(30, 'Creating first restore point');
      const snapshot1 = this.createSnapshot('snapshot-1');
      logs.push(`[TEST] Restore point 1 created: ${snapshot1.id}`);

      // Phase 3: Execute more operations
      context?.onProgress?.(50, 'Executing additional operations');
      await this.simulateAgentOperation('process_input', context, { input: 'user message 1' });
      await this.simulateAgentOperation('generate_response', context);
      logs.push('[TEST] Additional operations executed');

      // Phase 4: Create second restore point
      context?.onProgress?.(60, 'Creating second restore point');
      const snapshot2 = this.createSnapshot('snapshot-2');
      logs.push(`[TEST] Restore point 2 created: ${snapshot2.id}`);

      // Phase 5: Execute more operations
      context?.onProgress?.(70, 'Executing more operations');
      await this.simulateAgentOperation('process_input', context, { input: 'user message 2' });
      await this.simulateAgentOperation('generate_response', context);
      logs.push('[TEST] More operations executed');

      // Phase 6: Restore to first snapshot
      context?.onProgress?.(80, 'Restoring to first snapshot');
      const restoreResult = this.restoreSnapshot('snapshot-1');
      if (!restoreResult) {
        errors.push('Failed to restore to snapshot-1');
      } else {
        logs.push('[TEST] Restored to snapshot-1 successfully');
        context?.onStdout?.('✅ Restored to snapshot-1');
      }

      // Phase 7: Verify deterministic restore
      context?.onProgress?.(90, 'Verifying deterministic restore');
      const currentState = this.captureState();
      const restoredCorrectly = (
        restoredCorrectly &&
        currentState.messages.length === snapshot1.messages.length &&
        currentState.mode === snapshot1.mode
      );
      
      logs.push(`[TEST] State after restore:`);
      logs.push(`  - Messages: ${currentState.messages.length}`);
      logs.push(`  - Mode: ${currentState.mode}`);
      logs.push(`  - Current step: ${currentState.currentStep}`);

      // Phase 8: Test state transitions
      context?.onProgress?.(95, 'Testing state transitions');
      const transitions = this.getStateTransitions();
      logs.push(`[TEST] State transitions recorded: ${transitions.length}`);

      context?.onProgress?.(100, 'Test completed');

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
      toolCalls: [],
      errors,
      assertions: [],
      logs,
    };
  }

  /**
   * Simulate an agent operation
   */
  private async simulateAgentOperation(
    action: string,
    context?: ScenarioContext,
    params?: Record<string, unknown>
  ): Promise<void> {
    this.agentState.currentStep++;
    const step = this.agentState.currentStep;

    // Update messages if processing input
    if (action === 'process_input' && params?.input) {
      this.agentState.messages.push({
        role: 'user',
        content: params.input as string,
      });
    }

    // Add assistant response
    if (action === 'generate_response') {
      this.agentState.messages.push({
        role: 'assistant',
        content: `Response to step ${step}`,
      });
    }

    // Update context
    this.agentState.context = {
      ...this.agentState.context,
      lastAction: action,
      lastStep: step,
      updatedAt: Date.now(),
    };

    context?.onStdout?.(`[STATE] Step ${step}: ${action}`);
  }

  /**
   * Create a state snapshot
   */
  private createSnapshot(id: string): StateSnapshot {
    const snapshot: StateSnapshot = {
      id,
      timestamp: Date.now(),
      messages: [...this.agentState.messages],
      context: { ...this.agentState.context },
      mode: this.agentState.mode,
      stepHistory: [],
    };

    // Record step history
    for (let i = 1; i <= this.agentState.currentStep; i++) {
      snapshot.stepHistory.push({
        step: i,
        action: `step_${i}`,
        result: 'completed',
      });
    }

    this.agentState.restorePoints.set(id, snapshot);
    return snapshot;
  }

  /**
   * Restore to a previous snapshot
   */
  private restoreSnapshot(id: string): boolean {
    const snapshot = this.agentState.restorePoints.get(id);
    if (!snapshot) {
      return false;
    }

    this.agentState.messages = [...snapshot.messages];
    this.agentState.context = { ...snapshot.context };
    this.agentState.mode = snapshot.mode;
    this.agentState.currentStep = snapshot.stepHistory.length;

    return true;
  }

  /**
   * Capture current state
   */
  private captureState(): TestAgentState {
    return {
      messages: [...this.agentState.messages],
      context: { ...this.agentState.context },
      mode: this.agentState.mode,
      currentStep: this.agentState.currentStep,
      restorePoints: new Map(this.agentState.restorePoints),
    };
  }

  /**
   * Get state transitions
   */
  private getStateTransitions(): Array<{ from: string; to: string; step: number }> {
    const transitions: Array<{ from: string; to: string; step: number }> = [];
    
    // Simulate state transitions
    transitions.push({ from: 'IDLE', to: 'INITIALIZING', step: 1 });
    transitions.push({ from: 'INITIALIZING', to: 'EXECUTING', step: 2 });
    transitions.push({ from: 'EXECUTING', to: 'WAITING_FOR_INPUT', step: 3 });
    transitions.push({ from: 'WAITING_FOR_INPUT', to: 'EXECUTING', step: 4 });

    return transitions;
  }

  /**
   * Validate the scenario
   */
  async validate(): Promise<AssertionResult[]> {
    const assertions: AssertionResult[] = [];

    // Check restore points were created
    assertions.push({
      name: 'restore_points_created',
      passed: this.agentState.restorePoints.size >= 2,
      expected: 'At least 2 restore points',
      actual: `${this.agentState.restorePoints.size} restore points`,
    });

    // Check state was modified
    assertions.push({
      name: 'state_modified',
      passed: this.agentState.currentStep > 0,
      expected: 'State modified during test',
      actual: `${this.agentState.currentStep} operations executed`,
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
export function createStateManagementRunner(): StateManagementRunner {
  return new StateManagementRunner();
}
