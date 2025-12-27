# E2E Verification Checklist Template

**Story**: {STORY-NAME}
**Story ID**: {STORY-ID}
**Epic**: {EPIC-ID}
**Verified By**: {DEVELOPER-NAME}
**Verification Date**: {YYYY-MM-DD}
**Artifact ID**: E2E-{STORY-ID}-{TIMESTAMP}

---

## Pre-Verification

### Code Quality
- [ ] Feature implemented according to acceptance criteria
- [ ] TypeScript build passes (`pnpm tsc --noEmit`)
- [ ] Unit tests passing (≥80% coverage)
- [ ] Development server running successfully
- [ ] No console errors or warnings in browser

### Documentation
- [ ] Code comments added where necessary
- [ ] Translation keys extracted (`pnpm i18n:extract`)
- [ ] API documentation updated (if applicable)
- [ ] Story acceptance criteria documented

---

## Browser E2E Verification

### Environment Setup
- [ ] Development server running on http://localhost:3000
- [ ] Cross-origin isolation headers verified (COOP/COEP)
- [ ] WebContainer booted successfully
- [ ] File system permissions granted (if applicable)

### Feature Testing
- [ ] **Browser E2E verification completed**
- [ ] Full user journey tested (not just component existence)
- [ ] All acceptance criteria validated in browser
- [ ] Edge cases tested
- [ ] Error handling verified

### Visual Verification
- [ ] **Screenshot/recording captured**
  - Screenshot path: `_bmad-output/e2e-verification/{story-id}/screenshot-{timestamp}.png`
  - Recording path: `_bmad-output/e2e-verification/{story-id}/recording-{timestamp}.webm`
- [ ] UI matches design specifications
- [ ] Responsive design tested (mobile/tablet/desktop)
- [ ] Accessibility verified (keyboard navigation, screen reader)
- [ ] Dark/light theme tested (if applicable)

### Performance Testing
- [ ] Page load time acceptable (<3 seconds)
- [ ] No memory leaks detected
- [ ] Smooth animations and transitions
- [ ] Efficient rendering (no unnecessary re-renders)

---

## Post-Verification

### Code Review
- [ ] Code review approved by peer
- [ ] All review comments addressed
- [ ] No blocking issues identified
- [ ] Security review passed (if applicable)

### Verification Artifacts
- [ ] Screenshot uploaded to `_bmad-output/e2e-verification/{story-id}/`
- [ ] Recording uploaded (if applicable)
- [ ] Verification checklist completed
- [ ] Test results documented

### Governance
- [ ] Story status updated to DONE in sprint-status-consolidated.yaml
- [ ] Verification artifacts linked in sprint status
- [ ] Next story identified and ready to start
- [ ] Handoff document created for next story

---

## Verification Notes

### Issues Found
- List any issues discovered during E2E verification:
  1.
  2.
  3.

### Workarounds Applied
- List any workarounds used during verification:
  1.
  2.
  3.

### Recommendations
- List recommendations for future improvements:
  1.
  2.
  3.

---

## Approval

**Developer Signature**: {DEVELOPER-NAME}
**Date**: {YYYY-MM-DD}

**Reviewer Signature**: {REVIEWER-NAME}
**Date**: {YYYY-MM-DD}

**Status**: [ ] APPROVED [ ] REJECTED [ ] NEEDS REVISION

---

## Artifact References

- Screenshot: `_bmad-output/e2e-verification/{story-id}/screenshot-{timestamp}.png`
- Recording: `_bmad-output/e2e-verification/{story-id}/recording-{timestamp}.webm`
- Checklist: `_bmad-output/e2e-verification/{story-id}/verification-{timestamp}.md`
- Sprint Status: `_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`
- Handoff: `_bmad-output/handoffs/dev-to-reviewer-{story-id}-{timestamp}.md`

---

**End of E2E Verification Checklist**
