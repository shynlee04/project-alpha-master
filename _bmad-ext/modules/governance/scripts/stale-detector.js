#!/usr/bin/env node
/**
 * Stale Detection Script
 * 
 * Detects stale context and artifacts in BMAD-EXT:
 * - Stale LOOP_STATE (anchor > 4 hours)
 * - Stale story context (> 4 hours)
 * - Stale planning artifacts (> 24 hours)
 * - Orphaned handoffs (> 24 hours)
 * 
 * Usage: node stale-detector.js [--fix] [--report]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  staleness: {
    anchor: 4 * 60 * 60 * 1000,      // 4 hours
    storyContext: 4 * 60 * 60 * 1000, // 4 hours
    planningArtifact: 24 * 60 * 60 * 1000, // 24 hours
    handoff: 24 * 60 * 60 * 1000     // 24 hours
  },
  paths: {
    loopState: '_bmad-ext/state/LOOP_STATE.yaml',
    artifactRegistry: '_bmad-ext/state/ARTIFACT_REGISTRY.yaml',
    workflowStatus: 'bmm-workflow-status.yaml',
    handoffs: '_bmad-ext/.handoffs/',
    planningArtifacts: '_bmad-output/planning-artifacts/',
    sprintArtifacts: '_bmad-output/sprint-artifacts/'
  }
};

/**
 * Parse YAML file
 */
function parseYAML(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const yaml = require('js-yaml');
    return yaml.load(content);
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, e.message);
    return null;
  }
}

/**
 * Check if anchor is stale
 */
function checkAnchor(loopState) {
  if (!loopState?.anchor?.human_intent_timestamp) {
    return { stale: true, reason: 'No anchor timestamp', severity: 'high' };
  }
  
  const anchorAge = Date.now() - new Date(loopState.anchor.human_intent_timestamp).getTime();
  const isStale = anchorAge > CONFIG.staleness.anchor;
  
  return {
    stale: isStale,
    age: Math.round(anchorAge / (60 * 60 * 1000)), // hours
    maxAge: CONFIG.staleness.anchor / (60 * 60 * 1000),
    severity: isStale ? 'high' : 'normal'
  };
}

/**
 * Check story context freshness
 */
function checkStoryContext(loopState) {
  if (!loopState?.current?.story_id) {
    return { stale: false, reason: 'No active story' };
  }
  
  const lastUpdate = loopState.current?.last_step_update;
  if (!lastUpdate) {
    return { stale: true, reason: 'No story update timestamp', severity: 'medium' };
  }
  
  const age = Date.now() - new Date(lastUpdate).getTime();
  const isStale = age > CONFIG.staleness.storyContext;
  
  return {
    stale: isStale,
    story: loopState.current.story_id,
    age: Math.round(age / (60 * 60 * 1000)),
    maxAge: CONFIG.staleness.storyContext / (60 * 60 * 1000),
    severity: isStale ? 'medium' : 'normal'
  };
}

/**
 * Check planning artifacts for staleness
 */
function checkPlanningArtifacts() {
  const stale = [];
  
  try {
    const files = fs.readdirSync(CONFIG.paths.planningArtifacts, { recursive: true });
    
    for (const file of files) {
      if (!file.endsWith('.md') && !file.endsWith('.yaml')) continue;
      
      const filePath = path.join(CONFIG.paths.planningArtifacts, file);
      const stats = fs.statSync(filePath);
      const age = Date.now() - stats.mtimeMs;
      
      if (age > CONFIG.staleness.planningArtifact) {
        stale.push({
          path: filePath,
          age: Math.round(age / (24 * 60 * 60 * 1000)), // days
          type: 'planning-artifact'
        });
      }
    }
  } catch (e) {
    // Directory might not exist
  }
  
  return stale;
}

/**
 * Check handoffs for staleness
 */
function checkHandoffs() {
  const stale = [];
  
  try {
    const files = fs.readdirSync(CONFIG.paths.handoffs, { recursive: true });
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(CONFIG.paths.handoffs, file);
      const stats = fs.statSync(filePath);
      const age = Date.now() - stats.mtimeMs;
      
      if (age > CONFIG.staleness.handoff) {
        stale.push({
          path: filePath,
          age: Math.round(age / (24 * 60 * 60 * 1000)), // days
          type: 'handoff'
        });
      }
    }
  } catch (e) {
    // Directory might not exist
  }
  
  return stale;
}

/**
 * Check workflow status for active stories
 */
function checkWorkflowStatus() {
  const status = parseYAML(CONFIG.paths.workflowStatus);
  if (!status) return { activeStories: 0, completedStories: 0 };
  
  const activeStories = status.current_workflow?.stories?.filter(s => 
    s.status === 'in_progress' || s.status === 'pending'
  ).length || 0;
  
  const completedStories = status.current_workflow?.stories?.filter(s => 
    s.status === 'done'
  ).length || 0;
  
  return { activeStories, completedStories };
}

