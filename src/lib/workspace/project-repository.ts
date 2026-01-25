/**
 * PROJECT REPOSITORY
 * 
 * Single source of truth for project identity and storage handling.
 * Replaces direct Dexie/Zustand access with explicit state returns.
 * 
 * This resolves Class A bugs (invariant breaks) by:
 * - Validating duplicate projects before creation
 * - Providing explicit recovery states instead of redirects
 * - Ensuring handle and record consistency
 * 
 * Usage:
 *   const result = await ProjectRepository.getOrRecover(projectId);
 *   
 *   if (result.status === 'ok') {
 *     const { project, handle } = result;
 *     // Use project
 *   } else if (result.status === 'needsRegrant') {
 *     // Show recovery UI for result.projectId
 *   } else if (result.status === 'missing') {
 *     // Handle missing project
 *   }
 */

import { db } from '@/infrastructure/persistence/dexie-db';
import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';
import {
  createDiagnosticTrace,
  traceEvent,
  completeTrace,
  traceVerifyDexieRecord,
  traceVerifyHandlePersistence
} from '@/lib/diagnostics';
import type { Project } from '@/infrastructure/persistence/stores/project';
import type { ProjectRecord } from '@/infrastructure/persistence/dexie-db-core-types';

// ============================================================================
// TYPES
// ============================================================================

export type ProjectRepositoryStatus = 
  | 'ok'
  | 'needsRegrant'
  | 'missing'
  | 'corrupt'
  | 'error';

export interface ProjectRepositoryResult {
  status: ProjectRepositoryStatus;
  project?: Project;
  handle?: FileSystemDirectoryHandle;
  errorCode?: string;
  errorMessage?: string;
  traceId?: string;
}

export interface CreateProjectInput {
  name: string;
  storageType: 'fsa' | 'indexeddb';
  fsaHandle?: FileSystemDirectoryHandle;
  workspaceBindings?: Record<string, boolean>;
}

export interface ProjectRepository {
  // Project retrieval with automatic recovery
  getOrRecover(projectId: string): Promise<ProjectRepositoryResult>;
  
  // Project creation with duplicate detection
  create(input: CreateProjectInput): Promise<ProjectRepositoryResult>;
  
  // Duplicate detection
  checkDuplicate(handle: FileSystemDirectoryHandle): Promise<{ isDuplicate: boolean; existingProjectId?: string }>;
  
  // Handle validation
  validateHandle(projectId: string): Promise<{ isValid: boolean; errorCode?: string }>;
  
  // Recovery operations
  markForRegrant(projectId: string): Promise<void>;
  delete(projectId: string): Promise<void>;
}

// ============================================================================
// PROJECT REPOSITORY IMPLEMENTATION
// ============================================================================

class ProjectRepositoryImpl implements ProjectRepository {
  
