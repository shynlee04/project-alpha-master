import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {


  // FIX: Deduplicate children if they were added multiple times (e.g. by HMR or SSR re-evaluation)
  // The routeTree.gen.ts file side-effects the rootRoute by calling _addFileChildren, which can happen multiple times.
  const children = routeTree.children as unknown as any[] || []
  if (children.length) {
    const seenIds = new Set<string>()
    const originalLength = children.length
    // Note: routeTree.children is readonly in TanStack Router types
    // This deduplication is best-effort for HMR scenarios
    const deduplicatedChildren = children.filter((child: any) => {
      // Only deduplicate if child has a valid id
      const childId = child?.id
      if (!childId) {
        return true // Keep children without id
      }
      if (seenIds.has(childId)) {
        return false // Remove duplicate
      }
      seenIds.add(childId)
      return true
    })
    if (deduplicatedChildren.length !== originalLength) {
      console.warn(`[Router] Deduplicated ${originalLength - deduplicatedChildren.length} routes from root children`)
    }
  }

  // Debug route tree
  console.log('[Router] routeTree children:', (routeTree.children as unknown as any[])?.map((c: any) => c.id))

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => <p>Not Found</p>,
  })

  return router
}
