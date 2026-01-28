/**
 * @fileoverview Multi-Agent Debating System
 * @module lib/workflow/agents/debate-agent
 * @governance EPIC-E4-4
 * @created 2026-01-05
 *
 * Orchestrates debates between AI agents with different perspectives.
 */

import { credentialVault } from '@/lib/agent/providers';

// ============================================================================
// Types
// ============================================================================

/**
 * Debate agent personas
 */
export enum DebatePersona {
    /** Optimistic perspective, focuses on benefits and possibilities */
    OPTIMIST = 'optimist',
    /** Skeptical perspective, focuses on risks and limitations */
    SKEPTIC = 'skeptic',
    /** Expert perspective, focuses on technical accuracy and best practices */
    EXPERT = 'expert',
    /** Devil's advocate, challenges assumptions */
    DEVILS_ADVOCATE = 'devils_advocate',
    /** Synthesizer, combines best arguments from all perspectives */
    SYNTHESIZER = 'synthesizer',
}

/**
 * Single argument in a debate round
 */
export interface DebateArgument {
    /** Unique ID for this argument */
    id: string;
    /** Agent persona who made this argument */
    persona: DebatePersona;
    /** Round number (1-based) */
    round: number;
    /** The argument content */
    content: string;
    /** Key points extracted from the argument */
    keyPoints: string[];
    /** Arguments this responds to (empty for first round) */
    respondsTo: string[];
    /** Confidence score (0-1) */
    confidence: number;
    /** Timestamp of argument */
    timestamp: number;
}

/**
 * Agreement matrix showing where agents agree/disagree
 */
export interface AgreementMatrix {
    /** Pairs of personas and their agreement level (0-1) */
    agreements: Array<{
        persona1: DebatePersona;
        persona2: DebatePersona;
        agreement: number;
    }>;
    /** Areas of strong disagreement (agreement < 0.4) */
    disagreements: Array<{
        topic: string;
        personas: [DebatePersona, DebatePersona];
        severity: 'low' | 'medium' | 'high';
    }>;
}

/**
 * Final synthesized answer from the debate
 */
export interface DebateSynthesis {
    /** Consolidated answer incorporating best arguments */
    answer: string;
    /** Key points that all agents agreed on */
    consensusPoints: string[];
    /** Points of disagreement that remain unresolved */
    openQuestions: string[];
    /** Which arguments were most influential */
    influentialArguments: Array<{
        argumentId: string;
        persona: DebatePersona;
        reason: string;
    }>;
    /** Overall confidence in the synthesis */
    confidence: number;
}

/**
 * Complete debate results
 */
export interface DebateResults {
    /** Original question/topic */
    topic: string;
    /** All arguments across all rounds */
    arguments: DebateArgument[];
    /** Agreement analysis */
    agreementMatrix: AgreementMatrix;
    /** Final synthesis */
    synthesis: DebateSynthesis;
    /** Number of rounds conducted */
    roundsCompleted: number;
    /** Total time taken (ms) */
    duration: number;
    /** Timestamp of completion */
    timestamp: number;
}

/**
 * Configuration for debate execution
 */
export interface DebateConfig {
    /** Provider ID for LLM calls */
    providerId?: string;
    /** Model to use (default: gemini-2.0-flash) */
    model?: string;
    /** Number of debate rounds (default: 3) */
    rounds?: number;
    /** Personas to include (default: optimist, skeptic, expert) */
    personas?: DebatePersona[];
    /** Maximum tokens per argument */
    maxTokens?: number;
    /** Temperature for generation */
    temperature?: number;
}

/**
 * Context for starting a debate
 */
export interface DebateContext {
    /** Topic or question to debate */
    topic: string;
    /** Optional domain/context for the debate */
    domain?: string;
    /** Existing conversation to provide context */
    conversationHistory?: Array<{ role: string; content: string }>;
}

// ============================================================================
// Errors
// ============================================================================

export class DebateError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'DebateError';
    }
}

export const DEBATE_ERRORS = {
    NO_CREDENTIALS: 'no_credentials',
    INVALID_TOPIC: 'invalid_topic',
    API_FAILED: 'api_failed',
    NO_ARGUMENTS: 'no_arguments',
    SYNTHESIS_FAILED: 'synthesis_failed',
} as const;

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: Required<Omit<DebateConfig, 'personas'>> & { personas: DebatePersona[] } = {
    providerId: 'gemini',
    model: 'gemini-2.0-flash',
    rounds: 3,
    personas: [DebatePersona.OPTIMIST, DebatePersona.SKEPTIC, DebatePersona.EXPERT],
    maxTokens: 500,
    temperature: 0.8,
};

