/**
 * @fileoverview Error Classification for Retry Eligibility
 * @module lib/utils/error-classification
 * @governance RC-015
 *
 * Classifies errors by their retry eligibility:
 * - RETRYABLE: Can be retried with exponential backoff
 * - NON_RETRYABLE: Should not be retried (will fail again)
 * - FATAL: Critical errors that require intervention
 *
 * @story rc-015-retry-classification
 * @priority HIGH (HIGH-012)
 */

import type { SyncError } from '../filesystem/sync-types';
import type { ToolError } from '../agent/tools/tool-error';

// ============================================================================
// Types
// ============================================================================

/**
 * Error classification for retry eligibility
 */
export type RetryClass = 'RETRYABLE' | 'NON_RETRYABLE' | 'FATAL';

/**
 * Error classifier interface
 */
export interface ErrorClassifier {
    classify(error: Error | unknown): RetryClass;
}

/**
 * Rule for matching and classifying errors
 */
export interface ErrorClassificationRule {
    /** Unique rule name for debugging */
    name: string;
    /** Check if this rule matches the error */
    matches(error: Error | unknown): boolean;
    /** Classification when rule matches */
    classification: RetryClass;
    /** Priority - higher values checked first */
    priority?: number;
}

/**
 * Classification result with metadata
 */
export interface ClassificationResult {
    classification: RetryClass;
    rule: string;
    reason: string;
}

// ============================================================================
// Built-in Classification Rules
// ============================================================================

/**
 * Check if error is a network-related error
 */
function isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        const name = error.name.toLowerCase();
        return (
            msg.includes('failed to fetch') ||
            msg.includes('networkerror') ||
            msg.includes('network error') ||
            msg.includes('econnrefused') ||
            msg.includes('enotfound') ||
            msg.includes('etimedout') ||
            name === 'networkerror' ||
            name === 'typeerror' && msg.includes('fetch')
        );
    }
    return false;
}

/**
 * Check if error is a timeout error
 */
function isTimeoutError(error: unknown): boolean {
    if (error instanceof Error) {
        return (
            error.message.includes('timeout') ||
            error.message.includes('timed out') ||
            error.message.includes('ETIMEDOUT') ||
            error.name === 'TimeoutError' ||
            error.name === 'TimeoutError'
        );
    }
    return false;
}

/**
 * Check if error is rate limit related
 */
function isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return (
            msg.includes('rate limit') ||
            msg.includes('too many requests') ||
            msg.includes('429') ||
            msg.includes('rate_limit_exceeded')
        );
    }
    return false;
}

/**
 * Check if error is service unavailable
 */
function isServiceUnavailable(error: unknown): boolean {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return (
            msg.includes('service unavailable') ||
            msg.includes('503') ||
            msg.includes('bad gateway') ||
            msg.includes('gateway timeout')
        );
    }
    return false;
}

/**
 * Check if error is permission denied
 */
function isPermissionError(error: unknown): boolean {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return (
            msg.includes('permission denied') ||
            msg.includes('not allowed') ||
            msg.includes('notauthorized') ||
            msg.includes('authorization failed') ||
            error.name === 'NotAllowedError' ||
            msg.includes('access denied')
        );
    }
    return false;
}

/**
 * Check if error is file not found
 */
function isNotFoundError(error: unknown): boolean {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return (
            msg.includes('not found') ||
            msg.includes('does not exist') ||
            msg.includes("doesn't exist") ||
            msg.includes('enoent') ||
            msg.includes('404') ||
            msg.includes('file not found')
        );
    }
    return false;
}

/**
 * Check if error is invalid input
 */
function isInvalidInputError(error: unknown): boolean {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return (
            msg.includes('invalid') &&
            (msg.includes('input') || msg.includes('argument') || msg.includes('parameter')) ||
            msg.includes('validation error') ||
            msg.includes('malformed') ||
            msg.includes('schema violation')
        );
    }
    return false;
}

/**
 * Check if error is data corruption
 */
function isDataCorruptionError(error: unknown): boolean {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return (
            msg.includes('data corruption') ||
            msg.includes('checksum failed') ||
            msg.includes('integrity check failed') ||
            msg.includes('corrupted') ||
            msg.includes('invalid checksum')
        );
    }
    return false;
}

/**
 * Check if error is security violation
 */
