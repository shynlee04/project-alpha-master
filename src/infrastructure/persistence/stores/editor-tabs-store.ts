/**
 * Editor Tabs Store - Backward Compatibility Facade
 *
 * Re-exports from new sliced architecture for backward compatibility.
 *
 * @deprecated Import from @/infrastructure/persistence/stores/editor-tabs instead.
 */

export {
  useEditorTabsStore,
  useEditorTabsStoreFacade,
  // Selectors
  selectTabs,
  selectActiveTabPath,
  selectActiveTab,
  selectTabCount,
  selectDirtyTabs,
  selectSortedTabs,
} from './editor-tabs';

// Re-export types
export type { EditorTab, EditorTabsStore, EditorTabsStoreState, EditorTabsStoreActions } from './editor-tabs';
