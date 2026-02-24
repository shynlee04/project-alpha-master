import type { DirectoryEntry } from './fs-types';
import type { LocalFSAdapter } from './local-fs-adapter';

export interface WalkDirectoryEntry extends DirectoryEntry {
    path: string;
}

// Re-export walkDirectorySegments for backward compatibility
export { walkDirectorySegments } from './fs-handle-utils';

export async function* walkDirectory(
    adapter: Pick<LocalFSAdapter, 'listDirectory'>,
    path: string,
    options: {
        recursive?: boolean;
        skipDirectory?: (entry: { path: string; name: string }) => boolean;
    } = {}
): AsyncGenerator<WalkDirectoryEntry> {
    const recursive = options.recursive ?? true;

    const entries: DirectoryEntry[] = await adapter.listDirectory(path);
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
        const entryPath = path ? `${path}/${entry.name}` : entry.name;
        yield { ...entry, path: entryPath };

        if (entry.type === 'directory') {
            if (recursive && (!options.skipDirectory || !options.skipDirectory({ path: entryPath, name: entry.name }))) {
                yield* walkDirectory(adapter, entryPath, options);
            }
        }
    }
}
