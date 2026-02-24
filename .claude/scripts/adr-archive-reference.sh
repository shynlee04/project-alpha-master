#!/bin/bash
# ADR Archival - Quick Reference Guide
# Date: 2026-01-26

ARCHIVE_DIR="_bmad-ext/.archive/adr"

echo "📦 ADR Archive Quick Reference"
echo "================================"
echo ""
echo "Archive Location: $ARCHIVE_DIR"
echo "Total ADRs Archived: $(ls -1 $ARCHIVE_DIR/*.md 2>/dev/null | wc -l | tr -d ' ')"
echo ""

echo "📊 Archive Statistics"
echo "--------------------"
echo "SUPERSEDED (by ADR-039): $(ls -1 $ARCHIVE_DIR/*superseded*.md 2>/dev/null | wc -l | tr -d ' ')"
echo "STALE (>30 days): $(ls -1 $ARCHIVE_DIR/*stale*.md 2>/dev/null | wc -l | tr -d ' ')"
echo ""

echo "🔍 Find Archived ADR"
echo "--------------------"
echo "Usage: find-adr <ADR-ID>"
echo ""
find-adr() {
  local id=$1
  find $ARCHIVE_DIR -name "*${id}*"
}

echo "📋 List All Archived ADRs"
echo "------------------------"
ls -1 $ARCHIVE_DIR/*.md | xargs -I {} basename {}
echo ""

echo "📄 View ADR Metadata"
echo "--------------------"
echo "Usage: view-adr <ADR-ID>"
echo ""
view-adr() {
  local id=$1
  head -20 "$ARCHIVE_DIR/ADR-${id}"*.md 2>/dev/null || echo "ADR-$id not found"
}

echo "🔗 Related Documents"
echo "-------------------"
echo "- ADR Audit Report: _bmad-output/analysis/ADR-AUDIT-REPORT-2026-01-26.md"
echo "- Archive Confirmation: _bmad-output/analysis/ADR-ARCHIVE-CONFIRMATION-2026-01-26.md"
echo "- AGENTS.md: Primary architecture authority reference"
echo ""
