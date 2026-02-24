/**
 * @fileoverview Permission Profiles for Test Spike Harness
 * @module harness/permission-profiles
 *
 * Defines permission profiles with different access levels and path restrictions.
 *
 * ANNOTATION: 2026-01-11 - Implementation for test spike harness - Task requirements
 */

/**
 * Operation type enum
 */
export type OperationType = 
  | 'read'
  | 'write'
  | 'delete'
  | 'execute'
  | 'list'
  | 'search'
  | 'create'
  | 'modify'
  | 'config'
  | 'network';

/**
 * Permission profile types
 */
export type PermissionProfileType = 
  | 'read-only'
  | 'write-only'
  | 'full-access'
  | 'path-restricted'
  | 'minimal'
  | 'custom';

/**
 * Path restriction configuration
 */
export interface PathRestriction {
  allowedPaths: string[];
  deniedPaths: string[];
  maxDepth?: number;
  allowWildcards?: boolean;
}

/**
 * Permission profile configuration
 */
export interface PermissionProfileConfig {
  name: string;
  type: PermissionProfileType;
  description: string;
  allowedOperations: OperationType[];
  deniedOperations: OperationType[];
  pathRestrictions?: PathRestriction;
  yoloMode?: boolean;
  timeout?: number;
  maxFileSize?: number;
  enabled: boolean;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  granted: boolean;
  reason: string;
  profile: string;
  operation: string;
  path?: string;
}

/**
 * Permission enforcer class
 */
export class PermissionEnforcer {
  private profiles: Map<string, PermissionProfile> = new Map();
  private activeProfile: PermissionProfile | null = null;

  constructor() {
    this.loadDefaultProfiles();
  }

  /**
   * Load default permission profiles
   */
  private loadDefaultProfiles(): void {
    const profiles: PermissionProfile[] = [
      createReadOnlyProfile(),
      createWriteOnlyProfile(),
      createFullAccessProfile(),
      createPathRestrictedProfile(),
      createMinimalProfile(),
    ];

    profiles.forEach(profile => {
      this.profiles.set(profile.name, profile);
    });
  }

  /**
   * Register a custom profile
   */
  registerProfile(profile: PermissionProfile): void {
    this.profiles.set(profile.name, profile);
  }

  /**
   * Set the active profile
   */
  setActiveProfile(name: string): boolean {
    const profile = this.profiles.get(name);
    if (profile && profile.enabled) {
      this.activeProfile = profile;
      return true;
    }
    return false;
  }

  /**
   * Get active profile
   */
  getActiveProfile(): PermissionProfile | null {
    return this.activeProfile;
  }

  /**
   * Check if read operation is allowed
   */
  canRead(path: string): PermissionCheckResult {
    if (!this.activeProfile) {
      return {
        granted: false,
        reason: 'No active permission profile',
        profile: 'none',
        operation: 'read',
        path,
      };
    }

    // Check YOLO mode
    if (this.activeProfile.yoloMode) {
      return {
        granted: true,
        reason: 'YOLO mode enabled - all operations allowed',
        profile: this.activeProfile.name,
        operation: 'read',
        path,
      };
    }

    // Check if read is in allowed operations
    if (!this.activeProfile.allowedOperations.includes('read')) {
      return {
        granted: false,
        reason: 'read operation not allowed in this profile',
        profile: this.activeProfile.name,
        operation: 'read',
        path,
      };
    }

    // Check if read is explicitly denied
    if (this.activeProfile.deniedOperations.includes('read')) {
      return {
        granted: false,
        reason: 'read operation explicitly denied',
        profile: this.activeProfile.name,
        operation: 'read',
        path,
      };
    }

    // Check path restrictions
    if (this.activeProfile.pathRestrictions) {
      const pathResult = this.checkPathRestriction(path, 'read');
      if (!pathResult.granted) {
        return pathResult;
      }
    }

    return {
      granted: true,
      reason: 'read operation allowed',
      profile: this.activeProfile.name,
      operation: 'read',
      path,
    };
  }

  /**
   * Check if write operation is allowed
   */
  canWrite(path: string): PermissionCheckResult {
    if (!this.activeProfile) {
      return {
        granted: false,
        reason: 'No active permission profile',
        profile: 'none',
        operation: 'write',
        path,
      };
    }

    // Check YOLO mode
    if (this.activeProfile.yoloMode) {
      return {
        granted: true,
        reason: 'YOLO mode enabled - all operations allowed',
        profile: this.activeProfile.name,
        operation: 'write',
        path,
      };
    }

    // Check if write is in allowed operations
    if (!this.activeProfile.allowedOperations.includes('write')) {
      return {
        granted: false,
        reason: 'write operation not allowed in this profile',
        profile: this.activeProfile.name,
        operation: 'write',
        path,
      };
    }

    // Check if write is explicitly denied
    if (this.activeProfile.deniedOperations.includes('write')) {
      return {
        granted: false,
        reason: 'write operation explicitly denied',
        profile: this.activeProfile.name,
        operation: 'write',
        path,
      };
    }

    // Check path restrictions
    if (this.activeProfile.pathRestrictions) {
      const pathResult = this.checkPathRestriction(path, 'write');
      if (!pathResult.granted) {
        return pathResult;
      }
    }

    return {
      granted: true,
      reason: 'write operation allowed',
      profile: this.activeProfile.name,
      operation: 'write',
      path,
    };
  }

