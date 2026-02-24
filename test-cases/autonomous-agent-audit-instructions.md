# Autonomous Agent Audit Instructions: Client-Side Agentic RAG Platform Routing

## Executive Summary

This document provides comprehensive test cases and execution instructions for autonomous agents to systematically audit, diagnose, and report on the "unlawful routing" and user journey inconsistencies in the client-side Agentic RAG multi-workspace platform.

## Critical Issues to Investigate

### 1. Project Concept Ambiguity (Root Cause #1)
The "Project" entity serves as the central hub for pro users but lacks clear boundaries, causing:
- Unclear relationship between workspaces and project assets
- Confusion in agent CRUD tool permissions
- Inconsistent state management across device types
- Broken mutual relationships between workspaces

### 2. BYOK & Vault Persistence Failures (Root Cause #2)
The Bring Your Own Key (OpenRouter, Gemini) integration suffers from:
- Inconsistent key persistence across workspaces
- Missing fallback mechanisms when keys are absent
- Broken user flows during AI feature activation
- Lack of graceful degradation

## Test Methodology: Skeptical Product Manager Approach

### Phase 1: Entry Point Mapping (Hub Page)
**Objective**: Map all first interactions from the hub page (`/` and `/hub`)

#### Test Case 1.1: Hub Page Initial Load
```typescript
// Agent Instructions:
1. Navigate to / (root) and /hub
2. Document all visible entry points
3. Test each entry point's initial state
4. Record routing behavior, loading states, error handling
5. Verify BYOK key presence/absence handling
```

**Expected Behaviors:**
- Hub loads with project list or empty state
- Clear navigation to IDE, Notes, Knowledge, Study, Agents
- No routing loops or infinite redirects
- Graceful handling of missing API keys

**Failure Indicators:**
- Console errors during initial load
- Infinite loading states
- Redirect loops between routes
- Unhandled promise rejections

#### Test Case 1.2: Workspace Navigation Without Project
```typescript
// Agent Instructions:
1. Start from hub with no projects
2. Click each workspace entry (IDE, Notes, Knowledge, Study)
3. Document the complete user journey
4. Record temp project creation behavior
5. Test BYOK key vault integration
```

**Expected Behaviors:**
- Auto-creation of temp projects
- Seamless navigation to workspace
- Proper workspace binding configuration
- Persistent key vault access

**Failure Indicators:**
- Navigation to empty states
- Missing temp project creation
- Broken workspace bindings
- Key vault access failures

### Phase 2: Note Workspace User Journey Mapping

#### Test Case 2.1: Desktop - No Sync (Case 1)
```typescript
// Agent Instructions:
1. Access Notes workspace without file system sync
2. Test basic note-taking functionality
3. Attempt AI content generation features
4. Verify BYOK key handling
5. Test cross-workspace navigation
```

**Expected Behaviors:**
- Notes workspace loads with temp project
- Block-style editor functions (Notion-like)
- AI features trigger key vault check if needed
- Smooth navigation to other workspaces

**Failure Indicators:**
- Editor fails to load
- AI features cause crashes
- Key vault prompts are broken
- Navigation breaks state

#### Test Case 2.2: Desktop - With Sync (Case 2)
```typescript
// Agent Instructions:
1. Create project with local folder sync
2. Sync various file types (md, doc, docx, png, jpg, pdf)
3. Verify file rendering in Notes workspace
4. Test AI features with synced content
5. Validate BYOK persistence across sync
```

**Expected Behaviors:**
- All file types render correctly
- Sync state is maintained
- AI features work with synced content
- Keys persist across sync operations

**Failure Indicators:**
- File rendering failures
- Sync state corruption
- AI features break with synced content
- Key vault resets during sync

#### Test Case 2.3: Mobile IndexedDB (Case 3)
```typescript
// Agent Instructions:
1. Simulate mobile environment (use IndexedDB)
2. Access Notes workspace
3. Test mobile-specific interactions
4. Verify responsive behavior
5. Test AI features with mobile constraints
```

**Expected Behaviors:**
- Mobile-optimized interface
- IndexedDB storage works correctly
- Touch interactions function properly
- AI features adapt to mobile context

**Failure Indicators:**
- Desktop-only UI elements
- IndexedDB storage failures
- Broken touch interactions
- AI features not mobile-aware

#### Test Case 2.4: AI Integration Trigger (Case 4)
```typescript
// Agent Instructions:
1. From any Case 1-3, trigger AI content generation
2. Test various AI features (slash commands, RAG, multimodal)
3. Verify key vault integration
4. Test fallback mechanisms
5. Validate error handling
```

**Expected Behaviors:**
- Seamless AI feature activation
- Proper key vault validation
- Graceful fallback if keys missing
- Clear user guidance for key setup

