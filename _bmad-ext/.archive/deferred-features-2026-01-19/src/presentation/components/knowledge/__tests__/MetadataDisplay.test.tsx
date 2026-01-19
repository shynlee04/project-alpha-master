/**
 * @fileoverview Metadata Display Component Tests (Story 6.4)
 * @module components/knowledge/__tests__/MetadataDisplay
 */

import { render, screen } from '@testing-library/react';
import { MetadataDisplay } from '../MetadataDisplay';
import type { SourceRecord } from '@/infrastructure/persistence/dexie-db';

describe('MetadataDisplay (Story 6.4)', () => {
    const mockSourceWithMetadata: SourceRecord = {
        id: 'source-1',
        projectId: 'test-project',
        type: 'text',
        title: 'Test Document',
        content: 'Test content',
        summary: 'This is a three-sentence summary. It captures the main themes. And highlights key insights.',
        keyConcepts: ['Machine Learning', 'Neural Networks', 'Data Science', 'AI', 'Algorithms'],
        suggestedQuestions: [
            'What is the main topic?',
            'How are neural networks used?',
            'What are the key algorithms?',
        ],
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

    const mockSourceAnalyzing: SourceRecord = {
        ...mockSourceWithoutMetadata,
        metadataExtracted: false,
    };

    it('should not render when source has no metadata and is not analyzing', () => {
        const { container } = render(
            <MetadataDisplay source={mockSourceWithoutMetadata} />
        );

        expect(container.firstChild).toBeNull();
    });

    it('should render AI-analyzed badge when metadata is extracted', () => {
        render(<MetadataDisplay source={mockSourceWithMetadata} />);

        expect(screen.getByText('AI-analyzed')).toBeInTheDocument();
        expect(screen.getByText(/✨/)).toBeInTheDocument();
    });

    it('should render summary when available', () => {
        render(<MetadataDisplay source={mockSourceWithMetadata} />);

        expect(screen.getByText('Summary')).toBeInTheDocument();
        expect(screen.getByText(/This is a three-sentence summary/)).toBeInTheDocument();
    });

    it('should render all key concepts as tags', () => {
        render(<MetadataDisplay source={mockSourceWithMetadata} />);

        expect(screen.getByText('Key Concepts')).toBeInTheDocument();
        expect(screen.getByText('Machine Learning')).toBeInTheDocument();
        expect(screen.getByText('Neural Networks')).toBeInTheDocument();
        expect(screen.getByText('Data Science')).toBeInTheDocument();
        expect(screen.getByText('AI')).toBeInTheDocument();
        expect(screen.getByText('Algorithms')).toBeInTheDocument();
    });

    it('should render all suggested questions', () => {
        render(<MetadataDisplay source={mockSourceWithMetadata} />);

        expect(screen.getByText('Suggested Questions')).toBeInTheDocument();
        expect(screen.getByText('What is the main topic?')).toBeInTheDocument();
        expect(screen.getByText('How are neural networks used?')).toBeInTheDocument();
        expect(screen.getByText('What are the key algorithms?')).toBeInTheDocument();
    });

    it('should render loading skeleton when analyzing', () => {
        render(<MetadataDisplay source={mockSourceAnalyzing} />);

        expect(screen.getByText('Analyzing with AI...')).toBeInTheDocument();
    });

    it('should render only summary when other fields are missing', () => {
        const sourceWithOnlySummary: SourceRecord = {
            ...mockSourceWithoutMetadata,
            summary: 'Just a summary',
        };

        const { container } = render(
            <MetadataDisplay source={sourceWithOnlySummary} />
        );

        expect(screen.getByText('Summary')).toBeInTheDocument();
        expect(screen.getByText('Just a summary')).toBeInTheDocument();
        expect(screen.queryByText('Key Concepts')).not.toBeInTheDocument();
        expect(screen.queryByText('Suggested Questions')).not.toBeInTheDocument();
    });

    it('should render only key concepts when other fields are missing', () => {
        const sourceWithOnlyConcepts: SourceRecord = {
            ...mockSourceWithoutMetadata,
            keyConcepts: ['Concept 1', 'Concept 2'],
        };

        const { container } = render(
            <MetadataDisplay source={sourceWithOnlyConcepts} />
        );

        expect(screen.getByText('Key Concepts')).toBeInTheDocument();
        expect(screen.getByText('Concept 1')).toBeInTheDocument();
        expect(screen.getByText('Concept 2')).toBeInTheDocument();
        expect(screen.queryByText('Summary')).not.toBeInTheDocument();
        expect(screen.queryByText('Suggested Questions')).not.toBeInTheDocument();
    });

    it('should render only suggested questions when other fields are missing', () => {
        const sourceWithOnlyQuestions: SourceRecord = {
            ...mockSourceWithoutMetadata,
            suggestedQuestions: ['Question 1?', 'Question 2?'],
        };

        const { container } = render(
            <MetadataDisplay source={sourceWithOnlyQuestions} />
        );

        expect(screen.getByText('Suggested Questions')).toBeInTheDocument();
        expect(screen.getByText('Question 1?')).toBeInTheDocument();
        expect(screen.getByText('Question 2?')).toBeInTheDocument();
        expect(screen.queryByText('Summary')).not.toBeInTheDocument();
        expect(screen.queryByText('Key Concepts')).not.toBeInTheDocument();
    });

    it('should not render empty sections', () => {
        const sourceWithEmptyArrays: SourceRecord = {
            ...mockSourceWithoutMetadata,
            summary: '',
            keyConcepts: [],
            suggestedQuestions: [],
        };

        const { container } = render(
            <MetadataDisplay source={sourceWithEmptyArrays} />
        );

        expect(container.firstChild).toBeNull();
    });
});