  /**
   * Check if execute operation is allowed
   */
  canExecute(tool: string): PermissionCheckResult {
    if (!this.activeProfile) {
      return {
        granted: false,
        reason: 'No active permission profile',
        profile: 'none',
        operation: 'execute',
        path: tool,
      };
    }

    // Check YOLO mode
    if (this.activeProfile.yoloMode) {
      return {
        granted: true,
        reason: 'YOLO mode enabled - all operations allowed',
        profile: this.activeProfile.name,
        operation: 'execute',
        path: tool,
      };
    }

    // Check if execute is in allowed operations
    if (!this.activeProfile.allowedOperations.includes('execute')) {
      return {
        granted: false,
        reason: 'execute operation not allowed in this profile',
        profile: this.activeProfile.name,
        operation: 'execute',
        path: tool,
      };
    }

    return {
      granted: true,
      reason: 'execute operation allowed',
      profile: this.activeProfile.name,
      operation: 'execute',
      path: tool,
    };
  }

  /**
   * Check path restrictions
   */
  private checkPathRestriction(path: string, operation: string): PermissionCheckResult {
    if (!this.activeProfile?.pathRestrictions) {
      return {
        granted: true,
        reason: 'No path restrictions',
        profile: this.activeProfile?.name || 'none',
        operation,
        path,
      };
    }

    const restrictions = this.activeProfile.pathRestrictions;

    // Check if path is denied
    for (const deniedPath of restrictions.deniedPaths) {
      if (this.pathMatches(path, deniedPath)) {
        return {
          granted: false,
          reason: `Path matches denied pattern: ${deniedPath}`,
          profile: this.activeProfile.name,
          operation,
          path,
        };
      }
    }

    // Check if path is allowed (if allowed paths are specified)
    if (restrictions.allowedPaths.length > 0) {
      let isAllowed = false;
      for (const allowedPath of restrictions.allowedPaths) {
        if (this.pathMatches(path, allowedPath)) {
          isAllowed = true;
          break;
        }
      }

      if (!isAllowed) {
        return {
          granted: false,
          reason: `Path does not match any allowed pattern`,
          profile: this.activeProfile.name,
          operation,
          path,
        };
      }
    }

    // Check max depth
    if (restrictions.maxDepth) {
      const depth = path.split('/').filter(Boolean).length;
      if (depth > restrictions.maxDepth) {
        return {
          granted: false,
          reason: `Path depth (${depth}) exceeds maximum (${restrictions.maxDepth})`,
          profile: this.activeProfile.name,
          operation,
          path,
        };
      }
    }

    return {
      granted: true,
      reason: 'Path restrictions passed',
      profile: this.activeProfile.name,
      operation,
      path,
    };
  }

  /**
   * Check if a path matches a pattern
   */
  private pathMatches(path: string, pattern: string): boolean {
    if (pattern === path) return true;
    if (pattern.endsWith('**')) {
      const base = pattern.slice(0, -2);
      return path.startsWith(base);
    }
    if (pattern.endsWith('*')) {
      const base = pattern.slice(0, -1);
      return path.startsWith(base);
    }
    return false;
  }

  /**
   * Check any permission
   */
  checkPermission(operation: string, params?: Record<string, unknown>): PermissionCheckResult {
    const path = params?.path as string | undefined;
    
    switch (operation) {
      case 'read':
        return this.canRead(path || '');
      case 'write':
        return this.canWrite(path || '');
      case 'execute':
        return this.canExecute(path || '');
      case 'delete':
        return this.canWrite(path || ''); // Delete uses write permission
      case 'list':
        return this.canRead(path || '');
      default:
        return {
          granted: this.activeProfile?.yoloMode ?? false,
          reason: `Unknown operation: ${operation}`,
          profile: this.activeProfile?.name || 'none',
          operation,
          path,
        };
    }
  }

  /**
   * Get all available profiles
   */
  getProfiles(): PermissionProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Get profile by name
   */
  getProfile(name: string): PermissionProfile | undefined {
    return this.profiles.get(name);
  }
}

/**
 * Permission profile class
 */
export class PermissionProfile {
  name: string;
  type: PermissionProfileType;
  description: string;
  allowedOperations: OperationType[];
  deniedOperations: OperationType[];
  pathRestrictions?: PathRestriction;
  yoloMode: boolean;
  timeout?: number;
  maxFileSize?: number;
  enabled: boolean;

