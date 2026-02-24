/**
 * @fileoverview Project Template Types
 * @module lib/templates/template-types
 * @governance S-042
 * @created 2026-01-06T14:30:00+07:00
 *
 * Type definitions for project templates system.
 * Defines template structure, customization options, and application configuration.
 */

// ============================================================================
// Template Categories
// ============================================================================

export type TemplateCategory =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'specialized';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export type TypeScriptVersion = '5.0' | '5.1' | '5.2' | '5.3' | '5.4' | 'none';

export type StylingFramework =
  | 'css'
  | 'scss'
  | 'tailwind'
  | 'styled-components'
  | 'emotion'
  | 'css-in-js';

export type StateManagementFramework =
  | 'none'
  | 'zustand'
  | 'redux'
  | 'pinia'
  | 'vuex'
  | 'mobx';

export type TestingFramework =
  | 'none'
  | 'vitest'
  | 'jest'
  | 'cypress'
  | 'playwright'
  | 'jasmine';

export type BuildTool = 'vite' | 'webpack' | 'rollup' | 'esbuild' | 'tsc';

// ============================================================================
// Template File Structure
// ============================================================================

export interface TemplateFile {
  /** File path relative to project root */
  path: string;
  /** File content (can include template variables) */
  content: string;
  /** File encoding */
  encoding?: 'utf8' | 'binary';
  /** Whether file is executable */
  executable?: boolean;
}

export interface TemplateVariable {
  /** Variable name in template */
  name: string;
  /** Default value */
  default: string;
  /** Variable description */
  description?: string;
  /** Whether variable is required */
  required?: boolean;
}

// ============================================================================
// Template Configuration
// ============================================================================

export interface TemplateConfig {
  /** npm dependencies */
  dependencies: Record<string, string>;
  /** Dev dependencies */
  devDependencies: Record<string, string>;
  /** Template files */
  files: TemplateFile[];
  /** npm scripts */
  scripts: {
    dev: string;
    build: string;
    start?: string;
    test?: string;
    lint?: string;
    format?: string;
    preview?: string;
    android?: string;
    ios?: string;
    client?: string;
    server?: string;
  };
  /** TypeScript configuration */
  tsconfig?: Record<string, any>;
  /** Vite configuration */
  vite?: Record<string, any>;
  /** ESLint configuration */
  eslint?: Record<string, any>;
  /** Prettier configuration */
  prettier?: Record<string, any>;
  /** Tailwind CSS configuration */
  tailwind?: Record<string, any>;
  /** PostCSS configuration */
  postcss?: Record<string, any>;
}

// ============================================================================
// Template Customization Options
// ============================================================================

export interface TemplateCustomizationOption {
  /** Option ID */
  id: string;
  /** Option display name */
  label: string;
  /** Option description */
  description?: string;
  /** Option type */
  type: 'select' | 'boolean' | 'multiselect';
  /** Available choices (for select/multiselect) */
  choices?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  /** Default value */
  default: any;
  /** Whether option is required */
  required?: boolean;
  /** Option category for grouping */
  category?: 'core' | 'tooling' | 'styling' | 'testing';
}

// ============================================================================
// Project Template Definition
// ============================================================================

export interface ProjectTemplate {
  /** Unique template identifier */
  id: string;
  /** Template display name */
  name: string;
  /** Template description */
  description: string;
  /** Template category */
  category: TemplateCategory;
  /** Search/filter tags */
  tags: string[];
  /** Lucide icon name */
  icon: string;
  /** Template version */
  version: string;
  /** Author/creator */
  author?: string;
  /** Template homepage/documentation URL */
  homepage?: string;

  /** Template configuration */
  config: TemplateConfig;

  /** Available customization options */
  customization: TemplateCustomizationOption[];

  /** Template variables for file generation */
  variables?: TemplateVariable[];

  /** Example screenshots/preview */
  preview?: {
    /** Screenshot URL */
    image?: string;
    /** Live demo URL */
    demo?: string;
  };

  /** Template metadata */
  meta?: {
    /** Popularity score (0-100) */
    popularity?: number;
    /** Complexity level (1-5) */
    complexity?: number;
    /** Estimated setup time in minutes */
    setupTime?: number;
    /** Featured template */
    featured?: boolean;
    /** Template is new */
    isNew?: boolean;
    /** Template is beta/experimental */
    beta?: boolean;
  };
}

// ============================================================================
// Template Application Context
// ============================================================================

export interface TemplateApplicationConfig {
  /** Selected template */
  template: ProjectTemplate;
  /** Project name */
  projectName: string;
  /** Project description */
  projectDescription?: string;
  /** Customization choices */
  customizations: Record<string, any>;
  /** Target directory */
  targetDir: string;
  /** Package manager */
  packageManager: PackageManager;
  /** Initialize git repository */
  initGit: boolean;
  /** Create first commit */
  createFirstCommit: boolean;
  /** Installation progress callback */
  onProgress?: (stage: string, progress: number) => void;
}

// ============================================================================
// Template Application Result
// ============================================================================

export interface TemplateApplicationResult {
  /** Success status */
  success: boolean;
  /** Generated project path */
  projectPath: string;
  /** Created files */
  createdFiles: string[];
  /** Installed dependencies */
  installedDependencies: string[];
  /** Git initialized */
  gitInitialized: boolean;
  /** First commit created */
  firstCommitCreated: boolean;
  /** Error message (if failed) */
  error?: string;
  /** Application duration in milliseconds */
  duration: number;
}

// ============================================================================
// Template Filter Options
// ============================================================================

export interface TemplateFilterOptions {
  /** Category filter */
  category?: TemplateCategory | 'all';
  /** Search query */
  search?: string;
  /** Tag filter */
  tags?: string[];
  /** Minimum popularity */
  minPopularity?: number;
  /** Maximum complexity */
  maxComplexity?: number;
  /** Featured only */
  featuredOnly?: boolean;
  /** Beta templates */
  includeBeta?: boolean;
}

// ============================================================================
// Template Statistics
// ============================================================================

export interface TemplateStatistics {
  /** Total number of templates */
  total: number;
  /** Templates by category */
  byCategory: Record<TemplateCategory, number>;
  /** Most popular templates */
  popularTemplates: Array<{
    templateId: string;
    uses: number;
  }>;
  /** Recently added templates */
  recentTemplates: Array<{
    templateId: string;
    addedAt: Date;
  }>;
}
