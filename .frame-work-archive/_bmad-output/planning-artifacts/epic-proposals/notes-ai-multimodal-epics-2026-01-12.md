# Epic Proposal: Notes AI & Multimodal Enhancement Suite

**Version:** 1.0.0  
**Created:** 2026-01-12  
**Status:** PROPOSAL - Awaiting Review  
**Author:** BMAD System Analysis  

---

## Executive Summary

This proposal addresses the user's vision to transform the Notes workspace into a **"Notion-killer"** with advanced AI-centric features. Based on comprehensive codebase analysis and TanStack AI/Gemini capability research, I propose **4 interconnected epics** that build upon each other:

| Epic ID | Name | Priority | Stories | Estimated Hours |
|---------|------|----------|---------|-----------------|
| **EPIC-41** | AI Provider Foundation | P0-CRITICAL | 8 | 24-32h |
| **EPIC-42** | Context-Aware Block AI | P1-HIGH | 10 | 40-56h |
| **EPIC-43** | Prompt Engineering Hub | P1-HIGH | 8 | 32-40h |
| **EPIC-44** | Multimodal Rich Content | P2-MEDIUM | 12 | 64-80h |

**Total Investment:** 38 stories, 160-208 hours (~4-5 weeks)

---

## Current State Analysis

### Strengths (What's Working)

1. **AI Slash Commands** (`AISlashCommand.tsx` - 392 lines)
   - 8 built-in AI commands (summarize, outline, explain, questions, translate, continue, flashcards, magic)
   - Custom command support via `SlashCommandManager.tsx`
   - Uses `generateNoteContent()` with context awareness

2. **Text Selection Transform** (`AITransformMenu.tsx` - 252 lines)
   - Floating toolbar on text selection
   - 5 transform actions (summarize, expand, improve, explain, translate)
   - Uses BlockNote's `getSelectedText()` API

3. **Custom Commands System** (`slash-command-store.ts`)
   - Create/edit/delete custom commands
   - i18n support (EN/VI)
   - Import/export functionality
   - Icon customization

4. **Note AI Service** (`note-ai-service.ts` - 334 lines)
   - Provider-agnostic API calls
   - Credential vault integration
   - Context block extraction
   - Error handling with specific codes

### Critical Issues (What's Broken)

1. **Gemini API Not Working** ⚠️
   - `gemini-adapter.ts` uses `geminiText()` from `@tanstack/ai-gemini`
   - But `note-ai-service.ts` uses **raw fetch()** to `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`
   - **Mismatch**: The two systems don't communicate properly
   - Provider case handling: `'google'` vs `'gemini'` confusion

2. **No OpenAI-Compatible Fallback**
   - No unified provider abstraction
   - Each provider hardcoded separately
   - No custom endpoint support for OpenAI-compatible APIs (Ollama, Together, Groq, etc.)

3. **Block Menu Context Issues**
   - AI commands read ALL blocks, not just blocks above cursor
   - No option for "no context" mode
   - Loading animation shows on whole editor, not specific block

4. **Transform Menu Limitations**
   - Always replaces content, no "append below" option
   - No AI magic in transform actions (only preset prompts)
   - No multi-block selection support

5. **Command Management Hidden**
   - `SlashCommandManager` exists but not easily discoverable
   - No categorization, tags, or meta fields
   - No "2-step prompt engineering" capability

---

## EPIC-41: AI Provider Foundation (P0-CRITICAL)

> **Goal:** Fix Gemini API, add OpenAI-compatible support, unified provider system

### Why This is P0

Without working AI providers, ALL other AI features are blocked. The current architecture has:
- Gemini adapter exists but note-ai-service bypasses it
- No fallback when primary provider fails
- Users cannot use custom OpenAI-compatible endpoints

### Stories

| ID | Title | Points | Hours | Priority |
|----|-------|--------|-------|----------|
| **41-01** | Audit and fix Gemini API integration | 5 | 4h | P0 |
| **41-02** | Create unified provider service layer | 8 | 6h | P0 |
| **41-03** | Add OpenAI-compatible endpoint support | 5 | 4h | P0 |
| **41-04** | Integrate TanStack AI Gemini adapters | 5 | 4h | P0 |
| **41-05** | Add provider fallback chain | 3 | 2h | P1 |
| **41-06** | Provider health check and auto-switch | 3 | 2h | P1 |
| **41-07** | Add multimodal capability detection | 5 | 4h | P1 |
| **41-08** | Write integration tests for all providers | 5 | 6h | P1 |

