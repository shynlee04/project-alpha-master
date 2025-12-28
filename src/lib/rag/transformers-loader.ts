/**
 * @fileoverview Transformers.js Model Loader
 * @module lib/rag/transformers-loader
 *
 * Handles downloading, caching, and loading of local embedding models
 * using Transformers.js with WebGPU acceleration.
 *
 * Model: Xenova/all-MiniLM-L6-v2 (Q4 quantized, ~90MB, 384 dimensions)
 *
 * @story 7.3 - Embedding Service Integration
 */

import type { Pipeline } from '@xenova/transformers';

/**
 * Model download progress
 */
export interface DownloadProgress {
    /** Progress percentage (0-100) */
    progress: number;
    /** Current status message */
    status: string;
    /** Bytes downloaded so far */
    loaded: number;
    /** Total bytes to download */
    total: number;
}

/**
 * Model load result
 */
export interface ModelLoadResult {
    /** The loaded pipeline */
    pipeline: Pipeline;
    /** Time taken to load (ms) */
    loadTimeMs: number;
    /** Model size in bytes */
    modelSize: number;
}

/**
 * Model information stored in IndexedDB
 */
export interface CachedModelInfo {
    id: string;
    modelName: string;
    version: number;
    downloadedAt: number;
    lastUsedAt: number;
    modelSize: number;
}

/**
 * Transformers.js Model Loader
 */
export class TransformersLoader {
    /** Model name */
    private readonly modelName: string;
    /** IndexedDB name for this model */
    private readonly dbName: string;
    /** Current pipeline instance */
    private pipeline: Pipeline | null = null;
    /** Download progress callback */
    private onProgress?: (progress: DownloadProgress) => void;

    constructor(options: {
        modelName?: string;
        dbName?: string;
        onProgress?: (progress: DownloadProgress) => void;
    } = {}) {
        this.modelName = options.modelName || 'Xenova/all-MiniLM-L6-v2';
        this.dbName = options.dbName || 'ViaGentEmbeddings';
        this.onProgress = options.onProgress;
    }

    /**
     * Check if WebGPU is available
     */
    static async checkWebGPU(): Promise<boolean> {
        try {
            if (!navigator.gpu) return false;
            const adapter = await navigator.gpu.requestAdapter();
            return !!adapter;
        } catch {
            return false;
        }
    }

    /**
     * Check if model is cached in IndexedDB
     */
    async isModelCached(): Promise<boolean> {
        try {
            const db = await this.openDB();
            const info = await this.getModelInfo(db);
            return !!info;
        } catch {
            return false;
        }
    }

    /**
     * Get cached model info
     */
    async getCachedModelInfo(): Promise<CachedModelInfo | null> {
        try {
            const db = await this.openDB();
            return await this.getModelInfo(db);
        } catch {
            return null;
        }
    }

    /**
     * Download and load the model
     */
    async loadModel(): Promise<ModelLoadResult> {
        const startTime = performance.now();

        // Dynamic import of Transformers.js
        const transformers = await import('@xenova/transformers');

        // Report progress during download
        const progressHandler = (progress: number, status: string) => {
            this.onProgress?.({
                progress,
                status,
                loaded: 0,
                total: 0,
            });
        };

        // Load the model with progress tracking
        this.pipeline = await transformers.pipeline(
            'feature-extraction',
            this.modelName,
            {
                quantized: true, // Q4 quantized model (~90MB)
                progress_callback: progressHandler,
            }
        );

        const loadTimeMs = performance.now() - startTime;

        // Cache model info in IndexedDB
        await this.cacheModelInfo();

        // Get model size
        const modelSize = await this.getModelSize();

        return {
            pipeline: this.pipeline,
            loadTimeMs,
            modelSize,
        };
    }

    /**
     * Get the loaded pipeline (or load if not loaded)
     */
    async getPipeline(): Promise<Pipeline> {
        if (!this.pipeline) {
            await this.loadModel();
        }
        return this.pipeline!;
    }

