/**
 * @fileoverview Workspace Type Value Object
 * @module domain/value-objects/workspace-type
 * @governance Architectural Specification v3.0
 *
 * Workspace type enumeration and utilities.
 */

/**
 * Workspace Type Enumeration
 *
 * Represents the four workspace types in the application:
 * - ide: Code development workspace
 * - knowledge: Knowledge synthesis workspace
 * - study: Study and flashcard workspace
 * - notes: Note-taking workspace
 *
 * @example
 * ```ts
 * function getWorkspaceLabel(type: WorkspaceType): string {
 *   const labels = {
 *     ide: 'IDE',
 *     knowledge: 'Knowledge',
 *     study: 'Study',
 *     notes: 'Notes'
 *   };
 *   return labels[type];
 * }
 * ```
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * Workspace type utilities
 */
export class WorkspaceTypeUtils {
  /**
   * Get all workspace types
   *
   * @returns Array of all workspace types
   */
  static all(): WorkspaceType[] {
    return ['ide', 'knowledge', 'study', 'notes'];
  }

  /**
   * Validate workspace type
   *
   * @param value - Value to validate
   * @returns True if valid workspace type
   */
  static isValid(value: string): value is WorkspaceType {
    return ['ide', 'knowledge', 'study', 'notes'].includes(value);
  }

  /**
   * Get workspace label for display
   *
   * @param workspaceType - Workspace type
   * @returns Human-readable label
   */
  static getLabel(workspaceType: WorkspaceType): string {
    const labels: Record<WorkspaceType, string> = {
      ide: 'IDE',
      knowledge: 'Knowledge',
      study: 'Study',
      notes: 'Notes'
    };
    return labels[workspaceType];
  }

  /**
   * Get workspace description
   *
   * @param workspaceType - Workspace type
   * @returns Workspace description
   */
  static getDescription(workspaceType: WorkspaceType): string {
    const descriptions: Record<WorkspaceType, string> = {
      ide: 'Code development and debugging workspace',
      knowledge: 'Knowledge synthesis and RAG workspace',
      study: 'Study materials and flashcard workspace',
      notes: 'Note-taking and documentation workspace'
    };
    return descriptions[workspaceType];
  }
}
