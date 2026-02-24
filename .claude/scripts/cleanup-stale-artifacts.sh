#!/usr/bin/env bash
# ============================================================================
# STALE ARTIFACT CLEANUP SCRIPT
# ============================================================================
# Purpose: Automatically clean up stale BMAD artifacts
# Usage: .claude/scripts/cleanup-stale-artifacts.sh [--dry-run] [--verbose]
# Version: 1.0.0
# Updated: 2026-01-08
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(pwd)"
OUTPUT_DIR="$PROJECT_ROOT/_bmad-output"
ARCHIVE_DIR="$OUTPUT_DIR/.archive"
DRY_RUN=false
VERBOSE=false

# Timestamps (in seconds for find -mtime)
ONE_HOUR_SECONDS=3600
ONE_DAY_SECONDS=86400
SEVEN_DAYS_SECONDS=604800
NINETY_DAYS_SECONDS=7776000

# ============================================================================
# FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create archive directory with timestamp
create_archive_dir() {
    local timestamp=$(date +%Y-%m-%d)
    local archive_path="$ARCHIVE_DIR/stale-$timestamp"
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$archive_path"
    fi
    echo "$archive_path"
}

# Archive continuation capsules (Tier 4, 24h TTL)
cleanup_continuation_capsules() {
    log_info "Checking continuation capsules (Tier 4, 24h TTL)..."

    local archive_path=$(create_archive_dir)
    local count=0

    # Find capsules older than 1 day
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            count=$((count + 1))
            if [ "$VERBOSE" = true ]; then
                log_info "  Archiving: $(basename "$file")"
            fi
            if [ "$DRY_RUN" = false ]; then
                mv "$file" "$archive_path/"
            fi
        fi
    done < <(find "$OUTPUT_DIR/continuation-capsules" -type f -mtime +1 2>/dev/null)

    log_success "Archived $count continuation capsules"
}

# Archive stale handoffs (Tier 4, 24h TTL)
cleanup_handoffs() {
    log_info "Checking handoffs (Tier 4, 24h TTL)..."

    local archive_path=$(create_archive_dir)
    local count=0

    while IFS= read -r file; do
        if [ -f "$file" ]; then
            count=$((count + 1))
            if [ "$VERBOSE" = true ]; then
                log_info "  Archiving: $(basename "$file")"
            fi
            if [ "$DRY_RUN" = false ]; then
                mv "$file" "$archive_path/"
            fi
        fi
    done < <(find "$OUTPUT_DIR/handoffs" -type f -mtime +1 2>/dev/null)

    log_success "Archived $count handoff files"
}

# Report on diagnostic artifacts (Tier 3, 90d TTL - just report, don't archive)
check_diagnostics() {
    log_info "Checking diagnostic reports (Tier 3, 90d TTL)..."

    local old_count=0
    local recent_count=0

    while IFS= read -r file; do
        if [ -f "$file" ]; then
            old_count=$((old_count + 1))
            if [ "$VERBOSE" = true ]; then
                log_warning "  Old (>90d): $(basename "$file")"
            fi
        fi
    done < <(find "$OUTPUT_DIR/scans" -type f -mtime +90 2>/dev/null)

    while IFS= read -r file; do
        if [ -f "$file" ]; then
            recent_count=$((recent_count + 1))
        fi
    done < <(find "$OUTPUT_DIR/scans" -type f -mtime -90 2>/dev/null)

    log_success "Diagnostic reports: $recent_count recent, $old_count old (>90d)"

    if [ $old_count -gt 0 ]; then
        log_warning "Consider archiving $old_count old diagnostic reports"
    fi
}

# Check for stale validation/check artifacts that should be rerun
check_stale_validations() {
    log_info "Checking for stale validation artifacts (>1 hour, should rerun)..."

    local stale_count=0
    local current_time=$(date +%s)

    while IFS= read -r file; do
        if [ -f "$file" ]; then
            # Get file modification time in seconds
            local mtime=$(stat -f %m "$file" 2>/dev/null || stat -c %Y "$file" 2>/dev/null)
            local age_seconds=$((current_time - mtime))
            local age_hours=$((age_seconds / 3600))

            if [ $age_hours -gt 1 ]; then
                stale_count=$((stale_count + 1))
                log_warning "  Stale ($(basename "$file")): ${age_hours}h old"
            fi
        fi
    done < <(find "$OUTPUT_DIR" -type f \( -name "*validation*" -o -name "*check*" -o -name "*scan*" -o -name "*diagnostic*" \) -name "*.md" 2>/dev/null)

    if [ $stale_count -gt 0 ]; then
        log_warning "Found $stale_count stale validation/check artifacts"
        log_info "Run /bmad-orchestrator to auto-rerun stale workflows"
    else
        log_success "All validation artifacts are fresh"
    fi
}

# Calculate disk space saved
calculate_space_saved() {
    if [ -d "$ARCHIVE_DIR" ]; then
        local size=$(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1)
        log_info "Archive size: $size"
    fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    echo "═══════════════════════════════════════════════════════════════"
    echo "        STALE ARTIFACT CLEANUP"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "Project: $PROJECT_ROOT"
    echo "Output:  $OUTPUT_DIR"
    echo "Archive: $ARCHIVE_DIR"
    echo "Dry Run: $DRY_RUN"
    echo ""

    if [ ! -d "$OUTPUT_DIR" ]; then
        log_error "Output directory not found: $OUTPUT_DIR"
        exit 1
    fi

    # Run cleanup functions
    cleanup_continuation_capsules
    echo ""
    cleanup_handoffs
    echo ""
    check_diagnostics
    echo ""
    check_stale_validations
    echo ""
    calculate_space_saved

    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    log_success "Cleanup complete!"
    echo "═══════════════════════════════════════════════════════════════"
}

# Parse arguments
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            log_warning "DRY RUN MODE - No files will be deleted"
            ;;
        --verbose)
            VERBOSE=true
            ;;
        --help)
            echo "Usage: $0 [--dry-run] [--verbose] [--help]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be cleaned without doing it"
            echo "  --verbose    Show detailed output"
            echo "  --help       Show this help message"
            exit 0
            ;;
    esac
done

# Run main function
main "$@"
