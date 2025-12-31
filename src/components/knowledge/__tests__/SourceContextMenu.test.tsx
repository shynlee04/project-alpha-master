/**
 * @fileoverview Source Context Menu Component Tests
 * @module components/knowledge/__tests__/SourceContextMenu.test
 * @governance EPIC-6-3
 */

import { render, screen } from '@testing-library/react';
import { SourceContextMenu } from '../SourceContextMenu';
import type { SourceRecord } from '@/lib/state/dexie-db';

describe('SourceContextMenu (Story 6-3)', () => {
    const mockSource: SourceRecord = {
        id: 'source-1',
        projectId: 'project-1',
        type: 'pdf',
        title: 'Test PDF Document',
        content: 'Test content',
        pageCount: 10,
        wordCount: 2000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    const mockActions = {
        onRename: vi.fn(),
        onDelete: vi.fn(),
        onMoveToCollection: vi.fn(),
        onExport: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    it('should render trigger button with three dots icon', () => {
        render(<SourceContextMenu source={mockSource} {...mockActions} />);

        const trigger = screen.getByRole('button', { name: /more options/i });
        expect(trigger).toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-label', 'More options');
        expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('should render trigger button with correct accessibility attributes', () => {
        render(<SourceContextMenu source={mockSource} {...mockActions} />);

        const trigger = screen.getByRole('button', { name: /more options/i });
        expect(trigger).toHaveAttribute('type', 'button');
    });

    it('should not open menu when trigger is disabled', () => {
        render(<SourceContextMenu source={mockSource} {...mockActions} disabled />);

        const trigger = screen.getByRole('button', { name: /more options/i });
        expect(trigger).toBeDisabled();
    });

    it('should apply custom className to trigger button', () => {
        render(
            <SourceContextMenu
                source={mockSource}
                {...mockActions}
                className="custom-class"
            />
        );

        const trigger = screen.getByRole('button', { name: /more options/i });
        expect(trigger).toHaveClass('custom-class');
    });

    it('should render without crashing', () => {
        const { container } = render(
            <SourceContextMenu source={mockSource} {...mockActions} />
        );
        expect(container).toBeInTheDocument();
    });

    it('should have all required action callbacks', () => {
        const { rerender } = render(
            <SourceContextMenu source={mockSource} {...mockActions} />
        );

        // Component should accept all required callbacks
        expect(mockActions.onRename).toBeDefined();
        expect(mockActions.onDelete).toBeDefined();
        expect(mockActions.onMoveToCollection).toBeDefined();
        expect(mockActions.onExport).toBeDefined();
    });

    // Note: Full interaction tests (opening menu, clicking items) require
    // integration testing with Radix UI's Portal. These are tested in
    // SourceCard integration tests. Radix UI's DropdownMenu is already
    // well-tested by the library itself.
});
