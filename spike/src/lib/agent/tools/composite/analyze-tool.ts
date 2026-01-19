/**
 * @fileoverview Analyze Composite Tool
 * @module lib/agent/tools/composite/analyze-tool
 *
 * Composite agentic tool for code and pattern analysis:
 * 1. Read target files/content
 * 2. Apply analysis patterns
 * 3. Extract insights and findings
 * 4. Generate recommendations
 *
 * @epic EPIC-TOOLS - Agentic Tool Architecture
 * @story TOOLS-02 - Composite Tool Implementations
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import {
  AnalysisTypeSchema,
  type AnalysisResult,
  type AnalysisFinding,
  type CompositeToolContext,
} from './types';

/**
 * Analyze tool input schema
 */
export const AnalyzeInputSchema = z.object({
  target: z.string().describe('File path, directory, or content to analyze'),
  analysisType: AnalysisTypeSchema.optional().default('general')
    .describe('Type of analysis to perform'),
  patterns: z.array(z.string()).optional()
    .describe('Specific patterns to look for'),
  includeMetrics: z.boolean().optional().default(true)
    .describe('Include quantitative metrics'),
  depth: z.enum(['shallow', 'standard', 'deep']).optional().default('standard')
    .describe('Analysis depth level'),
});

export type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>;

/**
 * Analyze tool definition
 */
export const analyzeDef = toolDefinition({
  name: 'analyze',
  description: `Analyze code, patterns, or content with AI-powered insights.
This composite tool performs multi-step analysis:
1. Reads and parses the target content
2. Applies analysis patterns based on type
3. Extracts findings with severity levels
4. Generates actionable recommendations

Analysis types:
- code_review: Code quality, best practices
- pattern_detection: Design patterns, anti-patterns
- dependency_analysis: Import/dependency issues
- security_audit: Security vulnerabilities
- performance_review: Performance bottlenecks
- general: General content analysis`,
  inputSchema: AnalyzeInputSchema,
  needsApproval: false, // Analysis is read-only
});

/**
 * Create analyze composite tool client implementation
 */
export function createAnalyzeTool(getContext: () => CompositeToolContext) {
  return analyzeDef.client(async (input: unknown): Promise<AnalysisResult> => {
    const args = input as AnalyzeInput;
    const context = getContext();

    try {
      // Step 1: Read content if it's a file path
      console.log('[AnalyzeTool] Step 1: Reading content...');
      let content = args.target;

      // Check if target looks like a file path
      if (args.target.includes('/') || args.target.includes('.')) {
        try {
          const readResult = await context.callTool<{ success: boolean; content?: string }>(
            'read',
            { path: args.target }
          );
          if (readResult.success && readResult.content) {
            content = readResult.content;
          }
        } catch {
          // Target might be inline content, use as-is
        }
      }

      // Step 2: Build analysis prompt based on type
      console.log('[AnalyzeTool] Step 2: Analyzing content...');

      const analysisPrompts: Record<string, string> = {
        code_review: `Perform a code review of the following code. Look for:
- Code quality issues
- Best practice violations
- Potential bugs
- Naming conventions
- Documentation gaps`,
        pattern_detection: `Analyze the following for design patterns and anti-patterns:
- Design patterns used
- Anti-patterns present
- Architectural issues
- Coupling/cohesion`,
        dependency_analysis: `Analyze dependencies and imports:
- Circular dependencies
- Unused imports
- Missing dependencies
- Dependency version issues`,
        security_audit: `Perform a security audit:
- Injection vulnerabilities
- Authentication issues
- Data exposure risks
- Insecure configurations`,
        performance_review: `Review for performance issues:
- Memory leaks
- Inefficient algorithms
- Unnecessary computations
- Resource usage`,
        general: `Analyze the following content:
- Structure and organization
- Key insights
- Potential improvements
- Notable patterns`,
      };

      const analysisPrompt = `${analysisPrompts[args.analysisType || 'general']}

Content to analyze:
\`\`\`
${content.substring(0, 15000)} ${content.length > 15000 ? '\n... (truncated)' : ''}
\`\`\`

${args.patterns?.length ? `\nSpecific patterns to look for:\n${args.patterns.join('\n')}` : ''}

Provide your analysis as JSON:
{
  "summary": "Brief summary of analysis",
  "findings": [
    {
      "type": "issue|suggestion|insight|warning",
      "severity": "low|medium|high|critical",
      "title": "...",
      "description": "...",
      "location": "line or section",
      "recommendation": "..."
    }
  ],
  "metrics": { "key": value },
  "recommendations": ["..."]
}`;

      const analysisResponse = await context.callAI(analysisPrompt, {
        temperature: 0.2,
        systemPrompt: `You are an expert analyst. Provide thorough, actionable analysis.`,
      });

      // Parse analysis result
      let findings: AnalysisFinding[] = [];
      let summary = '';
      let metrics: Record<string, number> = {};
      let recommendations: string[] = [];

      try {
        const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          summary = parsed.summary || '';
          findings = parsed.findings || [];
          metrics = parsed.metrics || {};
          recommendations = parsed.recommendations || [];
        }
      } catch {
        // Fallback: treat response as summary
        summary = analysisResponse;
      }

      return {
        success: true,
        summary,
        findings,
        metrics,
        recommendations,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown analysis error';
      console.error('[AnalyzeTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}
