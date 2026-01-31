/**
 * Connection Test Button Component
 *
 * Handles connection test button with status indicator.
 *
 * @layer Presentation
 * @component ConnectionTestButton
 */

import { CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error'

interface ConnectionTestButtonProps {
    status: ConnectionStatus
    isTesting: boolean
    onTest: () => void
    onChangeKey: () => void
}

/**
 * Connection Test Button Component
 */
export function ConnectionTestButton({
    status,
    isTesting,
    onTest,
    onChangeKey
}: ConnectionTestButtonProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={onTest}
                disabled={isTesting}
                className="rounded-none gap-1"
            >
                {isTesting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : status === 'success' ? (
                    <CheckCircle2 className="w-3 h-3 text-success" />
                ) : status === 'error' ? (
                    <XCircle className="w-3 h-3 text-destructive" />
                ) : (
                    <RefreshCw className="w-3 h-3" />
                )}
                Test Connection
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={onChangeKey}
                className="rounded-none text-xs"
            >
                Change Key
            </Button>
        </div>
    )
}
