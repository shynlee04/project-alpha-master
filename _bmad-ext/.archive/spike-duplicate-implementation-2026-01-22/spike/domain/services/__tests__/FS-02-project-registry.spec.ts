import { test, expect } from '@playwright/test';
import { ProjectRegistry } from '@/domain/services/ProjectRegistry';

/**
 * FS-02: ProjectRegistry with Conflict Detection
 * Story: EPIC-FS, FS-02
 * Gate: ProjectRegistry singleton exists and works
 *
 * Tests the three-index architecture for project registration:
 * - folderIndex: folderPath → registration
 * - projectIndex: projectId → registration
 * - namespaceIndex: namespace → projectId
 */

test.describe('FS-02: ProjectRegistry Conflict Detection', () => {
  test.beforeEach(async () => {
    // Clear registry before each test
    ProjectRegistry.clear();
  });

  test('Gate: ProjectRegistry singleton exists', async () => {
    // Phase 1: Core Gate Verification
    const registry1 = ProjectRegistry;
    const registry2 = ProjectRegistry;

    // Verify singleton (same instance)
    expect(registry1).toBe(registry2);

    // Verify key methods exist
    expect(typeof ProjectRegistry.register).toBe('function');
    expect(typeof ProjectRegistry.unregister).toBe('function');
    expect(typeof ProjectRegistry.detectConflict).toBe('function');
  });

  test('Register project successfully', async () => {
    const result = ProjectRegistry.register(
      'test-project-1',
      '/Users/test/project',
      'notes'
    );

    expect(result.success).toBe(true);
    expect(result.projectId).toBe('test-project-1');
    expect(result.isNew).toBe(true);
  });

  test('Detect conflict when same folder registered twice', async () => {
    // First registration
    ProjectRegistry.register('project-1', '/Users/test/folder', 'ide');

    // Second registration with different project, same folder
    const result = ProjectRegistry.register('project-2', '/Users/test/folder', 'knowledge');

    // Should detect conflict
    expect(result.success).toBe(false);
    expect(result.conflict?.hasConflict).toBe(true);
    expect(result.conflict?.existingProjectId).toBe('project-1');
    expect(result.conflict?.existingWorkspaceType).toBe('ide');
  });

  test('Allow re-registration of same project in same workspace', async () => {
    // First registration
    ProjectRegistry.register('project-1', '/Users/test/folder', 'ide');

    // Re-register same project
    const result = ProjectRegistry.register('project-1', '/Users/test/folder', 'ide');

    // Should succeed (no conflict)
    expect(result.success).toBe(true);
  });

  test('Unregister removes project from all indexes', async () => {
    // Register project
    ProjectRegistry.register('project-1', '/Users/test/folder', 'ide');

    // Verify registered
    expect(ProjectRegistry.isFolderRegistered('/Users/test/folder')).toBe(true);

    // Unregister
    const unregistered = ProjectRegistry.unregister('project-1', 'ide');

    // Verify unregistered
    expect(unregistered).toBe(true);
    expect(ProjectRegistry.isFolderRegistered('/Users/test/folder')).toBe(false);
  });

  test('Namespace isolation between workspaces', async () => {
    // Register same project ID in different workspaces (different folders)
    const result1 = ProjectRegistry.register('same-id', '/path1', 'ide');
    const result2 = ProjectRegistry.register('same-id', '/path2', 'knowledge');

    // Both should succeed (different folders)
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    // Verify namespace isolation
    const ideNamespace = ProjectRegistry.createNamespace('ide', 'same-id');
    const knowledgeNamespace = ProjectRegistry.createNamespace('knowledge', 'same-id');

    expect(ProjectRegistry.resolveNamespace(ideNamespace)).toBe('same-id');
    expect(ProjectRegistry.resolveNamespace(knowledgeNamespace)).toBe('same-id');
    expect(ideNamespace).not.toBe(knowledgeNamespace);
  });

  test('Get stats returns correct counts', async () => {
    // Register projects across workspaces
    ProjectRegistry.register('proj-1', '/path1', 'ide');
    ProjectRegistry.register('proj-2', '/path2', 'notes');
    ProjectRegistry.register('proj-3', '/path3', 'knowledge');

    const stats = ProjectRegistry.getStats();

    expect(stats.totalRegistered).toBe(3);
    expect(stats.byWorkspace.ide).toBe(1);
    expect(stats.byWorkspace.notes).toBe(1);
    expect(stats.byWorkspace.knowledge).toBe(1);
  });
});
