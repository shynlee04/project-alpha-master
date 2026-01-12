/**
 * @fileoverview Storyboard Block for Sequential Multi-Image Generation
 * @module presentation/components/notes/blocks/StoryboardBlock
 * @story 44-03: Sequential multi-image storyboard
 * @created 2026-01-14
 *
 * Custom BlockNote block for generating sequential visual storyboards.
 * Features:
 * - Prompt-based story generation
 * - Adjustable frame count (3-6)
 * - Sequential generation with progress
 * - Frame-by-frame display with descriptions
 * - Per-frame actions (regenerate, download, expand)
 * - 8-bit design system compliance
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Images, Loader2, RefreshCw, Download, Trash2, X, ChevronDown, Wand2 } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import "./StoryboardBlock.css";

import { generateStoryboard, regenerateFrame, type StoryboardFrame, type StoryboardOptions } from "@/lib/notes/ai-storyboard-service";

// ============================================================================
// Types
// ============================================================================

type StoryboardStatus = "idle" | "generating" | "done" | "error";

interface StoredFrame {
  frameNumber: number;
  description: string;
  imageBase64: string;
  mimeType: string;
  status: 'pending' | 'generating' | 'done' | 'error';
  errorMessage?: string;
}

const FRAME_COUNTS = [
  { value: 3, label: '3 Frames' },
  { value: 4, label: '4 Frames' },
  { value: 5, label: '5 Frames' },
  { value: 6, label: '6 Frames' },
] as const;

const STYLE_OPTIONS = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'anime', label: 'Anime' },
  { value: 'sketch', label: 'Sketch' },
] as const;

// ============================================================================
// Storyboard Block
// ============================================================================

export const StoryboardBlock = createReactBlockSpec(
  {
    type: "storyboard",
    propSchema: {
      // User prompt for storyboard generation
      prompt: { default: "" },
      // Number of frames
      frameCount: { default: 3 },
      // Art style
      style: { default: "digital-art" },
      // Language
      language: { default: "en" as "en" | "vi" },
      // Generated frames (stored as JSON)
      frames: { default: JSON.stringify([]) },
      // Status
      status: { default: "idle" as StoryboardStatus },
      // Error message
      errorMessage: { default: "" },
      // Text alignment
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => {
      const storedFrames = JSON.parse(props.block.props.frames || "[]") as StoredFrame[];
      const {
        prompt,
        frameCount,
        style,
        language,
        status,
        errorMessage,
      } = props.block.props;

      const [inputPrompt, setInputPrompt] = useState(prompt || "");
      const [selectedFrameCount, setSelectedFrameCount] = useState(frameCount as number || 3);
      const [selectedStyle, setSelectedStyle] = useState(style || "digital-art");
      const [isGenerating, setIsGenerating] = useState(false);
      const [expandedFrame, setExpandedFrame] = useState<number | null>(null);
      const [showSettings, setShowSettings] = useState(false);

      const frames: StoryboardFrame[] = storedFrames.map(f => ({
        ...f,
        status: f.status as StoryboardFrame['status'],
      }));

      const updateBlock = useCallback((updates: Record<string, unknown>) => {
        props.editor.updateBlock(props.block, {
          type: "storyboard",
          props: updates,
        });
      }, [props.editor, props.block]);

      // Generate storyboard
      const handleGenerate = useCallback(async () => {
        if (!inputPrompt.trim()) {
          toast.error("Please enter a prompt for your storyboard");
          return;
        }

        setIsGenerating(true);
        updateBlock({
          prompt: inputPrompt,
          frameCount: selectedFrameCount,
          style: selectedStyle,
          status: "generating",
        });

        try {
          const options: StoryboardOptions = {
            frameCount: selectedFrameCount,
            style: selectedStyle as StoryboardOptions['style'],
            language: language as "en" | "vi",
            width: 1024,
            height: 1024,
          };

          const result = await generateStoryboard(inputPrompt, options);

          if (result.success) {
            const storedResultFrames: StoredFrame[] = result.frames.map(f => ({
              frameNumber: f.frameNumber,
              description: f.description,
              imageBase64: f.imageBase64 || "",
              mimeType: f.mimeType,
              status: f.status,
              errorMessage: f.errorMessage,
            }));

            updateBlock({
              frames: JSON.stringify(storedResultFrames),
              status: "done",
              errorMessage: "",
            });

            toast.success(`Storyboard with ${result.frames.length} frames created!`);
          } else {
            throw new Error(result.error || "Generation failed");
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          updateBlock({
            status: "error",
            errorMessage: message,
          });
          toast.error(`Storyboard generation failed: ${message}`);
        } finally {
          setIsGenerating(false);
        }
      }, [inputPrompt, selectedFrameCount, selectedStyle, language, updateBlock]);

      // Regenerate a single frame
      const handleRegenerateFrame = useCallback(async (frameNumber: number) => {
        const frame = frames.find(f => f.frameNumber === frameNumber);
        if (!frame) return;

        // Update frame status to generating
        const updatedFrames = frames.map(f =>
          f.frameNumber === frameNumber ? { ...f, status: 'generating' as const } : f
        );
        updateBlock({ frames: JSON.stringify(updatedFrames) });

        try {
          const newFrame = await regenerateFrame(frame, {
            style: selectedStyle as StoryboardOptions['style'],
          });

          const finalFrames = frames.map(f =>
            f.frameNumber === frameNumber ? {
              ...f,
              imageBase64: newFrame.imageBase64,
              status: newFrame.status,
              errorMessage: newFrame.errorMessage,
            } : f
          );

          updateBlock({ frames: JSON.stringify(finalFrames) });
          toast.success(`Frame ${frameNumber} regenerated`);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          const errorFrames = frames.map(f =>
            f.frameNumber === frameNumber ? { ...f, status: 'error' as const, errorMessage: message } : f
          );
          updateBlock({ frames: JSON.stringify(errorFrames) });
          toast.error(`Failed to regenerate frame: ${message}`);
        }
      }, [frames, selectedStyle, updateBlock]);

      // Download frame
      const handleDownloadFrame = useCallback((frame: StoryboardFrame) => {
        if (!frame.imageBase64) return;

        const link = document.createElement("a");
        link.href = `data:${frame.mimeType};base64,${frame.imageBase64}`;
        link.download = `storyboard-frame-${frame.frameNumber}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Frame ${frame.frameNumber} downloaded`);
      }, []);

      // Clear storyboard
      const handleClear = useCallback(() => {
        updateBlock({
          prompt: "",
          frames: "[]",
          status: "idle",
          errorMessage: "",
        });
        setInputPrompt("");
      }, [updateBlock]);

      const currentStatus = isGenerating ? "generating" : (status as StoryboardStatus);

      return (
        <div
          className={cn(
            "storyboard-block",
            `storyboard-block--${currentStatus}`
          )}
          contentEditable={false}
        >
          {/* Header */}
          <div className="storyboard-block__header">
            <div className="flex items-center gap-2">
              <Images size={18} className="text-primary" />
              <span className="storyboard-block__title">AI Storyboard</span>
            </div>
            <button
              type="button"
              onClick={() => props.editor.removeBlocks([props.block])}
              className="storyboard-block__close"
              title="Remove block"
            >
              <X size={14} />
            </button>
          </div>

          {/* Idle State - Show Input Form */}
          {currentStatus === "idle" && frames.length === 0 && (
            <div className="storyboard-block__content">
              {/* Prompt Input */}
              <div className="storyboard-block__input-section">
                <label className="storyboard-block__label">
                  Describe your story or scene
                </label>
                <textarea
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="e.g., A superhero discovering their powers for the first time..."
                  className="storyboard-block__prompt-input"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
              </div>

              {/* Settings Toggle */}
              <div className="storyboard-block__settings-toggle">
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className="storyboard-block__settings-btn"
                >
                  <span className="text-sm">Settings</span>
                  <ChevronDown size={14} className={cn(showSettings && "rotate-180")} />
                </button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className="storyboard-block__settings">
                  <div className="storyboard-block__setting-row">
                    <label className="storyboard-block__setting-label">Frames</label>
                    <div className="storyboard-block__select-wrapper">
                      <select
                        value={selectedFrameCount}
                        onChange={(e) => setSelectedFrameCount(Number(e.target.value))}
                        className="storyboard-block__select"
                      >
                        {FRAME_COUNTS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="storyboard-block__setting-row">
                    <label className="storyboard-block__setting-label">Style</label>
                    <div className="storyboard-block__select-wrapper">
                      <select
                        value={selectedStyle}
                        onChange={(e) => setSelectedStyle(e.target.value)}
                        className="storyboard-block__select"
                      >
                        {STYLE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="storyboard-block__setting-row">
                    <label className="storyboard-block__setting-label">Language</label>
                    <div className="storyboard-block__lang-toggle">
                      <button
                        type="button"
                        onClick={() => updateBlock({ language: 'en' })}
                        className={cn(
                          "storyboard-block__lang-btn",
                          language === 'en' && "storyboard-block__lang-btn--active"
                        )}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBlock({ language: 'vi' })}
                        className={cn(
                          "storyboard-block__lang-btn",
                          language === 'vi' && "storyboard-block__lang-btn--active"
                        )}
                      >
                        VI
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="storyboard-block__actions">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!inputPrompt.trim() || isGenerating}
                  className="storyboard-block__generate-btn"
                >
                  <Wand2 size={16} />
                  Generate Storyboard
                </button>
              </div>
            </div>
          )}

          {/* Generating State */}
          {currentStatus === "generating" && (
            <div className="storyboard-block__generating">
              <div className="storyboard-block__generating-content">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="storyboard-block__generating-text">Creating your storyboard...</span>
                <span className="storyboard-block__generating-prompt">{inputPrompt}</span>
              </div>
              {/* Frame Progress */}
              <div className="storyboard-block__frame-progress">
                {frames.map((frame) => (
                  <div
                    key={frame.frameNumber}
                    className={cn(
                      "storyboard-block__progress-frame",
                      `storyboard-block__progress-frame--${frame.status}`
                    )}
                  >
                    <span className="storyboard-block__progress-number">{frame.frameNumber}</span>
                    {frame.status === 'generating' && <Loader2 size={12} className="animate-spin" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {currentStatus === "error" && (
            <div className="storyboard-block__error">
              <div className="storyboard-block__error-content">
                <span className="storyboard-block__error-text">{errorMessage || "Generation failed"}</span>
                <div className="storyboard-block__error-actions">
                  <button
                    type="button"
                    onClick={() => updateBlock({ status: "idle" })}
                    className="storyboard-block__retry-btn"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Done State - Show Storyboard */}
          {currentStatus === "done" && frames.length > 0 && (
            <div className="storyboard-block__result">
              {/* Story Header */}
              <div className="storyboard-block__story-header">
                <span className="storyboard-block__story-prompt">{inputPrompt}</span>
                <div className="storyboard-block__story-meta">
                  <span>{frames.length} frames</span>
                  <span>•</span>
                  <span>{selectedStyle}</span>
                </div>
              </div>

              {/* Frames Grid */}
              <div className="storyboard-block__frames-grid">
                {frames.map((frame) => (
                  <div
                    key={frame.frameNumber}
                    className={cn(
                      "storyboard-block__frame",
                      `storyboard-block__frame--${frame.status}`
                    )}
                  >
                    {/* Frame Number Badge */}
                    <div className="storyboard-block__frame-number">
                      {frame.frameNumber}
                    </div>

                    {/* Frame Image */}
                    <div className="storyboard-block__frame-image">
                      {frame.imageBase64 ? (
                        <img
                          src={`data:${frame.mimeType};base64,${frame.imageBase64}`}
                          alt={`Frame ${frame.frameNumber}`}
                          className="storyboard-block__frame-img"
                          onClick={() => setExpandedFrame(
                            expandedFrame === frame.frameNumber ? null : frame.frameNumber
                          )}
                        />
                      ) : (
                        <div className="storyboard-block__frame-placeholder">
                          <Loader2 size={24} className="animate-spin" />
                        </div>
                      )}

                      {/* Frame Actions Overlay */}
                      <div className="storyboard-block__frame-actions">
                        <button
                          type="button"
                          onClick={() => handleRegenerateFrame(frame.frameNumber)}
                          className="storyboard-block__frame-action"
                          title="Regenerate"
                        >
                          <RefreshCw size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFrame(frame)}
                          className="storyboard-block__frame-action"
                          title="Download"
                        >
                          <Download size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Frame Description */}
                    <div className="storyboard-block__frame-description">
                      <p className="storyboard-block__frame-text">{frame.description}</p>
                      <button
                        type="button"
                        onClick={() => setExpandedFrame(
                          expandedFrame === frame.frameNumber ? null : frame.frameNumber
                        )}
                        className="storyboard-block__frame-expand"
                      >
                        {expandedFrame === frame.frameNumber ? 'Show less' : 'Show more'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Result Actions */}
              <div className="storyboard-block__result-actions">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="storyboard-block__regenerate-btn"
                >
                  <RefreshCw size={14} />
                  Regenerate All
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="storyboard-block__clear-btn"
                >
                  <Trash2 size={14} />
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Expanded Frame Modal */}
          {expandedFrame !== null && frames.find(f => f.frameNumber === expandedFrame)?.imageBase64 && (
            <div
              className="storyboard-block__fullscreen"
              onClick={() => setExpandedFrame(null)}
            >
              <button
                type="button"
                onClick={() => setExpandedFrame(null)}
                className="storyboard-block__fullscreen-close"
              >
                <X size={24} />
              </button>
              <img
                src={`data:${frames.find(f => f.frameNumber === expandedFrame)?.mimeType};base64,${frames.find(f => f.frameNumber === expandedFrame)?.imageBase64}`}
                alt={`Frame ${expandedFrame}`}
                className="storyboard-block__fullscreen-image"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      );
    },
  }
);