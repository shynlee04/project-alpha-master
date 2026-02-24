/**
 * @fileoverview Video Understanding Block
 * @module presentation/components/notes/blocks/VideoBlock
 * @story 44-04: Video input understanding
 * @created 2026-01-14
 *
 * Custom BlockNote block for AI-powered video understanding.
 * Features:
 * - Video file upload
 * - Frame extraction for analysis
 * - Multiple analysis modes
 * - Analyzed content display
 * - 8-bit design system compliance
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Video, Upload, Play, Pause, Loader2, File, Trash2, X, ChevronDown, Eye } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import "./VideoBlock.css";

import { analyzeVideo, createVideoPreview, formatDuration, type ExtractedFrame, type VideoAnalysisOptions } from "@/lib/notes/ai-video-service";

// ============================================================================
// Types
// ============================================================================

type VideoAnalysisMode = 'describe' | 'summary' | 'key-scenes' | 'transcribe' | 'custom';
type VideoAnalysisStatus = "idle" | "uploaded" | "extracting" | "analyzing" | "done" | "error";

interface StoredVideo {
  fileName: string;
  fileSize: number;
  duration: number; // in seconds
  previewUrl: string;
  extractedFrames?: ExtractedFrame[];
}

// ============================================================================
// Analysis Mode Options
// ============================================================================

const ANALYSIS_MODES = [
  { id: 'describe', label: 'Describe', icon: Video, description: 'Get detailed video description' },
  { id: 'summary', label: 'Summary', icon: File, description: 'Quick summary and key points' },
  { id: 'key-scenes', label: 'Key Scenes', icon: Eye, description: 'Identify important moments' },
  { id: 'transcribe', label: 'Transcribe Text', icon: File, description: 'Extract on-screen text' },
] as const;

// ============================================================================
// Video Block
// ============================================================================

export const VideoBlock = createReactBlockSpec(
  {
    type: "videoAnalysis",
    propSchema: {
      // Analysis mode
      analysisMode: { default: "describe" as VideoAnalysisMode },
      // Custom question (for custom mode)
      customQuestion: { default: "" },
      // Video file info (stored as JSON)
      videoData: { default: "" }, // StoredVideo as JSON
      // Analysis result
      analysisResult: { default: "" },
      // extractedFrames count
      frameCount: { default: 5 },
      // Status
      status: { default: "idle" as VideoAnalysisStatus },
      // Error message
      errorMessage: { default: "" },
      // Language
      language: { default: "en" as "en" | "vi" },
      // Text alignment
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => {
      const {
        analysisMode,
        customQuestion,
        videoData,
        analysisResult,
        frameCount,
        status,
        errorMessage,
        language,
      } = props.block.props;

      // Safe JSON parse with fallback for corrupted data
      const parseVideoData = (jsonStr: string): StoredVideo | null => {
        try {
          return jsonStr ? JSON.parse(jsonStr) : null;
        } catch {
          console.warn('[VideoBlock] Corrupted videoData, using null');
          return null;
        }
      };
      const video: StoredVideo | null = parseVideoData(videoData);
      const videoRef = useRef<HTMLVideoElement>(null);

      const [mode, setMode] = useState<VideoAnalysisMode>(analysisMode as VideoAnalysisMode || 'describe');
      const [question, setQuestion] = useState(customQuestion || "");
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      const [isPlaying, setIsPlaying] = useState(false);
      const [showModeSelect, setShowModeSelect] = useState(false);

      const updateBlock = useCallback((updates: Record<string, unknown>) => {
        props.editor.updateBlock(props.block, {
          type: "videoAnalysis",
          props: updates,
        });
      }, [props.editor, props.block]);

      // Handle video file upload
      const handleVideoSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadSize = 250 * 1024 * 1024; // 250MB limit
        if (file.size > uploadSize) {
          toast.error("Video file too large (max 250MB)");
          return;
        }

        try {
          toast.info("Loading video...");
          const previewUrl = createVideoPreview(file);
          
          const storedVideo: StoredVideo = {
            fileName: file.name,
            fileSize: file.size,
            duration: 0,
            previewUrl,
          };

          updateBlock({
            videoData: JSON.stringify(storedVideo),
            status: "uploaded",
            analysisResult: "",
            errorMessage: "",
          });
          
          // Store file for analysis in session storage
          const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            dataURL: await file.arrayBuffer(),
          };
          try {
            sessionStorage.setItem(`video-file-${props.block.id}`, JSON.stringify(fileData));
          } catch (e) {
            console.warn('[VideoBlock] Could not store file', e);
          }

          toast.success("Video uploaded successfully");
        } catch (error) {
          console.error('[VideoBlock] Upload error:', error);
          toast.error("Failed to load video file");
        }
      }, [updateBlock, props.block.id]);

      // Handle video loaded metadata
      const handleVideoLoaded = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
        if (!video) return;
        const target = e.target as HTMLVideoElement;
        const duration = target.duration;
        
        const updatedVideo: StoredVideo = {
          ...video,
          duration: duration,
        };
        
        updateBlock({
          videoData: JSON.stringify(updatedVideo),
        });
      }, [video, updateBlock]);

      // Analyze video
      const handleAnalyze = useCallback(async () => {
        if (!video || !video.previewUrl) {
          toast.error("Please upload a video first");
          return;
        }

        setIsAnalyzing(true);
        updateBlock({
          status: "extracting",
          analysisMode: mode,
          customQuestion: question,
        });

        try {
          const options: VideoAnalysisOptions = {
            analysisType: mode as VideoAnalysisOptions['analysisType'],
            frameCount: frameCount as number || 5,
            customQuestion: question || undefined,
            language: language as "en" | "vi",
          };

          updateBlock({ status: "analyzing" });

          // Retrieve file from session storage
          let videoFile: File | null = null;
          try {
            const storedFile = sessionStorage.getItem(`video-file-${props.block.id}`);
            if (storedFile) {
              const fileData = JSON.parse(storedFile);
              const uint8Array = new Uint8Array(fileData.dataURL);
              videoFile = new Blob([uint8Array], { type: fileData.type }) as any;
              (videoFile as any).name = fileData.name;
              (videoFile as any).size = fileData.size;
            }
          } catch (e) {
            console.warn('[VideoBlock] Could not retrieve file', e);
          }

          if (!videoFile) {
            throw new Error("Video file not available. Please re-upload.");
          }

          const result = await analyzeVideo(videoFile, options);

          if (result.success && result.content) {
            // Update videoData with extracted frames
            const updatedVideo: StoredVideo = {
              ...video,
              extractedFrames: result.extractedFrames,
            };

            updateBlock({
              status: "done",
              analysisResult: result.content,
              videoData: JSON.stringify(updatedVideo),
              errorMessage: "",
            });

            toast.success("Video analysis complete!");
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
      }, [video, mode, question, frameCount, language, updateBlock]);

      // Toggle playback
      const togglePlayback = useCallback(() => {
        if (!videoRef.current) return;
        
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }, [isPlaying]);

      // Clear block
      const handleClear = useCallback(() => {
        if (video?.previewUrl) {
          URL.revokeObjectURL(video.previewUrl);
        }
        updateBlock({
          videoData: "",
          analysisResult: "",
          status: "idle",
          errorMessage: "",
        });
      }, [video, updateBlock]);

      const currentStatus = isAnalyzing ? "analyzing" : (status as VideoAnalysisStatus);

      return (
        <div
          className={cn(
            "video-block",
            `video-block--${currentStatus}`
          )}
          contentEditable={false}
        >
          {/* Header */}
          <div className="video-block__header">
            <div className="flex items-center gap-2">
              <Video size={18} className="text-primary" />
              <span className="video-block__title">AI Video Understanding</span>
            </div>
            <button
              type="button"
              onClick={() => props.editor.removeBlocks([props.block])}
              className="video-block__close"
              title="Remove block"
            >
              <X size={14} />
            </button>
          </div>

          {/* Idle/Uploaded State */}
          {(currentStatus === "idle" || currentStatus === "uploaded") && (
            <div className="video-block__content">
              {/* Video Upload/Preview */}
              <div className="video-block__video-container">
                {video && video.previewUrl ? (
                  <div className="video-block__video-preview">
                    <video
                      ref={videoRef}
                      src={video.previewUrl}
                      className="video-block__video-player"
                      controls={false}
                      onLoadedMetadata={handleVideoLoaded}
                      onEnded={() => setIsPlaying(false)}
                    />
                    <div className="video-block__video-overlay">
                      <button
                        type="button"
                        onClick={togglePlayback}
                        className="video-block__play-button"
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      {video.duration > 0 && (
                        <span className="video-block__duration">{formatDuration(video.duration)}</span>
                      )}
                    </div>
                    <div className="video-block__video-info">
                      <span className="video-block__filename">{video.fileName}</span>
                      <span className="video-block__filesize">
                        {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                ) : (
                  <label className="video-block__upload-area">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      className="hidden"
                    />
                    <div className="video-block__upload-prompt">
                      <Upload size={32} className="text-primary mb-2" />
                      <span className="video-block__upload-text">
                        Click to upload video
                      </span>
                      <span className="video-block__upload-hint">
                        MP4, WebM • Max 250MB
                      </span>
                    </div>
                  </label>
                )}
              </div>

              {/* Controls */}
              {video && video.previewUrl && currentStatus === "uploaded" && (
                <div className="video-block__controls">
                  {/* Mode Selection */}
                  <div className="video-block__mode-select">
                    <button
                      type="button"
                      onClick={() => setShowModeSelect(!showModeSelect)}
                      className="video-block__mode-button"
                    >
                      <span className="text-sm font-medium">
                        {ANALYSIS_MODES.find(m => m.id === mode)?.label || 'Describe'}
                      </span>
                      <ChevronDown size={14} />
                    </button>

                    {showModeSelect && (
                      <div className="video-block__mode-dropdown">
                        {ANALYSIS_MODES.map(m => {
                          const Icon = m.icon;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setMode(m.id as VideoAnalysisMode);
                                setShowModeSelect(false);
                              }}
                              className={cn(
                                "video-block__mode-option",
                                mode === m.id && "video-block__mode-option--active"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Icon size={14} />
                                <span className="text-sm">{m.label}</span>
                              </div>
                              <span className="video-block__mode-desc">{m.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Question Input (for custom mode) */}
                  {mode === 'custom' && (
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask a question about the video..."
                      className="video-block__question-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAnalyze();
                        }
                      }}
                      autoFocus
                    />
                  )}

                  {/* Language Toggle */}
                  <div className="video-block__language-toggle">
                    <button
                      type="button"
                      onClick={() => updateBlock({ language: 'en' })}
                      className={cn(
                        "video-block__lang-btn",
                        language === 'en' && "video-block__lang-btn--active"
                      )}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBlock({ language: 'vi' })}
                      className={cn(
                        "video-block__lang-btn",
                        language === 'vi' && "video-block__lang-btn--active"
                      )}
                    >
                      VI
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              {video && video.previewUrl && currentStatus === "uploaded" && (
                <div className="video-block__actions">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="video-block__analyze-btn"
                  >
                    <Eye size={16} />
                    Analyze Video
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="video-block__clear-btn"
                  >
                    <Trash2 size={14} />
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Extracting/Analyzing State */}
          {(currentStatus === "extracting" || currentStatus === "analyzing") && (
            <div className="video-block__loading">
              <div className="video-block__loading-content">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="video-block__loading-text">
                  {currentStatus === "extracting" ? "Extracting frames..." : "Analyzing video content..."}
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {currentStatus === "error" && (
            <div className="video-block__error">
              <div className="video-block__error-content">
                <span className="video-block__error-text">{errorMessage || "Analysis failed"}</span>
                <div className="video-block__error-actions">
                  <button
                    type="button"
                    onClick={() => updateBlock({ status: "uploaded" })}
                    className="video-block__retry-btn"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Done State */}
          {currentStatus === "done" && analysisResult && (
            <div className="video-block__result">
              {/* Analysis Result */}
              <div className="video-block__result-content">
                <div className="video-block__analysis-text">
                  {analysisResult.split('\n').map((line, i) => {
                    if (line.startsWith('##')) {
                      return <h3 key={i} className="font-semibold mt-3 mb-1">{line.replace(/^#+\s*/, '')}</h3>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="ml-4">{line.slice(2)}</li>;
                    }
                    if (line.trim()) {
                      return <p key={i} className="mb-1">{line}</p>;
                    }
                    return <br key={i} />;
                  })}
                </div>
              </div>

              {/* Result Actions */}
              <div className="video-block__result-actions">
                <button
                  type="button"
                  onClick={() => updateBlock({ status: "uploaded" })}
                  className="video-block__retry-btn"
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