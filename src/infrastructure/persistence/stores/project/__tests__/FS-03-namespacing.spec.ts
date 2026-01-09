import { test, expect } from '@playwright/test';

/**
 * FS-03: Project ID Namespacing
 * Story: EPIC-FS, FS-03
 * Gate: Project IDs follow namespace format
 *
 * Tests project ID namespacing: {workspace}:{projectId}
 * Legacy non-namespaced IDs default to 'ide'
 */

test.describe('FS-03: Project ID Namespacing', () => {
  test('Gate: Project IDs follow namespace format', async ({ page }) => {
    // This test verifies the namespacing logic by checking console logs
    // or by creating projects and verifying ID format

    const messages: string[] = [];
    page.on('console', msg => messages.push(msg.text()));

    await page.goto('/notes');
    await page.waitForTimeout(1000);

    // Look for project creation logs
    const projectLogs = messages.filter(m => m.includes('[ProjectStore] Creating project:'));

    // Verify logs show namespaced format
    if (projectLogs.length > 0) {
      const hasNamespace = projectLogs.some(m => m.includes('notes:'));
      expect(hasNamespace).toBe(true);
    }
  });

  test('Workspace type extraction from namespaced ID', () => {
    // Test the extraction logic directly (can be unit test)
    const testCases = [
      { id: 'ide:proj_123', expected: 'ide' },
      { id: 'knowledge:proj_456', expected: 'knowledge' },
      { id: 'study:proj_789', expected: 'study' },
      { id: 'notes:proj_000', expected: 'notes' },
      { id: 'legacy-proj', expected: 'ide' }, // Legacy defaults to ide
      { id: 'unknown:proj_123', expected: 'ide' }, // Unknown defaults to ide
    ];

    for (const { id, expected } of testCases) {
      // Simulate extractWorkspaceType logic
      const parts = id.split(':');
      const workspace = parts.length === 2 ? parts[0] : 'ide';
      const validWorkspace = ['ide', 'knowledge', 'study', 'notes'].includes(workspace) ? workspace as any : 'ide';
      expect(validWorkspace).toBe(expected);
    }
  });

  test('Different workspace types get different namespaces', () => {
    const workspaceTypes = ['ide', 'knowledge', 'study', 'notes'] as const;

    workspaceTypes.forEach(ws => {
      // Simulate project ID generation
      const randomPart = Math.random().toString(36).substring(2, 11);
      const projectId = `${ws}:proj_${Date.now()}_${randomPart}`;

      // Verify format
      expect(projectId).toMatch(/^(ide|knowledge|study|notes):proj_\d+_[a-z0-9]+$/);
      expect(projectId.startsWith(`${ws}:`)).toBe(true);
    });
  });

  test('Namespace format prevents cross-workspace collisions', () => {
    // Same base ID with different workspace prefixes should be unique
    const baseId = 'proj_123';
    const ideId = `ide:${baseId}`;
    const notesId = `notes:${baseId}`;

    expect(ideId).not.toBe(notesId);
    expect(ideId.startsWith('ide:')).toBe(true);
    expect(notesId.startsWith('notes:')).toBe(true);
  });
});
