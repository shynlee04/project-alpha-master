/**
 * @fileoverview Test Utilities and Data Generators for Story WB-1
 * @governance EPIC-WB-1
 */

import { ProjectMetadata } from '../project-store';
import { mockFSAHandle } from './mocks';

/**
 * Generate a project with old schema (for migration testing)
 * These projects lack the new fields we're adding
 */
export function generateOldProject(override?: Partial<ProjectMetadata>): ProjectMetadata {
    return {
        id: crypto.randomUUID(),
        name: 'Old Project',
        folderPath: '/old/path',
        fsaHandle: mockFSAHandle,
        lastOpened: new Date(),
        autoSync: true,
        ...override,
    };
}

/**
 * Generate a project with new schema (includes new fields)
 * This represents what the updated schema should look like
 */
export function generateNewProject(override?: Partial<ProjectMetadata>): ProjectMetadata {
    return {
        id: crypto.randomUUID(),
        name: 'New Project',
        folderPath: '/new/path',
        fsaHandle: mockFSAHandle,
        lastOpened: new Date(),
        autoSync: true,
        // NEW FIELDS - These should fail tests since they don't exist yet
        workspaceBindings: {
            ide: true,
            notes: false,
            knowledge: false,
            study: false,
        },
        fileSnapshotEnabled: false,
        ...override,
    };
}

/**
 * Generate a project with empty workspaceBindings
 */
export function generateProjectWithEmptyWorkspaceBindings(override?: Partial<ProjectMetadata>): ProjectMetadata {
    return {
        id: crypto.randomUUID(),
        name: 'Empty Bindings Project',
        folderPath: '/empty/bindings/path',
        fsaHandle: mockFSAHandle,
        lastOpened: new Date(),
        autoSync: true,
        workspaceBindings: {}, // Empty object
        ...override,
    };
}

/**
 * Generate a project with partial workspaceBindings
 */
export function generateProjectWithPartialWorkspaceBindings(override?: Partial<ProjectMetadata>): ProjectMetadata {
    return {
        id: crypto.randomUUID(),
        name: 'Partial Bindings Project',
        folderPath: '/partial/bindings/path',
        fsaHandle: mockFSAHandle,
        lastOpened: new Date(),
        autoSync: true,
        workspaceBindings: {
            ide: true,
            notes: true,
            // Missing knowledge and study
        },
        ...override,
    };
}

/**
 * Generate multiple old projects for migration testing
 */
export function generateOldProjects(count: number): ProjectMetadata[] {
    return Array.from({ length: count }, (_, i) =>
        generateOldProject({
            name: `Old Project ${i + 1}`,
            folderPath: `/old/path/project-${i + 1}`,
        })
    );
}

/**
 * Default workspace bindings values (what should be applied during migration)
 */
export const DEFAULT_WORKSPACE_BINDINGS = {
    ide: true,
    notes: false,
    knowledge: false,
    study: false,
} as const;

/**
 * Default file snapshot setting
 */
export const DEFAULT_FILE_SNAPSHOT_ENABLED = false;

/**
 * Create a test database with old schema projects
 */
export async function createDatabaseWithOldProjects(projectCount: number = 5): Promise<ProjectMetadata[]> {
    const projects = generateOldProjects(projectCount);
    // In actual tests, this would involve inserting into the database directly
    return projects;
}