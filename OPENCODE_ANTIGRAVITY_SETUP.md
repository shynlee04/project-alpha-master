# OpenCode Antigravity Configuration Summary
**Updated:** 2026-01-15
**Plugin Version:** opencode-antigravity-auth@beta

## Configuration Overview

Your OpenCode setup has been configured to optimize for coding projects with intelligent account rotation and model fallback strategies.

## Models Configured

### 1. Claude Opus 4.5 Thinking (Antigravity) - PRIMARY MODEL
- **Model ID:** `google/antigravity-claude-opus-4-5-thinking`
- **Variant:** `high` (32,768 thinking budget)
- **Usage:** This is your default model for all coding tasks
- **Context:** 200,000 tokens
- **Output:** 64,000 tokens
- **Modalities:** Text, Image, PDF

### 2. Gemini 3 Pro (Antigravity) - FALLBACK MODEL
- **Model ID:** `google/antigravity-gemini-3-pro`
- **Variant:** `high` (maximum thinking level)
- **Usage:** Used when Claude accounts are rate-limited
- **Context:** 1,048,576 tokens
- **Output:** 65,535 tokens
- **Modalities:** Text, Image, Video, Audio, PDF

### 3. Gemini 3 Pro Preview (Gemini CLI) - LAST RESORT
- **Model ID:** `google/gemini-3-pro-preview`
- **Variant:** `high` (maximum thinking level)
- **Usage:** Used only when all accounts exhaust both Antigravity and Gemini CLI quotas
- **Context:** 1,048,576 tokens
- **Output:** 65,535 tokens
- **Modalities:** Text, Image, Video, Audio, PDF

## Account Rotation Strategy

### Multi-Account Setup
You have **3 Google accounts** configured:
1. shynlee01@gmail.com
2. shynlee04@gmail.com
3. toan28040@gmail.com

### Rotation Logic
1. **Sticky Account Selection:** Uses the same account until rate-limited (preserves prompt cache)
2. **Automatic Rotation:** Switches to next account when rate-limited (429 error)
3. **Dual Quota Pools:** For Gemini models, tries both Antigravity and Gemini CLI quotas before switching accounts
4. **Per-Family Tracking:** Separate rate limits for Claude and Gemini models

### Fallback Hierarchy
```
Claude Opus 4.5 (Antigravity) → Account 1
    ↓ (rate-limited)
Claude Opus 4.5 (Antigravity) → Account 2
    ↓ (rate-limited)
Claude Opus 4.5 (Antigravity) → Account 3
    ↓ (all accounts rate-limited)
Gemini 3 Pro (Antigravity) → Account 1
    ↓ (rate-limited)
Gemini 3 Pro (Antigravity) → Account 2
    ↓ (rate-limited)
Gemini 3 Pro (Antigravity) → Account 3
    ↓ (all accounts rate-limited)
Gemini 3 Pro Preview (Gemini CLI) → Account 1
    ↓ (rate-limited)
Gemini 3 Pro Preview (Gemini CLI) → Account 2
    ↓ (rate-limited)
Gemini 3 Pro Preview (Gemini CLI) → Account 3
    ↓ (all accounts exhausted)
CYCLE BACK TO: Claude Opus 4.5 (Antigravity) → Account 1
```

## Enabled Strategies for Coding Projects

### 1. Session Recovery
- **Enabled:** `true`
- **Auto Resume:** `true`
- **Resume Text:** "continue"
- **Benefit:** Automatically recovers from `tool_result_missing` errors without manual intervention

### 2. Tool Hardening
- **Tool ID Recovery:** `true`
- **Claude Tool Hardening:** `true`
- **Benefit:** Fixes mismatched tool IDs and prevents tool parameter hallucination

### 3. Signature Cache (Experimental)
- **Enabled:** `true`
- **Memory TTL:** 1 hour
- **Disk TTL:** 48 hours
- **Benefit:** Preserves thinking blocks across requests for conversation continuity

