/**
 * @fileoverview Knowledge Store Combined Types
 * @module infrastructure/persistence/stores/knowledge/knowledge-types
 * @governance EPIC-6-3, EPIC-6-4
 *
 * Type definitions for knowledge workspace state management.
 * Split into 5 focused slices following December 2025 Zustand patterns.
 */

// ============================================================================
// Domain Entities
// ============================================================================

/**
 * Source metadata fields (editable by user)
 * Used for metadata editing UI components
 */
export interface SourceMetadataFields {
  /** AI-generated summary (editable) */
  summary?: string;
  /** Key concepts extracted by AI (editable) */
  keyConcepts?: string[];
  /** Suggested questions for learning (editable) */
  suggestedQuestions?: string[];
}

/**
 * Knowledge source (document, PDF, URL, text, image)
 */
export interface KnowledgeSource {
  /** Unique source identifier */
  id: string;
  /** Associated project identifier */
  projectId: string;
  /** Source title */
  title: string;
  /** Source type */
  type: 'pdf' | 'url' | 'text' | 'image';
  /** Source content */
  content: string;
  /** Word count (text sources) */
  wordCount?: number;
  /** Character count */
  charCount?: number;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Last opened timestamp */
  lastOpened?: Date;
  /** Soft delete flag */
  deleted?: boolean;

  // Story 6-4: AI-generated metadata
  /** AI-generated summary */
  summary?: string;
  /** Key concepts extracted by AI */
  keyConcepts?: string[];
  /** Suggested questions for learning */
  suggestedQuestions?: string[];

  // Processing status
  /** Current processing status */
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  /** Processing error message */
  processingError?: string;
}

/**
 * Knowledge collection (groups sources for organization)
 */
export interface KnowledgeCollection {
  /** Unique collection identifier */
  id: string;
  /** Associated project identifier */
  projectId: string;
  /** Collection name */
  name: string;
  /** Optional description */
  description?: string;
  /** Optional color for UI */
  color?: string;
  /** Source IDs in this collection */
  sourceIds: string[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Synthesis result (AI-generated study materials)
 */
export interface SynthesisResult {
  /** Unique synthesis identifier */
  id: string;
  /** Source ID that was synthesized */
  sourceId: string;
  /** Associated project identifier */
  projectId: string;
  /** Synthesis status */
  status: 'pending' | 'generating' | 'completed' | 'failed';
  /** Generated frontmatter */
  frontmatter?: {
    summary: string;
    keyPoints: string[];
    tags: string[];
  };
  /** Error message if failed */
  error?: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

// ============================================================================
// Input Types
// ============================================================================

export interface CreateSourceInput {
  projectId: string;
  title: string;
  type: KnowledgeSource['type'];
  content: string;
  wordCount?: number;
  charCount?: number;
}

export interface UpdateSourceInput {
  title?: string;
  content?: string;
  summary?: string;
  keyConcepts?: string[];
  suggestedQuestions?: string[];
  processingStatus?: KnowledgeSource['processingStatus'];
  processingError?: string;
}

// ============================================================================
// State Interfaces (per slice)
// ============================================================================

/**
 * Source management state and actions
 */
export interface KnowledgeSourcesState {
  /** All sources indexed by ID */
  sources: Record<string, KnowledgeSource>;
  /** Currently selected source ID */
  selectedSourceId: string | null;
  /** Undo queue for deleted sources */
  undoQueue: Array<{
    sourceId: string;
    source: KnowledgeSource;
    timestamp: number;
  }>;

  // Actions
  createSource: (input: CreateSourceInput) => string;
  updateSource: (sourceId: string, updates: UpdateSourceInput) => void;
  deleteSource: (sourceId: string) => void;
  selectSource: (sourceId: string | null) => void;
  undoDelete: (sourceId: string) => void;
  getSource: (sourceId: string) => KnowledgeSource | undefined;
  getAllSources: () => KnowledgeSource[];
  getSelectedSource: () => KnowledgeSource | null;
  renameSource: (sourceId: string, newName: string) => Promise<void>;
  loadSources: (projectId: string) => Promise<void>;
}

/**
 * Collection management state and actions
 */
export interface KnowledgeCollectionsState {
  /** All collections indexed by ID */
  collections: Record<string, KnowledgeCollection>;
  /** Currently filtered collection ID (null = show all) */
  filteredCollectionId: string | null;

  // Actions
  createCollection: (name: string, projectId: string) => string;
  updateCollection: (collectionId: string, updates: Partial<Omit<KnowledgeCollection, 'id' | 'createdAt'>>) => void;
  deleteCollection: (collectionId: string) => void;
  addSourceToCollection: (sourceId: string, collectionId: string) => void;
  removeSourceFromCollection: (sourceId: string, collectionId: string) => void;
  filterByCollection: (collectionId: string | null) => void;
  getCollection: (collectionId: string) => KnowledgeCollection | undefined;
  getAllCollections: () => KnowledgeCollection[];
  getFilteredSources: (sources: Record<string, KnowledgeSource>) => KnowledgeSource[];
}

/**
 * Metadata extraction state and actions
 */
export interface KnowledgeMetadataState {
  /** Source IDs currently being extracted */
  extractingMetadata: Set<string>;

  // Actions
  extractMetadata: (sourceId: string) => Promise<void>;
  updateMetadata: (sourceId: string, metadata: UpdateSourceInput) => Promise<void>;
  updateProcessingStatus: (sourceId: string, status: KnowledgeSource['processingStatus'], error?: string) => void;
}

/**
 * Synthesis operations state and actions
 */
export interface KnowledgeSynthesisState {
  /** Source IDs currently being synthesized */
  synthesizingSources: Set<string>;
  /** Synthesis results indexed by source ID */
  synthesisResults: Record<string, SynthesisResult>;

  // Actions
  synthesizeSource: (sourceId: string) => Promise<void>;
  getSynthesisResult: (sourceId: string) => SynthesisResult | undefined;
  loadSynthesisResult: (sourceId: string) => Promise<void>;
}

/**
 * UI state management
 */
export interface KnowledgeUIState {
  /** Whether preview panel is open */
  isPreviewOpen: boolean;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Hydration flag */
  _hasHydrated?: boolean;

  // Actions
  openPreview: () => void;
  closePreview: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
