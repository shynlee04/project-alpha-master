---
title: "6-1 Source Import Pipeline (PDF, URL, Text)"
epic: "Epic 6: Source Ingestion & Management"
story: "6-1-source-import-pipeline"
status: "drafted"
priority: "P0"
points: 5
created: "2025-12-30"
sprint: "SPRINT-6"
team: "Team A"
dependencies: []
---

# Story: 6-1 Source Import Pipeline (PDF, URL, Text)

**As a** student with research materials,
**I want** to drag and drop PDF/URL/text sources into the app,
**So that** I can quickly ingest my study materials.

---

## Story Context

### From Epic 6

Epic 6 delivers "Source Ingestion & Management" with PDF/URL/text import, source card UI, source management, and metadata extraction. Story 6.1 delivers the Source Import Pipeline that handles file validation, PDF parsing, URL fetching, and IndexedDB persistence.

### User Journey

1. User navigates to Knowledge tab
2. User drags a PDF file onto the drop zone
3. Progress indicator shows: "Reading page 1... Extracting text..."
4. Extracted content is stored in IndexedDB
5. Toast notification: "Source imported successfully"

### Technical Context

**Source Types Supported:**
- **PDF:** Parse client-side using PDF.js, extract text per page
- **URL:** Fetch client-side (no server), extract main content
- **Text:** Direct paste, character count displayed

**Key Files:**
- `src/lib/knowledge/source-import.ts`: Import pipeline orchestrator
- `src/lib/knowledge/pdf-parser.ts`: PDF.js wrapper
- `src/lib/knowledge/url-fetcher.ts`: Client-side URL fetcher
- `src/components/knowledge/SourceDropZone.tsx`: Drop zone UI

---

## Acceptance Criteria

### AC-1: PDF File Import

**Given** a user on the Knowledge tab
**When** they drag a PDF file onto the drop zone
**Then** the file is validated (type = application/pdf, size < 50MB)
**And** progress shows: "Reading page 1... Extracting text..." with page count
**And** extracted text is stored in IndexedDB via Dexie with metadata

**And** the source record includes:
- `id`: UUID primary key
- `type`: 'pdf'
- `title`: From PDF metadata or filename
- `content`: Extracted full text
- `pageCount`: Number of pages
- `wordCount`: Total words
- `fileSize`: Original file size in bytes
- `createdAt`: Timestamp
- `projectId`: Current project ID

---

### AC-2: URL Import

**Given** a user pastes a URL
**When** they submit the URL
**Then** the page is fetched client-side (no server round-trip)
**And** main content is extracted (removing nav, ads, footer)
**And** source URL is saved with metadata
**And** extracted text is stored in IndexedDB

**And** the source record includes:
- `id`: UUID primary key
- `type`: 'url'
- `title`: Page <title> or og:title
- `url`: Original URL
- `content`: Main article content
- `wordCount`: Total words
- `createdAt`: Timestamp
- `projectId`: Current project ID

---

### AC-3: Direct Text Import

**Given** a user pastes text directly
**When** they submit
**Then** the text is accepted without size limit
**And** character count is shown
**And** text is stored in IndexedDB

**And** the source record includes:
- `id`: UUID primary key
- `type`: 'text'
- `title`: First line or user-provided title
- `content`: Full text content
- `charCount`: Total characters
- `createdAt`: Timestamp
- `projectId`: Current project ID

---

### AC-4: Background Import Progress

**Given** an import is in progress
**When** the user navigates away
**Then** import continues in background
**And** progress is tracked via event bus
**And** toast notifies when complete: "Source imported successfully"

**And** progress events include:
- `import.started`: { sourceId, type, title }
- `import.progress`: { sourceId, page, totalPages, message }
- `import.completed`: { sourceId, record }
- `import.error`: { sourceId, error }

---

### AC-5: Import Error Handling

**Given** a user attempts an invalid import
**When** validation fails
**Then** appropriate error message is shown:
  - "File too large (max 50MB)"
  - "Invalid file type (PDF, URL, or text only)"
  - "Failed to parse PDF"
  - "Failed to fetch URL"

**And** error is logged to console
**And** partial data is cleaned up from IndexedDB

---

## Implementation Tasks

### Task 1: Add Sources Table to Dexie Schema

**File:** `src/lib/state/dexie-db.ts`

Add new table for source records:
```typescript
/**
 * Source record for knowledge base content
 * @epic Epic 6 - Source Ingestion & Management
 * @story 6-1 - Source Import Pipeline
 */
export interface SourceRecord {
    id: string;                 // Primary key (UUID)
    projectId: string;          // Foreign key to project
    type: 'pdf' | 'url' | 'text';
    title: string;
    content: string;            // Extracted text content
    url?: string;               // For URL sources
    pageCount?: number;         // For PDF sources
    wordCount?: number;         // For PDF/URL sources
    charCount?: number;         // For text sources
    fileSize?: number;          // For PDF sources (bytes)
    createdAt: number;
    updatedAt: number;
}
```

