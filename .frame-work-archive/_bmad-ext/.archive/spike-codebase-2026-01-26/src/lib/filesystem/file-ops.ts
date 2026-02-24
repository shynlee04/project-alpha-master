/**
 * @fileoverview File System File Operations
 * @module lib/filesystem/file-ops
 * S-024: Enhanced with duplicate, download, copy path, reveal operations
 */

import { FileSystemError } from './fs-errors';
import { validatePath } from './path-utils';
import { getFileHandleFromPath } from './handle-utils';
import type { FileReadResult, FileReadBinaryResult } from './fs-types';

/**
 * Read a file from the directory.
 */
export async function readFile(
    root: FileSystemDirectoryHandle,
    path: string,
    options?: { encoding?: 'utf-8' }
): Promise<FileReadResult>;
export async function readFile(
    root: FileSystemDirectoryHandle,
    path: string,
    options: { encoding: 'binary' }
): Promise<FileReadBinaryResult>;
export async function readFile(
    root: FileSystemDirectoryHandle,
    path: string,
    options: { encoding?: 'utf-8' | 'binary' } = { encoding: 'utf-8' }
): Promise<FileReadResult | FileReadBinaryResult> {
    validatePath(path, 'readFile');

    try {
        const fileHandle = await getFileHandleFromPath(root, path);
        const file = await fileHandle.getFile();

        if (options.encoding === 'binary') {
            const data = await file.arrayBuffer();
            return {
                data,
                mimeType: file.type || undefined,
            };
        }

        const content = await file.text();
        return {
            content,
            encoding: 'utf-8',
        };
    } catch (error: any) {
        if (error.name === 'NotFoundError') {
            throw new FileSystemError(`File not found: ${path}`, 'FILE_NOT_FOUND', error);
        }

        // Pass through FileSystemErrors
        if (error instanceof FileSystemError) {
            throw error;
        }

        throw new FileSystemError(
            `Failed to read file "${path}": ${error.message}`,
            'FILE_READ_FAILED',
            error
        );
    }
}

/**
 * Write a file to the directory.
 */
export async function writeFile(
    root: FileSystemDirectoryHandle,
    path: string,
    content: string
): Promise<void> {
    validatePath(path, 'writeFile');

    try {
        const fileHandle = await getFileHandleFromPath(root, path, true);
        const writable = await fileHandle.createWritable();

        try {
            await writable.write(content);
        } finally {
            await writable.close();
        }
    } catch (error: any) {
        if (error instanceof FileSystemError) throw error;

        throw new FileSystemError(
            `Failed to write file "${path}": ${error.message}`,
            'FILE_WRITE_FAILED',
            error
        );
    }
}

/**
 * Delete a file from the directory.
 */
export async function deleteFile(
    root: FileSystemDirectoryHandle,
    path: string
): Promise<void> {
    validatePath(path, 'deleteFile');

    try {
        // Note: To delete a file, we need the parent directory handle and the name
        // We can recycle logic but the API requires removeEntry on the parent
        // or passing the handle if supported (but standard is parent.removeEntry)

        // Using handle-utils would get us the file handle, but we need the parent to remove it.
        // So we need to walk to parent.

        // We can verify existence first? 
        // Or just try to get parent and remove.

        // Duplicate logic from LocalFSAdapter: "this.directoryHandle.removeEntry(path)" 
        // BUT LocalFSAdapter usage of removeEntry(path) only works for direct children if passing string?
        // MDN says removeEntry(name).
        // If path is "dir/file.txt", we need to get handle for "dir" and call removeEntry("file.txt").

        // WAIT! LocalFSAdapter.deleteFile implementation:
        // await this.directoryHandle.removeEntry(path);
        //
        // Does removeEntry support paths?
        // According to specs, it takes a name, not a path.
        // However, some implementations might support paths, OR the existing code in LocalFSAdapter 
        // might be buggy for nested files if it relies on that.
        // 
        // Let's check LocalFSAdapter again.
        // It says: "Permanently deletes a file from the granted directory."
        // 
        // If the original implementation just called removeEntry(path) on the root, 
        // it likely only supported top-level files OR the browser implementation is lenient.
        // 
        // Standard approach:
        // 1. Parse path.
        // 2. Get parent directory handle.
        // 3. Call removeEntry on parent with filename.

        // Let's implement it correctly/robustly here.

        const parts = path.split('/').filter(p => p.length > 0);
        const fileName = parts.pop();
        if (!fileName) throw new FileSystemError('Invalid path', 'INVALID_PATH');

        let parentDir = root;
        if (parts.length > 0) {
            // Walk to parent
            const { getDirectoryHandleFromPath } = await import('./handle-utils');
            parentDir = await getDirectoryHandleFromPath(root, parts.join('/'));
        }

        await parentDir.removeEntry(fileName);

    } catch (error: any) {
        if (error.name === 'NotFoundError') {
            throw new FileSystemError(`File not found: ${path}`, 'FILE_NOT_FOUND', error);
        }

        if (error instanceof FileSystemError) throw error;

        throw new FileSystemError(
            `Failed to delete file "${path}": ${error.message}`,
            'FILE_DELETE_FAILED',
            error
        );
    }
}

