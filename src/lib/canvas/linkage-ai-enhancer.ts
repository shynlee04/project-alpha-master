/**
 * @fileoverview Linkage AI Enhancement Service
 * @module lib/canvas/linkage-ai-enhancer
 * @governance EPIC-7-1, UC2
 *
 * Implements AI enhancement for linkage proposals using Gemini API.
 * Generates detailed rationales, refines confidence scores, suggests edge labels.
 */

import type { LinkageProposal, NodeAnalysis } from './linkage-types';
import { LinkageType } from './linkage-types';

/**
 * AI enhancement options
 */
export interface AIEnhancementOptions {
  /** Gemini API key (required) */
  apiKey: string;
  /** Model ID (default: 'gemini-1.5-flash') */
  modelId?: string;
  /** Maximum proposals to enhance per batch (default: 5) */
  maxProposals?: number;
  /** Temperature for generation (default: 0.3 for more focused output) */
  temperature?: number;
}

/**
 * Enhanced proposal with AI-generated details
 */
export interface EnhancedProposal extends LinkageProposal {
  /** AI-generated rationale explaining the connection */
  aiRationale: string;
  /** Refined confidence score based on semantic understanding */
  confidenceRefined: number;
  /** Key entities involved in the connection */
  entities: string[];
  /** Relevant keywords for the connection */
  keywords: string[];
}

/**
 * Linkage AI Enhancer Service
 *
 * Enhances linkage proposals with AI-generated rationales and refined confidence scores.
 */
export class LinkageAIEnhancer {
  private options: Required<Omit<AIEnhancementOptions, 'apiKey'>> & { apiKey: string };

  constructor(options: AIEnhancementOptions) {
    if (!options.apiKey) {
      throw new Error('[LinkageAIEnhancer] API key is required');
    }

    this.options = {
      apiKey: options.apiKey,
      modelId: options.modelId || 'gemini-1.5-flash',
      maxProposals: options.maxProposals || 5,
      temperature: options.temperature || 0.3,
    };
  }

  /**
   * Enhance proposals with AI analysis
   *
   * @param proposals - Initial proposals to enhance
   * @param nodeAnalyses - Node analyses for context
   * @returns AI-enhanced proposals
   */
  async enhanceProposals(
    proposals: LinkageProposal[],
    nodeAnalyses: Map<string, NodeAnalysis>
  ): Promise<EnhancedProposal[]> {
    if (proposals.length === 0) {
      console.log('[LinkageAIEnhancer] No proposals to enhance');
      return [];
    }

    // Limit to top N proposals to control token usage
    const topProposals = proposals
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.options.maxProposals);

    console.log(`[LinkageAIEnhancer] Enhancing ${topProposals.length} proposals with AI`);

