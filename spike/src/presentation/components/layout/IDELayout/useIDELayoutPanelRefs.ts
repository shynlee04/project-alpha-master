/**
 * IDE Layout Panel Refs Hook
 *
 * Manages resizable panel refs.
 *
 * @layer Presentation
 * @hook useIDELayoutPanelRefs
 */

import { useRef } from 'react';

interface UseIDELayoutPanelRefsResult {
    mainPanelGroupRef: React.RefObject<any>;
    centerPanelGroupRef: React.RefObject<any>;
    editorPanelGroupRef: React.RefObject<any>;
}

/**
 * Hook to manage panel refs
 */
export function useIDELayoutPanelRefs(): UseIDELayoutPanelRefsResult {
    const mainPanelGroupRef = useRef<any>(null);
    const centerPanelGroupRef = useRef<any>(null);
    const editorPanelGroupRef = useRef<any>(null);

    return {
        mainPanelGroupRef,
        centerPanelGroupRef,
        editorPanelGroupRef
    };
}
