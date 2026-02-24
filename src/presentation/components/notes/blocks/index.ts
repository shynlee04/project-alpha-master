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
 * - CalloutBlock: UX-09 - Notion-style callout blocks with icons
 * - ReferenceBlock: UX-10 - Obsidian-style block references
 * - ColumnBlock: UX-11 - Multi-column layout containers
 * - SyncedBlock: UX-12 - Synced blocks that mirror content across instances
 */

// Re-export all blocks
export { ImageBlock } from "./ImageBlock";
export { CodeFileBlock, createCodeFileBlock } from "./CodeFileBlock";
export { FileAttachmentBlock, createFileAttachmentBlock } from "./FileAttachmentBlock";
export { EmbedBlock } from "./EmbedBlock";
export type { EmbedProvider } from "./embed-block-types";

// UX-09: Callout blocks
export { CalloutBlock, createCalloutContent, getCalloutIcon } from "./CalloutBlock";
export type { CalloutType } from "./CalloutBlock";

// UX-10: Block references
export {
    ReferenceBlock,
    createReferenceBlock,
    extractBlockId,
    findBlockById,
    extractBlockText,
    isBlockReference,
} from "./ReferenceBlock";
export type { ReferenceMode, ReferenceBlockProps } from "./ReferenceBlock";

// UX-11: Column layouts
export {
    ColumnBlock,
    createColumnBlock,
} from "./ColumnBlock";
export type { ColumnCount, ColumnConfig, ColumnBlockProps } from "./ColumnBlock";

// UX-12: Synced blocks
export {
    SyncedBlock,
    createSyncedBlock,
    registerSyncGroup,
    getSyncGroup,
    getAllSyncGroups,
    addInstanceToSyncGroup,
    removeInstanceFromSyncGroup,
    propagateToSyncGroup,
} from "./SyncedBlock";
export type { SyncedBlockProps, SyncGroup } from "./SyncedBlock";

