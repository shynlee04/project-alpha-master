import { Badge } from '@/presentation/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type ProviderStatus = 'configured' | 'missing' | 'error' | 'loading';

interface ProviderStatusBadgeProps {
    status: ProviderStatus;
    className?: string;
}

export function ProviderStatusBadge({ status, className }: ProviderStatusBadgeProps) {
    const { t } = useTranslation();

    const config = {
        configured: {
            icon: CheckCircle,
            label: t('providers.status.configured', 'Configured'),
            color: 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20'
        },
        missing: {
            icon: AlertTriangle,
            label: t('providers.status.missing', 'Missing Key'),
            color: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20'
        },
        error: {
            icon: XCircle,
            label: t('providers.status.error', 'Error'),
            color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20'
        },
        loading: {
            icon: Loader2,
            label: t('providers.status.loading', 'Checking...'),
            color: 'text-muted-foreground'
        }
    } as const;

    const current = config[status];
    const Icon = current.icon;

    return (
        <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2 py-0.5 transition-colors ${current.color} ${className || ''}`}
        >
            <Icon className={`h-3.5 w-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span className="text-xs font-medium">{current.label}</span>
        </Badge>
    );
}
