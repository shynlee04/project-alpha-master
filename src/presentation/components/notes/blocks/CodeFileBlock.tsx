/**
 * @fileoverview Code File Block for BlockNote
 * @module presentation/components/notes/blocks/CodeFileBlock
 * @story P1.5-03
 *
 * Custom BlockNote block for rendering code files with syntax highlighting.
 * Supports multiple languages with basic syntax highlighting.
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { FileCode, X, Copy, Check } from "lucide-react";
import { useState, useCallback, type ReactElement } from "react";
import "./CodeFileBlock.css";

/**
 * Language display names and extensions mapping
 */
const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  rs: "rust",
  go: "go",
  java: "java",
  cpp: "cpp",
  c: "c",
  cs: "csharp",
  php: "php",
  rb: "ruby",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
  json: "json",
  xml: "xml",
  html: "html",
  css: "css",
  scss: "scss",
  md: "markdown",
};

/**
 * Get language from file extension
 */
function getLanguageFromPath(filePath: string): string {
  if (!filePath) return "text";
  const ext = filePath.split(".").pop()?.toLowerCase();
  return LANGUAGE_MAP[ext || ""] || "text";
}

/**
 * Simple syntax tokenizer for code highlighting
 */
function tokenizeCode(code: string): ReactElement {
  const keywords = [
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "import", "export", "from", "default", "async", "await", "class", "extends",
    "interface", "type", "enum", "public", "private", "protected", "static",
    "new", "this", "super", "try", "catch", "finally", "throw", "def",
    "class", "struct", "impl", "fn", "let", "mut", "pub", "use", "mod",
  ];

  const lines = code.split("\n");
  return (
    <>
      {lines.map((line, lineIdx) => (
        <div key={lineIdx} className="code-line">
          {tokenizeLine(line, keywords)}
        </div>
      ))}
    </>
  );
}

/**
 * Tokenize a single line of code
 */
function tokenizeLine(line: string, keywords: string[]): ReactElement {
  const parts: ReactElement[] = [];
  let remaining = line;
  let idx = 0;

  while (remaining.length > 0) {
    // String literals
    const strMatch = remaining.match(/^(['"`])(?:(?!\1)[^\\]|\\.)*?\1/);
    if (strMatch) {
      parts.push(<span key={idx++} className="token-string">{strMatch[0]}</span>);
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }

    // Comments - check line comments first, then block comments
    let commentMatch = remaining.match(/^\/\/.*$/);
    if (!commentMatch && remaining.startsWith("/*")) {
      const endIndex = remaining.indexOf("*/");
      if (endIndex !== -1) {
        commentMatch = [remaining.slice(0, endIndex + 2)];
      }
    }
    if (commentMatch) {
      parts.push(<span key={idx++} className="token-comment">{commentMatch[0]}</span>);
      remaining = remaining.slice(commentMatch[0].length);
      continue;
    }

    // Numbers
    const numMatch = remaining.match(/^\b\d+(\.\d+)?\b/);
    if (numMatch) {
      parts.push(<span key={idx++} className="token-number">{numMatch[0]}</span>);
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Keywords
    const wordMatch = remaining.match(/^\b[a-zA-Z_][a-zA-Z0-9_]*\b/);
    if (wordMatch) {
      const word = wordMatch[0];
      if (keywords.includes(word)) {
        parts.push(<span key={idx++} className="token-keyword">{word}</span>);
      } else if (word[0] === word[0].toUpperCase() && /^[A-Z]/.test(word)) {
        parts.push(<span key={idx++} className="token-type">{word}</span>);
      } else {
        parts.push(<span key={idx++}>{word}</span>);
      }
      remaining = remaining.slice(word.length);
      continue;
    }

    // Default
    parts.push(<span key={idx++}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return <>{parts}</>;
}

/**
 * Code File Block - Custom BlockNote block for code files
 */
export const CodeFileBlock = createReactBlockSpec(
  {
    type: "codeFile",
    propSchema: {
      // File path for reference
      filePath: {
        default: "",
      },
      // Programming language
      language: {
        default: "text",
      },
      // Code content
      code: {
        default: "",
      },
      // Whether to show line numbers
      showLineNumbers: {
        default: true,
      },
      // Text alignment
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => {
      const [copied, setCopied] = useState(false);
      const code = props.block.props.code || "";
      const language = props.block.props.language || "text";
      const filePath = props.block.props.filePath || "";

      const handleCopy = useCallback(async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Silent fail
        }
      }, [code]);

      const handleRemove = () => {
        props.editor.removeBlocks([props.block]);
      };

      return (
        <div className="code-file-block" data-align={props.block.props.textAlignment}>
          <div className="code-file-block__header" contentEditable={false}>
            <div className="code-file-block__title">
              <FileCode size={14} />
              <span className="code-file-block__filename">
                {filePath.split("/").pop() || "code"}
              </span>
              <span className="code-file-block__language">
                {language.toUpperCase()}
              </span>
            </div>
            <div className="code-file-block__actions">
              {copied ? (
                <Check size={14} className="text-success" />
              ) : (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="code-file-block__action-btn"
                  title="Copy code"
                >
                  <Copy size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="code-file-block__action-btn code-file-block__action-btn--remove"
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <pre className="code-file-block__content">
            <code>{tokenizeCode(code)}</code>
          </pre>
        </div>
      );
    },
  }
);

/**
 * Helper function to create a CodeFileBlock from file content
 * Used by drag-drop handlers
 */
export function createCodeFileBlock(
  filePath: string,
  content: string
): { type: "codeFile"; props: { filePath: string; code: string; language: string } } {
  const language = getLanguageFromPath(filePath);
  return {
    type: "codeFile",
    props: {
      filePath,
      code: content,
      language,
    },
  };
}
