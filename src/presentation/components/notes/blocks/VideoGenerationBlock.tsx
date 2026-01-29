// @ts-nocheck
/**
 * @fileoverview Video Generation Block
 * @module presentation/components/notes/blocks/VideoGenerationBlock
 * @story 44-07: Video Generation Block (Experimental)
 * @created 2026-01-14
 *
 * Custom BlockNote block for AI-powered video generation using Veo 3.1.
 * Features:
 * - Text prompt input for video generation
 * - Progress indicator during generation
 * - Video preview player
 * - Download functionality
 * - 8-bit design system compliance
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { 
  Clapperboard, 
  Loader2, 
  Download, 
  RefreshCw, 
  Trash2, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import "./VideoGenerationBlock.css";

// ============================================================================
// Types
// ============================================================================

type VideoGenStatus = "idle" | "queued" | "generating" | "done" | "error";

interface GeneratedVideo {
  blobUrl: string;      // Blob URL for preview
  duration: number;     // Video duration in seconds
  generatedAt: number;  // Timestamp
}

// ============================================================================
// Video Generation Service (Inline for Simplicity)
// ============================================================================

interface GenerateVideoOptions {
  prompt: string;
  apiKey: string;
  onProgress?: (message: string) => void;
}

interface GenerateVideoResult {
  success: boolean;
  videoBlob?: Blob;
  error?: string;
}

/**
 * Generate video using Veo 3.1 API
 * NOTE: This is experimental and requires a paid Gemini API tier with Veo access
 */
async function generateVideoWithVeo(options: GenerateVideoOptions): Promise<GenerateVideoResult> {
  const { prompt, apiKey, onProgress } = options;

  try {
    // Dynamic import to avoid bundling issues
    const { GoogleGenAI } = await import("@google/genai");
    
    const ai = new GoogleGenAI({ apiKey });
    
    onProgress?.("Starting video generation...");
    
    // Start video generation
    let operation = await (ai.models as any).generateVideos({
      model: "veo-3.1-generate-preview",
      prompt: prompt,
    });
    
    onProgress?.("Video queued, waiting for generation...");
    
    // Poll for completion (Veo can take 60-120 seconds)
    let pollCount = 0;
    const maxPolls = 30; // 5 minutes max (10s intervals)
    
    while (!operation.done && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second intervals
      pollCount++;
      
      const progress = Math.min(95, Math.floor((pollCount / maxPolls) * 100));
      onProgress?.(`Generating video... ${progress}%`);
      
      operation = await (ai.operations as any).getVideosOperation({ operation });
    }
    
    if (!operation.done) {
      return { success: false, error: "Video generation timed out. Please try again." };
    }
    
    onProgress?.("Downloading video...");
    
    // Get the generated video
    const generatedVideo = operation.response?.generatedVideos?.[0];
    if (!generatedVideo?.video) {
      return { success: false, error: "No video was generated. The API may have rejected the prompt." };
    }
    
    // Download the video
    const downloadResult = await (ai.files as any).download({
      file: generatedVideo.video,
    });
    
    // Convert to Blob
    let videoBlob: Blob;
    if (downloadResult instanceof Blob) {
      videoBlob = downloadResult;
    } else if (downloadResult?.data) {
      videoBlob = new Blob([downloadResult.data], { type: "video/mp4" });
    } else {
      return { success: false, error: "Failed to download video data." };
    }
    
    return { success: true, videoBlob };
    
  } catch (error: any) {
    console.error("[VideoGenerationBlock] Generation failed:", error);
    
    // Handle specific error types
    if (error?.message?.includes("API key")) {
      return { success: false, error: "Invalid or missing Gemini API key. Please check your settings." };
    }
    if (error?.message?.includes("quota") || error?.message?.includes("rate")) {
      return { success: false, error: "API quota exceeded or rate limited. Please try again later." };
    }
    if (error?.message?.includes("permission") || error?.message?.includes("access")) {
      return { success: false, error: "Your API key doesn't have Veo access. Veo requires a paid Gemini API tier." };
    }
    
    return { success: false, error: error?.message || "Failed to generate video." };
  }
}

// ============================================================================
// Style Presets
// ============================================================================

const STYLE_PRESETS = [
  { id: "cinematic", label: "Cinematic", prompt: "cinematic, film quality, professional" },
  { id: "animation", label: "Animation", prompt: "animated, colorful, cartoon style" },
  { id: "realistic", label: "Realistic", prompt: "photorealistic, natural, real world" },
  { id: "artistic", label: "Artistic", prompt: "artistic, creative, stylized" },
] as const;

// ============================================================================
// Video Generation Block
// ============================================================================

