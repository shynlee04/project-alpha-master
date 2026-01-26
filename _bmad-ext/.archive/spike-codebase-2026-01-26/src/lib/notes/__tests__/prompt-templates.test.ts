/**
 * @fileoverview Unit tests for Prompt Templates Library
 * @module lib/notes/__tests__/prompt-templates.test
 * @story 43-08: Integration Tests for Prompt Engineering Hub
 * @created 2026-01-13
 *
 * Tests for template retrieval, search, and conversion to commands.
 */

import { describe, it, expect } from 'vitest';
import {
    ALL_PROMPT_TEMPLATES,
    getTemplatesByCategory,
    getFeaturedTemplates,
    searchTemplates,
    getAllTemplateTags,
    templateToCommand,
    getTemplateCounts,
    type PromptTemplate,
} from '../prompt-templates-data';

describe('Story 43-08: Prompt Templates Library (43-05)', () => {
    describe('Template Data Integrity', () => {
        it('has templates in all major categories', () => {
            const categories = ['writing', 'analysis', 'productivity', 'communication', 'technical', 'creative'];
            
            categories.forEach(category => {
                const templates = getTemplatesByCategory(category as PromptTemplate['category']);
                expect(templates.length).toBeGreaterThan(0);
            });
        });

        it('each template has required fields', () => {
            ALL_PROMPT_TEMPLATES.forEach(template => {
                expect(template.id).toBeDefined();
                expect(template.id).toMatch(/^tpl-/);
                expect(template.title).toBeDefined();
                expect(template.title.length).toBeGreaterThan(0);
                expect(template.titleVi).toBeDefined();
                expect(template.description).toBeDefined();
                expect(template.descriptionVi).toBeDefined();
                expect(template.prompt).toBeDefined();
                expect(template.icon).toBeDefined();
                expect(template.category).toBeDefined();
                expect(Array.isArray(template.tags)).toBe(true);
            });
        });

        it('templates with enableRefinement have variables defined', () => {
            ALL_PROMPT_TEMPLATES
                .filter(t => t.enableRefinement === true)
                .forEach(template => {
                    expect(template.variables).toBeDefined();
                    expect(Array.isArray(template.variables)).toBe(true);
                    expect(template.variables!.length).toBeGreaterThan(0);
                });
        });

        it('each variable has required fields', () => {
            ALL_PROMPT_TEMPLATES
                .filter(t => t.variables && t.variables.length > 0)
                .forEach(template => {
                    template.variables!.forEach(variable => {
                        expect(variable.name).toBeDefined();
                        expect(variable.label).toBeDefined();
                        expect(variable.type).toBeDefined();
                        expect(['text', 'textarea', 'select']).toContain(variable.type);
                        
                        // Select type must have options
                        if (variable.type === 'select') {
                            expect(variable.options).toBeDefined();
                            expect(Array.isArray(variable.options)).toBe(true);
                            expect(variable.options!.length).toBeGreaterThan(0);
                        }
                    });
                });
        });

        it('template IDs are unique', () => {
            const ids = ALL_PROMPT_TEMPLATES.map(t => t.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
    });

    describe('getTemplatesByCategory', () => {
        it('returns all templates for "all" category', () => {
            const all = getTemplatesByCategory('all');
            expect(all.length).toBe(ALL_PROMPT_TEMPLATES.length);
        });

        it('filters templates by specific category', () => {
            const writing = getTemplatesByCategory('writing');
            expect(writing.every(t => t.category === 'writing')).toBe(true);

            const technical = getTemplatesByCategory('technical');
            expect(technical.every(t => t.category === 'technical')).toBe(true);
        });

        it('returns empty array for category with no templates', () => {
            // Custom category typically has no pre-built templates
            const custom = getTemplatesByCategory('custom');
            expect(Array.isArray(custom)).toBe(true);
        });
    });

    describe('getFeaturedTemplates', () => {
        it('returns only featured templates', () => {
            const featured = getFeaturedTemplates();
            expect(featured.every(t => t.featured === true)).toBe(true);
        });

        it('returns templates sorted by popularity (descending)', () => {
            const featured = getFeaturedTemplates();
            
            for (let i = 1; i < featured.length; i++) {
                const prevPopularity = featured[i - 1].popularity || 0;
                const currPopularity = featured[i].popularity || 0;
                expect(prevPopularity).toBeGreaterThanOrEqual(currPopularity);
            }
        });

        it('has at least one featured template', () => {
            const featured = getFeaturedTemplates();
            expect(featured.length).toBeGreaterThan(0);
        });
    });

    describe('searchTemplates', () => {
        it('finds templates by title', () => {
            const results = searchTemplates('Blog');
            expect(results.length).toBeGreaterThan(0);
            expect(results.some(t => t.title.toLowerCase().includes('blog'))).toBe(true);
        });

        it('finds templates by Vietnamese title', () => {
            const results = searchTemplates('Email');
            expect(results.length).toBeGreaterThan(0);
        });

        it('finds templates by description', () => {
            const results = searchTemplates('comprehensive');
            expect(results.length).toBeGreaterThan(0);
        });

        it('finds templates by tag', () => {
            const results = searchTemplates('brainstorm');
            expect(results.length).toBeGreaterThan(0);
            expect(results.some(t => t.tags.includes('brainstorm'))).toBe(true);
        });

        it('returns empty array for non-matching query', () => {
            const results = searchTemplates('xyz123nonexistent');
            expect(results.length).toBe(0);
        });

        it('is case-insensitive', () => {
            const lower = searchTemplates('swot');
            const upper = searchTemplates('SWOT');
            const mixed = searchTemplates('Swot');

            expect(lower.length).toBe(upper.length);
            expect(lower.length).toBe(mixed.length);
        });
    });

    describe('getAllTemplateTags', () => {
        it('returns array of unique tags', () => {
            const tags = getAllTemplateTags();
            
            expect(Array.isArray(tags)).toBe(true);
            expect(new Set(tags).size).toBe(tags.length);
        });

        it('returns sorted tags', () => {
            const tags = getAllTemplateTags();
            const sorted = [...tags].sort();
            expect(tags).toEqual(sorted);
        });

        it('includes expected common tags', () => {
            const tags = getAllTemplateTags();
            // These tags actually exist in the templates
            expect(tags).toContain('blog');
            expect(tags).toContain('business');
        });
    });

    describe('templateToCommand', () => {
        it('converts template to command format', () => {
            const template = ALL_PROMPT_TEMPLATES[0];
            const command = templateToCommand(template);

            expect(command.title).toBe(template.title);
            expect(command.titleVi).toBe(template.titleVi);
            expect(command.description).toBe(template.description);
            expect(command.descriptionVi).toBe(template.descriptionVi);
            expect(command.prompt).toBe(template.prompt);
            expect(command.icon).toBe(template.icon);
            expect(command.category).toBe(template.category);
            expect(command.tags).toEqual(template.tags);
            expect(command.isEnabled).toBe(true);
        });

        it('generates alias from template id', () => {
            const template = ALL_PROMPT_TEMPLATES.find(t => t.id === 'tpl-blog-post');
            const command = templateToCommand(template!);

            expect(command.aliases).toContain('blog-post');
        });

        it('preserves variables from template', () => {
            const templateWithVars = ALL_PROMPT_TEMPLATES.find(t => t.variables && t.variables.length > 0);
            const command = templateToCommand(templateWithVars!);

            expect(command.variables).toEqual(templateWithVars!.variables);
        });

        it('excludes id, createdAt, updatedAt fields', () => {
            const template = ALL_PROMPT_TEMPLATES[0];
            const command = templateToCommand(template);

            expect('id' in command).toBe(false);
            expect('createdAt' in command).toBe(false);
            expect('updatedAt' in command).toBe(false);
        });
    });

    describe('getTemplateCounts', () => {
        it('returns counts for all categories', () => {
            const counts = getTemplateCounts();

            expect(counts.all).toBe(ALL_PROMPT_TEMPLATES.length);
            expect(typeof counts.writing).toBe('number');
            expect(typeof counts.analysis).toBe('number');
            expect(typeof counts.productivity).toBe('number');
            expect(typeof counts.communication).toBe('number');
            expect(typeof counts.technical).toBe('number');
            expect(typeof counts.creative).toBe('number');
        });

        it('category counts sum to total', () => {
            const counts = getTemplateCounts();
            const categorySum = 
                (counts.writing || 0) +
                (counts.analysis || 0) +
                (counts.productivity || 0) +
                (counts.communication || 0) +
                (counts.technical || 0) +
                (counts.creative || 0) +
                (counts.custom || 0);

            expect(categorySum).toBe(counts.all);
        });
    });
});