### Story 41-01: Audit and Fix Gemini API

**Problem Analysis:**

```typescript
// note-ai-service.ts (line 267-273) - CURRENT (BROKEN)
case 'google':
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    headers = { 'Content-Type': 'application/json' };
    body = {
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens }
    };
    break;
```

**Issues:**
1. Uses `'google'` as provider ID, but UI might use `'gemini'`
2. Raw fetch instead of TanStack AI adapter
3. No streaming support
4. No multimodal support

**Solution:**

```typescript
// Proposed: Use TanStack AI Gemini adapter
import { geminiText } from '@tanstack/ai-gemini';

case 'gemini':
case 'google':
    const adapter = geminiText(modelId as GeminiModelId, { apiKey });
    const response = await chat({
        adapter,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature,
        maxTokens,
    });
    return response.content;
```

### Story 41-03: OpenAI-Compatible Support

```typescript
// Proposed: Add OpenAI-compatible endpoint configuration
interface OpenAICompatibleConfig {
    baseUrl: string;          // e.g., 'https://api.together.xyz/v1'
    apiKey: string;
    model: string;            // e.g., 'meta-llama/Llama-3-70b-chat-hf'
    defaultHeaders?: Record<string, string>;
}

// Usage in provider store
const customProvider: Provider = {
    id: 'together-ai',
    type: 'openai-compatible',
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    models: ['meta-llama/Llama-3-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1']
};
```

### Acceptance Criteria

- [ ] Gemini API works with all supported models
- [ ] OpenAI-compatible endpoints configurable in Settings
- [ ] Fallback chain: Primary → Secondary → Error
- [ ] All providers tested with integration tests
- [ ] Multimodal capability flags exposed

---

## EPIC-42: Context-Aware Block AI (P1-HIGH)

> **Goal:** Smart context handling for block menu and text selection AI

### Why This is P1

The current implementation treats all blocks equally, but users expect:
- AI commands to understand cursor position
- Option to include/exclude context
- Generated content to appear in the right place
- Loading states on specific blocks, not whole editor

### Stories

| ID | Title | Points | Hours | Priority |
|----|-------|--------|-------|----------|
| **42-01** | Block-above-cursor context extraction | 5 | 4h | P0 |
| **42-02** | Context toggle in AI prompt dialog | 3 | 2h | P0 |
| **42-03** | Block-specific loading animation | 5 | 4h | P1 |
| **42-04** | Smart content insertion (replace/append) | 5 | 4h | P1 |
| **42-05** | Multi-block selection for transform | 5 | 4h | P1 |
| **42-06** | Selected text as context option | 3 | 2h | P1 |
| **42-07** | AI commands in transform bar | 5 | 4h | P1 |
| **42-08** | Inline quick prompt input | 5 | 4h | P2 |
| **42-09** | Context preview before generation | 5 | 4h | P2 |
| **42-10** | Streaming output to blocks | 8 | 8h | P2 |

### Story 42-01: Block-Above-Cursor Context

**Current Behavior:**
```typescript
// AISlashCommand.tsx (line 129-134) - Gets ALL blocks
function getAllNoteText(editor: BlockNoteEditor): string {
    const blocks = editor.document;  // All blocks!
    return blocks
        .map(block => extractBlockText(block))
        .filter(Boolean)
        .join('\n\n');
}
```

**Proposed Behavior:**
```typescript
// Get only blocks BEFORE cursor
function getContextAboveCursor(editor: BlockNoteEditor): string {
    const cursorPosition = editor.getTextCursorPosition();
    const currentBlockId = cursorPosition.block.id;
    
    const allBlocks = editor.document;
    const currentIndex = allBlocks.findIndex(b => b.id === currentBlockId);
    
    // Get blocks 0 to currentIndex-1 (above cursor)
    const blocksAbove = allBlocks.slice(0, currentIndex);
    
    return blocksAbove
        .map(block => extractBlockText(block))
        .filter(Boolean)
        .join('\n\n');
}
```

### Story 42-03: Block-Specific Loading

**Current:** Toast notification at bottom
**Proposed:** Block overlay with spinner and blur effect

