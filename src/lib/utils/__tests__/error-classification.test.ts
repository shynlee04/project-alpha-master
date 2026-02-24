/**
 * @fileoverview Error Classification Tests
 * @module lib/utils/__tests__/error-classification.test
 * @governance RC-015
 *
 * Tests for error classification system:
 * - Each error type maps to correct classification
 * - Registry pattern works correctly
 * - Custom rules can be registered
 * - Default classification for unknown errors
 */

import {
    ErrorClassificationRegistry,
    getErrorClassificationRegistry,
    resetErrorClassificationRegistry,
    classifyError,
    isRetryableError,
    isFatalError,
    isNonRetryableError,
    classifySyncError,
    classifyToolError,
    type RetryClass,
    type ErrorClassificationRule,
} from '../error-classification';
import type { SyncError } from '../filesystem/sync-types';

// ============================================================================
// Test Errors
// ============================================================================

const testErrors = {
    // FATAL errors
    dataCorruption: new Error('Data corruption detected: checksum mismatch'),
    securityViolation: new Error('Security violation: unauthorized access attempt'),

    // NON_RETRYABLE errors
    permissionDenied: new Error('Permission denied: file access not allowed'),
    notFound: new Error('File not found: src/nonexistent.ts'),
    invalidInput: new Error('Invalid input: argument validation failed'),
    validationError: new Error('Validation error: schema violation'),
    directoryNotEmpty: new Error('Directory not empty: cannot delete'),

    // RETRYABLE errors
    networkError: new Error('Failed to fetch: network error'),
    timeoutError: new Error('Request timeout: operation timed out'),
    rateLimit: new Error('Rate limit exceeded: too many requests'),
    serviceUnavailable: new Error('Service unavailable: 503 server error'),
    syncFailed: new Error('Sync failed: could not write file'),

    // Unknown error
    unknownError: new Error('Some random error message'),
};

// ============================================================================
// Test Suite
// ============================================================================

