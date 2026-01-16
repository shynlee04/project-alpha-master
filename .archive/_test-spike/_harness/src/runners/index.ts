/**
 * @fileoverview Test Runners Index
 * @module harness/runners
 *
 * Exports all test scenario runners for the test spike harness.
 *
 * ANNOTATION: 2026-01-11 - Implementation for test spike harness - Task requirements
 */

// Test scenario types and interfaces
export type {
  ScenarioContext,
  ScenarioResult,
  TestScenario,
  AssertionResult,
  ToolCallLog,
  PermissionResult,
} from './test-scenarios';

// Agent tool execution runner
export {
  AgentToolExecutionRunner,
  createAgentToolExecutionRunner,
} from './agent-tool-execution';

// Filesystem CRUD runner
export {
  FilesystemCRUDRunner,
  createFilesystemCRUDRunner,
} from './filesystem-crud';

// State management runner
export {
  StateManagementRunner,
  createStateManagementRunner,
} from './state-management';

// Prompt and mode testing runner
export {
  PromptModeTestingRunner,
  createPromptModeTestingRunner,
} from './prompt-mode-testing';

/**
 * Load all available test scenarios
 */
export function loadScenarios(): TestScenario[] {
  return [
    new AgentToolExecutionRunner(),
    new FilesystemCRUDRunner(),
    new StateManagementRunner(),
    new PromptModeTestingRunner(),
  ];
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): TestScenario | undefined {
  const scenarios = loadScenarios();
  return scenarios.find(s => s.id === id);
}

/**
 * Get scenarios by category
 */
export function getScenariosByCategory(category: string): TestScenario[] {
  const scenarios = loadScenarios();
  return scenarios.filter(s => s.category === category);
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  const scenarios = loadScenarios();
  const categories = new Set(scenarios.map(s => s.category));
  return Array.from(categories);
}
