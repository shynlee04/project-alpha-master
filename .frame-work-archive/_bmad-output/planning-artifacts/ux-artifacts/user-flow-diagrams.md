# User Flow Diagrams
**Generated:** 2026-01-07
**Project:** Via-Gent (Project Alpha v2.0)
**Status:** Complete

---

## Table of Contents

1. [First-Time User Flow](#1-first-time-user-flow)
2. [IDE Workspace Flow](#2-ide-workspace-flow)
3. [Knowledge Workspace Flow](#3-knowledge-workspace-flow)
4. [Notes Workspace Flow](#4-notes-workspace-flow)
5. [Study Workspace Flow](#5-study-workspace-flow)
6. [Agent Configuration Flow](#6-agent-configuration-flow)
7. [File Sync Flow](#7-file-sync-flow)
8. [Error Recovery Flow](#8-error-recovery-flow)

---

## 1. First-Time User Flow

### Onboarding Journey

```
┌─────────────────┐
│ Landing Page    │
│ - Sign in / Get │
│   Started       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Permission      │
│ Request         │
│ - Grant file    │
│   system access │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Workspace Tour  │
│ - Hub overview  │
│ - 4 workspaces  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Configure AI    │
│ - Add API key   │
│ - Or use demo   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ First Project   │
│ - Create or     │
│   open project  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ IDE Workspace   │
│ - Ready to code │
└─────────────────┘
```

**Decision Points:**

1. **Permission Request**
   - Allow: Continue to tour
   - Deny: Show limited features, offer retry

2. **AI Configuration**
   - Add API key: Full AI access
   - Use demo: Limited features, rate-limited

3. **First Project**
   - Create new: Start fresh project
   - Open existing: Browse local folders

---

## 2. IDE Workspace Flow

### File Creation & Editing

```
┌─────────────────┐
│ IDE Workspace   │
└────────┬────────┘
         │
         ↓
    ┌─────────┐
    │ Action? │
    └────┬────┘
         │
    ├────┴────┬────────────┬────────────┐
    │         │            │            │
    ↓         ↓            ↓            ↓
┌──────┐ ┌──────┐   ┌──────────┐ ┌──────────┐
│ New  │ │ Open │   │ Edit     │ │ Delete   │
│ File │ │ File │   │ Existing │ │ File     │
└───┬──┘ └───┬──┘   └────┬─────┘ └────┬─────┘
    │        │            │            │
    ↓        ↓            ↓            ↓
┌──────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Name │ │ File     │ │ Monaco   │ │ Confirm? │
│ File │ │ Tree     │ │ Editor   │ │          │
└───┬──┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
    │         │            │            │
    ↓         ↓            ↓            ↓
┌───────────────────────────────────────────┐
│ Auto-Save to Local Storage                │
│ + Sync to WebContainer (if active)       │
└───────────────────┬───────────────────────┘
                    │
                    ↓
            ┌───────────────┐
            │ File Updated  │
            │ Status: Saved │
            └───────────────┘
```

### Agent Chat Flow (IDE)

```
┌─────────────────┐
│ Agent Chat Panel│
│ - Right sidebar │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Select Agent    │
│ - Code Assistant│
│ - Custom agent  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Type Message    │
│ - Question      │
│ - Request       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Agent Processes │
│ - Understanding │
│ - Plan          │
└────────┬────────┘
         │
         ↓
    ┌─────────┐
    │ Tools?  │
    └────┬────┘
         │
    ├────┴────┐
    │         │
    ↓         ↓
┌──────────┐ ┌────────────┐
│ Approve  │ │ Stream     │
│ Tools    │ │ Response   │
└────┬─────┘ └──────┬─────┘
     │              │
     ↓              ↓
┌─────────────────────────┐
│ Execute Tools           │
│ - read_file             │
│ - write_file            │
│ - execute_command       │
└──────────┬──────────────┘
           │
           ↓
┌───────────────────────┐
│ Display Results       │
│ - Code changes         │
│ - Terminal output      │
│ - Preview updates      │
└───────────────────────┘
```

---

## 3. Knowledge Workspace Flow

### Source Ingestion

```
┌─────────────────┐
│ Knowledge Base  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Add Source      │
│ - PDF Upload    │
│ - URL Import    │
│ - Text Paste    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Processing      │
│ - Parse content │
│ - Extract text  │
│ - Identify lang │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Chunking        │
│ - Split sections│
│ - Create chunks │
│ - Store metadata│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Embedding       │
│ - Generate      │
│   vectors       │
│ - Index chunks  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Ready to Query  │
│ - RAG enabled   │
│ - Canvas ready  │
└─────────────────┘
```

### Knowledge Synthesis

```
┌─────────────────┐
│ Canvas View     │
│ - Knowledge     │
│   cards         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Select Cards    │
│ - Single click  │
│ - Multi-select  │
│ - Drag to group │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Agent Request   │
│ - Synthesize    │
│ - Summarize     │
│ - Compare       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ RAG Processing  │
│ - Retrieve      │
│ - Rank results  │
│ - Generate      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Display Output  │
│ - New card      │
│ - Summary       │
│ - Insights      │
└─────────────────┘
```

---

## 4. Notes Workspace Flow

### Note Creation & Editing

```
┌─────────────────┐
│ Notes Workspace │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ New Note        │
│ - Blank note    │
│ - Template      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ BlockNote Editor │
│ - Blocks        │
│ - Formatting    │
│ - Media         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ AI Enhancement  │
│ - /summarize    │
│ - /expand       │
│ - /rewrite      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Save Note       │
│ - Auto-save     │
│ - Version hist  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Organize        │
│ - Folders       │
│ - Tags          │
│ - Search        │
└─────────────────┘
```

### AI Transform Flow

```
┌─────────────────┐
│ Highlight Text   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Open Menu       │
│ - / (slash cmd) │
│ - Right-click   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Select Action   │
│ - Summarize     │
│ - Expand        │
│ - Rewrite       │
│ - Translate     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Agent Processes │
│ - Understand    │
│ - Transform     │
│ - Generate      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Insert Result   │
│ - Replace       │
│ - Append        │
│ - New block     │
└─────────────────┘
```

---

## 5. Study Workspace Flow

### Flashcard Study Flow

```
┌─────────────────┐
│ Study Workspace │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Select Deck     │
│ - Browse decks  │
│ - Recent        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Start Session   │
│ - New cards     │
│ - Due cards     │
│ - All cards     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Show Card       │
│ - Front side    │
│ - Question      │
└────────┬────────┘
         │
         ↓
    ┌─────────┐
    │ Flip?   │
    └────┬────┘
         │
    ├────┴────┐
    │         │
    ↓         ↓
┌────────┐ ┌────────┐
│ Show   │ │ Rate  │
│ Back   │ │ Card  │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         │
         ↓
┌─────────────────┐
│ Schedule Next   │
│ - Easy: 1 day   │
│ - Medium: 3 days│
│ - Hard: 5 days  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Next Card       │
│ or              │
│ Session Complete│
└─────────────────┘
```

### Quiz Flow

```
┌─────────────────┐
│ Quiz Mode       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Select Quiz     │
│ - By topic      │
│ - Random        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Question 1/n    │
│ - Multiple      │
│   choice        │
│ - Checkbox      │
│ - Fill-in       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Select Answer   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Submit Answer   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Immediate       │
│ Feedback        │
│ - Correct/      │
│   Incorrect     │
│ - Explanation   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Next Question   │
│ or              │
│ Quiz Results    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Score Summary   │
│ - Percentage    │
│ - Time taken    │
│ - Weak areas    │
└─────────────────┘
```

---

## 6. Agent Configuration Flow

### Add New Agent

```
┌─────────────────┐
│ Agent Settings  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Create Agent    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Basic Config    │
│ - Name          │
│ - Description   │
│ - Provider      │
│ - Model         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Configure API   │
│ - Add API key   │
│ - Test connect  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Workspace       │
│ Permissions     │
│ - IDE           │
│ - Knowledge     │
│ - Notes         │
│ - Study         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Tool Permissions│
│ - Enable/disable │
│ - Trust levels  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Save Agent      │
│ - Validate      │
│ - Store         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Ready to Use    │
│ - Appears in    │
│   selector      │
└─────────────────┘
```

---

## 7. File Sync Flow

### Local to WebContainer

```
┌─────────────────┐
│ Local File      │
│ Change Detected │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Debounce        │
│ - Wait 500ms    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Read File       │
│ - FSA API       │
│ - Get content   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Write to        │
│ WebContainer    │
│ - fs.writeFile  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Update Status   │
│ - Synced icon   │
│ - Timestamp     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Emit Event      │
│ - FILE_SYNC     │
│ - Subscribers   │
│   update        │
└─────────────────┘
```

### Permission Recovery

```
┌─────────────────┐
│ App Reloaded     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Check Stored    │
│ Handle          │
│ - IndexedDB     │
│ - fsaHandles    │
└────────┬────────┘
         │
    ├────┴────┐
    │         │
    ↓         ↓
┌────────┐ ┌────────────┐
│ Found  │ │ Not Found  │
│ Handle │ │ - Request   │
└───┬────┘ └────┬───────┘
    │           │
    ↓           ↓
┌─────────┐ ┌─────────┐
│ Verify │ │ Grant   │
│ Access │ │ Access  │
└────┬────┘ └────┬────┘
     │           │
     └─────┬─────┘
           │
           ↓
┌─────────────────────┐
│ Workspace Ready     │
│ - Files accessible  │
│ - Edit enabled      │
└─────────────────────┘
```

---

## 8. Error Recovery Flow

### API Error Recovery

```
┌─────────────────┐
│ API Request     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Error Received  │
│ - 401 Unauthorized│
│ - 429 Rate Limit │
│ - 500 Server    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Show Error      │
│ - Clear message │
│ - Type badge     │
└────────┬────────┘
         │
         ↓
    ┌─────────┐
    │ Action? │
    └────┬────┘
         │
    ├────┴────┬──────────┐
    │         │          │
    ↓         ↓          ↓
┌────────┐ ┌────────┐ ┌──────────┐
│ Retry  │ │ Config │ │ Dismiss  │
│ (Auto) │ │ Fix    │ │          │
└───┬────┘ └───┬────┘ └──────────┘
    │          │
    └────┬─────┘
         │
         ↓
┌─────────────────┐
│ Retry Request   │
│ - With backoff  │
│ - Max 3 times   │
└────────┬────────┘
         │
    ├────┴────┐
    │         │
    ↓         ↓
┌────────┐ ┌────────────┐
│ Success│ │ Failed     │
│        │ │ - Show help │
└────────┘ └────────────┘
```

### File Sync Error Recovery

```
┌─────────────────┐
│ Sync Attempt    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Sync Failed     │
│ - Permission    │
│ - Network       │
│ - Conflict      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Show Warning    │
│ - Type badge     │
│ - Message       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Offer Actions   │
│ - Retry         │
│ - Reconnect     │
│ - Resolve       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ User Chooses    │
└────────┬────────┘
         │
    ├────┴────┬──────────┐
    │         │          │
    ↓         ↓          ↓
┌────────┐ ┌────────┐ ┌──────────┐
│ Retry  │ │ Manual │ │ Skip     │
│        │ │ Sync   │ │          │
└───┬────┘ └───┬────┘ └──────────┘
    │          │
    └────┬─────┘
         │
         ↓
┌─────────────────────┐
│ Sync Resumed        │
│ or Skipped          │
└─────────────────────┘
```

---

## Flow Notation Key

**Symbols:**
- `→` or `│`: User action / navigation
- `↓`: Next step / continuation
- `┌────┴────┐`: Decision point / branch
- `├─┴─┐`: Parallel paths
- `○`: Start point
- `◼`: End point

**Patterns:**
- **Linear Flow**: Sequential steps (top to bottom)
- **Branching Flow**: Decision points with alternatives
- **Loop Flow**: Retry / repeat patterns
- **Parallel Flow**: Multiple concurrent actions

---

**END OF USER FLOW DIAGRAMS**
