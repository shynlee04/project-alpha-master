/**
 * @fileoverview Project Entity Tests
 * @module core/entities/__tests__
 * @governance ARC-D03: Updated to use workspaceBindings (renamed from bindings)
 */

import { describe, it, expect } from 'vitest';
import { Project, ProjectCreateParams, ProjectUpdateParams } from '../project';

describe('Project Entity', () => {
  describe('Constructor & Validation', () => {
    it('should create a valid project', () => {
      const project = new Project({
        id: 'project-123',
        name: 'Test Project',
        folderPath: '/path/to/project',
        storageType: 'fsa',
        lastOpened: new Date(),
        createdAt: new Date(),
        autoSync: true,
        workspaceBindings: {
          ide: true,
          knowledge: false,
          notes: true,
          study: false,
        },
        tags: [],
      });

      expect(project.id).toBe('project-123');
      expect(project.name).toBe('Test Project');
      expect(project.folderPath).toBe('/path/to/project');
      expect(project.storageType).toBe('fsa');
      expect(project.autoSync).toBe(true);
      expect(project.workspaceBindings).toBeDefined();
      expect(project.tags).toEqual([]);
    });

    it('should support optional fields', () => {
      const project = new Project({
        id: 'project-456',
        name: 'Optional Fields Project',
        folderPath: '/path/to/project',
        storageType: 'indexeddb',
        lastOpened: new Date(),
        createdAt: new Date(),
        autoSync: false,
        workspaceBindings: { ide: true },
        tags: [],
        description: 'A project with optional fields',
        fileSnapshotEnabled: true,
        deleted: false,
        isTemp: true,
        autoCreated: true,
      });

      expect(project.description).toBe('A project with optional fields');
      expect(project.fileSnapshotEnabled).toBe(true);
      expect(project.deleted).toBe(false);
      expect(project.isTemp).toBe(true);
      expect(project.autoCreated).toBe(true);
    });

    it('should support both storage types', () => {
      const fsaProject = new Project({
        id: 'project-fsa',
        name: 'FSA Project',
        folderPath: '/path/to/project',
        storageType: 'fsa',
        lastOpened: new Date(),
        createdAt: new Date(),
        autoSync: true,
        workspaceBindings: { ide: true },
        tags: [],
      });

      const indexedDbProject = new Project({
        id: 'project-idx',
        name: 'IndexedDB Project',
        folderPath: '/path/to/project',
        storageType: 'indexeddb',
        lastOpened: new Date(),
        createdAt: new Date(),
        autoSync: true,
        workspaceBindings: { ide: true },
        tags: [],
      });

      expect(fsaProject.storageType).toBe('fsa');
      expect(indexedDbProject.storageType).toBe('indexeddb');
    });
  });

  describe('ProjectCreateParams Type', () => {
    it('should exclude auto-generated fields', () => {
      const createParams: ProjectCreateParams = {
        name: 'New Project',
        folderPath: '/path/to/new/project',
        storageType: 'fsa',
        autoSync: true,
        workspaceBindings: { ide: true },
        tags: [],
        // Note: id, createdAt, lastOpened are NOT required here
      };

      expect(createParams.name).toBe('New Project');
      expect(createParams.folderPath).toBe('/path/to/new/project');
      // TypeScript should prevent these fields:
      // @ts-expect-error - id should not be in ProjectCreateParams
      expect(createParams.id).toBeUndefined();
    });

    it('should allow all other fields', () => {
      const createParams: ProjectCreateParams = {
        name: 'Full Project',
        folderPath: '/path/to/full/project',
        storageType: 'indexeddb',
        autoSync: false,
        layoutState: {
          panelSizes: [300, 700],
          openFiles: ['index.ts'],
          activeFile: 'index.ts',
        },
        exclusionPatterns: ['node_modules', '.git'],
        workspaceBindings: {
          ide: true,
          knowledge: true,
          notes: true,
          study: true,
        },
        fileSnapshotEnabled: true,
        description: 'A complete project',
        tags: ['typescript', 'web'],
        deleted: false,
        isTemp: false,
        autoCreated: false,
      };

      expect(createParams.layoutState).toBeDefined();
      expect(createParams.exclusionPatterns).toEqual(['node_modules', '.git']);
      expect(createParams.workspaceBindings.ide).toBe(true);
      expect(createParams.workspaceBindings.knowledge).toBe(true);
      expect(createParams.workspaceBindings.notes).toBe(true);
      expect(createParams.workspaceBindings.study).toBe(true);
      expect(createParams.fileSnapshotEnabled).toBe(true);
      expect(createParams.description).toBe('A complete project');
      expect(createParams.tags).toEqual(['typescript', 'web']);
    });
  });

  describe('ProjectUpdateParams Type', () => {
    it('should require id and allow partial updates', () => {
      const updateParams: ProjectUpdateParams = {
        id: 'project-123',
        name: 'Updated Name',
        // Only name is being updated, other fields are optional
      };

      expect(updateParams.id).toBe('project-123');
      expect(updateParams.name).toBe('Updated Name');
    });

    it('should allow updating multiple fields', () => {
      const updateParams: ProjectUpdateParams = {
        id: 'project-456',
        name: 'Updated Project',
        description: 'Updated description',
        tags: ['updated', 'tags'],
        autoSync: false,
        deleted: true,
        deletedAt: new Date(),
      };

      expect(updateParams.id).toBe('project-456');
      expect(updateParams.name).toBe('Updated Project');
      expect(updateParams.description).toBe('Updated description');
      expect(updateParams.tags).toEqual(['updated', 'tags']);
      expect(updateParams.autoSync).toBe(false);
      expect(updateParams.deleted).toBe(true);
      expect(updateParams.deletedAt).toBeDefined();
    });

    it('should allow updating workspace bindings', () => {
      const updateParams: ProjectUpdateParams = {
        id: 'project-789',
        workspaceBindings: {
          ide: true,
          knowledge: true,
          notes: false,
          study: false,
        },
      };

      expect(updateParams.id).toBe('project-789');
      expect(updateParams.workspaceBindings?.ide).toBe(true);
      expect(updateParams.workspaceBindings?.knowledge).toBe(true);
      expect(updateParams.workspaceBindings?.notes).toBe(false);
      expect(updateParams.workspaceBindings?.study).toBe(false);
    });
  });

  describe('Business Rules', () => {
    it('should enforce storageType as union type', () => {
      const validTypes: Array<'indexeddb' | 'fsa'> = ['indexeddb', 'fsa'];

      validTypes.forEach((type) => {
        const project = new Project({
          id: `project-${type}`,
          name: `${type} Project`,
          folderPath: '/path/to/project',
          storageType: type,
          lastOpened: new Date(),
          createdAt: new Date(),
          autoSync: true,
          workspaceBindings: { ide: true },
          tags: [],
        });

        expect(project.storageType).toBe(type);
      });
    });

    it('should support soft delete pattern', () => {
      const activeProject = new Project({
        id: 'project-active',
        name: 'Active Project',
        folderPath: '/path/to/project',
        storageType: 'fsa',
        lastOpened: new Date(),
        createdAt: new Date(),
        autoSync: true,
        workspaceBindings: { ide: true },
        tags: [],
        deleted: false,
      });

      const deletedProject = new Project({
        id: 'project-deleted',
        name: 'Deleted Project',
        folderPath: '/path/to/project',
        storageType: 'fsa',
        lastOpened: new Date(),
        createdAt: new Date(),
        autoSync: true,
        workspaceBindings: { ide: true },
        tags: [],
        deleted: true,
        deletedAt: new Date('2026-01-08'),
      });

      expect(activeProject.deleted).toBe(false);
      expect(activeProject.deletedAt).toBeUndefined();
      expect(deletedProject.deleted).toBe(true);
      expect(deletedProject.deletedAt).toBeDefined();
    });

    it('should support temp project pattern', () => {
      const tempProject = new Project({
        id: 'project-temp',
        name: 'Temp Project',
        folderPath: '/path/to/temp',
        storageType: 'indexeddb',
        lastOpened: new Date(),
        createdAt: new Date(),
        autoSync: false,
        workspaceBindings: { notes: true },
        tags: [],
        isTemp: true,
        autoCreated: true,
      });

      expect(tempProject.isTemp).toBe(true);
      expect(tempProject.autoCreated).toBe(true);
      expect(tempProject.workspaceBindings.notes).toBe(true);
    });
  });
});
