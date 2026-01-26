/**
 * @fileoverview Image Block for BlockNote
 * @module presentation/components/notes/blocks/ImageBlock
 * @story P1.5-03
 *
 * Custom BlockNote block for rendering inline images.
 * Supports URL, alt text, and sizing.
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { FileImage, X } from "lucide-react";
import { useState } from "react";
import "./ImageBlock.css";

/**
 * Image Block - Custom BlockNote block for inline images
 */
export const ImageBlock = createReactBlockSpec(
  {
    type: "image",
    propSchema: {
      // Image URL
      url: {
        default: "",
      },
      // Alt text for accessibility
      alt: {
        default: "",
      },
      // Image width (px or percentage)
      width: {
        default: "100%",
      },
      // Text alignment
      textAlignment: defaultProps.textAlignment,
    },
    content: "none", // No inline content for images
  },
  {
    render: (props) => {
      const [urlInput, setUrlInput] = useState(props.block.props.url || "");
      const [altInput, setAltInput] = useState(props.block.props.alt || "");
      const [isEditing, setIsEditing] = useState(!props.block.props.url);

      const handleSave = () => {
        props.editor.updateBlock(props.block, {
          type: "image",
          props: {
            url: urlInput.trim(),
            alt: altInput.trim(),
          },
        });
        setIsEditing(false);
      };

      const handleRemove = () => {
        props.editor.removeBlocks([props.block]);
      };

      // Editing state - show input form
      if (isEditing) {
        return (
          <div className="image-block-edit" contentEditable={false}>
            <div className="image-block-edit__content">
              <FileImage size={16} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Image URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="image-block-edit__input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (urlInput.trim()) {
                      handleSave();
                    }
                  }
                }}
                autoFocus
              />
              <input
                type="text"
                placeholder="Alt text..."
                value={altInput}
                onChange={(e) => setAltInput(e.target.value)}
                className="image-block-edit__input image-block-edit__input--alt"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (urlInput.trim()) {
                      handleSave();
                    }
                  }
                }}
              />
              {urlInput.trim() && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="image-block-edit__button"
                >
                  Insert
                </button>
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="image-block-edit__button image-block-edit__button--danger"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      }

      // View state - show image
      return (
        <div className="image-block" data-align={props.block.props.textAlignment}>
          <div className="image-block__wrapper" contentEditable={false}>
            <img
              src={props.block.props.url}
              alt={props.block.props.alt}
              style={{ width: props.block.props.width }}
              className="image-block__img"
              onError={(e) => {
                // Show placeholder on error
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="image-block__edit-btn"
              title="Edit image"
            >
              <FileImage size={14} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="image-block__remove-btn"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
          {props.block.props.alt && (
            <p className="image-block__caption">{props.block.props.alt}</p>
          )}
        </div>
      );
    },
  }
);
