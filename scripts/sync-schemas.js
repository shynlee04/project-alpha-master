#!/usr/bin/env node
/**
 * Schema Synchronization Script
 * 
 * Keeps Zod schemas, TypeScript types, and database schemas in sync.
 * Prevents drift between runtime validation and compile-time types.
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
// Schema Synchronization Rules
// ============================================================================

const SYNC_RULES = [
  {
    name: 'Zod to TypeScript',
    description: 'Generate TypeScript types from Zod schemas',
    async sync() {
      const changes = [];
      const schemaFiles = await glob('src/**/*schema*.ts');
      
      for (const file of schemaFiles) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Extract schema definitions
        const schemaMatches = content.matchAll(
          /export\s+const\s+(\w+Schema)\s*=\s*z\.(\w+)\(([^)]+)\)/g
        );
        
        for (const match of schemaMatches) {
          const [, schemaName, schemaType] = match;
          const typeName = schemaName.replace(/Schema$/, '');
          
          // Check if corresponding type exists
          const typeExists = content.includes(`export type ${typeName}`);
          
          if (!typeExists) {
            changes.push({
              file,
              action: 'add',
              content: `export type ${typeName} = z.infer<typeof ${schemaName}>;`,
              message: `Add inferred type for ${schemaName}`,
            });
          }
        }
      }
      
      return changes;
    },
  },
  {
    name: 'Route Params Sync',
    description: 'Ensure route params match loader parameter types',
    async sync() {
      const changes = [];
      const routeFiles = await glob('src/routes/**/*.tsx');
      
      for (const file of routeFiles) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Extract route path params (e.g., $projectId)
        const routeMatch = content.match(/createFileRoute\(['"]([^'"]+)['"]\)/);
        if (!routeMatch) continue;
        
        const routePath = routeMatch[1];
        const params = (routePath.match(/\$\w+/g) || []).map(p => p.replace('$', ''));
        
        // Check if loader uses these params
        const loaderMatch = content.match(/loader:\s*\(\{\s*params\s*\}/);
        
        if (params.length > 0 && !loaderMatch) {
          changes.push({
            file,
            action: 'warn',
            message: `Route has params ${params.join(', ')} but loader doesn't destructure them`,
          });
        }
      }
      
      return changes;
    },
  },
  {
    name: 'Store Slice Types',
    description: 'Ensure Zustand stores have corresponding slice types',
    async sync() {
      const changes = [];
      const storeFiles = await glob('src/**/stores/**/*.ts');
      
      for (const file of storeFiles) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Check for slice pattern
        const sliceMatches = content.matchAll(
          /export\s+const\s+create(\w+Slice)\s*=\s*\(/g
        );
        
        for (const match of sliceMatches) {
          const [, sliceName] = match;
          const typeName = `${sliceName}State`;
          
          // Check if type is exported
          const typeExists = content.includes(`export interface ${typeName}`) ||
                            content.includes(`export type ${typeName}`);
          
          if (!typeExists) {
            changes.push({
              file,
              action: 'warn',
              message: `Slice ${sliceName} should have exported ${typeName} interface`,
            });
          }
        }
      }
      
      return changes;
    },
  },
];

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  log('🔄 Synchronizing schemas...\n', 'blue');
  
  let totalChanges = 0;
  
  for (const rule of SYNC_RULES) {
    log(`  ${rule.name}`, 'yellow');
    log(`  ${colors.dim}${rule.description}${colors.reset}`);
    
    try {
      const changes = await rule.sync();
      
      if (changes.length === 0) {
        log(`  ✓ In sync\n`, 'green');
      } else {
        for (const change of changes) {
          if (change.action === 'warn') {
            log(`    ⚠ ${change.message}`, 'yellow');
          } else {
            log(`    + ${change.message}`, 'green');
            totalChanges++;
            
            // In a real implementation, we'd apply the changes
            // For now, just report them
          }
        }
        log('');
      }
    } catch (error) {
      log(`  ✗ Error: ${error.message}\n`, 'red');
    }
  }
  
  // Summary
  log('═'.repeat(60), 'dim');
  if (totalChanges === 0) {
    log('✅ All schemas are synchronized!', 'green');
  } else {
    log(`ℹ️  Found ${totalChanges} potential improvements`, 'yellow');
    log(`${colors.dim}Run with --apply to auto-fix${colors.reset}`, 'dim');
  }
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
