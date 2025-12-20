// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { setLocale } from '../../i18n/config'
import { Dashboard, formatRelativeDate } from '../index'
import { LocaleProvider } from '../../i18n/LocaleProvider'

vi.mock('../../lib/workspace', () => ({
  listProjectsWithPermission: vi.fn().mockResolvedValue([]),
  deleteProject: vi.fn(),
  saveProject: vi.fn(),
  generateProjectId: vi.fn(),
  updateProjectLastOpened: vi.fn(),
}))

vi.mock('../../lib/filesystem/permission-lifecycle', () => ({
  ensureReadWritePermission: vi.fn(),
}))

vi.mock('../../lib/filesystem', () => ({
  LocalFSAdapter: class {
    static isSupported() {
      return true
    }
    async requestDirectoryAccess() {
      return null
    }
  },
}))

vi.mock('@tanstack/react-router', async () => {
  const actual = (await vi.importActual('@tanstack/react-router')) as Record<string, unknown>
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('Dashboard localization', () => {
  it('renders dashboard title in EN by default and switches to VI', async () => {
    render(
      <LocaleProvider>
        <Dashboard />
      </LocaleProvider>,
    )

    const enTitle = await screen.findByText('Recent Projects')
    expect(enTitle).toBeTruthy()

    setLocale('vi')

    await waitFor(() => {
      expect(screen.getByText('Dự án gần đây')).toBeTruthy()
    })
  })

  it('formats relative time using translated strings', () => {
    const mockT = (key: string, opts?: Record<string, unknown>) => {
      if (key === 'time.justNow') return 'vừa xong'
      if (key === 'time.minutesAgo' || key === 'time.minutesAgo_plural') return `${opts?.count} phút trước`
      if (key === 'time.hoursAgo' || key === 'time.hoursAgo_plural') return `${opts?.count} giờ trước`
      if (key === 'time.yesterday') return 'hôm qua'
      if (key === 'time.daysAgo' || key === 'time.daysAgo_plural') return `${opts?.count} ngày trước`
      return key
    }

    const now = new Date()
    expect(formatRelativeDate(now, mockT)).toBe('vừa xong')
    const fiveMinsAgo = new Date(now.getTime() - 5 * 60000)
    expect(formatRelativeDate(fiveMinsAgo, mockT)).toBe('5 phút trước')
  })
})
