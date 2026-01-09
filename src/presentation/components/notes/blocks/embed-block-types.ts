/**
 * @fileoverview Embed Block Types
 * @module presentation/components/notes/blocks/embed-block-types
 * @story MM-12
 *
 * TypeScript interfaces for embed block support.
 * Supports oEmbed protocol for common providers (YouTube, Twitter, etc.)
 */

/**
 * Embed block type for BlockNote
 */
export interface EmbedBlock {
  type: "embed";
  props: {
    /** The original URL to embed */
    url: string;
    /** Detected provider name */
    provider: EmbedProvider;
    /** Embed URL for iframe src */
    embedUrl?: string;
    /** Title from oEmbed response */
    title?: string;
    /** Thumbnail image URL */
    thumbnail?: string;
    /** HTML content from oEmbed */
    html?: string;
    /** Width for iframe */
    width?: string;
    /** Height for iframe */
    height?: string;
  };
  content: never[];
  children: never[];
}

/**
 * Supported embed providers
 */
export type EmbedProvider =
  | "youtube"
  | "vimeo"
  | "twitter"
  | "x"
  | "github"
  | "spotify"
  | "codepen"
  | "codesandbox"
  | "figma"
  | "instagram"
  | "reddit"
  | "slideshare"
  | "soundcloud"
  | "ted"
  | "twitch"
  | "generic";

/**
 * oEmbed response types
 */
export type OEmbedType =
  | "link"
  | "photo"
  | "video"
  | "rich"
  | "photo";

/**
 * oEmbed response from provider API
 */
export interface OEmbedResponse {
  /** Resource type */
  type: OEmbedType;
  /** Resource version */
  version: "1.0";
  /** Resource title */
  title?: string;
  /** Author name */
  author_name?: string;
  /** Author URL */
  author_url?: string;
  /** Provider name */
  provider_name?: string;
  /** Provider URL */
  provider_url?: string;
  /** Thumbnail URL */
  thumbnail_url?: string;
  /** Thumbnail width */
  thumbnail_width?: number;
  /** Thumbnail height */
  thumbnail_height?: number;
  /** HTML for embedded content */
  html?: string;
  /** Width of embedded content */
  width?: number;
  /** Height of embedded content */
  height?: number;
  /** Duration in seconds (for video/audio) */
  duration?: number;
  /** Description */
  description?: string;
}

/**
 * Provider detection result
 */
export interface ProviderMatch {
  provider: EmbedProvider;
  embedUrl: string;
  thumbnail?: string;
  title?: string;
}

/**
 * Provider URL patterns for detection
 */
export const PROVIDER_PATTERNS: Record<EmbedProvider, RegExp[]> = {
  youtube: [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
  ],
  vimeo: [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/channels\/[^\/]+\/(\d+)/,
  ],
  twitter: [
    /twitter\.com\/[a-zA-Z0-9_]+\/status\/(\d+)/,
  ],
  x: [
    /x\.com\/[a-zA-Z0-9_]+\/status\/(\d+)/,
  ],
  github: [
    // Regular repo URLs
    /github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/,
    /github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/,
    // Blob URLs for file viewing
    /github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/blob\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/,
    // Gist URLs
    /gist\.github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9]+)/,
  ],
  spotify: [
    /spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
  ],
  codepen: [
    /codepen\.io\/([a-zA-Z0-9_-]+)\/pen\/([a-zA-Z0-9_-]+)/,
    /codepen\.io\/([a-zA-Z0-9_-]+)\/details\/([a-zA-Z0-9_-]+)/,
  ],
  codesandbox: [
    /codesandbox\.io\/s\/([a-zA-Z0-9_-]+)/,
    /codesandbox\.io\/embed\/([a-zA-Z0-9_-]+)/,
  ],
  figma: [
    /figma\.com\/file\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/,
    /figma\.com\/proto\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/,
  ],
  instagram: [
    /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
  ],
  reddit: [
    /reddit\.com\/r\/[a-zA-Z0-9_]+\/comments\/([a-zA-Z0-9]+)/,
  ],
  slideshare: [
    /slideshare\.net\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/,
  ],
  soundcloud: [
    /soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/,
  ],
  ted: [
    /ted\.com\/talks\/[a-zA-Z0-9_-]+/,
  ],
  twitch: [
    /twitch\.tv\/[a-zA-Z0-9_]+$/,
    /twitch\.tv\/videos\/(\d+)/,
  ],
  generic: [],
};

/**
 * Embed URL transformers for each provider
 */
export const EMBED_URLS: Partial<Record<EmbedProvider, (url: string, id: string) => string>> = {
  youtube: (_url, id) => `https://www.youtube.com/embed/${id}`,
  vimeo: (_url, id) => `https://player.vimeo.com/video/${id}`,
  twitter: (_url, id) => `https://platform.twitter.com/embed/index.html?conversation_id=${id}`,
  x: (_url, id) => `https://platform.twitter.com/embed/index.html?conversation_id=${id}`,
  github: (url, id) => {
    // Handle gist URLs
    if (url.includes("gist.github.com")) {
      return `https://gist.github.com/${id}.js`;
    }
    return url; // Fallback to original for file embeds
  },
  spotify: (url, id) => {
    const type = url.includes("/track/") ? "track" : url.includes("/album/") ? "album" : "playlist";
    return `https://open.spotify.com/embed/${type}/${id}`;
  },
  codepen: (_url, id) => `https://codepen.io/${id.split("/")[0]}/embed/${id.split("/")[1]}?default-tab=result&theme-id=dark`,
  codesandbox: (_url, id) => `https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark`,
  figma: (url, _id) => `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`,
  instagram: (_url, id) => `https://www.instagram.com/p/${id}/embed`,
  reddit: (url, id) => `https://www.reddit.com/r/${url.match(/reddit\.com\/r\/([^\/]+)/)?.[1] || "r"}/comments/${id}/embed`,
  soundcloud: (url) => `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`,
  twitch: (url, id) => {
    if (url.includes("/videos/")) {
      return `https://player.twitch.tv/?video=${id}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}`;
    }
    return `https://player.twitch.tv/?channel=${id}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}`;
  },
};
