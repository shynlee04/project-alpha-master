// @ts-nocheck
/**
 * @fileoverview Voice Recording Button Component
 * @module presentation/components/notes/VoiceRecordButton
 * @governance NS-2026-01-07
 * @created 2026-01-07T08:00:00+07:00
 *
 * Voice recording button for speech-to-text in Notes editor.
 * Uses useVoiceRecording hook with Gemini transcription.
 *
 * Story: Integrate scattered AI features into Notes workspace
 * - Voice recording with real-time transcription
 * - Volume level indicator
 * - Inserts transcribed text into BlockNote editor
 */

import { useCallback, useEffect, useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import { useVoiceRecording } from '@/lib/voice/use-voice-recording';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface VoiceRecordButtonProps {
  /** Callback when transcription is ready to insert */
  onTranscriptReady: (transcript: string) => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Voice Record Button Component
 *
 * Features:
 * - Speech-to-text using Gemini transcription
 * - Real-time volume level indicator
 * - Recording state with pulse animation
 * - Error handling for missing API key
 * - Preview before inserting
 */
export function VoiceRecordButton({ onTranscriptReady, className }: VoiceRecordButtonProps) {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [transcript, setTranscript] = useState<string>('');

  // Load Gemini API key from credential vault
  useEffect(() => {
    (async () => {
      try {
        const { credentialVault } = await import('@/lib/agent/providers/credential-vault');
        await credentialVault.initialize();
        const key = await credentialVault.getCredentials('gemini');
        setApiKey(key || null);
      } catch (error) {
        console.error('[VoiceRecordButton] Failed to load API key:', error);
      }
    })();
  }, []);

  const voiceRecording = useVoiceRecording({
    apiKey: apiKey || undefined,
    minDuration: 500,
    maxDuration: 60000, // 1 minute max for notes
  });

  // Handle errors
  useEffect(() => {
    if (voiceRecording.error) {
      toast.error(voiceRecording.error);
      voiceRecording.clearError();
    }
  }, [voiceRecording.error, voiceRecording.clearError]);

  // Handle recording toggle
  const handleToggle = useCallback(async () => {
    if (!voiceRecording.isSupported) {
      toast.error(t('voice.notSupported', 'Voice recording not supported in this browser'));
      return;
    }

    if (!apiKey) {
      toast.error(t('voice.apiKeyMissing', 'Gemini API key required. Please configure in Settings.'));
      return;
    }

    if (voiceRecording.isRecording) {
      // Stop recording and get transcript
      const text = await voiceRecording.stopRecording();
      if (text) {
        setTranscript(text);
        setPreviewOpen(true);
      }
    } else {
      // Start recording
      await voiceRecording.startRecording();
    }
  }, [voiceRecording, apiKey, t]);

  // Handle insert transcript
  const handleInsert = useCallback(() => {
    if (transcript.trim()) {
      onTranscriptReady(transcript);
      setPreviewOpen(false);
      setTranscript('');
      toast.success(t('voice.transcriptInserted', 'Transcript inserted'));
    }
  }, [transcript, onTranscriptReady, t]);

  // Handle discard
  const handleDiscard = useCallback(() => {
    setPreviewOpen(false);
    setTranscript('');
  }, []);

  return (
    <>
      {/* Recording Button */}
      <Button
        size="sm"
        variant={voiceRecording.isRecording ? 'destructive' : 'ghost'}
        onClick={handleToggle}
        disabled={!apiKey || voiceRecording.isProcessing}
        className={`h-7 px-2 relative ${voiceRecording.isRecording ? 'animate-pulse' : ''} ${className || ''}`}
        aria-label={
          voiceRecording.isRecording
            ? t('voice.tapToStop', 'Tap to stop')
            : t('voice.tapToRecord', 'Tap to record')
        }
        title={
          !apiKey
            ? t('voice.apiKeyMissing', 'API key required')
            : voiceRecording.isRecording
              ? t('voice.recording', 'Recording...')
              : t('voice.record', 'Voice input')
        }
      >
        {voiceRecording.isProcessing ? (
          <AlertCircle className="h-3 w-3 animate-spin" />
        ) : voiceRecording.isRecording ? (
          <MicOff className="h-3 w-3" />
        ) : (
          <Mic className="h-3 w-3" />
        )}

        {/* Volume level indicator */}
        {voiceRecording.isRecording && voiceRecording.volumeLevel > 0.01 && (
          <span
            className="absolute inset-0 rounded-full bg-primary/30"
            style={{
              transform: `scale(${0.8 + voiceRecording.volumeLevel * 0.4})`,
              transition: 'transform 100ms ease-out',
            }}
          />
        )}
      </Button>

      {/* Transcript Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-500" />
              {t('voice.transcriptPreview', 'Voice Transcript')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Transcript text */}
            <div className="max-h-64 overflow-y-auto p-3 bg-muted/50 rounded-md">
              <p className="text-sm whitespace-pre-wrap">
                {transcript || t('voice.noTranscript', 'No transcript available')}
              </p>
            </div>

            {/* Character count */}
            <div className="text-xs text-muted-foreground text-right">
              {transcript.length} {t('voice.characters', 'characters')}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleDiscard}>
                {t('voice.discard', 'Discard')}
              </Button>
              <Button onClick={handleInsert} disabled={!transcript.trim()}>
                <Mic className="w-4 h-4 mr-2" />
                {t('voice.insertIntoNote', 'Insert into Note')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
