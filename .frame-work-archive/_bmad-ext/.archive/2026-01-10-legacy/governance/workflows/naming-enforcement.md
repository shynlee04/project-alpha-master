# Naming Convention Enforcement Workflow

**Workflow ID**: `@bmad/modules/governance/workflows/naming-enforcement`
**Version**: 1.0.0
**Created**: 2026-01-06
**description**: Enforce strict naming conventions across all BMAD artifacts

---

## Naming Convention Standard

### Artifact ID Format

```
{PREFIX}-{DOMAIN}-{SEQUENCE}
```

**Components**:
- `PREFIX`: 2-4 letter module code
- `DOMAIN`: Feature/area identifier
- `SEQUENCE`: Zero-padded 3-digit number

**Examples**:
- `ARC-STORE-001` (Architecture remediation, store work, item 1)
- `E2-MODAL-003` (Epic 2, modal work, item 3)
- `DS-SCAN-001` (Deep-scan, scan work, item 1)

### Prefix Registry

| Prefix | Module | Domain |
|--------|--------|--------|
| `ARC` | architecture-remediation | Store/component refactoring |
| `E2` | Epic 2 | Multimodal input system |
| `DS` | deep-scan | Diagnostics |
| `GOV` | governance | Artifact lifecycle |
| `IMP` | implementation | Domain-specific workflows |
| `QA` | quality | Quality assurance |

### File Naming by Tier

| Tier | Pattern | Example | Date Format |
|------|---------|---------|-------------|
| Tier 1 (Standards) | `{name}.md` | `coding-style.md` | None (permanent) |
| Tier 2 (SSOT) | `{name}.md` | `AGENTS.md` | None (permanent) |
| Tier 3 (Medium-live) | `{type}-{YYYY-MM-DD}.{ext}` | `sprint-status-2026-01-06.md` | ISO 8601 |
| Tier 4 (Short-live) | `{story-id}-{type}-{seq}.{ext}` | `ARC-STORE-001-handoff.md` | In ID |

### Date Format Standard

**Required Format**: `YYYY-MM-DD`

**Examples**:
- ✅ `2026-01-06`
- ✅ `2026-12-31`
- ❌ `01-06-2026` (wrong order)
- ❌ `2026/01/06` (wrong separator)
- ❌ `20250106` (missing separators)

**Timestamp Format**: `YYYY-MM-DDTHH:mm:ssZ`

**Examples**:
- ✅ `2026-01-06T10:30:00Z`
- ✅ `2026-12-31T23:59:59Z`

## Agent Validation

### Before Creating Artifact

```typescript
interface NamingValidation {
  valid: boolean;
  errors: string[];
  corrected?: string;
}

function validateArtifactName(tier: number, name: string): NamingValidation {
  const errors = [];

  if (tier === 4) {
    // Short-live: {prefix}-{domain}-{seq}-{type}.{ext}
    const pattern = /^([A-Z0-9]+)-([A-Z0-9]+)-(\d{3})-([a-z-]+)\.(md|yaml)$/;

    if (!pattern.test(name)) {
      errors.push(`Must match {prefix}-{domain}-{seq}-{type}.{ext}`);
    }
  }

  if (tier === 3) {
    // Medium-live: {type}-{YYYY-MM-DD}.{ext}
    const pattern = /^([a-z-]+)-(\d{4}-\d{2}-\d{2})\.(md|yaml)$/;

    if (!pattern.test(name)) {
      errors.push(`Must match {type}-{YYYY-MM-DD}.{ext}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Auto-Correction

```yaml
auto_correction_rules:
  - detect: "snake_case in filename"
    correct_to: "kebab-case"
    example: "sprint_status_2026-01_06.md" → "sprint-status-2026-01-06.md"

  - detect: "camelCase in filename"
    correct_to: "kebab-case"
    example: "courseCorrection-2026-01-06.md" → "course-correction-2026-01-06.md"

  - detect: "wrong date format"
    correct_to: "YYYY-MM-DD"
    example:
      - "01-06-2026" → "2026-01-06"
      - "2026/01/06" → "2026-01-06"
      - "20250106" → "2026-01-06"
```

