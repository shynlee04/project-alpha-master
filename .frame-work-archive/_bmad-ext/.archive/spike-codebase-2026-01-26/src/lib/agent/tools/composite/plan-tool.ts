/**
 * @fileoverview Plan Composite Tool
 * @module lib/agent/tools/composite/plan-tool
 *
 * Composite agentic tool for task decomposition and planning:
 * 1. Analyze objective
 * 2. Decompose into tasks
 * 3. Identify dependencies
 * 4. Create timeline with milestones
 *
 * @epic EPIC-TOOLS - Agentic Tool Architecture
 * @story TOOLS-02 - Composite Tool Implementations
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import {
  type PlanResult,
  type PlanTask,
  type PlanMilestone,
  type CompositeToolContext,
} from './types';

/**
 * Plan tool input schema
 */
export const PlanInputSchema = z.object({
  objective: z.string().describe('The goal or objective to plan for'),
  constraints: z.array(z.string()).optional()
    .describe('Constraints or requirements to consider'),
  timeframe: z.string().optional()
    .describe('Expected timeframe (e.g., "2 weeks", "3 months")'),
  granularity: z.enum(['high', 'medium', 'detailed']).optional().default('medium')
    .describe('Level of task breakdown detail'),
  context: z.string().optional()
    .describe('Additional context or background information'),
  includeRisks: z.boolean().optional().default(true)
    .describe('Include risk assessment'),
});

export type PlanInput = z.infer<typeof PlanInputSchema>;

/**
 * Plan tool definition
 */
export const planDef = toolDefinition({
  name: 'plan',
  description: `Create a structured plan with tasks, dependencies, and milestones.
This composite tool performs task decomposition:
1. Analyzes the objective and constraints
2. Breaks down into actionable tasks
3. Identifies task dependencies
4. Creates milestones and timeline
5. Assesses potential risks

Use this when you need to:
- Break down a complex project
- Create a development roadmap
- Plan feature implementation
- Organize work with dependencies`,
  inputSchema: PlanInputSchema,
  needsApproval: false, // Planning is read-only
});

/**
 * Create plan composite tool client implementation
 */
export function createPlanTool(getContext: () => CompositeToolContext) {
  return planDef.client(async (input: unknown): Promise<PlanResult> => {
    const args = input as PlanInput;
    const context = getContext();

    try {
      // Step 1: Analyze and decompose
      console.log('[PlanTool] Step 1: Analyzing objective...');

      const taskCount = {
        high: 5,
        medium: 10,
        detailed: 20,
      }[args.granularity || 'medium'];

      const planPrompt = `Create a structured plan for the following objective:

Objective: ${args.objective}

${args.constraints?.length ? `Constraints:\n${args.constraints.map(c => `- ${c}`).join('\n')}` : ''}
${args.timeframe ? `Timeframe: ${args.timeframe}` : ''}
${args.context ? `Context: ${args.context}` : ''}

Create approximately ${taskCount} tasks with dependencies.

Provide the plan as JSON:
{
  "title": "Plan title",
  "objective": "Refined objective statement",
  "tasks": [
    {
      "id": "task-1",
      "title": "Task title",
      "description": "What needs to be done",
      "dependencies": ["task-0"],
      "estimatedDuration": "2 hours",
      "priority": "high|medium|low"
    }
  ],
  "milestones": [
    {
      "id": "m1",
      "title": "Milestone title",
      "tasks": ["task-1", "task-2"],
      "deliverables": ["What gets delivered"]
    }
  ],
  "timeline": "Estimated overall timeline",
  "risks": ["Potential risk 1", "Risk 2"]
}`;

      const planResponse = await context.callAI(planPrompt, {
        temperature: 0.4,
        systemPrompt: `You are a project planning expert. Create clear, actionable plans with well-defined dependencies.`,
      });

      // Parse plan result
      let tasks: PlanTask[] = [];
      let milestones: PlanMilestone[] = [];
      let title = args.objective.substring(0, 50);
      let objective = args.objective;
      let timeline = args.timeframe || 'To be determined';
      let risks: string[] = [];

      try {
        const jsonMatch = planResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          title = parsed.title || title;
          objective = parsed.objective || objective;
          tasks = (parsed.tasks || []).map((t: any) => ({
            ...t,
            status: 'pending' as const,
          }));
          milestones = parsed.milestones || [];
          timeline = parsed.timeline || timeline;
          risks = parsed.risks || [];
        }
      } catch {
        // Fallback: create basic plan
        tasks = [
          {
            id: 'task-1',
            title: 'Define requirements',
            description: 'Clarify and document requirements',
            priority: 'high' as const,
            status: 'pending' as const,
          },
          {
            id: 'task-2',
            title: 'Implementation',
            description: 'Build the solution',
            dependencies: ['task-1'],
            priority: 'high' as const,
            status: 'pending' as const,
          },
          {
            id: 'task-3',
            title: 'Testing',
            description: 'Verify the implementation',
            dependencies: ['task-2'],
            priority: 'medium' as const,
            status: 'pending' as const,
          },
        ];
      }

      return {
        success: true,
        title,
        objective,
        tasks,
        milestones,
        timeline,
        risks: args.includeRisks ? risks : undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown planning error';
      console.error('[PlanTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}
