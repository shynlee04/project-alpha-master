#!/bin/bash

################################################################################
# IDE FSA Migration Rollback Script
################################################################################
# Purpose: Automated rollback of IDE FSA migration (CC-IDE-FSA epic)
# Version: 1.0.0
# Created: 2026-01-19
# Epic: CC-IDE-FSA
# Story: CC-IDE-08
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

################################################################################
# Configuration
################################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Archive directory
ARCHIVE_DIR="_bmad-ext/.archive/ide-fsa-rollback-$TIMESTAMP"

# Project root (assumes script is run from project root)
PROJECT_ROOT="$(pwd)"

# Log file
LOG_FILE="_bmad-ext/.archive/ide-fsa-rollback-$TIMESTAMP.log"

################################################################################
# Functions
################################################################################

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

print_header() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
}

confirm_continue() {
  echo -n "Continue? [y/N] "
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    log_info "Rollback cancelled by user"
    exit 0
  fi
}

check_file_exists() {
  if [ ! -f "$1" ]; then
    log_warning "File not found: $1 (skipping)"
    return 1
  fi
  return 0
}

################################################################################
# Step 1: Pre-flight Checks
################################################################################

print_header "IDE FSA Migration Rollback"

log_info "Rollback script started at $(date)"
log_info "Project root: $PROJECT_ROOT"
log_info "Archive directory: $ARCHIVE_DIR"
log_info "Log file: $LOG_FILE"

echo ""

log_info "Running pre-flight checks..."

# Check if we're in project root
if [ ! -f "package.json" ]; then
  log_error "Not in project root. Please run from project root directory."
  exit 1
fi

# Check git status
if [ -n "$(git status --porcelain)" ]; then
  log_warning "Uncommitted changes detected in git"
  echo ""
  log_info "Do you want to create a backup branch? [y/N]"
  read -r create_branch
  if [[ "$create_branch" =~ ^[Yy]$ ]]; then
    git checkout -b "pre-rollback-backup-$TIMESTAMP"
    git commit -am "Backup before IDE FSA rollback - $TIMESTAMP" \
      || log_warning "Failed to commit changes"
    log_success "Created backup branch: pre-rollback-backup-$TIMESTAMP"
  fi
fi

# Check if FSA files exist
FSA_FILES_EXIST=false
if [ -f "src/infrastructure/filesystem/ide-file-gateway.ts" ]; then
  FSA_FILES_EXIST=true
fi

if [ "$FSA_FILES_EXIST" = false ]; then
  log_warning "No FSA files found. Rollback may have already been done."
  echo ""
  log_info "Proceed anyway? [y/N]"
  confirm_continue
fi

echo ""
log_success "Pre-flight checks passed"
echo ""

################################################################################
# Step 2: Create Archive Directory
################################################################################

print_header "Step 1/6: Creating Archive Directory"

mkdir -p "$ARCHIVE_DIR/infrastructure/filesystem"
mkdir -p "$ARCHIVE_DIR/infrastructure/webcontainer"
mkdir -p "$ARCHIVE_DIR/presentation/components/ide"
mkdir -p "$ARCHIVE_DIR/e2e"

log_success "Archive directory created: $ARCHIVE_DIR"
echo ""

################################################################################
# Step 3: Archive FSA Files
################################################################################

print_header "Step 2/6: Archiving FSA Files"

# Archive ide-file-gateway.ts
if check_file_exists "src/infrastructure/filesystem/ide-file-gateway.ts"; then
  cp "src/infrastructure/filesystem/ide-file-gateway.ts" \
     "$ARCHIVE_DIR/infrastructure/filesystem/"
  log_success "Archived: ide-file-gateway.ts"
fi

# Archive ide-file-gateway.test.ts
if check_file_exists "src/infrastructure/filesystem/__tests__/ide-file-gateway.test.ts"; then
  cp "src/infrastructure/filesystem/__tests__/ide-file-gateway.test.ts" \
     "$ARCHIVE_DIR/infrastructure/filesystem/__tests__/"
  log_success "Archived: ide-file-gateway.test.ts"
fi

# Archive fsa-adapter.ts
if check_file_exists "src/infrastructure/webcontainer/fsa-adapter.ts"; then
  cp "src/infrastructure/webcontainer/fsa-adapter.ts" \
     "$ARCHIVE_DIR/infrastructure/webcontainer/"
  log_success "Archived: fsa-adapter.ts"
fi

# Archive fsa-adapter.test.ts
if check_file_exists "src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts"; then
  cp "src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts" \
     "$ARCHIVE_DIR/infrastructure/webcontainer/__tests__/"
  log_success "Archived: fsa-adapter.test.ts"
fi

# Archive StorageBadge.tsx
if check_file_exists "src/presentation/components/ide/StorageBadge.tsx"; then
  cp "src/presentation/components/ide/StorageBadge.tsx" \
     "$ARCHIVE_DIR/presentation/components/ide/"
  log_success "Archived: StorageBadge.tsx"
fi

echo ""

################################################################################
# Step 4: Archive E2E Tests
################################################################################

print_header "Step 3/6: Archiving E2E Tests"

# Find and archive all FSA E2E tests
for test_file in src/e2e/ide-fsa-*.spec.ts; do
  if check_file_exists "$test_file"; then
    cp "$test_file" "$ARCHIVE_DIR/e2e/"
    log_success "Archived: $(basename "$test_file")"
  fi
