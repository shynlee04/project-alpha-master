/**
 * @fileoverview Filesystem CRUD Test Runner
 * @module harness/runners/filesystem-crud
 *
 * Tests filesystem CRUD operations with permission enforcement.
 *
 * ANNOTATION: 2026-01-11 - Implementation for test spike harness - Task requirements
 */

import type { PermissionProfile } from '../../permission-profiles';
import type { ScenarioContext, ScenarioResult, TestScenario, AssertionResult } from './test-scenarios';

/**
 * Mock filesystem entry
 */
interface FileEntry {
  path: string;
  content: string;
  isDirectory: boolean;
  permissions: string;
}

/**
 * Filesystem CRUD Test Runner
 * Tests read, write, delete operations with permission profiles
 */
export class FilesystemCRUDRunner implements TestScenario {
  id = 'filesystem-crud';
  name = 'Filesystem CRUD Test';
  description = 'Tests filesystem CRUD operations with permission enforcement and path restrictions';
  estimatedDuration = '40s';
  status: 'ready' = 'ready';
  category = 'filesystem';
  tags = ['filesystem', 'crud', 'permission', 'path'];

  private filesystem: Map<string, FileEntry> = new Map();
  private auditLog: Array<{ operation: string; path: string; success: boolean; timestamp: number }> = [];

  constructor() {
    this.initializeTestWorkspace();
  }

  /**
   * Initialize test workspace with sample files
   */
  private initializeTestWorkspace(): void {
    const testFiles: FileEntry[] = [
      { path: '/test-workspace/readme.txt', content: 'Welcome to test workspace', isDirectory: false, permissions: 'rw' },
      { path: '/test-workspace/src', content: '', isDirectory: true, permissions: 'rwx' },
      { path: '/test-workspace/src/main.ts', content: 'console.log("Hello");', isDirectory: false, permissions: 'rw' },
      { path: '/test-workspace/config.json', content: '{"key": "value"}', isDirectory: false, permissions: 'rw' },
      { path: '/test-workspace/restricted/secret.txt', content: 'secret data', isDirectory: false, permissions: 'r' },
    ];

    testFiles.forEach(file => this.filesystem.set(file.path, file));
  }

  /**
   * Execute the test scenario
   */
  async execute(profile?: PermissionProfile, context?: ScenarioContext): Promise<ScenarioResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const logs: string[] = [];
    const toolCalls: ScenarioResult['toolCalls'] = [];

    this.status = 'running';
    context?.onProgress?.(0, 'Initializing filesystem CRUD test');
    context?.onStdout?.('Filesystem CRUD test started');
    context?.onStdout?.(`Profile: ${profile?.name || 'none'}`);

    logs.push('[TEST] Starting filesystem CRUD test');
    logs.push(`[TEST] Profile: ${profile?.name || 'none'}`);

