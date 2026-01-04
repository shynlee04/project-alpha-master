# Via-Gent Data Flow Architecture - Visual Reference

**Version**: 1.0.0  
**Date**: 2026-01-04T07:25+07:00  
**Companion to**: platform-architecture-definitive-2026-01-04.md

---

## 🔄 MASTER DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    VIA-GENT PLATFORM                                         │
│                                    DATA FLOW ARCHITECTURE                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌───────────────────┐
                                    │   USER BROWSER    │
                                    └─────────┬─────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
        ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
        │  File System API  │     │   React UI Layer  │     │   LLM Providers   │
        │  (Local Files)    │     │   (Presentation)  │     │   (External APIs) │
        └─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘
                  │                         │                         │
                  │                         │                         │
    ┌─────────────┼─────────────────────────┼─────────────────────────┼─────────────┐
    │             │          LAYER 5: PRESENTATION                    │             │
    │             │                         │                         │             │
    │   ┌─────────▼─────────┐     ┌─────────▼─────────┐     ┌─────────▼─────────┐   │
    │   │   IDE Workspace   │     │  Notes Workspace  │     │ Knowledge Workspace│   │
    │   │                   │     │                   │     │                   │   │
    │   │ ┌──────────────┐  │     │ ┌──────────────┐  │     │ ┌──────────────┐  │   │
    │   │ │MonacoEditor  │  │     │ │MarkdownEditor│  │     │ │SourceImporter│  │   │
    │   │ │FileTree      │  │     │ │NoteTree      │  │     │ │Synthesizer   │  │   │
    │   │ │XTerminal     │  │     │ │SearchPanel   │  │     │ │RAGChat       │  │   │
    │   │ │AgentChat     │  │     │ │AIFeatures    │  │     │ │Collections   │  │   │
    │   │ └──────────────┘  │     │ └──────────────┘  │     │ └──────────────┘  │   │
    │   └─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘   │
    │             │                         │                         │             │
    └─────────────┼─────────────────────────┼─────────────────────────┼─────────────┘
                  │                         │                         │
                  └───────────┬─────────────┼─────────────┬───────────┘
                              │             │             │
    ┌─────────────────────────┼─────────────┼─────────────┼─────────────────────────┐
    │                         │   LAYER 4: APPLICATION HOOKS                       │
    │                         │             │             │                         │
    │   ┌─────────────────────┼─────────────┼─────────────┼─────────────────────┐   │
    │   │                     ▼             ▼             ▼                     │   │
    │   │   ┌─────────────────────────────────────────────────────────────┐     │   │
    │   │   │              CROSS-WORKSPACE EVENT BUS                      │     │   │
    │   │   │    emit('source:imported') → on('source:imported')          │     │   │
    │   │   │    emit('file:synced')     → on('file:synced')              │     │   │
    │   │   │    emit('agent:selected')  → on('agent:selected')           │     │   │
    │   │   └─────────────────────────────────────────────────────────────┘     │   │
    │   │                                 │                                     │   │
    │   │   ┌─────────────────────────────┼─────────────────────────────────┐   │   │
    │   │   │                             │                                 │   │   │
    │   │   │  useAgents()  useWorkspaceContext()  useStoreHydration()     │   │   │
    │   │   │  useIdeStatePersistence()  useCrossWorkspaceEvents()         │   │   │
    │   │   │                             │                                 │   │   │
    │   │   └─────────────────────────────┼─────────────────────────────────┘   │   │
    │   └─────────────────────────────────┼─────────────────────────────────────┘   │
    │                                     │                                         │
    └─────────────────────────────────────┼─────────────────────────────────────────┘
                                          │
    ┌─────────────────────────────────────┼─────────────────────────────────────────┐
    │                                     │   LAYER 3: DOMAIN SERVICES              │
    │   ┌─────────────────────────────────┼─────────────────────────────────────┐   │
    │   │                                 │                                     │   │
    │   │   ┌─────────────────┐     ┌─────▼─────────┐     ┌─────────────────┐   │   │
    │   │   │   Agent Tools   │     │ Agent Service │     │  RAG Pipeline   │   │   │
    │   │   │                 │     │               │     │                 │   │   │
    │   │   │ ┌────────────┐  │     │ orchestrate() │     │ chunk()         │   │   │
    │   │   │ │read_file   │  │     │ validate()    │     │ embed()         │   │   │
    │   │   │ │write_file  │  │     │ execute()     │     │ index()         │   │   │
    │   │   │ │exec_cmd    │  │◄────┤               ├────►│ search()        │   │   │
    │   │   │ │search_notes│  │     │               │     │ hybridRetrieval │   │   │
    │   │   │ │synthesize  │  │     │               │     │                 │   │   │
    │   │   │ └────────────┘  │     └───────────────┘     └─────────────────┘   │   │
    │   │   │                 │             │                     │             │   │
    │   │   └─────────────────┘             │                     │             │   │
    │   │                                   │                     │             │   │
    │   │   ┌───────────────────────────────┼─────────────────────┼───────────┐ │   │
    │   │   │                   TOOL PERMISSION MANAGER           │           │ │   │
    │   │   │                               │                     │           │ │   │
    │   │   │   checkPermission(tool, workspace) → allow/deny/ask │           │ │   │
    │   │   │                               │                     │           │ │   │
    │   │   └───────────────────────────────┼─────────────────────┼───────────┘ │   │
    │   │                                   │                     │             │   │
    │   └───────────────────────────────────┼─────────────────────┼─────────────┘   │
    │                                       │                     │                 │
    └───────────────────────────────────────┼─────────────────────┼─────────────────┘
                                            │                     │
    ┌───────────────────────────────────────┼─────────────────────┼─────────────────┐
    │                                       │  LAYER 2: ZUSTAND STORES              │
    │   ┌───────────────────────────────────┼─────────────────────┼───────────────┐ │
    │   │                                   │                     │               │ │
    │   │  ┌────────────┐ ┌────────────┐ ┌──▼───────┐ ┌──────────▼┐ ┌──────────┐  │ │
    │   │  │ useAgent   │ │ useProject │ │ useIDE   │ │ useRAG    │ │useKnowledge│ │ │
    │   │  │ Store      │ │ Store      │ │ Store    │ │ Store     │ │ Store     │  │ │
    │   │  │            │ │            │ │          │ │           │ │           │  │ │
    │   │  │ ┌────────┐ │ │ ┌────────┐ │ │┌───────┐ │ │ ┌───────┐ │ │ ┌───────┐ │  │ │
    │   │  │ │crud    │ │ │ │crud   │ │ │editor │ │ │ │index  │ │ │ │sources│ │  │ │
    │   │  │ │slice   │ │ │ │slice  │ │ │slice │ │ │ │slice  │ │ │ │slice  │ │  │ │
    │   │  │ ├────────┤ │ │ ├────────┤ │ │├───────┤ │ │ ├───────┤ │ │ ├───────┤ │  │ │
    │   │  │ │events  │ │ │ │bindings│ │ │layout │ │ │ │search │ │ │ │collect│ │  │ │
    │   │  │ │slice   │ │ │ │slice  │ │ │slice │ │ │ │slice  │ │ │ │slice  │ │  │ │
    │   │  │ ├────────┤ │ │ ├────────┤ │ │├───────┤ │ │ ├───────┤ │ │ ├───────┤ │  │ │
    │   │  │ │valid   │ │ │ │perms  │ │ │terminal│ │ │ │chunk  │ │ │ │synth  │ │  │ │
    │   │  │ │slice   │ │ │ │slice  │ │ │slice │ │ │ │slice  │ │ │ │slice  │ │  │ │
    │   │  │ └────────┘ │ │ └────────┘ │ │└───────┘ │ │ └───────┘ │ │ └───────┘ │  │ │
    │   │  └────────────┘ └────────────┘ └──────────┘ └───────────┘ └───────────┘  │ │
    │   │         │              │             │            │            │         │ │
    │   └─────────┼──────────────┼─────────────┼────────────┼────────────┼─────────┘ │
    │             │              │             │            │            │           │
    └─────────────┼──────────────┼─────────────┼────────────┼────────────┼───────────┘
                  │              │             │            │            │
                  └──────────────┴─────────────┼────────────┴────────────┘
                                               │
    ┌──────────────────────────────────────────┼────────────────────────────────────┐
    │                                          │  LAYER 1: PERSISTENCE              │
    │   ┌──────────────────────────────────────┼──────────────────────────────────┐ │
    │   │                                      │                                  │ │
    │   │  ┌─────────────────┐     ┌───────────▼───────────┐     ┌─────────────┐  │ │
    │   │  │  Dexie Helpers  │     │    Dexie.js Database  │     │  Orama Index │  │ │
    │   │  │  (15 files)     │     │    (IndexedDB)        │     │  (Vector DB) │  │ │
    │   │  │                 │     │                       │     │              │  │ │
    │   │  │ ide-state-      │     │  ┌─────────────────┐  │     │ embeddings[] │  │ │
    │   │  │  helpers.ts     │────►│  │ ideState        │  │     │ chunks[]     │  │ │
    │   │  │ sync-status-    │     │  │ projects        │  │     │              │  │ │
    │   │  │  helpers.ts     │────►│  │ fileMetadata    │  │     └──────────────┘  │ │
    │   │  │ fsa-handle-     │     │  │ fsaHandles      │  │            │         │ │
    │   │  │  helpers.ts     │────►│  │ threads         │  │            │         │ │
    │   │  │ source-         │     │  │ messages        │  │◄───────────┘         │ │
    │   │  │  helpers.ts     │────►│  │ agentConfigs    │  │            │         │ │
    │   │  │ collection-     │     │  │ toolLogs        │  │            │         │ │
    │   │  │  helpers.ts     │────►│  │ sources         │  │            │         │ │
    │   │  │ synthesis-      │     │  │ collections     │  │            │         │ │
    │   │  │  helpers.ts     │────►│  │ synthesisResults│  │            │         │ │
    │   │  │                 │     │  │ flashcards      │  │            │         │ │
    │   │  └─────────────────┘     │  │ quizResults     │  │            │         │ │
    │   │                          │  └─────────────────┘  │            │         │ │
    │   │                          └───────────────────────┘            │         │ │
    │   │                                      │                        │         │ │
    │   │                                      ▼                        │         │ │
    │   │                          ┌───────────────────────┐            │         │ │
    │   │                          │   dexie-storage.ts    │            │         │ │
    │   │                          │   (quota handling)    │            │         │ │
    │   │                          │   207 lines           │            │         │ │
    │   │                          └───────────────────────┘            │         │ │
    │   │                                      │                        │         │ │
    │   └──────────────────────────────────────┼────────────────────────┼─────────┘ │
    │                                          │                        │           │
    └──────────────────────────────────────────┼────────────────────────┼───────────┘
                                               │                        │
                                               ▼                        ▼
                                    ┌───────────────────┐    ┌─────────────────────┐
                                    │     IndexedDB     │    │   File System API   │
                                    │  (Browser Native) │    │   (Local Folder)    │
                                    └───────────────────┘    └─────────────────────┘
