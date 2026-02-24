# Variant B: Radical Simplification (4 Weeks)

**Variant ID:** `VARIANT-B-RADICAL`
**Date:** 2026-01-20
**Duration:** 4 weeks
**Approach:** Aggressive simplification, remove everything non-essential
**Risk Level:** HIGH

---

## 📋 EXECUTIVE SUMMARY

**Philosophy:** "Less is more" - Remove all non-essential features, simplify to core functionality, then rebuild incrementally.

**Key Characteristics:**
- Aggressive feature removal
- Single project pointer
- 3 entry points maximum
- Wizard simplified to 2 steps
- No workspace concept
- Project-centric from day 1

**Best For:** Projects with low user count, high technical debt, and need for quick turnaround.

---

## 🎯 PHASE BREAKDOWN

### Phase 1: Remove Non-Essential Features (Week 1)

**Goal:** Delete all non-essential features, UI elements, and code paths.

**Deliverables:**
1. Knowledge/Study features removed
2. Agent Selection step removed
3. Project Type dropdown removed
4. Deprecated functions removed
5. Broken UI elements removed

**Implementation Steps:**

**Day 1-2: Remove Knowledge/Study**
```bash
# DELETE these files:
src/routes/knowledge.$projectId.tsx
src/routes/study.$projectId.tsx
src/presentation/components/knowledge/
src/presentation/components/study/

# REMOVE from sidebar:
src/presentation/components/layout/Sidebar.tsx
# Remove Knowledge and Study menu items

# REMOVE from Hub:
src/presentation/components/hub/HubHomePage.tsx
# Remove Knowledge and Study cards
```

**Day 3: Remove Agent Selection Step**
```typescript
// DELETE: src/presentation/components/project/steps/AgentSelectionStep.tsx

// UPDATE: src/presentation/components/project/ProjectCreationWizard.tsx
const steps = [
    {
        id: 'details',
        title: 'Project Details',
        component: ProjectDetailsStep,
    },
    {
        id: 'workspace',
        title: 'Workspace Setup',
        component: WorkspaceSetupStep,
    },
    // AgentSelectionStep REMOVED
    {
        id: 'files',
        title: 'File Setup',
        component: FileSetupStep,
    },
    {
        id: 'review',
        title: 'Review',
        component: ReviewStep,
    },
];
```

**Day 4: Remove Project Type Dropdown**
```typescript
// UPDATE: src/presentation/components/project/steps/ProjectDetailsStep.tsx
// REMOVE project type dropdown entirely

// Storage type is auto-detected based on platform:
// - Desktop: FSA (if folder selected)
// - Mobile: IndexedDB
// - Desktop (no folder): IndexedDB (browser mode)
```

**Day 5: Remove Deprecated Functions**
```typescript
// DELETE: src/lib/workspace/temp-project.ts
// DELETE: src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts
// (openFolder and switchFolder functions)

// UPDATE: All imports to use canonical functions:
// createProjectFromFolder() for FSA projects
// getOrCreateBrowserModeProject() for IndexedDB projects
```

**Validation:**
- [ ] Knowledge/Study routes deleted
- [ ] Knowledge/Study UI removed from sidebar
- [ ] Agent Selection step deleted
- [ ] Project Type dropdown removed
- [ ] Deprecated functions deleted
- [ ] TypeScript compiles with 0 errors
- [ ] No broken imports

**Risk:** HIGH - Deleting code can break dependencies

---

### Phase 2: Simplify Wizard (Week 2)

**Goal:** Reduce wizard from 5 steps to 2 steps.

**Deliverables:**
1. 2-step wizard
2. Auto-detect storage type
3. Remove low-value options
4. Simplify validation

**Implementation Steps:**

