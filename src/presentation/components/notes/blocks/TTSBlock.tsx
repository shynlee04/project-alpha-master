/**
 * @fileoverview Text-to-Speech Block for BlockNote
 * @module presentation/components/notes/blocks/TTSBlock
 * @story 44-05: Text-to-speech output block
 * @created 2026-01-14
 *
 * Custom BlockNote block for reading text aloud using Web Speech API.
 * Features:
 * - Text input for custom text or use editor content
 * - Voice selection from available system voices
 * - Speed control (0.5x - 2x)
 * - Play/Pause/Stop controls
 * - Progress indicator
 * - 8-bit design system compliance
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Volume2, Play, Pause, Square, X, Settings2, Loader2 } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import "./TTSBlock.css";

// Import TTS service
import {
  speak,
  pause,
  resume,
  stop,
  getVoices,
  getPlaybackState,
  onPlaybackUpdate,
  type TTSVoice,
} from "@/lib/notes/ai-tts-service";

// ============================================================================
// Types
// ============================================================================

type TTSStatus = "idle" | "playing" | "paused" | "loading";

// ============================================================================
// Speed Options
// ============================================================================

const SPEED_OPTIONS = [
  { id: "0.5", label: "0.5x", value: 0.5 },
  { id: "0.75", label: "0.75x", value: 0.75 },
  { id: "1", label: "1x", value: 1.0 },
  { id: "1.25", label: "1.25x", value: 1.25 },
  { id: "1.5", label: "1.5x", value: 1.5 },
  { id: "2", label: "2x", value: 2.0 },
] as const;

// ============================================================================
// TTS Block
// ============================================================================

export const TTSBlock = createReactBlockSpec(
  {
    type: "ttsBlock",
    propSchema: {
      // Text to speak (can be empty to use editor selection)
      text: { default: "" },
      // Selected voice name
      voiceName: { default: "" },
      // Playback speed (0.5 - 2.0)
      speed: { default: 1 },
      // Volume (0 - 1)
      volume: { default: 1 },
      // Text alignment
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => {
      const { text, voiceName, speed, volume } = props.block.props;
      
      const [textInput, setTextInput] = useState(text || "");
      const [selectedVoice, setSelectedVoice] = useState(voiceName || "");
      const [selectedSpeed, setSelectedSpeed] = useState(speed || 1);
      const [selectedVolume, setSelectedVolume] = useState(volume || 1);
      const [status, setStatus] = useState<TTSStatus>("idle");
      const [availableVoices, setAvailableVoices] = useState<TTSVoice[]>([]);
      const [showSettings, setShowSettings] = useState(false);
      const [progress, setProgress] = useState(0);
      const unsubscribeRef = useRef<(() => void) | null>(null);

      // Load available voices on mount
      useEffect(() => {
        const loadVoices = async () => {
          try {
            const voices = await getVoices();
            setAvailableVoices(voices);
            // Select first voice if none selected
            if (!selectedVoice && voices.length > 0) {
              const defaultVoice = voices.find(v => v.default) || voices[0];
              setSelectedVoice(defaultVoice.name);
            }
          } catch (error) {
            console.error("[TTSBlock] Failed to load voices:", error);
          }
        };
        loadVoices();
      }, [selectedVoice]);

      // Subscribe to playback updates
      useEffect(() => {
        if (status === "playing") {
          unsubscribeRef.current = onPlaybackUpdate((position, isPlaying) => {
            const state = getPlaybackState(textInput);
            if (state.length > 0) {
              setProgress((position / state.length) * 100);
            }
            if (!isPlaying && status === "playing") {
              setStatus("idle");
              setProgress(0);
            }
          });
        }
        return () => {
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }
        };
      }, [status, textInput]);

      // Update block props
      const updateBlock = useCallback((updates: Record<string, unknown>) => {
        props.editor.updateBlock(props.block, {
          type: "ttsBlock",
          props: updates,
        });
      }, [props.editor, props.block]);

      // Play/Resume speech
      const handlePlay = useCallback(async () => {
        if (!textInput.trim()) {
          toast.error("Please enter some text to read aloud");
          return;
        }

        if (status === "paused") {
          resume();
          setStatus("playing");
          return;
        }

        setStatus("loading");
        updateBlock({
          text: textInput,
          voiceName: selectedVoice,
          speed: selectedSpeed,
          volume: selectedVolume,
        });

        try {
          await speak(textInput, {
            voice: selectedVoice,
            rate: selectedSpeed,
            volume: selectedVolume,
          });
          setStatus("playing");
        } catch (error) {
          const message = error instanceof Error ? error.message : "Speech synthesis failed";
          toast.error(message);
          setStatus("idle");
        }
      }, [textInput, selectedVoice, selectedSpeed, selectedVolume, status, updateBlock]);

      // Pause speech
      const handlePause = useCallback(() => {
        pause();
        setStatus("paused");
      }, []);

      // Stop speech
      const handleStop = useCallback(() => {
        stop();
        setStatus("idle");
        setProgress(0);
      }, []);

      // Remove block
      const handleRemove = useCallback(() => {
        stop();
        props.editor.removeBlocks([props.block]);
      }, [props.editor, props.block]);

      // Get grouped voices by language
      const groupedVoices = availableVoices.reduce((acc, voice) => {
        const lang = voice.lang.split("-")[0];
        if (!acc[lang]) acc[lang] = [];
        acc[lang].push(voice);
        return acc;
      }, {} as Record<string, TTSVoice[]>);

      return (
        <div
          className={cn(
            "tts-block",
            `tts-block--${status}`
          )}
          data-content-type="ttsBlock"
        >
          {/* Header */}
          <div className="tts-block__header">
            <div className="tts-block__title">
              <Volume2 size={16} />
              <span>Text-to-Speech</span>
            </div>
            <div className="tts-block__actions">
              <button
                type="button"
                className="tts-block__action-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Settings2 size={14} />
              </button>
              <button
                type="button"
                className="tts-block__close"
                onClick={handleRemove}
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="tts-block__content">
            {/* Text Input */}
            <textarea
              className="tts-block__textarea"
              placeholder="Enter text to read aloud..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={3}
              disabled={status === "playing" || status === "loading"}
            />

            {/* Settings Panel */}
            {showSettings && (
              <div className="tts-block__settings">
                {/* Voice Selection */}
                <div className="tts-block__setting">
                  <label className="tts-block__label">Voice</label>
                  <select
                    className="tts-block__select"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    disabled={status === "playing"}
                  >
                    {Object.entries(groupedVoices).map(([lang, voices]) => (
                      <optgroup key={lang} label={lang.toUpperCase()}>
                        {voices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} {voice.localService ? "(Local)" : ""}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Speed Selection */}
                <div className="tts-block__setting">
                  <label className="tts-block__label">Speed</label>
                  <div className="tts-block__speed-options">
                    {SPEED_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={cn(
                          "tts-block__speed-btn",
                          selectedSpeed === opt.value && "tts-block__speed-btn--active"
                        )}
                        onClick={() => setSelectedSpeed(opt.value)}
                        disabled={status === "playing"}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="tts-block__setting">
                  <label className="tts-block__label">Volume: {Math.round(selectedVolume * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedVolume}
                    onChange={(e) => setSelectedVolume(parseFloat(e.target.value))}
                    className="tts-block__slider"
                    disabled={status === "playing"}
                  />
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {(status === "playing" || status === "paused") && (
              <div className="tts-block__progress-container">
                <div 
                  className="tts-block__progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Controls */}
            <div className="tts-block__controls">
              {status === "idle" && (
                <button
                  type="button"
                  className="tts-block__control-btn tts-block__control-btn--primary"
                  onClick={handlePlay}
                  disabled={!textInput.trim()}
                >
                  <Play size={18} />
                  <span>Play</span>
                </button>
              )}

              {status === "loading" && (
                <button
                  type="button"
                  className="tts-block__control-btn"
                  disabled
                >
                  <Loader2 size={18} className="animate-spin" />
                  <span>Loading...</span>
                </button>
              )}

              {status === "playing" && (
                <>
                  <button
                    type="button"
                    className="tts-block__control-btn"
                    onClick={handlePause}
                  >
                    <Pause size={18} />
                    <span>Pause</span>
                  </button>
                  <button
                    type="button"
                    className="tts-block__control-btn tts-block__control-btn--stop"
                    onClick={handleStop}
                  >
                    <Square size={18} />
                    <span>Stop</span>
                  </button>
                </>
              )}

              {status === "paused" && (
                <>
                  <button
                    type="button"
                    className="tts-block__control-btn tts-block__control-btn--primary"
                    onClick={handlePlay}
                  >
                    <Play size={18} />
                    <span>Resume</span>
                  </button>
                  <button
                    type="button"
                    className="tts-block__control-btn tts-block__control-btn--stop"
                    onClick={handleStop}
                  >
                    <Square size={18} />
                    <span>Stop</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    },
  }
);

export default TTSBlock;