  /**
   * Get project or attempt automatic recovery
   * Returns explicit states instead of throwing/redirecting
   */
  async getOrRecover(projectId: string): Promise<ProjectRepositoryResult> {
    const trace = createDiagnosticTrace('loadProject', { projectId });
    
    try {
      // Step 1: Verify Dexie record exists
      const dexieResult = await traceVerifyDexieRecord(
        trace.traceId, trace.flow, projectId, 'projects'
      );
      
      if (!dexieResult.ok) {
        if (dexieResult.errorCode === 'DEXIE_RECORD_MISSING') {
          completeTrace(trace.traceId, trace.flow, 'failed');
          return {
            status: 'missing',
            errorCode: 'DEXIE_RECORD_MISSING',
            traceId: trace.traceId
          };
        }
        
        completeTrace(trace.traceId, trace.flow, 'failed');
        return {
          status: 'error',
          errorCode: dexieResult.errorCode,
          traceId: trace.traceId
        };
      }
      
      const project = dexieResult.record as Project;
      
      // Step 2: If FSA project, verify handle
      if (project.storageType === 'fsa') {
        // Check handle persistence
        const persistenceResult = await traceVerifyHandlePersistence(
          trace.traceId, trace.flow, projectId
        );
        
        if (!persistenceResult.ok) {
          completeTrace(trace.traceId, trace.flow, 'failed');
          return {
            status: 'needsRegrant',
            project,
            errorCode: persistenceResult.errorCode,
            traceId: trace.traceId
          };
        }
        
        // Attempt to restore handle
        const restoreResult = await handlePersistenceService.restoreHandle(projectId);
        
        if (!restoreResult.success) {
          completeTrace(trace.traceId, trace.flow, 'failed');
          return {
            status: 'needsRegrant',
            project,
            errorCode: restoreResult.error || 'UNKNOWN',
            traceId: trace.traceId
          };
        }
        
        traceEvent({
          traceId: trace.traceId,
          flow: trace.flow,
          step: 'handleRestored',
          ok: true,
          metadata: { projectId }
        });
        
        completeTrace(trace.traceId, trace.flow, 'success');
        
        return {
          status: 'ok',
          project,
          handle: restoreResult.handle!,
          traceId: trace.traceId
        };
      }
      
      // IndexedDB project - no handle needed
      completeTrace(trace.traceId, trace.flow, 'success');
      
      return {
        status: 'ok',
        project,
        traceId: trace.traceId
      };
      
    } catch (error) {
      traceEvent({
        traceId: trace.traceId,
        flow: trace.flow,
        step: 'unexpectedError',
        ok: false,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      
      completeTrace(trace.traceId, trace.flow, 'failed');
      
      return {
        status: 'error',
        errorCode: 'UNKNOWN',
        errorMessage: error instanceof Error ? error.message : String(error),
        traceId: trace.traceId
      };
    }
  }
  
  /**
   * Create project with duplicate detection
   * Enforces invariant: 1 folder ↔ 1 project
   */
  async create(input: CreateProjectInput): Promise<ProjectRepositoryResult> {
    const trace = createDiagnosticTrace('createProjectFromFolder', {
      name: input.name,
      storageType: input.storageType
    });
    
    try {
      // Step 1: If FSA project, check for duplicates
      let projectId: string;
      
      if (input.storageType === 'fsa' && input.fsaHandle) {
        const duplicateCheck = await this.checkDuplicate(input.fsaHandle);
        
        if (duplicateCheck.isDuplicate) {
          traceEvent({
            traceId: trace.traceId,
            flow: trace.flow,
            step: 'duplicateDetected',
            ok: false,
            errorCode: 'DUPLICATE_PROJECT',
            metadata: { existingProjectId: duplicateCheck.existingProjectId }
          });
          
          completeTrace(trace.traceId, trace.flow, 'failed');
          
          return {
            status: 'error',
            errorCode: 'DUPLICATE_PROJECT',
            errorMessage: `A project for this folder already exists: ${duplicateCheck.existingProjectId}`,
            traceId: trace.traceId
          };
        }
        
        // Generate project ID
        projectId = `${input.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        
        // Step 2: Store handle FIRST (before creating project record)
        traceEvent({
          traceId: trace.traceId,
          flow: trace.flow,
          step: 'persistHandle',
          ok: true,
          metadata: { projectId }
        });
        
        await handlePersistenceService.persistHandle(projectId, input.fsaHandle, 'ide');
        
        // CRITICAL: Verify handle was persisted
        const verifyResult = await traceVerifyHandlePersistence(
          trace.traceId, trace.flow, projectId
        );
        
        if (!verifyResult.ok) {
          completeTrace(trace.traceId, trace.flow, 'failed');
          return {
            status: 'error',
            errorCode: 'FSA_HANDLE_INVALID',
            errorMessage: 'Handle persistence failed',
            traceId: trace.traceId
          };
        }
      } else {
        // IndexedDB project
        projectId = `indexeddb-${Date.now()}`;
      }
      
      // Step 3: Create project record
      const project: ProjectRecord = {
        id: projectId,
        name: input.name,
        folderPath: input.name,
        path: input.name,
        workspaceId: 'ide',
        storageType: input.storageType,
        createdAt: new Date(),
        lastOpened: new Date(),
        workspaceBindings: input.workspaceBindings || { ide: true },
        autoSync: true
      };

      await db.projects.put(project);
      
      traceEvent({
        traceId: trace.traceId,
        flow: trace.flow,
        step: 'projectCreated',
        ok: true,
        metadata: { projectId }
      });

      completeTrace(trace.traceId, trace.flow, 'success');

      return {
        status: 'ok',
        project: project as Project,
        traceId: trace.traceId
      };
      
    } catch (error) {
      traceEvent({
        traceId: trace.traceId,
        flow: trace.flow,
        step: 'createError',
        ok: false,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      
      completeTrace(trace.traceId, trace.flow, 'failed');
      
      return {
        status: 'error',
        errorCode: 'UNKNOWN',
        errorMessage: error instanceof Error ? error.message : String(error),
        traceId: trace.traceId
      };
    }
  }
  
  /**
   * Check if a folder handle already has a project
   * Enforces: 1 folder ↔ 1 project invariant
   */
  async checkDuplicate(handle: FileSystemDirectoryHandle): Promise<{ isDuplicate: boolean; existingProjectId?: string }> {
    // Check by handle name pattern (simplified - in production, store handle ID mapping)
    const allProjects = await db.projects.toArray();
    
    for (const project of allProjects) {
      if (project.storageType === 'fsa' && project.name === handle.name) {
        // Verify the handle is still valid
        try {
          const canRestore = await handlePersistenceService.canSilentRestore(project.id);
          if (canRestore) {
            return { isDuplicate: true, existingProjectId: project.id };
          }
        } catch {
          // Handle invalid, treat as not duplicate
        }
      }
    }
    
    return { isDuplicate: false };
  }
  
  /**
   * Validate handle accessibility
   */
  async validateHandle(projectId: string): Promise<{ isValid: boolean; errorCode?: string }> {
    const project = await db.projects.get(projectId);
    
    if (!project) {
      return { isValid: false, errorCode: 'DEXIE_RECORD_MISSING' };
    }
    
    if (project.storageType !== 'fsa') {
      return { isValid: true };
    }
    
    try {
      const canRestore = await handlePersistenceService.canSilentRestore(projectId);
      
      if (!canRestore) {
        return { isValid: false, errorCode: 'FSA_HANDLE_INVALID' };
      }
      
      // Try to restore
      const restoreResult = await handlePersistenceService.restoreHandle(projectId);
      
      if (!restoreResult.success) {
        return { isValid: false, errorCode: restoreResult.error || 'UNKNOWN' };
      }
      
      return { isValid: true };
      
    } catch (error) {
      return { 
        isValid: false, 
        errorCode: error instanceof Error ? error.name : 'UNKNOWN' 
      };
    }
  }
  
  /**
   * Mark project as needing handle regrant
   */
  async markForRegrant(projectId: string): Promise<void> {
    await handlePersistenceService.updatePermissionStatus(projectId, 'prompt');
  }
  
  /**
   * Delete project and associated handle
   */
  async delete(projectId: string): Promise<void> {
    await Promise.all([
      db.projects.delete(projectId),
      handlePersistenceService.deleteHandle(projectId)
    ]);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const ProjectRepository = new ProjectRepositoryImpl();
