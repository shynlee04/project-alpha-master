# Course Correction Execution Plan - P0 File Splitting
**Date:** 2025-12-31T17:30:00+07:00
**Priority:** P0 - CRITICAL (BLOCKER)
**Estimated Effort:** 24-32 hours
**Target:** Reduce all files to ≤300 LOC

---

## Executive Summary

**Trigger:** L2 Code Hygiene FAILED - 16 files exceed 300-line limit
**Current Health Score:** 65%
**Target Health Score:** ≥80%

**Primary Obstacles:**
1. 3 P0 violations (3x file size limit)
2. 6 P1 violations (1.5x-2x file size limit)
3. 7 P2 violations (just over 300-line limit)

**Strategy:** Incremental refactoring with zero breaking changes
- Split God Classes into focused single-responsibility modules
- Maintain all existing exports via barrel index.ts
- Preserve API compatibility (no breaking changes)
- Build validation after each split

---

## File Splitting Strategy

### Priority 1: P0 SEVERE Violations (3x limit)

#### 1. knowledge-graph.ts (924 lines → 4 files ~231 lines each)

**Current Structure:**
```typescript
class KnowledgeGraphService {
  // CRUD operations: addNode, updateNode, deleteNode, addEdge, updateEdge, deleteEdge
  // Traversal: bfs, dfs, findShortestPath
  // Queries: query, findConnectedComponents
  // Clustering: detectClusters
  // Statistics: getStatistics, getStatisticsByType
  // Persistence: persist, load, clear, exportGraph, importGraph
  // Utilities: getNeighbors, calculateCohesion, generateClusterLabel, updateStatistics
}
```

**Split Plan:**

**File 1: graph-crud.ts** (~230 lines)
- `KnowledgeGraphCRUD` class
- addNode, updateNode, deleteNode
- addEdge, updateEdge, deleteEdge
- Validation logic
- generateId utility

**File 2: graph-traversal.ts** (~230 lines)
- `GraphTraversal` class (takes graph reference)
- bfs(startNodeId, options)
- dfs(startNodeId, options)
- findShortestPath(sourceId, targetId)
- findAllPaths(sourceId, targetId)

**File 3: graph-queries.ts** (~240 lines)
- `GraphQueries` class (takes graph reference)
- query(options)
- detectClusters(options)
- getNeighbors, getConnectedComponents
- calculateCohesion, generateClusterLabel
- getStatistics, getStatisticsByType

**File 4: graph-persistence.ts** (~230 lines)
- `GraphPersistence` class
- persist(), load()
- clear()
- exportGraph(), importGraph()
- initializeEmptyGraph(), getEmptyStatistics()

**Main File: knowledge-graph.ts** (~35 lines)
- Factory function: `createKnowledgeGraphService(graphId)`
- Orchestrator class that combines CRUD + Traversal + Queries + Persistence
- Maintains backward compatibility

---

#### 2. subject-classifier.ts (706 lines → 3 files ~235 lines each)

**Current Structure:**
```typescript
class SubjectClassifier {
  // Initialization: initialize, getPredefinedSubjects, rebuildHierarchy
  // Classification: classifySource, extractFeatures, scoreSubjects
  // Hierarchy: getBestSubject, buildSubjectPath, getAlternatives
  // Dynamic: createSubject, generateSubjectId, updateSubjectEmbedding
  // Statistics: getAllSubjects, getSubject, getStatistics
  // Reclassification: reclassify
  // Utilities: cosineSimilarity
}
```

**Split Plan:**

**File 1: subject-taxonomy.ts** (~235 lines)
- `SubjectTaxonomy` class
- getPredefinedSubjects() (170 lines of taxonomy data)
- rebuildHierarchy()
- getAllSubjects(), getSubject()
- createSubject(), generateSubjectId()

**File 2: subject-scoring.ts** (~235 lines)
- `SubjectScoring` class
- extractFeatures()
- scoreSubjects() (multi-feature scoring logic)
- getBestSubject()
- cosineSimilarity()
- updateSubjectEmbedding()

**File 3: subject-classifier.ts** (~240 lines)
- `SubjectClassifier` class (main orchestrator)
- initialize(), classifySource()
- buildSubjectPath(), getAlternatives()
- reclassify(), clear()
- getStatistics()

---

#### 3. organization-engine.ts (703 lines → 3 files ~234 lines each)

**Current Structure:**
```typescript
class OrganizationEngine {
  // Analysis: analyzeVault, detectTemporalClustering
  // Confidence: calculate*Confidence, build*Rationale
  // Organization: applyOrganization, organizeChronological, organizeConceptual, organizeHybrid
  // Cache: clearCache
}
```

**Split Plan:**

**File 1: vault-analyzer.ts** (~230 lines)
- `VaultAnalyzer` class
- analyzeVault()
- detectTemporalClustering()
- Vault analysis logic

**File 2: recommendation-generator.ts** (~240 lines)
- `RecommendationGenerator` class
- calculateChronologicalConfidence()
- calculateConceptualConfidence()
- calculateHybridConfidence()
- buildChronologicalRationale()
- buildConceptualRationale()
- buildHybridRationale()
- generateRecommendations()

