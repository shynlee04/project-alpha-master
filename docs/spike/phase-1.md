reated January 16, 2026 at 5:30 PM
This codemap traces the Spike Architecture Implementation that creates an isolated testing environment for debugging project space routing, multi-workspace navigation, and state management. Key flows include route registration [1b], Notes workspace loading with hydration [2b-2c], IDE platform guards [3c-3d], project creation with persistence [4c-4d], platform detection [5b-5d], and database isolation [6a-6c].

AI generated guide
Motivation
The Spike Architecture creates an isolated testing environment to debug critical routing and state management issues without affecting the main application. When users experienced "bounce-back" problems where they were redirected away from valid projects, and hydration race conditions where routes loaded before data was ready, the team needed a safe way to test fixes. The spike uses a separate database namespace (viagentSpikeDB) and isolated routes (/-spike/) to replicate the exact same routing logic while keeping test data completely separate from production data.

Details
The spike routing system works by manually registering routes alongside the main application routes [1b]. The main router imports spike route components and adds them as children to the route tree, creating parallel paths like /-spike/notes/$projectId that mirror the main /notes/$projectId routes.

The entry point at /-spike/ detects when users visit the spike hub and shows a navigation grid with links to Notes, IDE, and Project Creation workspaces [1c]. Each link navigates to an isolated version of the workspace that uses the same loading logic but with comprehensive logging and error handling.

The key innovation is complete isolation - the spike uses its own Dexie database, Zustand store, and platform detection utilities, allowing developers to test routing fixes, platform guards, and state management without risking production data. This isolation makes it possible to reproduce and fix issues like mobile users being incorrectly blocked from the IDE or projects not loading due to hydration timing problems.

Spike Route Registration System
Router Configuration
1a
Import Spike Routes
router.tsx:7
import { Route as spikeRootRoute } from './routes/-spike/__root'
1b
Register Spike Routes
router.tsx:47
const routeTreeWithSpike = routeTree.addChildren([spikeRootRoute, spikeNotesRoute, spikeIdeRoute, spikeCreateRoute])
Create router instance
Spike Root Route
1c
Root Detection
__root.tsx:20
const isRoot = location.pathname === '/-spike';
Show navigation grid
1d
Navigation Links
__root.tsx:28
<Link to="/-spike/notes" className="block">Notes Workspace</Link>
IDE Workspace link
Create Project link
Render child routes

AI generated guide
Motivation
The Notes Workspace Loading Flow solves a critical race condition problem where the application would crash or redirect users in infinite loops when accessing project workspaces. The main issue was that route loaders would execute before the Zustand state management store finished hydrating from localStorage, causing projects to appear "not found" when they actually existed. This created a terrible user experience with bounce-back redirects and broken navigation.

Details
The flow starts with route definition [2a] that creates a lazy-loaded route for /-spike/notes/$projectId. When a user navigates to a notes workspace, the loader first performs an SSR safety check to prevent server-side rendering errors, then calls waitForSpikeHydration(10000ms) [2b] which ensures the Zustand store is fully hydrated before proceeding. The hydration waiter includes a timeout fallback mechanism that prevents the app from hanging indefinitely if hydration fails.

Once hydrated, the system queries the isolated spike database using spikeDB.projects.get(projectId) [2c]. If the project doesn't exist, a project not found check triggers a redirect to the spike hub [2d]. When successful, the loader returns the project data to the component [2e], which then renders the Notes workspace with full project context.

The entire flow is wrapped in comprehensive logging and redirect loop detection to debug the original bounce-back issues that plagued the main application.

