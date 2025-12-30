/**
 * @fileoverview useAgentChatArtifacts Hook
 * @module components/ide/hooks/useAgentChatArtifacts
 * @governance EPIC-31
 * @ai-observable true
 *
 * Custom hook for managing artifact operations in AgentChatPanel.
 * Handles artifact preview, save, and mobile-specific error handling.
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDeviceType } from '@/hooks/useMediaQuery';
import type { RefObject } from 'react';

export interface UseAgentChatArtifactsProps {
    /** Local adapter ref for file operations */
    localAdapterRef: RefObject<any>;
}

export interface UseAgentChatArtifactsReturn {
    /** Preview artifact in new tab */
    handlePreviewArtifact: (code: string) => void;
    /** Save artifact to file system */
    handleSaveArtifact: (code: string, language: string) => Promise<void>;
}

/**
 * Map language to file extension
 */
function getLanguageExtension(language: string): string {
    const extensionMap: Record<string, string> = {
        'html': '.html',
        'css': '.css',
        'javascript': '.js',
        'js': '.js',
        'typescript': '.ts',
        'ts': '.ts',
        'json': '.json',
        'md': '.md',
        'markdown': '.md',
    };
    return extensionMap[language] || '.txt';
}

/**
 * Hook for managing artifact operations in AgentChatPanel
 */
export function useAgentChatArtifacts({
    localAdapterRef,
}: UseAgentChatArtifactsProps): UseAgentChatArtifactsReturn {
    const { t } = useTranslation();
    const { isMobile, isTablet } = useDeviceType();

    /**
     * Preview artifact in new browser tab
     */
    const handlePreviewArtifact = useCallback((code: string) => {
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast.info(t('preview.newTabInfo', 'Opened preview in new tab'));
    }, [t]);

    /**
     * Save artifact to local file system
     */
    const handleSaveArtifact = useCallback(async (code: string, language: string) => {
        // Mobile-specific error handling
        if (isMobile || isTablet) {
            toast.error(
                t('errors.ide.openOnMobile.title', 'Desktop Feature'),
                t('errors.ide.openOnMobile.description', 'This feature is available on desktop browsers only. Please access from Chrome, Edge, or Safari on a computer.')
            );
            return;
        }

        const extension = getLanguageExtension(language);
        const suggestedPath = `artifact-${Date.now()}${extension}`;
        const path = window.prompt(t('chat.artifact.savePrompt', 'Enter file path'), suggestedPath);

        if (path) {
            try {
                if (localAdapterRef.current) {
                    await localAdapterRef.current.writeFile(path, code);
                    toast.success(t('chat.codeBlock.saved', 'File saved successfully'));
                } else {
                    toast.error(t('errors.fs.notSupported.description'), t('errors.fs.notSupported.mobileHint'));
                }
            } catch (err) {
                console.error('Failed to save artifact:', err);
                if (isMobile || isTablet) {
                    toast.error(
                        t('errors.ide.openOnMobile.title', 'Desktop Feature'),
                        t('errors.ide.openOnMobile.description', 'This feature is available on desktop browsers only. Please access from Chrome, Edge, or Safari on a computer.')
                    );
                } else {
                    toast.error(t('errors.generic.unexpected.description'), t('errors.actions.retry'));
                }
            }
        }
    }, [localAdapterRef, t, isMobile, isTablet]);

    return {
        handlePreviewArtifact,
        handleSaveArtifact,
    };
}