### 4. Proactive Token Refresh
- **Enabled:** `true`
- **Refresh Buffer:** 30 minutes before expiry
- **Check Interval:** 5 minutes
- **Benefit:** Prevents authentication failures during long coding sessions

### 5. Quota Fallback
- **Enabled:** `true`
- **Benefit:** Doubles Gemini quota by trying both Antigravity and Gemini CLI pools before switching accounts

### 6. PID Offset
- **Enabled:** `true`
- **Benefit:** Distributes sessions across accounts when spawning parallel subagents

### 7. Switch on First Rate Limit
- **Enabled:** `true`
- **Benefit:** Immediately switches accounts on first 429 error (after 1s wait) for faster recovery

### 8. Empty Response Recovery
- **Max Attempts:** 4
- **Retry Delay:** 2 seconds
- **Benefit:** Handles transient API failures gracefully

## Usage Examples

### Default Usage (Claude Opus 4.5 High)
```bash
opencode run "Help me refactor this component" --model=google/antigravity-claude-opus-4-5-thinking --variant=high
```

### Force Gemini 3 Pro (Antigravity)
```bash
opencode run "Analyze this codebase" --model=google/antigravity-gemini-3-pro --variant=high
```

### Force Gemini 3 Pro Preview (Gemini CLI)
```bash
opencode run "Review this PR" --model=google/gemini-3-pro-preview --variant=high
```

## Configuration Files

### Main Config
- **Location:** `~/.config/opencode/opencode.json`
- **Contains:** Plugin list, model definitions, MCP servers

### Antigravity Config
- **Location:** `~/.config/opencode/antigravity.json`
- **Contains:** Strategy settings, recovery options, cache settings

### Accounts Config
- **Location:** `~/.config/opencode/antigravity-accounts.json`
- **Contains:** OAuth tokens, active account indices, rate limit reset times

## Monitoring and Debugging

### Enable Debug Logging
```bash
OPENCODE_ANTIGRAVITY_DEBUG=1 opencode
```

### Check Logs
```bash
tail -f ~/.config/opencode/antigravity-logs/*.log
```

### View Account Status
The plugin logs account switches:
```
[INFO] Using account 1/3 (shynlee01@gmail.com)
[INFO] Account 1/3 rate-limited, switching...
[INFO] Using account 2/3 (shynlee04@gmail.com)
```

## Troubleshooting

### If Authentication Fails
```bash
rm ~/.config/opencode/antigravity-accounts.json
opencode auth login
```

### If Models Not Found
The configuration already includes `"npm": "@ai-sdk/google"` in the provider section.

### If Rate Limits Persist
1. Check logs for specific error messages
2. Verify all 3 accounts are authenticated
3. Wait for rate limit reset times (logged in antigravity-accounts.json)

## Key Benefits for Coding Projects

1. **Maximum Uptime:** 3 accounts × 2 quota pools = 6x effective quota
2. **Intelligent Fallback:** Automatic model switching without manual intervention
3. **Prompt Cache Preservation:** Sticky account selection maintains cache efficiency
4. **Error Recovery:** Automatic recovery from common API errors
5. **Parallel Processing:** PID offset enables concurrent subagent sessions
6. **Thinking Preservation:** Signature cache maintains conversation continuity

## Next Steps

1. Test the configuration:
   ```bash
   opencode run "Hello, test the setup" --model=google/antigravity-claude-opus-4-5-thinking --variant=high
   ```

2. Monitor account rotation in logs during extended sessions

3. Adjust `max_rate_limit_wait_seconds` in `antigravity.json` if needed (currently 300s = 5 minutes)

4. Consider adding more accounts if you frequently hit rate limits (up to 10 accounts supported)

## Plugin Update

To update the plugin in the future:
```bash
rm -rf ~/.cache/opencode/node_modules/opencode-antigravity-auth
opencode
```

The plugin will automatically reinstall the latest version.

---

**Configuration Status:** ✅ Active and Optimized
**Accounts:** 3/10 (can add more)
**Models:** 3 (Claude Opus 4.5, Gemini 3 Pro Antigravity, Gemini 3 Pro CLI)
**Strategies:** All beneficial strategies enabled