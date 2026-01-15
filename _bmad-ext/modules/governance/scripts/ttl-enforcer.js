#!/usr/bin/env node
/**
 * TTL Enforcement Script
 * 
 * Implements the 4-tier TTL system for BMAD-EXT artifacts:
 * - Tier 1: Constitution (permanent) - Never archive
 * - Tier 2: Controlled (on-demand) - Update iteratively
 * - Tier 3: Archival (90 days) - Archive if stale
 * - Tier 4: Ephemeral (24 hours) - Auto-purge if stale
 * 
 * Usage: node ttl-enforcer.js [--scan] [--archive] [--purge]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  tiers: {
    tier1: {
      name: 'constitution',
      ttl: Infinity, // Permanent
      action: 'preserve',
      examples: ['CLAUDE.md', 'AGENTS.md', 'CONSTS.md']
    },
    tier2: {
      name: 'controlled',
      ttl: Infinity, // On-demand only
      action: 'warn',
      examples: ['prd', 'architecture.md', 'MODULE.md']
    },
    tier3: {
      name: 'archival',
      ttl: 90 * 24 * 60 * 60 * 1000, // 90 days in ms
      action: 'archive',
      examples: ['scans', 'research', 'old-plans']
    },
    tier4: {
      name: 'ephemeral',
      ttl: 24 * 60 * 60 * 1000, // 24 hours in ms
      action: 'purge',
      examples: ['handoffs', 'continuations', 'temp']
    }
  },
  paths: {
    bmadExt: '_bmad-ext',
    bmadOutput: '_bmad-output',
    archive: '_bmad-ext/.archive',
    state: '_bmad-ext/state'
  }
};

/**
 * Parse frontmatter from markdown file
 */
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  
  try {
    const yaml = require('js-yaml');
    return yaml.load(frontmatterMatch[1]);
  } catch (e) {
    console.error('Error parsing frontmatter:', e.message);
    return null;
  }
}

/**
 * Determine tier from file path and frontmatter
 */
function determineTier(filePath, frontmatter) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check frontmatter tier first
  if (frontmatter?.tier) {
    const tierMap = {
      'orchestrator': 'tier1',
      'module': 'tier2',
      'agent': 'tier2',
      'workflow': 'tier2',
      'foundation': 'tier1'
    };
    if (tierMap[frontmatter.tier]) {
      return tierMap[frontmatter.tier];
    }
  }
  
  // Check by path patterns
  const pathPatterns = {
    tier1: [
      /AGENTS\.md$/,
      /CLAUDE\.md$/,
      /CONSTANTS\.md$/,
      /MODULE-HIERARCHY\.md$/,
      /RESPONSIBILITY-MATRIX\.md$/,
      /DECISION-TREE\.md$/
    ],
    tier3: [
      /scans\//,
      /research\//,
      /old-/,
      /archive\//
    ],
    tier4: [
      /handoffs\//,
      /continuations\//,
      /\.tmp$/,
      /temp-/
    ]
  };
  
  for (const [tier, patterns] of Object.entries(pathPatterns)) {
    if (patterns.some(pattern => pattern.test(relativePath))) {
      return tier;
    }
  }
  
  // Default to tier2 (controlled)
  return 'tier2';
}

/**
 * Check if file is stale based on its tier
 */
function isStale(filePath, frontmatter, tier) {
  const config = CONFIG.tiers[tier];
  if (config.ttl === Infinity) return false;
  
  // Check frontmatter updated date
  if (frontmatter?.updated) {
    const updated = new Date(frontmatter.updated);
    const age = Date.now() - updated.getTime();
    return age > config.ttl;
  }
  
  // Fallback to file mtime
  const stats = fs.statSync(filePath);
  const age = Date.now() - stats.mtimeMs;
  return age > config.ttl;
}

/**
 * Scan directory for artifacts and check TTL
 */
