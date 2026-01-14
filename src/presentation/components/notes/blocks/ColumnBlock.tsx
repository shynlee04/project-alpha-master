/**
 * @fileoverview Column Block for BlockNote
 * @module presentation/components/notes/blocks/ColumnBlock
 * @story UX-11
 * @created 2026-01-16
 *
 * Multi-column container blocks for organizing content.
 * Features:
 * - 2-3 column layouts
 * - Adjustable width ratios
 * - Responsive stacking on mobile
 * - Add/remove column controls
 *
 * Implementation Note: Uses CSS Grid for visual layout while maintaining
 * a single content area for editing. Future enhancement could implement
 * per-column child blocks via BlockNote's drag-and-drop extensions.
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Columns, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import "./ColumnBlock.css";

// ============================================================================
// Types
// ============================================================================

export type ColumnCount = 1 | 2 | 3 | 4;

export interface ColumnConfig {
    /** Width ratio for this column (1-12) */
    ratio: number;
}

export interface ColumnBlockProps {
    columnCount: ColumnCount;
    columnRatios: string;
    textAlignment?: "left" | "center" | "right";
}

// ============================================================================
// Defaults
// ============================================================================

const DEFAULT_RATIOS: Record<ColumnCount, number[]> = {
    1: [12],
    2: [6, 6],
    3: [4, 4, 4],
    4: [3, 3, 3, 3],
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * Parse column ratios from JSON string
 */
function parseRatios(jsonStr: string, count: ColumnCount): number[] {
    try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length === count) {
            return parsed;
        }
    } catch {
        // Fall through to default
    }
    return DEFAULT_RATIOS[count];
}

/**
 * Stringify column ratios to JSON
 */
function stringifyRatios(ratios: number[]): string {
    return JSON.stringify(ratios);
}

/**
 * Calculate grid template from ratios (12-column grid)
 */
function getGridTemplate(ratios: number[]): string {
    // Normalize ratios to sum of 12
    const total = ratios.reduce((sum, r) => sum + r, 0);
    if (total === 0) return ratios.map(() => "1fr").join(" ");

    return ratios.map(r => {
        const fraction = r / 12; // 12-column grid system
        return `${fraction}fr`;
    }).join(" ");
}

// ============================================================================
// Column Block Component
// ============================================================================

/**
 * Width ratio control for adjusting column widths
 */
interface RatioControlProps {
    ratio: number;
    onIncrease: () => void;
    onDecrease: () => void;
    canIncrease: boolean;
    canDecrease: boolean;
}

function RatioControl({ ratio, onIncrease, onDecrease, canIncrease, canDecrease }: RatioControlProps) {
    return (
        <div className="column-block__ratio-control">
            <button
                type="button"
                onClick={onDecrease}
                disabled={!canDecrease}
                className="column-block__ratio-btn"
                title="Narrow column"
            >
                <ChevronLeft size={12} />
            </button>
            <span className="column-block__ratio-value">{ratio}</span>
            <button
                type="button"
                onClick={onIncrease}
                disabled={!canIncrease}
                className="column-block__ratio-btn"
                title="Widen column"
            >
                <ChevronRight size={12} />
            </button>
        </div>
    );
}

/**
 * Column Block - Multi-column layout container
 *
 * Provides visual column layout for content. Content is edited in a single
 * area that spans across columns (CSS grid creates the visual separation).
 */