```tsx
// BlockLoadingOverlay.tsx
function BlockLoadingOverlay({ blockId, isLoading }: Props) {
    if (!isLoading) return null;
    
    return (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                    {t('notes.ai.generating', 'Generating...')}
                </span>
            </div>
        </div>
    );
}
```

### Story 42-04: Smart Content Insertion

**Proposed UI:**
When AI generates content, show a dialog:

```tsx
<Dialog open={showInsertOptions}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>AI Content Ready</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
            <div className="border p-3 rounded max-h-48 overflow-y-auto">
                <MarkdownPreview content={generatedContent} />
            </div>
            <div className="flex gap-2">
                <Button onClick={handleReplaceSelection}>
                    <Replace className="w-4 h-4 mr-2" />
                    Replace Selection
                </Button>
                <Button onClick={handleAppendBelow}>
                    <ArrowDown className="w-4 h-4 mr-2" />
                    Append Below
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    </DialogContent>
</Dialog>
```

---

## EPIC-43: Prompt Engineering Hub (P1-HIGH)

> **Goal:** Advanced command management with 2-step prompt refinement

### Why This is P1

Vietnamese users love "prompt engineering" - there are entire communities sharing prompts. We can capitalize on this by providing:
- Better command organization
- Prompt refinement workflow
- Categorization and tagging
- AI-suggested prompts

### Stories

| ID | Title | Points | Hours | Priority |
|----|-------|--------|-------|----------|
| **43-01** | Command management entry point in Notes UI | 3 | 2h | P0 |
| **43-02** | Category and tag system for commands | 5 | 4h | P0 |
| **43-03** | 2-step prompt refinement workflow | 8 | 6h | P0 |
| **43-04** | AI prompt suggestion based on context | 5 | 4h | P1 |
| **43-05** | Prompt template variables | 5 | 4h | P1 |
| **43-06** | Command analytics (usage count, success rate) | 3 | 2h | P2 |
| **43-07** | Community prompt gallery (import from URL) | 5 | 4h | P2 |
| **43-08** | Prompt versioning and history | 5 | 4h | P2 |

### Story 43-01: Command Management Entry Point

**Current:** Hidden in Settings → Slash Commands
**Proposed:** Visible in Notes workspace

```tsx
// Add to Notes sidebar or toolbar
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Commands
            <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-64">
        <DropdownMenuItem onSelect={() => openPromptDialog()}>
            <Wand2 className="w-4 h-4 mr-2" />
            Quick Prompt
            <DropdownMenuShortcut>⌘+J</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Recent Commands</DropdownMenuLabel>
        {recentCommands.map(cmd => (
            <DropdownMenuItem key={cmd.id} onSelect={() => executeCommand(cmd)}>
                {getIcon(cmd.icon)}
                {cmd.title}
            </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={openCommandManager}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Commands
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```

### Story 43-03: 2-Step Prompt Refinement

This is the key feature for Vietnamese "prompt engineering" enthusiasts.

**Workflow:**
1. User enters rough prompt: "viết email cho khách hàng" (write email to customer)
2. Step 1: AI elaborates user intent → "Write a professional customer email..."
3. Step 2: AI refines prompt → Full prompt with structure, tone, format
4. User can edit refined prompt before execution

**Implementation:**

```typescript
// prompt-engineering-service.ts
interface PromptRefinementResult {
    original: string;
    elaborated: string;      // Step 1 output
    refined: string;         // Step 2 output
    variables: string[];     // Detected template variables
    suggestedCategory: string;
}

async function refinePrompt(
    rawPrompt: string,
    options: { language: 'en' | 'vi' }
): Promise<PromptRefinementResult> {
    // Step 1: Elaborate intent
    const elaborationPrompt = `
        Analyze this user's intent and expand it with context:
        "${rawPrompt}"
        
        Provide:
        1. What they likely want to accomplish
        2. Key elements that should be included
        3. Expected output format
        
        Respond in ${options.language === 'vi' ? 'Vietnamese' : 'English'}.
    `;
    
    const elaborated = await generateNoteContent(elaborationPrompt);
    
    // Step 2: Create professional prompt
    const refinementPrompt = `
        Based on this analysis:
        ${elaborated}
        
        Create a professional, detailed prompt that will produce high-quality output.
        Include:
        - Clear instructions
        - Output format specification
        - Tone and style guidance
        - Any relevant constraints
        
        Use {variable} syntax for any user-specific inputs.
    `;
    
    const refined = await generateNoteContent(refinementPrompt);
    
    // Extract variables
    const variables = refined.match(/\{(\w+)\}/g)?.map(v => v.slice(1, -1)) || [];
    
    return { original: rawPrompt, elaborated, refined, variables, suggestedCategory: 'auto' };
}
```

