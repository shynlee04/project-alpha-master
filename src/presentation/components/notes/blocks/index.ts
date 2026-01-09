/**
 * @fileoverview Custom BlockNote Blocks
 * @module presentation/components/notes/blocks
 * @story MM-12
 *
 * Custom BlockNote block components for Notes workspace.
 * - ImageBlock: Inline image rendering
 * - CodeFileBlock: Syntax-highlighted code files
 * - FileAttachmentBlock: Generic file attachments
 * - EmbedBlock: Rich embeds (YouTube, Twitter, GitHub, Spotify, etc.)
 */

// Re-export all blocks
export { ImageBlock } from "./ImageBlock";
export { CodeFileBlock, createCodeFileBlock } from "./CodeFileBlock";
export { FileAttachmentBlock, createFileAttachmentBlock } from "./FileAttachmentBlock";
export { EmbedBlock } from "./EmbedBlock";
export type { EmbedProvider } from "./embed-block-types";

