/**
 * @fileoverview Adapter Error Classes
 * @module infrastructure/sync/adapters/adapter-errors
 *
 * Error classes for adapter-specific errors.
 * Provides type-safe error handling for storage operations.
 */

// ============================================================================
// Base Error Class
// ============================================================================

/**
 * Base error class for adapter-specific errors
 */
export class AdapterError extends Error {
  constructor(
    message: string,
    public readonly adapterName: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'AdapterError';
  }
}

// ============================================================================
// Specific Error Classes
// ============================================================================

/**
 * File not found error
 */
export class FileNotFoundError extends AdapterError {
  constructor(adapterName: string, path: string, cause?: Error) {
    super(`File not found: ${path}`, adapterName, 'NOT_FOUND', cause);
    this.name = 'FileNotFoundError';
  }
}

/**
 * Permission denied error
 */
export class PermissionDeniedError extends AdapterError {
  constructor(adapterName: string, path: string, cause?: Error) {
    super(`Permission denied: ${path}`, adapterName, 'PERMISSION_DENIED', cause);
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Quota exceeded error
 */
export class QuotaExceededError extends AdapterError {
  constructor(adapterName: string, required: number, available: number) {
    super(
      `Quota exceeded: required ${required} bytes, ${available} available`,
      adapterName,
      'QUOTA_EXCEEDED'
    );
    this.name = 'QuotaExceededError';
    this.required = required;
    this.available = available;
  }

  readonly required: number;
  readonly available: number;
}

/**
 * Adapter not ready error
 */
export class AdapterNotReadyError extends AdapterError {
  constructor(adapterName: string) {
    super(`Adapter not ready: ${adapterName}`, adapterName, 'NOT_READY');
    this.name = 'AdapterNotReadyError';
  }
}

// ============================================================================
// Type Guard Functions
// ============================================================================

/**
 * Check if error is an adapter error
 */
export function isAdapterError(error: unknown): error is AdapterError {
  return error instanceof AdapterError;
}

/**
 * Check if error is a permission denied error
 */
export function isPermissionDeniedError(error: unknown): error is PermissionDeniedError {
  return error instanceof PermissionDeniedError;
}

/**
 * Check if error is a quota exceeded error
 */
export function isQuotaExceededError(error: unknown): error is QuotaExceededError {
  return error instanceof QuotaExceededError;
}
