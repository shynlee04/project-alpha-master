#!/usr/bin/env node
/**
 * Context Optimizer Script
 * 
 * Implements hop-reading pattern for context economy:
 * 1. Load frontmatter only (minimal context)
2. On demand, load full content
3. Cache frontmatter for rapid access
4. Generate context slices for specific tasks

 * Usage: node context-optimizer.js [--scan] [--cache] [--slice <task>]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  paths: {
    bmadExt: '_bmad-ext',
    bmadOutput: '_bmad-output',
    cache: '_bmad-ext/.cache/frontmatter'
  },
  cache: {
    enabled: true,
    ttl: 60 * 60 * 1000, // 1 hour cache for frontmatter
    maxEntries: 100
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
 * Extract content after frontmatter
 */
function extractContent(content) {
  const frontmatterMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return frontmatterMatch ? frontmatterMatch[1] : content;
}

/**
 * Scan and cache frontmatter for all modules
 */
function scanAndCache() {
  console.log('Scanning _bmad-ext for frontmatter cache...\n');
  
  const cache = {
    timestamp: Date.now(),
    entries: {}
  };
  
  const modules = [
    'governance',
    'arc-v2',
    'bmad-core',
    'sprint-planning-wrapper',
    'implementation'
  ];
  
  let totalScanned = 0;
  
  for (const module of modules) {
    const modulePath = path.join(CONFIG.paths.bmadExt, 'modules', module);
    
    if (!fs.existsSync(modulePath)) continue;
    
    // Scan MODULE.md
    const moduleFile = path.join(modulePath, 'MODULE.md');
    if (fs.existsSync(moduleFile)) {
      const content = fs.readFileSync(moduleFile, 'utf8');
      const frontmatter = parseFrontmatter(content);
      
      if (frontmatter) {
        cache.entries[moduleFile] = {
          frontmatter,
          contentHash: require('crypto').createHash('md5').update(content).digest('hex')
        };
        totalScanned++;
      }
    }
    
    // Scan workflows
    const workflowsPath = path.join(modulePath, 'workflows');
    if (fs.existsSync(workflowsPath)) {
      scanWorkflows(workflowsPath, cache, (count) => totalScanned += count);
    }
    
    // Scan agents
    const agentsPath = path.join(CONFIG.paths.bmadExt, 'agents');
    if (fs.existsSync(agentsPath)) {
      scanWorkflows(agentsPath, cache, (count) => totalScanned += count);
    }
  }
  
  // Save cache
  const cachePath = CONFIG.paths.cache;
  const cacheDir = path.dirname(cachePath);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  
  console.log(`Scanned ${totalScanned} files`);
  console.log(`Cache saved to: ${cachePath}`);
  
  return cache;
}

/**
 * Recursively scan workflows directory
 */
function scanWorkflows(dir, cache, onScan) {
  let scanned = 0;
  
  function scan(currentPath) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip certain directories
          if (entry.name === 'steps' || entry.name === 'node_modules') continue;
          scan(fullPath);
        } else if (entry.isFile() && entry.name === 'workflow.md') {
          const content = fs.readFileSync(fullPath, 'utf8');
          const frontmatter = parseFrontmatter(content);
          
          if (frontmatter) {
            cache.entries[fullPath] = {
              frontmatter,
              contentHash: require('crypto').createHash('md5').update(content).digest('hex')
            };
            scanned++;
          }
        }
      }
    } catch (e) {
      // Skip errors
    }
  }
  
  scan(dir);
  onScan(scanned);
}

/**
 * Generate context slice for specific task
 */
function generateContextSlice(task) {
  console.log(`Generating context slice for task: ${task}\n`);
  
  // Load cache
  let cache;
  try {
    const cachePath = CONFIG.paths.cache;
    if (!fs.existsSync(cachePath)) {
      console.log('Cache not found. Run with --scan first.');
      return null;
    }
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {
    console.error('Error loading cache:', e.message);
    return null;
  }
  
  // Map task to relevant modules
  const taskMap = {
    'planning': ['bmad-core', 'sprint-planning-wrapper'],
    'implementation': ['implementation', 'governance'],
    'architecture': ['arc-v2', 'bmad-core'],
    'governance': ['governance'],
    'remediation': ['arc-v2', 'governance', 'implementation']
  };
  
  const relevantModules = taskMap[task.toLowerCase()] || ['governance'];
  
  // Build context slice
  const contextSlice = {
    task,
    generated: new Date().toISOString(),
    modules: {}
  };
  
  for (const [filePath, entry] of Object.entries(cache.entries)) {
    const moduleName = path.basename(path.dirname(path.dirname(filePath)));
    
    if (relevantModules.includes(moduleName)) {
      if (!contextSlice.modules[moduleName]) {
        contextSlice.modules[moduleName] = [];
      }
      
      contextSlice.modules[moduleName].push({
        file: filePath,
        name: entry.frontmatter?.name,
        description: entry.frontmatter?.description,
        phase: entry.frontmatter?.phase,
        status: entry.frontmatter?.status,
        integration_points: entry.frontmatter?.integration_points
      });
    }
  }
  
  return contextSlice;
}

/**
 * Load minimal context (frontmatter only)
 */
function loadMinimalContext(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    
    return {
      frontmatter,
      // Optionally load first N lines for context preview
      preview: content.split('\n').slice(0, 20).join('\n')
    };
  } catch (e) {
    console.error(`Error loading ${filePath}:`, e.message);
    return null;
  }
}

/**
 * Load full context on demand
 */
function loadFullContext(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    const body = extractContent(content);
    
    return {
      frontmatter,
      body,
      full: content
    };
  } catch (e) {
    console.error(`Error loading ${filePath}:`, e.message);
    return null;
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const scan = args.includes('--scan');
  const cache = args.includes('--cache');
  const slice = args.find(a => a.startsWith('--slice='));
  const verbose = args.includes('--verbose');
  
  console.log('=== BMAD-EXT Context Optimizer ===\n');
  
  if (scan || cache) {
    const result = scanAndCache();
    console.log(`\nCache contains ${Object.keys(result.entries).length} entries`);
  }
  
  if (slice) {
    const task = slice.split('=')[1];
    const contextSlice = generateContextSlice(task);
    
    if (contextSlice) {
      console.log('\n--- Context Slice ---');
      console.log(JSON.stringify(contextSlice, null, 2));
      
      // Save slice
      const slicePath = `_bmad-output/governance/context-slices/${task}-slice.yaml`;
      const fs = require('fs');
      const yaml = require('js-yaml');
      
      try {
        const dir = path.dirname(slicePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(slicePath, yaml.dump(contextSlice));
        console.log(`\nSlice saved to: ${slicePath}`);
      } catch (e) {
        console.error(`Error saving slice:`, e.message);
      }
    }
  }
  
  if (!scan && !cache && !slice) {
    console.log('Usage:');
    console.log('  --scan         Scan and cache frontmatter');
    console.log('  --slice=<task> Generate context slice for task');
    console.log('  --verbose      Show detailed output');
    console.log('\nTasks: planning, implementation, architecture, governance, remediation');
  }
  
  console.log('\n=== Complete ===');
}

// Export for use in other scripts
module.exports = {
  parseFrontmatter,
  extractContent,
  scanAndCache,
  generateContextSlice,
  loadMinimalContext,
  loadFullContext,
  CONFIG
};

// Run if called directly
if (require.main === module) {
  main();
}
