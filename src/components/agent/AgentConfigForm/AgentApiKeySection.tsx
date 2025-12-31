/**
 * Agent API Key Section Component
 *
 * Handles API key input, storage, and connection testing.
 *
 * @layer Presentation
 * @component AgentApiKeySection
 */

import { useState } from 'react'
import { Key, CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface AgentApiKeySectionProps {
    providerId: string
    providerName: string
    hasApiKey: boolean
    isCheckingKey: boolean
    onSetApiKey: (key: string) => Promise<void>
    onTestConnection: () => Promise<{ success: boolean; latencyMs: number; error?: string }>
}

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error'

/**
 * Agent API Key Section Component
 */
export function AgentApiKeySection({
    providerId,
    providerName,
    hasApiKey,
    isCheckingKey,
    onSetApiKey,
    onTestConnection
}: AgentApiKeySectionProps) {
    const [apiKey, setApiKey] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')

    const handleSaveKey = async () => {
        if (!apiKey.trim()) return

        setIsSaving(true)
        try {
            await onSetApiKey(apiKey)
            setApiKey('••••')
            toast.success('API key saved successfully')
        } catch (error) {
            toast.error('Failed to save API key')
        } finally {
            setIsSaving(false)
        }
    }

    const handleTest = async () => {
        setIsTesting(true)
        setConnectionStatus('testing')
        try {
            const result = await onTestConnection()
            if (result.success) {
                setConnectionStatus('success')
                toast.success(`Connection successful! (${result.latencyMs}ms)`)
            } else {
                setConnectionStatus('error')
                toast.error(`Connection failed: ${result.error}`)
            }
        } finally {
            setIsTesting(false)
        }
    }

    const isOptional = providerId === 'openrouter' || providerId === 'openai-compatible'

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Key
                    {!isOptional && <span className="text-destructive">*</span>}
                </Label>
                {hasApiKey ? (
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                ) : (
                    <XCircle className="w-3 h-3 text-destructive" />
                )}
            </div>

            {isCheckingKey ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking...
                </div>
            ) : apiKey !== '' && apiKey !== '••••' ? (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTest}
                        disabled={isTesting}
                        className="rounded-none gap-1"
                    >
                        {isTesting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : connectionStatus === 'success' ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                        ) : connectionStatus === 'error' ? (
                            <XCircle className="w-3 h-3 text-destructive" />
                        ) : (
                            <RefreshCw className="w-3 h-3" />
                        )}
                        Test Connection
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setApiKey('')}
                        className="rounded-none text-xs"
                    >
                        Change Key
                    </Button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter API key..."
                        className="rounded-none flex-1"
                    />
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveKey}
                        disabled={isSaving || !apiKey.trim()}
                        className="rounded-none gap-1"
                    >
                        {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                        Save
                    </Button>
                </div>
            )}

            {providerId === 'openrouter' && !hasApiKey && (
                <p className="text-xs text-info mt-2">
                    Free models work without API key. Add key for premium models.
                </p>
            )}

            {providerId === 'openai-compatible' && !hasApiKey && (
                <p className="text-xs text-info mt-2">
                    For local providers like LM Studio or Ollama, API key may not be required.
                </p>
            )}
        </div>
    )
}
