import { useAgentsStore, DEFAULT_AGENT } from './agents';

// Mock Dexie Storage to behave synchronously/in-memory for tests
vi.mock('@/infrastructure/persistence/dexie-storage', () => ({
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

    // Helper to generate valid agent data
    const getAgentData = (overrides: any = {}) => {
        const { id, createdAt, lastActive, tasksCompleted, successRate, tokensUsed, ...defaults } = DEFAULT_AGENT;
        return { ...defaults, ...overrides };
    };

    it('should initialize with default agent', () => {
        const { agents } = useAgentsStore.getState();
        expect(agents.length).toBe(1);
        expect(agents[0].id).toBe(DEFAULT_AGENT.id);
    });

    it('should add a new agent', () => {
        const newAgentData = getAgentData({
            name: 'Test Agent',
            status: 'online' as const,
            providerId: 'openrouter',
            modelId: 'test-model',
            description: 'Test description',
            temperature: 0.7,
            maxTokens: 1000,
            topP: 1,
        });

        const newAgent = useAgentsStore.getState().addAgent(newAgentData);

        const { agents } = useAgentsStore.getState();
        expect(agents.length).toBe(2);
        expect(newAgent.name).toBe('Test Agent');
        expect(newAgent.id).toMatch(/^agt_\d+_\w+$/);
        expect(newAgent.createdAt).toBeDefined();
    });

    it('should remove an agent', () => {
        // First add an agent
        const newAgent = useAgentsStore.getState().addAgent(getAgentData({
            name: 'To Remove',
            providerId: 'openrouter',
            modelId: 'test',
            description: 'Remove me',
        }));

        // Now remove it
        useAgentsStore.getState().removeAgent(newAgent.id);

        const { agents } = useAgentsStore.getState();
        expect(agents.find(a => a.id === newAgent.id)).toBeUndefined();
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

    it('should get agent by ID', () => {
        const agent = useAgentsStore.getState().getAgent(DEFAULT_AGENT.id);
        expect(agent).toBeDefined();
        expect(agent?.name).toBe(DEFAULT_AGENT.name);
    });

    it('should reset to defaults', () => {
        // Add some agents
        useAgentsStore.getState().addAgent(getAgentData({
            name: 'Extra 1',
            providerId: 'openrouter',
            modelId: 'test',
            description: 'Test',
        }));
        useAgentsStore.getState().addAgent(getAgentData({
            name: 'Extra 2',
            providerId: 'openrouter',
            modelId: 'test',
            description: 'Test',
        }));

        // Reset
        useAgentsStore.getState().resetToDefaults();

        const { agents } = useAgentsStore.getState();
        expect(agents.length).toBe(1);
        expect(agents[0].id).toBe(DEFAULT_AGENT.id);
    });
});
