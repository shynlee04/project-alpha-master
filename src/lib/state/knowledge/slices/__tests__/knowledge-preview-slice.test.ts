/**
 * @fileoverview Knowledge Preview Slice Tests
 * @module lib/state/knowledge/slices/__tests__/knowledge-preview-slice.test.ts
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1148
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestKnowledgeStore } from '../../__tests__/test-store';
import type { SourceRecord, KnowledgeStoreState } from '../../types';

describe('knowledge-preview-slice', () => {
    let store: KnowledgeStoreState;
    const mockSource: SourceRecord = {
        id: 'source-1',
        projectId: 'project-1',
        type: 'pdf',
        title: 'Test PDF',
        content: 'Test content',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    beforeEach(() => {
        store = createTestKnowledgeStore();
    });

    describe('openPreview', () => {
        it('should select source and open preview', () => {
            store.openPreview(mockSource);

            expect(store.selectedSource).toEqual(mockSource);
            expect(store.isPreviewOpen).toBe(true);
        });

        it('should replace existing selected source', () => {
            const previousSource: SourceRecord = { ...mockSource, id: 'source-2' };
            store.selectedSource = previousSource;

            store.openPreview(mockSource);

            expect(store.selectedSource).toEqual(mockSource);
            expect(store.isPreviewOpen).toBe(true);
        });

        it('should set isPreviewOpen to true when already open', () => {
            store.isPreviewOpen = true;
            store.selectedSource = previousSource;

            store.openPreview(mockSource);

            expect(store.isPreviewOpen).toBe(true);
            expect(store.selectedSource).toEqual(mockSource);
        });
    });

    describe('closePreview', () => {
        it('should close preview and clear selected source', () => {
            store.selectedSource = mockSource;
            store.isPreviewOpen = true;

            store.closePreview();

            expect(store.isPreviewOpen).toBe(false);
            expect(store.selectedSource).toBe(null);
        });

        it('should handle closing when preview already closed', () => {
            store.isPreviewOpen = false;
            store.selectedSource = null;

            store.closePreview();

            expect(store.isPreviewOpen).toBe(false);
            expect(store.selectedSource).toBe(null);
        });

        it('should handle closing when no source selected', () => {
            store.selectedSource = null;
            store.isPreviewOpen = true;

            store.closePreview();

            expect(store.isPreviewOpen).toBe(false);
            expect(store.selectedSource).toBe(null);
        });
    });
});
