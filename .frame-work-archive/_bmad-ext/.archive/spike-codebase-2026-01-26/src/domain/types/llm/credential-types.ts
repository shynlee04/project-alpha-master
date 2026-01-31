/**
 * @fileoverview Credential Type Definitions
 * @module domain/types/llm/credential-types
 *
 * Canonical type definitions for API credentials and storage.
 * Single source of truth for credential-related types.
 *
 * @ epic EPIC-GU
 * @ story GU-A-01 - Unify Provider Type Definitions
 * @created 2026-01-09
 */

/**
 * Stored credentials (encrypted)
 *
 * Represents an API key stored in encrypted format.
 * Used by the credential vault for secure key storage.
 */
export interface StoredCredential {
  /** Provider ID */
  providerId: string;

  /** Encrypted API key (base64) */
  encrypted: string;

  /** Initialization vector (base64) */
  iv: string;

  /** When credential was stored */
  createdAt: Date;
}

/**
 * API Key Configuration
 *
 * Configuration for storing API keys with optional metadata.
 */
export interface ApiKeyConfig {
  /** Provider ID this key is for */
  providerId: string;

  /** The API key (plaintext - only in memory) */
  apiKey: string;

  /** Optional custom headers for the provider */
  headers?: Record<string, string>;

  /** Optional base URL override */
  baseURL?: string;

  /** Whether this key should be validated immediately */
  validate?: boolean;
}

/**
 * Credential Storage Interface
 *
 * Defines the contract for credential storage operations.
 * Implemented by credential-vault.ts.
 */
export interface CredentialStorage {
  /** Store a credential */
  store(credential: StoredCredential): Promise<void>;

  /** Retrieve a credential */
  retrieve(providerId: string): Promise<StoredCredential | null>;

  /** Delete a credential */
  delete(providerId: string): Promise<void>;

  /** Check if a credential exists */
  has(providerId: string): Promise<boolean>;

  /** List all provider IDs with stored credentials */
  list(): Promise<string[]>;
}