**UI Flow:**

```tsx
// PromptRefinementDialog.tsx
function PromptRefinementDialog() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [rawPrompt, setRawPrompt] = useState('');
    const [result, setResult] = useState<PromptRefinementResult | null>(null);
    
    return (
        <Dialog>
            {step === 1 && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Step 1: Enter Your Idea</DialogTitle>
                        <DialogDescription>
                            Write what you want to do in simple words
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={rawPrompt}
                        onChange={e => setRawPrompt(e.target.value)}
                        placeholder="e.g., viết email cho khách hàng..."
                    />
                    <DialogFooter>
                        <Button onClick={handleRefine}>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Refine Prompt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            )}
            
            {step === 2 && result && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Step 2: Review & Edit</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="refined">
                        <TabsList>
                            <TabsTrigger value="elaborated">Understanding</TabsTrigger>
                            <TabsTrigger value="refined">Refined Prompt</TabsTrigger>
                        </TabsList>
                        <TabsContent value="elaborated">
                            <div className="bg-muted p-3 rounded text-sm">
                                {result.elaborated}
                            </div>
                        </TabsContent>
                        <TabsContent value="refined">
                            <Textarea
                                value={result.refined}
                                onChange={e => setResult({...result, refined: e.target.value})}
                            />
                        </TabsContent>
                    </Tabs>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStep(1)}>
                            Back
                        </Button>
                        <Button onClick={handleSaveAsCommand}>
                            Save as Command
                        </Button>
                        <Button onClick={handleExecute}>
                            Execute Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            )}
        </Dialog>
    );
}
```

---

## EPIC-44: Multimodal Rich Content (P2-MEDIUM)

> **Goal:** Image, video, interactive content generation

### Why This is P2

This epic builds on EPIC-41 (provider foundation) and delivers the "wow" features:
- Image generation in notes
- Video understanding and generation
- Interactive artifact blocks
- PowerPoint/slides generation
- Storyboard generation

### Stories

| ID | Title | Points | Hours | Priority |
|----|-------|--------|-------|----------|
| **44-01** | Image generation block type | 8 | 6h | P0 |
| **44-02** | Image understanding (vision) in blocks | 5 | 4h | P0 |
| **44-03** | Sequential multi-image storyboard | 8 | 8h | P1 |
| **44-04** | Video input understanding | 5 | 4h | P1 |
| **44-05** | Text-to-speech output block | 5 | 4h | P1 |
| **44-06** | Interactive HTML artifact block | 13 | 12h | P1 |
| **44-07** | Video generation block (experimental) | 8 | 8h | P2 |
| **44-08** | PowerPoint/slides export | 8 | 8h | P2 |
| **44-09** | Chart/diagram generation | 5 | 4h | P2 |
| **44-10** | Sequential transformation pipeline | 8 | 8h | P2 |
| **44-11** | Artifact gallery and management | 5 | 4h | P2 |
| **44-12** | Multi-step generation with blur animation | 5 | 4h | P2 |

### Story 44-01: Image Generation Block

**Using TanStack AI Gemini:**

```typescript
import { generateImage } from '@tanstack/ai';
import { geminiImage } from '@tanstack/ai-gemini';

// ImageGenerationBlock.tsx
async function generateImageInBlock(prompt: string, options: ImageGenOptions) {
    const apiKey = await credentialVault.getCredentials('gemini');
    
    const result = await generateImage({
        adapter: geminiImage(apiKey),
        model: 'imagen-3.0-generate-002',
        prompt,
        numberOfImages: options.count || 1,
    });
    
    return result.images.map(img => ({
        base64: img.data,
        mimeType: 'image/png',
    }));
}
```

**Block UI:**

