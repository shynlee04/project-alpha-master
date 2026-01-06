/**
 * BMAD Context Loader Plugin for OpenCode
 * 
 * Automatically loads BMAD context when relevant modules are mentioned
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Module to file mapping
const MODULE_MAPPING = {
  'core-governance': '_bmad/modules/core-governance/',
  'architecture-remediation': '_bmad/modules/architecture-remediation/',
  'sprint-execution': '_bmad/modules/sprint-execution/',
  'integration-testing': '_bmad/modules/integration-testing/',
  'governance': '_bmad/modules/governance/',
  'quality': '_bmad/modules/quality/',
  'asgl': '_bmad/modules/asgl/',
  'deep-scan': '_bmad/modules/deep-scan/'
};

/**
 * Find relevant module directories
 */
function findRelevantModules(message) {
  const modules = [];
  for (const [key, path] of Object.entries(MODULE_MAPPING)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      modules.push({ name: key, path });
    }
  }
  return modules;
}

/**
 * Load module manifest if exists
 */
function loadModuleManifest(modulePath) {
  try {
    const manifestPath = join(modulePath, 'MANIFEST.md');
    if (existsSync(manifestPath)) {
      return readFileSync(manifestPath, 'utf-8');
    }
  } catch (e) {
    console.error(`Failed to load manifest for ${modulePath}:`, e.message);
  }
  return null;
}

/**
 * Load agents from module
 */
function loadModuleAgents(modulePath) {
  const agents = [];
  try {
    const agentDir = join(modulePath, 'agents');
    if (existsSync(agentDir)) {
      const files = globSync(`${agentDir}/*.md`);
      for (const file of files) {
        agents.push({
          name: file.basename(file, '.md'),
          path: file,
          content: readFileSync(file, 'utf-8')
        });
      }
    }
  } catch (e) {
    console.error(`Failed to load agents for ${modulePath}:`, e.message);
  }
  return agents;
}

/**
 * Load workflows from module
 */
function loadModuleWorkflows(modulePath) {
  const workflows = [];
  try {
    const workflowDir = join(modulePath, 'workflows');
    if (existsSync(workflowDir)) {
      const files = globSync(`${workflowDir}/*.md`);
      for (const file of files) {
        workflows.push({
          name: file.basename(file, '.md'),
          path: file,
          content: readFileSync(file, 'utf-8')
        });
      }
    }
  } catch (e) {
    console.error(`Failed to load workflows for ${modulePath}:`, e.message);
  }
  return workflows;
}

/**
 * Main plugin function
 */
export const BMADContextLoaderPlugin = async (ctx) => {
  console.log('[BMAD] Initializing Context Loader Plugin');
  
  return {
    'message.part.updated': async (input, output) => {
      const message = input.message?.content || '';
      
      // Check if message mentions BMAD modules
      const relevantModules = findRelevantModules(message);
      
      if (relevantModules.length > 0) {
        console.log(`[BMAD] Found ${relevantModules.length} relevant modules`);
        
        const context = {
          modules: [],
          agents: [],
          workflows: []
        };
        
        for (const module of relevantModules) {
          // Load manifest
          const manifest = loadModuleManifest(module.path);
          if (manifest) {
            context.modules.push({
              name: module.name,
              manifest
            });
          }
          
          // Load agents
          const agents = loadModuleAgents(module.path);
          context.agents.push(...agents);
          
          // Load workflows
          const workflows = loadModuleWorkflows(module.path);
          context.workflows.push(...workflows);
        }
        
        // Inject context into output
        output.bmadContext = context;
        output.instruction = `Loaded ${context.modules.length} modules, ${context.agents.length} agents, ${context.workflows.length} workflows`;
        
        console.log(`[BMAD] Context loaded: ${context.modules.length} modules, ${context.agents.length} agents`);
      }
    },
    
    'session.created': async (input, output) => {
      // Always load core governance context on session start
      const coreGovPath = '_bmad/modules/core-governance/';
      if (existsSync(coreGovPath)) {
        const manifest = loadModuleManifest(coreGovPath);
        output.bmadContext = {
          modules: [{
            name: 'core-governance',
            manifest
          }]
        };
        console.log('[BMAD] Core governance context loaded on session start');
      }
    }
  };
};

export default BMADContextLoaderPlugin;
