/**
 * BMAD Hook Integration Plugin for OpenCode
 * 
 * Bridges OpenCode events with BMAD governance hooks
 * Loads BMAD context and enforces governance rules
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load BMAD configuration
const BMAD_CONFIG = {
  stateFile: '.claude/AGENT-STATE.yaml',
  hooksDir: '.claude/hooks',
  modulesDir: '_bmad/modules',
  constitutionFile: '_bmad/modules/governance/CONSTITUTION.md'
};

/**
 * Execute shell command
 */
async function execCommand(cmd) {
  const { $ } = await import('bun');
  return await $`${cmd}`.text();
}

/**
 * Load AGENT-STATE.yaml
 */
function loadAgentState() {
  try {
    if (existsSync(BMAD_CONFIG.stateFile)) {
      return JSON.parse(readFileSync(BMAD_CONFIG.stateFile, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load AGENT-STATE.yaml:', e.message);
  }
  return null;
}

/**
 * Save AGENT-STATE.yaml
 */
function saveAgentState(state) {
  try {
    writeFileSync(BMAD_CONFIG.stateFile, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Failed to save AGENT-STATE.yaml:', e.message);
  }
}

/**
 * Run pre-execution validation
 */
async function runPreExecutionValidation() {
  const startTime = Date.now();
  const state = loadAgentState() || { sessions: [], artifacts: [] };
  
  const currentSession = {
    startTime: new Date().toISOString(),
    platform: 'opencode',
    status: 'running'
  };
  
  state.currentSession = currentSession;
  saveAgentState(state);
  
  console.log('[BMAD] Pre-execution validation started');
  
  // Run validation scripts
  const validations = [
    { name: 'stale-artifacts', script: 'check-artifact-freshness.js' },
    { name: 'artifact-sizes', script: 'check-artifact-sizes.js' },
    { name: 'tier1-protection', script: 'check-tier1-protection.js' },
    { name: 'time-boxing', script: 'check-time-boxing.js' },
    { name: 'context-poisoning', script: 'check-duplicate-artifacts.js' }
  ];
  
  const results = [];
  for (const validation of validations) {
    try {
      const scriptPath = join(BMAD_CONFIG.hooksDir, 'scripts', validation.script);
      if (existsSync(scriptPath)) {
        const result = await execCommand(`node ${scriptPath}`);
        results.push({ name: validation.name, status: 'passed', output: result });
      }
    } catch (e) {
      results.push({ name: validation.name, status: 'failed', error: e.message });
    }
  }
  
  const duration = Date.now() - startTime;
  console.log(`[BMAD] Pre-execution validation complete (${duration}ms)`);
  
  return {
    validations: results,
    duration,
    timestamp: new Date().toISOString()
  };
}

/**
 * Run post-execution update
 */
async function runPostExecutionUpdate(validationResults) {
  const state = loadAgentState() || { sessions: [], artifacts: [] };
  
  console.log('[BMAD] Post-execution update started');
  
  // Update session status
  if (state.currentSession) {
    state.currentSession.endTime = new Date().toISOString();
    state.currentSession.status = 'completed';
    state.currentSession.validationResults = validationResults;
    
    if (!state.sessions) state.sessions = [];
    state.sessions.push(state.currentSession);
    delete state.currentSession;
  }
  
  // Update governance metrics
  if (!state.governanceMetrics) state.governanceMetrics = [];
  state.governanceMetrics.push({
    timestamp: new Date().toISOString(),
    validationResults: validationResults.validations
  });
  
  saveAgentState(state);
  
  console.log('[BMAD] Post-execution update complete');
}

/**
 * Main plugin function
 */
export const BMADHooksPlugin = async (ctx) => {
  console.log('[BMAD] Initializing BMAD Hook Integration Plugin');
  
  return {
    // Session lifecycle hooks
    'session.created': async (input, output) => {
      console.log('[BMAD] Session created - running pre-execution validation');
      const validation = await runPreExecutionValidation();
      output.validation = validation;
    },
    
    'session.idle': async (input, output) => {
      console.log('[BMAD] Session completed - running post-execution update');
      if (input.validation) {
        await runPostExecutionUpdate(input.validation);
      }
    },
    
    'session.error': async (input, output) => {
      console.log('[BMAD] Session error - logging for governance review');
      const state = loadAgentState() || { errors: [] };
      if (!state.errors) state.errors = [];
      state.errors.push({
        timestamp: new Date().toISOString(),
        error: input.error?.message || 'Unknown error',
        platform: 'opencode'
      });
      saveAgentState(state);
    },
    
    // Tool execution hooks
    'tool.execute.before': async (input, output) => {
      // Log tool execution for audit
      const state = loadAgentState() || { toolExecutions: [] };
      if (!state.toolExecutions) state.toolExecutions = [];
      state.toolExecutions.push({
        timestamp: new Date().toISOString(),
        tool: input.tool,
        args: Object.keys(input.args || {})
      });
      saveAgentState(state);
    },
    
    // Message hooks for context loading
    'message.part.updated': async (input, output) => {
      // Check if BMAD context needs to be loaded
      const message = input.message?.content || '';
      if (message.includes('@bmad-') || message.includes('BMAD')) {
        console.log('[BMAD] BMAD context detected - preparing context injection');
        // Context will be loaded from AGENTS.md and _bmad/modules/
      }
    },
    
    // Custom hook for BMAD-specific commands
    'bmad.validate': async (input, output) => {
      const validation = await runPreExecutionValidation();
      output.validation = validation;
      output.recommendations = validation.validations
        .filter(v => v.status === 'failed')
        .map(v => `Fix ${v.name}: ${v.error || 'Validation failed'}`);
    },
    
    'bmad.state': async (input, output) => {
      output.state = loadAgentState();
    },
    
    'bmad.archive': async (input, output) => {
      // Trigger artifact archival
      const { $ } = await import('bun');
      await $`node ${BMAD_CONFIG.hooksDir}/scripts/archive-expired-artifacts.js`.text();
      output.status = 'archived';
    }
  };
};

export default BMADHooksPlugin;
