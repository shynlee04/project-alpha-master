/**
 * @fileoverview LiveRegion Component Tests
 * @module presentation/components/layout/__tests__/LiveRegion.test
 * @story UXUI-03-11
 * @team Team B
 * @created 2026-01-28
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveRegion, type LiveRegionSyncStatus } from '../LiveRegion';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'liveRegion.syncing': 'Syncing files...',
        'liveRegion.synced': 'All files synced',
        'liveRegion.error': 'Sync error. Please retry.',
        'liveRegion.idle': '',
      };
      return translations[key] || key;
    },
  }),
}));

describe('LiveRegion', () => {
  it('renders with aria-live="polite" attribute', () => {
    render(<LiveRegion syncStatus="syncing" />);
    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('renders with aria-atomic="true" attribute', () => {
    render(<LiveRegion syncStatus="syncing" />);
    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('renders with role="status" attribute', () => {
    render(<LiveRegion syncStatus="syncing" />);
    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveAttribute('role', 'status');
  });

  it('has sr-only class for visual hiding', () => {
    render(<LiveRegion syncStatus="syncing" />);
    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveClass('sr-only');
  });

  it('announces "Syncing files..." when syncStatus is syncing', () => {
    render(<LiveRegion syncStatus="syncing" />);
    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveTextContent('Syncing files...');
  });

  it('announces "All files synced" when syncStatus is synced', () => {
    render(<LiveRegion syncStatus="synced" />);
    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveTextContent('All files synced');
  });

  it('announces error message when syncStatus is error', () => {
    render(<LiveRegion syncStatus="error" />);
    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveTextContent('Sync error. Please retry.');
  });

  it('returns null when syncStatus is idle', () => {
    const { container } = render(<LiveRegion syncStatus="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it('accepts custom className', () => {
    render(<LiveRegion syncStatus="syncing" className="custom-class" />);
    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveClass('sr-only', 'custom-class');
  });

  it('accepts custom message override', () => {
    render(<LiveRegion syncStatus="syncing" customMessage="Custom announcement" />);
    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveTextContent('Custom announcement');
  });

  it('sets data-sync-status attribute correctly', () => {
    const statuses: LiveRegionSyncStatus[] = ['syncing', 'synced', 'error', 'idle'];
    
    for (const status of statuses) {
      const { unmount } = render(<LiveRegion syncStatus={status} />);
      if (status !== 'idle') {
        const liveRegion = screen.getByTestId('live-region');
        expect(liveRegion).toHaveAttribute('data-sync-status', status);
      }
      unmount();
    }
  });
});