**File 3: organization-strategies.ts** (~240 lines)
- `OrganizationStrategies` class
- applyOrganization()
- organizeChronological()
- organizeConceptual()
- organizeHybrid()
- Cache management

**Main File: organization-engine.ts** (~30 lines)
- Factory function: `createOrganizationEngine()`
- Orchestrator class

---

### Priority 2: P1 HIGH Violations (1.5x-2x limit)

#### 4. source-import.ts (538 lines → 2 files ~269 lines each)

**Split Plan:**
- **source-pipeline.ts**: Pipeline orchestration, progress tracking
- **source-processors.ts**: PDF, URL, image, text processors

#### 5. gemini-pdf-processor.ts (517 lines → 2 files ~258 lines each)

**Split Plan:**
- **pdf-structure-parser.ts**: Parse structured PDF data
- **gemini-pdf-client.ts**: Gemini API integration

#### 6. relevancy-scorer.ts (499 lines → 2 files ~250 lines each)

**Split Plan:**
- **scoring-calculators.ts**: calculateEmbeddingSimilarity, calculateCitationOverlap, etc.
- **relevancy-scorer.ts**: Main service with cache and batch operations

#### 7. linkage-analyzer.ts (474 lines → 2 files ~237 lines each)

**Split Plan:**
- **node-analyzer.ts**: extractConcepts, extractKeywords
- **linkage-analyzer.ts**: Similarity calculation and proposal generation

#### 8. synthesis-service.ts (424 lines → 2 files ~212 lines each)

**Split Plan:**
- **synthesis-orchestrator.ts**: synthesize() orchestration, progress tracking
- **gemini-integration.ts**: buildPrompt(), callGeminiAPI()

---

### Priority 3: P2 MEDIUM Violations (just over 300 lines)

#### 9-16. Files 303-416 lines

Each split into 2 focused modules:
- gemini-image-processor.ts (416 → 208 lines each)
- url-fetcher.ts (394 → 197 lines each)
- gemini-url-processor.ts (348 → 174 lines each)
- pdf-parser.ts (343 → 171 lines each)
- knowledge-graph-types.ts (303 → split types/interfaces)
- Plus test files

---

## Execution Steps

### Step 1: Create New Module Files
1. Create `graph-crud.ts` with CRUD operations
2. Create `graph-traversal.ts` with BFS/DFS/shortestPath
3. Create `graph-queries.ts` with query/cluster/statistics
4. Create `graph-persistence.ts` with save/load/export
5. Update main `knowledge-graph.ts` to use new modules

### Step 2: Maintain Backward Compatibility
- Keep all existing exports in `knowledge/index.ts`
- Ensure factory function `createKnowledgeGraphService()` works identically
- No API breaking changes

### Step 3: Validate After Each Split
```bash
pnpm build  # Must pass
pnpm test   # Must pass (if tests exist)
```

### Step 4: Update Exports
```typescript
// knowledge/graph/index.ts
export { KnowledgeGraphCRUD } from './graph-crud';
export { GraphTraversal } from './graph-traversal';
export { GraphQueries } from './graph-queries';
export { GraphPersistence } from './graph-persistence';
export { KnowledgeGraphService, createKnowledgeGraphService } from './knowledge-graph';
```

### Step 5: Repeat for All 16 Files
Execute splitting in priority order (P0 → P1 → P2)

---

## Acceptance Criteria

After remediation:
- ✅ All files ≤300 LOC
- ✅ Build passes with no errors
- ✅ All exports maintained via index.ts
- ✅ No breaking API changes
- ✅ Functionality preserved
- ✅ Health score ≥80%

---

## Risk Mitigation

**Risk:** Breaking changes during refactoring
**Mitigation:**
- Comprehensive build validation after each file split
- Maintain factory function pattern for backward compatibility
- Keep all type exports unchanged
- Incremental commits with rollback capability

**Risk:** Increased complexity due to more files
**Mitigation:**
- Create clear barrel exports (index.ts in each subdirectory)
- Document module boundaries
- Use consistent naming conventions
- Single Responsibility Principle enforced

---

## Timeline Estimate

- **P0 files (3 files):** 8-12 hours
  - knowledge-graph.ts: 4 hours
  - subject-classifier.ts: 3 hours
  - organization-engine.ts: 3 hours

- **P1 files (6 files):** 12-16 hours
  - Average 2-3 hours per file

- **P2 files (7 files):** 4-6 hours
  - Average 1 hour per file (smaller files)

**Total:** 24-34 hours (with testing and validation)

---

## Next Actions

1. ✅ Course correction documented
2. ⏭️ Split knowledge-graph.ts (P0 #1)
3. ⏭️ Split subject-classifier.ts (P0 #2)
4. ⏭️ Split organization-engine.ts (P0 #3)
5. ⏭️ Validate P0 splits with build
6. ⏭️ Execute P1 splits (6 files)
7. ⏭️ Execute P2 splits (7 files)
8. ⏭️ Final validation and health score check
9. ⏭️ Resume Phase 7 tasks (3-device rule, use case validation, demo prep)

---

**Status:** 🔄 COURSE CORRECTION IN PROGRESS
**Blocker:** ❌ L2 Code Hygiene FAILED
**Remedy:** Execute file splitting strategy
**Unblock When:** Health score ≥80% and all files ≤300 LOC
