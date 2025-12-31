/**
 * Approval Overlay Component
 * @module components/ui/ApprovalOverlay
 *
 * Modal overlay for approving or denying tool execution requests.
 * RC-008: Sprint 27B - Approval Overlay UI
 *
 * Features:
 * - Displays tool name, description, and parameters
 * - Shows risk level indicator (LOW, MEDIUM, HIGH, CRITICAL)
 * - Three action buttons: Allow Once, Allow Always, Deny
 * - Keyboard navigation (Enter to allow, Escape to deny)
 * - Mobile-responsive design
 * - 8-bit gaming aesthetic with animations
 * - i18n support (English, Vietnamese)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Shield,
    ShieldAlert,
    ShieldCheck,
    ShieldQuestion,
    Terminal,
    FileText,
    FolderOpen,
    AlertTriangle,
    Check,
    X,
    Keyboard,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Risk level enumeration
 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Approval decision types
 */
export type ApprovalDecision =
    | { type: 'ALLOW_ONCE'; temporary: true }
    | { type: 'ALLOW_ALWAYS'; permanent: true }
    | { type: 'DENY'; temporary: false };

/**
 * Permission request to display in the overlay
 */
export interface PermissionRequest {
    toolId: string;
    toolName: string;
    description: string;
    riskLevel: RiskLevel;
    params: Record<string, unknown>;
    agentName?: string;
    timestamp: number;
}

/**
 * ApprovalOverlay Component Props
 */
export interface ApprovalOverlayProps {
    /** The permission request to display */
    request: PermissionRequest;
    /** Callback when user makes a decision */
    onDecision: (decision: ApprovalDecision) => void;
    /** Optional callback when overlay is dismissed (e.g., Escape key) */
    onCancel?: () => void;
    /** Whether the overlay is visible */
    isOpen?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Risk level configuration
 */
const RISK_CONFIG: Record<RiskLevel, {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    label: string;
    animation: string;
}> = {
    LOW: {
        icon: ShieldCheck,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        label: 'approval.risk.low',
        animation: 'risk-low',
    },
    MEDIUM: {
        icon: ShieldQuestion,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        label: 'approval.risk.medium',
        animation: 'risk-medium',
    },
    HIGH: {
        icon: ShieldAlert,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        label: 'approval.risk.high',
        animation: 'risk-high',
    },
    CRITICAL: {
        icon: AlertTriangle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        label: 'approval.risk.critical',
        animation: 'risk-critical',
    },
};

/**
 * Get icon for parameter type
 */
function getParamIcon(value: unknown): React.ElementType {
    if (typeof value === 'string' && (value.startsWith('/') || value.includes('.'))) {
        return FileText;
    }
    if (typeof value === 'string' && value.includes('/')) {
        return FolderOpen;
    }
    return Terminal;
}

/**
 * Truncate string for display
 */
function truncate(str: string, maxLength = 50): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
}

/**
 * Format parameter value for display
 */
function formatParamValue(value: unknown): string {
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2);
    }
    return String(value);
}

/**
 * ApprovalOverlay - Modal for tool execution approval
 */