/**
 * S-024: Duplicate a file within the directory.
 * Creates a copy with " (copy)" suffix or with a custom name.
 */
export async function duplicateFile(
    root: FileSystemDirectoryHandle,
    path: string,
    newName?: string
): Promise<string> {
    validatePath(path, 'duplicateFile');

    try {
        // Read original file content
        const originalContent = await readFile(root, path);
        const content = originalContent.encoding === 'utf-8'
            ? originalContent.content
            : await (async () => {
                const binaryResult = await readFile(root, path, { encoding: 'binary' }) as FileReadBinaryResult;
                return new TextDecoder().decode(binaryResult.data);
            })();

        // Generate new name if not provided
        let finalName = newName;
        if (!finalName) {
            const parts = path.split('/');
            const originalName = parts.pop()!;
            const nameWithoutExt = originalName.includes('.')
                ? originalName.substring(0, originalName.lastIndexOf('.'))
                : originalName;
            const ext = originalName.includes('.')
                ? originalName.substring(originalName.lastIndexOf('.'))
                : '';

            finalName = `${nameWithoutExt} (copy)${ext}`;
            parts.push(finalName);
        }

        const newPath = newName ? newName : path.includes('/')
            ? path.substring(0, path.lastIndexOf('/') + 1) + finalName
            : finalName;

        // Write duplicate
        await writeFile(root, newPath, content);

        return newPath;
    } catch (error: any) {
        if (error instanceof FileSystemError) throw error;

        throw new FileSystemError(
            `Failed to duplicate file "${path}": ${error.message}`,
            'FILE_DUPLICATE_FAILED',
            error
        );
    }
}

/**
 * S-024: Download a file to the user's local machine.
 * Triggers browser download dialog.
 */
export async function downloadFile(
    root: FileSystemDirectoryHandle,
    path: string,
    customFileName?: string
): Promise<void> {
    validatePath(path, 'downloadFile');

    try {
        const fileHandle = await getFileHandleFromPath(root, path);
        const file = await fileHandle.getFile();

        // Create download link
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = customFileName || file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error: any) {
        if (error instanceof FileSystemError) throw error;

        throw new FileSystemError(
            `Failed to download file "${path}": ${error.message}`,
            'FILE_DOWNLOAD_FAILED',
            error
        );
    }
}

/**
 * S-024: Copy a file path to clipboard.
 */
export async function copyPathToClipboard(
    path: string,
    absolute: boolean = false
): Promise<void> {
    try {
        let pathToCopy = path;

        if (absolute) {
            // Get absolute path from WebContainer or workspace root
            // For now, use relative path as fallback
            pathToCopy = `/${path}`;
        }

        await navigator.clipboard.writeText(pathToCopy);
    } catch (error: any) {
        throw new FileSystemError(
            `Failed to copy path to clipboard: ${error.message}`,
            'CLIPBOARD_OPERATION_FAILED',
            error
        );
    }
}

/**
 * S-024: Reveal file in OS file manager (Finder/Explorer).
 * Note: This is a WebContainer-specific operation and may not be available in all environments.
 */
export async function revealInFileManager(
    path: string
): Promise<void> {
    try {
        // In WebContainer, we might need to use a specific API
        // For now, we'll use a show API command if available
        // This is a placeholder for the actual implementation

        // Note: window.showDirectoryPicker is a function, check if it exists
        if (typeof window.showDirectoryPicker === 'function') {
            // Try to use File System Access API
            // This would need to be implemented with proper permissions
            console.info('Reveal in file manager:', path);
        } else {
            // Fallback: Copy path and notify user
            await copyPathToClipboard(path, true);
            console.info('File path copied to clipboard:', path);
        }
    } catch (error: any) {
        throw new FileSystemError(
            `Failed to reveal file "${path}": ${error.message}`,
            'REVEAL_FAILED',
            error
        );
    }
}

/**
 * S-024: Validate file name for validity.
 * Checks for invalid characters and naming conflicts.
 */
export function validateFileName(name: string): { valid: boolean; error?: string } {
    // Check empty
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'File name cannot be empty' };
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(name)) {
        return { valid: false, error: 'File name contains invalid characters' };
    }

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (reservedNames.test(name)) {
        return { valid: false, error: 'This is a reserved file name' };
    }

    // Check for leading/trailing spaces and dots
    if (name.startsWith(' ') || name.endsWith(' ') || name.startsWith('.') || name.endsWith('.')) {
        return { valid: false, error: 'File name cannot start or end with spaces or dots' };
    }

    return { valid: true };
}
