/**
 * SkipLinks - Accessibility skip navigation links
 *
 * Provides keyboard users with quick links to skip to main content areas.
 * Links are visually hidden until focused, following WCAG 2.1 SC 2.4.1.
 *
 * @epic Epic 1 - Mobile-First Visual Foundation
 * @story Story 1.4 - Accessibility Foundation
 */

import { useTranslation } from 'react-i18next';

interface SkipLink {
    /** Target element ID (without #) */
    targetId: string;
    /** i18n key for the link label */
    labelKey: string;
    /** Fallback label if translation missing */
    fallback: string;
}

const defaultSkipLinks: SkipLink[] = [
    { targetId: 'main-content', labelKey: 'a11y.skipToMain', fallback: 'Skip to main content' },
    { targetId: 'editor-panel', labelKey: 'a11y.skipToEditor', fallback: 'Skip to editor' },
    { targetId: 'chat-panel', labelKey: 'a11y.skipToChat', fallback: 'Skip to chat' },
];

interface SkipLinksProps {
    /** Custom skip links (optional, uses defaults if not provided) */
    links?: SkipLink[];
}

/**
 * SkipLinks Component
 *
 * Renders skip navigation links that are visually hidden until focused.
 * When focused, they appear at the top of the viewport.
 *
 * @example
 * ```tsx
 * // In IDELayout.tsx, before the header
 * <SkipLinks />
 * ```
 */
export function SkipLinks({ links = defaultSkipLinks }: SkipLinksProps) {
    const { t } = useTranslation();

    const handleClick = (targetId: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav aria-label="Skip links" className="skip-links">
            {links.map((link) => (
                <a
                    key={link.targetId}
                    href={`#${link.targetId}`}
                    onClick={handleClick(link.targetId)}
                    className="
                        sr-only focus:not-sr-only
                        focus:fixed focus:top-2 focus:left-2 focus:z-[var(--z-alert)]
                        focus:px-4 focus:py-2
                        focus:bg-primary focus:text-primary-foreground
                        focus:rounded focus:shadow-lg
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring
                        font-medium text-sm
                    "
                >
                    {t(link.labelKey, link.fallback)}
                </a>
            ))}
        </nav>
    );
}

export default SkipLinks;
