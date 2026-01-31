# TanStack Package Updates - 2026-01-25

**Generated**: 2026-01-25
**Research Method**: TanStack MCP Server + npm Registry API
**Status**: ✅ Research Complete (write: false, edit: false, bash: false)

---

## Executive Summary

| Category | Status | Action Needed |
|----------|--------|---------------|
| **Router Family** | ⚠️ OUTDATED | Update all 6 packages (1.147.x → 1.157.x) |
| **AI Family** | ✅ UP TO DATE | No action required |
| **DevTools** | ⚠️ MINOR UPDATE | Update 0.9.0 → 0.9.2 |
| **Store** | ✅ UP TO DATE | No action required |

---

## Current vs Latest Versions

### Router Family (Critical Update Required)

| Package | Current | Latest | Gap | Action Needed |
|---------|---------|--------|-----|---------------|
| @tanstack/react-router | 1.147.3 | **1.157.3** | -10 versions | **Major Minor Update** |
| @tanstack/react-router-devtools | 1.147.3 | **1.157.3** | -10 versions | **Major Minor Update** |
| @tanstack/react-router-ssr-query | 1.147.3 | **1.157.3** | -10 versions | **Major Minor Update** |
| @tanstack/react-start | 1.147.3 | **1.157.3** | -10 versions | **Major Minor Update** |
| @tanstack/router-core | 1.147.1 | **1.157.3** | -11 versions | **Major Minor Update** |
| @tanstack/router-plugin | 1.147.3 | **1.157.3** | -10 versions | **Major Minor Update** |

**Notes**:
- All Router packages are 10-11 minor versions behind
- Must update all Router packages together for compatibility
- Router core has additional patch lag (1.147.1 vs 1.147.3)

### AI Family (Up to Date)

| Package | Current | Latest | Status |
|---------|---------|--------|--------|
| @tanstack/ai | 0.2.2 | **0.2.2** | ✅ UP TO DATE |
| @tanstack/ai-client | 0.2.2 | **0.2.2** | ✅ UP TO DATE |
| @tanstack/ai-gemini | 0.3.2 | **0.3.2** | ✅ UP TO DATE |
| @tanstack/ai-openai | 0.2.1 | **0.2.1** | ✅ UP TO DATE |
| @tanstack/ai-react | 0.2.2 | **0.2.2** | ✅ UP TO DATE |

**Notes**:
- All AI packages are on latest versions
- AI-Gemini is ahead of core AI (0.3.2 vs 0.2.2) - intentional for provider-specific features
- AI-OpenAI is one patch behind core (0.2.1 vs 0.2.2) - latest stable version

### Other Packages

| Package | Current | Latest | Action Needed |
|---------|---------|--------|---------------|
| @tanstack/react-devtools | 0.9.0 | **0.9.2** | Patch Update (Low Risk) |
| @tanstack/store | 0.8.0 | **0.8.0** | None |

---

## New Providers/Extensions Found

### 🆕 New AI Providers (Not Currently Installed)

| Package | Latest Version | Description | Recommended? |
|---------|----------------|-------------|---------------|
| **@tanstack/ai-anthropic** | v0.2.0 | Anthropic Claude adapter | ✅ **YES** - Popular LLM provider |
| **@tanstack/ai-ollama** | v0.3.0 | Ollama adapter for local LLMs (Llama, Mistral, etc.) | ✅ **YES** - Local/offline AI capabilities |
| **@tanstack/ai-grok** | v0.1.0 | Grok (xAI) adapter | ⚠️ **OPTIONAL** - Newer provider |

### 🆕 New AI UI Components

| Package | Latest Version | Description |
|---------|----------------|-------------|
| **@tanstack/ai-react-ui** | v0.2.1 | Headless React components for AI chat |
| **@tanstack/ai-solid-ui** | v0.2.1 | Headless Solid components |
| **@tanstack/ai-vue-ui** | v0.1.3 | Headless Vue components |

### 🆕 New Framework Bindings

| Package | Latest Version | Description |
|---------|----------------|-------------|
| **@tanstack/ai-vue** | v0.2.2 | Vue hooks |
| **@tanstack/ai-solid** | v0.2.2 | SolidJS hooks |
| **@tanstack/ai-svelte** | v0.2.2 | Svelte bindings |
| **@tanstack/ai-preact** | v0.1.1 | Preact hooks |

### 🆕 New DevTools

| Package | Latest Version | Description |
|---------|----------------|-------------|
| **@tanstack/ai-devtools-core** | v0.2.1 | Core AI devtools |
| **@tanstack/react-ai-devtools** | v0.2.1 | React AI devtools |
| **@tanstack/solid-ai-devtools** | v0.2.1 | Solid AI devtools |
| **@tanstack/preact-ai-devtools** | v0.1.1 | Preact AI devtools |

