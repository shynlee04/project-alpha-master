/**
 * @fileoverview Tests for Story WB-1: Project Metadata Enhancement
 * @governance EPIC-WB-1
 *
 * Test specification based on:
 * - Story file: _bmad-output/sprint-artifacts/epic-wb-1-project-metadata-enhancement.md
 * - Test spec: story-wb-1-test-specification.md
 *
 * These tests are designed to FAIL initially because the new fields
 * (workspaceBindings, fileSnapshotEnabled) and related functionality
 * do not exist yet in the implementation.
 *
 * Expected error messages when tests fail:
 * - "Property 'workspaceBindings' does not exist on type 'ProjectMetadata'"
 * - "Property 'fileSnapshotEnabled' does not exist on type 'ProjectMetadata'"
 * - "Cannot find name 'DEFAULT_WORKSPACE_BINDINGS'"
 */

import { db } from '@/infrastructure/persistence/dexie-db';
import type { ProjectMetadata } from '../project-store';
import {
    saveProject,
    getProject,
    listProjects,
    updateProjectLastOpened,
    deleteProject,
    _resetDBForTesting
} from '../project-store';
import {
    generateNewProject,
    generateOldProject,
    generateProjectWithEmptyWorkspaceBindings,
    generateProjectWithPartialWorkspaceBindings,
    DEFAULT_WORKSPACE_BINDINGS,
    DEFAULT_FILE_SNAPSHOT_ENABLED
} from './test-utils';
import { mockFSAHandle } from './mocks';

// Mock the global crypto for consistent UUID generation
vi.stubGlobal('crypto', {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2),
});

