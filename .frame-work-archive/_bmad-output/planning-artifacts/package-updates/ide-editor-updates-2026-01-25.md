# IDE/Editor Package Updates - 2026-01-25

## Current vs Latest Versions

| Package | Current | Latest | Action Needed |
|---------|---------|--------|---------------|
| @monaco-editor/react | 4.7.0 | 4.8.0-rc.3 | **Optional** - Release Candidate available |
| monaco-editor | 0.55.1 | 0.55.1 | None - Up to date |
| @webcontainer/api | 1.6.1 | 1.6.1 | None - Up to date (verification limited) |
| @xterm/xterm | 6.0.0 | 6.0.0 | None - Up to date |
| @xterm/addon-fit | 0.11.0 | 0.11.0 | None - Up to date |
| @xterm/addon-search | 0.16.0 | 0.16.0 | None - Up to date |
| @xterm/addon-web-links | 0.12.0 | 0.12.0 | None - Up to date |
| isomorphic-git | 1.36.1 | 1.36.1 | None - Up to date |

## New Addons/Extensions Found

### xterm Addons (Not Currently Installed)

| Addon | Version | Description | Priority |
|-------|---------|-------------|----------|
| @xterm/addon-serialize | 0.14.0 | State serialization - Export buffer as VT sequences or HTML | P2 - Nice to have |
| @xterm/addon-webgl | 0.19.0 | GPU acceleration - High-performance rendering using WebGL2 | P1 - Performance critical |
| @xterm/addon-unicode11 | 0.9.0 | Unicode compliance - Updated to Unicode 11.0 standard | P2 - Emoji/CJK support |

### Recommended for WebContainer-based IDE:
- **@xterm/addon-webgl** - GPU rendering for large terminals
- **@xterm/addon-serialize** - Terminal state persistence for session recovery

## Breaking Changes/Compatibility Notes

### Monaco Editor Compatibility

#### v0.53.0 - 0.55.1 Range (Current: 0.55.1)
**Breaking Changes:**
- AMD build deprecated in 0.53.0 - ESM build required
- AMD internal modules no longer accessible
- Browser script editor scenario no longer works (use bundler)

#### v0.55.0 Specific Breaking Changes:
- **Nested namespaces moved to top level:**
  - `languages.css` → `css`
  - `languages.html` → `html`
  - `languages.json` → `json`
  - `languages.typescript` → `typescript`
- Migration needed if using these namespaces

#### React Wrapper Compatibility
**@monaco-editor/react 4.7.0 uses monaco-editor 0.52.2**
**@monaco-editor/react 4.8.0-rc.3 uses monaco-editor 0.54.0**

**⚠️ Potential Issue:**
- Current monaco-editor (0.55.1) is ahead of @monaco-editor/react (4.7.0)
- @monaco-editor/react 4.7.0 loader expects monaco-editor v0.52.2
- Upgrade path: Update both to ensure compatibility

**Recommended Path:**
1. Update `@monaco-editor/react` to 4.8.0-rc.3 (brings monaco 0.54.0)
2. Then upgrade `monaco-editor` to 0.55.1 if needed
3. Or wait for @monaco-editor/react 4.8.0 stable with monaco 0.55.0 support

### xterm.js Compatibility
- All installed packages are on version 6.0.0 (latest stable)
- No breaking changes between installed versions
- Addons match core version properly

### WebContainer API
- Current version: 1.6.1
- No breaking changes documented in available research
- Verification limited due to access restrictions

## Recommended Updates

### Priority 1 - Critical
**None** - All packages are up to date or on stable versions

### Priority 2 - Performance Enhancement
1. **Install @xterm/addon-webgl**
   ```bash
   pnpm add @xterm/addon-webgl
   ```
   - Enables GPU-accelerated terminal rendering
   - Critical for WebContainer-based IDE with large terminal output
   - Version: 0.19.0 (compatible with @xterm/xterm 6.0.0)

### Priority 3 - React Wrapper Update (Optional)
1. **Update @monaco-editor/react to 4.8.0-rc.3**
   ```bash
   pnpm add @monaco-editor/react@4.8.0-rc.3
   ```
   - Brings monaco-editor loader to v1.7.0
   - Supports monaco-editor v0.54.0
   - **⚠️ Wait for 4.8.0 stable for production use**

### Priority 4 - Feature Enhancements
1. **Install @xterm/addon-serialize**
   ```bash
   pnpm add @xterm/addon-serialize
   ```
   - Terminal state persistence
   - Session recovery functionality

2. **Install @xterm/addon-unicode11**
   ```bash
   pnpm add @xterm/addon-unicode11
   ```
   - Better emoji and CJK character support
   - Updated Unicode 11.0 standard

## Update Order (If Applying Multiple Updates)

**Scenario 1: Install xterm addons only**
```bash
# Safe to install in any order
pnpm add @xterm/addon-webgl
pnpm add @xterm/addon-serialize
pnpm add @xterm/addon-unicode11
```

**Scenario 2: Update Monaco React wrapper**
```bash
# Step 1: Update React wrapper first
pnpm add @monaco-editor/react@4.8.0-rc.3

# Step 2: Verify monaco-editor compatibility
# - @monaco-editor/react 4.8.0-rc.3 expects monaco 0.54.0
# - Keep monaco-editor at 0.55.1 if needed for features
# - Or downgrade monaco-editor to 0.54.0 for exact match
```

## Testing Recommendations

After any updates:

1. **Monaco Editor:**
   - Test editor initialization
   - Verify TypeScript language features
   - Check IntelliSense completion
   - Test diff editor (if used)

2. **xterm Terminal:**
   - Verify terminal initialization
   - Test addon loading
   - Check WebGL rendering performance
   - Test Unicode/emoji display

3. **WebContainer:**
   - Verify container spawn
   - Test terminal communication
   - Check file operations

## Summary

**Status:** ✅ All packages are on stable, up-to-date versions

**Actions Required:**
- **Optional:** Install @xterm/addon-webgl for performance
- **Optional:** Install @xterm/addon-serialize for session recovery
- **Optional:** Update @monaco-editor/react when 4.8.0 stable is released

**No Critical Updates Needed**

---

**Research Date:** 2026-01-25
**Sources:**
- GitHub repositories: suren-atoyan/monaco-react, microsoft/monaco-editor, xtermjs/xterm.js, stackblitz/webcontainer-core
- Package.json files from official repositories
- CHANGELOG.md files from official repositories
- Isomorphic-git: Uses semantic-release (0.0.0-development indicates active development)
