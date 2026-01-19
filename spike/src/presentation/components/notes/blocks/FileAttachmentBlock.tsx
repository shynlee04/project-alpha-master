/**
 * @fileoverview File Attachment Block for BlockNote
 * @module presentation/components/notes/blocks/FileAttachmentBlock
 * @story P1.5-03
 *
 * Custom BlockNote block for rendering generic file attachments.
 * Shows file icon, name, and size.
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import {
  File,
  FileText,
  FileImage,
  FileCode,
  Music,
  Video,
  Archive,
  X,
} from "lucide-react";
import "./FileAttachmentBlock.css";

/**
 * Get icon for file based on extension
 */
function getFileIcon(filename: string): typeof File {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  // Image files
  if (["jpg", "jpeg", "png", "gif", "svg", "webp", "ico", "bmp"].includes(ext)) {
    return FileImage;
  }
  // Code files
  if (["js", "ts", "jsx", "tsx", "py", "rs", "go", "java", "c", "cpp", "h", "cs", "php", "rb", "swift", "kt"].includes(ext)) {
    return FileCode;
  }
  // Audio files
  if (["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(ext)) {
    return Music;
  }
  // Video files
  if (["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(ext)) {
    return Video;
  }
  // Archive files
  if (["zip", "rar", "tar", "gz", "7z", "bz2"].includes(ext)) {
    return Archive;
  }
  // Text files
  if (["txt", "md", "rst", "log"].includes(ext)) {
    return FileText;
  }
  // Default
  return File;
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * File Attachment Block - Custom BlockNote block for generic file attachments
 */
export const FileAttachmentBlock = createReactBlockSpec(
  {
    type: "fileAttachment",
    propSchema: {
      // File name
      fileName: {
        default: "",
      },
      // File path
      filePath: {
        default: "",
      },
      // File size in bytes
      fileSize: {
        default: 0,
      },
      // File type/mime
      fileType: {
        default: "",
      },
      // Text alignment
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => {
      const fileName = props.block.props.fileName || "Untitled";
      const fileSize = props.block.props.fileSize || 0;
      const Icon = getFileIcon(fileName);

      const handleRemove = () => {
        props.editor.removeBlocks([props.block]);
      };

      return (
        <div className="file-attachment-block" data-align={props.block.props.textAlignment}>
          <div className="file-attachment-block__content" contentEditable={false}>
            <div className="file-attachment-block__icon">
              <Icon size={24} />
            </div>
            <div className="file-attachment-block__info">
              <span className="file-attachment-block__name" title={fileName}>
                {fileName}
              </span>
              {fileSize > 0 && (
                <span className="file-attachment-block__size">
                  {formatFileSize(fileSize)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="file-attachment-block__remove"
              title="Remove attachment"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      );
    },
  }
);

/**
 * Helper function to create a FileAttachmentBlock from file info
 * Used by drag-drop handlers
 */
export function createFileAttachmentBlock(
  fileName: string,
  filePath: string,
  fileSize: number = 0,
  fileType: string = ""
): { type: "fileAttachment"; props: { fileName: string; filePath: string; fileSize: number; fileType: string } } {
  return {
    type: "fileAttachment",
    props: {
      fileName,
      filePath,
      fileSize,
      fileType,
    },
  };
}
