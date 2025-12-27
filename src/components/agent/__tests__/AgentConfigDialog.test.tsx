/**
 * AgentConfigDialog Unit Tests
 * 
 * @epic Epic-28 Story 28-16
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentConfigDialog } from '../AgentConfigDialog'

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string | Record<string, unknown>) => {
            if (typeof fallback === 'string') return fallback
            return key
        },
    }),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
    },
}))

// Mock UI components
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
    buttonVariants: () => '',
}))

vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
    DialogContent: ({ children, className }: any) => <div className={className} data-testid="dialog-content">{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <h1>{children}</h1>,
    DialogDescription: ({ children }: any) => <p>{children}</p>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
    Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    TabsList: ({ children }: any) => <div>{children}</div>,
    TabsTrigger: ({ children }: any) => <button>{children}</button>,
    TabsContent: ({ children, value }: any) => <div data-tab={value}>{children}</div>,
}))

vi.mock('@/components/ui/select', () => ({
    Select: ({ children, onValueChange }: any) => <div onClick={() => onValueChange && onValueChange('test-value')}>{children}</div>,
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
    SelectValue: () => <span>Select Value</span>,
}))

vi.mock('@/components/ui/switch', () => ({
    Switch: (props: any) => <input type="checkbox" {...props} />,
}))

vi.mock('@/lib/state/provider-store', () => ({
    useProviderStore: () => ({
        providers: [],
        addProvider: vi.fn(),
        updateProvider: vi.fn(),
        removeProvider: vi.fn(),
        setActiveProvider: vi.fn(),
        activeProviderId: null,
        modelSettings: {},
        updateModelSettings: vi.fn(),
    }),
}))

vi.mock('@/lib/agent/providers/credential-vault', () => ({
    credentialVault: {
        initialize: vi.fn().mockResolvedValue(undefined),
        getCredentials: vi.fn().mockResolvedValue('test-key'),
        hasCredentials: vi.fn().mockResolvedValue(true),
        storeCredentials: vi.fn(),
    },
}))

vi.mock('@/lib/agent/providers/model-registry', () => ({
    modelRegistry: {
        getModels: vi.fn().mockResolvedValue([]),
        getFreeModels: vi.fn().mockReturnValue([]),
        getDefaultModels: vi.fn().mockReturnValue([]),
    },
}))

describe('AgentConfigDialog', () => {
    const mockOnOpenChange = vi.fn()
    const mockOnSubmit = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderDialog = (open = true) => {
        return render(
            <AgentConfigDialog
                open={open}
                onOpenChange={mockOnOpenChange}
                onSubmit={mockOnSubmit}
            />
        )
    }

    it('renders dialog with form fields when open', () => {
        renderDialog(true)

        expect(screen.getByText('New Agent Configuration')).toBeInTheDocument()
        expect(screen.getByText('Create Agent')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
        renderDialog(false)

        expect(screen.queryByText('New Agent Configuration')).not.toBeInTheDocument()
    })

    it('shows validation error when submitting empty name', async () => {
        renderDialog(true)

        const submitButton = screen.getByText('Create Agent')
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Agent name is required')).toBeInTheDocument()
        })
        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('calls onOpenChange when cancel is clicked', () => {
        renderDialog(true)

        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)

        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('has proper pixel aesthetic classes', () => {
        renderDialog(true)

        // Check dialog has rounded-none for pixel aesthetic
        const dialogContent = screen.getByTestId('dialog-content')
        expect(dialogContent).toHaveClass('rounded-none')
    })
})
