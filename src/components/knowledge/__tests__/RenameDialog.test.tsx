/**
 * @fileoverview Rename Dialog Component Tests
 * @module components/knowledge/__tests__/RenameDialog.test
 * @governance EPIC-6-3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RenameDialog } from '../RenameDialog';

describe('RenameDialog (Story 6-3)', () => {
    const defaultProps = {
        isOpen: true,
        currentTitle: 'Test Document.pdf',
        onSave: vi.fn(),
        onCancel: vi.fn(),
    };

    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('should render dialog with current title', () => {
        render(<RenameDialog {...defaultProps} />);

        expect(screen.getByDisplayValue('Test Document.pdf')).toBeInTheDocument();
        expect(screen.getByText('Rename Source')).toBeInTheDocument();
    });

    it('should focus input on mount', () => {
        render(<RenameDialog {...defaultProps} />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
    });

    it('should disable save button when title unchanged', () => {
        render(<RenameDialog {...defaultProps} />);

        const saveButton = screen.getByRole('button', { name: 'Save' });
        expect(saveButton).toBeDisabled();
    });

    it('should enable save button when title changed', () => {
        render(<RenameDialog {...defaultProps} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'New Title.pdf' } });

        const saveButton = screen.getByRole('button', { name: 'Save' });
        expect(saveButton).not.toBeDisabled();
    });

    it('should call onSave with trimmed title when save clicked', () => {
        const onSave = vi.fn();
        render(<RenameDialog {...defaultProps} onSave={onSave} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '  New Title.pdf  ' } });

        const saveButton = screen.getByRole('button', { name: 'Save' });
        fireEvent.click(saveButton);

        expect(onSave).toHaveBeenCalledWith('New Title.pdf');
    });

    it('should call onCancel when cancel clicked', () => {
        const onCancel = vi.fn();
        render(<RenameDialog {...defaultProps} onCancel={onCancel} />);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelButton);

        expect(onCancel).toHaveBeenCalled();
    });

    it('should validate max length (100 chars)', () => {
        render(<RenameDialog {...defaultProps} />);

        const input = screen.getByRole('textbox');
        const longTitle = 'A'.repeat(101);

        fireEvent.change(input, { target: { value: longTitle } });

        expect(screen.getByText(/Title must be less than 100 characters/)).toBeInTheDocument();
    });

    it('should validate required field', () => {
        render(<RenameDialog {...defaultProps} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '' } });

        const saveButton = screen.getByRole('button', { name: 'Save' });
        expect(saveButton).toBeDisabled();
    });

    it('should not render if isOpen is false', () => {
        const { container } = render(
            <RenameDialog {...defaultProps} isOpen={false} />
        );

        expect(container.firstChild).toBeNull();
    });

    it('should trim whitespace on input', () => {
        render(<RenameDialog {...defaultProps} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '  New Title  ' } });

        expect(input).toHaveValue('New Title');
    });

    it('should handle special characters in title', () => {
        render(<RenameDialog {...defaultProps} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Test File (2024) [Final].pdf' } });

        expect(input).toHaveValue('Test File (2024) [Final].pdf');
    });
});
