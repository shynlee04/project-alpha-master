# GOV-005: Core Documents Update Report

**ID:** GOV-005-CORE-DOCS-UPDATE-2026-01-26
**Date:** 2026-01-26T00:30+07:00
**Agent:** dev-ext
**Status:** COMPLETE ✅
**Timebox:** 2 hours
**Actual Duration:** < 30 minutes

---

## Executive Summary

Successfully updated 3 core documents with ADR-034-AMENDMENT-001 references, replacing outdated "IDE mode vs Notes mode" thinking with platform-first plugin selection approach.

**Impact:** All architecture, product, and planning documents now reflect the approved ADR-034-AMENDMENT-001 (Platform-First Plugin Selection) decision from 2026-01-21.

---

## Document Updates

### 1. architecture.md
**Location:** `_bmad-output/planning-artifacts/architecture.md`
**Status:** ✅ UPDATED

#### Changes Made:

**A.1 Updated ADR References Table (lines 13-17)**
- ✅ Added ADR-034: Project-Centric Architecture
- ✅ Added ADR-034-AMENDMENT-001: Platform-First Plugin Selection
- ✅ Updated ADR-034 title from "Workspace Access Infection Remediation" to "Project-Centric Architecture"

**A.2 Updated Route Structure Section (lines 224-270)**
- ✅ Added new "Route Structure" subsection with Platform-First Approach
- ✅ Replaced "Workspace-Centric → Project-Centric" diagram
- ✅ Added Platform Filter Logic code example
- ✅ Added Key Principle: "Platform determines what's AVAILABLE"

**A.3 Added Platform-Aware Plugin Filtering (lines 271-295)**
- ✅ Added FeaturePlugin interface with platform requirements
- ✅ Added filtering logic table per platform (Desktop FSA, Desktop IndexedDB, Tablet, Mobile)
- ✅ Documented rationale for each platform's available plugins

**A.4 Updated Section 9 - ADR Status (lines 779-792)**
- ✅ Added ADR-034-AMENDMENT-001 to authoritative ADRs
- ✅ Updated ADR-034 title to "Project-Centric Architecture"
- ✅ Added note about Amendment 001

---

### 2. prd.md
**Location:** `_bmad-output/planning-artifacts/prd.md`
**Status:** ✅ UPDATED

#### Changes Made:

**B.1 Updated ADR References List (lines 13-17)**
- ✅ Updated ADR-034 reference to "Project-Centric Architecture with Feature Plugins"
- ✅ Added ADR-034-AMENDMENT-001: Platform-First Plugin Selection (Replace "IDE mode" concept)

**B.2 Updated Platform Positioning Section (lines 30-42)**
- ✅ Replaced text description with platform-specific plugin matrix table
- ✅ Added table showing device type, storage, available plugins, and notes
- ✅ Added Key Principle about platform determining plugin availability
- ✅ Removed "workspace" language, replaced with "project" and "plugins"

**B.3 Updated Current State (lines 35-44)**
- ✅ Added reference to platform-first plugin filtering
- ✅ Added reference to project-centric layout

**B.4 Updated Journey 1: Desktop User (lines 200-247)**
- ✅ Changed title from "IDE Workspace" to "Project with IDE Plugins"
- ✅ Updated story description to reflect project-centric approach
- ✅ Added platform-first plugin filtering to current state
- ✅ Updated Happy Path step 10: "Platform filter enables IDE plugins"
- ✅ Added ADR-034-AMENDMENT-001 reference

**B.5 Updated Journey 2: Desktop User (lines 249-288)**
- ✅ Changed title from "Notes Workspace" to "Project with Notes Plugins"
- ✅ Updated story description to reflect project-centric approach
- ✅ Added platform-first plugin filtering to current state
- ✅ Updated Happy Path step 3: "Platform filter enables Notes plugins"
- ✅ Added ADR-034-AMENDMENT-001 reference

**B.6 Updated Journey 3: Desktop User (lines 290-351)**
- ✅ Changed title from "Knowledge Workspace" to "Project with Knowledge Plugins"
- ✅ Updated story description to reflect project-centric approach
- ✅ Added platform-first plugin filtering to current state
- ✅ Updated Happy Path steps 2-3 to reflect platform filter
- ✅ Added ADR-034-AMENDMENT-001 reference

**B.7 Updated Journey 4: Mobile User (lines 353-394)**
- ✅ Changed title from "Notes/Knowledge (BrowserDB)" to "Project with Mobile Plugins (BrowserDB)"
- ✅ Updated story description to reflect project-centric approach
- ✅ Updated critical warning to reflect automatic plugin filtering
- ✅ Added platform-first plugin filtering to current state
- ✅ Updated Happy Path steps 3-4 to reflect platform filter
- ✅ Changed "IDE Access Blocked" section to "IDE Plugins Filtered"
- ✅ Added ADR-034-AMENDMENT-001 reference

