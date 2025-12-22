/**
 * AgentConfigDialog Unit Tests
 * 
 * @epic Epic-28 Story 28-16
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentConfigDialog } from '../AgentConfigDialog'

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string | Record<string, unknown>) => {
            if (typeof fallback === 'string') return fallback
            return key
        },
    }),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
    },
}))

describe('AgentConfigDialog', () => {
    const mockOnOpenChange = vi.fn()
    const mockOnSubmit = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderDialog = (open = true) => {
        return render(
            <AgentConfigDialog
                open={open}
                onOpenChange={mockOnOpenChange}
                onSubmit={mockOnSubmit}
            />
        )
    }

    it('renders dialog with form fields when open', () => {
        renderDialog(true)

        expect(screen.getByText('New Agent Configuration')).toBeInTheDocument()
        expect(screen.getByText('Create Agent')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
        renderDialog(false)

        expect(screen.queryByText('New Agent Configuration')).not.toBeInTheDocument()
    })

    it('shows validation error when submitting empty name', async () => {
        renderDialog(true)

        const submitButton = screen.getByText('Create Agent')
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Agent name is required')).toBeInTheDocument()
        })
        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('calls onOpenChange when cancel is clicked', () => {
        renderDialog(true)

        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)

        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('has proper pixel aesthetic classes', () => {
        renderDialog(true)

        // Check dialog has rounded-none for pixel aesthetic
        const dialogContent = document.querySelector('[data-slot="dialog-content"]')
        expect(dialogContent).toHaveClass('rounded-none')
    })
})