    /**
     * Generate embedding for text
     */
    async generateEmbedding(text: string): Promise<Float32Array> {
        const pipeline = await this.getPipeline();

        const output = await pipeline(text, {
            pooling: 'mean',
            normalize: true,
        });

        return output.data as Float32Array;
    }

    /**
     * Generate embeddings for multiple texts
     */
    async generateBatchEmbeddings(
        texts: string[],
        options: { batchSize?: number } = {}
    ): Promise<Float32Array[]> {
        const pipeline = await this.getPipeline();
        const batchSize = options.batchSize || 32;
        const results: Float32Array[] = [];

        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (text) => {
                    const output = await pipeline(text, {
                        pooling: 'mean',
                        normalize: true,
                    });
                    return output.data as Float32Array;
                })
            );
            results.push(...batchResults);
        }

        return results;
    }

    /**
     * Unload the model to free memory
     */
    unloadModel(): void {
        if (this.pipeline) {
            // Transformers.js doesn't have explicit dispose, but we can clear references
            this.pipeline = null;
        }
    }

    /**
     * Delete cached model from IndexedDB
     */
    async deleteCachedModel(): Promise<void> {
        try {
            const db = await this.openDB();
            const tx = db.transaction('models', 'readwrite');
            const store = tx.objectStore('models');
            await new Promise<void>((resolve, reject) => {
                const request = store.delete('transformers-model-info');
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to delete cached model:', error);
        }
    }

    /**
     * Get model download size estimate
     */
    static getModelSizeEstimate(): { bytes: number; formatted: string } {
        // MiniLM-L6-v2 Q4 quantized is approximately 90MB
        const bytes = 90 * 1024 * 1024;
        return {
            bytes,
            formatted: '~90 MB',
        };
    }

    /**
     * Open IndexedDB
     */
    private async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('models')) {
                    db.createObjectStore('models', { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Get model info from IndexedDB
     */
    private async getModelInfo(db: IDBDatabase): Promise<CachedModelInfo | null> {
        return new Promise((resolve, reject) => {
            const tx = db.transaction('models', 'readonly');
            const store = tx.objectStore('models');
            const request = store.get('transformers-model-info');
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Cache model info in IndexedDB
     */
    private async cacheModelInfo(): Promise<void> {
        const db = await this.openDB();
        const sizeInfo = TransformersLoader.getModelSizeEstimate();

        const info: CachedModelInfo = {
            id: 'transformers-model-info',
            modelName: this.modelName,
            version: 1,
            downloadedAt: Date.now(),
            lastUsedAt: Date.now(),
            modelSize: sizeInfo.bytes,
        };

        const tx = db.transaction('models', 'readwrite');
        const store = tx.objectStore('models');
        await new Promise<void>((resolve, reject) => {
            const request = store.put(info);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get model size from cache
     */
    private async getModelSize(): Promise<number> {
        const info = await this.getCachedModelInfo();
        return info?.modelSize || TransformersLoader.getModelSizeEstimate().bytes;
    }
}

/**
 * Default singleton instance
 */
export const transformersLoader = new TransformersLoader({
    modelName: 'Xenova/all-MiniLM-L6-v2',
    onProgress: (progress) => {
        console.log(`[Transformers] Download progress: ${progress.progress}% - ${progress.status}`);
    },
});

/**
 * Check if local embeddings are supported on this device
 */
export async function checkLocalEmbeddingSupport(): Promise<{
    supported: boolean;
    reason?: string;
    hasWebGPU: boolean;
    isCached: boolean;
}> {
    const hasWebGPU = await TransformersLoader.checkWebGPU();
    const isCached = await transformersLoader.isModelCached();

    if (!hasWebGPU) {
        return {
            supported: false,
            reason: 'WebGPU is not available in this browser',
            hasWebGPU: false,
            isCached: false,
        };
    }

    return {
        supported: true,
        hasWebGPU: true,
        isCached,
    };
}
