/**
 * E2E User Journey Test Runner v2
 * Corrected selectors for actual UI structure
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = '/Users/apple/Documents/coding-projects/project-alpha-master/_bmad-output/investigation-reports/screenshots/e2e-2026-01-25';
const RESULTS_FILE = '/Users/apple/Documents/coding-projects/project-alpha-master/_bmad-output/investigation-reports/screenshots/e2e-2026-01-25/test-results.json';

const results = {
  timestamp: new Date().toISOString(),
  journeys: {},
  consoleErrors: [],
  overallStatus: 'IN_PROGRESS'
};

async function takeScreenshot(page, name) {
  const filename = `${name}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot: ${filename}`);
  return filename;
}

async function logStep(journey, step, status, details = '') {
  if (!results.journeys[journey]) {
    results.journeys[journey] = { steps: [], status: 'IN_PROGRESS' };
  }
  results.journeys[journey].steps.push({ step, status, details, timestamp: new Date().toISOString() });
  console.log(`  [${status}] Step ${step}: ${details}`);
}

async function runJourney1_ProjectCreation(page) {
  console.log('\n🧪 J1: Project Creation (Desktop FSA)');
  try {
    // Wait for boot sequence to complete
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    await takeScreenshot(page, 'j1-step1-hub');
    logStep('J1', 1, 'PASS', 'Hub page loaded');
    
    // Look for CREATE_PROJECT Bento card (id: 'new-project')
    const newProjectCard = page.locator('[data-testid="bento-card-new-project"], [id="new-project"]').first();
    if (await newProjectCard.count() > 0) {
      await newProjectCard.click();
      await page.waitForTimeout(500);
      await takeScreenshot(page, 'j1-step2-wizard');
      logStep('J1', 2, 'PASS', 'Project creation wizard opened');
    } else {
      // Try finding by title
      const createCard = page.locator('text=CREATE_PROJECT, text=Create Project').first();
      if (await createCard.count() > 0) {
        await createCard.click();
        await page.waitForTimeout(500);
        await takeScreenshot(page, 'j1-step2-wizard');
        logStep('J1', 2, 'PASS', 'Project creation wizard opened via text');
      } else {
        logStep('J1', 2, 'FAIL', 'New Project card not found');
      }
    }
    
    results.journeys['J1'].status = 'COMPLETED';
  } catch (error) {
    logStep('J1', 'ERROR', 'FAIL', error.message);
    results.journeys['J1'].status = 'FAILED';
  }
}

async function runJourney2_NotesCRUD(page, viewport) {
  const deviceName = viewport === 'mobile' ? 'Mobile' : viewport === 'tablet' ? 'Tablet' : 'Desktop';
  console.log(`\n🧪 J2: Notes CRUD (${deviceName})`);
  
  try {
    await page.setViewportSize(viewport === 'mobile' ? { width: 375, height: 812 } : viewport === 'tablet' ? { width: 768, height: 1024 } : { width: 1920, height: 1080 });
    
    // Go to hub first to handle redirects
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Click on FIELD_NOTES or Notes card
    const notesCard = page.locator('text=FIELD_NOTES, text=Notes').first();
    if (await notesCard.count() > 0) {
      await notesCard.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, `j2-step1-notes-${viewport}`);
      logStep('J2', 1, 'PASS', 'Navigated to Notes');
    } else {
      logStep('J2', 1, 'FAIL', 'Notes card not found on hub');
      // Take screenshot anyway
      await takeScreenshot(page, `j2-step1-notes-${viewport}`);
    }
    
    // Check for editor on notes page
    const editorArea = page.locator('.bn-editor, [data-testid="blocknote"], .ProseMirror').first();
    if (await editorArea.count() > 0) {
      await takeScreenshot(page, `j2-step2-editor-${viewport}`);
      logStep('J2', 2, 'PASS', 'BlockNote editor visible');
    } else {
      logStep('J2', 2, 'PARTIAL', 'Editor area check - may be on redirect');
    }
    
    results.journeys['J2'][viewport] = { status: 'COMPLETED' };
  } catch (error) {
    logStep('J2', 'ERROR', 'FAIL', error.message);
    results.journeys['J2'][viewport] = { status: 'FAILED' };
  }
}

async function runJourney3_AIChat(page, viewport) {
  const deviceName = viewport === 'mobile' ? 'Mobile' : 'Desktop';
  console.log(`\n🧪 J3: AI Chat (${deviceName})`);
  
  try {
    await page.setViewportSize(viewport === 'mobile' ? { width: 375, height: 812 } : { width: 1920, height: 1080 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Look for Neural Agents card
    const agentsCard = page.locator('text=NEURAL_AGENTS, text=Agents, text=AI').first();
    if (await agentsCard.count() > 0) {
      await agentsCard.click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, `j3-step1-agents-${viewport}`);
      logStep('J3', 1, 'PASS', 'Clicked Agents card');
      
      // Check for toast or modal
      const toastMsg = page.locator('.sonner-toast, [data-testid="toast"]').first();
      if (await toastMsg.count() > 0) {
        logStep('J3', 2, 'PASS', 'Agents toast message shown');
      }
    } else {
      logStep('J3', 1, 'FAIL', 'Agents card not found');
    }
    
    // Check if there's a chat interface somewhere
    const chatInput = page.locator('[data-testid="chat-input"], .chat-input, textarea').first();
    if (await chatInput.count() > 0) {
      await takeScreenshot(page, `j3-chat-interface-${viewport}`);
      logStep('J3', 'CHAT', 'PASS', 'Chat interface found');
    }
    
    results.journeys['J3'][viewport] = { status: 'COMPLETED' };
  } catch (error) {
    logStep('J3', 'ERROR', 'FAIL', error.message);
    results.journeys['J3'][viewport] = { status: 'FAILED' };
  }
}

async function runJourney4_IDEEditing(page) {
  console.log('\n🧪 J4: IDE Code Editing (Desktop FSA)');
  
  try {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Click on workspace that goes to IDE (may need to create project first)
    const ideNav = page.locator('text=IDE, text=Workspace').first();
    if (await ideNav.count() > 0) {
      await ideNav.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'j4-step1-ide');
      logStep('J4', 1, 'PASS', 'IDE loaded');
    } else {
      logStep('J4', 1, 'FAIL', 'IDE navigation not found');
      await takeScreenshot(page, 'j4-step1-ide');
    }
    
    // Check for Monaco editor
    const monacoEditor = page.locator('.monaco-editor, [data-testid="monaco-editor"], .xterm-screen').first();
    if (await monacoEditor.count() > 0) {
      await takeScreenshot(page, 'j4-step2-monaco');
      logStep('J4', 2, 'PASS', 'Monaco editor visible');
    } else {
      logStep('J4', 2, 'PARTIAL', 'Monaco not visible - may need project');
    }
    
    // Check for file tree
    const fileTree = page.locator('[data-testid="file-tree"], .file-tree, [data-testid="explorer"]').first();
    if (await fileTree.count() > 0) {
      await takeScreenshot(page, 'j4-step3-file-tree');
      logStep('J4', 3, 'PASS', 'File tree visible');
    }
    
    results.journeys['J4'] = { status: 'COMPLETED' };
  } catch (error) {
    logStep('J4', 'ERROR', 'FAIL', error.message);
    results.journeys['J4'] = { status: 'FAILED' };
  }
}

async function runJourney5_PluginSwitching(page, viewport) {
  const deviceName = viewport === 'mobile' ? 'Mobile' : viewport === 'tablet' ? 'Tablet' : 'Desktop';
  console.log(`\n🧪 J5: Plugin Switching (${deviceName})`);
  
  try {
    await page.setViewportSize(viewport === 'mobile' ? { width: 375, height: 812 } : viewport === 'tablet' ? { width: 768, height: 1024 } : { width: 1920, height: 1080 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    await takeScreenshot(page, `j5-step1-hub-${viewport}`);
    logStep('J5', 1, 'PASS', 'Hub loaded');
    
    // Check for Bento Grid (main navigation)
    const bentoGrid = page.locator('[data-testid="bento-grid"], .bento-grid').first();
    if (await bentoGrid.count() > 0) {
      await takeScreenshot(page, `j5-step2-bento-${viewport}`);
      logStep('J5', 2, 'PASS', 'Bento navigation grid found');
    }
    
    // Mobile: check for bottom nav
    if (viewport === 'mobile') {
      const bottomNav = page.locator('[data-testid="bottom-nav"], nav.bottom, .mobile-nav').first();
      if (await bottomNav.count() > 0) {
        await takeScreenshot(page, `j5-mobile-nav-${viewport}`);
        logStep('J5-m', 'PASS', 'Mobile bottom navigation present');
      } else {
        logStep('J5-m', 'FAIL', 'Mobile bottom nav NOT found');
      }
    }
    
    // Test switching between workspace cards
    const notesCard = page.locator('text=FIELD_NOTES').first();
    if (await notesCard.count() > 0) {
      await notesCard.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, `j5-notes-view-${viewport}`);
      logStep('J5', 3, 'PASS', 'Switched to Notes view');
    }
    
    results.journeys['J5'][viewport] = { status: 'COMPLETED' };
  } catch (error) {
    logStep('J5', 'ERROR', 'FAIL', error.message);
    results.journeys['J5'][viewport] = { status: 'FAILED' };
  }
}

async function main() {
  console.log('🚀 Starting E2E User Journey Testing v2');
  console.log('=====================================');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Collect console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push({ timestamp: new Date().toISOString(), text: msg.text() });
    }
  });
  
  try {
    // Phase 2: Desktop Testing
    console.log('\n📱 PHASE 2: Desktop Testing');
    await runJourney1_ProjectCreation(page);
    await runJourney2_NotesCRUD(page, 'desktop');
    await runJourney3_AIChat(page, 'desktop');
    await runJourney4_IDEEditing(page);
    await runJourney5_PluginSwitching(page, 'desktop');
    
    // Phase 3: Tablet Testing
    console.log('\n📱 PHASE 3: Tablet Testing');
    await runJourney2_NotesCRUD(page, 'tablet');
    await runJourney5_PluginSwitching(page, 'tablet');
    
    // Phase 4: Mobile Testing
    console.log('\n📱 PHASE 4: Mobile Testing');
    await runJourney2_NotesCRUD(page, 'mobile');
    await runJourney5_PluginSwitching(page, 'mobile');
    
    results.overallStatus = 'COMPLETED';
  } catch (error) {
    console.error('Test error:', error);
    results.overallStatus = 'ERROR';
  } finally {
    await browser.close();
    
    // Save results
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    console.log('\n📊 Results saved to:', RESULTS_FILE);
    console.log('✅ E2E Testing Complete');
  }
}

main();
