---
name: wire-synthesis-ui
description: "Add Synthesis Controls and Frontmatter Generation (GAP-003)"
agent: synthesis-architect
estimated_effort: "10 hours"
---

# Wire Synthesis UI Controls

**Purpose:** Add synthesis activation buttons to sources and create the 
SynthesisService that calls Gemini API to generate structured frontmatter.

**Gap Reference:** GAP-003 in `data/integration-gaps.yaml`

---

## Prerequisites

- [ ] Verify `pnpm build` passes before starting
- [ ] Gemini API key configured in credential vault
- [ ] Review existing implementation:
  - `src/presentation/components/knowledge/SourceCard.tsx`
  - `src/lib/knowledge/types.ts`
  - `data/gemini-prompts.yaml` for prompt templates

---

## Step 1: Define Synthesis Types

**Output File:** `src/lib/knowledge/synthesis-types.ts`

```typescript
// Synthesis Types for Knowledge Synthesis Platform

import { z } from 'zod';

// Synthesis frontmatter schema (matches Gemini output)
export const SynthesisFrontmatterSchema = z.object({
  summary: z.string().min(100).max(1000),
  documentType: z.enum([
    'lecture_notes', 
    'textbook_chapter', 
    'research_paper', 
    'article', 
    'handwritten_notes',
    'diagram',
    'audio_recording',
    'web_content',
    'other'
  ]),
  subject: z.string(),
  keyConcepts: z.array(z.object({
    term: z.string(),
    definition: z.string(),
  })).min(3).max(15),
  tags: z.array(z.string()).min(3).max(10),
  structure: z.object({
    headings: z.array(z.string()).optional(),
    hasFigures: z.boolean().optional(),
    hasTables: z.boolean().optional(),
    hasCitations: z.boolean().optional(),
    pageCount: z.number().optional(),
  }).optional(),
  prerequisites: z.array(z.string()).optional(),
  relatedTopics: z.array(z.string()).optional(),
  actionItems: z.array(z.string()).optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedStudyTimeMinutes: z.number().optional(),
});

export type SynthesisFrontmatter = z.infer<typeof SynthesisFrontmatterSchema>;

export interface SynthesisResult {
  id: string;
  sourceId: string;
  frontmatter: SynthesisFrontmatter;
  synthesizedAt: string;
  modelUsed: string;
  processingTimeMs: number;
}

export type SynthesisStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface SynthesisProgress {
  status: SynthesisStatus;
  progress: number; // 0-100
  stage?: string;
  error?: string;
}
```

---

## Step 2: Create SynthesisService

**Output File:** `src/lib/knowledge/synthesis-service.ts`

```typescript
// Synthesis Service - Generates frontmatter via Gemini API

import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { 
  SynthesisFrontmatterSchema, 
  type SynthesisFrontmatter,
  type SynthesisResult,
} from './synthesis-types';
import type { SourceDocument } from './types';

// Prompt templates from data/gemini-prompts.yaml
const PROMPTS = {
  pdf: `Analyze this PDF document and generate structured synthesis metadata...`,
  image: `Analyze this image and generate structured synthesis metadata...`,
  audio: `Analyze this audio file and generate structured synthesis metadata...`,
  url: `Analyze this web content and generate structured synthesis metadata...`,
  markdown: `Analyze this markdown document and generate structured synthesis metadata...`,
};

export class SynthesisService {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private model = 'gemini-2.0-flash-latest';

  async synthesize(source: SourceDocument): Promise<SynthesisResult> {
    const startTime = Date.now();
    
    // Get API key from credential vault
    const apiKey = await credentialVault.getKey('gemini');
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Select prompt based on source type
    const prompt = this.getPromptForType(source.type);
    
    // Prepare request
    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          await this.getContentPart(source),
        ],
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    };

    // Call Gemini API
    const response = await fetch(
      `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const result = await response.json();
    const rawFrontmatter = JSON.parse(
      result.candidates[0].content.parts[0].text
    );

    // Validate with Zod
    const frontmatter = SynthesisFrontmatterSchema.parse(rawFrontmatter);

    return {
      id: crypto.randomUUID(),
      sourceId: source.id,
      frontmatter,
      synthesizedAt: new Date().toISOString(),
      modelUsed: this.model,
      processingTimeMs: Date.now() - startTime,
    };
  }

  private getPromptForType(type: SourceDocument['type']): string {
    return PROMPTS[type] || PROMPTS.markdown;
  }

  private async getContentPart(source: SourceDocument) {
    if (source.type === 'pdf' || source.type === 'image') {
      return {
        inlineData: {
          mimeType: source.mimeType,
          data: source.base64Content,
        },
      };
    }
    return { text: source.content };
  }
}

export const synthesisService = new SynthesisService();
```

---

## Step 3: Add Synthesis Store/Actions

**Output File:** `src/infrastructure/persistence/stores/synthesis-store.ts`

```typescript
// Synthesis Store - Manages synthesis results in Dexie

import { db } from '@/infrastructure/persistence/dexie-db';
import { emitStoreEvent } from '@/lib/events/store-events';
import type { SynthesisResult } from '@/lib/knowledge/synthesis-types';

