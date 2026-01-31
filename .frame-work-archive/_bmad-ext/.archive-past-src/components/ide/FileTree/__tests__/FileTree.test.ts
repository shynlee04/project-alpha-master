/**
 * @fileoverview FileTree Component Tests
 * Tests for expanded state preservation and file tree behaviors
 */

import { describe, it, expect } from 'vitest';
import {
    restoreExpandedState,
    getAncestorPaths,
    buildTreeNode,
} from '../utils';
import type { TreeNode } from '../types';
import type { DirectoryEntry } from '../../../../lib/filesystem/local-fs-adapter';

// ============================================================================
// Test: restoreExpandedState
// ============================================================================

describe('restoreExpandedState', () => {
    it('should mark directories as expanded if in expandedPaths', () => {
        const nodes: TreeNode[] = [
            {
                name: 'src',
                path: 'src',
                type: 'directory',
                handle: {} as FileSystemHandle,
                expanded: false,
                children: [
                    {
                        name: 'components',
                        path: 'src/components',
                        type: 'directory',
                        handle: {} as FileSystemHandle,
                        expanded: false,
                    },
                    {
                        name: 'index.ts',
                        path: 'src/index.ts',
                        type: 'file',
                        handle: {} as FileSystemHandle,
                    },
                ],
            },
        ];

        const expandedPaths = new Set(['src', 'src/components']);
        const result = restoreExpandedState(nodes, expandedPaths);

        expect(result[0].expanded).toBe(true);
        expect(result[0].children![0].expanded).toBe(true);
        expect(result[0].children![1].expanded).toBe(false); // files don't expand
    });

    it('should not expand directories not in expandedPaths', () => {
        const nodes: TreeNode[] = [
            {
                name: 'lib',
                path: 'lib',
                type: 'directory',
                handle: {} as FileSystemHandle,
                expanded: false,
            },
        ];

        const expandedPaths = new Set(['src']);
        const result = restoreExpandedState(nodes, expandedPaths);

        expect(result[0].expanded).toBe(false);
    });

    it('should handle empty expandedPaths', () => {
        const nodes: TreeNode[] = [
            {
                name: 'src',
                path: 'src',
                type: 'directory',
                handle: {} as FileSystemHandle,
                expanded: true, // previously expanded
            },
        ];

        const expandedPaths = new Set<string>();
        const result = restoreExpandedState(nodes, expandedPaths);

        expect(result[0].expanded).toBe(false);
    });

    it('should handle deeply nested structures', () => {
        const nodes: TreeNode[] = [
            {
                name: 'a',
                path: 'a',
                type: 'directory',
                handle: {} as FileSystemHandle,
                children: [
                    {
                        name: 'b',
                        path: 'a/b',
                        type: 'directory',
                        handle: {} as FileSystemHandle,
                        children: [
                            {
                                name: 'c',
                                path: 'a/b/c',
                                type: 'directory',
                                handle: {} as FileSystemHandle,
                            },
                        ],
                    },
                ],
            },
        ];

        const expandedPaths = new Set(['a', 'a/b', 'a/b/c']);
        const result = restoreExpandedState(nodes, expandedPaths);

        expect(result[0].expanded).toBe(true);
        expect(result[0].children![0].expanded).toBe(true);
        expect(result[0].children![0].children![0].expanded).toBe(true);
    });
});

// ============================================================================
// Test: getAncestorPaths
// ============================================================================

describe('getAncestorPaths', () => {
    it('should return all ancestor paths for nested path', () => {
        const result = getAncestorPaths('src/components/Foo.tsx');
        expect(result).toEqual(['src', 'src/components']);
    });

    it('should return empty array for root-level path', () => {
        const result = getAncestorPaths('README.md');
        expect(result).toEqual([]);
    });

    it('should return single ancestor for first-level nested path', () => {
        const result = getAncestorPaths('src/index.ts');
        expect(result).toEqual(['src']);
    });

    it('should handle deeply nested paths', () => {
        const result = getAncestorPaths('a/b/c/d/e.txt');
        expect(result).toEqual(['a', 'a/b', 'a/b/c', 'a/b/c/d']);
    });
});

// ============================================================================
// Test: buildTreeNode
// ============================================================================

describe('buildTreeNode', () => {
    it('should build node with correct path for root-level entry', () => {
        const entry: DirectoryEntry = {
            name: 'package.json',
            type: 'file',
            handle: {} as FileSystemHandle,
        };

        const result = buildTreeNode(entry, '');
        expect(result.path).toBe('package.json');
        expect(result.name).toBe('package.json');
        expect(result.type).toBe('file');
        expect(result.expanded).toBe(false);
    });

    it('should build node with correct path for nested entry', () => {
        const entry: DirectoryEntry = {
            name: 'Button.tsx',
            type: 'file',
            handle: {} as FileSystemHandle,
        };

        const result = buildTreeNode(entry, 'src/components');
        expect(result.path).toBe('src/components/Button.tsx');
    });

    it('should build directory node with undefined children', () => {
        const entry: DirectoryEntry = {
            name: 'lib',
            type: 'directory',
            handle: {} as FileSystemHandle,
        };

        const result = buildTreeNode(entry, '');
        expect(result.type).toBe('directory');
        expect(result.children).toBeUndefined();
        expect(result.loading).toBe(false);
    });
});
