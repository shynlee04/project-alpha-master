/**
 * Agent Chat Header Component
 *
 * Displays the agent panel header with title, tools status,
 * prompt enhancement toggle, model indicator, and clear button.
 *
 * @layer Presentation
 * @component AgentChatHeader
 */

import { Bot, Sparkles, Bug } from 'lucide-react';
import { Switch } from '@/presentation/components/ui/switch';
import { Label } from '@/presentation/components/ui/label';
import { TruncatedText } from '@/presentation/components/ui/truncated-text';

interface AgentChatHeaderProps {
    modelId: string;
    toolsAvailable: boolean;
    isEnhancementEnabled: boolean;
    onToggleEnhancement: () => void;
    onClear: () => void;
    onCaptureDebugSession: () => void;
}

/**
 * Agent Chat Header Component
 */
export function AgentChatHeader({
    modelId,
    toolsAvailable,
    isEnhancementEnabled,
    onToggleEnhancement,
    onClear,
    onCaptureDebugSession
}: AgentChatHeaderProps) {
    // Truncate model ID for display
    const displayModel = modelId.split('/').pop()?.substring(0, 20) || '';

    return (
        <div className="h-10 px-4 flex items-center justify-between border-b border-border-dark bg-surface-darker">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary/20 flex items-center justify-center border border-primary/30 flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <TruncatedText
                    text="AI AGENT"
                    className="text-xs font-bold text-muted-foreground tracking-wider uppercase font-pixel max-w-[80px]"
                />
                {toolsAvailable && (
                    <TruncatedText
                        text="TOOLS READY"
                        className="text-[10px] text-green-400 font-pixel max-w-[80px]"
                    />
                )}
            </div>
            <div className="flex items-center gap-3">
                {/* Prompt Enhancement Toggle */}
                <div className="flex items-center gap-2 border-r border-border-dark pr-3">
                    <Switch
                        id="prompt-enhance"
                        checked={isEnhancementEnabled}
                        onCheckedChange={onToggleEnhancement}
                        className="h-4 w-7 data-[state=checked]:bg-primary"
                    />
                    <Label
                        htmlFor="prompt-enhance"
                        className="text-[10px] cursor-pointer text-muted-foreground flex items-center gap-1"
                        title="Enhance prompts before sending"
                    >
                        <Sparkles className="w-3 h-3 text-yellow-500" />
                        Enhance
                    </Label>
                </div>

                {/* Model indicator */}
                <TruncatedText
                    text={displayModel}
                    className="text-[10px] text-muted-foreground font-mono max-w-[100px]"
                />
                {/* P2-6: Capture Debug Session button */}
                <button
                    onClick={onCaptureDebugSession}
                    title="Capture Debug Session to Knowledge workspace"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 flex items-center gap-1"
                >
                    <Bug className="w-3 h-3" />
                    Capture
                </button>
                <button
                    onClick={onClear}
                    title="Clear conversation"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
