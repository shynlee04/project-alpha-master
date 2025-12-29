/**
 * @fileoverview Metadata Editor Component Tests (Story 6.4)
 * @module components/knowledge/__tests__/MetadataEditor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MetadataEditor } from '../MetadataEditor';
import type { SourceRecord } from '@/lib/state/dexie-db';
import type { SourceMetadataFields } from '@/lib/state/knowledge-store';

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('MetadataEditor (Story 6.4)', () => {
    const mockSource: SourceRecord = {
        id: 'source-1',
        projectId: 'test-project',
        type: 'text',
        title: 'Test Document',
        content: 'Test content',
        summary: 'Original summary',
        keyConcepts: ['Concept 1', 'Concept 2'],
        suggestedQuestions: ['Question 1?', 'Question 2?'],
        metadataExtracted: true,
        metadataEdited: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    const mockSourceWithoutMetadata: SourceRecord = {
        id: 'source-2',
        projectId: 'test-project',
        type: 'text',
        title: 'Test Document',
        content: 'Test content',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    let onSaveMock: ReturnType<typeof vi.fn>;
    let onCancelMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onSaveMock = vi.fn().mockResolvedValue(undefined);
        onCancelMock = vi.fn();
        vi.clearAllMocks();
    });

    it('should render with existing metadata', () => {
        render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        expect(screen.getByText('Edit Metadata')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Original summary')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Concept 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Concept 2')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Question 1?')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Question 2?')).toBeInTheDocument();
    });

    it('should render empty fields when source has no metadata', () => {
        render(
            <MetadataEditor
                source={mockSourceWithoutMetadata}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        expect(screen.getByText('Edit Metadata')).toBeInTheDocument();

        // Summary textarea should be empty
        const summaryTextarea = screen.getByPlaceholderText('Enter a 3-sentence summary...');
        expect(summaryTextarea).toHaveValue('');

        // Concept input should be empty
        const conceptInput = screen.getByPlaceholderText('Add a key concept...');
        expect(conceptInput).toHaveValue('');

        // Should show no questions message
        expect(screen.getByText('No suggested questions. Add one above.')).toBeInTheDocument();
    });

    it('should call onSave with updated metadata when save is clicked', async () => {
        render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        // Update summary
        const summaryTextarea = screen.getByPlaceholderText('Enter a 3-sentence summary...');
        fireEvent.change(summaryTextarea, { target: { value: 'Updated summary' } });

        // Click save button
        const saveButton = screen.getByLabelText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(onSaveMock).toHaveBeenCalledWith({
                summary: 'Updated summary',
                keyConcepts: ['Concept 1', 'Concept 2'],
                suggestedQuestions: ['Question 1?', 'Question 2?'],
            });
        });
    });

    it('should call onCancel when cancel is clicked', () => {
        render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        const cancelButton = screen.getByLabelText('Cancel');
        fireEvent.click(cancelButton);

        expect(onCancelMock).toHaveBeenCalled();
    });

    it('should add a new concept when typing and pressing Enter', () => {
        render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        const conceptInput = screen.getByPlaceholderText('Add a key concept...');
        fireEvent.change(conceptInput, { target: { value: 'New Concept' } });
        fireEvent.keyPress(conceptInput, { key: 'Enter', code: 'Enter' });

        // New concept should be visible
        expect(screen.getByText('New Concept')).toBeInTheDocument();
        // Input should be cleared
        expect(conceptInput).toHaveValue('');
    });

    it('should add a new concept when clicking the add button', () => {
        render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        const conceptInput = screen.getByPlaceholderText('Add a key concept...');
        fireEvent.change(conceptInput, { target: { value: 'New Concept' } });

        const addButton = screen.getByLabelText('Add concept');
        fireEvent.click(addButton);

        // New concept should be visible
        expect(screen.getByText('New Concept')).toBeInTheDocument();
    });

    it('should remove a concept when clicking remove button', () => {
        render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        // Find the remove button for "Concept 1"
        const removeButton = screen.getByLabelText('Remove Concept 1');
        fireEvent.click(removeButton);

        // Concept should no longer be visible
        expect(screen.queryByText('Concept 1')).not.toBeInTheDocument();
    });

    it('should remove a question when clicking remove button', () => {
        render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        // Find the remove button for first question
        const removeButtons = screen.getAllByLabelText(/Remove question/);
        fireEvent.click(removeButtons[0]);

        // Question should be removed (only one question left)
        expect(screen.queryByDisplayValue('Question 1?')).not.toBeInTheDocument();
    });

    it('should add a new question when clicking add question button', () => {
        render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        const addButton = screen.getByText('+ Add Question');
        fireEvent.click(addButton);

        // Should have 3 question inputs now
        const questionInputs = screen.getAllByPlaceholderText(/Question/);
        expect(questionInputs).toHaveLength(3);
    });

    it('should show character count for summary', () => {
        render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        expect(screen.getByText('16 / 500 characters')).toBeInTheDocument();
    });

    it('should validate summary length and show error', async () => {
        const { toast } = await import('sonner');

        render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        const summaryTextarea = screen.getByPlaceholderText('Enter a 3-sentence summary...');
        const longSummary = 'a'.repeat(501);

        fireEvent.change(summaryTextarea, { target: { value: longSummary } });

        const saveButton = screen.getByLabelText('Save');
        fireEvent.click(saveButton);

        // Should show toast error
        expect(toast.error).toHaveBeenCalledWith('Summary must be 500 characters or less');
        expect(onSaveMock).not.toHaveBeenCalled();
    });

    it('should validate concept length and show error', async () => {
        const { toast } = await import('sonner');

        render(
            <MetadataEditor
                source={mockSourceWithoutMetadata}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        const conceptInput = screen.getByPlaceholderText('Add a key concept...');
        const longConcept = 'a'.repeat(21);

        fireEvent.change(conceptInput, { target: { value: longConcept } });

        const addButton = screen.getByLabelText('Add concept');
        fireEvent.click(addButton);

        // Should show toast error
        expect(toast.error).toHaveBeenCalledWith('Concept must be 20 characters or less');
        expect(screen.queryByText(longConcept)).not.toBeInTheDocument();
    });

    it('should not allow duplicate concepts', async () => {
        const { toast } = await import('sonner');

        render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        const conceptInput = screen.getByPlaceholderText('Add a key concept...');
        fireEvent.change(conceptInput, { target: { value: 'Concept 1' } });

        const addButton = screen.getByLabelText('Add concept');
        fireEvent.click(addButton);

        // Should show toast error
        expect(toast.error).toHaveBeenCalledWith('Concept already exists');
    });

    it('should reset form when source changes', () => {
        const { rerender } = render(
            <MetadataEditor
                source={mockSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        // Modify the form
        const summaryTextarea = screen.getByPlaceholderText('Enter a 3-sentence summary...');
        fireEvent.change(summaryTextarea, { target: { value: 'Modified summary' } });

        // Change source
        const newSource: SourceRecord = {
            ...mockSource,
            id: 'source-2',
            summary: 'New source summary',
        };

        rerender(
            <MetadataEditor
                source={newSource}
                onSave={onSaveMock}
                onCancel={onCancelMock}
            />
        );

        // Should show new source's summary
        expect(screen.getByDisplayValue('New source summary')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('Modified summary')).not.toBeInTheDocument();
    });
});
