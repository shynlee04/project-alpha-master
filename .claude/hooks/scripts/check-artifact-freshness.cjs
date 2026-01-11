#!/usr/bin/env node
/**
 * Check Artifact Freshness - TTL Validation
 * Part of BMAD Governance Framework
 */

const fs = require('fs');
const path = require('path');

const TTL_HOURS = 48;
const STALE_THRESHOLD = new Date(Date.now() - TTL_HOURS * 60 * 60 * 1000);

function getFileAge(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  } catch {
    return null;
  }
}

function checkStaleArtifacts(dir, pattern = '*.md') {
  const stale = [];
  
  function scan(directory) {
    if (!fs.existsSync(directory)) return;
    
    const items = fs.readdirSync(directory);
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (item.endsWith('.md') && stats.isFile()) {
        const age = getFileAge(fullPath);
        if (age && age < STALE_THRESHOLD) {
          stale.push({ path: fullPath, mtime: age });
        }
      }
    }
  }
  
  scan(dir);
  return stale;
}

const outputDir = '_bmad-output';
const staleArtifacts = checkStaleArtifacts(outputDir);

if (staleArtifacts.length > 0) {
  console.log(`⚠️  Found ${staleArtifacts.length} stale artifacts (>${TTL_HOURS}h old):`);
  staleArtifacts.forEach(art => {
    const ageHours = Math.round((Date.now() - art.mtime.getTime()) / (1000 * 60 * 60));
    console.log(`   - ${art.path} (${ageHours}h old)`);
  });
  process.exit(0); // Warning, not error
} else {
  console.log('✅ No stale artifacts found');
  process.exit(0);
}
