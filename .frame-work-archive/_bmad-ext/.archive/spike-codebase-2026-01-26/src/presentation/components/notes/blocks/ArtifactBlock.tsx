/**
 * @fileoverview Interactive HTML Artifact Block for BlockNote
 * @module presentation/components/notes/blocks/ArtifactBlock
 * @story 44-06: Interactive HTML artifact block
 * @created 2026-01-14
 *
 * Custom BlockNote block for embedding AI-generated interactive content.
 * Features:
 * - Sandboxed iframe for safe HTML/CSS/JS execution
 * - Code editor view (HTML, CSS, JS tabs)
 * - Open in new tab functionality
 * - Resize handle
 * - 8-bit design system compliance
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Code2, ExternalLink, X, Maximize2, Minimize2, Eye, Edit3, Copy, RefreshCw } from "lucide-react";
import { useState, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import "./ArtifactBlock.css";

// ============================================================================
// Types
// ============================================================================

type ViewMode = "preview" | "code";
type CodeTab = "html" | "css" | "js";

// ============================================================================
// Artifact Block
// ============================================================================

export const ArtifactBlock = createReactBlockSpec(
  {
    type: "artifactBlock",
    propSchema: {
      // HTML content
      html: { default: "" },
      // CSS styles
      css: { default: "" },
      // JavaScript code
      js: { default: "" },
      // Artifact title
      title: { default: "Interactive Artifact" },
      // Source (ai-generated, user-created, imported)
      source: { default: "ai-generated" },
      // Height in pixels
      height: { default: 300 },
      // Text alignment
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => {
      const { html, css, js, title, height } = props.block.props;
      
      const [viewMode, setViewMode] = useState<ViewMode>("preview");
      const [codeTab, setCodeTab] = useState<CodeTab>("html");
      const [isExpanded, setIsExpanded] = useState(false);
      const [htmlInput, setHtmlInput] = useState(html || "");
      const [cssInput, setCssInput] = useState(css || "");
      const [jsInput, setJsInput] = useState(js || "");
      const [titleInput, setTitleInput] = useState(title || "Interactive Artifact");
      const [heightInput, setHeightInput] = useState(height || 300);
      const iframeRef = useRef<HTMLIFrameElement>(null);

      // Update block props
      const updateBlock = useCallback((updates: Record<string, unknown>) => {
        props.editor.updateBlock(props.block, {
          type: "artifactBlock",
          props: updates,
        });
      }, [props.editor, props.block]);

      // Build sandboxed HTML document
      const srcDoc = useMemo(() => {
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 16px; }
    ${cssInput}
  </style>
</head>
<body>
  ${htmlInput}
  <script>
    try {
      ${jsInput}
    } catch (e) {
      console.error('Artifact JS Error:', e);
    }
  </script>
</body>
</html>`;
      }, [htmlInput, cssInput, jsInput]);

      // Save changes
      const handleSave = useCallback(() => {
        updateBlock({
          html: htmlInput,
          css: cssInput,
          js: jsInput,
          title: titleInput,
          height: heightInput,
        });
        toast.success("Artifact saved");
      }, [htmlInput, cssInput, jsInput, titleInput, heightInput, updateBlock]);

      // Refresh iframe
      const handleRefresh = useCallback(() => {
        if (iframeRef.current) {
          iframeRef.current.srcdoc = srcDoc;
        }
      }, [srcDoc]);

      // Open in new tab
      const handleOpenInNewTab = useCallback(() => {
        const blob = new Blob([srcDoc], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, [srcDoc]);

      // Copy code
      const handleCopyCode = useCallback(() => {
        navigator.clipboard.writeText(srcDoc);
        toast.success("HTML copied to clipboard");
      }, [srcDoc]);

      // Remove block
      const handleRemove = useCallback(() => {
        props.editor.removeBlocks([props.block]);
      }, [props.editor, props.block]);

      // Get current code content for active tab
      const getCurrentCode = () => {
        switch (codeTab) {
          case "html": return htmlInput;
          case "css": return cssInput;
          case "js": return jsInput;
        }
      };

      // Set current code content for active tab
      const setCurrentCode = (value: string) => {
        switch (codeTab) {
          case "html": setHtmlInput(value); break;
          case "css": setCssInput(value); break;
          case "js": setJsInput(value); break;
        }
      };

      return (
        <div
          className={cn(
            "artifact-block",
            isExpanded && "artifact-block--expanded"
          )}
          data-content-type="artifactBlock"
        >
          {/* Header */}
          <div className="artifact-block__header">
            <div className="artifact-block__title-section">
              {viewMode === "code" ? (
                <input
                  type="text"
                  className="artifact-block__title-input"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Artifact title..."
                />
              ) : (
                <span className="artifact-block__title">{titleInput}</span>
              )}
              <span className="artifact-block__badge">ARTIFACT</span>
            </div>
            <div className="artifact-block__actions">
              {/* View Mode Toggle */}
              <button
                type="button"
                className={cn("artifact-block__action-btn", viewMode === "preview" && "artifact-block__action-btn--active")}
                onClick={() => setViewMode("preview")}
                title="Preview"
              >
                <Eye size={14} />
              </button>
              <button
                type="button"
                className={cn("artifact-block__action-btn", viewMode === "code" && "artifact-block__action-btn--active")}
                onClick={() => setViewMode("code")}
                title="Edit Code"
              >
                <Edit3 size={14} />
              </button>
              
              <div className="artifact-block__divider" />
              
              <button
                type="button"
                className="artifact-block__action-btn"
                onClick={handleRefresh}
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                className="artifact-block__action-btn"
                onClick={handleCopyCode}
                title="Copy HTML"
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                className="artifact-block__action-btn"
                onClick={handleOpenInNewTab}
                title="Open in New Tab"
              >
                <ExternalLink size={14} />
              </button>
              <button
                type="button"
                className="artifact-block__action-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                className="artifact-block__close"
                onClick={handleRemove}
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="artifact-block__content">
            {viewMode === "preview" ? (
              /* Preview Mode - Sandboxed iframe */
              <div 
                className="artifact-block__preview"
                style={{ height: isExpanded ? "500px" : `${heightInput}px` }}
              >
                {(htmlInput || cssInput || jsInput) ? (
                  <iframe
                    ref={iframeRef}
                    srcDoc={srcDoc}
                    sandbox="allow-scripts"
                    className="artifact-block__iframe"
                    title={titleInput}
                  />
                ) : (
                  <div className="artifact-block__empty">
                    <Code2 size={48} />
                    <p>No content yet</p>
                    <button 
                      type="button"
                      className="artifact-block__add-btn"
                      onClick={() => setViewMode("code")}
                    >
                      Add HTML/CSS/JS
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Code Editor Mode */
              <div className="artifact-block__editor">
                {/* Code Tabs */}
                <div className="artifact-block__tabs">
                  <button
                    type="button"
                    className={cn("artifact-block__tab", codeTab === "html" && "artifact-block__tab--active")}
                    onClick={() => setCodeTab("html")}
                  >
                    HTML
                  </button>
                  <button
                    type="button"
                    className={cn("artifact-block__tab", codeTab === "css" && "artifact-block__tab--active")}
                    onClick={() => setCodeTab("css")}
                  >
                    CSS
                  </button>
                  <button
                    type="button"
                    className={cn("artifact-block__tab", codeTab === "js" && "artifact-block__tab--active")}
                    onClick={() => setCodeTab("js")}
                  >
                    JS
                  </button>
                  <div className="artifact-block__tab-spacer" />
                  <button
                    type="button"
                    className="artifact-block__save-btn"
                    onClick={handleSave}
                  >
                    Save & Preview
                  </button>
                </div>
                
                {/* Code Textarea */}
                <textarea
                  className="artifact-block__code"
                  value={getCurrentCode()}
                  onChange={(e) => setCurrentCode(e.target.value)}
                  placeholder={
                    codeTab === "html" ? "<div>Your HTML here...</div>" :
                    codeTab === "css" ? "/* Your CSS styles */" :
                    "// Your JavaScript code"
                  }
                  spellCheck={false}
                  style={{ height: isExpanded ? "400px" : `${Math.max(heightInput - 50, 150)}px` }}
                />

                {/* Height Control */}
                <div className="artifact-block__height-control">
                  <label>Preview Height:</label>
                  <input
                    type="number"
                    min="100"
                    max="800"
                    value={heightInput}
                    onChange={(e) => setHeightInput(parseInt(e.target.value) || 300)}
                  />
                  <span>px</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    },
  }
);

export default ArtifactBlock;
