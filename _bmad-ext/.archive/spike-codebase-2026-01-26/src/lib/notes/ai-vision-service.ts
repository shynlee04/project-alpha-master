/**
 * @fileoverview AI Vision Service for Image Understanding
 * @module lib/notes/ai-vision-service
 * @story 44-02: Image understanding (vision) in blocks
 * @created 2026-01-13
 *
 * Provides image analysis capabilities using Gemini's vision API.
 * Features:
 * - Image description and analysis
 * - Text extraction (OCR)
 * - Object detection
 * - Question answering about images
 * - Multiple image comparison
 */

import { credentialVault } from '@/lib/agent/providers/credential-vault';

// ============================================================================
// Types
// ============================================================================

export interface VisionAnalysisOptions {
  /** Type of analysis to perform */
  analysisType: 'describe' | 'extract-text' | 'analyze' | 'question' | 'custom';
  /** Custom question to ask about the image */
  question?: string;
  /** Language for response */
  language?: 'en' | 'vi';
  /** Maximum tokens for response */
  maxTokens?: number;
}

export interface VisionAnalysisResult {
  success: boolean;
  content?: string;
  error?: string;
  analysisType: string;
  processingTimeMs?: number;
}

export interface ImageInput {
  /** Base64 encoded image data (without data URL prefix) */
  base64: string;
  /** MIME type of the image */
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
}

// ============================================================================
// Analysis Prompts
// ============================================================================

const ANALYSIS_PROMPTS = {
  describe: {
    en: `Analyze this image and provide a detailed description. Include:
1. Main subject or content
2. Key visual elements (colors, composition, style)
3. Any text visible in the image
4. Notable details or interesting aspects
5. Overall mood or atmosphere

Be thorough but concise.`,
    vi: `Phân tích hình ảnh này và mô tả chi tiết. Bao gồm:
1. Chủ đề hoặc nội dung chính
2. Các yếu tố hình ảnh quan trọng (màu sắc, bố cục, phong cách)
3. Bất kỳ văn bản nào hiển thị trong hình
4. Các chi tiết đáng chú ý hoặc khía cạnh thú vị
5. Tâm trạng hoặc không khí tổng thể

Hãy chi tiết nhưng súc tích.`,
  },
  'extract-text': {
    en: `Extract ALL text visible in this image. Preserve the original formatting and structure as much as possible. If there are multiple text areas, separate them clearly. If no text is found, state that clearly.`,
    vi: `Trích xuất TẤT CẢ văn bản có thể nhìn thấy trong hình ảnh này. Giữ nguyên định dạng và cấu trúc ban đầu càng nhiều càng tốt. Nếu có nhiều vùng văn bản, hãy phân tách chúng rõ ràng. Nếu không tìm thấy văn bản, hãy nói rõ điều đó.`,
  },
  analyze: {
    en: `Provide a comprehensive analysis of this image:

## Overview
Brief summary of what the image shows.

## Content Analysis
- Main elements and subjects
- Visual composition and layout
- Colors and styling
- Any text or symbols present

## Context & Interpretation
- Likely purpose or context of this image
- Key takeaways or important information
- Potential uses or applications

## Technical Details
- Image type (photo, diagram, screenshot, illustration, etc.)
- Quality assessment
- Any notable features

Be detailed and structured in your analysis.`,
    vi: `Cung cấp phân tích toàn diện về hình ảnh này:

## Tổng quan
Tóm tắt ngắn gọn về nội dung hình ảnh.

## Phân tích Nội dung
- Các yếu tố và chủ đề chính
- Bố cục và cách sắp xếp hình ảnh
- Màu sắc và phong cách
- Bất kỳ văn bản hoặc biểu tượng nào

## Bối cảnh & Diễn giải
- Mục đích hoặc bối cảnh có thể của hình ảnh
- Những điểm quan trọng cần lưu ý
- Các ứng dụng tiềm năng

## Chi tiết Kỹ thuật
- Loại hình ảnh (ảnh chụp, sơ đồ, ảnh chụp màn hình, minh họa, v.v.)
- Đánh giá chất lượng
- Bất kỳ tính năng đáng chú ý nào

Hãy chi tiết và có cấu trúc trong phân tích của bạn.`,
  },
};

