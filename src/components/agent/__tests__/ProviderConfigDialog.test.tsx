import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProviderConfigDialog } from '../ProviderConfigDialog';
import { useProviderStore } from '@/lib/state/provider-store';
import { credentialVault } from '@/lib/agent/providers/credential-vault';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
    DialogContent: ({ children }: any) => <div role="dialog">{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <h1>{children}</h1>,
    DialogDescription: ({ children }: any) => <p>{children}</p>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

vi.mock('@/components/ui/select', () => ({
    Select: ({ children, value, onValueChange }: any) => <div data-value={value} onClick={() => onValueChange('openai')}>{children}</div>,
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: () => <span>Select Value</span>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));

vi.mock('@/lib/state/provider-store', () => ({
    useProviderStore: vi.fn(),
}));

vi.mock('@/lib/agent/providers/credential-vault', () => ({
    credentialVault: {
        storeCredentials: vi.fn(),
        getCredentials: vi.fn(),
    },
}));

describe('ProviderConfigDialog', () => {
    const mockAddProvider = vi.fn();
    const mockUpdateProvider = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useProviderStore as any).mockReturnValue({
            addProvider: mockAddProvider,
            updateProvider: mockUpdateProvider,
        });
    });

    it('renders form fields', () => {
        render(
            <ProviderConfigDialog
                open={true}
                onOpenChange={vi.fn()}
            />
        );
        expect(screen.getByText('Provider Name')).toBeInTheDocument();
        expect(screen.getByText('Provider Type')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(
            <ProviderConfigDialog
                open={true}
                onOpenChange={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Save Provider'));

        await waitFor(() => {
            expect(screen.getByText('Name is required')).toBeInTheDocument();
        });
    });

    it('calls addProvider for new provider', async () => {
        render(
            <ProviderConfigDialog
                open={true}
                onOpenChange={vi.fn()}
            />
        );

        fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'My Provider' } });
        // Assume default type is selected or select one

        fireEvent.click(screen.getByText('Save Provider'));

        await waitFor(() => {
            expect(mockAddProvider).toHaveBeenCalled();
        });
    });

    it('calls updateProvider for editing provider', async () => {
        const providerToEdit = {
            id: '123',
            name: 'Existing Provider',
            type: 'openai-compatible',
            enabled: true,
        };

        render(
            <ProviderConfigDialog
                open={true}
                onOpenChange={vi.fn()}
                provider={providerToEdit as any}
            />
        );

        fireEvent.click(screen.getByText('Save Provider'));

        await waitFor(() => {
            expect(mockUpdateProvider).toHaveBeenCalledWith('123', expect.objectContaining({
                name: 'Existing Provider'
            }));
        });
    });
});
