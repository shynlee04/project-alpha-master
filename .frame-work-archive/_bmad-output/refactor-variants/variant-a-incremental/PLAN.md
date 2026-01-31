# Variant A: Incremental Refactor (8 Weeks)

**Variant ID:** `VARIANT-A-INCREMENTAL`
**Date:** 2026-01-20
**Duration:** 8 weeks
**Approach:** Gradual, phased migration with minimal disruption
**Risk Level:** LOW

---

## 📋 EXECUTIVE SUMMARY

**Philosophy:** "Evolution, not revolution" - Transform the architecture incrementally while maintaining backward compatibility and minimizing user disruption.

**Key Characteristics:**
- 4 distinct phases, each building on the previous
- No breaking changes until final phase
- Parallel development of new and old systems
- Extensive testing at each phase
- Gradual user migration

**Best For:** Projects with active users, complex dependencies, and tolerance for longer timelines.

---

## 🎯 PHASE BREAKDOWN

### Phase 1: Unified Storage API (Week 1-2)

**Goal:** Create a unified abstraction layer over FSA and IndexedDB storage.

**Deliverables:**
1. `StorageGateway` interface (already exists in ADR-033)
2. `FSAGateway` implementation (already exists)
3. `DexieGateway` implementation (new)
4. `StorageAdapterFactory` (already exists)
5. Migration guide for existing code

**Implementation Steps:**

**Week 1:**
```typescript
// 1. Create DexieGateway
// File: src/infrastructure/filesystem/dexie-gateway.ts
export class DexieGateway implements StorageGateway {
    async read(path: string): Promise<Uint8Array> { ... }
    async write(path: string, data: Uint8Array): Promise<void> { ... }
    async delete(path: string): Promise<void> { ... }
    async list(path: string): Promise<FileEntry[]> { ... }
    async exists(path: string): Promise<boolean> { ... }
    watch(callback: FileChangeCallback): () => void { ... }
}

// 2. Update StorageAdapterFactory
// File: src/infrastructure/filesystem/StorageAdapterFactory.ts
export class StorageAdapterFactory {
    static create(storageType: 'fsa' | 'indexeddb', handle?: FileSystemDirectoryHandle): StorageGateway {
        if (storageType === 'fsa') {
            return new FSAGateway(handle);
        } else {
            return new DexieGateway();
        }
    }
}
```

**Week 2:**
```typescript
// 3. Migrate existing code to use StorageGateway
// Example migration:
// BEFORE:
const files = await fsaAdapter.listFiles();

// AFTER:
const gateway = StorageAdapterFactory.create(project.storageType, project.fsaHandle);
const files = await gateway.list('/');
```

**Validation:**
- [ ] All storage operations work through gateway
- [ ] TypeScript compiles with 0 errors
- [ ] Existing tests pass
- [ ] No performance regression

**Risk:** LOW - Gateway is a thin wrapper, minimal code changes

---

### Phase 2: Feature Plugin Interfaces (Week 3-4)

**Goal:** Define plugin interfaces for FileTree, Monaco, Terminal, Notes.

**Deliverables:**
1. `FeaturePlugin` interface
2. `FileTreePlugin` interface
3. `MonacoPlugin` interface
4. `TerminalPlugin` interface
5. `NotesPlugin` interface
6. Plugin registry system

**Implementation Steps:**

**Week 3:**
```typescript
// 1. Define base plugin interface
// File: src/domain/interfaces/feature-plugin.interface.ts
export interface FeaturePlugin {
    id: string;
    name: string;
    version: string;
    dependencies: string[];

    initialize(project: Project, gateway: StorageGateway): Promise<void>;
    render(): React.ReactNode;
    cleanup(): Promise<void>;
}

// 2. Define specific plugin interfaces
// File: src/domain/interfaces/file-tree-plugin.interface.ts
export interface FileTreePlugin extends FeaturePlugin {
    onFileSelect(path: string): void;
    onFileRename(oldPath: string, newPath: string): void;
    onFileDelete(path: string): void;
}

// File: src/domain/interfaces/monaco-plugin.interface.ts
export interface MonacoPlugin extends FeaturePlugin {
    openFile(path: string): Promise<void>;
    saveFile(path: string, content: string): Promise<void>;
    closeFile(path: string): void;
}

// File: src/domain/interfaces/terminal-plugin.interface.ts
export interface TerminalPlugin extends FeaturePlugin {
    executeCommand(command: string): Promise<void>;
    onOutput(callback: (output: string) => void): void;
}

// File: src/domain/interfaces/notes-plugin.interface.ts
export interface NotesPlugin extends FeaturePlugin {
    createNote(path: string): Promise<void>;
    openNote(path: string): Promise<void>;
    deleteNote(path: string): Promise<void>;
}
```