/**
 * Persona descriptions for debate agents
 */
const PERSONA_DESCRIPTIONS: Record<DebatePersona, { name: string; perspective: string; goals: string[] }> = {
    [DebatePersona.OPTIMIST]: {
        name: 'Optimist',
        perspective: 'Focuses on possibilities, benefits, and positive outcomes. Seeks creative solutions.',
        goals: [
            'Highlight potential benefits and opportunities',
            'Propose creative and innovative approaches',
            'Assume best intentions and positive scenarios',
        ],
    },
    [DebatePersona.SKEPTIC]: {
        name: 'Skeptic',
        perspective: 'Questions assumptions, identifies risks, and demands evidence. Cautious and critical.',
        goals: [
            'Challenge assumptions and proposed solutions',
            'Identify potential risks and failure modes',
            'Demand evidence and practical considerations',
        ],
    },
    [DebatePersona.EXPERT]: {
        name: 'Expert',
        perspective: 'Provides technical accuracy, best practices, and domain knowledge. Objective and precise.',
        goals: [
            'Ensure technical accuracy and correctness',
            'Reference established best practices',
            'Provide domain-specific knowledge and context',
        ],
    },
    [DebatePersona.DEVILS_ADVOCATE]: {
        name: "Devil's Advocate",
        perspective: 'Takes opposing views to stress-test ideas. Finds holes in any argument.',
        goals: [
            'Challenge consensus views',
            'Find logical fallacies and weaknesses',
            'Ensure all sides are considered',
        ],
    },
    [DebatePersona.SYNTHESIZER]: {
        name: 'Synthesizer',
        perspective: 'Combines the best arguments from all perspectives into a coherent conclusion.',
        goals: [
            'Identify common ground and consensus',
            'Weigh competing arguments fairly',
            'Produce a balanced, nuanced conclusion',
        ],
    },
};

// ============================================================================
// Agent Class
// ============================================================================

/**
 * Multi-Agent Debate System
 *
 * Orchestrates structured debates between AI agents with different perspectives.
 * Each round, agents respond to previous arguments, building a richer understanding.
 */
export class DebateAgent {
    private config: typeof DEFAULT_CONFIG;

    constructor(config: DebateConfig = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        if (config.personas) {
            this.config.personas = config.personas;
        }
    }

    /**
     * Conduct a full debate on the given topic
     */
    async conductDebate(context: DebateContext): Promise<DebateResults> {
        const startTime = Date.now();
        const { topic, domain, conversationHistory } = context;

        // Validate input
        if (!topic || topic.trim().length < 10) {
            throw new DebateError('Topic must be at least 10 characters', DEBATE_ERRORS.INVALID_TOPIC);
        }

        const personas = this.config.personas.filter((p) => p !== DebatePersona.SYNTHESIZER);

        // Conduct debate rounds
        const debateArguments: DebateArgument[] = [];
        for (let round = 1; round <= this.config.rounds; round++) {
            for (const persona of personas) {
                const argument = await this.generateArgument({
                    topic,
                    domain,
                    round,
                    persona,
                    priorArguments: debateArguments,
                    conversationHistory,
                });

                if (argument) {
                    debateArguments.push(argument);
                }
            }
        }

        if (debateArguments.length === 0) {
            throw new DebateError('No arguments were generated', DEBATE_ERRORS.NO_ARGUMENTS);
        }

        // Analyze agreements
        const agreementMatrix = await this.analyzeAgreements(debateArguments, topic);

        // Synthesize final answer
        const synthesis = await this.synthesizeResults({
            topic,
            arguments: debateArguments,
            agreementMatrix,
        });

        return {
            topic,
            arguments: debateArguments,
            agreementMatrix,
            synthesis,
            roundsCompleted: this.config.rounds,
            duration: Date.now() - startTime,
            timestamp: Date.now(),
        };
    }

