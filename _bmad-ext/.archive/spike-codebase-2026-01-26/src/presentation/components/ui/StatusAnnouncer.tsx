/**
 * StatusAnnouncer - Screen reader live region announcements
 *
 * Provides a context-based approach for announcing status changes
 * to screen reader users via aria-live regions.
 *
 * @epic Epic 1 - Mobile-First Visual Foundation
 * @story Story 1.4 - Accessibility Foundation
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface StatusAnnouncerContextValue {
    /** Announce a message to screen readers (polite) */
    announce: (message: string) => void;
    /** Announce an urgent message to screen readers (assertive) */
    announceUrgent: (message: string) => void;
}

const StatusAnnouncerContext = createContext<StatusAnnouncerContextValue | null>(null);

interface StatusAnnouncerProviderProps {
    children: ReactNode;
}

/**
 * StatusAnnouncerProvider
 *
 * Wraps the application to provide screen reader announcement capabilities.
 * Uses aria-live regions to announce status changes.
 *
 * @example
 * ```tsx
 * // In root layout
 * <StatusAnnouncerProvider>
 *   <App />
 * </StatusAnnouncerProvider>
 * ```
 */
export function StatusAnnouncerProvider({ children }: StatusAnnouncerProviderProps) {
    const [politeMessage, setPoliteMessage] = useState('');
    const [assertiveMessage, setAssertiveMessage] = useState('');

    const announce = useCallback((message: string) => {
        // Clear first to ensure re-announcement of same message
        setPoliteMessage('');
        // Use timeout to ensure the clear is processed before new message
        setTimeout(() => setPoliteMessage(message), 100);
    }, []);

    const announceUrgent = useCallback((message: string) => {
        setAssertiveMessage('');
        setTimeout(() => setAssertiveMessage(message), 100);
    }, []);

    return (
        <StatusAnnouncerContext.Provider value={{ announce, announceUrgent }}>
            {children}
            {/* Polite announcements (non-urgent status updates) */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {politeMessage}
            </div>
            {/* Assertive announcements (critical errors) */}
            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="sr-only"
            >
                {assertiveMessage}
            </div>
        </StatusAnnouncerContext.Provider>
    );
}

/**
 * useStatusAnnouncer hook
 *
 * Access the status announcer to announce messages to screen readers.
 *
 * @example
 * ```tsx
 * const { announce, announceUrgent } = useStatusAnnouncer();
 *
 * // Polite announcement
 * announce('File saved successfully');
 *
 * // Urgent announcement
 * announceUrgent('Connection lost!');
 * ```
 */
export function useStatusAnnouncer(): StatusAnnouncerContextValue {
    const context = useContext(StatusAnnouncerContext);
    if (!context) {
        // Return no-op functions if used outside provider
        return {
            announce: () => { },
            announceUrgent: () => { },
        };
    }
    return context;
}

export default StatusAnnouncerProvider;