**Week 4:**
```typescript
// 3. Create plugin registry
// File: src/infrastructure/plugin/plugin-registry.ts
export class PluginRegistry {
    private plugins: Map<string, FeaturePlugin> = new Map();

    register(plugin: FeaturePlugin): void {
        this.plugins.set(plugin.id, plugin);
    }

    get(id: string): FeaturePlugin | undefined {
        return this.plugins.get(id);
    }

    getAll(): FeaturePlugin[] {
        return Array.from(this.plugins.values());
    }

    async initializeAll(project: Project, gateway: StorageGateway): Promise<void> {
        for (const plugin of this.plugins.values()) {
            await plugin.initialize(project, gateway);
        }
    }
}
```

**Validation:**
- [ ] All plugin interfaces defined
- [ ] Plugin registry works
- [ ] TypeScript compiles with 0 errors
- [ ] Plugin lifecycle (init → render → cleanup) works

**Risk:** LOW - Interfaces only, no implementation yet

---

### Phase 3: Consolidate Routes (Week 5-6)

**Goal:** Reduce entry points from 16 to ≤5, remove workspace concept.

**Deliverables:**
1. New route structure
2. Route consolidation logic
3. Migration of existing routes
4. Fallback paths for dead ends

**Implementation Steps:**

**Week 5:**
```typescript
// 1. Define new route structure
// BEFORE (16 routes):
/ → /hub → /notes → /notes/$projectId → /ide → /ide/$projectId → ...

// AFTER (5 routes):
/ → /hub → /project/$projectId → /settings → /about

// 2. Create unified project route
// File: src/routes/project.$projectId.tsx
export const Route = createFileRoute('/project/$projectId')({
    component: ProjectDashboard,
    loader: async ({ params }) => {
        const project = await getProject(params.projectId);
        const gateway = StorageAdapterFactory.create(project.storageType, project.fsaHandle);
        return { project, gateway };
    },
});

function ProjectDashboard() {
    const { project, gateway } = Route.useLoaderData();
    const [activePlugins, setActivePlugins] = useState<string[]>(['notes']);

    return (
        <div className="project-dashboard">
            <PluginSelector
                availablePlugins={pluginRegistry.getAll()}
                activePlugins={activePlugins}
                onToggle={(pluginId) => {
                    setActivePlugins(prev =>
                        prev.includes(pluginId)
                            ? prev.filter(id => id !== pluginId)
                            : [...prev, pluginId]
                    );
                }}
            />
            <div className="plugin-container">
                {activePlugins.map(pluginId => {
                    const plugin = pluginRegistry.get(pluginId);
                    return plugin ? plugin.render() : null;
                })}
            </div>
        </div>
    );
}
```

**Week 6:**
```typescript
// 3. Implement fallback paths
// File: src/routes/__root.tsx
export const Route = createRootRoute({
    component: RootLayout,
    errorComponent: ErrorBoundary,
});

function RootLayout() {
    return (
        <html>
            <body>
                <Outlet />
                <ErrorBoundary fallback={<ErrorFallback />} />
            </body>
        </html>
    );
}

// 4. Remove deprecated routes
// DELETE: /workspace/$projectId.tsx
// DELETE: /knowledge/$projectId.tsx (deferred)
// DELETE: /study/$projectId.tsx (deferred)
```

**Validation:**
- [ ] All 5 routes work
- [ ] No dead ends
- [ ] Fallback paths work
- [ ] TypeScript compiles with 0 errors
- [ ] Existing tests pass

**Risk:** MEDIUM - Route changes can break navigation

---

### Phase 4: Progressive Disclosure (Week 7-8)

**Goal:** Simplify wizard, implement progressive disclosure UI.

**Deliverables:**
1. Simplified wizard (2 steps)
2. Progressive disclosure UI
3. Advanced options panel
4. User onboarding flow

**Implementation Steps:**

**Week 7:**
```typescript
// 1. Simplify wizard to 2 steps
// BEFORE (5 steps):
// 1. ProjectDetailsStep
// 2. WorkspaceSetupStep
// 3. AgentSelectionStep (detached)
// 4. FileSetupStep
// 5. ReviewStep

// AFTER (2 steps):
// 1. ProjectBasicsStep (name, folder, storage auto-detected)
// 2. PluginSelectionStep (choose which features to enable)

// File: src/presentation/components/project/ProjectCreationWizard.tsx
const steps = [
    {
        id: 'basics',
        title: 'Project Basics',
        component: ProjectBasicsStep,
    },
    {
        id: 'plugins',
        title: 'Choose Features',
        component: PluginSelectionStep,
    },
];

// 2. Implement progressive disclosure
// File: src/presentation/components/project/PluginSelectionStep.tsx
function PluginSelectionStep() {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div>
            <h2>Choose Features</h2>

            {/* Basic features (always visible) */}
            <PluginCard
                id="notes"
                name="Notes"
                description="Markdown editor with BlockNote"
                icon={<FileTextIcon />}
                defaultEnabled={true}
            />

            <PluginCard
                id="filetree"
                name="File Browser"
                description="Browse and manage project files"
                icon={<FolderIcon />}
                defaultEnabled={true}
            />

            {/* Advanced features (hidden by default) */}
            {showAdvanced && (
                <>
                    <PluginCard
                        id="monaco"
                        name="Code Editor"
                        description="Full-featured code editor"
                        icon={<CodeIcon />}
                        defaultEnabled={false}
                    />

                    <PluginCard
                        id="terminal"
                        name="Terminal"
                        description="Command-line interface"
                        icon={<TerminalIcon />}
                        defaultEnabled={false}
                    />
                </>
            )}

            <Button onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
        </div>
    );
}
```

