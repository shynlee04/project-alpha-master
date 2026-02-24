// TEST FILE: This intentionally has architecture violations to test the enforcer

import { something } from '@/lib/utils'  // VIOLATION: LIB_IMPORT

export const useTestStore = create(
  persist((set) => ({
    projects: [],  // VIOLATION: ZUSTAND_PERSIST_DOMAIN
  }), { name: 'test-projects' })
)

export type ProjectId = string  // VIOLATION: TYPE_DUPLICATION
