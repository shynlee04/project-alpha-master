/**
 * @fileoverview AI Video Understanding Service
 * @module lib/notes/ai-video-service
 * @story 44-04: Video input understanding
 * @created 2026-01-14
 *
 * Provides video analysis capabilities using Gemini's vision API.
 * Features:
 * - Video file handling
 * - Frame extraction for analysis
 * - Video content summarization
 * - Scene detection and description
 * - Timestamped content analysis
 */

import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

export interface VideoAnalysisOptions {
  /** Analysis type */
  analysisType: 'describe' | 'summary' | 'key-scenes' | 'transcribe' | 'custom';
  /** Number of frames to extract for analysis */
  frameCount?: number;
  /** Custom question about the video */
  customQuestion?: string;
  /** Language for response */
  language?: 'en' | 'vi';
  /** Maximum tokens for response */
  maxTokens?: number;
}

export interface VideoAnalysisResult {
  success: boolean;
  content?: string;
  extractedFrames?: ExtractedFrame[];
  error?: string;
  analysisType: string;
  processingTimeMs?: number;
}

export interface ExtractedFrame {
  timestamp: number; // in seconds
  base64: string;
  mimeType: 'image/jpeg' | 'image/png';
  description?: string;
}

export interface VideoInput {
  videoFile: File;
  previewUrl: string;
}

// ============================================================================
// Frame Extraction
// ============================================================================

/**
 * Extract frames from video file for analysis
 */
export async function extractFramesFromVideo(
  videoFile: File,
  frameCount: number = 5
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoFile);
      video.muted = true;
      video.playsInline = true;

      video.addEventListener('loadedmetadata', () => {
        const duration = video.duration;
        const frames: ExtractedFrame[] = [];
        let extractedCount = 0;

        // Canvas for frame capture
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D context'));
          return;
        }

        const extractFrame = (timestamp: number) => {
          video.currentTime = timestamp;
        };

        video.addEventListener('seeked', () => {
          if (extractedCount >= frameCount) {
            URL.revokeObjectURL(video.src);
            resolve(frames);
            return;
          }

          // Draw current frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to base64
          const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          
          const timestamp = (duration / (frameCount + 1)) * (extractedCount + 1);
          frames.push({
            timestamp: Math.round(timestamp * 10) / 10,
            base64,
            mimeType: 'image/jpeg',
          });

          extractedCount++;
          extractFrame((duration / (frameCount + 1)) * (extractedCount + 1));
        });

        // Start extraction
        extractFrame((duration / (frameCount + 1)));
      });

      video.addEventListener('error', () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video file'));
      });
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// Video Analysis Using AI Vision Service
// ============================================================================

/**
 * Analyze video by asking AI to interpret the extracted frames
 * Note: This uses the existing ai-vision-service with a special prompt
 */
import { credentialVault } from '@/lib/agent/providers/credential-vault';

