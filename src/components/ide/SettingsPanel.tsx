import { SidebarHeader } from './IconSidebar'
import { useTranslation } from 'react-i18next'
import { Settings as SettingsIcon, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * SettingsPanel - Settings sidebar panel
 * 
 * Shows when 'settings' is active in the activity bar.
 * Provides quick access to common settings categories.
 */

interface SettingsCategory {
    id: string
    label: string
    icon: React.ElementType
    description?: string
}

export function SettingsPanel({
    categories,
    onSelectCategory
}: {
    categories?: SettingsCategory[]
    onSelectCategory?: (category: SettingsCategory) => void
}) {
    const { t } = useTranslation()

    const defaultCategories: SettingsCategory[] = [
        {
            id: 'appearance',
            label: t('settings.appearance', 'Appearance'),
            icon: SettingsIcon,
            description: t('settings.appearanceDesc', 'Theme, fonts, layout')
        },
        {
            id: 'editor',
            label: t('settings.editor', 'Editor'),
            icon: SettingsIcon,
            description: t('settings.editorDesc', 'Syntax, formatting')
        },
        {
            id: 'agents',
            label: t('settings.agents', 'Agents'),
            icon: SettingsIcon,
            description: t('settings.agentsDesc', 'AI providers, models')
        },
        {
            id: 'keyboard',
            label: t('settings.keyboard', 'Keyboard'),
            icon: SettingsIcon,
            description: t('settings.keyboardDesc', 'Shortcuts, bindings')
        },
    ]

    const items = categories || defaultCategories

    return (
        <div className="flex flex-col h-full">
            <SidebarHeader title={t('sidebar.settings', 'Settings')} />

            <div className="flex-1 overflow-auto p-2">
                {items.map((category) => (
                    <SettingsCategoryItem
                        key={category.id}
                        category={category}
                        onClick={() => onSelectCategory?.(category)}
                    />
                ))}
            </div>
        </div>
    )
}

function SettingsCategoryItem({
    category,
    onClick
}: {
    category: SettingsCategory
    onClick?: () => void
}) {
    const Icon = category.icon

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-3 text-left rounded-none",
                "hover:bg-secondary transition-colors group"
            )}
        >
            <div className="w-8 h-8 flex items-center justify-center bg-secondary group-hover:bg-accent rounded-none">
                <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                    {category.label}
                </p>
                {category.description && (
                    <p className="text-xs text-muted-foreground truncate">
                        {category.description}
                    </p>
                )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
        </button>
    )
}

export type { SettingsCategory }
