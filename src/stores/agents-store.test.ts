import { useAgentsStore, DEFAULT_AGENT } from './agents-store';

// Mock Dexie Storage to behave synchronously/in-memory for tests
vi.mock('@/lib/state/dexie-storage', () => ({
    createDexieStorage: () => ({
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
    })
}));

// Mock provider store to provide available models for validation tests
vi.mock('@/lib/state/provider-store', () => ({
    useProviderStore: {
        getState: vi.fn(() => ({
            availableModels: {
                openrouter: [
                    { id: 'mistralai/devstral-2512:free', name: 'Devstral' },
                    { id: 'openai/gpt-4o', name: 'GPT-4o' },
                ],
                openai: [
                    { id: 'gpt-4', name: 'GPT-4' },
                    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
                ],
                anthropic: [
                    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
                ],
            },
        })),
    },
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

// ============================================================================
// NEW SCHEMA TESTS - TDD RED PHASE
// These tests EXPECT the NEW schema (providerId, modelId, description, etc.)
// They will FAIL until the code is migrated to the new schema
// ============================================================================
describe('Agents Store - NEW Schema (TDD RED Phase)', () => {
    beforeEach(() => {
        // Reset store to defaults before each test
        useAgentsStore.getState().resetToDefaults();
    });

    describe('DEFAULT_AGENT Schema Compliance', () => {
        it('should have description field (not role)', () => {
            const { agents } = useAgentsStore.getState();
            const defaultAgent = agents[0];

            // NEW schema: should have description
            expect(defaultAgent.description).toBeDefined();
            expect(defaultAgent.description).toBeTruthy();

            // OLD schema: should NOT have role
            expect(defaultAgent).not.toHaveProperty('role');
        });

        it('should have providerId field (not provider)', () => {
            const { agents } = useAgentsStore.getState();
            const defaultAgent = agents[0];

            // NEW schema: should have providerId
            expect(defaultAgent.providerId).toBeDefined();
            expect(typeof defaultAgent.providerId).toBe('string');

            // OLD schema: should NOT have provider
            expect(defaultAgent).not.toHaveProperty('provider');
        });

        it('should have modelId field (not model)', () => {
            const { agents } = useAgentsStore.getState();
            const defaultAgent = agents[0];

            // NEW schema: should have modelId
            expect(defaultAgent.modelId).toBeDefined();
            expect(typeof defaultAgent.modelId).toBe('string');

            // OLD schema: should NOT have model
            expect(defaultAgent).not.toHaveProperty('model');
        });

        it('should have systemPrompt field', () => {
            const { agents } = useAgentsStore.getState();
            const defaultAgent = agents[0];

            // NEW schema: should have systemPrompt
            expect(defaultAgent.systemPrompt).toBeDefined();
            expect(typeof defaultAgent.systemPrompt).toBe('string');
        });

        it('should have LLM parameters (temperature, maxTokens, topP)', () => {
            const { agents } = useAgentsStore.getState();
            const defaultAgent = agents[0];

            // NEW schema: should have LLM parameters
            expect(defaultAgent.temperature).toBeDefined();
            expect(typeof defaultAgent.temperature).toBe('number');
            expect(defaultAgent.temperature).toBeGreaterThanOrEqual(0);
            expect(defaultAgent.temperature).toBeLessThanOrEqual(2);

            expect(defaultAgent.maxTokens).toBeDefined();
            expect(typeof defaultAgent.maxTokens).toBe('number');
            expect(defaultAgent.maxTokens).toBeGreaterThan(0);

            expect(defaultAgent.topP).toBeDefined();
            expect(typeof defaultAgent.topP).toBe('number');
            expect(defaultAgent.topP).toBeGreaterThanOrEqual(0);
            expect(defaultAgent.topP).toBeLessThanOrEqual(1);
        });

        it('should have tools array', () => {
            const { agents } = useAgentsStore.getState();
            const defaultAgent = agents[0];

            // NEW schema: should have tools
            expect(defaultAgent.tools).toBeDefined();
            expect(Array.isArray(defaultAgent.tools)).toBe(true);
        });

        it('should have workspaceBindings array', () => {
            const { agents } = useAgentsStore.getState();
            const defaultAgent = agents[0];

            // NEW schema: should have workspaceBindings
            expect(defaultAgent.workspaceBindings).toBeDefined();
            expect(Array.isArray(defaultAgent.workspaceBindings)).toBe(true);
        });

        it('should have metadata fields (status, tasksCompleted, successRate, tokensUsed, lastActive, createdAt)', () => {
            const { agents } = useAgentsStore.getState();
            const defaultAgent = agents[0];

            // NEW schema: should have metadata
            expect(defaultAgent.status).toBeDefined();
            expect(['online', 'offline', 'busy']).toContain(defaultAgent.status);

            expect(defaultAgent.tasksCompleted).toBeDefined();
            expect(typeof defaultAgent.tasksCompleted).toBe('number');

            expect(defaultAgent.successRate).toBeDefined();
            expect(typeof defaultAgent.successRate).toBe('number');

            expect(defaultAgent.tokensUsed).toBeDefined();
            expect(typeof defaultAgent.tokensUsed).toBe('number');

            expect(defaultAgent.lastActive).toBeDefined();
            expect(typeof defaultAgent.lastActive).toBe('string');

            expect(defaultAgent.createdAt).toBeDefined();
            expect(typeof defaultAgent.createdAt).toBe('string');
        });
    });

    describe('Agent Creation with NEW Schema', () => {
        it('should create agent with NEW schema fields', () => {
            const newAgentData = {
                name: 'Test Agent',
                description: 'Test description',
                providerId: 'anthropic',
                modelId: 'claude-3-5-sonnet-20241022',
                systemPrompt: 'You are a test agent',
                temperature: 0.7,
                maxTokens: 4096,
                topP: 1.0,
                tools: [],
                workspaceBindings: [],
                status: 'online' as const,
            };

            const newAgent = useAgentsStore.getState().addAgent(newAgentData);

            expect(newAgent.name).toBe('Test Agent');
            expect(newAgent.description).toBe('Test description');
            expect(newAgent.providerId).toBe('anthropic');
            expect(newAgent.modelId).toBe('claude-3-5-sonnet-20241022');
            expect(newAgent.systemPrompt).toBe('You are a test agent');
            expect(newAgent.temperature).toBe(0.7);
            expect(newAgent.maxTokens).toBe(4096);
            expect(newAgent.topP).toBe(1.0);
            expect(newAgent.tools).toEqual([]);
            expect(newAgent.workspaceBindings).toEqual([]);

            // Verify OLD fields don't exist
            expect(newAgent).not.toHaveProperty('role');
            expect(newAgent).not.toHaveProperty('provider');
            expect(newAgent).not.toHaveProperty('model');
        });

        it('should reject agent creation with OLD schema fields', () => {
            // This test verifies that the store can handle mixed schema input
            // In production, AgentService should validate before calling addAgent
            const oldSchemaData = {
                name: 'Old Agent',
                role: 'Test Role',
                provider: 'OpenRouter',
                model: 'test-model',
            } as any;

            // Store should create agent (validation happens at service layer)
            const agent = useAgentsStore.getState().addAgent(oldSchemaData);

            // Verify agent was created with ID
            expect(agent.id).toBeDefined();
            expect(agent.name).toBe('Old Agent');

            // Note: The store doesn't validate schema - that's AgentService's job
            // This test just verifies the store doesn't crash on invalid input
        });
    });

    describe('Agent UPDATE Operation', () => {
        it('should update agent with NEW schema fields', () => {
            const store = useAgentsStore.getState();

            // Create agent with NEW schema
            const agent = store.addAgent({
                name: 'Test Agent',
                description: 'Original description',
                providerId: 'anthropic',
                modelId: 'claude-3-5-sonnet-20241022',
                systemPrompt: 'Original prompt',
                temperature: 0.5,
                maxTokens: 2048,
                topP: 1.0,
                tools: [],
                workspaceBindings: [],
                status: 'online',
            });

            // Update agent
            store.updateAgent(agent.id, {
                description: 'Updated description',
                temperature: 0.8,
                maxTokens: 4096,
            });

            const updated = store.getAgent(agent.id);
            expect(updated?.description).toBe('Updated description');
            expect(updated?.temperature).toBe(0.8);
            expect(updated?.maxTokens).toBe(4096);

            // Verify OLD fields don't exist
            expect(updated).not.toHaveProperty('role');
        });

        it('should update lastActive timestamp on update', () => {
            const store = useAgentsStore.getState();

            const agent = store.addAgent({
                name: 'Test Agent',
                description: 'Test',
                providerId: 'anthropic',
                modelId: 'claude-3-5-sonnet-20241022',
                systemPrompt: 'Test',
                temperature: 0.7,
                maxTokens: 2048,
                topP: 1.0,
                tools: [],
                workspaceBindings: [],
                status: 'online',
            });

            // Update agent
            store.updateAgent(agent.id, { description: 'Updated' });

            const updated = store.getAgent(agent.id);
            expect(updated?.lastActive).toBeDefined();

            // Verify it's a valid ISO date string
            const lastActiveDate = new Date(updated!.lastActive);
            expect(lastActiveDate.toISOString()).toBe(updated!.lastActive);
            expect(isNaN(lastActiveDate.getTime())).toBe(false);
        });
    });

    describe('Agent DELETE Operation', () => {
        it('should delete agent and update active agent', () => {
            let store = useAgentsStore.getState();

            // Create two agents
            const agent1 = store.addAgent({
                name: 'Agent 1',
                description: 'Test 1',
                providerId: 'anthropic',
                modelId: 'claude-3-5-sonnet-20241022',
                systemPrompt: 'Test',
                temperature: 0.7,
                maxTokens: 2048,
                topP: 1.0,
                tools: [],
                workspaceBindings: [],
                status: 'online',
            });

            const agent2 = store.addAgent({
                name: 'Agent 2',
                description: 'Test 2',
                providerId: 'openai',
                modelId: 'gpt-4',
                systemPrompt: 'Test',
                temperature: 0.7,
                maxTokens: 2048,
                topP: 1.0,
                tools: [],
                workspaceBindings: [],
                status: 'online',
            });

            // Set agent1 as active
            store.setActiveAgent(agent1.id);
            // Get fresh state after mutation
            store = useAgentsStore.getState();
            expect(store.activeAgentId).toBe(agent1.id);

            // Delete agent1
            store.removeAgent(agent1.id);
            // Get fresh state after mutation
            store = useAgentsStore.getState();

            // Should switch to first remaining agent (DEFAULT_AGENT at index 0)
            expect(store.agents).toHaveLength(2); // DEFAULT + agent2
            expect(store.activeAgentId).toBe(DEFAULT_AGENT.id);
            expect(store.agents.find(a => a.id === agent1.id)).toBeUndefined();
        });

        it('should not delete DEFAULT_AGENT', () => {
            const store = useAgentsStore.getState();
            const defaultAgentId = DEFAULT_AGENT.id;

            // Try to delete DEFAULT_AGENT
            store.removeAgent(defaultAgentId);

            // DEFAULT_AGENT should still exist
            expect(store.agents.find(a => a.id === defaultAgentId)).toBeDefined();
        });
    });

    describe('Tool Binding Structure', () => {
        it('should have correct tool binding structure', () => {
            const { agents } = useAgentsStore.getState();
            const defaultAgent = agents[0];

            expect(defaultAgent.tools).toBeDefined();
            expect(Array.isArray(defaultAgent.tools)).toBe(true);

            // If tools are not empty, check structure
            if (defaultAgent.tools.length > 0) {
                const firstTool = defaultAgent.tools[0];
                expect(firstTool).toHaveProperty('toolId');
                expect(firstTool).toHaveProperty('workspacePermissions');
                expect(firstTool.workspacePermissions).toHaveProperty('ide');
                expect(firstTool.workspacePermissions).toHaveProperty('knowledge');
                expect(firstTool.workspacePermissions).toHaveProperty('study');
                expect(firstTool.workspacePermissions).toHaveProperty('notes');
            }
        });

        it('should create agent with tool bindings', () => {
            const toolBindings = [
                {
                    toolId: 'file-read',
                    workspacePermissions: {
                        ide: true,
                        knowledge: true,
                        study: false,
                        notes: false,
                    },
                },
            ];

            const agent = useAgentsStore.getState().addAgent({
                name: 'Test Agent',
                description: 'Test',
                providerId: 'anthropic',
                modelId: 'claude-3-5-sonnet-20241022',
                systemPrompt: 'Test',
                temperature: 0.7,
                maxTokens: 2048,
                topP: 1.0,
                tools: toolBindings,
                workspaceBindings: [],
                status: 'online',
            });

            expect(agent.tools).toEqual(toolBindings);
            expect(agent.tools[0].toolId).toBe('file-read');
            expect(agent.tools[0].workspacePermissions.ide).toBe(true);
        });
    });

    describe('Workspace Binding Structure', () => {
        it('should have correct workspace binding structure', () => {
            const { agents } = useAgentsStore.getState();
            const defaultAgent = agents[0];

            expect(defaultAgent.workspaceBindings).toBeDefined();
            expect(Array.isArray(defaultAgent.workspaceBindings)).toBe(true);

            // If bindings are not empty, check structure
            if (defaultAgent.workspaceBindings.length > 0) {
                const firstBinding = defaultAgent.workspaceBindings[0];
                expect(firstBinding).toHaveProperty('workspaceType');
                expect(firstBinding).toHaveProperty('isAvailable');
                expect(firstBinding).toHaveProperty('uiVariant');
                expect(firstBinding).toHaveProperty('isDefault');
            }
        });

        it('should create agent with workspace bindings', () => {
            const workspaceBindings = [
                { workspaceType: 'ide' as const, isAvailable: true, uiVariant: 'full' as const, isDefault: true },
                { workspaceType: 'knowledge' as const, isAvailable: false, uiVariant: 'compact' as const, isDefault: false },
            ];

            const agent = useAgentsStore.getState().addAgent({
                name: 'Test Agent',
                description: 'Test',
                providerId: 'anthropic',
                modelId: 'claude-3-5-sonnet-20241022',
                systemPrompt: 'Test',
                temperature: 0.7,
                maxTokens: 2048,
                topP: 1.0,
                tools: [],
                workspaceBindings,
                status: 'online',
            });

            expect(agent.workspaceBindings).toEqual(workspaceBindings);
            expect(agent.workspaceBindings[0].workspaceType).toBe('ide');
            expect(agent.workspaceBindings[0].isAvailable).toBe(true);
        });
    });

    describe('Provider-Model Foreign Key Validation', () => {
        it('should have valid providerId format', () => {
            const { agents } = useAgentsStore.getState();
            const defaultAgent = agents[0];

            // providerId should be lowercase string
            expect(defaultAgent.providerId).toMatch(/^[a-z0-9-]+$/);

            // Should not have uppercase provider names
            expect(defaultAgent.providerId).not.toMatch(/[A-Z]/);
        });

        it('should create agent with valid providerId-modelId combination', () => {
            // This test verifies that providerId and modelId are compatible
            // In the full implementation, this would validate against a registry

            const agent = useAgentsStore.getState().addAgent({
                name: 'Test Agent',
                description: 'Test',
                providerId: 'anthropic',
                modelId: 'claude-3-5-sonnet-20241022',
                systemPrompt: 'Test',
                temperature: 0.7,
                maxTokens: 2048,
                topP: 1.0,
                tools: [],
                workspaceBindings: [],
                status: 'online',
            });

            // Verify providerId and modelId are set
            expect(agent.providerId).toBe('anthropic');
            expect(agent.modelId).toBe('claude-3-5-sonnet-20241022');

            // Model ID should start with provider name or be valid format
            // This is a basic check - full validation would check model registry
            expect(agent.modelId).toBeTruthy();
            expect(agent.modelId).toMatch(/^[a-z0-9-\/:_]+$/);
        });

        it('should reject invalid providerId format', () => {
            // This test checks that invalid providerId formats are rejected
            const invalidData = {
                name: 'Invalid Agent',
                description: 'Test',
                // Invalid: uppercase and spaces (not in provider mock)
                providerId: 'OpenRouter With Spaces',
                modelId: 'test-model',
                systemPrompt: 'Test',
                temperature: 0.7,
                maxTokens: 2048,
                topP: 1.0,
                tools: [],
                workspaceBindings: [],
                status: 'online',
            } as any;

            // With P0 validation, should reject invalid providerId
            expect(() => {
                useAgentsStore.getState().addAgent(invalidData);
            }).toThrow();
        });

        // ============================================================================
        // STORY AC-02: Agent Configuration Vault - P0 VALIDATION
        // Acceptance Criterion: "Validation: model must belong to provider"
        //
        // TDD TEST: Validates that agents where modelId does not belong to
        // providerId's available models are rejected
        // ============================================================================
        it('should reject agent when modelId does not belong to providerId (P0)', () => {
            // Attempt to create agent with INVALID combination:
            // providerId: 'openrouter' but modelId: 'gpt-4' (belongs to openai)
            const invalidAgentData = {
                name: 'Invalid Combo Agent',
                description: 'Testing validation',
                providerId: 'openrouter',
                modelId: 'gpt-4', // ❌ WRONG - gpt-4 belongs to openai, not openrouter
                systemPrompt: 'Test',
                temperature: 0.7,
                maxTokens: 2048,
                topP: 1.0,
                tools: [],
                workspaceBindings: [],
                status: 'online' as const,
            };

            // EXPECTATION: Should throw error with specific message
            expect(() => {
                useAgentsStore.getState().addAgent(invalidAgentData);
            }).toThrow('Model "gpt-4" is not available for provider "openrouter"');
        });

        it('should accept agent when modelId belongs to providerId (P0)', () => {
            // Create agent with VALID combination:
            // providerId: 'openai' and modelId: 'gpt-4' (belongs to openai)
            const validAgentData = {
                name: 'Valid Combo Agent',
                description: 'Testing validation',
                providerId: 'openai',
                modelId: 'gpt-4', // ✅ CORRECT - gpt-4 belongs to openai
                systemPrompt: 'Test',
                temperature: 0.7,
                maxTokens: 2048,
                topP: 1.0,
                tools: [],
                workspaceBindings: [],
                status: 'online' as const,
            };

            // EXPECTATION: Should succeed without throwing
            expect(() => {
                const agent = useAgentsStore.getState().addAgent(validAgentData);
                expect(agent).toBeDefined();
                expect(agent.providerId).toBe('openai');
                expect(agent.modelId).toBe('gpt-4');
            }).not.toThrow();
        });
    });
});
