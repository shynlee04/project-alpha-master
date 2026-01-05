# Page Components Documentation

## Overview

Page components serve as the top-level entry points for different application sections (workspaces). Each page manages its own layout, state, and sub-components while following consistent patterns for routing and state management.

## Page Structure

### Page Components

| Page | Location | Description |
|------|----------|-------------|
| KnowledgePage | `src/presentation/components/knowledge/KnowledgePage.tsx` | Knowledge management workspace |
| NotesPage | `src/presentation/components/notes/NotesPage.tsx` | Notes editor workspace |
| StudyPage | `src/presentation/components/study/StudyPage.tsx` | Study and quiz workspace |
| HubHomePage | `src/presentation/components/hub/HubHomePage.tsx` | Main hub landing page |
| AboutPage | `src/presentation/components/about/AboutPage.tsx` | About/portfolio page |

## Workspace Pages

### 1. KnowledgePage

**Purpose:** Central knowledge management workspace for RAG-powered knowledge synthesis.

**Location:** `src/presentation/components/knowledge/KnowledgePage.tsx`

**Features:**
- Source collection management
- RAG configuration panel
- Indexing progress monitoring
- Canvas visualization
- Study artifact generation (flashcards, quizzes)

**Component Structure:**
```
KnowledgePage
├── HeaderBar
├── MainContent
│   ├── SourceCardGrid
│   │   └── SourceCard[]
│   ├── CollectionManager
│   └── Canvas (optional)
├── Sidebar
│   ├── CollectionSelector
│   ├── RAGSearchPanel
│   └── MetadataEditor
└── Modals
    ├── SourceImportDialog
    ├── SourceMetadataDialog
    ├── SynthesisDialog
    └── StudyArtifactExportDialog
```

**State Management:**
```typescript
// Uses knowledge store for state
const {
  sources,
  collections,
  selectedSourceId,
  isIndexing,
  indexingProgress,
} = useKnowledgeStore();
```

**Key Interactions:**
- Import sources (PDF, URL, text)
- Organize into collections
- Configure RAG settings
- Generate study artifacts
- Visualize knowledge connections

### 2. NotesPage

**Purpose:** Markdown notes editor with AI assistance.

**Location:** `src/presentation/components/notes/NotesPage.tsx`

**Features:**
- Markdown editor with live preview
- Note tree navigation
- AI transform menu (summarize, expand, translate)
- Slash commands for quick formatting
- Indexing for RAG search
- Export/import Markdown

**Component Structure:**
```
NotesPage
├── NoteSidebar
│   ├── NoteTree
│   │   └── NoteTreeItem[]
│   ├── NotesFilePicker
│   └── NotesIndexingButton
├── NoteEditor
│   ├── Editor toolbar
│   ├── Text area (Markdown)
│   └── Preview pane
├── AI Assistant Panel
│   ├── AITransformMenu
│   ├── AIPromptDialog
│   └── AISlashCommand
└── Modals
    ├── MarkdownExportDialog
    └── MarkdownImportDialog
```

**State Management:**
```typescript
const {
  notes,
  activeNoteId,
  isEditing,
  setActiveNote,
  createNote,
  updateNote,
  deleteNote,
} = useNotesStore();
```

**AI Features:**
- Summarize note content
- Expand with more details
- Translate to Vietnamese/English
- Generate flashcards
- Create quiz questions

### 3. StudyPage

**Purpose:** Study interface with flashcards and quizzes.

**Location:** `src/presentation/components/study/StudyPage.tsx`

**Modes:**
- **Flashcard Review:** Flip cards with spaced repetition
- **Quiz Mode:** Multiple choice questions with timer
- **Statistics:** Progress tracking and performance metrics

**Component Structure:**
```
StudyPage
├── StudyFilePicker
├── StudySession
│   ├── FlashcardMode
│   │   └── Flashcard[]
│   ├── QuizMode
│   │   ├── QuizStartScreen
│   │   ├── QuizContainer
│   │   ├── QuizQuestionView
│   │   ├── QuizResults
│   │   └── QuizReview
│   └── StudyStats
└── Quiz Preview
    └── QuizPreviewPanel
```

