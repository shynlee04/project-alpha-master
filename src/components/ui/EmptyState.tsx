/**
 * Empty State Component
 * @module components/ui/EmptyState
 *
 * Generic empty state display component with actions.
 * Follows 8-bit design system with CVA variants.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { FileX, RefreshCw, FolderOpen, Search } from 'lucide-react'

/**
 * Empty state variant
 */
export type EmptyVariant = 'default' | 'no-files' | 'no-results' | 'no-projects'

/**
 * Empty state action type
 */
export type EmptyAction = 'create' | 'refresh' | 'browse'

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
    /** Empty state message */
    message?: string
    /** Empty state title (optional) */
    title?: string
    /** Empty variant for styling */
    variant?: EmptyVariant
    /** Action to provide for recovery */
    action?: EmptyAction
    /** Callback when action is clicked */
    onAction?: () => void
    /** Additional CSS classes */
    className?: string
    /** Custom icon */
    icon?: React.ReactNode
}

/**
 * CVA variants for empty state
 */
const emptyStateVariants = cva(
    // Base styles
    'flex flex-col items-center justify-center gap-4 p-8 rounded-lg border-2 border-dashed border-neutral-700/50',
    {
        variants: {
            variant: {
                default: 'bg-neutral-900/30',
                'no-files': 'bg-neutral-900/30',
                'no-results': 'bg-neutral-900/30',
                'no-projects': 'bg-neutral-900/30',
            },
        },
    }
)

/**
 * Empty State Component
 *
 * Displays empty states with recovery actions.
 * Supports multiple variants and actions for different empty contexts.
 *
 * @example
 * <EmptyState
 *   message="No files found"
 *   variant="no-files"
 *   action="create"
 *   onAction={() => createFile()}
 * />
 */
export function EmptyState({
    message,
    title,
    variant = 'default',
    action,
    onAction,
    className,
    icon,
}: EmptyStateProps) {
    const { t } = useTranslation()
    
    const emptyMessage = message || t('empty.message', 'Nothing here')
    const emptyTitle = title || t('empty.title', 'Empty')
    
    // Get action icon based on action type
    const getActionIcon = () => {
        switch (action) {
            case 'create':
                return <FileX className="w-5 h-5" />
            case 'refresh':
                return <RefreshCw className="w-5 h-5" />
            case 'browse':
                return <FolderOpen className="w-5 h-5" />
            default:
                return null
        }
    }
    
    // Get action label based on action type
    const getActionLabel = () => {
        switch (action) {
            case 'create':
                return t('empty.action.create', 'Create New')
            case 'refresh':
                return t('empty.action.refresh', 'Refresh')
            case 'browse':
                return t('empty.action.browse', 'Browse Files')
            default:
                return ''
        }
    }
    
    // Get variant-specific icon
    const getVariantIcon = () => {
        switch (variant) {
            case 'no-files':
                return <FileX className="w-12 h-12 text-neutral-400" />
            case 'no-results':
                return <Search className="w-12 h-12 text-neutral-400" />
            case 'no-projects':
                return <FolderOpen className="w-12 h-12 text-neutral-400" />
            default:
                return null
        }
    }
    
    return (
        <div className={cn(emptyStateVariants({ variant }), className)}>
            {/* Icon */}
            {icon || getVariantIcon()}
            
            {/* Title */}
            <h3 className="text-xl font-bold mb-2 text-neutral-100">{emptyTitle}</h3>
            
            {/* Message */}
            <p className="text-sm text-neutral-400 mb-4">{emptyMessage}</p>
            
            {/* Action button */}
            {action && onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500 text-neutral-950 rounded-none font-medium hover:bg-primary-600 active:bg-primary-700 transition-all hover:scale-105 active:scale-95"
                >
                    {getActionIcon()}
                    <span>{getActionLabel()}</span>
                </button>
            )}
        </div>
    )
}

export type EmptyStateVariants = VariantProps<typeof emptyStateVariants>
