/**
 * @fileoverview Composite Tool Types
 * @module lib/agent/tools/composite/types
 *
 * Shared types for composite agentic tools.
 */

import { z } from 'zod';

/**
 * Depth level for research operations
 */
export const ResearchDepthSchema = z.enum(['quick', 'standard', 'deep']);
export type ResearchDepth = z.infer<typeof ResearchDepthSchema>;

/**
 * Source reference for grounded research
 */
export const SourceReferenceSchema = z.object({
  url: z.string().optional(),
  title: z.string(),
  snippet: z.string(),
  relevanceScore: z.number().min(0).max(1).optional(),
  retrievedAt: z.string().optional(),
});
export type SourceReference = z.infer<typeof SourceReferenceSchema>;

/**
 * Research result with grounded sources
 */
export const ResearchResultSchema = z.object({
  success: z.boolean(),
  answer: z.string().optional(),
  summary: z.string().optional(),
  sources: z.array(SourceReferenceSchema).optional(),
  confidence: z.number().min(0).max(1).optional(),
  error: z.string().optional(),
});
export type ResearchResult = z.infer<typeof ResearchResultSchema>;

/**
 * Storyboard style options
 */
export const StoryboardStyleSchema = z.enum([
  'comic',
  'cinematic',
  'minimalist',
  'realistic',
  'anime',
  'sketch',
]);
export type StoryboardStyle = z.infer<typeof StoryboardStyleSchema>;

/**
 * Single storyboard frame
 */
export const StoryboardFrameSchema = z.object({
  index: z.number(),
  scene: z.string(),
  script: z.string().optional(),
  visualDescription: z.string(),
  imagePrompt: z.string(),
  characterPositions: z.array(z.object({
    character: z.string(),
    position: z.string(),
    action: z.string(),
  })).optional(),
  cameraAngle: z.string().optional(),
  lighting: z.string().optional(),
  mood: z.string().optional(),
});
export type StoryboardFrame = z.infer<typeof StoryboardFrameSchema>;

/**
 * Storyboard result
 */
export const StoryboardResultSchema = z.object({
  success: z.boolean(),
  title: z.string().optional(),
  synopsis: z.string().optional(),
  frames: z.array(StoryboardFrameSchema).optional(),
  styleGuide: z.string().optional(),
  error: z.string().optional(),
});
export type StoryboardResult = z.infer<typeof StoryboardResultSchema>;

/**
 * Analysis type options
 */
export const AnalysisTypeSchema = z.enum([
  'code_review',
  'pattern_detection',
  'dependency_analysis',
  'security_audit',
  'performance_review',
  'general',
]);
export type AnalysisType = z.infer<typeof AnalysisTypeSchema>;

/**
 * Analysis finding
 */
export const AnalysisFindingSchema = z.object({
  type: z.enum(['issue', 'suggestion', 'insight', 'warning']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  title: z.string(),
  description: z.string(),
  location: z.string().optional(),
  recommendation: z.string().optional(),
});
export type AnalysisFinding = z.infer<typeof AnalysisFindingSchema>;

/**
 * Analysis result
 */
export const AnalysisResultSchema = z.object({
  success: z.boolean(),
  summary: z.string().optional(),
  findings: z.array(AnalysisFindingSchema).optional(),
  metrics: z.record(z.string(), z.number()).optional(),
  recommendations: z.array(z.string()).optional(),
  error: z.string().optional(),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

/**
 * Plan task
 */
export const PlanTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  estimatedDuration: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional(),
});
export type PlanTask = z.infer<typeof PlanTaskSchema>;

/**
 * Plan milestone
 */
export const PlanMilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  tasks: z.array(z.string()),
  targetDate: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
});
export type PlanMilestone = z.infer<typeof PlanMilestoneSchema>;

/**
 * Plan result
 */
export const PlanResultSchema = z.object({
  success: z.boolean(),
  title: z.string().optional(),
  objective: z.string().optional(),
  tasks: z.array(PlanTaskSchema).optional(),
  milestones: z.array(PlanMilestoneSchema).optional(),
  timeline: z.string().optional(),
  risks: z.array(z.string()).optional(),
  error: z.string().optional(),
});
export type PlanResult = z.infer<typeof PlanResultSchema>;

/**
 * Composite tool context
 * Provides access to other tools and AI capabilities
 */
export interface CompositeToolContext {
  /** Call another tool */
  callTool: <T>(toolName: string, args: unknown) => Promise<T>;
  /** Call AI for generation/synthesis */
  callAI: (prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }) => Promise<string>;
  /** Fetch URL content */
  fetchUrl: (url: string) => Promise<string>;
  /** Search the web */
  webSearch?: (query: string, options?: {
    maxResults?: number;
    timeRange?: string;
  }) => Promise<Array<{ url: string; title: string; snippet: string }>>;
  /** Generate image (if available) */
  generateImage?: (prompt: string, options?: {
    style?: string;
    size?: string;
  }) => Promise<string>;
}
