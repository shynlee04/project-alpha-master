#!/usr/bin/env node
/**
 * Check Artifact Sizes - God Artifact Detection (>5000 lines)
 * Part of BMAD Governance Framework
 */

const fs = require('fs');
const path = require('path');

const MAX_LINES = 5000;

function checkArtifactSizes(dir) {
  const oversized = [];
  
  function scan(directory) {
    if (!fs.existsSync(directory)) return;
    
    const items = fs.readdirSync(directory);
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (item.endsWith('.md') && stats.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lineCount = content.split('\n').length;
          if (lineCount > MAX_LINES) {
            oversized.push({ path: fullPath, lines: lineCount });
          }
        } catch (e) {
          // Skip unreadable files
        }
      }
    }
  }
  
  scan(dir);
  return oversized;
}

const outputDir = '_bmad-output';
const oversized = checkArtifactSizes(outputDir);

if (oversized.length > 0) {
  console.log(`⚠️  Found ${oversized.length} god artifacts (>${MAX_LINES} lines):`);
  oversized.forEach(art => {
    console.log(`   - ${art.path} (${art.lines} lines)`);
  });
  process.exit(0);
} else {
  console.log('✅ No god artifacts found');
  process.exit(0);
}
