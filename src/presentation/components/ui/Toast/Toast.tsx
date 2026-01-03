/**
 * Toast notification component
 * @module components/ui/Toast
 * @story LT-3.17 (Light Theme Migration)
 *
 * Uses CSS custom properties for light/dark theme support.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast, type ToastVariant, type ToastMessage } from './ToastContext';

interface ToastItemProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

/**
 * CVA-style variant styles using CSS custom properties
 */
const variantStyles: Record<ToastVariant, string> = {
    // Success variant: green tinted
    success: 'bg-[var(--success-50)] border-[var(--success-200)] text-[var(--success)]',
    // Error variant: red tinted
    error: 'bg-[var(--destructive-50)] border-[var(--destructive-200)] text-[var(--destructive)]',
    // Warning variant: yellow tinted
    warning: 'bg-[var(--warning-50)] border-[var(--warning-200)] text-[var(--warning)]',
    // Info variant: neutral with border
    info: 'bg-[var(--card)] border-[var(--border)] text-[var(--card-foreground)]',
};

const variantIcons: Record<ToastVariant, typeof CheckCircle> = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

/**
 * Individual toast item with animation
 */
function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const [isVisible, setIsVisible] = useState(false);
    const Icon = variantIcons[toast.variant];

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => {
            setIsVisible(true);
        });
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => onDismiss(toast.id), 150);
    };

    return (
        <div
            className={`
                flex items-center gap-3 px-4 py-3 rounded-[4px] border shadow-lg backdrop-blur-sm
                transition-all duration-150 ease-out
                ${variantStyles[toast.variant]}
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
            `}
        >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
                onClick={handleDismiss}
                className="p-1 hover:bg-[var(--muted)] rounded-[4px] transition-colors"
                aria-label="Dismiss notification"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

/**
 * Toast container that renders via portal
 */
export function ToastContainer() {
    const { toasts, dismiss } = useToast();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
        </div>,
        document.body
    );
}

/**
 * Standalone Toast component for simpler usage
 */
export function Toast() {
    return <ToastContainer />;
}
