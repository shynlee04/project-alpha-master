# ============================================================================
# TIMESTAMP VALIDATION & AUTO-RERUN SYSTEM
# ============================================================================
# Purpose: Automatically check artifact freshness and trigger reruns
# Version: 1.0.0
# Updated: 2026-01-08
#
# Rules:
#   - Tier 1 (Constitution): Never stale, always load
#   - Tier 2 (Controlled): Load on-demand, validate status
#   - Tier 3 (Archival): Stale after 90 days
#   - Tier 4 (Ephemeral): Stale after 24 hours
#
# Auto-Rerun Thresholds:
#   - Validation artifacts: >1 hour
#   - Investigation artifacts: >1 hour
#   - Scan/Diagnostic artifacts: >1 hour
#   - Architecture artifacts: >24 hours
#   - Codebase analysis: >24 hours
# ============================================================================

import { unlinkSync, existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

// ============================================================================
# TYPES & INTERFACES
# ============================================================================

type Tier = 1 | 2 | 3 | 4;
type ArtifactStatus = 'fresh' | 'stale' | 'expired' | 'not_found';

interface ArtifactMetadata {
  path: string;
  tier: Tier;
  created_at: string;
  last_updated: string;
  status: 'validated' | 'outdated' | 'draft';
  auto_rerun_threshold_hours?: number;
}

interface TimestampCheckResult {
  artifact: string;
  status: ArtifactStatus;
  age_hours: number;
  should_rerun: boolean;
  reason: string;
}

interface ValidationConfig {
  project_root: string;
  now: Date;
  debug_mode: boolean;
}

# ============================================================================
# TIER DEFINITIONS
# ============================================================================

TIER_TTL = {
  1: null,           # Permanent - never expires
  2: null,           # Controlled - validate status field only
  3: 90 * 24 * 3600, # Archival - 90 days in seconds
  4: 24 * 3600,      # Ephemeral - 24 hours in seconds
}

AUTO_RERUN_THRESHOLDS = {
  # Validation/Check operations - 1 hour
  'validation': 1,
  'check': 1,
  'verify': 1,
  'scan': 1,
  'diagnostic': 1,
  'investigation': 1,
  'investigate': 1,
  'audit': 1,

  # Architecture/Analysis - 24 hours
  'architecture': 24,
  'analysis': 24,
  'codebase': 24,
  'component': 24,
  'state': 24,
  'api': 24,

  # Planning - 7 days
  'prd': 24 * 7,
  'epic': 24 * 7,
  'story': 24 * 7,
  'sprint': 24 * 7,

  # UX/Design - 7 days
  'ux': 24 * 7,
  'design': 24 * 7,
  'wireframe': 24 * 7,
}

# ============================================================================
# TIER DETECTION FROM FILE PATHS
# ============================================================================

TIER_1_PATHS = [
  'CLAUDE.md',
  'AGENTS.md',
  '.claude/rules/',
  '_bmad/core/config.yaml',
  '_bmad/modules/*/MANIFEST.md',
]

TIER_2_PATHS = [
  '_bmad-output/project-planning-artifacts/',
  '_bmad-output/planning-artifacts/',
  '_bmad-output/epics.md',
]

TIER_3_PATHS = [
  '_bmad-output/scans/',
  '_bmad-output/research/',
  '_bmad-output/architecture/',
  '_bmad-output/documentation/',
]

TIER_4_PATHS = [
  '_bmad-output/continuation-capsules/',
  '_bmad-output/handoffs/',
  '_bmad-output/.cache/',
  '.cache/',
]

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_tier_from_path(file_path: str, project_root: str) -> Tier:
  """Determine tier from file path."""
  relative_path = file_path.replace(project_root, '').lstrip('/')

  # Check Tier 1 (Constitution)
  for tier1 in TIER_1_PATHS:
    if tier1 in relative_path or relative_path.endswith(tier1):
      return 1

  # Check Tier 2 (Controlled)
  for tier2 in TIER_2_PATHS:
    if tier2 in relative_path:
      return 2

  # Check Tier 3 (Archival)
  for tier3 in TIER_3_PATHS:
    if tier3 in relative_path:
      return 3

  # Default to Tier 4 (Ephemeral)
  return 4

def get_auto_rerun_threshold(file_path: str) -> int | None:
  """Determine auto-rerun threshold from filename/path keywords."""
  lower_path = file_path.lower()

  for keyword, hours in AUTO_RERUN_THRESHOLDS.items():
    if keyword in lower_path:
      return hours

  return None

def parse_timestamp_from_path(file_path: str) -> Date | None:
  """Extract timestamp from filename if present (format: YYYY-MM-DD)."""
  match = file_path.search(r'(\d{4}-\d{2}-\d{2})')
  if match:
    return new Date(match.group(1))

  # Also check for ISO timestamps
  match_iso = file_path.search(r'(\d{4}-\d{2}-\d{2}[T ]\d{2}-\d{2})')
  if match_iso:
    return new Date(match_iso.group(1).replace(' ', 'T').replace('-', ':') + ':00')

  return None

def parse_yaml_frontmatter(file_path: str) -> dict:
  """Parse YAML frontmatter from markdown file."""
  try:
    content = readFileSync(file_path, 'utf-8')
    match = content.match(r'^---\n(.*?)\n---')
    if match:
      # Simple YAML parser for common fields
      frontmatter = {}
      for line in match.group(1).split('\n'):
        if ':' in line:
          key, value = line.split(':', 1)
          frontmatter[key.strip()] = value.strip()
      return frontmatter
  except:
    pass
  return {}

# ============================================================================
# TIMESTAMP VALIDATION
# ============================================================================

class TimestampValidator:
  def __init__(self, config: ValidationConfig):
    self.config = config
    self.project_root = config.project_root
    self.now = config.now
    self.debug_mode = config.debug_mode

  def check_artifact_freshness(self, file_path: str) -> TimestampCheckResult:
    """
    Check if an artifact is fresh enough to use.

    Returns:
      - status: 'fresh' | 'stale' | 'expired' | 'not_found'
      - age_hours: How old the file is in hours
      - should_rerun: Whether to trigger a rerun
      - reason: Explanation of the decision
    """
    if not existsSync(file_path):
      return {
        'artifact': file_path,
        'status': 'not_found',
        'age_hours': float('inf'),
        'should_rerun': True,
        'reason': 'File not found',
      }

    # Get file stats
    stats = statSync(file_path)
    mtime = stats.mtime
    age_ms = self.now.getTime() - mtime * 1000
    age_hours = age_ms / (1000 * 3600)

    # Get tier
    tier = get_tier_from_path(file_path, self.project_root)
    ttl_hours = TIER_TTL[tier]

    # Check expiration
    if ttl_hours and age_hours > ttl_hours:
      return {
        'artifact': file_path,
        'status': 'expired',
        'age_hours': age_hours,
        'should_rerun': True,
        'reason': f'Tier {tier} artifact expired (TTL: {ttl_hours}h, Age: {age_hours:.1f}h)',
      }

    # Check auto-rerun threshold
    rerun_threshold = get_auto_rerun_threshold(file_path)

    # Also check frontmatter for last_updated
    frontmatter = parse_yaml_frontmatter(file_path)
    if 'last_updated' in frontmatter:
      try:
        last_updated = new Date(frontmatter['last_updated'])
        age_hours = (self.now.getTime() - last_updated.getTime()) / (1000 * 3600)
      except:
        pass

    if rerun_threshold and age_hours > rerun_threshold:
      return {
        'artifact': file_path,
        'status': 'stale',
        'age_hours': age_hours,
        'should_rerun': True,
        'reason': f'Artifact exceeds auto-rerun threshold (Threshold: {rerun_threshold}h, Age: {age_hours:.1f}h)',
      }

    # Check validation status in frontmatter
    if frontmatter.get('status') == 'outdated':
      return {
        'artifact': file_path,
        'status': 'stale',
        'age_hours': age_hours,
        'should_rerun': True,
        'reason': 'Artifact marked as outdated in frontmatter',
      }

    return {
      'artifact': file_path,
      'status': 'fresh',
      'age_hours': age_hours,
      'should_rerun': False,
      'reason': f'Artifact is fresh (Age: {age_hours:.1f}h)',
    }

  def validate_artifact_list(self, artifacts: list[str]) -> dict:
    """
    Validate multiple artifacts and return summary.

    Returns:
      - fresh: List of fresh artifacts
      - stale: List of stale artifacts (should rerun)
      - expired: List of expired artifacts (should archive)
      - not_found: List of missing artifacts
    """
    result = {
      'fresh': [],
      'stale': [],
      'expired': [],
      'not_found': [],
      'total': len(artifacts),
      'checked_at': self.now.toISOString(),
    }

    for artifact in artifacts:
      check = self.check_artifact_freshness(artifact)

      if check['status'] == 'fresh':
        result['fresh'].append(check)
      elif check['status'] == 'stale':
        result['stale'].append(check)
      elif check['status'] == 'expired':
        result['expired'].append(check)
      else:
        result['not_found'].append(check)

    return result

  def scan_directory_for_stale_artifacts(self, directory: str, recursive: bool = True) -> list[TimestampCheckResult]:
    """Scan a directory and return all stale artifacts."""
    stale_artifacts = []

    # Implementation would use find or glob to scan directory
    # For now, placeholder for the concept
    pass

# ============================================================================
# CLEANUP FUNCTIONS
# ============================================================================

def cleanup_stale_artifacts(project_root: str, dry_run: bool = True) -> dict:
  """
  Clean up stale artifacts based on TTL rules.

  Args:
    project_root: Root directory of the project
    dry_run: If True, only report what would be deleted

  Returns:
    - deleted: List of deleted files
    - archived: List of archived files
    - total_size_bytes: Total size of cleaned files
  """
  now = new Date()
  validator = TimestampValidator({
    'project_root': project_root,
    'now': now,
    'debug_mode': False,
  })

  result = {
    'deleted': [],
    'archived': [],
    'total_size_bytes': 0,
  }

  # Scan _bmad-output for stale files
  # Implementation would iterate through files and check freshness

  return result

# ============================================================================
# AUTO-RERUN PROMPT GENERATION
# ============================================================================

def generate_rerun_prompt(stale_artifacts: list[TimestampCheckResult]) -> str:
  """Generate a prompt for rerunning stale workflows."""
  if not stale_artifacts:
    return 'All artifacts are fresh. No rerun needed.'

  lines = [
    '# 🔄 Auto-Rerun Required',
    '',
    f'Found {len(stale_artifacts)} stale artifacts that need to be refreshed:',
    '',
  ]

  for artifact in stale_artifacts:
    lines.append(f'- **{artifact["artifact"]}**')
    lines.append(f'  - Status: `{artifact["status"]}`')
    lines.append(f'  - Age: `{artifact["age_hours"]:.1f} hours`')
    lines.append(f'  - Reason: {artifact["reason"]}')
    lines.append('')

  lines.append('## Recommended Actions')
  lines.append('')
  lines.append('Would you like me to:')
  lines.append('1. Rerun all stale workflows')
  lines.append('2. Select specific workflows to rerun')
  lines.append('3. Review details first')
  lines.append('')
  lines.append('*Auto-rerun is enabled for validation/check/investigation artifacts >1 hour old*')

  return '\n'.join(lines)

# ============================================================================
# EXPORTS (for use in other modules)
# ============================================================================

export {
  TimestampValidator,
  get_tier_from_path,
  get_auto_rerun_threshold,
  generate_rerun_prompt,
  cleanup_stale_artifacts,
  TIER_TTL,
  AUTO_RERUN_THRESHOLDS,
}
