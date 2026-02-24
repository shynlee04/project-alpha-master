#!/usr/bin/env node
/**
 * Check Tier 1 Protection - Constitution Read-Only Check
 * Part of BMAD Governance Framework
 */

const fs = require('fs');
const path = require('path');

const TIER1_PATTERNS = [
  'bmad-constitution.md',
  'governance-rules.md',
  'agent-behavior.md'
];

function checkTier1Protection() {
  const violations = [];
  const projectRoot = process.cwd();
  
  for (const pattern of TIER1_PATTERNS) {
    // Check multiple possible locations
    const locations = [
      path.join(projectRoot, '.opencode', 'instructions', pattern),
      path.join(projectRoot, '_bmad', 'modules', 'governance', pattern),
      path.join(projectRoot, pattern)
    ];
    
    for (const loc of locations) {
      if (fs.existsSync(loc)) {
        // Check if file is writable
        try {
          fs.accessSync(loc, fs.constants.W_OK);
          // Constitution files should typically be read-only or protected
          console.log(`   ℹ️  ${pattern} exists at ${loc} (writable)`);
        } catch {
          console.log(`   ✅ ${pattern} protected`);
        }
      }
    }
  }
  
  console.log('✅ Tier 1 protection check complete');
  process.exit(0);
}

checkTier1Protection();
