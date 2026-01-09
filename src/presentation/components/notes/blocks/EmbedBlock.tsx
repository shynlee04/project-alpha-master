/**
 * @fileoverview Embed Block for BlockNote
 * @module presentation/components/notes/blocks/EmbedBlock
 * @story MM-12
 *
 * Custom BlockNote block for embedding URLs with provider support.
 * Supports YouTube, Twitter, GitHub, Spotify, and generic embeds.
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import {
  Link,
  ExternalLink,
  Loader2,
  X,
  Video,
  Music,
  FileCode,
} from "lucide-react";
import { useState, useEffect } from "react";
import "./EmbedBlock.css";
import {
  type EmbedProvider,
  PROVIDER_PATTERNS,
  EMBED_URLS,
} from "./embed-block-types";

// Re-export types for convenience
export type { EmbedProvider } from "./embed-block-types";

// Provider detection function
export function detectProvider(url: string): EmbedProvider {
  const lowerUrl = url.toLowerCase();

  // Check each provider pattern
  const patterns = PROVIDER_PATTERNS as Record<EmbedProvider, RegExp[]>;

  for (const [provider, regexList] of Object.entries(patterns)) {
    for (const regex of regexList) {
      if (regex.test(lowerUrl)) {
        return provider as EmbedProvider;
      }
    }
  }

  return "generic";
}

// Extract video ID from URL
export function extractVideoId(url: string, provider: EmbedProvider): string | null {
  const patterns = PROVIDER_PATTERNS[provider];
  if (!patterns) return null;

  for (const regex of patterns) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Get embed URL for provider
export function getEmbedUrl(url: string, provider: EmbedProvider): string {
  const transformers = EMBED_URLS as Partial<Record<EmbedProvider, (url: string, id: string) => string>>;
  const transformer = transformers[provider];

  if (!transformer) {
    return url;
  }

  const id = extractVideoId(url, provider);
  if (!id) {
    return url;
  }

  return transformer(url, id);
}

// Provider display names
export const PROVIDER_NAMES: Record<EmbedProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  twitter: "Twitter",
  x: "X (Twitter)",
  github: "GitHub",
  spotify: "Spotify",
  codepen: "CodePen",
  codesandbox: "CodeSandbox",
  figma: "Figma",
  instagram: "Instagram",
  reddit: "Reddit",
  slideshare: "SlideShare",
  soundcloud: "SoundCloud",
  ted: "TED",
  twitch: "Twitch",
  generic: "Link",
};

// Provider icons
function getProviderIcon(provider: EmbedProvider) {
  switch (provider) {
    case "youtube":
    case "vimeo":
    case "twitch":
      return <Video size={14} />;
    case "spotify":
    case "soundcloud":
      return <Music size={14} />;
    case "github":
    case "codesandbox":
    case "codepen":
      return <FileCode size={14} />;
    default:
      return <Link size={14} />;
  }
}

/**
 * Embed Block - Custom BlockNote block for embedding URLs
 */
