#!/usr/bin/env node
/**
 * Check Time-Boxing Compliance - Story Duration Monitoring
 * Part of BMAD Governance Framework
 */

const fs = require('fs');
const path = require('path');

function checkTimeBoxingCompliance() {
  // Use __dirname to resolve relative to script location
  // Script is in .claude/hooks/scripts, so ../../.. goes to project root
  const projectRoot = path.resolve(__dirname, '../../..');
  const workflowFile = path.join(projectRoot, 'bmm-workflow-status.yaml');
  
  if (!fs.existsSync(workflowFile)) {
    console.log('⚠️  No workflow status file found');
    return;
  }
  
  try {
    const content = fs.readFileSync(workflowFile, 'utf-8');
    
    // Extract from YAML structure
    const startedMatch = content.match(/started_at:\s*["']?([^"'\n]+)["']?/);
    const statusMatch = content.match(/status:\s*["']?(\w+)["']?/);
    const epicMatch = content.match(/epic:\s*["']?([^"'\n]+)["']?/);
    
    const startedAt = startedMatch ? new Date(startedMatch[1]) : null;
    const status = statusMatch ? statusMatch[1] : 'UNKNOWN';
    const epic = epicMatch ? epicMatch[1] : 'UNKNOWN';
    
    if (startedAt) {
      const hoursElapsed = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60);
      console.log(`📊 Current Sprint Status:`);
      console.log(`   Active Epic: ${epic}`);
      console.log(`   Status: ${status}`);
      console.log(`   Hours Elapsed: ${hoursElapsed.toFixed(1)}h`);
      
      if (hoursElapsed > 24) {
        console.log(`⚠️  Sprint running for ${hoursElapsed.toFixed(1)}h - consider review`);
      }
    }
    
    console.log('✅ Time-boxing check complete');
    process.exit(0);
  } catch (e) {
    console.log('⚠️  Could not parse workflow status');
    process.exit(0);
  }
}

checkTimeBoxingCompliance();
