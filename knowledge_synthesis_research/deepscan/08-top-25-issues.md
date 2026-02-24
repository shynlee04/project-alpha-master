# Deepscan Final Report: Top 25 Prioritized Issues

**Date:** 2026-01-03
**Status:** Finalized

## Critical (Immediate Action)
1. **Refactor `knowledge-store.ts`:** Split "God Store" (~27kb) into `KnowledgeDataStore` (Persisted) and `KnowledgeUIStore` (Ephemeral). Risk: Maintainability, Performance.
2. **Move Dexie Infrastructure:** Relocate `src/lib/state/dexie-*.ts` to `src/infrastructure/persistence/dexie/`. Violation: Clean Architecture.
3. **Agent Input Sanitization:** Audit `AgentIO.ts` and `prompt-composer.ts` for strict string sanitization to prevent injection. Risk: Security.
4. **404/Error Handling:** Create branded `NotFound` and `GlobalError` boundaries in `router.tsx`. Gap: UX Polish.
5. **Empty States:** Add "Get Started" UI for `ExplorerPanel` (empty folder) and `KnowledgeGraph` (no nodes). Gap: User Onboarding.

## High (Next Sprint)
6. **Mobile Code Toolbar:** Implement a helper toolbar for `MonacoEditor` on mobile (Tab, Brackets). Gap: Mobile Usability.
7. **Network Resiliency Tests:** Add integration tests for `SyncManager` simulating offline/interrupted states. Risk: Data Integrity.
8. **Workspace Loading Skeletons:** Implement `pendingComponent` in Router for heavy workspaces (`/knowledge`, `/ide`). Gap: UX Perceived Performance.
9. **Touch Gestures:** Add swipe-to-close for Sidebar on mobile. Gap: Mobile Expectations.
10. **Telemetry/Logging:** Connect `SyncTransactionLog` to a monitoring service (or local debug log viewer). Gap: Observability.

## Medium (Tech Debt)
11. **Workspace Metadata Registry:** Move icons/colors from `WorkspaceEnhancedSwitcher.tsx` to `src/domain/constants/workspaces.ts`.
12. **Bottom Sheet Navigation:** Convert Settings/Agents panels to Drawers on mobile.
13. **Accessibility Audit:** Add `aria-label` to all icon-only buttons in `AgentChatPanel`.
14. **Conflict Resolution UI:** Expose a "Resolve Conflict" UI for FSA sync collisions (currently opaque).
15. **Cross-Browser FSA Fallback:** Verify/Implement fallback for Firefox/Safari (if not using a polyfill).

## Low (Polish)
16. **Keyboard Navigation:** Audit Tab order in `BentoGrid`.
17. **Toast Notifications:** Add "Offline/Online" toast notifications.
18. **Strict Module Boundaries:** Enforce `src/modules` structure for future features (e.g., Flashcards).
19. **Unit Test Coverage:** Increase coverage for `directory-walker.ts` (edge cases).
20. **Dependency Update:** Check for unused deps in `package.json` (routine).

## Future/Research
21. **CoT Visualizer:** Visualize `deep-think` steps in the UI.
22. **Voice Mode:** Enable `multimodal` audio input in Chat.
23. **Plugin System:** Formalize `src/hub` for 3rd party extensions.
24. **Local LLM:** Investigate WebLLM integration for offline inference.
25. **P2P Sync:** Explore WebRTC for direct device-to-device sync (bypassing cloud).
