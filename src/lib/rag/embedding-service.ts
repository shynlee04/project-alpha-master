/**
 * @fileoverview Hybrid Embedding Service
 * @module lib/rag/embedding-service
 *
 * Hybrid embedding service that uses local Transformers.js embeddings on desktop
 * with WebGPU, falling back to cloud API (gemini-embedding-001) on mobile or
 * edge environments.
 *
 * Cloudflare Edge-compatible: Only cloud embeddings work in edge runtime Local embeddings require.
 * desktop browser with WebGPU support.
 *
 * @story 7.3 - Embedding Service Integration (Hybrid Local/Cloud)
 * @iteration 15 - Added RAG progress events (EMBEDDING_PROGRESS)
 */

import { GEMINI_MODELS } from '../agent/providers/types';
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

/**
 * Embedding provider type
 */
export type EmbeddingProvider = 'local' | 'cloud' | 'none';

/**
 * Embedding configuration
 */
export interface EmbeddingConfig {
    /** Provider to use */
    provider: EmbeddingProvider;
    /** Cloud API key (required for cloud provider) */
    apiKey?: string;
    /** Local model name */
    localModel?: string;
    /** Batch size for embedding generation */
    batchSize?: number;
    /** Whether to show download prompt for local model */
    showDownloadPrompt?: boolean;
}

/**
 * Embedding result
 */
export interface EmbeddingResult {
    /** Embedding vector */
    embedding: number[];
    /** Provider used */
    provider: EmbeddingProvider;
    /** Time taken to generate (ms) */
    latencyMs: number;
}

/**
 * Batch embedding result
 */
export interface BatchEmbeddingResult {
    /** Results for each chunk */
    results: EmbeddingResult[];
    /** Total time taken (ms) */
    totalLatencyMs: number;
    /** Provider used */
    provider: EmbeddingProvider;
}

/**
 * Device capability detection result
 */
export interface DeviceCapabilities {
    /** Whether WebGPU is available */
    hasWebGPU: boolean;
    /** Whether running on desktop */
    isDesktop: boolean;
    /** Whether running on mobile */
    isMobile: boolean;
    /** Whether running in edge/SSR environment */
    isEdge: boolean;
    /** Whether local model is cached */
    localModelCached: boolean;
}

/**
 * Check if we're running in an edge/SSR environment
 */
function isEdgeEnvironment(): boolean {
    return typeof window === 'undefined';
}

/**
 * Detect device capabilities for embedding provider selection
 */
export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
    const isEdge = isEdgeEnvironment();

    // Edge environment: no local embeddings possible
    if (isEdge) {
        return {
            hasWebGPU: false,
            isDesktop: false,
            isMobile: false,
            isEdge: true,
            localModelCached: false,
        };
    }

    // Browser environment
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
    const isDesktop = !isMobile;

    // Check for WebGPU
    let hasWebGPU = false;
    try {
        if (navigator.gpu) {
            const adapter = await navigator.gpu.requestAdapter();
            hasWebGPU = !!adapter;
        }
    } catch {
        hasWebGPU = false;
    }

    // Check for cached local model
    const localModelCached = await checkLocalModelCache();

    return {
        hasWebGPU,
        isDesktop,
        isMobile,
        isEdge: false,
        localModelCached,
    };
}

/**
 * Check if local embedding model is cached in IndexedDB
 */
async function checkLocalModelCache(): Promise<boolean> {
    try {
        // Check IndexedDB for cached model
        const db = await openEmbeddingDB();
        const tx = db.transaction('models', 'readonly');
        const store = tx.objectStore('models');
        const modelInfo = await new Promise<{ version: number; downloadedAt: number } | undefined>((resolve, reject) => {
            const request = store.get('transformers-model-info');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        return !!modelInfo;
    } catch {
        return false;
    }
}

/**
 * Open IndexedDB for embedding model storage
 */
function openEmbeddingDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ViaGentEmbeddings', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('models')) {
                db.createObjectStore('models', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('embeddings')) {
                db.createObjectStore('embeddings', { keyPath: 'id' });
            }
        };
    });
}

/**
 * Select the best embedding provider based on device capabilities
 */
