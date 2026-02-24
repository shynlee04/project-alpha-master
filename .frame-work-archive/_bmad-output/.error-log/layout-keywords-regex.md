1727 results - 178 files

_bmad-ext/.archive-past-src/components/ide/MonacoEditor/MonacoEditor.tsx:
  278                          padding: { top: 8, bottom: 8 },
  279:                         automaticLayout: true,
  280                          tabSize: 2,

_bmad-ext/.archive-past-src/components/layout/ChatPanelWrapper.tsx:
  2   * @fileoverview Chat Panel Wrapper Component
  3:  * @module components/layout/ChatPanelWrapper
  4   * 
  5   * Right sidebar containing the agent chat panel with close button.
  6:  * Part of the IDE layout refactoring to reduce IDELayout.tsx complexity.
  7   * 

_bmad-ext/.archive-past-src/components/layout/IDEHeaderBar.tsx:
  2   * @fileoverview IDE Header Bar Component
  3:  * @module components/layout/IDEHeaderBar
  4   * 

_bmad-ext/.archive-past-src/components/layout/IDELayout.tsx:
    1  /**
    2:  * @fileoverview IDE Layout Component
    3:  * @module components/layout/IDELayout
    4   * 
    5:  * Main IDE layout component that orchestrates all IDE panels.
    6:  * Uses react-resizable-panels for a VS Code-like layout with:
    7   * - Left sidebar (FileTree)

   14   * <WorkspaceProvider projectId="my-project">
   15:  *   <IDELayout />
   16   * </WorkspaceProvider>

   27  
   28: // Layout sub-components
   29  import { IDEHeaderBar } from './IDEHeaderBar';

   44  /**
   45:  * IDELayout - Main IDE layout component.
   46   * 
   47   * Consumes WorkspaceContext for project state and provides:
   48:  * - Resizable panel layout
   49   * - File tree navigation

   55   * 
   56:  * @returns IDE layout JSX element
   57   */
   58: export function IDELayout(): React.JSX.Element {
   59    const { toast } = useToast();

  103      scheduleIdeStatePersistence,
  104:     handlePanelLayoutChange,
  105    } = useIdeStatePersistence({ projectId });

  176  
  177:   // Apply panel layouts
  178    useEffect(() => {
  179:     const layouts = restoredIdeState?.panelLayouts;
  180:     if (!layouts) return;
  181  
  182:     const applyLayout = (
  183        groupKey: string,

  187        if (appliedPanelGroupsRef.current.has(groupKey)) return;
  188:       const layout = layouts[groupKey];
  189:       if (!ref || !layout) return;
  190:       if (expectedLength !== undefined && layout.length !== expectedLength) return;
  191  
  192:       ref.setLayout(layout);
  193        appliedPanelGroupsRef.current.add(groupKey);

  195  
  196:     applyLayout('center', centerPanelGroupRef.current);
  197:     applyLayout('editor', editorPanelGroupRef.current);
  198:     applyLayout('main', mainPanelGroupRef.current, isChatVisible ? 3 : 2);
  199    }, [restoredIdeState, isChatVisible, appliedPanelGroupsRef]);

  394  
  395:       {/* Main Resizable Layout */}
  396        <PanelGroup

  399          className="flex-1"
  400:         onLayout={(layout) => handlePanelLayoutChange('main', layout)}
  401        >

  430              direction="vertical"
  431:             onLayout={(layout) => handlePanelLayoutChange('center', layout)}
  432            >

  437                  direction="horizontal"
  438:                 onLayout={(layout) => handlePanelLayoutChange('editor', layout)}
  439                >

_bmad-ext/.archive-past-src/components/layout/index.ts:
  1  /**
  2:  * @fileoverview Layout Components Barrel Export
  3:  * @module components/layout
  4   * 
  5:  * Exports all layout components for the IDE.
  6   */
  7  
  8: export { IDELayout } from './IDELayout';
  9  export { IDEHeaderBar, type IDEHeaderBarProps } from './IDEHeaderBar';

_bmad-ext/.archive-past-src/components/layout/TerminalPanel.tsx:
  2   * @fileoverview Terminal Panel Component
  3:  * @module components/layout/TerminalPanel
  4   * 
  5   * Bottom panel containing terminal, output, and problems tabs.
  6:  * Part of the IDE layout refactoring to reduce IDELayout.tsx complexity.
  7   * 

_bmad-ext/.archive-past-src/hooks/useIdeStatePersistence.ts:
    5   * Custom hook for managing IDE state persistence including:
    6:  * - Panel layouts
    7   * - Open files

   15   *   restoredIdeState,
   16:  *   panelLayoutsRef,
   17   *   scheduleIdeStatePersistence,
   18:  *   handlePanelLayoutChange,
   19   * } = useIdeStatePersistence({ projectId });

   48      restoredIdeState: IdeState | null;
   49:     /** Reference to panel layouts */
   50:     panelLayoutsRef: React.MutableRefObject<Record<string, number[]>>;
   51      /** Reference to set of applied panel groups */

   66      scheduleIdeStatePersistence: (delayMs?: number) => void;
   67:     /** Handle panel layout change */
   68:     handlePanelLayoutChange: (groupId: string, layout: number[]) => void;
   69  }

   73   * 
   74:  * Handles loading and saving of IDE state including panel layouts,
   75   * open files, scroll positions, and UI visibility states.

   85      // Refs for mutable state
   86:     const panelLayoutsRef = useRef<Record<string, number[]>>({});
   87      const appliedPanelGroupsRef = useRef<Set<string>>(new Set());

  112                      projectId,
  113:                     panelLayouts: panelLayoutsRef.current,
  114                      openFiles: openFilePathsRef.current,

  127      /**
  128:      * Handle panel layout change event.
  129       * 
  130       * @param groupId - Panel group identifier
  131:      * @param layout - New layout sizes array
  132       */
  133:     const handlePanelLayoutChange = useCallback(
  134:         (groupId: string, layout: number[]) => {
  135:             panelLayoutsRef.current[groupId] = layout;
  136              scheduleIdeStatePersistence(400);

  169              if (saved) {
  170:                 panelLayoutsRef.current = saved.panelLayouts ?? {};
  171              }

  184          restoredIdeState,
  185:         panelLayoutsRef,
  186          appliedPanelGroupsRef,

  193          scheduleIdeStatePersistence,
  194:         handlePanelLayoutChange,
  195      };

_bmad-ext/.archive-past-src/lib/persistence/db.ts:
  27      /**
  28:      * Panel layouts keyed by panel-group identifier (e.g. "main", "center", "editor").
  29       * Use this for async persistence (IndexedDB) since react-resizable-panels storage is sync-only.
  30       */
  31:     panelLayouts?: Record<string, number[]>;
  32      /**
  33:      * Legacy single-layout field (kept for backward compatibility with early spikes).
  34       */

_bmad-ext/.archive-past-src/lib/workspace/ide-state-store.ts:
   6    projectId: string
   7:   panelLayouts?: Record<string, number[]>
   8    panelSizes?: number[]

  25      projectId: record.projectId,
  26:     panelLayouts: record.panelLayouts,
  27      panelSizes: record.panelSizes,

  54      projectId: state.projectId,
  55:     panelLayouts: state.panelLayouts,
  56      panelSizes: state.panelSizes,

_bmad-ext/.archive-past-src/lib/workspace/index.ts:
  23      type ProjectWithPermission,
  24:     type LayoutConfig,
  25  } from './project-store';

