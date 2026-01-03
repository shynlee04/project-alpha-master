/**
 * @fileoverview Security Utilities - API Key Masking and Security Validation
 * @module lib/utils/security
 *
 * Provides security utilities for:
 * - API key masking in logs
 * - Credential detection and redaction
 * - Additional path traversal hardening
 * - Input sanitization for sensitive data
 *
 * @fix RC-028-010 - Security hardening
 */

import { FileSystemError } from '../filesystem/fs-errors';

/**
 * Common API key patterns for detection
 */
const API_KEY_PATTERNS = [
    /sk-[a-zA-Z0-9]{20,}/,                    // OpenAI/GitHub style
    /sk-proj-[a-zA-Z0-9_-]{20,}/,             // OpenAI project keys
    /xox[baprs]-([a-zA-Z0-9]{10,})/,          // Slack tokens
    /gh[pousr]_[a-zA-Z0-9]{36,}/,             // GitHub tokens
    /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*/,   // JWT tokens
    /AIza[0-9A-Za-z-_]{35}/,                  // Google API keys
    /AC[a-f0-9]{32}/,                         // Google Cloud tokens
    /[A-Za-z0-9]{40}/,                        // Generic 40-char tokens
    /access_token_[a-zA-Z0-9_-]+/,            // Access tokens
    /Bearer\s+[a-zA-Z0-9_\-\.]+/i,            // Bearer tokens in strings
];

/**
 * Sensitive field names that should be masked
 */
const SENSITIVE_FIELD_NAMES = new Set([
    'apiKey',
    'api_key',
    'apikey',
    'secret',
    'password',
    'token',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'privateKey',
    'private_key',
    'secretKey',
    'secret_key',
    'encryptionKey',
    'encryption_key',
    'masterKey',
    'master_key',
    'credential',
    'passkey',
]);

/**
 * Mask an API key for safe logging
 * Shows first 4 and last 4 characters, masks the rest
 *
 * @param key - The API key to mask
 * @returns Masked key safe for logging
 */
export function maskApiKey(key: string | null | undefined): string {
    if (!key || typeof key !== 'string') {
        return '****';
    }

    if (key.length <= 8) {
        return '****';
    }

    return `${key.substring(0, 4)}${'*'.repeat(Math.min(key.length - 8, 20))}${key.substring(key.length - 4)}`;
}

/**
 * Detect if a string contains an API key pattern
 *
 * @param text - Text to check for API keys
 * @returns true if API key pattern detected
 */
export function containsApiKey(text: string): boolean {
    if (!text || typeof text !== 'string') {
        return false;
    }

    return API_KEY_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Sanitize an object for safe logging
 * Recursively masks sensitive fields and removes API key patterns
 *
 * @param obj - Object to sanitize
 * @returns Sanitized object safe for logging
 */
export function sanitizeForLogging<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'string') {
        // Mask any API key patterns found in string
        let sanitized = obj as string;
        for (const pattern of API_KEY_PATTERNS) {
            sanitized = sanitized.replace(pattern, (match) => maskApiKey(match));
        }
        return sanitized as T;
    }

    if (typeof obj === 'object') {
        const sanitized: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            // Check if field name is sensitive
            const lowerKey = key.toLowerCase();
            if (SENSITIVE_FIELD_NAMES.has(lowerKey)) {
                sanitized[key] = '****';
            } else if (typeof value === 'string' && containsApiKey(value)) {
                // Mask any API key patterns in string values
                sanitized[key] = maskApiKey(value);
            } else {
                // Recursively sanitize nested objects/arrays
                sanitized[key] = sanitizeForLogging(value);
            }
        }

        return sanitized as T;
    }

    return obj;
}

/**
 * Safe console.log wrapper that sanitizes arguments
 * Use this instead of console.log when logging might contain sensitive data
 *
 * @param args - Arguments to log (will be sanitized)
 */
export function safeLog(...args: unknown[]): void {
    const sanitized = args.map(arg => sanitizeForLogging(arg));
    console.log(...sanitized);
}

/**
 * Safe console.debug wrapper that sanitizes arguments
 *
 * @param args - Arguments to debug log (will be sanitized)
 */
export function safeDebug(...args: unknown[]): void {
    const sanitized = args.map(arg => sanitizeForLogging(arg));
    console.debug(...sanitized);
}

/**
 * Safe console.info wrapper that sanitizes arguments
 *
 * @param args - Arguments to info log (will be sanitized)
 */
export function safeInfo(...args: unknown[]): void {
    const sanitized = args.map(arg => sanitizeForLogging(arg));
    console.info(...sanitized);
}

/**
 * Safe console.warn wrapper that sanitizes arguments
 *
 * @param args - Arguments to warn log (will be sanitized)
 */
export function safeWarn(...args: unknown[]): void {
    const sanitized = args.map(arg => sanitizeForLogging(arg));
    console.warn(...sanitized);
}

/**
 * Safe console.error wrapper that sanitizes arguments
 *
 * @param args - Arguments to error log (will be sanitized)
 */
