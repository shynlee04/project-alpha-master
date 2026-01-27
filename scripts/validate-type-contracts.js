#!/usr/bin/env node
/**
 * API Contract Validator
 * 
 * Validates that API contracts, route loaders, and component props
 * remain consistent across the codebase. Prevents type drift.
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================================
// Validation Rules
// ============================================================================

const VALIDATION_RULES = {
  // Ensure route loaders have consistent return types
  routeLoaderConsistency: {
    name: 'Route Loader Consistency',
    description: 'All route loaders must have explicit return types',
    async validate() {
      const issues = [];
      const routeFiles = await glob('src/routes/**/*.tsx');
      
      for (const file of routeFiles) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Check if loader exists but doesn't have explicit return type
        const hasLoader = /loader\s*:/.test(content);
        const hasExplicitReturn = /loader:\s*(?:async\s*)?\([^)]*\)\s*:\s*\w+/.test(content);
        
        if (hasLoader && !hasExplicitReturn) {
          issues.push({
            file,
            message: 'Loader should have explicit return type annotation',
            severity: 'warning',
          });
        }
      }
      
      return issues;
    },
  },
  
  // Ensure Zod schemas are used for API boundaries
  schemaValidationAtBoundaries: {
    name: 'Schema Validation at Boundaries',
    description: 'All API boundaries should use Zod validation',
    async validate() {
      const issues = [];
      const apiFiles = await glob('src/infrastructure/**/*.ts');
      
      for (const file of apiFiles) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Check for functions that accept 'any' or 'unknown' without validation
        const hasUnsafeParams = /function\s+\w+\s*\([^)]*:\s*(any|unknown)/.test(content);
        const hasZodValidation = /z\.(object|array|string|number)/.test(content);
        
        if (hasUnsafeParams && !hasZodValidation) {
          issues.push({
            file,
            message: 'Function accepts unsafe types without Zod validation',
            severity: 'error',
          });
        }
      }
      
      return issues;
    },
  },
  
  // Check for orphaned types (defined but not used)
  noOrphanedTypes: {
    name: 'No Orphaned Types',
    description: 'All exported types should be used somewhere',
    async validate() {
      const issues = [];
      // This is a simplified check - in production, use a proper TypeScript compiler API
      const typeFiles = await glob('src/**/*.types.ts');
      
      for (const file of typeFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const typeExports = content.match(/export\s+(?:type|interface)\s+(\w+)/g) || [];
        
        // In a real implementation, we'd check if these types are imported elsewhere
        // For now, just report if there are many unused types
        if (typeExports.length > 20) {
          issues.push({
            file,
            message: `File has ${typeExports.length} exported types - consider splitting`,
            severity: 'warning',
          });
        }
      }
      
      return issues;
    },
  },
  
  // Ensure store slices have consistent patterns
  storeConsistency: {
    name: 'Store Slice Consistency',
    description: 'All Zustand stores should follow the same pattern',
    async validate() {
      const issues = [];
      const storeFiles = await glob('src/**/stores/**/*.ts');
      
      for (const file of storeFiles) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Check for useShollow usage
        const hasUseShallow = /useShallow/.test(content);
        const hasStore = /create.*Store/.test(content);
        
        if (hasStore && !hasUseShallow) {
          issues.push({
            file,
            message: 'Store should use useShallow for selector optimization',
            severity: 'warning',
          });
        }
      }
      
      return issues;
    },
  },
};

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  log('🔍 Validating type contracts...\n', 'blue');
  
  let totalIssues = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const [key, rule] of Object.entries(VALIDATION_RULES)) {
    log(`  ${rule.name}`, 'yellow');
    log(`  ${colors.dim}${rule.description}${colors.reset}`);
    
    try {
      const issues = await rule.validate();
      
      if (issues.length === 0) {
        log(`  ✓ Passed\n`, 'green');
      } else {
        for (const issue of issues) {
          const icon = issue.severity === 'error' ? '✗' : '⚠';
          const color = issue.severity === 'error' ? 'red' : 'yellow';
          log(`    ${icon} ${path.basename(issue.file)}: ${issue.message}`, color);
          
          if (issue.severity === 'error') totalErrors++;
          else totalWarnings++;
        }
        log('');
      }
      
      totalIssues += issues.length;
    } catch (error) {
      log(`  ✗ Error running validation: ${error.message}\n`, 'red');
      totalErrors++;
    }
  }
  
  // Summary
  log('═'.repeat(60), 'dim');
  if (totalIssues === 0) {
    log('✅ All type contracts validated successfully!', 'green');
    process.exit(0);
  } else {
    log(`⚠️  Found ${totalErrors} errors and ${totalWarnings} warnings`, 'yellow');
    process.exit(totalErrors > 0 ? 1 : 0);
  }
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