```

---

## 📊 WORKSPACE DATA ISOLATION

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WORKSPACE DATA BOUNDARIES                             │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────┐
    │                           SHARED LAYER                                   │
    │                                                                          │
    │   ┌────────────────────────────────────────────────────────────────┐    │
    │   │  Cross-Workspace Event Bus    Agent Configs    Provider Configs │    │
    │   └────────────────────────────────────────────────────────────────┘    │
    │                                                                          │
    └─────────────────────────────────────────────────────────────────────────┘
                        │           │           │           │
                        │           │           │           │
    ┌───────────────────┼───────────┼───────────┼───────────┼─────────────────┐
    │                   │           │           │           │                 │
    │  ┌────────────────▼──┐  ┌─────▼───────┐  ┌▼──────────┐  ┌▼────────────┐ │
    │  │   IDE WORKSPACE   │  │   NOTES     │  │ KNOWLEDGE │  │   STUDY    │ │
    │  │                   │  │  WORKSPACE  │  │ WORKSPACE │  │  WORKSPACE │ │
    │  │ ┌───────────────┐ │  │             │  │           │  │            │ │
    │  │ │ useIDEStore   │ │  │ useNotes    │  │ useKnow   │  │ useStudy   │ │
    │  │ │ ├─editor      │ │  │ Store       │  │ ledge     │  │ Store      │ │
    │  │ │ ├─explorer    │ │  │             │  │ Store     │  │            │ │
    │  │ │ ├─terminal    │ │  │             │  │ useRAG    │  │ useQuiz    │ │
    │  │ │ └─layout      │ │  │             │  │ Store     │  │ Store      │ │
    │  │ └───────────────┘ │  │             │  │           │  │            │ │
    │  │                   │  │             │  │           │  │            │ │
    │  │ ┌───────────────┐ │  │ ┌─────────┐ │  │ ┌───────┐ │  │ ┌────────┐ │ │
    │  │ │ WebContainer  │ │  │ │Markdown │ │  │ │Sources│ │  │ │Flash   │ │ │
    │  │ │ FSA Handles   │ │  │ │Files    │ │  │ │PDFs   │ │  │ │cards   │ │ │
    │  │ │ Process Mgr   │ │  │ │Search   │ │  │ │URLs   │ │  │ │Quiz    │ │ │
    │  │ └───────────────┘ │  │ │Index    │ │  │ │RAG    │ │  │ │SRS     │ │ │
    │  │                   │  │ └─────────┘ │  │ │Index  │ │  │ └────────┘ │ │
    │  │ PERMISSIONS:      │  │             │  │ └───────┘ │  │            │ │
    │  │ ✅ read_file      │  │ ✅ read_file│  │           │  │            │ │
    │  │ ✅ write_file     │  │ ✅ write   │  │ ✅ import │  │ ✅ quiz    │ │
    │  │ ✅ execute_cmd    │  │ ✅ search  │  │ ✅ synth  │  │            │ │
    │  │ ✅ list_files     │  │            │  │ ✅ rag    │  │            │ │
    │  └───────────────────┘  └────────────┘  └───────────┘  └────────────┘ │
    │                                                                        │
    │                    DATA NEVER CROSSES BOUNDARIES                       │
    │                  EVENTS COORDINATE CROSS-WORKSPACE                     │
    │                                                                        │
    └────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FILE SYNC LIFECYCLE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FILE SYNC LIFECYCLE FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

   USER ACTION                FILE SYSTEM               INDEXEDDB
        │                          │                        │
        ▼                          │                        │
   ┌──────────┐                    │                        │
   │Open Folder                    │                        │
   │(FSA API) │                    │                        │
   └────┬─────┘                    │                        │
        │                          │                        │
        ├──requestPermission()────►│                        │
        │                          │                        │
        │◄─────granted─────────────┤                        │
        │                          │                        │
        ├──────────storeFSAHandle()─────────────────────────►
        │                          │                        │
        ▼                          │                        │
   ┌──────────┐                    │                        │
   │Initial   │                    │                        │
   │Scan      │                    │                        │
   └────┬─────┘                    │                        │
        │                          │                        │
        ├──walkDirectory()────────►│                        │
        │                          │                        │
        │◄──────fileList[]─────────┤                        │
        │                          │                        │
        ├──────────saveFileMetadata()───────────────────────►
        │                          │                        │
        ▼                          │                        │
   ┌──────────┐                    │                        │
   │Sync to   │                    │                        │
   │Container │                    │                        │
   └────┬─────┘                    │                        │
        │                          │                        │
        │  (WebContainer)          │                        │
        ├──mount(files)───────────►│                        │
        │                          │                        │
        │◄─────mounted─────────────┤                        │
        │                          │                        │
        ├──────────updateSyncStatus('synced')───────────────►
        │                          │                        │
        ▼                          │                        │
   ┌──────────┐                    │                        │
   │Edit File │                    │                        │
   │(Monaco)  │                    │                        │
   └────┬─────┘                    │                        │
        │                          │                        │
        ├──emit('file:modified')──►│                        │
        │                          │                        │
        │  (bi-directional sync)   │                        │
        │                          │                        │
        ├──writeFile(handle, content)─►                     │
        │                          │                        │
        ├──────────updateSyncStatus('modified')─────────────►
        │                          │                        │
        ▼                          │                        │
   ┌──────────┐                    │                        │
   │Emit Event│                    │                        │
   └────┬─────┘                    │                        │
        │                          │                        │
        └──eventBus.emit('file:synced', { path, hash })     │
```

