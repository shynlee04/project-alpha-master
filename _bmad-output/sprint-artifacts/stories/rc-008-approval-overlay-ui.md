# Story: RC-008 - Approval Overlay UI

**Story ID:** rc-008-approval-overlay-ui
**Sprint:** 27B
**Priority:** HIGH (HIGH-005)
**Status:** ready-for-dev
**Estimated Points:** 8
**Owner:** Team A

## Issue Description

The tool permission system (Epic 4 Story 3) has working backend logic but lacks the UI overlay for user approval of sensitive tool operations. When an agent requests permission to execute a potentially dangerous tool, users cannot approve or deny the request.

## Root Cause

Epic 4 implemented the permission backend (`tool-permission-manager.ts`) but UI implementation was deferred. The Ralph Loop validation identified this as a blocking gap for agent tool execution.

## Acceptance Criteria

1. [ ] `ApprovalOverlay` component renders when tool execution requires approval
2. [ ] Overlay displays:
   - Tool name and description
   - Parameters that will be executed (sanitized)
   - Risk level indicator (LOW, MEDIUM, HIGH, CRITICAL)
   - "Allow Once", "Allow Always", "Deny" buttons
3. [ ] Overlay blocks execution until user decision
4. [ ] Mobile-responsive design (per Epic 1 requirements)
5. [ ] i18n support for English and Vietnamese
6. [ ] Animation: smooth fade-in with 8-bit styling theme
7. [ ] Keyboard navigation: Escape to deny, Enter to allow
8. [ ] Screen reader announcements for accessibility
9. [ ] Tests cover: rendering, decision handling, keyboard, mobile (20+ tests)

## Technical Approach

```typescript
interface ApprovalOverlayProps {
  request: PermissionRequest;
  onDecision: (decision: ApprovalDecision) => void;
  onCancel?: () => void;
}

type ApprovalDecision =
  | { type: 'ALLOW_ONCE'; temporary: true }
  | { type: 'ALLOW_ALWAYS'; permanent: true }
  | { type: 'DENY'; temporary: false };

// Component Pattern
function ApprovalOverlay({ request, onDecision, onCancel }: ApprovalOverlayProps) {
  const { t } = useTranslation();
  const [isExiting, setIsExiting] = useState(false);

  const handleDecision = (decision: ApprovalDecision) => {
    setIsExiting(true);
    setTimeout(() => onDecision(decision), 150); // Wait for animation
  };

  return (
    <div className="approval-overlay-backdrop" role="dialog" aria-modal="true">
      <div className={`approval-overlay ${isExiting ? 'exiting' : ''}`}>
        <RiskIndicator level={request.riskLevel} />
        <ToolInfo tool={request.tool} params={request.params} />
        <ActionButtons
          onAllowOnce={() => handleDecision({ type: 'ALLOW_ONCE', temporary: true })}
          onAllowAlways={() => handleDecision({ type: 'ALLOW_ALWAYS', permanent: true })}
          onDeny={() => handleDecision({ type: 'DENY', temporary: false })}
        />
      </div>
    </div>
  );
}
```

## Dependencies

- `src/lib/agent/tools/tool-permission-manager.ts` - Permission backend
- `src/components/agent/AgentChatPanel.tsx` - Integration point
- Epic 1 design tokens and animations

## Files to Create

- `src/components/ui/ApprovalOverlay.tsx` - Main component
- `src/components/ui/ApprovalOverlay.css` - 8-bit styled animations
- `src/components/ui/__tests__/ApprovalOverlay.test.tsx` - Component tests
- `src/i18n/en.json` - Add translation keys
- `src/i18n/vi.json` - Add translation keys

## Files to Modify

- `src/components/agent/AgentChatPanel.tsx` - Integrate overlay

## Test Strategy

1. **Render Tests**: Overlay displays for different risk levels
2. **Decision Tests**: Each button triggers correct decision callback
3. **Keyboard Tests**: Escape and Enter keys work
4. **A11y Tests**: ARIA roles, focus management, screen reader
5. **Mobile Tests**: Responsive layout on mobile breakpoints

## Definition of Done

- [ ] All AC satisfied
- [ ] 20+ tests passing (100%)
- [ ] Code reviewed
- [ ] Integration validated with tool permission manager
- [ ] sprint-status.yaml updated

## Notes

The overlay should use the 8-bit gaming aesthetic from Epic 1 with appropriate animations.

---

**Created:** 2025-12-29
**Last Updated:** 2025-12-29
