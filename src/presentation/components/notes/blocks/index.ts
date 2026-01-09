/**
 * @fileoverview Custom BlockNote Blocks
 * @module presentation/components/notes/blocks
 * @story P1.5-03
 *
 * Custom BlockNote block components for Notes workspace.
 * - ImageBlock: Inline image rendering
 * - CodeFileBlock: Syntax-highlighted code files
 * - FileAttachmentBlock: Generic file attachments
 */

// Re-export all blocks
export { ImageBlock } from "./ImageBlock";
export { CodeFileBlock, createCodeFileBlock } from "./CodeFileBlock";
export { FileAttachmentBlock, createFileAttachmentBlock } from "./FileAttachmentBlock";

