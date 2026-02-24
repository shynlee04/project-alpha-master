# Project Alpha - Codebase Packfile Quick Reference

**Generated**: 2026-01-02
**Tool**: Repomix v1.11.0

---

## Packfiles Available

### 1. Source Code Packfile (Recommended)
```
File: project-alpha-packfile.xml
Size: 2.6 MB (uncompressed), 548 KB (compressed)
Files: 1,046 files
Tokens: 635,313 tokens
Use: Feature development, code review, architecture analysis
```

### 2. Full Repository Packfile (Complete)
```
File: project-alpha-full-packfile.xml
Size: 76 MB (uncompressed), 18 MB (compressed)
Files: 4,460 files
Tokens: ~2.8M tokens
Use: Comprehensive analysis, documentation review, research
```

---

## Quick Start

### For AI Code Analysis
```bash
# Source code (faster loading)
gunzip -c project-alpha-packfile.xml.gz | your-ai-tool

# Full repository (complete context)
gunzip -c project-alpha-full-packfile.xml.gz | your-ai-tool
```

### For Web UI
```
1. Visit: https://repomix.com
2. Upload: project-alpha-packfile.xml (or full packfile)
3. Explore: Interactive codebase visualization
```

### For Command Line
```bash
# View structure
head -100 project-alpha-packfile.xml

# Search components
grep -i "component" project-alpha-packfile.xml | head -20

# Extract specific files
grep -A 50 'AgentConfigDialog.tsx' project-alpha-packfile.xml
```

---

## Key Statistics

### Source Code Distribution
- **React Components**: 294 total
  - IDE workspace: 80+
  - Knowledge: 15
  - Study: 12
  - Notes: 10
  - UI primitives: 50+

- **State Stores**: 71 total
  - lib/state: 25 stores
  - stores: 8 stores (deprecated)
  - infrastructure/persistence/stores: 38+ stores

- **Test Files**: 40+ (excluded from packfile)

### Architecture Layers
1. **Core** (src/core): Domain entities, rules
2. **Domain** (src/domain): Services, use cases
3. **Infrastructure** (src/infrastructure): Persistence, events
4. **Presentation** (src/presentation): UI components

### Technology Stack
- React 19.2.3, TanStack Router 1.144.0
- Zustand 5.0.9, Dexie 4.2.1
- TanStack AI 0.2.0, @google/genai 1.34.0
- Monaco Editor 0.55.1, xterm.js 6.0.0
- Tailwind CSS 4.1.18, Vite 7.3.0

---

## What's Included

### Source Packfile
✅ Source code (src/)
✅ Core architecture
✅ All React components
✅ State management
✅ AI agent infrastructure
✅ RAG system
✅ Knowledge graph
✅ File system sync

❌ Build artifacts
❌ Dependencies (node_modules)
❌ Test files
❌ Translation raw files
❌ Mock data
❌ Documentation (root docs)

### Full Packfile
✅ Everything in source packfile
✅ Documentation (_bmad-output/, docs/)
✅ BMAD workflows (.bmad/, .cursor/, .claude/, .agent/)
✅ Configuration files
✅ Research artifacts
✅ Project planning docs
✅ AGENTS.md, CLAUDE.md, README.md

❌ node_modules
❌ Build outputs
❌ Test files
❌ .git/

---

## Regeneration

```bash
# Quick regenerate (source only)
npx repomix src --style xml --compress --output project-alpha-packfile.xml \
  --ignore "node_modules" --ignore "dist" --ignore "test*" \
  --ignore "src/i18n/en" --ignore "src/i18n/vi" --ignore "src/data"

# Full regenerate
npx repomix . --style xml --compress --output project-alpha-full-packfile.xml \
  --ignore "node_modules" --ignore "dist" --ignore "test*" \
  --ignore "_bmad-output" --ignore ".android-docs" --ignore ".augment" \
  --ignore "project-alpha-packfile.xml" --ignore "project-alpha-full-packfile.xml"

# Compress
gzip -k project-alpha-packfile.xml
gzip -k project-alpha-full-packfile.xml
```

---

## Use Cases

| Task | Packfile | Time |
|------|----------|------|
| Feature development | Source (548 KB) | ~30s load |
| Code review | Source (548 KB) | ~30s load |
| Architecture analysis | Source (548 KB) | ~30s load |
| Documentation review | Full (18 MB) | ~2m load |
| Complete system analysis | Full (18 MB) | ~2m load |
| Migration planning | Full (18 MB) | ~2m load |

---

## Compression Performance

| Packfile | Original | Compressed | Ratio |
|----------|----------|------------|-------|
| Source | 2.6 MB | 548 KB | 4.7:1 |
| Full | 76 MB | 18 MB | 4.2:1 |

**Compression Method**: gzip -9
**Format**: XML with Tree-sitter compression

---

## Troubleshooting

**Problem**: Packfile won't load
**Solution**: Use compressed version, ensure enough memory

**Problem**: Missing files
**Solution**: Check ignore patterns, regenerate if needed

**Problem**: Too large for AI tool
**Solution**: Use source packfile (548 KB) instead of full packfile (18 MB)

**Problem**: Can't parse XML
**Solution**: Verify Repomix v1.11.0+, regenerate with latest version

---

## Security

✅ No API keys detected
✅ No passwords found
✅ No secrets exposed
✅ Clean security scan

---

## File Locations

```
project-alpha/
├── project-alpha-packfile.xml          (2.6 MB - source only)
├── project-alpha-packfile.xml.gz       (548 KB - recommended)
├── project-alpha-full-packfile.xml     (76 MB - complete)
├── project-alpha-full-packfile.xml.gz  (18 MB - full context)
├── REPOPACK-SUMMARY-2026-01-02.md     (10 KB - detailed docs)
└── REPOPACK-QUICK-REF.md              (this file)
```

---

## Next Steps

1. **Choose Packfile**: Source (fast) or Full (complete)
2. **Decompress**: `gunzip project-alpha-packfile.xml.gz`
3. **Load Tool**: Use AI code review tool or https://repomix.com
4. **Analyze**: Query for patterns, architectures, components
5. **Iterate**: Regenerate as codebase evolves

---

**Need More Info?** See REPOPACK-SUMMARY-2026-01-02.md for complete documentation.

**Generated with**: Repomix v1.11.0
**Date**: 2026-01-02