    /**
     * Generate a single argument from a persona
     */
    private async generateArgument(options: {
        topic: string;
        domain?: string;
        round: number;
        persona: DebatePersona;
        priorArguments: DebateArgument[];
        conversationHistory?: Array<{ role: string; content: string }>;
    }): Promise<DebateArgument | null> {
        const { topic, domain, round, persona, priorArguments, conversationHistory } = options;
        const personaDesc = PERSONA_DESCRIPTIONS[persona];

        // Build prompt
        let prompt = this.buildArgumentPrompt({
            topic,
            domain,
            persona: personaDesc,
            round,
            priorArguments,
            conversationHistory,
        });

        try {
            const response = await this.callLLM(prompt);
            return this.parseArgumentResponse(response, persona, round, priorArguments);
        } catch (error) {
            console.error(`[DebateAgent] Failed to generate argument for ${persona}:`, error);
            return null;
        }
    }

    /**
     * Build prompt for argument generation
     */
    private buildArgumentPrompt(options: {
        topic: string;
        domain?: string;
        persona: { name: string; perspective: string; goals: string[] };
        round: number;
        priorArguments: DebateArgument[];
        conversationHistory?: Array<{ role: string; content: string }>;
    }): string {
        const { topic, domain, persona, round, priorArguments, conversationHistory } = options;

        let prompt = `You are ${persona.name}, a debate agent with the following perspective:
${persona.perspective}

Your goals in this debate:
${persona.goals.map(g => `- ${g}`).join('\n')}

`;

        if (domain) {
            prompt += `Domain context: ${domain}\n\n`;
        }

        prompt += `Debate topic: "${topic}"

`;

        if (conversationHistory && conversationHistory.length > 0) {
            const recent = conversationHistory.slice(-3);
            prompt += `Recent conversation context:\n${recent.map(m => `${m.role}: ${m.content}`).join('\n')}\n\n`;
        }

        if (round > 1 && priorArguments.length > 0) {
            prompt += `Previous arguments in this debate:\n\n`;
            const roundArgs = priorArguments.filter(a => a.round < round);
            for (const arg of roundArgs.slice(-6)) { // Last 6 arguments for context
                prompt += `[${PERSONA_DESCRIPTIONS[arg.persona].name}]: ${arg.content}\n\n`;
            }
        }

        prompt += `Round ${round}: Provide your argument.

Respond in JSON format:
{
  "content": "Your argument (2-3 sentences max)",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "respondsTo": ["id of argument you're responding to", or empty array if first round],
  "confidence": 0.0-1.0
}`;

        return prompt;
    }

