/**
 * @fileoverview Prompt Share Dialog - Share/Export UI
 * @module components/notes/PromptShareDialog
 * @story 43-07: Prompt Sharing/Export
 * @created 2026-01-12
 * 
 * Dialog for sharing and exporting prompt commands.
 * Supports multiple formats: JSON, Markdown, Text, Link.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { ScrollArea } from '@/presentation/components/ui/scroll-area';
import {
    Copy,
    Download,
    Link,
    FileJson,
    FileText,
    Check,
    Share2,
    Clipboard,
    AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    exportCommand,
    copyCommandToClipboard,
    downloadCommandAsFile,
    type ShareFormat,
} from '@/lib/notes/prompt-sharing-service';
import type { CustomSlashCommand } from '@/lib/notes/slash-command-store';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

interface PromptShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    command: CustomSlashCommand | null;
}

interface FormatOption {
    id: ShareFormat;
    label: string;
    labelVi: string;
    description: string;
    descriptionVi: string;
    icon: React.ComponentType<{ className?: string }>;
}

// ============================================================================
// Format Options
// ============================================================================

const FORMAT_OPTIONS: FormatOption[] = [
    {
        id: 'json',
        label: 'JSON',
        labelVi: 'JSON',
        description: 'Standard format for importing',
        descriptionVi: 'Định dạng chuẩn để import',
        icon: FileJson,
    },
    {
        id: 'markdown',
        label: 'Markdown',
        labelVi: 'Markdown',
        description: 'Readable documentation format',
        descriptionVi: 'Định dạng tài liệu dễ đọc',
        icon: FileText,
    },
    {
        id: 'link',
        label: 'Shareable Link',
        labelVi: 'Link chia sẻ',
        description: 'Compact encoded link',
        descriptionVi: 'Link mã hóa nhỏ gọn',
        icon: Link,
    },
    {
        id: 'text',
        label: 'Plain Text',
        labelVi: 'Văn bản thuần',
        description: 'Simple text format',
        descriptionVi: 'Định dạng văn bản đơn giản',
        icon: FileText,
    },
];

// ============================================================================
// Component
// ============================================================================

export function PromptShareDialog({ open, onOpenChange, command }: PromptShareDialogProps) {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.startsWith('vi');
    
    const [selectedFormat, setSelectedFormat] = useState<ShareFormat>('json');
    const [copied, setCopied] = useState(false);
    
    // Generate content based on format
    const content = useMemo(() => {
        if (!command) return '';
        return exportCommand(command, selectedFormat);
    }, [command, selectedFormat]);
    
    // Handle copy
    const handleCopy = async () => {
        if (!command) return;
        
        const success = await copyCommandToClipboard(command, selectedFormat);
        if (success) {
            setCopied(true);
            toast.success(isVi ? 'Đã sao chép vào clipboard' : 'Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.error(isVi ? 'Không thể sao chép' : 'Failed to copy');
        }
    };
    
    // Handle download
    const handleDownload = () => {
        if (!command) return;
        downloadCommandAsFile(command, selectedFormat);
        toast.success(isVi ? 'Đã tải xuống' : 'Downloaded');
    };
    
    if (!command) return null;
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-none border-2 border-[var(--border)]">
                {/* Header */}
                <DialogHeader className="p-4 border-b-2 border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--primary)]/10 rounded-none border-2 border-[var(--primary)]">
                            <Share2 className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div>
                            <DialogTitle>
                                {isVi ? 'Chia sẻ Prompt' : 'Share Prompt'}
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                {isVi ? command.titleVi || command.title : command.title}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                
                {/* Format Selection */}
                <div className="p-4 border-b border-[var(--border)]">
                    <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
                        {isVi ? 'Chọn định dạng' : 'Select Format'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {FORMAT_OPTIONS.map((format) => {
                            const Icon = format.icon;
                            const isSelected = selectedFormat === format.id;
                            
                            return (
                                <button
                                    key={format.id}
                                    onClick={() => setSelectedFormat(format.id)}
                                    className={cn(
                                        'flex flex-col items-center gap-1 p-3 rounded-none border-2 transition-all',
                                        isSelected
                                            ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                                            : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                                    )}
                                >
                                    <Icon className={cn(
                                        'h-5 w-5',
                                        isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                                    )} />
                                    <span className={cn(
                                        'text-xs font-medium',
                                        isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
                                    )}>
                                        {isVi ? format.labelVi : format.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                        {isVi
                            ? FORMAT_OPTIONS.find(f => f.id === selectedFormat)?.descriptionVi
                            : FORMAT_OPTIONS.find(f => f.id === selectedFormat)?.description}
                    </p>
                </div>
                
                {/* Content Preview */}
                <div className="flex-1 overflow-hidden p-4">
                    <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
                        {isVi ? 'Xem trước' : 'Preview'}
                    </label>
                    <ScrollArea className="h-[300px] border-2 border-[var(--border)] rounded-none bg-[var(--muted)]">
                        <pre className="p-3 text-xs font-mono whitespace-pre-wrap break-all text-[var(--foreground)]">
                            {content}
                        </pre>
                    </ScrollArea>
                </div>
                
                {/* Actions */}
                <div className="p-4 border-t-2 border-[var(--border)] flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        className="rounded-none"
                        onClick={() => onOpenChange(false)}
                    >
                        {isVi ? 'Đóng' : 'Close'}
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-none"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {isVi ? 'Tải xuống' : 'Download'}
                    </Button>
                    <Button
                        variant="primary"
                        className="rounded-none"
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                {isVi ? 'Đã sao chép!' : 'Copied!'}
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                {isVi ? 'Sao chép' : 'Copy'}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// Import Dialog (for importing from clipboard/file)
// ============================================================================

interface PromptImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (commands: CustomSlashCommand[]) => void;
}

export function PromptImportDialog({ open, onOpenChange, onImport }: PromptImportDialogProps) {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.startsWith('vi');
    
    const [inputText, setInputText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);
    
    // Handle import
    const handleImport = async () => {
        if (!inputText.trim()) {
            setError(isVi ? 'Vui lòng dán nội dung cần import' : 'Please paste content to import');
            return;
        }
        
        setImporting(true);
        setError(null);
        
        try {
            const { parseShareableLink } = await import('@/lib/notes/prompt-sharing-service');
            const result = parseShareableLink(inputText.trim());
            
            if (result.success && result.commands.length > 0) {
                onImport(result.commands);
                toast.success(
                    isVi 
                        ? `Đã import ${result.commands.length} prompt(s)` 
                        : `Imported ${result.commands.length} prompt(s)`
                );
                setInputText('');
                onOpenChange(false);
            } else {
                setError(result.error || (isVi ? 'Không thể import' : 'Failed to import'));
            }
        } catch (err) {
            setError(isVi ? 'Lỗi khi import' : 'Import error');
        } finally {
            setImporting(false);
        }
    };
    
    // Handle paste from clipboard
    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInputText(text);
            setError(null);
        } catch {
            setError(isVi ? 'Không thể đọc clipboard' : 'Cannot read clipboard');
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[70vh] overflow-hidden flex flex-col p-0 rounded-none border-2 border-[var(--border)]">
                {/* Header */}
                <DialogHeader className="p-4 border-b-2 border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--primary)]/10 rounded-none border-2 border-[var(--primary)]">
                            <Clipboard className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div>
                            <DialogTitle>
                                {isVi ? 'Import Prompt' : 'Import Prompt'}
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                {isVi 
                                    ? 'Dán JSON hoặc link chia sẻ để import' 
                                    : 'Paste JSON or shareable link to import'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                
                {/* Input Area */}
                <div className="flex-1 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                            {isVi ? 'Nội dung import' : 'Import Content'}
                        </label>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs rounded-none h-7"
                            onClick={handlePasteFromClipboard}
                        >
                            <Clipboard className="h-3 w-3 mr-1" />
                            {isVi ? 'Dán từ clipboard' : 'Paste from clipboard'}
                        </Button>
                    </div>
                    <textarea
                        value={inputText}
                        onChange={(e) => {
                            setInputText(e.target.value);
                            setError(null);
                        }}
                        placeholder={isVi 
                            ? 'Dán JSON hoặc viagen://prompt/... link tại đây' 
                            : 'Paste JSON or viagen://prompt/... link here'}
                        className={cn(
                            'w-full h-[200px] p-3 text-sm font-mono',
                            'bg-[var(--muted)] border-2 rounded-none resize-none',
                            'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
                            error ? 'border-red-500' : 'border-[var(--border)]'
                        )}
                    />
                    
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </div>
                
                {/* Actions */}
                <div className="p-4 border-t-2 border-[var(--border)] flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        className="rounded-none"
                        onClick={() => onOpenChange(false)}
                    >
                        {isVi ? 'Hủy' : 'Cancel'}
                    </Button>
                    <Button
                        variant="primary"
                        className="rounded-none"
                        onClick={handleImport}
                        disabled={importing || !inputText.trim()}
                    >
                        {importing ? (
                            <>
                                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                {isVi ? 'Đang import...' : 'Importing...'}
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                {isVi ? 'Import' : 'Import'}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default PromptShareDialog;
