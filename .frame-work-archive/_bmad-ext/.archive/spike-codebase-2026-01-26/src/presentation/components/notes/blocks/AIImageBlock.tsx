/**
 * @fileoverview AI Image Generation Block for BlockNote
 * @module presentation/components/notes/blocks/AIImageBlock
 * @story 44-01: Image generation block type
 * @created 2026-01-13
 *
 * Custom BlockNote block for AI-powered image generation using Gemini Imagen.
 * Features:
 * - Prompt-based image generation
 * - Multiple image sizes (1:1, 16:9, 9:16)
 * - Generation status states (idle, generating, done, error)
 * - Fullscreen preview
 * - 8-bit design system compliance
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { ImagePlus, Loader2, RefreshCw, Download, Maximize2, X, AlertCircle, Wand2 } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import "./AIImageBlock.css";

// Import image generation service
import { generateAIImage } from "@/lib/notes/ai-image-service";

// ============================================================================
// Types
// ============================================================================

type GenerationStatus = "idle" | "generating" | "done" | "error";

// ============================================================================
// Image Size Options
// ============================================================================

const IMAGE_SIZES = [
  { id: "square", label: "Square", value: "1024x1024", ratio: "1:1" },
  { id: "landscape", label: "Landscape", value: "1792x1024", ratio: "16:9" },
  { id: "portrait", label: "Portrait", value: "1024x1792", ratio: "9:16" },
] as const;

type ImageSizeId = typeof IMAGE_SIZES[number]["id"];

// ============================================================================
// AI Image Block
// ============================================================================

export const AIImageBlock = createReactBlockSpec(
  {
    type: "aiImage",
    propSchema: {
      // Prompt used for generation
      prompt: { default: "" },
      // Generated image data (base64)
      imageData: { default: "" },
      // Image MIME type
      mimeType: { default: "image/png" },
      // Generation status
      status: { default: "idle" as GenerationStatus },
      // Error message if any
      errorMessage: { default: "" },
      // Image size preference
      sizeId: { default: "square" as ImageSizeId },
      // Text alignment
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => {
      const { prompt, imageData, mimeType, status, errorMessage, sizeId } = props.block.props;
      
      const [promptInput, setPromptInput] = useState(prompt || "");
      const [selectedSize, setSelectedSize] = useState<ImageSizeId>(sizeId as ImageSizeId || "square");
      const [isFullscreen, setIsFullscreen] = useState(false);
      const [isGenerating, setIsGenerating] = useState(false);

      // Update block props
      const updateBlock = useCallback((updates: Record<string, unknown>) => {
        props.editor.updateBlock(props.block, {
          type: "aiImage",
          props: updates,
        });
      }, [props.editor, props.block]);

      // Generate image
      const handleGenerate = useCallback(async () => {
        if (!promptInput.trim()) {
          toast.error("Please enter a prompt");
          return;
        }

        setIsGenerating(true);
        updateBlock({ 
          status: "generating", 
          prompt: promptInput,
          sizeId: selectedSize,
        });

        try {
          const sizeConfig = IMAGE_SIZES.find(s => s.id === selectedSize);
          const [width, height] = (sizeConfig?.value || "1024x1024").split("x").map(Number);

          const result = await generateAIImage(promptInput, {
            width,
            height,
          });

          if (result.success && result.imageBase64) {
            updateBlock({
              status: "done",
              imageData: result.imageBase64,
              mimeType: result.mimeType || "image/png",
              errorMessage: "",
            });
            toast.success("Image generated successfully!");
          } else {
            throw new Error(result.error || "Failed to generate image");
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          updateBlock({
            status: "error",
            errorMessage: message,
          });
          toast.error(`Generation failed: ${message}`);
        } finally {
          setIsGenerating(false);
        }
      }, [promptInput, selectedSize, updateBlock]);

      // Regenerate with same prompt
      const handleRegenerate = useCallback(() => {
        handleGenerate();
      }, [handleGenerate]);

      // Download image
      const handleDownload = useCallback(() => {
        if (!imageData) return;

        const link = document.createElement("a");
        link.href = `data:${mimeType};base64,${imageData}`;
        link.download = `ai-generated-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Image downloaded");
      }, [imageData, mimeType]);

      // Remove block
      const handleRemove = useCallback(() => {
        props.editor.removeBlocks([props.block]);
      }, [props.editor, props.block]);

      // Render based on status
      const currentStatus = isGenerating ? "generating" : (status as GenerationStatus);

      return (
        <div 
          className={cn(
            "ai-image-block",
            `ai-image-block--${currentStatus}`
          )} 
          contentEditable={false}
        >
          {/* Idle state - show input form */}
          {currentStatus === "idle" && !imageData && (
            <div className="ai-image-block__form">
              <div className="ai-image-block__header">
                <ImagePlus size={18} className="text-primary" />
                <span className="ai-image-block__title">AI Image Generation</span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="ai-image-block__close"
                  title="Remove block"
                >
                  <X size={14} />
                </button>
              </div>
              
              <div className="ai-image-block__input-row">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className="ai-image-block__input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  autoFocus
                />
              </div>

              <div className="ai-image-block__options">
                <div className="ai-image-block__sizes">
                  {IMAGE_SIZES.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size.id)}
                      className={cn(
                        "ai-image-block__size-btn",
                        selectedSize === size.id && "ai-image-block__size-btn--active"
                      )}
                    >
                      {size.ratio}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!promptInput.trim()}
                  className="ai-image-block__generate-btn"
                >
                  <Wand2 size={16} />
                  Generate
                </button>
              </div>
            </div>
          )}

          {/* Generating state - show loading animation */}
          {currentStatus === "generating" && (
            <div className="ai-image-block__loading">
              <div className="ai-image-block__loading-content">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="ai-image-block__loading-text">Creating your image...</span>
                <span className="ai-image-block__loading-prompt">{prompt || promptInput}</span>
              </div>
            </div>
          )}

          {/* Error state */}
          {currentStatus === "error" && (
            <div className="ai-image-block__error">
              <div className="ai-image-block__error-content">
                <AlertCircle size={24} className="text-destructive" />
                <span className="ai-image-block__error-text">{errorMessage || "Generation failed"}</span>
                <div className="ai-image-block__error-actions">
                  <button
                    type="button"
                    onClick={() => updateBlock({ status: "idle" })}
                    className="ai-image-block__retry-btn"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="ai-image-block__remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Done state - show image */}
          {(currentStatus === "done" || (currentStatus === "idle" && imageData)) && imageData && (
            <div className="ai-image-block__result">
              <div className="ai-image-block__image-container">
                <img
                  src={`data:${mimeType};base64,${imageData}`}
                  alt={prompt}
                  className="ai-image-block__image"
                  onClick={() => setIsFullscreen(true)}
                />
                
                <div className="ai-image-block__actions">
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="ai-image-block__action-btn"
                    title="Regenerate"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    className="ai-image-block__action-btn"
                    title="Fullscreen"
                  >
                    <Maximize2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="ai-image-block__action-btn"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="ai-image-block__action-btn ai-image-block__action-btn--danger"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              
              {prompt && (
                <p className="ai-image-block__caption">{prompt}</p>
              )}
            </div>
          )}

          {/* Fullscreen modal */}
          {isFullscreen && imageData && (
            <div 
              className="ai-image-block__fullscreen"
              onClick={() => setIsFullscreen(false)}
            >
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="ai-image-block__fullscreen-close"
              >
                <X size={24} />
              </button>
              <img
                src={`data:${mimeType};base64,${imageData}`}
                alt={prompt}
                className="ai-image-block__fullscreen-image"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      );
    },
  }
);