done

echo ""

################################################################################
# Step 5: Remove FSA Files from Source
################################################################################

print_header "Step 4/6: Removing FSA Files from Source"

# Remove ide-file-gateway.ts
if check_file_exists "src/infrastructure/filesystem/ide-file-gateway.ts"; then
  rm "src/infrastructure/filesystem/ide-file-gateway.ts"
  log_success "Removed: ide-file-gateway.ts"
fi

# Remove ide-file-gateway.test.ts
if check_file_exists "src/infrastructure/filesystem/__tests__/ide-file-gateway.test.ts"; then
  rm "src/infrastructure/filesystem/__tests__/ide-file-gateway.test.ts"
  log_success "Removed: ide-file-gateway.test.ts"
fi

# Remove fsa-adapter.ts
if check_file_exists "src/infrastructure/webcontainer/fsa-adapter.ts"; then
  rm "src/infrastructure/webcontainer/fsa-adapter.ts"
  log_success "Removed: fsa-adapter.ts"
fi

# Remove fsa-adapter.test.ts
if check_file_exists "src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts"; then
  rm "src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts"
  log_success "Removed: fsa-adapter.test.ts"
fi

# Remove StorageBadge.tsx
if check_file_exists "src/presentation/components/ide/StorageBadge.tsx"; then
  rm "src/presentation/components/ide/StorageBadge.tsx"
  log_success "Removed: StorageBadge.tsx"
fi

# Remove FSA E2E tests
for test_file in src/e2e/ide-fsa-*.spec.ts; do
  if check_file_exists "$test_file"; then
    rm "$test_file"
    log_success "Removed: $(basename "$test_file")"
  fi
done

echo ""

################################################################################
# Step 6: Remove FSA Integration from Components
################################################################################

print_header "Step 5/6: Removing FSA Integration from Components"

# This step requires manual verification
log_warning "This step requires manual verification"
log_warning "Please check the following files for FSA references:"
echo ""
log_info "1. src/presentation/components/ide/FileTree.tsx"
log_info "2. src/presentation/components/ide/MonacoEditor.tsx"
log_info "3. src/routes/ide.$projectId.tsx"
log_info "4. src/presentation/components/ide/Header.tsx"
echo ""
log_info "Search for these patterns:"
log_info "  - ide-file-gateway"
log_info "  - createIdeFileGateway"
log_info "  - StorageBadge"
log_info "  - canAccessIDE"
log_info "  - beforeLoad (in route file)"
echo ""

# Run grep to show what needs to be cleaned
FSA_REFS=$(grep -rn "ide-file-gateway\|createIdeFileGateway\|StorageBadge\|canAccessIDE" \
  src/presentation/components/ide/ \
  src/routes/ide.*.tsx \
  2>/dev/null || true)

if [ -n "$FSA_REFS" ]; then
  log_warning "Found FSA references that need to be removed:"
  echo "$FSA_REFS"
  echo ""
  log_warning "Please manually edit these files to remove FSA integration"
else
  log_success "No FSA references found in components"
fi

echo ""

################################################################################
# Step 7: Verification
################################################################################

print_header "Step 6/6: Verification"

log_info "Running TypeScript compilation check..."
if pnpm tsc --noEmit 2>&1 | tee -a "$LOG_FILE" | grep -q "error TS"; then
  log_error "TypeScript compilation failed. Please check for broken imports."
  log_info "Common issue: Files still importing ide-file-gateway or fsa-adapter"
else
  log_success "TypeScript compilation passed (0 errors)"
fi

echo ""

log_info "Checking for remaining FSA references..."
FSA_REMAINING=$(grep -r "ide-file-gateway\|fsa-adapter\|StorageBadge" \
  src/ \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=_bmad-ext \
  2>/dev/null || true)

if [ -n "$FSA_REMAINING" ]; then
  log_warning "Found remaining FSA references in codebase:"
  echo "$FSA_REMAINING"
  echo ""
  log_warning "Please review and remove these references"
else
  log_success "No FSA remnants found in codebase"
fi

echo ""

################################################################################
# Step 8: Summary
################################################################################

print_header "Rollback Summary"

log_success "Rollback completed successfully!"
echo ""

log_info "Archive location: $ARCHIVE_DIR"
log_info "Log file: $LOG_FILE"
echo ""

log_info "Files archived:"
ls -1 "$ARCHIVE_DIR/infrastructure/filesystem/" 2>/dev/null || true
ls -1 "$ARCHIVE_DIR/infrastructure/webcontainer/" 2>/dev/null || true
ls -1 "$ARCHIVE_DIR/presentation/components/ide/" 2>/dev/null || true
ls -1 "$ARCHIVE_DIR/e2e/" 2>/dev/null || true
echo ""

log_info "Next steps:"
log_info "1. Review files with FSA references (if any warnings above)"
log_info "2. Manually remove FSA integration from components"
log_info "3. Run: pnpm tsc --noEmit (to verify compilation)"
log_info "4. Run: pnpm vitest run (to run tests)"
log_info "5. Start dev server: pnpm dev"
log_info "6. Verify IDE loads and file operations work"
echo ""

log_info "For re-migration instructions, see:"
log_info "_bmad-output/planning-artifacts/migration/ide-fsa-rollback-guide.md"
echo ""

log_info "Rollback script finished at $(date)"
log_info "Total duration: $SECONDS seconds"

exit 0
