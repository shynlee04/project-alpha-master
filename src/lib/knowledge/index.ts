/**
 * @fileoverview Knowledge Module Exports
 * @module lib/knowledge
 */

export {
    usePdfParser,
    parsePDF,
    isPdfParsingAvailable,
    isPDF,
    getFileSizeMB,
    usePdfParserWithOptions,
    parsePDFWithOptions,
    type PDFParseResult,
    type PDFParseOptions,
    type PDFProgressCallback,
} from './pdf-parser';

export {
    URLFetcher,
    urlFetcher,
    type URLFetchResult,
} from './url-fetcher';

export {
    SourceImportPipeline,
    sourceImportPipeline,
    type SourceType,
    type SourceImportOptions,
} from './source-import';

export {
    MetadataExtractor,
    metadataExtractor,
    type ExtractedMetadata,
} from './metadata-extractor';

export {
    SourceRAGBridge,
    createSourceRAGBridge,
    type SourceIndexingStatus,
    type SourceIndexingResult,
    type SourceRAGBridgeConfig,
} from './source-rag-bridge';

export {
    SynthesisService,
    createSynthesisService,
} from './synthesis-service';

// Re-export synthesis types
export type {
    SynthesisProgress,
    SynthesisStatus,
    SourceDocument,
    SynthesizableSourceType,
    ArtifactType,
    SynthesisFrontmatter,
    SynthesisResult,
    SynthesisOptions,
} from './synthesis-types';

export {
    SynthesisFrontmatterSchema,
} from './synthesis-types';

export {
    KnowledgeGraphService,
    createKnowledgeGraphService,
} from './knowledge-graph';

export type {
    GraphNode,
    GraphEdge,
    GraphCluster,
    GraphPath,
    GraphQueryResult,
    GraphStatistics,
    KnowledgeGraph,
    NodeCreationOptions,
    EdgeCreationOptions,
    TraversalOptions,
    ClusterDetectionOptions,
    GraphQueryOptions,
} from './knowledge-graph-types';

export {
    SubjectClassifier,
    createSubjectClassifier,
} from './subject-classifier';

export type {
    SubjectCategory,
    ClassificationResult,
    ClassificationOptions,
    SourceData,
    SubjectStatistics,
} from './subject-classifier';

export {
    RelevancyScorer,
    createRelevancyScorer,
} from './relevancy-scorer';

export type {
    RelevancyScore,
    ScorableDocument,
    ScoringOptions,
    RelatedDocument,
} from './relevancy-scorer';

export {
    OrganizationEngine,
    createOrganizationEngine,
} from './organization-engine';

export type {
    OrganizationType,
    OrganizationRecommendation,
    OrganizedDocument,
    OrganizationResult,
    VaultAnalysis,
    OrganizationOptions,
} from './organization-engine';
