/**
 * @fileoverview Project Template Engine
 * @module lib/templates/template-engine
 * @governance S-042
 * @created 2026-01-06T15:00:00+07:00
 *
 * Template application engine for file generation,
 * dependency installation, and project setup.
 */

import type {
  ProjectTemplate,
  PackageManager,
} from './template-types';

// ============================================================================
// Template Variable Replacement
// ============================================================================

/**
 * Replace template variables in content
 */
function replaceVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

// ============================================================================
// File System Operations (In-Memory for WebContainer)
// ============================================================================

/**
 * Generate files from template
 */
export function generateTemplateFiles(
  template: ProjectTemplate,
  variables: Record<string, string>
): Array<{ path: string; content: string }> {
  return template.config.files.map((file) => ({
    path: file.path,
    content: replaceVariables(file.content, variables),
  }));
}

/**
 * Generate package.json from template config
 */
export function generatePackageJson(
  template: ProjectTemplate,
  projectName: string,
  _customizations: Record<string, any>
): string {
  const packageJson: any = {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
  };

  // Dependencies
  if (Object.keys(template.config.dependencies).length > 0) {
    packageJson.dependencies = template.config.dependencies;
  }

  // Dev dependencies
  if (Object.keys(template.config.devDependencies).length > 0) {
    packageJson.devDependencies = template.config.devDependencies;
  }

  // Scripts
  if (template.config.scripts) {
    packageJson.scripts = template.config.scripts;
  }

  return JSON.stringify(packageJson, null, 2);
}

// ============================================================================
// Configuration File Generation
// ============================================================================

/**
 * Generate tsconfig.json from template
 */
export function generateTsconfig(
  template: ProjectTemplate,
  typescript: boolean
): string | null {
  if (!typescript) return null;
  if (!template.config.tsconfig) return null;

  return JSON.stringify(template.config.tsconfig, null, 2);
}

/**
 * Generate vite.config.ts from template
 */
export function generateViteConfig(
  template: ProjectTemplate
): string | null {
  if (!template.config.vite) return null;

  const config = template.config.vite;
  return `import { defineConfig } from 'vite';

export default defineConfig(${JSON.stringify(config, null, 2)});`;
}

/**
 * Generate .eslintrc.json from template
 */
export function generateEslintConfig(
  template: ProjectTemplate
): string | null {
  if (!template.config.eslint) return null;

  return JSON.stringify(template.config.eslint, null, 2);
}

/**
 * Generate .prettierrc from template
 */
export function generatePrettierConfig(
  template: ProjectTemplate
): string | null {
  if (!template.config.prettier) return null;

  return JSON.stringify(template.config.prettier, null, 2);
}

/**
 * Generate tailwind.config.js from template
 */
export function generateTailwindConfig(
  template: ProjectTemplate,
  styling: string
): string | null {
  if (styling !== 'tailwind') return null;
  if (!template.config.tailwind) return null;

  return `module.exports = ${JSON.stringify(template.config.tailwind, null, 2)};`;
}

// ============================================================================
// Template Application
// ============================================================================

/**
 * Apply template customizations
 */
function applyCustomizations(
  template: ProjectTemplate,
  _customizations: Record<string, any>
): ProjectTemplate {
  // Create a shallow copy of the template
  const customized = { ...template };

  // Apply customization logic based on options
  // This is a simplified version - in production, you'd have more sophisticated logic

  return customized;
}

/**
 * Generate complete project structure from template
 */
export function generateProjectStructure(
  template: ProjectTemplate,
  projectName: string,
  projectDescription: string | undefined,
  customizations: Record<string, any>
): {
  files: Array<{ path: string; content: string }>;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
} {
  // Apply customizations
  const customizedTemplate = applyCustomizations(template, customizations);

  // Variables for replacement
  const variables: Record<string, string> = {
    projectName,
    projectDescription: projectDescription || '',
    ...customizations,
  };

  // Generate template files
  const templateFiles = generateTemplateFiles(customizedTemplate, variables);

  // Generate package.json
  const packageJsonContent = generatePackageJson(
    customizedTemplate,
    projectName,
    customizations
  );

  const files: Array<{ path: string; content: string }> = [
    { path: 'package.json', content: packageJsonContent },
    ...templateFiles,
  ];

  // Generate TypeScript config if enabled
  const typescript = customizations.typescript !== false;
  if (typescript) {
    const tsconfig = generateTsconfig(customizedTemplate, typescript);
    if (tsconfig) {
      files.push({ path: 'tsconfig.json', content: tsconfig });
    }
  }

  // Generate Vite config if present
  const viteConfig = generateViteConfig(customizedTemplate);
  if (viteConfig) {
    files.push({ path: 'vite.config.ts', content: viteConfig });
  }

  // Generate ESLint config if present
  const eslintConfig = generateEslintConfig(customizedTemplate);
  if (eslintConfig) {
    files.push({ path: '.eslintrc.json', content: eslintConfig });
  }

  // Generate Prettier config if present
  const prettierConfig = generatePrettierConfig(customizedTemplate);
  if (prettierConfig) {
    files.push({ path: '.prettierrc', content: prettierConfig });
  }

  // Generate Tailwind config if styling framework is Tailwind
  const styling = customizations.styling || 'css';
  if (styling === 'tailwind') {
    const tailwindConfig = generateTailwindConfig(customizedTemplate, styling);
    if (tailwindConfig) {
      files.push({ path: 'tailwind.config.js', content: tailwindConfig });
    }

    // Add Tailwind directives to CSS
    const tailwindCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

    files.push({ path: 'src/index.css', content: tailwindCss });
  }

  // Collect dependencies
  const dependencies = Object.keys(customizedTemplate.config.dependencies);
  const devDependencies = Object.keys(customizedTemplate.config.devDependencies);

  return {
    files,
    dependencies,
    devDependencies,
    scripts: customizedTemplate.config.scripts,
  };
}

