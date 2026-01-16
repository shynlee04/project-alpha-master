/**
 * @fileoverview TUI Main Orchestrator
 * @module harness/tui
 *
 * Main terminal UI orchestrator that manages screen navigation and event handling.
 *
 * ANNOTATION: 2026-01-11 - Implementation for test spike harness - Task requirements
 */

import * as readline from 'readline';
import { Screen, SCREENS, getScreenInfo, navigateScreen } from './screens';
import type { TestScenario, ScenarioResult } from '../runners/test-scenarios';
import { SpikeLogger, ToolCallLog, PermissionResult } from '../instrumentation/logger';
import type { PermissionProfile, PermissionEnforcer } from '../permission-profiles';

/**
 * TUI Configuration
 */
export interface TerminalUIConfig {
  logger: SpikeLogger;
  permissionEnforcer: PermissionEnforcer;
  scenarios: Map<string, TestScenario>;
  profiles: Map<string, PermissionProfile>;
}

/**
 * Live execution state
 */
export interface LiveExecutionState {
  scenarioId: string | null;
  profile: PermissionProfile | null;
  isRunning: boolean;
  startTime: number | null;
  stdout: string[];
  stderr: string[];
  toolLogs: ToolCallLog[];
}

/**
 * Main Terminal UI class for the test spike harness
 */
export class TerminalUI {
  private config: TerminalUIConfig;
  private currentScreen: Screen = 'scenario-picker';
  private selectedScenarioIndex: number = 0;
  private selectedProfileIndex: number = 0;
  private rl: readline.Interface;
  private isRunning: boolean = false;
  private executionState: LiveExecutionState = {
    scenarioId: null,
    profile: null,
    isRunning: false,
    startTime: null,
    stdout: [],
    stderr: [],
    toolLogs: [],
  };

