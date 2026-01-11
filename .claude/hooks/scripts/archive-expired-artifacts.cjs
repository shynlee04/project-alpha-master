#!/usr/bin/env node
/**
 * Archive Expired Artifacts
 * Part of BMAD Governance Framework
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TTL_HOURS = 90 * 24; // 90 days for Tier 3
const ARCHIVE_DIR = '_bmad-output/.archive/governance';
const STALE_THRESHOLD = new Date(Date.now() - TTL_HOURS * 60 * 60 * 1000);

function archiveOldArtifacts(dir) {
  const archived = [];
  
  function scan(directory) {
    if (!fs.existsSync(directory)) return;
    
    const items = fs.readdirSync(directory);
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (item.endsWith('.md') && stats.isFile()) {
        const age = stats.mtime;
        if (age < STALE_THRESHOLD) {
          archived.push(fullPath);
        }
      }
    }
  }
  
  scan(dir);
  return archived;
}

function main() {
  console.log('Archiving expired artifacts (>90 days old)...');
  
  // Ensure archive directory exists
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }
  
  const expired = archiveOldArtifacts('_bmad-output');
  
  if (expired.length > 0) {
    console.log(`Found ${expired.length} expired artifacts`);
    expired.forEach(art => {
      const fileName = path.basename(art);
      const destPath = path.join(ARCHIVE_DIR, fileName);
      console.log(`   Archiving: ${art} -> ${destPath}`);
      
      try {
        fs.copyFileSync(art, destPath);
        fs.unlinkSync(art);
      } catch (e) {
        console.log(`   ⚠️  Could not archive: ${e.message}`);
      }
    });
    console.log(`✅ Archived ${expired.length} artifacts`);
  } else {
    console.log('✅ No expired artifacts found');
  }
}

main();
