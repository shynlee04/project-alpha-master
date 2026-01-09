# Tool Flow Analysis Report

**Cycle**: 1.1
**Agent**: code-explorer
**Date**: 2026-01-10

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               CLIENT SIDE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  useAgentChatWithTools Hook                                                 │
│  ├─ Creates agentTools via createAgentClientTools()                        │
│  ├─ Factory creates client tools with .client() wrappers                    │
│  ├─ Calls getClientTools() to get TanStack AI tool array                   │
│  └─ Passes tools to useChat via chatOptions                                │
│                                                                             │
│  Tools Available:                                                           │
│  • readFile (via createReadFileClientTool)                                  │
│  • writeFile (via createWriteFileClientTool)                                │
│  • listFiles (via createListFilesClientTool)                                │
│  • executeCommand (via createExecuteCommandClientTool)                     │
│  • synthesize (via createSynthesizeClientTool) - EPIC-38                    │
│  • processPDF (via createProcessPDFClientTool) - EPIC-38                   │
│  • processImage (via createProcessImageClientTool) - EPIC-38                │
│  • processURL (via createProcessURLClientTool) - EPIC-38                    │
│  • voiceInput (via createVoiceInputClientTool) - EPIC-40 MM-05              │
│  • voiceOutput (via createVoiceOutputClientTool) - EPIC-40 MM-06            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ TanStack AI Chat
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVER SIDE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  /api/chat Route                                                            │
│  ├─ getTools() function returns:                                           │
│  │   • readFileDef                                                          │
│  │   • writeFileDef                                                         │
│  │   • listFilesDef                                                         │
│  │   • executeCommandDef                                                    │
│  └─ Only 4 tools hardcoded!                                                │
│                                                                             │
│  Missing Server Tools:                                                      │
│  • searchNotesDef                                                           │
│  • synthesizeDef                                                           │
│  • processPDFDef                                                           │
│  • processImageDef                                                          │
│  • processURLDef                                                           │
│  • voiceInputDef                                                           │
│  • voiceOutputDef                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Bottleneck Location

**File**: `src/routes/api/chat.ts`
**Lines**: 118-125 (getTools function)

---

## Root Cause Analysis

The bottleneck is a **hardcoded server-side tool limitation** in `/api/chat.ts`. The `getTools()` function at lines 118-125 explicitly returns only 4 tools:

```typescript
function getTools() {
    return [
        readFileDef,
        writeFileDef,
        listFilesDef,
        executeCommandDef,
    ];
}
```

This creates a **critical disconnect**:
- **Client-side**: Has 10+ tools available (file, terminal, knowledge, voice)
- **Server-side**: Only exposes 4 tools to the LLM
- **Result**: LLM only knows about 4 tools and can't request the others

The filtering happens because:
1. Server-side tools are defined separately from client-side tools
2. The API route only exports the 4 basic file/terminal tools
3. Knowledge and voice tools exist on the client but aren't passed to the LLM

---

## Existing Tools (Client vs Server)

| Tool | Client Side | Server Side | Exposed to LLM? |
|------|-------------|-------------|-----------------|
| readFile | ✅ | ✅ | ✅ |
| writeFile | ✅ | ✅ | ✅ |
| listFiles | ✅ | ✅ | ✅ |
| executeCommand | ✅ | ✅ | ✅ |
| searchNotes | ✅ | ❌ | ❌ |
| synthesize | ✅ | ❌ | ❌ |
| processPDF | ✅ | ❌ | ❌ |
| processImage | ✅ | ❌ | ❌ |
| processURL | ✅ | ❌ | ❌ |
| voiceInput | ✅ | ❌ | ❌ |
| voiceOutput | ✅ | ❌ | ❌ |

---

## Recommended Fix Approach

**Phase 1: Unified Tool Registry**
1. Create a centralized tool registry that exports ALL tool definitions
2. Import this registry in both client and server code
3. Ensure server-side exports match client-side capabilities

**Phase 2: Server Tool Expansion**
1. Update `/api/chat.ts` to export ALL available tools
2. Add knowledge tools (synthesize, processPDF, processImage, processURL)
3. Add voice I/O tools (voiceInput, voiceOutput)
4. Add search notes tool

**Phase 3: Dynamic Tool Filtering**
1. Implement optional tool filtering based on workspace type, agent capabilities
2. Allow tools to be disabled consistently
3. Add tool availability logging

**Key Principle**: Client and server must expose the same tool set to avoid LLM confusion.
