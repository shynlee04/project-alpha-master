/**
 * @fileoverview Prompt and Mode Testing Runner
 * @module harness/runners/prompt-mode-testing
 *
 * Tests prompt versions and mode switching functionality.
 *
 * ANNOTATION: 2026-01-11 - Implementation for test spike harness - Task requirements
 */

import type { ScenarioContext, ScenarioResult, TestScenario, AssertionResult } from './test-scenarios';

/**
 * Prompt version definition
 */
interface PromptVersion {
  id: string;
  version: number;
  content: string;
  mode: string;
  createdAt: number;
}

/**
 * Mode configuration
 */
interface ModeConfig {
  name: string;
  description: string;
  capabilities: string[];
  restrictions: string[];
}

/**
 * Agent mode state
 */
interface AgentModeState {
  currentMode: string;
  promptHistory: PromptVersion[];
  modeChanges: Array<{ from: string; to: string; reason: string; timestamp: number }>;
  modeStack: string[];
}

/**
 * Prompt Mode Testing Runner
 * Tests prompt versions, mode switching, and mode persistence
 */
export class PromptModeTestingRunner implements TestScenario {
  id = 'prompt-mode-testing';
  name = 'Prompt and Mode Testing';
  description = 'Tests prompt versions, mode switching, and mode persistence across runs';
  estimatedDuration = '35s';
  status: 'ready' = 'ready';
  category = 'mode';
  tags = ['prompt', 'mode', 'switching', 'persistence'];

  private agentModeState: AgentModeState;
  private promptVersions: PromptVersion[] = [];
  private modeConfigs: Map<string, ModeConfig> = new Map();

  constructor() {
    this.agentModeState = {
      currentMode: 'default',
      promptHistory: [],
      modeChanges: [],
      modeStack: ['default'],
    };
    this.initializeModes();
    this.initializePromptVersions();
  }

  /**
   * Initialize mode configurations
   */
  private initializeModes(): void {
    const modes: ModeConfig[] = [
      {
        name: 'default',
        description: 'Standard mode for general tasks',
        capabilities: ['read', 'write', 'execute'],
        restrictions: [],
      },
      {
        name: 'code',
        description: 'Code-focused mode for programming tasks',
        capabilities: ['read', 'write', 'execute', 'code-analysis'],
        restrictions: [],
      },
      {
        name: 'analysis',
        description: 'Analysis mode for deep research tasks',
        capabilities: ['read', 'search', 'analysis'],
        restrictions: ['write'],
      },
      {
        name: 'creative',
        description: 'Creative mode for brainstorming and content creation',
        capabilities: ['read', 'write', 'creative'],
        restrictions: ['execute'],
      },
      {
        name: 'debug',
        description: 'Debug mode for troubleshooting',
        capabilities: ['read', 'write', 'execute', 'debug'],
        restrictions: [],
      },
    ];

    modes.forEach(mode => this.modeConfigs.set(mode.name, mode));
  }

  /**
   * Initialize prompt versions
   */
  private initializePromptVersions(): void {
    const prompts: PromptVersion[] = [
      {
        id: 'prompt-v1',
        version: 1,
        content: 'You are a helpful AI assistant.',
        mode: 'default',
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'prompt-v2',
        version: 2,
        content: 'You are a helpful AI assistant with enhanced coding capabilities.',
        mode: 'code',
        createdAt: Date.now() - 43200000,
      },
      {
        id: 'prompt-v3',
        version: 3,
        content: 'You are an expert AI assistant specialized in deep analysis.',
        mode: 'analysis',
        createdAt: Date.now() - 21600000,
      },
    ];

    this.promptVersions = prompts;
    prompts.forEach(p => this.agentModeState.promptHistory.push(p));
  }

  /**
   * Execute the test scenario
   */
  async execute(_profile?: unknown, context?: ScenarioContext): Promise<ScenarioResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const logs: string[] = [];

    this.status = 'running';
    context?.onProgress?.(0, 'Initializing prompt/mode test');
    context?.onStdout?.('Prompt and mode testing started');
    context?.onStdout?.(`Initial mode: ${this.agentModeState.currentMode}`);

    logs.push('[TEST] Starting prompt and mode testing');
    logs.push(`[TEST] Initial mode: ${this.agentModeState.currentMode}`);

