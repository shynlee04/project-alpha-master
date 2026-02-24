---
name: min-max-strategy
description: Autonomous agent governance through minimum always-enforced and maximum context-triggered skill chains.
---

# Min-Max Strategy

> **Purpose**: Balance agent autonomy with governance requirements

## MIN (Always Enforced)

These skills are NON-NEGOTIABLE. Every conversation, every action.

| Skill | Trigger |
|-------|---------|
| `using-superpowers` | Conversation start |
| `brownfield-guard` | Any file operation |
| `context-first` | Before any implementation |
| `verification-before-completion` | Before any "done" claim |

**Enforcement**: Plugin's `chat.message` hook injects these unconditionally.

## MAX (Context-Triggered)

Full skill chains activated when risk detected:

| Context | Skill Chain |
|---------|-------------|
| Code request | brainstorming, writing-plans, context-first |
| Story work | story-load, tdd-red, sprint-update |
| Code review | adversarial-review, brownfield-guard |
| Architecture | architecture-remediation, domain-scanner |
| Bug fix | systematic-debugging, root-cause |
| Completion | verification, e2e-journey, dod-checklist |

**Enforcement**: Plugin detects context patterns → loads full chains.

## Autonomy Gradient

```
←─────────────────────────────────────────────────────→
MIN                                                MAX
(always)                                    (full chains)

using-superpowers ────→ context-first ────→ TRAP defenses
brownfield-guard ─────→ brainstorming ────→ full governance
verification ─────────→ story-cycle ──────→ all scanners
```

## Strategy Rules

1. **Never skip MIN** - Plugin blocks without MIN skills
2. **MAX scales with risk** - More complexity = more skills
3. **Bouncing loops enforce both** - Violations cascade corrections

## Agent Intelligence Boost

The more the agent follows MIN-MAX:
- Fewer bounces = more autonomy
- Pattern recognition improves
- Governance becomes invisible