    /**
     * Parse argument from LLM response
     */
    private parseArgumentResponse(
        response: string,
        persona: DebatePersona,
        round: number,
        priorArguments: DebateArgument[]
    ): DebateArgument | null {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return null;

            const parsed = JSON.parse(jsonMatch[0]);

            // Validate respondsTo IDs exist
            const validRespondsTo = (parsed.respondsTo || []).filter((id: string) =>
                priorArguments.some((a) => a.id === id)
            );

            return {
                id: `arg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                persona,
                round,
                content: parsed.content || '',
                keyPoints: parsed.keyPoints || [],
                respondsTo: validRespondsTo,
                confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.5)),
                timestamp: Date.now(),
            };
        } catch (error) {
            console.error('[DebateAgent] Failed to parse argument response:', response);
            return null;
        }
    }

    /**
     * Analyze agreement between arguments
     */
    private async analyzeAgreements(debateArgs: DebateArgument[], _topic: string): Promise<AgreementMatrix> {
        // Group arguments by persona
        const byPersona: Record<DebatePersona, DebateArgument[]> = {
            [DebatePersona.OPTIMIST]: [],
            [DebatePersona.SKEPTIC]: [],
            [DebatePersona.EXPERT]: [],
            [DebatePersona.DEVILS_ADVOCATE]: [],
            [DebatePersona.SYNTHESIZER]: [],
        };

        for (const arg of debateArgs) {
            byPersona[arg.persona].push(arg);
        }

        const activePersonas = this.config.personas.filter(p => p !== DebatePersona.SYNTHESIZER);
        const agreements: AgreementMatrix['agreements'] = [];
        const disagreements: AgreementMatrix['disagreements'] = [];

        // Compare each pair of personas
        for (let i = 0; i < activePersonas.length; i++) {
            for (let j = i + 1; j < activePersonas.length; j++) {
                const p1 = activePersonas[i];
                const p2 = activePersonas[j];
                const args1 = byPersona[p1];
                const args2 = byPersona[p2];

                if (args1.length === 0 || args2.length === 0) continue;

                // Simple similarity based on key points overlap
                const similarity = this.calculateSimilarity(args1, args2);
                agreements.push({ persona1: p1, persona2: p2, agreement: similarity });

                // Identify disagreements
                if (similarity < 0.4) {
                    const disagreement = this.identifyDisagreement(args1, args2, p1, p2);
                    if (disagreement) {
                        disagreements.push(disagreement);
                    }
                }
            }
        }

        return { agreements, disagreements };
    }

    /**
     * Calculate similarity between two sets of arguments
     */
    private calculateSimilarity(args1: DebateArgument[], args2: DebateArgument[]): number {
        const points1 = new Set(args1.flatMap(a => a.keyPoints.map(p => p.toLowerCase())));
        const points2 = new Set(args2.flatMap(a => a.keyPoints.map(p => p.toLowerCase())));

        if (points1.size === 0 || points2.size === 0) return 0.5;

        let intersection = 0;
        for (const point of points1) {
            for (const other of points2) {
                if (point.includes(other) || other.includes(point)) {
                    intersection++;
                    break;
                }
            }
        }

        const union = points1.size + points2.size - intersection;
        return union > 0 ? intersection / union : 0;
    }

    /**
     * Identify specific disagreement topic
     */
    private identifyDisagreement(
        args1: DebateArgument[],
        _args2: DebateArgument[],
        p1: DebatePersona,
        p2: DebatePersona
    ): AgreementMatrix['disagreements'][number] | null {
        // Find contrasting key points
        const allPoints1 = args1.flatMap((a) => a.keyPoints);

        // Simple heuristic: look for negation words
        const negationWords = ['not', 'no', 'never', 'cannot', 'impossible', 'wrong', 'false'];

        for (const point of allPoints1) {
            const lower = point.toLowerCase();
            const hasNegation = negationWords.some(n => lower.includes(n));

            if (hasNegation) {
                // Find corresponding positive point
                const baseTopic = lower.split(/\s+(not|no|never|cannot)/i)[0].trim();
                if (baseTopic.length > 5) {
                    return {
                        topic: baseTopic.charAt(0).toUpperCase() + baseTopic.slice(1),
                        personas: [p1, p2],
                        severity: 'medium',
                    };
                }
            }
        }

        return null;
    }

    /**
     * Synthesize final results from all arguments
     */
    private async synthesizeResults(options: {
        topic: string;
        arguments: DebateArgument[];
        agreementMatrix: AgreementMatrix;
    }): Promise<DebateSynthesis> {
        const { topic, arguments: args, agreementMatrix } = options;

        // Build synthesis prompt
        let prompt = `You are a skilled synthesizer. Your task is to combine multiple perspectives on a topic into a balanced, nuanced conclusion.

Topic: "${topic}"

Arguments from the debate:

`;

        // Group by round for clarity
        for (let round = 1; round <= this.config.rounds; round++) {
            const roundArgs = args.filter(a => a.round === round);
            if (roundArgs.length === 0) continue;

            prompt += `\n--- Round ${round} ---\n`;
            for (const arg of roundArgs) {
                prompt += `[${PERSONA_DESCRIPTIONS[arg.persona].name}]: ${arg.content}\n`;
                prompt += `Key points: ${arg.keyPoints.join('; ')}\n\n`;
            }
        }

        // Add agreement analysis
        if (agreementMatrix.disagreements.length > 0) {
            prompt += `\nAreas of disagreement:\n`;
            for (const d of agreementMatrix.disagreements) {
                prompt += `- ${d.topic} (${d.severity} severity)\n`;
            }
        }

        prompt += `\nBased on the above debate, provide a synthesis in JSON format:
{
  "answer": "A comprehensive answer incorporating the best arguments from all perspectives (3-5 sentences)",
  "consensusPoints": ["Point 1 that all agree on", "Point 2"],
  "openQuestions": ["Question 1 that remains unresolved", "Question 2"],
  "confidence": 0.0-1.0
}`;

        try {
            const response = await this.callLLM(prompt);
            return this.parseSynthesisResponse(response, args);
        } catch (error) {
            console.error('[DebateAgent] Synthesis failed, using fallback:', error);
            return this.fallbackSynthesis(args, agreementMatrix);
        }
    }

    /**
     * Parse synthesis response
     */
    private parseSynthesisResponse(
        response: string,
        args: DebateArgument[]
    ): DebateSynthesis {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found');

            const parsed = JSON.parse(jsonMatch[0]);

            // Find most influential arguments (highest confidence, most referenced)
            const referenceCount = new Map<string, number>();
            for (const arg of args) {
                for (const respondsToId of arg.respondsTo) {
                    referenceCount.set(respondsToId, (referenceCount.get(respondsToId) || 0) + 1);
                }
            }

            const influentialArgs = args
                .map(arg => ({
                    argumentId: arg.id,
                    persona: arg.persona,
                    reason: `${referenceCount.get(arg.id) || 0} references, confidence: ${arg.confidence}`,
                }))
                .sort((a, b) => {
                    const scoreA = referenceCount.get(a.argumentId) || 0;
                    const scoreB = referenceCount.get(b.argumentId) || 0;
                    return scoreB - scoreA;
                })
                .slice(0, 3);

            return {
                answer: parsed.answer || '',
                consensusPoints: parsed.consensusPoints || [],
                openQuestions: parsed.openQuestions || [],
                influentialArguments: influentialArgs,
                confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.7)),
            };
        } catch (error) {
            throw new Error(`Failed to parse synthesis: ${error}`);
        }
    }

    /**
     * Fallback synthesis when LLM fails
     */
    private fallbackSynthesis(
        args: DebateArgument[],
        agreementMatrix: AgreementMatrix
    ): DebateSynthesis {
        // Find highest confidence arguments
        const topArgs = [...args].sort((a, b) => b.confidence - a.confidence).slice(0, 3);

        return {
            answer: `Based on ${args.length} arguments across ${this.config.rounds} rounds, the key perspectives include: ${topArgs.map(a => a.content).join(' ')}`,
            consensusPoints: agreementMatrix.agreements
                .filter(a => a.agreement > 0.6)
                .map(a => `Alignment between ${a.persona1} and ${a.persona2}`),
            openQuestions: agreementMatrix.disagreements.map(d => d.topic),
            influentialArguments: topArgs.map(a => ({
                argumentId: a.id,
                persona: a.persona,
                reason: `High confidence (${a.confidence})`,
            })),
            confidence: 0.6,
        };
    }

    /**
     * Call LLM API
     */
    private async callLLM(prompt: string): Promise<string> {
        const apiKey = await credentialVault.getCredentials(this.config.providerId);
        if (!apiKey) {
            throw new DebateError('No credentials found for provider', DEBATE_ERRORS.NO_CREDENTIALS);
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: this.config.temperature,
                        maxOutputTokens: this.config.maxTokens,
                        responseMimeType: 'application/json',
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new DebateError(`API call failed: ${response.status}`, DEBATE_ERRORS.API_FAILED);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    /**
     * Get suggested follow-up questions based on debate results
     */
    getFollowUpQuestions(results: DebateResults): string[] {
        const questions: string[] = [];

        // Based on open questions
        for (const openQ of results.synthesis.openQuestions.slice(0, 2)) {
            questions.push(`Can you elaborate on: ${openQ}?`);
        }

        // Based on disagreements
        for (const disagreement of results.agreementMatrix.disagreements.slice(0, 2)) {
            questions.push(`What are your thoughts on ${disagreement.topic}?`);
        }

        // Based on low-confidence areas
        if (results.synthesis.confidence < 0.7) {
            questions.push('What additional information would help resolve this topic?');
        }

        return questions.slice(0, 3);
    }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a debate agent with default or custom config
 */
export function createDebateAgent(config?: DebateConfig): DebateAgent {
    return new DebateAgent(config);
}

/**
 * Conduct a quick debate (convenience function)
 */
export async function debateTopic(
    topic: string,
    config?: DebateConfig
): Promise<DebateResults> {
    const agent = new DebateAgent(config);
    return agent.conductDebate({ topic });
}

/**
 * Conduct debate with domain context
 */
export async function debateTopicWithContext(
    topic: string,
    domain?: string,
    conversationHistory?: Array<{ role: string; content: string }>,
    config?: DebateConfig
): Promise<DebateResults> {
    const agent = new DebateAgent(config);
    return agent.conductDebate({ topic, domain, conversationHistory });
}
