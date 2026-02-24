/**
 * @fileoverview Knowledge Source Store
 * @module infrastructure/sync/workspace-services/knowledge-sync/knowledge-source-store
 *
 * In-memory source storage for Knowledge workspace.
 *
 * @story ARCH-01.1.4
 */

import type { SourceRecord } from '@/infrastructure/persistence/dexie-db-types';

/**
 * In-memory source storage (simplified implementation)
 * In production, this would use IndexedDB via the knowledge store
 */
export class KnowledgeSourceStore {
    private sources = new Map<string, SourceRecord>();

    async get(path: string): Promise<SourceRecord | undefined> {
        return this.sources.get(path);
    }

    async set(path: string, source: SourceRecord): Promise<void> {
        this.sources.set(path, source);
    }

    async delete(path: string): Promise<void> {
        this.sources.delete(path);
    }

    async list(): Promise<SourceRecord[]> {
        return Array.from(this.sources.values());
    }

    async clear(): Promise<void> {
        this.sources.clear();
    }

    has(path: string): boolean {
        return this.sources.has(path);
    }

    get size(): number {
        return this.sources.size;
    }
}