export function selectEmbeddingProvider(
    capabilities: DeviceCapabilities,
    hasApiKey: boolean
): EmbeddingProvider {
    // Edge environment: only cloud or none
    if (capabilities.isEdge) {
        return hasApiKey ? 'cloud' : 'none';
    }

    // Desktop with WebGPU and cached model -> use local
    if (capabilities.isDesktop && capabilities.hasWebGPU && capabilities.localModelCached) {
        return 'local';
    }

    // Desktop with WebGPU but no cached model -> ask user or use cloud
    if (capabilities.isDesktop && capabilities.hasWebGPU) {
        return hasApiKey ? 'cloud' : 'none';
    }

    // Mobile or no WebGPU with API key -> use cloud
    if (hasApiKey) {
        return 'cloud';
    }

    // No API key and no WebGPU -> BM25 only (no embeddings)
    return 'none';
}

/**
 * Generate a single embedding
 */
export async function generateEmbedding(
    text: string,
    config: EmbeddingConfig
): Promise<EmbeddingResult> {
    // const startTime = performance.now();

    if (config.provider === 'local') {
        return generateLocalEmbedding(text, config.localModel);
    } else if (config.provider === 'cloud') {
        return generateCloudEmbedding(text, config.apiKey);
    } else {
        throw new Error('No embedding provider available');
    }
}

/**
 * Generate embedding using local Transformers.js model
 * Only works in desktop browser with WebGPU
 */
async function generateLocalEmbedding(
    text: string,
    _modelName?: string
): Promise<EmbeddingResult> {
    const startTime = performance.now();

    // Guard: local embeddings only work in browser with WebGPU
    if (import.meta.env.SSR) {
        throw new Error('Local embeddings require a desktop browser with WebGPU support');
    }

    // Dynamic import of Transformers.js (only executed in supported environments)
    // Build-time check import.meta.env.SSR ensures this chunk is not generated for server
    const { pipeline } = await import('@xenova/transformers');

    // Use MiniLM model for embeddings
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true, // Use Q4 quantized model (~90MB)
    });

    // Generate embedding
    const output = await extractor(text, {
        pooling: 'mean',
        normalize: true,
    });

    const embedding = Array.from(output.data as Float32Array);
    const latencyMs = performance.now() - startTime;

    return {
        embedding,
        provider: 'local',
        latencyMs,
    };
}

/**
 * Generate embedding using cloud API (gemini-embedding-001)
 * Works in all environments including Cloudflare Edge
 */
async function generateCloudEmbedding(
    text: string,
    apiKey?: string
): Promise<EmbeddingResult> {
    const startTime = performance.now();

    if (!apiKey) {
        throw new Error('API key required for cloud embeddings');
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELS.embedding}:embedContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: {
                    parts: [{ text }],
                },
                model: GEMINI_MODELS.embedding,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
    }

    const data = await response.json();
    const embedding = data.embedding?.values || [];

    if (embedding.length === 0) {
        throw new Error('Empty embedding response');
    }

    const latencyMs = performance.now() - startTime;

    return {
        embedding,
        provider: 'cloud',
        latencyMs,
    };
}

/**
 * Generate embeddings for multiple texts in batch
 *
 * Iteration 15: Added progress event emissions for UI feedback
 */
export async function generateBatchEmbeddings(
    texts: string[],
    config: EmbeddingConfig
): Promise<BatchEmbeddingResult> {
    const startTime = performance.now();
    const batchSize = config.batchSize || 32;
    const total = texts.length;

    const results: EmbeddingResult[] = [];

    // Emit start event
    eventBus.emitRAGEmbeddingProgress({
        status: 'running',
        progress: 0,
        current: 0,
        total,
        message: `Starting embedding generation for ${total} texts...`
    });

    try {
        // Process in batches
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map((text) => generateEmbedding(text, config))
            );
            results.push(...batchResults);

            // Emit progress event after each batch
            const current = Math.min(i + batchSize, total);
            const progress = (current / total) * 100;

            eventBus.emitRAGEmbeddingProgress({
                status: 'running',
                progress: Math.round(progress),
                current,
                total,
                message: `Processing: ${current}/${total} texts embedded`
            });
        }

        // Emit completion event
        eventBus.emitRAGEmbeddingProgress({
            status: 'completed',
            progress: 100,
            current: total,
            total,
            message: 'All embeddings generated successfully'
        });

        return {
            results,
            totalLatencyMs: performance.now() - startTime,
            provider: config.provider,
        };
    } catch (error: unknown) {
        // Emit error event
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        eventBus.emitRAGEmbeddingProgress({
            status: 'error',
            progress: 0,
            current: results.length,
            total,
            message: 'Embedding generation failed',
            error: errorMessage
        });

        throw error;
    }
}

