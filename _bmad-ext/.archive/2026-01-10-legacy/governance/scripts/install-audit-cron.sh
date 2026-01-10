#!/bin/bash
# Install BMAD Governance Daily Audit Cron Job
# This script helps set up the daily audit cron job

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"
CRON_FILE="${SCRIPT_DIR}/crontab-entry.txt"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  BMAD Governance Audit - Cron Job Installer               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if audit script exists
if [[ ! -f "${SCRIPT_DIR}/daily-audit.sh" ]]; then
    echo "❌ Error: daily-audit.sh not found in ${SCRIPT_DIR}"
    exit 1
fi

# Make sure it's executable
chmod +x "${SCRIPT_DIR}/daily-audit.sh"

# Run the audit once to verify it works
echo "🔍 Running audit script to verify setup..."
"${SCRIPT_DIR}/daily-audit.sh"
EXIT_CODE=$?

if [[ $EXIT_CODE -eq 0 || $EXIT_CODE -eq 2 ]]; then
    echo "✅ Audit script runs successfully"
elif [[ $EXIT_CODE -eq 1 ]]; then
    echo "⚠️  Audit script ran but found P0 (critical) issues"
else
    echo "❌ Audit script failed with exit code ${EXIT_CODE}"
    echo "Please fix errors before installing cron job."
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Cron Job Setup"
echo "════════════════════════════════════════════════════════════"
echo ""

# Show current crontab
echo "Current crontab entries:"
crontab -l 2>/dev/null || echo "(no crontab installed)"
echo ""

# Check if audit is already installed
if crontab -l 2>/dev/null | grep -q "daily-audit.sh"; then
    echo "⚠️  Governance audit cron job already installed!"
    echo ""
    echo "To reinstall:"
    echo "1. Remove current: crontab -e"
    echo "2. Delete the line containing 'daily-audit.sh'"
    echo "3. Save and exit"
    echo "4. Run this script again"
    exit 0
fi

# Prompt for installation time
echo "Choose when to run the daily audit:"
echo "1) Midnight (00:00) - default"
echo "2) 2:00 AM - common maintenance window"
echo "3) 6:00 AM - early morning"
echo "4) Custom hour (0-23)"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    2)
        HOUR="2"
        ;;
    3)
        HOUR="6"
        ;;
    4)
        read -p "Enter hour (0-23): " HOUR
        if ! [[ "$HOUR" =~ ^[0-9]+$ ]] || [ "$HOUR" -lt 0 ] || [ "$HOUR" -gt 23 ]; then
            echo "❌ Invalid hour. Using default (midnight)."
            HOUR="0"
        fi
        ;;
    *)
        HOUR="0"
        ;;
esac

# Create new crontab
TEMP_CRON=$(mktemp)
if crontab -l 2>/dev/null; then
    crontab -l > "$TEMP_CRON"
else
    touch "$TEMP_CRON"
fi

# Add new entry
echo "# BMAD Governance Daily Audit - runs at ${HOUR}:00" >> "$TEMP_CRON"
echo "0 ${HOUR} * * * ${SCRIPT_DIR}/daily-audit.sh >> ${PROJECT_ROOT}/_bmad-output/governance/audits/cron.log 2>&1" >> "$TEMP_CRON"

# Install new crontab
crontab "$TEMP_CRON"
rm "$TEMP_CRON"

echo ""
echo "✅ Cron job installed!"
echo ""
echo "Details:"
echo "  Schedule: Daily at ${HOUR}:00"
echo "  Script: ${SCRIPT_DIR}/daily-audit.sh"
echo "  Log: ${PROJECT_ROOT}/_bmad-output/governance/audits/cron.log"
echo ""
echo "To view/edit crontab: crontab -e"
echo "To remove cron job: crontab -e and delete the audit line"
