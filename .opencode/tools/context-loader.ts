/**
 * BMAD Beast Mode v2.0.0 - Context Loader Tool
 * 
 * Loads minimal context based on prompt matrix and @file refs.
 * Implements Phase 2.2 Methodology: "Accurately Specific with Concision"
 * 
 * @location .opencode/tools/context-loader.ts
 * @version 1.0.0
 * @date 2026-01-29
 */

// ============================================================================
// TYPES
// ============================================================================

type PromptType =
    | "A1" | "A2" | "A3"  // Ideation
    | "B1" | "B2" | "B3"  // Fixes
    | "C1" | "C2" | "C3"  // Refactoring
    | "D1" | "D2" | "D3"  // Architecture
    | "E1" | "E2" | "E3"  // Documentation
    | "F1" | "F2" | "F3"  // Governance

interface LoadMinimalContextArgs {
    prompt_type: PromptType
    story_id?: string
    sections?: string[]
}

interface LoadedItem {
    type: "file" | "section" | "error"
    path: string
    section?: string
    content?: string
    message?: string
}

interface LoadContextResult {
    prompt_type: PromptType
    loaded_count: number
    total_tokens_approx: number
    context: LoadedItem[]
}

// ============================================================================
// PROMPT TYPE MATRIX
// ============================================================================

/**
 * Maps 18 Prompt Types to required context files/sections
 * Based on Doc 07 Master Mapping
 */
const PROMPT_MATRIX: Record<PromptType, string[]> = {
    // Group A: Ideation
    "A1": ["docs/prd.md", "docs/ux-specification/index.md"],
    "A2": ["docs/prd.md", "docs/architecture.md"],
    "A3": ["docs/architecture.md", "docs/adrs/ADR-039.md"],

    // Group B: Fixes
    "B1": ["_bmad-output/sprint-artifacts/sprint-status.yaml", "AGENTS.md"],
    "B2": ["$story_id[frontmatter,acceptance_criteria]", "_bmad-output/sprint-artifacts/sprint-status.yaml"],
    "B3": ["docs/architecture.md", "docs/adrs/ADR-039.md"],

    // Group C: Refactoring
    "C1": ["docs/architecture.md", "docs/new-fundamental-truths.md"],
    "C2": ["docs/architecture.md", "AGENTS.md"],
    "C3": ["docs/architecture.md", "_bmad-output/ARTIFACT_REGISTRY.yaml"],

    // Group D: Architecture
    "D1": ["docs/architecture.md", "docs/adrs/ADR-039.md"],
    "D2": [], // Pure research - no preload
    "D3": ["_bmad-output/sprint-artifacts/sprint-status.yaml", "docs/epics.md"],

    // Group E: Documentation
    "E1": ["docs/architecture.md"],
    "E2": ["docs/ux-specification/index.md"],
    "E3": ["docs/architecture.md", "docs/adrs/ADR-039.md"],

    // Group F: Governance
    "F1": ["AGENTS.md", ".opencode/state/LOOP_STATE.yaml"],
    "F2": ["AGENTS.md", "docs/new-fundamental-truths.md"],
    "F3": ["AGENTS.md", "docs/architecture.md"]
}

// ============================================================================
// SECTION EXTRACTION
// ============================================================================

/**
 * Extract specific sections from markdown content
 */
