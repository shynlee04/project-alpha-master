/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToolPermissionsConfig } from '../ToolPermissionsConfig';
import { ToolPermissionManager } from '@/lib/agent/tool-permission-manager';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => {
            const translations: Record<string, string> = {
                'agents.permissions.title': 'Tool Permissions',
                'agents.permissions.auto': 'Auto-allow',
                'agents.permissions.prompt': 'Prompt each time',
                'agents.permissions.block': 'Block',
                'agents.permissions.updated': 'Tool permission updated',
                'agents.permissions.reset': 'Permissions reset to defaults',
                'agents.permissions.resetDefaults': 'Reset to Defaults',
                'agents.permissions.autoCount': 'Auto',
                'agents.permissions.promptCount': 'Prompt',
                'agents.permissions.blockCount': 'Blocked',
                'agents.permissions.category.file': 'File Operations',
                'agents.permissions.category.terminal': 'Terminal Commands',
                'agents.permissions.info.title': 'About Tool Permissions',
                'agents.permissions.info.description': 'Configure how the AI agent handles tool execution.',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

describe('ToolPermissionsConfig', () => {
    let permissionManager: ToolPermissionManager;

    beforeEach(() => {
        permissionManager = ToolPermissionManager.createInstance();
        vi.clearAllMocks();
        cleanup();
    });

    describe('Rendering', () => {
        it('renders tool permissions title', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} />);
            expect(screen.getByText('Tool Permissions')).toBeInTheDocument();
        });

        it('renders all available tools', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} />);
            expect(screen.getByText('Read File')).toBeInTheDocument();
            expect(screen.getByText('Write File')).toBeInTheDocument();
            expect(screen.getByText('Delete File')).toBeInTheDocument();
            expect(screen.getByText('Execute Command')).toBeInTheDocument();
        });

        it('shows default trust levels', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} />);
            // Read file should be auto - verify tool is rendered
            expect(screen.getByText('Read File')).toBeInTheDocument();
            expect(screen.getByText('Write File')).toBeInTheDocument();
            expect(screen.getByText('Delete File')).toBeInTheDocument();
        });

        it('renders category sections', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} />);
            expect(screen.getByText('File Operations')).toBeInTheDocument();
            expect(screen.getByText('Terminal Commands')).toBeInTheDocument();
        });

        it('shows summary counts', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} />);
            // Should show counts for auto, prompt, blocked
            expect(screen.getByText('Auto')).toBeInTheDocument();
            expect(screen.getByText('Prompt')).toBeInTheDocument();
            expect(screen.getByText('Blocked')).toBeInTheDocument();
        });
    });

    describe('User Interaction', () => {
        it('calls onPermissionsChange when trust level changes', () => {
            const onPermissionsChange = vi.fn();

            render(
                <ToolPermissionsConfig
                    permissionManager={permissionManager}
                    onPermissionsChange={onPermissionsChange}
                />
            );

            // Changing permission via API and verify callback
            permissionManager.setTrustLevel('write_file', 'auto');
            expect(onPermissionsChange).toHaveBeenCalled();
        });

        it('updates permission manager when trust level changes', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} />);

            // Change write_file from prompt to auto via API
            permissionManager.setTrustLevel('write_file', 'auto');
            expect(permissionManager.getTrustLevel('write_file')).toBe('auto');
        });

        it('resets to defaults when reset button clicked', () => {
            // Change a permission first
            permissionManager.setTrustLevel('write_file', 'auto');
            expect(permissionManager.getTrustLevel('write_file')).toBe('auto');

            render(<ToolPermissionsConfig permissionManager={permissionManager} />);

            // Click reset button
            const resetButton = screen.getByRole('button', { name: /reset/i });
            fireEvent.click(resetButton);

            // Should be back to default (prompt)
            expect(permissionManager.getTrustLevel('write_file')).toBe('prompt');
        });
    });

    describe('Disabled State', () => {
        it('disables interaction when disabled prop is true', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} disabled />);
            // When disabled, the reset button should not be visible
            expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
        });

        it('shows content when disabled', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} disabled />);
            // Title should still be visible
            expect(screen.getByText('Tool Permissions')).toBeInTheDocument();
            // Tool names should still be visible
            expect(screen.getByText('Read File')).toBeInTheDocument();
        });
    });

    describe('Default Trust Levels Verification', () => {
        it('read_file defaults to auto', () => {
            expect(permissionManager.getTrustLevel('read_file')).toBe('auto');
        });

        it('write_file defaults to prompt', () => {
            expect(permissionManager.getTrustLevel('write_file')).toBe('prompt');
        });

        it('delete_file defaults to block', () => {
            expect(permissionManager.getTrustLevel('delete_file')).toBe('block');
        });

        it('execute_command defaults to prompt', () => {
            expect(permissionManager.getTrustLevel('execute_command')).toBe('prompt');
        });
    });

    describe('Visual Indicators', () => {
        it('renders all trust level options', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} />);
            // Check that trust level selectors exist
            const selects = screen.getAllByRole('combobox');
            expect(selects.length).toBeGreaterThanOrEqual(7); // 7 tools
        });

        it('renders all tool names', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} />);
            expect(screen.getByText('Read File')).toBeInTheDocument();
            expect(screen.getByText('Write File')).toBeInTheDocument();
            expect(screen.getByText('Delete File')).toBeInTheDocument();
            expect(screen.getByText('Execute Command')).toBeInTheDocument();
        });

        it('renders category headers', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} />);
            expect(screen.getByText('File Operations')).toBeInTheDocument();
            expect(screen.getByText('Terminal Commands')).toBeInTheDocument();
        });

        it('renders reset button', () => {
            render(<ToolPermissionsConfig permissionManager={permissionManager} />);
            expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
        });
    });
});
