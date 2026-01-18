/**
 * @fileoverview IDE File Gateway Hook
 * @module presentation/components/ide/MonacoEditor/hooks/useIdeFileGateway
 *
 * **CC-IDE-03**: Create hook for IDE file gateway integration
 *
 * Provides StorageGateway for MonacoEditor file operations.
 * Creates gateway using createIdeFileGateway() with project context.
 *
 * @epic EPIC-CC-IDE-FSA
 * @story CC-IDE-03
 * @author TEAM_B
 * @created 2026-01-18
 */

import { useMemo, useRef } from 'react';
import { useProjectContext } from '@/lib/workspace/ProjectContext';
import { createIdeFileGateway } from '@/infrastructure/filesystem/ide-file-gateway';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';

/**
 * Hook to provide IDE file gateway for MonacoEditor
 *
 * Creates and caches StorageGateway instance for IDE workspace.
 * Uses ProjectContext to get projectId and fsaHandle.
 *
 * @returns StorageGateway instance or null if not available
 *
 * @example
 * ```tsx
 * const gateway = useIdeFileGateway();
 *
 * // Read file
 * const data = await gateway.read('src/index.ts');
 * const content = new TextDecoder().decode(data);
 *
 * // Write file
 * const uint8Data = new TextEncoder().encode(content);
 * await gateway.write('src/index.ts', uint8Data);
 * ```
 */
export function useIdeFileGateway(): StorageGateway | null {
    const project = useProjectContextSafe();

    // Cache gateway in ref to prevent recreation on renders
    const gatewayRef = useRef<StorageGateway | null>(null);

    const gateway = useMemo(() => {
        // Gateway already created - return cached instance
        if (gatewayRef.current) {
            return gatewayRef.current;
        }

        // Need project ID and FSA handle to create gateway
        if (!project?.project || !project.fsaHandle) {
            console.warn('[useIdeFileGateway] Cannot create gateway: missing project or handle');
            return null;
        }

        try {
            // Create IDE file gateway using factory
            const gateway = createIdeFileGateway({
                projectId: project.project.id,
                fsaHandle: project.fsaHandle,
            });

            // Cache for future renders
            gatewayRef.current = gateway;

            console.log('[useIdeFileGateway] Gateway created:', {
                projectId: project.project.id,
                gateway: gateway.constructor.name,
            });

            return gateway;
        } catch (error) {
            console.error('[useIdeFileGateway] Failed to create gateway:', error);
            return null;
        }
    }, [project?.project?.id, project?.fsaHandle]);

    return gateway;
}

/**
 * Safe version of useProjectContext that returns null instead of throwing
 * when used outside of ProjectProvider.
 */
function useProjectContextSafe() {
    try {
        return useProjectContext();
    } catch (error) {
        console.warn('[useIdeFileGateway] Used outside ProjectProvider:', error);
        return null;
    }
}
