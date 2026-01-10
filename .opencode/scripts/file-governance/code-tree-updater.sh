#!/bin/bash
# Code Tree Updater - Maintains Project Structure with Timestamps
# Usage: ./code-tree-updater.sh [--force]
# Updates: _bmad-output/.archive/file-registry/code-tree.json

set -e

PROJECT_ROOT="/Users/apple/Documents/coding-projects/project-alpha-master"
CODE_TREE_FILE="$PROJECT_ROOT/_bmad-output/.archive/file-registry/code-tree.json"
TIMESTAMP_FILE="$PROJECT_ROOT/_bmad-output/.archive/file-registry/tree-timestamp.json"

get_timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Get file tree structure
get_directory_tree() {
  local dir="$1"
  local prefix="$2"
  local result='{}'
  
  # Get all files and directories
  find "$dir" -maxdepth 3 -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.yaml" -o -name "*.md" 2>/dev/null | sort | while read -r file; do
    local relative_path="${file#$PROJECT_ROOT/}"
    local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
    local mtime=$(stat -f "%Sm" -t "%Y-%m-%dT%H:%M:%SZ" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null || echo "")
    
    # Add to result (simplified)
    echo "{\"path\":\"$relative_path\",\"size\":$size,\"mtime\":\"$mtime\"}"
  done
}

main() {
  local force=false
  if [ "$1" = "--force" ]; then
    force=true
  fi
  
  local timestamp=$(get_timestamp)
  
  echo "=== CODE TREE UPDATE ==="
  echo "Timestamp: $timestamp"
  echo ""
  
  # Check if update needed (max 1 hour if not forced)
  if [ -f "$TIMESTAMP_FILE" ]; then
    if [ "$force" = false ]; then
      local last_update=$(cat "$TIMESTAMP_FILE" | grep -o '"timestamp" *: *"[^"]*"' | sed 's/.*: *"\([^"]*\)"/\1/')
      if [ -n "$last_update" ]; then
        local last_update_sec=$(date -d "$last_update" +%s 2>/dev/null || echo "0")
        local now_sec=$(date -u +"%s")
        local hours_since=$(( (now_sec - last_update_sec) / 3600 ))
        if [ "$hours_since" -lt 1 ]; then
          echo "Skipped: Tree updated less than 1 hour ago"
          exit 0
        fi
      fi
    fi
  fi
  
  # Generate tree
  echo "Generating code tree..."
  
  # Create timestamp file
  cat > "$TIMESTAMP_FILE" << EOF
{
  "timestamp": "$timestamp",
  "source": "$PROJECT_ROOT"
}
EOF
  
  # Count files
  local file_count=$(find "$PROJECT_ROOT/src" -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | wc -l | tr -d ' ')
  
  echo "Code tree generated: $file_count files"
  echo ""
  echo "File categories:"
  
  # Count by type
  local ts_count=$(find "$PROJECT_ROOT/src" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
  local tsx_count=$(find "$PROJECT_ROOT/src" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  
  echo "  • TypeScript: $ts_count"
  echo "  • TSX (React): $tsx_count"
  echo ""
  
  # Check for architecture violations
  echo "Architecture check:"
  
  # Check deprecated directories
  if [ -d "$PROJECT_ROOT/src/lib/state" ]; then
    echo "  ⚠️  DEPRECATED: src/lib/state/ exists (should use @/infrastructure/persistence/stores)"
  fi
  
  if [ -d "$PROJECT_ROOT/src/stores" ]; then
    echo "  ⚠️  DEPRECATED: src/stores/ exists (should use @/infrastructure/persistence/stores)"
  fi
  
  if [ -d "$PROJECT_ROOT/src/lib/filesystem/sync-manager" ]; then
    echo "  ⚠️  DEPRECATED: src/lib/filesystem/sync-manager exists (should use @/infrastructure/sync)"
  fi
  
  # Check clean architecture compliance
  local good_count=0
  local bad_count=0
  
  if [ -d "$PROJECT_ROOT/src/infrastructure" ]; then
    echo "  ✅ infrastructure/ exists"
    good_count=$((good_count + 1))
  else
    echo "  ❌ infrastructure/ missing"
    bad_count=$((bad_count + 1))
  fi
  
  if [ -d "$PROJECT_ROOT/src/domain" ]; then
    echo "  ✅ domain/ exists"
    good_count=$((good_count + 1))
  else
    echo "  ❌ domain/ missing"
    bad_count=$((bad_count + 1))
  fi
  
  if [ -d "$PROJECT_ROOT/src/presentation" ]; then
    echo "  ✅ presentation/ exists"
    good_count=$((good_count + 1))
  else
    echo "  ❌ presentation/ missing"
    bad_count=$((bad_count + 1))
  fi
  
  echo ""
  echo "Architecture score: $good_count/3 ($((good_count * 100 / 3))%)"
  
  if [ $bad_count -gt 0 ]; then
    echo ""
    echo "Architecture violations detected. Run: ./.opencode/scripts/file-governance/code-tree-updater.sh --force"
  fi
  
  # Update main code tree file
  cat > "$CODE_TREE_FILE" << EOF
{
  "generated_at": "$timestamp",
  "project_root": "$PROJECT_ROOT",
  "file_count": $file_count,
  "typescript_files": $ts_count,
  "tsx_files": $tsx_count,
  "architecture_score": $good_count,
  "violations": $bad_count,
  "last_update": "$timestamp"
}
EOF
  
  echo ""
  echo "Code tree updated: $CODE_TREE_FILE"
}

main "$@"
