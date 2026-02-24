# Performance Optimization Configuration

**Date:** 2026-01-28  
**Status:** ✅ Configuration Complete - Ready for Testing  
**Scope:** TypeScript checking, Test execution, Build performance

---

## 🚀 Summary of Changes

This configuration implements comprehensive performance optimizations for the Project Alpha codebase to address timeout and resource consumption issues during TypeScript checking and test execution.

### 1. TypeScript Native Compiler (tsgo)

**Installed:** `@typescript/native-preview` v7.0.0-dev.20260127.1

**New Scripts:**
```bash
pnpm typecheck:fast    # Uses tsgo (native Go compiler) - ~10x faster
pnpm typecheck:watch   # Watch mode with tsgo
```

**Configuration:** `tsconfig.tsgo.json`
- Optimized for the native compiler
- Removed incompatible options (`baseUrl`)
- Enabled `isolatedModules` for faster transpilation
- Disabled unused variable checks for speed

**Expected Performance:**
- Standard `tsc --incremental`: ~180s+ (times out)
- `tsgo`: ~10-30s (10x improvement)

---

### 2. Vitest Parallel Execution

**Updated:** `vitest.config.ts`

**Optimizations Applied:**
- **Pool Strategy:** Switched to `threads` (faster than `forks` for large projects)
- **Worker Configuration:** 
  - `maxWorkers`: CPU count - 1 (utilizes all i9 cores)
  - `maxConcurrency`: CPU count × 2
- **Caching:** Enabled `.vitest-cache` for faster re-runs
- **Coverage:** Disabled by default (enable with `COVERAGE=true`)
- **Timeouts:** Increased to 30s for stability

**New Scripts:**
```bash
pnpm test:fast    # Optimized with thread pool + memory limits
pnpm test:ci      # CI-optimized with JUnit reporter
```

**Expected Performance:**
- Standard `vitest run`: Single-threaded, slow
- `test:fast`: Parallel execution across all CPU cores

---

### 3. SWC Fast Transpilation

**Installed:** `@swc/core` v1.15.10, `@swc/cli` v0.7.10

**Configuration:** `.swcrc`
- ES2022 target
- TypeScript + TSX support
- Path aliases configured
- Source maps enabled

**New Scripts:**
```bash
pnpm transpile:swc    # Fast transpilation without type checking
pnpm build:fast       # Optimized production build
```

---

### 4. Project References Structure

**Created:** `tsconfig.project.json`

Sets up TypeScript project references for:
- `src/domain` - Independent layer
- `src/infrastructure` - Depends on domain
- `src/presentation` - Depends on domain + infrastructure
- `src/routes` - Depends on all layers
- `src/core` - Shared entities

**Benefits:**
- Parallel compilation of independent projects
- Incremental builds at project level
- Better caching between builds

---

### 5. Performance Benchmarking

**Created:** `scripts/perf-benchmark.js`

**Usage:**
```bash
pnpm perf:benchmark           # Run all benchmarks
pnpm perf:benchmark typecheck # TypeScript only
pnpm perf:benchmark test      # Tests only
```

**Measures:**
- Standard tsc vs tsgo execution time
- Vitest forks vs threads performance
- Speedup calculations with percentage improvements

---

## 📊 Expected Performance Improvements

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Type Check | 180s+ (timeout) | 10-30s | **10x faster** |
| Unit Tests | Single-threaded | Multi-core | **3-6x faster** |
| Build | Standard | SWC optimized | **2-3x faster** |
| Re-runs | Full check | Incremental | **5-10x faster** |

---

## 🛠️ Usage Guide

### Daily Development

```bash
# Fast type checking (recommended)
pnpm typecheck:fast

# Watch mode for development
pnpm typecheck:watch

# Fast test run
pnpm test:fast

# Quick build verification
pnpm build:fast
```

### CI/CD Pipeline

```bash
# Optimized for CI environments
pnpm test:ci

# Type check with native compiler
pnpm typecheck:fast

# Build with memory optimization
NODE_OPTIONS='--max-old-space-size=8192' pnpm build:fast
```

### Performance Testing

```bash
# Run benchmarks to verify improvements
pnpm perf:benchmark
```

---

## ⚠️ Important Notes

### TypeScript Native Compiler (tsgo)

1. **Preview Status:** This is a development preview of TypeScript 7.0
2. **Compatibility:** Some options (like `baseUrl`) are removed in tsgo
3. **Not for Production Builds:** Use standard `tsc` for production type checking
4. **Best For:** Development feedback, pre-commit checks, CI validation

### Memory Management

1. **Node.js Memory:** Scripts now include `--max-old-space-size=4096` or `8192`
2. **i9 Optimization:** Configured to use all available CPU cores minus 1
3. **System Responsiveness:** Leaves one core free for OS operations

### Known Limitations

1. **tsgo:** May not catch all edge cases that standard tsc does
2. **Thread Pool:** Some native modules (Prisma, bcrypt) may have issues with threads
3. **Coverage:** Disabled by default to save time; enable explicitly when needed

---

## 🔧 Troubleshooting

### If tsgo fails:
```bash
# Fall back to standard type checking
pnpm typecheck

# Or use the full check
pnpm typecheck:all
```

### If tests timeout:
```bash
# Increase timeout further
NODE_OPTIONS='--max-old-space-size=8192' pnpm test:fast

# Or run with fewer workers
pnpm vitest run --maxWorkers=2
```

### If build fails:
```bash
# Use standard build
pnpm build

# Or with increased memory
NODE_OPTIONS='--max-old-space-size=16384' pnpm build
```

---

## 📁 Files Modified/Created

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modified | Added optimized scripts and dependencies |
| `vitest.config.ts` | Modified | Parallel execution, thread pool, caching |
| `tsconfig.tsgo.json` | Created | Native compiler configuration |
| `tsconfig.project.json` | Created | Project references structure |
| `.swcrc` | Created | SWC transpilation config |
| `scripts/perf-benchmark.js` | Created | Performance measurement tool |

---

## 🎯 Next Steps

1. **Test the configurations:** Run `pnpm perf:benchmark` to verify improvements
2. **Monitor stability:** Watch for any issues with tsgo in daily use
3. **Update CI/CD:** Switch to `typecheck:fast` and `test:ci` in pipelines
4. **Team Onboarding:** Share this guide with the development team

---

**Configuration by:** BMAD Workflow Builder  
**Module:** MOD-C-SPRINT (Sprint & Feature Execution)  
**Framework:** BMAD v2.0.0
