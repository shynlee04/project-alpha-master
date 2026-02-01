/**
 * @fileoverview DEPRECATED - Temp Project stub
 * @deprecated This module is deprecated. Use ProjectService instead.
 */

/** @deprecated */
export interface TempProjectMetadata {
  id: string;
  isTemp: boolean;
  createdAt: Date;
}

/** @deprecated Use ProjectService for temporary projects */
export const tempProject = {
  create: async (): Promise<{ id: string }> => ({
    id: `temp-${Date.now()}`,
  }),
  delete: async () => {},
  isTemp: (project: { isTemp?: boolean }) => project.isTemp === true,
};

/** @deprecated */
export function createTempProject(): Promise<{ id: string }> {
  return tempProject.create();
}

/**
 * @deprecated Use ProjectService for temp projects
 * Stub function for backward compatibility - returns object with id
 */
export async function getOrCreateTempProject(): Promise<{ id: string }> {
  console.warn('getOrCreateTempProject is deprecated. Use ProjectService instead.');
  return tempProject.create();
}
