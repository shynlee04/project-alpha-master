
import { SourceRAGBridge } from './source-rag-bridge';
import EventEmitter from 'eventemitter3';
import { STORE_EVENTS } from '../events/store-events';

// Mocks
class MockDocumentChunker {
    chunkSource(source: any, options: any) {
        console.log('[MockChunker] Chunking source:', source.title);
        return {
            chunks: [
                { id: 'chunk-1', content: 'chunk 1 content', metadata: { sourceId: source.id } },
                { id: 'chunk-2', content: 'chunk 2 content', metadata: { sourceId: source.id } }
            ]
        };
    }
}

class MockEmbeddingService {
    async embedBatch(chunks: any[]) {
        console.log(`[MockEmbedder] Embedding ${chunks.length} chunks`);
        return chunks.map(chunk => ({
            ...chunk,
            embedding: new Float32Array([0.1, 0.2, 0.3])
        }));
    }
}

class MockOramaIndex {
    async indexBatch(chunks: any[]) {
        console.log(`[MockIndex] Indexing ${chunks.length} chunks`);
        chunks.forEach(c => console.log(`  - Indexed: ${c.id}`));
    }

    // minimal search imp
    async search() { return []; }
}

const runVerification = async () => {
    console.log('--- Starting SourceRAGBridge Verification ---');

    const eventBus = new EventEmitter();
    // Re-export specific mock event bus to capture events if needed, 
    // but for this test we inject it.

    const bridge = new SourceRAGBridge({
        documentChunker: new MockDocumentChunker() as any,
        embeddingService: new MockEmbeddingService() as any,
        oramaIndex: new MockOramaIndex() as any,
        eventBus: eventBus as any
    });

    bridge.start();

    // Simulate import
    const mockSource = {
        id: 'test-source-123',
        collectionId: 'project-alpha',
        title: 'Test Document',
        content: 'This is a test document content.',
        sourceType: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    console.log('Emitting SOURCE_IMPORTED event...');

    // We need to patch the subscribeStoreEvent in the actual bridge if it uses the global one,
    // OR we rely on the fact that SourceRAGBridge uses the injected eventBus.
    // Looking at SourceRAGBridge code:
    // It calls `subscribeStoreEvent` which imports `storeEvents` global!
    // It DOES NOT use `this.eventBus.on` for subscription in `start()`.

    // Wait, let's double check source-rag-bridge.ts content.
    // Line 101: `this.unsubscribe = subscribeStoreEvent(...)`
    // Line 18: `import { subscribeStoreEvent } from '../events/store-events';`

    // This means injecting `eventBus` into the constructor ONLY affects `emit`.
    // It does NOT affect where it LISTENS.
    // This is a flaw in SourceRAGBridge design if we want to unit test it easily without global state.
    // However, since we are running a script, we can import the REAL storeEvents and emit there.

    const { storeEvents } = await import('../events/store-events');

    // Wait for the async process to complete
    await new Promise<void>(resolve => {
        (eventBus as any).on('source:indexed', (result: any) => {
            console.log('SUCCESS: source:indexed event received!', result);
            resolve();
        });

        (eventBus as any).on('source:index-failed', (err: any) => {
            console.error('FAILURE: source:index-failed event received', err);
            resolve();
        });

        storeEvents.emit(STORE_EVENTS.SOURCE_IMPORTED, mockSource);
    });

    console.log('--- Verification Complete ---');
    process.exit(0);
};

runVerification().catch(console.error);