export const EmbedBlock = createReactBlockSpec(
  {
    type: "embed",
    propSchema: {
      // Original URL to embed
      url: {
        default: "",
      },
      // Detected provider
      provider: {
        default: "generic",
      },
      // Embed URL for iframe
      embedUrl: {
        default: "",
      },
      // Title from oEmbed or URL
      title: {
        default: "",
      },
      // Thumbnail URL
      thumbnail: {
        default: "",
      },
      // HTML content from oEmbed
      html: {
        default: "",
      },
      // Text alignment
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => {
      const [urlInput, setUrlInput] = useState(props.block.props.url || "");
      const [isEditing, setIsEditing] = useState(!props.block.props.url);
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState(false);

      // Auto-detect provider when URL changes
      useEffect(() => {
        if (urlInput && urlInput.startsWith("http")) {
          const provider = detectProvider(urlInput);
          const embedUrl = getEmbedUrl(urlInput, provider);
          props.editor.updateBlock(props.block, {
            type: "embed",
            props: {
              url: urlInput.trim(),
              provider,
              embedUrl,
            },
          });
        }
      }, [urlInput]);

      const handleSave = () => {
        if (!urlInput.trim()) {
          handleRemove();
          return;
        }

        const provider = detectProvider(urlInput);
        const embedUrl = getEmbedUrl(urlInput, provider);

        props.editor.updateBlock(props.block, {
          type: "embed",
          props: {
            url: urlInput.trim(),
            provider,
            embedUrl,
            title: urlInput.trim(),
          },
        });
        setIsEditing(false);
        setError(false);
      };

      const handleRemove = () => {
        props.editor.removeBlocks([props.block]);
      };

      const handleRetry = () => {
        setError(false);
        setIsEditing(true);
      };

      // Editing state - show input form
      if (isEditing) {
        return (
          <div className="embed-block-edit" contentEditable={false}>
            <div className="embed-block-edit__content">
              <div className="embed-block-edit__icon">
                <Link size={16} className="text-muted-foreground" />
              </div>
              <input
                type="url"
                placeholder="Paste URL to embed (YouTube, Twitter, GitHub, Spotify...)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="embed-block-edit__input"
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
              {urlInput.trim() && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="embed-block-edit__button"
                  title="Embed URL"
                >
                  Embed
                </button>
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="embed-block-edit__button embed-block-edit__button--danger"
                title="Remove embed"
              >
                <X size={14} />
              </button>
            </div>
            <p className="embed-block-edit__hint">
              Supports: YouTube, Twitter, GitHub, Spotify, Vimeo, and more
            </p>
          </div>
        );
      }

      // Error state - show retry option
      if (error || !props.block.props.embedUrl) {
        return (
          <div className="embed-block embed-block--error" data-align={props.block.props.textAlignment}>
            <div className="embed-block__error" contentEditable={false}>
              <div className="embed-block__error-icon">
                <ExternalLink size={20} className="text-muted-foreground" />
              </div>
              <p className="embed-block__error-text">
                Unable to embed this content
              </p>
              <div className="embed-block__error-actions">
                <a
                  href={props.block.props.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="embed-block__error-link"
                >
                  <ExternalLink size={12} />
                  Open {PROVIDER_NAMES[props.block.props.provider as EmbedProvider] || "Link"}
                </a>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="embed-block__error-retry"
                >
                  Edit URL
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="embed-block__remove-btn"
              title="Remove embed"
            >
              <X size={14} />
            </button>
          </div>
        );
      }

      // View state - show embed content
      const provider = props.block.props.provider as EmbedProvider;
      const embedUrl = props.block.props.embedUrl || "";
      const isIframeable = !["github", "codepen", "codesandbox"].includes(provider);

      return (
        <div className="embed-block" data-align={props.block.props.textAlignment}>
          <div className="embed-block__wrapper" contentEditable={false}>
            {isIframeable ? (
              // Iframe embed for most providers
              <div className="embed-block__iframe-container">
                <iframe
                  src={embedUrl}
                  className="embed-block__iframe"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={props.block.props.title || "Embedded content"}
                  onLoad={() => setIsLoading(false)}
                  onError={() => setError(true)}
                />
                {isLoading && (
                  <div className="embed-block__loading">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Loading content...</span>
                  </div>
                )}
              </div>
            ) : (
              // Link embed for code-related providers
              <a
                href={props.block.props.url}
                target="_blank"
                rel="noopener noreferrer"
                className="embed-block__link"
              >
                <div className="embed-block__link-icon">
                  {getProviderIcon(provider)}
                </div>
                <div className="embed-block__link-content">
                  <span className="embed-block__link-title">
                    {props.block.props.title || embedUrl}
                  </span>
                  <span className="embed-block__link-provider">
                    {PROVIDER_NAMES[provider]}
                  </span>
                </div>
                <ExternalLink size={14} className="embed-block__link-external" />
              </a>
            )}

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="embed-block__edit-btn"
              title="Edit embed URL"
            >
              <Link size={14} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="embed-block__remove-btn"
              title="Remove embed"
            >
              <X size={14} />
            </button>
          </div>
          {props.block.props.title && (
            <p className="embed-block__caption">{props.block.props.title}</p>
          )}
        </div>
      );
    },
  }
);
