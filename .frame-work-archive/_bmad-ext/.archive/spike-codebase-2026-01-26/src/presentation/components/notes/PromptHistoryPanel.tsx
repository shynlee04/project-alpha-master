/**
 * @fileoverview Prompt History Panel - View and manage prompt history
 * @module components/notes/PromptHistoryPanel
 * @story 43-06: Prompt History/Analytics
 * @created 2026-01-12
 * 
 * Displays prompt execution history with filtering, search, and analytics.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/presentation/components/ui/scroll-area';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import {
    Search,
    Star,
    StarOff,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Minus,
    History,
    Filter,
    ChevronDown,
    ChevronUp,
    Copy,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    usePromptHistoryStore,
    type PromptHistoryEntry,
    type PromptStatus,
} from '@/lib/notes/prompt-history-store';
import { toast } from 'sonner';

// ============================================================================
// Status Icons
// ============================================================================

const STATUS_ICONS: Record<PromptStatus, React.ComponentType<{ className?: string }>> = {
    success: CheckCircle2,
    error: XCircle,
    cancelled: AlertCircle,
};

const STATUS_COLORS: Record<PromptStatus, string> = {
    success: 'text-success',
    error: 'text-destructive',
    cancelled: 'text-warning',
};

// ============================================================================
// Props
// ============================================================================

interface PromptHistoryPanelProps {
    className?: string;
    showAnalytics?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function PromptHistoryPanel({ className, showAnalytics = true }: PromptHistoryPanelProps) {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.startsWith('vi');
    
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<PromptStatus | 'all'>('all');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    
    // Store
    const history = usePromptHistoryStore((s) => s.history);
    const toggleFavorite = usePromptHistoryStore((s) => s.toggleFavorite);
    const deleteEntry = usePromptHistoryStore((s) => s.deleteEntry);
    const clearHistory = usePromptHistoryStore((s) => s.clearHistory);
    const getAnalytics = usePromptHistoryStore((s) => s.getAnalytics);
    
    // Analytics
    const analytics = useMemo(() => getAnalytics(), [history, getAnalytics]);
    
    // Filtered history
    const filteredHistory = useMemo(() => {
        let result = [...history];
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (e) =>
                    e.commandName.toLowerCase().includes(query) ||
                    e.promptPreview.toLowerCase().includes(query)
            );
        }
        
        // Filter by status
        if (filterStatus !== 'all') {
            result = result.filter((e) => e.status === filterStatus);
        }
        
        // Filter favorites only
        if (showFavoritesOnly) {
            result = result.filter((e) => e.isFavorite);
        }
        
        return result;
    }, [history, searchQuery, filterStatus, showFavoritesOnly]);
    
    // Format timestamp
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return isVi ? 'Vừa xong' : 'Just now';
        if (diffMins < 60) return isVi ? `${diffMins} phút trước` : `${diffMins}m ago`;
        if (diffHours < 24) return isVi ? `${diffHours} giờ trước` : `${diffHours}h ago`;
        if (diffDays < 7) return isVi ? `${diffDays} ngày trước` : `${diffDays}d ago`;
        return date.toLocaleDateString();
    };
    
    // Format execution time
    const formatExecTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };
    
    // Copy prompt to clipboard
    const handleCopy = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        toast.success(isVi ? 'Đã sao chép prompt' : 'Prompt copied to clipboard');
    };
    
    // Render analytics summary
    const renderAnalyticsSummary = () => (
        <div className="grid grid-cols-4 gap-2 p-3 bg-[var(--muted)] border-b-2 border-[var(--border)]">
            <div className="text-center">
                <div className="text-lg font-bold text-[var(--foreground)]">
                    {analytics.totalPrompts}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                    {isVi ? 'Tổng số' : 'Total'}
                </div>
            </div>
            <div className="text-center">
                <div className="text-lg font-bold text-success">
                    {analytics.successRate}%
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                    {isVi ? 'Thành công' : 'Success'}
                </div>
            </div>
            <div className="text-center">
                <div className="text-lg font-bold text-[var(--foreground)]">
                    {formatExecTime(analytics.averageExecutionTime)}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                    {isVi ? 'Trung bình' : 'Avg Time'}
                </div>
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center">
                    {analytics.recentTrend === 'up' && <TrendingUp className="h-5 w-5 text-success" />}
                    {analytics.recentTrend === 'down' && <TrendingDown className="h-5 w-5 text-destructive" />}
                    {analytics.recentTrend === 'stable' && <Minus className="h-5 w-5 text-[var(--muted-foreground)]" />}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                    {isVi ? 'Xu hướng' : 'Trend'}
                </div>
            </div>
        </div>
    );
    
    // Render history entry
    const renderEntry = (entry: PromptHistoryEntry) => {
        const StatusIcon = STATUS_ICONS[entry.status];
        const isExpanded = expandedId === entry.id;
        
        return (
            <div
                key={entry.id}
                className={cn(
                    'border-b border-[var(--border)] transition-colors',
                    isExpanded && 'bg-[var(--muted)]'
                )}
            >
                {/* Header */}
                <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full text-left p-3 hover:bg-[var(--muted)] transition-colors"
                >
                    <div className="flex items-center gap-2">
                        {/* Status */}
                        <StatusIcon className={cn('h-4 w-4 flex-shrink-0', STATUS_COLORS[entry.status])} />
                        
                        {/* Command name */}
                        <span className="font-medium text-sm truncate flex-1">
                            {entry.commandName}
                        </span>
                        
                        {/* Favorite */}
                        {entry.isFavorite && (
                            <Star className="h-3 w-3 text-warning fill-warning flex-shrink-0" />
                        )}
                        
                        {/* Time */}
                        <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
                            {formatTime(entry.timestamp)}
                        </span>
                        
                        {/* Expand */}
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
                        )}
                    </div>
                    
                    {/* Preview */}
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-1">
                        {entry.promptPreview}
                    </p>
                </button>
                
                {/* Expanded Content */}
                {isExpanded && (
                    <div className="px-3 pb-3 space-y-3">
                        {/* Full prompt */}
                        <div className="bg-[var(--background)] border border-[var(--border)] rounded-none p-2">
                            <pre className="text-xs whitespace-pre-wrap font-mono text-[var(--muted-foreground)]">
                                {entry.prompt}
                            </pre>
                        </div>
                        
                        {/* Metrics */}
                        <div className="flex flex-wrap gap-3 text-xs text-[var(--muted-foreground)]">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatExecTime(entry.executionTimeMs)}
                            </span>
                            {entry.contextLength > 0 && (
                                <span>Context: {entry.contextLength} chars</span>
                            )}
                            {entry.outputLength && (
                                <span>Output: {entry.outputLength} chars</span>
                            )}
                            {entry.tokenCount && (
                                <span>{entry.tokenCount} tokens</span>
                            )}
                            {entry.category && (
                                <span className="capitalize">{entry.category}</span>
                            )}
                        </div>
                        
                        {/* Error message */}
                        {entry.errorMessage && (
                            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-none border border-destructive/20">
                                {entry.errorMessage}
                            </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-xs rounded-none"
                                onClick={() => handleCopy(entry.prompt)}
                            >
                                <Copy className="h-3 w-3 mr-1" />
                                {isVi ? 'Sao chép' : 'Copy'}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-xs rounded-none"
                                onClick={() => toggleFavorite(entry.id)}
                            >
                                {entry.isFavorite ? (
                                    <>
                                        <StarOff className="h-3 w-3 mr-1" />
                                        {isVi ? 'Bỏ yêu thích' : 'Unfavorite'}
                                    </>
                                ) : (
                                    <>
                                        <Star className="h-3 w-3 mr-1" />
                                        {isVi ? 'Yêu thích' : 'Favorite'}
                                    </>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-destructive rounded-none"
                                onClick={() => deleteEntry(entry.id)}
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                {isVi ? 'Xóa' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header */}
            <div className="p-3 border-b-2 border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                    <History className="h-5 w-5 text-[var(--primary)]" />
                    <h3 className="font-bold">
                        {isVi ? 'Lịch sử Prompt' : 'Prompt History'}
                    </h3>
                    <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-none">
                        {history.length}
                    </span>
                </div>
                
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input
                        placeholder={isVi ? 'Tìm kiếm...' : 'Search...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 text-sm rounded-none"
                    />
                </div>
                
                {/* Filter toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mt-2 hover:text-[var(--foreground)]"
                >
                    <Filter className="h-3 w-3" />
                    {isVi ? 'Bộ lọc' : 'Filters'}
                    {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                
                {/* Filters */}
                {showFilters && (
                    <div className="mt-2 space-y-2">
                        {/* Status filter */}
                        <div className="flex flex-wrap gap-1">
                            {(['all', 'success', 'error', 'cancelled'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        'px-2 py-1 text-xs rounded-none border',
                                        filterStatus === status
                                            ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                                            : 'bg-[var(--muted)] border-[var(--border)] hover:bg-[var(--accent)]'
                                    )}
                                >
                                    {status === 'all' ? (isVi ? 'Tất cả' : 'All') : status}
                                </button>
                            ))}
                        </div>
                        
                        {/* Favorites toggle */}
                        <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className={cn(
                                'flex items-center gap-1 px-2 py-1 text-xs rounded-none border',
                                showFavoritesOnly
                                    ? 'bg-warning/20 border-warning text-warning'
                                    : 'bg-[var(--muted)] border-[var(--border)]'
                            )}
                        >
                            <Star className={cn('h-3 w-3', showFavoritesOnly && 'fill-warning')} />
                            {isVi ? 'Chỉ yêu thích' : 'Favorites only'}
                        </button>
                    </div>
                )}
            </div>
            
            {/* Analytics Summary */}
            {showAnalytics && history.length > 0 && renderAnalyticsSummary()}
            
            {/* History List */}
            <ScrollArea className="flex-1">
                {filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-[var(--muted-foreground)]">
                        <Sparkles className="h-8 w-8 opacity-30 mb-2" />
                        <p className="text-sm">
                            {history.length === 0
                                ? (isVi ? 'Chưa có lịch sử' : 'No history yet')
                                : (isVi ? 'Không tìm thấy' : 'No results')}
                        </p>
                    </div>
                ) : (
                    filteredHistory.map(renderEntry)
                )}
            </ScrollArea>
            
            {/* Footer */}
            {history.length > 0 && (
                <div className="p-2 border-t border-[var(--border)] flex justify-between items-center">
                    <span className="text-xs text-[var(--muted-foreground)]">
                        {filteredHistory.length} / {history.length}
                    </span>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-destructive rounded-none"
                        onClick={() => {
                            if (confirm(isVi ? 'Xóa tất cả lịch sử?' : 'Clear all history?')) {
                                clearHistory();
                                toast.success(isVi ? 'Đã xóa lịch sử' : 'History cleared');
                            }
                        }}
                    >
                        <Trash2 className="h-3 w-3 mr-1" />
                        {isVi ? 'Xóa tất cả' : 'Clear All'}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default PromptHistoryPanel;