describe('ErrorClassificationRegistry', () => {
    beforeEach(() => {
        resetErrorClassificationRegistry();
    });

    describe('classify', () => {
        describe('FATAL errors', () => {
            it('classifies data corruption as FATAL', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.dataCorruption);

                expect(result.classification).toBe('FATAL');
                expect(result.rule).toBe('DATA_CORRUPTION');
            });

            it('classifies security violation as FATAL', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.securityViolation);

                expect(result.classification).toBe('FATAL');
                expect(result.rule).toBe('SECURITY_VIOLATION');
            });
        });

        describe('NON_RETRYABLE errors', () => {
            it('classifies permission denied as NON_RETRYABLE', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.permissionDenied);

                expect(result.classification).toBe('NON_RETRYABLE');
                expect(result.rule).toBe('PERMISSION_DENIED');
            });

            it('classifies not found as NON_RETRYABLE', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.notFound);

                expect(result.classification).toBe('NON_RETRYABLE');
                expect(result.rule).toBe('NOT_FOUND');
            });

            it('classifies invalid input as NON_RETRYABLE', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.invalidInput);

                expect(result.classification).toBe('NON_RETRYABLE');
                expect(result.rule).toBe('INVALID_INPUT');
            });

            it('classifies validation error as NON_RETRYABLE', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.validationError);

                expect(result.classification).toBe('NON_RETRYABLE');
                expect(result.rule).toBe('INVALID_INPUT');
            });

            it('classifies directory not empty as NON_RETRYABLE', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.directoryNotEmpty);

                expect(result.classification).toBe('NON_RETRYABLE');
            });
        });

        describe('RETRYABLE errors', () => {
            it('classifies network error as RETRYABLE', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.networkError);

                expect(result.classification).toBe('RETRYABLE');
                expect(result.rule).toBe('NETWORK_ERROR');
            });

            it('classifies timeout error as RETRYABLE', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.timeoutError);

                expect(result.classification).toBe('RETRYABLE');
                expect(result.rule).toBe('TIMEOUT');
            });

            it('classifies rate limit as RETRYABLE', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.rateLimit);

                expect(result.classification).toBe('RETRYABLE');
                expect(result.rule).toBe('RATE_LIMIT');
            });

            it('classifies service unavailable as RETRYABLE', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.serviceUnavailable);

                expect(result.classification).toBe('RETRYABLE');
                expect(result.rule).toBe('SERVICE_UNAVAILABLE');
            });
        });

        describe('unknown errors', () => {
            it('classifies unknown errors as NON_RETRYABLE (conservative)', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.unknownError);

                expect(result.classification).toBe('NON_RETRYABLE');
                expect(result.rule).toBe('DEFAULT');
            });

            it('provides reason for default classification', () => {
                const registry = new ErrorClassificationRegistry();
                const result = registry.classify(testErrors.unknownError);

                expect(result.reason).toContain('defaulting');
            });
        });
    });

    describe('isRetryable', () => {
        it('returns true for RETRYABLE errors', () => {
            const registry = new ErrorClassificationRegistry();
            expect(registry.isRetryable(testErrors.networkError)).toBe(true);
            expect(registry.isRetryable(testErrors.timeoutError)).toBe(true);
        });

        it('returns false for NON_RETRYABLE errors', () => {
            const registry = new ErrorClassificationRegistry();
            expect(registry.isRetryable(testErrors.permissionDenied)).toBe(false);
            expect(registry.isRetryable(testErrors.notFound)).toBe(false);
        });

        it('returns false for FATAL errors', () => {
            const registry = new ErrorClassificationRegistry();
            expect(registry.isRetryable(testErrors.dataCorruption)).toBe(false);
        });
    });

    describe('custom rules', () => {
        it('allows registering custom rules', () => {
            const registry = new ErrorClassificationRegistry();

            const customRule: ErrorClassificationRule = {
                name: 'CUSTOM_RETRY',
                matches: (e) => e instanceof Error && e.message.includes('custom'),
                classification: 'RETRYABLE',
                priority: 90, // Higher than built-in
            };

            registry.register(customRule);

            const customError = new Error('This is a custom retry error');
            const result = registry.classify(customError);

            expect(result.classification).toBe('RETRYABLE');
            expect(result.rule).toBe('CUSTOM_RETRY');
        });

        it('custom rules take precedence over built-in', () => {
            const registry = new ErrorClassificationRegistry();

            const customRule: ErrorClassificationRule = {
                name: 'OVERRIDE_TIMEOUT',
                matches: (e) => e instanceof Error && e.message.includes('timeout'),
                classification: 'NON_RETRYABLE', // Override RETRYABLE
                priority: 200, // Higher than built-in
            };

            registry.register(customRule);

            const result = registry.classify(testErrors.timeoutError);
            expect(result.classification).toBe('NON_RETRYABLE');
            expect(result.rule).toBe('OVERRIDE_TIMEOUT');
        });

        it('allows unregistering rules', () => {
            const registry = new ErrorClassificationRegistry();

            // Unregister network error rule
            const unregistered = registry.unregister('NETWORK_ERROR');
            expect(unregistered).toBe(true);

            // Network error should now use default
            const result = registry.classify(testErrors.networkError);
            expect(result.rule).toBe('DEFAULT');

            // Unregister non-existent rule returns false
            expect(registry.unregister('NON_EXISTENT')).toBe(false);
        });

        it('allows clearing custom rules', () => {
            const registry = new ErrorClassificationRegistry();

            // Add custom rule
            registry.register({
                name: 'CUSTOM_RULE',
                matches: () => false,
                classification: 'RETRYABLE',
            });

            // Clear custom rules
            registry.clearCustomRules();

            // Verify custom rule is removed
            const rules = registry.getRules();
            expect(rules.some(r => r.name === 'CUSTOM_RULE')).toBe(false);
        });
    });

    describe('getRules', () => {
        it('returns all registered rules', () => {
            const registry = new ErrorClassificationRegistry();
            const rules = registry.getRules();

            expect(rules.length).toBeGreaterThan(0);
            expect(rules[0].priority).toBeGreaterThanOrEqual(rules[rules.length - 1].priority);
        });

        it('returns copy of rules array', () => {
            const registry = new ErrorClassificationRegistry();
            const rules1 = registry.getRules();
            const rules2 = registry.getRules();

            expect(rules1).not.toBe(rules2);
            expect(rules1).toEqual(rules2);
        });
    });

    describe('setDefaultClass', () => {
        it('changes default classification', () => {
            const registry = new ErrorClassificationRegistry();

            // Default should be NON_RETRYABLE
            let result = registry.classify(testErrors.unknownError);
            expect(result.classification).toBe('NON_RETRYABLE');

            // Change to RETRYABLE
            registry.setDefaultClass('RETRYABLE');
            result = registry.classify(testErrors.unknownError);
            expect(result.classification).toBe('RETRYABLE');

            // Change to FATAL
            registry.setDefaultClass('FATAL');
            result = registry.classify(testErrors.unknownError);
            expect(result.classification).toBe('FATAL');
        });
    });
});

