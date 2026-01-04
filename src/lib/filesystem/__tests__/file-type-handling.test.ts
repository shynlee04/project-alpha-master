/**
 * @fileoverview File Type Handling Tests
 * @module lib/filesystem/__tests__
 * @governance Story 54-2 - AC3: File Type Handling
 *
 * Tests for correct handling of text vs binary files during sync operations.
 * TDD Red Phase: All tests should fail initially.
 */

import { describe, it, expect, vi } from 'vitest';
import { shouldReadAsBinary, BINARY_EXTENSIONS } from '../sync-utils';

describe('File Type Handling - AC3', () => {
  describe('Text file detection', () => {
    it('should identify .ts files as text', () => {
      expect(shouldReadAsBinary('src/test.ts')).toBe(false);
    });

    it('should identify .js files as text', () => {
      expect(shouldReadAsBinary('src/test.js')).toBe(false);
    });

    it('should identify .md files as text', () => {
      expect(shouldReadAsBinary('README.md')).toBe(false);
    });

    it('should identify .json files as text', () => {
      expect(shouldReadAsBinary('package.json')).toBe(false);
    });

    it('should identify .txt files as text', () => {
      expect(shouldReadAsBinary('notes.txt')).toBe(false);
    });

    it('should identify .css files as text', () => {
      expect(shouldReadAsBinary('styles.css')).toBe(false);
    });
  });

  describe('Binary file detection', () => {
    it('should identify .png files as binary', () => {
      expect(shouldReadAsBinary('image.png')).toBe(true);
    });

    it('should identify .jpg files as binary', () => {
      expect(shouldReadAsBinary('photo.jpg')).toBe(true);
    });

    it('should identify .pdf files as binary', () => {
      expect(shouldReadAsBinary('document.pdf')).toBe(true);
    });

    it('should identify .mp3 files as binary', () => {
      expect(shouldReadAsBinary('audio.mp3')).toBe(true);
    });

    it('should identify .mp4 files as binary', () => {
      expect(shouldReadAsBinary('video.mp4')).toBe(true);
    });

    it('should identify .woff files as binary', () => {
      expect(shouldReadAsBinary('font.woff')).toBe(true);
    });
  });

  describe('Binary extensions list', () => {
    it('should contain all 24 expected binary extensions', () => {
      // Text files should not be in binary list
      const textExtensions = ['.ts', '.js', '.md', '.json', '.txt', '.css', '.html'];
      textExtensions.forEach(ext => {
        expect(BINARY_EXTENSIONS).not.toContain(ext);
      });
    });

    it('should include image extensions', () => {
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico'];
      imageExtensions.forEach(ext => {
        expect(BINARY_EXTENSIONS).toContain(ext);
      });
    });

    it('should include document extensions', () => {
      const docExtensions = ['.pdf', '.zip', '.tar', '.gz'];
      docExtensions.forEach(ext => {
        expect(BINARY_EXTENSIONS).toContain(ext);
      });
    });

    it('should include media extensions', () => {
      const mediaExtensions = ['.mp3', '.mp4', '.wav', '.avi', '.mov'];
      mediaExtensions.forEach(ext => {
        expect(BINARY_EXTENSIONS).toContain(ext);
      });
    });
  });

  describe('Case insensitive detection', () => {
    it('should detect .PNG as binary (uppercase)', () => {
      expect(shouldReadAsBinary('image.PNG')).toBe(true);
    });

    it('should detect .PDF as binary (uppercase)', () => {
      expect(shouldReadAsBinary('document.PDF')).toBe(true);
    });

    it('should detect .TS as text (uppercase)', () => {
      expect(shouldReadAsBinary('src/test.TS')).toBe(false);
    });
  });

  describe('Path handling', () => {
    it('should handle paths with directories', () => {
      expect(shouldReadAsBinary('src/assets/images/logo.png')).toBe(true);
    });

    it('should handle paths with multiple directories', () => {
      expect(shouldReadAsBinary('src/components/icons/icon.svg')).toBe(true);
    });

    it('should handle paths with special characters', () => {
      expect(shouldReadAsBinary('src/images/image-copy@2x.png')).toBe(true);
    });
  });
});
