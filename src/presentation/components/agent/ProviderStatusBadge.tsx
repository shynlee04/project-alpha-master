import { Badge } from '@/presentation/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type ProviderStatus = 'configured' | 'missing' | 'error' | 'loading';

interface ProviderStatusBadgeProps {
    status: ProviderStatus;
    className?: string;
}

/**
 * Provider Status Badge Component
 *
 * Displays the current status of an AI provider configuration.
 * Uses 8-bit design with sharp corners, solid colors, and monospace fonts.
 *
 * @story PRV-05 - 8-bit Design Compliance for Provider UI
 * @epic EPIC-PRV-UI - Provider Frontend Integration
 */
export function ProviderStatusBadge({ status, className }: ProviderStatusBadgeProps) {
    const { t } = useTranslation();

    const config = {
        configured: {
            icon: CheckCircle,
            label: t('providers.status.configured', 'Configured'),
            color: 'bg-green-500 text-white border-green-600 hover:bg-green-600'
        },
        missing: {
            icon: AlertTriangle,
            label: t('providers.status.missing', 'Missing Key'),
            color: 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600'
        },
        error: {
            icon: XCircle,
            label: t('providers.status.error', 'Error'),
            color: 'bg-red-500 text-white border-red-600 hover:bg-red-600'
        },
        loading: {
            icon: Loader2,
            label: t('providers.status.loading', 'Checking...'),
            color: 'bg-muted text-muted-foreground border-border'
        }
    } as const;

    const current = config[status];
    const Icon = current.icon;

    return (
        <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2 py-0.5 transition-colors rounded-none border shadow-[2px_2px_0_0] font-mono ${current.color} ${className || ''}`}
        >
            <Icon className={`h-3.5 w-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span className="text-xs font-medium">{current.label}</span>
        </Badge>
    );
}
