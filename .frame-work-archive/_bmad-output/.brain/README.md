# Brain Artifact System

Machine-parseable relational artifacts for long-term context.

## Structure

```
.brain/
├── sessions/     # Per-session metadata and outcomes
├── decisions/    # Architectural and technical decisions
├── violations/   # Governance violations log
├── impacts/      # Cross-session impact tracking
└── index.yaml    # Master index for quick lookup
```

## Usage

Query via:
- `grep "keyword" _bmad-output/.brain/decisions/*.yaml`
- `long-term-context` custom tool

## Schema

See individual directories for artifact schemas.
