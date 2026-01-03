/**
 * Synthesis Store - Manages study material generation state
 *
 * UC1: Vault Population → Synthesis → Study Artifacts
 *
 * Provides reactive state for synthesis operations across the application.
 */

import { create } from 'zustand';
import type { SourceDocument } from '@/lib/knowledge/synthesis-types';
import type { ArtifactType } from '@/lib/knowledge/synthesis-types';
import { SynthesisService } from '@/lib/knowledge/synthesis-service';
import type { SynthesisResult, SynthesisOptions } from '@/lib/knowledge/synthesis-types';

// ============================================================
// Types
// ============================================================

export interface SynthesisProgress {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  error?: string;
}

export interface SynthesisRequest {
  id: string;
  sources: SourceDocument[];
  artifactType: ArtifactType;
  result?: SynthesisResult;
  createdAt: number;
}

export interface SynthesisStoreState {
  // State
  syntheses: SynthesisRequest[];
  activeSynthesisId: string | null;
  isSynthesizing: boolean;
  progress: SynthesisProgress;

  // Actions
  synthesize: (request: {
    sources: SourceDocument[];
    artifactType: ArtifactType;
    options?: SynthesisOptions;
  }) => Promise<SynthesisResult>;

  getSynthesis: (id: string) => SynthesisRequest | undefined;

  clearSynthesis: (id: string) => void;

  clearAll: () => void;

  reset: () => void;
}

// ============================================================
// Store
// ============================================================

export const useSynthesisStore = create<SynthesisStoreState>((set, get) => ({
  // Initial state
  syntheses: [],
  activeSynthesisId: null,
  isSynthesizing: false,
  progress: {
    status: 'idle',
    progress: 0,
    stage: '',
  },

  // Synthesize study materials from sources
  synthesize: async ({ sources, artifactType, options }) => {
    const synthesisId = crypto.randomUUID();

    // Create synthesis request
    const synthesisRequest: SynthesisRequest = {
      id: synthesisId,
      sources,
      artifactType,
      createdAt: Date.now(),
    };

    // Add to store
    set((state) => ({
      syntheses: [...state.syntheses, synthesisRequest],
      activeSynthesisId: synthesisId,
      isSynthesizing: true,
      progress: {
        status: 'processing',
        progress: 0,
        stage: 'Initializing synthesis...',
      },
    }));

    try {
      // Get synthesis service (with provider credentials)
      const service = await SynthesisService.create('gemini');

      // Configure progress callback
      const synthesisOptions: SynthesisOptions = {
        ...options,
        onProgress: (progress) => {
          set({
            progress: {
              status: progress.status as 'processing' | 'completed' | 'failed',
              progress: progress.progress,
              stage: progress.stage || '',
              error: progress.error,
            },
          });
        },
      };

      // Synthesize each source
      const results: SynthesisResult[] = [];

      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const sourceProgress = Math.floor((i / sources.length) * 100);

        synthesisOptions.onProgress?.({
          status: 'processing',
          progress: sourceProgress,
          stage: `Processing ${source.title} (${i + 1}/${sources.length})`,
        });

        const result = await service.synthesize(source, synthesisOptions);
        results.push(result);
      }

      // Combine results (for now, use the first result)
      const finalResult = results[0];

      // Update synthesis request with result
      set((state) => ({
        syntheses: state.syntheses.map((s) =>
          s.id === synthesisId
            ? { ...s, result: finalResult }
            : s
        ),
        isSynthesizing: false,
        progress: {
          status: 'completed',
          progress: 100,
          stage: 'Complete',
        },
      }));

      return finalResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update with error state
      set({
        isSynthesizing: false,
        progress: {
          status: 'failed',
          progress: 0,
          stage: 'Error',
          error: errorMessage,
        },
      });

      throw error;
    }
  },

  // Get synthesis by ID
  getSynthesis: (id: string) => {
    return get().syntheses.find((s) => s.id === id);
  },

  // Clear specific synthesis
  clearSynthesis: (id: string) => {
    set((state) => ({
      syntheses: state.syntheses.filter((s) => s.id !== id),
      activeSynthesisId: state.activeSynthesisId === id ? null : state.activeSynthesisId,
    }));
  },

  // Clear all syntheses
  clearAll: () => {
    set({
      syntheses: [],
      activeSynthesisId: null,
      isSynthesizing: false,
      progress: {
        status: 'idle',
        progress: 0,
        stage: '',
      },
    });
  },

  // Reset to initial state
  reset: () => {
    set({
      syntheses: [],
      activeSynthesisId: null,
      isSynthesizing: false,
      progress: {
        status: 'idle',
        progress: 0,
        stage: '',
      },
    });
  },
}));
