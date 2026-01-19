/**
 * Agent API Key Section Component
 *
 * Orchestrates API key input, storage, and connection testing.
 *
 * @layer Presentation
 * @component AgentApiKeySection
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ApiKeyStatus } from './ApiKeyStatus'
import { ApiKeyInput } from './ApiKeyInput'
import { ConnectionTestButton } from './ConnectionTestButton'

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error'

interface AgentApiKeySectionProps {
    providerId: string
    providerName: string
    hasApiKey: boolean
    isCheckingKey: boolean
    onSetApiKey: (key: string) => Promise<void>
    onTestConnection: () => Promise<{ success: boolean; latencyMs: number; error?: string }>
}

/**
 * Agent API Key Section Component
 */
export function AgentApiKeySection({
    providerId,
    providerName: _providerName, // Intentionally unused (reserved for future use)
    hasApiKey,
    isCheckingKey,
    onSetApiKey,
    onTestConnection
}: AgentApiKeySectionProps) {
    const { t } = useTranslation()
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
            toast.success(t('agentKey.saveSuccess'))
        } catch (error) {
            toast.error(t('agentKey.saveFailed'))
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
                toast.success(t('agentKey.connectionSuccess', { latency: result.latencyMs }))
            } else {
                setConnectionStatus('error')
                toast.error(t('agentKey.connectionFailed', { error: result.error }))
            }
        } finally {
            setIsTesting(false)
        }
    }

    return (
        <div className="space-y-4">
            <ApiKeyStatus
                providerId={providerId}
                hasApiKey={hasApiKey || apiKey === '••••'}
                isCheckingKey={isCheckingKey}
            />

            {!isCheckingKey && apiKey !== '' && apiKey !== '••••' && (
                <ConnectionTestButton
                    status={connectionStatus}
                    isTesting={isTesting}
                    onTest={handleTest}
                    onChangeKey={() => setApiKey('')}
                />
            )}

            {!isCheckingKey && apiKey === '' && (
                <ApiKeyInput
                    value={apiKey}
                    onChange={setApiKey}
                    onSave={handleSaveKey}
                    isSaving={isSaving}
                />
            )}
        </div>
    )
}
