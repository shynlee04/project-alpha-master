/**
 * @fileoverview Knowledge Module Exports
 * @module lib/knowledge
 */

export {
    PDFParser,
    pdfParser,
    type PDFParseResult,
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
    type SynthesisFrontmatter,
    type SynthesisResult,
    type SynthesisProgress,
    type SynthesisOptions,
    type SynthesisStatus,
    type SourceDocument,
    type SynthesizableSourceType,
} from './synthesis-service';

export {
    SynthesisFrontmatterSchema,
} from './synthesis-types';