```tsx
// ImageBlock.tsx - Custom BlockNote block
const ImageGenerationBlock = createReactBlock({
    type: 'ai-image',
    propSchema: {
        prompt: { default: '' },
        images: { default: [] },
        status: { default: 'idle' }, // 'idle' | 'generating' | 'done' | 'error'
    },
    render: ({ block, editor }) => {
        const { prompt, images, status } = block.props;
        
        return (
            <div className="ai-image-block border rounded p-4">
                {status === 'idle' && (
                    <div className="flex gap-2">
                        <Input
                            value={prompt}
                            onChange={e => updatePrompt(e.target.value)}
                            placeholder="Describe the image..."
                        />
                        <Button onClick={handleGenerate}>
                            <Image className="w-4 h-4 mr-2" />
                            Generate
                        </Button>
                    </div>
                )}
                
                {status === 'generating' && (
                    <div className="flex items-center justify-center h-48 bg-muted/50 animate-pulse">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="ml-2">Creating image...</span>
                    </div>
                )}
                
                {status === 'done' && (
                    <div className="grid grid-cols-2 gap-2">
                        {images.map((img, i) => (
                            <img
                                key={i}
                                src={`data:${img.mimeType};base64,${img.base64}`}
                                className="rounded cursor-pointer hover:ring-2 ring-primary"
                                onClick={() => openFullscreen(img)}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    },
});
```

### Story 44-03: Sequential Multi-Image Storyboard

**"Wow" Feature:** Generate a 3-frame storyboard from a prompt

```typescript
// storyboard-generator.ts
async function generateStoryboard(prompt: string, frames: number = 3) {
    // Step 1: Generate frame descriptions
    const frameDescriptions = await generateNoteContent(`
        Create ${frames} sequential scene descriptions for this storyboard:
        "${prompt}"
        
        Format as JSON array:
        [
            { "frame": 1, "description": "...", "visualElements": [...] },
            { "frame": 2, "description": "...", "visualElements": [...] },
            { "frame": 3, "description": "...", "visualElements": [...] }
        ]
    `);
    
    const frames = JSON.parse(frameDescriptions);
    
    // Step 2: Generate images sequentially (with blur animation)
    const images = [];
    for (const frame of frames) {
        // Signal UI to show blur on next frames
        emitProgress({ currentFrame: frame.frame, status: 'generating' });
        
        const image = await generateImageInBlock(frame.description);
        images.push({ ...frame, image });
        
        emitProgress({ currentFrame: frame.frame, status: 'done' });
    }
    
    return images;
}
```

### Story 44-06: Interactive HTML Artifact Block

**Vision:** Embed AI-generated interactive content (like Claude's artifacts)

```tsx
// ArtifactBlock.tsx
const ArtifactBlock = createReactBlock({
    type: 'ai-artifact',
    propSchema: {
        html: { default: '' },
        css: { default: '' },
        js: { default: '' },
        title: { default: 'Interactive Artifact' },
        source: { default: 'ai-generated' },
    },
    render: ({ block }) => {
        const iframeRef = useRef<HTMLIFrameElement>(null);
        
        // Create sandboxed HTML document
        const srcDoc = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${block.props.css}</style>
            </head>
            <body>
                ${block.props.html}
                <script>${block.props.js}</script>
            </body>
            </html>
        `;
        
        return (
            <div className="artifact-block border rounded overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-muted border-b">
                    <span className="text-sm font-medium">{block.props.title}</span>
                    <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={openInNewTab}>
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={editCode}>
                            <Code className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <iframe
                    ref={iframeRef}
                    srcDoc={srcDoc}
                    sandbox="allow-scripts"
                    className="w-full h-64 border-0"
                />
            </div>
        );
    },
});
```

### Story 44-08: PowerPoint/Slides Export

**Approach:** Use `pptxgenjs` library to generate PPTX from blocks

```typescript
import PptxGenJS from 'pptxgenjs';

