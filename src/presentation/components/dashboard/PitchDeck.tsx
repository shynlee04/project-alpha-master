/**
 * PitchDeck - Onboarding pitch deck component
 *
 * @file PitchDeck.tsx
 * @created 2025-12-29
 */

export interface PitchDeckProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

/**
 * Placeholder PitchDeck component
 * TODO: Implement full pitch deck functionality
 */
export function PitchDeck({ isOpen, onClose, onComplete }: PitchDeckProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)]">
            <div className="bg-surface p-6 rounded-lg max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4">Welcome to Via-gent</h2>
                <p className="mb-4">Pitch deck content goes here.</p>
                <div className="flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2">Close</button>
                    <button onClick={onComplete} className="px-4 py-2 bg-primary">Get Started</button>
                </div>
            </div>
        </div>
    );
}
