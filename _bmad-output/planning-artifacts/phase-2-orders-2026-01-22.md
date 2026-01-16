# Phase 2 Orders: BYOK System Implementation

**Date:** 2026-01-22
**Status:** READY_FOR_EXECUTION
**Source:** Master Plan Phase 2
**Dependencies:** Phase 1 Complete ✅

---

## 📋 PHASE 2 OVERVIEW

**Objective:** Complete BYOK (Bring Your Own Key) integration with all AI providers

**Priority:** P0 (Critical)
**Estimated Effort:** 10 hours
**Stories:** 4 (BYOK-01 through BYOK-04)

**Reference:** EPIC-BYOK in `epics.md`

---

## 🎯 PHASE 2 GOALS

1. **Complete vault integration** - All providers query vault for keys
2. **Update provider adapters** - Remove hardcoded keys, use vault
3. **Enforce permissions** - Per-use-case key selection
4. **Build key management UI** - Settings page for API keys

---

## 📊 TASK DISTRIBUTION

| Team | Tasks | Effort | Focus |
|------|-------|--------|-------|
| **Team A** | BYOK-01, BYOK-02 | 6 hours | Backend integration |
| **Team B** | BYOK-03, BYOK-04 | 4 hours | Permissions + UI |

---

## 🚀 TEAM A ORDERS

### Task BYOK-01: Complete Vault Integration

**Effort:** 4 hours
**Priority:** P0
**Dependencies:** None

**Objective:** Integrate credential vault with all AI providers

**Files to Create/Modify:**
- Create: `src/infrastructure/security/byok-vault-service.ts`
- Modify: `src/lib/agent/providers/anthropic-adapter.ts`
- Modify: `src/lib/agent/providers/openai-adapter.ts`
- Modify: `src/lib/agent/providers/gemini-adapter.ts`

**Sub-Tasks:**
1. **Create BYOKVaultService** (1 hour)
   - Implement `getKey(provider, workspace, useCase)` method
   - Add proper error handling for missing keys
   - Implement key validation
   - Add audit logging

2. **Update Anthropic Adapter** (1 hour)
   - Remove `hasApiKey: boolean` check
   - Call `BYOKVaultService.getKey()` at runtime
   - Handle missing key gracefully
   - Add error messages

3. **Update OpenAI Adapter** (1 hour)
   - Remove `hasApiKey: boolean` check
   - Call `BYOKVaultService.getKey()` at runtime
   - Handle missing key gracefully
   - Add error messages

4. **Update Gemini Adapter** (1 hour)
   - Remove `hasApiKey: boolean` check
   - Call `BYOKVaultService.getKey()` at runtime
   - Handle missing key gracefully
   - Add error messages

**Acceptance Criteria:**
- ✅ All providers query vault for keys
- ✅ No hardcoded keys in codebase
- ✅ Graceful fallback when key missing
- ✅ Error messages are clear
- ✅ Audit logging works

**Testing:**
- Test with valid API key
- Test with missing API key
- Test with invalid API key
- Verify audit logs

---

### Task BYOK-02: Provider Adapter Updates

**Effort:** 2 hours
**Priority:** P0
**Dependencies:** BYOK-01

**Objective:** Update all provider adapters to use vault

**Files to Modify:**
- `src/lib/agent/providers/anthropic-adapter.ts`
- `src/lib/agent/providers/openai-adapter.ts`
- `src/lib/agent/providers/gemini-adapter.ts`
- `src/lib/agent/providers/openrouter-adapter.ts`

**Sub-Tasks:**
1. **Remove Direct API Key Usage** (30 min)
   - Search for `apiKey` direct usage
   - Replace with vault calls
   - Remove any hardcoded keys

2. **Add Vault Dependency Injection** (30 min)
   - Pass BYOKVaultService to adapters
   - Update constructor signatures
   - Add type safety

3. **Update Provider Store** (30 min)
   - Remove `hasApiKey: boolean` from state
   - Add `keyStatus: 'valid' | 'missing' | 'invalid'`
   - Update UI to show key status

4. **Test All Providers** (30 min)
   - Test Anthropic integration
   - Test OpenAI integration
   - Test Gemini integration
   - Test OpenRouter integration

**Acceptance Criteria:**
- ✅ OpenAI adapter uses vault
- ✅ Anthropic adapter uses vault
- ✅ Gemini adapter uses vault
- ✅ OpenRouter adapter uses vault
- ✅ No direct API key usage
- ✅ Provider store updated

**Testing:**
- Test each provider with valid key
- Test each provider with missing key
- Verify no hardcoded keys remain

---

## 🚀 TEAM B ORDERS

### Task BYOK-03: Permission Enforcement

**Effort:** 2 hours
**Priority:** P0
**Dependencies:** BYOK-01

**Objective:** Implement permission levels and per-use-case key selection

**Files to Create/Modify:**
- Create: `src/domain/services/ai/permission-service.ts`
- Modify: `src/lib/agent/tools/` (all tools)
- Modify: `src/lib/agent/workspace-permission-manager.ts`

**Sub-Tasks:**
1. **Create PermissionService** (1 hour)
   - Implement permission levels (auto/prompt/block)
   - Add key access validation
   - Implement per-use-case key selection
   - Add permission checks

