# Phase 1: Domain-Specific Discovery (Stack-Feature Scan)

**Epic:** EPIC-DISC-01
**Duration:** 1 day
**Date:** 2026-01-17
**Status:** INITIATED

## Objective
Catalog complete codebase inventory to establish baseline understanding before refactoring.

## Scope
**IN SCOPE:**
- All React components (`.tsx`, `.jsx`)
- All Zustand stores (`infrastructure/persistence/stores/`)
- All services (infrastructure + domain layers)
- Technical debt (deprecated directories, dead code)
- Feature-to-code mapping for Notes & IDE workspaces

**OUT OF SCOPE:**
- Knowledge workspace (temporarily closed)
- Study workspace (temporarily closed)

## Tracks

### Track 1.1: Component Inventory
**Output:** `inventory/components-inventory.json`
**Duration:** 2h
**Agent:** TBD

### Track 1.2: Store Inventory
**Output:** `inventory/stores-inventory.json`
**Duration:** 3h
**Agent:** TBD

### Track 1.3: Service Inventory
**Output:** `inventory/services-inventory.json`
**Duration:** 2h
**Agent:** TBD

### Track 1.4: Technical Debt Inventory
**Output:** `inventory/technical-debt-inventory.json`
**Duration:** 2h
**Agent:** TBD

### Track 1.5: Feature-to-Code Mapping
**Output:** `feature-mapping/*.json`
**Duration:** 3h
**Agent:** TBD

## Parallel Execution
All 5 tracks run simultaneously via parallel sub-agents.

## Success Criteria
- [ ] All JSON artifacts created
- [ ] God components (>500 lines) identified
- [ ] God stores (>500 lines) identified
- [ ] Technical debt cataloged
- [ ] Feature-to-code mapping complete