export function safeError(...args: unknown[]): void {
    const sanitized = args.map(arg => sanitizeForLogging(arg));
    console.error(...sanitized);
}

/**
 * Additional path traversal hardening
 * Checks for edge cases that might slip through basic checks
 *
 * @param path - Path to validate
 * @param operation - Operation name for error messages
 * @throws FileSystemError if path traversal detected
 */
export function validatePathTraversal(path: string, operation: string): void {
    if (!path || typeof path !== 'string') {
        throw new FileSystemError(
            `Invalid path for ${operation}`,
            'INVALID_PATH'
        );
    }

    // Check for null byte injection
    if (path.includes('\0')) {
        throw new FileSystemError(
            `Invalid path for ${operation}: null byte injection detected`,
            'INVALID_PATH'
        );
    }

    // Normalize path separators
    const normalized = path.replace(/\\/g, '/');

    // Check for double-dot traversal (including encoded variations)
    const traversalPatterns = [
        /\.\.\//,           // Standard: ../
        /\/../,             // Embedded: /..
        /\.\.$/,            // Ending: ..
        /%2e%2e/i,          // URL encoded: %2e%2e
        /%252e%252e/i,      // Double URL encoded: %252e%252e
        /u002e\u002e/i,     // Unicode: u002e u002e
        /\.\%2e/i,          // Mixed: .%2e
    ];

    for (const pattern of traversalPatterns) {
        if (pattern.test(normalized)) {
            throw new FileSystemError(
                `Invalid path for ${operation}: path traversal detected`,
                'PATH_TRAVERSAL'
            );
        }
    }

    // Check for absolute path indicators
    if (normalized.startsWith('/') ||
        /^[a-zA-Z]:/.test(normalized) ||
        normalized.startsWith('\\\\')) {
        throw new FileSystemError(
            `Invalid path for ${operation}: absolute paths not allowed`,
            'ABSOLUTE_PATH'
        );
    }

    // Check for device files (Unix/Linux)
    if (normalized.includes('/dev/') ||
        normalized.includes('/proc/') ||
        normalized.includes('/sys/')) {
        throw new FileSystemError(
            `Invalid path for ${operation}: system paths not accessible`,
            'INVALID_PATH'
        );
    }

    // Check for hidden files outside project root (potential exfiltration)
    if (normalized.includes('/.git/') ||
        normalized.includes('/.ssh/') ||
        normalized.includes('/.aws/') ||
        normalized.includes('/.config/')) {
        throw new FileSystemError(
            `Invalid path for ${operation}: sensitive directory access denied`,
            'INVALID_PATH'
        );
    }
}

/**
 * Validate that a string doesn't contain potential injection attacks
 *
 * @param input - String to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if injection pattern detected
 */
export function validateNoInjection(input: string, fieldName: string): void {
    if (!input || typeof input !== 'string') {
        return;
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
        /(\'|%27)|(\"|%22)|(\;|%3B)|(\-|%2D)|(\/|%2F)/,
        /(union|select|insert|update|delete|drop|create|alter|exec)/i,
        /(\s|%20)or(\s|%20)1\s*=\s*1/i,
    ];

    for (const pattern of sqlPatterns) {
        if (pattern.test(input)) {
            throw new Error(`Potential injection detected in ${fieldName}`);
        }
    }

    // Check for command injection patterns
    if (/[;&|`$()]/.test(input) && /\b(ls|cat|rm|mv|cp|chmod|chown|wget|curl|nc|ssh|bash|sh)\b/i.test(input)) {
        throw new Error(`Potential command injection detected in ${fieldName}`);
    }
}

/**
 * Validate a URL is safe and doesn't contain malicious patterns
 *
 * @param url - URL to validate
 * @returns true if URL appears safe
 */
export function isSafeUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const parsed = new URL(url);

        // Block dangerous protocols
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
        if (dangerousProtocols.includes(parsed.protocol.toLowerCase())) {
            return false;
        }

        // Check for IP addresses in host (potential SSRF)
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipPattern.test(parsed.hostname)) {
            // Allow localhost for development
            if (!['127.0.0.1', '::1', 'localhost'].includes(parsed.hostname)) {
                return false;
            }
        }

        // Check for port scanning
        const dangerousPorts = [22, 23, 25, 445, 3389, 5900];
        if (parsed.port && dangerousPorts.includes(parseInt(parsed.port, 10))) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Create a redacted version of an error message
 * Removes any sensitive information before sending to error tracking
 *
 * @param error - Error to redact
 * @returns Redacted error message safe for tracking
 */
export function redactError(error: Error | string): string {
    const message = typeof error === 'string' ? error : error.message;

    let redacted = message;

    // Remove API key patterns
    for (const pattern of API_KEY_PATTERNS) {
        redacted = redacted.replace(pattern, '[REDACTED_KEY]');
    }

    // Remove potential sensitive file paths
    redacted = redacted.replace(/(\/|\\)[a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+\.env/g, '[REDACTED_PATH]');

    // Remove potential credentials in URLs
    redacted = redacted.replace(/(https?:\/\/)([^:]+):([^@]+)@/g, '$1[USER]:[PASS]@');

    return redacted;
}