2. **Update Tool Permissions** (30 min)
   - Add permission checks to all tools
   - Implement approval workflow
   - Add permission logging
   - Update tool metadata

3. **Update Workspace Permissions** (30 min)
   - Integrate with PermissionService
   - Update permission UI
   - Add permission status indicators
   - Test permission enforcement

**Acceptance Criteria:**
- ✅ Tools check permissions before key access
- ✅ User prompted for sensitive operations
- ✅ Blocked operations clearly explained
- ✅ Permission levels work correctly
- ✅ Per-use-case key selection works

**Testing:**
- Test auto permission
- Test prompt permission
- Test block permission
- Test per-use-case selection

---

### Task BYOK-04: UI for Key Management

**Effort:** 4 hours
**Priority:** P1
**Dependencies:** BYOK-01

**Objective:** Build settings UI for managing API keys

**Files to Create/Modify:**
- Create: `src/presentation/components/settings/ApiKeyManager.tsx`
- Create: `src/presentation/components/settings/ApiKeyForm.tsx`
- Modify: `src/routes/settings.tsx`

**Sub-Tasks:**
1. **Create ApiKeyManager Component** (1.5 hours)
   - List all providers
   - Show key status for each
   - Add "Add Key" button
   - Add "Remove Key" button
   - Add validation status

2. **Create ApiKeyForm Component** (1.5 hours)
   - Input field for API key
   - Provider selector
   - Key validation
   - Save/Cancel buttons
   - Error messages

3. **Integrate with Settings** (30 min)
   - Add to settings page
   - Add navigation
   - Update settings layout
   - Add help text

4. **Test UI** (30 min)
   - Test adding keys
   - Test removing keys
   - Test validation
   - Test error handling

**Acceptance Criteria:**
- ✅ User can add API keys per provider
- ✅ Keys validated before storage
- ✅ Clear status indicators
- ✅ UI is responsive
- ✅ Error messages are clear

**Testing:**
- Test on desktop
- Test on mobile
- Test with valid keys
- Test with invalid keys

---

## 📋 PHASE 2 SUCCESS CRITERIA

### Overall Success Criteria

- ✅ All 4 tasks completed
- ✅ BYOK vault integrated with all providers
- ✅ No hardcoded keys in codebase
- ✅ Permission enforcement works
- ✅ Key management UI functional
- ✅ All tests pass
- ✅ TypeScript errors: 0
- ✅ Build passes

### Quality Gates

- [ ] No hardcoded API keys
- [ ] All providers use vault
- [ ] Permission levels work
- [ ] UI is responsive
- [ ] Error handling is robust
- [ ] Audit logging works
- [ ] Documentation updated

---

## 🚨 CRITICAL REMINDERS

### For Both Teams

1. **DO NOT modify original documents** - Use working copies
2. **Test thoroughly** - Don't skip testing
3. **Handle errors gracefully** - No silent failures
4. **Log everything** - Audit trail is critical
5. **TypeScript errors must be 0** - Before claiming complete

### For Team A

1. **Focus on backend integration** - Vault + providers
2. **Remove all hardcoded keys** - Search thoroughly
3. **Test each provider** - Don't assume they work the same
4. **Add error messages** - Users need to know what's wrong

### For Team B

1. **Focus on permissions + UI** - User-facing features
2. **Make UI responsive** - Must work on mobile
3. **Validate inputs** - Don't store invalid keys
4. **Test permissions** - All levels must work

---

## 📊 PHASE 2 TIMELINE

| Day | Team A | Team B |
|-----|--------|--------|
| **Day 1** | BYOK-01: Create BYOKVaultService | BYOK-03: Create PermissionService |
| **Day 2** | BYOK-01: Update providers | BYOK-03: Update tool permissions |
| **Day 3** | BYOK-02: Provider adapter updates | BYOK-04: Create ApiKeyManager |
| **Day 4** | BYOK-02: Test all providers | BYOK-04: Create ApiKeyForm |
| **Day 5** | Testing + Validation | BYOK-04: Integrate + Test |

**Total:** 5 days (10 hours per team)

---

## 📞 HANDOFF PROTOCOL

### When Complete

1. **Update epics.md** - Mark EPIC-BYOK stories as DONE
2. **Update master plan** - Mark Phase 2 as COMPLETE
3. **Create Phase 2 completion report** - Summary of changes
4. **Archive working copies** - Move to `_archive/phase-2-2026-01-22/`
5. **Notify coordinator** - Ready for Phase 3

### If Blocked

1. **Document blocker** - What's blocking progress
2. **Propose solution** - How to unblock
3. **Estimate delay** - How much extra time needed
4. **Notify coordinator** - Escalate if needed

---

## 🎯 NEXT STEPS

After Phase 2 completes:

1. **Phase 3:** Project Space Foundation (15 hours)
2. **Phase 4:** Agents vs LLMs (20 hours)
3. **Phase 5:** RAG Infrastructure (15 hours)

---

**Phase 2 Orders Document Version:** 1.0.0
**Created:** 2026-01-22
**Status:** READY_FOR_EXECUTION
**Next Review:** 2026-01-27 (after completion)