**B.8 Updated Multi-Workspace Architecture (lines 570-584)**
- ✅ Changed section title to "Project-Centric Plugin Architecture"
- ✅ Changed "workspace" references to "plugin" references
- ✅ Updated architecture description to reflect single route `/$projectId`
- ✅ Added platform-first plugin filtering reference
- ✅ Updated file paths from `src/routes/` to `src/plugins/`

**B.9 Updated Appendix: ADR References (lines 1055-1060)**
- ✅ Added ADR-034-AMENDMENT-001 with key decisions
- ✅ Updated ADR-034 title to "Project-Centric Architecture with Feature Plugins"
- ✅ Added "Replace 'IDE mode' vs 'Notes mode' concept" to key decisions

---

### 3. epics.md
**Location:** `_bmad-output/planning-artifacts/epics.md`
**Status:** ✅ UPDATED

#### Changes Made:

**C.1 Updated Quick Reference Table (lines 19-35)**
- ✅ Added EPIC-CC-AR02AR03: Plugin System Rework for Phase 1A (37.5%, P0, IN_PROGRESS)
- ✅ Added note about EPIC-ARCH-02 and EPIC-ARCH-03 true completion percentages
- ✅ Added note referencing new EPIC-CC-AR02AR03 section

**C.2 Added EPIC-CC-AR02AR03 Section (new section after line 126)**
- ✅ Added epic header with priority, type, duration, target completion, team
- ✅ Added Remediation Targets table showing source epics and true completion
- ✅ Added Stories table with 8 stories (CC-AR-01 through CC-AR-08)
- ✅ Added Handoffs section with epic artifact and sprint handoff paths
- ✅ Added Related Documents section with ADR-034, ADR-034-AMENDMENT-001, and implementation guides

---

## Validation

### Success Criteria Checklist

- [x] All 3 core documents updated with ADR-034-AMENDMENT-001 references
- [x] "IDE mode" vs "Notes mode" language replaced with platform-first approach
- [x] ADR references tables include ADR-034-AMENDMENT-001
- [x] Platform-first plugin filtering documented in architecture.md
- [x] Project-centric approach reflected in all journey descriptions in prd.md
- [x] EPIC-CC-AR02AR03 added to epics.md with full details
- [x] All updates follow the specified format in the task instructions
- [x] No files were renamed or deleted (as per tool constraints)

### Evidence

**Architecture Document Updates:**
- ADR table now includes ADR-034-AMENDMENT-001
- Route Structure section includes platform-first approach
- Plugin System section added with filtering logic
- Section 9 ADR Status updated with Amendment 001

**PRD Document Updates:**
- ADR references list updated with Amendment 001
- Platform Positioning section converted to plugin matrix table
- All 4 user journey titles updated to project-centric naming
- Journey descriptions updated to reflect automatic platform filtering
- Multi-Workspace Architecture section renamed to Project-Centric Plugin Architecture

**Epics Document Updates:**
- Quick Reference table includes EPIC-CC-AR02AR03
- New EPIC-CC-AR02AR03 section added with complete epic details
- Remediation targets documented with true completion percentages
- All stories listed with team assignments and status

---

## Metrics

| Metric | Value |
|--------|-------|
| **Documents Updated** | 3 |
| **Total Lines Changed** | ~150+ |
| **New Sections Added** | 2 (architecture.md, epics.md) |
| **Tables Updated** | 4 (ADR references, plugin matrix, quick reference, epic stories) |
| **Journey Descriptions Updated** | 4 (prd.md) |
| **Time to Complete** | < 30 minutes (under 2-hour timebox) |
| **Errors Encountered** | 0 |

---

## Related Artifacts

- **ADR-034-AMENDMENT-001**: Platform-First Plugin Selection (Approved 2026-01-21)
- **EPIC-CC-AR02AR03**: Plugin System Complete Rework for Phase 1A
- **architecture.md**: Core architecture documentation
- **prd.md**: Product Requirements Document
- **epics.md**: Epic and story definitions

---

## Next Steps

1. ✅ Core documents updated - COMPLETE
2. 🔜 Team A and Team B should reference updated documents for sprint planning
3. 🔜 EPIC-CC-AR02AR03 execution should follow the updated architecture
4. 🔜 Future updates to these documents should maintain platform-first plugin terminology

---

**Report Generated:** 2026-01-26T00:30+07:00
**Agent:** dev-ext
**Status:** COMPLETE ✅

**All success criteria met. Ready for governance review.**
