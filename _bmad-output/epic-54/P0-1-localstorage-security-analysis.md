# P0-1: localStorage Encryption Security Analysis

**Date**: 2026-01-04
**Risk ID**: P0-1
**Status**: **REAL SECURITY VULNERABILITY** - Requires user decision on risk tolerance

## Executive Summary

**Claim**: "localStorage encryption keys in plaintext"
**Reality**: **CONFIRMED** - Vault password stored in plaintext, readable by XSS
**Risk Level**: **HIGH** for XSS attacks, **MITIGATED** for local-only apps

## Vulnerability Details

### Affected Code ([`credential-vault.ts:255`](../../src/lib/agent/providers/credential-vault.ts#L255))

```typescript
// ❌ VULNERABLE: Vault password stored in PLAINTEXT
private storeSessionPassword(password: string): void {
    localStorage.setItem(VAULT_PASSWORD_STORAGE, password);
}
```

### Attack Vector

1. XSS vulnerability injects malicious script
2. Script reads: `localStorage.getItem('vg_vp_v3')`
3. Attacker gets vault password
4. Attacker reads salt: `localStorage.getItem('vg_salt_v3')`
5. Attacker derives encryption key using PBKDF2
6. Attacker decrypts master key
7. Attacker decrypts all stored API keys (OpenAI, Anthropic, OpenRouter)

### What's Protected

✅ **API keys themselves** - Stored encrypted in IndexedDB via `credentials` table
✅ **Master key** - Encrypted before storage in localStorage
✅ **Encryption algorithm** - AES-256-GCM is strong

### What's NOT Protected

❌ **Vault password** - Stored in plaintext in localStorage
❌ **Encrypted master key** - Readable from localStorage (password can decrypt it)
❌ **Salt** - Readable from localStorage

## Risk Assessment

### Context Matters

| Environment | Risk Level | Reasoning |
|--------------|------------|-------------|
| **Local-only IDE** | LOW-MEDIUM | No remote attack vector, XSS requires local code execution |
| **Web-hosted version** | **HIGH** | XSS from any third-party script exposes keys |
| **Shared computer** | **MEDIUM** | Another user with local access could read localStorage |

### Current Mitigations

1. **Obfuscated key names** - `vg_vp_v3` instead of `vault_password` (security by obscurity)
2. **No external scripts** - IDE is local-first, minimal XSS surface
3. **Content Security Policy** - Should block inline scripts (verify if implemented)

## Fix Options (Requires User Decision)

### Option 1: Accept Risk (RECOMMENDED for local IDE)
**Scope**: 0 hours
**Action**: Document as known limitation, add CSP headers
**Rationale**:
- App is local-first with minimal XSS surface
- Requiring password on every reload breaks UX
- Users are responsible for their local security

**Implementation**:
```typescript
// Add to docs:
// SECURITY NOTE: Vault password stored in localStorage. If XSS vulnerability
// is introduced, stored API keys could be compromised. Users should:
// 1. Only run trusted code
// 2. Use browser extensions judiciously
// 3. Clear credentials after use on shared computers
```

### Option 2: Session-Only Vault (BREAKS PERSISTENCE)
**Scope**: 4-6 hours
**Action**: Store password only in memory, require re-entry on reload
**Impact**:
- ❌ User must re-enter vault password on every browser restart
- ❌ Breaks "remember API keys" feature
- ✅ Eliminates localStorage key exposure

**Implementation**:
```typescript
// Don't store password at all
private _sessionPassword: string | null = null;

async initialize(): Promise<void> {
    // Prompt user for password every session
    const password = await this.promptUserForPassword();
    if (!password) throw new Error('Password required');
    this._sessionPassword = password;
}
```

### Option 3: User Password System (12-16 hours)
**Scope**: 12-16 hours (as estimated)
**Action**: Require user to set master password, never store it
**Impact**:
- ✅ Strongest security
- ❌ Significant UX change
- ❌ Requires password reset mechanism
- ❌ Migration path for existing users

### Option 4: WebAuthn Biometric Lock (16-20 hours)
**Scope**: 16-20 hours
**Action**: Use WebAuthn for passwordless encryption/decryption
**Impact**:
- ✅ Best UX + security
- ✅ No password to remember
- ❌ Complex implementation
- ❌ Hardware requirement (TP2.0 key or biometric)

## Recommendation

**Given user constraints** ("stable foundation, no architecture changes"), recommend:

**Option 1 (Accept Risk)** with these mitigations:
1. Add Content Security Policy headers to Vite config
2. Add warning in Agent Config UI about credential security
3. Document security assumptions

**Rationale**:
- App is local-first (user's own machine)
- Minimal XSS surface (no third-party scripts)
- Breaking persistence (Option 2) violates "stable foundation" goal
- Larger fixes (Options 3-4) require architecture changes

## If User Wants Higher Security

Proceed with **Option 2 (Session-Only)**:
1. Store password only in memory
2. On app load, show "Vault Locked" UI
3. User enters password to unlock vault
4. Password cleared when browser tab closes

**Scope**: 4-6 hours
**Files to modify**:
- `credential-vault.ts` (remove localStorage password)
- `AgentConfigDialog.tsx` (add vault unlock UI)
- Add `VaultUnlockDialog.tsx` component

---

**End of P0-1 Analysis**
