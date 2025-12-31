/**
 * LLM Provider Entity (Domain Layer)
 * Single source of truth for provider configuration
 */

export interface LLMProvider {
  // Identity
  id: string;
  name: string;
  providerType: 'openai' | 'anthropic' | 'google' | 'openrouter' | 'custom';

  // Configuration
  baseUrl: string;
  isHardcoded: boolean;  // TRUE for built-in providers (readonly URL)
  apiKey: string;        // Encrypted in storage
  isEnabled: boolean;

  // Models
  models: ProviderModel[];

  // Capabilities
  capabilities: ProviderCapabilities;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderModel {
  id: string;
  name: string;
  providerId: string;          // Foreign key to LLMProvider

  // Token limits
  contextWindow: number;
  maxOutputTokens: number;

  // Modalities
  inputModalities: Modality[];
  outputModalities: Modality[];

  // Capabilities
  isEnabled: boolean;

  // Optional pricing info
  pricing?: {
    promptPer1M: number;
    completionPer1M: number;
  };
}

export interface ProviderCapabilities {
  streaming: boolean;
  functionCalling: boolean;
  vision: boolean;
  embeddings: boolean;
}

export type Modality = 'text' | 'image' | 'audio' | 'video' | 'code';
