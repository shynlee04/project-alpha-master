/**
 * @fileoverview Audio Storage (IndexedDB)
 * @module lib/audio/audio-storage
 * @governance EPIC-10-3
 *
 * Stores generated audio blobs and metadata in IndexedDB for offline playback.
 *
 * Story 10.3: Audio Overview Generator
 */

import Dexie, { Table } from 'dexie';

export interface StoredAudio {
  id?: number;
  sourceId: string;
  sourceTitle: string;
  audioBlob: Blob;
  transcript: string;
  duration: number;
  language: 'en' | 'vi';
  voiceName: string;
  generatedAt: number;
  playedCount: number;
  lastPlayedAt?: number;
}

export interface AudioMetadata {
  id: number;
  sourceId: string;
  sourceTitle: string;
  transcript: string;
  duration: number;
  language: 'en' | 'vi';
  voiceName: string;
  generatedAt: number;
  playedCount: number;
  lastPlayedAt?: number;
  audioUrl: string;
}

/**
 * Audio database class
 */
class AudioDatabase extends Dexie {
  audio!: Table<StoredAudio, number>;

  constructor() {
    super('ViaGentAudioDB');

    // Define schema
    this.version(1).stores({
      audio: '++id, sourceId, sourceTitle, generatedAt, playedCount, language',
    });
  }
}

// Singleton instance
let dbInstance: AudioDatabase | null = null;

/**
 * Get audio database instance
 */
function getDb(): AudioDatabase {
  if (!dbInstance) {
    dbInstance = new AudioDatabase();
  }
  return dbInstance;
}

/**
 * Store generated audio in IndexedDB
 *
 * @param audio - Generated audio data
 * @returns Stored audio ID
 */
export async function storeAudio(audio: {
  sourceId: string;
  sourceTitle: string;
  audioBlob: Blob;
  transcript: string;
  duration: number;
  language: 'en' | 'vi';
  voiceName: string;
}): Promise<number> {
  const db = getDb();

  const storedAudio: StoredAudio = {
    sourceId: audio.sourceId,
    sourceTitle: audio.sourceTitle,
    audioBlob: audio.audioBlob,
    transcript: audio.transcript,
    duration: audio.duration,
    language: audio.language,
    voiceName: audio.voiceName,
    generatedAt: Date.now(),
    playedCount: 0,
  };

  const id = await db.audio.add(storedAudio);
  return id;
}

/**
 * Retrieve audio by ID
 *
 * @param id - Audio ID
 * @returns Audio data with blob URL
 */
export async function getAudio(id: number): Promise<AudioMetadata | null> {
  const db = getDb();

  const stored = await db.audio.get(id);
  if (!stored) {
    return null;
  }

  // Create object URL from blob
  const audioUrl = URL.createObjectURL(stored.audioBlob);

  return {
    id: stored.id!,
    sourceId: stored.sourceId,
    sourceTitle: stored.sourceTitle,
    transcript: stored.transcript,
    duration: stored.duration,
    language: stored.language,
    voiceName: stored.voiceName,
    generatedAt: stored.generatedAt,
    playedCount: stored.playedCount,
    lastPlayedAt: stored.lastPlayedAt,
    audioUrl,
  };
}

/**
 * Retrieve audio by source ID
 *
 * @param sourceId - Source ID
 * @returns Audio data with blob URL or null
 */
export async function getAudioBySourceId(sourceId: string): Promise<AudioMetadata | null> {
  const db = getDb();

  const stored = await db.audio.where('sourceId').equals(sourceId).first();
  if (!stored) {
    return null;
  }

  const audioUrl = URL.createObjectURL(stored.audioBlob);

  return {
    id: stored.id!,
    sourceId: stored.sourceId,
    sourceTitle: stored.sourceTitle,
    transcript: stored.transcript,
    duration: stored.duration,
    language: stored.language,
    voiceName: stored.voiceName,
    generatedAt: stored.generatedAt,
    playedCount: stored.playedCount,
    lastPlayedAt: stored.lastPlayedAt,
    audioUrl,
  };
}

/**
 * List all stored audio
 *
 * @param options - Query options
 * @returns Array of audio metadata (without blobs)
 */
export async function listAudio(options?: {
  limit?: number;
  orderBy?: 'generatedAt' | 'playedCount';
  language?: 'en' | 'vi';
}): Promise<Omit<AudioMetadata, 'audioUrl'>[]> {
  const db = getDb();

  let query = db.audio.toCollection();

  // Apply language filter
  if (options?.language) {
    query = db.audio.where('language').equals(options.language);
  }

  // Apply ordering
  if (options?.orderBy === 'generatedAt') {
    query = query.reverse(); // Newest first
  } else if (options?.orderBy === 'playedCount') {
    query = db.audio.orderBy('playedCount').reverse();
  }

  // Apply limit
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const results = await query.toArray();

  return results.map((stored) => ({
    id: stored.id!,
    sourceId: stored.sourceId,
    sourceTitle: stored.sourceTitle,
    transcript: stored.transcript,
    duration: stored.duration,
    language: stored.language,
    voiceName: stored.voiceName,
    generatedAt: stored.generatedAt,
    playedCount: stored.playedCount,
    lastPlayedAt: stored.lastPlayedAt,
    audioUrl: '', // Empty URL for list view
  }));
}

/**
 * Update play count and last played timestamp
 *
 * @param id - Audio ID
 */
export async function markAsPlayed(id: number): Promise<void> {
  const db = getDb();

  // Workaround for Dexie v9: fetch current value, increment, update
  const audio = await db.audio.get(id);
  if (audio) {
    await db.audio.update(id, {
      playedCount: (audio.playedCount || 0) + 1,
      lastPlayedAt: Date.now(),
    });
  }
}

/**
 * Delete audio by ID
 *
 * @param id - Audio ID
 */
export async function deleteAudio(id: number): Promise<void> {
  const db = getDb();

  const stored = await db.audio.get(id);
  if (stored) {
    // Revoke object URL if exists
    // Note: We can't revoke URLs from previous sessions, only current session
    // Users should revoke URLs when done with audio player component
  }

  await db.audio.delete(id);
}

/**
 * Delete audio by source ID
 *
 * @param sourceId - Source ID
 */
export async function deleteAudioBySourceId(sourceId: string): Promise<void> {
  const db = getDb();

  await db.audio.where('sourceId').equals(sourceId).delete();
}

/**
 * Clear all stored audio
 */
export async function clearAllAudio(): Promise<void> {
  const db = getDb();

  await db.audio.clear();
}

/**
 * Get storage statistics
 *
 * @returns Storage usage stats
 */
export async function getStorageStats(): Promise<{
  totalAudio: number;
  totalDuration: number;
  estimatedSizeBytes: number;
}> {
  const db = getDb();

  const allAudio = await db.audio.toArray();

  const totalDuration = allAudio.reduce((sum, audio) => sum + audio.duration, 0);

  // Estimate size from blob sizes
  const estimatedSizeBytes = allAudio.reduce((sum, audio) => {
    return sum + (audio.audioBlob?.size || 0);
  }, 0);

  return {
    totalAudio: allAudio.length,
    totalDuration,
    estimatedSizeBytes,
  };
}
