#!/bin/bash
# File Registry Tracker
set -e

PROJ="/Users/apple/Documents/coding-projects/project-alpha-master"
REG="$PROJ/_bmad-output/.archive/file-registry"
FILE="$REG/registry.json"
IDX="$REG/index.json"
TREE="$REG/code-tree.json"

MAX=500
WINDOW=30
THRESH=3

get_ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

init() {
  mkdir -p "$REG"
  [ ! -f "$FILE" ] && echo '{"e":[],"c":"'$(get_ts)'","r":0}' > "$FILE"
  [ ! -f "$IDX" ] && echo '{"h":{},"s":[],"l":"'$(get_ts)'"}' > "$IDX"
}

check_reset() {
  CNT=$(grep -o '"id"' "$FILE" 2>/dev/null | wc -l | tr -d ' ')
  [ "$CNT" -gt "$MAX" ] && reset
}

reset() {
  TS=$(get_ts)
  OLD=$(grep -o '"id"' "$FILE" 2>/dev/null | wc -l | tr -d ' ')
  [ -f "$FILE" ] && cp "$FILE" "$REG/reg-$TS.bak"
  echo '{"e":[],"c":"'"$TS"'","r":1}' > "$FILE"
  echo '{"h":{},"s":[],"l":"'"$TS"'"}' > "$IDX"
  echo "[$TS] Reset. Archived $OLD entries."
}

main() {
  ACT="$1" F="$2"
  [ -z "$ACT" ] || [ -z "$F" ] && { echo "Usage: $0 <act> <file>"; exit 1; }
  
  init && check_reset
  TS=$(get_ts)
  ID=$(grep -o '"id"' "$FILE" 2>/dev/null | wc -l | tr -d ' ')
  ID=$((ID + 1))
  
  echo "[$TS] [$ACT] $F (#$ID)"
}

main "$@"
