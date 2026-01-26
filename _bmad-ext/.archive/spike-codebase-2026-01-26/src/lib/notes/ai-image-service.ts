/**
 * @fileoverview AI Image Generation Service
 * @module lib/notes/ai-image-service
 * @story 44-01: Image generation block type
 * @created 2026-01-13
 *
 * Provides AI-powered image generation using configured providers.
 * Supports Gemini Imagen and other compatible providers.
 */

import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

// ============================================================================
// Types
// ============================================================================

export interface AIImageOptions {
    /** Image width in pixels */
    width?: number;
    /** Image height in pixels */
    height?: number;
    /** Negative prompt to avoid certain elements */
    negativePrompt?: string;
    /** Style preset (if supported) */
    style?: 'photorealistic' | 'digital-art' | 'anime' | 'sketch';
    /** Number of images to generate */
    numberOfImages?: number;
}

export interface AIImageResult {
    success: boolean;
    /** Base64 encoded image data */
    imageBase64?: string;
    /** MIME type (e.g., 'image/png') */
    mimeType?: string;
    /** Image width */
    width?: number;
    /** Image height */
    height?: number;
    /** Error message if failed */
    error?: string;
}

// ============================================================================
// Image Generation Models
// ============================================================================

/** Models that support image generation */
const IMAGE_GENERATION_MODELS: Record<string, string[]> = {
    gemini: [
        'gemini-2.0-flash-preview-image-generation',
        'gemini-2.5-flash-image',
        'imagen-3.0-generate-002',
        'imagen-4.0-generate-001',
    ],
    openai: [
        'dall-e-3',
        'dall-e-2',
        'gpt-image-1',
    ],
};

/** Default image generation model per provider */
const DEFAULT_IMAGE_MODELS: Record<string, string> = {
    gemini: 'gemini-2.0-flash-preview-image-generation',
    openai: 'dall-e-3',
};

// ============================================================================
// Main Service
// ============================================================================

/**
 * Generate an AI image from a text prompt
 * 
 * @param prompt - Text description of the image to generate
 * @param options - Generation options (size, style, etc.)
 * @returns Generated image data or error
 */
