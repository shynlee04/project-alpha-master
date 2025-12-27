// @vitest-environment jsdom
/**
 * Unit tests for ToolCallBadge component
 *
 * @epic Epic-28 Story 28-19
 * @description
 * Tests for the ToolCallBadge component covering:
 * - Badge rendering with correct tool name
 * - Icon mapping for tool categories
 * - Status variant styling
 * - i18n key rendering
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ToolCallBadge, ToolCallBadgeGroup } from '../ToolCallBadge';
import { getToolCategory } from '@/types/tool-call';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => {
            const translations: Record<string, string> = {
                'chat.tools.pending': 'Waiting to execute...',
                'chat.tools.running': 'Executing...',
                'chat.tools.success': 'Completed',
                'chat.tools.error': 'Failed',
                'chat.tools.arguments': 'Arguments',
                'chat.tools.noArguments': 'No arguments',
            };
            return translations[key] || fallback || key;
        },
    }),
}));

describe('ToolCallBadge', () => {
    afterEach(() => {
        cleanup();
    });

    describe('renders correctly', () => {
        it('should render with tool name', () => {
            render(<ToolCallBadge name="read_file" status="running" />);

            expect(screen.getByText('read_file')).toBeTruthy();
        });

        it('should render with pending status', () => {
            render(<ToolCallBadge name="write_file" status="pending" />);

            const badge = screen.getByRole('button');
            expect(badge).toBeTruthy();
            expect(badge.className).toContain('animate-pulse');
        });

        it('should render with running status', () => {
            render(<ToolCallBadge name="execute_command" status="running" />);

            const badge = screen.getByRole('button');
            expect(badge).toBeTruthy();
            expect(badge.className).toContain('text-primary');
        });

        it('should render with success status', () => {
            render(<ToolCallBadge name="list_files" status="success" />);

            const badge = screen.getByRole('button');
            expect(badge).toBeTruthy();
            expect(badge.className).toContain('text-green-500');
        });

        it('should render with error status', () => {
            render(<ToolCallBadge name="search_files" status="error" />);

            const badge = screen.getByRole('button');
            expect(badge).toBeTruthy();
            expect(badge.className).toContain('text-red-500');
        });

        it('should display duration when provided and status is success', () => {
            render(<ToolCallBadge name="read_file" status="success" duration={150} />);

            expect(screen.getByText('150ms')).toBeTruthy();
        });
    });

    describe('accessibility', () => {
        it('should have proper aria-label', () => {
            render(<ToolCallBadge name="read_file" status="running" />);

            const badge = screen.getByRole('button');
            expect(badge.getAttribute('aria-label')).toBe('read_file - Executing...');
        });
    });
});

describe('ToolCallBadgeGroup', () => {
    afterEach(() => {
        cleanup();
    });

    it('should render multiple badges', () => {
        const toolCalls = [
            { id: '1', name: 'read_file', status: 'success' as const },
            { id: '2', name: 'write_file', status: 'running' as const },
            { id: '3', name: 'execute_command', status: 'pending' as const },
        ];

        render(<ToolCallBadgeGroup toolCalls={toolCalls} />);

        expect(screen.getByText('read_file')).toBeTruthy();
        expect(screen.getByText('write_file')).toBeTruthy();
        expect(screen.getByText('execute_command')).toBeTruthy();
    });

    it('should return null for empty array', () => {
        const { container } = render(<ToolCallBadgeGroup toolCalls={[]} />);

        expect(container.firstChild).toBeNull();
    });

    it('should call onBadgeClick with correct id', () => {
        const onBadgeClick = vi.fn();
        const toolCalls = [
            { id: 'tool-1', name: 'read_file', status: 'success' as const },
        ];

        render(<ToolCallBadgeGroup toolCalls={toolCalls} onBadgeClick={onBadgeClick} />);

        screen.getByRole('button').click();
        expect(onBadgeClick).toHaveBeenCalledWith('tool-1');
    });
});

describe('getToolCategory', () => {
    it('should return "read" for read_file', () => {
        expect(getToolCategory('read_file')).toBe('read');
    });

    it('should return "read" for list_files', () => {
        expect(getToolCategory('list_files')).toBe('read');
    });

    it('should return "write" for write_file', () => {
        expect(getToolCategory('write_file')).toBe('write');
    });

    it('should return "write" for create_file', () => {
        expect(getToolCategory('create_file')).toBe('write');
    });

    it('should return "execute" for execute_command', () => {
        expect(getToolCategory('execute_command')).toBe('execute');
    });

    it('should return "execute" for run_script', () => {
        expect(getToolCategory('run_script')).toBe('execute');
    });

    it('should return "search" for search_files', () => {
        expect(getToolCategory('search_files')).toBe('search');
    });

    it('should return "default" for unknown tools', () => {
        expect(getToolCategory('unknown_tool')).toBe('default');
    });
});
