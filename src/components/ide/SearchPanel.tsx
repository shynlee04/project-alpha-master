import { useState } from 'react'
import { SidebarHeader } from './IconSidebar'
import { useTranslation } from 'react-i18next'
import { Search as SearchIcon, X, FileText, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * SearchPanel - Global search sidebar panel
 * 
 * Shows when 'search' is active in the activity bar.
 * Provides global search across workspace files.
 */

interface SearchResult {
    id: string
    filename: string
    path: string
    matchCount: number
    matches: {
        line: number
        preview: string
        column: number
    }[]
}

export function SearchPanel({
    onSearch,
    results = [],
    recentSearches = [],
    onSelectResult
}: {
    onSearch?: (query: string) => void
    results?: SearchResult[]
    recentSearches?: string[]
    onSelectResult?: (result: SearchResult, matchIndex?: number) => void
}) {
    const { t } = useTranslation()
    const [query, setQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            onSearch?.(query.trim())
        }
    }

    return (
        <div className="flex flex-col h-full">
            <SidebarHeader title={t('sidebar.search', 'Search')} />

            {/* Search Input */}
            <form onSubmit={handleSearch} className="p-2 border-b border-border">
                <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('sidebar.searchPlaceholder', 'Search files...')}
                        className="w-full h-8 pl-8 pr-8 bg-background border border-border rounded-none text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </form>

            {/* Results or Empty State */}
            <div className="flex-1 overflow-auto">
                {results.length > 0 ? (
                    <div className="p-1">
                        {results.map((result) => (
                            <SearchResultItem
                                key={result.id}
                                result={result}
                                onSelect={onSelectResult}
                            />
                        ))}
                    </div>
                ) : query ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <SearchIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">
                            {t('sidebar.noResults', 'No results found')}
                        </p>
                    </div>
                ) : recentSearches.length > 0 ? (
                    <div className="p-2">
                        <p className="text-xs text-muted-foreground font-pixel uppercase tracking-wider mb-2 px-1">
                            {t('sidebar.recentSearches', 'Recent')}
                        </p>
                        {recentSearches.map((search, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setQuery(search)
                                    onSearch?.(search)
                                }}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-none"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                {search}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <SearchIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">
                            {t('sidebar.searchPrompt', 'Enter a search term')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function SearchResultItem({
    result,
    onSelect
}: {
    result: SearchResult
    onSelect?: (result: SearchResult, matchIndex?: number) => void
}) {
    const [isExpanded, setExpanded] = useState(true)

    return (
        <div className="mb-1">
            <button
                onClick={() => setExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-secondary rounded-none"
            >
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">
                    {result.filename}
                </span>
                <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-secondary rounded-none">
                    {result.matchCount}
                </span>
            </button>

            {isExpanded && result.matches.map((match, i) => (
                <button
                    key={i}
                    onClick={() => onSelect?.(result, i)}
                    className="w-full flex items-start gap-2 pl-8 pr-2 py-1 text-left hover:bg-secondary/50 rounded-none"
                >
                    <span className="text-xs text-muted-foreground shrink-0 font-mono w-8">
                        {match.line}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        {match.preview}
                    </span>
                </button>
            ))}
        </div>
    )
}

export type { SearchResult }
