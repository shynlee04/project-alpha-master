/**
 * @fileoverview Source Import Dialog Tests
 * @module components/knowledge/__tests__/SourceImportDialog.test
 * @governance EPIC-6-1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SourceImportDialog } from '../SourceImportDialog';

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

    it('should render PDF input by default', () => {
        render(<SourceImportDialog {...defaultProps} />);
        expect(screen.getByLabelText('PDF File')).toBeInTheDocument();
        expect(screen.getByText('Import Source')).toBeInTheDocument();
    });
});
