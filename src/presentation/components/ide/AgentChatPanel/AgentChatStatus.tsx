/**
 * Agent Chat Status Component
 *
 * Story: LT-4.19 (Light Theme Migration)
 * UPDATED_AT: 2026-01-04T10:30:00Z
 *
 * Displays error messages and API key warnings.
 * Uses CSS custom properties for light/dark theme support.
 *
 * @layer Presentation
 * @component AgentChatStatus
 */

import { AlertCircle } from 'lucide-react';
import { TruncatedText } from '@/presentation/components/ui/truncated-text';

interface AgentChatStatusProps {
    error: Error | null;
    apiKeyError: string | null;
    providerId: string;
}

/**
 * Agent Chat Status Component
 */
export function AgentChatStatus({ error, apiKeyError, providerId }: AgentChatStatusProps) {
    if (!error && !apiKeyError) {
        return null;
    }

    return (
        <>
            {/* Error Display */}
            {error && (
                <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-destructive">
                        {error.message || 'Agent tool execution failed. Please try again.'}
                    </span>
                </div>
            )}

            {/* API Key Missing Warning */}
            {apiKeyError && (
                <div className="px-4 py-2 bg-[var(--warning)]/10 border-b border-[var(--warning)]/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[var(--warning)] flex-shrink-0" />
                    <TruncatedText
                        text={`API Key missing for ${providerId}. Please configure it in the Agents panel.`}
                        className="text-xs text-[var(--warning)] font-medium"
                    />
                </div>
            )}
        </>
    );
}
