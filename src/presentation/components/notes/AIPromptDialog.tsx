import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { useAIPromptStore } from '@/lib/notes/ai-prompt-store';
import { generateNoteContent } from '@/lib/notes/note-ai-service';

import { toast } from 'sonner';

export function AIPromptDialog() {
    const { t } = useTranslation();
    const { isOpen, closePrompt, editor } = useAIPromptStore();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !editor) return;

        setIsLoading(true);

        try {
            const generatedContent = await generateNoteContent(prompt);

            // Insert the generated content
            // BlockNote usually takes blocks. If our service returns markdown, we might need to parse it.
            // For now, let's assume we insert a paragraph with the text.
            // A more advanced integration would parse MD to blocks using editor.tryParseMarkdownToBlocks(generatedContent)

            const blocks = await editor.tryParseMarkdownToBlocks(generatedContent);
            editor.insertBlocks(blocks, editor.getTextCursorPosition().block, 'after');

            setPrompt('');
            closePrompt();
            toast.success(t('notes.aiSuccess', 'Content generated successfully'));
        } catch (error) {
            console.error('AI Generation failed:', error);
            toast.error(t('notes.aiError', 'Failed to generate content'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            closePrompt();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {t('notes.aiMagic', 'AI Magic')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('notes.aiDescription', 'Ask the AI to write, summarize, or explain something for you.')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            placeholder={t('notes.aiPromptPlaceholder', 'What would you like to generate?')}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closePrompt} disabled={isLoading}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button type="submit" disabled={isLoading || !prompt.trim()}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('notes.generate', 'Generate')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
