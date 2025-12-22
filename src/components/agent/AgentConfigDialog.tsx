/**
 * AgentConfigDialog - Agent Configuration Form Dialog
 * 
 * @epic Epic-28 Story 28-16
 * @roadmap Replace mock submission with TanStack Query in Epic 25 (Story 25-2)
 * @see _bmad-output/epics/shards/epic-25-ai-foundation.md
 */

import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Bot, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { Agent } from '@/mocks/agents'

/**
 * Provider-Model mapping for available LLM providers
 * @roadmap Sync with actual API endpoints in Epic 25
 */
const PROVIDER_MODELS: Record<Agent['provider'], string[]> = {
    OpenAI: ['gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini'],
    Anthropic: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
    Mistral: ['mistral-large-latest', 'mistral-medium', 'mixtral-8x7b'],
    Google: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'],
}

const PROVIDERS = Object.keys(PROVIDER_MODELS) as Agent['provider'][]

interface AgentConfigDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => void
}

export function AgentConfigDialog({
    open,
    onOpenChange,
    onSubmit,
}: AgentConfigDialogProps) {
    const { t } = useTranslation()

    // Form state
    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [provider, setProvider] = useState<Agent['provider'] | ''>('')
    const [model, setModel] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Validation state
    const [errors, setErrors] = useState<{
        name?: string
        provider?: string
        model?: string
    }>({})

    // Available models based on selected provider
    const availableModels = useMemo(() => {
        if (!provider) return []
        return PROVIDER_MODELS[provider] || []
    }, [provider])

    // Reset model when provider changes
    const handleProviderChange = useCallback((value: string) => {
        setProvider(value as Agent['provider'])
        setModel('') // Reset model selection
        setErrors(prev => ({ ...prev, provider: undefined }))
    }, [])

    // Validation function
    const validate = useCallback(() => {
        const newErrors: typeof errors = {}

        if (!name.trim()) {
            newErrors.name = t('agents.config.validation.nameRequired', 'Agent name is required')
        }
        if (!provider) {
            newErrors.provider = t('agents.config.validation.providerRequired', 'Please select a provider')
        }
        if (!model) {
            newErrors.model = t('agents.config.validation.modelRequired', 'Please select a model')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [name, provider, model, t])

    // Form submission
    const handleSubmit = useCallback(async () => {
        if (!validate()) return
        if (!provider) return

        setIsSubmitting(true)

        // Simulate network delay for UX
        await new Promise(resolve => setTimeout(resolve, 300))

        onSubmit({
            name: name.trim(),
            role: role.trim() || 'Assistant',
            status: 'offline',
            provider,
            model,
            description: role.trim() || undefined,
        })

        // Show success toast
        toast.success(t('agents.config.successToast', "Agent '{{name}}' created successfully!", { name: name.trim() }))

        // Reset form and close
        setName('')
        setRole('')
        setProvider('')
        setModel('')
        setErrors({})
        setIsSubmitting(false)
        onOpenChange(false)
    }, [name, role, provider, model, validate, onSubmit, onOpenChange, t])

    // Handle cancel
    const handleCancel = useCallback(() => {
        setName('')
        setRole('')
        setProvider('')
        setModel('')
        setErrors({})
        onOpenChange(false)
    }, [onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] rounded-none border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-pixel text-lg">
                        <Bot className="w-5 h-5 text-primary" />
                        {t('agents.config.title', 'New Agent Configuration')}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        {t('agents.config.subtitle', 'Configure a new AI agent for your workflow')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Agent Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="agent-name">
                            {t('agents.config.name', 'Agent Name')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="agent-name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                            }}
                            placeholder={t('agents.config.namePlaceholder', 'Enter agent name...')}
                            className="rounded-none"
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name}</p>
                        )}
                    </div>

                    {/* Role/Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="agent-role">
                            {t('agents.config.role', 'Role')}
                        </Label>
                        <Input
                            id="agent-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder={t('agents.config.rolePlaceholder', 'e.g., Frontend Developer')}
                            className="rounded-none"
                        />
                    </div>

                    {/* Provider Selection */}
                    <div className="grid gap-2">
                        <Label>
                            {t('agents.config.provider', 'LLM Provider')} <span className="text-destructive">*</span>
                        </Label>
                        <Select value={provider} onValueChange={handleProviderChange}>
                            <SelectTrigger className="rounded-none">
                                <SelectValue placeholder={t('agents.config.providerPlaceholder', 'Select provider...')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-none">
                                {PROVIDERS.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {p}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.provider && (
                            <p className="text-xs text-destructive">{errors.provider}</p>
                        )}
                    </div>

                    {/* Model Selection */}
                    <div className="grid gap-2">
                        <Label>
                            {t('agents.config.model', 'Model')} <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={model}
                            onValueChange={(value) => {
                                setModel(value)
                                if (errors.model) setErrors(prev => ({ ...prev, model: undefined }))
                            }}
                            disabled={!provider}
                        >
                            <SelectTrigger className="rounded-none">
                                <SelectValue placeholder={t('agents.config.modelPlaceholder', 'Select model...')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-none">
                                {availableModels.map((m) => (
                                    <SelectItem key={m} value={m}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.model && (
                            <p className="text-xs text-destructive">{errors.model}</p>
                        )}
                        {!provider && (
                            <p className="text-xs text-muted-foreground">
                                {t('agents.config.selectProviderFirst', 'Select a provider first')}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="rounded-none"
                    >
                        {t('agents.config.cancel', 'Cancel')}
                    </Button>
                    <Button
                        variant="pixel-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {t('agents.config.save', 'Create Agent')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