---

## 🤖 AGENT EXECUTION FLOW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENT TOOL EXECUTION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

   USER MESSAGE            AGENT SERVICE             TOOL PERMISSION        TOOL
        │                       │                         │                  │
        ▼                       │                         │                  │
   ┌──────────┐                 │                         │                  │
   │"Read the │                 │                         │                  │
   │file..."  │                 │                         │                  │
   └────┬─────┘                 │                         │                  │
        │                       │                         │                  │
        ├──processMessage()────►│                         │                  │
        │                       │                         │                  │
        │                       ├──parseToolCall()────────►                  │
        │                       │   tool: "read_file"     │                  │
        │                       │   args: { path }        │                  │
        │                       │                         │                  │
        │                       ├──checkPermission()──────►                  │
        │                       │   workspace: "ide"      │                  │
        │                       │                         │                  │
        │                       │◄──────allow/deny────────┤                  │
        │                       │                         │                  │
        │         ┌─────────────┴─────────────┐           │                  │
        │         │ if (denied)               │           │                  │
        │         │   return "Permission      │           │                  │
        │         │   denied for this tool"   │           │                  │
        │         └─────────────┬─────────────┘           │                  │
        │                       │                         │                  │
        │         ┌─────────────┴─────────────┐           │                  │
        │         │ if (ask)                  │           │                  │
        │         │   await userConfirmation()│           │                  │
        │         └─────────────┬─────────────┘           │                  │
        │                       │                         │                  │
        │                       ├──executeTool()─────────────────────────────►
        │                       │                         │                  │
        │                       │◄──────────────────result────────────────────┤
        │                       │                         │                  │
        │                       ├──logToolExecution()─────►                  │
        │                       │   (to toolExecutionLog) │                  │
        │                       │                         │                  │
        │◄──────response────────┤                         │                  │
        │                       │                         │                  │

   TOOL PERMISSION MATRIX:
   ┌────────────────────────────────────────────────────────────────────────┐
   │ Tool            │ IDE    │ Notes  │ Knowledge │ Study  │ Default      │
   ├─────────────────┼────────┼────────┼───────────┼────────┼──────────────┤
   │ read_file       │ ASK    │ ASK    │ DENY      │ DENY   │ per-file     │
   │ write_file      │ ASK    │ ASK    │ DENY      │ DENY   │ per-file     │
   │ list_files      │ ALLOW  │ ALLOW  │ ALLOW     │ DENY   │ directory    │
   │ execute_command │ ASK    │ DENY   │ DENY      │ DENY   │ dangerous    │
   │ search_notes    │ DENY   │ ALLOW  │ DENY      │ DENY   │ allowed      │
   │ process_url     │ DENY   │ DENY   │ ALLOW     │ DENY   │ allowed      │
   │ process_pdf     │ DENY   │ DENY   │ ALLOW     │ DENY   │ allowed      │
   │ synthesize      │ DENY   │ DENY   │ ALLOW     │ DENY   │ allowed      │
   └────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 RAG PIPELINE DETAIL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RAG PIPELINE ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌───────────────────────────────────────────────────────────────────────────┐
   │                              INGESTION PHASE                              │
   └───────────────────────────────────────────────────────────────────────────┘

   SOURCE IMPORT                   PROCESSING                     STORAGE
        │                              │                             │
        ▼                              │                             │
   ┌──────────┐                        │                             │
   │PDF       │──►gemini-pdf-processor │                             │
   │URL       │──►gemini-url-processor │                             │
   │Text      │──►direct-text          │                             │
   └────┬─────┘                        │                             │
        │                              │                             │
        ├───────extractMetadata()──────►                             │
        │                              │                             │
        │                ┌─────────────▼────────────┐                │
        │                │    Document Chunker      │                │
        │                │                          │                │
        │                │  Strategy Options:       │                │
        │                │  - fixed-size (512 tok)  │                │
        │                │  - semantic (sentence)   │                │
        │                │  - recursive (hierarchy) │                │
        │                │                          │                │
        │                └─────────────┬────────────┘                │
        │                              │                             │
        │                              ▼                             │
        │                ┌─────────────────────────┐                 │
        │                │   Embedding Service     │                 │
        │                │                         │                 │
        │                │  Local:                 │                 │
        │                │  - Transformers.js      │                 │
        │                │                         │                 │
        │                │  Cloud:                 │                 │
        │                │  - OpenAI embeddings    │                 │
        │                │  - Voyage AI            │                 │
        │                │                         │                 │
        │                └─────────────┬───────────┘                 │
        │                              │                             │
        │                              ▼                             │
        │                ┌─────────────────────────┐                 │
        │                │     Orama Index         │                 │
        │                │                         │                 │
        │                │  chunks[]: {            │                 │
        │                │    id, docId,           │                 │
        │                │    text, embedding,     │                 │
        │                │    metadata             │────────────────►│
        │                │  }                      │                 │
        │                │                         │                 │
        │                └─────────────────────────┘                 │
        │                                                            │
        └──────────save source/chunks to Dexie────────────────────────►


   ┌───────────────────────────────────────────────────────────────────────────┐
   │                              RETRIEVAL PHASE                              │
   └───────────────────────────────────────────────────────────────────────────┘

   USER QUERY                      PROCESSING                    RESULTS
        │                              │                             │
        ▼                              │                             │
   ┌──────────┐                        │                             │
   │"How does │                        │                             │
   │X work?"  │                        │                             │
   └────┬─────┘                        │                             │
        │                              │                             │
        ├───────embed(query)───────────►                             │
        │                              │                             │
        │                ┌─────────────▼────────────┐                │
        │                │   Hybrid Retriever       │                │
        │                │                          │                │
        │                │  1. Vector Search        │                │
        │                │     (semantic sim)       │                │
        │                │                          │                │
        │                │  2. BM25 Text Search     │                │
        │                │     (keyword match)      │                │
        │                │                          │                │
        │                │  3. RRF Fusion           │                │
        │                │     (combine rankings)   │                │
        │                │                          │                │
        │                └─────────────┬────────────┘                │
        │                              │                             │
        │                              ▼                             │
        │                ┌─────────────────────────┐                 │
        │                │   Citation Formatter    │                 │
        │                │                         │                 │
        │                │  [{                     │                 │
        │                │    sourceId, chunkId,   │                 │
        │                │    text, score,         ├────────────────►│
        │                │    citation: "[1]"      │                 │
        │                │  }]                     │                 │
        │                │                         │                 │
        │                └─────────────────────────┘                 │
        │                              │                             │
        │◄──────topKResults[]──────────┘                             │
        │                                                            │
        ▼                                                            │
   ┌──────────────────────────────────────────────────────────────┐  │
   │                    LLM AUGMENTED RESPONSE                     │  │
   │                                                               │  │
   │   System: "Answer based on these sources: [context]"          │  │
   │   User: "How does X work?"                                    │  │
   │   Assistant: "Based on [1], X works by... [2] also mentions..." │
   │                                                               │  │
   └──────────────────────────────────────────────────────────────┘  │