Add table declaration in version 11:
```typescript
// Schema version 11: Epic 6 - Source Ingestion
this.version(11).stores({
    // ... existing tables
    sources: 'id, projectId, type, createdAt, [projectId+type], [projectId+createdAt]',
}).upgrade(async () => {
    console.log('[Dexie] Running migration to v11 (sources table)');
});
```

---

### Task 2: Create PDF Parser

**File:** `src/lib/knowledge/pdf-parser.ts`

```typescript
import * as pdfjsLib from 'pdfjs-dist';

export interface PDFParseResult {
    text: string;
    pageCount: number;
    wordCount: number;
    metadata?: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string[];
    };
}

export class PDFParser {
    /**
     * Parse PDF file and extract text content
     * @param file PDF file blob
     * @param onProgress Optional progress callback
     */
    async parsePDF(
        file: Blob,
        onProgress?: (page: number, total: number) => void
    ): Promise<PDFParseResult> {
        // Load PDF document
        const loadingTask = pdfjsLib.getDocument(await file.arrayBuffer());
        const pdf = await loadingTask.promise;

        const totalPages = pdf.numPages;
        let fullText = '';

        // Extract text from each page
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';

            onProgress?.(i, totalPages);
        }

        return {
            text: fullText.trim(),
            pageCount: totalPages,
            wordCount: fullText.split(/\s+/).length,
        };
    }
}
```

---

### Task 3: Create URL Fetcher

**File:** `src/lib/knowledge/url-fetcher.ts`

```typescript
export interface URLFetchResult {
    title: string;
    content: string;
    wordCount: number;
}

export class URLFetcher {
    /**
     * Fetch URL and extract main content client-side
     * @param url URL to fetch
     */
    async fetchURL(url: string): Promise<URLFetchResult> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract title
        const title = doc.querySelector('title')?.textContent ||
                     doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                     url;

        // Extract main content (remove nav, ads, footer)
        const content = this.extractMainContent(doc);

        return {
            title,
            content,
            wordCount: content.split(/\s+/).length,
        };
    }

    private extractMainContent(doc: Document): string {
        // Remove unwanted elements
        const selectorsToRemove = [
            'nav', 'footer', 'header',
            '[role="navigation"]',
            '[role="complementary"]',
            'script', 'style', 'noscript',
            '.advertisement', '.ad',
        ];

        selectorsToRemove.forEach(selector => {
            doc.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Extract main content
        const mainContent = doc.querySelector('main') ||
                           doc.querySelector('article') ||
                           doc.body;

        return mainContent?.textContent?.trim() || '';
    }
}
```

---

### Task 4: Create Source Import Pipeline

**File:** `src/lib/knowledge/source-import.ts`

```typescript
import { PDFParser } from './pdf-parser';
import { URLFetcher } from './url-fetcher';
import { db, type SourceRecord } from '@/lib/state/dexie-db';
import { eventBus } from '@/lib/events/event-bus';

export type SourceType = 'pdf' | 'url' | 'text';

export interface SourceImportOptions {
    projectId: string;
    onProgress?: (message: string) => void;
}

export class SourceImportPipeline {
    private pdfParser = new PDFParser();
    private urlFetcher = new URLFetcher();

    /**
     * Import PDF source
     */
    async importPDF(
        file: File,
        options: SourceImportOptions
    ): Promise<SourceRecord> {
        this.validatePDF(file);

        const sourceId = crypto.randomUUID();
        eventBus.emit('import.started', { sourceId, type: 'pdf', title: file.name });

        try {
            const result = await this.pdfParser.parsePDF(
                file,
                (page, total) => {
                    options.onProgress?.(`Reading page ${page} of ${total}...`);
                    eventBus.emit('import.progress', { sourceId, page, total });
                }
            );

            const record: SourceRecord = {
                id: sourceId,
                projectId: options.projectId,
                type: 'pdf',
                title: file.name.replace('.pdf', ''),
                content: result.text,
                pageCount: result.pageCount,
                wordCount: result.wordCount,
                fileSize: file.size,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await db.sources.put(record);
            eventBus.emit('import.completed', { sourceId, record });

            return record;
        } catch (error) {
            eventBus.emit('import.error', { sourceId, error });
            throw error;
        }
    }

    /**
     * Import URL source
     */
    async importURL(
        url: string,
        options: SourceImportOptions
    ): Promise<SourceRecord> {
        this.validateURL(url);

        const sourceId = crypto.randomUUID();
        eventBus.emit('import.started', { sourceId, type: 'url', title: url });

        try {
            options.onProgress?.('Fetching URL...');
            const result = await this.urlFetcher.fetchURL(url);

            const record: SourceRecord = {
                id: sourceId,
                projectId: options.projectId,
                type: 'url',
                title: result.title,
                content: result.content,
                url,
                wordCount: result.wordCount,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await db.sources.put(record);
            eventBus.emit('import.completed', { sourceId, record });

            return record;
        } catch (error) {
            eventBus.emit('import.error', { sourceId, error });
            throw error;
        }
    }

    /**
     * Import text source
     */
    async importText(
        text: string,
        title: string,
        options: SourceImportOptions
    ): Promise<SourceRecord> {
        const sourceId = crypto.randomUUID();
        eventBus.emit('import.started', { sourceId, type: 'text', title });

        const record: SourceRecord = {
            id: sourceId,
            projectId: options.projectId,
            type: 'text',
            title: title || text.split('\n')[0].substring(0, 50),
            content: text,
            charCount: text.length,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await db.sources.put(record);
        eventBus.emit('import.completed', { sourceId, record });

        return record;
    }

    /**
     * Validation methods
     */
    private validatePDF(file: File): void {
        if (file.type !== 'application/pdf') {
            throw new Error('Invalid file type (PDF only)');
        }
        if (file.size > 50 * 1024 * 1024) {
            throw new Error('File too large (max 50MB)');
        }
    }

    private validateURL(url: string): void {
        try {
            new URL(url);
        } catch {
            throw new Error('Invalid URL');
        }
    }
}
```

