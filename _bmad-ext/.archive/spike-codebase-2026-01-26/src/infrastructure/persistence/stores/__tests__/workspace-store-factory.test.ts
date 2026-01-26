import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createWorkspaceStore, clearStoreRegistry, getStoreCount } from '../workspace-store-factory';

describe('createWorkspaceStore', () => {
  // Clear registry before each test to ensure isolation
  beforeEach(() => {
    clearStoreRegistry();
  });

  // Clean up after each test
  afterEach(() => {
    clearStoreRegistry();
  });

  // Test 1: Factory returns store instance
  it('should return a Zustand store instance', () => {
    const store = createWorkspaceStore('notes', 'proj-1');
    expect(store).toBeDefined();
    expect(typeof store.getState).toBe('function');
    expect(typeof store.setState).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });

  // Test 2: Different workspaces get different instances
  it('should return different store instances for different workspaces', () => {
    const notesStore = createWorkspaceStore('notes', 'proj-1');
    const ideStore = createWorkspaceStore('ide', 'proj-1');

    expect(notesStore).not.toBe(ideStore);
    expect(notesStore.getState()).not.toBe(ideStore.getState());
    expect(getStoreCount()).toBe(2);
  });

  // Test 3: Same workspace+project returns same instance (memoization)
  it('should return same instance for same workspace+project combination', () => {
    const store1 = createWorkspaceStore('notes', 'proj-1');
    const store2 = createWorkspaceStore('notes', 'proj-1');

    expect(store1).toBe(store2); // Same reference
    expect(getStoreCount()).toBe(1); // Only one instance created
  });

  // Test 4: Composite key isolation (workspace switching bug fix)
  it('should isolate state between different workspaces', () => {
    const notesStore = createWorkspaceStore('notes', 'proj-A');
    const ideStore = createWorkspaceStore('ide', 'proj-B');

    // Set currentProject in notes store
    notesStore.setState({ currentProject: 'proj-A' as any });

    // Set currentProject in ide store
    ideStore.setState({ currentProject: 'proj-B' as any });

    // Verify isolation
    expect(notesStore.getState().currentProject).toBe('proj-A');
    expect(ideStore.getState().currentProject).toBe('proj-B');
  });

  // Test 5: TypeScript types enforce parameters
  it('should enforce workspaceId and projectId as required parameters', () => {
    // TypeScript compilation will fail if parameters missing
    // This test verifies runtime behavior
    const store = createWorkspaceStore('notes', 'proj-1');
    expect(store).toBeDefined();

    // Verify state has expected structure
    const state = store.getState();
    expect(state).toHaveProperty('currentProject');
    expect(state).toHaveProperty('setCurrentProject');
  });

  // Test 6: Store cleanup on project change
  it('should reset state when switching projects within same workspace', () => {
    const notesStore1 = createWorkspaceStore('notes', 'proj-A');
    notesStore1.setState({ currentProject: 'proj-A' as any });

    // Create store for different project (same workspace)
    const notesStore2 = createWorkspaceStore('notes', 'proj-B');

    // Verify different instances (different composite keys)
    expect(notesStore1).not.toBe(notesStore2);

    // Verify second store has default state (not contaminated by first)
    expect(notesStore2.getState().currentProject).toBeNull();

    // Verify first store still has its state
    expect(notesStore1.getState().currentProject).toBe('proj-A');

    expect(getStoreCount()).toBe(2);
  });

  // Test 7: Multiple workspaces with same projectId
  it('should isolate state when multiple workspaces use same projectId', () => {
    const notesStore = createWorkspaceStore('notes', 'shared-proj');
    const ideStore = createWorkspaceStore('ide', 'shared-proj');
    const studyStore = createWorkspaceStore('study', 'shared-proj');

    // Each store should have independent state
    notesStore.setState({ currentProject: 'notes-proj' as any });
    ideStore.setState({ currentProject: 'ide-proj' as any });
    studyStore.setState({ currentProject: 'study-proj' as any });

    expect(notesStore.getState().currentProject).toBe('notes-proj');
    expect(ideStore.getState().currentProject).toBe('ide-proj');
    expect(studyStore.getState().currentProject).toBe('study-proj');

    expect(getStoreCount()).toBe(3);
  });

  // Test 8: Utility functions work correctly
  it('should provide utility functions for registry management', () => {
    expect(getStoreCount()).toBe(0);

    createWorkspaceStore('notes', 'proj-1');
    expect(getStoreCount()).toBe(1);

    createWorkspaceStore('ide', 'proj-2');
    expect(getStoreCount()).toBe(2);

    clearStoreRegistry();
    expect(getStoreCount()).toBe(0);
  });

  // Test 9: Store persists across multiple calls (memoization)
  it('should return same instance across multiple calls with same composite key', () => {
    const store1 = createWorkspaceStore('notes', 'proj-1');
    const store2 = createWorkspaceStore('notes', 'proj-1');
    const store3 = createWorkspaceStore('notes', 'proj-1');

    expect(store1).toBe(store2);
    expect(store2).toBe(store3);
    expect(getStoreCount()).toBe(1);
  });
});
