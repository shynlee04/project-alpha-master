import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Onboarding } from '../Onboarding'

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'onboarding.title': 'Via-gent',
                'onboarding.subtitle': 'Your Intelligent Local Dev Environment',
                'onboarding.contact.name': 'Linh Nguyen'
            }
            return translations[key] || key
        },
    }),
}))

describe('Onboarding', () => {
    it('renders branding title and subtitle', () => {
        render(<Onboarding />)
        expect(screen.getByText('Via-gent')).toBeDefined()
        expect(screen.getByText('Your Intelligent Local Dev Environment')).toBeDefined()
    })

    it('renders contact information', () => {
        render(<Onboarding />)
        const elements = screen.getAllByText('Linh Nguyen')
        expect(elements.length).toBeGreaterThanOrEqual(1)
    })
})