/**
 * Download and cache local embedding model
 * Only works in desktop browser with WebGPU
 */
export async function downloadLocalModel(): Promise<void> {
    // Guard: only works in supported browser environments
    if (import.meta.env.SSR) {
        throw new Error('Model download requires a desktop browser with WebGPU support');
    }

    // Dynamic import of Transformers.js
    const { pipeline } = await import('@xenova/transformers');

    // Pre-load the model to trigger download
    await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
    });

    // Save model info to IndexedDB
    const db = await openEmbeddingDB();
    const tx = db.transaction('models', 'readwrite');
    const store = tx.objectStore('models');
    store.put({
        id: 'transformers-model-info',
        version: 1,
        downloadedAt: Date.now(),
        modelName: 'Xenova/all-MiniLM-L6-v2',
    });
}

/**
 * Hybrid Embedding Service class
 */
export class EmbeddingService {
    private config: EmbeddingConfig;
    private capabilities: DeviceCapabilities;

    constructor(config: EmbeddingConfig) {
        this.config = config;
        this.capabilities = {
            hasWebGPU: false,
            isDesktop: true,
            isMobile: false,
            isEdge: false,
            localModelCached: false,
        };
    }

    /**
     * Initialize the embedding service
     */
    async initialize(): Promise<void> {
        this.capabilities = await detectDeviceCapabilities();

        // Auto-select provider if not configured
        if (this.config.provider === 'auto') {
            const hasApiKey = !!this.config.apiKey;
            this.config.provider = selectEmbeddingProvider(this.capabilities, hasApiKey);
        }
    }

    /**
     * Generate embedding for a single text
     */
    async embed(text: string): Promise<EmbeddingResult> {
        return generateEmbedding(text, this.config);
    }

    /**
     * Generate embeddings for multiple texts
     */
    async embedBatch(texts: string[]): Promise<BatchEmbeddingResult> {
        return generateBatchEmbeddings(texts, this.config);
    }

    /**
     * Get current provider
     */
    getProvider(): EmbeddingProvider {
        return this.config.provider;
    }

    /**
     * Get device capabilities
     */
    getCapabilities(): DeviceCapabilities {
        return this.capabilities;
    }

    /**
     * Check if local model needs to be downloaded
     */
    needsModelDownload(): boolean {
        return (
            this.capabilities.isDesktop &&
            this.capabilities.hasWebGPU &&
            !this.capabilities.localModelCached &&
            !this.capabilities.isEdge
        );
    }

    /**
     * Download local model
     */
    async downloadModel(): Promise<void> {
        await downloadLocalModel();
        this.capabilities.localModelCached = true;
    }

    /**
     * Get provider status message for UI
     */
    getStatusMessage(): string {
        switch (this.config.provider) {
            case 'local':
                return 'Using local embeddings (offline)';
            case 'cloud':
                return 'Using cloud embeddings';
            case 'none':
                return 'Semantic search unavailable - use keyword search';
            default:
                return 'Embedding provider not configured';
        }
    }
}

/**
 * Create embedding service with automatic provider selection
 */
export async function createEmbeddingService(
    apiKey?: string
): Promise<EmbeddingService> {
    const capabilities = await detectDeviceCapabilities();
    const provider = selectEmbeddingProvider(capabilities, !!apiKey);

    const service = new EmbeddingService({
        provider,
        apiKey,
        localModel: 'Xenova/all-MiniLM-L6-v2',
        batchSize: 32,
    });

    await service.initialize();
    return service;
}
