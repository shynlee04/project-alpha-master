# Cornerstone 2: Agent Configuration Vault Analysis

**Date**: 2026-01-02
**Health Score**: 70/100 (GOOD)
**Priority**: P0 (Foundation for all AI features)

## 📊 Current State

### ✅ Strengths
- Split from 430-line god store into 5 slices (Story 3.3)
- Domain service layer created (agent-workspace-utils.ts)
- Workspace bindings implemented with tool permissions
- UnifiedAgentSelector fixes fragmentation bug

### ❌ Weaknesses
- Circular dependency: agents-store ↔ provider-store (in old location)
- 17 duplicate stores still exist across codebase
- Per-workspace agent capability filtering not implemented
- Agent status not reactive across workspaces

## 🎯 Critical Gaps
1. **Delete legacy agents-store** (P0 - 4 hours)
   - Old location: `src/stores/agents-store.ts` (deprecated)
   - New location: `src/infrastructure/persistence/stores/agents/`
   - Impact: Eliminates circular dependency

2. **Consolidate duplicate stores** (P0 - 8 hours)
   - 17 duplicate stores identified
   - 30% duplication rate across codebase
   - Target: Single source of truth for each domain

3. **Implement capability filtering** (P1 - 12 hours)
   - Agents should filter by workspace capabilities
   - Input/output modalities (text, image, audio, file)
   - Tool availability per workspace

## 📁 Key Files
- `src/infrastructure/persistence/stores/agents/agents-store.ts` (NEW)
- `src/stores/agents-store.ts` (OLD - delete)
- `src/domain/services/agent-workspace-utils.ts` (NEW - domain logic)
- `src/presentation/components/agent/UnifiedAgentSelector.tsx` (NEW - fixes bug)

## ✅ Completion: 40%
Foundation refactored, consolidation and filtering pending