---

### Task 5: Create SourceDropZone Component

**File:** `src/components/knowledge/SourceDropZone.tsx`

**Features:**
- Drag and drop zone for PDF files
- URL input field
- Text area for direct paste
- Progress indicators
- Toast notifications on completion

---

### Task 6: Add unit tests

**File:** `src/lib/knowledge/__tests__/source-import.test.ts`

**Test cases:**
- PDF parsing with progress tracking
- URL fetching and content extraction
- Text import with character count
- Error handling for invalid inputs
- IndexedDB persistence
- Event bus integration

---

## Technical Notes

### PDF.js Integration

| Pattern | Implementation |
|---------|---------------|
| Worker Setup | `pdfjsLib.GlobalWorkerOptions.workerSrc` |
| Load Document | `pdfjsLib.getDocument(arrayBuffer)` |
| Extract Text | `page.getTextContent()` |
| Progress Tracking | Callback after each page |

### Dexie.js Patterns

| Operation | Method |
|-----------|--------|
| Add Source | `db.sources.put(record)` |
| Get Source | `db.sources.get(id)` |
| List Sources | `db.sources.where('projectId').equals(id).toArray()` |
| Delete Source | `db.sources.delete(id)` |

### Event Bus Integration

```typescript
// Listen to import events
eventBus.on('import.started', ({ sourceId, type }) => {
    // Show progress UI
});

eventBus.on('import.progress', ({ page, total }) => {
    // Update progress bar
});

eventBus.on('import.completed', ({ sourceId, record }) => {
    // Show success toast
});
```

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| pdfjs-dist | ^3.11.174 | Client-side PDF parsing |
| dexie | ^3.2.4 | IndexedDB persistence |
| @/lib/events/event-bus | Existing | Progress event streaming |

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] Unit tests written and passing (100% coverage)
- [ ] Integration tested with Dexie persistence
- [ ] PDF.js worker properly configured
- [ ] Event bus integration verified
- [ ] Story file updated with Dev Agent Record
- [ ] `sprint-status.yaml` updated: `6-1-source-import-pipeline: done`

---

## Research Requirements

### MCP Research Tasks (MANDATORY before implementation)

1. **PDF.js Worker Configuration**
   - Query Context7 for PDF.js worker setup in Vite
   - Verify worker file path resolution
   - Test with sample PDF files

2. **URL Fetching CORS Issues**
   - Research client-side URL fetching limitations
   - Identify CORS proxy solutions if needed
   - Document which URLs can be fetched directly

3. **Dexie Bulk Operations**
   - Query Dexie docs for bulk insert patterns
   - Verify performance for large PDF content
   - Test with 50MB PDF files

4. **Event Bus Integration**
   - Review existing event bus implementation
   - Verify import event types
   - Test event propagation across components

---

## References

- **Architecture:** `_bmad-output/project-planning-artifacts/architecture.md` - Section 3.5 (Vector Store), Section 4.2 (State Persistence)
- **PRD:** `_bmad-output/project-planning-artifacts/prd.md` - Section 6.1 (Source Import)
- **UX Design:** `_bmad-output/project-planning-artifacts/ux-design-specification.md` - Section 15 (Knowledge Synthesis Interface)
- **Epic 6:** `_bmad-output/epics.md` - Lines 1266-1410

---

## Dev Agent Record

**Agent:** TBD
**Session:** TBD

#### Task Progress:
- [ ] T1: Add Sources Table to Dexie Schema
- [ ] T2: Create PDF Parser
- [ ] T3: Create URL Fetcher
- [ ] T4: Create Source Import Pipeline
- [ ] T5: Create SourceDropZone Component
- [ ] T6: Add unit tests

#### Research Executed:
- [ ] Context7: PDF.js worker configuration
- [ ] Context7: Dexie bulk operations
- [ ] DeepWiki: CORS solutions for client-side fetching

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/lib/state/dexie-db.ts | Modified | +50 |
| src/lib/knowledge/pdf-parser.ts | Created | TBD |
| src/lib/knowledge/url-fetcher.ts | Created | TBD |
| src/lib/knowledge/source-import.ts | Created | TBD |
| src/components/knowledge/SourceDropZone.tsx | Created | TBD |

#### Tests Created:
- source-import.test.ts: TBD tests

#### Decisions Made:
- TBD

---
