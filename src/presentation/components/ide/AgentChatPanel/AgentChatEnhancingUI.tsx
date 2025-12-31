/**
 * Agent Chat Enhancing UI Component
 *
 * Displays a blocking overlay while prompt enhancement is in progress.
 *
 * @layer Presentation
 * @component AgentChatEnhancingUI
 */

import { Sparkles } from 'lucide-react';

interface AgentChatEnhancingUIProps {
    isEnhancing: boolean;
}

/**
 * Agent Chat Enhancing UI Component
 */
export function AgentChatEnhancingUI({ isEnhancing }: AgentChatEnhancingUIProps) {
    if (!isEnhancing) {
        return null;
    }

    return (
        <div className="absolute inset-0 z-20 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-3 p-4 bg-surface-dark border border-border-dark rounded-lg shadow-xl">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                <span className="text-sm font-medium text-foreground">Enhancing prompt...</span>
            </div>
        </div>
    );
}
