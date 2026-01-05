# Story E2-6: URL Fetching and Preview

**Document ID**: `cwac-story-e2-6-2026-01-05`
**Epic**: E2 (Multimodal Input System)
**Story**: E2-6
**Status**: `IN_PROGRESS`
**Points**: 6
**Created**: 2026-01-05T23:45:00Z

---

## Overview

Enable users to attach URLs to chat messages with automatic metadata fetching and Open Graph preview generation.

---

## User Story

**As** a user sharing a link with the AI agent
**I want** to paste a URL and see a preview of the content
**So that** I can reference external resources without leaving the chat

---

## Acceptance Criteria

1. **URL Input**
   - URL input button next to file attachment
   - Paste URL or type manually
   - URL validation (http/https)
   - Show loading state while fetching

2. **Metadata Fetching**
   - Fetch page title
   - Fetch Open Graph description
   - Fetch Open Graph image
   - Fetch favicon
   - Timeout after 10 seconds

3. **URL Preview Card**
   - Show favicon + domain
   - Show page title
   - Show description
   - Show OG image if available
   - Click to open in new tab

4. **Error Handling**
   - Network timeout
   - Invalid URL
   - Blocked by CORS
   - No metadata available (fallback to URL only)

5. **TypeScript & Quality**
   - Zero TypeScript errors
   - Component ≤300 lines
   - i18n complete (EN + VI)

---

## Technical Implementation

### URL Metadata Fetcher

```typescript
interface URLMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  domain: string;
}

async function fetchURLMetadata(url: string): Promise<URLMetadata> {
  // Use a CORS proxy or server-side endpoint
  // Parse HTML and extract Open Graph tags
  // Fallback to basic title/favicon if OG tags missing
}
```

### URL Input Dialog

```typescript
interface URLInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (metadata: URLMetadata) => void;
}

export function URLInputDialog({ isOpen, onClose, onAdd }: URLInputDialogProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<URLMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchURLMetadata(url);
      setMetadata(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ...
}
```

### URL Preview Card

```typescript
interface URLPreviewCardProps {
  metadata: URLMetadata;
  onRemove: () => void;
}

export function URLPreviewCard({ metadata, onRemove }: URLPreviewCardProps) {
  return (
    <div className="flex gap-3 bg-secondary/50 rounded-none border border-border p-3 max-w-[350px]">
      {metadata.image && (
        <img src={metadata.image} alt="" className="w-16 h-16 rounded-sm object-cover" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{metadata.domain}</p>
        <p className="text-sm font-medium truncate">{metadata.title || metadata.url}</p>
        {metadata.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{metadata.description}</p>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onRemove}>
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}
```

---

## Files to Create

1. **`src/lib/metadata/fetch-url-metadata.ts`** (~150 lines)
   - URL metadata fetching
   - Open Graph parsing
   - CORS proxy integration
   - Fallback handling

2. **`src/presentation/components/chat/URLInputDialog.tsx`** (~200 lines)
   - URL input dialog
   - Metadata fetching
   - Preview card
   - Error handling

---

## Files to Modify

1. **`src/presentation/components/chat/FileAttachmentInput.tsx`**
   - Add URL input button
   - Integrate URLInputDialog
   - Add URL attachment type

2. **`src/i18n/en/chat.json` & `src/i18n/vi/chat.json`**
   - Add url.* namespace

---

## i18n Strings

```json
{
  "url": {
    "add": "Add link",
    "pasteUrl": "Paste URL...",
    "invalid": "Invalid URL",
    "fetching": "Fetching link info...",
    "fetchError": "Could not fetch link info",
    "timeout": "Request timed out",
    "blocked": "Link access blocked by browser",
    "openLink": "Open link"
  }
}
```

---

## CORS Handling

Since browsers block cross-origin requests, use one of these approaches:

1. **CORS Proxy** (Recommended for MVP)
   - Use public CORS proxy: `https://corsproxy.io/?`
   - Or deploy a simple proxy endpoint

2. **Server-Side Fetching**
   - Add `/api/fetch-metadata` endpoint
   - Server fetches URL and returns metadata
   - No CORS issues

3. **Client-Side Only**
   - Use `no-cors` mode (opaque response, limited data)
   - Fallback to URL-only preview

---

## Dependencies

- ✅ E2-4: File Attachment UI (DONE) - provides base attachment infrastructure
- None: No blocking dependencies for URL fetching

---

## Test Strategy

### Functional Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| UF-001 | Add URL | Click link button, paste URL | URL preview shown |
| UF-002 | Fetch metadata | Paste valid URL | Title, description, image fetched |
| UF-003 | Invalid URL | Paste "not-a-url" | Error message shown |
| UF-004 | Timeout | Use slow URL | Timeout after 10s |
| UF-005 | Remove URL | Click remove button | URL attachment removed |
| UF-006 | Open link | Click preview card | Opens in new tab |

### Example URLs for Testing

- Wikipedia: `https://en.wikipedia.org/wiki/Artificial_intelligence`
- GitHub: `https://github.com/facebook/react`
- News site: `https://www.bbc.com/news`
- Blog post: Any blog with OG tags

---

## Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Metadata fetch success rate | ≥80% | TBD |
| Average fetch time | <3 seconds | TBD |
| Fallback rate | <20% | TBD |

---

**Version**: 1.0.0
**Last Updated**: 2026-01-05T23:45:00Z
