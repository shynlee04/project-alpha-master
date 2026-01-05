# Module Handoff: S-003

**Session ID**: ASGL-20260105-155500
**Story ID**: S-003
**Title**: Add API Key Status Visual Indicators
**Target Module**: bmad-core
**Target Workflow**: dev-story
**Agent**: dev

## Objective
Improve UX for API key configuration (CRIT-001) by adding visual indicators for key status and decoupling toast notifications from the potentially slow model fetch process.

## Constraints
1. **Design**: 8-bit only, no glassmorphism
2. **Mobile**: Touch targets ≥44px
3. **i18n**: All strings via t()
4. **Wires**: Track all migrations in pending-wires.yaml

## Acceptance Criteria
- Create `ProviderStatusBadge` component
- Badge shows: "Configured" (Green), "Missing" (Yellow), "Error" (Red)
- Toast notification should be immediate on key save ("Key saved"), then "Models loaded" later.

## Validation Commands
- `pnpm typecheck`
