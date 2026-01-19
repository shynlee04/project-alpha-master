/**
 * @fileoverview AI Storyboard Generation Service
 * @module lib/notes/ai-storyboard-service
 * @story 44-03: Sequential multi-image storyboard
 * @created 2026-01-14
 *
 * Generates sequential visual storyboards from a single prompt.
 * Features:
 * - AI-powered frame description generation
 * - Sequential image generation with progress tracking
 * - Multi-frame storyboard display
 * - Regeneration support for individual frames
 */

import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { generateAIImage } from '@/lib/notes/ai-image-service';

// ============================================================================
// Types
// ============================================================================

export interface StoryboardFrame {
  /** Frame number (1-indexed) */
  frameNumber: number;
  /** Scene description for this frame */
  description: string;
  /** Generated image base64 data (null if not yet generated) */
  imageBase64: string | null;
  /** Image MIME type */
  mimeType: string;
  /** Generation status */
  status: 'pending' | 'generating' | 'done' | 'error';
  /** Error message if failed */
  errorMessage?: string;
}

export interface StoryboardOptions {
  /** Number of frames to generate (default: 3, max: 6) */
  frameCount?: number;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** Language for descriptions */
  language?: 'en' | 'vi';
  /** Style preset for images */
  style?: 'photorealistic' | 'digital-art' | 'anime' | 'sketch';
}

export interface StoryboardResult {
  success: boolean;
  /** Original prompt */
  prompt: string;
  /** Generated frames */
  frames: StoryboardFrame[];
  /** Error message if failed */
  error?: string;
  /** Total processing time in ms */
  totalTimeMs?: number;
}

// ============================================================================
// Frame Description Generation
// ============================================================================

/**
 * Generate frame descriptions from a story prompt
 * @story 44-03: Sequential multi-image storyboard
 */
async function generateFrameDescriptions(
  prompt: string,
  frameCount: number,
  language: 'en' | 'vi'
): Promise<string[]> {
  const apiKey = await credentialVault.getCredentials('gemini');
  if (!apiKey) {
    throw new Error('No Gemini API key configured');
  }

  const modelId = 'gemini-2.0-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const systemPrompt = language === 'vi'
    ? `Bạn là một chuyên gia tạo kịch bản truyện tranh. Từ một mô tả ngắn, tạo ra ${frameCount} cảnh tuần tự cho một truyện tranh hoặc storyboard.

Yêu cầu:
1. Mỗi cảnh phải mô tả một khoảnh khắc cụ thể trong câu chuyện
2. Các cảnh phải liên kết logic với nhau (bắt đầu, phát triển, kết thúc)
3. Mỗi mô tả phải đủ chi tiết để tạo ra một hình ảnh AI
4. Không đánh số cảnh, chỉ cần mô tả

Trả về JSON array chỉ với các mô tả, không có gì khác.`
    : `You are a comic storyboard expert. From a brief description, create ${frameCount} sequential frames for a comic or storyboard.

Requirements:
1. Each frame must describe a specific moment in the story
2. Frames must flow logically (beginning, middle, end)
3. Each description must be detailed enough for AI image generation
4. Do not number frames, just describe

Return ONLY a JSON array with descriptions, nothing else.`;

  const userPrompt = `Prompt: "${prompt}"

Create ${frameCount} sequential storyboard frame descriptions.`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: systemPrompt },
          { text: userPrompt },
        ],
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('No content in API response');
  }

  // Parse JSON array from response
  try {
    // Try to extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, frameCount);
      }
    }
    // Fallback: try to parse the whole content
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, frameCount);
    }
    throw new Error('Invalid JSON format');
  } catch (e) {
    // If parsing fails, try to split by newlines and filter
    const lines: string[] = content.split('\n')
      .filter((line: string) => line.trim().length > 20)
      .map((line: string) => line.replace(/^["'\d.\-\s]+/, '').replace(/["',]+$/, ''));
    return lines.slice(0, frameCount);
  }
}

// ============================================================================
// Main Storyboard Generation Function
// ============================================================================

/**
 * Generate a sequential storyboard from a prompt
 * @story 44-03: Sequential multi-image storyboard
 */
export async function generateStoryboard(
  prompt: string,
  options?: StoryboardOptions
): Promise<StoryboardResult> {
  const startTime = Date.now();
  const frameCount = Math.min(options?.frameCount || 3, 6);
  const language = options?.language || 'en';
  const width = options?.width || 1024;
  const height = options?.height || 1024;

  try {
    // Step 1: Generate frame descriptions
    const frameDescriptions = await generateFrameDescriptions(prompt, frameCount, language);

    // Initialize frames with descriptions
    const frames: StoryboardFrame[] = frameDescriptions.map((desc, index) => ({
      frameNumber: index + 1,
      description: desc,
      imageBase64: null,
      mimeType: 'image/png',
      status: 'pending' as const,
    }));

    // Step 2: Generate images sequentially
    for (let i = 0; i < frames.length; i++) {
      frames[i].status = 'generating';

      try {
        const result = await generateAIImage(frames[i].description, {
          width,
          height,
          style: options?.style,
          numberOfImages: 1,
        });

        if (result.success && result.imageBase64) {
          frames[i].imageBase64 = result.imageBase64;
          frames[i].mimeType = result.mimeType || 'image/png';
          frames[i].status = 'done';
        } else {
          throw new Error(result.error || 'Image generation failed');
        }
      } catch (error) {
        frames[i].status = 'error';
        frames[i].errorMessage = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    const totalTimeMs = Date.now() - startTime;

    return {
      success: true,
      prompt,
      frames,
      totalTimeMs,
    };
  } catch (error) {
    return {
      success: false,
      prompt,
      frames: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Regenerate a single frame in an existing storyboard
 */
export async function regenerateFrame(
  frame: StoryboardFrame,
  options?: { width?: number; height?: number; style?: StoryboardOptions['style'] }
): Promise<StoryboardFrame> {
  try {
    const result = await generateAIImage(frame.description, {
      width: options?.width || 1024,
      height: options?.height || 1024,
      style: options?.style,
      numberOfImages: 1,
    });

    if (result.success && result.imageBase64) {
      return {
        ...frame,
        imageBase64: result.imageBase64,
        mimeType: result.mimeType || 'image/png',
        status: 'done',
        errorMessage: undefined,
      };
    } else {
      throw new Error(result.error || 'Image generation failed');
    }
  } catch (error) {
    return {
      ...frame,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a single new frame and insert at position
 */
export async function generateAdditionalFrame(
  prompt: string,
  position: number,
  options?: StoryboardOptions
): Promise<StoryboardFrame> {
  const language = options?.language || 'en';

  // Generate description for the new frame
  const descriptions = await generateFrameDescriptions(prompt, 1, language);
  const description = descriptions[0] || prompt;

  const width = options?.width || 1024;
  const height = options?.height || 1024;

  try {
    const result = await generateAIImage(description, {
      width,
      height,
      style: options?.style,
      numberOfImages: 1,
    });

    if (result.success && result.imageBase64) {
      return {
        frameNumber: position,
        description,
        imageBase64: result.imageBase64,
        mimeType: result.mimeType || 'image/png',
        status: 'done' as const,
      };
    } else {
      throw new Error(result.error || 'Image generation failed');
    }
  } catch (error) {
    return {
      frameNumber: position,
      description,
      imageBase64: '',
      mimeType: 'image/png',
      status: 'error' as const,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}