    try {
      // Test 1: Test different prompt versions
      context?.onProgress?.(20, 'Testing prompt versions');
      for (const prompt of this.promptVersions) {
        logs.push(`[TEST] Prompt v${prompt.version}: ${prompt.mode} mode`);
        context?.onStdout?.(`[PROMPT] v${prompt.version} → ${prompt.mode}`);
      }

      // Test 2: Mode switching
      context?.onProgress?.(40, 'Testing mode switching');
      const modeSwitchTests = [
        { from: 'default', to: 'code', reason: 'User requested coding help' },
        { from: 'code', to: 'analysis', reason: 'Analysis task started' },
        { from: 'analysis', to: 'creative', reason: 'Creative brainstorming' },
        { from: 'creative', to: 'debug', reason: 'Debugging session' },
        { from: 'debug', to: 'default', reason: 'Task completed' },
      ];

      for (const switchTest of modeSwitchTests) {
        const switchResult = this.switchMode(switchTest.to, switchTest.reason);
        logs.push(`[TEST] Mode switch: ${switchTest.from} → ${switchTest.to} (${switchTest.reason})`);
        context?.onStdout?.(`[MODE] ${switchTest.from} → ${switchTest.to}`);
        
        if (!switchResult) {
          errors.push(`Failed to switch mode to ${switchTest.to}`);
        }
      }

      // Test 3: Mode persistence
      context?.onProgress?.(60, 'Testing mode persistence');
      const persistedMode = this.getCurrentMode();
      logs.push(`[TEST] Persisted mode: ${persistedMode}`);
      context?.onStdout?.(`[MODE] Current mode: ${persistedMode}`);

      // Test 4: Mode capabilities validation
      context?.onProgress?.(75, 'Validating mode capabilities');
      const modeCapabilityTests = [
        { mode: 'code', capability: 'code-analysis', expected: true },
        { mode: 'analysis', capability: 'write', expected: false },
        { mode: 'creative', capability: 'execute', expected: false },
        { mode: 'default', capability: 'read', expected: true },
      ];

      for (const test of modeCapabilityTests) {
        const hasCapability = this.checkModeCapability(test.mode, test.capability);
        logs.push(`[TEST] ${test.mode}.${test.capability} = ${hasCapability} (expected: ${test.expected})`);
        
        if (hasCapability !== test.expected) {
          errors.push(`Capability mismatch: ${test.mode}.${test.capability}`);
        }
      }

      // Test 5: Prompt-mode matrix validation
      context?.onProgress?.(90, 'Validating prompt-modes matrix');
      const matrixValid = this.validatePromptModeMatrix();
      logs.push(`[TEST] Prompt-mode matrix valid: ${matrixValid}`);

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
   * Switch agent mode
   */
  private switchMode(newMode: string, reason: string): boolean {
    const oldMode = this.agentModeState.currentMode;
    const modeConfig = this.modeConfigs.get(newMode);

    if (!modeConfig) {
      return false;
    }

    this.agentModeState.currentMode = newMode;
    this.agentModeState.modeStack.push(newMode);
    this.agentModeState.modeChanges.push({
      from: oldMode,
      to: newMode,
      reason,
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Get current mode
   */
  private getCurrentMode(): string {
    return this.agentModeState.currentMode;
  }

  /**
   * Check if mode has a capability
   */
  private checkModeCapability(mode: string, capability: string): boolean {
    const modeConfig = this.modeConfigs.get(mode);
    if (!modeConfig) {
      return false;
    }
    return modeConfig.capabilities.includes(capability);
  }

  /**
   * Validate prompt-mode matrix consistency
   */
  private validatePromptModeMatrix(): boolean {
    let allValid = true;

    for (const prompt of this.promptVersions) {
      const modeConfig = this.modeConfigs.get(prompt.mode);
      if (!modeConfig) {
        logs.push(`[ERROR] Prompt v${prompt.version} references unknown mode: ${prompt.mode}`);
        allValid = false;
      }
    }

    // Check mode change history
    for (const change of this.agentModeState.modeChanges) {
      const toValid = this.modeConfigs.has(change.to);
      const fromValid = this.modeConfigs.has(change.from);
      
      if (!toValid || !fromValid) {
        logs.push(`[ERROR] Invalid mode transition: ${change.from} → ${change.to}`);
        allValid = false;
      }
    }

    return allValid;
  }

  /**
   * Validate the scenario
   */
  async validate(): Promise<AssertionResult[]> {
    const assertions: AssertionResult[] = [];

    // Check prompt versions exist
    assertions.push({
      name: 'prompt_versions_created',
      passed: this.promptVersions.length > 0,
      expected: `${this.promptVersions.length} prompt versions`,
      actual: `${this.promptVersions.length} versions created`,
    });

    // Check mode configs exist
    assertions.push({
      name: 'mode_configs_created',
      passed: this.modeConfigs.size > 0,
      expected: `${this.modeConfigs.size} mode configurations`,
      actual: `${this.modeConfigs.size} modes configured`,
    });

    // Check mode changes recorded
    assertions.push({
      name: 'mode_changes_recorded',
      passed: this.agentModeState.modeChanges.length > 0,
      expected: 'Mode changes recorded',
      actual: `${this.agentModeState.modeChanges.length} mode changes`,
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
export function createPromptModeTestingRunner(): PromptModeTestingRunner {
  return new PromptModeTestingRunner();
}
