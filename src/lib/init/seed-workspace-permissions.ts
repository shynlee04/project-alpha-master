/**
 * @fileoverview Workspace Permission Validation Seed Script
 * @module lib/init/seed-workspace-permissions
 *
 * Runtime validation script for workspace-aware permission system.
 * Tests real agent configurations with Gemini API key.
 *
 * **Instructions for DevTools Console:**
 *
 * ```javascript
 * import('/src/lib/init/seed-workspace-permissions.ts').then(module => {
 *   return module.validateWorkspacePermissions();
 * }).then(result => {
 *   console.log('✅ Workspace Permission Validation:', result);
 * }).catch(err => {
 *   console.error('❌ Validation failed:', err);
 * });
 * ```
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 * @constitution P0 - Security & Workspace Boundaries
 */

import { ToolPermissionManager } from '../agent/tool-permission-manager';
import { WorkspacePermissionManager } from '../agent/workspace-permission-manager';
import { credentialVault } from '../agent/providers/credential-vault';
import type { AgentData } from '@/infrastructure/persistence/stores/agents/types';

/**
 * Gemini API key provided by user
 */
const GEMINI_API_KEY = 'AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ';

/**
 * Test agent with comprehensive workspace configuration
 */
const TEST_AGENT: AgentData = {
  id: 'test_workspace_agent',
  name: 'Workspace Test Agent',
  description: 'Test agent for workspace permission validation',

  // Provider + Model
  providerId: 'google',
  model: 'gemini-2.5-flash',
  modelId: 'gemini-2.5-flash',

  // LLM Parameters
  systemPrompt: 'You are a test agent for workspace permission validation.',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,

  // Tools with different workspace permissions
  tools: [
    {
      toolId: 'read_file',
      toolName: 'Read File',
      isEnabled: true,
      workspacePermissions: {
        ide: true,
        knowledge: true,
        study: true,
        notes: true, // Available everywhere
      },
    },
    {
      toolId: 'write_file',
      toolName: 'Write File',
      isEnabled: true,
      workspacePermissions: {
        ide: true,
        knowledge: false,
        study: true,
        notes: true, // Disabled in knowledge
      },
    },
    {
      toolId: 'execute_command',
      toolName: 'Execute Command',
      isEnabled: true,
      workspacePermissions: {
        ide: true,
        knowledge: false,
        study: false,
        notes: false, // IDE only
      },
    },
    {
      toolId: 'synthesize',
      toolName: 'Synthesize Knowledge',
      isEnabled: true,
      workspacePermissions: {
        ide: false,
        knowledge: true,
        study: true,
        notes: true, // Knowledge workspaces only
      },
    },
  ],

  // Workspace bindings - available in all workspaces
  workspaceBindings: [
    {
      workspaceType: 'ide',
      isAvailable: true,
      uiVariant: 'full',
      isDefault: true,
    },
    {
      workspaceType: 'knowledge',
      isAvailable: true,
      uiVariant: 'compact',
      isDefault: false,
    },
    {
      workspaceType: 'study',
      isAvailable: true,
      uiVariant: 'compact',
      isDefault: false,
    },
    {
      workspaceType: 'notes',
      isAvailable: true,
      uiVariant: 'minimal',
      isDefault: false,
    },
  ],

  // Metadata
  status: 'online',
  tasksCompleted: 0,
  successRate: 0,
  tokensUsed: 0,
  lastActive: new Date().toISOString(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Validation result structure
 */
interface ValidationResult {
  success: boolean;
  timestamp: string;
  tests: {
    name: string;
    passed: boolean;
    details: string;
  }[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

/**
 * Run workspace permission validation tests
 */
export async function validateWorkspacePermissions(): Promise<ValidationResult> {
  console.log('🔧 [Workspace Permission Validation] Starting...');

  const results: ValidationResult = {
    success: false,
    timestamp: new Date().toISOString(),
    tests: [],
    summary: { total: 0, passed: 0, failed: 0 },
  };

  try {
    // Step 1: Initialize credential vault with Gemini API key
    console.log('1️⃣  Initializing credential vault...');
    await credentialVault.storeCredentials('google', GEMINI_API_KEY);
    console.log('✅ Gemini API key stored in credential vault');
    results.tests.push({
      name: 'Credential Vault Initialization',
      passed: true,
      details: 'Gemini API key stored successfully',
    });

    // Step 2: Initialize permission managers
    console.log('2️⃣  Initializing permission managers...');
    const basePermissionManager = ToolPermissionManager.getInstance();
    const workspacePermissionManager = new WorkspacePermissionManager(basePermissionManager);
    console.log('✅ Permission managers initialized');
    results.tests.push({
      name: 'Permission Manager Initialization',
      passed: true,
      details: 'Base and workspace permission managers created',
    });

    // Step 3: Validate agent configuration
    console.log('3️⃣  Validating agent configuration...');
    const validation = validateAgentConfig(TEST_AGENT);
    results.tests.push({
      name: 'Agent Configuration Validation',
      passed: validation.valid,
      details: validation.valid ? 'All workspace bindings complete' : validation.errors.join('; '),
    });

    if (!validation.valid) {
      console.warn('⚠️  Agent configuration issues:', validation.errors);
    }

    // Step 4: Test IDE workspace permissions
    console.log('4️⃣  Testing IDE workspace...');
    const ideTests = testWorkspace(workspacePermissionManager, TEST_AGENT, 'ide');
    results.tests.push(...ideTests);
    console.log(`✅ IDE workspace: ${ideTests.filter(t => t.passed).length}/${ideTests.length} tests passed`);

    // Step 5: Test Knowledge workspace permissions
    console.log('5️⃣  Testing Knowledge workspace...');
    const knowledgeTests = testWorkspace(workspacePermissionManager, TEST_AGENT, 'knowledge');
    results.tests.push(...knowledgeTests);
    console.log(`✅ Knowledge workspace: ${knowledgeTests.filter(t => t.passed).length}/${knowledgeTests.length} tests passed`);

    // Step 6: Test Study workspace permissions
    console.log('6️⃣  Testing Study workspace...');
    const studyTests = testWorkspace(workspacePermissionManager, TEST_AGENT, 'study');
    results.tests.push(...studyTests);
    console.log(`✅ Study workspace: ${studyTests.filter(t => t.passed).length}/${studyTests.length} tests passed`);

    // Step 7: Test Notes workspace permissions
    console.log('7️⃣  Testing Notes workspace...');
    const notesTests = testWorkspace(workspacePermissionManager, TEST_AGENT, 'notes');
    results.tests.push(...notesTests);
    console.log(`✅ Notes workspace: ${notesTests.filter(t => t.passed).length}/${notesTests.length} tests passed`);

    // Step 8: Test tool filtering per workspace
    console.log('8️⃣  Testing tool filtering...');
    const filterTests = testToolFiltering(workspacePermissionManager, TEST_AGENT);
    results.tests.push(...filterTests);
    console.log(`✅ Tool filtering: ${filterTests.filter(t => t.passed).length}/${filterTests.length} tests passed`);

    // Calculate summary
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.passed).length;
    results.summary.failed = results.tests.filter(t => !t.passed).length;
    results.success = results.summary.failed === 0;

    console.log('\n📊 [Validation Summary]');
    console.log(`   Total: ${results.summary.total}`);
    console.log(`   Passed: ${results.summary.passed}`);
    console.log(`   Failed: ${results.summary.failed}`);
    console.log(`   Status: ${results.success ? '✅ PASS' : '❌ FAIL'}`);

    if (results.success) {
      console.log('\n🎉 [Workspace Permission Validation] COMPLETE - All tests passed!');
    } else {
      console.warn('\n⚠️  [Workspace Permission Validation] COMPLETE - Some tests failed');
      console.warn('Failed tests:');
      results.tests.filter(t => !t.passed).forEach(t => {
        console.warn(`  - ${t.name}: ${t.details}`);
      });
    }

    return results;

  } catch (error) {
    console.error('❌ [Workspace Permission Validation] Failed:', error);
    results.tests.push({
      name: 'Validation Execution',
      passed: false,
      details: error instanceof Error ? error.message : String(error),
    });
    results.success = false;
    return results;
  }
}

/**
 * Validate agent has complete workspace configuration
 */
function validateAgentConfig(agent: AgentData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const requiredWorkspaces: Array<'ide' | 'knowledge' | 'study' | 'notes'> =
    ['ide', 'knowledge', 'study', 'notes'];

  // Check workspaceBindings
  const missingBindings = requiredWorkspaces.filter(ws =>
    !agent.workspaceBindings.some(b => b.workspaceType === ws)
  );

  if (missingBindings.length > 0) {
    errors.push(`Missing workspace bindings for: ${missingBindings.join(', ')}`);
  }

  // Check tool workspacePermissions
  for (const tool of agent.tools) {
    const missingPerms = requiredWorkspaces.filter(ws =>
      !(ws in tool.workspacePermissions)
    );

    if (missingPerms.length > 0) {
      errors.push(`Tool "${tool.toolName}" missing permissions for: ${missingPerms.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Test permission checks for a specific workspace
 */
function testWorkspace(
  manager: WorkspacePermissionManager,
  agent: AgentData,
  workspace: 'ide' | 'knowledge' | 'study' | 'notes'
): Array<{ name: string; passed: boolean; details: string }> {
  const tests: Array<{ name: string; passed: boolean; details: string }> = [];

  // Test agent availability
  const agentAvailable = manager.isAgentAvailableInWorkspace(agent.workspaceBindings, workspace);
  tests.push({
    name: `[${workspace.toUpperCase()}] Agent Available`,
    passed: agentAvailable,
    details: agentAvailable ? 'Agent is available' : 'Agent is not available',
  });

  // Test each tool
  for (const tool of agent.tools) {
    const check = manager.checkWorkspacePermission(
      tool.toolId,
      agent.tools,
      agent.workspaceBindings,
      workspace
    );

    const expected = tool.workspacePermissions[workspace] && agentAvailable;
    const passed = check.canExecute === expected;

    tests.push({
      name: `[${workspace.toUpperCase()}] ${tool.toolName}`,
      passed,
      details: passed
        ? `Correctly ${check.canExecute ? 'allowed' : 'blocked'}`
        : `Expected ${expected ? 'allowed' : 'blocked'}, got ${check.canExecute ? 'allowed' : 'blocked'}`,
    });
  }

  return tests;
}

/**
 * Test tool filtering per workspace
 */
function testToolFiltering(
  manager: WorkspacePermissionManager,
  agent: AgentData
): Array<{ name: string; passed: boolean; details: string }> {
  const tests: Array<{ name: string; passed: boolean; details: string }> = [];

  // Test IDE workspace (should have read_file, write_file, execute_command)
  const ideTools = manager.getToolsForWorkspace(agent.tools, agent.workspaceBindings, 'ide');
  const ideToolIds = ideTools.map(t => t.toolId);
  tests.push({
    name: '[FILTER] IDE Workspace Tools',
    passed: ideToolIds.includes('read_file') &&
            ideToolIds.includes('write_file') &&
            ideToolIds.includes('execute_command') &&
            !ideToolIds.includes('synthesize'),
    details: `IDE tools: ${ideToolIds.join(', ')}`,
  });

  // Test Knowledge workspace (should have read_file, synthesize)
  const knowledgeTools = manager.getToolsForWorkspace(agent.tools, agent.workspaceBindings, 'knowledge');
  const knowledgeToolIds = knowledgeTools.map(t => t.toolId);
  tests.push({
    name: '[FILTER] Knowledge Workspace Tools',
    passed: knowledgeToolIds.includes('read_file') &&
            knowledgeToolIds.includes('synthesize') &&
            !knowledgeToolIds.includes('write_file') &&
            !knowledgeToolIds.includes('execute_command'),
    details: `Knowledge tools: ${knowledgeToolIds.join(', ')}`,
  });

  return tests;
}

/**
 * Export for manual invocation
 */
export const validateWorkspacePermissionsForConsole = validateWorkspacePermissions;