export const synthesisStore = {
  async save(result: SynthesisResult): Promise<void> {
    await db.synthesisResults.put(result);
    emitStoreEvent('SOURCE_SYNTHESIZED', { 
      sourceId: result.sourceId,
      synthesisId: result.id,
    });
  },

  async getBySourceId(sourceId: string): Promise<SynthesisResult | undefined> {
    return db.synthesisResults.where('sourceId').equals(sourceId).first();
  },

  async delete(synthesisId: string): Promise<void> {
    await db.synthesisResults.delete(synthesisId);
  },
};
```

---

## Step 4: Update Dexie Schema for Synthesis

**Target File:** `src/infrastructure/persistence/dexie-db.ts`

**Add Table:**
```typescript
// Add to schema version 10
synthesisResults: '++id, sourceId, synthesizedAt',
```

**Add Migration:**
```typescript
db.version(10).stores({
  // ... existing tables ...
  synthesisResults: '++id, sourceId, synthesizedAt',
});
```

---

## Step 5: Add Synthesize Button to SourceCard

**Target File:** `src/presentation/components/knowledge/SourceCard.tsx`

**Changes:**
1. Add "Synthesize" button
2. Show synthesis status
3. Display frontmatter preview when synthesized

```tsx
import { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { synthesisService } from '@/lib/knowledge/synthesis-service';
import { synthesisStore } from '@/infrastructure/persistence/stores/synthesis-store';

// In SourceCard component:
const [synthesisStatus, setSynthesisStatus] = useState<'idle' | 'processing' | 'done'>('idle');

const handleSynthesize = async () => {
  setSynthesisStatus('processing');
  try {
    const result = await synthesisService.synthesize(source);
    await synthesisStore.save(result);
    setSynthesisStatus('done');
    toast.success(t('knowledge.synthesis.complete'));
  } catch (error) {
    setSynthesisStatus('idle');
    toast.error(t('knowledge.synthesis.failed'));
    console.error('Synthesis failed:', error);
  }
};

// In render:
{!source.isSynthesized ? (
  <Button 
    variant="outline" 
    size="sm"
    onClick={handleSynthesize}
    disabled={synthesisStatus === 'processing'}
  >
    {synthesisStatus === 'processing' ? (
      <>
        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        {t('knowledge.synthesis.processing')}
      </>
    ) : (
      <>
        <Sparkles className="w-4 h-4 mr-1" />
        {t('knowledge.synthesis.synthesize')}
      </>
    )}
  </Button>
) : (
  <Badge variant="success">
    <Check className="w-3 h-3 mr-1" />
    {t('knowledge.synthesis.synthesized')}
  </Badge>
)}
```

---

## Step 6: Create Synthesis Preview Component

**Output File:** `src/presentation/components/knowledge/SynthesisPreview.tsx`

```tsx
import { useTranslation } from 'react-i18next';
import { Tag, BookOpen, Clock, GraduationCap } from 'lucide-react';
import type { SynthesisFrontmatter } from '@/lib/knowledge/synthesis-types';

interface SynthesisPreviewProps {
  frontmatter: SynthesisFrontmatter;
}

export function SynthesisPreview({ frontmatter }: SynthesisPreviewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg">
      {/* Summary */}
      <div>
        <h4 className="font-medium mb-2">{t('knowledge.synthesis.summary')}</h4>
        <p className="text-sm text-muted-foreground">{frontmatter.summary}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {frontmatter.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            <Tag className="w-3 h-3 mr-1" />
            {tag}
          </Badge>
        ))}
      </div>

      {/* Key Concepts */}
      <div>
        <h4 className="font-medium mb-2">{t('knowledge.synthesis.keyConcepts')}</h4>
        <ul className="space-y-1">
          {frontmatter.keyConcepts.slice(0, 5).map((concept) => (
            <li key={concept.term} className="text-sm">
              <strong>{concept.term}:</strong> {concept.definition}
            </li>
          ))}
        </ul>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center">
          <BookOpen className="w-4 h-4 mr-1" />
          {frontmatter.subject}
        </span>
        {frontmatter.difficultyLevel && (
          <span className="flex items-center">
            <GraduationCap className="w-4 h-4 mr-1" />
            {frontmatter.difficultyLevel}
          </span>
        )}
        {frontmatter.estimatedStudyTimeMinutes && (
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {frontmatter.estimatedStudyTimeMinutes} min
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## Step 7: Add i18n Strings

**Target Files:** `src/i18n/en.json`, `src/i18n/vi.json`

```json
{
  "knowledge": {
    "synthesis": {
      "synthesize": "Synthesize",
      "processing": "Synthesizing...",
      "synthesized": "Synthesized",
      "complete": "Synthesis complete! Frontmatter generated.",
      "failed": "Synthesis failed. Please try again.",
      "summary": "Summary",
      "keyConcepts": "Key Concepts",
      "tags": "Tags",
      "viewDetails": "View synthesis details"
    }
  }
}
```

---

## Step 8: Final Validation

```bash
# 1. Build passes
pnpm build

# 2. Manual test:
# - Import a PDF source
# - Click "Synthesize" button
# - Verify loading state
# - Verify frontmatter generated
# - Verify stored in Dexie
# - Verify tags and concepts displayed
```

**Acceptance Criteria:**
- [ ] Synthesize button visible on source cards
- [ ] Loading state during synthesis
- [ ] Frontmatter generated via Gemini API
- [ ] Frontmatter validated with Zod
- [ ] Results stored in Dexie
- [ ] SynthesisPreview displays frontmatter
- [ ] i18n strings added (EN + VI)
- [ ] Build passes

---

## Update LOOP_STATE.yaml

```yaml
phase_2:
  status: "DONE"
  completed_at: "{{timestamp}}"
  tasks:
    - id: "add-synthesize-button"
      status: "DONE"
    - id: "create-synthesis-service"
      status: "DONE"
    - id: "generate-structured-frontmatter"
      status: "DONE"
    - id: "store-synthesis-results"
      status: "DONE"
```