function scanDirectory(dir, depth = 3) {
  const results = {
    scanned: 0,
    stale: [],
    byTier: { tier1: 0, tier2: 0, tier3: 0, tier4: 0 },
    actions: []
  };
  
  function scan(dir, currentDepth, prefix = '') {
    if (currentDepth > depth) return;
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip archive and certain directories
          if (entry.name === '.archive' || entry.name === 'node_modules') continue;
          scan(fullPath, currentDepth + 1, prefix + entry.name + '/');
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          results.scanned++;
          
          const content = fs.readFileSync(fullPath, 'utf8');
          const frontmatter = parseFrontmatter(content);
          const tier = determineTier(fullPath, frontmatter);
          
          results.byTier[tier]++;
          
          if (isStale(fullPath, frontmatter, tier)) {
            results.stale.push({
              path: fullPath,
              tier: tier,
              action: CONFIG.tiers[tier].action
            });
          }
        }
      }
    } catch (e) {
      console.error(`Error scanning ${dir}:`, e.message);
    }
  }
  
  scan(dir, 0);
  return results;
}

/**
 * Archive stale artifacts (Tier 3)
 */
function archiveStale(artifacts) {
  const staleTier3 = artifacts.filter(a => a.tier === 'tier3');
  
  for (const artifact of staleTier3) {
    const relativePath = path.relative(CONFIG.paths.bmadExt, artifact.path);
    const archivePath = path.join(CONFIG.paths.archive, 'ttl-enforcer', relativePath);
    const archiveDir = path.dirname(archivePath);
    
    try {
      // Create directory if needed
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }
      
      // Move file to archive
      fs.renameSync(artifact.path, archivePath);
      
      console.log(`Archived: ${relativePath}`);
    } catch (e) {
      console.error(`Error archiving ${artifact.path}:`, e.message);
    }
  }
  
  return staleTier3.length;
}

/**
 * Purge ephemeral artifacts (Tier 4)
 */
function purgeStale(artifacts) {
  const staleTier4 = artifacts.filter(a => a.tier === 'tier4');
  
  for (const artifact of staleTier4) {
    try {
      fs.unlinkSync(artifact.path);
      console.log(`Purged: ${artifact.path}`);
    } catch (e) {
      console.error(`Error purging ${artifact.path}:`, e.message);
    }
  }
  
  return staleTier4.length;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const scanOnly = args.includes('--scan');
  const archive = args.includes('--archive');
  const purge = args.includes('--purge');
  const verbose = args.includes('--verbose');
  
  console.log('=== BMAD-EXT TTL Enforcer ===\n');
  
  // Scan _bmad-ext directory
  console.log('Scanning _bmad-ext directory...');
  const results = scanDirectory(CONFIG.paths.bmadExt);
  
  console.log('\n--- Scan Results ---');
  console.log(`Total scanned: ${results.scanned}`);
  console.log(`By tier:`);
  console.log(`  Tier 1 (Constitution): ${results.byTier.tier1}`);
  console.log(`  Tier 2 (Controlled): ${results.byTier.tier2}`);
  console.log(`  Tier 3 (Archival): ${results.byTier.tier3}`);
  console.log(`  Tier 4 (Ephemeral): ${results.byTier.tier4}`);
  
  console.log(`\nStale artifacts: ${results.stale.length}`);
  
  if (verbose && results.stale.length > 0) {
    console.log('\nStale list:');
    for (const artifact of results.stale) {
      console.log(`  [${artifact.tier}] ${artifact.path} (${artifact.action})`);
    }
  }
  
  // Take action if requested
  if (archive || purge) {
    console.log('\n--- Taking Action ---');
    
    if (archive) {
      const archived = archiveStale(results.stale);
      console.log(`Archived ${archived} artifacts`);
    }
    
    if (purge) {
      const purged = purgeStale(results.stale);
      console.log(`Purged ${purged} artifacts`);
    }
  } else if (!scanOnly) {
    console.log('\n--- Recommendations ---');
    
    const tier3Stale = results.stale.filter(a => a.tier === 'tier3');
    const tier4Stale = results.stale.filter(a => a.tier === 'tier4');
    
    if (tier3Stale.length > 0) {
      console.log(`Run with --archive to archive ${tier3Stale.length} stale tier-3 artifacts`);
    }
    if (tier4Stale.length > 0) {
      console.log(`Run with --purge to purge ${tier4Stale.length} stale tier-4 artifacts`);
    }
  }
  
  console.log('\n=== Complete ===');
}

// Export for use in other scripts
module.exports = {
  scanDirectory,
  archiveStale,
  purgeStale,
  parseFrontmatter,
  determineTier,
  isStale,
  CONFIG
};

// Run if called directly
if (require.main === module) {
  main();
}
