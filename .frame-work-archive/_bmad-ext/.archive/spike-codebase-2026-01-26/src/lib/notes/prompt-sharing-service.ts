/**
 * @fileoverview Prompt Sharing Service - Export/Import/Share utilities
 * @module lib/notes/prompt-sharing-service
 * @story 43-07: Prompt Sharing/Export
 * @created 2026-01-12
 * 
 * Provides utilities for sharing prompts via various methods:
 * - Export single command or multiple commands as JSON
 * - Generate shareable links (base64 encoded)
 * - Copy to clipboard in various formats
 * - Import from clipboard or shareable links
 */

import type { CustomSlashCommand } from './slash-command-store';

// ============================================================================
// Types
// ============================================================================

export interface ShareableCommand {
    /** Version for forward compatibility */
    v: number;
    /** Command data (single) */
    cmd?: Omit<CustomSlashCommand, 'id' | 'createdAt' | 'updatedAt' | 'isEnabled'>;
    /** Commands data (multiple) */
    cmds?: Omit<CustomSlashCommand, 'id' | 'createdAt' | 'updatedAt' | 'isEnabled'>[];
    /** Metadata */
    meta?: {
        exportedAt: number;
        source?: string;
        description?: string;
    };
}

export type ShareFormat = 'json' | 'markdown' | 'text' | 'link';

export interface ShareOptions {
    format: ShareFormat;
    includeMetadata?: boolean;
    source?: string;
}