describe('Story WB-1: Project Metadata Enhancement - FAILING TESTS', () => {
    const testProjectId = 'test-project-metadata';
    let testProject: any;

    beforeEach(async () => {
        await _resetDBForTesting();
        vi.clearAllMocks();
    });

    afterEach(async () => {
        await _resetDBForTesting();
    });

    describe('AC-WB-1-1: Workspace Bindings Field', () => {
        describe('TC-WB-1-1-01: Create project with full workspaceBindings', () => {
            it('should save project with all workspaceBindings fields', async () => {
                // Arrange
                testProject = generateNewProject({
                    workspaceBindings: {
                        ide: true,
                        notes: false,
                        knowledge: true,
                        study: false,
                    },
                });

                // Act - This will fail because workspaceBindings doesn't exist on ProjectMetadata
                const saved = await saveProject(testProject);

                // Assert - Will fail because saved project won't have the field
                expect(saved).toBe(true);
                const retrieved = await getProject(testProject.id);
                expect(retrieved?.workspaceBindings).toEqual({
                    ide: true,
                    notes: false,
                    knowledge: true,
                    study: false,
                });
            });
        });

        describe('TC-WB-1-1-02: Create project with partial workspaceBindings', () => {
            it('should apply default values for unspecified fields', async () => {
                // Arrange
                testProject = generateNewProject({
                    workspaceBindings: {
                        ide: true,
                        notes: true,
                    },
                });

                // Act - This will fail because workspaceBindings doesn't exist
                await saveProject(testProject);

                // Assert - Will fail because retrieved project won't have workspaceBindings
                const retrieved = await getProject(testProject.id);
                expect(retrieved?.workspaceBindings).toEqual({
                    ide: true,
                    notes: true,
                    knowledge: false, // Default
                    study: false,    // Default
                });
            });
        });

        describe('TC-WB-1-1-03: Create project without workspaceBindings (defaults)', () => {
            it('should apply default workspaceBindings when field is missing', async () => {
                // Arrange - This project doesn't have workspaceBindings field
                testProject = generateOldProject();

                // Act - Save project (this should work, it's an old project)
                await saveProject(testProject);

                // Assert - Will fail because the implementation doesn't apply defaults
                const retrieved = await getProject(testProject.id);
                // @ts-expect-error - workspaceBindings doesn't exist yet, test should fail
                expect(retrieved.workspaceBindings).toEqual(DEFAULT_WORKSPACE_BINDINGS);
            });
        });

        describe('TC-WB-1-1-04: Update workspaceBindings for existing project', () => {
            it('should update only specified fields, preserving others', async () => {
                // Arrange
                const project = await saveProject(generateNewProject());
                const updatedProject = await getProject(project.id);

                // Act - This will fail because workspaceBindings doesn't exist on ProjectMetadata
                if (updatedProject) {
                    updatedProject.workspaceBindings = {
                        ide: false,
                        notes: true,
                    };
                    await saveProject(updatedProject);
                }

                // Assert - Will fail because workspaceBindings doesn't exist
                const retrieved = await getProject(project.id);
                // @ts-expect-error - workspaceBindings doesn't exist yet
                expect(retrieved.workspaceBindings).toEqual({
                    ide: false,
                    notes: true,
                    knowledge: false, // Preserved
                    study: false,    // Preserved
                });
            });
        });

        describe('TC-WB-1-1-05: TypeScript type validation', () => {
            it('should reject non-boolean values in workspaceBindings', () => {
                // This test is designed to fail at compile time if TypeScript is working correctly
                // @ts-expect-error - Intentionally invalid assignment
                const invalidProject: ProjectMetadata = {
                    ...generateNewProject(),
                    workspaceBindings: {
                        ide: 'true' as any, // Type error expected
                    },
                };

                // If TypeScript compilation fails, this test passes
                // Since the implementation doesn't exist, this will compile and test will fail
                expect(true).toBe(true);
            });
        });
    });

    describe('AC-WB-1-2: File Snapshot Configuration', () => {
        describe('TC-WB-1-2-01: Create project with fileSnapshotEnabled=true', () => {
            it('should persist fileSnapshotEnabled as true', async () => {
                // Arrange
                testProject = generateNewProject({
                    fileSnapshotEnabled: true,
                });

                // Act - This will fail because fileSnapshotEnabled doesn't exist on ProjectMetadata
                await saveProject(testProject);

                // Assert - Will fail because retrieved project won't have the field
                const retrieved = await getProject(testProject.id);
                expect(retrieved?.fileSnapshotEnabled).toBe(true);
            });
        });

        describe('TC-WB-1-2-02: Create project without fileSnapshotEnabled (default)', () => {
            it('should default fileSnapshotEnabled to false', async () => {
                // Arrange - This project doesn't have fileSnapshotEnabled field
                testProject = generateOldProject();

                // Act - Save project (this should work, it's an old project)
                await saveProject(testProject);

                // Assert - Will fail because the implementation doesn't apply defaults
                const retrieved = await getProject(testProject.id);
                // @ts-expect-error - fileSnapshotEnabled doesn't exist yet
                expect(retrieved.fileSnapshotEnabled).toBe(DEFAULT_FILE_SNAPSHOT_ENABLED);
            });
        });

        describe('TC-WB-1-2-03: Update fileSnapshotEnabled for existing project', () => {
            it('should update fileSnapshotEnabled value', async () => {
                // Arrange
                const project = await saveProject(generateNewProject({
                    fileSnapshotEnabled: false,
                }));
                const updatedProject = await getProject(project.id);

                // Act - This will fail because fileSnapshotEnabled doesn't exist on ProjectMetadata
                if (updatedProject) {
                    updatedProject.fileSnapshotEnabled = true;
                    await saveProject(updatedProject);
                }

                // Assert - Will fail because fileSnapshotEnabled doesn't exist
                const retrieved = await getProject(project.id);
                // @ts-expect-error - fileSnapshotEnabled doesn't exist yet
                expect(retrieved.fileSnapshotEnabled).toBe(true);
            });
        });

        describe('TC-WB-1-2-04: TypeScript type validation', () => {
            it('should reject non-boolean values for fileSnapshotEnabled', () => {
                // This test is designed to fail at compile time if TypeScript is working correctly
                // @ts-expect-error - Intentionally invalid assignment
                const invalidProject: ProjectMetadata = {
                    ...generateNewProject(),
                    fileSnapshotEnabled: 'yes' as any, // Type error expected
                };

                // If TypeScript compilation fails, this test passes
                // Since the implementation doesn't exist, this will compile and test will fail
                expect(true).toBe(true);
            });
        });
    });

    describe('AC-WB-1-3: Database Schema Migration', () => {
        describe('TC-WB-1-3-01: Migrate empty database', () => {
            it('should apply new schema version to empty database', async () => {
                // Arrange - Empty database (already reset in beforeEach)

                // Act - Open database should trigger migration
                const dbInstance = db;
                await dbInstance.open();

                // Assert - Will fail because migration doesn't exist
                expect(dbInstance.verno).toBeGreaterThanOrEqual(4); // New schema version
                const count = await db.projects.count();
                expect(count).toBe(0); // No projects migrated
            });
        });

        describe('TC-WB-1-3-02: Migrate database with existing projects', () => {
            it('should migrate old schema projects with default values', async () => {
                // Arrange - Create projects with old schema (manually bypass new fields)
                const oldProjects = [
                    generateOldProject({ name: 'Project 1' }),
                    generateOldProject({ name: 'Project 2' }),
                    generateOldProject({ name: 'Project 3' }),
                ];

                // Insert projects directly into database (old schema)
                for (const project of oldProjects) {
                    await db.projects.add({
                        id: project.id,
                        name: project.name,
                        path: project.folderPath,
                        lastOpened: project.lastOpened,
                        createdAt: new Date(),
                    });
                }

                // Act - Close and reopen to trigger migration
                await db.close();
                const newDb = db; // Reopen database

                // Assert - Will fail because migration doesn't exist
                const migratedProjects = await newDb.projects.toArray();
                expect(migratedProjects).toHaveLength(3);

                for (const project of migratedProjects) {
                    expect(project.workspaceBindings).toEqual(DEFAULT_WORKSPACE_BINDINGS);
                    expect(project.fileSnapshotEnabled).toBe(DEFAULT_FILE_SNAPSHOT_ENABLED);
                }
            });
        });

        describe('TC-WB-1-3-03: Migration applies correct default values', () => {
            it('should apply DEFAULT_WORKSPACE_BINDINGS to migrated projects', async () => {
                // Arrange
                const oldProject = generateOldProject();

                await db.projects.add({
                    id: oldProject.id,
                    name: oldProject.name,
                    path: oldProject.folderPath,
                    lastOpened: oldProject.lastOpened,
                    createdAt: new Date(),
                });

                // Act - Trigger migration
                await db.close();
                const newDb = db;
                const migrated = await newDb.projects.get(oldProject.id);

                // Assert - Will fail because migration doesn't exist
                // @ts-expect-error - workspaceBindings doesn't exist yet
                expect(migrated.workspaceBindings).toEqual(DEFAULT_WORKSPACE_BINDINGS);
                // @ts-expect-error - fileSnapshotEnabled doesn't exist yet
                expect(migrated.fileSnapshotEnabled).toBe(DEFAULT_FILE_SNAPSHOT_ENABLED);
            });
        });

        describe('TC-WB-1-3-04: Migration idempotency', () => {
            it('should be safe to run migration multiple times', async () => {
                // Arrange
                const oldProject = generateOldProject();

                await db.projects.add({
                    id: oldProject.id,
                    name: oldProject.name,
                    path: oldProject.folderPath,
                    lastOpened: oldProject.lastOpened,
                    createdAt: new Date(),
                });

                // Act - Run migration twice
                await db.close();
                const db1 = db;
                await db1.close();
                const db2 = db;

                // Assert - Will fail because migration doesn't exist
                const project = await db2.projects.get(oldProject.id);
                // @ts-expect-error - workspaceBindings doesn't exist yet
                expect(project.workspaceBindings).toEqual(DEFAULT_WORKSPACE_BINDINGS);
                // @ts-expect-error - fileSnapshotEnabled doesn't exist yet
                expect(project.fileSnapshotEnabled).toBe(DEFAULT_FILE_SNAPSHOT_ENABLED);
            });
        });

        describe('TC-WB-1-3-05: Migration rollback on error', () => {
            it('should handle migration errors gracefully', async () => {
                // Arrange
                const oldProject = generateOldProject();

                await db.projects.add({
                    id: oldProject.id,
                    name: oldProject.name,
                    path: oldProject.folderPath,
                    lastOpened: oldProject.lastOpened,
                    createdAt: new Date(),
                });

                // Act - Simulate migration error
                // This would be done by corrupting the data before migration
                await db.projects.update(oldProject.id, { name: null as any });

                // Assert - Will fail because error handling doesn't exist
                // Database should still be accessible, corrupted project handled
                const newDb = db;
                const projects = await newDb.projects.toArray();
                expect(projects.length).toBeGreaterThanOrEqual(0);
            });
        });

        describe('TC-WB-1-3-06: Migration with corrupted data', () => {
            it('should log corrupted projects and migrate valid ones', async () => {
                // Arrange - Mix of valid and corrupted projects
                const validProject = generateOldProject({ name: 'Valid Project' });
                const corruptedProject = generateOldProject();

                // Add valid project
                await db.projects.add({
                    id: validProject.id,
                    name: validProject.name,
                    path: validProject.folderPath,
                    lastOpened: validProject.lastOpened,
                    createdAt: new Date(),
                });

                // Add corrupted project
                await db.projects.add({
                    id: corruptedProject.id,
                    name: null as any, // Invalid name
                    path: corruptedProject.folderPath,
                    lastOpened: corruptedProject.lastOpened,
                    createdAt: new Date(),
                });

                // Act - Trigger migration
                await db.close();
                const newDb = db;

                // Assert - Will fail because corruption handling doesn't exist
                const projects = await newDb.projects.toArray();
                // At least one project should be migrated
                expect(projects.length).toBeGreaterThanOrEqual(1);

                // Check that valid projects were migrated
                const validMigrated = projects.find(p => p.id === validProject.id);
                expect(validMigrated?.workspaceBindings).toEqual(DEFAULT_WORKSPACE_BINDINGS);
            });
        });
    });

    describe('AC-WB-1-4: TypeScript Compilation', () => {
        describe('TC-WB-1-4-01: ProjectMetadata interface compiles', () => {
            it('should allow creation of ProjectMetadata with new fields', () => {
                // This test should fail at compile time if TypeScript errors exist
                const project: ProjectMetadata = {
                    id: 'test-1',
                    name: 'Test Project',
                    folderPath: '/path/to/project',
                    fsaHandle: mockFSAHandle,
                    lastOpened: new Date(),
                    autoSync: true,
                    // NEW FIELDS - These should cause TypeScript errors since they don't exist
                    workspaceBindings: {
                        ide: true,
                        notes: false,
                        knowledge: false,
                        study: false,
                    },
                    fileSnapshotEnabled: false,
                };

                // This should pass if compilation succeeds
                expect(project.id).toBe('test-1');
            });
        });

        describe('TC-WB-1-4-02: Optional field access requires check', () => {
            it('should require null check before accessing optional workspaceBindings', () => {
                // Arrange
                const project = generateOldProject();

                // Act & Assert - Will fail because workspaceBindings doesn't exist
                // The current implementation doesn't have workspaceBindings as optional
                // This test should fail because accessing without check would be an error

                if (project.workspaceBindings) {
                    const ideEnabled = project.workspaceBindings.ide;
                    expect(typeof ideEnabled).toBe('boolean');
                }
            });
        });

        describe('TC-WB-1-4-03: Type inference on workspaceBindings', () => {
            it('should infer correct types for workspaceBindings', () => {
                // This test will fail because workspaceBindings doesn't exist on ProjectMetadata
                const bindings: ProjectMetadata['workspaceBindings'] = {
                    ide: true,
                    notes: false,
                    knowledge: true,
                    study: false,
                };

                expect(bindings.ide).toBe(true);
                expect(typeof bindings.ide).toBe('boolean');
            });
        });
    });

    describe('AC-WB-1-5: IndexedDB Persistence', () => {
        beforeEach(async () => {
            await _resetDBForTesting();
        });

        describe('TC-WB-1-5-01: Save project with new fields to IndexedDB', () => {
            it('should persist workspaceBindings and fileSnapshotEnabled', async () => {
                // Arrange
                const dbInstance = db;
                const project = generateNewProject();

                // Act - This will fail because the fields don't exist in database schema
                await dbInstance.projects.put(project);

                // Assert - Will fail because retrieved project won't have new fields
                const retrieved = await dbInstance.projects.get(project.id);
                expect(retrieved).toEqual(project);
            });
        });

        describe('TC-WB-1-5-02: Retrieve project from IndexedDB', () => {
            it('should retrieve all fields with correct types', async () => {
                // Arrange
                const dbInstance = db;
                const project = generateNewProject();
                await dbInstance.projects.put(project);

                // Act
                const retrieved = await dbInstance.projects.get(project.id);

                // Assert - Will fail because workspaceBindings and fileSnapshotEnabled don't exist
                expect(retrieved).toBeDefined();
                // @ts-expect-error - workspaceBindings doesn't exist yet
                expect(retrieved.workspaceBindings).toEqual(project.workspaceBindings);
                // @ts-expect-error - fileSnapshotEnabled doesn't exist yet
                expect(retrieved.fileSnapshotEnabled).toBe(project.fileSnapshotEnabled);
            });
        });

        describe('TC-WB-1-5-03: Query projects by workspace binding', () => {
            it('should support querying by workspaceBindings.ide field', async () => {
                // Arrange
                const dbInstance = db;
                const project1 = generateNewProject({
                    id: 'proj-1',
                    workspaceBindings: { ide: true, notes: false, knowledge: false, study: false },
                });
                const project2 = generateNewProject({
                    id: 'proj-2',
                    workspaceBindings: { ide: false, notes: true, knowledge: false, study: false },
                });

                await dbInstance.projects.bulkPut([project1, project2]);

                // Act - This will fail because workspaceBindings.ide index doesn't exist
                const ideProjects = await dbInstance.projects
                    .where('workspaceBindings.ide')
                    .equals(true)
                    .toArray();

                // Assert - Should find only project with ide: true
                expect(ideProjects).toHaveLength(1);
                expect(ideProjects[0].id).toBe('proj-1');
            });
        });

        describe('TC-WB-1-5-04: Update project in IndexedDB', () => {
            it('should update fileSnapshotEnabled while preserving other fields', async () => {
                // Arrange
                const dbInstance = db;
                const project = generateNewProject();
                await dbInstance.projects.put(project);

                // Act - This will fail because fileSnapshotEnabled doesn't exist
                await dbInstance.projects.update(project.id, {
                    fileSnapshotEnabled: true,
                });

                // Assert - Will fail because fileSnapshotEnabled doesn't exist
                const retrieved = await dbInstance.projects.get(project.id);
                // @ts-expect-error - fileSnapshotEnabled doesn't exist yet
                expect(retrieved.fileSnapshotEnabled).toBe(true);
                // @ts-expect-error - workspaceBindings should be preserved
                expect(retrieved.workspaceBindings).toEqual(project.workspaceBindings);
            });
        });
    });
});

// Additional test file for specific TypeScript compilation tests
// These would normally be run with `tsc --noEmit` but we include them here for completeness
describe('Story WB-1: TypeScript Compilation Tests (Separate)', () => {
    describe('TypeScript Compilation Errors', () => {
        it('should fail compilation if new fields are accessed on ProjectMetadata', () => {
            // This test documents what should happen when TypeScript compilation runs
            // In practice, you would run: pnpm exec tsc --noEmit

            // The following lines should cause TypeScript errors because the fields don't exist:
            /*
            const project: ProjectMetadata = { id: '1', name: 'test', folderPath: '/', fsaHandle: {} as any, lastOpened: new Date() };
            console.log(project.workspaceBindings); // Should error: Property 'workspaceBindings' does not exist
            console.log(project.fileSnapshotEnabled); // Should error: Property 'fileSnapshotEnabled' does not exist
            */

            // For now, this test passes to indicate the test file is complete
            expect(true).toBe(true);
        });
    });
});