**Day 1-2: Create New Wizard Structure**
```typescript
// NEW: src/presentation/components/project/SimplifiedWizard.tsx
const steps = [
    {
        id: 'basics',
        title: 'Project Basics',
        component: ProjectBasicsStep,
    },
    {
        id: 'features',
        title: 'Choose Features',
        component: FeatureSelectionStep,
    },
];

// NEW: src/presentation/components/project/steps/ProjectBasicsStep.tsx
function ProjectBasicsStep() {
    const [projectName, setProjectName] = useState('');
    const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);

    // Auto-detect storage type
    const storageType = folderHandle ? 'fsa' : 'indexeddb';

    return (
        <div>
            <h2>Project Basics</h2>

            <Input
                label="Project Name"
                value={projectName}
                onChange={setProjectName}
                required
            />

            {getPlatformContract().canAccessFSA && (
                <Button onClick={async () => {
                    const handle = await window.showDirectoryPicker();
                    setFolderHandle(handle);
                }}>
                    {folderHandle ? folderHandle.name : 'Select Folder'}
                </Button>
            )}

            <p>
                Storage: {storageType === 'fsa' ? 'Local Files (FSA)' : 'Browser Storage'}
            </p>
        </div>
    );
}

// NEW: src/presentation/components/project/steps/FeatureSelectionStep.tsx
function FeatureSelectionStep() {
    const [features, setFeatures] = useState({
        notes: true,
        filetree: true,
        monaco: false,
        terminal: false,
    });

    return (
        <div>
            <h2>Choose Features</h2>

            <Checkbox
                label="Notes"
                checked={features.notes}
                onChange={(checked) => setFeatures({ ...features, notes: checked })}
            />

            <Checkbox
                label="File Browser"
                checked={features.filetree}
                onChange={(checked) => setFeatures({ ...features, filetree: checked })}
            />

            <Checkbox
                label="Code Editor"
                checked={features.monaco}
                onChange={(checked) => setFeatures({ ...features, monaco: checked })}
            />

            <Checkbox
                label="Terminal"
                checked={features.terminal}
                onChange={(checked) => setFeatures({ ...features, terminal: checked })}
            />
        </div>
    );
}
```

**Day 3-4: Remove Low-Value Options**
```typescript
// REMOVE from ProjectDetailsStep:
// - Project description (rarely used)
// - Project tags (not implemented)
// - Custom storage path (confusing)

// REMOVE from WorkspaceSetupStep:
// - IDE binding toggle (auto-forced by platform)
// - Workspace bindings (replaced by feature selection)

// REMOVE from FileSetupStep:
// - Create sample files (not needed)
// - Import from template (not implemented)
```

**Day 5: Simplify Validation**
```typescript
// NEW: src/presentation/components/project/SimplifiedWizard.tsx
function validateStep(stepId: string, data: any): boolean {
    switch (stepId) {
        case 'basics':
            return data.projectName.length > 0;
        case 'features':
            return Object.values(data.features).some(Boolean);
        default:
            return false;
    }
}
```

**Validation:**
- [ ] Wizard has 2 steps
- [ ] Storage type auto-detected
- [ ] Low-value options removed
- [ ] Validation simplified
- [ ] TypeScript compiles with 0 errors
- [ ] User testing shows reduced confusion

**Risk:** MEDIUM - UI changes can confuse users

---

### Phase 3: Consolidate Entry Points (Week 3)

**Goal:** Reduce entry points from 16 to 3.

**Deliverables:**
1. 3 routes only
2. Single project pointer
3. No workspace concept
4. Fallback paths for all scenarios

**Implementation Steps:**

**Day 1-2: Define New Route Structure**
```typescript
// BEFORE (16 routes):
/ → /hub → /notes → /notes/$projectId → /ide → /ide/$projectId → /workspace/$projectId → /knowledge/$projectId → /study/$projectId → /settings → /about

// AFTER (3 routes):
/ → /project/$projectId → /settings

// DELETE these routes:
src/routes/notes.tsx
src/routes/notes.$projectId.tsx
src/routes/ide.tsx
src/routes/ide.$projectId.tsx
src/routes/workspace.$projectId.tsx
src/routes/knowledge.$projectId.tsx
src/routes/study.$projectId.tsx
src/routes/about.tsx

// KEEP these routes:
src/routes/index.tsx (redirects to /hub)
src/routes/hub.tsx
src/routes/project.$projectId.tsx (NEW)
src/routes/settings.tsx
```

