// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'

import { getLocale, loadStoredLocale, persistLocale, setLocale, setupI18n } from '../config'

describe('i18n config', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = 'en'
    const og = document.head.querySelector('meta[property="og:locale"]')
    if (og) og.remove()
  })

  it('defaults to en when no stored locale', () => {
    expect(loadStoredLocale()).toBe('en')
  })

  it('persists and loads locale vi', () => {
    persistLocale('vi')
    expect(loadStoredLocale()).toBe('vi')
  })

  it('setLocale updates html lang and og:locale', () => {
    setupI18n()
    setLocale('vi')
    expect(document.documentElement.lang).toBe('vi')

    const meta = document.head.querySelector('meta[property="og:locale"]')
    expect(meta?.getAttribute('content')).toBe('vi')
  })

  it('getLocale returns fallback when invalid is set', () => {
    setupI18n()
    // @ts-expect-error intentional invalid for test
    setLocale('fr')
    expect(getLocale()).toBe('en')
  })
})
