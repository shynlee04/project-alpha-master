/**
 * @fileoverview AI Vision Block for Image Understanding
 * @module presentation/components/notes/blocks/AIVisionBlock
 * @story 44-02: Image understanding (vision) in blocks
 * @created 2026-01-13
 *
 * Custom BlockNote block for AI-powered image analysis using Gemini Vision.
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Eye, Loader2, FileImage, Upload, Sparkles, Trash2, X, ChevronDown } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import "./AIVisionBlock.css";

import { analyzeImage, analyzeMultipleImages, fileToImageInput, type ImageInput, type VisionAnalysisOptions } from "@/lib/notes/ai-vision-service";

// ============================================================================
// Types
// ============================================================================

type AnalysisMode = 'describe' | 'extract-text' | 'analyze' | 'question' | 'multi-image';
type AnalysisStatus = "idle" | "uploaded" | "analyzing" | "done" | "error";

interface StoredImage {
  base64: string;
  mimeType: string;
  name: string;
}

// ============================================================================
// Analysis Mode Options
// ============================================================================

const ANALYSIS_MODES = [
  { id: 'describe', label: 'Describe', icon: Eye, description: 'Get a detailed description' },
  { id: 'extract-text', label: 'Extract Text', icon: FileImage, description: 'OCR text extraction' },
  { id: 'analyze', label: 'Analyze', icon: Sparkles, description: 'Comprehensive analysis' },
  { id: 'question', label: 'Ask Question', icon: Eye, description: 'Ask about the image' },
] as const;

// ============================================================================
// AI Vision Block
// ============================================================================

export const AIVisionBlock = createReactBlockSpec(
  {
    type: "aiVision",
    propSchema: {
      analysisMode: { default: "describe" },
      images: { default: JSON.stringify([]) },
      analysisResult: { default: "" },
      customQuestion: { default: "" },
      status: { default: "idle" },
      errorMessage: { default: "" },
      language: { default: "en" },
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => {
      // Safe JSON parse with fallback for corrupted data
      const parseImages = (jsonStr: string): StoredImage[] => {
        try {
          return JSON.parse(jsonStr || "[]") as StoredImage[];
        } catch {
          console.warn('[AIVisionBlock] Corrupted images data, using empty array');
          return [];
        }
      };
      const images = parseImages(props.block.props.images || "[]");
      const {
        analysisMode,
        analysisResult,
        customQuestion,
        status,
        errorMessage,
        language,
      } = props.block.props;

      const [mode, setMode] = useState<AnalysisMode>(analysisMode as AnalysisMode || 'describe');
      const [question, setQuestion] = useState(customQuestion || "");
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      const [showModeSelect, setShowModeSelect] = useState(false);

      const updateBlock = useCallback((updates: Record<string, unknown>) => {
        props.editor.updateBlock(props.block, {
          type: "aiVision",
          props: updates,
        });
      }, [props.editor, props.block]);

      const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (files.length > 4) {
          toast.error("Maximum 4 images allowed");
          return;
        }

        try {
          const newImages: StoredImage[] = [];
          for (const file of files) {
            const imageInput = await fileToImageInput(file);
            newImages.push({
              base64: imageInput.base64,
              mimeType: imageInput.mimeType,
              name: file.name,
            });
          }

          updateBlock({
            images: JSON.stringify([...images, ...newImages]),
            status: "uploaded",
            analysisResult: "",
            errorMessage: "",
          });

          toast.success(`${newImages.length} image(s) uploaded`);
        } catch (error) {
          console.error('[AIVision] Upload error:', error);
          toast.error("Failed to read image file");
        }
      }, [images, updateBlock]);

      const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
        const items = Array.from(e.clipboardData.items);
        const imageItems = items.filter(item => item.type.startsWith('image/'));

        if (imageItems.length === 0) return;

        const currentCount = images.length;
        if (currentCount + imageItems.length > 4) {
          toast.error(`Maximum 4 images allowed. Already uploaded ${currentCount} images.`);
          return;
        }

        for (const item of imageItems) {
          const file = item.getAsFile();
          if (!file) continue;

          try {
            const imageInput = await fileToImageInput(file);
            const newImages = [...images, {
              base64: imageInput.base64,
              mimeType: imageInput.mimeType,
              name: 'Pasted image',
            }];
            updateBlock({
              images: JSON.stringify(newImages),
              status: "uploaded",
              analysisResult: "",
              errorMessage: "",
            });
            break;
          } catch (error) {
            console.error('[AIVision] Paste error:', error);
          }
        }

        toast.success("Image pasted");
      }, [images, updateBlock]);

      const removeImage = useCallback((index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        updateBlock({
          images: JSON.stringify(newImages),
          status: newImages.length === 0 ? "idle" : "uploaded",
        });
      }, [images, updateBlock]);

      const handleAnalyze = useCallback(async () => {
        if (!images || images.length === 0) {
          toast.error("Please upload an image first");
          return;
        }

        setIsAnalyzing(true);
        updateBlock({
          status: "analyzing",
          analysisMode: mode,
          customQuestion: question,
        });

        try {
          let result;
          const imageInputs: ImageInput[] = images.map(img => ({
            base64: img.base64,
            mimeType: img.mimeType as ImageInput['mimeType'],
          }));

          if (mode === 'question' || mode === 'multi-image') {
            const q = mode === 'multi-image'
              ? "Analyze these images and provide a comprehensive comparison and analysis."
              : question;
            if (!q || q.trim().length === 0) {
              toast.error("Please enter a question");
              setIsAnalyzing(false);
              return;
            }
            result = await analyzeMultipleImages(imageInputs, q, { language: language as "en" | "vi" });
          } else {
            result = await analyzeImage(imageInputs[0], {
              analysisType: mode as VisionAnalysisOptions['analysisType'],
              question: question || undefined,
              language: language as "en" | "vi",
            });
          }

          if (result.success && result.content) {
            updateBlock({
              status: "done",
              analysisResult: result.content,
              errorMessage: "",
            });
            toast.success("Analysis complete!");
          } else {
            throw new Error(result.error || "Analysis failed");
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          updateBlock({
            status: "error",
            errorMessage: message,
          });
          toast.error(`Analysis failed: ${message}`);
        } finally {
          setIsAnalyzing(false);
        }
      }, [images, mode, question, language, updateBlock]);

      const handleClear = useCallback(() => {
        updateBlock({
          images: "[]",
          analysisResult: "",
          status: "idle",
          errorMessage: "",
        });
      }, [updateBlock]);

      const currentStatus = isAnalyzing ? "analyzing" : (status as AnalysisStatus);

      return (
        <div
          className={cn(
            "ai-vision-block",
            `ai-vision-block--${currentStatus}`
          )}
          contentEditable={false}
          onPaste={handlePaste}
        >
          <div className="ai-vision-block__header">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-primary" />
              <span className="ai-vision-block__title">AI Vision Analysis</span>
            </div>
            <button
              type="button"
              onClick={() => props.editor.removeBlocks([props.block])}
              className="ai-vision-block__close"
              title="Remove block"
            >
              <X size={14} />
            </button>
          </div>

          {(currentStatus === "idle" || currentStatus === "uploaded") && (
            <div className="ai-vision-block__content">
              <div className="ai-vision-block__upload-area">
                {images && images.length > 0 ? (
                  <div className="ai-vision-block__images-grid">
                    {images.map((img, i) => (
                      <div key={i} className="ai-vision-block__image-item">
                        <img
                          src={`data:${img.mimeType};base64,${img.base64}`}
                          alt={`Image ${i + 1}`}
                          className="ai-vision-block__thumbnail"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="ai-vision-block__image-remove"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {images.length < 4 && (
                      <label className="ai-vision-block__add-more">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Upload size={16} />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="ai-vision-block__upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="ai-vision-block__upload-prompt">
                      <Upload size={24} className="mb-2" />
                      <span className="ai-vision-block__upload-text">
                        Click to upload or paste images
                      </span>
                      <span className="ai-vision-block__upload-hint">
                        PNG, JPEG, WebP • Max 4 images
                      </span>
                    </div>
                  </label>
                )}
              </div>

              {images && images.length > 0 && (
                <div className="ai-vision-block__controls">
                  <div className="ai-vision-block__mode-select">
                    <button
                      type="button"
                      onClick={() => setShowModeSelect(!showModeSelect)}
                      className="ai-vision-block__mode-button"
                    >
                      <span className="text-sm font-medium">
                        {ANALYSIS_MODES.find(m => m.id === mode)?.label || 'Describe'}
                      </span>
                      <ChevronDown size={14} />
                    </button>

                    {showModeSelect && (
                      <div className="ai-vision-block__mode-dropdown">
                        {ANALYSIS_MODES.map(m => {
                          const Icon = m.icon;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setMode(m.id as AnalysisMode);
                                setShowModeSelect(false);
                              }}
                              className={cn(
                                "ai-vision-block__mode-option",
                                mode === m.id && "ai-vision-block__mode-option--active"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Icon size={14} />
                                <span className="text-sm">{m.label}</span>
                              </div>
                              <span className="ai-vision-block__mode-desc">{m.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {mode === 'question' && (
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask a question about the image..."
                      className="ai-vision-block__question-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAnalyze();
                        }
                      }}
                      autoFocus
                    />
                  )}

                  <div className="ai-vision-block__language-toggle">
                    <button
                      type="button"
                      onClick={() => updateBlock({ language: language === 'en' ? 'vi' : 'en' })}
                      className={cn(
                        "ai-vision-block__lang-btn",
                        language === 'en' ? 'ai-vision-block__lang-btn--active' : ''
                      )}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBlock({ language: language === 'vi' ? 'en' : 'vi' })}
                      className={cn(
                        "ai-vision-block__lang-btn",
                        language === 'vi' ? 'ai-vision-block__lang-btn--active' : ''
                      )}
                    >
                      VI
                    </button>
                  </div>
                </div>
              )}

              {images && images.length > 0 && (
                <div className="ai-vision-block__actions">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="ai-vision-block__analyze-btn"
                  >
                    <Sparkles size={16} />
                    Analyze
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="ai-vision-block__clear-btn"
                  >
                    <Trash2 size={14} />
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStatus === "analyzing" && (
            <div className="ai-vision-block__loading">
              <div className="ai-vision-block__loading-content">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="ai-vision-block__loading-text">Analyzing image...</span>
              </div>
            </div>
          )}

          {currentStatus === "error" && (
            <div className="ai-vision-block__error">
              <div className="ai-vision-block__error-content">
                <span className="ai-vision-block__error-text">{errorMessage || "Analysis failed"}</span>
                <div className="ai-vision-block__error-actions">
                  <button
                    type="button"
                    onClick={() => updateBlock({ status: "uploaded" })}
                    className="ai-vision-block__retry-btn"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStatus === "done" && analysisResult && (
            <div className="ai-vision-block__result">
              {images && images.length > 0 && (
                <div className="ai-vision-block__result-images">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={`data:${img.mimeType};base64,${img.base64}`}
                      alt={`Image ${i + 1}`}
                      className="ai-vision-block__result-thumbnail"
                    />
                  ))}
                </div>
              )}
              <div className="ai-vision-block__result-content">
                <div className="ai-vision-block__analysis-text">
                  {analysisResult.split('\n').map((line, i) => {
                    if (line.startsWith('##')) {
                      return <h3 key={i} className="font-semibold mt-3 mb-1">{line.replace(/^#+\s*/, '')}</h3>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="ml-4">{line.slice(2)}</li>;
                    }
                    if (line.startsWith('###')) {
                      return <h3 key={i} className="text-sm font-semibold mt-2 mb-1">{line.replace(/^#+\s*/, '')}</h3>;
                    }
                    if (line.trim()) {
                      return <p key={i} className="mb-1">{line}</p>;
                    }
                    return <br key={i} />;
                  })}
                </div>
              </div>
              <div className="ai-vision-block__result-actions">
                <button
                  type="button"
                  onClick={() => updateBlock({ status: "uploaded", analysisResult: "" })}
                  className="ai-vision-block__retry-btn"
                >
                  Analyze Again
                </button>
              </div>
            </div>
          )}
        </div>
      );
    },
  }
);