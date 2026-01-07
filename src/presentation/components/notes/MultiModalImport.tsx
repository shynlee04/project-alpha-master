/**
 * @fileoverview Multi-Modal Import Component
 * @module presentation/components/notes/MultiModalImport
 * @governance NS-2026-01-07
 * @created 2026-01-07T07:00:00+07:00
 *
 * Import PDF and images into notes with AI processing.
 * Uses Gemini multimodal API for OCR and content extraction.
 *
 * Story: Integrate scattered AI features into Notes workspace
 * - PDF: Extract headings, tables, figures
 * - Images: OCR text extraction + visual descriptions
 */

import { useState, useCallback, useRef } from 'react';
import { FileText, Image as ImageIcon, Upload, Loader2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface MultiModalImportProps {
  /** Callback when content is extracted and ready to insert */
  onContentReady: (content: string, title: string) => void;
}

interface ProcessingResult {
  content: string;
  title: string;
  type: 'pdf' | 'image';
}

/**
 * Multi-Modal Import Dialog
 *
 * Features:
 * - PDF import with AI extraction
 * - Image import with OCR
 * - Base64 encoding for Gemini API
 * - Content preview before inserting
 */
export function MultiModalImport({ onContentReady }: MultiModalImportProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read file as base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Process PDF file
  const processPDF = async (file: File, base64: string): Promise<ProcessingResult> => {
    // Check if credential vault has Gemini API key
    const { credentialVault } = await import('@/lib/agent/providers/credential-vault');
    await credentialVault.initialize();
    const geminiApiKey = await credentialVault.getCredentials('gemini');

    if (!geminiApiKey) {
      throw new Error(t('notes.multimodal.error.apiKey'));
    }

    // Call Gemini API for PDF processing
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: 'application/pdf',
                  data: base64
                }
              },
              {
                text: 'Extract all text content from this PDF document. Preserve headings, lists, and structure. Format as markdown.'
              }
            ]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || t('notes.multimodal.error.failed'));
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      content,
      title: file.name.replace('.pdf', ''),
      type: 'pdf'
    };
  };

  // Process Image file
  const processImage = async (file: File, base64: string): Promise<ProcessingResult> => {
    // Check if credential vault has Gemini API key
    const { credentialVault } = await import('@/lib/agent/providers/credential-vault');
    await credentialVault.initialize();
    const geminiApiKey = await credentialVault.getCredentials('gemini');

    if (!geminiApiKey) {
      throw new Error(t('notes.multimodal.error.apiKey'));
    }

    // Call Gemini API for image processing
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64
                }
              },
              {
                text: 'Extract all text from this image using OCR. Also provide a brief description of what the image shows. Format as markdown with the description first, then the extracted text.'
              }
            ]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || t('notes.multimodal.error.failed'));
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      content,
      title: file.name.replace(/\.[^/.]+$/, ''),
      type: 'image'
    };
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const base64 = await readFileAsBase64(file);

      let processingResult: ProcessingResult;
      if (file.type === 'application/pdf') {
        processingResult = await processPDF(file, base64);
      } else if (file.type.startsWith('image/')) {
        processingResult = await processImage(file, base64);
      } else {
        throw new Error(t('notes.multimodal.error.unsupported'));
      }

      setResult(processingResult);
    } catch (err) {
      console.error('[MultiModalImport] Processing failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  // Handle insert content
  const handleInsert = useCallback(() => {
    if (result) {
      onContentReady(result.content, result.title);
      setOpen(false);
      setResult(null);
      toast.success(t('notes.multimodal.success', { type: result.type, title: result.title }));
    }
  }, [result, onContentReady, t]);

  // Open with specific type
  const openWithType = useCallback((importType: 'pdf' | 'image') => {
    setOpen(true);
    setResult(null);
    setError(null);

    // Set file input accept attribute based on type
    if (fileInputRef.current) {
      fileInputRef.current.accept = importType === 'pdf'
        ? '.pdf,application/pdf'
        : 'image/*';
    }

    // Trigger file input
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  }, []);

  return (
    <>
      {/* Trigger Buttons */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => openWithType('pdf')}
          title={t('notes.multimodal.pdfTooltip')}
          className="h-7 px-2"
        >
          <FileText className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => openWithType('image')}
          title={t('notes.multimodal.imageTooltip')}
          className="h-7 px-2"
        >
          <ImageIcon className="h-3 w-3" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf,image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Processing Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {t('notes.multimodal.title')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Processing State */}
            {isProcessing && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t('notes.multimodal.processing')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('notes.multimodal.processingSlow')}
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-800 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Result Preview */}
            {result && !isProcessing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  {result.type === 'pdf' ? (
                    <FileText className="h-4 w-4 text-purple-500" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-purple-500" />
                  )}
                  <span className="font-medium text-sm">{result.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {result.content.length} {t('notes.multimodal.chars')}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto p-3 bg-muted/50 rounded-md">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {result.content.slice(0, 500)}
                    {result.content.length > 500 && '...'}
                  </pre>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isProcessing}
              >
                <X className="w-4 h-4 mr-2" />
                {t('notes.multimodal.cancel')}
              </Button>
              {result && (
                <Button onClick={handleInsert}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t('notes.multimodal.insert')}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
