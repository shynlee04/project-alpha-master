/**
 * @fileoverview Reference Block for BlockNote
 * @module presentation/components/notes/blocks/ReferenceBlock
 * @story UX-10
 *
 * Obsidian-style block references using ^blockId syntax.
 * Supports inline preview (snapshot) and navigation to source block.
 *
 * Features:
 * - ^blockId syntax for linking to blocks
 * - Auto-generated block IDs from BlockNote
 * - Snapshot transclusion (static content copy)
 * - Click to navigate to source block
 * - Visual indicator for referenced content
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import {
    Link,
    Copy,
    ExternalLink,
    AlertCircle,
    Loader2,
    X,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import "./ReferenceBlock.css";

/**
 * Reference block types
 */
export type ReferenceMode = "inline" | "embed";

/**
 * Reference block props schema
 */
export interface ReferenceBlockProps {
    /** ID of the referenced block */
    referencedBlockId: string;
    /** ID of the note containing the referenced block */
    referencedNoteId?: string;
    /** Title of the referenced note */
    referencedNoteTitle?: string;
    /** Snapshot of referenced content (for transclusion) */
    contentSnapshot?: string;
    /** Reference mode */
    mode: ReferenceMode;
    /** Text alignment */
    textAlignment?: "left" | "center" | "right";
}

/**
 * Extract block ID from reference text (^blockId format)
 *
 * @param text - The reference text (e.g., "^abc123-def456")
 * @returns The extracted block ID or null
 *
 * @example
 * extractBlockId("^abc123-def456") // returns "abc123-def456"
 * extractBlockId("Not a reference") // returns null
 */
export function extractBlockId(text: string): string | null {
    const match = text.match(/^\^([a-zA-Z0-9-]+)$/);
    return match ? match[1] : null;
}

/**
 * Find a block by ID in the editor document
 *
 * @param editor - The BlockNote editor instance
 * @param blockId - The block ID to find
 * @returns The block if found, null otherwise
 */
export function findBlockById(
    editor: any, // BlockNoteEditor with custom blocks has incompatible generic types
    blockId: string
): { id: string; content: any[]; type: string; props: any } | null {
    const document = editor.document;

    function searchBlocks(blocks: any[]): any | null {
        for (const block of blocks) {
            if (block.id === blockId) {
                return block;
            }
            if (block.children && block.children.length > 0) {
                const found = searchBlocks(block.children);
                if (found) return found;
            }
        }
        return null;
    }

    return searchBlocks(document);
}

/**
 * Extract text content from a block
 *
 * @param block - The block to extract text from
 * @returns The extracted text content
 */
export function extractBlockText(block: any): string {
    if (!block?.content) return "";

    function extractContent(content: any[]): string {
        return content
            .map((item) => {
                if (typeof item === "string") return item;
                if (typeof item === "object" && item !== null) {
                    if (item.text) return item.text;
                    if (item.content) return extractContent(item.content);
                }
                return "";
            })
            .join("");
    }

    return extractContent(block.content);
}

/**
 * Reference Block - Obsidian-style block references
 */
