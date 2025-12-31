import { useAgentsStore, DEFAULT_AGENT } from './agents-store';

// Mock Dexie Storage to behave synchronously/in-memory for tests
vi.mock('@/lib/state/dexie-storage', () => ({
    createDexieStorage: () => ({
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
    })
}));

describe('Agents Store', () => {
    beforeEach(() => {
        // Reset store to defaults before each test
        useAgentsStore.getState().resetToDefaults();
    });

    it('should initialize with default agent', () => {
        const { agents, activeAgentId } = useAgentsStore.getState();
        expect(agents.length).toBe(1);
        expect(agents[0].id).toBe(DEFAULT_AGENT.id);
        expect(activeAgentId).toBe(DEFAULT_AGENT.id);
    });

    it('should add a new agent', () => {
        const newAgentData = {
            name: 'Test Agent',
            role: 'Test Role',
            status: 'online' as const,
            provider: 'OpenRouter',
            model: 'test-model',
            description: 'Test description',
        };

        const newAgent = useAgentsStore.getState().addAgent(newAgentData);

        const { agents } = useAgentsStore.getState();
        expect(agents.length).toBe(2);
        expect(newAgent.name).toBe('Test Agent');
        expect(newAgent.id).toMatch(/^agt_\d+_\w+$/);
        expect(newAgent.createdAt).toBeDefined();
    });

    it('should remove an agent', () => {
        // First add an agent
        const newAgent = useAgentsStore.getState().addAgent({
            name: 'To Remove',
            role: 'Test',
            status: 'online',
            provider: 'OpenRouter',
            model: 'test',
            description: 'Remove me',
        });

        // Now remove it
        useAgentsStore.getState().removeAgent(newAgent.id);

        const { agents } = useAgentsStore.getState();
        expect(agents.find(a => a.id === newAgent.id)).toBeUndefined();
    });

    it('should switch active agent when removing the active one', () => {
        // Add a new agent
        const newAgent = useAgentsStore.getState().addAgent({
            name: 'New Active',
            role: 'Test',
            status: 'online',
            provider: 'OpenRouter',
            model: 'test',
            description: 'Test',
        });

        // Set it as active
        useAgentsStore.getState().setActiveAgent(newAgent.id);
        expect(useAgentsStore.getState().activeAgentId).toBe(newAgent.id);

        // Remove it
        useAgentsStore.getState().removeAgent(newAgent.id);

        // Should switch to default agent
        const { activeAgentId, agents } = useAgentsStore.getState();
        expect(activeAgentId).toBe(agents[0].id);
    });

    it('should update an agent', () => {
        const { agents } = useAgentsStore.getState();
        const firstAgent = agents[0];

        useAgentsStore.getState().updateAgent(firstAgent.id, { name: 'Updated Name' });

        const updated = useAgentsStore.getState().getAgent(firstAgent.id);
        expect(updated?.name).toBe('Updated Name');
        expect(updated?.lastActive).toBeDefined();
    });

    it('should update agent status', () => {
        const { agents } = useAgentsStore.getState();
        const firstAgent = agents[0];

        useAgentsStore.getState().updateAgentStatus(firstAgent.id, 'busy');

        const updated = useAgentsStore.getState().getAgent(firstAgent.id);
        expect(updated?.status).toBe('busy');
    });

    it('should set active agent', () => {
        // Add another agent
        const newAgent = useAgentsStore.getState().addAgent({
            name: 'Second Agent',
            role: 'Test',
            status: 'online',
            provider: 'OpenRouter',
            model: 'test',
            description: 'Test',
        });

        useAgentsStore.getState().setActiveAgent(newAgent.id);
        expect(useAgentsStore.getState().activeAgentId).toBe(newAgent.id);
    });

    it('should get agent by ID', () => {
        const agent = useAgentsStore.getState().getAgent(DEFAULT_AGENT.id);
        expect(agent).toBeDefined();
        expect(agent?.name).toBe(DEFAULT_AGENT.name);
    });

    it('should reset to defaults', () => {
        // Add some agents
        useAgentsStore.getState().addAgent({
            name: 'Extra 1',
            role: 'Test',
            status: 'online',
            provider: 'OpenRouter',
            model: 'test',
            description: 'Test',
        });
        useAgentsStore.getState().addAgent({
            name: 'Extra 2',
            role: 'Test',
            status: 'online',
            provider: 'OpenRouter',
            model: 'test',
            description: 'Test',
        });

        // Reset
        useAgentsStore.getState().resetToDefaults();

        const { agents, activeAgentId } = useAgentsStore.getState();
        expect(agents.length).toBe(1);
        expect(agents[0].id).toBe(DEFAULT_AGENT.id);
        expect(activeAgentId).toBe(DEFAULT_AGENT.id);
    });
});