function isSecurityViolationError(error: unknown): boolean {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return (
            msg.includes('security') ||
            msg.includes('authentication') &&
            (msg.includes('failed') || msg.includes('invalid')) ||
            msg.includes('csrf') ||
            msg.includes('xss') ||
            msg.includes('injection') ||
            msg.includes('forbidden') ||
            msg.includes('403')
        );
    }
    return false;
}

// ============================================================================
// Error Classification Registry
// ============================================================================

/**
 * Registry for error classification rules
 */
export class ErrorClassificationRegistry {
    private rules: ErrorClassificationRule[] = [];
    private defaultClass: RetryClass = 'NON_RETRYABLE';

    constructor() {
        // Register built-in rules
        this.registerBuiltInRules();
    }

    /**
     * Register built-in classification rules
     */
    private registerBuiltInRules(): void {
        // FATAL errors - highest priority (checked first)
        this.rules.push(
            {
                name: 'DATA_CORRUPTION',
                matches: isDataCorruptionError,
                classification: 'FATAL',
                priority: 100,
            },
            {
                name: 'SECURITY_VIOLATION',
                matches: isSecurityViolationError,
                classification: 'FATAL',
                priority: 99,
            }
        );

        // NON_RETRYABLE errors
        this.rules.push(
            {
                name: 'PERMISSION_DENIED',
                matches: isPermissionError,
                classification: 'NON_RETRYABLE',
                priority: 80,
            },
            {
                name: 'NOT_FOUND',
                matches: isNotFoundError,
                classification: 'NON_RETRYABLE',
                priority: 79,
            },
            {
                name: 'INVALID_INPUT',
                matches: isInvalidInputError,
                classification: 'NON_RETRYABLE',
                priority: 78,
            }
        );

        // RETRYABLE errors
        this.rules.push(
            {
                name: 'NETWORK_ERROR',
                matches: isNetworkError,
                classification: 'RETRYABLE',
                priority: 60,
            },
            {
                name: 'TIMEOUT',
                matches: isTimeoutError,
                classification: 'RETRYABLE',
                priority: 59,
            },
            {
                name: 'RATE_LIMIT',
                matches: isRateLimitError,
                classification: 'RETRYABLE',
                priority: 58,
            },
            {
                name: 'SERVICE_UNAVAILABLE',
                matches: isServiceUnavailable,
                classification: 'RETRYABLE',
                priority: 57,
            }
        );

        // Sort by priority (highest first)
        this.rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }

    /**
     * Register a custom classification rule
     */
    register(rule: ErrorClassificationRule): void {
        this.rules.unshift(rule); // Add to beginning for higher priority
        // Re-sort by priority
        this.rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }

    /**
     * Unregister a rule by name
     */
    unregister(name: string): boolean {
        const index = this.rules.findIndex((r) => r.name === name);
        if (index !== -1) {
            this.rules.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Classify an error
     */
    classify(error: Error | unknown): ClassificationResult {
        // Normalize error
        const normalizedError = error instanceof Error ? error : new Error(String(error));

        for (const rule of this.rules) {
            if (rule.matches(normalizedError)) {
                return {
                    classification: rule.classification,
                    rule: rule.name,
                    reason: `Matched rule: ${rule.name}`,
                };
            }
        }

        // Default classification (conservative)
        return {
            classification: this.defaultClass,
            rule: 'DEFAULT',
            reason: 'No rule matched, defaulting to NON_RETRYABLE',
        };
    }

    /**
     * Check if an error is retryable (simple boolean)
     */
    isRetryable(error: Error | unknown): boolean {
        const result = this.classify(error);
        return result.classification === 'RETRYABLE';
    }

    /**
     * Set default classification for unmatched errors
     */
    setDefaultClass(classification: RetryClass): void {
        this.defaultClass = classification;
    }

    /**
     * Get all registered rules
     */
    getRules(): ErrorClassificationRule[] {
        return [...this.rules];
    }

    /**
     * Clear all custom rules (keep only built-in)
     */
    clearCustomRules(): void {
        const builtInNames = ['DATA_CORRUPTION', 'SECURITY_VIOLATION', 'PERMISSION_DENIED', 'NOT_FOUND', 'INVALID_INPUT', 'NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT', 'SERVICE_UNAVAILABLE'];
        this.rules = this.rules.filter((r) => builtInNames.includes(r.name));
    }
}

// ============================================================================
// SyncError Classification
// ============================================================================

/**
 * Classification rules for SyncError types
 */
const SYNC_ERROR_CLASSIFICATIONS: Record<string, RetryClass> = {
    // FATAL
    DATA_CORRUPTION: 'FATAL',
    SCHEMA_VIOLATION: 'FATAL',
    SECURITY_VIOLATION: 'FATAL',

    // NON_RETRYABLE
    PERMISSION_DENIED: 'NON_RETRYABLE',
    FILE_NOT_FOUND: 'NON_RETRYABLE',
    INVALID_PATH: 'NON_RETRYABLE',
    INVALID_INPUT: 'NON_RETRYABLE',
    DIRECTORY_NOT_EMPTY: 'NON_RETRYABLE',
    FILE_SIZE_EXCEEDED: 'NON_RETRYABLE',

    // RETRYABLE
    SYNC_FAILED: 'RETRYABLE',
    FILE_WRITE_FAILED: 'RETRYABLE',
    FILE_READ_FAILED: 'RETRYABLE',
    NETWORK_ERROR: 'RETRYABLE',
    WEB_CONTAINER_ERROR: 'RETRYABLE',
    WEB_CONTAINER_BOOT_FAILED: 'RETRYABLE',
    MOUNT_FAILED: 'RETRYABLE',
};

/**
 * Classify a SyncError by its code
 */
export function classifySyncError(error: SyncError): ClassificationResult {
    const code = error.code || 'UNKNOWN';
    const classification = SYNC_ERROR_CLASSIFICATIONS[code] || 'NON_RETRYABLE';

    return {
        classification,
        rule: `SyncError.${code}`,
        reason: `SyncError code '${code}' maps to ${classification}`,
    };
}

// ============================================================================
// ToolError Classification
// ============================================================================

/**
 * Classification rules for ToolError types
 */
const TOOL_ERROR_CLASSIFICATIONS: Record<string, RetryClass> = {
    // FATAL
    PERMISSION_DENIED: 'FATAL',
    SECURITY_VIOLATION: 'FATAL',

    // NON_RETRYABLE
    FILE_NOT_FOUND: 'NON_RETRYABLE',
    INVALID_INPUT: 'NON_RETRYABLE',
    VALIDATION_ERROR: 'NON_RETRYABLE',
    ARGUMENT_ERROR: 'NON_RETRYABLE',

    // RETRYABLE
    EXECUTION_ERROR: 'RETRYABLE',
    TIMEOUT: 'RETRYABLE',
    RATE_LIMIT: 'RETRYABLE',
    NETWORK_ERROR: 'RETRYABLE',
};

/**
 * Classify a ToolError by its code
 */
export function classifyToolError(error: ToolError): ClassificationResult {
    const code = error.errorCode || 'UNKNOWN';
    const classification = TOOL_ERROR_CLASSIFICATIONS[code] || 'NON_RETRYABLE';

    return {
        classification,
        rule: `ToolError.${code}`,
        reason: `ToolError code '${code}' maps to ${classification}`,
    };
}

// ============================================================================
// Global Registry Singleton
// ============================================================================

let registryInstance: ErrorClassificationRegistry | null = null;

export function getErrorClassificationRegistry(): ErrorClassificationRegistry {
    if (!registryInstance) {
        registryInstance = new ErrorClassificationRegistry();
    }
    return registryInstance;
}

export function resetErrorClassificationRegistry(): void {
    registryInstance = null;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Classify any error for retry eligibility
 */
export function classifyError(error: Error | unknown): ClassificationResult {
    // Handle known error types first
    if (isSyncError(error)) {
        return classifySyncError(error);
    }

    if (isToolError(error)) {
        return classifyToolError(error);
    }

    // Use general classification
    return getErrorClassificationRegistry().classify(error);
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error | unknown): boolean {
    const result = classifyError(error);
    return result.classification === 'RETRYABLE';
}

/**
 * Check if an error is fatal
 */
export function isFatalError(error: Error | unknown): boolean {
    const result = classifyError(error);
    return result.classification === 'FATAL';
}

/**
 * Check if an error should not be retried
 */
export function isNonRetryableError(error: Error | unknown): boolean {
    const result = classifyError(error);
    return result.classification === 'NON_RETRYABLE';
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if an error is a SyncError
 */
export function isSyncError(error: unknown): error is SyncError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as SyncError).code === 'string'
    );
}

/**
 * Check if an error is a ToolError
 */
export function isToolError(error: unknown): error is ToolError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'errorCode' in error &&
        typeof (error as ToolError).errorCode === 'string'
    );
}

// ============================================================================
// End of Module
// ============================================================================