**Failure Indicators:**
- AI features crash the app
- Missing key vault integration
- No fallback mechanisms
- Unclear error messages

### Phase 3: Cross-Workspace State Consistency

#### Test Case 3.1: Workspace Switching
```typescript
// Agent Instructions:
1. Start in Notes workspace with active project
2. Switch to IDE, Knowledge, Study workspaces
3. Verify state persistence and sharing
4. Test agent continuity across workspaces
5. Validate BYOK key accessibility
```

**Expected Behaviors:**
- Project context persists across workspaces
- Agent configuration remains consistent
- Keys remain accessible across workspaces
- No data loss during switches

**Failure Indicators:**
- Project context resets
- Agent configuration breaks
- Keys become inaccessible
- Data corruption during switches

#### Test Case 3.2: Cross-Workspace File References
```typescript
// Agent Instructions:
1. Create files in Notes workspace
2. Reference these files from IDE workspace
3. Test RAG across workspaces
4. Verify agent tool permissions
5. Validate file system adapter consistency
```

**Expected Behaviors:**
- Files accessible across workspaces
- RAG works with cross-workspace content
- Agent tools have proper permissions
- File system adapters work consistently

**Failure Indicators:**
- Cross-workspace file access fails
- RAG returns incomplete results
- Agent permission errors
- Inconsistent adapter behavior

## Diagnostic Framework

### Routing Analysis
For each test case, document:

1. **Entry Point**: How user enters the flow
2. **Routing Path**: Complete sequence of route changes
3. **State Transitions**: Store state changes at each step
4. **Error Boundaries**: How errors are handled
5. **Fallback Mechanisms**: What happens when things fail

### State Management Analysis
Track these key stores:

1. **Hub Store** (`useHubStore`): Navigation state
2. **Workspace Store** (`useWorkspaceStore`): Current workspace/project
3. **Project Store** (`useProjectStore`): Project metadata
4. **Provider Store** (`useAppStore`): BYOK keys
5. **Agent Store** (`useAgentSelectionStore`): Agent configuration

### BYOK Integration Analysis
Verify:

1. **Key Persistence**: Keys survive workspace switches
2. **Cross-Workspace Access**: Same keys work in all workspaces
3. **Fallback Handling**: Graceful degradation when keys missing
4. **User Guidance**: Clear instructions for key setup

## Reporting Template

### Test Execution Report
```markdown
## Test Case: [Test Case ID]
### Execution Summary
- **Status**: [PASS/FAIL/PARTIAL]
- **Duration**: [Time taken]
- **Environment**: [Browser/Device]

### Findings
#### Routing Behavior
- [Document routing sequence]
- [Identify any loops or failures]

#### State Management
- [Store state observations]
- [Data consistency issues]

#### BYOK Integration
- [Key persistence test results]
- [Fallback mechanism effectiveness]

#### User Experience
- [Observed user journey]
- [Pain points and friction]

### Issues Identified
1. **Critical**: [Blocking issues]
2. **Major**: [Significant problems]
3. **Minor**: [Small improvements]

### Recommendations
1. **Immediate**: [Quick fixes]
2. **Short-term**: [Architectural improvements]
3. **Long-term**: [Strategic changes]

### Evidence
- [Screenshots]
- [Console logs]
- [Network requests]
- [State snapshots]
```

## Autonomous Agent Execution Instructions

### Setup Requirements
1. **Browser Environment**: Chrome/Chromium with dev tools
2. **Test Data**: Clean local storage for each test
3. **Network Monitoring**: Record all API calls
4. **Console Logging**: Capture all errors and warnings

### Execution Protocol
1. **Pre-Test Setup**: Clear storage, open dev tools
2. **Test Execution**: Follow test case steps exactly
3. **Data Collection**: Record all observations
4. **Post-Test Cleanup**: Reset environment
5. **Report Generation**: Complete reporting template

### Success Criteria
A test case passes when:
- No console errors or unhandled exceptions
- All user flows complete without blocking
- BYOK integration works consistently
- Fallback mechanisms function properly
- Cross-workspace state remains consistent

### Failure Classification
- **Critical Failure**: App crashes, data loss, security issues
- **Major Failure**: Feature broken, poor UX, routing failures
- **Minor Failure**: UI issues, performance problems, inconsistent behavior

## Next Steps After Analysis

1. **Prioritize Fixes**: Address critical failures first
2. **Architectural Review**: Re-evaluate project concept boundaries
3. **BYOK Redesign**: Implement robust key management
4. **User Journey Optimization**: Streamline navigation flows
5. **Cross-Workspace Consistency**: Ensure uniform behavior

---

**Note**: This audit should be executed systematically, one phase at a time, with complete documentation of all findings. The goal is to identify root causes and provide actionable recommendations for creating a robust, client-side Agentic RAG platform.
