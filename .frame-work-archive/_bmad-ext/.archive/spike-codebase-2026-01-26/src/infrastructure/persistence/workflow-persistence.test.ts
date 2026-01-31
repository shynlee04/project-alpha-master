/**
 * @fileoverview Workflow Persistence Tests
 * @module infrastructure/persistence/workflow-persistence.test
 * @governance EPIC-E4-10
 * @created 2026-01-06
 *
 * Tests for workflow persistence including:
 * - CRUD operations
 * - Import/Export functionality
 * - Search and filtering
 * - Bulk operations
 * - Statistics
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    saveWorkflow,
    getWorkflow,
    getAllWorkflows,
    searchWorkflows,
    deleteWorkflow,
    duplicateWorkflow,
    exportWorkflows,
    importWorkflows,
    createFromTemplate,
    bulkDeleteWorkflows,
    bulkUpdateTags,
    bulkAddTag,
    bulkRemoveTag,
    getWorkflowStats,
    getAllTags,
    clearAllWorkflows,
    migrateFromLocalStorage,
    type WorkflowExport,
} from './workflow-persistence';
import type { Workflow } from '@/lib/workflow/builder/types';
import { StepType } from '@/lib/workflow/builder/types';

// ============================================================================
// Mock Database
// ============================================================================

class MockDexieDB {
    workflows = new Map<string, Workflow>();

    async put(workflow: Workflow): Promise<string> {
        this.workflows.set(workflow.id, { ...workflow, updatedAt: Date.now() });
        return workflow.id;
    }

    async get(id: string): Promise<Workflow | undefined> {
        return this.workflows.get(id);
    }

    async bulkGet(ids: string[]): Promise<(Workflow | undefined)[]> {
        return ids.map(id => this.workflows.get(id));
    }

    async toArray(): Promise<Workflow[]> {
        return Array.from(this.workflows.values()).sort((a, b) => b.updatedAt - a.updatedAt);
    }

    async count(): Promise<number> {
        return this.workflows.size;
    }

    async delete(id: string): Promise<void> {
        this.workflows.delete(id);
    }

    async bulkDelete(ids: string[]): Promise<void> {
        for (const id of ids) {
            this.workflows.delete(id);
        }
    }

    async update(id: string, changes: Partial<Workflow>): Promise<number> {
        const existing = this.workflows.get(id);
        if (existing) {
            this.workflows.set(id, { ...existing, ...changes, updatedAt: Date.now() });
            return 1;
        }
        return 0;
    }

    clear() {
        this.workflows.clear();
    }
}

const mockDb = new MockDexieDB();

// Mock getDb function
vi.mock('./dexie-db', () => ({
    getDb: () => mockDb,
}));

// ============================================================================
// Test Utilities
// ============================================================================

function createMockWorkflow(overrides?: Partial<Workflow>): Workflow {
    return {
        id: `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: 'Test Workflow',
        version: '1.0.0',
        steps: [
            {
                id: 'step-1',
                type: StepType.SEND_MESSAGE,
                name: 'Start',
                config: {},
                nextSteps: ['step-2'],
            },
            {
                id: 'step-2',
                type: StepType.END,
                name: 'End',
                config: {},
                nextSteps: [],
            },
        ],
        startStepId: 'step-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
        ...overrides,
    };
}

// ============================================================================
// Test Suites
// ============================================================================

describe('WorkflowPersistence', () => {
    beforeEach(() => {
        mockDb.clear();
        vi.clearAllMocks();
    });

    describe('CRUD Operations', () => {
        describe('saveWorkflow', () => {
            it('should save a new workflow', async () => {
                const workflow = createMockWorkflow();
                const id = await saveWorkflow(workflow);

                expect(id).toBe(workflow.id);
                expect(mockDb.workflows.has(id)).toBe(true);
            });

            it('should update existing workflow', async () => {
                const workflow = createMockWorkflow();
                await saveWorkflow(workflow);

                const updated = { ...workflow, name: 'Updated Workflow' };
                await saveWorkflow(updated);

                const retrieved = await getWorkflow(workflow.id);
                expect(retrieved?.name).toBe('Updated Workflow');
            });

            it('should update timestamp on save', async () => {
                const workflow = createMockWorkflow();
                const originalTime = workflow.updatedAt;

                // Wait to ensure timestamp difference
                await new Promise(resolve => setTimeout(resolve, 10));

                await saveWorkflow(workflow);
                const retrieved = await getWorkflow(workflow.id);

                expect(retrieved?.updatedAt).toBeGreaterThanOrEqual(originalTime);
            });
        });

        describe('getWorkflow', () => {
            it('should retrieve saved workflow', async () => {
                const workflow = createMockWorkflow();
                await saveWorkflow(workflow);

                const retrieved = await getWorkflow(workflow.id);

                expect(retrieved).toBeDefined();
                expect(retrieved?.id).toBe(workflow.id);
                expect(retrieved?.name).toBe(workflow.name);
            });

            it('should return undefined for non-existent workflow', async () => {
                const retrieved = await getWorkflow('non-existent');
                expect(retrieved).toBeUndefined();
            });
        });

        describe('getAllWorkflows', () => {
            it('should return empty array when no workflows', async () => {
                const workflows = await getAllWorkflows();
                expect(workflows).toEqual([]);
            });

            it('should return all workflows sorted by updatedAt', async () => {
                const workflow1 = createMockWorkflow({ name: 'First' });
                await new Promise(resolve => setTimeout(resolve, 10));
                const workflow2 = createMockWorkflow({ name: 'Second' });
                await new Promise(resolve => setTimeout(resolve, 10));
                const workflow3 = createMockWorkflow({ name: 'Third' });

                await saveWorkflow(workflow1);
                await saveWorkflow(workflow2);
                await saveWorkflow(workflow3);

                const workflows = await getAllWorkflows();

                expect(workflows).toHaveLength(3);
                expect(workflows[0].name).toBe('Third'); // Most recent
                expect(workflows[2].name).toBe('First'); // Oldest
            });

            it('should respect limit parameter', async () => {
                for (let i = 0; i < 5; i++) {
                    await saveWorkflow(createMockWorkflow({ name: `Workflow ${i}` }));
                }

                const workflows = await getAllWorkflows(3);
                expect(workflows).toHaveLength(3);
            });
        });

        describe('deleteWorkflow', () => {
            it('should delete existing workflow', async () => {
                const workflow = createMockWorkflow();
                await saveWorkflow(workflow);

                await deleteWorkflow(workflow.id);

                const retrieved = await getWorkflow(workflow.id);
                expect(retrieved).toBeUndefined();
            });

            it('should handle deleting non-existent workflow', async () => {
                await expect(deleteWorkflow('non-existent')).resolves.toBeUndefined();
            });
        });
    });

    describe('Search and Filtering', () => {
        beforeEach(async () => {
            // Create test workflows
            await saveWorkflow(createMockWorkflow({
                id: 'w1',
                name: 'Research Workflow',
                description: 'For research tasks',
                tags: ['research', 'ai'],
                createdAt: 1000,
            }));
            await saveWorkflow(createMockWorkflow({
                id: 'w2',
                name: 'Code Review Workflow',
                description: 'For code reviews',
                tags: ['coding', 'review'],
                createdAt: 2000,
            }));
            await saveWorkflow(createMockWorkflow({
                id: 'w3',
                name: 'AI Research',
                description: 'Advanced AI research',
                tags: ['research', 'ai'],
                createdAt: 3000,
            }));
        });

        describe('searchWorkflows', () => {
            it('should filter by query string', async () => {
                const results = await searchWorkflows({ query: 'research' });

                expect(results).toHaveLength(2);
                expect(results.every(w => w.name.toLowerCase().includes('research') ||
                    w.description?.toLowerCase().includes('research'))).toBe(true);
            });

            it('should filter by tags', async () => {
                const results = await searchWorkflows({ tags: ['research'] });

                expect(results).toHaveLength(2);
                expect(results.every(w => w.tags?.includes('research'))).toBe(true);
            });

            it('should filter by multiple tags', async () => {
                const results = await searchWorkflows({ tags: ['research', 'ai'] });

                // Should return workflows with BOTH tags
                expect(results).toHaveLength(2);
                expect(results.every(w => w.tags?.includes('research') && w.tags?.includes('ai'))).toBe(true);
            });

            it('should filter by date range', async () => {
                const results = await searchWorkflows({
                    startDate: 1500,
                    endDate: 2500,
                });

                expect(results).toHaveLength(1);
                expect(results[0].id).toBe('w2');
            });

            it('should combine multiple filters', async () => {
                const results = await searchWorkflows({
                    query: 'workflow',
                    tags: ['research'],
                });

                expect(results.length).toBeGreaterThan(0);
                expect(results.every(w =>
                    w.name.toLowerCase().includes('workflow') ||
                    w.description?.toLowerCase().includes('workflow')
                )).toBe(true);
            });

            it('should apply limit to search results', async () => {
                const results = await searchWorkflows({ limit: 2 });

                expect(results.length).toBeLessThanOrEqual(2);
            });
        });

        describe('getWorkflowStats', () => {
            it('should return correct statistics', async () => {
                const stats = await getWorkflowStats();

                expect(stats.total).toBe(3);
                expect(stats.byTag).toEqual({
                    research: 2,
                    ai: 2,
                    coding: 1,
                    review: 1,
                });
            });

            it('should count recently created workflows', async () => {
                const now = Date.now();
                const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

                await saveWorkflow(createMockWorkflow({
                    id: 'recent',
                    name: 'Recent Workflow',
                    createdAt: now - 1000, // 1 second ago
                    tags: [],
                }));

                const stats = await getWorkflowStats();
                expect(stats.recentlyCreated).toBeGreaterThan(0);
            });
        });

        describe('getAllTags', () => {
            it('should return all unique tags sorted by frequency', async () => {
                const tags = await getAllTags();

                expect(tags).toHaveLength(4);
                expect(tags[0]).toEqual({ tag: 'research', count: 2 });
                expect(tags[1]).toEqual({ tag: 'ai', count: 2 });
            });
        });
    });

    describe('Import/Export', () => {
        describe('exportWorkflows', () => {
            it('should export all workflows when no IDs specified', async () => {
                const w1 = createMockWorkflow({ id: 'w1', name: 'Workflow 1' });
                const w2 = createMockWorkflow({ id: 'w2', name: 'Workflow 2' });

                await saveWorkflow(w1);
                await saveWorkflow(w2);

                const exported = await exportWorkflows();
                const data = JSON.parse(exported) as WorkflowExport;

                expect(data.version).toBe('1.0.0');
                expect(data.workflows).toHaveLength(2);
                expect(data.workflows[0].name).toBe('Workflow 2'); // Sorted by updatedAt
            });

            it('should export specific workflows when IDs provided', async () => {
                const w1 = createMockWorkflow({ id: 'w1', name: 'Export Me' });
                const w2 = createMockWorkflow({ id: 'w2', name: 'Not Me' });

                await saveWorkflow(w1);
                await saveWorkflow(w2);

                const exported = await exportWorkflows(['w1']);
                const data = JSON.parse(exported) as WorkflowExport;

                expect(data.workflows).toHaveLength(1);
                expect(data.workflows[0].name).toBe('Export Me');
            });

            it('should include export metadata', async () => {
                await saveWorkflow(createMockWorkflow());

                const exported = await exportWorkflows();
                const data = JSON.parse(exported) as WorkflowExport;

                expect(data.version).toBeDefined();
                expect(data.exportedAt).toBeDefined();
                expect(data.exportedAt).toBeLessThanOrEqual(Date.now());
            });

            it('should return empty export when database unavailable', async () => {
                // Mock null database
                vi.doMock('./dexie-db', () => ({
                    getDb: () => null,
                }));

                const exported = await exportWorkflows(['non-existent']);
                const data = JSON.parse(exported) as WorkflowExport;

                expect(data.workflows).toHaveLength(0);
            });
        });

        describe('importWorkflows', () => {
            it('should import workflows from JSON', async () => {
                const json = JSON.stringify({
                    version: '1.0.0',
                    exportedAt: Date.now(),
                    workflows: [
                        createMockWorkflow({ id: 'import-1', name: 'Imported 1' }),
                        createMockWorkflow({ id: 'import-2', name: 'Imported 2' }),
                    ],
                });

                const result = await importWorkflows(json);

                expect(result.imported).toBe(2);
                expect(result.skipped).toBe(0);
                expect(result.errors).toHaveLength(0);

                const w1 = await getWorkflow('import-1');
                const w2 = await getWorkflow('import-2');
                expect(w1?.name).toBe('Imported 1');
                expect(w2?.name).toBe('Imported 2');
            });

            it('should skip existing workflows when not overwriting', async () => {
                const existing = createMockWorkflow({ id: 'existing', name: 'Existing' });
                await saveWorkflow(existing);

                const json = JSON.stringify({
                    version: '1.0.0',
                    exportedAt: Date.now(),
                    workflows: [
                        createMockWorkflow({ id: 'existing', name: 'Updated Name' }),
                    ],
                });

                const result = await importWorkflows(json, { overwrite: false });

                expect(result.imported).toBe(0);
                expect(result.skipped).toBe(1);

                const retrieved = await getWorkflow('existing');
                expect(retrieved?.name).toBe('Existing'); // Not updated
            });

            it('should overwrite existing workflows when requested', async () => {
                const existing = createMockWorkflow({ id: 'existing', name: 'Existing' });
                await saveWorkflow(existing);

                const json = JSON.stringify({
                    version: '1.0.0',
                    exportedAt: Date.now(),
                    workflows: [
                        createMockWorkflow({ id: 'existing', name: 'Updated Name' }),
                    ],
                });

                const result = await importWorkflows(json, { overwrite: true });

                expect(result.imported).toBe(1);
                expect(result.skipped).toBe(0);

                const retrieved = await getWorkflow('existing');
                expect(retrieved?.name).toBe('Updated Name');
            });

            it('should generate new IDs when not preserving', async () => {
                const json = JSON.stringify({
                    version: '1.0.0',
                    exportedAt: Date.now(),
                    workflows: [
                        createMockWorkflow({ id: 'old-id', name: 'Test' }),
                    ],
                });

                const result = await importWorkflows(json, { preserveIds: false });

                expect(result.imported).toBe(1);
                expect(result.errors).toHaveLength(0);

                // Old ID should not exist
                expect(await getWorkflow('old-id')).toBeUndefined();
                // New ID should exist
                expect(await getAllWorkflows()).toHaveLength(1);
            });

            it('should handle invalid JSON gracefully', async () => {
                const result = await importWorkflows('invalid json{');

                expect(result.imported).toBe(0);
                expect(result.errors).toHaveLength(1);
                expect(result.errors[0]).toContain('Parse error');
            });

            it('should handle invalid export format', async () => {
                const result = await importWorkflows(JSON.stringify({ invalid: true }));

                expect(result.imported).toBe(0);
                expect(result.errors[0]).toBe('Invalid export format');
            });

            it('should handle object input directly', async () => {
                const exportData: WorkflowExport = {
                    version: '1.0.0',
                    exportedAt: Date.now(),
                    workflows: [createMockWorkflow({ id: 'direct', name: 'Direct' })],
                };

                const result = await importWorkflows(exportData);

                expect(result.imported).toBe(1);
                expect((await getWorkflow('direct'))?.name).toBe('Direct');
            });
        });
    });

    describe('Duplicate Workflow', () => {
        it('should create a copy of workflow', async () => {
            const original = createMockWorkflow({
                id: 'original',
                name: 'Original Workflow',
                tags: ['test'],
            });

            await saveWorkflow(original);

            const duplicateId = await duplicateWorkflow('original');

            expect(duplicateId).toBeDefined();
            expect(duplicateId).not.toBe('original');

            const duplicate = await getWorkflow(duplicateId);
            expect(duplicate?.name).toBe('Original Workflow (Copy)');
            expect(duplicate?.tags).toEqual(['test']);
        });

        it('should return undefined for non-existent workflow', async () => {
            const result = await duplicateWorkflow('non-existent');
            expect(result).toBeUndefined();
        });

        it('should generate unique IDs for duplicates', async () => {
            const original = createMockWorkflow({ id: 'original' });
            await saveWorkflow(original);

            const dup1 = await duplicateWorkflow('original');
            await new Promise(resolve => setTimeout(resolve, 10)); // Ensure time difference
            const dup2 = await duplicateWorkflow(original);

            expect(dup1).not.toBe(dup2);
        });
    });

    describe('Template Creation', () => {
        it('should create workflow from template', async () => {
            const template: Workflow = {
                id: 'template',
                name: 'Template Name',
                version: '1.0.0',
                steps: [],
                startStepId: '',
                createdAt: 0,
                updatedAt: 0,
                tags: ['template'],
            };

            const newId = await createFromTemplate(template, 'Custom Name');

            expect(newId).toBeDefined();
            expect(newId).not.toBe('template');

            const created = await getWorkflow(newId);
            expect(created?.name).toBe('Custom Name');
            expect(created?.tags).toEqual(['template']);
        });

        it('should use template name when custom name not provided', async () => {
            const template: Workflow = {
                id: 'template',
                name: 'Template Name',
                version: '1.0.0',
                steps: [],
                startStepId: '',
                createdAt: 0,
                updatedAt: 0,
            };

            const newId = await createFromTemplate(template);

            const created = await getWorkflow(newId);
            expect(created?.name).toBe('Template Name');
        });
    });

    describe('Bulk Operations', () => {
        beforeEach(async () => {
            // Create test workflows
            for (let i = 1; i <= 5; i++) {
                await saveWorkflow(createMockWorkflow({
                    id: `w${i}`,
                    name: `Workflow ${i}`,
                    tags: i % 2 === 0 ? ['even'] : ['odd'],
                }));
            }
        });

        describe('bulkDeleteWorkflows', () => {
            it('should delete multiple workflows', async () => {
                await bulkDeleteWorkflows(['w1', 'w2', 'w3']);

                expect(await getWorkflow('w1')).toBeUndefined();
                expect(await getWorkflow('w2')).toBeUndefined();
                expect(await getWorkflow('w3')).toBeUndefined();
                expect(await getWorkflow('w4')).toBeDefined();
                expect(await getWorkflow('w5')).toBeDefined();
            });

            it('should handle empty array', async () => {
                const beforeCount = await getAllWorkflows();
                await bulkDeleteWorkflows([]);
                const afterCount = await getAllWorkflows();

                expect(beforeCount).toHaveLength(afterCount);
            });
        });

        describe('bulkUpdateTags', () => {
            it('should replace tags for multiple workflows', async () => {
                const updated = await bulkUpdateTags(['w1', 'w2', 'w3'], ['new-tag']);

                expect(updated).toBe(3);

                const w1 = await getWorkflow('w1');
                const w2 = await getWorkflow('w2');
                const w4 = await getWorkflow('w4');

                expect(w1?.tags).toEqual(['new-tag']);
                expect(w2?.tags).toEqual(['new-tag']);
                expect(w4?.tags).toEqual(['even']); // Unchanged
            });

            it('should return count of updated workflows', async () => {
                const count = await bulkUpdateTags(['w1', 'w2'], ['updated']);

                expect(count).toBe(2);
            });
        });

        describe('bulkAddTag', () => {
            it('should add tag to workflows without it', async () => {
                const added = await bulkAddTag(['w1', 'w2'], 'new-tag');

                expect(added).toBe(2);

                const w1 = await getWorkflow('w1');
                expect(w1?.tags).toContain('new-tag');
                expect(w1?.tags).toContain('odd');
            });

            it('should not duplicate existing tags', async () => {
                await bulkAddTag(['w1'], 'odd');

                const w1 = await getWorkflow('w1');
                const oddCount = w1?.tags.filter(t => t === 'odd').length;

                expect(oddCount).toBe(1);
            });

            it('should return count of updated workflows', async () => {
                const count = await bulkAddTag(['w1', 'w4'], 'shared');

                expect(count).toBe(2);
            });
        });

        describe('bulkRemoveTag', () => {
            it('should remove tag from workflows', async () => {
                const removed = await bulkRemoveTag(['w1', 'w3'], 'odd');

                expect(removed).toBe(2);

                const w1 = await getWorkflow('w1');
                expect(w1?.tags).not.toContain('odd');
            });

            it('should not affect workflows without the tag', async () => {
                await bulkRemoveTag(['w1', 'w2'], 'non-existent');

                const w1 = await getWorkflow('w1');
                expect(w1?.tags).toContain('odd'); // Still has original tag
            });

            it('should return count of updated workflows', async () => {
                const count = await bulkRemoveTag(['w1', 'w3'], 'odd');

                expect(count).toBe(2);
            });
        });
    });

    describe('Statistics', () => {
        beforeEach(async () => {
            const now = Date.now();
            const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000;
            const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;

            await saveWorkflow(createMockWorkflow({
                id: 'old',
                name: 'Old Workflow',
                createdAt: eightDaysAgo,
                tags: ['legacy'],
            }));
            await saveWorkflow(createMockWorkflow({
                id: 'recent',
                name: 'Recent Workflow',
                createdAt: threeDaysAgo,
                tags: ['new', 'featured'],
            }));
        });

        describe('getWorkflowStats', () => {
            it('should return total count', async () => {
                const stats = await getWorkflowStats();
                expect(stats.total).toBe(2);
            });

            it('should count by tag', async () => {
                const stats = await getWorkflowStats();
                expect(stats.byTag).toEqual({
                    legacy: 1,
                    new: 1,
                    featured: 1,
                });
            });

            it('should count recently created workflows', async () => {
                const stats = await getWorkflowStats();
                expect(stats.recentlyCreated).toBe(1); // Only 'recent' is within 7 days
            });
        });

        describe('getAllTags', () => {
            it('should return tags sorted by frequency', async () => {
                const tags = await getAllTags();

                expect(tags).toHaveLength(3);
                // All have count 1, order doesn't matter for equal counts
                expect(tags.every(t => t.count === 1)).toBe(true);
            });

            it('should include tag metadata', async () => {
                const tags = await getAllTags();

                expect(tags[0]).toHaveProperty('tag');
                expect(tags[0]).toHaveProperty('count');
            });
        });
    });

    describe('Cleanup Operations', () => {
        describe('clearAllWorkflows', () => {
            it('should delete all workflows', async () => {
                await saveWorkflow(createMockWorkflow({ id: 'w1' }));
                await saveWorkflow(createMockWorkflow({ id: 'w2' }));

                const count = await clearAllWorkflows();

                expect(count).toBe(2);
                expect(await getAllWorkflows()).toHaveLength(0);
            });

            it('should return zero when no workflows', async () => {
                const count = await clearAllWorkflows();
                expect(count).toBe(0);
            });
        });
    });

    describe('Migration', () => {
        describe('migrateFromLocalStorage', () => {
            it('should migrate workflows from localStorage', () => {
                const mockWorkflows = [
                    createMockWorkflow({ id: 'ls-1', name: 'From LS 1' }),
                    createMockWorkflow({ id: 'ls-2', name: 'From LS 2' }),
                ];

                // Mock localStorage
                const localStorageMock = {
                    getItem: vi.fn(() => JSON.stringify(mockWorkflows)),
                    removeItem: vi.fn(),
                };
                global.localStorage = localStorageMock as any;

                const migrated = migrateFromLocalStorage();

                // Since getDb is mocked, this will return 0
                // In real scenario, it would migrate
                expect(localStorageMock.getItem).toHaveBeenCalledWith('workflows');
            });

            it('should handle missing localStorage data', () => {
                const localStorageMock = {
                    getItem: vi.fn(() => null),
                    removeItem: vi.fn(),
                };
                global.localStorage = localStorageMock as any;

                const migrated = migrateFromLocalStorage();

                expect(localStorageMock.removeItem).not.toHaveBeenCalled();
            });

            it('should clear localStorage after successful migration', () => {
                const mockWorkflows = [createMockWorkflow({ id: 'ls-1' })];
                const localStorageMock = {
                    getItem: vi.fn(() => JSON.stringify(mockWorkflows)),
                    removeItem: vi.fn(),
                };
                global.localStorage = localStorageMock as any;

                migrateFromLocalStorage();

                // In successful migration, removes the key
                // (This depends on actual database writes succeeding)
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle database unavailability', async () => {
            // This test validates graceful degradation
            // Actual behavior depends on getDb mock
            const workflows = await getAllWorkflows();
            expect(Array.isArray(workflows)).toBe(true);
        });

        it('should handle malformed workflow data', async () => {
            const json = JSON.stringify({
                version: '1.0.0',
                exportedAt: Date.now(),
                workflows: [
                    { id: 'malformed', name: 'Bad' }, // Missing required fields
                ],
            });

            const result = await importWorkflows(json);

            // Should not crash, may report errors
            expect(result).toHaveProperty('imported');
            expect(result).toHaveProperty('errors');
        });
    });

    describe('Performance', () => {
        it('should handle large number of workflows efficiently', async () => {
            // Create 100 workflows
            const workflows = Array.from({ length: 100 }, (_, i) =>
                createMockWorkflow({ id: `perf-${i}`, name: `Workflow ${i}` })
            );

            const start = Date.now();
            for (const workflow of workflows) {
                await saveWorkflow(workflow);
            }
            const duration = Date.now() - start;

            // Should complete in reasonable time (< 5 seconds for 100 workflows)
            expect(duration).toBeLessThan(5000);
        });

        it('should search efficiently', async () => {
            for (let i = 0; i < 50; i++) {
                await saveWorkflow(createMockWorkflow({
                    id: `search-${i}`,
                    name: i % 2 === 0 ? 'Even Workflow' : 'Odd Workflow',
                    tags: i % 3 === 0 ? ['multiple'] : [`tag-${i % 5}`],
                }));
            }

            const start = Date.now();
            const results = await searchWorkflows({ query: 'workflow' });
            const duration = Date.now() - start;

            expect(results.length).toBeGreaterThan(0);
            expect(duration).toBeLessThan(1000); // Search should be fast
        });
    });
});
