import { defineConfig } from 'vitest/config'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import os from 'os'

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    
    // ========================================
    // PERFORMANCE OPTIMIZATIONS
    // ========================================
    
    // Enable parallel test execution with worker threads
    // 'threads' is faster than 'forks' for larger projects
    pool: 'threads',
    
    // Worker configuration for maximum CPU utilization
    // Uses all CPU cores minus 1 to keep system responsive
    maxWorkers: Math.max(4, os.cpus().length - 1),
    
    // Isolate tests in each file but allow parallel file execution
    isolate: true,
    
    // Increase concurrency for large test suites
    // Prevents bottlenecks on memory-intensive tests
    maxConcurrency: Math.max(8, os.cpus().length * 2),
    
    // Cache test results between runs
    // Dramatically speeds up re-runs by skipping unchanged tests
    cache: {
      dir: '.vitest-cache',
    },
    
    // Fail fast in CI to save time
    bail: process.env.CI ? 3 : 0,
    
    // Reporter configuration for performance
    reporters: process.env.CI 
      ? ['default', 'junit'] 
      : ['default', 'verbose'],
    
    // Coverage configuration (only when explicitly requested)
    coverage: {
      provider: 'v8',
      enabled: process.env.COVERAGE === 'true',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // Exclude large vendor directories from coverage
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mocks/**',
      ],
    },
    
    // Test timeout configuration
    testTimeout: 30000, // 30 seconds default
    hookTimeout: 30000,
    
    // File patterns for faster discovery
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.vinxi/**',
      '**/.output/**',
      '**/e2e/**',
    ],
  },
  
  // Optimize dependency pre-bundling
  optimizeDeps: {
    exclude: [
      '@xenova/transformers',
      'onnxruntime-node',
      'sharp',
    ],
  },
  
  // Build configuration for tests
  build: {
    // Use esbuild for faster transforms
    target: 'es2022',
    minify: false,
    sourcemap: true,
  },
  
  // Resolve configuration
  resolve: {
    conditions: ['development'],
  },
})
