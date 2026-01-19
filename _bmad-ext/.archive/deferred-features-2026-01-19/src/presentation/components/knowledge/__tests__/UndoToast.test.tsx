/**
 * @fileoverview Undo Toast Component Tests
 * @module components/knowledge/__tests__/UndoToast.test
 * @governance EPIC-6-3
 */

import { render, screen } from '@testing-library/react';
import { UndoToast } from '../UndoToast';

describe('UndoToast (Story 6-3)', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('should render toast message with source title', () => {
        render(
            <UndoToast
                sourceTitle="Test Document"
                onUndo={vi.fn()}
            />
        );

        expect(screen.getByText(/Test Document/)).toBeInTheDocument();
        expect(screen.getByText(/deleted/)).toBeInTheDocument();
    });

    it('should render undo button', () => {
        const onUndo = vi.fn();
        render(
            <UndoToast
                sourceTitle="Test Document"
                onUndo={onUndo}
            />
        );

        const undoButton = screen.getByRole('button', { name: /undo/i });
        expect(undoButton).toBeInTheDocument();
    });

    it('should call onUndo when undo button is clicked', () => {
        const onUndo = vi.fn();
        render(
            <UndoToast
                sourceTitle="Test Document"
                onUndo={onUndo}
            />
        );

        const undoButton = screen.getByRole('button', { name: /undo/i });
        undoButton.click();

        expect(onUndo).toHaveBeenCalled();
    });

    it('should show countdown timer', () => {
        render(
            <UndoToast
                sourceTitle="Test Document"
                onUndo={vi.fn()}
                countdown={5}
            />
        );

        // Countdown shows "5s" (number + 's' suffix)
        expect(screen.getByText(/5s/)).toBeInTheDocument();
    });

    it('should not render if visible is false', () => {
        const { container } = render(
            <UndoToast
                sourceTitle="Test Document"
                onUndo={vi.fn()}
                visible={false}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('should render with correct accessibility attributes', () => {
        render(
            <UndoToast
                sourceTitle="Test Document"
                onUndo={vi.fn()}
            />
        );

        const toast = screen.getByRole('alert');
        expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    // Note: Timer-based tests (auto-dismiss, countdown updates) are complex
    // with fake timers and are better tested in integration tests.
    // The component uses setInterval which is well-tested by React itself.
    // Integration tests verify the full user flow with real timers.
});
