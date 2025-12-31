/**
 * AgentConfigDialog - Refactored with Component Composition
 *
 * Splits 1065-line monolithic component into focused sub-components:
 * - AgentProviderSelector (~60 lines)
 * - AgentModelSelector (~90 lines)
 * - AgentApiKeyInput (~130 lines)
 * - AgentLLMParams (~70 lines)
 * - AgentBasicInfoForm (~75 lines)
 * - ToolPermissionsMatrix (~115 lines)
 * - WorkspaceBindingsConfig (~115 lines)
 *
 * This orchestrator: ~150 lines
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'

// Sub-components
import { AgentBasicInfoForm } from './AgentBasicInfoForm'
import { AgentProviderSelector } from './AgentProviderSelector'
import { AgentModelSelector } from './AgentModelSelector'
import { AgentApiKeyInput } from './AgentApiKeyInput'
import { AgentLLMParams } from './AgentLLMParams'
import { ToolPermissionsMatrix } from './ToolPermissionsMatrix'
import { WorkspaceBindingsConfig } from './WorkspaceBindingsConfig'

// Types
import type { Agent } from '@/core/entities/Agent'
import type { WorkspaceBinding, AgentToolBinding } from '@/core/entities/Agent'

// Default workspace bindings
const DEFAULT_WORKSPACE_BINDINGS: WorkspaceBinding[] = [
  { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
  { workspaceType: 'knowledge', isAvailable: true, uiVariant: 'compact', isDefault: false },
  { workspaceType: 'study', isAvailable: true, uiVariant: 'compact', isDefault: false },
  { workspaceType: 'notes', isAvailable: true, uiVariant: 'compact', isDefault: false }
]

// Default tools
const DEFAULT_TOOLS: AgentToolBinding[] = [
  {
    toolId: 'file-read',
    toolName: 'Read Files',
    isEnabled: true,
    workspacePermissions: { ide: true, knowledge: true, study: true, notes: true }
  },
  {
    toolId: 'file-write',
    toolName: 'Write Files',
    isEnabled: true,
    workspacePermissions: { ide: true, knowledge: false, study: true, notes: true }
  },
  {
    toolId: 'terminal',
    toolName: 'Terminal Commands',
    isEnabled: true,
    workspacePermissions: { ide: true, knowledge: false, study: false, notes: false }
  }
]

interface AgentConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (agent: Agent) => void
  agent?: Agent
}

export function AgentConfigDialogRefactored({
  open,
  onOpenChange,
  onSuccess,
  agent
}: AgentConfigDialogProps) {
  const { t } = useTranslation()

  // Form state
  const [name, setName] = useState(agent?.name || '')
  const [role, setRole] = useState(agent?.role || '')
  const [description, setDescription] = useState(agent?.description || '')
  const [providerId, setProviderId] = useState(agent?.providerId || 'openrouter')
  const [modelId, setModelId] = useState(agent?.modelId || '')
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt || '')

  // LLM parameters
  const [temperature, setTemperature] = useState(agent?.temperature || 0.7)
  const [maxTokens, setMaxTokens] = useState(agent?.maxTokens || 4096)
  const [topP, setTopP] = useState(agent?.topP || 0.95)
  const [topK, setTopK] = useState<number | undefined>(agent?.topK)

  // Tool and workspace bindings
  const [tools, setTools] = useState<AgentToolBinding[]>(agent?.tools || DEFAULT_TOOLS)
  const [workspaceBindings, setWorkspaceBindings] = useState<WorkspaceBinding[]>(
    agent?.workspaceBindings || DEFAULT_WORKSPACE_BINDINGS
  )

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle tool permission toggle
  const handleToolToggle = useCallback((toolId: string, workspace: 'ide' | 'knowledge' | 'study' | 'notes') => {
    setTools(prev => prev.map(tool =>
      tool.toolId === toolId
        ? {
            ...tool,
            workspacePermissions: {
              ...tool.workspacePermissions,
              [workspace]: !tool.workspacePermissions[workspace]
            }
          }
        : tool
    ))
  }, [])

  // Handle tool enabled toggle
  const handleToolEnabledToggle = useCallback((toolId: string) => {
    setTools(prev => prev.map(tool =>
      tool.toolId === toolId ? { ...tool, isEnabled: !tool.isEnabled } : tool
    ))
  }, [])

  // Handle workspace binding change
  const handleWorkspaceBindingChange = useCallback((
    workspaceType: 'ide' | 'knowledge' | 'study' | 'notes',
    updates: Partial<WorkspaceBinding>
  ) => {
    setWorkspaceBindings(prev => prev.map(binding =>
      binding.workspaceType === workspaceType
        ? { ...binding, ...updates }
        : binding
    ))
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    // Validation
    if (!name.trim()) {
      toast.error('Agent name is required')
      return
    }
    if (!providerId) {
      toast.error('Provider is required')
      return
    }
    if (!modelId) {
      toast.error('Model is required')
      return
    }

    setIsSubmitting(true)

    try {
      // Create agent object
      const agentData: Agent = {
        id: agent?.id || `agent_${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        providerId,
        modelId,
        systemPrompt: systemPrompt.trim(),
        temperature,
        maxTokens,
        topP,
        topK,
        tools,
        workspaceBindings,
        isActive: true,
        createdAt: agent?.createdAt || new Date(),
        updatedAt: new Date()
      }

      onSuccess?.(agentData)
      onOpenChange(false)
      toast.success('Agent saved successfully')

      // Reset form if creating new
      if (!agent) {
        setName('')
        setRole('')
        setDescription('')
        setSystemPrompt('')
        setTemperature(0.7)
        setMaxTokens(4096)
        setTopP(0.95)
        setTopK(undefined)
      }
    } catch (error) {
      console.error('Failed to save agent:', error)
      toast.error('Failed to save agent')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    name,
    description,
    providerId,
    modelId,
    systemPrompt,
    temperature,
    maxTokens,
    topP,
    topK,
    tools,
    workspaceBindings,
    agent,
    onSuccess,
    onOpenChange
  ])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle>{agent ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-4">
            <AgentBasicInfoForm
              name={name}
              role={role}
              description={description}
              onNameChange={setName}
              onRoleChange={setRole}
              onDescriptionChange={setDescription}
            />

            <AgentProviderSelector
              value={providerId}
              onChange={setProviderId}
            />

            <AgentModelSelector
              providerId={providerId}
              value={modelId}
              onChange={setModelId}
            />

            <AgentApiKeyInput
              providerId={providerId}
              onSave={() => {}}
            />

            <AgentLLMParams
              temperature={temperature}
              maxTokens={maxTokens}
              topP={topP}
              topK={topK}
              onTemperatureChange={setTemperature}
              onMaxTokensChange={setMaxTokens}
              onTopPChange={setTopP}
              onTopKChange={setTopK}
            />

            <div className="grid gap-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter system prompt or agent personality..."
                rows={4}
                className="rounded-none resize-none"
              />
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6 mt-4">
            <ToolPermissionsMatrix
              tools={tools}
              onToolToggle={handleToolToggle}
              onEnabledToggle={handleToolEnabledToggle}
            />
          </TabsContent>

          <TabsContent value="workspaces" className="space-y-6 mt-4">
            <WorkspaceBindingsConfig
              bindings={workspaceBindings}
              onBindingChange={handleWorkspaceBindingChange}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="rounded-none"
          >
            {isSubmitting ? 'Saving...' : 'Save Agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
