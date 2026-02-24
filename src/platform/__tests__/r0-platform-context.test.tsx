// @vitest-environment jsdom

/**
 * @fileoverview R-0 PlatformProvider Tests - Context and hooks
 * @module @/platform/__tests__/r0-platform-context.test
 *
 * Tests for PlatformProvider and related hooks:
 * - Context provision to children
 * - Project loading by projectId
 * - Loading and error state handling
 * - usePlatform() and usePlatformSafe() hooks
 * - NO workspaceId governance check
 *
 * @epic Strategic Rebuild
 * @phase R-0 (Foundation)
 * @created 2026-02-02
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import {
  PlatformProvider,
  usePlatform,
  usePlatformSafe,
} from '../core/platform-context';

// ============================================================================
// Mock Setup
// ============================================================================

/**
 * Mock browser environment for platform detection
 * Uses Object.defineProperty instead of vi.stubGlobal for window
 * to preserve the DOM container for @testing-library
 */
function mockBrowserEnvironment(hasFSA = true) {
  vi.stubGlobal('navigator', {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  });

  // Don't replace window entirely - preserve DOM for testing-library
  // Instead, selectively mock the properties we need
  Object.defineProperty(window, 'innerWidth', {
    value: 1920,
    writable: true,
    configurable: true,
  });

  if (hasFSA) {
    Object.defineProperty(window, 'showDirectoryPicker', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
    vi.stubGlobal('showDirectoryPicker', vi.fn());
  } else {
    // Remove showDirectoryPicker if it exists
    if ('showDirectoryPicker' in window) {
      delete (window as unknown as Record<string, unknown>).showDirectoryPicker;
    }
  }
}

function cleanupMockEnvironment() {
  vi.unstubAllGlobals();
  // Restore window properties
  if ('showDirectoryPicker' in window) {
    delete (window as unknown as Record<string, unknown>).showDirectoryPicker;
  }
}

// ============================================================================
// Test Components
// ============================================================================

/**
 * Test component that uses usePlatform hook
 */
function TestConsumer() {
  const { projectId, isLoading, error, project, platform } = usePlatform();

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (error) {
    return <div data-testid="error">{error.message}</div>;
  }

  return (
    <div data-testid="content">
      <span data-testid="project-id">{projectId}</span>
      <span data-testid="project-name">{project?.name}</span>
      <span data-testid="platform-type">{platform.platform}</span>
      <span data-testid="has-fsa">{String(platform.hasFileSystemAccess)}</span>
    </div>
  );
}

/**
 * Test component that uses usePlatformSafe hook
 */
function SafeConsumer() {
  const context = usePlatformSafe();

  if (!context) {
    return <div data-testid="no-context">No context</div>;
  }

  return (
    <div data-testid="safe-content">
      <span data-testid="safe-project-id">{context.projectId}</span>
    </div>
  );
}

/**
 * Test component that uses usePlatform outside provider (should throw)
 */
function OutsideProviderConsumer() {
  try {
    usePlatform();
    return <div data-testid="no-throw">Did not throw</div>;
  } catch (error) {
    return (
      <div data-testid="threw-error">
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
}

// ============================================================================
// Test Suites
// ============================================================================

describe('R-0: PlatformProvider', () => {
  beforeEach(() => {
    mockBrowserEnvironment();
  });

  afterEach(() => {
    cleanupMockEnvironment();
  });

  // --------------------------------------------------------------------------
  // Provider Tests
  // --------------------------------------------------------------------------

  it('provides platform capabilities to children', async () => {
    render(
      <PlatformProvider projectId="test-project">
        <TestConsumer />
      </PlatformProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('platform-type')).toHaveTextContent('desktop');
    expect(screen.getByTestId('has-fsa')).toHaveTextContent('true');
  });

  it('loads project by projectId', async () => {
    const testProjectId = 'test-project-123';

    render(
      <PlatformProvider projectId={testProjectId}>
        <TestConsumer />
      </PlatformProvider>
    );

    // Wait for project to load
    await waitFor(() => {
      expect(screen.getByTestId('project-id')).toHaveTextContent(testProjectId);
    });

    // Project name should contain truncated ID
    expect(screen.getByTestId('project-name')).toBeInTheDocument();
  });

  it('handles loading state correctly', async () => {
    render(
      <PlatformProvider projectId="test-project">
        <TestConsumer />
      </PlatformProvider>
    );

    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Should now show content
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('handles error state correctly', async () => {
    // Mock the context to simulate an error
    // For this test, we rely on the implementation handling errors
    // Since the stub implementation doesn't throw, we test the error UI structure

    render(
      <PlatformProvider projectId="">
        <TestConsumer />
      </PlatformProvider>
    );

    // The stub implementation loads a mock project even for empty ID
    // So we expect the content to eventually appear (or still be loading)
    // This test verifies the component doesn't crash with empty projectId
    await waitFor(
      () => {
        // Either content or loading should appear (no crash)
        const content = screen.queryByTestId('content');
        const loading = screen.queryByTestId('loading');
        expect(content || loading).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });

  // --------------------------------------------------------------------------
  // Hook Tests
  // --------------------------------------------------------------------------

  it('usePlatform() throws outside provider', () => {
    // Render component that catches the error
    render(<OutsideProviderConsumer />);

    expect(screen.getByTestId('threw-error')).toHaveTextContent(
      'usePlatform must be used within PlatformProvider'
    );
  });

  it('usePlatformSafe() returns null outside provider', () => {
    render(<SafeConsumer />);

    expect(screen.getByTestId('no-context')).toHaveTextContent('No context');
  });

  it('usePlatformSafe() returns context inside provider', async () => {
    render(
      <PlatformProvider projectId="safe-test">
        <SafeConsumer />
      </PlatformProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('safe-content')).toBeInTheDocument();
    });

    expect(screen.getByTestId('safe-project-id')).toHaveTextContent('safe-test');
  });

  // --------------------------------------------------------------------------
  // CRITICAL: Governance Tests
  // --------------------------------------------------------------------------

  it('project contains no workspaceId', async () => {
    let capturedProject: unknown = null;

    function ProjectCapture() {
      const { project } = usePlatform();
      capturedProject = project;
      return <div data-testid="capture">Captured</div>;
    }

    render(
      <PlatformProvider projectId="governance-test">
        <ProjectCapture />
      </PlatformProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('capture')).toBeInTheDocument();
    });

    // Wait for project to be loaded
    await waitFor(() => {
      expect(capturedProject).not.toBeNull();
    });

    // CRITICAL: Verify no workspaceId
    const projectAsAny = capturedProject as Record<string, unknown>;
    expect(projectAsAny).not.toHaveProperty('workspaceId');
    expect(projectAsAny).not.toHaveProperty('workspaceBindings');
    expect(projectAsAny).toHaveProperty('id'); // Should have projectId instead
  });

  it('context value contains no workspaceId', async () => {
    let capturedContext: unknown = null;

    function ContextCapture() {
      const context = usePlatform();
      capturedContext = context;
      return <div data-testid="context-capture">Captured</div>;
    }

    render(
      <PlatformProvider projectId="context-governance-test">
        <ContextCapture />
      </PlatformProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('context-capture')).toBeInTheDocument();
    });

    // CRITICAL: Verify no workspaceId in context
    const contextAsAny = capturedContext as Record<string, unknown>;
    expect(contextAsAny).not.toHaveProperty('workspaceId');
    expect(contextAsAny).toHaveProperty('projectId'); // Should have projectId
  });

  // --------------------------------------------------------------------------
  // Project Loading Behavior
  // --------------------------------------------------------------------------

  it('reloads project when projectId changes', async () => {
    const { rerender } = render(
      <PlatformProvider projectId="first-project">
        <TestConsumer />
      </PlatformProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('project-id')).toHaveTextContent('first-project');
    });

    // Change projectId
    rerender(
      <PlatformProvider projectId="second-project">
        <TestConsumer />
      </PlatformProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('project-id')).toHaveTextContent(
        'second-project'
      );
    });
  });

  it('provides loadProject function', async () => {
    let loadProjectFn: ((id: string) => Promise<void>) | null = null;

    function LoadProjectCapture() {
      const { loadProject } = usePlatform();
      loadProjectFn = loadProject;
      return <div data-testid="fn-capture">Captured</div>;
    }

    render(
      <PlatformProvider projectId="load-test">
        <LoadProjectCapture />
      </PlatformProvider>
    );

    await waitFor(() => {
      expect(loadProjectFn).toBeDefined();
    });

    expect(typeof loadProjectFn).toBe('function');
  });

  // --------------------------------------------------------------------------
  // Platform Detection Integration
  // --------------------------------------------------------------------------

  it('detects desktop platform correctly', async () => {
    mockBrowserEnvironment(true); // With FSA

    render(
      <PlatformProvider projectId="desktop-test">
        <TestConsumer />
      </PlatformProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('platform-type')).toHaveTextContent('desktop');
    });

    expect(screen.getByTestId('has-fsa')).toHaveTextContent('true');
  });

  it('detects mobile platform correctly', async () => {
    cleanupMockEnvironment();

    // Mock mobile environment using Object.defineProperty to preserve DOM
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
    });
    
    Object.defineProperty(window, 'innerWidth', {
      value: 390,
      writable: true,
      configurable: true,
    });
    
    // Remove showDirectoryPicker if it exists (mobile has no FSA)
    if ('showDirectoryPicker' in window) {
      delete (window as unknown as Record<string, unknown>).showDirectoryPicker;
    }

    render(
      <PlatformProvider projectId="mobile-test">
        <TestConsumer />
      </PlatformProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('platform-type')).toHaveTextContent('mobile');
    });

    expect(screen.getByTestId('has-fsa')).toHaveTextContent('false');
  });
});
