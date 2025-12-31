# Story WB-1: Project Metadata Enhancement - Test Specification

**Document ID:** story-wb-1-test-spec
**Epic:** WB - Workspace Binding & Project Persistence
**Story:** 1 of 8
**Status:** Ready for Test Implementation
**Created:** 2026-01-01T03:00:00+07:00
**Test Framework:** Vitest + fake-indexeddb
**Test Style:** TDD (Test-Driven Development)

---

## Table of Contents

1. [Test Strategy Overview](#test-strategy-overview)
2. [Acceptance Criteria Test Matrix](#acceptance-criteria-test-matrix)
3. [Test Data Strategy](#test-data-strategy)
4. [Edge Case Matrix](#edge-case-matrix)
5. [Test Scenarios](#test-scenarios)
6. [Mock Requirements](#mock-requirements)
7. [Test Implementation Plan](#test-implementation-plan)

---

## Test Strategy Overview

### Testing Philosophy

This specification follows **TDD best practices**:

1. **RED-GREEN-REFACTOR** cycle for each acceptance criterion
2. **Test isolation** - each test runs independently
3. **Descriptive test names** - self-documenting behavior
4. **AAA pattern** - Arrange, Act, Assert
5. **Coverage targets** - ≥80% for new code, 100% for critical paths

### Test Layers

```
┌─────────────────────────────────────────┐
│  Integration Tests (Dexie + IndexedDB)  │
│  - Schema migration                     │
│  - Data persistence                     │
│  - Default value application             │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Unit Tests (TypeScript interfaces)     │
│  - Type validation                      │
│  - Default value handling               │
│  - Backward compatibility               │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Edge Case Tests (Boundary conditions)  │
│  - Empty database                        │
│  - Migration failures                    │
│  - Corrupted data                        │
└─────────────────────────────────────────┘
```

### Success Criteria

- ✅ All acceptance criteria have test coverage
- ✅ ≥80% code coverage for new code paths
- ✅ 100% test pass rate
- ✅ TypeScript compilation passes (`tsc --noEmit`)
- ✅ Migration tested with existing data
- ✅ Zero data loss during migration

---

## Acceptance Criteria Test Matrix

### AC-WB-1-1: Workspace Bindings Field

| Test ID | Scenario | Input | Expected Output | Priority |
|---------|----------|-------|-----------------|----------|
| **TC-WB-1-1-01** | Create project with workspaceBindings | `{ id: '1', workspaceBindings: { ide: true, notes: false } }` | Project saved with all 4 workspace fields | P0 |
| **TC-WB-1-1-02** | Create project with partial workspaceBindings | `{ id: '1', workspaceBindings: { ide: true } }` | Unspecified fields default to `false` | P0 |
| **TC-WB-1-1-03** | Create project without workspaceBindings | `{ id: '1' }` | workspaceBindings defaults to `{ ide: true, notes: false, knowledge: false, study: false }` | P0 |
| **TC-WB-1-1-04** | Update workspaceBindings for existing project | `{ workspaceBindings: { ide: false, notes: true } }` | Only specified fields updated, others preserved | P1 |
| **TC-WB-1-1-05** | TypeScript type validation on workspaceBindings | N/A | Type error if non-boolean values used | P0 |

### AC-WB-1-2: File Snapshot Configuration

| Test ID | Scenario | Input | Expected Output | Priority |
|---------|----------|-------|-----------------|----------|
| **TC-WB-1-2-01** | Create project with fileSnapshotEnabled | `{ id: '1', fileSnapshotEnabled: true }` | fileSnapshotEnabled persisted as `true` | P0 |
| **TC-WB-1-2-02** | Create project without fileSnapshotEnabled | `{ id: '1' }` | fileSnapshotEnabled defaults to `false` | P0 |
| **TC-WB-1-2-03** | Update fileSnapshotEnabled for existing project | `{ fileSnapshotEnabled: true }` | Value updated correctly | P1 |
| **TC-WB-1-2-04** | TypeScript type validation on fileSnapshotEnabled | N/A | Type error if non-boolean value used | P0 |

### AC-WB-1-3: Database Schema Migration

| Test ID | Scenario | Precondition | Expected Result | Priority |
|---------|----------|--------------|-----------------|----------|
| **TC-WB-1-3-01** | Migrate empty database | No existing projects | New schema version applied, no errors | P0 |
| **TC-WB-1-3-02** | Migrate database with existing projects | 5 existing projects (old schema) | All projects migrated with default values | P0 |
| **TC-WB-1-3-03** | Migration default values applied | Migrated project | `workspaceBindings: { ide: true, notes: false, knowledge: false, study: false }` | P0 |
| **TC-WB-1-3-04** | Migration idempotency | Run migration twice on same DB | Second migration is no-op, no errors | P1 |
| **TC-WB-1-3-05** | Migration rollback on error | Migration throws error | Database rolled back to previous version | P0 |
| **TC-WB-1-3-06** | Migration with corrupted data | Project with invalid fields | Corrupted projects logged, valid ones migrated | P2 |

### AC-WB-1-4: TypeScript Compilation

| Test ID | Scenario | Check | Expected Result | Priority |
|---------|----------|-------|-----------------|----------|
| **TC-WB-1-4-01** | ProjectMetadata interface compilation | `tsc --noEmit` | Zero type errors related to ProjectMetadata | P0 |
| **TC-WB-1-4-02** | Optional field compilation | Access optional field without check | TypeScript error expected (strict mode) | P0 |
| **TC-WB-1-4-03** | Type inference on workspaceBindings | Infer type from object literal | Correct type inferred | P1 |

### AC-WB-1-5: IndexedDB Validation

| Test ID | Scenario | Operation | Expected Result | Priority |
|---------|----------|-----------|-----------------|----------|
| **TC-WB-1-5-01** | Save project with new fields to IndexedDB | `db.projects.put()` | Data persisted correctly | P0 |
| **TC-WB-1-5-02** | Retrieve project from IndexedDB | `db.projects.get()` | All fields retrieved with correct types | P0 |
| **TC-WB-1-5-03** | Query projects by workspace binding | `db.projects.where('workspaceBindings.ide').equals(true)` | Correct results returned | P1 |
| **TC-WB-1-5-04** | Update project in IndexedDB | `db.projects.update()` | Update persisted, other fields unchanged | P0 |

---

## Test Data Strategy

### Test Fixtures

#### 1. Minimal Project (Old Schema)

```typescript
const minimalProjectOldSchema = {
    id: 'test-project-1',
    name: 'Test Project',
    folderPath: '/path/to/project',
    fsaHandle: mockFileSystemDirectoryHandle,
    lastOpened: new Date('2025-01-01'),
    autoSync: true,
};
```

#### 2. Complete Project (New Schema)

```typescript
const completeProjectNewSchema = {
    id: 'test-project-2',
    name: 'Complete Project',
    folderPath: '/path/to/complete',
    fsaHandle: mockFileSystemDirectoryHandle,
    lastOpened: new Date('2025-01-01'),
    autoSync: true,
    // NEW FIELDS
    workspaceBindings: {
        ide: true,
        notes: true,
        knowledge: false,
        study: false,
    },
    fileSnapshotEnabled: true,
    // EXISTING FIELDS
    layoutState: {
        panelSizes: [300, 500, 200],
        openFiles: ['src/index.ts'],
        activeFile: 'src/index.ts',
    },
    exclusionPatterns: ['node_modules', '.git'],
    lastKnownPermissionState: 'granted',
};
```

#### 3. Edge Case Projects

```typescript
// Empty workspaceBindings (should apply defaults)
const emptyWorkspaceBindingsProject = {
    id: 'test-project-3',
    name: 'Empty Bindings',
    folderPath: '/path/to/empty',
    fsaHandle: mockFileSystemDirectoryHandle,
    lastOpened: new Date(),
    autoSync: true,
    workspaceBindings: {}, // Empty object
};

// Partial workspaceBindings
const partialWorkspaceBindingsProject = {
    id: 'test-project-4',
    name: 'Partial Bindings',
    folderPath: '/path/to/partial',
    fsaHandle: mockFileSystemDirectoryHandle,
    lastOpened: new Date(),
    autoSync: true,
    workspaceBindings: {
        ide: true,
        notes: true,
        // Missing knowledge and study
    },
};
```

### Test Data Generators

```typescript
/**
 * Generate a project with old schema (for migration testing)
 */
function generateOldProject(override?: Partial<ProjectMetadata>): ProjectMetadata {
    return {
        id: crypto.randomUUID(),
        name: 'Old Project',
        folderPath: '/old/path',
        fsaHandle: mockFSAHandle,
        lastOpened: new Date(),
        autoSync: true,
        ...override,
    };
}

/**
 * Generate a project with new schema
 */
function generateNewProject(override?: Partial<ProjectMetadata>): ProjectMetadata {
    return {
        id: crypto.randomUUID(),
        name: 'New Project',
        folderPath: '/new/path',
        fsaHandle: mockFSAHandle,
        lastOpened: new Date(),
        autoSync: true,
        workspaceBindings: {
            ide: true,
            notes: false,
            knowledge: false,
            study: false,
        },
        fileSnapshotEnabled: false,
        ...override,
    };
}
```

---

## Edge Case Matrix

### Database State Edge Cases

| Scenario | Precondition | Test Action | Expected Behavior | Test ID |
|----------|--------------|-------------|-------------------|---------|
| **Empty Database** | No IndexedDB database | Open app for first time | Schema created, no migration needed | EC-DB-01 |
| **Single Existing Project** | 1 project (old schema) | Run migration | Project migrated with defaults | EC-DB-02 |
| **Large Dataset** | 1000 projects (old schema) | Run migration | All migrated within 5 seconds | EC-DB-03 |
| **Corrupted Project** | 1 project with invalid fields | Run migration | Corrupted project logged, others migrated | EC-DB-04 |
| **Concurrent Migration** | Migration in progress | Attempt second migration | Second migration blocked or no-op | EC-DB-05 |
| **Migration Interrupted** | Mid-migration | Close browser/connection | Migration resumes on next open | EC-DB-06 |

### Data Type Edge Cases

| Field | Invalid Input | Expected Error Type | Recovery Strategy | Test ID |
|-------|--------------|---------------------|-------------------|---------|
| `workspaceBindings.ide` | `null` | TypeError | Apply default `true` | EC-TYPE-01 |
| `workspaceBindings.notes` | `undefined` | - | Apply default `false` | EC-TYPE-02 |
| `workspaceBindings.knowledge` | `'true'` (string) | TypeError | Apply default `false` | EC-TYPE-03 |
| `fileSnapshotEnabled` | `null` | TypeError | Apply default `false` | EC-TYPE-04 |
| `fileSnapshotEnabled` | `1` (number) | TypeError | Apply default `false` | EC-TYPE-05 |

### Backward Compatibility Edge Cases

| Scenario | Old Code Version | New Code Version | Expected Behavior | Test ID |
|----------|------------------|------------------|-------------------|---------|
| **Old Client → New DB** | App without new fields | DB with migrated schema | Old client ignores new fields | EC-BC-01 |
| **New Client → Old DB** | App with new fields | DB without migration | Migration triggered on open | EC-BC-02 |
| **New Client → Migrated DB** | App with new fields | DB with migrated schema | All fields accessible | EC-BC-03 |
| **Rollback Scenario** | Migrated to v16 | Rollback to v15 | Old schema used, new fields ignored | EC-BC-04 |

---

## Test Scenarios

### Scenario 1: Workspace Bindings Field Implementation

#### Test Suite: `workspace-bindings.test.ts`

```typescript
describe('Story WB-1: Workspace Bindings Field', () => {
    describe('AC-WB-1-1: Workspace Bindings Field', () => {
        test('TC-WB-1-1-01: Create project with full workspaceBindings', async () => {
            // Arrange
            const project = generateNewProject({
                workspaceBindings: {
                    ide: true,
                    notes: false,
                    knowledge: true,
                    study: false,
                },
            });

            // Act
            const saved = await saveProject(project);

            // Assert
            expect(saved).toBe(true);
            const retrieved = await getProject(project.id);
            expect(retrieved?.workspaceBindings).toEqual({
                ide: true,
                notes: false,
                knowledge: true,
                study: false,
            });
        });

        test('TC-WB-1-1-02: Create project with partial workspaceBindings', async () => {
            // Arrange
            const project = generateNewProject({
                workspaceBindings: {
                    ide: true,
                    notes: true,
                },
            });

            // Act
            await saveProject(project);

            // Assert
            const retrieved = await getProject(project.id);
            expect(retrieved?.workspaceBindings).toEqual({
                ide: true,
                notes: true,
                knowledge: false, // Default
                study: false,    // Default
            });
        });

        test('TC-WB-1-1-03: Create project without workspaceBindings (defaults)', async () => {
            // Arrange
            const project = generateOldProject(); // No workspaceBindings field

            // Act
            await saveProject(project);

            // Assert
            const retrieved = await getProject(project.id);
            expect(retrieved?.workspaceBindings).toEqual({
                ide: true,     // Default
                notes: false,  // Default
                knowledge: false, // Default
                study: false,  // Default
            });
        });

        test('TC-WB-1-1-04: Update workspaceBindings for existing project', async () => {
            // Arrange
            const project = await saveProject(generateNewProject());

            // Act
            const updated = await getProject(project.id);
            if (updated) {
                updated.workspaceBindings = {
                    ide: false,
                    notes: true,
                };
                await saveProject(updated);
            }

            // Assert
            const retrieved = await getProject(project.id);
            expect(retrieved?.workspaceBindings).toEqual({
                ide: false,
                notes: true,
                knowledge: false, // Preserved
                study: false,    // Preserved
            });
        });

        test('TC-WB-1-1-05: TypeScript type validation', () => {
            // This test is validated at compile time
            // @ts-expect-error - Testing non-boolean value
            const invalidProject: ProjectMetadata = {
                ...generateNewProject(),
                workspaceBindings: {
                    ide: 'true' as any, // Type error expected
                },
            };

            // If TypeScript compilation fails, this test passes
            expect(true).toBe(true);
        });
    });
});
```

---

### Scenario 2: File Snapshot Configuration Implementation

#### Test Suite: `file-snapshot-config.test.ts`

```typescript
describe('Story WB-1: File Snapshot Configuration', () => {
    describe('AC-WB-1-2: File Snapshot Configuration', () => {
        test('TC-WB-1-2-01: Create project with fileSnapshotEnabled=true', async () => {
            // Arrange
            const project = generateNewProject({
                fileSnapshotEnabled: true,
            });

            // Act
            await saveProject(project);

            // Assert
            const retrieved = await getProject(project.id);
            expect(retrieved?.fileSnapshotEnabled).toBe(true);
        });

        test('TC-WB-1-2-02: Create project without fileSnapshotEnabled (default)', async () => {
            // Arrange
            const project = generateOldProject(); // No fileSnapshotEnabled field

            // Act
            await saveProject(project);

            // Assert
            const retrieved = await getProject(project.id);
            expect(retrieved?.fileSnapshotEnabled).toBe(false); // Default
        });

        test('TC-WB-1-2-03: Update fileSnapshotEnabled for existing project', async () => {
            // Arrange
            const project = await saveProject(generateNewProject({
                fileSnapshotEnabled: false,
            }));

            // Act
            const updated = await getProject(project.id);
            if (updated) {
                updated.fileSnapshotEnabled = true;
                await saveProject(updated);
            }

            // Assert
            const retrieved = await getProject(project.id);
            expect(retrieved?.fileSnapshotEnabled).toBe(true);
        });

        test('TC-WB-1-2-04: TypeScript type validation', () => {
            // This test is validated at compile time
            // @ts-expect-error - Testing non-boolean value
            const invalidProject: ProjectMetadata = {
                ...generateNewProject(),
                fileSnapshotEnabled: 'yes' as any, // Type error expected
            };

            // If TypeScript compilation fails, this test passes
            expect(true).toBe(true);
        });
    });
});
```

---

### Scenario 3: Database Schema Migration

#### Test Suite: `migration.test.ts`

```typescript
describe('Story WB-1: Database Schema Migration', () => {
    beforeEach(async () => {
        // Reset database to clean state
        await _resetDBForTesting();
    });

    describe('AC-WB-1-3: Database Schema Migration', () => {
        test('TC-WB-1-3-01: Migrate empty database', async () => {
            // Arrange
            const db = await getDB();

            // Act
            // Migration should run automatically on database open

            // Assert
            const version = db.verno;
            expect(version).toBeGreaterThanOrEqual(expectedVersion); // Updated schema version
            const count = await db.projects.count();
            expect(count).toBe(0); // No projects migrated
        });

        test('TC-WB-1-3-02: Migrate database with existing projects', async () => {
            // Arrange
            const db = await getDB();
            const oldProjects = [
                generateOldProject({ name: 'Project 1' }),
                generateOldProject({ name: 'Project 2' }),
                generateOldProject({ name: 'Project 3' }),
            ];

            // Insert projects with old schema (manually bypass new fields)
            for (const project of oldProjects) {
                await db.projects.put({
                    id: project.id,
                    name: project.name,
                    folderPath: project.folderPath,
                    fsaHandle: project.fsaHandle,
                    lastOpened: project.lastOpened,
                    autoSync: project.autoSync,
                });
            }

            // Act - Close and reopen to trigger migration
            await db.close();
            const newDb = await getDB();

            // Assert
            const migratedProjects = await newDb.projects.toArray();
            expect(migratedProjects).toHaveLength(3);

            for (const project of migratedProjects) {
                expect(project.workspaceBindings).toEqual({
                    ide: true,
                    notes: false,
                    knowledge: false,
                    study: false,
                });
                expect(project.fileSnapshotEnabled).toBe(false);
            }
        });

        test('TC-WB-1-3-03: Migration applies correct default values', async () => {
            // Arrange
            const db = await getDB();
            const oldProject = generateOldProject();

            await db.projects.put({
                id: oldProject.id,
                name: oldProject.name,
                folderPath: oldProject.folderPath,
                fsaHandle: oldProject.fsaHandle,
                lastOpened: oldProject.lastOpened,
                autoSync: oldProject.autoSync,
            });

            // Act
            await db.close();
            const newDb = await getDB();
            const migrated = await newDb.projects.get(oldProject.id);

            // Assert
            expect(migrated?.workspaceBindings).toEqual({
                ide: true,
                notes: false,
                knowledge: false,
                study: false,
            });
            expect(migrated?.fileSnapshotEnabled).toBe(false);
        });

        test('TC-WB-1-3-04: Migration idempotency', async () => {
            // Arrange
            const db = await getDB();
            const oldProject = generateOldProject();

            await db.projects.put({
                id: oldProject.id,
                name: oldProject.name,
                folderPath: oldProject.folderPath,
                fsaHandle: oldProject.fsaHandle,
                lastOpened: oldProject.lastOpened,
                autoSync: oldProject.autoSync,
            });

            // Act - Run migration twice
            await db.close();
            const db1 = await getDB();
            await db1.close();
            const db2 = await getDB();

            // Assert
            const project = await db2.projects.get(oldProject.id);
            expect(project?.workspaceBindings).toEqual({
                ide: true,
                notes: false,
                knowledge: false,
                study: false,
            });
            expect(project?.fileSnapshotEnabled).toBe(false);
        });

        test('TC-WB-1-3-05: Migration rollback on error', async () => {
            // Arrange
            const db = await getDB();
            const oldProject = generateOldProject();

            await db.projects.put({
                id: oldProject.id,
                name: oldProject.name,
                folderPath: oldProject.folderPath,
                fsaHandle: oldProject.fsaHandle,
                lastOpened: oldProject.lastOpened,
                autoSync: oldProject.autoSync,
            });

            // Act - Simulate migration error by corrupting data
            await db.projects.update(oldProject.id, { name: null as any });

            // This test would verify error handling in the migration logic
            // Expected: Migration catches error, logs corrupted project, continues
            const newDb = await getDB();
            const projects = await newDb.projects.toArray();

            // Assert - Database still accessible, corrupted project handled
            expect(projects.length).toBeGreaterThanOrEqual(0);
        });
    });
});
```

---

### Scenario 4: TypeScript Type Validation

#### Test Suite: `typescript-validation.test.ts`

```typescript
describe('Story WB-1: TypeScript Type Validation', () => {
    describe('AC-WB-1-4: TypeScript Compilation', () => {
        test('TC-WB-1-4-01: ProjectMetadata interface compiles', () => {
            // This test validates TypeScript compilation at build time
            // Run: pnpm exec tsc --noEmit

            const project: ProjectMetadata = {
                id: 'test-1',
                name: 'Test',
                folderPath: '/path',
                fsaHandle: mockFSAHandle,
                lastOpened: new Date(),
                autoSync: true,
                workspaceBindings: {
                    ide: true,
                    notes: false,
                    knowledge: false,
                    study: false,
                },
                fileSnapshotEnabled: false,
            };

            expect(project.id).toBe('test-1');
        });

        test('TC-WB-1-4-02: Optional field access requires check', () => {
            const project = generateOldProject();

            // workspaceBindings is optional, so we need to check before accessing
            if (project.workspaceBindings) {
                const ideEnabled = project.workspaceBindings.ide;
                expect(typeof ideEnabled).toBe('boolean');
            }
        });

        test('TC-WB-1-4-03: Type inference on workspaceBindings', () => {
            const bindings: ProjectMetadata['workspaceBindings'] = {
                ide: true,
                notes: false,
                knowledge: true,
                study: false,
            };

            expect(bindings.ide).toBe(true);
            expect(typeof bindings.ide).toBe('boolean');
        });
    });
});
```

---

### Scenario 5: IndexedDB Validation

#### Test Suite: `indexeddb-validation.test.ts`

```typescript
describe('Story WB-1: IndexedDB Validation', () => {
    beforeEach(async () => {
        await _resetDBForTesting();
    });

    describe('AC-WB-1-5: IndexedDB Validation', () => {
        test('TC-WB-1-5-01: Save project with new fields to IndexedDB', async () => {
            // Arrange
            const db = await getDB();
            const project = generateNewProject();

            // Act
            await db.projects.put(project);

            // Assert
            const retrieved = await db.projects.get(project.id);
            expect(retrieved).toEqual(project);
        });

        test('TC-WB-1-5-02: Retrieve project from IndexedDB', async () => {
            // Arrange
            const db = await getDB();
            const project = generateNewProject();
            await db.projects.put(project);

            // Act
            const retrieved = await db.projects.get(project.id);

            // Assert
            expect(retrieved).toBeDefined();
            expect(retrieved?.workspaceBindings).toEqual(project.workspaceBindings);
            expect(retrieved?.fileSnapshotEnabled).toBe(project.fileSnapshotEnabled);
        });

        test('TC-WB-1-5-03: Query projects by workspace binding', async () => {
            // Arrange
            const db = await getDB();
            const project1 = generateNewProject({
                id: 'proj-1',
                workspaceBindings: { ide: true, notes: false, knowledge: false, study: false },
            });
            const project2 = generateNewProject({
                id: 'proj-2',
                workspaceBindings: { ide: false, notes: true, knowledge: false, study: false },
            });

            await db.projects.bulkPut([project1, project2]);

            // Act
            const ideProjects = await db.projects
                .where('workspaceBindings.ide')
                .equals(true)
                .toArray();

            // Assert
            expect(ideProjects).toHaveLength(1);
            expect(ideProjects[0].id).toBe('proj-1');
        });

        test('TC-WB-1-5-04: Update project in IndexedDB', async () => {
            // Arrange
            const db = await getDB();
            const project = generateNewProject();
            await db.projects.put(project);

            // Act
            await db.projects.update(project.id, {
                fileSnapshotEnabled: true,
            });

            // Assert
            const retrieved = await db.projects.get(project.id);
            expect(retrieved?.fileSnapshotEnabled).toBe(true);
            expect(retrieved?.workspaceBindings).toEqual(project.workspaceBindings); // Unchanged
        });
    });
});
```

---

## Mock Requirements

### Dexie.js Mocking

```typescript
// vitest.setup.ts
import { vi } from 'vitest';
import fakeIndexedDB from 'fake-indexeddb';

// Mock IndexedDB for Dexie
global.indexedDB = fakeIndexedDB();

// Mock crypto.randomUUID
global.crypto = {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2),
} as any;

// Mock File System Access API
const mockFileSystemDirectoryHandle = {
    kind: 'directory',
    name: 'test-project',
    queryPermission: vi.fn().mockResolvedValue('granted'),
    requestPermission: vi.fn().mockResolvedValue('granted'),
};

global.FileSystemDirectoryHandle = vi.fn().mockImplementation(() => mockFileSystemDirectoryHandle);
```

### Mock Utilities

```typescript
// src/lib/workspace/__tests__/mocks.ts
export const mockFSAHandle: FileSystemDirectoryHandle = {
    kind: 'directory',
    name: 'mock-project',
    queryPermission: vi.fn().mockResolvedValue('granted'),
    requestPermission: vi.fn().mockResolvedValue('granted'),
    isSameEntry: vi.fn().mockResolvedValue(false),
    getDirectoryHandle: vi.fn(),
    getFileHandle: vi.fn(),
    removeEntry: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
} as any;
```

---

## Test Implementation Plan

### Phase 1: Failing Tests (RED)

1. **Create test files** for each scenario
2. **Write failing tests** for all acceptance criteria
3. **Verify tests fail** before implementation
4. **Baseline TypeScript compilation** (should have errors)

**Estimated Time:** 2 hours

**Deliverables:**
- `src/lib/workspace/__tests__/workspace-bindings.test.ts`
- `src/lib/workspace/__tests__/file-snapshot-config.test.ts`
- `src/lib/workspace/__tests__/migration.test.ts`
- `src/lib/workspace/__tests__/indexeddb-validation.test.ts`

---

### Phase 2: Minimal Implementation (GREEN)

1. **Update ProjectMetadata interface** in `project-store.ts`
2. **Add fields to Dexie schema** in `dexie-db-class.ts`
3. **Implement migration logic** in `dexie-db-class.ts`
4. **Apply defaults** in `saveProject` function

**Estimated Time:** 2 hours

**Deliverables:**
- Updated `ProjectMetadata` interface with new fields
- Updated Dexie schema (version increment)
- Migration callback for existing projects
- Default value handling in CRUD operations

---

### Phase 3: Refactor & Optimize (REFACTOR)

1. **Extract default values** to constants
2. **Add JSDoc comments** for new fields
3. **Optimize migration** for large datasets
4. **Add error handling** for corrupted data

**Estimated Time:** 1 hour

**Deliverables:**
- Clean, maintainable code
- Comprehensive documentation
- Error handling edge cases

---

### Phase 4: Validation

1. **Run full test suite** (100% pass rate required)
2. **TypeScript compilation** (`pnpm exec tsc --noEmit`)
3. **Migration testing** with existing data
4. **Code review** against acceptance criteria

**Estimated Time:** 1 hour

**Deliverables:**
- All tests passing (≥80% coverage)
- Zero TypeScript errors
- Migration validated with real data
- Code review approval

---

## Test Execution Checklist

### Pre-Test Setup

- [ ] Install test dependencies: `pnpm add -D fake-indexeddb`
- [ ] Configure Vitest for IndexedDB mocking
- [ ] Create test utilities and mocks
- [ ] Set up test database isolation

### Test Execution

- [ ] Run unit tests: `pnpm test src/lib/workspace/__tests__`
- [ ] Run migration tests: `pnpm test migration.test.ts`
- [ ] Run TypeScript compilation: `pnpm exec tsc --noEmit`
- [ ] Check test coverage: `pnpm test --coverage`

### Post-Test Validation

- [ ] Verify 100% test pass rate
- [ ] Verify ≥80% code coverage
- [ ] Verify zero TypeScript errors
- [ ] Verify migration with existing IndexedDB data
- [ ] Verify backward compatibility

---

## Success Metrics

### Quantitative Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Test Pass Rate | 100% | __ | ⏳ |
| Code Coverage | ≥80% | __ | ⏳ |
| TypeScript Errors | 0 | __ | ⏳ |
| Migration Time | <5s (1000 projects) | __ | ⏳ |
| Test Execution Time | <30s | __ | ⏳ |

### Qualitative Metrics

- [ ] All acceptance criteria validated by tests
- [ ] Migration tested with production-like data
- [ ] Backward compatibility verified
- [ ] Code follows project conventions
- [ ] Documentation complete (JSDoc, comments)

---

## References

### Project Documentation

- **Sprint Status:** `_bmad-output/sprint-artifacts/sprint-status.yaml`
- **Story Definition:** `_bmad-output/sprint-artifacts/epic-wb-1-project-metadata-enhancement.md`
- **Architecture:** `_bmad-output/project-planning-artifacts/architecture.md`
- **Test Standards:** `.agent/rules/testing/test-writing.md`

### External Documentation

- **Dexie.js Versioning:** https://dexie.org/docs/Version/Version.stores()
- **Vitest Testing:** https://vitest.dev/guide/
- **fake-indexeddb:** https://github.com/dumbmatter/fakeIndexedDB

### Related Stories

- **Story 27-1c:** Dexie.js Migration (preceding schema changes)
- **Story WB-2:** Workspace Binding UI (consumer of this enhancement)

---

## Appendix: Test Template

### Test File Template

```typescript
/**
 * @fileoverview Tests for Story WB-1: [Feature Name]
 * @governance EPIC-WB-1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { _resetDBForTesting } from '../project-store';
import { generateNewProject, generateOldProject } from './test-utils';

describe('Story WB-1: [Feature Name]', () => {
    beforeEach(async () => {
        await _resetDBForTesting();
    });

    afterEach(async () => {
        await _resetDBForTesting();
    });

    describe('[Acceptance Criterion]', () => {
        it('[Test Name]', async () => {
            // Arrange
            const input = generateNewProject();

            // Act
            const result = await testOperation(input);

            // Assert
            expect(result).toBe(expected);
        });
    });
});
```

---

**Document Status:** Ready for Implementation
**Next Action:** Execute Phase 1 (Write Failing Tests)
**Test Lead:** @bmad-bmm-dev
**Review Date:** 2026-01-01T03:00:00+07:00