export async function generateAIImage(
    prompt: string,
    options: AIImageOptions = {}
): Promise<AIImageResult> {
    try {
        // 0. Initialize credential vault
        await credentialVault.initialize();

        // 1. Get active agent for notes workspace
        const { getAgentForWorkspace, activeAgentId } = useAgentSelectionStore.getState();
        let activeAgent = getAgentForWorkspace('notes');

        // Fallback to global active agent
        if (!activeAgent && activeAgentId) {
            activeAgent = useAppStore.getState().getAgent(activeAgentId) || null;
        }

        // Fallback to any available agent
        if (!activeAgent) {
            const allAgents = useAppStore.getState().agents;
            if (allAgents.length > 0) {
                activeAgent = allAgents[0];
            }
        }

        if (!activeAgent) {
            return {
                success: false,
                error: 'No AI agent configured. Please create an agent in Settings > Agents.',
            };
        }

        // 2. Determine provider and model
        const providerId = activeAgent.providerId || 'gemini';
        
        // Get API key
        const apiKey = await credentialVault.getCredentials(providerId);
        if (!apiKey) {
            return {
                success: false,
                error: `No API key found for ${providerId}. Please add your API key in Settings.`,
            };
        }

        // 3. Check if provider supports image generation
        const supportedModels = IMAGE_GENERATION_MODELS[providerId];
        if (!supportedModels || supportedModels.length === 0) {
            return {
                success: false,
                error: `Provider ${providerId} does not support image generation.`,
            };
        }

        // Select the best available model
        const imageModel = DEFAULT_IMAGE_MODELS[providerId] || supportedModels[0];

        // 4. Build generation parameters
        const width = options.width || 1024;
        const height = options.height || 1024;
        const sizeString = `${width}x${height}`;

        // 5. Call provider-specific API
        if (providerId === 'gemini') {
            return await generateWithGemini(apiKey, imageModel, prompt, {
                width,
                height,
                negativePrompt: options.negativePrompt,
            });
        } else if (providerId === 'openai') {
            return await generateWithOpenAI(apiKey, imageModel, prompt, {
                size: sizeString,
            });
        } else {
            return {
                success: false,
                error: `Image generation not yet implemented for provider: ${providerId}`,
            };
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error during image generation';
        console.error('[AIImageService] Error:', error);
        return {
            success: false,
            error: message,
        };
    }
}

// ============================================================================
// Provider-Specific Implementations
// ============================================================================

/**
 * Generate image with Gemini/Imagen
 */
async function generateWithGemini(
    apiKey: string,
    model: string,
    prompt: string,
    options: { width?: number; height?: number; negativePrompt?: string }
): Promise<AIImageResult> {
    try {
        // Gemini Imagen API endpoint
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        const response = await fetch(`${endpoint}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: {
                    responseModalities: ['image', 'text'],
                    // Image generation parameters
                    ...(options.width && options.height ? {
                        imageWidth: options.width,
                        imageHeight: options.height,
                    } : {}),
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData?.error?.message || 
                `Gemini API error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();
        
        // Extract image from response
        const candidates = data.candidates || [];
        for (const candidate of candidates) {
            const parts = candidate.content?.parts || [];
            for (const part of parts) {
                if (part.inlineData?.mimeType?.startsWith('image/')) {
                    return {
                        success: true,
                        imageBase64: part.inlineData.data,
                        mimeType: part.inlineData.mimeType,
                        width: options.width,
                        height: options.height,
                    };
                }
            }
        }

        // No image found - try text response as fallback
        // Some models return a URL instead of inline data
        for (const candidate of candidates) {
            const parts = candidate.content?.parts || [];
            for (const part of parts) {
                if (part.text && part.text.includes('http')) {
                    // Extract URL from text (basic extraction)
                    const urlMatch = part.text.match(/https?:\/\/[^\s]+/);
                    if (urlMatch) {
                        // Fetch the image
                        const imageUrl = urlMatch[0];
                        const imageResponse = await fetch(imageUrl);
                        if (imageResponse.ok) {
                            const blob = await imageResponse.blob();
                            const base64 = await blobToBase64(blob);
                            return {
                                success: true,
                                imageBase64: base64,
                                mimeType: blob.type || 'image/png',
                                width: options.width,
                                height: options.height,
                            };
                        }
                    }
                }
            }
        }

        return {
            success: false,
            error: 'No image was generated. The model may not support image generation with the current parameters.',
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Gemini image generation failed';
        console.error('[AIImageService] Gemini error:', error);
        return {
            success: false,
            error: message,
        };
    }
}

/**
 * Generate image with OpenAI DALL-E
 */
async function generateWithOpenAI(
    apiKey: string,
    model: string,
    prompt: string,
    options: { size?: string }
): Promise<AIImageResult> {
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                prompt,
                n: 1,
                size: options.size || '1024x1024',
                response_format: 'b64_json', // Get base64 directly
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData?.error?.message || 
                `OpenAI API error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();
        const image = data.data?.[0];

        if (image?.b64_json) {
            const [width, height] = (options.size || '1024x1024').split('x').map(Number);
            return {
                success: true,
                imageBase64: image.b64_json,
                mimeType: 'image/png',
                width,
                height,
            };
        }

        // Handle URL response if base64 not available
        if (image?.url) {
            const imageResponse = await fetch(image.url);
            if (imageResponse.ok) {
                const blob = await imageResponse.blob();
                const base64 = await blobToBase64(blob);
                const [width, height] = (options.size || '1024x1024').split('x').map(Number);
                return {
                    success: true,
                    imageBase64: base64,
                    mimeType: blob.type || 'image/png',
                    width,
                    height,
                };
            }
        }

        return {
            success: false,
            error: 'No image was returned from OpenAI',
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'OpenAI image generation failed';
        console.error('[AIImageService] OpenAI error:', error);
        return {
            success: false,
            error: message,
        };
    }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Convert a Blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/png;base64,")
            const base64Data = base64.split(',')[1] || base64;
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