function extractSections(content: string, sections: string[]): Map<string, string> {
    const result = new Map<string, string>()

    for (const sectionName of sections) {
        // Try different heading levels
        for (const level of ['##', '###', '#']) {
            const regex = new RegExp(
                `^${level}\\s+${escapeRegex(sectionName)}\\s*\\n([\\s\\S]*?)(?=\\n${level}\\s|$)`,
                'mi'
            )
            const match = content.match(regex)

            if (match) {
                result.set(sectionName, match[1].trim())
                break
            }
        }

        // Try YAML frontmatter if requested
        if (sectionName.toLowerCase() === 'frontmatter') {
            const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
            if (fmMatch) {
                result.set(sectionName, fmMatch[1])
            }
        }
    }

    return result
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Approximate token count (simple heuristic: ~4 chars per token)
 */
function estimateTokens(content: string): number {
    return Math.ceil(content.length / 4)
}

// ============================================================================
// MAIN CONTEXT LOADER
// ============================================================================

/**
 * Load minimal context based on prompt type matrix
 * 
 * @param args - Loader arguments
 * @returns Loaded context with approximate token count
 */
export async function loadMinimalContext(args: LoadMinimalContextArgs): Promise<LoadContextResult> {
    const fs = await import('fs')
    const path = await import('path')

    const loadList = PROMPT_MATRIX[args.prompt_type] || []
    const loadedContext: LoadedItem[] = []
    let totalTokens = 0

    // Replace $story_id placeholder
    const resolvedLoadList = loadList.map(item =>
        item.replace('$story_id', args.story_id || '')
    ).filter(item => item.length > 0)

    for (const item of resolvedLoadList) {
        // Parse @file[section] syntax
        const match = item.match(/^(.+?)\[(.+?)\]$/)

        if (match) {
            // Section-specific load
            const filePath = match[1]
            const sections = match[2].split(',').map(s => s.trim())

            if (!fs.existsSync(filePath)) {
                loadedContext.push({
                    type: "error",
                    path: filePath,
                    message: "File not found"
                })
                continue
            }

            const content = fs.readFileSync(filePath, 'utf-8')
            const extractedSections = extractSections(content, sections)

            for (const [sectionName, sectionContent] of extractedSections) {
                const tokens = estimateTokens(sectionContent)
                totalTokens += tokens

                loadedContext.push({
                    type: "section",
                    path: filePath,
                    section: sectionName,
                    content: sectionContent
                })
            }

            // Report missing sections
            for (const section of sections) {
                if (!extractedSections.has(section)) {
                    loadedContext.push({
                        type: "error",
                        path: filePath,
                        section,
                        message: `Section '${section}' not found`
                    })
                }
            }
        } else {
            // Full file load
            if (!fs.existsSync(item)) {
                loadedContext.push({
                    type: "error",
                    path: item,
                    message: "File not found"
                })
                continue
            }

            const content = fs.readFileSync(item, 'utf-8')
            const tokens = estimateTokens(content)
            totalTokens += tokens

            loadedContext.push({
                type: "file",
                path: item,
                content: content
            })
        }
    }

    return {
        prompt_type: args.prompt_type,
        loaded_count: loadedContext.filter(c => c.type !== "error").length,
        total_tokens_approx: totalTokens,
        context: loadedContext
    }
}

/**
 * Get recommended context for a prompt type without loading
 */
export function getRecommendedContext(prompt_type: PromptType): {
    prompt_type: PromptType
    recommended_files: string[]
    description: string
} {
    const descriptions: Record<PromptType, string> = {
        "A1": "Greenfield Feature - Load PRD and UX specs",
        "A2": "Feature Extension - Load PRD and architecture",
        "A3": "Cross-cutting Concern - Load architecture and ADR-039",
        "B1": "Quick Patch - Load sprint status and AGENTS",
        "B2": "Feature Fix - Load story and sprint status",
        "B3": "Architectural Conflict - Load architecture and ADR-039",
        "C1": "Component Splitting - Load architecture and truths",
        "C2": "Store Elimination - Load architecture and AGENTS",
        "C3": "Migration/Consolidation - Load architecture and registry",
        "D1": "Architecture Decision - Load architecture and ADR-039",
        "D2": "Technical Research - No preload, pure research",
        "D3": "Sprint Planning - Load sprint status and epics",
        "E1": "API Documentation - Load architecture",
        "E2": "User Guides - Load UX specification",
        "E3": "Architecture Docs - Load architecture and ADR-039",
        "F1": "Unclear Intent - Load AGENTS and loop state",
        "F2": "Multi-concern Request - Load AGENTS and truths",
        "F3": "Contradictory Request - Load AGENTS and architecture"
    }

    return {
        prompt_type,
        recommended_files: PROMPT_MATRIX[prompt_type],
        description: descriptions[prompt_type]
    }
}