**Day 3-4: Create Unified Project Route**
```typescript
// NEW: src/routes/project.$projectId.tsx
export const Route = createFileRoute('/project/$projectId')({
    component: ProjectDashboard,
    loader: async ({ params }) => {
        const project = await getProject(params.projectId);

        if (!project) {
            throw redirect({ to: '/hub' });
        }

        // Single project pointer - no workspace concept
        const gateway = StorageAdapterFactory.create(
            project.storageType,
            project.fsaHandle
        );

        return { project, gateway };
    },
});

function ProjectDashboard() {
    const { project, gateway } = Route.useLoaderData();
    const [activeFeatures, setActiveFeatures] = useState<string[]>(
        project.features || ['notes', 'filetree']
    );

    return (
        <div className="project-dashboard">
            <ProjectHeader project={project} />

            <FeatureLayout
                activeFeatures={activeFeatures}
                onFeatureToggle={(featureId) => {
                    setActiveFeatures(prev =>
                        prev.includes(featureId)
                            ? prev.filter(id => id !== featureId)
                            : [...prev, featureId]
                    );
                }}
            >
                {activeFeatures.includes('notes') && (
                    <NotesFeature project={project} gateway={gateway} />
                )}

                {activeFeatures.includes('filetree') && (
                    <FileTreeFeature project={project} gateway={gateway} />
                )}

                {activeFeatures.includes('monaco') && (
                    <MonacoFeature project={project} gateway={gateway} />
                )}

                {activeFeatures.includes('terminal') && (
                    <TerminalFeature project={project} gateway={gateway} />
                )}
            </FeatureLayout>
        </div>
    );
}
```

**Day 5: Implement Fallback Paths**
```typescript
// UPDATE: src/routes/hub.tsx
export const Route = createFileRoute('/hub')({
    component: HubPage,
});

function HubPage() {
    const projects = useProjectStore(state => state.projects);

    // Fallback: No projects → show create project
    if (projects.length === 0) {
        return <CreateProjectPrompt />;
    }

    // Fallback: Single project → auto-open
    if (projects.length === 1) {
        return <Navigate to={`/project/${projects[0].id}`} />;
    }

    // Default: Show project list
    return <ProjectList projects={projects} />;
}

// UPDATE: src/routes/index.tsx
export const Route = createRootRoute({
    component: () => <Navigate to="/hub" />,
});
```

**Validation:**
- [ ] Routes reduced to 3
- [ ] No dead ends
- [ ] Fallback paths work
- [ ] Single project pointer
- [ ] No workspace concept
- [ ] TypeScript compiles with 0 errors
- [ ] Navigation works correctly

**Risk:** HIGH - Route changes can break everything

---

### Phase 4: Implement Project-Centric Model (Week 4)

**Goal:** Complete migration to project-centric architecture.

**Deliverables:**
1. Project-centric state management
2. Feature-based rendering
3. Unified storage API
4. Documentation

**Implementation Steps:**

**Day 1-2: Project-Centric State**
```typescript
// NEW: src/infrastructure/persistence/stores/project/project-store.ts
export const useProjectStore = create<ProjectStore>((set, get) => ({
    projects: [],
    activeProjectId: null,

    setActiveProject: (projectId: string) => {
        set({ activeProjectId: projectId });
    },

    getActiveProject: () => {
        const { projects, activeProjectId } = get();
        return projects.find(p => p.id === activeProjectId);
    },

    // Single project pointer - no workspace state
    updateProjectFeatures: (projectId: string, features: string[]) => {
        set({
            projects: get().projects.map(p =>
                p.id === projectId ? { ...p, features } : p
            ),
        });
    },
}));
```

**Day 3-4: Feature-Based Rendering**
```typescript
// NEW: src/presentation/components/features/FeatureLayout.tsx
function FeatureLayout({
    activeFeatures,
    onFeatureToggle,
    children,
}: FeatureLayoutProps) {
    return (
        <div className="feature-layout">
            <FeatureSidebar
                activeFeatures={activeFeatures}
                onToggle={onFeatureToggle}
            />
            <div className="feature-content">
                {children}
            </div>
        </div>
    );
}

// NEW: src/presentation/components/features/FeatureSidebar.tsx
function FeatureSidebar({
    activeFeatures,
    onToggle,
}: FeatureSidebarProps) {
    const features = [
        { id: 'notes', name: 'Notes', icon: FileTextIcon },
        { id: 'filetree', name: 'Files', icon: FolderIcon },
        { id: 'monaco', name: 'Code', icon: CodeIcon },
        { id: 'terminal', name: 'Terminal', icon: TerminalIcon },
    ];

    return (
        <div className="feature-sidebar">
            {features.map(feature => (
                <FeatureButton
                    key={feature.id}
                    active={activeFeatures.includes(feature.id)}
                    onClick={() => onToggle(feature.id)}
                >
                    <feature.icon />
                    {feature.name}
                </FeatureButton>
            ))}
        </div>
    );
}
```