  constructor(config: TerminalUIConfig) {
    this.config = config;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Run the main TUI loop
   */
  async run(): Promise<void> {
    this.isRunning = true;
    console.clear();
    this.printWelcome();

    while (this.isRunning) {
      await this.renderCurrentScreen();
      await this.handleInput();
    }

    this.rl.close();
    console.log('\nGoodbye from Test Spike Harness!\n');
  }

  /**
   * Print welcome message
   */
  private printWelcome(): void {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║          TEST SPIKE HARNESS v1.0.0                           ║');
    console.log('║          Isolated AI Agent Test Environment                  ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  Navigation: Arrow keys to move, Enter to select, q to quit  ║');
    console.log('║  Screens: [1] Scenario Picker  [2] Live Run  [3] Permissions ║');
    console.log('║           [4] State Snapshot                                 ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
  }

  /**
   * Render the current screen
   */
  private async renderCurrentScreen(): Promise<void> {
    const screenInfo = getScreenInfo(this.currentScreen);
    if (!screenInfo) return;

    console.log(`\n─── ${screenInfo.label} ───`);
    console.log(`${screenInfo.description}\n`);

    switch (this.currentScreen) {
      case 'scenario-picker':
        await this.renderScenarioPicker();
        break;
      case 'live-run':
        await this.renderLiveRun();
        break;
      case 'permissions-view':
        await this.renderPermissionsView();
        break;
      case 'state-snapshot':
        await this.renderStateSnapshot();
        break;
    }

    this.printNavigationHint();
  }

  /**
   * Render scenario picker screen
   */
  private async renderScenarioPicker(): Promise<void> {
    const scenarios = Array.from(this.config.scenarios.values());
    
    console.log('Available Test Scenarios:\n');
    
    scenarios.forEach((scenario, index) => {
      const prefix = index === this.selectedScenarioIndex ? '▶' : ' ';
      const status = scenario.status === 'ready' ? '[READY]' : 
                     scenario.status === 'running' ? '[RUN]' : 
                     scenario.status === 'done' ? '[DONE]' : '[PENDING]';
      console.log(`${prefix} ${index + 1}. ${scenario.name} ${status}`);
      console.log(`    └─ ${scenario.description}`);
      console.log(`    └─ Expected duration: ${scenario.estimatedDuration}`);
      console.log();
    });

    console.log('Permission Profiles:\n');
    const profiles = Array.from(this.config.profiles.values());
    profiles.forEach((profile, index) => {
      const prefix = index === this.selectedProfileIndex ? '▶' : ' ';
      const status = profile.enabled ? '[ENABLED]' : '[DISABLED]';
      console.log(`${prefix} ${index + 1}. ${profile.name} ${status}`);
      console.log(`    └─ ${profile.description}`);
      console.log();
    });
  }

  /**
   * Render live run screen
   */
  private async renderLiveRun(): Promise<void> {
    if (!this.executionState.isRunning) {
      console.log('No scenario currently running.');
      console.log('Select a scenario from the Scenario Picker to begin.\n');
      return;
    }

    const elapsed = this.executionState.startTime 
      ? ((Date.now() - this.executionState.startTime) / 1000).toFixed(1)
      : '0.0';

    console.log(`Running: ${this.executionState.scenarioId}`);
    console.log(`Profile: ${this.executionState.profile?.name || 'none'}`);
    console.log(`Elapsed: ${elapsed}s\n`);

    if (this.executionState.stdout.length > 0) {
      console.log('─── STDOUT ───');
      this.executionState.stdout.slice(-20).forEach(line => console.log(line));
    }

    if (this.executionState.stderr.length > 0) {
      console.log('\n─── STDERR ───');
      this.executionState.stderr.slice(-10).forEach(line => console.log(`⚠️  ${line}`));
    }

    if (this.executionState.toolLogs.length > 0) {
      console.log('\n─── TOOL CALLS ───');
      this.executionState.toolLogs.slice(-10).forEach(log => {
        const status = log.error ? '❌' : '✅';
        console.log(`${status} ${log.toolName} (${log.latency}ms)`);
      });
    }
  }

  /**
   * Render permissions view screen
   */
  private async renderPermissionsView(): Promise<void> {
    const currentProfile = Array.from(this.config.profiles.values())[this.selectedProfileIndex];
    
    if (!currentProfile) {
      console.log('No permission profiles configured.');
      return;
    }

    console.log(`Current Profile: ${currentProfile.name}`);
    console.log(`Description: ${currentProfile.description}\n`);

    console.log('─── ALLOWED OPERATIONS ───');
    currentProfile.allowedOperations.forEach(op => {
      console.log(`  ✅ ${op}`);
    });

    console.log('\n─── DENIED OPERATIONS ───');
    if (currentProfile.deniedOperations.length === 0) {
      console.log('  (none)');
    } else {
      currentProfile.deniedOperations.forEach(op => {
        console.log(`  ❌ ${op}`);
      });
    }

    if (currentProfile.pathRestrictions) {
      console.log('\n─── PATH RESTRICTIONS ───');
      console.log(`  Allowed paths: ${currentProfile.pathRestrictions.allowedPaths.join(', ') || '(none)'}`);
      console.log(`  Denied paths: ${currentProfile.pathRestrictions.deniedPaths.join(', ') || '(none)'}`);
      if (currentProfile.pathRestrictions.maxDepth) {
        console.log(`  Max depth: ${currentProfile.pathRestrictions.maxDepth}`);
      }
    }

    if (currentProfile.yoloMode) {
      console.log('\n⚠️  YOLO MODE ENABLED - All permissions granted\n');
    }
  }

  /**
   * Render state snapshot screen
   */
  private async renderStateSnapshot(): Promise<void> {
    console.log('─── AGENT STATE SNAPSHOT ───\n');
    
    console.log('State: idle');
    console.log('Mode: awaiting_input');
    console.log('Context size: 0 tokens');
    console.log('Messages: 0\n');

    console.log('─── STATE HISTORY ───\n');
    console.log('  (No state history available)\n');

    console.log('─── FILESYSTEM DIFF ───\n');
    console.log('  (No filesystem changes detected)\n');

    console.log('─── TOOL HISTORY ───\n');
    console.log('  (No tool calls recorded)\n');

    console.log('─── EXPORT OPTIONS ───');
    console.log('  [1] Export state as JSON');
    console.log('  [2] Export state as YAML');
    console.log('  [3] Create restore point');
    console.log('  [4] Restore from backup\n');
  }

  /**
   * Print navigation hint
   */
  private printNavigationHint(): void {
    console.log('─'.repeat(60));
    console.log('Controls: ↑/↓ Navigate  Enter Select  ←/→ Screens  q Quit  r Run');
    console.log('─'.repeat(60));
  }

  /**
   * Handle user input
   */
  private async handleInput(): Promise<void> {
    return new Promise((resolve) => {
      this.rl.question('\n> ', async (answer) => {
        const input = answer.trim().toLowerCase();

        if (input === 'q' || input === 'quit' || input === 'exit') {
          this.isRunning = false;
          return resolve();
        }

        if (input === 'r' || input === 'run') {
          await this.executeSelectedScenario();
          return resolve();
        }

        if (input === '1') {
          this.currentScreen = 'scenario-picker';
          return resolve();
        }
        if (input === '2') {
          this.currentScreen = 'live-run';
          return resolve();
        }
        if (input === '3') {
          this.currentScreen = 'permissions-view';
          return resolve();
        }
        if (input === '4') {
          this.currentScreen = 'state-snapshot';
          return resolve();
        }

        if (input === '' || input === '\r') {
          if (this.currentScreen === 'scenario-picker') {
            await this.executeSelectedScenario();
          }
          return resolve();
        }

        // Arrow key handling
        if (input === '\x1b[A') { // Up arrow
          this.moveSelection(-1);
        } else if (input === '\x1b[B') { // Down arrow
          this.moveSelection(1);
        } else if (input === '\x1b[C') { // Right arrow
          this.currentScreen = navigateScreen(this.currentScreen, 'next');
        } else if (input === '\x1b[D') { // Left arrow
          this.currentScreen = navigateScreen(this.currentScreen, 'prev');
        }

        return resolve();
      });
    });
  }

  /**
   * Move selection up or down
   */
  private moveSelection(delta: number): void {
    if (this.currentScreen === 'scenario-picker') {
      const scenarioCount = this.config.scenarios.size;
      this.selectedScenarioIndex = (this.selectedScenarioIndex + delta + scenarioCount) % scenarioCount;
    } else if (this.currentScreen === 'permissions-view') {
      const profileCount = this.config.profiles.size;
      this.selectedProfileIndex = (this.selectedProfileIndex + delta + profileCount) % profileCount;
    }
  }

  /**
   * Execute the selected scenario
   */
  private async executeSelectedScenario(): Promise<void> {
    const scenarios = Array.from(this.config.scenarios.values());
    const profiles = Array.from(this.config.profiles.values());
    
    const scenario = scenarios[this.selectedScenarioIndex];
    const profile = profiles[this.selectedProfileIndex];

    if (!scenario) {
      console.log('No scenario selected!');
      return;
    }

    console.log(`\n🚀 Executing: ${scenario.name}`);
    console.log(`   Profile: ${profile?.name || 'default'}\n`);

    this.executionState = {
      scenarioId: scenario.id,
      profile: profile || null,
      isRunning: true,
      startTime: Date.now(),
      stdout: [],
      stderr: [],
      toolLogs: [],
    };

    this.currentScreen = 'live-run';

    try {
      const result = await scenario.execute(profile || undefined, {
        onStdout: (line) => {
          this.executionState.stdout.push(line);
          this.config.logger.logInfo(`[STDOUT] ${line}`);
        },
        onStderr: (line) => {
          this.executionState.stderr.push(line);
          this.config.logger.logWarn(`[STDERR] ${line}`);
        },
        onToolCall: (log: ToolCallLog) => {
          this.executionState.toolLogs.push(log);
          this.config.logger.logToolCall(log);
        },
      });

      console.log('\n✅ Scenario completed!');
      console.log(`   Duration: ${result.duration}ms`);
      console.log(`   Tool calls: ${result.toolCalls.length}`);
      console.log(`   Errors: ${result.errors.length}`);

      if (result.errors.length > 0) {
        console.log('\n─── ERRORS ───');
        result.errors.forEach(err => console.log(`  ❌ ${err}`));
      }

      this.executionState.isRunning = false;
    } catch (error) {
      console.error(`\n❌ Scenario failed: ${error}`);
      this.executionState.isRunning = false;
    }
  }

  /**
   * Switch to a different screen
   */
  async switchScreen(screen: Screen): Promise<void> {
    this.currentScreen = screen;
    console.clear();
  }

  /**
   * Get current screen
   */
  getCurrentScreen(): Screen {
    return this.currentScreen;
  }

  /**
   * Get execution state
   */
  getExecutionState(): LiveExecutionState {
    return { ...this.executionState };
  }
}