export const VideoGenerationBlock = createReactBlockSpec(
  {
    type: "videoGeneration",
    propSchema: {
      // User prompt
      prompt: { default: "" },
      // Style preset ID
      stylePreset: { default: "cinematic" },
      // Generated video data (JSON)
      videoData: { default: "" }, // GeneratedVideo as JSON
      // Generation status
      status: { default: "idle" as VideoGenStatus },
      // Progress message
      progressMessage: { default: "" },
      // Error message
      errorMessage: { default: "" },
      // Text alignment
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => {
      const {
        prompt: savedPrompt,
        stylePreset: savedStyle,
        videoData,
        status,
        progressMessage,
        errorMessage,
      } = props.block.props;

      // Safe JSON parse with fallback for corrupted data
      const parseVideoData = (jsonStr: string): GeneratedVideo | null => {
        try {
          return jsonStr ? JSON.parse(jsonStr) : null;
        } catch {
          console.warn('[VideoGenerationBlock] Corrupted videoData, using null');
          return null;
        }
      };
      const video: GeneratedVideo | null = parseVideoData(videoData);
      const videoRef = useRef<HTMLVideoElement>(null);

      // Local state
      const [prompt, setPrompt] = useState(savedPrompt || "");
      const [stylePreset, setStylePreset] = useState(savedStyle || "cinematic");
      const [isGenerating, setIsGenerating] = useState(false);
      const [progress, setProgress] = useState(progressMessage || "");
      const [isPlaying, setIsPlaying] = useState(false);
      const [isMuted, setIsMuted] = useState(false);

      // Update block props helper
      const updateBlock = useCallback((updates: Partial<typeof props.block.props>) => {
        props.editor.updateBlock(props.block, {
          type: "videoGeneration",
          props: updates,
        });
      }, [props.editor, props.block]);

      // Get API key from credential vault
      const getApiKey = useCallback(async (): Promise<string | null> => {
        try {
          // Use credentialVault like other services
          const { credentialVault } = await import("@/lib/agent/providers/credential-vault");
          const apiKey = await credentialVault.getCredentials('gemini');
          
          if (apiKey) {
            return apiKey;
          }
          
          // Fallback to environment variable (for dev)
          if (typeof window !== "undefined" && (window as any).__GEMINI_API_KEY__) {
            return (window as any).__GEMINI_API_KEY__;
          }
          
          return null;
        } catch (error) {
          console.error("[VideoGenerationBlock] Failed to get API key:", error);
          return null;
        }
      }, []);

      // Handle generate
      const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
          toast.error("Please enter a prompt describing your video");
          return;
        }

        // Get API key
        const apiKey = await getApiKey();
        if (!apiKey) {
          toast.error("No Gemini API key found. Please add one in Settings → API Keys.");
          updateBlock({ 
            status: "error", 
            errorMessage: "No Gemini API key configured" 
          });
          return;
        }

        setIsGenerating(true);
        updateBlock({ 
          status: "generating", 
          prompt: prompt,
          stylePreset: stylePreset,
          errorMessage: "",
        });

        try {
          // Get style prompt
          const style = STYLE_PRESETS.find(s => s.id === stylePreset);
          const fullPrompt = style 
            ? `${prompt}. Style: ${style.prompt}`
            : prompt;

          const result = await generateVideoWithVeo({
            prompt: fullPrompt,
            apiKey,
            onProgress: (msg) => {
              setProgress(msg);
              updateBlock({ progressMessage: msg });
            },
          });

          if (!result.success || !result.videoBlob) {
            throw new Error(result.error || "Failed to generate video");
          }

          // Create blob URL for preview
          const blobUrl = URL.createObjectURL(result.videoBlob);

          // Get video duration
          const tempVideo = document.createElement("video");
          tempVideo.src = blobUrl;
          await new Promise(resolve => {
            tempVideo.onloadedmetadata = resolve;
          });
          const duration = tempVideo.duration;

          // Save to block
          const generatedVideo: GeneratedVideo = {
            blobUrl,
            duration,
            generatedAt: Date.now(),
          };

          updateBlock({
            status: "done",
            videoData: JSON.stringify(generatedVideo),
            progressMessage: "",
          });

          toast.success("Video generated successfully!");

        } catch (error: any) {
          console.error("[VideoGenerationBlock] Generation failed:", error);
          updateBlock({ 
            status: "error", 
            errorMessage: error?.message || "Video generation failed",
            progressMessage: "",
          });
          toast.error(error?.message || "Video generation failed");
        } finally {
          setIsGenerating(false);
        }
      }, [prompt, stylePreset, getApiKey, updateBlock]);

      // Handle download
      const handleDownload = useCallback(async () => {
        if (!video?.blobUrl) return;

        try {
          const response = await fetch(video.blobUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement("a");
          a.href = url;
          a.download = `generated-video-${Date.now()}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast.success("Video downloaded!");
        } catch (error) {
          toast.error("Failed to download video");
        }
      }, [video]);

      // Handle delete
      const handleDelete = useCallback(() => {
        if (video?.blobUrl) {
          URL.revokeObjectURL(video.blobUrl);
        }
        updateBlock({
          status: "idle",
          videoData: "",
          prompt: "",
          errorMessage: "",
          progressMessage: "",
        });
        setPrompt("");
      }, [video, updateBlock]);

      // Toggle play/pause
      const togglePlay = useCallback(() => {
        if (!videoRef.current) return;
        
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }, [isPlaying]);

      // Toggle mute
      const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }, [isMuted]);

      // Fullscreen
      const handleFullscreen = useCallback(() => {
        if (!videoRef.current) return;

        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      }, []);

      // Track blob URL for cleanup
      const blobUrlRef = useRef<string | null>(null);

      // Update ref when video changes
      useEffect(() => {
        // Revoke old URL if different
        if (blobUrlRef.current && blobUrlRef.current !== video?.blobUrl) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        blobUrlRef.current = video?.blobUrl || null;
      }, [video?.blobUrl]);

      // Cleanup blob URL on unmount
      useEffect(() => {
        return () => {
          if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
          }
        };
      }, []);

      // Video event handlers
      useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        const handleEnded = () => setIsPlaying(false);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        videoEl.addEventListener("ended", handleEnded);
        videoEl.addEventListener("play", handlePlay);
        videoEl.addEventListener("pause", handlePause);

        return () => {
          videoEl.removeEventListener("ended", handleEnded);
          videoEl.removeEventListener("play", handlePlay);
          videoEl.removeEventListener("pause", handlePause);
        };
      }, [video]);

      // ========================================================================
      // Render
      // ========================================================================

      return (
        <div 
          className={cn(
            "video-generation-block",
            status === "error" && "video-generation-block--error",
            status === "done" && "video-generation-block--complete"
          )}
          contentEditable={false}
        >
          {/* Header */}
          <div className="video-generation-block__header">
            <div className="video-generation-block__title">
              <Clapperboard size={18} />
              <span>Video Generation</span>
              <span className="video-generation-block__badge">Experimental</span>
            </div>
            <button
              className="video-generation-block__delete"
              onClick={handleDelete}
              title="Delete block"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="video-generation-block__content">
            {/* Prompt Input */}
            {status !== "done" && (
              <div className="video-generation-block__prompt-section">
                <label className="video-generation-block__label">
                  Describe your video:
                </label>
                <textarea
                  className="video-generation-block__textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A serene mountain lake at sunrise with mist rising from the water..."
                  rows={3}
                  disabled={isGenerating}
                />
                <div className="video-generation-block__hint">
                  ~8 second video will be generated
                </div>

                {/* Style Selector */}
                <div className="video-generation-block__style-section">
                  <label className="video-generation-block__label">Style:</label>
                  <div className="video-generation-block__style-options">
                    {STYLE_PRESETS.map((style) => (
                      <button
                        key={style.id}
                        className={cn(
                          "video-generation-block__style-button",
                          stylePreset === style.id && "video-generation-block__style-button--active"
                        )}
                        onClick={() => setStylePreset(style.id)}
                        disabled={isGenerating}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  className="video-generation-block__generate-button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Generate Video</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Progress */}
            {status === "generating" && progress && (
              <div className="video-generation-block__progress">
                <Loader2 size={20} className="animate-spin" />
                <span>{progress}</span>
              </div>
            )}

            {/* Error */}
            {status === "error" && errorMessage && (
              <div className="video-generation-block__error">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Video Preview */}
            {status === "done" && video && (
              <div className="video-generation-block__preview">
                <div className="video-generation-block__player">
                  <video
                    ref={videoRef}
                    src={video.blobUrl}
                    className="video-generation-block__video"
                    playsInline
                    onClick={togglePlay}
                  />
                  
                  {/* Play overlay */}
                  {!isPlaying && (
                    <div 
                      className="video-generation-block__play-overlay"
                      onClick={togglePlay}
                    >
                      <Play size={48} />
                    </div>
                  )}

                  {/* Controls */}
                  <div className="video-generation-block__controls">
                    <button onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <span className="video-generation-block__duration">
                      {Math.round(video.duration)}s
                    </span>
                    <div className="video-generation-block__controls-spacer" />
                    <button onClick={handleFullscreen} title="Fullscreen">
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Prompt display */}
                <div className="video-generation-block__prompt-display">
                  <strong>Prompt:</strong> {savedPrompt}
                </div>

                {/* Actions */}
                <div className="video-generation-block__actions">
                  <button
                    className="video-generation-block__action-button"
                    onClick={handleDownload}
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                  <button
                    className="video-generation-block__action-button video-generation-block__action-button--secondary"
                    onClick={handleDelete}
                  >
                    <RefreshCw size={16} />
                    <span>New Video</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    },
  }
);

export default VideoGenerationBlock;
