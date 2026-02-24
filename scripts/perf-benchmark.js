#!/usr/bin/env node
/**
 * Performance Benchmark Script
 * Compares execution times between different TypeScript checking and test methods
 * 
 * Usage: node scripts/perf-benchmark.js [typecheck|test|all]
 */

import { execSync } from 'child_process';
import { performance } from 'perf_hooks';
import os from 'os';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatTime(ms) {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatSpeedup(oldTime, newTime) {
  const speedup = oldTime / newTime;
  const percentage = ((1 - newTime / oldTime) * 100).toFixed(1);
  return `${speedup.toFixed(1)}x faster (${percentage}% reduction)`;
}

function runCommand(command, label) {
  log(`\n${'='.repeat(60)}`, 'dim');
  log(`Running: ${label}`, 'cyan');
  log(`Command: ${command}`, 'dim');
  log(`${'='.repeat(60)}\n`, 'dim');
  
  const start = performance.now();
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });
    const duration = performance.now() - start;
    return { success: true, duration };
  } catch (error) {
    const duration = performance.now() - start;
    return { success: false, duration, error: error.message };
  }
}

async function benchmarkTypeCheck() {
  log('\n' + '═'.repeat(70), 'magenta');
  log('TYPE CHECKING BENCHMARK', 'magenta');
  log('═'.repeat(70), 'magenta');
  
  const results = [];
  
  // Benchmark 1: Standard tsc (incremental)
  const tscResult = runCommand(
    'pnpm tsc -p tsconfig.check.json --noEmit --incremental 2>&1 | head -100',
    'Standard TypeScript (tsc --incremental)'
  );
  results.push({ name: 'tsc --incremental', ...tscResult });
  
  // Benchmark 2: tsgo (native compiler)
  const tsgoResult = runCommand(
    'pnpm tsgo -p tsconfig.tsgo.json --noEmit 2>&1 | head -100',
    'TypeScript Native (tsgo)'
  );
  results.push({ name: 'tsgo (native)', ...tsgoResult });
  
  // Display results
  log('\n' + '─'.repeat(70), 'dim');
  log('RESULTS SUMMARY', 'bright');
  log('─'.repeat(70), 'dim');
  
  const tscTime = results.find(r => r.name === 'tsc --incremental')?.duration || 0;
  const tsgoTime = results.find(r => r.name === 'tsgo (native)')?.duration || 0;
  
  results.forEach(result => {
    const status = result.success ? colors.green + '✓' : colors.red + '✗';
    log(`${status} ${result.name.padEnd(25)} ${formatTime(result.duration).padStart(10)}${colors.reset}`);
  });
  
  if (tscTime && tsgoTime) {
    log('\n' + '─'.repeat(70), 'dim');
    log(`Speedup: ${formatSpeedup(tscTime, tsgoTime)}`, 'green');
    log('─'.repeat(70), 'dim');
  }
  
  return results;
}

async function benchmarkTests() {
  log('\n' + '═'.repeat(70), 'magenta');
  log('TEST RUNNER BENCHMARK', 'magenta');
  log('═'.repeat(70), 'magenta');
  
  const results = [];
  
  // Benchmark 1: Standard vitest
  const vitestResult = runCommand(
    'pnpm vitest run --reporter=verbose 2>&1 | tail -50',
    'Standard Vitest (forks pool)'
  );
  results.push({ name: 'vitest (forks)', ...vitestResult });
  
  // Benchmark 2: Vitest with threads
  const vitestThreadsResult = runCommand(
    'pnpm vitest run --pool=threads --reporter=verbose 2>&1 | tail -50',
    'Vitest with Threads'
  );
  results.push({ name: 'vitest (threads)', ...vitestThreadsResult });
  
  // Display results
  log('\n' + '─'.repeat(70), 'dim');
  log('RESULTS SUMMARY', 'bright');
  log('─'.repeat(70), 'dim');
  
  const forksTime = results.find(r => r.name === 'vitest (forks)')?.duration || 0;
  const threadsTime = results.find(r => r.name === 'vitest (threads)')?.duration || 0;
  
  results.forEach(result => {
    const status = result.success ? colors.green + '✓' : colors.red + '✗';
    log(`${status} ${result.name.padEnd(25)} ${formatTime(result.duration).padStart(10)}${colors.reset}`);
  });
  
  if (forksTime && threadsTime) {
    log('\n' + '─'.repeat(70), 'dim');
    log(`Speedup: ${formatSpeedup(forksTime, threadsTime)}`, 'green');
    log('─'.repeat(70), 'dim');
  }
  
  return results;
}

function printSystemInfo() {
  log('\n' + '═'.repeat(70), 'blue');
  log('SYSTEM INFORMATION', 'blue');
  log('═'.repeat(70), 'blue');
  log(`Platform: ${os.platform()} ${os.arch()}`, 'dim');
  log(`CPUs: ${os.cpus().length} cores (${os.cpus()[0].model})`, 'dim');
  log(`Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB total`, 'dim');
  log(`Node.js: ${process.version}`, 'dim');
  log('═'.repeat(70) + '\n', 'blue');
}

function printRecommendations() {
  log('\n' + '═'.repeat(70), 'cyan');
  log('RECOMMENDED COMMANDS', 'cyan');
  log('═'.repeat(70), 'cyan');
  
  log('\n🚀 Fast Type Checking:', 'yellow');
  log('   pnpm typecheck:fast    # Uses tsgo (native compiler)', 'dim');
  log('   pnpm typecheck:watch   # Watch mode with tsgo', 'dim');
  
  log('\n🧪 Fast Testing:', 'yellow');
  log('   pnpm test:fast         # Uses thread pool for parallel execution', 'dim');
  log('   pnpm test:ci           # Optimized for CI environments', 'dim');
  
  log('\n⚡ Build & Transpile:', 'yellow');
  log('   pnpm build:fast        # Optimized production build', 'dim');
  log('   pnpm transpile:swc     # SWC-based fast transpilation', 'dim');
  
  log('\n📊 Benchmarking:', 'yellow');
  log('   pnpm perf:benchmark    # Run full performance comparison', 'dim');
  
  log('');
}

// Main execution
const command = process.argv[2] || 'all';

printSystemInfo();

if (command === 'typecheck' || command === 'all') {
  benchmarkTypeCheck();
}

if (command === 'test' || command === 'all') {
  benchmarkTests();
}

printRecommendations();