    try {
      // Generate prompt
      const prompt = this.generateEnhancementPrompt(topProposals, nodeAnalyses);

      // Call Gemini API
      const enhanced = await this.callGeminiAPI(prompt);

      // Merge with original proposals
      const merged = this.mergeWithOriginal(enhanced, topProposals);

      console.log(`[LinkageAIEnhancer] Successfully enhanced ${merged.length} proposals`);
      return merged;
    } catch (error) {
      console.error('[LinkageAIEnhancer] AI enhancement failed:', error);
      // Return original proposals with empty AI fields
      return topProposals.map((p) => ({
        ...p,
        aiRationale: p.rationale,
        confidenceRefined: p.confidence,
        entities: [],
        keywords: [],
      }));
    }
  }

  /**
   * Generate AI prompt for proposal enhancement
   *
   * @param proposals - Proposals to enhance
   * @param nodeAnalyses - Node analyses for context
   * @returns AI prompt string
   */
  private generateEnhancementPrompt(
    proposals: LinkageProposal[],
    nodeAnalyses: Map<string, NodeAnalysis>
  ): string {
    const proposalsContext = proposals
      .map((proposal, index) => {
        const analysis1 = nodeAnalyses.get(proposal.sourceNodeId);
        const analysis2 = nodeAnalyses.get(proposal.targetNodeId);

        return `
Proposal ${index + 1}:
  ID: ${proposal.id}
  Source Node: "${analysis1?.keywords.join(', ') || 'Unknown'}"
  Target Node: "${analysis2?.keywords.join(', ') || 'Unknown'}"
  Current Confidence: ${(proposal.confidence * 100).toFixed(0)}%
  Linkage Type: ${proposal.linkageType}
  Shared Concepts: ${proposal.evidence.slice(0, 3).join(', ') || 'None'}
  Current Rationale: ${proposal.rationale}
`;
      })
      .join('\n');

    return `
You are an expert knowledge graph analyst. Analyze the following linkage proposals between knowledge nodes and provide detailed insights.

For each proposal, provide:
1. Refined confidence score (0-1) based on semantic understanding
2. Detailed rationale explaining the connection (2-3 sentences)
3. Suggested edge label (max 5 words, clear and concise)
4. Key entities involved (max 5 specific nouns or concepts)
5. Relevant keywords (max 5 descriptive terms)

Respond only with valid JSON array, no additional text.

JSON format:
[
  {
    "id": "proposal-id",
    "confidenceRefined": 0.85,
    "aiRationale": "These sources discuss complementary aspects of X, offering different perspectives that strengthen understanding when connected.",
    "suggestedLabel": "Complementary views on X",
    "entities": ["entity1", "entity2", "entity3"],
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
]

Proposals to analyze:
${proposalsContext}

Important guidelines:
- Confidence scores should reflect semantic relevance, not just keyword overlap
- Rationales should explain WHY the connection matters
- Edge labels should be clear, concise, and actionable
- Entities should be specific (not generic terms)
- Keywords should capture the essence of the connection

JSON response:
`;
  }

  /**
   * Call Gemini API with enhancement prompt
   *
   * @param prompt - AI prompt
   * @returns Enhanced proposals from AI
   */
  private async callGeminiAPI(prompt: string): Promise<EnhancedProposal[]> {
    let GoogleGenAI: any;

    try {
      // Dynamic import to avoid loading Gemini SDK when not needed
      const module = await import('@google/genai');
      GoogleGenAI = module.GoogleGenAI;
    } catch (error) {
      console.error('[LinkageAIEnhancer] Failed to import Gemini SDK:', error);
      throw new Error('Gemini SDK not available');
    }

    const genAI = new GoogleGenAI({ apiKey: this.options.apiKey });

    // Use models.generateContent() instead of getGenerativeModel()
    const result = await genAI.models.generateContent({
      model: this.options.modelId,
      contents: prompt,
    });

    const response = result.response?.text() || result.text();

    console.log('[LinkageAIEnhancer] Gemini API response received, parsing...');

    return this.parseAIResponse(response);
  }

  /**
   * Parse AI response from Gemini
   *
   * @param response - Raw AI response string
   * @returns Parsed enhanced proposals
   */
  private parseAIResponse(response: string): EnhancedProposal[] {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/) || response.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const enhanced = JSON.parse(jsonStr);

      if (!Array.isArray(enhanced)) {
        throw new Error('Response is not an array');
      }

      // Validate and transform
      return enhanced.map((e: any): EnhancedProposal => ({
        id: e.id,
        sourceNodeId: '', // Will be filled in mergeWithOriginal
        targetNodeId: '', // Will be filled in mergeWithOriginal
        linkageType: LinkageType.CONCEPTUAL, // Will be filled in mergeWithOriginal
        confidence: e.confidenceRefined,
        rationale: e.aiRationale || e.rationale || '',
        evidence: [] as string[],
        suggestedLabel: e.suggestedLabel || 'Related',
        suggestedRelationship: 'relates' as const,
        reviewed: false,
        createdAt: Date.now(),
        // EnhancedProposal-specific fields
        aiRationale: e.aiRationale || e.rationale || 'AI rationale not provided',
        confidenceRefined: e.confidenceRefined,
        entities: Array.isArray(e.entities) ? e.entities : [],
        keywords: Array.isArray(e.keywords) ? e.keywords : [],
      }));
    } catch (error) {
      console.error('[LinkageAIEnhancer] Failed to parse AI response:', error);
      console.error('[LinkageAIEnhancer] Response text:', response);
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Merge AI-enhanced data with original proposals
   *
   * @param enhanced - AI-enhanced proposals
   * @param original - Original proposals
   * @returns Merged proposals with all fields
   */
  private mergeWithOriginal(
    enhanced: EnhancedProposal[],
    original: LinkageProposal[]
  ): EnhancedProposal[] {
    const originalMap = new Map(original.map((p) => [p.id, p]));

    return enhanced.map((enhanced) => {
      const originalProposal = originalMap.get(enhanced.id);

      if (!originalProposal) {
        console.warn(`[LinkageAIEnhancer] Original proposal not found: ${enhanced.id}`);
        return enhanced;
      }

      return {
        ...originalProposal,
        ...enhanced,
        // Keep original linkage fields
        sourceNodeId: originalProposal.sourceNodeId,
        targetNodeId: originalProposal.targetNodeId,
        linkageType: originalProposal.linkageType,
        suggestedRelationship: originalProposal.suggestedRelationship,
        evidence: originalProposal.evidence,
        // Merge confidence: use AI-refined if provided, else original
        confidence: enhanced.confidenceRefined,
        // Merge rationales
        rationale: enhanced.aiRationale,
        // Add AI-generated fields
        aiRationale: enhanced.aiRationale,
        confidenceRefined: enhanced.confidenceRefined,
        entities: enhanced.entities,
        keywords: enhanced.keywords,
      };
    });
  }
}

/**
 * Create a linkage AI enhancer instance
 *
 * @param options - Enhancer options (API key required)
 * @returns LinkageAIEnhancer instance
 */
export function createLinkageAIEnhancer(
  options: AIEnhancementOptions
): LinkageAIEnhancer {
  return new LinkageAIEnhancer(options);
}

/**
 * Default singleton instance (lazy initialization)
 */
let defaultEnhancer: LinkageAIEnhancer | null = null;

export function getLinkageAIEnhancer(apiKey?: string): LinkageAIEnhancer {
  // SECURITY FIX B-3: No hardcoded API keys - require from vault
  if (!apiKey) {
    throw new Error(
      'API key required. Configure Gemini API key in Settings > Providers.'
    );
  }

  if (!defaultEnhancer) {
    defaultEnhancer = new LinkageAIEnhancer({ apiKey });
  }

  return defaultEnhancer;
}
