/**
 * @fileoverview Unit tests for Slash Command Store
 * @module lib/notes/__tests__/slash-command-store.test
 * @story 43-08: Integration Tests for Prompt Engineering Hub
 * @created 2026-01-13
 *
 * Tests for custom slash command CRUD, categories, tags, and variable handling.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    useSlashCommandStore,
    extractVariablesFromPrompt,
    substituteVariables,
    promptNeedsRefinement,
    getLocalizedCommand,
    getLocalizedVariableLabel,
    COMMAND_CATEGORIES,
    AVAILABLE_ICONS,
    type CustomSlashCommand,
    type PromptVariable,
} from '../slash-command-store';

describe('Story 43-08: Slash Command Store', () => {
    beforeEach(() => {
        // Reset store to default state
        useSlashCommandStore.getState().resetToDefaults();
        useSlashCommandStore.setState({
            selectedCategory: 'all',
            selectedTags: [],
        });
    });

    describe('Command CRUD Operations', () => {
        it('adds a new command with generated id and timestamps', () => {
            const store = useSlashCommandStore.getState();
            const initialCount = store.customCommands.length;

            store.addCommand({
                title: 'Test Command',
                description: 'A test command',
                prompt: 'Test prompt {{variable}}',
                icon: 'Sparkles',
                aliases: ['test', 'testcmd'],
                category: 'technical',
                tags: ['testing'],
                isEnabled: true,
            });

            const commands = useSlashCommandStore.getState().customCommands;
            expect(commands.length).toBe(initialCount + 1);

            const newCommand = commands[commands.length - 1];
            expect(newCommand.title).toBe('Test Command');
            expect(newCommand.id).toMatch(/^custom-\d+-[a-z0-9]+$/);
            expect(newCommand.createdAt).toBeDefined();
            expect(newCommand.updatedAt).toBeDefined();
            expect(newCommand.category).toBe('technical');
            expect(newCommand.tags).toContain('testing');
        });

        it('updates an existing command', () => {
            const store = useSlashCommandStore.getState();
            const command = store.customCommands[0];
            const originalUpdatedAt = command.updatedAt;

            store.updateCommand(command.id, {
                title: 'Updated Title',
                description: 'Updated description',
            });

            const updated = useSlashCommandStore.getState().customCommands.find(c => c.id === command.id);
            expect(updated?.title).toBe('Updated Title');
            expect(updated?.description).toBe('Updated description');
            expect(updated?.updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
        });

        it('deletes a command', () => {
            const store = useSlashCommandStore.getState();
            const command = store.customCommands[0];
            const initialCount = store.customCommands.length;

            store.deleteCommand(command.id);

            const commands = useSlashCommandStore.getState().customCommands;
            expect(commands.length).toBe(initialCount - 1);
            expect(commands.find(c => c.id === command.id)).toBeUndefined();
        });

        it('toggles command enabled status', () => {
            const store = useSlashCommandStore.getState();
            const command = store.customCommands[0];
            const originalEnabled = command.isEnabled;

            store.toggleCommand(command.id);

            const updated = useSlashCommandStore.getState().customCommands.find(c => c.id === command.id);
            expect(updated?.isEnabled).toBe(!originalEnabled);
        });

        it('reorders commands', () => {
            const store = useSlashCommandStore.getState();
            const commands = store.customCommands;
            const firstId = commands[0].id;
            const secondId = commands[1].id;

            store.reorderCommands(0, 1);

            const reordered = useSlashCommandStore.getState().customCommands;
            expect(reordered[0].id).toBe(secondId);
            expect(reordered[1].id).toBe(firstId);
        });

        it('imports commands with new ids', () => {
            const store = useSlashCommandStore.getState();
            const initialCount = store.customCommands.length;

            const importedCommands: CustomSlashCommand[] = [
                {
                    id: 'old-id-1',
                    title: 'Imported 1',
                    description: 'Imported command 1',
                    prompt: 'Prompt 1',
                    icon: 'Star',
                    aliases: ['imp1'],
                    isEnabled: true,
                    createdAt: 123456,
                    updatedAt: 123456,
                },
                {
                    id: 'old-id-2',
                    title: 'Imported 2',
                    description: 'Imported command 2',
                    prompt: 'Prompt 2',
                    icon: 'Heart',
                    aliases: ['imp2'],
                    isEnabled: true,
                    createdAt: 123456,
                    updatedAt: 123456,
                },
            ];

            store.importCommands(importedCommands);

            const commands = useSlashCommandStore.getState().customCommands;
            expect(commands.length).toBe(initialCount + 2);

            // Check that new IDs were generated
            const imported = commands.filter(c => c.title.startsWith('Imported'));
            expect(imported.every(c => c.id.startsWith('imported-'))).toBe(true);
        });

        it('exports all commands', () => {
            const store = useSlashCommandStore.getState();
            const exported = store.exportCommands();

            expect(Array.isArray(exported)).toBe(true);
            expect(exported.length).toBe(store.customCommands.length);
        });

        it('resets to default commands', () => {
            const store = useSlashCommandStore.getState();

            // Add a custom command
            store.addCommand({
                title: 'Custom Command',
                description: 'Test',
                prompt: 'Test',
                icon: 'Sparkles',
                aliases: [],
                isEnabled: true,
            });

            // Reset to defaults
            store.resetToDefaults();

            const commands = useSlashCommandStore.getState().customCommands;
            expect(commands.find(c => c.title === 'Custom Command')).toBeUndefined();
            // Default commands should be present
            expect(commands.find(c => c.id === 'custom-brainstorm')).toBeDefined();
        });
    });

    describe('Category and Tag Filtering (43-02)', () => {
        it('selects a category', () => {
            const store = useSlashCommandStore.getState();

            store.selectCategory('writing');

            expect(useSlashCommandStore.getState().selectedCategory).toBe('writing');
        });

        it('gets commands by category', () => {
            const store = useSlashCommandStore.getState();

            const writingCommands = store.getCommandsByCategory('writing');
            expect(writingCommands.every(c => c.category === 'writing')).toBe(true);

            const allCommands = store.getCommandsByCategory('all');
            expect(allCommands.length).toBe(store.customCommands.length);
        });

        it('toggles tag filter', () => {
            const store = useSlashCommandStore.getState();

            store.toggleTag('productivity');
            expect(useSlashCommandStore.getState().selectedTags).toContain('productivity');

            store.toggleTag('productivity');
            expect(useSlashCommandStore.getState().selectedTags).not.toContain('productivity');
        });

        it('clears tag filters', () => {
            const store = useSlashCommandStore.getState();

            store.toggleTag('tag1');
            store.toggleTag('tag2');
            expect(useSlashCommandStore.getState().selectedTags.length).toBe(2);

            store.clearTagFilters();
            expect(useSlashCommandStore.getState().selectedTags.length).toBe(0);
        });

        it('gets all unique tags', () => {
            const store = useSlashCommandStore.getState();

            const tags = store.getAllTags();
            expect(Array.isArray(tags)).toBe(true);
            // Tags should be sorted
            const sorted = [...tags].sort();
            expect(tags).toEqual(sorted);
            // Tags should be unique
            expect(new Set(tags).size).toBe(tags.length);
        });
    });

    describe('Variable Extraction and Substitution (43-03)', () => {
        it('extracts variable names from prompt', () => {
            const prompt = 'Write a {{tone}} email to {{recipient}} about {{topic}}';
            const variables = extractVariablesFromPrompt(prompt);

            expect(variables).toEqual(['tone', 'recipient', 'topic']);
        });

        it('returns empty array for prompt without variables', () => {
            const prompt = 'This is a simple prompt without variables';
            const variables = extractVariablesFromPrompt(prompt);

            expect(variables).toEqual([]);
        });

        it('handles duplicate variables', () => {
            const prompt = '{{name}} said hello to {{name}}';
            const variables = extractVariablesFromPrompt(prompt);

            expect(variables).toEqual(['name']);
        });

        it('substitutes variables with values', () => {
            const prompt = 'Hello {{name}}, welcome to {{place}}!';
            const values = { name: 'John', place: 'Paris' };

            const result = substituteVariables(prompt, values);

            expect(result).toBe('Hello John, welcome to Paris!');
        });

        it('substitutes all occurrences of same variable', () => {
            const prompt = '{{name}} loves {{name}}';
            const values = { name: 'Alice' };

            const result = substituteVariables(prompt, values);

            expect(result).toBe('Alice loves Alice');
        });

        it('leaves unmatched variables unchanged', () => {
            const prompt = 'Hello {{name}}, your role is {{role}}';
            const values = { name: 'John' };

            const result = substituteVariables(prompt, values);

            expect(result).toBe('Hello John, your role is {{role}}');
        });

        it('determines if prompt needs refinement based on flag', () => {
            const commandWithFlag: CustomSlashCommand = {
                id: 'test',
                title: 'Test',
                description: 'Test',
                prompt: 'Simple prompt',
                icon: 'Sparkles',
                aliases: [],
                isEnabled: true,
                enableRefinement: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            expect(promptNeedsRefinement(commandWithFlag)).toBe(true);

            commandWithFlag.enableRefinement = false;
            expect(promptNeedsRefinement(commandWithFlag)).toBe(false);
        });

        it('auto-detects refinement need from variables', () => {
            const commandWithVariables: CustomSlashCommand = {
                id: 'test',
                title: 'Test',
                description: 'Test',
                prompt: 'Hello {{name}}',
                icon: 'Sparkles',
                aliases: [],
                isEnabled: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            expect(promptNeedsRefinement(commandWithVariables)).toBe(true);

            commandWithVariables.prompt = 'No variables here';
            expect(promptNeedsRefinement(commandWithVariables)).toBe(false);
        });
    });

    describe('Localization Helpers', () => {
        it('returns English title/description by default', () => {
            const command: CustomSlashCommand = {
                id: 'test',
                title: 'English Title',
                titleVi: 'Vietnamese Title',
                description: 'English Desc',
                descriptionVi: 'Vietnamese Desc',
                prompt: 'Test',
                icon: 'Sparkles',
                aliases: [],
                isEnabled: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const localized = getLocalizedCommand(command);
            expect(localized.title).toBe('English Title');
            expect(localized.description).toBe('English Desc');
        });

        it('returns Vietnamese title/description for vi locale', () => {
            const command: CustomSlashCommand = {
                id: 'test',
                title: 'English Title',
                titleVi: 'Vietnamese Title',
                description: 'English Desc',
                descriptionVi: 'Vietnamese Desc',
                prompt: 'Test',
                icon: 'Sparkles',
                aliases: [],
                isEnabled: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const localized = getLocalizedCommand(command, 'vi');
            expect(localized.title).toBe('Vietnamese Title');
            expect(localized.description).toBe('Vietnamese Desc');
        });

        it('falls back to English if Vietnamese not available', () => {
            const command: CustomSlashCommand = {
                id: 'test',
                title: 'English Only',
                description: 'English Desc Only',
                prompt: 'Test',
                icon: 'Sparkles',
                aliases: [],
                isEnabled: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const localized = getLocalizedCommand(command, 'vi');
            expect(localized.title).toBe('English Only');
            expect(localized.description).toBe('English Desc Only');
        });

        it('returns localized variable label', () => {
            const variable: PromptVariable = {
                name: 'topic',
                label: 'Topic',
                labelVi: 'Chủ đề',
                type: 'text',
            };

            expect(getLocalizedVariableLabel(variable)).toBe('Topic');
            expect(getLocalizedVariableLabel(variable, 'vi')).toBe('Chủ đề');
            expect(getLocalizedVariableLabel(variable, 'vi-VN')).toBe('Chủ đề');
        });
    });

    describe('Constants', () => {
        it('COMMAND_CATEGORIES has all required categories', () => {
            const categories = Object.keys(COMMAND_CATEGORIES);
            expect(categories).toContain('writing');
            expect(categories).toContain('productivity');
            expect(categories).toContain('analysis');
            expect(categories).toContain('communication');
            expect(categories).toContain('technical');
            expect(categories).toContain('creative');
            expect(categories).toContain('custom');
        });

        it('each category has required fields', () => {
            Object.values(COMMAND_CATEGORIES).forEach(category => {
                expect(category.id).toBeDefined();
                expect(category.label).toBeDefined();
                expect(category.labelVi).toBeDefined();
                expect(category.icon).toBeDefined();
                expect(category.description).toBeDefined();
            });
        });

        it('AVAILABLE_ICONS contains expected icons', () => {
            expect(AVAILABLE_ICONS).toContain('Sparkles');
            expect(AVAILABLE_ICONS).toContain('Lightbulb');
            expect(AVAILABLE_ICONS).toContain('Code');
            expect(AVAILABLE_ICONS).toContain('Brain');
            expect(AVAILABLE_ICONS.length).toBeGreaterThan(20);
        });
    });
});
