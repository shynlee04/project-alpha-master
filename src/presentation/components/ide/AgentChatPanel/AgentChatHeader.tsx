/**
 * Agent Chat Header Component
 *
 * Displays the agent panel header with title, tools status,
 * prompt enhancement toggle, model indicator, workspace switcher, and clear button.
 *
 * @layer Presentation
 * @component AgentChatHeader
 * @governance E1-11: Workspace Switcher in Chat Header
 */

import { Bot, Sparkles, Bug, MessageSquare } from 'lucide-react';
import { Switch } from '@/presentation/components/ui/switch';
import { Label } from '@/presentation/components/ui/label';
import { TruncatedText } from '@/presentation/components/ui/truncated-text';
import { cn } from '@/lib/utils';

// CHAT-006: Chat view states for tabbed interface
type ChatViewState = 'chat' | 'threads';

interface AgentChatHeaderProps {
    modelId: string;
    toolsAvailable: boolean;
    isEnhancementEnabled: boolean;
    onToggleEnhancement: () => void;
    onClear: () => void;
    onCaptureDebugSession: () => void;
    // CHAT-006: Thread display and tabbed view state
    activeThreadName?: string | null;
    chatViewState?: ChatViewState;
    setChatViewState?: (state: ChatViewState) => void;
    threadCount?: number;
}

/**
 * Agent Chat Header Component
 *
 * E1-11: Added compact workspace switcher dropdown in header
 * FIX-2026-01-05: Use useProjectContextSafe to prevent crash outside ProjectProvider
 */
export function AgentChatHeader({
    modelId,
    toolsAvailable,
    isEnhancementEnabled,
    onToggleEnhancement,
    onClear,
    onCaptureDebugSession,
    activeThreadName,
    chatViewState = 'chat',
    setChatViewState,
    threadCount = 0,
}: AgentChatHeaderProps) {
    // Truncate model ID for display
    const displayModel = modelId.split('/').pop()?.substring(0, 20) || '';

    // NOTE: Workspace switcher removed - workspace navigation now handled via router
    // Workspace switcher functionality will be migrated to a separate component

    return (
        <div className="flex flex-col bg-surface-darker">
            {/* CHAT-006: Tabbed View Interface */}
            {setChatViewState && (
                <div className="flex items-center border-b border-border-dark">
                    <button
                        onClick={() => setChatViewState('chat')}
                        className={cn(
                            'px-4 py-2 text-xs font-medium font-mono transition-colors',
                            'hover:bg-muted/30 focus:outline-none',
                            chatViewState === 'chat'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-muted-foreground'
                        )}
                    >
                        <span className="flex items-center gap-1.5">
                            <Bot className="w-3 h-3" />
                            CHAT
                        </span>
                    </button>
                    <button
                        onClick={() => setChatViewState('threads')}
                        className={cn(
                            'px-4 py-2 text-xs font-medium font-mono transition-colors',
                            'hover:bg-muted/30 focus:outline-none',
                            chatViewState === 'threads'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-muted-foreground'
                        )}
                    >
                        <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3" />
                            THREADS
                            {threadCount > 0 && (
                                <span className={cn(
                                    'px-1.5 py-0.5 text-[10px] rounded-none',
                                    chatViewState === 'threads'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                )}>
                                    {threadCount}
                                </span>
                            )}
                        </span>
                    </button>
                </div>
            )}

            {/* Original Header Content */}
            <div className={cn(
                'h-10 px-4 flex items-center justify-between',
                !setChatViewState && 'border-b border-border-dark'
            )}>
                <div className="flex items-center gap-2">
                    <TruncatedText
                        text={activeThreadName || 'AI AGENT'}
                        className="text-xs font-bold text-muted-foreground tracking-wider uppercase font-pixel max-w-[120px]"
                    />
                    {toolsAvailable && (
                        <TruncatedText
                            text="TOOLS READY"
                            className="text-[10px] text-success font-pixel max-w-[80px]"
                        />
                    )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                {/* NOTE: Workspace switcher removed during ProjectContext migration */}
                {/* Workspace navigation now handled via router directly */}

                {/* Prompt Enhancement Toggle */}
                <div className="flex items-center gap-2 border-l border-border-dark pl-3">
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
                        <Sparkles className="w-3 h-3 text-warning" />
                        <span className="hidden md:inline">Enhance</span>
                    </Label>
                </div>

                {/* Model indicator */}
                <TruncatedText
                    text={displayModel}
                    className="text-[10px] text-muted-foreground font-mono max-w-[60px] sm:max-w-[100px]"
                />
                {/* P2-6: Capture Debug Session button - MM-11: Changed from blue to orange theme */}
                <button
                    onClick={onCaptureDebugSession}
                    title="Capture Debug Session to Knowledge workspace"
                    className="text-xs text-warning hover:text-warning/80 transition-colors px-2 py-1 flex items-center gap-1 hidden sm:flex"
                >
                    <Bug className="w-3 h-3" />
                    <span className="hidden lg:inline">Capture</span>
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
        </div>
    );
}
