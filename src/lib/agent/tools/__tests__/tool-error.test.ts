/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ToolError,
  ToolErrorMetadata,
  ErrorCategory,
  classifyError,
  isRetryableError,
  createToolError,
} from '../tool-error';

describe('ToolError', () => {
  describe('Error Classification', () => {
    describe('Transient Errors (Retryable)', () => {
      it('should classify EAGAIN as transient', () => {
        const error = new Error('Resource temporarily unavailable');
        expect(classifyError(error)).toBe('TRANSIENT');
      });

      it('should classify file locked errors as transient', () => {
        const error = new Error('EBUSY: resource busy or locked');
        expect(classifyError(error)).toBe('TRANSIENT');
      });

      it('should classify timeout errors as transient', () => {
        const error = new Error('ETIMEDOUT: connection timed out');
        expect(classifyError(error)).toBe('TRANSIENT');
      });

      it('should classify ENOENT as permanent', () => {
        const error = new Error('ENOENT: no such file or directory');
        expect(classifyError(error)).toBe('PERMANENT');
      });

      it('should classify EACCES as permanent', () => {
        const error = new Error('EACCES: permission denied');
        expect(classifyError(error)).toBe('PERMANENT');
      });

      it('should classify invalid path as permanent', () => {
        const error = new Error('Invalid path: path traversal detected');
        expect(classifyError(error)).toBe('PERMANENT');
      });

      it('should classify unknown errors as UNKNOWN', () => {
        const error = new Error('Something unexpected happened');
        expect(classifyError(error)).toBe('UNKNOWN');
      });
    });

    describe('Error Codes', () => {
      it('should extract error code from ToolError', () => {
        const metadata: Omit<ToolErrorMetadata, 'originalError'> = {
          toolId: 'write_file',
          toolName: 'Write File',
          parameters: { path: '/test.txt' },
          category: 'PERMANENT',
          retryable: false,
          attemptCount: 1,
        };
        const error = new ToolError(
          'Permission denied',
          'EACCES',
          metadata
        );
        expect(error.errorCode).toBe('EACCES');
      });

      it('should include tool metadata in error', () => {
        const metadata: Omit<ToolErrorMetadata, 'originalError'> = {
          toolId: 'read_file',
          toolName: 'Read File',
          parameters: { path: '/missing.txt' },
          category: 'PERMANENT',
          retryable: false,
          attemptCount: 1,
        };
        const error = new ToolError('File not found', 'ENOENT', metadata);
        expect(error.metadata.toolId).toBe('read_file');
        expect(error.metadata.category).toBe('PERMANENT');
      });
    });

    describe('Error Serialization', () => {
      it('should serialize ToolError to JSON', () => {
        const metadata: Omit<ToolErrorMetadata, 'originalError'> = {
          toolId: 'execute_command',
          toolName: 'Execute Command',
          parameters: { cmd: 'ls' },
          category: 'TRANSIENT',
          retryable: true,
          attemptCount: 2,
        };
        const error = new ToolError('Command failed', 'ECMDERR', metadata);
        const json = error.toJSON();
        expect(json).toContain('execute_command');
        expect(json).toContain('TRANSIENT');
      });

      it('should deserialize from JSON', () => {
        const json = JSON.stringify({
          message: 'Permission denied',
          errorCode: 'EACCES',
          metadata: {
            toolId: 'write_file',
            toolName: 'Write File',
            category: 'PERMANENT',
            retryable: false,
            attemptCount: 1,
          },
        });
        const error = ToolError.fromJSON(json);
        expect(error.errorCode).toBe('EACCES');
        expect(error.metadata.category).toBe('PERMANENT');
      });
    });

    describe('Retryable Check', () => {
      it('should return true for TRANSIENT errors', () => {
        const error = new Error('File locked');
        expect(isRetryableError(error)).toBe(true);
      });

      it('should return false for PERMANENT errors', () => {
        const error = new Error('Permission denied');
        expect(isRetryableError(error)).toBe(false);
      });

      it('should return true for UNKNOWN errors (conservative)', () => {
        const error = new Error('Unknown error code XYZ123');
        expect(isRetryableError(error)).toBe(true);
      });
    });
  });
});

describe('ToolError Factory', () => {
  it('should create transient error for locked file', () => {
    const originalError = new Error('EBUSY: file locked');
    const error = createToolError(
      'write_file',
      'Write File',
      { path: '/test.txt' },
      originalError,
      1
    );
    expect(error.metadata.category).toBe('TRANSIENT');
    expect(error.metadata.retryable).toBe(true);
  });

  it('should create permanent error for permission denied', () => {
    const originalError = new Error('EACCES: permission denied');
    const error = createToolError(
      'write_file',
      'Write File',
      { path: '/protected.txt' },
      originalError,
      1
    );
    expect(error.metadata.category).toBe('PERMANENT');
    expect(error.metadata.retryable).toBe(false);
  });

  it('should create error for not found', () => {
    const originalError = new Error('ENOENT: file not found');
    const error = createToolError(
      'read_file',
      'Read File',
      { path: '/missing.txt' },
      originalError,
      1
    );
    expect(error.metadata.category).toBe('PERMANENT');
    expect(error.errorCode).toBe('ENOENT');
  });

  it('should track attempt count', () => {
    const originalError = new Error('Timeout');
    const error = createToolError(
      'execute_command',
      'Execute Command',
      { cmd: 'curl api' },
      originalError,
      2
    );
    expect(error.metadata.attemptCount).toBe(2);
  });
});

describe('Error Message Sanitization', () => {
  it('should not expose sensitive paths in error message', () => {
    const originalError = new Error('Cannot access /home/user/.ssh/id_rsa');
    const error = createToolError(
      'read_file',
      'Read File',
      { path: '/home/user/.ssh/id_rsa' },
      originalError,
      1
    );
    // Error should not contain the full sensitive path
    expect(error.message).not.toContain('.ssh');
  });

  it('should include tool name in user-facing message', () => {
    const originalError = new Error('Failed');
    const error = createToolError(
      'delete_file',
      'Delete File',
      { path: '/test.txt' },
      originalError,
      1
    );
    expect(error.message).toContain('Delete File');
  });
});
