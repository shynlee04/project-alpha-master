/**
 * @fileoverview File Type Indicator Segment
 * @module components/ide/statusbar/FileTypeIndicator
 * 
 * @epic Epic-28 Story 28-18
 * 
 * Displays current file type/language based on file extension.
 */

import { useStatusBarStore } from '@/lib/state/statusbar-store';
import { StatusBarSegment } from './StatusBarSegment';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Map file extension to language display name
 */
function getLanguageFromType(fileType: string): string {
    const languageMap: Record<string, string> = {
        tsx: 'TypeScript React',
        ts: 'TypeScript',
        jsx: 'JavaScript React',
        js: 'JavaScript',
        json: 'JSON',
        md: 'Markdown',
        css: 'CSS',
        scss: 'SCSS',
        html: 'HTML',
        vue: 'Vue',
        svelte: 'Svelte',
        py: 'Python',
        rs: 'Rust',
        go: 'Go',
        yaml: 'YAML',
        yml: 'YAML',
        toml: 'TOML',
        xml: 'XML',
        sql: 'SQL',
        sh: 'Shell',
        bash: 'Bash',
        zsh: 'Zsh',
        fish: 'Fish',
        ps1: 'PowerShell',
        dockerfile: 'Dockerfile',
        gitignore: 'Git Ignore',
        env: 'Dotenv',
    };

    return languageMap[fileType.toLowerCase()] || fileType.toUpperCase() || 'Plain Text';
}

// ============================================================================
// Component
// ============================================================================

/**
 * FileTypeIndicator - Shows current file language
 * 
 * Displays language name based on file extension.
 */
export function FileTypeIndicator() {
    // Select individual primitives to avoid re-render loops
    const fileType = useStatusBarStore((s) => s.fileType);
    const encoding = useStatusBarStore((s) => s.encoding);

    if (!fileType) {
        return null;
    }

    return (
        <>
            <StatusBarSegment region="right" dividerLeft>
                <span>{encoding}</span>
            </StatusBarSegment>
            <StatusBarSegment region="right" dividerLeft>
                <span>{getLanguageFromType(fileType)}</span>
            </StatusBarSegment>
        </>
    );
}