  constructor(config: PermissionProfileConfig) {
    this.name = config.name;
    this.type = config.type;
    this.description = config.description;
    this.allowedOperations = config.allowedOperations;
    this.deniedOperations = config.deniedOperations;
    this.pathRestrictions = config.pathRestrictions;
    this.yoloMode = config.yoloMode ?? false;
    this.timeout = config.timeout;
    this.maxFileSize = config.maxFileSize;
    this.enabled = config.enabled;
  }

  /**
   * Check if an operation is allowed
   */
  allows(operation: OperationType): boolean {
    if (this.yoloMode) return true;
    return this.allowedOperations.includes(operation) && 
           !this.deniedOperations.includes(operation);
  }

  /**
   * Check if a path is accessible
   */
  allowsPath(path: string): boolean {
    if (!this.pathRestrictions) return true;
    
    // Check denied paths
    for (const denied of this.pathRestrictions.deniedPaths) {
      if (path.startsWith(denied)) return false;
    }

    // Check allowed paths
    if (this.pathRestrictions.allowedPaths.length > 0) {
      for (const allowed of this.pathRestrictions.allowedPaths) {
        if (path.startsWith(allowed)) return true;
      }
      return false;
    }

    return true;
  }
}

/**
 * Create read-only profile
 */
function createReadOnlyProfile(): PermissionProfile {
  return new PermissionProfile({
    name: 'read-only',
    type: 'read-only',
    description: 'Read-only access to safe locations. No modifications allowed.',
    allowedOperations: ['read', 'list', 'search'],
    deniedOperations: ['write', 'delete', 'create', 'modify', 'execute', 'config'],
    enabled: true,
  });
}

/**
 * Create write-only profile
 */
function createWriteOnlyProfile(): PermissionProfile {
  return new PermissionProfile({
    name: 'write-only',
    type: 'write-only',
    description: 'Write-only access for creating and modifying content.',
    allowedOperations: ['write', 'create', 'modify', 'delete'],
    deniedOperations: ['read', 'execute', 'config', 'list', 'search'],
    pathRestrictions: {
      allowedPaths: ['/tmp/', '/test-output/'],
      deniedPaths: ['/etc/', '/root/', '/home/'],
    },
    enabled: true,
  });
}

/**
 * Create full-access profile
 */
function createFullAccessProfile(): PermissionProfile {
  return new PermissionProfile({
    name: 'full-access',
    type: 'full-access',
    description: 'Full access to all operations within test boundaries.',
    allowedOperations: ['read', 'write', 'delete', 'execute', 'list', 'search', 'create', 'modify', 'config'],
    deniedOperations: [],
    pathRestrictions: {
      allowedPaths: ['/tmp/', '/test-output/', '/workspace/'],
      deniedPaths: ['/etc/', '/root/', '/home/', '/system/'],
    },
    enabled: true,
  });
}

/**
 * Create path-restricted profile
 */
function createPathRestrictedProfile(): PermissionProfile {
  return new PermissionProfile({
    name: 'path-restricted',
    type: 'path-restricted',
    description: 'Access restricted to specific paths with granular controls.',
    allowedOperations: ['read', 'write', 'list'],
    deniedOperations: ['execute', 'config'],
    pathRestrictions: {
      allowedPaths: ['/tmp/test-spike/', '/test-output/'],
      deniedPaths: ['/tmp/prod/', '/tmp/shared/'],
      maxDepth: 5,
    },
    enabled: true,
  });
}

/**
 * Create minimal profile
 */
function createMinimalProfile(): PermissionProfile {
  return new PermissionProfile({
    name: 'minimal',
    type: 'minimal',
    description: 'Minimal permissions for safe testing.',
    allowedOperations: ['read'],
    deniedOperations: ['write', 'execute', 'delete', 'create', 'modify', 'config'],
    pathRestrictions: {
      allowedPaths: ['/tmp/test-spike/readonly/'],
      deniedPaths: [],
    },
    enabled: true,
  });
}

/**
 * Load all permission profiles
 */
export function loadPermissionProfiles(): Map<string, PermissionProfile> {
  const enforcer = new PermissionEnforcer();
  const profiles = new Map<string, PermissionProfile>();
  
  enforcer.getProfiles().forEach(profile => {
    profiles.set(profile.name, profile);
  });

  return profiles;
}

/**
 * Create a custom profile
 */
export function createCustomProfile(
  name: string,
  config: Partial<PermissionProfileConfig>
): PermissionProfile {
  return new PermissionProfile({
    name,
    type: 'custom',
    description: config.description || `Custom profile: ${name}`,
    allowedOperations: config.allowedOperations || [],
    deniedOperations: config.deniedOperations || [],
    pathRestrictions: config.pathRestrictions,
    yoloMode: config.yoloMode,
    timeout: config.timeout,
    maxFileSize: config.maxFileSize,
    enabled: config.enabled ?? true,
  });
}