_bmad-ext/.archive-past-src/lib/workspace/project-store.ts:
  26  /**
  27:  * Layout configuration stored per project.
  28   * Optional - used for restoring IDE state.
  29   */
  30: export interface LayoutConfig {
  31      panelSizes?: number[];

  50      autoSync?: boolean;
  51:     /** Optional layout state for IDE restoration */
  52:     layoutState?: LayoutConfig;
  53      /** Custom exclusion patterns for sync (glob syntax) */

_bmad-ext/.archive-past-src/lib/workspace/WorkspaceContext.tsx:
  88          syncNow: wrappedSyncNow,
  89:         // Story 13-2: Expose setIsWebContainerBooted for IDELayout
  90          setIsWebContainerBooted: setters.setIsWebContainerBooted,

_bmad-ext/.archive-past-src/routes/workspace/$projectId.tsx:
   1  import { createFileRoute } from '@tanstack/react-router'
   2: import { IDELayout } from '../../components/layout/IDELayout'
   3  import { ToastProvider, Toast } from '../../components/ui/Toast'

  23              <WorkspaceProvider projectId={projectId} initialProject={project}>
  24:                 <IDELayout />
  25              </WorkspaceProvider>

src/domain/entities/project.ts:
  22  /**
  23:  * Layout configuration stored per project.
  24   * Optional - used for restoring IDE state.
  25   */
  26: export interface LayoutConfig {
  27    panelSizes?: number[];

  70    autoSync: boolean;
  71:   /** Optional layout state for IDE restoration */
  72:   layoutState?: LayoutConfig;
  73    /** Custom exclusion patterns for sync (glob syntax) */

src/domain/interfaces/feature-plugin.interface.ts:
  196  
  197:   /** Platform and layout constraints for plugin loading */
  198    requirements: PluginRequirements;

  216  
  217:   /** Called when plugin is mounted in layout */
  218    onMount?: (context: ProjectContext) => Promise<void>;
  219  
  220:   /** Called when plugin is unmounted from layout */
  221    onUnmount?: () => Promise<void>;

src/hooks/useIdeStatePersistence.ts:
   18   * // Legacy usage (still works)
   19:  * const { handlePanelLayoutChange } = useIdeStatePersistence({ projectId });
   20   * 

   22   * import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
   23:  * const setPanelLayout = useIDEStore(s => s.setPanelLayout);
   24   * ```

   38      projectId: string;
   39:     panelLayouts?: Record<string, number[]>;
   40      openFiles?: string[];

   61      restoredIdeState: IdeState | null;
   62:     /** Reference to panel layouts (legacy compatibility) */
   63:     panelLayoutsRef: React.MutableRefObject<Record<string, number[]>>;
   64      /** Reference to set of applied panel groups */

   79      scheduleIdeStatePersistence: (delayMs?: number) => void;
   80:     /** Handle panel layout change */
   81:     handlePanelLayoutChange: (groupId: string, layout: number[]) => void;
   82  }

  102      const activeFile = useIDEStore(s => s.activeFile);
  103:     const panelLayouts = useIDEStore(s => s.panelLayouts);
  104      const terminalTab = useIDEStore(s => s.terminalTab);

  107      const setProjectId = useIDEStore(s => s.setProjectId);
  108:     const setPanelLayout = useIDEStore(s => s.setPanelLayout);
  109  

  111      // These sync with Zustand state automatically
  112:     const panelLayoutsRef = useRef<Record<string, number[]>>(panelLayouts);
  113      const appliedPanelGroupsRef = useRef<Set<string>>(new Set());

  122      useEffect(() => {
  123:         panelLayoutsRef.current = panelLayouts;
  124          openFilePathsRef.current = openFiles;

  128          chatVisibleRef.current = chatVisible;
  129:     }, [panelLayouts, openFiles, activeFile, activeFileScrollTop, terminalTab, chatVisible]);
  130  

  156      /**
  157:      * Handle panel layout change.
  158       * Delegates to Zustand store action.
  159       */
  160:     const handlePanelLayoutChange = useCallback(
  161:         (groupId: string, layout: number[]) => {
  162:             setPanelLayout(groupId, layout);
  163          },
  164:         [setPanelLayout],
  165      );

  170              projectId,
  171:             panelLayouts,
  172              openFiles,

  181          restoredIdeState,
  182:         panelLayoutsRef,
  183          appliedPanelGroupsRef,

  190          scheduleIdeStatePersistence,
  191:         handlePanelLayoutChange,
  192      };

src/hooks/useMediaQuery.ts:
  89   * if (isMobile) {
  90:  *   return <MobileLayout />;
  91   * }
  92:  * return <DesktopLayout />;
  93   * ```

src/infrastructure/context/plugin-coordination-context.tsx:
   12   * ```tsx
   13:  * // In root layout (outside ProjectContextProvider):
   14   * <PluginCoordinationProvider>
   15   *   <ProjectContextProvider>
   16:  *     <PluginLayout />
   17   *   </ProjectContextProvider>

  145   *   <ProjectContextProvider projectId={projectId}>
  146:  *     <PluginLayout />
  147   *   </ProjectContextProvider>

src/infrastructure/context/project-context.tsx:
  37  import { NULL_CHAT_SERVICE } from '@/infrastructure/services/chat-service';
  38: import { PermissionOverlay } from '@/presentation/components/layout/PermissionOverlay';
  39  import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';

src/infrastructure/persistence/dexie-db-block-types.ts:
  26      | 'reference'      // Block reference
  27:     | 'column'         // Column layout
  28      | 'synced'         // Synced block

src/infrastructure/persistence/dexie-db-core-types.ts:
   64      exclusionPatterns?: string[];  // Custom exclusion patterns for sync
   65:     layoutState?: {  // Optional layout state for IDE restoration
   66        panelSizes?: number[];

   93  /**
   94:  * IDE state per project (panel layouts, open files, etc.)
   95   * PERSIST-S002: Added workspaceId for cross-workspace isolation

  104    focusedPath?: string;  // FIX-2026-01-20: FileTree focused path persistence
  105:   panelLayouts: Record<string, number[]>;
  106    terminalTab: "output" | "terminal" | "problems";

src/infrastructure/persistence/stores/hydration-manager.ts:
  88                expandedPaths: new Set(record.expandedPaths), // Convert array to Set
  89:               panelLayouts: record.panelLayouts,
  90                terminalTab: record.terminalTab,

src/infrastructure/persistence/stores/index.ts:
   65    useExpandedPaths,
   66:   usePanelLayouts,
   67    usePanelCollapsed,

  132  export {
  133:   useLayoutStore,
  134:   type LayoutState
  135: } from './layout-store';
  136  

src/infrastructure/persistence/stores/layout-presets-store.ts:
    1  /**
    2:  * @fileoverview Layout Presets Store - Zustand store for layout preset management
    3:  * @module infrastructure/persistence/stores/layout-presets-store
    4   *
    5:  * **ARCH-03-03**: Layout Presets System
    6   *
    7:  * Provides Zustand store with persist middleware for layout preset management.
    8:  * Persists custom layout presets per project in localStorage.
    9   * Built-in presets are hardcoded and not persisted.

   11   * **ADR-034-001 COMPLIANCE:**
   12:  * - Presets are "saved layouts", NOT "workspace modes"
   13   * - Built-in preset names: "Coding", "Writing", "Focus" (NOT "IDE Mode", "Notes Mode", "Focus Mode")

   24  import type { PluginId } from '@/domain/types/plugin-types';
   25: import type { LayoutMode } from '@/presentation/layouts/PluginLayoutStore';
   26  

   37   * - Returns undefined if no active project
   38:  * - Used to prefix layout-preset storage key
   39   */

   48    } catch (error) {
   49:     console.warn('[LayoutPresetsStore] Failed to read current project ID:', error);
   50      return undefined;

   54  // ============================================================================
   55: // Layout Preset Types
   56  // ============================================================================

   58  /**
   59:  * Layout Preset Interface
   60:  * / Giao diện Preset Layout
   61   *
   62   * @remarks
   63:  * - Represents a saved layout configuration
   64   * - Can be built-in (Coding, Writing, Focus) or user-defined
   65:  * - Contains plugins, layout mode, and panel sizes
   66   * - isBuiltIn flag prevents deletion of built-in presets
   67   */
   68: export interface LayoutPreset {
   69    id: string;

   71    plugins: PluginId[];
   72:   layoutMode: LayoutMode;
   73    panelSizes: Record<string, number>;

   78  /**
   79:  * Layout Presets State Interface
   80:  * / Giao diện Trạng thái Layout Presets
   81   */
   82: export interface LayoutPresetsState {
   83:   presets: LayoutPreset[];
   84    activePresetId: string | null;

   87    loadPreset: (presetId: string) => void;
   88:   savePreset: (name: string, plugins: PluginId[], mode: LayoutMode, panelSizes: Record<string, number>) => void;
   89    deletePreset: (presetId: string) => void;

  100  /**
  101:  * Built-in Layout Presets
  102:  * / Các Preset Layout tích hợp sẵn
  103   *

  105   * - **ADR-034-001 COMPLIANCE:**
  106:  *   - Presets are "saved layouts", NOT "workspace modes"
  107   *   - Names: "Coding", "Writing", "Focus" (NOT "IDE Mode", "Notes Mode", "Focus Mode")

  116   */
  117: export const BUILT_IN_PRESETS: LayoutPreset[] = [
  118    {

  121      plugins: ['filetree', 'monaco', 'terminal', 'chat'],
  122:     layoutMode: '2+1',
  123      panelSizes: { filetree: 20, monaco: 50, terminal: 30 },

  129      plugins: ['filetree', 'notes', 'chat'],
  130:     layoutMode: '2-column',
  131      panelSizes: { filetree: 25, notes: 75 },

  137      plugins: ['monaco'],  // or ['notes'] depending on available plugins
  138:     layoutMode: '1-column',
  139      panelSizes: { monaco: 100 },

  148  /**
  149:  * Layout Presets Store
  150:  * / Store Layout Presets
  151   *

  153   * - Zustand v5 store with persist middleware
  154:  * - Uses project-specific localStorage key: `layout-presets-${projectId}`
  155   * - Merges built-in presets with custom presets from localStorage
  156:  * - loadPreset() updates PluginLayoutStore with preset configuration
  157   * - Custom presets can be deleted (built-ins cannot)
  158   */
  159: export const useLayoutPresetsStore = create<LayoutPresetsState>()(
  160    persist(

  177  
  178:         const storageKey = `layout-presets-${projectId}`;
  179          const customPresetsData = localStorage.getItem(storageKey);

  186          try {
  187:           const customPresets = JSON.parse(customPresetsData) as LayoutPreset[];
  188            set({

  191          } catch (error) {
  192:           console.warn('[LayoutPresetsStore] Failed to parse custom presets:', error);
  193            set({ presets: [...BUILT_IN_PRESETS] });

  197        /**
  198:        * Load preset and apply to PluginLayoutStore
  199          const projectId = getCurrentProjectId();

  201  
  202:         const storageKey = `layout-presets-${projectId}`;
  203          const customPresetsData = localStorage.getItem(storageKey);

  210          try {
  211:           const customPresets = JSON.parse(customPresetsData) as LayoutPreset[];
  212            set({

  215          } catch (error) {
  216:           console.warn('[LayoutPresetsStore] Failed to parse custom presets:', error);
  217            set({ presets: [...BUILT_IN_PRESETS] });

  221        /**
  222:        * Load preset and apply to PluginLayoutStore
  223:        * / Tải preset và áp dụng vào PluginLayoutStore
  224         *

  228         * - Finds preset by ID
  229:        * - Updates PluginLayoutStore with preset configuration
  230         * - Sets active preset ID

  235          if (!preset) {
  236:           console.warn(`[LayoutPresetsStore] Preset not found: ${presetId}`);
  237            return;

  239  
  240:         // Update PluginLayoutStore with preset configuration
  241          // Dynamic import to avoid circular dependency
  242:         import('@/presentation/layouts/PluginLayoutStore').then(({ usePluginLayoutStore }) => {
  243:           const layoutStore = usePluginLayoutStore.getState();
  244  
  245            // Clear existing plugins and add preset plugins one by one
  246:           layoutStore.clearActivePlugins();
  247            preset.plugins.forEach(pluginId => {
  248:             layoutStore.addPlugin(pluginId);
  249            });
  250  
  251:           // Set layout mode
  252:           layoutStore.setLayoutMode(preset.layoutMode);
  253  

  256              Object.entries(preset.panelSizes).forEach(([pluginId, size]) => {
  257:               layoutStore.setPanelSize(pluginId as PluginId, size);
  258              });

  260  
  261:           console.log(`[LayoutPresetsStore] Loaded preset: ${preset.name}`, preset);
  262          });

  272         * @param plugins - Active plugins to save
  273:        * @param mode - Layout mode to save
  274         * @param panelSizes - Panel sizes to save

  283          if (!projectId) {
  284:           console.warn('[LayoutPresetsStore] Cannot save preset: no active project');
  285            return;

  287  
  288:         const storageKey = `layout-presets-${projectId}`;
  289  
  290:         const newPreset: LayoutPreset = {
  291            id: `custom-${Date.now()}`,

  293            plugins,
  294:           layoutMode: mode,
  295            panelSizes,

  312  
  313:         console.log(`[LayoutPresetsStore] Saved custom preset: ${name}`, newPreset);
  314        },

  329          if (!preset) {
  330:           console.warn(`[LayoutPresetsStore] Preset not found: ${presetId}`);
  331            return;

  335          if (preset.isBuiltIn) {
  336:           console.warn(`[LayoutPresetsStore] Cannot delete built-in preset: ${preset.name}`);
  337            return;

  342  
  343:         const storageKey = `layout-presets-${projectId}`;
  344  

  356  
  357:         console.log(`[LayoutPresetsStore] Deleted custom preset: ${preset.name}`);
  358        },

  370      {
  371:       name: 'via-gent-layout-presets-storage',
  372      }

src/infrastructure/persistence/stores/layout-store.ts:
    1  /**
    2:  * @fileoverview Layout State Store
    3:  * @module lib/state/layout-store
    4:  * @governance LAYOUT-1
    5   * @ai-observable false
    6   * 
    7:  * Unified Zustand store for home page layout state management.
    8   * Manages sidebar collapse, mobile menu, navigation state, and path history.
    9   * 
   10:  * Story LAYOUT-1: Create Unified Layout Store
   11   * 

   13   * ```tsx
   14:  * import { useLayoutStore } from '@/infrastructure/persistence/stores';
   15   * 
   16   * function Component() {
   17:  *   const sidebarCollapsed = useLayoutStore(s => s.sidebarCollapsed);
   18:  *   const toggleSidebar = useLayoutStore(s => s.toggleSidebar);
   19   *   

   38  /**
   39:  * Layout State shape
   40   */
   41: export interface LayoutState {
   42      // =========================================================================

   93  /**
   94:  * Main layout state store with localStorage persistence
   95   * 

   99   */
  100: export const useLayoutStore = create<LayoutState>()(
  101      persist(

  131          {
  132:             name: 'via-gent-layout-storage',
  133  

src/infrastructure/persistence/stores/session-snapshot-manager.ts:
   57     */
   58:   panelLayout: {
   59      sidebarWidth?: number;

  209        scrollPositions: snapshotRecord.snapshot.scrollPositions,
  210:       panelLayout: {
  211          sidebarWidth: snapshotRecord.snapshot.panelWidths[0],

  239        // scrollPositions: snapshot.scrollPositions,
  240:       // panelSizes: snapshot.panelLayout.panelSizes,
  241        // activeChatThreadId: snapshot.chatState?.activeThreadId,

src/infrastructure/persistence/stores/user-preferences-store.ts:
   11   * - User preferences stored per user (localStorage)
   12:  * - showAdvancedLayouts controls progressive disclosure
   13   * - hasSeenOnboarding tracks first-time user experience

   78   * @remarks
   79:  * - showAdvancedLayouts: Controls visibility of advanced layout options (3-column, 2+1)
   80   * - hasSeenOnboarding: Tracks if user has seen onboarding tooltips

   83   * English:
   84:  * - showAdvancedLayouts: Hide/show advanced layout options for progressive disclosure
   85   * - hasSeenOnboarding: Don't show tooltips to returning users

   88   * Tiếng Việt:
   89:  * - showAdvancedLayouts: Ẩn/hiện tùy chọn layout nâng cao cho tiết lộ dần
   90   * - hasSeenOnboarding: Không hiện gợi ý cho người dùng quay lại

   94    // State / Trạng thái
   95:   showAdvancedLayouts: boolean;     // Show/hide advanced layout options / Hiển thị/ẩn tùy chọn layout nâng cao
   96    hasSeenOnboarding: boolean;        // Onboarding completed flag / Flag onboarding hoàn tất

   99    // Actions / Hành động
  100:   toggleAdvancedLayouts: () => void;                      // Toggle advanced visibility / Chuyển đổi hiển thị nâng cao
  101:   setShowAdvancedLayouts: (show: boolean) => void;         // Set advanced visibility explicitly / Đặt hiển thị nâng cao rõ ràng
  102    markOnboardingComplete: () => void;                      // Mark onboarding as complete / Đánh dấu onboarding đã hoàn tất

  118   * - Version: 1 (for future migrations)
  119:  * - Initial state: showAdvancedLayouts: false (start simple)
  120   * - Initial state: hasSeenOnboarding: false (show tooltips on first load)

  124   * - Persists to localStorage automatically
  125:  * - Convenience hooks provided: useAdvancedLayouts(), useOnboarding(), useDefaultPreset()
  126   *

  129   * - Tự động lưu vào localStorage
  130:  * - Cung cấp hooks tiện lợi: useAdvancedLayouts(), useOnboarding(), useDefaultPreset()
  131   */

  135        // Initial State / Trạng thái khởi đầu
  136:       showAdvancedLayouts: false,    // Start simple (first-time user experience) / Bắt đầu đơn giản (trải nghiệm người dùng lần đầu)
  137        hasSeenOnboarding: false,     // Hasn't seen tooltips yet / Chưa thấy tooltip

  142        /**
  143:        * Toggle advanced layouts visibility
  144:        * / Chuyển đổi hiển thị layout nâng cao
  145         *
  146         * @remarks
  147:        * Flips showAdvancedLayouts between true and false
  148         */
  149:       toggleAdvancedLayouts: () => {
  150          set((state) => ({
  151:           showAdvancedLayouts: !state.showAdvancedLayouts,
  152          }));

  155        /**
  156:        * Set advanced layouts visibility explicitly
  157:        * / Đặt hiển thị layout nâng cao rõ ràng
  158         *
  159:        * @param show - Whether to show advanced layouts
  160         */
  161:       setShowAdvancedLayouts: (show) => {
  162:         set({ showAdvancedLayouts: show });
  163        },

  209  /**
  210:  * useAdvancedLayouts Hook
  211:  * / Hook useAdvancedLayouts
  212   *

  215   * @remarks
  216:  * - showAdvanced: Current value of showAdvancedLayouts
  217:  * - toggle: Function to toggle showAdvancedLayouts
  218:  * - setShow: Function to set showAdvancedLayouts explicitly
  219   *
  220   * English:
  221:  * Use this hook when you need to access advanced layouts toggle.
  222   *
  223   * Tiếng Việt:
  224:  * Sử dụng hook này khi bạn cần truy cập toggle layout nâng cao.
  225   */
  226: export function useAdvancedLayouts() {
  227    return useUserPreferencesStore(
  228      useShallow((state) => ({
  229:       showAdvanced: state.showAdvancedLayouts,
  230:       toggle: state.toggleAdvancedLayouts,
  231:       setShow: state.setShowAdvancedLayouts,
  232      }))

src/infrastructure/persistence/stores/ide/ide-layout-slice.ts:
   1  /**
   2:  * @fileoverview IDE Layout Slice
   3:  * @module infrastructure/persistence/stores/ide/ide-layout-slice
   4   * @governance EPIC-CP-1, EPIC-53
   5   *
   6:  * Manages IDE panel layout and visibility:
   7:  * - panelLayouts: Panel sizes for each panel group
   8   * - panelCollapsed: Panel collapse states by panel ID

  12   * - Panel sizes stored as number[] (array of percentages/pixels)
  13:  * - Panel layouts persisted across sessions
  14   */

  16  import { StateCreator } from 'zustand';
  17: import type { IDELayoutState } from './ide-types';
  18  
  19: export const createIDELayoutSlice: StateCreator<IDELayoutState> = (set, get) => ({
  20    // =========================================================================

  23  
  24:   panelLayouts: {},
  25    panelCollapsed: {},

  32    /**
  33:    * Update panel layout for a specific group
  34     *
  35     * @param groupId - Panel group identifier
  36:    * @param layout - Array of panel sizes (react-resizable-panels pattern)
  37     *
  38     * @example
  39:    * setPanelLayout('main', [50, 50]) // Two panels, 50-50 split
  40     */
  41:   setPanelLayout: (groupId: string, layout: number[]) => {
  42:     const { panelLayouts } = get();
  43      set({
  44:       panelLayouts: { ...panelLayouts, [groupId]: layout },
  45      });

src/infrastructure/persistence/stores/ide/ide-state-storage.ts:
  202              : [],
  203:           panelLayouts: state.panelLayouts ?? {},
  204            terminalTab: state.terminalTab ?? 'terminal',

src/infrastructure/persistence/stores/ide/ide-types.ts:
   11   * - Explorer State: File tree expansion state
   12:  * - Layout State: Panel layouts and visibility
   13   * - Terminal State: Terminal tab switching

   60  /**
   61:  * Panel layout state
   62   * Stores panel sizes for react-resizable-panels
   63   */
   64: export interface PanelLayout {
   65    groupId: string;

  110  /**
  111:  * IDE Layout State
  112   *
  113:  * Manages IDE panel layout and visibility:
  114:  * - panelLayouts: Panel sizes for each panel group
  115   * - panelCollapsed: Panel collapse states by panel ID

  117   */
  118: export interface IDELayoutState {
  119    // State
  120:   panelLayouts: Record<string, number[]>;
  121    panelCollapsed: Record<string, boolean>;

  124    // Actions
  125:   setPanelLayout: (groupId: string, layout: number[]) => void;
  126    setPanelCollapsed: (panelId: string, collapsed: boolean) => void;

  235   * - IDEExplorerState (file tree)
  236:  * - IDELayoutState (panels)
  237   * - IDETerminalState (terminal)

  242    IDEExplorerState &
  243:   IDELayoutState &
  244    IDETerminalState &

src/infrastructure/persistence/stores/ide/index.ts:
  22  
  23:   // Layout hooks
  24:   usePanelLayouts,
  25    usePanelCollapsed,

  49    FileTreeNode,
  50:   PanelLayout,
  51  

  58    IDEExplorerState,
  59:   IDELayoutState,
  60    IDETerminalState,

src/infrastructure/persistence/stores/ide/useIDEStore.ts:
   35  import { createIDEExplorerSlice } from './ide-explorer-slice';
   36: import { createIDELayoutSlice } from './ide-layout-slice';
   37  import { createIDETerminalSlice } from './ide-terminal-slice';

   53   * 2. Explorer (file tree)
   54:  * 3. Layout (panels)
   55   * 4. Terminal (tabs)

   67        ...createIDEExplorerSlice(set, get, api),
   68:       ...createIDELayoutSlice(set, get, api),
   69        ...createIDETerminalSlice(set, get, api),

   91  
   92:         // Layout state
   93:         panelLayouts: state.panelLayouts,
   94          panelCollapsed: state.panelCollapsed,

  181  /**
  182:  * Layout Hooks
  183   */
  184  
  185: export function usePanelLayouts() {
  186:   return useIDEStore((s) => s.panelLayouts);
  187  }

src/infrastructure/persistence/stores/project/index.ts:
  31    ProjectStats,
  32:   LayoutConfig,
  33  } from './project-types';

src/infrastructure/persistence/stores/project/project-layout-slice.ts:
   1  /**
   2:  * @fileoverview Project Layout Slice
   3:  * @module infrastructure/persistence/stores/project/project-layout-slice
   4   * @governance EPIC-CP-1.4
   5   *
   6:  * IDE layout state management for projects.
   7   * Handles panel sizes, open files, and active file per project.

   9   * ARCHITECTURE NOTE (ARC-C06):
  10:  * layoutState is stored in-memory on the Project object for quick access.
  11   * Persistence is handled by the IDE store's IDEStateRecord in Dexie, NOT ProjectRecord.
  12:  * This slice is for in-memory coordination only - the IDE store persists panelLayouts.
  13   * @see infrastructure/persistence/stores/ide/useIDEStore.ts

  17  import type {
  18:   LayoutConfig,
  19    ProjectState,
  20:   ProjectLayoutMethods,
  21  } from './project-types';
  22  
  23: export const createProjectLayoutSlice: StateCreator<
  24    ProjectState,

  26    [],
  27:   ProjectLayoutMethods
  28  > = (set, get) => ({
  29:   // Save layout state for project (in-memory only)
  30:   // ARC-C06: Layout is persisted by IDE store in IDEStateRecord, not ProjectRecord
  31:   saveProjectLayout: (projectId: string, layout: LayoutConfig) => {
  32      const existing = get().projects[projectId];

  37  
  38:     console.log('[ProjectStore] Saving layout for project:', projectId, layout);
  39  

  44            ...existing,
  45:           layoutState: layout,
  46          },

  49  
  50:     // NOTE: Dexie persistence is handled by IDE store (IDEStateRecord.panelLayouts)
  51:     // ProjectRecord does not have layoutState field - see dexie-db-core-types.ts
  52    },
  53  
  54:   // Get layout state for project
  55:   getProjectLayout: (projectId: string) => {
  56      const project = get().projects[projectId];
  57:     return project?.layoutState;
  58    },
  59  
  60:   // Clear layout state for project (in-memory only)
  61:   // ARC-C06: Layout clearing is persisted by IDE store
  62:   clearProjectLayout: (projectId: string) => {
  63      const existing = get().projects[projectId];

  68  
  69:     console.log('[ProjectStore] Clearing layout for project:', projectId);
  70  

  75            ...existing,
  76:           layoutState: undefined,
  77          },

  80  
  81:     // NOTE: Dexie persistence is handled by IDE store (IDEStateRecord.panelLayouts)
  82:     // ProjectRecord does not have layoutState field - see dexie-db-core-types.ts
  83    },

src/infrastructure/persistence/stores/project/project-types.ts:
    9  
   10: import type { WorkspaceBindings, Project as DomainProject, LayoutConfig } from '@/domain/entities/project';
   11  import type { WorkspaceType } from '@/domain/entities/workspace';

   19  /**
   20:  * Re-export LayoutConfig
   21   */
   22: export type { LayoutConfig };
   23  

   60    autoSync?: boolean;
   61:   layoutState?: LayoutConfig;
   62    exclusionPatterns?: string[];

   84    autoSync?: boolean;
   85:   layoutState?: LayoutConfig;
   86    exclusionPatterns?: string[];

  171  /**
  172:  * Project layout methods
  173   */
  174: export interface ProjectLayoutMethods {
  175:   saveProjectLayout: (projectId: string, layout: LayoutConfig) => void;
  176:   getProjectLayout: (projectId: string) => LayoutConfig | undefined;
  177:   clearProjectLayout: (projectId: string) => void;
  178  }

src/infrastructure/persistence/stores/project/useProjectStore.ts:
  15   * - project-permissions-slice.ts: FSA permission state management
  16:  * - project-layout-slice.ts: IDE layout state (panel sizes, open files)
  17   * - project-utils-slice.ts: Utility functions

  26    ProjectPermissionsMethods,
  27:   ProjectLayoutMethods,
  28    ProjectUtilsMethods,

  32  import { createProjectPermissionsSlice } from './project-permissions-slice';
  33: import { createProjectLayoutSlice } from './project-layout-slice';
  34  import { createProjectUtilsSlice } from './project-utils-slice';

  40    ProjectPermissionsMethods &
  41:   ProjectLayoutMethods &
  42    ProjectUtilsMethods;

  64      ...createProjectPermissionsSlice(set, get, api),
  65:     ...createProjectLayoutSlice(set, get, api),
  66      ...createProjectUtilsSlice(set, get, api),

src/infrastructure/plugins/platform-defaults.ts:
  70  // ============================================================================
  71: // Get Default Layout Mode Based on Platform
  72  // ============================================================================

  74  /**
  75:  * Get default layout mode based on platform
  76:  * / Lấy chế độ layout mặc định dựa trên nền tảng
  77   *

  83   * @param platform - Platform contract from getPlatformContract()
  84:  * @returns Layout mode appropriate for platform
  85   */
  86: export function getDefaultLayoutMode(
  87    platform: PlatformContract

src/infrastructure/utils/device-detection.ts:
  7   * Provides utilities for detecting device type and checking plugin support.
  8:  * Used by PluginLayout to show fallback UI for unsupported plugins.
  9   *

src/lib/agent/tools/composite/storyboard-tool.ts:
  64  - Visualize a story or concept
  65: - Create a comic or graphic novel layout
  66  - Plan a video or animation sequence

src/lib/events/use-cross-workspace-events.ts:
  80   *   useAllCrossWorkspaceEvents(); // React to all events
  81:  *   return <IDELayout />;
  82   * }

src/lib/mocks/empty.ts:
    7              setValue: () => { },
    8:             layout: () => { },
    9              updateOptions: () => { },

   86          setValue: () => { },
   87:         layout: () => { },
   88          updateOptions: () => { },

  129      edges: () => ({ length: 0 }),
  130:     layout: () => ({ run: () => { } }),
  131      destroy: () => { },

src/lib/notes/ai-vision-service.ts:
  82  - Main elements and subjects
  83: - Visual composition and layout
  84  - Colors and styling

src/lib/notes/saved-blocks-store.ts:
  435          reference: 'Block Reference',
  436:         column: 'Column Layout',
  437          synced: 'Synced Block',

src/lib/persistence/db.ts:
  42      projectId: string;
  43:     panelLayouts?: Record<string, number[]>;
  44      panelSizes?: number[];

src/lib/settings/settings-exporter.ts:
   12  import type { ProviderConfig } from '@/infrastructure/persistence/stores/providers/types';
   13: import type { LayoutState } from '@/infrastructure/persistence/stores/layout-store';
   14  import { serializeSettings, getExportFilename } from './settings-serializer';

   60      providers?: ProviderConfig[];
   61:     preferences?: Partial<LayoutState>;
   62    },

  217    providers?: ProviderConfig[];
  218:   preferences?: Partial<LayoutState>;
  219  }): {

src/lib/settings/settings-serializer.ts:
   12  import type { ProviderConfig } from '@/infrastructure/persistence/stores/providers/types';
   13: import type { LayoutState } from '@/infrastructure/persistence/stores/layout-store';
   14  

   28    autoSync: boolean;
   29:   layoutState?: {
   30      panelSizes?: number[];

  161      autoSync: project.autoSync,
  162:     layoutState: project.layoutState,
  163      exclusionPatterns: project.exclusionPatterns,

  209    providers?: ProviderConfig[];
  210:   preferences?: Partial<LayoutState>;
  211  }): SettingsExport {

src/lib/workspace/index.ts:
  23      type ProjectWithPermission,
  24:     type LayoutConfig,
  25  } from '@/infrastructure/persistence/stores/project';

src/lib/workspace/project-types.ts:
  12  /**
  13:  * Layout configuration stored per project.
  14   * Optional - used for restoring IDE state.
  15   */
  16: export interface LayoutConfig {
  17      panelSizes?: number[];

  45      autoSync?: boolean;
  46:     /** Optional layout state for IDE restoration */
  47:     layoutState?: LayoutConfig;
  48      /** Custom exclusion patterns for sync (glob syntax) */

src/lib/workspace/session-snapshot.ts:
   99                  },
  100:                 panelWidths: this.extractPanelWidths(ideState.panelLayouts),
  101                  terminalHistory: [], // TODO: Integrate with terminal store

  198  
  199:         // Restore panel layouts
  200:         // TODO: Restore panel widths to layout
  201      }

  263      /**
  264:      * Extract panel widths from panel layouts
  265       */
  266:     private extractPanelWidths(panelLayouts: Record<string, number[]>): number[] {
  267:         // Get the first panel layout as widths
  268:         const layouts = Object.values(panelLayouts);
  269:         return layouts.length > 0 ? layouts[0] : [];
  270      }

src/plugins/monaco/MonacoMain.tsx:
  510              scrollBeyondLastLine: false,
  511:             automaticLayout: true,
  512              tabSize: 2,

src/presentation/components/Header.tsx:
   2   * @deprecated This component is deprecated as of 2025-12-27.
   3:  * Use MainLayout + MainSidebar instead for all navigation needs.
   4   * 
   5   * Migration:
   6:  * - Hub pages: Use MainLayout wrapper (see src/routes/index.tsx)
   7:  * - IDE pages: Use IDELayout wrapper (see src/routes/workspace/$projectId.tsx)
   8   * 
   9   * This file will be removed in v2.0.
  10:  * @see src/components/layout/MainLayout.tsx
  11:  * @see src/components/layout/MainSidebar.tsx
  12   */

src/presentation/components/about/AboutPage.tsx:
   1: import { PortfolioLayout } from './layout/PortfolioLayout';
   2  import { HeroSection } from './sections/HeroSection';

  12   * REDESIGN: EPIC-30 Personal Portfolio
  13:  * Uses the new PortfolioLayout and atomic section architecture.
  14   */

  16    return (
  17:     <PortfolioLayout>
  18        <HeroSection />

  22        <ContactSection />
  23:     </PortfolioLayout>
  24    );

src/presentation/components/about/layout/PortfolioLayout.tsx:
   2  import { cn } from '@/lib/utils';
   3: import { MainLayout } from '@/presentation/components/layout/MainLayout';
   4  
   5: interface PortfolioLayoutProps {
   6      children: React.ReactNode;

   9  
  10: export function PortfolioLayout({ children, className }: PortfolioLayoutProps) {
  11      return (
  12:         <MainLayout className="h-screen w-screen overflow-hidden">
  13              {/* Scrollable Container for Portfolio Content */}

  18              </div>
  19:         </MainLayout>
  20      );

src/presentation/components/about/sections/ContactSection.tsx:
  3  import { useTranslation } from 'react-i18next';
  4: import { SectionContainer } from '../layout/SectionContainer';
  5  import { Terminal, Copy, Check } from 'lucide-react';

src/presentation/components/about/sections/HeroSection.tsx:
  2  import { useTranslation } from 'react-i18next';
  3: import { SectionContainer } from '../layout/SectionContainer';
  4  import { Terminal } from 'lucide-react';

src/presentation/components/about/sections/JourneySection.tsx:
  2  import { useTranslation } from 'react-i18next';
  3: import { SectionContainer } from '../layout/SectionContainer';
  4  import { GraduationCap, Brain, Code2, Rocket } from 'lucide-react';

src/presentation/components/about/sections/ShowcaseSection.tsx:
  2  import { useTranslation } from 'react-i18next';
  3: import { SectionContainer } from '../layout/SectionContainer';
  4  import { Terminal, Database, Cloud, Code } from 'lucide-react';

src/presentation/components/about/sections/SkillsUniverse.tsx:
  3  import { useTranslation } from 'react-i18next';
  4: import { SectionContainer } from '../layout/SectionContainer';
  5  import { cn } from '@/lib/utils';

src/presentation/components/about/skills/SkillsMatrix.tsx:
  115              isTablet && 'md:grid-cols-2',
  116:             // Desktop: 2 columns (2x2 layout)
  117              isDesktop && 'lg:grid-cols-2'

src/presentation/components/about/stats/StatsBar.tsx:
  142            className={cn(
  143:             // Grid layout
  144              'grid',

src/presentation/components/about/timeline/AchievementTimeline.tsx:
  122                    'relative md:grid md:grid-cols-2 md:gap-8',
  123:                   // Alternating layout for desktop
  124                    index % 2 === 0 ? 'md:text-left' : 'md:text-right'

src/presentation/components/agent/MigrationStatus.tsx:
  119   * ```tsx
  120:  * function Layout() {
  121   *   return (

src/presentation/components/agent/WorkspacePermissionManager.tsx:
  10  import { useState, useEffect } from 'react';
  11: import { Check, X, Globe, BookOpen, GraduationCap, Layout } from 'lucide-react';
  12  import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';

  24    study: <GraduationCap className="w-4 h-4" />,
  25:   notes: <Layout className="w-4 h-4" />,
  26  };

src/presentation/components/agent/WorkspacePermissions/CategoryApprovalGrid.tsx:
  10   * Features:
  11:  * - Grid layout with category switches
  12   * - Category icons and descriptions

src/presentation/components/agent/WorkspacePermissions/PermissionGridHeader.tsx:
  11   * - Single responsibility (header display only)
  12:  * - Responsive (grid layout)
  13   * - Accessible (semantic structure)

src/presentation/components/chat/ChatInputControls.tsx:
  179   *
  180:  * Layout:
  181   * ┌──────────────────────────────────────────────────────────────┐

  185   *
  186:  * On mobile, the layout adapts:
  187   * ┌────────────────────────────────┐

src/presentation/components/chat/ExpandableChatPanel.tsx:
   90  
   91:     const layout = panelGroup.getLayout();
   92:     if (layout.length === 0) return;
   93  
   94      // Panel index 0 is our chat panel
   95:     const currentSize = layout[0];
   96      const targetSize = isExpanded ? collapsedSize : expandedSize;

   99      if (Math.abs(currentSize - targetSize) > 1) {
  100:       panelGroup.setLayout([targetSize, 100 - targetSize]);
  101      }

  105  
  106:   // Handle layout changes (from drag or programmatic)
  107:   const handleLayout = useCallback((layout: number[]) => {
  108:     if (layout.length > 0) {
  109:       const panelSize = layout[0];
  110        // Update expansion state based on current size

  128        autoSaveId={autoSaveId}
  129:       onLayout={handleLayout}
  130        className={cn("h-full", className)}

src/presentation/components/chat/WorkflowVisualizer.tsx:
  171  
  172:         // Calculate node positions using a simple tree layout
  173          const positions = new Map<string, { x: number; y: number }>();

src/presentation/components/dev/SyncDevTools.tsx:
  13   *
  14:  * function IDELayout() {
  15   *   return (

  17   *       <SyncDevTools />
  18:  *       {/* ... rest of layout *\/}
  19   *     </>

src/presentation/components/diff/MergeConflictResolver.tsx:
   58   * - Keyboard shortcuts (n/p for next/previous conflict)
   59:  * - Mobile responsive (stacked layout)
   60   * - 8-bit gaming style (no blur)

  181  
  182:   const stackLayout = isMobile;
  183  

  226        {/* Content area */}
  227:       <div className={`flex gap-4 p-4 ${stackLayout ? 'flex-col' : ''}`}>
  228          {/* Current changes */}
  229:         <div className={`border border-border rounded ${stackLayout ? 'w-full' : 'flex-1'}`}>
  230            <div className="px-3 py-2 bg-muted border-b border-border font-semibold text-sm text-foreground">

  245          {/* Incoming changes */}
  246:         <div className={`border border-border rounded ${stackLayout ? 'w-full' : 'flex-1'}`}>
  247            <div className="px-3 py-2 bg-muted border-b border-border font-semibold text-sm text-foreground">

src/presentation/components/editor/EditorTabBar.tsx:
  4   * Multi-tab interface with drag-drop reordering, context menu,
  5:  * and keyboard shortcuts. Supports desktop and mobile layouts.
  6   *

src/presentation/components/header/SimpleHeader.tsx:
  4   *
  5:  * **ARCH-03-06**: Root Layout Integration
  6   *

src/presentation/components/hub/ProjectCountCard.tsx:
  32   * - Deleted projects with Trash2 icon (only shown if > 0)
  33:  * - Responsive layout (stacks on mobile)
  34   * - 8-bit themed styling

src/presentation/components/hub/WorkspaceCheckboxList.tsx:
  34   * - Localized section label
  35:  * - Grid layout for consistent spacing
  36   *

src/presentation/components/ide/EnhancedChatInterface.tsx:
  28   *
  29:  * E1-10: Mobile-optimized chat layout
  30   * - Visual viewport API for keyboard avoidance (iOS Safari fix)

src/presentation/components/ide/IDEMobileLayout.tsx:
    1  /**
    2:  * IDEMobileLayout Component
    3   *
    4:  * Mobile-optimized layout for the IDE workspace with bottom navigation panels.
    5   * Features:

   36  
   37: interface IDEMobileLayoutProps {
   38    /** Project ID for state management */

  111  /**
  112:  * IDEMobileLayout - Main mobile IDE layout orchestrator
  113   *

  115   * ```tsx
  116:  * <IDEMobileLayout projectId="my-project" />
  117   * ```
  118   */
  119: export function IDEMobileLayout({
  120    projectId,

  123    showHeader = true,
  124: }: IDEMobileLayoutProps) {
  125    // State management

  271                      <motion.div
  272:                       layoutId="ide-nav-indicator"
  273                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"

  288  
  289: export default IDEMobileLayout

src/presentation/components/ide/index.ts:
  24  
  25: // Layout Components
  26  export { ActivityBar } from './IconSidebar';

  38  // Status Bar Components
  39: // ARCHIVED 2026-01-28 (CC-UX-04): StatusBar moved to components/layout/StatusBar
  40  // See _bmad-ext/.archive/duplicate-components-2026-01-28/ for archived files
  41: // Use: import { StatusBar } from '@/presentation/components/layout/StatusBar'
  42  export * as StatusBarSegments from './statusbar';

  56  
  57: // EPIC-MOBILE: Mobile Layout Components
  58: export { IDEMobileLayout } from './IDEMobileLayout';
  59  

src/presentation/components/ide/SettingsPanel.tsx:
    9  
   10: import { useAdvancedLayouts } from '@/infrastructure/persistence/stores/user-preferences-store'
   11  

   33  
   34:     // ARCH-03-05: Advanced layouts toggle
   35:     const { showAdvanced, toggle } = useAdvancedLayouts()
   36  

   41              icon: SettingsIcon,
   42:             description: t('settings.appearanceDesc', 'Theme, fonts, layout')
   43          },

   65              icon: SettingsIcon,
   66:             description: t('settings.advancedFeatures.description', 'Enable advanced layout options for more customization')
   67          },

  136                              className="w-4 h-4 border-2 border-black"
  137:                             aria-label={t('settings.advancedFeatures.showAdvancedLayouts')}
  138                          />

src/presentation/components/ide/FileTree/FileTreeItem.tsx:
  161                  className={cn(
  162:                     // Base layout
  163                      'flex items-center gap-1 cursor-pointer select-none',

src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx:
  704                          padding: { top: 8, bottom: 8 },
  705:                         automaticLayout: true,
  706                          tabSize: 2,

src/presentation/components/ide/MonacoEditor/hooks/useMonacoEditorEventSubscriptions.ts:
  275          return () => {
  276:             // FSA adapter cleanup is handled by IDELayoutMain
  277              console.log('[MonacoEditor] HMR subscription cleanup');

src/presentation/components/layout/ActivityBar.tsx:
   2   * @fileoverview ActivityBar - 48px Vertical Activity Bar Component
   3:  * @module presentation/components/layout/ActivityBar
   4   *

  10   *
  11:  * Layout position in WorkspaceLayout:
  12   * ┌────────┬────────┬──────────┬────────────────┬──────────┬────────┐

src/presentation/components/layout/ActivityBarTop.tsx:
   2   * @fileoverview ActivityBarTop - Horizontal Activity Bar for Main Content Area
   3:  * @module presentation/components/layout/ActivityBarTop
   4   *

  10   *
  11:  * Layout position in WorkspaceLayout:
  12   * ┌────────┬────────┬──────────┬──────────────────────────────────┬────────┬────────┐

src/presentation/components/layout/BottomSheet.tsx:
  2   * @fileoverview BottomSheet Component
  3:  * @module components/layout/BottomSheet
  4   * @created 2026-01-28

src/presentation/components/layout/Breadcrumbs.tsx:
    2   * @fileoverview Breadcrumbs Component
    3:  * @module components/layout/Breadcrumbs
    4   * @governance UX-04

  136        className={cn(
  137:         // Layout: Fixed height, flex container
  138          'flex items-center h-8 px-4',

src/presentation/components/layout/ChatPanelWrapper.tsx:
  2   * @fileoverview Chat Panel Wrapper Component - INTEGRATED WITH UNIFIED CHAT STORE
  3:  * @module components/layout/ChatPanelWrapper
  4   * 

src/presentation/components/layout/FloatingPluginDocker.tsx:
  2   * @fileoverview FloatingPluginDocker - Floating Plugin Management Panel
  3:  * @module presentation/components/layout/FloatingPluginDocker
  4   *

src/presentation/components/layout/GlobalHeader.tsx:
    2   * @fileoverview Global Header Component
    3:  * @module components/layout/GlobalHeader
    4   * @governance UX-03

   24  import { cn } from '@/lib/utils';
   25: import { useLayoutStore } from '@/infrastructure/persistence/stores/layout-store';
   26  import { useCommandPalette } from '@/hooks/useCommandPalette';

   44   * FIX-2026-01-26: Removed /ide and /notes per ADR-033.
   45:  * These are layout-presets within /$projectId, NOT standalone routes.
   46   * Users access workspaces by selecting a project from the Hub.

   73    const location = useLocation();
   74:   const { setMobileMenuOpen } = useLayoutStore();
   75    const { open: openCommandPalette } = useCommandPalette();

  105        className={cn(
  106:         // Layout: Fixed height, flex container
  107          'h-12 flex items-center justify-between shrink-0',

  129              'min-w-[44px] min-h-[44px]',
  130:             // Layout
  131              'flex items-center justify-center',

  183                className={cn(
  184:                 // Layout
  185                  'px-3 py-1.5',

  218            className={cn(
  219:             // Layout
  220              'flex items-center gap-2',

  265              'min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px]',
  266:             // Layout
  267              'flex items-center justify-center',

  291              'min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px]',
  292:             // Layout
  293              'flex items-center justify-center',

src/presentation/components/layout/IDEHeaderBar.tsx:
  2   * @fileoverview IDE Header Bar Component
  3:  * @module components/layout/IDEHeaderBar
  4   * 

src/presentation/components/layout/IDELayoutMain.tsx:
    1  /**
    2:  * @fileoverview IDE Layout Component
    3:  * @module components/layout/IDELayout
    4   *
    5:  * Main IDE layout component that orchestrates all IDE panels.
    6:  * Uses react-resizable-panels for a VS Code-like layout.
    7:  * Responsive: Uses MobileIDELayout for viewports <768px.
    8   *

   13   * @epic Epic-MRT Mobile Responsive Transformation
   14:  * @integration Responsive branching for mobile/desktop layouts
   15   */

   25  import { StatusBar } from './StatusBar';
   26: import { MobileIDELayout } from './MobileIDELayout';
   27  import { useResponsive } from '@/hooks/useResponsive';

   46      IDESidebarPanels,
   47:     IDEResizableLayout,
   48:     useIDELayoutState
   49: } from './IDELayout';
   50  
   51  /**
   52:  * IDELayout - Main IDE layout orchestrator.
   53   *
   54   * Consumes WorkspaceContext and coordinates:
   55:  * - Resizable panel layout
   56   * - File tree, editor, preview, terminal, chat panels

   58   *
   59:  * @responsive Uses MobileIDELayout for viewports <768px
   60   */
   61: export function IDELayout(): React.JSX.Element {
   62      // Responsive branching using semantic hook

   64  
   65:     // Early return for mobile - use dedicated mobile layout
   66      if (isMobile) {
   67:         return <MobileIDELayout />;
   68      }
   69  
   70:     // Get all IDE layout state from custom hook
   71:     const layoutState = useIDELayoutState();
   72  

  105          setOpenFiles
  106:     } = layoutState;
  107  

  117          scheduleIdeStatePersistence,
  118:         handlePanelLayoutChange,
  119          restoredIdeState

  124          onChatToggle: () => setChatVisible(true),
  125:         onCommandPaletteOpen: () => layoutState.setIsCommandPaletteOpen(true),
  126          onToggleRightPanel: () => setChatVisible(!chatVisible),

  217      useEffect(() => {
  218:         if (!projectId || !layoutState.projectMetadata?.fsaHandle) {
  219              return;

  224              projectId,
  225:             fsaHandle: layoutState.projectMetadata.fsaHandle,
  226          });
  227          gatewayRef.current = gateway;
  228:         console.log('[IDELayout] Storage gateway created for project:', projectId);
  229  

  231              gatewayRef.current = null;
  232:             console.log('[IDELayout] Storage gateway cleaned up');
  233          };
  234:     }, [projectId, layoutState.projectMetadata?.fsaHandle]);
  235  

  254                  if (!gateway || !container || !eventBusRef) {
  255:                     console.warn('[IDELayout] Missing required resources for FSA adapter');
  256                      return;

  258  
  259:                 console.log('[IDELayout] Initializing FSA adapter...');
  260  

  277  
  278:                 console.log('[IDELayout] FSA adapter initialized and synced');
  279              } catch (error) {
  280:                 console.error('[IDELayout] Failed to initialize FSA adapter:', error);
  281              }

  291                  fsaAdapterRef.current = null;
  292:                 console.log('[IDELayout] FSA adapter cleaned up');
  293              }

  311                      )}
  312:                     {permissionState === 'prompt' && <PermissionOverlay projectMetadata={layoutState.projectMetadata} onRestoreAccess={restoreAccess} />}
  313                      <IDEHeaderBar projectId={projectId} isChatVisible={chatVisible} onToggleChat={() => setChatVisible(!chatVisible)} />

  318                          isFeatureSearchOpen={isFeatureSearchOpen}
  319:                         onCommandPaletteClose={() => layoutState.setIsCommandPaletteOpen(false)}
  320:                         onFeatureSearchClose={() => layoutState.setIsFeatureSearchOpen(false)}
  321                      />

  335                          {/* Main Resizable Panel Group */}
  336:                         <IDEResizableLayout
  337                              projectId={projectId}
  338:                             projectName={layoutState.projectMetadata?.name ?? projectId ?? 'Project'}
  339                              chatVisible={chatVisible}

  342                              setTerminalTab={setTerminalTab}
  343:                             initialSyncCompleted={layoutState.initialSyncCompleted}
  344                              permissionState={permissionState}

  353                              scheduleIdeStatePersistence={scheduleIdeStatePersistence}
  354:                             handlePanelLayoutChange={handlePanelLayoutChange}
  355                              previewUrl={previewUrl ?? undefined}

src/presentation/components/layout/index.ts:
   1  /**
   2:  * @fileoverview Layout Components Barrel Export
   3:  * @module components/layout
   4   *
   5:  * Exports all layout components for IDE.
   6   */
   7  
   8: export { IDELayout } from './IDELayoutMain';
   9  

  14  export { MainSidebar } from './MainSidebar';
  15: export { MainLayout } from './MainLayout';
  16  
  17  // Mobile-responsive components (Epic-MRT)
  18: export { MobileIDELayout } from './MobileIDELayout';
  19  export { MobileTabBar, useMobilePanel, type MobilePanelType } from './MobileTabBar';

  42  
  43: // Tablet Portrait Layout (UXUI-03-13)
  44  export {
  45:   TabletPortraitLayout,
  46    TabletPortraitHeader,
  47    SidebarDrawer,
  48:   type TabletPortraitLayoutProps,
  49    type TabletPortraitHeaderProps,
  50    type SidebarDrawerProps,
  51: } from './TabletPortraitLayout';
  52  
  53: // Responsive Layout Switcher (UXUI-03-13)
  54  export {
  55:   ResponsiveLayoutSwitcher,
  56:   useResponsiveLayout,
  57:   getLayoutType,
  58:   type ResponsiveLayoutSwitcherProps,
  59:   type ResponsiveLayoutState,
  60: } from './ResponsiveLayoutSwitcher';

src/presentation/components/layout/LiveRegion.tsx:
    2   * @fileoverview LiveRegion - ARIA Live Region for Screen Reader Announcements
    3:  * @module presentation/components/layout/LiveRegion
    4   * @story UXUI-03-11

   77   * ```tsx
   78:  * // In StatusBar or layout root
   79   * <LiveRegion syncStatus={syncStatus} />

  126   * ```tsx
  127:  * // In layout root - automatically binds to sync state
  128   * <LiveRegionWithHook />

src/presentation/components/layout/MainContentRenderer.tsx:
   2   * @fileoverview MainContentRenderer - Main Content Plugin Switcher
   3:  * @module presentation/components/layout/MainContentRenderer
   4   *

   9   *
  10:  * Layout structure:
  11   * ┌──────────────────────────────────────────────────────────────┐

src/presentation/components/layout/MainLayout.tsx:
   1  /**
   2:  * @fileoverview Main Layout Component
   3:  * @module components/layout
   4:  * @governance LAYOUT-3
   5   * @ai-observable false
   6   * 
   7:  * Main layout wrapper for the home page with responsive sidebar and content area.
   8   * Integrates MainSidebar, mobile header, and TanStack Router Outlet.

  12   * 
  13:  * Layout Structure:
  14:  * - Mobile: Column layout (header -> main content)
  15:  * - Desktop: Row layout (sidebar + content)
  16   */

  20  import { Menu } from 'lucide-react';
  21: import { useLayoutStore } from '@/infrastructure/persistence/stores/layout-store';
  22  import { MainSidebar } from './MainSidebar';

  24  
  25: interface MainLayoutProps {
  26    className?: string;

  29  
  30: export const MainLayout: React.FC<MainLayoutProps> = ({ className, children }) => {
  31:   const { setMobileMenuOpen } = useLayoutStore();
  32  

src/presentation/components/layout/MainSidebar.tsx:
    2   * @fileoverview Main Sidebar Component (8-bit Design)
    3:  * @module components/layout/MainSidebar
    4   * 

   33  import { TruncatedText } from '@/presentation/components/ui/truncated-text';
   34: import { useLayoutStore } from '@/infrastructure/persistence/stores/layout-store';
   35  import { useRecentProjects } from '@/infrastructure/persistence/stores/project';

  128      setActiveNavItem,
  129:   } = useLayoutStore();
  130  

  173    // FIX-2026-01-26: Changed /ide and /notes to redirect to hub
  174:   // Per ADR-033, these are layout-presets, not routes
  175    const navItems = [

src/presentation/components/layout/MinViewportWarning.tsx:
  2   * @fileoverview Minimum Viewport Warning Component
  3:  * @module components/layout/MinViewportWarning
  4   *
  5   * Warning overlay displayed when viewport is below minimum width (1024px).
  6:  * Moved from IDELayout.tsx for code organization.
  7   */

src/presentation/components/layout/MobileBottomNav.tsx:
    2   * @fileoverview Mobile Bottom Navigation Component
    3:  * @module components/layout/MobileBottomNav
    4   * @created 2026-01-26

   34  import { cn } from '@/lib/utils';
   35: import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
   36  import type { PluginId } from '@/domain/types/plugin-types';

  171  
  172:   // Plugin layout store
  173:   const currentPlugin = usePluginLayoutStore((s) => s.currentPlugin);
  174:   const switchPlugin = usePluginLayoutStore((s) => s.switchPlugin);
  175:   const addPlugin = usePluginLayoutStore((s) => s.addPlugin);
  176:   const activePlugins = usePluginLayoutStore((s) => s.activePlugins);
  177  

src/presentation/components/layout/MobileIDELayout.tsx:
    1  /**
    2:  * @fileoverview Mobile IDE Layout Component
    3:  * @module components/layout/MobileIDELayout
    4   *
    5:  * Mobile-first layout for the IDE.
    6   * Uses tab-based panel switching with single-panel focus mode.

    8   * @epic Epic-MRT Mobile Responsive Transformation
    9:  * @story MRT-3 Implement Mobile IDE Layout
   10   *

   29  
   30: // Layout components
   31  import { IDEHeaderBar } from './IDEHeaderBar';

   96  /**
   97:  * MobileIDELayout - Main mobile IDE layout orchestrator
   98   *

  105   */
  106: export function MobileIDELayout(): React.JSX.Element {
  107      const { toast } = useToast();

  330  
  331: export default MobileIDELayout;

src/presentation/components/layout/MobileTabBar.tsx:
   2   * @fileoverview Mobile Tab Bar Component
   3:  * @module components/layout/MobileTabBar
   4   *

  94                  'bg-sidebar border-t border-border',
  95:                 // Flex layout for tabs
  96                  'flex items-center justify-around',

src/presentation/components/layout/NavigationBreadcrumbs.tsx:
  2   * @fileoverview Navigation Breadcrumbs Component
  3:  * @module components/layout/NavigationBreadcrumbs
  4   * @created 2026-01-26

src/presentation/components/layout/PermissionOverlay.tsx:
   2   * @fileoverview Permission Overlay Component
   3:  * @module components/layout/PermissionOverlay
   4   *

   6   * Shown when permission state is 'prompt'.
   7:  * Extracted from IDELayout.tsx for code organization.
   8   *

  13   * - Fixed 8-bit design compliance violations
  14:  * - Backward compatible with legacy usage (IDELayoutMain, MobileIDELayout)
  15   */
  16  
  17: // Legacy interface for backward compatibility (used by IDELayoutMain, MobileIDELayout)
  18  interface PermissionOverlayLegacyProps {

src/presentation/components/layout/PluginActivityDockerWiring.tsx:
    2   * @fileoverview PluginActivityDockerWiring - ActivityBar + PluginDocker Integration
    3:  * @module presentation/components/layout/PluginActivityDockerWiring
    4   *

   15   *
   16:  * Layout integration:
   17   * ┌────────┬────────┬──────────┬────────────────┬──────────┬────────┐

  111   * Returns both the ActivityBar and PluginDocker elements
  112:  * for placement in WorkspaceLayout slots.
  113   */

  137   * 3. This component returns ActivityBar and Docker elements
  138:  * 4. Parent places elements in WorkspaceLayout slots
  139   *

  153   * return (
  154:  *   <WorkspaceLayout
  155   *     activityBarLeft={leftWiring.activityBar}

  338   * In production, prefer using the hook directly for more flexibility
  339:  * in placing ActivityBar and Docker in separate WorkspaceLayout slots.
  340   */

src/presentation/components/layout/PluginDocker.tsx:
   2   * @fileoverview PluginDocker - Resizable Panel Container for Plugins
   3:  * @module presentation/components/layout/PluginDocker
   4   *

   9   *
  10:  * Layout position in WorkspaceLayout:
  11   * ┌────────┬────────┬──────────┬────────────────┬──────────┬────────┐

src/presentation/components/layout/PluginToggles.tsx:
    2   * @fileoverview Plugin Toggles Component
    3:  * @module presentation/components/layout/PluginToggles
    4   *

    6   *
    7:  * Toggle buttons for adding/removing plugins from the layout.
    8   * Shows toggle state for each toggleable plugin with 8-bit design.

   27  import type { PluginId } from '@/domain/types/plugin-types';
   28: import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
   29  

  109    // ========================================================================
  110:   // Plugin Layout Store (useShallow for optimal re-rendering)
  111    // ========================================================================
  112  
  113:   const { activePlugins, togglePlugin } = usePluginLayoutStore(
  114      useShallow((s) => ({

src/presentation/components/layout/PluginToolbar.tsx:
    2   * @fileoverview PluginToolbar - Toggle toolbar for plugin selection
    3:  * @module presentation/components/layout/PluginToolbar
    4   *
    5:  * **CC-AR-04**: Toggle-Based Layout System
    6   *

   16  import { useTranslation } from 'react-i18next';
   17: import { Layers, Grid2x2, Grid3x3, LayoutPanelTop, Columns } from 'lucide-react';
   18  
   19  import type { PluginId } from '@/domain/types/plugin-types';
   20: import type { LayoutMode } from '@/presentation/layouts/PluginLayoutStore';
   21  import { getPlugin } from '@/infrastructure/plugins/plugin-registry';

   33   * - availablePlugins: List of plugins that can be toggled
   34:  * - layoutMode: Current layout mode
   35   * - onTogglePlugin: Handler for toggling plugins on/off
   36:  * - onSetLayoutMode: Handler for changing layout mode
   37   */

   44  
   45:   /** Current layout mode */
   46:   layoutMode: LayoutMode;
   47  

   50  
   51:   /** Handler for layout mode change */
   52:   onSetLayoutMode: (mode: LayoutMode) => void;
   53  }

  104  // ============================================================================
  105: // LayoutModeButton Component
  106  // ============================================================================

  108  /**
  109:  * Layout Mode Button Component
  110   *
  111   * @remarks
  112:  * Individual button for selecting layout mode:
  113   * - Blue background when active

  116   */
  117: function LayoutModeButton({
  118    mode,

  123  }: {
  124:   mode: LayoutMode;
  125:   currentMode: LayoutMode;
  126    icon: React.ReactNode;
  127    label: string;
  128:   onClick: (mode: LayoutMode) => void;
  129  }) {

  160   * - Plugin toggle buttons (left side)
  161:  * - Layout mode selector (right side)
  162   * - 8-bit design: sharp corners, no rounded edges
  163   *
  164:  * Layout modes:
  165   * - 1-column: Single panel (Columns icon)

  167   * - 3-column: Three panels side-by-side (Grid3x3 icon)
  168:  * - 2+1: Two panels on top, one full-width below (LayoutPanelTop icon)
  169   *

  174   *   availablePlugins={allPlugins}
  175:  *   layoutMode="2-column"
  176   *   onTogglePlugin={handleToggle}
  177:  *   onSetLayoutMode={handleLayoutChange}
  178   * />

  183    availablePlugins,
  184:   layoutMode,
  185    onTogglePlugin,
  186:   onSetLayoutMode,
  187  }: PluginToolbarProps) {

  208  
  209:       {/* Right: Layout Mode Selector */}
  210        <div className="flex items-center gap-1">
  211          <span className="text-xs text-muted-foreground mr-2 hidden md:inline">
  212:           {t('plugin.layoutMode')}:
  213          </span>
  214:         <LayoutModeButton
  215            mode="1-column"
  216:           currentMode={layoutMode}
  217            icon={<Columns size={16} />}
  218:           label={t('plugin.layout1Column')}
  219:           onClick={onSetLayoutMode}
  220          />
  221:         <LayoutModeButton
  222            mode="2-column"
  223:           currentMode={layoutMode}
  224            icon={<Grid2x2 size={16} />}
  225:           label={t('plugin.layout2Column')}
  226:           onClick={onSetLayoutMode}
  227          />
  228:         <LayoutModeButton
  229            mode="3-column"
  230:           currentMode={layoutMode}
  231            icon={<Grid3x3 size={16} />}
  232:           label={t('plugin.layout3Column')}
  233:           onClick={onSetLayoutMode}
  234          />
  235:         <LayoutModeButton
  236            mode="2+1"
  237:           currentMode={layoutMode}
  238:           icon={<LayoutPanelTop size={16} />}
  239:           label={t('plugin.layout2Plus1')}
  240:           onClick={onSetLayoutMode}
  241          />

src/presentation/components/layout/PresetSelector.tsx:
    2   * @fileoverview Workflow Preset Selector
    3:  * @module components/layout/PresetSelector
    4   *
    5:  * Dropdown to switch between workflow layout presets with keyboard support.
    6   */

    9  import { useTranslation } from 'react-i18next';
   10: import { ChevronDown, Layout } from 'lucide-react';
   11  import { useShallow } from 'zustand/react/shallow';
   12  import { cn } from '@/lib/utils';
   13: import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
   14: import { WORKFLOW_PRESETS, type WorkflowPreset } from '@/presentation/layouts/workflow-presets';
   15  

   19    const { t } = useTranslation();
   20:   const { currentPreset, setPreset } = usePluginLayoutStore(
   21      useShallow((state) => ({

  178        >
  179:         <Layout className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
  180          <span>{t(currentConfig.labelKey, { defaultValue: currentConfig.label })}</span>

src/presentation/components/layout/ProjectAwareLayout.tsx:
   1  /**
   2:  * @fileoverview Project-Aware Layout
   3:  * @module components/layout/ProjectAwareLayout
   4   *

   6   *
   7:  * This component conditionally renders the global layout based on route:
   8   *

  65  
  66: export function ProjectAwareLayout() {
  67      const location = useLocation();

  85  
  86:     // Global routes: full layout with MainSidebar
  87      return (

src/presentation/components/layout/ResponsiveLayoutSwitcher.tsx:
    1  /**
    2:  * @fileoverview Responsive Layout Switcher Component
    3:  * @module components/layout/ResponsiveLayoutSwitcher
    4   * @created 2026-01-28

    8   *
    9:  * Automatically switches between layout components based on breakpoint:
   10:  * - Desktop (>=768px): WorkspaceLayout (6-zone grid)
   11:  * - Tablet Portrait (600-767px): TabletPortraitLayout (full-screen + bottom nav)
   12   * - Mobile (<600px): MobileBottomNav integration (full-screen + bottom nav)

   23  
   24: export interface ResponsiveLayoutSwitcherProps {
   25:   /** Desktop layout component (6-zone grid) - shown at >=768px */
   26:   desktopLayout: ReactNode;
   27:   /** Tablet portrait layout (full-screen + bottom nav) - shown at 600-767px */
   28:   tabletPortraitLayout: ReactNode;
   29:   /** Mobile layout (full-screen + bottom nav) - shown at <600px */
   30:   mobileLayout: ReactNode;
   31    /** Optional callback when breakpoint changes */
   32    onBreakpointChange?: (breakpoint: BreakpointState) => void;
   33:   /** Whether to animate transitions between layouts */
   34    animated?: boolean;

   38  
   39: export interface ResponsiveLayoutState {
   40:   /** Current active layout type */
   41:   layoutType: 'desktop' | 'tablet-portrait' | 'mobile';
   42    /** Current breakpoint state */
   43    breakpoint: BreakpointState;
   44:   /** Whether layout is transitioning */
   45    isTransitioning: boolean;

   48  // ============================================================================
   49: // Hook: useResponsiveLayout
   50  // ============================================================================

   52  /**
   53:  * Hook for determining which layout to show based on breakpoint
   54   *
   55:  * @returns Layout state with breakpoint info
   56   */
   57: export function useResponsiveLayout(): ResponsiveLayoutState {
   58    const breakpoint = useBreakpointEnhanced();
   59  
   60:   // Determine layout type based on breakpoint
   61:   let layoutType: 'desktop' | 'tablet-portrait' | 'mobile';
   62  

   65      case 'phone-landscape':
   66:       layoutType = 'mobile';
   67        break;
   68      case 'tablet-portrait':
   69:       layoutType = 'tablet-portrait';
   70        break;

   74      default:
   75:       layoutType = 'desktop';
   76        break;

   79    return {
   80:     layoutType,
   81      breakpoint,

   90  /**
   91:  * ResponsiveLayoutSwitcher - Renders appropriate layout based on screen size
   92   *
   93   * Features:
   94:  * - Automatic layout switching based on 6-tier breakpoints
   95:  * - Preserves state when switching layouts
   96:  * - Optional animation between layouts
   97   * - Callback for breakpoint changes

   99   * Breakpoint Mapping:
  100:  * - Desktop (>=768px): desktopLayout prop (WorkspaceLayout)
  101:  * - Tablet Portrait (600-767px): tabletPortraitLayout prop
  102:  * - Mobile (<600px): mobileLayout prop
  103   *

  105   * ```tsx
  106:  * <ResponsiveLayoutSwitcher
  107:  *   desktopLayout={<WorkspaceLayout {...desktopProps} />}
  108:  *   tabletPortraitLayout={<TabletPortraitLayout {...tabletProps} />}
  109:  *   mobileLayout={<MobileIDELayout {...mobileProps} />}
  110   *   onBreakpointChange={handleBreakpointChange}

  113   */
  114: export const ResponsiveLayoutSwitcher: React.FC<ResponsiveLayoutSwitcherProps> = ({
  115:   desktopLayout,
  116:   tabletPortraitLayout,
  117:   mobileLayout,
  118    onBreakpointChange,

  121  }) => {
  122:   const { layoutType, breakpoint } = useResponsiveLayout();
  123:   const prevLayoutType = useRef(layoutType);
  124  

  126    useEffect(() => {
  127:     if (prevLayoutType.current !== layoutType) {
  128:       console.log('[ResponsiveLayoutSwitcher] Layout changed:', {
  129:         from: prevLayoutType.current,
  130:         to: layoutType,
  131          breakpoint: breakpoint.breakpoint,

  133        });
  134:       prevLayoutType.current = layoutType;
  135      }

  137      onBreakpointChange?.(breakpoint);
  138:   }, [breakpoint, layoutType, onBreakpointChange]);
  139  
  140:   // Render appropriate layout based on breakpoint
  141:   const renderLayout = (): ReactNode => {
  142:     switch (layoutType) {
  143        case 'mobile':
  144:         return mobileLayout;
  145        case 'tablet-portrait':
  146:         return tabletPortraitLayout;
  147        case 'desktop':
  148        default:
  149:         return desktopLayout;
  150      }

  161          }}
  162:         data-layout-type={layoutType}
  163          data-breakpoint={breakpoint.breakpoint}
  164        >
  165:         {renderLayout()}
  166        </div>

  169  
  170:   // Without animation - just render the layout
  171:   return <>{renderLayout()}</>;
  172  };
  173  
  174: ResponsiveLayoutSwitcher.displayName = 'ResponsiveLayoutSwitcher';
  175  
  176  // ============================================================================
  177: // Utility: getLayoutType
  178  // ============================================================================

  180  /**
  181:  * Get layout type from breakpoint state
  182   *
  183   * @param breakpoint - Current breakpoint state
  184:  * @returns Layout type string
  185   */
  186: export function getLayoutType(
  187    breakpoint: BreakpointState

  202  
  203: export default ResponsiveLayoutSwitcher;

src/presentation/components/layout/SidebarQuickActions.tsx:
   2   * @fileoverview Sidebar Quick Actions Component
   3:  * @module components/layout/SidebarQuickActions
   4   * @created 2026-01-26

  29  import { toast } from 'sonner';
  30: import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
  31  

  70  
  71:     // Plugin layout store for managing plugins
  72:     const activePlugins = usePluginLayoutStore((s) => s.activePlugins);
  73:     const addPlugin = usePluginLayoutStore((s) => s.addPlugin);
  74:     const removePlugin = usePluginLayoutStore((s) => s.removePlugin);
  75  

src/presentation/components/layout/SidebarWidgets.tsx:
  2   * @fileoverview Sidebar Status Widgets Component
  3:  * @module components/layout/SidebarWidgets
  4   * @created 2026-01-26

src/presentation/components/layout/StatusBar.tsx:
    2   * @fileoverview StatusBar - 24px Bottom Status Bar Component
    3:  * @module presentation/components/layout/StatusBar
    4   *

   12   *
   13:  * Layout position in WorkspaceLayout:
   14   * ┌─────────────────────────────────────────────────────────────────┐

   23   * - Tablet (768-1023px): Icons only, compact mode
   24:  * - Desktop (>=1024px): Full layout with all information
   25   *

  152   * - CSS variable-based theming
  153:  * - Three-section layout (left/center/right)
  154   * - Responsive: hidden on mobile, icons-only on tablet

src/presentation/components/layout/SystemRail.tsx:
  2   * @fileoverview SystemRail - Bottom status bar with expandable terminal drawer
  3:  * @module presentation/components/layout/SystemRail
  4   *

src/presentation/components/layout/TabletPortraitLayout.tsx:
    1  /**
    2:  * @fileoverview Tablet Portrait Layout Component
    3:  * @module components/layout/TabletPortraitLayout
    4   * @created 2026-01-28

    8   *
    9:  * Layout for tablet portrait mode (600-767px):
   10   * - Header: 48px with project name, hamburger menu, actions

   26  // CSS import for 8-bit styling
   27: import './TabletPortraitLayout.css';
   28  

   32  
   33: export interface TabletPortraitLayoutProps {
   34    /** Header content (project name + menu) - or use default */

  207  // ============================================================================
  208: // Main Layout Component
  209  // ============================================================================

  211  /**
  212:  * TabletPortraitLayout - Full-screen plugin layout for tablet portrait
  213   *

  222   * ```tsx
  223:  * <TabletPortraitLayout
  224   *   projectName="My Project"

  229   */
  230: export const TabletPortraitLayout: React.FC<TabletPortraitLayoutProps> = ({
  231    header,

  277      // Navigate to settings or open settings modal
  278:     console.log('[TabletPortraitLayout] Settings clicked');
  279    }, []);

  289    return (
  290:     <div className={cn('tablet-portrait-layout', className)}>
  291        {/* Header */}

  302        <main
  303:         className="tablet-portrait-layout__content"
  304          role="main"

  311        {statusBar && (
  312:         <div className="tablet-portrait-layout__status-bar">
  313            {statusBar}

  317        {/* Bottom navigation */}
  318:       <div className="tablet-portrait-layout__nav">
  319          {bottomNav || (

  341        >
  342:         <div className="tablet-portrait-layout__more-menu">
  343            <p className="text-sm text-muted-foreground">

  351  
  352: TabletPortraitLayout.displayName = 'TabletPortraitLayout';
  353  
  354: export default TabletPortraitLayout;

src/presentation/components/layout/TerminalPanel.tsx:
  2   * @fileoverview Terminal Panel Component
  3:  * @module components/layout/TerminalPanel
  4   * 
  5   * Bottom panel containing terminal, output, and problems tabs.
  6:  * Part of the IDE layout refactoring to reduce IDELayout.tsx complexity.
  7   * 

src/presentation/components/layout/hooks/index.ts:
  1  /**
  2:  * @fileoverview IDE Layout Hooks Barrel Export
  3:  * @module components/layout/hooks
  4   *
  5:  * Re-exports all IDE layout hooks for convenient importing.
  6   */

src/presentation/components/layout/hooks/useIDEFileHandlers.ts:
  2   * @fileoverview IDE File Handlers Hook
  3:  * @module components/layout/hooks/useIDEFileHandlers
  4   *

  7   * Manages file operations in the IDE: select, save, close, content change.
  8:  * Extracted from IDELayout.tsx for code organization.
  9   */

src/presentation/components/layout/hooks/useIDEKeyboardShortcuts.ts:
  2   * @fileoverview IDE Keyboard Shortcuts Hook
  3:  * @module components/layout/hooks/useIDEKeyboardShortcuts
  4   *
  5   * Handles global keyboard shortcuts for IDE.
  6:  * Extracted from IDELayout.tsx for code organization.
  7   *

src/presentation/components/layout/hooks/useIDEStateRestoration.ts:
    2   * @fileoverview IDE State Restoration Hook
    3:  * @module components/layout/hooks/useIDEStateRestoration
    4   *
    5   * Manages restoring IDE state from persistence (panels, files, settings).
    6:  * Extracted from IDELayout.tsx for code organization.
    7   */

   21      openFiles?: string[];
   22:     panelLayouts?: Record<string, number[]>;
   23  }

   52   * - UI state (chat visibility, terminal tab, active file)
   53:  * - Panel layouts
   54   * - Open files tabs

   91  
   92:     // Apply panel layouts
   93      useEffect(() => {
   94:         const layouts = restoredIdeState?.panelLayouts;
   95:         if (!layouts) return;
   96  
   97:         const applyLayout = (
   98              groupKey: string,

  102              if (appliedPanelGroupsRef.current.has(groupKey)) return;
  103:             const layout = layouts[groupKey];
  104:             if (!ref || !layout) return;
  105:             if (expectedLength !== undefined && layout.length !== expectedLength) return;
  106:             ref.setLayout(layout);
  107              appliedPanelGroupsRef.current.add(groupKey);

  109  
  110:         applyLayout('center', centerPanelGroupRef.current);
  111:         applyLayout('editor', editorPanelGroupRef.current);
  112:         applyLayout('main', mainPanelGroupRef.current, isChatVisible ? 3 : 2);
  113      }, [restoredIdeState, isChatVisible, appliedPanelGroupsRef, mainPanelGroupRef, centerPanelGroupRef, editorPanelGroupRef]);

src/presentation/components/layout/hooks/useWebContainerBoot.ts:
  2   * @fileoverview WebContainer Boot Hook
  3:  * @module components/layout/hooks/useWebContainerBoot
  4   *
  5   * Manages WebContainer boot sequence and preview URL handling.
  6:  * Extracted from IDELayout.tsx for code organization.
  7   *

src/presentation/components/layout/IDELayout/IDEEditorPreviewGroup.tsx:
  31      scheduleIdeStatePersistence,
  32:     handlePanelLayoutChange,
  33      previewUrl,

  37      return (
  38:         <ResizablePanelGroup ref={editorPanelGroupRef} direction="horizontal" onLayout={(layout) => handlePanelLayoutChange('editor', layout)}>
  39              <ResizablePanel id="ide-editor-panel" defaultSize={60} minSize={30} className="bg-background">

src/presentation/components/layout/IDELayout/IDEResizableLayout.tsx:
   1  /**
   2:  * IDE Resizable Layout Component
   3   *

   6   * @layer Presentation
   7:  * @component IDEResizableLayout
   8   */

  19  import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
  20: import type { IDEResizableLayoutProps } from './types';
  21  
  22  /**
  23:  * IDE Resizable Layout Component
  24   */
  25: export function IDEResizableLayout({
  26      projectId,

  42      scheduleIdeStatePersistence,
  43:     handlePanelLayoutChange,
  44      previewUrl,

  51      editorPanelGroupRef
  52: }: IDEResizableLayoutProps) {
  53      // P2-4: Terminal panel collapse state (persisted in IDE store)

  71      return (
  72:         <ResizablePanelGroup ref={mainPanelGroupRef} direction="horizontal" className="flex-1" onLayout={(layout) => handlePanelLayoutChange('main', layout)}>
  73              {/* Center Panel (Editor + Preview + Terminal) */}
  74              <ResizablePanel id="ide-center-wrapper" order={2} defaultSize={chatVisible ? 75 : 100} minSize={30}>
  75:                 <ResizablePanelGroup ref={centerPanelGroupRef} direction="vertical" onLayout={(layout) => handlePanelLayoutChange('center', layout)}>
  76                      {/* Editor + Preview Area */}

  87                              scheduleIdeStatePersistence={scheduleIdeStatePersistence}
  88:                             handlePanelLayoutChange={handlePanelLayoutChange}
  89                              previewUrl={previewUrl}

src/presentation/components/layout/IDELayout/index.ts:
   1  /**
   2:  * IDE Layout Components
   3   *
   4:  * Orchestrates IDE layout with resizable panels.
   5:  * Split from IDELayout.tsx (604 lines) into 14 sub-components.
   6   *
   7   * @layer Presentation
   8:  * @component IDELayout
   9   *
  10:  * Note: IDELayout is not re-exported from barrel to avoid circular dependency.
  11:  * Import IDELayout directly from '../IDELayoutMain' if needed.
  12   */

  19  export { IDESidebarPanels } from './IDESidebarPanels';
  20: export { IDEResizableLayout } from './IDEResizableLayout';
  21  export { IDEEditorPreviewGroup } from './IDEEditorPreviewGroup';
  22: export { useIDELayoutState } from './useIDELayoutState';
  23: export { useIDELayoutFileState } from './useIDELayoutFileState';
  24: export { useIDELayoutWorkspaceState } from './useIDELayoutWorkspaceState';
  25: export { useIDELayoutDiscoveryState } from './useIDELayoutDiscoveryState';
  26: export { useIDELayoutPanelRefs } from './useIDELayoutPanelRefs';
  27  export * from './types';

src/presentation/components/layout/IDELayout/types.ts:
    1  /**
    2:  * IDE Layout State Types
    3   *
    4:  * Shared types for IDE layout hooks.
    5   *

   12  
   13: export interface UseIDELayoutStateResult {
   14      // Store state

   69  
   70: export interface IDEResizableLayoutProps {
   71      projectId: string | null;

   87      scheduleIdeStatePersistence: (ms: number) => void;
   88:     handlePanelLayoutChange: (group: string, layout: number[]) => void;
   89      previewUrl: string | undefined;

  108      scheduleIdeStatePersistence: (ms: number) => void;
  109:     handlePanelLayoutChange: (group: string, layout: number[]) => void;
  110      previewUrl: string | undefined;

src/presentation/components/layout/IDELayout/useIDELayoutDiscoveryState.ts:
   1  /**
   2:  * IDE Layout Discovery State Hook
   3   *

   6   * @layer Presentation
   7:  * @hook useIDELayoutDiscoveryState
   8   */

  11  
  12: interface UseIDELayoutDiscoveryStateResult {
  13      isCommandPaletteOpen: boolean;

  21   */
  22: export function useIDELayoutDiscoveryState(): UseIDELayoutDiscoveryStateResult {
  23      // P1.4: Discovery mechanisms state

src/presentation/components/layout/IDELayout/useIDELayoutFileState.ts:
   1  /**
   2:  * IDE Layout File State Hook
   3   *

   6   * @layer Presentation
   7:  * @hook useIDELayoutFileState
   8   */

  13  
  14: interface UseIDELayoutFileStateResult {
  15      openFilePaths: string[];

  30  /**
  31:  * Hook to manage IDE layout file state
  32   */
  33: export function useIDELayoutFileState(): UseIDELayoutFileStateResult {
  34      // Zustand state (persisted to IndexedDB)

src/presentation/components/layout/IDELayout/useIDELayoutPanelRefs.ts:
   1  /**
   2:  * IDE Layout Panel Refs Hook
   3   *

   6   * @layer Presentation
   7:  * @hook useIDELayoutPanelRefs
   8   */

  11  
  12: interface UseIDELayoutPanelRefsResult {
  13      mainPanelGroupRef: React.RefObject<any>;

  20   */
  21: export function useIDELayoutPanelRefs(): UseIDELayoutPanelRefsResult {
  22      const mainPanelGroupRef = useRef<any>(null);

src/presentation/components/layout/IDELayout/useIDELayoutState.ts:
   1  /**
   2:  * IDE Layout State Hook
   3   *
   4:  * Composes all IDE layout state from focused hooks.
   5   *
   6   * @layer Presentation
   7:  * @hook useIDELayoutState
   8   */

  11  import { useToast } from '../../ui/Toast';
  12: import { useIDELayoutFileState } from './useIDELayoutFileState';
  13: import { useIDELayoutWorkspaceState } from './useIDELayoutWorkspaceState';
  14: import { useIDELayoutDiscoveryState } from './useIDELayoutDiscoveryState';
  15: import { useIDELayoutPanelRefs } from './useIDELayoutPanelRefs';
  16: import type { UseIDELayoutStateResult } from './types';
  17  
  18  /**
  19:  * Hook to manage IDE layout state
  20   * Composes file state, workspace state, discovery state, and panel refs
  21   */
  22: export function useIDELayoutState(): UseIDELayoutStateResult {
  23      const { toast } = useToast();

  31      // Compose focused state hooks
  32:     const fileState = useIDELayoutFileState();
  33:     const workspaceState = useIDELayoutWorkspaceState();
  34:     const discoveryState = useIDELayoutDiscoveryState();
  35:     const panelRefs = useIDELayoutPanelRefs();
  36  

src/presentation/components/layout/IDELayout/useIDELayoutWorkspaceState.ts:
   1  /**
   2:  * IDE Layout Workspace State Hook
   3   *

   6   * @layer Presentation
   7:  * @hook useIDELayoutWorkspaceState
   8   */

  14  
  15: interface UseIDELayoutWorkspaceStateResult {
  16      // Project metadata

  37   */
  38: export function useIDELayoutWorkspaceState(): UseIDELayoutWorkspaceStateResult {
  39      const {

src/presentation/components/notes/AISlashCommand.tsx:
  1351  // ============================================================================
  1352: // UX-11: Column Layouts
  1353  // ============================================================================

  1355  /**
  1356:  * Insert a column layout block
  1357   * Creates a multi-column container for organizing content

  1360      return {
  1361:         title: t('notes.blocks.column.title', 'Column Layout'),
  1362          onItemClick: () => {

  1378          icon: <Columns size={18} />,
  1379:         subtext: t('notes.blocks.column.description', 'Multi-column layout container'),
  1380      };

  1656          insertBlockReference(editor),
  1657:         // UX-11: Column Layouts
  1658          insertColumnBlock(editor),

src/presentation/components/notes/index.ts:
  41  
  42: // EPIC-MOBILE: Mobile Layout Components
  43: export { NotesMobileLayout, NotesMobileLayoutWithState } from './NotesMobileLayout';
  44  

src/presentation/components/notes/NoteEditor.tsx:
   58  import { ReferenceBlock } from './blocks/ReferenceBlock';
   59: // UX-11: Column Layouts
   60  import { ColumnBlock } from './blocks/ColumnBlock';

  213          'reference', // UX-10: Block references
  214:         'column', // UX-11: Column layouts
  215          'synced' // UX-12: Synced blocks

  369          reference: ReferenceBlock(),
  370:         // UX-11: Column Layouts (Multi-column containers)
  371          column: ColumnBlock(),

  615                  'reference', // UX-10: Block references (content: "none")
  616:                 'column',    // UX-11: Column layouts (content: "inline")
  617                  'synced',    // UX-12: Synced blocks (content: "inline")

src/presentation/components/notes/NoteSidebar.tsx:
  293  
  294:             {/* UX-02: Bottom Action Bar - Moved from header for better layout */}
  295              <div className="p-3 border-t-2 border-border bg-muted space-y-2">

src/presentation/components/notes/NoteSidebarChat.tsx:
  37   * CHAT-021: This component now wraps EnhancedChatInterface with a sidebar header,
  38:  * providing a consistent chat UI while maintaining the sidebar-specific layout.
  39   */

src/presentation/components/notes/NotesMobileLayout.tsx:
    1  /**
    2:  * NotesMobileLayout Component
    3   * 
    4:  * Mobile-optimized layout for the Notes workspace with tab-based navigation.
    5   * Features:

   30  
   31: interface NotesMobileLayoutProps {
   32    /** The content to render (note list, search results, or AI chat) */

   49  
   50: export function NotesMobileLayout({
   51    children,

   58    threadCount = 0,
   59: }: NotesMobileLayoutProps) {
   60    const [internalContentTab, setInternalContentTab] = useState(activeContentTab)

  154                    <motion.div
  155:                     layoutId="nav-indicator"
  156                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"

  183  /**
  184:  * NotesMobileLayout with integrated note list state
  185   */

  197  
  198: export function NotesMobileLayoutWithState({
  199    notes = [],

  216    return (
  217:     <NotesMobileLayout
  218        activeContentTab={activeContentTab}

  260        </div>
  261:     </NotesMobileLayout>
  262    )

  264  
  265: export default NotesMobileLayout

src/presentation/components/notes/NotesPage.tsx:
    12  import { useNoteStore, useActiveNote } from '@/lib/notes/note-store';
    13: import { MainLayout } from '@/presentation/components/layout/MainLayout';
    14  import { Button } from '@/presentation/components/ui/button';

    21  import { NoteSidebar } from './NoteSidebar';
    22: import { NotesMobileLayout } from './NotesMobileLayout';
    23  import { MarkdownImportDialog } from './MarkdownImportDialog';

   131  
   132:     // CHAT-006: Get thread info for mobile layout
   133      const { activeConversationId, setActiveThread } = useConversationStore(

   670  
   671:     // Mobile Layout: Use NotesMobileLayout component
   672      // EPIC-MOBILE: MOBILE-INT-01 Integration

   771          return (
   772:             <MainLayout>
   773                  {/* S-007: Import Progress Overlay */}

   824  
   825:                 {/* Use NotesMobileLayout for consistent mobile UX */}
   826:                 <NotesMobileLayout
   827                      activeContentTab={mobileContentTab}

   865                      )}
   866:                 </NotesMobileLayout>
   867  

   892                  </div>
   893:             </MainLayout>
   894          );

   896  
   897:     // Desktop Layout: 3-Column Resizable (NoteSidebar + Editor + Chat)
   898      // E1-1: Added chat panel (30% default, collapsible)
   899      return (
   900:         <MainLayout>
   901              {/* S-007: Import Progress Overlay */}

  1099              </div>
  1100:         </MainLayout>
  1101      );

src/presentation/components/notes/blocks/ColumnBlock.tsx:
    8   * Features:
    9:  * - 2-3 column layouts
   10   * - Adjustable width ratios

   13   *
   14:  * Implementation Note: Uses CSS Grid for visual layout while maintaining
   15   * a single content area for editing. Future enhancement could implement

  135  /**
  136:  * Column Block - Multi-column layout container
  137   *
  138:  * Provides visual column layout for content. Content is edited in a single
  139   * area that spans across columns (CSS grid creates the visual separation).

src/presentation/components/notes/blocks/index.ts:
  12   * - ReferenceBlock: UX-10 - Obsidian-style block references
  13:  * - ColumnBlock: UX-11 - Multi-column layout containers
  14   * - SyncedBlock: UX-12 - Synced blocks that mirror content across instances

  38  
  39: // UX-11: Column layouts
  40  export {

src/presentation/components/notes/blocks/SlidesExportBlock.tsx:
   15    RefreshCw,
   16:   Layout,
   17    Image as ImageIcon,

   29  
   30: export type SlideLayoutType = 'title' | 'title_content' | 'bullets' | 'two_column' | 'image';
   31  

   33    id: string;
   34:   layout: SlideLayoutType;
   35    title: string;

   49  
   50: const SLIDE_LAYOUTS: { type: SlideLayoutType; label: string; icon: React.ReactNode }[] = [
   51    { type: 'title', label: 'Title', icon: <Type size={14} /> },
   52:   { type: 'title_content', label: 'Content', icon: <Layout size={14} /> },
   53    { type: 'bullets', label: 'Bullets', icon: <List size={14} /> },

   88    const [filename, setFilename] = useState(blockProps.filename || DEFAULT_FILENAME);
   89:   const [selectedLayout, setSelectedLayout] = useState<SlideLayoutType>('title_content');
   90    const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'exporting' | 'error'>('idle');

  109      const newSlides: SlideData[] = [];
  110:     let currentSlide: Partial<SlideData> = { id: crypto.randomUUID(), layout: 'title_content' };
  111  

  121            id: crypto.randomUUID(),
  122:           layout: 'title_content',
  123            title: slideMatch[2]?.trim() || `Slide ${slideMatch[1]}`,

  130            id: crypto.randomUUID(),
  131:           layout: 'title_content',
  132            title: lines[0].replace(/^#+\s*/, ''),

  147          id: crypto.randomUUID(),
  148:         layout: 'title',
  149          title: presentationTitle,

  195        pptx.author = author || DEFAULT_AUTHOR;
  196:       pptx.layout = 'LAYOUT_WIDE';
  197  

  210  
  211:         switch (slideData.layout) {
  212            case 'title':

  289        id: crypto.randomUUID(),
  290:       layout: selectedLayout,
  291        title: t('notes.ai.slides.newSlide', 'New Slide'),

  296      updateBlock({ slides: newSlides });
  297:   }, [selectedLayout, slides, updateBlock, t]);
  298  

  361  
  362:       {/* Layouts */}
  363        <div style={{ marginBottom: '16px' }}>
  364          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
  365:           {SLIDE_LAYOUTS.map((layout) => (
  366              <button
  367:               key={layout.type}
  368:               style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', background: '#0f0f1a', border: `2px solid ${selectedLayout === layout.type ? '#6366f1' : '#3f3f5c'}`, borderRadius: 0, cursor: 'pointer', fontSize: '9px', color: selectedLayout === layout.type ? '#f8fafc' : '#94a3b8' }}
  369:               onClick={() => setSelectedLayout(layout.type)}
  370              >
  371:               {layout.icon}
  372:               <span>{layout.label}</span>
  373              </button>

src/presentation/components/onboarding/LayoutOnboarding.tsx:
    1  /**
    2:  * @fileoverview Layout Onboarding Component - First-time user tooltips
    3:  * @module presentation/components/onboarding/LayoutOnboarding
    4   *

    7   * Provides dismissible tooltip hints for first-time users.
    8:  * Shows progressive hints about layout features.
    9   *

   67  /**
   68:  * Layout Onboarding Props
   69:  * / Props Layout Onboarding
   70   *

   74   */
   75: interface LayoutOnboardingProps {
   76    // No props needed - auto-activates based on preferences

   80  // ============================================================================
   81: // LayoutOnboarding Component
   82  // ============================================================================

   84  /**
   85:  * Layout Onboarding Component
   86:  * / Component Layout Onboarding
   87   *
   88:  * @returns Layout onboarding JSX element
   89   *

  101   * English:
  102:  * First-time users see tooltips explaining layout features:
  103   * - Hint 1: Drag plugins to reorder
  104:  * - Hint 2: Add plugins to your layout
  105:  * - Hint 3: Save layouts as presets
  106:  * - Hint 4: Advanced layouts available in Settings
  107   *
  108   * Tiếng Việt:
  109:  * Người dùng lần đầu thấy tooltip giải thích tính năng layout:
  110   * - Gợi ý 1: Kéo plugins để sắp xếp lại
  111:  * - Gợi ý 2: Thêm plugins vào layout
  112:  * - Gợi ý 3: Lưu layout thành presets
  113:  * - Gợi ý 4: Layout nâng cao có sẵn trong Cài đặt
  114   */
  115: export function LayoutOnboarding({}: LayoutOnboardingProps) {
  116    const { t } = useTranslation();

  137        icon: <Info size={16} />,
  138:       title: t('layoutOnboarding.hints.drag.title'),
  139:       message: t('layoutOnboarding.hints.drag.message'),
  140      },

  143        icon: <Info size={16} />,
  144:       title: t('layoutOnboarding.hints.add.title'),
  145:       message: t('layoutOnboarding.hints.add.message'),
  146      },
  147      {
  148:       id: 'save-layout',
  149        icon: <Info size={16} />,
  150:       title: t('layoutOnboarding.hints.save.title'),
  151:       message: t('layoutOnboarding.hints.save.message'),
  152      },
  153      {
  154:       id: 'advanced-layouts',
  155        icon: <Info size={16} />,
  156:       title: t('layoutOnboarding.hints.advanced.title'),
  157:       message: t('layoutOnboarding.hints.advanced.message'),
  158      },

  231      <div
  232:       className="layout-onboarding-container fixed bottom-4 right-4 z-50 max-w-sm"
  233        role="status"

  256              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors border-0 bg-transparent p-1"
  257:             aria-label={t('layoutOnboarding.close')}
  258            >

  265            <div className="text-xs text-muted-foreground">
  266:             {t('layoutOnboarding.progress', {
  267                current: currentHintIndex + 1,

  276              >
  277:               {t('layoutOnboarding.skip')}
  278              </button>

  283                {currentHintIndex < hints.length - 1
  284:                 ? t('layoutOnboarding.next')
  285:                 : t('layoutOnboarding.gotIt')}
  286              </button>

src/presentation/components/panels/index.ts:
   4   *
   5:  * **Phase 2**: Panel Components for CSS Grid Layout
   6   *

  16   * - PluginPanel provides optional external header (drag handle, close button)
  17:  * - CSS Grid layout uses fixed ratios from workflow-presets.ts
  18   *

  66   */
  67: export { PluginPanel } from '@/presentation/layouts/PluginPanel';
  68  

  84    type PresetConfig,
  85: } from '@/presentation/layouts/workflow-presets';
  86  

src/presentation/components/plugins/PluginManager.tsx:
  21    const { t } = useTranslation();
  22:   // const isMobile = useMediaQuery(BREAKPOINTS.mobile); // TODO: For responsive layout
  23  

src/presentation/components/plugins/PluginMarketplace.tsx:
  4   * Browse, search, and install plugins from the marketplace.
  5:  * Mobile full-screen layout with 8-bit gaming style.
  6   *

src/presentation/components/project/ProjectCreationWizard.tsx:
  116   * - Can skip optional steps (2, 3, 4)
  117:  * - Mobile-optimized layout (touch targets ≥44px)
  118   * - i18n strings via t() function

src/presentation/components/sidebar/index.ts:
  29  
  30: // DEPRECATED: PluginSidebar replaced by CSS Grid PluginLayout (Phase 1)
  31  // Keeping export for backward compatibility until full migration

src/presentation/components/sidebar/PluginSidebar.tsx:
  10   *
  11:  * Layout:
  12   * ┌────────┬─────────────────┐

src/presentation/components/sidebar/ProjectList.tsx:
  64      // Platform detection in route handles what plugins to show
  65:     // User customizations are preserved per project via PluginLayoutStore
  66      navigate({

src/presentation/components/snippets/SnippetManager.tsx:
  47   * - Create/edit/delete snippets
  48:  * - Mobile full-screen layout
  49   */

src/presentation/components/templates/TemplateGallery.tsx:
  7   * Template browser with category filter, search, and template cards.
  8:  * Mobile-optimized with responsive layout.
  9   */

src/presentation/components/ui/index.ts:
  56  
  57: // Layout Presets (ARCH-03-03)
  58  export {
  59:   LayoutPresetPicker,
  60:   useLayoutShortcuts,
  61: } from './LayoutPresetPicker';
  62  export { SavePresetDialog, type SavePresetDialogProps } from './SavePresetDialog';

src/presentation/components/ui/keyboard-shortcuts-overlay.tsx:
   13  import * as DialogPrimitive from "@radix-ui/react-dialog";
   14: import { X, Keyboard, Search, FileText, Terminal, Layout, HelpCircle } from "lucide-react";
   15  import { cn } from "@/lib/utils";

   55      description: "sidebar.toggleSidebar",
   56:     category: "layout",
   57    },

   60      description: "sidebar.toggleChat",
   61:     category: "layout",
   62    },

  124      "all",
  125:     "layout",
  126      "editor",

  188                    {category === "all" && "shortcuts.all"}
  189:                   {category === "layout" && "shortcuts.layout"}
  190                    {category === "editor" && "shortcuts.editor"}

  204                  <div className="flex items-center gap-2 mb-3">
  205:                   {category === "layout" && <Layout className="w-4 h-4 text-primary" />}
  206                    {category === "editor" && <FileText className="w-4 h-4 text-primary" />}
  207                    {category === "terminal" && <Terminal className="w-4 h-4 text-primary" />}
  208:                   {category === "sidebar" && <Layout className="w-4 h-4 text-primary" />}
  209                    {category === "navigation" && <Search className="w-4 h-4 text-primary" />}

  211                      {category === "all" && "shortcuts.all"}
  212:                     {category === "layout" && "shortcuts.layout"}
  213                      {category === "editor" && "shortcuts.editor"}

src/presentation/components/ui/LayoutPresetPicker.tsx:
    1  /**
    2:  * @fileoverview Layout Preset Picker - Dropdown to select layouts
    3:  * @module presentation/components/ui/LayoutPresetPicker
    4   *
    5:  * **ARCH-03-03**: Layout Presets System
    6   *
    7:  * Provides a dropdown menu for users to select layout presets (built-in or custom).
    8:  * Includes option to save custom layouts and delete custom presets.
    9   *

   17  import { useTranslation } from 'react-i18next';
   18: import { Layout, Save, Trash2, ChevronDown } from 'lucide-react';
   19  import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
   20  import { useShallow } from 'zustand/react/shallow';
   21: import { useLayoutPresetsStore, type LayoutPreset } from '@/infrastructure/persistence/stores/layout-presets-store';
   22: import { useAdvancedLayouts } from '@/infrastructure/persistence/stores/user-preferences-store';
   23  import { SavePresetDialog } from './SavePresetDialog';
   24: import { useBreakpoint } from '@/presentation/layouts/useBreakpoint';
   25  import { Button } from '@/presentation/components/ui/button';

   31  /**
   32:  * Layout Preset Picker Props
   33:  * / Props Chọn Preset Layout
   34   */
   35: export interface LayoutPresetPickerProps {
   36    currentPresetId?: string;

   39  // ============================================================================
   40: // LayoutPresetPicker Component
   41  // ============================================================================

   43  /**
   44:  * Layout Preset Picker Component
   45:  * / Component Chọn Preset Layout
   46   *
   47   * @remarks
   48:  * - Dropdown menu for selecting layout presets
   49   * - Shows all presets (built-in + custom for current project)

   52   * - Custom presets: Show delete button
   53:  * - "Save Custom Layout" option at bottom
   54   * - 8-bit design compliant: sharp corners, pixel shadows, solid colors

   56   */
   57: export function LayoutPresetPicker() {
   58    const { t } = useTranslation();

   60  
   61:   const { presets, loadPreset, deletePreset, activePresetId } = useLayoutPresetsStore(
   62      useShallow((state) => ({

   71  
   72:   // ARCH-03-05: Advanced layouts toggle
   73:   const { showAdvanced, toggle } = useAdvancedLayouts();
   74  

   78     */
   79:   const handlePresetSelect = (preset: LayoutPreset) => {
   80      loadPreset(preset.id);

   86     */
   87:   const handleDeletePreset = (e: React.MouseEvent, preset: LayoutPreset) => {
   88      e.stopPropagation();
   89:     if (confirm(t('layoutPresets.picker.confirmDelete', { name: preset.name }))) {
   90        deletePreset(preset.id);

   94    /**
   95:    * Handle save custom layout button click
   96:    * / Xử lý khi nhấn nút lưu layout tùy chỉnh
   97     */
   98:   const handleSaveCustomLayout = () => {
   99      setIsSaveDialogOpen(true);

  113     */
  114:   const isPresetActive = (preset: LayoutPreset): boolean => {
  115      return preset.id === activePresetId;

  123    // Filter presets for current project (built-ins + custom)
  124:   // ARCH-03-05: Filter based on advanced layouts preference
  125    const currentProjectPresets = presets.filter((preset) => {

  141            <Button variant="secondary" className="flex items-center gap-2 min-w-[180px]">
  142:             <Layout size={16} />
  143              <span className="flex-1 text-left">
  144                {activePresetId
  145:                 ? presets.find(p => p.id === activePresetId)?.name || t('layoutPresets.picker.custom')
  146:                 : t('layoutPresets.picker.custom')}
  147              </span>

  180                      onClick={(e) => handleDeletePreset(e, preset)}
  181:                     aria-label={t('layoutPresets.picker.delete', { name: preset.name })}
  182                    >

  191  
  192:             {/* Save Custom Layout Option */}
  193              <DropdownMenu.Item
  194                className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer border-0 bg-transparent"
  195:               onClick={handleSaveCustomLayout}
  196              >

  198                <span className="font-semibold text-foreground">
  199:                 {t('layoutPresets.picker.saveCustomLayout')}
  200                </span>

  205  
  206:        {/* ARCH-03-05: More Layouts Toggle Button */}
  207         <button

  211           {showAdvanced
  212:            ? t('layoutPresets.hideAdvanced')
  213:            : t('layoutPresets.showAdvanced')}
  214         </button>

  229  /**
  230:  * Layout Presets Keyboard Shortcuts Hook
  231:  * / Hook Phím tắt Presets Layout
  232   *

  238   */
  239: export function useLayoutShortcuts() {
  240:   const { loadPreset } = useLayoutPresetsStore(
  241      useShallow((state) => ({

src/presentation/components/ui/resizable.tsx:
    9  export type ImperativePanelGroupHandle = {
   10:   getLayout: () => number[]
   11:   setLayout: (layout: number[]) => void
   12    collapse: (panelId: string) => void

   19    direction: Direction
   20:   onLayout?: (layout: number[]) => void
   21    autoSaveId?: string

  105  const ResizablePanelGroup = React.forwardRef<ImperativePanelGroupHandle, ResizablePanelGroupProps>(
  106:   ({ className, direction, onLayout, children, ...props }, ref) => {
  107:     const [layout, setLayout] = React.useState<number[]>([])
  108      const containerRef = React.useRef<HTMLDivElement>(null)

  112        startPos: number
  113:       startLayout: number[]
  114      } | null>(null)

  151  
  152:     // Initialize/update layout when panel count changes
  153:     React.useLayoutEffect(() => {
  154        if (panelCount === 0) return
  155  
  156:       if (layout.length !== panelCount) {
  157:         // Calculate layout with proper handling for missing default sizes
  158          const totalExplicitDefault = defaultSizes.reduce((a, b) => a + b, 0)

  161  
  162:         let newLayout: number[]
  163  

  169              const perPanel = remaining > 0 ? remaining / panelsWithoutDefault : (100 / panelCount)
  170:             newLayout = defaultSizes.map(s => s === 0 ? perPanel : s)
  171            } else {
  172:             newLayout = defaultSizes
  173            }

  180  
  181:           newLayout = defaultSizes.map(s => {
  182              if (s === 0) return perUnassigned

  187            // All panels have explicit defaults but don't sum to 100 - normalize
  188:           newLayout = defaultSizes.map(s => (s / totalExplicitDefault) * 100)
  189          } else {
  190            // No defaults at all - distribute evenly
  191:           newLayout = new Array(panelCount).fill(100 / panelCount)
  192          }
  193  
  194:         setLayout(newLayout)
  195        }
  196:     }, [panelCount, defaultSizes, layout.length])
  197  
  198      React.useImperativeHandle(ref, () => ({
  199:       getLayout: () => layout,
  200:       setLayout: (newLayout: number[]) => {
  201:         if (newLayout.length === layout.length) {
  202:           setLayout(newLayout)
  203:           onLayout?.(newLayout)
  204          }

  207          const panelIndex = panelIdToIndexRef.current.get(panelId)
  208:         if (panelIndex === undefined || layout.length === 0) return
  209  

  213          // Save current size before collapsing
  214:         previousSizesRef.current.set(panelId, layout[panelIndex])
  215  

  220          // Calculate space to redistribute
  221:         const spaceToRedistribute = layout[panelIndex] - collapsedSize
  222  
  223          // Find non-collapsed panels to expand
  224:         const expandablePanels = layout
  225            .map((size, idx) => ({ size, idx }))

  233          const totalExpandableSize = expandablePanels.reduce((sum, p) => sum + p.size, 0)
  234:         const newLayout = [...layout]
  235:         newLayout[panelIndex] = collapsedSize
  236  

  238            const proportion = totalExpandableSize > 0 ? p.size / totalExpandableSize : 1 / expandablePanels.length
  239:           newLayout[p.idx] = p.size + (spaceToRedistribute * proportion)
  240          })

  242          setCollapsedPanels(prev => new Set(prev).add(panelId))
  243:         setLayout(newLayout)
  244:         onLayout?.(newLayout)
  245        },

  247          const panelIndex = panelIdToIndexRef.current.get(panelId)
  248:         if (panelIndex === undefined || layout.length === 0) return
  249  

  253          // Get the size to restore (or default to equal share)
  254:         const previousSize = previousSizesRef.current.get(panelId) ?? (100 / layout.length)
  255  
  256          // Current collapsed size
  257:         const currentSize = layout[panelIndex]
  258          const spaceNeeded = previousSize - currentSize

  260          // Find non-collapsed panels to shrink
  261:         const shrinkablePanels = layout
  262            .map((size, idx) => ({ size, idx }))

  278  
  279:         const newLayout = [...layout]
  280:         newLayout[panelIndex] = previousSize
  281  

  287            const shrinkAmount = Math.min(spaceNeeded * proportion, shrinkableAmount)
  288:           newLayout[p.idx] = p.size - shrinkAmount
  289          })

  296          previousSizesRef.current.delete(panelId)
  297:         setLayout(newLayout)
  298:         onLayout?.(newLayout)
  299        }
  300:     }), [layout, onLayout, collapsedPanels])
  301  

  309          startPos,
  310:         startLayout: [...layout]
  311        }
  312:     }, [layout])
  313  

  327  
  328:       const { handleIndex, startLayout } = state
  329        const leftIndex = handleIndex

  331  
  332:       if (leftIndex < 0 || rightIndex >= startLayout.length) return
  333  
  334:       // Apply delta to the START layout values
  335:       let newLeft = startLayout[leftIndex] + deltaPercent
  336:       let newRight = startLayout[rightIndex] - deltaPercent
  337  

  383  
  384:       // Update layout
  385:       const newLayout = [...startLayout]
  386:       newLayout[leftIndex] = newLeft
  387:       newLayout[rightIndex] = newRight
  388  
  389:       setLayout(newLayout)
  390:       onLayout?.(newLayout)
  391:     }, [direction, onLayout])
  392  

  413          // Get the size to restore
  414:         const previousSize = previousSizesRef.current.get(panelId) ?? (100 / layout.length)
  415:         const currentSize = layout[panelIndex]
  416          const spaceNeeded = previousSize - currentSize

  418          // Find non-collapsed panels to shrink
  419:         const shrinkablePanels = layout
  420            .map((size, idx) => ({ size, idx }))

  436  
  437:         const newLayout = [...layout]
  438:         newLayout[panelIndex] = previousSize
  439  

  445            const shrinkAmount = Math.min(spaceNeeded * proportion, shrinkableAmount)
  446:           newLayout[p.idx] = p.size - shrinkAmount
  447          })

  454          previousSizesRef.current.delete(panelId)
  455:         setLayout(newLayout)
  456:         onLayout?.(newLayout)
  457        } else {

  462          // Save current size before collapsing
  463:         previousSizesRef.current.set(panelId, layout[panelIndex])
  464  
  465          // Calculate space to redistribute
  466:         const spaceToRedistribute = layout[panelIndex] - collapsedSize
  467  
  468          // Find non-collapsed panels to expand
  469:         const expandablePanels = layout
  470            .map((size, idx) => ({ size, idx }))

  478          const totalExpandableSize = expandablePanels.reduce((sum, p) => sum + p.size, 0)
  479:         const newLayout = [...layout]
  480:         newLayout[panelIndex] = collapsedSize
  481  

  483            const proportion = totalExpandableSize > 0 ? p.size / totalExpandableSize : 1 / expandablePanels.length
  484:           newLayout[p.idx] = p.size + (spaceToRedistribute * proportion)
  485          })

  488          setCollapsedPanels(prev => new Set(prev).add(panelId))
  489:         setLayout(newLayout)
  490:         onLayout?.(newLayout)
  491        }
  492:     }, [layout, onLayout, collapsedPanels, panelIds])
  493  

  507          if (isResizablePanel(child)) {
  508:           const size = layout[panelIndex] ?? (100 / Math.max(1, layout.length || 1))
  509            const pIndex = panelIndex++

  526        })
  527:     }, [flatChildren, layout])
  528  

src/presentation/components/ui/SavePresetDialog.tsx:
    1  /**
    2:  * @fileoverview Save Preset Dialog - Modal for saving custom layout presets
    3   * @module presentation/components/ui/SavePresetDialog
    4   *
    5:  * **ARCH-03-03**: Layout Presets System
    6   *
    7:  * Provides a dialog modal for users to save custom layout presets.
    8:  * Includes name input with validation and displays current layout info.
    9   *

   19  import { useShallow } from 'zustand/react/shallow';
   20: import { useLayoutPresetsStore } from '@/infrastructure/persistence/stores/layout-presets-store';
   21: import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
   22  import { Button } from '@/presentation/components/ui/button';

   77   * - Name input field with validation (required, max 50 chars)
   78:  * - Displays current layout info (plugins, mode, panels)
   79   * - Save button disabled when name is empty
   80:  * - On save: calls layoutPresetsStore.savePreset() with current layout
   81   * - 8-bit design: sharp corners, pixel shadows, solid colors

   87  
   88:   // Get current layout from PluginLayoutStore
   89:   const { activePlugins, layoutMode, panelSizes } = usePluginLayoutStore(
   90      useShallow((state) => ({
   91        activePlugins: state.activePlugins,
   92:       layoutMode: state.layoutMode,
   93        panelSizes: state.panelSizes,

   96  
   97:   // Get savePreset action from layoutPresetsStore
   98:   const { savePreset } = useLayoutPresetsStore(
   99      useShallow((state) => ({

  129      if (trimmed === '') {
  130:       setError(t('layoutPresets.saveDialog.error.emptyName'));
  131        return false;

  134      if (trimmed.length > 50) {
  135:       setError(t('layoutPresets.saveDialog.error.nameTooLong'));
  136        return false;

  160     * - Gets current project ID
  161:    * - Calls layoutPresetsStore.savePreset()
  162     * - Closes dialog on success

  172  
  173:     savePreset(name.trim(), activePlugins, layoutMode, panelSizes);
  174      onClose();

  208  
  209:   // Get layout mode display name
  210:   const getLayoutModeName = (): string => {
  211      const modeNames: Record<string, string> = {
  212:       '1-column': t('layoutModes.singleColumn', { defaultValue: '1 Column' }),
  213:       '2-column': t('layoutModes.twoColumns', { defaultValue: '2 Columns' }),
  214:       '3-column': t('layoutModes.threeColumns', { defaultValue: '3 Columns' }),
  215:       '2+1': t('layoutModes.twoPlusOne', { defaultValue: '2+1 (Split)' }),
  216      };
  217:     return modeNames[layoutMode] || layoutMode;
  218    };

  236                <Dialog.Title className="text-lg font-bold text-foreground">
  237:                 {t('layoutPresets.saveDialog.title')}
  238                </Dialog.Title>

  247              <div className="p-4">
  248:               {/* Current Layout Info */}
  249                <div className="mb-4 p-3 bg-muted border-2 border-border shadow-[var(--shadow-pixel-sm)]">
  250                  <div className="text-sm font-semibold text-foreground mb-2">
  251:                   {t('layoutPresets.saveDialog.currentLayout')}
  252                  </div>

  256                      <span className="text-muted-foreground">
  257:                       {t('layoutPresets.saveDialog.plugins')}:
  258                      </span>

  262                    </div>
  263:                   {/* Layout Mode */}
  264                    <div className="flex items-center justify-between">
  265                      <span className="text-muted-foreground">
  266:                       {t('layoutPresets.saveDialog.layoutMode')}:
  267                      </span>
  268:                     <span className="font-medium">{getLayoutModeName()}</span>
  269                    </div>

  272                      <span className="text-muted-foreground">
  273:                       {t('layoutPresets.saveDialog.panelCount')}:
  274                      </span>

  285                  >
  286:                   {t('layoutPresets.saveDialog.nameLabel')}
  287                  </label>

  292                    onChange={(e) => handleNameChange(e.target.value)}
  293:                   placeholder={t('layoutPresets.saveDialog.namePlaceholder')}
  294                    maxLength={50}

src/presentation/components/ui/SkipLinks.tsx:
  40   * ```tsx
  41:  * // In IDELayout.tsx, before the header
  42   * <SkipLinks />

src/presentation/components/ui/StatusAnnouncer.tsx:
  33   * ```tsx
  34:  * // In root layout
  35   * <StatusAnnouncerProvider>

src/presentation/components/ui/activity-indicators/SyncStatusPanel.tsx:
  15   *
  16:  * function Layout() {
  17   *   return (

src/presentation/hooks/useBreakpointEnhanced.ts:
   18   * - Max plugins calculation
   19:  * - Layout mode determination
   20   * - Device type helpers (isMobile, isTablet, isDesktop)

   45  /**
   46:  * Layout mode based on screen size
   47   */
   48: export type LayoutMode = 'full-screen' | 'single-panel' | 'multi-panel';
   49  

   59    maxPlugins: 1 | 2 | 3 | 4;
   60:   /** Current layout mode */
   61:   layoutMode: LayoutMode;
   62    /** Whether current breakpoint is mobile (phone) */

   92  /**
   93:  * Layout rules per breakpoint
   94   */

   98      maxPlugins: 1 | 2 | 3 | 4;
   99:     layoutMode: LayoutMode;
  100      showBottomNav: boolean;

  104      maxPlugins: 1,
  105:     layoutMode: 'full-screen',
  106      showBottomNav: true,

  109      maxPlugins: 1,
  110:     layoutMode: 'full-screen',
  111      showBottomNav: true,

  114      maxPlugins: 2,
  115:     layoutMode: 'single-panel',
  116      showBottomNav: true,

  119      maxPlugins: 2,
  120:     layoutMode: 'multi-panel',
  121      showBottomNav: false,

  124      maxPlugins: 3,
  125:     layoutMode: 'multi-panel',
  126      showBottomNav: false,

  129      maxPlugins: 4,
  130:     layoutMode: 'multi-panel',
  131      showBottomNav: false,

  179      maxPlugins: rules.maxPlugins,
  180:     layoutMode: rules.layoutMode,
  181      showBottomNav: rules.showBottomNav,

  204   *   if (isMobile) {
  205:  *     return <MobileLayout />;
  206   *   }
  207   *
  208:  *   return <DesktopLayout maxPlugins={maxPlugins} />;
  209   * }

src/presentation/hooks/usePluginPlacement.ts:
  633  
  634:       toast('Plugin layout reset to defaults', 'info', 3000);
  635        console.log('[usePluginPlacement] Reset to defaults and cleared storage', entries);

src/presentation/layouts/AddPluginDialog.tsx:
  1  /**
  2:  * @fileoverview AddPluginDialog - Dialog for adding plugins to layout
  3:  * @module presentation/layouts/AddPluginDialog
  4   *
  5:  * **CC-AR-08**: Extracted from PluginLayout.tsx (god component split)
  6   *

src/presentation/layouts/index.ts:
   1  /**
   2:  * @fileoverview Layouts Module Exports
   3:  * @module presentation/layouts
   4   *
   5:  * Exports all layout components and stores.
   6   *

  13  // ============================================================================
  14: // Main Layout Components
  15  // ============================================================================
  16  
  17: export { PluginLayout } from './PluginLayout';
  18  export { PluginPanel } from './PluginPanel';

  21  // ============================================================================
  22: // Layout Hooks
  23  // ============================================================================
  24  
  25: export { useBreakpoint, BREAKPOINTS, LAYOUT_RULES } from './useBreakpoint';
  26  export type { Breakpoint } from './useBreakpoint';

  28  // ============================================================================
  29: // Layout Stores
  30  // ============================================================================
  31  
  32: export { usePluginLayoutStore } from './PluginLayoutStore';
  33: export type { LayoutMode } from './PluginLayoutStore';
  34  export {
  35    selectActivePlugins,
  36:   selectLayoutMode,
  37    selectPanelSizes,
  38: } from './PluginLayoutStore';
  39  

  45  //
  46: // The PluginLayoutStore now provides:
  47: // - usePluginLayoutStore: Main store for plugin state
  48  // - togglePlugin: Add/remove plugins

  51  // ============================================================================
  52: // Layout Presets (ARCH-03-03)
  53  // ============================================================================

  55  export {
  56:   useLayoutPresetsStore,
  57:   type LayoutPreset,
  58    BUILT_IN_PRESETS,
  59: } from '@/infrastructure/persistence/stores/layout-presets-store';
  60  

src/presentation/layouts/layout-presets.ts:
    1  /**
    2:  * @fileoverview Layout Presets - Pre-designed layout configurations
    3:  * @module presentation/layouts/layout-presets
    4   *
    5:  * **CC-AR-04**: Toggle-Based Layout System
    6   *
    7:  * Provides pre-designed layout configurations for different plugin counts.
    8:  * Used by PluginLayout to auto-select optimal layout based on active plugins.
    9   *

   15  
   16: import type { LayoutMode } from './PluginLayoutStore';
   17  
   18  // ============================================================================
   19: // Layout Slot Configuration
   20  // ============================================================================

   22  /**
   23:  * Layout Slot Configuration
   24   *
   25   * @remarks
   26:  * Defines sizing and positioning for each slot in a layout preset.
   27   * - flex: Relative size (0-100)
   28   * - minWidth: Minimum width in pixels
   29:  * - row: Row number for 2+1 layouts (1 = top, 2 = bottom)
   30   */
   31: export interface LayoutSlot {
   32    /** Flex percentage (0-100) - relative size within row */

   37  
   38:   /** Row number for multi-row layouts (1 or 2) */
   39    row?: number;

   42  // ============================================================================
   43: // Layout Preset Configuration
   44  // ============================================================================

   46  /**
   47:  * Layout Preset Configuration
   48   *
   49   * @remarks
   50:  * Defines a complete layout configuration:
   51:  * - mode: LayoutMode string for the store
   52   * - pluginCount: Number of plugins this preset is designed for

   54   */
   55: export interface LayoutPreset {
   56:   /** Layout mode identifier */
   57:   mode: LayoutMode;
   58  

   62    /** Slot configurations */
   63:   slots: LayoutSlot[];
   64  }

   66  // ============================================================================
   67: // Pre-designed Layout Presets
   68  // ============================================================================

   70  /**
   71:  * Pre-designed Layout Presets
   72   *

   77   *
   78:  * Layout patterns:
   79   * - 1-column: Single full-width panel

   84   */
   85: export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
   86    '1-column': {

  141  /**
  142:  * Get optimal layout preset for given plugin count
  143   *
  144   * @param pluginCount - Number of active plugins
  145:  * @returns LayoutPreset for the count, or default 2-column
  146   *

  148   * Returns the best-matching preset based on plugin count.
  149:  * Defaults to 2-column layout if count is unexpected.
  150   *

  152   * ```ts
  153:  * const preset = getLayoutPresetForCount(3);
  154:  * // Returns LAYOUT_PRESETS['3-column']
  155   * ```
  156   */
  157: export function getLayoutPresetForCount(pluginCount: number): LayoutPreset {
  158    switch (pluginCount) {

  160      case 1:
  161:       return LAYOUT_PRESETS['1-column'];
  162      case 2:
  163:       return LAYOUT_PRESETS['2-column'];
  164      case 3:
  165:       return LAYOUT_PRESETS['3-column'];
  166      case 4:
  167:       return LAYOUT_PRESETS['4-plugin-2+2'];
  168      case 5:
  169:       return LAYOUT_PRESETS['5-plugin-3+2'];
  170      default:
  171:       // For 6+ plugins, use 2+1 layout (max supported)
  172:       return LAYOUT_PRESETS['5-plugin-3+2'];
  173    }

  178   *
  179:  * @param preset - Layout preset to use
  180   * @param index - Plugin index (0-based)
  181:  * @returns LayoutSlot configuration, or default if index out of range
  182   */
  183: export function getSlotForIndex(preset: LayoutPreset, index: number): LayoutSlot {
  184    if (index >= 0 && index < preset.slots.length) {

src/presentation/layouts/layout-utils.ts:
    1  /**
    2:  * @fileoverview Layout Utility Functions
    3:  * @module presentation/layouts/layout-utils
    4   * @created 2026-01-26

    7   * 
    8:  * Utility functions for calculating auto-layout configurations
    9   * based on active plugin count and container dimensions.
   10   * 
   11:  * Auto-Layout Logic:
   12   * - 2 plugins → 30/70 horizontal split

   18  import type { PluginId } from '@/domain/types/plugin-types';
   19: import type { LayoutMode } from './PluginLayoutStore';
   20  

   24  
   25: export interface LayoutSlot {
   26      pluginId: PluginId;

   34  
   35: export interface LayoutGrid {
   36      rows: number;
   37      cols: number;
   38:     slots: LayoutSlot[];
   39      gap: number; // Gap in pixels

   41  
   42: export interface AutoLayoutConfig {
   43:     mode: LayoutMode;
   44:     grid: LayoutGrid;
   45      defaultSizes: Record<string, number>; // pluginId → percentage

   48  // ============================================================================
   49: // Auto-Layout Calculation
   50  // ============================================================================

   52  /**
   53:  * Calculate the optimal layout mode based on plugin count.
   54   * 
   55   * @param pluginCount - Number of active plugins
   56:  * @returns Recommended layout mode
   57   */
   58: export function getAutoLayoutMode(pluginCount: number): LayoutMode {
   59      switch (pluginCount) {

   74  /**
   75:  * Calculate auto-layout configuration for given plugins.
   76   * 

   79   * @param containerHeight - Container height in pixels (optional)
   80:  * @returns Auto-layout configuration
   81   */
   82: export function calculateAutoLayout(
   83      plugins: PluginId[],

   85      containerHeight?: number
   86: ): AutoLayoutConfig {
   87      const count = plugins.length;
   88:     const mode = getAutoLayoutMode(count);
   89  
   90:     let grid: LayoutGrid;
   91      let defaultSizes: Record<string, number> = {};

  235          default:
  236:             // 3+2 layout: 3 top (33/33/33) + 2 bottom (50/50)
  237              grid = {

  383  // ============================================================================
  384: // Layout Mode Helpers
  385  // ============================================================================

  387  /**
  388:  * Get the number of columns for a layout mode.
  389   */
  390: export function getLayoutColumns(mode: LayoutMode): number {
  391      switch (mode) {

  405  /**
  406:  * Check if layout mode supports the given plugin count.
  407   */
  408: export function isLayoutCompatible(mode: LayoutMode, pluginCount: number): boolean {
  409      switch (mode) {

src/presentation/layouts/LayoutRenderers.tsx:
    1  /**
    2:  * @fileoverview LayoutRenderers - Layout rendering components for PluginLayout
    3:  * @module presentation/layouts/LayoutRenderers
    4   *
    5:  * **CC-AR-08**: Extracted from PluginLayout.tsx (god component split)
    6   *
    7:  * Contains layout rendering components for different column configurations:
    8   * - 1-column: Single panel

   20  
   21: import { Plus, LayoutGrid } from 'lucide-react';
   22  import { useTranslation } from 'react-i18next';

   31  /**
   32:  * Common props for layout renderers
   33   */
   34: export interface LayoutRendererProps {
   35    /** Active plugin IDs */

   41    /** Current plugin for mobile single view */
   42:   currentPluginForLayout: PluginId | null;
   43    /** Handler for removing a plugin */

   49  // ============================================================================
   50: // 1-Column Layout Component
   51  // ============================================================================

   53  /**
   54:  * OneColumnLayout - Single panel layout
   55   */
   56: export function OneColumnLayout({
   57    activePlugins,

   60    onShowAddDialog,
   61: }: LayoutRendererProps) {
   62  

   94  // ============================================================================
   95: // 2-Column Layout Component
   96  // ============================================================================

   98  /**
   99:  * TwoColumnLayout - Two panels side-by-side
  100   */
  101: export function TwoColumnLayout({
  102    activePlugins,

  105    onShowAddDialog,
  106: }: LayoutRendererProps) {
  107    if (activePlugins.length === 0) {

  164  // ============================================================================
  165: // 3-Column Layout Component
  166  // ============================================================================

  168  /**
  169:  * ThreeColumnLayout - Three panels side-by-side
  170   */
  171: export function ThreeColumnLayout({
  172    activePlugins,

  175    onShowAddDialog,
  176: }: LayoutRendererProps) {
  177    if (activePlugins.length === 0) {

  258  // ============================================================================
  259: // 2+1 Layout Component
  260  // ============================================================================

  262  /**
  263:  * TwoPlusOneLayout - Two panels top, one full-width bottom
  264   */
  265: export function TwoPlusOneLayout({
  266    activePlugins,

  269    onShowAddDialog,
  270: }: LayoutRendererProps) {
  271    if (activePlugins.length === 0) {

  359  /**
  360:  * MobileSingleViewLayout - One plugin fullscreen on mobile
  361   */
  362: export function MobileSingleViewLayout({
  363    visiblePlugins,
  364:   currentPluginForLayout,
  365    onRemovePlugin,
  366    onShowAddDialog,
  367: }: LayoutRendererProps) {
  368    if (visiblePlugins.length === 0) {

  371  
  372:   const currentPlugin = currentPluginForLayout || visiblePlugins[0];
  373    const plugin = getPlugin(currentPlugin);

  415      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
  416:       <LayoutGrid size={64} className="mb-4 text-muted-foreground/70" />
  417        <h2 className="text-lg font-semibold mb-2">

src/presentation/layouts/MobilePluginNav.tsx:
  2   * @fileoverview MobilePluginNav - Bottom navigation for mobile plugins
  3:  * @module presentation/layouts/MobilePluginNav
  4   */

src/presentation/layouts/PluginLayout.tsx:
    1  /**
    2:  * @fileoverview PluginLayout - Simplified Plugin Layout System
    3:  * @module presentation/layouts/PluginLayout
    4   *
    5:  * **SIMPLIFIED PLUGIN LAYOUT SYSTEM**
    6   *
    7:  * This is a temporary simplified layout following the archival of the Bento Grid system.
    8   * It provides basic plugin rendering without the bento grid features.

   18  import { useShallow } from 'zustand/react/shallow';
   19: import { LayoutGrid } from 'lucide-react';
   20  

   30  // Store for breakpoint detection
   31: import { usePluginLayoutStore } from './PluginLayoutStore';
   32  
   33: // Responsive layout rules
   34: import { LAYOUT_RULES } from './useBreakpoint';
   35  import { MobilePluginNav } from './MobilePluginNav';
   36  
   37: // Layout Onboarding
   38: import { LayoutOnboarding } from '@/presentation/components/onboarding/LayoutOnboarding';
   39  
   40  // ============================================================================
   41: // PluginLayout Props Interface
   42  // ============================================================================

   44  /**
   45:  * PluginLayout Props
   46   */
   47: interface PluginLayoutProps {}
   48  
   49  // ============================================================================
   50: // PluginLayout Component
   51  // ============================================================================

   53  /**
   54:  * PluginLayout Component - Simplified Plugin Layout
   55   *
   56:  * @returns Plugin layout JSX element
   57   *

   59   * This is a simplified version following Bento Grid archival.
   60:  * Uses PluginLayoutStore for plugin state management.
   61   *

   66   */
   67: export function PluginLayout({}: PluginLayoutProps) {
   68    const { t } = useTranslation();

   70    // ========================================================================
   71:   // Layout Store for Plugin State and Breakpoint Detection
   72    // ========================================================================
   73  
   74:   const { breakpoint, switchPlugin, activePlugins, currentPlugin } = usePluginLayoutStore(
   75      useShallow((state) => ({

   83    // ========================================================================
   84:   // Apply Responsive Layout Rules
   85    // ========================================================================
   86  
   87:   const layoutRules = LAYOUT_RULES[breakpoint];
   88    const isMobile = breakpoint === 'mobile' || breakpoint === 'mobileLg';

   91    const visiblePlugins = isMobile
   92:     ? activePlugins.slice(0, layoutRules.maxPlugins)
   93      : activePlugins;

   98    // ========================================================================
   99:   // Render Mobile Single-View Layout
  100    // ========================================================================

  119    // ========================================================================
  120:   // Render Simple Grid Layout (Desktop/Tablet)
  121    // ========================================================================

  127  
  128:     // Simple grid layout - equal columns
  129      const gridCols = visiblePlugins.length === 1 ? '1fr' :

  163        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
  164:         <LayoutGrid size={64} className="mb-4 text-muted-foreground/70" />
  165          <h2 className="text-lg font-semibold mb-2">

  181        {/* ================================================================
  182:           Main Layout Content
  183           ================================================================ */}

  192  
  193:       {layoutRules.showBottomNav && (
  194          <MobilePluginNav

  201        {/* ================================================================
  202:           Layout Onboarding (ARCH-03-05)
  203           ================================================================ */}
  204:       <LayoutOnboarding />
  205      </div>

  272  // ============================================================================
  273: // No additional exports - PluginLayout exported above
  274  // ============================================================================

src/presentation/layouts/PluginLayoutStore.ts:
    1  /**
    2:  * @fileoverview PluginLayout Store - Zustand store for layout state
    3:  * @module presentation/layouts/PluginLayoutStore
    4   *
    5:  * **ARCH-02-09**: PluginLayout Container - State Management
    6   *
    7:  * Provides Zustand store with persist middleware for plugin layout state.
    8:  * Persists active plugin selection and layout mode per project.
    9   *

   31   * - Returns undefined if no active project
   32:  * - Used to prefix plugin-layout storage key
   33   */

   42    } catch (error) {
   43:     console.warn('[PluginLayoutStore] Failed to read current project ID:', error);
   44      return undefined;

   52   * - Wraps localStorage to add projectId prefix to all keys
   53:  * - Ensures layout data is isolated per project
   54   * - Falls back to global key if no project active
   55:  * - Implements StorageValue<PluginLayoutState> type contract
   56   */
   57  const projectSpecificStorage = {
   58:   getItem: (name: string): StorageValue<PluginLayoutState> | null => {
   59      const projectId = getCurrentProjectId();
   60:     const key = projectId ? `plugin-layout-${projectId}` : name;
   61      const item = localStorage.getItem(key);

   63      try {
   64:       return JSON.parse(item) as StorageValue<PluginLayoutState>;
   65      } catch {

   68    },
   69:   setItem: (name: string, value: StorageValue<PluginLayoutState>): void => {
   70      const projectId = getCurrentProjectId();
   71:     const key = projectId ? `plugin-layout-${projectId}` : name;
   72      localStorage.setItem(key, JSON.stringify(value));

   75      const projectId = getCurrentProjectId();
   76:     const key = projectId ? `plugin-layout-${projectId}` : name;
   77      localStorage.removeItem(key);

   81  // ============================================================================
   82: // Layout Mode Type
   83  // ============================================================================

   85  /**
   86:  * Layout mode options for plugin arrangement
   87   *
   88   * @remarks
   89:  * Defines 4 supported layout configurations:
   90   * - 1-column: Single panel (full width)

   94   */
   95: export type LayoutMode = '1-column' | '2-column' | '3-column' | '2+1';
   96  
   97  // ============================================================================
   98: // Plugin Layout State Interface
   99  // ============================================================================

  101  /**
  102:  * PluginLayout State Interface
  103   *
  104   * @remarks
  105:  * Stores plugin layout configuration:
  106   * - Active plugin IDs in display order
  107:  * - Layout mode (1-column, 2-column, 3-column, 2+1)
  108   * - Panel sizes (plugin ID -> size percentage)

  115   */
  116: interface PluginLayoutState {
  117    /** Hydration completion flag - true after persist middleware finishes loading */

  122  
  123:   /** Current layout mode */
  124:   layoutMode: LayoutMode;
  125  

  128  
  129:   /** Track if user has customized layout (prevents overwriting defaults) */
  130    hasUserCustomized: boolean;

  153  
  154:   /** Change layout mode */
  155:   setLayoutMode: (mode: LayoutMode) => void;
  156  

  162  
  163:   /** Initialize default plugins and layout mode (only if not customized) */
  164:   initializeDefaults: (plugins: PluginId[], mode: LayoutMode) => void;
  165  

  192  /**
  193:  * PluginLayout Store
  194   *

  197   * - Uses persist middleware for localStorage
  198:  * - Storage key: 'plugin-layout-storage'
  199   *

  201   * - activePlugins: Plugin IDs array (order matters)
  202:  * - layoutMode: String ('1-column', '2-column', etc.)
  203   * - panelSizes: Object mapping plugin ID to size percentage
  204   */
  205: export const usePluginLayoutStore = create<PluginLayoutState>()(
  206    persist(

  215        activePlugins: [],
  216:       layoutMode: '2-column',
  217        panelSizes: {},

  240            if (state.activePlugins.includes(pluginId)) {
  241:             console.warn(`[PluginLayoutStore] Plugin ${pluginId} already active`);
  242              return state;

  247              console.warn(
  248:               `[PluginLayoutStore] Maximum 5 plugins allowed, cannot add ${pluginId}`
  249              );

  301            console.log(
  302:             `[PluginLayoutStore] Reordered plugin from ${fromIndex} to ${toIndex}`
  303            );

  311        /**
  312:        * Change layout mode
  313         *
  314:        * @param mode - New layout mode
  315         * @remarks
  316:        * - Directly updates layoutMode
  317         * - No validation needed (all modes supported)

  319         */
  320:       setLayoutMode: (mode) =>
  321          set(() => ({
  322:           layoutMode: mode,
  323            hasUserCustomized: true,

  356        /**
  357:        * Initialize default plugins and layout mode
  358         *
  359         * @param plugins - Default plugin IDs to load
  360:        * @param mode - Default layout mode
  361         * @remarks
  362:        * - Only initializes if user hasn't customized layout
  363         * - Sets hasUserCustomized=false initially

  370              activePlugins: plugins,
  371:             layoutMode: mode,
  372              hasUserCustomized: false,

  381         * - Updates responsive breakpoint state
  382:        * - Enforces max plugins based on LAYOUT_RULES
  383         * - Sets current plugin if not set

  386          set((state) => {
  387:           // Import LAYOUT_RULES from useBreakpoint
  388:           const LAYOUT_RULES = {
  389              mobile: {
  390                maxPlugins: 1,
  391:               layoutMode: '1-column',
  392                sidebarMode: 'overlay',

  396                maxPlugins: 1,
  397:               layoutMode: '1-column',
  398                sidebarMode: 'overlay',

  402                maxPlugins: 2,
  403:               layoutMode: '2-column',
  404                sidebarMode: 'collapsible',

  408                maxPlugins: 5,
  409:               layoutMode: 'user-selected',
  410                sidebarMode: 'persistent',

  414                maxPlugins: 5,
  415:               layoutMode: 'user-selected',
  416                sidebarMode: 'persistent',

  420  
  421:           const rules = LAYOUT_RULES[bp];
  422  

  527              if (state.activePlugins.length <= 2) {
  528:               console.warn('[PluginLayoutStore] Cannot go below 2 plugins');
  529                return state;

  537              if (state.activePlugins.length >= 5) {
  538:               console.warn('[PluginLayoutStore] Cannot exceed 5 plugins');
  539                return state;

  554      {
  555:       name: 'plugin-layout-storage', // Will be prefixed by projectSpecificStorage
  556        version: 1, // For migration support

  579  /**
  580:  * Select active plugins and layout mode
  581   *

  584   * ```ts
  585:  * const { activePlugins, layoutMode } = usePluginLayoutStore(
  586   *   useShallow((state) => ({
  587   *     activePlugins: state.activePlugins,
  588:  *     layoutMode: state.layoutMode,
  589   *   }))

  592   */
  593: export const selectActivePlugins = (state: PluginLayoutState) =>
  594    state.activePlugins;
  595  
  596: export const selectLayoutMode = (state: PluginLayoutState) => state.layoutMode;
  597  
  598: export const selectPanelSizes = (state: PluginLayoutState) => state.panelSizes;
  599  

  602   *
  603:  * @param state - PluginLayoutState
  604   * @param pluginId - Plugin ID to check

  608   * ```ts
  609:  * const isActive = usePluginLayoutStore(useShallow((s) => selectIsPluginActive(s, 'notes')));
  610   * ```
  611   */
  612: export const selectIsPluginActive = (state: PluginLayoutState, pluginId: PluginId): boolean =>
  613    state.activePlugins.includes(pluginId);

src/presentation/layouts/PluginPanel.tsx:
    2   * @fileoverview PluginPanel - Individual panel wrapper for plugins
    3:  * @module presentation/layouts/PluginPanel
    4   *
    5:  * **ARCH-02-09**: PluginLayout Container - Panel Component
    6   *
    7:  * Wrapper component that renders individual plugin instances in layout panels.
    8   * Handles plugin lifecycle (onMount/onUnmount) and panel UI (header, close button).

   40   * - onClose: Callback when close button clicked
   41:  * - showHeader: Whether to show the panel header (default: false for grid layout)
   42   */

   62     * @remarks
   63:    * Phase 1 grid layout: Plugins have their own headers, so PluginPanel header is hidden.
   64     * Set to true for contexts where the plugin header is not shown.

   87   * - Drag handle for reordering (visual indicator only)
   88:  * - Close button to remove plugin from layout
   89   * - Error handling if plugin not found

  102    onClose,
  103:   showHeader = false, // Default: hidden for grid layout (plugins have their own headers)
  104  }: PluginPanelProps) {

  134     * - Only responds when panel is focused
  135:    * - Imports layout store dynamically to avoid circular dependency
  136     */

  141  
  142:     // Import layout store dynamically to avoid circular dependency
  143:     const { usePluginLayoutStore } = await import('./PluginLayoutStore');
  144:     const store = usePluginLayoutStore.getState();
  145      const currentIndex = store.activePlugins.indexOf(pluginId);

  238     * - Detects horizontal swipe (|deltaX| > 50 && |deltaY| < 50)
  239:    * - Imports layout store dynamically to avoid circular dependency
  240     * - Calls switchToNextPlugin or switchToPreviousPlugin based on direction

  248      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
  249:       // Import layout store dynamically to avoid circular dependency
  250:       const { usePluginLayoutStore } = await import('./PluginLayoutStore');
  251  

  253          // Swipe right - switch to previous plugin
  254:         usePluginLayoutStore().switchToPreviousPlugin();
  255        } else {
  256          // Swipe left - switch to next plugin
  257:         usePluginLayoutStore().switchToNextPlugin();
  258        }

  285             
  286:            Phase 1 Grid Layout: Hidden by default (plugins have their own headers)
  287             Legacy/Other contexts: Can be shown with showHeader={true}

src/presentation/layouts/useBreakpoint.ts:
    2   * @fileoverview useBreakpoint - Platform-aware breakpoint detection hook
    3:  * @module presentation/layouts/useBreakpoint
    4   *
    5:  * **ARCH-03-02**: Mobile-Responsive Plugin Layouts
    6   *

    9   * - Detects mobile, tablet, desktop viewports
   10:  * - Enforces responsive layout rules per ADR-034
   11   * - Provides 8-bit design compliant breakpoint values

   26  /**
   27:  * Breakpoint type for responsive layout
   28   *

   58  /**
   59:  * Layout rules per breakpoint
   60   *

   63   * - maxPlugins: Maximum number of plugins to display
   64:  * - layoutMode: Default layout mode for this breakpoint
   65   * - sidebarMode: How sidebar behaves (overlay/collapsible/persistent)

   69   * Tablet: 2-column max, collapsible sidebar
   70:  * Desktop: Full layout options, persistent sidebar
   71   */
   72: export const LAYOUT_RULES: Record<Breakpoint, {
   73    maxPlugins: number;
   74:   layoutMode: '1-column' | '2-column' | 'user-selected';
   75    sidebarMode: 'overlay' | 'collapsible' | 'persistent';

   79      maxPlugins: 1,
   80:     layoutMode: '1-column',
   81      sidebarMode: 'overlay',

   85      maxPlugins: 1,
   86:     layoutMode: '1-column',
   87      sidebarMode: 'overlay',

   91      maxPlugins: 2,
   92:     layoutMode: '2-column',
   93      sidebarMode: 'collapsible',

   97      maxPlugins: 5,
   98:     layoutMode: 'user-selected',
   99      sidebarMode: 'persistent',

  103      maxPlugins: 5,
  104:     layoutMode: 'user-selected',
  105      sidebarMode: 'persistent',

  129   *   const breakpoint = useBreakpoint();
  130:  *   const rules = LAYOUT_RULES[breakpoint];
  131   *

src/presentation/layouts/workflow-presets.ts:
    1  /**
    2:  * @fileoverview Workflow-Based Layout Presets with Fixed CSS Grid Ratios
    3:  * @module presentation/layouts/workflow-presets
    4   *

    6   *
    7:  * Provides predefined layout presets based on USE CASES, not plugin counts.
    8   * All ratios are FIXED - no user resizing allowed.
    9   *
   10:  * Key Changes from layout-presets.ts:
   11   * - Use-case based instead of plugin-count based

   30   * - focus: Chat + FileTree (7:3 ratio) - Agent-focused mode
   31:  * - code: FileTree + Monaco + Preview (2:5:3 ratio) - Development layout
   32   * - full-editor: Monaco only (100%) - Deep coding mode

   69   * @remarks
   70:  * Per Layout Architecture Specification:
   71   * - No user resizing allowed

   82      label: 'Default',
   83:     labelKey: 'layout.preset.default',
   84      panels: ['chat', 'filetree', 'notes'] as PluginId[],

   86      description: 'Chat + FileTree + Note editor',
   87:     descriptionKey: 'layout.preset.defaultDescription',
   88    },

   92      label: 'Focus',
   93:     labelKey: 'layout.preset.focus',
   94      panels: ['chat', 'filetree'] as PluginId[],

   96      description: 'Agent-focused mode',
   97:     descriptionKey: 'layout.preset.focusDescription',
   98    },

  102      label: 'Code',
  103:     labelKey: 'layout.preset.code',
  104      panels: ['filetree', 'monaco', 'preview'] as PluginId[],
  105      gridTemplate: '2fr 5fr 3fr', // 20%, 50%, 30%
  106:     description: 'Development layout',
  107:     descriptionKey: 'layout.preset.codeDescription',
  108    },

  112      label: 'Full Editor',
  113:     labelKey: 'layout.preset.fullEditor',
  114      panels: ['monaco'] as PluginId[],

  116      description: 'Maximized editor',
  117:     descriptionKey: 'layout.preset.fullEditorDescription',
  118    },

  128   * @remarks
  129:  * Per Layout Architecture Specification:
  130   * - Mobile shows only 2 plugins in tabs

src/presentation/layouts/WorkspaceLayout.tsx:
    1  /**
    2:  * @fileoverview WorkspaceLayout - 6-Column CSS Grid Layout Shell
    3:  * @module presentation/layouts/WorkspaceLayout
    4   *
    5:  * **6-COLUMN GRID LAYOUT SYSTEM**
    6   *
    7:  * Layout structure:
    8   * ┌────────┬────────┬──────────┬────────────────┬──────────┬────────┐

   41  // ============================================================================
   42: // WorkspaceLayout Props Interface
   43  // ============================================================================

   45  /**
   46:  * WorkspaceLayout Props
   47   *
   48   * All props are optional React nodes that render in specific grid areas.
   49:  * Each slot corresponds to a specific area in the 6-column grid layout.
   50   */
   51: export interface WorkspaceLayoutProps {
   52    /** Global sidebar - leftmost 48px column (e.g., Hub navigation) */

   74  // ============================================================================
   75: // WorkspaceLayout Component
   76  // ============================================================================

   78  /**
   79:  * WorkspaceLayout Component - 6-Column CSS Grid Shell
   80   *
   81:  * @param props - WorkspaceLayoutProps
   82:  * @returns Workspace layout JSX element
   83   *

  102   */
  103: export function WorkspaceLayout({
  104    globalSidebar,

  110    statusBar,
  111: }: WorkspaceLayoutProps) {
  112    return (
  113:     <div className="workspace-layout">
  114        {/* Global Sidebar - 48px fixed width */}

  117          <nav
  118:           className="workspace-layout__global-sidebar"
  119            aria-label="Main navigation"

  126        {activityBarLeft && (
  127:         <div className="workspace-layout__activity-bar-left">
  128            {activityBarLeft}

  135          <aside
  136:           className="workspace-layout__plugin-left"
  137            aria-label="Plugin sidebar"

  146          <main
  147:           className="workspace-layout__main-content"
  148            role="main"

  158          <aside
  159:           className="workspace-layout__plugin-right"
  160            aria-label="Plugin sidebar"

  167        {activityBarRight && (
  168:         <div className="workspace-layout__activity-bar-right">
  169            {activityBarRight}

  176          <footer
  177:           className="workspace-layout__status-bar"
  178            role="contentinfo"

  188  // ============================================================================
  189: // No additional exports - WorkspaceLayout exported above
  190  // ============================================================================

src/routes/__root.tsx:
  18  
  19: // UX-GLOBAL-UI: Project-aware layout (hides MainSidebar on project routes)
  20: import { ProjectAwareLayout } from '@/presentation/components/layout/ProjectAwareLayout'
  21  

  94                          <AppErrorBoundary>
  95:                           {/* UX-GLOBAL-UI: New Global Layout Structure */}
  96:                           <ProjectAwareLayout />
  97  

src/routes/$projectId.tsx:
   14   * 1. Load ProjectContextProvider (from ARCH-02-03)
   15:  * 2. Render PluginLayout (from ARCH-02-09) with platform-default plugins
   16:  * 3. Initialize plugins based on platform detection (NO layout query params)
   17   * 4. Persist user's plugin customization per project

   35  import { PluginCoordinationProvider } from '@/infrastructure/context/plugin-coordination-context';
   36: // REMOVED: PluginLayout - ActivityBar + Docker now handles plugin rendering
   37: // import { PluginLayout } from '@/presentation/layouts/PluginLayout';
   38: import { WorkspaceLayout } from '@/presentation/layouts/WorkspaceLayout';
   39  // UXUI-03-01: GlobalSidebar integration - MainSidebar as global sidebar per UX spec
   40: import { MainSidebar } from '@/presentation/components/layout/MainSidebar';
   41  // CC-UX-01: StatusBar integration
   42: import { StatusBar } from '@/presentation/components/layout/StatusBar';
   43: import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
   44: import { getDefaultLayoutMode } from '@/infrastructure/plugins/platform-defaults';
   45  import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
   46: import { getPresetConfig } from '@/presentation/layouts/workflow-presets';
   47  // UXUI-02-05: ActivityBar + Docker Wiring
   48: import { usePluginActivityDockerWiring } from '@/presentation/components/layout/PluginActivityDockerWiring';
   49  import { usePluginPlacement, getDefaultPlacements } from '@/presentation/hooks/usePluginPlacement';
   50: import type { ActivityBarItem } from '@/presentation/components/layout/ActivityBar';
   51  // CC-UX-02: Plugin Registry for rendering

   56  // UXUI-03-04: MainContentRenderer for plugin switching in main content area
   57: import { MainContentRenderer } from '@/presentation/components/layout/MainContentRenderer';
   58  // UXUI-03-05: FloatingPluginDocker for centralized plugin management
   59: import { FloatingPluginDocker } from '@/presentation/components/layout/FloatingPluginDocker';
   60  

  143   *
  144:  * Renders unified project route with ProjectContextProvider and PluginLayout.
  145   * Uses platform-first defaults for plugin initialization.

  150    const { project } = Route.useLoaderData();
  151:   const layoutStore = usePluginLayoutStore();
  152    const platform = getPlatformContract();

  159  
  160:   // CC-AR-03: Check hydration status before rendering layout
  161:   const hasHydrated = usePluginLayoutStore((s) => s._hasHydrated);
  162  

  331  
  332:   // Initialize layout store with platform-appropriate defaults
  333    // Phase 1: Use workflow presets instead of individual plugins

  335      // Only initialize if user hasn't customized AND store has no active plugins
  336:     if (!layoutStore.hasUserCustomized && layoutStore.activePlugins.length === 0) {
  337:       const defaultPreset = layoutStore.currentPreset || 'default';
  338        const presetConfig = getPresetConfig(defaultPreset);

  345        // Use preset's panels as default plugins
  346:       layoutStore.initializeDefaults(presetConfig.panels, getDefaultLayoutMode(platform));
  347      }

  354          <div className="animate-pulse text-muted-foreground font-mono text-sm">
  355:           Loading layout...
  356          </div>

  360  
  361:   // Phase 1: CSS Grid Layout with Fixed-Ratio Presets
  362:   // PluginLayout now includes Chat, FileTree, and other panels in CSS Grid
  363    // No separate PluginSidebar needed - all panels are in the grid
  364    // EPIC-0.6-01: Wrap with PluginCoordinationProvider for cross-plugin coordination
  365:   // UXUI-02-03: WorkspaceLayout integration with MainSidebar as GlobalSidebar
  366    // UXUI-02-05: ActivityBar + Docker wiring for panel management

  371        <ProjectContextProvider projectId={projectId} initialHandle={fsaHandle}>
  372:         <WorkspaceLayout
  373            globalSidebar={<MainSidebar />}

src/routes/agents.tsx:
  14  import { createFileRoute } from '@tanstack/react-router';
  15: import { MainLayout } from '@/presentation/components/layout/MainLayout';
  16  import { AgentsPanel } from '@/presentation/components/ide/AgentsPanel';

  28      return (
  29:         <MainLayout>
  30              <div className={cn(

  43              </div>
  44:         </MainLayout>
  45      );

src/routes/index.tsx:
  4   * 
  5:  * FIX-2026-01-26: Removed MainLayout wrapper.
  6   * GlobalSidebar and GlobalHeader are now rendered in __root.tsx.

src/routes/projects.tsx:
   2  import { ProjectsPage } from '@/presentation/components/project/ProjectsPage'
   3: import { MainLayout } from '@/presentation/components/layout/MainLayout'
   4  import { ErrorBoundary } from '@/presentation/components/error'

   8      <ErrorBoundary>
   9:       <MainLayout>
  10          <ProjectsPage />
  11:       </MainLayout>
  12      </ErrorBoundary>

src/routes/settings.tsx:
   15  import { createFileRoute } from '@tanstack/react-router';
   16: import { MainLayout } from '@/presentation/components/layout/MainLayout';
   17  import { AgentConfigDialog } from '@/presentation/components/agent/AgentConfigDialog';

   39  import { useAllProjects } from '@/infrastructure/persistence/stores/project';
   40: import { useLayoutStore } from '@/infrastructure/persistence/stores/layout-store';
   41  import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

   66      const projects = useAllProjects();
   67:     const activeProjectId = useLayoutStore(s => s.activeNavItem); // Using layout state as placeholder
   68:     const sidebarCollapsed = useLayoutStore(s => s.sidebarCollapsed);
   69  

   79      return (
   80:         <MainLayout>
   81              <div className={cn(

  529              </div>
  530:         </MainLayout>
  531      );

src/styles/design-tokens.ts:
   29   * 
   30:  * @section Layout Tokens
   31   * - Panel sizes: Editor, preview, terminal, chat

  199  // ============================================================================
  200: // Layout Token Types
  201  // ============================================================================

  216  
  217: export type LayoutToken =
  218    | PanelSizeToken

  288    | SpacingToken
  289:   | LayoutToken
  290    | BorderRadiusToken

  350  /**
  351:  * Get layout token reference
  352   * 
  353:  * @param token - Layout token name
  354:  * @returns CSS variable reference for layout value
  355   * 

  357   * ```ts
  358:  * import { getLayout } from '@/styles/design-tokens';
  359   * 
  360:  * const panelSize = getLayout('panel-editor'); // 'var(--panel-editor)'
  361   * ```
  362   */
  363: export function getLayout(token: LayoutToken): string {
  364    return `var(--${token})`;

src/test/setup.ts:
   13        const translations: Record<string, string> = {
   14:         // IDE layout
   15          'ide.hideChat': 'Hide chat',

  136        expandedPaths: new Set<string>(),
  137:       panelLayouts: {},
  138        terminalTab: 'terminal',

  147        setExpandedPaths: vi.fn(),
  148:       setPanelLayout: vi.fn(),
  149        setTerminalTab: vi.fn(),
