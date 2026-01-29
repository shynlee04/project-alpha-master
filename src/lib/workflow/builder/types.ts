/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/lib/workflow/builder/types.ts
 * 
 * This module is disabled during Phase 1A. Workflow builder functionality
 * will be restored in Phase 2 when workflow features are re-enabled.
 */

console.log('[Phase 2] Workflow builder types disabled during Phase 1A');

export interface WorkflowNode {
  id: string;
  type: string;
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface WorkflowExecution {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
  results?: Record<string, unknown>;
}

export type WorkflowNodeType = 
  | 'trigger'
  | 'action'
  | 'condition'
  | 'delay'
  | 'agent'
  | 'tool';

export interface WorkflowBuilderState {
  workflow: Workflow | null;
  selectedNode: string | null;
  isDirty: boolean;
}