**Day 5: Documentation**
```markdown
# Architecture Guide

## Project-Centric Model

### Key Concepts
- **Single Project Pointer**: Each project has one entry in the database
- **Feature-Based Rendering**: Features are plugins that render into project dashboard
- **Unified Storage**: All storage operations go through StorageGateway
- **No Workspace Concept**: Projects are the top-level entity

### Route Structure
- `/` → Redirects to `/hub`
- `/hub` → Project list or create project
- `/project/$projectId` → Project dashboard with features
- `/settings` → Application settings

### Feature System
Features are enabled/disabled per project:
- `notes` - Markdown editor
- `filetree` - File browser
- `monaco` - Code editor
- `terminal` - Command line

### Storage
- Desktop with folder: FSA (File System Access API)
- Desktop without folder: IndexedDB (browser mode)
- Mobile: IndexedDB
```

**Validation:**
- [ ] Project-centric state works
- [ ] Feature-based rendering works
- [ ] Unified storage API works
- [ ] Documentation complete
- [ ] TypeScript compiles with 0 errors
- [ ] All tests pass

**Risk:** MEDIUM - New architecture can have bugs

---

## 📊 PHASE SUMMARY

| Phase | Duration | Deliverables | Risk | Dependencies |
|-------|----------|--------------|------|--------------|
| Phase 1 | 1 week | Remove Non-Essential Features | HIGH | None |
| Phase 2 | 1 week | Simplify Wizard | MEDIUM | Phase 1 |
| Phase 3 | 1 week | Consolidate Entry Points | HIGH | Phase 1, 2 |
| Phase 4 | 1 week | Project-Centric Model | MEDIUM | Phase 1, 2, 3 |

---

## ✅ VALIDATION CHECKLIST

### End of Phase 1
- [ ] Knowledge/Study features removed
- [ ] Agent Selection step removed
- [ ] Project Type dropdown removed
- [ ] Deprecated functions removed
- [ ] TypeScript compiles with 0 errors
- [ ] No broken imports

### End of Phase 2
- [ ] Wizard has 2 steps
- [ ] Storage type auto-detected
- [ ] Low-value options removed
- [ ] Validation simplified
- [ ] TypeScript compiles with 0 errors
- [ ] User testing shows improvement

### End of Phase 3
- [ ] Routes reduced to 3
- [ ] No dead ends
- [ ] Fallback paths work
- [ ] Single project pointer
- [ ] No workspace concept
- [ ] TypeScript compiles with 0 errors

### End of Phase 4
- [ ] Project-centric state works
- [ ] Feature-based rendering works
- [ ] Unified storage API works
- [ ] Documentation complete
- [ ] TypeScript compiles with 0 errors
- [ ] All tests pass

---

## 🎯 SUCCESS METRICS

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Wizard Options | 23 | ≤10 | ✅ |
| Entry Points | 16 | ≤3 | ✅ |
| Broken UI Elements | 15+ | 0 | ✅ |
| Architecture Model | Workspace-centric | Project-centric | ✅ |
| User Confusion | High | Low | ✅ |
| Development Time | 8 weeks | 4 weeks | ✅ |

---

## 🚨 RISK MITIGATION

### Risk 1: Phase 1 Deleting Code Breaks Dependencies
**Mitigation:**
- Run TypeScript check after each deletion
- Test all navigation flows
- Keep backup branch
- Monitor error logs

### Risk 2: Phase 3 Route Changes Break Everything
**Mitigation:**
- Implement fallback paths
- Test all navigation flows
- Keep old routes as redirects temporarily
- Monitor error logs

### Risk 3: Phase 4 New Architecture Has Bugs
**Mitigation:**
- Extensive testing
- Rollback plan ready
- Feature flags for gradual rollout
- Monitor error logs

---

## 📝 LESSONS LEARNED

### What Works Well
- Fast time to value (4 weeks)
- Radical simplification reduces complexity
- Single project pointer eliminates confusion
- No workspace concept simplifies state

### What to Watch Out For
- Deleting code can break dependencies
- Route changes can break navigation
- New architecture can have bugs
- User testing is critical

---

## 🎬 CONCLUSION

**Variant B (Radical)** is the fastest approach for projects with low user count and high technical debt. It provides:

- ✅ Fast time to value (4 weeks)
- ✅ Radical simplification
- ✅ Single project pointer
- ✅ No workspace concept
- ✅ Reduced complexity

**Trade-offs:**
- ❌ High risk
- ❌ Breaking changes
- ❌ User disruption
- ❌ Potential for bugs

**Best For:** Projects with low user count, high technical debt, and need for quick turnaround.

---

**Variant Prepared By:** architect-ext
**Date:** 2026-01-20
**Status:** READY FOR REVIEW