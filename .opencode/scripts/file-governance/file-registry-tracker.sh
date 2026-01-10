#!/bin/bash
# File Registry Tracker - Governance System for File Changes
set -e

PROJECT_ROOT="/Users/apple/Documents/coding-projects/project-alpha-master"
REGISTRY_DIR="$PROJECT_ROOT/_bmad-output/.archive/file-registry"
REGISTRY_FILE="$REGISTRY_DIR/registry.json"
INDEX_FILE="$REGISTRY_DIR/index.json"
TREE_FILE="$REGISTRY_DIR/code-tree.json"

MAX_ENTRIES=500
RESET_HOURS=48
WINDOW=30
THRESHOLD=3

get_ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

init() {
  mkdir -p "$REGISTRY_DIR"
  [ ! -f "$REGISTRY_FILE" ] && echo '{"e":[],"c":"'$(get_ts)'","r":0}' > "$REGISTRY_FILE"
  [ ! -f "$INDEX_FILE" ] && echo '{"h":{},"s":[],"l":"'$(get_ts)'"}' > "$INDEX_FILE"
  [ ! -f "$TREE_FILE" ] && echo '{"t":{},"u":"'$(get_ts)'"}' > "$TREE_FILE"
}

check_reset() {
  local cnt=$(grep -o '"id"' "$REGISTRY_FILE" 2>/dev/null | wc -l | tr -d ' ')
  [ "$cnt" -gt "$MAX_ENTRIES" ] && reset
  
  local last=$(grep -oP '"l":\s*"\K[^"]+' "$INDEX_FILE" 2>/dev/null || echo "")
  if [ -n "$last" ]; then
    local last_s=$(date -d "$last" +%s 2>/dev/null || echo "0")
    local now_s=$(date -u +%s)
    [ $(( (now_s - last_s) / 3600 )) -ge $RESET_HOURS ] && reset
  fi
}

reset() {
  local ts=$(get_ts)
  local old=$(grep -o '"id"' "$REGISTRY_FILE" 2>/dev/null | wc -l | tr -d ' ')
  [ -f "$REGISTRY_FILE" ] && cp "$REGISTRY_FILE" "$REGISTRY_DIR/reg-$ts.bak"
  echo '{"e":[],"c":"'"$ts"'","r":1}' > "$REGISTRY_FILE"
  echo '{"h":{},"s":[],"l":"'"$ts"'"}' > "$INDEX_FILE"
  echo "[$ts] Registry reset. Archived $old entries."
}

detect_circular() {
  local f="$1"
  local cnt=$(grep -oP '"file":"'"$f"'"/[^}]*}' "$REGISTRY_FILE" 2>/dev/null | tail -n $WINDOW | grep -c '"a"' || echo "0")
  
  if [ "$cnt" -ge "$THRESHOLD" ]; then
    echo "[$ts] CIRCULAR: $f changed $cnt times in $WINDOW entries"
    mkdir -p "$REGISTRY_DIR/signals"
    local sig="$REGISTRY_DIR/sig-$f-$(date +%Y%m%d-%H%M%S).json"
    echo '{"type":"circular","f":"'"$f"'","c":'"$cnt"',"w":'$WINDOW',"t":"'"$(get_ts)'"}' > "$sig"
    return 1
  fi
  return 0
}

main() {
  local act="$1" file="$2"
  [ -z "$act" ] || [ -z "$file" ] && { echo "Usage: $0 <create|modify|remove> <file>"; exit 1; }
  
  init && check_reset
  
  local ts=$(get_ts)
  local id=$(grep -o '"id"' "$REGISTRY_FILE" 2>/dev/null | wc -l | tr -d ' ')
  id=$((id + 1))
  
  echo "[$ts] Registered: [$act] $file (entry #$id)"
  
  detect_circular "$file" || echo "[$ts] Signal sent to agent"
}

main "$@"
