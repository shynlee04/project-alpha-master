/**
 * @fileoverview Embedding Model Cache (IndexedDB)
 * @module lib/rag/embedding-cache
 * @governance EPIC-7-3
 *
 * Caches Transformers.js embedding models in IndexedDB for offline use.
 * Handles model storage, retrieval, and quota management.
 */

import { db } from '@/infrastructure/persistence/dexie-db';
// import type { EmbeddingModelRecord } from '@/infrastructure/persistence/dexie-db';
import type { EmbeddingModelMetadata } from './types';

/**
 * Result of model cache operation
 */
export interface CacheResult {
  success: boolean;
  cached?: boolean;
  error?: string;
}

/**
 * Embedding model cache service
 *
 * Manages storage and retrieval of embedding models in IndexedDB.
 * Handles quota exceeded errors and model validation.
 */
export class EmbeddingCache {
  /**
   * Check if model is cached
   *
   * @param modelId - Model identifier (e.g., 'Xenova/all-MiniLM-L6-v2')
   * @returns true if model is cached
   */
  async hasModel(modelId: string): Promise<boolean> {
    try {
      const count = await db.embedding_models.where('modelId').equals(modelId).count();
      return count > 0;
    } catch (error) {
      console.error('[EmbeddingCache] Error checking model:', error);
      return false;
    }
  }

  /**
   * Get cached model data
   *
   * @param modelId - Model identifier
   * @returns Model blob or undefined if not cached
   */
  async getModel(modelId: string): Promise<Blob | undefined> {
    try {
      const record = await db.embedding_models.where('modelId').equals(modelId).first();
      return record?.modelData;
    } catch (error) {
      console.error('[EmbeddingCache] Error getting model:', error);
      return undefined;
    }
  }

  /**
   * Get model metadata
   *
   * @param modelId - Model identifier
   * @returns Model metadata or undefined if not cached
   */
  async getMetadata(modelId: string): Promise<EmbeddingModelMetadata | undefined> {
    try {
      const record = await db.embedding_models.where('modelId').equals(modelId).first();
      if (!record) return undefined;

      return {
        modelId: record.modelId,
        name: record.name,
        version: record.version,
        quantization: record.quantization,
        size: record.size,
        downloadedAt: record.downloadedAt.getTime(),
      };
    } catch (error) {
      console.error('[EmbeddingCache] Error getting metadata:', error);
      return undefined;
    }
  }

  /**
   * Save model to cache
   *
   * @param modelId - Model identifier
   * @param modelData - Model binary data
   * @param metadata - Model metadata
   * @returns Cache result
   */
  async saveModel(
    modelId: string,
    modelData: Blob,
    metadata: EmbeddingModelMetadata
  ): Promise<CacheResult> {
    try {
      // Check if model already exists
      const existing = await db.embedding_models.where('modelId').equals(modelId).first();
      if (existing) {
        console.log('[EmbeddingCache] Model already cached, updating:', modelId);
        await db.embedding_models.delete(existing.id);
      }

      // Save model
      await db.embedding_models.add({
        id: crypto.randomUUID(),
        modelId,
        name: metadata.name,
        version: metadata.version,
        quantization: metadata.quantization,
        modelData,
        size: metadata.size,
        downloadedAt: new Date(metadata.downloadedAt),
      });

      console.log(
        `[EmbeddingCache] Model cached: ${modelId} (${(metadata.size / 1024 / 1024).toFixed(2)}MB)`
      );

      return { success: true, cached: true };
    } catch (error) {
      // Check for quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('[EmbeddingCache] Storage quota exceeded');
        return {
          success: false,
          cached: false,
          error: 'Storage quota exceeded. Please free up space or use cloud embeddings.',
        };
      }

      console.error('[EmbeddingCache] Error saving model:', error);
      return {
        success: false,
        cached: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete model from cache
   *
   * @param modelId - Model identifier
   * @returns true if deleted, false if not found
   */
  async deleteModel(modelId: string): Promise<boolean> {
    try {
      const record = await db.embedding_models.where('modelId').equals(modelId).first();
      if (!record) return false;

      await db.embedding_models.delete(record.id);
      console.log('[EmbeddingCache] Model deleted:', modelId);
      return true;
    } catch (error) {
      console.error('[EmbeddingCache] Error deleting model:', error);
      return false;
    }
  }

  /**
   * List all cached models
   *
   * @returns Array of model metadata
   */
  async listModels(): Promise<EmbeddingModelMetadata[]> {
    try {
      const records = await db.embedding_models.toArray();
      return records.map((record) => ({
        modelId: record.modelId,
        name: record.name,
        version: record.version,
        quantization: record.quantization,
        size: record.size,
        downloadedAt: record.downloadedAt.getTime(),
      }));
    } catch (error) {
      console.error('[EmbeddingCache] Error listing models:', error);
      return [];
    }
  }

  /**
   * Get total cache size in bytes
   *
   * @returns Total size of all cached models
   */
  async getTotalCacheSize(): Promise<number> {
    try {
      const models = await db.embedding_models.toArray();
      return models.reduce((sum, model) => sum + model.size, 0);
    } catch (error) {
      console.error('[EmbeddingCache] Error calculating cache size:', error);
      return 0;
    }
  }

  /**
   * Clear all cached models
   *
   * @returns Number of models deleted
   */
  async clearAll(): Promise<number> {
    try {
      const count = await db.embedding_models.count();
      await db.embedding_models.clear();
      console.log(`[EmbeddingCache] Cleared ${count} models`);
      return count;
    } catch (error) {
      console.error('[EmbeddingCache] Error clearing cache:', error);
      return 0;
    }
  }
}

/**
 * Singleton instance for convenience
 */
export const embeddingCache = new EmbeddingCache();
