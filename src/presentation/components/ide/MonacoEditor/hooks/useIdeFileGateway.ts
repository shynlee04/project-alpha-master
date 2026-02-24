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

import { useProjectContext } from '@/infrastructure/context/project-context';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';

/**
 * Hook to provide IDE file gateway for MonacoEditor
 *
 * Gets gateway directly from ProjectContext (already initialized).
 * No need to create new gateway - provider manages lifecycle.
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
    try {
        // Get gateway directly from ProjectContext
        const { gateway } = useProjectContext();
        return gateway;
    } catch (error) {
        console.warn('[useIdeFileGateway] Used outside ProjectContextProvider:', error);
        return null;
    }
}
