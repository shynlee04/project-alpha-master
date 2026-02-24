#!/usr/bin/env node
/**
 * Check Duplicate Artifacts - Context Poisoning Prevention
 * Part of BMAD Governance Framework
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return null;
  }
}

function checkDuplicateArtifacts(dir, pattern = '*.md') {
  const hashMap = new Map();
  const duplicates = [];
  
  function scan(directory) {
    if (!fs.existsSync(directory)) return;
    
    const items = fs.readdirSync(directory);
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (item.endsWith('.md') && stats.isFile()) {
        const hash = getFileHash(fullPath);
        if (hash) {
          if (hashMap.has(hash)) {
            duplicates.push({
              original: hashMap.get(hash),
              duplicate: fullPath
            });
          } else {
            hashMap.set(hash, fullPath);
          }
        }
      }
    }
  }
  
  scan(dir);
  return duplicates;
}

const outputDir = '_bmad-output';
const duplicates = checkDuplicateArtifacts(outputDir);

if (duplicates.length > 0) {
  console.log(`⚠️  Found ${duplicates.length} potential duplicate artifacts:`);
  duplicates.forEach(dup => {
    console.log(`   - ${dup.duplicate}`);
    console.log(`     (duplicate of: ${dup.original})`);
  });
  process.exit(0);
} else {
  console.log('✅ No duplicate artifacts detected');
  process.exit(0);
}