    try {
      // Test 1: Read operations
      context?.onProgress?.(15, 'Testing read operations');
      const readTests = [
        '/test-workspace/readme.txt',
        '/test-workspace/src/main.ts',
        '/test-workspace/config.json',
      ];

      for (const path of readTests) {
        const result = await this.testRead(path, profile, context);
        if (result.error) {
          errors.push(result.error);
        } else {
          toolCalls.push(...result.toolCalls);
        }
      }

      // Test 2: Write operations
      context?.onProgress?.(40, 'Testing write operations');
      const writeTests = [
        { path: '/test-workspace/new-file.txt', content: 'New file content' },
        { path: '/test-workspace/src/utils.ts', content: 'export const util = () => {};' },
      ];

      for (const { path, content } of writeTests) {
        const result = await this.testWrite(path, content, profile, context);
        if (result.error) {
          errors.push(result.error);
        } else {
          toolCalls.push(...result.toolCalls);
        }
      }

      // Test 3: Delete operations
      context?.onProgress?.(60, 'Testing delete operations');
      const deleteTests = [
        '/test-workspace/to-delete.txt',
        '/test-workspace/src/old.ts',
      ];

      // Create files to delete first
      for (const path of deleteTests) {
        this.filesystem.set(path, { path, content: 'to be deleted', isDirectory: false, permissions: 'rw' });
      }

      for (const path of deleteTests) {
        const result = await this.testDelete(path, profile, context);
        if (result.error) {
          errors.push(result.error);
        } else {
          toolCalls.push(...result.toolCalls);
        }
      }

      // Test 4: Path restriction tests
      context?.onProgress?.(75, 'Testing path restrictions');
      const restrictedTests = [
        '/test-workspace/restricted/secret.txt',
        '/etc/passwd',
        '/tmp/external-file.txt',
      ];

      for (const path of restrictedTests) {
        const result = await this.testPathRestriction(path, profile, context);
        if (result.error) {
          errors.push(result.error);
        } else {
          toolCalls.push(...result.toolCalls);
        }
      }

      // Test 5: Audit log verification
      context?.onProgress?.(90, 'Verifying audit log completeness');
      const auditComplete = this.verifyAuditLog();
      logs.push(`[TEST] Audit log entries: ${this.auditLog.length}`);
      logs.push(`[TEST] Audit log complete: ${auditComplete}`);

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
      toolCalls,
      errors,
      assertions: [],
      logs,
      profile,
    };
  }

  /**
   * Test read operation
   */
  private async testRead(
    path: string,
    profile?: PermissionProfile,
    context?: ScenarioContext
  ): Promise<{ toolCalls: ScenarioResult['toolCalls']; error?: string }> {
    const timestamp = Date.now();
    const startTime = Date.now();

    // Check read permission
    let canRead = true;
    if (profile && !profile.canRead(path)) {
      canRead = false;
    }

    let output: unknown;
    let error: string | undefined;

    if (!canRead && !profile?.yoloMode) {
      error = `Permission denied: cannot read ${path}`;
      context?.onStderr?.(`[FS] ❌ READ ${path} - ${error}`);
    } else {
      const entry = this.filesystem.get(path);
      if (entry) {
        output = { content: entry.content, path };
        context?.onStdout?.(`[FS] ✅ READ ${path}`);
      } else {
        error = `File not found: ${path}`;
        context?.onStderr?.(`[FS] ❌ READ ${path} - ${error}`);
      }
    }

    this.auditLog.push({
      operation: 'read',
      path,
      success: !error,
      timestamp,
    });

    return {
      toolCalls: [{
        timestamp: new Date(timestamp).toISOString(),
        runId: 'test-run',
        toolName: 'read_file',
        inputs: { path },
        permissionsEvaluated: [{
          permission: 'read',
          granted: canRead,
          reason: canRead ? 'allowed' : 'denied by profile',
          profile: profile?.name,
        }],
        output,
        latency: Date.now() - startTime,
        error,
      }],
      error,
    };
  }

  /**
   * Test write operation
   */
  private async testWrite(
    path: string,
    content: string,
    profile?: PermissionProfile,
    context?: ScenarioContext
  ): Promise<{ toolCalls: ScenarioResult['toolCalls']; error?: string }> {
    const timestamp = Date.now();
    const startTime = Date.now();

    // Check write permission
    let canWrite = true;
    if (profile && !profile.canWrite(path)) {
      canWrite = false;
    }

    let output: unknown;
    let error: string | undefined;

    if (!canWrite && !profile?.yoloMode) {
      error = `Permission denied: cannot write ${path}`;
      context?.onStderr?.(`[FS] ❌ WRITE ${path} - ${error}`);
    } else {
      this.filesystem.set(path, { path, content, isDirectory: false, permissions: 'rw' });
      output = { path, created: true };
      context?.onStdout?.(`[FS] ✅ WRITE ${path}`);
    }

    this.auditLog.push({
      operation: 'write',
      path,
      success: !error,
      timestamp,
    });

    return {
      toolCalls: [{
        timestamp: new Date(timestamp).toISOString(),
        runId: 'test-run',
        toolName: 'write_file',
        inputs: { path, content },
        permissionsEvaluated: [{
          permission: 'write',
          granted: canWrite,
          reason: canWrite ? 'allowed' : 'denied by profile',
          profile: profile?.name,
        }],
        output,
        latency: Date.now() - startTime,
        error,
      }],
      error,
    };
  }

  /**
   * Test delete operation
   */
  private async testDelete(
    path: string,
    profile?: PermissionProfile,
    context?: ScenarioContext
  ): Promise<{ toolCalls: ScenarioResult['toolCalls']; error?: string }> {
    const timestamp = Date.now();
    const startTime = Date.now();

    // Check write permission for delete
    let canDelete = true;
    if (profile && !profile.canWrite(path)) {
      canDelete = false;
    }

    let output: unknown;
    let error: string | undefined;

    if (!canDelete && !profile?.yoloMode) {
      error = `Permission denied: cannot delete ${path}`;
      context?.onStderr?.(`[FS] ❌ DELETE ${path} - ${error}`);
    } else {
      const deleted = this.filesystem.delete(path);
      if (deleted) {
        output = { path, deleted: true };
        context?.onStdout?.(`[FS] ✅ DELETE ${path}`);
      } else {
        error = `File not found: ${path}`;
        context?.onStderr?.(`[FS] ❌ DELETE ${path} - ${error}`);
      }
    }

    this.auditLog.push({
      operation: 'delete',
      path,
      success: !error,
      timestamp,
    });

    return {
      toolCalls: [{
        timestamp: new Date(timestamp).toISOString(),
        runId: 'test-run',
        toolName: 'delete_file',
        inputs: { path },
        permissionsEvaluated: [{
          permission: 'write',
          granted: canDelete,
          reason: canDelete ? 'allowed' : 'denied by profile',
          profile: profile?.name,
        }],
        output,
        latency: Date.now() - startTime,
        error,
      }],
      error,
    };
  }

  /**
   * Test path restriction enforcement
   */
  private async testPathRestriction(
    path: string,
    profile?: PermissionProfile,
    context?: ScenarioContext
  ): Promise<{ toolCalls: ScenarioResult['toolCalls']; error?: string }> {
    const timestamp = Date.now();
    const startTime = Date.now();

    // Check path restriction
    let isAllowed = true;
    if (profile) {
      isAllowed = profile.canRead(path) || profile.canWrite(path);
    }

    let error: string | undefined;

    if (!isAllowed && !profile?.yoloMode) {
      error = `Path restriction denied: ${path}`;
      context?.onStderr?.(`[FS] ❌ PATH ${path} - ${error}`);
    } else {
      context?.onStdout?.(`[FS] ✅ PATH ${path} - allowed`);
    }

    this.auditLog.push({
      operation: 'path_check',
      path,
      success: isAllowed,
      timestamp,
    });

    return {
      toolCalls: [{
        timestamp: new Date(timestamp).toISOString(),
        runId: 'test-run',
        toolName: 'path_check',
        inputs: { path },
        permissionsEvaluated: [{
          permission: 'path_access',
          granted: isAllowed,
          reason: isAllowed ? 'path allowed' : 'path restricted',
          profile: profile?.name,
        }],
        output: { path, allowed: isAllowed },
        latency: Date.now() - startTime,
        error: isAllowed ? undefined : error,
      }],
      error: isAllowed ? undefined : error,
    };
  }

  /**
   * Verify audit log completeness
   */
  private verifyAuditLog(): boolean {
    const operations = new Set(this.auditLog.map(e => e.operation));
    const hasRead = operations.has('read');
    const hasWrite = operations.has('write');
    const hasDelete = operations.has('delete');
    const hasPathCheck = operations.has('path_check');

    return hasRead && hasWrite && hasDelete && hasPathCheck;
  }

  /**
   * Validate the scenario
   */
  async validate(): Promise<AssertionResult[]> {
    const assertions: AssertionResult[] = [];

    // Check filesystem was initialized
    assertions.push({
      name: 'filesystem_initialized',
      passed: this.filesystem.size > 0,
      expected: `${this.filesystem.size} files in filesystem`,
      actual: `${this.filesystem.size} files initialized`,
    });

    // Check audit log populated
    assertions.push({
      name: 'audit_log_populated',
      passed: this.auditLog.length > 0,
      expected: 'Audit log has entries',
      actual: `${this.auditLog.length} audit entries`,
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
export function createFilesystemCRUDRunner(): FilesystemCRUDRunner {
  return new FilesystemCRUDRunner();
}