// ============================================================================
// Main Service Function
// ============================================================================

/**
 * Analyze an image using Gemini's vision API
 * @story 44-02: Image understanding (vision) in blocks
 */
export async function analyzeImage(
  image: ImageInput,
  options: VisionAnalysisOptions
): Promise<VisionAnalysisResult> {
  const startTime = Date.now();
  const language = options.language || 'en';

  try {
    // Get API key from credential vault
    const apiKey = await credentialVault.getCredentials('gemini');
    if (!apiKey) {
      return {
        success: false,
        error: 'No Gemini API key configured. Please add your API key in Settings → Vault.',
        analysisType: options.analysisType,
      };
    }

    // Build the prompt based on analysis type
    let prompt: string;
    if (options.analysisType === 'question' && options.question) {
      prompt = options.question;
    } else if (options.analysisType === 'custom' && options.question) {
      prompt = options.question;
    } else {
      const prompts = ANALYSIS_PROMPTS[options.analysisType as keyof typeof ANALYSIS_PROMPTS];
      prompt = prompts ? prompts[language] : ANALYSIS_PROMPTS.describe[language];
    }

    // Call Gemini Vision API
    // Using gemini-2.0-flash for vision capabilities
    const modelId = 'gemini-2.0-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: image.mimeType,
                data: image.base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: options.maxTokens || 2048,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Vision] API error:', response.status, errorText);
      
      // Parse error for better message
      try {
        const errorData = JSON.parse(errorText);
        const message = errorData.error?.message || `API error: ${response.status}`;
        return {
          success: false,
          error: message,
          analysisType: options.analysisType,
        };
      } catch {
        return {
          success: false,
          error: `API error: ${response.status}`,
          analysisType: options.analysisType,
        };
      }
    }

    const data = await response.json();

    // Extract content from response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      return {
        success: false,
        error: 'No content in API response',
        analysisType: options.analysisType,
      };
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      success: true,
      content,
      analysisType: options.analysisType,
      processingTimeMs,
    };
  } catch (error) {
    console.error('[AI Vision] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      analysisType: options.analysisType,
    };
  }
}

/**
 * Analyze multiple images together (comparison, context, etc.)
 * @story 44-02: Multi-image analysis
 */
export async function analyzeMultipleImages(
  images: ImageInput[],
  question: string,
  options?: { language?: 'en' | 'vi'; maxTokens?: number }
): Promise<VisionAnalysisResult> {
  const startTime = Date.now();

  if (images.length === 0) {
    return {
      success: false,
      error: 'No images provided',
      analysisType: 'multi-image',
    };
  }

  if (images.length > 4) {
    return {
      success: false,
      error: 'Maximum 4 images allowed for comparison',
      analysisType: 'multi-image',
    };
  }

  try {
    const apiKey = await credentialVault.getCredentials('gemini');
    if (!apiKey) {
      return {
        success: false,
        error: 'No Gemini API key configured',
        analysisType: 'multi-image',
      };
    }

    // Build parts array with text and all images
    const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
      { text: question },
    ];

    for (const image of images) {
      parts.push({
        inline_data: {
          mime_type: image.mimeType,
          data: image.base64,
        },
      });
    }

    const modelId = 'gemini-2.0-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: options?.maxTokens || 2048,
        },
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status}`,
        analysisType: 'multi-image',
      };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return {
      success: true,
      content,
      analysisType: 'multi-image',
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      analysisType: 'multi-image',
    };
  }
}

/**
 * Convert a File object to base64 ImageInput
 */
export async function fileToImageInput(file: File): Promise<ImageInput> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve({
        base64,
        mimeType: file.type as ImageInput['mimeType'],
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a data URL to ImageInput
 */
export function dataUrlToImageInput(dataUrl: string): ImageInput {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:([^;]+)/);
  const mimeType = (mimeMatch?.[1] || 'image/png') as ImageInput['mimeType'];
  return { base64, mimeType };
}