```

---

## 🗂️ IMPORT PATH CHEATSHEET

```typescript
// ============= PERSISTENCE LAYER =============

// Dexie Database (Always use these)
import { db, getDb } from '@/lib/state/dexie-db';
import type { ProjectRecord, SourceRecord } from '@/lib/state/dexie-db-types';

// Dexie Helpers (Direct imports to specific files)
import { getIDEState, saveIDEState } from '@/lib/state/dexie-db-helpers/ide-state-helpers';
import { getSyncStatus, updateSyncStatus } from '@/lib/state/dexie-db-helpers/sync-status-helpers-basic';
import { storeFSAHandle, getFSAHandle } from '@/lib/state/dexie-db-helpers/fsa-handle-helpers';

// Storage with Quota Handling
import { createDexieStorage } from '@/lib/state/dexie-storage';


// ============= ZUSTAND STORES =============

// By Domain (Canonical Locations)
import { useAgentStore } from '@/infrastructure/persistence/stores/agents';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation';
import { useKnowledgeStore } from '@/infrastructure/persistence/stores/knowledge';
import { useRAGStore } from '@/infrastructure/persistence/stores/rag';
import { useFileSnapshotStore } from '@/infrastructure/persistence/stores/filesystem';

// Legacy Knowledge Store (Direct Path)
import { useKnowledgeStore } from '@/lib/state/knowledge/knowledge-store';