/**
 * Generate stale detection report
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    checks: {},
    summary: { staleCount: 0, warnings: 0, critical: 0 }
  };
  
  // Check LOOP_STATE
  console.log('Checking LOOP_STATE...');
  const loopState = parseYAML(CONFIG.paths.loopState);
  if (loopState) {
    report.checks.anchor = checkAnchor(loopState);
    report.checks.storyContext = checkStoryContext(loopState);
    
    if (report.checks.anchor.stale) report.summary.critical++;
    if (report.checks.storyContext.stale) report.summary.warnings++;
  } else {
    report.checks.anchor = { stale: true, reason: 'Could not load LOOP_STATE', severity: 'critical' };
    report.summary.critical++;
  }
  
  // Check planning artifacts
  console.log('Checking planning artifacts...');
  report.checks.planningArtifacts = checkPlanningArtifacts();
  report.summary.staleCount += report.checks.planningArtifacts.length;
  
  // Check handoffs
  console.log('Checking handoffs...');
  report.checks.handoffs = checkHandoffs();
  report.summary.staleCount += report.checks.handoffs.length;
  
  // Check workflow status
  console.log('Checking workflow status...');
  report.checks.workflowStatus = checkWorkflowStatus();
  
  return report;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const reportOnly = args.includes('--report');
  
  console.log('=== BMAD-EXT Stale Detector ===\n');
  
  const report = generateReport();
  
  console.log('\n--- Stale Detection Report ---');
  console.log(`Timestamp: ${report.timestamp}\n`);
  
  // Anchor check
  const anchor = report.checks.anchor;
  if (anchor.stale) {
    console.log(`❌ ANCHOR STALE: ${anchor.reason}`);
    console.log(`   Age: ${anchor.age}h / Max: ${anchor.maxAge}h`);
    console.log(`   Severity: ${anchor.severity.toUpperCase()}`);
  } else {
    console.log(`✅ Anchor fresh: ${anchor.age}h old`);
  }
  
  // Story context check
  const storyCtx = report.checks.storyContext;
  if (storyCtx.stale !== false) {
    console.log(`\n⚠️  STORY CONTEXT: ${storyCtx.reason || `Story: ${storyCtx.story}, Age: ${storyCtx.age}h`}`);
  } else {
    console.log(`\n✅ Story context fresh: ${storyCtx.story || 'No active story'}`);
  }
  
  // Planning artifacts
  const planning = report.checks.planningArtifacts;
  if (planning.length > 0) {
    console.log(`\n⚠️  STALE PLANNING ARTIFACTS: ${planning.length}`);
    if (verbose) {
      planning.forEach(p => console.log(`   - ${p.path} (${p.age}d)`));
    }
  } else {
    console.log(`\n✅ No stale planning artifacts`);
  }
  
  // Handoffs
  const handoffs = report.checks.handoffs;
  if (handoffs.length > 0) {
    console.log(`\n⚠️  STALE HANDOFFS: ${handoffs.length}`);
    if (verbose) {
      handoffs.forEach(h => console.log(`   - ${h.path} (${h.age}d)`));
    }
  } else {
    console.log(`\n✅ No stale handoffs`);
  }
  
  // Workflow status
  const wfStatus = report.checks.workflowStatus;
  console.log(`\n--- Workflow Status ---`);
  console.log(`Active stories: ${wfStatus.activeStories}`);
  console.log(`Completed stories: ${wfStatus.completedStories}`);
  
  // Summary
  console.log(`\n--- Summary ---`);
  console.log(`Critical issues: ${report.summary.critical}`);
  console.log(`Warnings: ${report.summary.warnings}`);
  console.log(`Stale artifacts: ${report.summary.staleCount}`);
  
  if (report.summary.critical > 0) {
    console.log(`\n🚨 CRITICAL: LOOP STATE requires attention!`);
    console.log(`   Run with --fix to attempt automatic fixes`);
  }
  
  if (!reportOnly) {
    // Save report
    const reportPath = '_bmad-ext/.logs/stale-detection-report.yaml';
    const fs = require('fs');
    const yaml = require('js-yaml');
    
    try {
      const dir = path.dirname(reportPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(reportPath, yaml.dump(report));
      console.log(`\nReport saved to: ${reportPath}`);
    } catch (e) {
      console.error(`Error saving report:`, e.message);
    }
  }
  
  console.log('\n=== Complete ===');
}

// Export for use in other scripts
module.exports = {
  checkAnchor,
  checkStoryContext,
  checkPlanningArtifacts,
  checkHandoffs,
  checkWorkflowStatus,
  generateReport,
  CONFIG
};

// Run if called directly
if (require.main === module) {
  main();
}
