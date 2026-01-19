/**
 * @fileoverview Agent Config Dialog Documentation
 * @module presentation/components/agent
 *
 * This file documents the refactoring strategy for AgentConfigDialog.tsx.
 *
 * CURRENT STATE: 1089 LOC
 * STATUS: Deferred to dedicated UI component refactoring sprint
 *
 * REFACTORING STRATEGY:
 *
 * AgentConfigDialog.tsx should be split into focused components:
 *
 * 1. agent-config-dialog-types.ts (DONE - ~50 LOC)
 *    - Type definitions (ConnectionStatus, ConfigTab, FormErrors, AgentConfigDialogProps)
 *
 * 2. agent-config-dialog-utils.ts (DONE - ~40 LOC)
 *    - Helper functions (mapProviderNameToId, getProviderIcon)
 *
 * 3. agent-config-validation.ts (~100 LOC)
 *    - Form schema (agentFormSchema)
 *    - Validation functions
 *    - Error handling utilities
 *
 * 4. BasicConfigPanel.tsx (~250 LOC)
 *    - Basic settings tab (name, description, provider, model)
 *    - Provider selection UI
 *    - Model selection with search/filter
 *    - Form validation for basic fields
 *
 * 5. AdvancedConfigPanel.tsx (~250 LOC)
 *    - Advanced settings tab (temperature, tokens, top_p, top_k)
 *    - System prompt editor
 *    - Native tools toggle
 *    - Custom model configuration
 *
 * 6. CredentialsPanel.tsx (~200 LOC)
 *    - API key management
 *    - Connection testing
 *    - Key validation
 *    - Save/delete key operations
 *
 * 7. AgentConfigDialog.tsx (~150 LOC orchestrator)
 *    - Main dialog structure
 *    - Tab navigation
 *    - Form submission logic
 *    - State management coordination
 *
 * ACCEPTANCE CRITERIA:
 * ✓ Each component <300 LOC
 * ✓ Build passes
 * ✓ No functionality lost
 * ✓ All tests pass
 * ✓ Component reusability improved
 *
 * DEPENDENCIES:
 * - Requires dedicated refactoring sprint
 * - Needs comprehensive UI testing
 * - Should update component snapshots
 * - Must verify form validation still works
 *
 * REFERENCE:
 * - Original file: src/presentation/components/agent/AgentConfigDialog.tsx (1089 LOC)
 * - Epic: P0.5 - Redesign Agent Configuration Flow
 * - Design System: _bmad-output/design-system-8bit-2025-12-25.md
 *
 * @deprecated This file is documentation only. Implement the refactoring in a dedicated sprint.
 */
