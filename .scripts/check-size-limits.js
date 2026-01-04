#!/usr/bin/env node
/*
 * Governance Enforcement: File Size Limit Checker
 *
 * Validates that source files comply with size limits:
 * - Store files: max 120 lines (src/infrastructure/persistence/stores/)
 * - Components: max 300 lines (src/presentation/components/)
 * - Hooks: max 150 lines (src/hooks/)
 * - Utilities: max 200 lines (src/lib/utils/)
 *
 * Usage: node .scripts/check-size-limits.js
 * Exit codes: 0 = pass, 1 = violations found
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = dirname(__dirname);

// Configuration: directories to check and their limits
const LIMITS = [
  {
    dir: 'src/infrastructure/persistence/stores',
    pattern: /\.ts$/,
    maxLines: 120,
    name: 'Store files',
    exclude: ['__tests__', '.test.', '.spec.'],
  },
  {
    dir: 'src/presentation/components',
    pattern: /\.tsx$/,
    maxLines: 300,
    name: 'Components',
    exclude: ['__tests__', '.test.', '.spec.'],
  },
  {
    dir: 'src/hooks',
    pattern: /\.ts$/,
    maxLines: 150,
    name: 'Hooks',
    exclude: ['__tests__', '.test.', '.spec.'],
  },
  {
    dir: 'src/lib/utils',
    pattern: /\.ts$/,
    maxLines: 200,
    name: 'Utilities',
    exclude: ['__tests__', '.test.', '.spec.'],
  },
];

// ANSI color codes for terminal output
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
 * Recursively finds files in a directory matching pattern
 */
function findFiles(targetDir, filePattern, exclude = []) {
  const files = [];
  const fullPath = join(PROJECT_ROOT, targetDir);

  try {
    const entries = readdirSync(fullPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(fullPath, entry.name);

      // Skip excluded paths
      if (exclude.some(ex => entryPath.includes(ex))) {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...findFiles(targetDir + '/' + entry.name, filePattern, exclude));
        continue;
      }

      if (entry.isFile() && filePattern.test(entry.name)) {
        const relativePath = entryPath.replace(PROJECT_ROOT + '/', '');
        files.push(relativePath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }

  return files;
}

/**
 * Counts lines in a file, excluding empty lines and comments
 */
function countLines(filePath) {
  const content = readFileSync(join(PROJECT_ROOT, filePath), 'utf-8');
  const lines = content.split('\n');

  let codeLines = 0;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track block comments
    if (trimmed.startsWith('/*')) {
      inBlockComment = true;
    }
    if (trimmed.endsWith('*/')) {
      inBlockComment = false;
      continue;
    }
    if (inBlockComment) {
      continue;
    }

    // Skip empty lines and single-line comments
    if (trimmed === '' || trimmed.startsWith('//')) {
      continue;
    }

    codeLines++;
  }

  return { codeLines, totalLines: lines.length };
}

/**
 * Main validation function
 */
function validateSizeLimits() {
  log(colors.blue, '\n🔍 Checking file size limits...\n');

  let violations = [];
  let totalFiles = 0;

  for (const { dir, pattern, maxLines, name, exclude } of LIMITS) {
    const files = findFiles(dir, pattern, exclude);

    for (const file of files) {
      totalFiles++;
      const { codeLines, totalLines } = countLines(file);

      if (codeLines > maxLines) {
        const excess = codeLines - maxLines;
        const excessPercent = Math.round((excess / maxLines) * 100);

        violations.push({
          file,
          type: name,
          codeLines,
          totalLines,
          maxLines,
          excess,
          excessPercent,
        });
      }
    }
  }

  // Report results
  if (violations.length === 0) {
    log(colors.green, `✅ All ${totalFiles} files within size limits\n`);
    return 0;
  }

  log(colors.red, `\n❌ Found ${violations.length} file size violation(s):\n`);

  for (const v of violations) {
    log(
      colors.yellow,
      `  ${v.file}\n` +
      `    Type: ${v.type} (max: ${v.maxLines} lines)\n` +
      `    Actual: ${v.codeLines} code lines (${v.excess} over limit, +${v.excessPercent}%)\n`
    );
  }

  log(colors.bold, `\n💡 Fix: Split large files into smaller modules.\n`);
  return 1;
}

// Run validation
const exitCode = validateSizeLimits();
process.exit(exitCode);
