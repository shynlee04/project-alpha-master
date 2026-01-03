/**
 * @fileoverview RAG Voice Slice - Voice Mode State (Story 10-1)
 * @module infrastructure/persistence/stores/rag/rag-voice-slice
 * @governance EPIC-7-1, Story 10-1
 *
 * Manages voice interaction mode for RAG-powered search.
 * Handles microphone permissions, connection state, and volume control.
 */

import { StateCreator } from 'zustand';
import type { ConnectionState, VoiceModeState as VoiceModeStateEnum } from '@/lib/rag/live-api-types';
import type { RAGVoiceState } from './rag-types';

/**
 * Voice slice - manages voice mode state (Story 10-1)
 */
export const createRAGVoiceSlice: StateCreator<RAGVoiceState> = (set, _get) => ({
  // Initial state
  voiceState: 'idle',
  voiceConnection: {
    state: 'disconnected',
    retryCount: 0,
  },
  voiceMicrophoneEnabled: false,
  voiceIsDesktop: true, // Will detect on mount
  voiceVolumeLevel: 0,

  // Actions

  setVoiceState: (state: VoiceModeStateEnum) => {
    console.log('[RAGVoiceSlice] Voice state:', state);
    set({ voiceState: state } as Partial<RAGVoiceState>);
  },

  setVoiceConnection: (connection: ConnectionState) => {
    console.log('[RAGVoiceSlice] Connection:', connection.state);
    set({ voiceConnection: connection } as Partial<RAGVoiceState>);
  },

  setMicrophoneEnabled: (enabled: boolean) => {
    console.log('[RAGVoiceSlice] Microphone:', enabled ? 'enabled' : 'disabled');
    set({ voiceMicrophoneEnabled: enabled } as Partial<RAGVoiceState>);
  },

  setIsDesktop: (isDesktop: boolean) => {
    set({ voiceIsDesktop: isDesktop } as Partial<RAGVoiceState>);
  },

  setVolumeLevel: (level: number) => {
    // Clamp volume between 0 and 100
    const clamped = Math.max(0, Math.min(100, level));
    set({ voiceVolumeLevel: clamped } as Partial<RAGVoiceState>);
  },

  incrementRetryCount: () => {
    set((state) => {
      return {
        voiceConnection: {
          ...state.voiceConnection,
          retryCount: state.voiceConnection.retryCount + 1,
        },
      } as Partial<RAGVoiceState>;
    });
  },

  resetRetryCount: () => {
    set((state) => {
      return {
        voiceConnection: {
          ...state.voiceConnection,
          retryCount: 0,
        },
      } as Partial<RAGVoiceState>;
    });
  },
});
