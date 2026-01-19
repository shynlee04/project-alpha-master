// @vitest-environment jsdom
/**
 * Unit tests for SyncStatusIndicator component
 *
 * Story 13-3: Add Sync Progress Indicator
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { SyncStatusIndicator, formatRelativeTime } from '../SyncStatusIndicator';
import type { SyncProgress } from '../../../lib/filesystem';

describe('SyncStatusIndicator', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-12-20T08:00:00Z'));
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    describe('syncing state', () => {
        it('should show "Syncing X/Y" when progress is available', () => {
            const progress: SyncProgress = {
                totalFiles: 100,
                syncedFiles: 45,
                currentFile: 'src/components/Button.tsx',
                percentage: 45,
            };

            render(
                <SyncStatusIndicator
                    status="syncing"
                    progress={progress}
                />
            );

            expect(screen.getByText(/Syncing 45\/100/)).toBeTruthy();
        });

        it('should show "Syncing..." when no progress available', () => {
            render(<SyncStatusIndicator status="syncing" />);

            expect(screen.getByText('Syncing...')).toBeTruthy();
        });

        it('should have title attribute with currentFile path', () => {
            const progress: SyncProgress = {
                totalFiles: 10,
                syncedFiles: 5,
                currentFile: 'src/lib/utils/helper.ts',
                percentage: 50,
            };

            const { container } = render(
                <SyncStatusIndicator
                    status="syncing"
                    progress={progress}
                />
            );

            // The outer span has the title attribute
            const indicator = container.querySelector('span[title]');
            expect(indicator?.getAttribute('title')).toBe('Syncing: src/lib/utils/helper.ts');
        });
    });

    describe('idle state', () => {
        it('should show relative time when lastSyncTime is provided', () => {
            const lastSync = new Date('2025-12-20T07:58:00Z'); // 2 minutes ago

            render(
                <SyncStatusIndicator
                    status="idle"
                    lastSyncTime={lastSync}
                />
            );

            expect(screen.getByText('2m ago')).toBeTruthy();
        });

        it('should show "Not synced" when no lastSyncTime', () => {
            render(<SyncStatusIndicator status="idle" />);

            expect(screen.getByText('Not synced')).toBeTruthy();
        });
    });

    describe('error state', () => {
        it('should show error message in title', () => {
            render(
                <SyncStatusIndicator
                    status="error"
                    errorMessage="Failed to read file"
                />
            );

            const button = screen.getByRole('button');
            expect(button.getAttribute('title')).toBe('Failed to read file');
        });

        it('should be clickable for retry', () => {
            const onRetry = vi.fn();

            render(
                <SyncStatusIndicator
                    status="error"
                    onRetry={onRetry}
                />
            );

            screen.getByRole('button').click();
            expect(onRetry).toHaveBeenCalledTimes(1);
        });
    });
});

describe('formatRelativeTime', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-12-20T08:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return "Just now" for recent times', () => {
        const date = new Date('2025-12-20T07:59:55Z'); // 5 seconds ago
        expect(formatRelativeTime(date)).toBe('Just now');
    });

    it('should return seconds for times under a minute', () => {
        const date = new Date('2025-12-20T07:59:30Z'); // 30 seconds ago
        expect(formatRelativeTime(date)).toBe('30s ago');
    });

    it('should return minutes for times under an hour', () => {
        const date = new Date('2025-12-20T07:45:00Z'); // 15 minutes ago
        expect(formatRelativeTime(date)).toBe('15m ago');
    });

    it('should return hours for times under a day', () => {
        const date = new Date('2025-12-20T05:00:00Z'); // 3 hours ago
        expect(formatRelativeTime(date)).toBe('3h ago');
    });
});