// ============= DOMAIN SERVICES =============

// Application Services
import { AgentService } from '@/application/services/AgentService';
import { ProviderService } from '@/application/services/ProviderService';

// Domain Value Objects
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { ToolPermission } from '@/domain/value-objects/tool-permission';

// Agent Tools
import { readFileTool, writeFileTool } from '@/lib/agent/tools';
import { ToolPermissionManager } from '@/lib/agent/tool-permission-manager';


// ============= EVENTS =============

// Cross-Workspace Event Bus
import { eventBus } from '@/infrastructure/events';
import type { CrossWorkspaceEvent } from '@/infrastructure/events';

// Hooks
import { useCrossWorkspaceEvents } from '@/hooks/use-cross-workspace-events';


// ============= RAG =============

// RAG Pipeline
import { documentChunker } from '@/lib/rag/document-chunker';
import { embeddingService } from '@/lib/rag/embedding-service';
import { hybridRetriever } from '@/lib/rag/hybrid-retriever';
import { citationFormatter } from '@/lib/rag/citation-formatter';


// ============= FILE SYSTEM =============

// FSA Operations
import { localFsAdapter } from '@/lib/filesystem/local-fs-adapter';
import { syncManager } from '@/lib/filesystem/sync-manager';

// File Sync Services
import { ideFileSyncService } from '@/lib/filesync/ide-file-sync-service';
import { notesFileSyncService } from '@/lib/filesync/notes-file-sync-service';
import { knowledgeFileSyncService } from '@/lib/filesync/knowledge-file-sync-service';
```

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-01-04T07:25+07:00  
**Companion to**: platform-architecture-definitive-2026-01-04.md
