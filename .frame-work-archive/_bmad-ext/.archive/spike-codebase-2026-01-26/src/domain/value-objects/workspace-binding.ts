/**
 * @fileoverview Workspace Binding Value Object
 * @module domain/value-objects/workspace-binding
 * @governance Architectural Specification v3.0
 *
 * Immutable value object representing agent availability in a workspace.
 */

import { WorkspaceType } from './workspace-type';

/**
 * Workspace binding properties
 */
export interface WorkspaceBindingProps {
  workspaceType: WorkspaceType;
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;
}

/**
 * Workspace Binding Value Object
 *
 * Represents agent configuration for a specific workspace type.
 * This value object is immutable - once created, it cannot be modified.
 * Use the `with*` methods to create new instances with updated values.
 *
 * @example
 * ```ts
 * const binding = new WorkspaceBinding({
 *   workspaceType: 'ide',
 *   isAvailable: true,
 *   uiVariant: 'full',
 *   isDefault: true
 * });
 *
 * // Create updated version
 * const updated = binding.withAvailability(false);
 * ```
 */
export class WorkspaceBinding {
  readonly workspaceType: WorkspaceType;
  readonly isAvailable: boolean;
  readonly uiVariant: 'full' | 'compact' | 'minimal';
  readonly isDefault: boolean;

  constructor(props: WorkspaceBindingProps) {
    this.workspaceType = props.workspaceType;
    this.isAvailable = props.isAvailable;
    this.uiVariant = props.uiVariant;
    this.isDefault = props.isDefault;

    // Make instance immutable
    Object.freeze(this);
  }

  /**
   * Create new binding with updated availability
   *
   * @param isAvailable - New availability status
   * @returns New WorkspaceBinding instance
   */
  withAvailability(isAvailable: boolean): WorkspaceBinding {
    return new WorkspaceBinding({
      ...this,
      isAvailable
    });
  }

  /**
   * Create new binding with updated UI variant
   *
   * @param uiVariant - New UI variant
   * @returns New WorkspaceBinding instance
   */
  withUIVariant(uiVariant: 'full' | 'compact' | 'minimal'): WorkspaceBinding {
    return new WorkspaceBinding({
      ...this,
      uiVariant
    });
  }

  /**
   * Create new binding with updated default status
   *
   * @param isDefault - New default status
   * @returns New WorkspaceBinding instance
   */
  withDefault(isDefault: boolean): WorkspaceBinding {
    return new WorkspaceBinding({
      ...this,
      isDefault
    });
  }

  /**
   * Check equality with another binding
   *
   * @param other - Another workspace binding
   * @returns True if bindings are equal
   */
  equals(other: WorkspaceBinding): boolean {
    return (
      this.workspaceType === other.workspaceType &&
      this.isAvailable === other.isAvailable &&
      this.uiVariant === other.uiVariant &&
      this.isDefault === other.isDefault
    );
  }

  /**
   * Convert to plain object
   *
   * @returns Plain object representation
   */
  toJSON(): WorkspaceBindingProps {
    return {
      workspaceType: this.workspaceType,
      isAvailable: this.isAvailable,
      uiVariant: this.uiVariant,
      isDefault: this.isDefault
    };
  }

  /**
   * Create from plain object
   *
   * @param props - Plain object properties
   * @returns New WorkspaceBinding instance
   */
  static fromJSON(props: WorkspaceBindingProps): WorkspaceBinding {
    return new WorkspaceBinding(props);
  }
}
