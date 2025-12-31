/**
 * @fileoverview RAG Panel Container Component
 * @module components/rag/RAGPanelContainer
 * @governance EPIC-7-WIRE
 *
 * Container component that combines RAG Search and Chat panels
 * with tabbed interface. Integrates with KnowledgePage.
 */

import { useState, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import { RAGSearchPanel } from './RAGSearchPanel';
import { RAGChatPanel } from './RAGChatPanel';
import { CitationSidebar } from './CitationSidebar';
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store';
import type { SearchMode, Citation } from '@/lib/rag/types';

interface RAGPanelContainerProps {
  /** Current project ID */
  projectId: string;
}

type TabValue = 'search' | 'chat';

/**
 * RAGPanelContainer - Main container for RAG functionality
 *
 * Provides tabbed interface for:
 * - Search: Search across indexed sources
 * - Chat: conversational Q&A with citations
 */
export const RAGPanelContainer = memo(function RAGPanelContainer({
  projectId,
}: RAGPanelContainerProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabValue>('search');
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  // RAG Store selectors and actions
  const {
    searchQuery,
    searchResults,
    searchMode,
    chatMessages,
    indexStatus,
    documentCount,
    loading,
    error,
    setSearchQuery,
    performSearch,
    setSearchMode,
    sendMessage,
    clearChat,
    selectCitation,
  } = useRAGStore();

  const handleSearch = useCallback(
    async (query: string) => {
      await performSearch(query, searchMode, 10);
    },
    [performSearch, searchMode]
  );

  const handleModeChange = useCallback(
    (mode: SearchMode) => {
      setSearchMode(mode);
    },
    [setSearchMode]
  );

  const handleSendMessage = useCallback(
    async (message: string) => {
      await sendMessage(message, projectId);
    },
    [sendMessage, projectId]
  );

  const handleCitationClick = useCallback((citation: Citation) => {
    setActiveCitation(citation);
    selectCitation(citation.id.toString());
  }, [selectCitation]);

  const handleCloseCitation = useCallback(() => {
    setActiveCitation(null);
  }, []);

  // Get active citation from store for sidebar
  const storeActiveCitation = useRAGStore((s) => s.activeCitation);
  const displayCitation = activeCitation || storeActiveCitation;

  // Check if we have sources to search (for future EmptyState usage)
  // const _hasSources = documentCount > 0;

  return (
    <div className="flex h-full w-full">
      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Tabs */}
        <div className="p-2 border-b border-border bg-background">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <TabsList className="w-full grid grid-cols-2 border-2 border-border rounded-none bg-muted p-0">
              <TabsTrigger
                value="search"
                className="rounded-none border-r-2 border-transparent data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <Search size={14} className="mr-2" />
                {t('rag.tab.search', 'Search')}
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="rounded-none border-l-2 border-transparent data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <MessageSquare size={14} className="mr-2" />
                {t('rag.tab.chat', 'Chat')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="m-0 flex-1 h-[calc(100%-40px)]">
              <RAGSearchPanel
                query={searchQuery}
                results={searchResults}
                mode={searchMode}
                onQueryChange={setSearchQuery}
                onSearch={handleSearch}
                onModeChange={handleModeChange}
                loading={loading}
                error={error}
                documentCount={documentCount}
                indexStatus={indexStatus}
              />
            </TabsContent>

            <TabsContent value="chat" className="m-0 flex-1 h-[calc(100%-40px)]">
              <RAGChatPanel
                messages={chatMessages}
                activeCitation={displayCitation}
                onSendMessage={handleSendMessage}
                onClearChat={clearChat}
                onCitationClick={handleCitationClick}
                onCloseCitation={handleCloseCitation}
                loading={loading}
                error={error}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Citation Sidebar */}
      {displayCitation && (
        <CitationSidebar
          citation={displayCitation}
          onClose={handleCloseCitation}
        />
      )}
    </div>
  );
});

/**
 * Placeholder shown when no sources are indexed
 * (Currently unused, reserved for future implementation)
 */
// function _EmptyState() {
//   const { t } = useTranslation();
//
//   return (
//     <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
//       <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center mb-4">
//         <Sparkles size={32} className="text-primary/50" />
//       </div>
//       <p className="font-medium mb-2">{t('rag.empty.title', 'No Sources Indexed')}</p>
//       <p className="text-sm mb-4">
//         {t('rag.empty.hint', 'Add sources to your knowledge base to enable search and chat')}
//       </p>
//     </div>
//   );
// }

export default RAGPanelContainer;
