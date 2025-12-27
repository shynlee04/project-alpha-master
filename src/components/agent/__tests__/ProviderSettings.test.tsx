import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProviderSettings } from '../ProviderSettings';
import { useProviderStore } from '@/lib/state/provider-store';

// Mock translations
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock store
vi.mock('@/lib/state/provider-store', () => ({
    useProviderStore: vi.fn(),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
}));

vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: any) => open ? <div role="dialog">{children}</div> : null,
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <div>{children}</div>,
    DialogDescription: ({ children }: any) => <div>{children}</div>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock ProviderConfigDialog
vi.mock('../ProviderConfigDialog', () => ({
    ProviderConfigDialog: ({ open, provider }: any) => open ? <div data-testid="config-dialog">{provider ? 'Editing ' + provider.name : 'Adding Provider'}</div> : null,
}));


describe('ProviderSettings', () => {
    const mockRemoveProvider = vi.fn();
    const mockProviders = [
        { id: '1', name: 'Provider 1', type: 'openai', enabled: true },
        { id: '2', name: 'Provider 2', type: 'openai-compatible', enabled: true },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useProviderStore as any).mockReturnValue({
            providers: mockProviders,
            removeProvider: mockRemoveProvider,
        });
    });

    it('renders list of providers', () => {
        render(<ProviderSettings />);
        expect(screen.getByText('Provider 1')).toBeInTheDocument();
        expect(screen.getByText('Provider 2')).toBeInTheDocument();
    });

    it('shows add provider button', () => {
        render(<ProviderSettings />);
        expect(screen.getByText('Add Provider')).toBeInTheDocument();
    });

    it('opens add dialog when add button clicked', () => {
        render(<ProviderSettings />);
        fireEvent.click(screen.getByText('Add Provider'));
        expect(screen.getByTestId('config-dialog')).toHaveTextContent('Adding Provider');
    });

    it('opens edit dialog when edit button clicked', () => {
        render(<ProviderSettings />);
        const editButtons = screen.getAllByRole('button', { name: /edit/i });
        fireEvent.click(editButtons[0]);
        expect(screen.getByTestId('config-dialog')).toHaveTextContent('Editing Provider 1');
    });

    it('opens confirmation dialog and calls removeProvider when confirmed', async () => {
        render(<ProviderSettings />);

        // Click delete button for first provider
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);

        // Expect dialog to be open
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/Delete Provider\?/)).toBeInTheDocument();

        // Find "Delete" button in dialog (might be tricky if multiple buttons have text "Delete", 
        // usually confirm button is final one or has specific variant).
        // In my implementation: <Button variant="destructive" onClick={executeDelete}>Delete</Button>
        // and <Button ... onClick={() => confirmDelete(provider)} aria-label="Delete provider">
        // The dialog button typically has text "Delete".

        // Use regex for exact match or specific query if needed.
        // My mock renders children directly.
        const confirmButton = screen.getByText('Delete', { selector: 'button' });
        fireEvent.click(confirmButton);

        expect(mockRemoveProvider).toHaveBeenCalledWith('1');
    });
});
