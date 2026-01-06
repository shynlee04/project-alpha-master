/**
 * @fileoverview Code Snippets Database Types
 * @module infrastructure/persistence/dexie-db-snippet-types
 * @governance S-031
 * @ai-observable true
 *
 * Code snippet types for Dexie database.
 * Supports code snippet management with folders, tags, and placeholders.
 *
 * Story S-031: Code Snippets Manager
 */

import type { Table } from 'dexie';

// ============================================================================
// Snippet Record Types
// ============================================================================

/**
 * Code snippet record for reusable code fragments
 *
 * Features:
 * - Variable placeholders with ${1:variableName} syntax
 * - Tab stops for navigation between variables
 * - Folder organization
 * - Tag-based categorization
 * - Language-specific syntax highlighting
 * - Shortcut-triggered auto-expansion
 *
 * @ai-observable Snippets can be shared across workspaces
 */
export interface CodeSnippetRecord {
    /** Primary key */
    id: string;

    /** Snippet name (unique within folder) */
    name: string;

    /** Optional description */
    description?: string;

    /** Programming language (typescript, javascript, python, etc.) */
    language: string;

    /** Code content with ${1:variableName} placeholders */
    code: string;

    /** Tags for categorization and search */
    tags: string[];

    /** Folder path for organization (e.g., "react/hooks", "utilities") */
    folder: string;

    /** Keyboard shortcut for auto-expansion (e.g., "useeffect", "usememo") */
    shortcut?: string;

    /** Creation timestamp */
    createdAt: number;

    /** Last update timestamp */
    updatedAt: number;

    /** Whether this is a built-in template (read-only) */
    isBuiltIn: boolean;
}

// ============================================================================
// Table Types
// ============================================================================

/**
 * Code snippets table type
 */
export type CodeSnippetsTable = Table<CodeSnippetRecord, string>;

// ============================================================================
// Snippet Insertion Types
// ============================================================================

/**
 * Parsed placeholder from snippet code
 * Format: ${1:variableName} or ${variableName}
 */
export interface SnippetPlaceholder {
    /** Tab stop order (0 is final cursor position) */
    tabStop: number;

    /** Placeholder variable name */
    variableName: string;

    /** Default value */
    defaultValue: string;

    /** Start position in code */
    startPos: number;

    /** End position in code */
    endPos: number;
}

/**
 * Inserted snippet with tab stop positions
 */
export interface InsertedSnippet {
    /** Processed code with placeholders */
    code: string;

    /** Tab stops in order of navigation */
    tabStops: SnippetPlaceholder[];

    /** Final cursor position */
    finalPosition: number;
}

// ============================================================================
// Snippet Template Types
// ============================================================================

/**
 * Built-in snippet template definition
 */
export interface SnippetTemplate {
    name: string;
    description?: string;
    language: string;
    code: string;
    tags: string[];
    folder: string;
    shortcut?: string;
}

// ============================================================================
// Export Collections
// ============================================================================
