/**
 * Agent Import/Export Utilities
 *
 * Provides backup/restore functionality for agent configurations.
 * Supports JSON export/import with validation and merge strategies.
 *
 * @module lib/agent
 * @governance Ralph Loop Cycle 4, Phase 5
 */

import { z } from 'zod'
import { toast } from 'sonner'
import type { Agent } from '@/core/entities/Agent'
import { useAgentsStore } from '@/stores/agents-store'

/**
 * Validation schema for agent import/export
 */
const AgentExportSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    description: z.string(),
    providerId: z.string().min(1),
    modelId: z.string().min(1),
    systemPrompt: z.string(),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().min(1),
    topP: z.number().min(0).max(1),
    tools: z.array(z.object({
        toolId: z.string(),
        toolName: z.string(),
        isEnabled: z.boolean(),
        workspacePermissions: z.record(z.boolean())
    })),
    workspaceBindings: z.array(z.object({
        workspaceType: z.enum(['ide', 'knowledge', 'study', 'notes']),
        isAvailable: z.boolean(),
        uiVariant: z.enum(['full', 'compact', 'minimal']),
        isDefault: z.boolean()
    })),
    status: z.enum(['online', 'offline', 'busy', 'error']),
    tasksCompleted: z.number(),
    successRate: z.number(),
    tokensUsed: z.number(),
    lastActive: z.string(),
    createdAt: z.string()
})

export type AgentExportData = z.infer<typeof AgentExportSchema>

/**
 * Export agent configurations to JSON string
 *
 * @returns JSON string of all agents
 * @throws Error if serialization fails
 */
export function exportAgents(): string {
    try {
        const agents = useAgentsStore.getState().agents

        // Validate agents before export
        const validatedAgents = agents.map(agent => {
            const result = AgentExportSchema.safeParse(agent)
            if (!result.success) {
                console.error('[AgentIO] Validation failed for agent:', agent.id, result.error)
                throw new Error(`Agent "${agent.name}" validation failed: ${result.error.message}`)
            }
            return result.data
        })

        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            agents: validatedAgents
        }

        return JSON.stringify(exportData, null, 2)
    } catch (error) {
        console.error('[AgentIO] Export failed:', error)
        throw new Error(`Failed to export agents: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Import agent configurations from JSON string
 *
 * @param jsonString - JSON string to import
 * @param strategy - Merge strategy: 'replace', 'merge', or 'cancel'
 * @returns Number of agents imported
 * @throws Error if validation fails or user cancels
 */
export function importAgents(
    jsonString: string,
    strategy: 'replace' | 'merge' | 'cancel' = 'merge'
): number {
    try {
        // Parse JSON
        let importData: unknown
        try {
            importData = JSON.parse(jsonString)
        } catch (parseError) {
            throw new Error('Invalid JSON format')
        }

        // Validate structure
        const schema = z.object({
            version: z.string().optional(),
            exportedAt: z.string().optional(),
            agents: z.array(AgentExportSchema)
        })

        const result = schema.safeParse(importData)
        if (!result.success) {
            console.error('[AgentIO] Import validation failed:', result.error)
            throw new Error(`Invalid agent data: ${result.error.message}`)
        }

        const importedAgents = result.data.agents

        // Handle merge strategies
        const store = useAgentsStore.getState()
        let agentsToAdd: Agent[] = []

        switch (strategy) {
            case 'replace':
                // Replace all existing agents
                store.agents.forEach(agent => store.removeAgent(agent.id))
                agentsToAdd = importedAgents
                break

            case 'merge':
                // Merge: add new agents, update existing ones by ID
                agentsToAdd = importedAgents.map(importedAgent => {
                    const existingAgent = store.agents.find(a => a.id === importedAgent.id)
                    if (existingAgent) {
                        // Update existing agent
                        store.updateAgent(importedAgent.id, importedAgent)
                        return null // Don't add again
                    }
                    return importedAgent as Agent
                }).filter((agent): agent is Agent => agent !== null)
                break

            case 'cancel':
                return 0
        }

        // Add new agents
        let importedCount = 0
        agentsToAdd.forEach(agent => {
            try {
                store.addAgent(agent)
                importedCount++
            } catch (error) {
                console.error('[AgentIO] Failed to import agent:', agent.id, error)
            }
        })

        return importedCount
    } catch (error) {
        console.error('[AgentIO] Import failed:', error)
        throw new Error(`Failed to import agents: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Download agent export as JSON file
 *
 * @param filename - Optional filename (default: agents-export-{timestamp}.json)
 */
export function downloadAgentExport(filename?: string): void {
    try {
        const json = exportAgents()
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = filename || `agents-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)

        toast.success('Agents exported successfully')
    } catch (error) {
        console.error('[AgentIO] Download failed:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to export agents')
    }
}

/**
 * Read and validate agent import file
 *
 * @param file - File to read
 * @returns Parsed and validated import data
 * @throws Error if file is invalid
 */
export async function readAgentImportFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const content = e.target?.result
            if (typeof content === 'string') {
                resolve(content)
            } else {
                reject(new Error('Invalid file content'))
            }
        }

        reader.onerror = () => {
            reject(new Error('Failed to read file'))
        }

        reader.readAsText(file)
    })
}
