/**
 * BMAD Beast Mode v2.0.0 - Context Budget Tracking Tool
 * 
 * Tracks and enforces context token budget with alerts at threshold.
 * Implements Phase 2.2 Methodology: "Accurately Specific with Concision"
 * 
 * @location .opencode/tools/context-budget.ts
 * @version 1.0.0
 * @date 2026-01-29
 */

import { z } from "zod"

// ============================================================================
// TYPES
// ============================================================================

interface BudgetState {
    total_budget: number
    used: number
    remaining: number
    operations: Array<{
        timestamp: string
        tokens: number
        agent?: string
        operation?: string
    }>
    alerts: Array<{
        timestamp: string
        level: "INFO" | "WARNING" | "CRITICAL"
        message: string
    }>
    session_id?: string
    last_reset?: string
}

interface BudgetCheckArgs {
    operation: "check"
    threshold?: number
}

interface BudgetUpdateArgs {
    operation: "update"
    tokens_used: number
    agent?: string
    operation_type?: string
    threshold?: number
}

interface BudgetResetArgs {
    operation: "reset"
    new_budget?: number
}

type TrackContextBudgetArgs = BudgetCheckArgs | BudgetUpdateArgs | BudgetResetArgs

interface BudgetResult {
    budget: {
        total: number
        used: number
        remaining: number
        usage_ratio: string
    }
    status?: "OK" | "WARNING" | "CRITICAL"
    alert?: string
    message?: string
    error?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BUDGET = 400000 // 400K tokens (Claude 3.5 Sonnet context window)
const DEFAULT_THRESHOLD = 0.8 // 80% warning threshold
const STATE_FILE = ".opencode/state/CONTEXT_BUDGET.yaml"

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Load or initialize budget state from file
 */
async function loadBudgetState(statePath: string): Promise<BudgetState> {
    const fs = await import('fs')
    const path = await import('path')

    const defaultState: BudgetState = {
        total_budget: DEFAULT_BUDGET,
        used: 0,
        remaining: DEFAULT_BUDGET,
        operations: [],
        alerts: [],
        session_id: `session_${Date.now()}`,
        last_reset: new Date().toISOString()
    }

    try {
        if (fs.existsSync(statePath)) {
            const content = fs.readFileSync(statePath, 'utf-8')
            // Simple YAML parsing (use proper yaml lib in production)
            const parsed = parseSimpleYaml(content)
            return { ...defaultState, ...parsed }
        }
    } catch (error) {
        console.error("Error loading budget state:", error)
    }

    return defaultState
}

/**
 * Save budget state to file
 */
async function saveBudgetState(statePath: string, state: BudgetState): Promise<void> {
    const fs = await import('fs')
    const path = await import('path')

    // Ensure directory exists
    const dir = path.dirname(statePath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    // Convert to YAML format
    const yaml = serializeToYaml(state)
    fs.writeFileSync(statePath, yaml)
}

/**
 * Simple YAML parser (replace with js-yaml in production)
 */
function parseSimpleYaml(content: string): Partial<BudgetState> {
    const result: any = {}
    const lines = content.split('\n')

    for (const line of lines) {
        const colonIdx = line.indexOf(':')
        if (colonIdx > 0 && !line.startsWith(' ') && !line.startsWith('-')) {
            const key = line.substring(0, colonIdx).trim()
            const value = line.substring(colonIdx + 1).trim()

            if (!isNaN(Number(value))) {
                result[key] = Number(value)
            } else if (value === 'true') {
                result[key] = true
            } else if (value === 'false') {
                result[key] = false
            } else {
                result[key] = value
            }
        }
    }

    return result
}

/**
 * Serialize state to YAML format
 */
function serializeToYaml(state: BudgetState): string {
    let yaml = `# BMAD Beast Mode - Context Budget State\n`
    yaml += `# Last Updated: ${new Date().toISOString()}\n\n`
    yaml += `total_budget: ${state.total_budget}\n`
    yaml += `used: ${state.used}\n`
    yaml += `remaining: ${state.remaining}\n`
    yaml += `session_id: "${state.session_id || ''}"\n`
    yaml += `last_reset: "${state.last_reset || ''}"\n\n`

    yaml += `operations:\n`
    // Only keep last 20 operations to avoid file bloat
    const recentOps = state.operations.slice(-20)
    for (const op of recentOps) {
        yaml += `  - timestamp: "${op.timestamp}"\n`
        yaml += `    tokens: ${op.tokens}\n`
        if (op.agent) yaml += `    agent: "${op.agent}"\n`
        if (op.operation) yaml += `    operation: "${op.operation}"\n`
    }

    yaml += `\nalerts:\n`
    // Only keep last 10 alerts
    const recentAlerts = state.alerts.slice(-10)
    for (const alert of recentAlerts) {
        yaml += `  - timestamp: "${alert.timestamp}"\n`
        yaml += `    level: "${alert.level}"\n`
        yaml += `    message: "${alert.message}"\n`
    }

    return yaml
}

// ============================================================================
// MAIN TOOL FUNCTION
// ============================================================================

/**
 * Track and enforce context budget with alerts
 * 
 * Operations:
 * - check: Get current budget status
 * - update: Add tokens used and check threshold
 * - reset: Reset budget to default or specified value
 */
export async function trackContextBudget(args: TrackContextBudgetArgs): Promise<BudgetResult> {
    const statePath = STATE_FILE
    const threshold = ('threshold' in args ? args.threshold : undefined) ?? DEFAULT_THRESHOLD

    // Load current state
    let budgetState = await loadBudgetState(statePath)

    switch (args.operation) {
        case "check": {
            const usageRatio = budgetState.used / budgetState.total_budget
            let alertLevel: "OK" | "WARNING" | "CRITICAL" = "OK"

            if (usageRatio > 0.95) {
                alertLevel = "CRITICAL"
            } else if (usageRatio > threshold) {
                alertLevel = "WARNING"
            }

            return {
                budget: {
                    total: budgetState.total_budget,
                    used: budgetState.used,
                    remaining: budgetState.remaining,
                    usage_ratio: usageRatio.toFixed(2)
                },
                status: alertLevel,
                alert: usageRatio > threshold
                    ? `Context budget at ${Math.round(usageRatio * 100)}% - consider compacting`
                    : undefined
            }
        }

        case "update": {
            if (!('tokens_used' in args) || args.tokens_used === undefined) {
                return {
                    budget: {
                        total: budgetState.total_budget,
                        used: budgetState.used,
                        remaining: budgetState.remaining,
                        usage_ratio: (budgetState.used / budgetState.total_budget).toFixed(2)
                    },
                    error: "tokens_used required for update operation"
                }
            }

            // Update counts
            budgetState.used += args.tokens_used
            budgetState.remaining = budgetState.total_budget - budgetState.used

            // Log operation
            budgetState.operations.push({
                timestamp: new Date().toISOString(),
                tokens: args.tokens_used,
                agent: 'agent' in args ? args.agent : undefined,
                operation: 'operation_type' in args ? args.operation_type : undefined
            })

            // Check threshold
            const newUsageRatio = budgetState.used / budgetState.total_budget
            if (newUsageRatio > threshold) {
                const level = newUsageRatio > 0.95 ? "CRITICAL" : "WARNING"
                budgetState.alerts.push({
                    timestamp: new Date().toISOString(),
                    level,
                    message: `Context budget at ${Math.round(newUsageRatio * 100)}%`
                })
            }

            // Save state
            await saveBudgetState(statePath, budgetState)

            return {
                budget: {
                    total: budgetState.total_budget,
                    used: budgetState.used,
                    remaining: budgetState.remaining,
                    usage_ratio: newUsageRatio.toFixed(2)
                },
                alert: newUsageRatio > threshold
                    ? `Context budget at ${Math.round(newUsageRatio * 100)}%`
                    : undefined
            }
        }

        case "reset": {
            const newBudget = ('new_budget' in args && args.new_budget)
                ? args.new_budget
                : DEFAULT_BUDGET

            budgetState = {
                total_budget: newBudget,
                used: 0,
                remaining: newBudget,
                operations: [],
                alerts: [],
                session_id: `session_${Date.now()}`,
                last_reset: new Date().toISOString()
            }

            await saveBudgetState(statePath, budgetState)

            return {
                budget: {
                    total: budgetState.total_budget,
                    used: 0,
                    remaining: budgetState.total_budget,
                    usage_ratio: "0.00"
                },
                message: "Context budget reset"
            }
        }

        default:
            return {
                budget: {
                    total: budgetState.total_budget,
                    used: budgetState.used,
                    remaining: budgetState.remaining,
                    usage_ratio: (budgetState.used / budgetState.total_budget).toFixed(2)
                },
                error: `Unknown operation: ${(args as any).operation}`
            }
    }
}
