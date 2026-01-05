import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoteFolderBridge } from '../note-folder-bridge';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import type { NoteSyncStore } from '../notes-file-sync-core';

// Mock dependencies
const mockLocalAdapter = {
    listDirectory: vi.fn(),
    readFile: vi.fn(),
} as unknown as LocalFSAdapter;

const mockNoteStore = {
    notes: new Map(),
    notesArray: [],
    updateNote: vi.fn(),
    createNote: vi.fn(),
} as unknown as NoteSyncStore;

describe('NoteFolderBridge', () => {
    let bridge: NoteFolderBridge;

    beforeEach(() => {
        vi.clearAllMocks();
        bridge = new NoteFolderBridge(mockLocalAdapter, mockNoteStore);
    });

    it('should import markdown files from root directory', async () => {
        // Mock directory listing
        (mockLocalAdapter.listDirectory as any).mockResolvedValueOnce([
            { name: 'note1.md', type: 'file' },
            { name: 'image.png', type: 'file' },
            { name: 'subfolder', type: 'directory' },
        ]);

        // Mock empty subfolder for simplicity in this test
        (mockLocalAdapter.listDirectory as any).mockResolvedValueOnce([]);

        // Mock file reading
        (mockLocalAdapter.readFile as any).mockResolvedValue({
            content: '# Note 1\nContent'
        });

        await bridge.importDirectory();

        // Should list root
        expect(mockLocalAdapter.listDirectory).toHaveBeenCalledWith('');
        
        // Should list subfolder
        expect(mockLocalAdapter.listDirectory).toHaveBeenCalledWith('subfolder');

        // Should read markdown file
        expect(mockLocalAdapter.readFile).toHaveBeenCalledWith('note1.md');

        // Should NOT read image file
        expect(mockLocalAdapter.readFile).not.toHaveBeenCalledWith('image.png');

        // Should create note
        expect(mockNoteStore.createNote).toHaveBeenCalled();
    });

    it('should handle recursive directory structure', async () => {
        // Root: folder1
        (mockLocalAdapter.listDirectory as any).mockImplementation(async (path: string) => {
            if (path === '') return [{ name: 'folder1', type: 'directory' }];
            if (path === 'folder1') return [{ name: 'note2.md', type: 'file' }];
            return [];
        });

        (mockLocalAdapter.readFile as any).mockResolvedValue({
            content: '# Note 2\nContent'
        });

        await bridge.importDirectory();

        expect(mockLocalAdapter.readFile).toHaveBeenCalledWith('folder1/note2.md');
        expect(mockNoteStore.createNote).toHaveBeenCalled();
    });
});