export const ReferenceBlock = createReactBlockSpec(
    {
        type: "reference",
        propSchema: {
            // ID of the referenced block
            referencedBlockId: {
                default: "",
            },
            // ID of the note containing the referenced block
            referencedNoteId: {
                default: "",
            },
            // Title of the referenced note
            referencedNoteTitle: {
                default: "",
            },
            // Snapshot of referenced content
            contentSnapshot: {
                default: "",
            },
            // Reference mode (inline or embed)
            mode: {
                default: "inline" as ReferenceMode,
            },
            // Text alignment
            textAlignment: defaultProps.textAlignment,
        },
        content: "none",
    },
    {
        render: (props) => {
            const [isLoading, setIsLoading] = useState(false);
            const [isInvalid, setIsInvalid] = useState(false);
            const [blockIdInput, setBlockIdInput] = useState("");

            // Keep refs in sync to avoid stale closures
            const editorRef = useRef(props.editor);
            const blockRef = useRef(props.block);

            useEffect(() => {
                editorRef.current = props.editor;
                blockRef.current = props.block;
            }, [props.editor, props.block]);

            const referencedBlockId = props.block.props.referencedBlockId as string;
            const mode = props.block.props.mode as ReferenceMode;
            const contentSnapshot = props.block.props.contentSnapshot as string;
            const referencedNoteTitle = props.block.props.referencedNoteTitle as string;

            // Validate reference on mount
            useEffect(() => {
                if (!referencedBlockId) {
                    setIsInvalid(true);
                    return;
                }

                // Check if referenced block exists in current document
                const block = findBlockById(props.editor, referencedBlockId);
                if (!block && !contentSnapshot) {
                    // Block not found AND no snapshot - invalid state
                    setIsInvalid(true);
                } else {
                    setIsInvalid(false);
                }
            }, [referencedBlockId, contentSnapshot, props.editor]);

            // Handle block ID input change
            const handleBlockIdChange = useCallback((id: string) => {
                const trimmedId = id.trim();
                setBlockIdInput(trimmedId);

                if (!trimmedId) {
                    setIsInvalid(true);
                    return;
                }

                // Extract block ID if user typed ^ prefix
                const blockId = trimmedId.startsWith("^")
                    ? trimmedId.slice(1)
                    : trimmedId;

                setIsLoading(true);

                // Use ref to avoid stale closures
                const editor = editorRef.current;
                const block = blockRef.current;

                // Try to find the block
                const foundBlock = findBlockById(editor, blockId);

                if (foundBlock) {
                    // Block found - create snapshot
                    const blockText = extractBlockText(foundBlock);
                    editor.updateBlock(block, {
                        type: "reference",
                        props: {
                            ...block.props,
                            referencedBlockId: blockId,
                            contentSnapshot: blockText,
                            referencedNoteId: "", // Same note for now
                            referencedNoteTitle: "",
                            mode: "inline",
                        },
                    });
                    setIsInvalid(false);
                } else {
                    // Block not found
                    editor.updateBlock(block, {
                        type: "reference",
                        props: {
                            ...block.props,
                            referencedBlockId: blockId,
                            contentSnapshot: "",
                        },
                    });
                    setIsInvalid(true);
                }

                setIsLoading(false);
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, []);

            // Navigate to referenced block
            const handleNavigate = useCallback(() => {
                if (!referencedBlockId) return;

                // Try to find and scroll to the block by ID only
                // Note: BlockNote doesn't have a built-in scrollToBlock,
                // so we'll use DOM manipulation as fallback
                const blockElement = document.querySelector(
                    `[data-block-id="${referencedBlockId}"]`
                );

                if (blockElement) {
                    blockElement.scrollIntoView({ behavior: "smooth", block: "center" });
                    // Add highlight effect
                    blockElement.classList.add("referenced-block-highlight");
                    setTimeout(() => {
                        blockElement.classList.remove("referenced-block-highlight");
                    }, 2000);
                }
            }, [referencedBlockId]);

            // Copy block reference
            const handleCopy = useCallback((e: React.MouseEvent) => {
                e.stopPropagation();
                const refText = `^${referencedBlockId}`;
                try {
                    navigator.clipboard.writeText(refText);
                } catch (err) {
                    // Fallback for non-secure contexts or permission denied
                    console.warn("Failed to copy to clipboard:", err);
                }
            }, [referencedBlockId]);

            // Remove reference block
            const handleRemove = useCallback(() => {
                const editor = editorRef.current;
                const block = blockRef.current;
                editor.removeBlocks([block]);
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, []);

            // Editing state - show input form
            if (!referencedBlockId) {
                return (
                    <div className="reference-block-edit" contentEditable={false}>
                        <div className="reference-block-edit__content">
                            <div className="reference-block-edit__icon">
                                <Link size={16} className="text-muted-foreground" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter block ID (e.g., ^abc123-def456)"
                                value={blockIdInput}
                                onChange={(e) => setBlockIdInput(e.target.value)}
                                className="reference-block-edit__input"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleBlockIdChange(blockIdInput);
                                    }
                                }}
                                autoFocus
                            />
                            {blockIdInput.trim() && (
                                <button
                                    type="button"
                                    onClick={() => handleBlockIdChange(blockIdInput)}
                                    className="reference-block-edit__button"
                                    title="Create reference"
                                >
                                    {isLoading ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        "Link"
                                    )}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="reference-block-edit__button reference-block-edit__button--danger"
                                title="Remove reference"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <p className="reference-block-edit__hint">
                            Type the block ID or paste a ^blockId reference
                        </p>
                    </div>
                );
            }

            // Invalid state - block not found
            if (isInvalid && !contentSnapshot) {
                // Handler to reset to edit mode
                const handleEditClick = () => {
                    const editor = editorRef.current;
                    const block = blockRef.current;
                    editor.updateBlock(block, {
                        type: "reference",
                        props: {
                            ...block.props,
                            referencedBlockId: "",
                        },
                    });
                };

                return (
                    <div
                        className="reference-block reference-block--invalid"
                        data-align={props.block.props.textAlignment}
                        contentEditable={false}
                    >
                        <div className="reference-block__invalid">
                            <AlertCircle size={16} className="text-destructive" />
                            <span className="reference-block__invalid-text">
                                Block not found: ^{referencedBlockId}
                            </span>
                            <button
                                type="button"
                                onClick={handleEditClick}
                                className="reference-block__invalid-retry"
                            >
                                Edit
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="reference-block__remove-btn"
                            title="Remove reference"
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            }

            // Valid reference - display based on mode
            if (mode === "inline") {
                // Inline mode - compact link preview
                return (
                    <div
                    className="reference-block reference-block--inline"
                    data-align={props.block.props.textAlignment}
                    contentEditable={false}
                >
                    <button
                        type="button"
                        onClick={handleNavigate}
                        className="reference-block__inline-link"
                        title={referencedNoteTitle || `Referenced block ^${referencedBlockId}`}
                    >
                        <Link size={14} className="reference-block__icon" />
                        <span className="reference-block__inline-text">
                            {contentSnapshot ||
                                (referencedNoteTitle
                                    ? `From ${referencedNoteTitle}`
                                    : `^${referencedBlockId}`)}
                        </span>
                        <ExternalLink size={12} className="reference-block__external-icon" />
                    </button>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="reference-block__copy-btn"
                        title="Copy reference"
                    >
                        <Copy size={12} />
                    </button>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="reference-block__remove-btn"
                        title="Remove reference"
                    >
                        <X size={14} />
                    </button>
                </div>
            );
            }

            // Embed mode - full content preview
            return (
                <div
                    className="reference-block reference-block--embed"
                    data-align={props.block.props.textAlignment}
                    contentEditable={false}
                >
                    <div className="reference-block__embed-header">
                        <span className="reference-block__embed-title">
                            {referencedNoteTitle || "Referenced Block"}
                        </span>
                        <div className="reference-block__embed-actions">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="reference-block__embed-action"
                                title="Copy reference"
                            >
                                <Copy size={12} />
                            </button>
                            <button
                                type="button"
                                onClick={handleNavigate}
                                className="reference-block__embed-action"
                                title="Go to block"
                            >
                                <ExternalLink size={12} />
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="reference-block__embed-action reference-block__embed-action--danger"
                                title="Remove reference"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                    <div className="reference-block__embed-content">
                        {contentSnapshot || (
                            <span className="text-muted-foreground italic">
                                Empty block content
                            </span>
                        )}
                    </div>
                    <div className="reference-block__embed-footer">
                        <span className="reference-block__embed-id">
                            ^{referencedBlockId}
                        </span>
                    </div>
                </div>
            );
        },
    }
);

/**
 * Create a reference block from a block ID
 *
 * @param editor - The BlockNote editor instance
 * @param blockId - The block ID to reference
 * @param mode - Reference mode (inline or embed)
 * @returns The created reference block
 */
export function createReferenceBlock(
    editor: any, // BlockNoteEditor with custom blocks has incompatible generic types
    blockId: string,
    mode: ReferenceMode = "inline"
): { id: string; type: string; props: ReferenceBlockProps } {
    // Find the referenced block
    const block = findBlockById(editor, blockId);

    if (!block) {
        // Return invalid reference block
        return {
            id: crypto.randomUUID(),
            type: "reference",
            props: {
                referencedBlockId: blockId,
                mode,
                textAlignment: "left",
            },
        };
    }

    // Create reference block with snapshot
    return {
        id: crypto.randomUUID(),
        type: "reference",
        props: {
            referencedBlockId: blockId,
            contentSnapshot: extractBlockText(block),
            mode,
            textAlignment: "left",
        },
    };
}

/**
 * Check if text is a block reference
 *
 * @param text - The text to check
 * @returns True if text matches ^blockId pattern
 */
export function isBlockReference(text: string): boolean {
    return /^\^[a-zA-Z0-9-]+$/.test(text.trim());
}
