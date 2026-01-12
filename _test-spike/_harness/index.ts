/**
 * @fileoverview Test Spike TUI Harness
 * @module test-spike/harness
 *
 * Main entry point for the test spike TUI harness.
 *
 * ANNOTATION: 2026-01-11 - Implementation for test spike harness - Task requirements
 */

import * as readline from 'node:readline';
import { createWriteStream } from 'node:fs';

// TUI Components
export { TerminalUI } from './src/tui';
export type { Screen } from './src/tui/screens';

// Logging Infrastructure
export { SpikeLogger } from './src/instrumentation/logger';
export { MetricsCollector } from './src/instrumentation/metrics';
export type { ToolCallLog, PermissionResult, RunMetrics } from './src/instrumentation/logger';

// Permission Profiles
export {
  PermissionEnforcer,
  type PermissionProfile,
  type PermissionProfileConfig,
  type PathRestriction,
  createPermissionProfile,
  loadPermissionProfiles,
  getAvailableProfiles,
} from './permission-profiles';

// Test Scenarios and Runners
export {
  loadScenarios,
  getScenarioById,
  getScenariosByCategory,
  getCategories,
} from './src/runners';

export {
  AgentToolExecutionRunner,
  createAgentToolExecutionRunner,
} from './src/runners/agent-tool-execution';

export {
  FilesystemCRUDRunner,
  createFilesystemCRUDRunner,
} from './src/runners/filesystem-crud';

export {
  StateManagementRunner,
  createStateManagementRunner,
} from './src/runners/state-management';

export {
  PromptModeTestingRunner,
  createPromptModeTestingRunner,
} from './src/runners/prompt-mode-testing';

export type {
  ScenarioContext,
  ScenarioResult,
  TestScenario,
  AssertionResult,
} from './src/runners/test-scenarios';

/**
 * Main entry point for the test spike harness
 */
async function main(): Promise<void> {
  console.log('Test Spike TUI Harness');
  console.log('========================');
  console.log('Initializing...');

  try {
    // Initialize logger
    const logger = new SpikeLogger({
      humanLogPath: '_test-spike/_notes/run-log.txt',
      jsonLogPath: '_test-spike/_notes/run-log.json',
    });

    logger.log('info', 'Test spike harness started');

    // Load permission profiles
    const profiles = loadPermissionProfiles();
    console.log(`Loaded ${profiles.size} permission profiles`);

    // Load test scenarios
    const scenarios = loadScenarios();
    console.log(`Loaded ${scenarios.length} test scenarios`);

    // Display available scenarios
    console.log('\nAvailable scenarios:');
    scenarios.forEach((scenario, index) => {
      console.log(`  ${index + 1}. ${scenario.id} - ${scenario.name}`);
      console.log(`     ${scenario.description}`);
      console.log(`     Category: ${scenario.category} | Tags: ${scenario.tags.join(', ')}`);
    });

    // Display available profiles
    console.log('\nAvailable permission profiles:');
    profiles.forEach((profile, name) => {
      console.log(`  - ${name}: ${profile.description}`);
    });

    console.log('\nHarness initialized successfully!');
    console.log('Run "npx tsx _test-spike/_harness/index.ts" to start the TUI.');

  } catch (error) {
    console.error('Failed to initialize harness:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };
