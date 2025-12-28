import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentConfigDialog } from '../AgentConfigDialog'
import { useAgentsStore } from '@/stores/agents-store'

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (typeof options === 'string') return options;
            if (options?.defaultValue) return options.defaultValue;
            if (key === 'agents.config.validation.nameRequired') return 'Agent name is required';
            if (key === 'agents.config.delete') return 'Delete';
            if (key === 'agents.config.confirmDelete') return 'Are you sure?'; // For window.confirm
            // Return fallback logic typical of i18next
            if (key === 'agents.config.save') return 'Create Agent';
            if (key === 'agents.config.update') return 'Update Agent';
            return key;
        },
    }),
}))

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

// Mock internal UI components to simplify DOM
vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <div>{children}</div>,
    DialogDescription: ({ children }: any) => <div>{children}</div>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/components/ui/select', () => ({
    Select: ({ children, onValueChange, value, disabled }: any) => (
        <select
            data-testid="select-root"
            value={value}
            onChange={e => onValueChange(e.target.value)}
            disabled={disabled}
        >
            {children}
        </select>
    ),
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: () => null,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}))

vi.mock('@/lib/agent/providers/credential-vault', () => ({
    credentialVault: {
        initialize: vi.fn().mockResolvedValue(undefined),
        getCredentials: vi.fn().mockResolvedValue('test-key'),
        hasCredentials: vi.fn().mockResolvedValue(true),
        storeCredentials: vi.fn().mockResolvedValue(true),
    },
}))

// Mock model registry to return predictable models
vi.mock('@/lib/agent/providers/model-registry', () => ({
    modelRegistry: {
        getModels: vi.fn().mockResolvedValue([{ id: 'test-model', name: 'Test Model' }]),
        getFreeModels: vi.fn().mockReturnValue([{ id: 'free-model', name: 'Free Model' }]),
        getDefaultModels: vi.fn().mockReturnValue([{ id: 'default-model', name: 'Default Model' }]),
    },
}))

describe('AgentConfigDialog Integration', () => {
    const mockOnOpenChange = vi.fn()
    const mockOnSuccess = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        // Reset store
        useAgentsStore.setState({
            agents: [],
            activeAgentId: null,
            _hasHydrated: true
        })
    })

    it('creates a new agent via store actions', async () => {
        render(
            <AgentConfigDialog
                open={true}
                onOpenChange={mockOnOpenChange}
                onSuccess={mockOnSuccess}
            />
        )

        // Fill form
        const inputName = screen.getByPlaceholderText('Enter agent name...')
        fireEvent.change(inputName, {
            target: { value: 'Integration Agent' }
        })

        // Select provider (mocked Select)
        const selects = screen.getAllByTestId('select-root')
        // Provider select is first
        fireEvent.change(selects[0], { target: { value: 'openrouter' } })

        // Wait for models to load (useEffect)
        await waitFor(() => {
            // Just wait a tick
        })

        // Select model - mocked select triggers onValueChange
        fireEvent.change(selects[1], { target: { value: 'free-model' } })

        // Submit - find the button by text 'Create Agent'
        const createBtn = screen.getByText('Create Agent')
        fireEvent.click(createBtn)

        // Assert
        // Check if store action was called implicitly by checking store state
        // Since we are using the real store (initialized in beforeEach), we can check it.
        await waitFor(() => {
            const agents = useAgentsStore.getState().agents
            expect(agents.length).toBeGreaterThan(0)
            expect(agents.find(a => a.name === 'Integration Agent')).toBeTruthy()
        })

        // Check if SUCCESS callback was called
        expect(mockOnSuccess).toHaveBeenCalled()
    })

    it('validates required fields', async () => {
        render(<AgentConfigDialog open={true} onOpenChange={mockOnOpenChange} />)

        // Find create button
        const createBtn = screen.getByText('Create Agent')
        fireEvent.click(createBtn)

        // Expect validation error
        // Note: checking for error text. "Agent name is required"
        await waitFor(() => {
            expect(screen.getByText('Agent name is required')).toBeTruthy()
        })
    })
})
