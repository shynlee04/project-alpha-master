/**
 * AgentChatPanel - Refactored with Component Composition
 *
 * Splits 767-line monolithic component into focused sub-components:
 * - ApiKeyStatus (~75 lines)
 * - ToolFacadeProvider (~50 lines)
 * - PromptEnhancementBanner (~30 lines)
 * - ChatMessageProvider (~120 lines)
 *
 * This orchestrator: ~200 lines
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Bot } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDeviceType } from '@/hooks/useMediaQuery';

import { useThreadsStore } from '@/stores/conversation-threads-store';
import { EnhancedChatInterface, ChatMessage } from './EnhancedChatInterface';
import { ApprovalOverlay, BatchApprovalBar } from '../chat';
import { AutoApproveSettings } from '../chat/AutoApproveSettings';
import { useAgentChatWithTools, type PendingApprovalInfo } from '@/lib/agent/hooks/use-agent-chat-with-tools';
import { useAutoApproveStore } from '@/stores/auto-approve-store';
import { useAgentSelection } from '@/stores/agent-selection-store';
import { useAgents } from '@/hooks/useAgents';
import { useConversationStore } from '@/lib/state/conversation-store';
import { getCodingAgentSystemPrompt } from '@/lib/agent/system-prompt';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

import { usePromptEnhancementStore } from '@/stores/prompt-enhancement-store';
import { usePromptEnhancer } from '@/lib/agent/hooks/use-prompt-enhancer';

// Refactored sub-components
import { ApiKeyStatus } from './ApiKeyStatus';
import { useToolFacades } from './ToolFacadeProvider';
import { PromptEnhancementBanner } from './PromptEnhancementBanner';
import { useChatMessages } from './ChatMessageProvider';

// Map agent provider display names to provider IDs
const PROVIDER_ID_MAP: Record<string, string> = {
  'OpenRouter': 'openrouter',
  'OpenAI': 'openai',
  'Anthropic': 'anthropic',
  'Google': 'gemini',
  'Mistral': 'openrouter',
  'OpenAI Compatible': 'openai-compatible',
};

interface AgentChatPanelProps {
  projectId: string | null;
  projectName?: string;
}

type ApprovalMode = 'batch' | 'individual';

export function AgentChatPanelRefactored({
  projectId,
  projectName = 'Project'
}: AgentChatPanelProps) {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useDeviceType();

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Store State
  const {
    activeConversationId,
    conversations,
    createConversation
  } = useConversationStore();

  // Threads Store
  const createThread = useThreadsStore(state => state.createThread);
  const setActiveThread = useThreadsStore(state => state.setActiveThread);

  // Prompt Enhancement
  const { isEnabled: isEnhancementEnabled, toggle: toggleEnhancement } = usePromptEnhancementStore();
  const { enhancePrompt, isEnhancing: isEnhancingPrompt } = usePromptEnhancer();

  // Auto-Approve
  const { shouldAutoApprove } = useAutoApproveStore();

  // Agent selection
  const { activeAgentId } = useAgentSelection();
  const { agents } = useAgents();
  const activeAgent = agents.find(a => a.id === activeAgentId);

  // Provider ID
  const providerId = useMemo(() => {
    if (!activeAgent?.provider) return 'openrouter';
    return PROVIDER_ID_MAP[activeAgent.provider] || 'openrouter';
  }, [activeAgent?.provider]);

  // Tool facades
  const { fileTools, terminalTools, isReady: toolsReady } = useToolFacades();

  // System prompt
  const systemPrompt = useMemo(() => {
    return getCodingAgentSystemPrompt(`Project: ${projectName}`);
  }, [projectName]);

  // Chat hook
  const {
    messages: hookMessages,
    rawMessages,
    sendMessage,
    isLoading,
    error,
    toolsAvailable,
    pendingApprovals,
    approveToolCall,
    rejectToolCall,
    modelId,
  } = useAgentChatWithTools({
    fileTools,
    terminalTools,
    eventBus: useWorkspace().eventBus || null,
    systemMessage: systemPrompt,
    providerId,
    modelId: activeAgent?.model,
    apiKey: apiKey || undefined,
    customBaseURL: activeAgent?.customBaseURL,
    customHeaders: activeAgent?.customHeaders,
    enableTools: activeAgent?.enableNativeTools ?? true,
  });

  // Messages
  const { allMessages, createWelcomeMessage, updateScrollPosition } = useChatMessages({
    projectId,
    projectName,
    activeAgentId,
    hookMessages,
    rawMessages,
    isInitialized
  });

  // Approval state
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('batch');
  const [currentApprovalIndex, setCurrentApprovalIndex] = useState(0);
  const currentApproval = pendingApprovals[currentApprovalIndex];

  // Initialization
  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        if (!projectId) {
          setIsInitialized(true);
          return;
        }

        if (activeConversationId) {
          setIsInitialized(true);
          return;
        }

        createConversation(projectId, activeAgentId);
        setIsInitialized(true);
      } catch (err) {
        console.error('[AgentChatPanel] Failed to load threads:', err);
        if (isCancelled) return;
        setIsInitialized(true);
      }
    };

    load();
    return () => { isCancelled = true; };
  }, [projectId, activeConversationId, activeAgentId, createConversation]);

  // Scroll restoration
  const activeConversation = activeConversationId ? conversations[activeConversationId] : null;
  useEffect(() => {
    if (activeConversation?.metadata.scrollPosition && scrollRef.current) {
      scrollRef.current.scrollTop = activeConversation.metadata.scrollPosition;
    }
  }, [activeConversation?.metadata.id]);

  // Scroll tracker
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (activeConversationId) {
      updateScrollPosition(activeConversationId, e.currentTarget.scrollTop);
    }
  }, [activeConversationId, updateScrollPosition]);

  // Send message
  const handleSendMessage = useCallback(async (message: string) => {
    if (!apiKey) {
      toast.error('API key is required');
      return;
    }

    // Enhancement logic
    if (isEnhancementEnabled) {
      const enhanced = await enhancePrompt(message);
      sendMessage(enhanced);
    } else {
      sendMessage(message);
    }
  }, [apiKey, isEnhancementEnabled, enhancePrompt, sendMessage]);

  // Approval handlers
  const handleApprove = useCallback((approval: PendingApprovalInfo) => {
    approveToolCall(approval.toolCallId);
  }, [approveToolCall]);

  const handleReject = useCallback((approval: PendingApprovalInfo) => {
    rejectToolCall(approval.toolCallId);
  }, [rejectToolCall]);

  const handleApproveAll = useCallback(() => {
    pendingApprovals.forEach(handleApprove);
  }, [pendingApprovals, handleApprove]);

  const handleRejectAll = useCallback(() => {
    pendingApprovals.forEach(handleReject);
  }, [pendingApprovals, handleReject]);

  const handleReviewEach = useCallback(() => {
    setApprovalMode('individual');
    setCurrentApprovalIndex(0);
  }, []);

  // Artifact handlers (stubs)
  const handlePreviewArtifact = useCallback((artifact: ChatMessage) => {
    console.log('Preview artifact:', artifact);
  }, []);

  const handleSaveArtifact = useCallback((artifact: ChatMessage) => {
    console.log('Save artifact:', artifact);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Agent Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="enhance-toggle" className="text-xs">Enhance</Label>
          <Switch
            id="enhance-toggle"
            checked={isEnhancementEnabled}
            onCheckedChange={toggleEnhancement}
          />
        </div>
      </div>

      {/* API Key Status */}
      <ApiKeyStatus
        providerId={providerId}
        onApiKeyChange={setApiKey}
        onErrorChange={setApiKeyError}
      />

      {/* Auto-Approve Settings */}
      <AutoApproveSettings className="mx-2 mt-2" compact />

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Enhancement Banner */}
        <PromptEnhancementBanner isEnhancing={isEnhancingPrompt} />

        {/* Chat Interface */}
        <EnhancedChatInterface
          messages={allMessages}
          onSendMessage={handleSendMessage}
          isTyping={isLoading}
          onPreviewArtifact={handlePreviewArtifact}
          onSaveArtifact={handleSaveArtifact}
          onScroll={handleScroll}
          setScrollRef={scrollRef}
        />
      </div>

      {/* Batch Approval Bar */}
      {pendingApprovals.length > 1 && (
        <BatchApprovalBar
          pendingApprovals={pendingApprovals}
          onApproveAll={handleApproveAll}
          onRejectAll={handleRejectAll}
          onReviewEach={handleReviewEach}
          mode={approvalMode}
          currentIndex={currentApprovalIndex}
          className="mx-2"
        />
      )}

      {/* Approval Overlay */}
      {currentApproval && (approvalMode === 'individual' || pendingApprovals.length === 1) && (
        <ApprovalOverlay
          isOpen={true}
          onApprove={() => approvalMode === 'individual'
            ? handleApprove(currentApproval)
            : handleApprove(currentApproval)
          }
          onReject={() => approvalMode === 'individual'
            ? handleReject(currentApproval)
            : handleReject(currentApproval)
          }
          toolName={currentApproval.toolName}
          description={currentApproval.description}
          code={currentApproval.proposedContent}
          mode="inline"
          riskLevel={currentApproval.riskLevel}
        />
      )}
    </div>
  );
}
