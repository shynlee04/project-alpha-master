import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Onboarding } from '../Onboarding'

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'onboarding.slides.intro.title': 'Via-gent',
                'onboarding.slides.intro.desc': 'Your Intelligent Local Dev Environment',
                'onboarding.launch': 'Launch Interactive Tour'
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

    it('renders launch button', () => {
        render(<Onboarding />)
        const elements = screen.getAllByText('Launch Interactive Tour')
        expect(elements.length).toBeGreaterThanOrEqual(1)
    })
})
