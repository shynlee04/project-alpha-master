/**
 * @fileoverview Knowledge Base Database Record Types
 * @module lib/state/dexie-db-knowledge-types
 * @governance EPIC-27-1c
 *
 * Knowledge base and note-taking record types for IndexedDB.
 * Extracted from dexie-db.ts for better code organization.
 *
 * Story 27-1: State Architecture Stabilization
 * Story 27-1c: Persistence Migration (idb → Dexie)
 */

import type { Table } from 'dexie';

// ============================================================================
// Epic 6: Source Ingestion & Management Tables
// ============================================================================

/**
 * Source record for knowledge base content
 * Stores imported PDF, URL, and text sources for RAG indexing.
 *
 * @epic Epic 6 - Source Ingestion & Management
 * @story 6-1 - Source Import Pipeline
 * @story 6-4 - Source Metadata Extraction
 */
export interface SourceRecord {
    id: string;                 // Primary key (UUID)
    projectId: string;          // Foreign key to project
    type: 'pdf' | 'url' | 'text';
    title: string;
    content: string;            // Extracted text content
    url?: string;               // For URL sources
    pageCount?: number;         // For PDF sources
    wordCount?: number;         // For PDF/URL sources
    charCount?: number;         // For text sources
    fileSize?: number;          // For PDF sources (bytes)
    collections?: string[];     // Collection IDs (Story 6-3)
    deleted?: boolean;          // Soft delete flag (Story 6-3)
    deletedAt?: number;         // Deletion timestamp (Story 6-3)
    // AI-generated metadata (Story 6-4)
    summary?: string;           // AI-generated 3-sentence summary
    keyConcepts?: string[];     // Array of 5 key concept tags
    suggestedQuestions?: string[]; // Array of 3 suggested questions
    metadataExtracted?: boolean; // Flag for AI analysis completion
    metadataEdited?: boolean;   // Flag for user corrections
    createdAt: number;
    updatedAt: number;
}

/**
 * Metadata for AI analysis (Story 6-4)
 */
export interface SourceMetadata {
    summary?: string;
    keyConcepts?: string[];
    authors?: string[];
    publishedDate?: string;
    readingTime?: string;
    language?: string;
}

/**
 * Collection record for organizing sources
 * Stores collections for grouping related sources.
 *
 * @epic Epic 6 - Source Ingestion & Management
 * @story 6-3 - Source Management
 */
export interface CollectionRecord {
    id: string;                 // Primary key (UUID)
    projectId: string;          // Foreign key to project
    name: string;               // Collection name
    sourceIds: string[];        // Sources in this collection
    createdAt: number;
    updatedAt: number;
}

// Type alias for backward compatibility
export type Collection = CollectionRecord;

/**
 * Synthesis result record for AI-generated summaries
 * Stores synthesis results from AI processing.
 *
 * @epic Epic 53 - State Management Consolidation
 * @story 53-2 - Move Dexie Helpers to Infrastructure
 */
export interface SynthesisResultRecord {
    id: string;
    sourceId: string;
    projectId: string;
    status: 'idle' | 'pending' | 'synthesizing' | 'completed' | 'failed';
    synthesisResult?: string;
    errorMessage?: string;
    frontmatter?: Record<string, unknown>;
    createdAt: number;
    updatedAt: number;
}

// ============================================================================
// Epic 7: RAG Infrastructure Tables
// ============================================================================

/**
 * Orama index record for IndexedDB storage
 * Stores serialized Orama index data as JSON.
 *
 * @epic Epic 7 - RAG Infrastructure
 * @story 7-1 - Orama Index Management
 */
export interface OramaIndexRecord {
    /** Primary key - project ID */
    projectId: string;

    /** Serialized Orama index data (JSON string) */
    data: string;

    /** Schema version for migration */
    schemaVersion: number;

    /** Number of documents in index */
    documentCount: number;

    /** Size of serialized data in bytes */
    size: number;

    /** Last updated timestamp */
    lastUpdated: number;
}

/**
 * Cached embedding model (Story 7-3)
 * Stores Transformers.js models in IndexedDB for offline semantic search
 */
export interface EmbeddingModelRecord {
    /** Primary key - unique identifier */
    id: string;

    /** Model identifier (e.g., 'Xenova/all-MiniLM-L6-v2') */
    modelId: string;

    /** Model name */
    name: string;

    /** Model version */
    version: string;

    /** Quantization (q4, q8, etc.) */
    quantization: string;

    /** Model binary data (Blob) */
    modelData: Blob;

    /** Model size in bytes */
    size: number;

    /** Download timestamp */
    downloadedAt: Date;
}

// ============================================================================
// Epic 26: Intelligent Knowledge Base (Notes)
// ============================================================================

/**
 * Note record for BlockNote editor persistence
 * Stores structured note content with hierarchical organization.
 *
 * @epic Epic 26 - Intelligent Knowledge Base
 * @story 26-1 - Integrated BlockNote Editor
 */
export interface NoteRecord {
    /** Primary key (UUID) */
    id: string;

    /** Foreign key to project */
    projectId: string;

    /** Note title (extracted from first heading or user-defined) */
    title: string;

    /** Optional emoji icon for the note */
    emoji?: string;

    /** BlockNote JSON block structure - stored as unknown[] for flexibility */
    blocks: unknown[];

    /** Parent note ID for nesting (undefined = root level) */
    parentId?: string;

    /** Whether note is starred/favorited */
    isFavorite: boolean;

    /** Sort order within parent (for drag-and-drop) */
    order: number;

    /** Whether note is indexed for RAG (Story 26-2) */
    isIndexed?: boolean;

    /** Last indexed timestamp (Story 26-2) */
    indexedAt?: number;

    /** Creation timestamp */
    createdAt: number;

    /** Last update timestamp */
    updatedAt: number;
}

// ============================================================================
// Table Type Exports
// ============================================================================

export type SourcesTable = Table<SourceRecord, string>;
export type CollectionsTable = Table<CollectionRecord, string>;
export type OramaIndexesTable = Table<OramaIndexRecord, string>;
export type EmbeddingModelsTable = Table<EmbeddingModelRecord, string>;
export type NotesTable = Table<NoteRecord, string>;