**Week 8:**
```typescript
// 3. Implement user onboarding
// File: src/presentation/components/onboarding/OnboardingFlow.tsx
function OnboardingFlow() {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: 'Welcome to ViaGent',
            content: 'Your AI-powered development environment',
        },
        {
            title: 'Create Your First Project',
            content: 'Select a folder and choose your features',
        },
        {
            title: 'Start Coding',
            content: 'Your project is ready. Let\'s build something amazing!',
        },
    ];

    return (
        <div className="onboarding">
            <h1>{steps[step].title}</h1>
            <p>{steps[step].content}</p>
            <Button onClick={() => setStep(step + 1)}>
                {step < steps.length - 1 ? 'Next' : 'Get Started'}
            </Button>
        </div>
    );
}
```

**Validation:**
- [ ] Wizard has 2 steps
- [ ] Progressive disclosure works
- [ ] Advanced options hidden by default
- [ ] Onboarding flow works
- [ ] TypeScript compiles with 0 errors
- [ ] User testing shows reduced confusion

**Risk:** LOW - UI changes only, no architectural impact

---

## 📊 PHASE SUMMARY

| Phase | Duration | Deliverables | Risk | Dependencies |
|-------|----------|--------------|------|--------------|
| Phase 1 | 2 weeks | Unified Storage API | LOW | None |
| Phase 2 | 2 weeks | Feature Plugin Interfaces | LOW | Phase 1 |
| Phase 3 | 2 weeks | Route Consolidation | MEDIUM | Phase 1, 2 |
| Phase 4 | 2 weeks | Progressive Disclosure | LOW | Phase 3 |

---

## ✅ VALIDATION CHECKLIST

### End of Phase 1
- [ ] StorageGateway interface complete
- [ ] FSAGateway and DexieGateway implemented
- [ ] StorageAdapterFactory works
- [ ] All storage operations use gateway
- [ ] TypeScript compiles with 0 errors
- [ ] No performance regression

### End of Phase 2
- [ ] All plugin interfaces defined
- [ ] Plugin registry works
- [ ] Plugin lifecycle works
- [ ] TypeScript compiles with 0 errors
- [ ] No breaking changes

### End of Phase 3
- [ ] Routes reduced to 5
- [ ] No dead ends
- [ ] Fallback paths work
- [ ] TypeScript compiles with 0 errors
- [ ] Navigation works correctly

### End of Phase 4
- [ ] Wizard simplified to 2 steps
- [ ] Progressive disclosure works
- [ ] Onboarding flow works
- [ ] TypeScript compiles with 0 errors
- [ ] User testing shows improvement

---

## 🎯 SUCCESS METRICS

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Wizard Options | 23 | ≤10 | ✅ |
| Entry Points | 16 | ≤5 | ✅ |
| Broken UI Elements | 15+ | 0 | ✅ |
| Architecture Model | Workspace-centric | Project-centric | ✅ |
| User Confusion | High | Low | ✅ |
| Development Time | 8 weeks | 8 weeks | ✅ |

---

## 🚨 RISK MITIGATION

### Risk 1: Phase 3 Route Changes Break Navigation
**Mitigation:**
- Implement fallback paths
- Test all navigation flows
- Keep old routes as redirects temporarily
- Monitor error logs

### Risk 2: Phase 2 Plugin Interfaces Too Complex
**Mitigation:**
- Start with minimal interfaces
- Add complexity only as needed
- Document all interfaces thoroughly
- Provide examples

### Risk 3: Phase 4 Progressive Disclosure Confuses Users
**Mitigation:**
- User testing before release
- Clear labels and tooltips
- "Show Advanced" button always visible
- Onboarding explains the concept

---

## 📝 LESSONS LEARNED

### What Works Well
- Gradual migration reduces risk
- Each phase builds on previous
- Extensive testing at each phase
- No breaking changes until final phase

### What to Watch Out For
- Phase dependencies can cause delays
- Parallel development can be complex
- User testing is critical for Phase 4
- Documentation must be kept up to date

---

## 🎬 CONCLUSION

**Variant A (Incremental)** is the safest approach for projects with active users and complex dependencies. It provides:

- ✅ Low risk
- ✅ Minimal disruption
- ✅ Extensive testing
- ✅ Backward compatibility
- ✅ Gradual user migration

**Trade-offs:**
- ❌ Longer timeline (8 weeks)
- ❌ More complex coordination
- ❌ Parallel development overhead
- ❌ Slower time to value

**Best For:** Production systems with active users, complex dependencies, and tolerance for longer timelines.

---

**Variant Prepared By:** architect-ext
**Date:** 2026-01-20
**Status:** READY FOR REVIEW