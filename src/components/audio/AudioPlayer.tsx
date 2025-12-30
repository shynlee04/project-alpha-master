/**
 * @fileoverview Audio Player Component
 * @module components/audio/AudioPlayer
 * @governance EPIC-10-3
 *
 * Audio player with progress bar, speed control, and transcript view.
 * Supports mobile background playback.
 *
 * Story 10.3: Audio Overview Generator
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatDuration, revokeAudioUrl } from '@/lib/audio/audio-generation';
import { markAsPlayed } from '@/lib/audio/audio-storage';
import type { AudioMetadata } from '@/lib/audio/audio-storage';

export interface AudioPlayerProps {
  /**
   * Audio metadata with URL
   */
  audio: AudioMetadata;

  /**
   * Auto-play on mount (default: false)
   */
  autoPlay?: boolean;

  /**
   * Show transcript (default: true)
   */
  showTranscript?: boolean;

  /**
   * Playback completed callback
   */
  onPlaybackComplete?: () => void;

  /**
   * Component unmount callback
   */
  onUnmount?: () => void;
}

/**
 * Audio player component with controls
 *
 * @example
 * ```tsx
 * <AudioPlayer
 *   audio={audioData}
 *   autoPlay={true}
 *   onPlaybackComplete={() => console.log('Done')}
 * />
 * ```
 */
export function AudioPlayer({
  audio,
  autoPlay = false,
  showTranscript = true,
  onPlaybackComplete,
  onUnmount,
}: AudioPlayerProps) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audio.duration);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(showTranscript);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set audio source
    audio.src = audio.audioUrl;
    audio.load();

    // Auto-play if requested
    if (autoPlay) {
      audio.play().catch(console.error);
    }

    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.src = '';
      revokeAudioUrl(audio.audioUrl);
      onUnmount?.();
    };
  }, [audio.audioUrl, autoPlay, onUnmount]);

  // Update play state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onPlaybackComplete?.();
    };

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || audio.duration);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onPlaybackComplete, audio.duration]);

  // Mark as played when playback starts
  useEffect(() => {
    if (isPlaying && audio.id) {
      markAsPlayed(audio.id).catch(console.error);
    }
  }, [isPlaying, audio.id]);

  // Toggle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  // Seek to position
  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  // Change playback speed
  const handleSpeedChange = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  // Format current time as percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 p-4 bg-background border rounded-lg">
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{audio.sourceTitle}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsTranscriptVisible(!isTranscriptVisible)}
        >
          {isTranscriptVisible ? t('audio.hideTranscript') : t('audio.showTranscript')}
        </Button>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatDuration(currentTime)}</span>
          <span>{progressPercent.toFixed(0)}%</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Skip back */}
        <Button
          variant="outline"
          iconOnly
          onClick={() => skip(-10)}
          title={t('audio.skipBack')}
        >
          <span className="text-lg">-10</span>
        </Button>

        {/* Play/Pause */}
        <Button
          variant="primary"
          iconOnly
          onClick={togglePlayPause}
          title={isPlaying ? t('audio.pause') : t('audio.play')}
        >
          {isPlaying ? (
            <span className="text-lg">⏸</span>
          ) : (
            <span className="text-lg">▶️</span>
          )}
        </Button>

        {/* Skip forward */}
        <Button
          variant="outline"
          iconOnly
          onClick={() => skip(10)}
          title={t('audio.skipForward')}
        >
          <span className="text-lg">+10</span>
        </Button>

        {/* Speed control */}
        <div className="flex items-center gap-1 ml-4">
          <span className="text-xs text-muted-foreground">{t('audio.speed')}</span>
          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <Button
              key={rate}
              variant={playbackRate === rate ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSpeedChange(rate)}
            >
              {rate}x
            </Button>
          ))}
        </div>
      </div>

      {/* Transcript */}
      {isTranscriptVisible && audio.transcript && (
        <div className="mt-4 p-4 bg-muted rounded max-h-60 overflow-y-auto">
          <h4 className="text-sm font-semibold mb-2">{t('audio.transcript')}</h4>
          <p className="text-sm whitespace-pre-wrap">{audio.transcript}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {t('audio.language')}: {audio.language.toUpperCase()}
        </span>
        <span>
          {t('audio.voice')}: {audio.voiceName}
        </span>
        <span>
          {t('audio.played')}: {audio.playedCount}x
        </span>
      </div>
    </div>
  );
}
