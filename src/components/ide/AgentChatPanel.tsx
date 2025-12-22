import { useEffect, useState, useCallback } from 'react';
import { Bot, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { appendConversationMessage, clearConversation, getConversation } from '../../lib/workspace';
import { EnhancedChatInterface, ChatMessage } from './EnhancedChatInterface';
import { ApprovalOverlay } from '../chat/ApprovalOverlay';
import { Button } from '@/components/ui/button';

export function AgentChatPanel({ projectId, projectName = 'Project' }: { projectId: string | null; projectName?: string }) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [approvalRequest, setApprovalRequest] = useState<{
        isOpen: boolean;
        toolName: string;
        description: string;
        code?: string;
        oldCode?: string;
        newCode?: string;
    }>({
        isOpen: false,
        toolName: '',
        description: ''
    });

    // Create welcome message
    const createWelcomeMessage = useCallback((): ChatMessage => ({
        id: 'welcome',
        role: 'assistant',
        content: t('agent.welcome_message', { projectName }),
        timestamp: new Date(),
    }), [projectName, t]);

    // Load conversation
    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            try {
                if (!projectId) {
                    setMessages([createWelcomeMessage()]);
                    return;
                }

                const convo = await getConversation(projectId);
                if (isCancelled) return;

                if (convo && convo.messages.length > 0) {
                    // Map legacy messages to ChatMessage type if needed
                    const mappedMessages = convo.messages.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    }));
                    setMessages(mappedMessages);
                } else {
                    setMessages([createWelcomeMessage()]);
                }
            } catch {
                if (isCancelled) return;
                setMessages([createWelcomeMessage()]);
            }
        };

        load();
        return () => { isCancelled = true; };
    }, [projectId, projectName, createWelcomeMessage]);

    // Handle sending messages
    const handleSendMessage = async (content: string) => {
        const userMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        if (projectId) {
            await appendConversationMessage(projectId, { ...userMessage, timestamp: userMessage.timestamp.getTime() });
        }

        // Simulating Agent Response
        window.setTimeout(async () => {
            const assistantMessage: ChatMessage = {
                id: `msg_${Date.now()}_assistant`,
                role: 'assistant',
                content: t('agent.demo_response'),
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            if (projectId) {
                await appendConversationMessage(projectId, { ...assistantMessage, timestamp: assistantMessage.timestamp.getTime() });
            }
        }, 300);
    };

    // MOCK: Trigger tool approval for development verification
    const triggerMockApproval = () => {
        setApprovalRequest({
            isOpen: true,
            toolName: 'write_file',
            description: 'Creating new component: src/components/TestComponent.tsx',
            code: `export const TestComponent = () => {\n  return <div>Hello Validation</div>;\n};`,
            oldCode: `// Old content`,
            newCode: `export const TestComponent = () => {\n  return <div>Hello Validation</div>;\n};`
        });
    };

    const handleApprove = () => {
        setApprovalRequest(prev => ({ ...prev, isOpen: false }));
        // TODO(Epic 25): Replace mock with real EventBus subscription to handle actual tool approval
        // This will likely involve listening for 'tool:approval_required' and emitting 'tool:approved'
        console.log('[AgentChatPanel] Tool Approved');

        const approvalMsg: ChatMessage = {
            id: `msg_${Date.now()}_system`,
            role: 'assistant',
            content: 'Tool execution approved. File created successfully.',
            timestamp: new Date(),
            toolExecutions: [{
                id: 'exec_1',
                name: 'write_file',
                status: 'success',
                input: JSON.stringify({ path: 'src/components/TestComponent.tsx', content: '...' }),
                duration: 450
            }]
        };
        setMessages(prev => [...prev, approvalMsg]);
    };

    const handleReject = () => {
        setApprovalRequest(prev => ({ ...prev, isOpen: false }));
        console.log('[AgentChatPanel] Tool Rejected');

        const rejectMsg: ChatMessage = {
            id: `msg_${Date.now()}_system`,
            role: 'assistant',
            content: 'Tool execution rejected by user.',
            timestamp: new Date(),
            toolExecutions: [{
                id: 'exec_1',
                name: 'write_file',
                status: 'error'
            }]
        };
        setMessages(prev => [...prev, rejectMsg]);
    };

    const handleClear = async () => {
        if (projectId) await clearConversation(projectId);
        setMessages([createWelcomeMessage()]);
    };

    return (
        <div className="flex flex-col h-full bg-surface-dark relative">
            {/* Header */}
            <div className="h-9 px-4 flex items-center justify-between border-b border-border-dark bg-surface-darker">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase font-pixel">
                        {t('agent.title')}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* DEV ONLY: Mock Trigger */}
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={triggerMockApproval}
                        title="[DEV] Trigger Mock Approval"
                        className="text-xs h-6 w-6 opacity-30 hover:opacity-100"
                    >
                        <Wand2 className="w-3.5 h-3.5" />
                    </Button>
                    <button
                        onClick={handleClear}
                        title={t('agent.clear')}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                    >
                        {t('agent.clear')}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <EnhancedChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isTyping={false}
                />
            </div>

            {/* Approval Overlay */}
            <ApprovalOverlay
                isOpen={approvalRequest.isOpen}
                onApprove={handleApprove}
                onReject={handleReject}
                toolName={approvalRequest.toolName}
                description={approvalRequest.description}
                code={approvalRequest.code}
                oldCode={approvalRequest.oldCode}
                newCode={approvalRequest.newCode}
                mode="inline"
                riskLevel="medium"
            />
        </div>
    );
}
