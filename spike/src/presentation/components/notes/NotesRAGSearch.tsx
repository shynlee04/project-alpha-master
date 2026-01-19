/**
 * @fileoverview Notes RAG Search Panel
 * @module presentation/components/notes/NotesRAGSearch
 * @governance NS-2026-01-07
 * @created 2026-01-07T06:45:00+07:00
 *
 * RAG-powered semantic search for notes using hybrid search (vector + fulltext).
 * Integrates with Orama WASM index and hybrid-retriever.
 *
 * Story: Integrate scattered AI features into Notes workspace
 * - RAG Pipeline: noteIndexer.rebuildIndex() + hybridSearch()
 * - User can search notes by meaning, not just keywords
 */

import { useState, useCallback } from 'react';
import { Search as SearchIcon, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { hybridSearch } from '@/lib/rag';
import { useTranslation } from 'react-i18next';

export interface NotesRAGSearchProps {
  /** Project ID for RAG index */
  projectId: string;
  /** Callback when user clicks a result to open note */
  onNoteSelect: (noteId: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  highlights?: string[];
}

/**
 * RAG Search Panel Component
 *
 * Features:
 * - Semantic search (vector + fulltext hybrid)
 * - Real-time results with scores
 * - Click to open note
 * - Shows highlighted snippets
 */
export function NotesRAGSearch({ projectId, onNoteSelect }: NotesRAGSearchProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      console.log('[NotesRAGSearch] Searching for:', searchQuery);

      const searchResults = await hybridSearch(projectId, searchQuery, [], {
        limit: 10,
        minScore: 0.3,
      });

      console.log('[NotesRAGSearch] Found results:', searchResults.length);

      const formattedResults: SearchResult[] = searchResults.map((r: any) => ({
        id: r.id,
        title: r.document.title || r.document.path || 'Untitled',
        content: r.document.content || '',
        score: r.score,
        highlights: r.highlights,
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error('[NotesRAGSearch] Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [projectId, searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Extract note ID from result ID (format: "note-{noteId}")
    const noteId = result.id.replace('note-', '');
    console.log('[NotesRAGSearch] Opening note:', noteId);
    onNoteSelect(noteId);
  };

  return (
    <div>
      {/* Search Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <h3 className="font-semibold text-sm">{t('notes.rag.title')}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {t('notes.rag.description')}
        </p>
        <div className="flex gap-2">
          <Input
            placeholder={t('notes.rag.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {!hasSearched ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{t('notes.rag.emptyTitle')}</p>
            <p className="text-xs mt-1">{t('notes.rag.emptyDescription')}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>{t('notes.rag.noResults')}</p>
            <p className="text-xs mt-1">{t('notes.rag.retryHint')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {result.title}
                      </span>
                      <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/30 px-1.5 rounded">
                        {Math.round(result.score * 100)}%
                      </span>
                    </div>
                    {result.highlights && result.highlights.length > 0 && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {result.highlights[0]}...
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
