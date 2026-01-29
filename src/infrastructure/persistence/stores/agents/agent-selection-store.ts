/**
 * PHASE 2 STUB: Agent Selection Store
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/agents/agent-selection-store.ts
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

import { create } from 'zustand';
import type { AgentData } from './types';

export interface AgentSelectionState {
  activeAgentId: string | null;
  defaultAgentIds: Record<string, string | null>;
  lastSelectedAgentIds: Record<string, string | null>;
  _hasHydrated: boolean;
  setActiveAgent: (agentId: string | null, workspaceType: string) => void;
  setDefaultAgent: (agentId: string, workspaceType: string) => void;
  getActiveAgent: () => AgentData | null;
  setHasHydrated: (hasHydrated: boolean) => void;
  reset: () => void;
}

export const useAgentSelectionStore = create<AgentSelectionState>()(() => ({
  activeAgentId: null,
  defaultAgentIds: { ide: null, knowledge: null, study: null, notes: null },
  lastSelectedAgentIds: { ide: null, knowledge: null, study: null, notes: null },
  _hasHydrated: true,
  setActiveAgent: () => {
    console.log('[AgentSelectionStore STUB] Phase 2 feature - setActiveAgent skipped');
  },
  setDefaultAgent: () => {
    console.log('[AgentSelectionStore STUB] Phase 2 feature - setDefaultAgent skipped');
  },
  getActiveAgent: () => null,
  setHasHydrated: () => {},
  reset: () => {},
}));

export const useAgentSelection = useAgentSelectionStore;

export function useActiveAgent(_agents: AgentData[]): AgentData | null {
  return null;
}

export function getActiveAgent(): AgentData | null {
  return null;
}

export function getAgentForWorkspace(_workspaceType: string): AgentData | null {
  return null;
}

export function selectAgentForWorkspace(_workspaceType: string): void {
  console.log('[AgentSelection STUB] Phase 2 feature - selectAgentForWorkspace skipped');
}
