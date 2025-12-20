import { describe, it, expect } from 'vitest';
import i18n from '../config';

describe('i18n configuration', () => {
  it('should be initialized', () => {
    expect(i18n.isInitialized).toBe(true);
  });

  it('should have English and Vietnamese resources', () => {
    expect(i18n.getResource('en', 'translation', 'welcome')).toBeDefined();
    expect(i18n.getResource('vi', 'translation', 'welcome')).toBeDefined();
  });

  it('should default to English', () => {
    // If no language detected, fallback is en
    if (!i18n.language) {
      expect(i18n.languages).toContain('en');
    }
  });

  it('should allow language switching', async () => {
    await i18n.changeLanguage('vi');
    expect(i18n.language).toBe('vi');

    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
  });
});