export const ColumnBlock = createReactBlockSpec(
    {
        type: "column",
        propSchema: {
            // Number of columns
            columnCount: {
                default: 2 as ColumnCount,
            },
            // Width ratios as JSON string
            columnRatios: {
                default: stringifyRatios(DEFAULT_RATIOS[2]),
            },
            // Text alignment
            textAlignment: defaultProps.textAlignment,
        },
        content: "inline", // Single content area for editing
    },
    {
        render: (props) => {
            const [isHovered, setIsHovered] = useState(false);
            const [columnCount, setColumnCount] = useState<ColumnCount>(
                props.block.props.columnCount as ColumnCount
            );
            const [ratios, setRatios] = useState<number[]>(
                parseRatios(
                    props.block.props.columnRatios as string,
                    props.block.props.columnCount as ColumnCount
                )
            );

            // Keep refs in sync
            const editorRef = useRef(props.editor);
            const blockRef = useRef(props.block);

            useEffect(() => {
                editorRef.current = props.editor;
                blockRef.current = props.block;
            }, [props.editor, props.block]);

            // Update props when local state changes
            const updateProps = useCallback((updates: Partial<{ columnCount: ColumnCount; columnRatios: string }>) => {
                const editor = editorRef.current;
                const block = blockRef.current;
                editor.updateBlock(block, {
                    type: "column",
                    props: {
                        ...block.props,
                        ...updates,
                    },
                });
            }, []);

            // Add a column
            const addColumn = useCallback(() => {
                if (columnCount >= 4) return;
                const newCount = (columnCount + 1) as ColumnCount;
                const newRatios = [...ratios, DEFAULT_RATIOS[newCount][newCount - 1]];
                setColumnCount(newCount);
                setRatios(newRatios);
                updateProps({
                    columnCount: newCount,
                    columnRatios: stringifyRatios(newRatios),
                });
            }, [columnCount, ratios, updateProps]);

            // Remove a column
            const removeColumn = useCallback(() => {
                if (columnCount <= 1) return;
                const newCount = (columnCount - 1) as ColumnCount;
                const newRatios = ratios.slice(0, -1);
                setColumnCount(newCount);
                setRatios(newRatios);
                updateProps({
                    columnCount: newCount,
                    columnRatios: stringifyRatios(newRatios),
                });
            }, [columnCount, ratios, updateProps]);

            // Adjust column width ratio
            const adjustRatio = useCallback((index: number, delta: number) => {
                const newRatios = [...ratios];
                const newValue = newRatios[index] + delta;

                // Validate: ratio must be between 1 and 12
                // And total must not exceed 12
                const currentTotal = newRatios.reduce((sum, r) => sum + r, 0);
                const newTotal = currentTotal + delta;

                if (newValue >= 1 && newValue <= 12 && newTotal <= 12) {
                    newRatios[index] = newValue;
                    setRatios(newRatios);
                    updateProps({
                        columnRatios: stringifyRatios(newRatios),
                    });
                }
            }, [ratios, updateProps]);

            const gridTemplate = getGridTemplate(ratios);
            const textAlignment = props.block.props.textAlignment as string;

            return (
                <div
                    className={cn(
                        "column-block",
                        `column-block--${columnCount}-cols`,
                        `column-block--align-${textAlignment}`
                    )}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Column Headers */}
                    <div
                        className="column-block__container"
                        style={{ gridTemplateColumns: gridTemplate }}
                    >
                        {ratios.map((ratio, index) => (
                            <div
                                key={index}
                                className="column-block__column-header"
                            >
                                <span className="column-block__column-label">
                                    Column {index + 1}
                                </span>
                                <RatioControl
                                    ratio={ratio}
                                    onIncrease={() => adjustRatio(index, 1)}
                                    onDecrease={() => adjustRatio(index, -1)}
                                    canIncrease={ratio < 12 && ratios.reduce((s, r) => s + r, 0) < 12}
                                    canDecrease={ratio > 1}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Content Area - Single editable area spanning all columns */}
                    <div className="column-block__content-area">
                        <div ref={props.contentRef} className="column-block__editable" />
                    </div>

                    {/* Column Controls Footer */}
                    <div
                        className={cn(
                            "column-block__controls",
                            isHovered && "column-block__controls--visible"
                        )}
                    >
                        <div className="column-block__actions">
                            <button
                                type="button"
                                onClick={removeColumn}
                                disabled={columnCount <= 1}
                                className="column-block__action-btn"
                                title="Remove column"
                            >
                                <Trash2 size={14} />
                                <span>Remove</span>
                            </button>

                            <span className="column-block__divider" />

                            <button
                                type="button"
                                onClick={addColumn}
                                disabled={columnCount >= 4}
                                className="column-block__action-btn"
                                title="Add column"
                            >
                                <Plus size={14} />
                                <span>Add Column</span>
                            </button>
                        </div>
                    </div>

                    {/* Empty state hint */}
                    {(!props.block.content || (Array.isArray(props.block.content) && props.block.content.length === 0)) && (
                        <div className="column-block__empty-hint">
                            <Columns size={24} className="text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                Type to add content, or use slash commands to add blocks
                            </p>
                        </div>
                    )}
                </div>
            );
        },
    }
);

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a column block with initial content
 */
export function createColumnBlock(
    columnCount: ColumnCount = 2
): { id: string; type: string; props: ColumnBlockProps } {
    return {
        id: crypto.randomUUID(),
        type: "column",
        props: {
            columnCount,
            columnRatios: stringifyRatios(DEFAULT_RATIOS[columnCount]),
            textAlignment: "left",
        },
    };
}
