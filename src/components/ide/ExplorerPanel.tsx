import { useSidebar, SidebarHeader } from './IconSidebar'
import { useTranslation } from 'react-i18next'
import { PlusIcon, RefreshIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'

/**
 * ExplorerPanel - File explorer content panel
 * 
 * Shows when 'explorer' is active in the activity bar.
 * Displays the file tree for the current workspace.
 */
export function ExplorerPanel({
    children,
    onNewFile,
    onRefresh
}: {
    children?: React.ReactNode
    onNewFile?: () => void
    onRefresh?: () => void
}) {
    const { t } = useTranslation()

    return (
        <div className="flex flex-col h-full">
            <SidebarHeader
                title={t('sidebar.explorer', 'Explorer')}
                actions={
                    <>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onNewFile}
                            title={t('actions.newFile', 'New File')}
                        >
                            <PlusIcon className="w-4 h-4" aria-label={t('actions.newFile')} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onRefresh}
                            title={t('actions.refresh', 'Refresh')}
                        >
                            <RefreshIcon className="w-4 h-4" aria-label={t('actions.refresh')} />
                        </Button>
                    </>
                }
            />
            <div className="flex-1 overflow-auto p-2">
                {children || (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <FolderOpen className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">
                            {t('sidebar.noWorkspace', 'No workspace open')}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            {t('sidebar.openFolderHint', 'Open a folder to see files')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