describe('Convenience Functions', () => {
    beforeEach(() => {
        resetErrorClassificationRegistry();
    });

    describe('classifyError', () => {
        it('classifies standard errors', () => {
            const result = classifyError(testErrors.networkError);
            expect(result.classification).toBe('RETRYABLE');
        });

        it('includes rule and reason', () => {
            const result = classifyError(testErrors.permissionDenied);
            expect(result.rule).toBeDefined();
            expect(result.reason).toBeDefined();
        });
    });

    describe('isRetryableError', () => {
        it('returns true for retryable errors', () => {
            expect(isRetryableError(testErrors.networkError)).toBe(true);
            expect(isRetryableError(testErrors.timeoutError)).toBe(true);
        });

        it('returns false for non-retryable errors', () => {
            expect(isRetryableError(testErrors.permissionDenied)).toBe(false);
            expect(isRetryableError(testErrors.notFound)).toBe(false);
        });

        it('returns false for fatal errors', () => {
            expect(isRetryableError(testErrors.dataCorruption)).toBe(false);
        });
    });

    describe('isFatalError', () => {
        it('returns true for fatal errors', () => {
            expect(isFatalError(testErrors.dataCorruption)).toBe(true);
            expect(isFatalError(testErrors.securityViolation)).toBe(true);
        });

        it('returns false for non-fatal errors', () => {
            expect(isFatalError(testErrors.networkError)).toBe(false);
            expect(isFatalError(testErrors.permissionDenied)).toBe(false);
        });
    });

    describe('isNonRetryableError', () => {
        it('returns true for non-retryable errors', () => {
            expect(isNonRetryableError(testErrors.permissionDenied)).toBe(true);
            expect(isNonRetryableError(testErrors.notFound)).toBe(true);
        });

        it('returns false for retryable errors', () => {
            expect(isNonRetryableError(testErrors.networkError)).toBe(false);
            expect(isNonRetryableError(testErrors.timeoutError)).toBe(false);
        });

        it('returns false for fatal errors', () => {
            expect(isNonRetryableError(testErrors.dataCorruption)).toBe(false);
        });
    });
});

