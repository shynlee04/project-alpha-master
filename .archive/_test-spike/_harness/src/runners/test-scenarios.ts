/**
 * @fileoverview Test Scenario Definitions
 * @module harness/runners/test-scenarios
 *
 * Core types and interfaces for test scenarios.
 *
 * ANNOTATION: 2026-01-11 - Implementation for test spike harness - Task requirements
 */

import type { PermissionProfile } from '../../permission-profiles';
import type { ToolCallLog } from '../instrumentation/logger';

/**
 * Test scenario status
 */
export type ScenarioStatus = 
  | 'pending'
  | 'ready'
  | 'running'
  | 'done'
  | 'failed'
  | 'cancelled';

/**
 * Scenario execution context
 */
export interface ScenarioContext {
  onStdout?: (line: string) => void;
  onStderr?: (line: string) => void;
  onToolCall?: (log: ToolCallLog) => void;
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Scenario result
 */
export interface ScenarioResult {
  scenarioId: string;
  status: ScenarioStatus;
  duration: number;
  toolCalls: ToolCallLog[];
  errors: string[];
  assertions: AssertionResult[];
  logs: string[];
  profile?: PermissionProfile;
}

/**
 * Assertion result
 */
export interface AssertionResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  message?: string;
}

/**
 * Test scenario interface
 */
export interface TestScenario {
  id: string;
  name: string;
  description: string;
  estimatedDuration: string;
  status: ScenarioStatus;
  category: string;
  tags: string[];
  
  execute(
    profile?: PermissionProfile,
    context?: ScenarioContext
  ): Promise<ScenarioResult>;
  
  validate(): Promise<AssertionResult[]>;
  
  getMetadata(): ScenarioMetadata;
}

/**
 * Scenario metadata
 */
export interface ScenarioMetadata {
  author: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  dependencies: string[];
  environmentVariables: Record<string, string>;
}
