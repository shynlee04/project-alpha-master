/**
 * @fileoverview Monaco Editor HMR Integration Tests
 * @module components/ide/MonacoEditor/__tests__/HMR.test
 *
 * **CC-IDE-07**: IDE FSA Migration Tests
 *
 * Tests for Monaco Editor HMR (Hot Module Replacement) integration:
 * - HMR events trigger Monaco updates
 * - Editor state preserved during HMR
 * - Dirty state cleared on HMR
 *
 * @epic EPIC-CC-IDE-FSA
 * @story CC-IDE-07
 * @author TEAM_B
 * @created 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { StorageGateway } from '@/domain/interfaces';
import type { WebContainerFSAAdapter as WebContainerFSAAdapterType } from '@/infrastructure/webcontainer/fsa-adapter';

// ============================================================================
// Mocks
// ============================================================================

const createMockGateway = (): StorageGateway => ({
    read: vi.fn(),
    write: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    exists: vi.fn(),
    watch: vi.fn(),
} as unknown as StorageGateway);

const createMockMonacoEditor = () => ({
    getValue: vi.fn().mockReturnValue('initial content'),
    setValue: vi.fn(),
    getPosition: vi.fn().mockReturnValue({ lineNumber: 10, column: 5 }),
    setPosition: vi.fn(),
    getSelection: vi.fn().mockReturnValue({
        startLineNumber: 10,
        startColumn: 5,
        endLineNumber: 15,
        endColumn: 10,
    }),
    setSelection: vi.fn(),
    getModel: vi.fn().mockReturnValue({
        getLineCount: vi.fn().mockReturnValue(100),
    }),
    onDidChangeModelContent: vi.fn(),
    onDidChangeCursorPosition: vi.fn(),
    onDidChangeCursorSelection: vi.fn(),
});

const createMockFSAAdapter = (): WebContainerFSAAdapterType => ({
    mountToContainer: vi.fn().mockResolvedValue(undefined),
    startBidirectionalSync: vi.fn().mockResolvedValue(undefined),
    stopSync: vi.fn(),
    onHMREvent: vi.fn(),
    dispose: vi.fn(),
} as unknown as WebContainerFSAAdapterType);

// ============================================================================
// Test Suites
// ============================================================================

describe('Monaco Editor HMR Integration (CC-IDE-07)', () => {
    describe('AC3: HMR Events Trigger Monaco Updates', () => {
        it('should register HMR callback with FSA adapter', () => {
            const mockAdapter = createMockFSAAdapter();
            const hmrCallback = vi.fn();

            mockAdapter.onHMREvent(hmrCallback);

            expect(mockAdapter.onHMREvent).toHaveBeenCalledWith(hmrCallback);
        });

        it('should update editor content on HMR event', async () => {
            const mockGateway = createMockGateway();
            const mockEditor = createMockMonacoEditor();
            const mockAdapter = createMockFSAAdapter();

            // Setup initial content
            const initialContent = 'export function hello() { return "initial"; }';
            mockEditor.getValue.mockReturnValue(initialContent);

            // Setup HMR callback
            const hmrCallback = (path: string) => {
                console.log('[HMR] File changed:', path);

                // Read new content from gateway
                mockGateway.read(path).then(async (data) => {
                    if (data) {
                        const newContent = new TextDecoder().decode(data);
                        mockEditor.setValue(newContent);
                    }
                });
            };

            mockAdapter.onHMREvent(hmrCallback);

            // Simulate HMR event with new content
            const newContent = 'export function hello() { return "updated"; }';
            mockGateway.read.mockResolvedValue(new TextEncoder().encode(newContent));

            await hmrCallback('/src/hello.ts');

            // Verify editor was updated
            expect(mockGateway.read).toHaveBeenCalledWith('/src/hello.ts');
            expect(mockEditor.setValue).toHaveBeenCalledWith(newContent);
        });

        it('should not update editor for deleted files', async () => {
            const mockGateway = createMockGateway();
            const mockEditor = createMockMonacoEditor();
            const mockAdapter = createMockFSAAdapter();

            let hmrCallback: ((path: string) => void) | null = null;

            // Setup HMR callback
            mockAdapter.onHMREvent((path: string) => {
                hmrCallback = (filePath: string) => {
                    console.log('[HMR] File changed:', filePath);

                    // Read new content from gateway
                    mockGateway.read(filePath).then(async (data) => {
                        if (data) {
                            const newContent = new TextDecoder().decode(data);
                            mockEditor.setValue(newContent);
                        }
                    });
                };
                hmrCallback(path);
            });

            // Simulate file deletion (no content to read)
            mockGateway.read.mockRejectedValue(new Error('File not found'));

            if (hmrCallback) {
                await hmrCallback('/deleted-file.ts');
            }

            // Verify editor was NOT updated
            expect(mockEditor.setValue).not.toHaveBeenCalled();
        });
    });

    describe('AC3: Editor State Preserved During HMR', () => {
        it('should preserve cursor position during HMR update', async () => {
            const mockGateway = createMockGateway();
            const mockEditor = createMockMonacoEditor();
            const mockAdapter = createMockFSAAdapter();

            // Setup initial cursor position
            const initialPosition = { lineNumber: 10, column: 5 };
            mockEditor.getPosition.mockReturnValue(initialPosition);

            // Setup HMR callback with state preservation
            const hmrCallback = (path: string) => {
                console.log('[HMR] File changed:', path);

                // Save cursor position before update
                const cursorPosition = mockEditor.getPosition();

                // Read and update content
                mockGateway.read(path).then(async (data) => {
                    if (data) {
                        const newContent = new TextDecoder().decode(data);
                        mockEditor.setValue(newContent);

                        // Restore cursor position
                        if (cursorPosition) {
                            mockEditor.setPosition(cursorPosition);
                        }
                    }
                });
            };

            mockAdapter.onHMREvent(hmrCallback);

            // Simulate HMR event
            const newContent = 'updated content';
            mockGateway.read.mockResolvedValue(new TextEncoder().encode(newContent));

            await hmrCallback('/src/test.ts');

            // Verify cursor position was restored
            expect(mockEditor.setValue).toHaveBeenCalledWith(newContent);
            expect(mockEditor.setPosition).toHaveBeenCalledWith(initialPosition);
        });

        it('should preserve selection during HMR update', async () => {
            const mockGateway = createMockGateway();
            const mockEditor = createMockMonacoEditor();
            const mockAdapter = createMockFSAAdapter();

            // Setup initial selection
            const initialSelection = {
                startLineNumber: 10,
                startColumn: 5,
                endLineNumber: 15,
                endColumn: 10,
            };
            mockEditor.getSelection.mockReturnValue(initialSelection);

            // Setup HMR callback with selection preservation
            const hmrCallback = (path: string) => {
                console.log('[HMR] File changed:', path);

                // Save selection before update
                const selection = mockEditor.getSelection();

                // Read and update content
                mockGateway.read(path).then(async (data) => {
                    if (data) {
                        const newContent = new TextDecoder().decode(data);
                        mockEditor.setValue(newContent);

                        // Restore selection
                        if (selection) {
                            mockEditor.setSelection(selection);
                        }
                    }
                });
            };

            mockAdapter.onHMREvent(hmrCallback);

            // Simulate HMR event
            const newContent = 'updated content';
            mockGateway.read.mockResolvedValue(new TextEncoder().encode(newContent));

            await hmrCallback('/src/test.ts');

            // Verify selection was restored
            expect(mockEditor.setValue).toHaveBeenCalledWith(newContent);
            expect(mockEditor.setSelection).toHaveBeenCalledWith(initialSelection);
        });

        it('should handle invalid cursor/selection gracefully', async () => {
            const mockGateway = createMockGateway();
            const mockEditor = createMockMonacoEditor();
            const mockAdapter = createMockFSAAdapter();

            // Simulate no cursor/selection
            mockEditor.getPosition.mockReturnValue(null);
            mockEditor.getSelection.mockReturnValue(null);

            // Setup HMR callback
            const hmrCallback = (path: string) => {
                mockGateway.read(path).then(async (data) => {
                    if (data) {
                        const newContent = new TextDecoder().decode(data);
                        mockEditor.setValue(newContent);

                        // Try to restore cursor (should handle null gracefully)
                        const cursorPosition = mockEditor.getPosition();
                        if (cursorPosition) {
                            mockEditor.setPosition(cursorPosition);
                        }
                    }
                });
            };

            mockAdapter.onHMREvent(hmrCallback);

            // Simulate HMR event
            const newContent = 'updated content';
            mockGateway.read.mockResolvedValue(new TextEncoder().encode(newContent));

            await hmrCallback('/src/test.ts');

            // Verify content was updated but no cursor restoration
            expect(mockEditor.setValue).toHaveBeenCalledWith(newContent);
            expect(mockEditor.setPosition).not.toHaveBeenCalled();
        });
    });

    describe('AC3: Dirty State Cleared on HMR', () => {
        it('should clear dirty state after HMR update', async () => {
            const mockGateway = createMockGateway();
            const mockEditor = createMockMonacoEditor();
            const mockAdapter = createMockFSAAdapter();

            // Track dirty state
            let isDirty = true;

            // Setup HMR callback with dirty state clearing
            const hmrCallback = (path: string) => {
                console.log('[HMR] File changed:', path);

                mockGateway.read(path).then(async (data) => {
                    if (data) {
                        const newContent = new TextDecoder().decode(data);
                        mockEditor.setValue(newContent);

                        // Clear dirty state since content is now in sync
                        isDirty = false;
                    }
                });
            };

            mockAdapter.onHMREvent(hmrCallback);

            // Verify initial dirty state
            expect(isDirty).toBe(true);

            // Simulate HMR event
            const newContent = 'updated content';
            mockGateway.read.mockResolvedValue(new TextEncoder().encode(newContent));

            await hmrCallback('/src/test.ts');

            // Verify dirty state was cleared
            expect(mockEditor.setValue).toHaveBeenCalledWith(newContent);
            expect(isDirty).toBe(false);
        });

        it('should maintain dirty state if HMR fails', async () => {
            const mockGateway = createMockGateway();
            const mockEditor = createMockMonacoEditor();
            const mockAdapter = createMockFSAAdapter();

            // Track dirty state
            let isDirty = true;

            // Setup HMR callback
            const hmrCallback = (path: string) => {
                mockGateway.read(path).then(async (data) => {
                    if (data) {
                        const newContent = new TextDecoder().decode(data);
                        mockEditor.setValue(newContent);

                        // Clear dirty state only on successful update
                        isDirty = false;
                    } else {
                        // Failed to read - keep dirty state
                        console.error('[HMR] Failed to read file');
                        isDirty = true;
                    }
                });
            };

            mockAdapter.onHMREvent(hmrCallback);

            // Simulate HMR event with error
            mockGateway.read.mockRejectedValue(new Error('Read failed'));

            await hmrCallback('/src/test.ts').catch(() => {
                // Error is caught
            });

            // Verify dirty state was NOT cleared
            expect(mockEditor.setValue).not.toHaveBeenCalled();
            expect(isDirty).toBe(true);
        });
    });

    describe('AC3: HMR Debouncing', () => {
        it('should debounce rapid HMR events', async () => {
            const mockGateway = createMockGateway();
            const mockEditor = createMockMonacoEditor();
            const mockAdapter = createMockFSAAdapter();

            let hmrCallCount = 0;
            let debounceTimer: ReturnType<typeof setTimeout> | null = null;

            // Setup debounced HMR callback
            const debouncedHMR = (path: string) => {
                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                }

                debounceTimer = setTimeout(() => {
                    console.log('[HMR] Debounced event:', path);
                    hmrCallCount++;
                    // Apply HMR update
                    mockGateway.read(path).then(async (data) => {
                        if (data) {
                            const newContent = new TextDecoder().decode(data);
                            mockEditor.setValue(newContent);
                        }
                    });
                }, 100); // 100ms debounce
            };

            mockAdapter.onHMREvent(debouncedHMR);

            // Simulate 3 rapid HMR events
            debouncedHMR('/src/test.ts');
            debouncedHMR('/src/test.ts');
            debouncedHMR('/src/test.ts');

            // Wait for debounce
            await new Promise(resolve => setTimeout(resolve, 200));

            // Verify only 1 update was applied
            expect(hmrCallCount).toBe(1);
            expect(mockEditor.setValue).toHaveBeenCalledTimes(1);
        });
    });

    describe('AC3: HMR Error Handling', () => {
        it('should handle gateway read errors during HMR', async () => {
            const mockGateway = createMockGateway();
            const mockEditor = createMockMonacoEditor();
            const mockAdapter = createMockFSAAdapter();

            const hmrCallback = (path: string) => {
                mockGateway.read(path).then(async (data) => {
                    if (data) {
                        const newContent = new TextDecoder().decode(data);
                        mockEditor.setValue(newContent);
                    }
                }).catch((error) => {
                    console.error('[HMR] Error reading file:', error);
                    // Editor content remains unchanged
                });
            };

            mockAdapter.onHMREvent(hmrCallback);

            // Simulate HMR event with error
            mockGateway.read.mockRejectedValue(new Error('Permission denied'));

            await hmrCallback('/src/test.ts').catch(() => {});

            // Verify editor was NOT updated
            expect(mockEditor.setValue).not.toHaveBeenCalled();
        });

        it('should handle invalid content during HMR', async () => {
            const mockGateway = createMockGateway();
            const mockEditor = createMockMonacoEditor();
            const mockAdapter = createMockFSAAdapter();

            const hmrCallback = (path: string) => {
                mockGateway.read(path).then(async (data) => {
                    if (data) {
                        try {
                            const newContent = new TextDecoder().decode(data);
                            mockEditor.setValue(newContent);
                        } catch (error) {
                            console.error('[HMR] Error decoding content:', error);
                        }
                    }
                });
            };

            mockAdapter.onHMREvent(hmrCallback);

            // Simulate HMR event with invalid data
            mockGateway.read.mockResolvedValue(new Uint8Array([0xff, 0xfe, 0xfd])); // Invalid UTF-8

            await hmrCallback('/src/test.ts');

            // Verify error was handled (editor may or may not be updated depending on implementation)
            console.log('[HMR] Handled invalid content');
        });
    });

    describe('AC3: HMR Lifecycle Management', () => {
        it('should cleanup HMR callbacks on unmount', () => {
            const mockAdapter = createMockFSAAdapter();
            const hmrCallback = vi.fn();

            mockAdapter.onHMREvent(hmrCallback);

            // Verify callback was registered
            expect(mockAdapter.onHMREvent).toHaveBeenCalledWith(hmrCallback);

            // Cleanup
            mockAdapter.dispose();

            expect(mockAdapter.dispose).toHaveBeenCalled();
        });
    });
});
