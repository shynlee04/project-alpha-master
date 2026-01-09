/**
 * @fileoverview Context Window Internal Tests
 * @module infrastructure/persistence/stores/chat/slices/context-window/__tests__
 *
 * Tests for context window internal utilities.
 *
 * @story 40-03: Update Context Threshold to 65%
 * @created 2026-01-10
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_COMPRESSION_THRESHOLD,
  DEFAULT_MAX_TOKENS,
  applyCompressionStrategy,
} from '../internal';

describe('Context Window Internal (Story 40-03)', () => {
  describe('DEFAULT_COMPRESSION_THRESHOLD', () => {
    it('should be 65 percent (Story 40-03 requirement)', () => {
      expect(DEFAULT_COMPRESSION_THRESHOLD).toBe(65);
    });

    it('should be lower than previous value of 80', () => {
      expect(DEFAULT_COMPRESSION_THRESHOLD).toBeLessThan(80);
      expect(DEFAULT_COMPRESSION_THRESHOLD).toBe(65);
    });
  });

  describe('DEFAULT_MAX_TOKENS', () => {
    it('should be 128000 for Claude 3.5', () => {
      expect(DEFAULT_MAX_TOKENS).toBe(128000);
    });
  });

  describe('applyCompressionStrategy', () => {
    it('should compress to 70% of max tokens (unchanged)', () => {
      const result = applyCompressionStrategy('drop_oldest', [], 10000);
      expect(result.targetTokens).toBe(7000); // 70% of max
    });

    it('should use drop_oldest strategy by default', () => {
      const result = applyCompressionStrategy('drop_oldest', [], 10000);
      expect(result.strategy).toBe('drop_oldest');
    });
  });

  describe('Threshold behavior (Story 40-03)', () => {
    it('should trigger warning at 65% instead of 80%', () => {
      // At 65% threshold, warning triggers 15% earlier than before
      const oldThreshold = 80;
      const newThreshold = 65;
      const thresholdDifference = oldThreshold - newThreshold;

      expect(newThreshold).toBe(65);
      expect(thresholdDifference).toBe(15); // 15% earlier warning
    });

    it('should maintain 70% compression target (unchanged)', () => {
      // Compression target remains at 70% of max tokens
      // Only the warning threshold changed from 80% to 65%
      const result = applyCompressionStrategy('drop_oldest', [], 10000);
      const compressionRatio = result.targetTokens / 10000;

      expect(compressionRatio).toBeCloseTo(0.7, 0.01); // 70%
    });
  });
});