**State Management:**
```typescript
const {
  currentMode,
  isQuizActive,
  flashcards,
  quizQuestions,
  score,
  studyProgress,
} = useStudyStore();
```

**Features:**
- Spaced repetition algorithm
- Timed quizzes
- Score tracking
- Performance analytics
- Export results

### 4. HubHomePage

**Purpose:** Main dashboard showing projects, recent activity, and workspace navigation.

**Location:** `src/presentation/components/hub/HubHomePage.tsx`

**Features:**
- Project cards with metadata
- Recent projects section
- Storage usage display
- Activity charts
- Workspace binding management
- Project search

**Component Structure:**
```
HubHomePage
├── HubHero
├── SummaryCardsGrid
│   ├── ProjectCountCard
│   ├── StorageUsageCard
│   └── ActivityCard
├── RecentProjectsSection
│   ├── ProjectCard[]
│   └── ProjectSearchBar
├── ActivityLineChart
├── WorkspaceBindingDialog
└── Modals
    ├── ProjectMetadataDialog
    └── DeleteProjectDialog
```

**State Management:**
```typescript
const {
  projects,
  recentProjects,
  storageUsed,
  activityData,
} = useProjectsStore();

const {
  workspaceBindings,
  updateWorkspaceBinding,
} = useWorkspaceBindingStore();
```

## Landing Pages

### AboutPage

**Purpose:** Portfolio and about page showcasing skills and projects.

**Location:** `src/presentation/components/about/AboutPage.tsx`

**Sections:**
- Hero section with avatar and tagline
- Journey timeline
- Skills matrix
- Project showcase
- Contact section
- Stats bar

**Component Structure:**
```
AboutPage
├── HeroSection
├── JourneySection
├── SkillsMatrix
│   └── SkillCategory[]
├── ShowcaseSection
│   └── ProjectShowcase
├── StatsBar
└── ContactSection
```

## Page Patterns

### Common Page Structure

All pages follow a consistent pattern:

```tsx
export function PageName() {
  // Hooks for state
  const { state, actions } = usePageStore();
  
  // Responsive check
  const { isMobile } = useResponsive();
  
  // i18n
  const { t } = useTranslation();
  
  return (
    <PageContainer>
      <Header />
      <Content>
        {/* Page-specific content */}
      </Content>
      <Modals>
        {/* Dialog components */}
      </Modals>
    </PageContainer>
  );
}
```

### State Management Pattern

Pages use domain-specific stores:

```typescript
// Knowledge page uses knowledge store
const knowledgeStore = useKnowledgeStore();

// Notes page uses notes store
const notesStore = useNotesStore();

// Study page uses study store
const studyStore = useStudyStore();
```

### Mobile Adaptation

Pages adapt to mobile via responsive hooks:

```typescript
const { isMobile } = useResponsive();

if (isMobile) {
  return <MobilePageLayout {...props} />;
}

return <DesktopPageLayout {...props} />;
```

### Loading States

Pages implement loading states:

```tsx
if (isLoading) {
  return <LoadingState />;
}

if (error) {
  return <ErrorState error={error} onRetry={refetch} />;
}

return <PageContent data={data} />;
```

## Developer Notes

### Creating New Pages

1. Create page component in appropriate directory
2. Use existing page as template
3. Register route in TanStack Router
4. Add state management if needed
5. Implement mobile adaptation
6. Add i18n keys

### Page Performance

- Lazy load heavy page components
- Memoize expensive computations
- Use virtual lists for large datasets
- Implement code splitting

### Routing Integration

Pages are connected to routes via TanStack Router:

```typescript
// routes.ts
export const routes = defineRoute({
  '/knowledge': route({
    component: () => import('@/presentation/components/knowledge/KnowledgePage'),
  }),
  '/notes': route({
    component: () => import('@/presentation/components/notes/NotesPage'),
  }),
  '/study': route({
    component: () => import('@/presentation/components/study/StudyPage'),
  }),
});
```

### Error Handling

Pages implement error boundaries:

```tsx
<ErrorBoundary
  fallback={<PageErrorState error={error} />}
  onReset={() => refetch()}
>
  <PageContent />
</ErrorBoundary>
```
