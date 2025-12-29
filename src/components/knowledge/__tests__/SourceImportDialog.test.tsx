/**
 * @fileoverview Source Import Dialog Tests
 * @module components/knowledge/__tests__/SourceImportDialog.test
 * @governance EPIC-6-1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SourceImportDialog } from '../SourceImportDialog';
import { sourceImportPipeline } from '@/lib/knowledge/source-import';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/knowledge/source-import', () => ({
    sourceImportPipeline: {
        importPDF: vi.fn(),
        importURL: vi.fn(),
        importText: vi.fn(),
    },
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultValue?: string) => defaultValue || key,
    }),
}));

describe('SourceImportDialog', () => {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        projectId: 'test-project',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render dialog when open', () => {
        render(<SourceImportDialog {...defaultProps} />);
        expect(screen.getByText('Import Source')).toBeInTheDocument();
        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText('URL')).toBeInTheDocument();
        expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should handle URL import', async () => {
        render(<SourceImportDialog {...defaultProps} />);

        // Switch to URL tab
        fireEvent.click(screen.getByText('URL'));

        // Enter URL
        const input = screen.getByPlaceholderText('https://example.com/article');
        await userEvent.type(input, 'https://example.com/test');

        // Click import
        const button = screen.getAllByText('Start Extraction')[0]; // Using index because button text might duplicate
        fireEvent.click(button);

        await waitFor(() => {
            expect(sourceImportPipeline.importURL).toHaveBeenCalledWith(
                'https://example.com/test',
                expect.objectContaining({ projectId: 'test-project' })
            );
        });

        expect(toast.success).toHaveBeenCalled();
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should handle Text import', async () => {
        render(<SourceImportDialog {...defaultProps} />);

        // Switch to Text tab
        fireEvent.click(screen.getByText('Text'));

        // Enter content
        await userEvent.type(screen.getByPlaceholderText('My Note'), 'Test Title');
        await userEvent.type(screen.getByPlaceholderText('Paste or type content here...'), 'Test Content');

        // Click import
        const button = screen.getAllByText('Save Note')[0];
        fireEvent.click(button);

        await waitFor(() => {
            expect(sourceImportPipeline.importText).toHaveBeenCalledWith(
                'Test Title',
                'Test Content',
                expect.objectContaining({ projectId: 'test-project' })
            );
        });

        expect(toast.success).toHaveBeenCalled();
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should display error on failure', async () => {
        const error = new Error('Network error');
        vi.mocked(sourceImportPipeline.importURL).mockRejectedValue(error);

        render(<SourceImportDialog {...defaultProps} />);

        // Switch to URL tab
        fireEvent.click(screen.getByText('URL'));

        // Enter URL
        await userEvent.type(screen.getByPlaceholderText('https://example.com/article'), 'https://example.com/fail');

        // Click import
        const button = screen.getAllByText('Start Extraction')[0];
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });

        expect(toast.error).toHaveBeenCalled();
        expect(defaultProps.onOpenChange).not.toHaveBeenCalledWith(false);
    });
});
