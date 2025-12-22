/**
 * @fileoverview Cursor Position Segment
 * @module components/ide/statusbar/CursorPosition
 * 
 * @epic Epic-28 Story 28-18
 * @listens editor:cursorChange
 * 
 * Displays cursor line and column position in StatusBar.
 */

import { useTranslation } from 'react-i18next';
import { useStatusBarStore } from '@/lib/state/statusbar-store';
import { StatusBarSegment } from './StatusBarSegment';

// ============================================================================
// Component
// ============================================================================

/**
 * CursorPosition - Shows cursor line and column
 * 
 * Displays "Ln 24, Col 36" format like VS Code.
 */
export function CursorPosition() {
    const { t } = useTranslation();
    // Select individual primitives to avoid re-render loops
    const cursorPosition = useStatusBarStore((s) => s.cursorPosition);

    return (
        <StatusBarSegment region="right">
            <span>
                {t('statusBar.cursorPosition', {
                    line: cursorPosition.line,
                    column: cursorPosition.column,
                })}
            </span>
        </StatusBarSegment>
    );
}