## File Creation Enforcement

### Agent Workflow

```typescript
// All agents MUST use this pattern when creating artifacts

async function createArtifact(
  tier: number,
  type: string,
  content: string,
  metadata: ArtifactMetadata
): Promise<string> {

  // 1. Generate name according to tier
  const name = generateArtifactName(tier, type, metadata);

  // 2. Validate name
  const validation = validateArtifactName(tier, name);
  if (!validation.valid) {
    throw new Error(`Invalid artifact name: ${validation.errors.join(', ')}`);
  }

  // 3. Add frontmatter
  const frontmatter = generateFrontmatter(tier, metadata);
  const contentWithFrontmatter = frontmatter + '\n' + content;

  // 4. Write to correct location
  const path = getArtifactPath(tier, name);
  await writeFile(path, contentWithFrontmatter);

  // 5. Register in artifact registry
  await registerArtifact(name, metadata);

  return path;
}

function generateArtifactName(tier: number, type: string, metadata: ArtifactMetadata): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  switch (tier) {
    case 1:
    case 2:
      return `${metadata.name}.${metadata.ext || 'md'}`;

    case 3:
      return `${type}-${date}.${metadata.ext || 'md'}`;

    case 4:
      return `${metadata.story_id}-${type}-${String(metadata.seq).padStart(3, '0')}.md`;

    default:
      throw new Error(`Invalid tier: ${tier}`);
  }
}
```

## Directory Structure

```
_bmad-output/
├── handoffs/                    # Tier 4 - Short-live (5 days)
│   ├── 2026-01-06/
│   │   ├── ARC-STORE-001-handoff.md
│   │   ├── ARC-STORE-001-validation.md
│   │   └── E2-MODAL-003-report.md
│   └── _archive/
│       └── 2025-12/             # Previous month archives
├── sprint-artifacts/            # Tier 3 - Medium-live (90 days)
│   ├── 2026-01/
│   │   ├── sprint-status-2026-01-06.yaml
│   │   └── epic-breakdown-2026-01-05.md
│   └── archive/                 # Archives >90 days
├── reports/                     # Tier 3 - Deep-scan outputs
│   └── deep-scan/
│       ├── DEEP-SCAN-STATE-2026-01-06.md
│       └── MASTER-RISK-REGISTER-2026-01-06.md
└── governance/                  # Tier 3 - Governance tracking
    ├── orphans-2026-01-06.yaml
    └── artifact-registry.yaml
```

## Naming Quick Reference

| Artifact Type | Tier | Template | Example |
|---------------|------|----------|---------|
| Story handoff | 4 | `{story-id}-handoff-{seq}.md` | `ARC-STORE-001-handoff.md` |
| Validation report | 4 | `{story-id}-validation-{seq}.md` | `ARC-STORE-001-validation.md` |
| Test report | 4 | `{story-id}-test-{seq}.md` | `ARC-STORE-001-test.md` |
| Sprint status | 3 | `sprint-status-{YYYY-MM-DD}.yaml` | `sprint-status-2026-01-06.yaml` |
| Research artifact | 3 | `research-{topic}-{YYYY-MM-DD}.md` | `research-react19-2026-01-06.md` |
| Deep-scan report | 3 | `DEEP-SCAN-{TYPE}-{YYYY-MM-DD}.md` | `DEEP-SCAN-STATE-2026-01-06.md` |
| Standard | 1 | `{name}.md` | `coding-style.md` |
| SSOT | 2 | `{name}.md` | `AGENTS.md` |

## Success Criteria

- [ ] All artifacts follow tier-specific naming convention
- [ ] Date format strictly `YYYY-MM-DD`
- [ ] Timestamp format strictly `YYYY-MM-DDTHH:mm:ssZ`
- [ ] Artifact IDs follow `{PREFIX}-{DOMAIN}-{SEQUENCE}`
- [ ] No snake_case or camelCase in filenames
- [ ] All agents validate names before creation
- [ ] Auto-correction applied where possible
- [ ] Registry tracks all artifacts with correct names

---

**Workflow Owner**: @bmad/modules/governance
**Last Updated**: 2026-01-06
**Status**: ACTIVE
