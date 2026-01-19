/**
 * PreviewPanel Component
 * 
 * Displays the running dev server in an iframe with controls for
 * refresh, open in new tab, focus mode, and device frame selection.
 * 
 * @module components/ide/PreviewPanel
 */

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Maximize2, X } from 'lucide-react';
import { useToast } from '../../ui/Toast';
import { type PreviewPanelProps, type DeviceFrame, DEVICE_FRAMES } from './types';

/**
 * PreviewPanel - Live preview of the running dev server
 * 
 * Features:
 * - Iframe display of dev server URL
 * - Refresh button to reload preview
 * - Open in new tab button (with limitation warning)
 * - Focus mode for near-fullscreen preview
 * - Device frame selector (desktop/tablet/mobile)
 * - Loading and waiting states
 */
export function PreviewPanel({ previewUrl, port }: PreviewPanelProps) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>('desktop');
    const [isFocusMode, setIsFocusMode] = useState(false);
    const { t } = useTranslation();
    const { toast } = useToast();

    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    const handleOpenInNewTab = useCallback(() => {
        if (previewUrl) {
            window.open(previewUrl, '_blank');
            toast(t('preview.newTabInfo'), 'info');
        }
    }, [previewUrl, t, toast]);

    const handleToggleFocusMode = useCallback(() => {
        setIsFocusMode(prev => !prev);
    }, []);

    // Handle ESC key to exit focus mode
    useEffect(() => {
        if (!isFocusMode) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsFocusMode(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFocusMode]);

    // Prevent body scroll when in focus mode
    useEffect(() => {
        if (isFocusMode) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isFocusMode]);

    const frameWidth = DEVICE_FRAMES[deviceFrame].width;

    // Common device selector component
    const DeviceSelector = () => (
        <div className="flex items-center gap-0.5">
            {(Object.keys(DEVICE_FRAMES) as DeviceFrame[]).map((frame) => {
                const Icon = {
                    desktop: Monitor,
                    tablet: Tablet,
                    mobile: Smartphone,
                }[frame];
                return (
                    <button
                        key={frame}
                        onClick={() => setDeviceFrame(frame)}
                        className={`p-1.5 rounded transition-colors ${deviceFrame === frame
                            ? 'text-cyan-400 bg-slate-800'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                        title={
                            frame === 'desktop'
                                ? t('ide.deviceDesktop')
                                : frame === 'tablet'
                                    ? t('ide.deviceTablet')
                                    : t('ide.deviceMobile')
                        }
                    >
                        <Icon className="w-4 h-4" />
                    </button>
                );
            })}
        </div>
    );

    // Common preview iframe component
    const PreviewIframe = ({ className = '' }: { className?: string }) => (
        <iframe
            key={refreshKey}
            src={previewUrl ?? ''}
            className={`w-full h-full border-0 bg-white ${className}`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            title="Preview"
        />
    );

    return (
        <>
            {/* Focus Mode Modal */}
            {isFocusMode && previewUrl && (
                <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col">
                    {/* Modal Header */}
                    <div className="h-12 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur shrink-0">
                        <div className="flex items-center gap-4">
                            <span className="text-cyan-400 font-semibold">via-gent</span>
                            <span className="text-sm text-slate-400">
                                {t('ide.preview')} {port && <span className="text-slate-500">:{port}</span>}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Device Selector */}
                            <DeviceSelector />

                            <div className="w-px h-5 bg-slate-700" />

                            {/* Refresh */}
                            <button
                                onClick={handleRefresh}
                                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                title={t('ide.refreshPreview')}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>

                            {/* Close Focus Mode */}
                            <button
                                onClick={handleToggleFocusMode}
                                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                                title={t('preview.exitFocusMode')}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                        <div
                            className="h-full transition-all duration-200 bg-white rounded-lg overflow-hidden shadow-2xl"
                            style={{
                                width: frameWidth === 'full' ? '100%' : `${frameWidth}px`,
                                maxWidth: '100%',
                                maxHeight: '100%',
                            }}
                        >
                            <PreviewIframe />
                        </div>
                    </div>

                    {/* ESC hint */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-600">
                        {t('preview.focusModeHint')}
                    </div>
                </div>
            )}

            {/* Normal Panel View */}
            <div className="h-full flex flex-col border-l border-slate-800">
                {/* Toolbar */}
                <div className="h-9 px-3 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                            {t('ide.preview')}
                        </span>
                        {port && (
                            <span className="text-xs text-slate-500">
                                :{port}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Device Frame Selector */}
                        {previewUrl && (
                            <div className="flex items-center gap-0.5 mr-2 border-r border-slate-700 pr-2">
                                {(Object.keys(DEVICE_FRAMES) as DeviceFrame[]).map((frame) => {
                                    const Icon = {
                                        desktop: Monitor,
                                        tablet: Tablet,
                                        mobile: Smartphone,
                                    }[frame];
                                    return (
                                        <button
                                            key={frame}
                                            onClick={() => setDeviceFrame(frame)}
                                            className={`p-1 rounded transition-colors ${deviceFrame === frame
                                                ? 'text-cyan-400 bg-slate-800'
                                                : 'text-slate-500 hover:text-slate-300'
                                                }`}
                                            title={
                                                frame === 'desktop'
                                                    ? t('ide.deviceDesktop')
                                                    : frame === 'tablet'
                                                        ? t('ide.deviceTablet')
                                                        : t('ide.deviceMobile')
                                            }
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={!previewUrl}
                            className="p-1 text-slate-500 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title={t('ide.refreshPreview')}
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Focus Mode Button */}
                        <button
                            onClick={handleToggleFocusMode}
                            disabled={!previewUrl}
                            className="p-1 text-slate-500 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title={t('preview.focusMode')}
                        >
                            <Maximize2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Open in New Tab */}
                        <button
                            onClick={handleOpenInNewTab}
                            disabled={!previewUrl}
                            className="p-1 text-slate-500 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title={t('ide.openInNewTab')}
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 flex items-center justify-center bg-slate-950 overflow-auto">
                    {previewUrl ? (
                        <div
                            className="h-full transition-all duration-200"
                            style={{
                                width: frameWidth === 'full' ? '100%' : `${frameWidth}px`,
                                maxWidth: '100%',
                            }}
                        >
                            <PreviewIframe />
                        </div>
                    ) : (
                        <div className="text-center px-6">
                            <div className="text-slate-500 text-sm mb-2">
                                {t('ide.waitingDevServer')}
                            </div>
                            <div className="text-slate-600 text-xs">
                                {t('ide.runDevCommand').split('npm run dev')[0]}
                                <code className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-400">npm run dev</code>
                                {t('ide.runDevCommand').split('npm run dev')[1] ?? ''}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