export interface ImportResult {
    success: boolean;
    commands: CustomSlashCommand[];
    error?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SHARE_VERSION = 1;
const SHARE_PREFIX = 'viagen://prompt/';

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Prepare a command for sharing (remove internal fields)
 */
function prepareForShare(
    command: CustomSlashCommand
): Omit<CustomSlashCommand, 'id' | 'createdAt' | 'updatedAt' | 'isEnabled'> {
    const { id, createdAt, updatedAt, isEnabled, ...shareableFields } = command;
    return shareableFields;
}

/**
 * Export a single command as JSON string
 */
export function exportCommandAsJson(
    command: CustomSlashCommand,
    options?: { pretty?: boolean; includeMetadata?: boolean }
): string {
    const shareable: ShareableCommand = {
        v: SHARE_VERSION,
        cmd: prepareForShare(command),
    };
    
    if (options?.includeMetadata) {
        shareable.meta = {
            exportedAt: Date.now(),
            source: 'ViaGent Notes',
        };
    }
    
    return options?.pretty
        ? JSON.stringify(shareable, null, 2)
        : JSON.stringify(shareable);
}

/**
 * Export multiple commands as JSON string
 */
export function exportCommandsAsJson(
    commands: CustomSlashCommand[],
    options?: { pretty?: boolean; includeMetadata?: boolean; description?: string }
): string {
    const shareable: ShareableCommand = {
        v: SHARE_VERSION,
        cmds: commands.map(prepareForShare),
    };
    
    if (options?.includeMetadata) {
        shareable.meta = {
            exportedAt: Date.now(),
            source: 'ViaGent Notes',
            description: options.description,
        };
    }
    
    return options?.pretty
        ? JSON.stringify(shareable, null, 2)
        : JSON.stringify(shareable);
}

/**
 * Export command as shareable link (base64 encoded)
 */
export function exportCommandAsLink(command: CustomSlashCommand): string {
    const json = exportCommandAsJson(command, { includeMetadata: false });
    const base64 = btoa(encodeURIComponent(json));
    return `${SHARE_PREFIX}${base64}`;
}

/**
 * Export command as Markdown format
 */
export function exportCommandAsMarkdown(command: CustomSlashCommand): string {
    const lines: string[] = [
        `# ${command.title}`,
        '',
        command.description,
        '',
        '## Details',
        '',
        `- **Category**: ${command.category || 'custom'}`,
        `- **Icon**: ${command.icon}`,
        `- **Aliases**: ${command.aliases.join(', ') || 'none'}`,
    ];
    
    if (command.tags && command.tags.length > 0) {
        lines.push(`- **Tags**: ${command.tags.join(', ')}`);
    }
    
    lines.push('', '## Prompt', '', '```');
    lines.push(command.prompt);
    lines.push('```');
    
    if (command.variables && command.variables.length > 0) {
        lines.push('', '## Variables', '');
        command.variables.forEach((v) => {
            lines.push(`- **{{${v.name}}}**: ${v.label} (${v.type})`);
            if (v.options) {
                lines.push(`  - Options: ${v.options.join(', ')}`);
            }
        });
    }
    
    // Add import JSON at the end
    lines.push('', '---', '', '## Import JSON', '', '```json');
    lines.push(exportCommandAsJson(command, { pretty: true }));
    lines.push('```');
    
    return lines.join('\n');
}

/**
 * Export command as plain text
 */
export function exportCommandAsText(command: CustomSlashCommand): string {
    const lines: string[] = [
        `${command.title}`,
        `${command.description}`,
        '',
        `Category: ${command.category || 'custom'}`,
        `Aliases: ${command.aliases.join(', ') || 'none'}`,
        '',
        'Prompt:',
        command.prompt,
    ];
    
    return lines.join('\n');
}

/**
 * Export command in specified format
 */
export function exportCommand(
    command: CustomSlashCommand,
    format: ShareFormat
): string {
    switch (format) {
        case 'json':
            return exportCommandAsJson(command, { pretty: true, includeMetadata: true });
        case 'markdown':
            return exportCommandAsMarkdown(command);
        case 'text':
            return exportCommandAsText(command);
        case 'link':
            return exportCommandAsLink(command);
        default:
            return exportCommandAsJson(command, { pretty: true });
    }
}

// ============================================================================
// Import Functions
// ============================================================================

/**
 * Parse shareable link and extract command data
 */
export function parseShareableLink(link: string): ImportResult {
    try {
        // Check for our custom protocol
        if (link.startsWith(SHARE_PREFIX)) {
            const base64 = link.slice(SHARE_PREFIX.length);
            const json = decodeURIComponent(atob(base64));
            return parseShareableJson(json);
        }
        
        // Try parsing as raw JSON
        return parseShareableJson(link);
    } catch (error) {
        return {
            success: false,
            commands: [],
            error: 'Invalid shareable link format',
        };
    }
}

/**
 * Parse JSON string and extract command(s)
 */
export function parseShareableJson(json: string): ImportResult {
    try {
        const data = JSON.parse(json) as ShareableCommand;
        
        // Validate version
        if (!data.v || data.v > SHARE_VERSION) {
            return {
                success: false,
                commands: [],
                error: 'Unsupported share format version',
            };
        }
        
        const commands: CustomSlashCommand[] = [];
        const now = Date.now();
        
        // Handle single command
        if (data.cmd) {
            commands.push({
                ...data.cmd,
                id: `imported-${now}-${Math.random().toString(36).substr(2, 9)}`,
                createdAt: now,
                updatedAt: now,
                isEnabled: true,
            } as CustomSlashCommand);
        }
        
        // Handle multiple commands
        if (data.cmds) {
            data.cmds.forEach((cmd, index) => {
                commands.push({
                    ...cmd,
                    id: `imported-${now}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: now,
                    updatedAt: now,
                    isEnabled: true,
                } as CustomSlashCommand);
            });
        }
        
        if (commands.length === 0) {
            return {
                success: false,
                commands: [],
                error: 'No commands found in shared data',
            };
        }
        
        return {
            success: true,
            commands,
        };
    } catch (error) {
        return {
            success: false,
            commands: [],
            error: 'Invalid JSON format',
        };
    }
}

/**
 * Import from clipboard
 */
export async function importFromClipboard(): Promise<ImportResult> {
    try {
        const text = await navigator.clipboard.readText();
        
        if (!text || text.trim().length === 0) {
            return {
                success: false,
                commands: [],
                error: 'Clipboard is empty',
            };
        }
        
        // Try parsing as link first
        if (text.startsWith(SHARE_PREFIX)) {
            return parseShareableLink(text);
        }
        
        // Try parsing as JSON
        return parseShareableJson(text);
    } catch (error) {
        return {
            success: false,
            commands: [],
            error: 'Failed to read clipboard. Please paste the content manually.',
        };
    }
}

// ============================================================================
// Clipboard Functions
// ============================================================================

/**
 * Copy command to clipboard in specified format
 */
export async function copyCommandToClipboard(
    command: CustomSlashCommand,
    format: ShareFormat = 'json'
): Promise<boolean> {
    try {
        const content = exportCommand(command, format);
        await navigator.clipboard.writeText(content);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Copy multiple commands to clipboard as JSON
 */
export async function copyCommandsToClipboard(
    commands: CustomSlashCommand[]
): Promise<boolean> {
    try {
        const content = exportCommandsAsJson(commands, { pretty: true, includeMetadata: true });
        await navigator.clipboard.writeText(content);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

// ============================================================================
// File Download
// ============================================================================

/**
 * Download command(s) as JSON file
 */
export function downloadCommandsAsFile(
    commands: CustomSlashCommand[],
    filename?: string
): void {
    const content = exportCommandsAsJson(commands, {
        pretty: true,
        includeMetadata: true,
        description: `Exported ${commands.length} command(s) from ViaGent Notes`,
    });
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `viagent-prompts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}

/**
 * Download single command as file
 */
export function downloadCommandAsFile(
    command: CustomSlashCommand,
    format: ShareFormat = 'json'
): void {
    const content = exportCommand(command, format);
    const extension = format === 'markdown' ? 'md' : format === 'text' ? 'txt' : 'json';
    const mimeType = format === 'markdown' ? 'text/markdown' : format === 'text' ? 'text/plain' : 'application/json';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const safeTitle = command.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${safeTitle}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}