/**
 * Calculate installation steps for progress tracking
 */
export function calculateInstallationSteps(
  template: ProjectTemplate,
  initGit: boolean,
  createFirstCommit: boolean
): string[] {
  const steps: string[] = [];

  steps.push('Creating project structure');
  steps.push('Writing configuration files');
  steps.push('Generating template files');

  const hasDeps =
    Object.keys(template.config.dependencies).length > 0 ||
    Object.keys(template.config.devDependencies).length > 0;

  if (hasDeps) {
    steps.push('Installing dependencies');
  }

  if (initGit) {
    steps.push('Initializing Git repository');
  }

  if (createFirstCommit) {
    steps.push('Creating initial commit');
  }

  steps.push('Project created successfully');

  return steps;
}

// ============================================================================
// Template Validation
// ============================================================================

/**
 * Validate template configuration
 */
export function validateTemplate(template: ProjectTemplate): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!template.id) {
    errors.push('Template ID is required');
  }

  if (!template.name) {
    errors.push('Template name is required');
  }

  if (!template.description) {
    errors.push('Template description is required');
  }

  if (!template.category) {
    errors.push('Template category is required');
  }

  if (!template.config) {
    errors.push('Template configuration is required');
  }

  // Validate files
  if (template.config.files) {
    for (const file of template.config.files) {
      if (!file.path) {
        errors.push(`File path is required for file: ${file.path || 'unknown'}`);
      }
      if (!file.content) {
        errors.push(`File content is required for: ${file.path}`);
      }
    }
  }

  // Validate scripts
  if (template.config.scripts) {
    if (!template.config.scripts.dev) {
      errors.push('Dev script is required');
    }
    if (!template.config.scripts.build) {
      errors.push('Build script is required');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate customization options
 */
export function validateCustomizations(
  template: ProjectTemplate,
  customizations: Record<string, any>
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const option of template.customization) {
    if (option.required && customizations[option.id] === undefined) {
      errors.push(`Required option "${option.label}" is missing`);
    }

    // Validate select options
    if (
      option.type === 'select' &&
      option.choices &&
      customizations[option.id]
    ) {
      const validChoices = option.choices.map((c) => c.value);
      if (!validChoices.includes(customizations[option.id])) {
        errors.push(
          `Invalid choice for "${option.label}": ${customizations[option.id]}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get template preview summary
 */
export function getTemplateSummary(template: ProjectTemplate): {
  fileCount: number;
  dependencyCount: number;
  devDependencyCount: number;
  hasTypeScript: boolean;
  hasTests: boolean;
  hasLinting: boolean;
  estimatedSetupTime: number;
} {
  return {
    fileCount: template.config.files.length,
    dependencyCount: Object.keys(template.config.dependencies).length,
    devDependencyCount: Object.keys(template.config.devDependencies).length,
    hasTypeScript: template.config.tsconfig !== undefined,
    hasTests: template.config.scripts?.test !== undefined,
    hasLinting: template.config.scripts?.lint !== undefined,
    estimatedSetupTime: template.meta?.setupTime || 5,
  };
}

/**
 * Format package list for display
 */
export function formatPackageList(packages: Record<string, string>): string[] {
  return Object.entries(packages).map(([name, version]) => `${name}@${version}`);
}

/**
 * Get recommended package manager based on template
 */
export function getRecommendedPackageManager(
  template: ProjectTemplate
): PackageManager {
  // Check for monorepo templates that work best with pnpm
  if (template.id === 'monorepo') {
    return 'pnpm';
  }

  // Default to npm
  return 'npm';
}
