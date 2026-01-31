/**
 * @fileoverview Unit tests for Prompt Sharing Service
 * @module lib/notes/__tests__/prompt-sharing-service.test
 * @story 43-08: Integration Tests for Prompt Engineering Hub
 * @created 2026-01-13
 *
 * Tests for export/import, shareable links, and clipboard operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    exportCommandAsJson,
    exportCommandsAsJson,
    exportCommandAsLink,
    exportCommandAsMarkdown,
    exportCommandAsText,
    exportCommand,
    parseShareableLink,
    parseShareableJson,
    type ShareableCommand,
} from '../prompt-sharing-service';
import type { CustomSlashCommand } from '../slash-command-store';

// Mock command for testing
const mockCommand: CustomSlashCommand = {
    id: 'test-cmd-123',
    title: 'Test Command',
    titleVi: 'Lệnh Thử Nghiệm',
    description: 'A test command for unit testing',
    descriptionVi: 'Một lệnh thử nghiệm cho unit test',
    prompt: 'Write a {{tone}} message about {{topic}}',
    icon: 'Sparkles',
    aliases: ['test', 'testing'],
    category: 'writing',
    tags: ['test', 'sample'],
    variables: [
        { name: 'tone', label: 'Tone', type: 'select', options: ['formal', 'casual'] },
        { name: 'topic', label: 'Topic', type: 'text', required: true },
    ],
    enableRefinement: true,
    isEnabled: true,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
};

describe('Story 43-08: Prompt Sharing Service (43-07)', () => {
    describe('Export Functions', () => {
        describe('exportCommandAsJson', () => {
            it('exports command as valid JSON', () => {
                const json = exportCommandAsJson(mockCommand);
                const parsed = JSON.parse(json);

                expect(parsed.v).toBe(1);
                expect(parsed.cmd).toBeDefined();
                expect(parsed.cmd.title).toBe(mockCommand.title);
            });

            it('excludes id, createdAt, updatedAt, isEnabled from export', () => {
                const json = exportCommandAsJson(mockCommand);
                const parsed = JSON.parse(json);

                expect(parsed.cmd.id).toBeUndefined();
                expect(parsed.cmd.createdAt).toBeUndefined();
                expect(parsed.cmd.updatedAt).toBeUndefined();
                expect(parsed.cmd.isEnabled).toBeUndefined();
            });

            it('includes metadata when requested', () => {
                const json = exportCommandAsJson(mockCommand, { includeMetadata: true });
                const parsed = JSON.parse(json);

                expect(parsed.meta).toBeDefined();
                expect(parsed.meta.exportedAt).toBeDefined();
                expect(parsed.meta.source).toBe('ViaGent Notes');
            });

            it('formats with indentation when pretty option is set', () => {
                const prettyJson = exportCommandAsJson(mockCommand, { pretty: true });
                const compactJson = exportCommandAsJson(mockCommand, { pretty: false });

                expect(prettyJson.length).toBeGreaterThan(compactJson.length);
                expect(prettyJson).toContain('\n');
                expect(compactJson).not.toContain('\n');
            });
        });

        describe('exportCommandsAsJson', () => {
            it('exports multiple commands', () => {
                const secondCommand = { ...mockCommand, id: 'test-2', title: 'Second Command' };
                const json = exportCommandsAsJson([mockCommand, secondCommand]);
                const parsed = JSON.parse(json);

                expect(parsed.v).toBe(1);
                expect(parsed.cmds).toBeDefined();
                expect(parsed.cmds.length).toBe(2);
            });

            it('includes description in metadata', () => {
                const json = exportCommandsAsJson([mockCommand], {
                    includeMetadata: true,
                    description: 'My exported commands',
                });
                const parsed = JSON.parse(json);

                expect(parsed.meta.description).toBe('My exported commands');
            });
        });

        describe('exportCommandAsLink', () => {
            it('creates shareable link with correct prefix', () => {
                const link = exportCommandAsLink(mockCommand);

                expect(link).toMatch(/^viagen:\/\/prompt\//);
            });

            it('encodes command data in base64', () => {
                const link = exportCommandAsLink(mockCommand);
                const base64Part = link.replace('viagen://prompt/', '');

                // Should be valid base64
                expect(() => atob(base64Part)).not.toThrow();
            });

            it('can be decoded back to original data', () => {
                const link = exportCommandAsLink(mockCommand);
                const base64Part = link.replace('viagen://prompt/', '');
                const decoded = decodeURIComponent(atob(base64Part));
                const parsed = JSON.parse(decoded);

                expect(parsed.cmd.title).toBe(mockCommand.title);
                expect(parsed.cmd.prompt).toBe(mockCommand.prompt);
            });
        });

        describe('exportCommandAsMarkdown', () => {
            it('includes title as heading', () => {
                const markdown = exportCommandAsMarkdown(mockCommand);

                expect(markdown).toContain(`# ${mockCommand.title}`);
            });

            it('includes description', () => {
                const markdown = exportCommandAsMarkdown(mockCommand);

                expect(markdown).toContain(mockCommand.description);
            });

            it('includes category, icon, and aliases', () => {
                const markdown = exportCommandAsMarkdown(mockCommand);

                expect(markdown).toContain(`- **Category**: ${mockCommand.category}`);
                expect(markdown).toContain(`- **Icon**: ${mockCommand.icon}`);
                expect(markdown).toContain(`- **Aliases**: ${mockCommand.aliases.join(', ')}`);
            });

            it('includes prompt in code block', () => {
                const markdown = exportCommandAsMarkdown(mockCommand);

                expect(markdown).toContain('## Prompt');
                expect(markdown).toContain('```');
                expect(markdown).toContain(mockCommand.prompt);
            });

            it('includes variables section when present', () => {
                const markdown = exportCommandAsMarkdown(mockCommand);

                expect(markdown).toContain('## Variables');
                expect(markdown).toContain('{{tone}}');
                expect(markdown).toContain('{{topic}}');
            });

            it('includes import JSON at the end', () => {
                const markdown = exportCommandAsMarkdown(mockCommand);

                expect(markdown).toContain('## Import JSON');
                expect(markdown).toContain('```json');
            });
        });

        describe('exportCommandAsText', () => {
            it('includes basic command info', () => {
                const text = exportCommandAsText(mockCommand);

                expect(text).toContain(mockCommand.title);
                expect(text).toContain(mockCommand.description);
                expect(text).toContain(`Category: ${mockCommand.category}`);
                expect(text).toContain(mockCommand.prompt);
            });

            it('is plain text without markdown', () => {
                const text = exportCommandAsText(mockCommand);

                expect(text).not.toContain('##');
                expect(text).not.toContain('```');
                expect(text).not.toContain('**');
            });
        });

        describe('exportCommand (unified)', () => {
            it('exports as JSON when format is json', () => {
                const result = exportCommand(mockCommand, 'json');
                const parsed = JSON.parse(result);

                expect(parsed.v).toBe(1);
                expect(parsed.meta).toBeDefined();
            });

            it('exports as markdown when format is markdown', () => {
                const result = exportCommand(mockCommand, 'markdown');

                expect(result).toContain(`# ${mockCommand.title}`);
            });

            it('exports as text when format is text', () => {
                const result = exportCommand(mockCommand, 'text');

                expect(result).not.toContain('##');
            });

            it('exports as link when format is link', () => {
                const result = exportCommand(mockCommand, 'link');

                expect(result).toMatch(/^viagen:\/\/prompt\//);
            });
        });
    });

    describe('Import Functions', () => {
        describe('parseShareableLink', () => {
            it('parses valid shareable link', () => {
                const link = exportCommandAsLink(mockCommand);
                const result = parseShareableLink(link);

                expect(result.success).toBe(true);
                expect(result.commands.length).toBe(1);
                expect(result.commands[0].title).toBe(mockCommand.title);
            });

            it('generates new id for imported command', () => {
                const link = exportCommandAsLink(mockCommand);
                const result = parseShareableLink(link);

                expect(result.commands[0].id).not.toBe(mockCommand.id);
                expect(result.commands[0].id).toMatch(/^imported-/);
            });

            it('sets isEnabled to true for imported commands', () => {
                const link = exportCommandAsLink(mockCommand);
                const result = parseShareableLink(link);

                expect(result.commands[0].isEnabled).toBe(true);
            });

            it('returns error for invalid link', () => {
                const result = parseShareableLink('invalid-link');

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(result.commands.length).toBe(0);
            });

            it('returns error for corrupted base64', () => {
                const result = parseShareableLink('viagen://prompt/not-valid-base64!!!');

                expect(result.success).toBe(false);
            });
        });

        describe('parseShareableJson', () => {
            it('parses valid JSON with single command', () => {
                const json = exportCommandAsJson(mockCommand);
                const result = parseShareableJson(json);

                expect(result.success).toBe(true);
                expect(result.commands.length).toBe(1);
            });

            it('parses valid JSON with multiple commands', () => {
                const json = exportCommandsAsJson([mockCommand, { ...mockCommand, title: 'Second' }]);
                const result = parseShareableJson(json);

                expect(result.success).toBe(true);
                expect(result.commands.length).toBe(2);
            });

            it('returns error for invalid JSON', () => {
                const result = parseShareableJson('not valid json {');

                expect(result.success).toBe(false);
                expect(result.error).toBe('Invalid JSON format');
            });

            it('returns error for unsupported version', () => {
                const json = JSON.stringify({ v: 999, cmd: {} });
                const result = parseShareableJson(json);

                expect(result.success).toBe(false);
                expect(result.error).toContain('version');
            });

            it('returns error when no commands found', () => {
                const json = JSON.stringify({ v: 1 });
                const result = parseShareableJson(json);

                expect(result.success).toBe(false);
                expect(result.error).toContain('No commands found');
            });

            it('generates unique IDs for multiple imported commands', () => {
                const json = exportCommandsAsJson([mockCommand, mockCommand]);
                const result = parseShareableJson(json);

                const ids = result.commands.map(c => c.id);
                expect(new Set(ids).size).toBe(ids.length);
            });

            it('preserves all command fields', () => {
                const json = exportCommandAsJson(mockCommand);
                const result = parseShareableJson(json);
                const imported = result.commands[0];

                expect(imported.title).toBe(mockCommand.title);
                expect(imported.titleVi).toBe(mockCommand.titleVi);
                expect(imported.description).toBe(mockCommand.description);
                expect(imported.prompt).toBe(mockCommand.prompt);
                expect(imported.icon).toBe(mockCommand.icon);
                expect(imported.category).toBe(mockCommand.category);
                expect(imported.tags).toEqual(mockCommand.tags);
                expect(imported.variables).toEqual(mockCommand.variables);
            });
        });
    });

    describe('Round-trip Tests', () => {
        it('JSON export and import preserves data', () => {
            const json = exportCommandAsJson(mockCommand);
            const result = parseShareableJson(json);

            expect(result.success).toBe(true);
            const imported = result.commands[0];

            expect(imported.title).toBe(mockCommand.title);
            expect(imported.prompt).toBe(mockCommand.prompt);
            expect(imported.variables).toEqual(mockCommand.variables);
        });

        it('Link export and import preserves data', () => {
            const link = exportCommandAsLink(mockCommand);
            const result = parseShareableLink(link);

            expect(result.success).toBe(true);
            const imported = result.commands[0];

            expect(imported.title).toBe(mockCommand.title);
            expect(imported.prompt).toBe(mockCommand.prompt);
        });

        it('Multiple commands round-trip', () => {
            const commands = [
                mockCommand,
                { ...mockCommand, id: 'cmd-2', title: 'Second', prompt: 'Another prompt' },
            ];

            const json = exportCommandsAsJson(commands);
            const result = parseShareableJson(json);

            expect(result.commands.length).toBe(2);
            expect(result.commands[0].title).toBe('Test Command');
            expect(result.commands[1].title).toBe('Second');
        });
    });
});
