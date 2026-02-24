#!/usr/bin/env node
/*
 * Governance Enforcement: Import Path Validator
 *
 * Validates that imports use canonical paths per ADR-024:
 * - Zustand Stores → src/infrastructure/persistence/stores/
 * - Dexie Database → src/infrastructure/persistence/dexie-db.ts
 * - Dexie Helpers → src/infrastructure/persistence/dexie-db-helpers/
 * - Deprecated: src/lib/state/ for stores (use facade with warning)
 * - Deprecated: src/stores/ (MIGRATE IMMEDIATELY)
 *
 * Usage: node .scripts/check-import-paths.js
 * Exit codes: 0 = pass, 1 = violations found
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = dirname(__dirname);

// Canonical import paths per ADR-024
const CANONICAL_PATHS = {
  stores: 'src/infrastructure/persistence/stores',
  dexie: 'src/infrastructure/persistence/dexie-db',
  dexieHelpers: 'src/infrastructure/persistence/dexie-db-helpers',
  dexieStorage: 'src/infrastructure/persistence/dexie-storage',
};

// Deprecated import mappings
const DEPRECATED_IMPORTS = [
  {
    pattern: /from ['"]@\/stores\//,
    canonical: '@/infrastructure/persistence/stores/',
    severity: 'error',
    message: 'MIGRATE: src/stores is deprecated, use infrastructure/persistence/stores',
  },
  {
    pattern: /from ['"]@\/lib\/state\/(agents-store|provider-store|rag-store|conversation-store|ide-store|knowledge-store|canvas-store|quiz-store|flashcard-store|tool-permission-store|workspace-.*-store)/,
    canonical: '@/infrastructure/persistence/stores/',
    severity: 'warning',
    message: 'Use canonical infrastructure path for stores',
  },
  {
    pattern: /from ['"]@\/lib\/state\/dexie-db['"]/,
    canonical: '@/infrastructure/persistence/dexie-db',
    severity: 'warning',
    message: 'Use canonical dexie-db path from infrastructure',
  },
  {
    pattern: /from ['"]@\/lib\/workspace\/(conversation-store|threads-store|project-store|snapshot-store|ide-state-store)/,
    canonical: '@/infrastructure/persistence/stores/',
    severity: 'error',
    message: 'MIGRATE: lib/workspace stores moved to infrastructure',
  },
];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

/**
 * Recursively finds all TypeScript files
 */
function findSourceFiles(dir, exclude = []) {
  const files = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip excluded directories
      if (entry.isDirectory()) {
        if (exclude.some(ex => fullPath.includes(ex))) {
          continue;
        }
        files.push(...findSourceFiles(fullPath, exclude));
        continue;
      }

      // Include TypeScript files
      if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        const relativePath = fullPath.replace(PROJECT_ROOT + '/', '');
        files.push(relativePath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return files;
}

/**
 * Extracts import statements from file content
 */
function extractImports(content) {
  const imports = [];
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      statement: match[0],
      path: match[1],
      position: match.index,
    });
  }

  return imports;
}

/**
 * Validates a single import path
 */
function validateImport(importInfo, filePath) {
  const violations = [];

  for (const deprecated of DEPRECATED_IMPORTS) {
    if (deprecated.pattern.test(importInfo.statement)) {
      violations.push({
        file: filePath,
        import: importInfo.path,
        severity: deprecated.severity,
        message: deprecated.message,
        canonical: deprecated.canonical,
        statement: importInfo.statement.substring(0, 100), // Truncate for display
      });
    }
  }

  return violations;
}

/**
 * Main validation function
 */
function validateImportPaths() {
  log(colors.blue, '\n🔍 Checking import paths for canonical compliance...\n');

  const sourceFiles = findSourceFiles(join(PROJECT_ROOT, 'src'), [
    'node_modules',
    'dist',
    '__tests__',
    '.test.',
    '.spec.',
  ]);

  let errors = [];
  let warnings = [];

  for (const file of sourceFiles) {
    try {
      const content = readFileSync(join(PROJECT_ROOT, file), 'utf-8');
      const imports = extractImports(content);

      for (const imp of imports) {
        const violations = validateImport(imp, file);
        for (const v of violations) {
          if (v.severity === 'error') {
            errors.push(v);
          } else {
            warnings.push(v);
          }
        }
      }
    } catch (error) {
      // Skip files we can't read
    }
  }

  // Report results
  if (errors.length === 0 && warnings.length === 0) {
    log(colors.green, `✅ All imports use canonical paths (${sourceFiles.length} files checked)\n`);
    return 0;
  }

  if (warnings.length > 0) {
    log(colors.yellow, `\n⚠️  ${warnings.length} non-canonical import(s) (should fix):\n`);

    for (const w of warnings.slice(0, 10)) {
      log(
        colors.yellow,
        `  ${w.file}\n` +
        `    Current: ${w.import}\n` +
        `    Preferred: ${w.canonical}\n`
      );
    }

    if (warnings.length > 10) {
      log(colors.yellow, `  ... and ${warnings.length - 10} more\n`);
    }
  }

  if (errors.length > 0) {
    log(colors.red, `\n❌ ${errors.length} deprecated import violation(s) (MUST FIX):\n`);

    for (const e of errors.slice(0, 10)) {
      log(
        colors.red,
        `  ${e.file}\n` +
        `    Import: ${e.import}\n` +
        `    Action: ${e.message}\n` +
        `    Use: ${e.canonical}\n`
      );
    }

    if (errors.length > 10) {
      log(colors.red, `  ... and ${errors.length - 10} more\n`);
    }

    log(colors.bold, `\n💡 Fix: Update imports to use canonical paths from infrastructure/persistence/\n`);
    return 1;
  }

  // Warnings only - pass but notify
  log(colors.yellow, `\n⚠️  Warnings found but no errors. Consider fixing for consistency.\n`);
  return 0;
}

// Run validation
const exitCode = validateImportPaths();
process.exit(exitCode);
