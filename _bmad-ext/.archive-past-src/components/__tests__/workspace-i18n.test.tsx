// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import { LocaleProvider } from '../../i18n/LocaleProvider'
import { setLocale } from '../../i18n/config'
import { TerminalPanel } from '../layout/TerminalPanel'
import { PreviewPanel } from '../ide/PreviewPanel/PreviewPanel'
import { MonacoEditor } from '../ide/MonacoEditor/MonacoEditor'

vi.mock('../../lib/workspace', async () => {
  const actual = (await vi.importActual('../../lib/workspace')) as Record<string, unknown>
  return {
    ...actual,
    useWorkspace: () => ({
      syncStatus: 'idle',
      projectId: null,
      projectMetadata: null,
      permissionState: 'granted',
      syncManagerRef: { current: null },
      localAdapterRef: { current: null },
      eventBus: null,
      setIsWebContainerBooted: () => {},
    }),
  }
})

const renderWithLocale = (ui: React.ReactNode) => render(<LocaleProvider>{ui}</LocaleProvider>)

describe('Workspace localization', () => {
  it('renders preview waiting state in EN then VI', async () => {
    renderWithLocale(<PreviewPanel previewUrl={null} port={null} />)

    expect(screen.getByText(/Waiting for dev server/)).toBeTruthy()
    expect(screen.getAllByText((_, el) => el?.textContent?.includes('npm run dev') ?? false).length).toBeGreaterThan(0)

    setLocale('vi')
    await waitFor(() => {
      expect(screen.getByText('Đang chờ dev server...')).toBeTruthy()
    })
  })

  it('renders Monaco editor empty state in VI', async () => {
    renderWithLocale(
      <MonacoEditor
        openFiles={[]}
        activeFilePath={null}
        onSave={async () => {}}
        onActiveFileChange={() => {}}
        onContentChange={() => {}}
        onTabClose={() => {}}
      />,
    )

    setLocale('vi')
    await waitFor(() => {
      expect(screen.getByText('Chưa mở file')).toBeTruthy()
      expect(screen.getByText('Chọn file từ explorer để bắt đầu chỉnh sửa')).toBeTruthy()
    })
  })

  it('renders terminal tabs localized', async () => {
    renderWithLocale(<TerminalPanel activeTab="output" onTabChange={() => {}} />)
    expect(screen.getByText('Output')).toBeTruthy()

    setLocale('vi')
    await waitFor(() => {
      expect(screen.getByText('Output')).toBeTruthy()
      expect(screen.getByText('Output (sắp ra mắt)')).toBeTruthy()
    })
  })
})