Notes Workspace Loading Flow
Route Definition Entry Point
2a
Notes Route Definition
notes.tsx:17
export const Route = createFileRoute('/-spike/notes/$projectId')({
Route Loader Execution
SSR Safety Check
2b
Wait for Hydration
notes-loader.tsx:105
await waitForSpikeHydration(10000); // 10 second timeout
Timeout fallback mechanism
Project Query from Database
2c
Query Project from DB
notes-loader.tsx:119
const record = await spikeDB.projects.get(projectId);
Error Handling & Redirects
Project not found check
2d
Redirect on Not Found
notes-loader.tsx:148
throw redirect({ to: '/-spike' });
Success Path
2e
Return Project Data
notes-loader.tsx:170
return { project };

IDE Workspace Guard Flow
Route Definition
3a
Platform Guard Entry
ide-guard.tsx:58
beforeLoad: async ({ params }) => {
Platform Validation (beforeLoad)
3b
Get Platform Info
ide-guard.tsx:70
const platform = getSpikePlatformContract();
3c
Mobile Block Check
ide-guard.tsx:83
if (!platform.canAccessIDE) {
3d
Redirect Mobile Users
ide-guard.tsx:129
throw redirect({ to: '/-spike/notes/$projectId', params: { projectId }, search: { reason } });
Project Loading (loader)
3e
Load Project Data
ide-guard.tsx:180
const record = await spikeDB.projects.get(projectId);

AI generated guide
Motivation
The Spike Architecture creates an isolated testing environment to debug critical routing and state management issues without affecting the main application. When users navigate to workspaces like /notes/$projectId or /ide/$projectId, they experience bounce-back redirects and hydration failures. The spike provides a safe playground to test fixes, validate platform guards (desktop-only IDE access), and ensure project persistence works correctly across devices.

Details
Project creation begins with form validation [4a] where users input a project name and folder path. The system generates a unique project ID using timestamps [4b] and immediately updates the Zustand state store [4c] to provide instant UI feedback. Simultaneously, the project is persisted to the isolated viagentSpikeDB IndexedDB database [4d] to ensure data survives page refreshes. The system implements robust error handling with automatic rollback - if database persistence fails, the project is removed from the Zustand store to maintain consistency [4e]. This dual-layer approach (in-memory state + persistent storage) with comprehensive logging and retry logic ensures reliable project management while maintaining complete isolation from the main application's data.

Project Creation Flow
Form Submission Handler
Input Validation
4a
Create Project Call
project-creation.tsx:51
const projectId = await createProject({ name, folderPath, storageType: 'fsa' });
Project Store Creation
4b
Generate Unique ID
project-store.ts:154
const projectId = generateProjectId();
4c
Update Zustand Store
project-store.ts:182
set((state) => ({ projects: { ...state.projects, [projectId]: project }, activeProjectId: projectId }));
set() with new project
4d
Persist to Dexie
project-store.ts:197
await spikeDB.projects.put(toRecord(project, 'ide'));
spikeDB.projects.put()
4e
Return Project ID
project-store.ts:250
return projectId;
projectId to caller
Error Handling
Rollback on failure
Remove from Zustand

AI generated guide
Motivation
The Spike Architecture needs to detect device capabilities to control workspace access. Mobile users can't access the IDE workspace due to File System Access API limitations and screen size constraints. The system must reliably determine if a user is on desktop, mobile, or tablet, and what storage/coding capabilities are available, then enforce platform-specific access rules.

Details
Platform detection starts with getSpikePlatformContract() [5e], which caches the result for the entire session. The system first detects device type by analyzing user agent strings, screen width, and touch capabilities [5b]. It then checks for File System Access API support by looking for showDirectoryPicker in the window object [5a].

For advanced coding features, it verifies WebContainer support through SharedArrayBuffer and cross-origin isolation checks. The critical access decisions flow from these detections: agentic coding requires both FSA and WebContainer support [5c], while IDE access requires full agentic coding capabilities [5d]. This creates a clear hierarchy where only desktop users with full browser capabilities can access the IDE workspace.

The platform contract is built once and cached, ensuring consistent behavior throughout the user session and preventing platform detection from running repeatedly on every navigation.

Platform Detection System
5e
Return Cached Contract
platform-detection.ts:242
return cachedContract;
5b
Device Type Detection
platform-detection.ts:178
const deviceType = detectDeviceType();
Check user agent
Screen width analysis
Touch capability test
5a
FSA Support Detection
platform-detection.ts:50
const hasFSA = 'showDirectoryPicker' in window;
'showDirectoryPicker' in window
detectWebContainerSupport()
SharedArrayBuffer check
crossOriginIsolated check
buildPlatformContract()
determineStorageType()
5c
Agentic Coding Check
platform-detection.ts:187
const canDoAgenticCoding = canAccessFSA && canRunTerminal;
5d
IDE Access Decision
platform-detection.ts:190
const canAccessIDE = canDoAgenticCoding;
Platform Contract Cache
5e
Return Cached Contract

AI generated guide
Motivation
The Spike Architecture creates a completely isolated testing environment to debug critical routing and state management issues without risking the main application. When users experienced "bounce-back" problems where navigating to valid projects would redirect them back to the hub, and mobile users couldn't access the IDE properly, the team needed a safe way to test fixes without affecting real user data. The spike uses a separate IndexedDB namespace [6a] and isolated Zustand store [6d] to ensure tests can't corrupt production data.

Details
The isolation starts with the database layer - instead of using the main viagent-v2 database, the spike creates viagentSpikeDB [6c] with its own schema [6b]. This completely separates spike projects from user projects. The state management mirrors this isolation with a dedicated spike-project-store [6d] that persists to its own localStorage key.

The store creation follows a specific pattern: first define the store logic in createProjectStore() [6d], then wrap it with Zustand's persist middleware [6d], configure the storage name [6d], and finally set up hydration handling [6e]. The hydration system is crucial - it ensures the store doesn't try to query the database before it's properly loaded, which was one of the root causes of the original bounce-back issues.

When you create a project in the spike, it follows the same flow as production: generate a unique ID, update the Zustand store [6c], then persist to the isolated database [6c]. But because everything is isolated, you can test edge cases, race conditions, and error scenarios without any risk to real user data. This architecture lets developers reproduce and fix the routing issues that were blocking users from accessing their projects.

Spike Database Isolation System
ViaGentSpikeDatabase class
6a
Isolated Database
dexie-db.ts:55
super('viagentSpikeDB');
super('viagentSpikeDB')
6b
Define Schema
dexie-db.ts:66
this.version(1).stores({ projects: '++id, name, createdAt, lastOpened, workspaceId', fsaHandles: 'projectId, lastPermissionCheck' });
Define projects & handles tables
spikeDB singleton instance
6c
Database Instance
dexie-db.ts:82
const spikeDB = new ViaGentSpikeDatabase();
Zustand Store Integration
createProjectStore()
persist() wrapper
6d
Zustand Persistence
project-store.ts:502
name: 'spike-project-store',
onRehydrateStorage()
6e
Mark Hydration Complete
project-store.ts:547
setHydrated();
useSpikeProjectStore export