describe('SyncError Classification', () => {
    beforeEach(() => {
        resetErrorClassificationRegistry();
    });

    it('classifies FATAL SyncError codes', () => {
        const errors: SyncError[] = [
            { code: 'DATA_CORRUPTION', message: 'test' } as SyncError,
            { code: 'SCHEMA_VIOLATION', message: 'test' } as SyncError,
        ];

        for (const error of errors) {
            const result = classifySyncError(error);
            expect(result.classification).toBe('FATAL');
        }
    });

    it('classifies NON_RETRYABLE SyncError codes', () => {
        const errors: SyncError[] = [
            { code: 'PERMISSION_DENIED', message: 'test' } as SyncError,
            { code: 'FILE_NOT_FOUND', message: 'test' } as SyncError,
            { code: 'INVALID_INPUT', message: 'test' } as SyncError,
        ];

        for (const error of errors) {
            const result = classifySyncError(error);
            expect(result.classification).toBe('NON_RETRYABLE');
        }
    });

    it('classifies RETRYABLE SyncError codes', () => {
        const errors: SyncError[] = [
            { code: 'SYNC_FAILED', message: 'test' } as SyncError,
            { code: 'FILE_WRITE_FAILED', message: 'test' } as SyncError,
            { code: 'NETWORK_ERROR', message: 'test' } as SyncError,
        ];

        for (const error of errors) {
            const result = classifySyncError(error);
            expect(result.classification).toBe('RETRYABLE');
        }
    });

    it('defaults unknown SyncError codes to NON_RETRYABLE', () => {
        const error = { code: 'UNKNOWN_CODE', message: 'test' } as SyncError;
        const result = classifySyncError(error);

        expect(result.classification).toBe('NON_RETRYABLE');
    });
});

describe('Singleton Registry', () => {
    beforeEach(() => {
        resetErrorClassificationRegistry();
    });

    it('returns singleton instance', () => {
        const registry1 = getErrorClassificationRegistry();
        const registry2 = getErrorClassificationRegistry();

        expect(registry1).toBe(registry2);
    });

    it('can be reset', () => {
        const registry1 = getErrorClassificationRegistry();
        resetErrorClassificationRegistry();
        const registry2 = getErrorClassificationRegistry();

        expect(registry1).not.toBe(registry2);
    });
});

describe('Edge Cases', () => {
    beforeEach(() => {
        resetErrorClassificationRegistry();
    });

    it('handles non-Error values', () => {
        const result = classifyError('string error');
        expect(result.classification).toBe('NON_RETRYABLE');
    });

    it('handles null', () => {
        const result = classifyError(null as unknown as Error);
        expect(result.classification).toBe('NON_RETRYABLE');
    });

    it('handles undefined', () => {
        const result = classifyError(undefined as unknown as Error);
        expect(result.classification).toBe('NON_RETRYABLE');
    });

    it('handles objects without message', () => {
        const result = classifyError({ code: 'TEST' } as unknown as Error);
        expect(result.classification).toBeDefined();
    });

    it('handles empty string error', () => {
        const result = classifyError('');
        expect(result.classification).toBe('NON_RETRYABLE');
    });

    it('handles error with only whitespace message', () => {
        const result = classifyError(new Error('   '));
        expect(result.classification).toBe('NON_RETRYABLE');
    });
});

describe('Case Sensitivity', () => {
    beforeEach(() => {
        resetErrorClassificationRegistry();
    });

    it('is case-insensitive for network error', () => {
        const registry = new ErrorClassificationRegistry();

        const lowerCase = new Error('network error');
        const upperCase = new Error('NETWORK ERROR');
        const mixedCase = new Error('Network Error');

        expect(registry.classify(lowerCase).classification).toBe('RETRYABLE');
        expect(registry.classify(upperCase).classification).toBe('RETRYABLE');
        expect(registry.classify(mixedCase).classification).toBe('RETRYABLE');
    });

    it('is case-insensitive for permission denied', () => {
        const registry = new ErrorClassificationRegistry();

        const lowerCase = new Error('permission denied');
        const upperCase = new Error('PERMISSION DENIED');
        const mixedCase = new Error('Permission Denied');

        expect(registry.classify(lowerCase).classification).toBe('NON_RETRYABLE');
        expect(registry.classify(upperCase).classification).toBe('NON_RETRYABLE');
        expect(registry.classify(mixedCase).classification).toBe('NON_RETRYABLE');
    });
});