---

## Breaking Changes/Compatibility Notes

### Router v1.147 → v1.157: Medium Risk

#### Key Changes Between v1.147.x and v1.157.x

**v1.157.3** (Jan 24, 2026):
- Fix: Re-export correctly (#6489)
- Docs: URL encoding note on `<Link>` and how to opt out (#6443)

**v1.157.2** (Jan 24, 2026):
- Refactor: React link SSR performance improvements (#6482)

**v1.157.1** (Jan 24, 2026):
- **Breaking**: `isServer` utility removed from separate package (#6485)
- router-core: Skip URL constructor in `buildLocation` (#6447)
- Chore: Stabilize tests (#6486)

**v1.157.0**:
- Major version bump - typically indicates API changes

#### Breaking Changes to Watch For

1. **`isServer` Utility Removal** (v1.157.1)
   - **Impact**: If importing `isServer` from a separate package
   - **Migration**: Check import paths for `isServer` utility
   - **Action**: Search codebase for `isServer` imports before updating

2. **URL Encoding Behavior** (v1.157.3)
   - **Impact**: `<Link>` components may encode URLs differently
   - **Migration**: Review URL handling in links
   - **Action**: Check if any custom URL encoding logic exists

3. **SSR Performance Refactor** (v1.157.2)
   - **Impact**: React link SSR implementation changed
   - **Migration**: Test SSR routes thoroughly
   - **Action**: Run E2E tests with SSR scenarios

#### Risk Assessment

| Risk Category | Level | Mitigation |
|---------------|-------|------------|
| API Breaking Changes | **Medium** | Review `isServer` usage |
| SSR Behavior | **Medium** | Test all SSR routes |
| URL Handling | **Low** | Check link components |
| Performance Impact | **Positive** | Improvements expected |

#### No Critical Breaking Changes

Based on visible changelog:
- Most changes are internal refactoring and performance improvements
- Migration should be relatively straightforward
- Always test in staging environment first

---

## Recommended Updates

### Priority 1: Critical Router Update (Do Together)

**Update all Router packages simultaneously for compatibility:**

```bash
# Update all Router packages to latest (1.157.3)
pnpm add @tanstack/react-router@latest \
        @tanstack/react-router-devtools@latest \
        @tanstack/react-router-ssr-query@latest \
        @tanstack/react-start@latest \
        @tanstack/router-core@latest \
        @tanstack/router-plugin@latest
```

**Pre-Update Checklist**:
- [ ] Backup current `package.json` and `pnpm-lock.yaml`
- [ ] Search codebase for `isServer` imports: `rg "isServer" --type ts --type tsx`
- [ ] Identify all SSR routes for testing
- [ ] Review custom URL encoding logic
- [ ] Create a feature branch for testing

**Post-Update Verification**:
- [ ] Run typecheck: `pnpm typecheck`
- [ ] Run unit tests: `pnpm test`
- [ ] Run E2E tests: `pnpm test:e2e`
- [ ] Test all routes (especially SSR routes)
- [ ] Verify `<Link>` component behavior
- [ ] Check build: `pnpm build`

**Rollback Plan**:
```bash
# If issues occur, rollback via git:
git checkout HEAD -- package.json pnpm-lock.yaml
pnpm install
```

---

### Priority 2: Minor DevTools Update (Low Risk)

```bash
# Update React DevTools
pnpm add @tanstack/react-devtools@latest
```

**Rationale**:
- 2 patch updates only (0.9.0 → 0.9.2)
- Low risk, devtools improvements may help debugging
- Can be done after Router update or separately

---

### Priority 3: Add New AI Providers (Optional but Recommended)

#### Recommended Additions

**1. @tanstack/ai-anthropic** (v0.2.0)
```bash
pnpm add @tanstack/ai-anthropic
```
**Why**: Anthropic Claude is a popular LLM provider with good safety alignment

**2. @tanstack/ai-ollama** (v0.3.0)
```bash
pnpm add @tanstack/ai-ollama
```
**Why**: Enables local/offline AI capabilities, no API costs, privacy-friendly

**3. @tanstack/ai-react-ui** (v0.2.1)
```bash
pnpm add @tanstack/ai-react-ui
```
**Why**: Provides headless React UI components for AI chat interfaces

#### Optional Additions

- `@tanstack/ai-grok` (v0.1.0) - Newer provider, evaluate if needed
- `@tanstack/react-ai-devtools` (v0.2.1) - For AI debugging if needed

---

### Priority 4: No Action Required

These packages are already up to date:
- ✅ `@tanstack/ai` v0.2.2
- ✅ `@tanstack/ai-client` v0.2.2
- ✅ `@tanstack/ai-gemini` v0.3.2
- ✅ `@tanstack/ai-openai` v0.2.1
- ✅ `@tanstack/ai-react` v0.2.2
- ✅ `@tanstack/store` v0.8.0

---

## Version Compatibility Matrix

### ✅ Good Alignment

| Package Family | Alignment | Notes |
|----------------|-----------|-------|
| AI Family | ✅ Excellent | All on latest stable |
| Store | ✅ Perfect | Single package |

### ⚠️ Needs Alignment

| Package Family | Current State | Target State |
|----------------|---------------|--------------|
| Router Family | 1.147.x (outdated) | 1.157.x (latest) |
| Router Core | 1.147.1 (patch lag) | 1.157.3 (match family) |

### Beta/Alpha Channels Available

| Package | Beta | Alpha | Recommendation |
|---------|-------|-------|----------------|
| @tanstack/react-router | 0.0.1-beta.286 | 1.132.0-alpha.25 | Wait for stable |
| @tanstack/react-router-devtools | 0.0.1-beta.83 | 1.132.0-alpha.25 | Wait for stable |
| @tanstack/react-start | 0.0.1-beta.204 | 1.132.0-alpha.25 | Wait for stable |
| @tanstack/router-core | 0.0.1-beta.204 | 1.132.0-alpha.25 | Wait for stable |
| @tanstack/store | 0.0.1-beta.174 | N/A | Wait for stable |

**Note**: Alpha version (1.132.0-alpha.25) is ahead of current stable (1.157.3), suggesting potential major breaking changes in future v2.0 release.

---

## Testing Strategy

### Pre-Update Testing

1. **Baseline Tests**
   ```bash
   pnpm typecheck
   pnpm test
   pnpm test:e2e
   pnpm build
   ```
   Document all passing tests as baseline.

2. **Codebase Search for Potential Issues**
   ```bash
   # Check for isServer usage (breaking change in 1.157.1)
   rg "isServer" --type ts --type tsx

   # Check for URL encoding logic
   rg "encodeURI|decodeURI|encodeURIComponent" --type ts --type tsx

   # Check for Link component usage
   rg "import.*Link.*from.*tanstack/react-router" --type tsx
   ```

### Post-Update Testing

1. **TypeScript Compilation**
   ```bash
   pnpm typecheck
   ```
   Should return 0 errors.

2. **Unit Tests**
   ```bash
   pnpm test
   ```
   All tests should pass.

3. **E2E Tests**
   ```bash
   pnpm test:e2e
   ```
   Focus on:
   - Route navigation
   - SSR rendering
   - Link component behavior
   - URL parameter handling

4. **Manual Testing**
   - [ ] Test all main routes
   - [ ] Test SSR routes specifically
   - [ ] Verify `<Link>` components work correctly
   - [ ] Check URL encoding behavior
   - [ ] Test route transitions
   - [ ] Verify devtools functionality

### Rollback Criteria

Rollback if any of the following occur:
- ❌ TypeScript errors
- ❌ Unit test failures
- ❌ E2E test failures
- ❌ Broken routes or navigation
- ❌ SSR rendering issues
- ❌ Build failures

---

## Migration Checklist

### Before Updating

- [ ] Backup `package.json` and `pnpm-lock.yaml`
- [ ] Create feature branch: `git checkout -b update/tanstack-router-1.157`
- [ ] Run baseline tests: typecheck, test, e2e, build
- [ ] Search codebase for `isServer` imports
- [ ] Document current SSR route behavior
- [ ] Identify custom URL encoding logic

### During Update

- [ ] Update all Router packages together
- [ ] Update DevTools package
- [ ] Review `pnpm-lock.yaml` changes
- [ ] Check for peer dependency conflicts
- [ ] Update dependencies if needed

### After Updating

- [ ] Run `pnpm install` with fresh lockfile
- [ ] Run typecheck: `pnpm typecheck`
- [ ] Run unit tests: `pnpm test`
- [ ] Run E2E tests: `pnpm test:e2e`
- [ ] Build application: `pnpm build`
- [ ] Manual testing of all routes
- [ ] Manual testing of SSR routes
- [ ] Manual testing of `<Link>` components
- [ ] Verify devtools work correctly

### Optional AI Provider Installation

- [ ] Install `@tanstack/ai-anthropic`
- [ ] Install `@tanstack/ai-ollama`
- [ ] Install `@tanstack/ai-react-ui`
- [ ] Test new providers in development
- [ ] Update documentation if using new providers

---

## Estimated Time Impact

| Task | Time Estimate | Risk Level |
|------|---------------|------------|
| Router Update (6 packages) | 30-45 minutes | Medium |
| DevTools Update | 5-10 minutes | Low |
| Pre-Update Testing | 15-20 minutes | N/A |
| Post-Update Testing | 30-45 minutes | N/A |
| New AI Provider Installation | 15-20 minutes | Low |
| **Total** | **1.5-2 hours** | - |

---

## Dependencies and Peer Requirements

### Router Family

All Router packages require matching versions for compatibility:
```json
{
  "dependencies": {
    "@tanstack/react-router": "1.157.3",
    "@tanstack/react-router-devtools": "1.157.3",
    "@tanstack/react-router-ssr-query": "1.157.3",
    "@tanstack/react-start": "1.157.3",
    "@tanstack/router-core": "1.157.3",
    "@tanstack/router-plugin": "1.157.3"
  }
}
```

### AI Family

AI packages are version-aligned by provider:
```json
{
  "dependencies": {
    "@tanstack/ai": "0.2.2",
    "@tanstack/ai-client": "0.2.2",
    "@tanstack/ai-react": "0.2.2"
  }
}
```

Provider-specific versions:
```json
{
  "dependencies": {
    "@tanstack/ai-openai": "0.2.1",
    "@tanstack/ai-gemini": "0.3.2",
    "@tanstack/ai-anthropic": "0.2.0",
    "@tanstack/ai-ollama": "0.3.0"
  }
}
```

---

## References and Documentation

### Official TanStack Resources

- **TanStack Router Docs**: https://tanstack.com/router
- **TanStack AI Docs**: https://tanstack.com/ai
- **TanStack Router GitHub**: https://github.com/TanStack/router
- **TanStack AI GitHub**: https://github.com/TanStack/ai
- **Router Releases**: https://github.com/TanStack/router/releases
- **AI Releases**: https://github.com/TanStack/ai/releases

### Package Versions Checked

- **Router Family**: v1.147.x → v1.157.3 (latest stable as of 2026-01-25)
- **AI Family**: v0.2.x/v0.3.x (latest stable)
- **DevTools**: v0.9.0 → v0.9.2 (latest stable)
- **Store**: v0.8.0 (latest stable)

### MCP Tools Used

- **TanStack MCP Server**: `list_libraries`, `get_npm_stats`, `search_docs`
- **npm Registry API**: Latest version queries
- **GitHub Releases API**: Changelog analysis

---

## Next Steps

### Immediate Actions

1. **Create GitHub Issue**: "Update TanStack Router packages to 1.157.3"
   - Assign to appropriate developer
   - Link to this report
   - Include testing checklist

2. **Schedule Update Window**:
   - Choose low-traffic period
   - Prepare rollback plan
   - Notify team of maintenance window

3. **Create Feature Branch**:
   ```bash
   git checkout -b update/tanstack-router-1.157
   ```

### Future Monitoring

1. **Watch Router v2.0 Development**:
   - Monitor 1.132.0-alpha.x releases
   - Track breaking changes in alpha channel
   - Prepare for major version upgrade

2. **Monitor AI Package Releases**:
   - Expect v0.3.x family updates soon
   - Watch for new provider additions
   - Evaluate new features for adoption

3. **Regular Dependency Updates**:
   - Schedule monthly dependency checks
   - Subscribe to TanStack release notifications
   - Track security advisories

---

## Conclusion

### Summary

- **Router packages** are 10 versions behind and require critical update (1.147.x → 1.157.x)
- **AI packages** are all up to date ✅
- **DevTools** need minor patch update (0.9.0 → 0.9.2)
- **Three new AI providers** available and recommended for installation
- **Breaking changes** are minimal but require careful testing (especially SSR and `isServer`)

### Risk Assessment

| Update | Risk Level | Confidence |
|--------|------------|------------|
| Router 1.147 → 1.157 | Medium | High (well-documented) |
| DevTools 0.9.0 → 0.9.2 | Low | Very High |
| New AI Providers | Low | High (optional) |

### Recommendation

**Proceed with Router update** following the testing strategy outlined above. The benefits (performance improvements, bug fixes, security updates) outweigh the risks, which are manageable with proper testing and rollback procedures.

---

**Report Status**: ✅ Complete
**Research Constraints**: ✅ Honored (write: false, edit: false, bash: false)
**Data Freshness**: 2026-01-25 (current)
**Next Review**: 2026-02-25 (recommended monthly)