async function exportToSlides(blocks: Block[], options: SlideOptions) {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
    
    for (const block of blocks) {
        if (block.type === 'heading' && block.props.level === 1) {
            // New slide for H1
            const slide = pptx.addSlide();
            slide.addText(extractBlockText(block), {
                x: 0.5, y: 2, w: 9, h: 1.5,
                fontSize: 36, bold: true, align: 'center'
            });
        } else if (block.type === 'heading' && block.props.level === 2) {
            // Content slide for H2
            const slide = pptx.addSlide();
            slide.addText(extractBlockText(block), {
                x: 0.5, y: 0.5, w: 9, h: 0.8,
                fontSize: 28, bold: true
            });
            // Collect following paragraphs as bullets...
        }
        // Handle images, bullet lists, etc.
    }
    
    const blob = await pptx.write({ outputType: 'blob' });
    saveAs(blob, `${options.filename || 'presentation'}.pptx`);
}
```

### Story 44-12: Multi-Step Generation with Blur Animation

**The "Magic" UX:**

When generating sequential content (like storyboards), show:
- Completed blocks: normal view
- Generating block: loading spinner with subtle glow
- Pending blocks: blurred with spin animation

```tsx
// SequentialGenerationOverlay.tsx
function SequentialGenerationOverlay({ 
    totalSteps, 
    currentStep, 
    status 
}: Props) {
    return (
        <div className="relative">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'transition-all duration-500',
                        i < currentStep && 'opacity-100',
                        i === currentStep && status === 'generating' && 'animate-pulse ring-2 ring-primary',
                        i > currentStep && 'opacity-50 blur-sm'
                    )}
                >
                    {i === currentStep && status === 'generating' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}
                    {/* Block content */}
                </div>
            ))}
        </div>
    );
}
```

---

## Additional "Wow" Features (Beyond User's 5)

Based on analysis, here are 5 more high-impact features:

### 1. Voice Notes with AI Transcription

```typescript
// Already have VoiceRecordButton.tsx - enhance it
// - Record voice → Transcribe → AI enhance → Insert as blocks
```

### 2. Smart Table Generation

```typescript
// "Create comparison table: X vs Y vs Z"
// AI generates structured table block with data
```

### 3. Code Snippet with Explanation

```typescript
// "Explain this code" → AI adds comments + prose explanation
// Split into code block + explanation block
```

### 4. Meeting Notes Parser

```typescript
// Paste raw meeting notes → AI structures:
// - Attendees, Agenda, Decisions, Action Items, Next Steps
```

### 5. Multi-Language Auto-Translate

```typescript
// Write in Vietnamese → Auto-show English version below
// Toggle between languages seamlessly
```

---

## Epic Dependencies

```
EPIC-41 (Provider Foundation)
    │
    ├──→ EPIC-42 (Block AI) - needs working providers
    │       │
    │       └──→ EPIC-44 (Multimodal) - needs block AI foundation
    │
    └──→ EPIC-43 (Prompt Hub) - needs working providers
```

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Gemini API changes | High | Low | Use TanStack AI adapter (abstraction layer) |
| Large scope creep | Medium | Medium | Strict story prioritization, MVP first |
| Performance with multimodal | Medium | Medium | Lazy loading, progressive enhancement |
| Mobile compatibility | Medium | Medium | Test on mobile early, responsive design |

---

## Recommendation

**Immediate Action (Next Sprint):**
1. Start with **EPIC-41** (Provider Foundation) - unblocks everything
2. Run **41-01** (Gemini audit) as first story

**Sprint After:**
1. Continue **EPIC-41** completion
2. Begin **EPIC-42** stories 01-04 (core block AI)
3. Begin **EPIC-43** story 01 (command entry point)

**Following Sprints:**
1. Complete EPIC-42 and 43
2. Begin EPIC-44 (multimodal) with image generation focus

---

## Appendix: TanStack AI Capabilities Summary

| Capability | OpenAI | Gemini | Anthropic | Notes |
|------------|--------|--------|-----------|-------|
| Text/Chat | ✅ | ✅ | ✅ | All supported |
| Image Generation | ✅ (DALL-E) | ✅ (Imagen) | ❌ | Gemini preferred |
| Image Understanding | ✅ (GPT-4o) | ✅ | ✅ | All have vision |
| Text-to-Speech | ✅ | ✅ (experimental) | ❌ | OpenAI more stable |
| Speech-to-Text | ✅ (Whisper) | ✅ | ❌ | OpenAI preferred |
| Video Generation | ✅ (Sora) | ❌ | ❌ | OpenAI only, experimental |
| Video Understanding | ❌ | ✅ | ❌ | Gemini only |
| Structured Output | ✅ | ✅ | ✅ (via tools) | All supported |
| Tool Calling | ✅ | ✅ | ✅ | All supported |

---

*Generated by BMAD System Analysis - 2026-01-12*