export const ApprovalOverlay: React.FC<ApprovalOverlayProps> = ({
    request,
    onDecision,
    onCancel,
    isOpen = true,
    className,
}) => {
    const { t } = useTranslation();
    const [isExiting, setIsExiting] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const lastFocusedRef = useRef<HTMLElement | null>(null);

    // Store last focused element for accessibility
    useEffect(() => {
        if (isOpen) {
            lastFocusedRef.current = document.activeElement as HTMLElement;
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen || isExiting) return;

            if (e.key === 'Escape') {
                handleDeny();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleAllowOnce();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isExiting]);

    // Focus trap for accessibility
    useEffect(() => {
        if (!isOpen || !overlayRef.current) return;

        const focusableElements = overlayRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        firstElement?.focus();

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTab);
        return () => document.removeEventListener('keydown', handleTab);
    }, [isOpen]);

    // Handle decision with animation
    const handleDecision = useCallback((decision: ApprovalDecision) => {
        setIsExiting(true);
        setTimeout(() => {
            onDecision(decision);
        }, 150);
    }, [onDecision]);

    const handleAllowOnce = useCallback(() => {
        handleDecision({ type: 'ALLOW_ONCE', temporary: true });
    }, [handleDecision]);

    const handleAllowAlways = useCallback(() => {
        handleDecision({ type: 'ALLOW_ALWAYS', permanent: true });
    }, [handleDecision]);

    const handleDeny = useCallback(() => {
        handleDecision({ type: 'DENY', temporary: false });
        onCancel?.();
    }, [handleDecision, onCancel]);

    if (!isOpen) return null;

    const riskConfig = RISK_CONFIG[request.riskLevel];
    const RiskIcon = riskConfig.icon;

    return (
        <div
            className={cn(
                'fixed inset-0 z-50 flex items-center justify-center',
                'bg-black/80 backdrop-blur-sm',
                'approval-overlay-backdrop',
                isExiting ? 'fade-out' : 'fade-in',
                className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-title"
            aria-describedby="approval-description"
        >
            <div
                ref={overlayRef}
                className={cn(
                    'relative w-full max-w-lg mx-4',
                    'bg-surface-dark border-2',
                    'rounded-none pixel-corners',
                    riskConfig.bgColor,
                    riskConfig.borderColor,
                    'approval-overlay',
                    isExiting ? 'scale-out' : 'scale-in',
                    'shadow-2xl'
                )}
            >
                {/* Risk Level Indicator */}
                <div
                    className={cn(
                        'absolute -top-3 left-4 px-3 py-1',
                        'flex items-center gap-2',
                        riskConfig.bgColor,
                        riskConfig.borderColor,
                        'border',
                        'risk-badge',
                        riskConfig.animation
                    )}
                >
                    <RiskIcon className={cn('w-4 h-4', riskConfig.color)} />
                    <span className={cn('text-xs font-pixel uppercase', riskConfig.color)}>
                        {t(riskConfig.label)}
                    </span>
                </div>

                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-border-dark">
                    <div className="flex items-start gap-4">
                        <div
                            className={cn(
                                'p-3',
                                riskConfig.bgColor,
                                riskConfig.borderColor,
                                'border',
                                'rounded-none'
                            )}
                        >
                            <Shield className={cn('w-6 h-6', riskConfig.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2
                                id="approval-title"
                                className="text-lg font-pixel text-foreground"
                            >
                                {request.toolName}
                            </h2>
                            {request.agentName && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('approval.fromAgent', 'Requested by {{agent}}', {
                                        agent: request.agentName
                                    })}
                                </p>
                            )}
                            <p
                                id="approval-description"
                                className="text-sm text-muted-foreground mt-2"
                            >
                                {request.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Parameters */}
                <div className="px-6 py-4 border-b border-border-dark">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        {t('approval.parameters', 'Parameters')}
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(request.params).map(([key, value]) => {
                            const Icon = getParamIcon(value);
                            return (
                                <div
                                    key={key}
                                    className={cn(
                                        'flex items-start gap-3 p-2',
                                        'bg-surface-darker/50',
                                        'border border-border-dark/50'
                                    )}
                                >
                                    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground uppercase">
                                            {key}
                                        </p>
                                        <pre className="text-sm text-foreground mt-1 whitespace-pre-wrap break-all">
                                            {truncate(formatParamValue(value), 100)}
                                        </pre>
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(request.params).length === 0 && (
                            <p className="text-sm text-muted-foreground italic">
                                {t('approval.noParameters', 'No parameters required')}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer with Actions */}
                <div className="px-6 py-4 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={handleDeny}
                        className={cn(
                            'flex-1 rounded-none gap-2',
                            'border-red-500/30',
                            'hover:bg-red-500/10',
                            'text-red-400',
                            'deny-button'
                        )}
                        aria-label={t('approval.deny', 'Deny this request')}
                    >
                        <X className="w-4 h-4" />
                        <span className="font-pixel">{t('approval.deny', 'Deny')}</span>
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleAllowOnce}
                        className={cn(
                            'flex-1 rounded-none gap-2',
                            'border-yellow-500/30',
                            'hover:bg-yellow-500/10',
                            'text-yellow-400',
                            'allow-once-button'
                        )}
                        aria-label={t('approval.allowOnce', 'Allow once')}
                    >
                        <Check className="w-4 h-4" />
                        <span className="font-pixel">{t('approval.allowOnce', 'Allow Once')}</span>
                    </Button>

                    <Button
                        onClick={handleAllowAlways}
                        className={cn(
                            'flex-1 rounded-none gap-2',
                            riskConfig.color,
                            riskConfig.bgColor,
                            'border',
                            riskConfig.borderColor,
                            'allow-always-button'
                        )}
                        aria-label={t('approval.allowAlways', 'Allow always')}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-pixel">{t('approval.allowAlways', 'Allow Always')}</span>
                    </Button>
                </div>

                {/* Keyboard hint */}
                <div className="px-6 py-2 bg-surface-darker/30 text-xs text-muted-foreground flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1">
                        <Keyboard className="w-3 h-3" />
                        <span>Enter</span>
                    </div>
                    <span>=</span>
                    <span>{t('approval.allow', 'Allow Once')}</span>
                    <span className="mx-2">|</span>
                    <div className="flex items-center gap-1">
                        <Keyboard className="w-3 h-3" />
                        <span>Esc</span>
                    </div>
                    <span>=</span>
                    <span>{t('approval.deny', 'Deny')}</span>
                </div>
            </div>
        </div>
    );
};

export default ApprovalOverlay;
