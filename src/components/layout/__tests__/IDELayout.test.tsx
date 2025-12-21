/**
 * @fileoverview IDE Layout Component Tests
 * @module components/layout/__tests__/IDELayout.test
 * 
 * Tests for the migrated IDELayout component using ShadcnUI Resizable components.
 * Tests cover the new layout structure, panel resizing, and theme integration.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { IDELayout } from '../IDELayout';
import { WorkspaceProvider } from '../../../lib/workspace';
import { ToastProvider } from '../../ui/Toast';
import { axe, toHaveNoViolations } from 'vitest-axe';

expect.extend(toHaveNoViolations);

// Mock MonacoEditor component
vi.mock('../../ide/MonacoEditor', () => ({
  MonacoEditor: ({ openFiles, activeFilePath }: { openFiles: any[]; activeFilePath: string | null }) => (
    <div data-testid="monaco-editor">
      <span>Editor: {activeFilePath || 'No file'}</span>
      <span>Files: {openFiles.length}</span>
    </div>
  ),
}));

// Mock FileTree component
vi.mock('../../ide/FileTree', () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

// Mock PreviewPanel component
vi.mock('../../ide/PreviewPanel', () => ({
  PreviewPanel: () => <div data-testid="preview-panel">Preview Panel</div>,
}));

// Mock TerminalPanel component
vi.mock('../TerminalPanel', () => ({
  TerminalPanel: ({ projectPath }: { projectPath?: string }) => (
    <div data-testid="terminal-panel">Terminal Panel (path: {projectPath || ''})</div>
  ),
}));

// Mock ChatPanelWrapper component
vi.mock('../ChatPanelWrapper', () => ({
  ChatPanelWrapper: () => <div data-testid="chat-panel">Chat Panel</div>,
}));

describe('IDELayout - Migrated to ShadcnUI', () => {
  beforeEach(() => {
    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  test('should render with ShadcnUI Resizable components', () => {
    render(
      <ToastProvider>
        <WorkspaceProvider projectId="test-project">
          <IDELayout />
        </WorkspaceProvider>
      </ToastProvider>,
    );

    // Check that all major panels are rendered
    expect(screen.getByTestId('file-tree')).toBeInTheDocument();
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-panel')).toBeInTheDocument();
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();

    // Check header brand is rendered
    expect(screen.getByText('via-gent')).toBeInTheDocument();
  });

  test('renders panel headers and resizable handles with affordance', () => {
    render(
      <ToastProvider>
        <WorkspaceProvider projectId="test-project">
          <IDELayout />
        </WorkspaceProvider>
      </ToastProvider>,
    );

    // Panel headers
    expect(screen.getByText('Explorer')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();

    // Resizable handles with visible affordance (withHandle adds inner div)
    const handles = screen.getAllByRole('separator');
    expect(handles.length).toBeGreaterThanOrEqual(4);
    handles.forEach((h) => {
      expect(h).toHaveAttribute('tabindex', '0');
    });
  });

  test('passes projectPath into TerminalPanel', () => {
    render(
      <ToastProvider>
        <WorkspaceProvider
          projectId="test-project"
          initialProject={{
            id: 'id-1',
            name: 'Test Project',
            folderPath: '/mock/project',
            fsaHandle: { kind: 'directory', name: 'mock' } as unknown as FileSystemDirectoryHandle,
            lastOpened: new Date(),
          }}
        >
          <IDELayout />
        </WorkspaceProvider>
      </ToastProvider>,
    );
    expect(screen.getByText(/Terminal Panel/)).toHaveTextContent('path: /mock/project');
  });

  test('chat shell toggles and retains content', () => {
    render(
      <ToastProvider>
        <WorkspaceProvider projectId="test-project">
          <IDELayout />
        </WorkspaceProvider>
      </ToastProvider>,
    );

    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();

    // Hide chat
    fireEvent.click(screen.getByRole('button', { name: 'ide.hideChat' }));
    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();

    // Show chat
    fireEvent.click(screen.getByRole('button', { name: 'ide.showChat' }));
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  test('preview shell renders and maintains layout container', () => {
    render(
      <ToastProvider>
        <WorkspaceProvider projectId="test-project">
          <IDELayout />
        </WorkspaceProvider>
      </ToastProvider>,
    );

    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    const previewParent = screen.getByTestId('preview-panel').parentElement;
    expect(previewParent?.className).toContain('min-h-0');
  });

  test('resizable handles have inner grip affordance', () => {
    const { container } = render(
      <ToastProvider>
        <WorkspaceProvider projectId="test-project">
          <IDELayout />
        </WorkspaceProvider>
      </ToastProvider>,
    );
    const handles = container.querySelectorAll('[data-slot="resizable-handle"]');
    expect(handles.length).toBeGreaterThanOrEqual(4);
    handles.forEach((h) => {
      expect(h.querySelector('svg')).not.toBeNull();
    });
  });

  test('dark mode still renders headers/handles', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    render(
      <ToastProvider>
        <WorkspaceProvider projectId="test-project">
          <IDELayout />
        </WorkspaceProvider>
      </ToastProvider>,
    );
    expect(screen.getByText('Explorer')).toBeInTheDocument();
    expect(screen.getAllByRole('separator').length).toBeGreaterThanOrEqual(4);
  });

  test('should toggle chat panel visibility', () => {
    render(
      <ToastProvider>
        <WorkspaceProvider projectId="test-project">
          <IDELayout />
        </WorkspaceProvider>
      </ToastProvider>,
    );

    // Find the chat toggle button by its title (translation key)
    const chatToggle = screen.getByRole('button', { name: 'ide.hideChat' });
    expect(chatToggle).toBeInTheDocument();

    // Click to hide chat
    fireEvent.click(chatToggle);
    // After clicking, the button should show "show chat" translation key
    expect(screen.getByRole('button', { name: 'ide.showChat' })).toBeInTheDocument();

    // Click to show chat again
    fireEvent.click(screen.getByRole('button', { name: 'ide.showChat' }));
    expect(screen.getByRole('button', { name: 'ide.hideChat' })).toBeInTheDocument();
  });

  test('should show minimum viewport warning on small screens', () => {
    // Mock small screen
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 1023px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <ToastProvider>
        <WorkspaceProvider projectId="test-project">
          <IDELayout />
        </WorkspaceProvider>
      </ToastProvider>,
    );

    expect(screen.getByText('Screen Too Small')).toBeInTheDocument();
    expect(screen.getByText('via-gent IDE requires a minimum viewport width of 1024px.')).toBeInTheDocument();
  });

  test('should handle keyboard shortcut for chat toggle', () => {
    render(
      <ToastProvider>
        <WorkspaceProvider projectId="test-project">
          <IDELayout />
        </WorkspaceProvider>
      </ToastProvider>,
    );

    // Initially chat should be visible
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();

    // Trigger keyboard shortcut (Meta+K or Ctrl+K)
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    // Chat should still be visible but focused
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
  });

  test('axe check: no accessibility violations for main layout', async () => {
    const { container } = render(
      <ToastProvider>
        <WorkspaceProvider projectId="test-project">
          <IDELayout />
        </WorkspaceProvider>
      </ToastProvider>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