async function analyzeVideoFrames(
  frames: ExtractedFrame[],
  analysisType: VideoAnalysisOptions['analysisType'],
  customQuestion?: string,
  language: 'en' | 'vi' = 'en'
): Promise<{ content: string }> {
  const apiKey = await credentialVault.getCredentials('gemini');
  if (!apiKey) {
    throw new Error('No Gemini API key configured');
  }

  const modelId = 'gemini-2.0-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  // Build prompt based on analysis type
  let prompt: string;
  const frameCount = frames.length;

  if (analysisType === 'custom' && customQuestion) {
    prompt = customQuestion;
  } else if (analysisType === 'describe') {
    prompt = language === 'vi'
      ? `Phân tích các khung hình này (tổng cộng ${frameCount} khung) được trích xuất từ một video. Mỗi khung hình đại diện cho một thời điểm khác nhau trong video.

Cung cấp mô tả chi tiết về nội dung video bao gồm:
1. Chủ đề chính của video
2. Các sự kiện hoặc hoạt động chính
3. Cảnh quan/khu vực xuất hiện
4. Sự thay đổi giữa các khung hình (di chuyển, biến đổi)
5. Nhận xét về phong cách hoặc định dạng

Hãy mô tả video một cách thú vị và đầy đủ.`
      : `Analyze these ${frameCount} frames extracted from a video. Each frame represents a different moment in the video.

Provide a detailed description of the video including:
1. Main subject or topic
2. Key events or actions happening
3. Any locations or settings
4. Changes between frames (movement, transitions)
5. Any observations about style or format

Describe the video in an engaging and comprehensive way.`;
  } else if (analysisType === 'summary') {
    prompt = language === 'vi'
      ? `Tóm tắt nội dung của video này từ ${frameCount} khung hình được trích xuất.

Cung cấp:
1. Tóm tắt ngắn gọn (2-3 câu)
2. Các điểm chính
3. Bối cảnh hoặc ngữ cảnh (nếu có thể xác định)`
      : `Summarize the content of this video based on ${frameCount} extracted frames.

Provide:
1. Brief summary (2-3 sentences)
2. Key points
3. Context or setting (if identifiable)`;
  } else if (analysisType === 'key-scenes') {
    prompt = language === 'vi'
      ? `Phân tích các khung hình này để xác định các cảnh quan trọng trong video. Có ${frameCount} khung hình.

For each frame, identify:
1. Nội dung của cảnh
2. Tất cả các mốc thời gian ước tính (tổng thời gian video giả định là ${frames.length * 3} giây nếu không có dữ liệu)
3. Tại sao cảnh này quan trọng

Format as a numbered list of key scenes.`
      : `Analyze these frames to identify the key scenes or moments in this video. There are ${frameCount} frames.

For each frame, identify:
1. What the scene shows
2. Approximate timestamp (assuming totalTime is ${frames.length * 3} seconds if no data)
3. Why this scene is important

Format as a numbered list of key scenes.`;
  } else if (analysisType === 'transcribe') {
    prompt = language === 'vi'
      ? `Xem các khung hình này từ video và xác định nếu có bất kỳ văn bản nào hiển thị (phụ đề, chú thích, màn hình, bảng điều khiển, v.v.).

Ghi lại:
1. Tất cả văn bản có thể đọc được
2. Vị trí văn bản trong khung hình
3. Bối cảnh của văn bản (nếu rõ ràng)`
      : `Look at these video frames and identify if there's any visible text (subtitles, captions, on-screen text, UI, charts, etc.).

Record:
1. Any readable text
2. Location of text in frame
3. Context of the text (if clear)`;
  } else {
    prompt = customQuestion || 'Describe what is shown in these video frames.';
  }

  // Build parts array with prompt and frames
  const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
    { text: prompt },
  ];

  // Add each frame
  for (const frame of frames) {
    parts.push({
      text: `\n\nFrame at ${frame.timestamp}s:`,
    });
    parts.push({
      inline_data: {
        mime_type: frame.mimeType,
        data: frame.base64,
      },
    });
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('No content in AI response');
  }

  return { content };
}

// ============================================================================
// Main Video Analysis Function
// ============================================================================

/**
 * Analyze video content
 * @story 44-04: Video input understanding
 */
export async function analyzeVideo(
  videoFile: File,
  options?: VideoAnalysisOptions
): Promise<VideoAnalysisResult> {
  const startTime = Date.now();
  const language = options?.language || 'en';
  const frameCount = options?.frameCount || 5;

  try {
    toast.info('Extracting frames from video...');
    const extractedFrames = await extractFramesFromVideo(videoFile, frameCount);

    toast.info('Analyzing video content...');
    const analysisResult = await analyzeVideoFrames(
      extractedFrames,
      options?.analysisType || 'describe',
      options?.customQuestion,
      language
    );

    const processingTimeMs = Date.now() - startTime;

    return {
      success: true,
      content: analysisResult.content,
      extractedFrames,
      analysisType: options?.analysisType || 'describe',
      processingTimeMs,
    };
  } catch (error) {
    console.error('[Video Service] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      analysisType: options?.analysisType || 'describe',
    };
  }
}

/**
 * Create video preview URL from file
 */
export function createVideoPreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}