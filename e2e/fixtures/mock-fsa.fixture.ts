/**
 * Mock File System Access API Fixture
 * Provides mock FSA functionality for testing file sync
 * 
 * @module e2e/fixtures/mock-fsa.fixture
 */

import { test as base, expect } from '@playwright/test';

/**
 * Mock file in virtual file system
 */
export interface MockFile {
    name: string;
    path: string;
    content: string;
    lastModified: number;
    type: 'file' | 'directory';
}

/**
 * Mock directory handle for testing
 */
export interface MockDirectoryHandle {
    name: string;
    files: Map<string, MockFile>;
}

/**
 * Extended test fixture with FSA mocking
 */
export const test = base.extend<{
    mockFSA: {
        createDirectory: (name: string, files?: MockFile[]) => MockDirectoryHandle;
        addFile: (handle: MockDirectoryHandle, file: MockFile) => void;
        modifyFile: (handle: MockDirectoryHandle, path: string, content: string) => void;
        deleteFile: (handle: MockDirectoryHandle, path: string) => void;
        getFile: (handle: MockDirectoryHandle, path: string) => MockFile | undefined;
        listFiles: (handle: MockDirectoryHandle) => MockFile[];
        injectIntoPage: (page: any, handle: MockDirectoryHandle) => Promise<void>;
    };
}>({
    mockFSA: async ({ page }, use) => {
        const fsaMock = {
            /**
             * Create a mock directory with optional initial files
             */
            createDirectory: (name: string, files: MockFile[] = []): MockDirectoryHandle => {
                const handle: MockDirectoryHandle = {
                    name,
                    files: new Map(),
                };

                files.forEach(file => {
                    handle.files.set(file.path, file);
                });

                return handle;
            },

            /**
             * Add a file to the mock directory
             */
            addFile: (handle: MockDirectoryHandle, file: MockFile): void => {
                handle.files.set(file.path, file);
            },

            /**
             * Modify a file in the mock directory
             */
            modifyFile: (handle: MockDirectoryHandle, path: string, content: string): void => {
                const file = handle.files.get(path);
                if (file) {
                    file.content = content;
                    file.lastModified = Date.now();
                }
            },

            /**
             * Delete a file from the mock directory
             */
            deleteFile: (handle: MockDirectoryHandle, path: string): void => {
                handle.files.delete(path);
            },

            /**
             * Get a file from the mock directory
             */
            getFile: (handle: MockDirectoryHandle, path: string): MockFile | undefined => {
                return handle.files.get(path);
            },

            /**
             * List all files in the mock directory
             */
            listFiles: (handle: MockDirectoryHandle): MockFile[] => {
                return Array.from(handle.files.values());
            },

            /**
             * Inject mock FSA into the page context
             */
            injectIntoPage: async (page: any, handle: MockDirectoryHandle): Promise<void> => {
                await page.addInitScript((serializedFiles: any) => {
                    // Override showDirectoryPicker
                    (window as any).showDirectoryPicker = async () => {
                        console.log('[MockFSA] showDirectoryPicker called');
                        return {
                            name: serializedFiles.name,
                            kind: 'directory',
                            async *entries() {
                                for (const file of serializedFiles.files) {
                                    yield [file.name, {
                                        kind: file.type,
                                        name: file.name,
                                        async getFile() {
                                            return new File([file.content], file.name, {
                                                lastModified: file.lastModified,
                                            });
                                        },
                                    }];
                                }
                            },
                            async getFileHandle(name: string) {
                                const file = serializedFiles.files.find((f: any) => f.name === name);
                                if (!file) throw new Error('File not found');
                                return {
                                    kind: 'file',
                                    name: file.name,
                                    async getFile() {
                                        return new File([file.content], file.name, {
                                            lastModified: file.lastModified,
                                        });
                                    },
                                    async createWritable() {
                                        return {
                                            async write(content: string) {
                                                console.log('[MockFSA] Write:', name, content);
                                            },
                                            async close() { },
                                        };
                                    },
                                };
                            },
                        };
                    };
                }, {
                    name: handle.name,
                    files: Array.from(handle.files.values()),
                });
            },
        };

        await use(fsaMock);
    },
});

export { expect };

/**
 * Helper to create a standard set of test markdown files
 */
export function createTestMarkdownFiles(count: number = 5): MockFile[] {
    return Array.from({ length: count }, (_, i) => ({
        name: `test-note-${i + 1}.md`,
        path: `test-note-${i + 1}.md`,
        content: `# Test Note ${i + 1}\n\nThis is test content for note ${i + 1}.`,
        lastModified: Date.now() - i * 1000,
        type: 'file' as const,
    }));
}

/**
 * Helper to create a large set of test files for stress testing
 */
export function createLargeTestFileSet(count: number = 100): MockFile[] {
    return Array.from({ length: count }, (_, i) => ({
        name: `large-test-${i + 1}.md`,
        path: `large-test-${i + 1}.md`,
        content: `# Large Test ${i + 1}\n\n${'Lorem ipsum dolor sit amet. '.repeat(100)}`,
        lastModified: Date.now() - i * 100,
        type: 'file' as const,
    }));
}
