Based on the comprehensive review of your current project state (Via-gent v1.0), the strategic pivot to a "Knowledge Synthesis Station," and the unique constraints of the Vietnam market (mobile-heavy, Docker-averse), here is a **Complete Brownfield Project Proposal**.

This proposal acknowledges that you are *not* starting from scratch. You have a robust React 19/Vite/Zustand/WebContainer foundation. The goal is to **refactor and extend** this foundation into a product that serves both "Code Builders" (Via-gent Classic) and "Knowledge Builders" (Project Alpha).

***

# 🚀 Project Alpha: The "Local-First" Knowledge Synthesis Engine
**Proposal for Brownfield Evolution (v2.0)**

## 1. Executive Summary
**Project Alpha** transforms the existing Via-gent IDE from a "Developer Tool" into a **"Universal Knowledge Station"** that runs entirely in the browser. It merges the structured creativity of **Notion** with the AI synthesis power of **NotebookLM**, powered by a privacy-first, client-side architecture that works offline.

**Key Pivot:**
*   **From:** "Run Node.js in the browser" (WebContainer-centric).
*   **To:** "Synthesize Knowledge in the browser" (RAG-centric).
*   **Market:** Vietnam Education & Enterprise (Students, Teachers, Knowledge Workers).

***

## 2. Technical Architecture Re-alignment (The "Brownfield" Plan)

We will retain 70% of the existing Via-gent stack but replace the "Execution Engine" (WebContainer) with a "Retrieval Engine" (WASM Vector Store) for the mobile/consumer tier.

### 2.1 The "Two-Engine" Strategy
To solve the "Mobile vs. Desktop" conflict, we introduce a split architecture:

| Feature | **Engine A: Creator Studio** (Desktop) | **Engine B: Knowledge Reader** (Mobile/Tablet) |
| :--- | :--- | :--- |
| **Primary Goal** | Ingest, Parse, Embed, Author, Publish | Read, Quiz, Chat, Review |
| **Runtime** | **WebContainer (Node.js)** | **Standard Browser JS (WASM)** |
| **Storage** | File System Access API (Real Disk) | OPFS (Origin Private File System) |
| **Vector DB** | **Orama** (Node/WASM) or Qdrant Sidecar | **Orama** (WASM-only, Read-Optimized) |
| **AI Processing** | Heavy (Ingestion, Graph Extraction) | Light (Retrieval, RAG Chat) |

### 2.2 Tech Stack Adjustments (From v1.0)
*   **Retain:** React 19, TanStack Router, Zustand, Radix UI, Lucide.
*   **Deprecate for v2:** `isomorphic-git` (on Mobile), complex Terminal panes (on Mobile).
*   **Add:**
    *   **Vector Engine:** **Orama** (Best-in-class for client-side, no Docker required). *Replaces the Qdrant Docker dependency for the MVP.*
    *   **PDF/File Processing:** `pdf.js` + `mammoth.js` (Client-side parsing).
    *   **Graph Visualization:** `React Flow` (already planned).
    *   **Packaging:** `JSZip` (To create `.alpha` packs).

***

## 3. Revised Implementation Roadmap (Phased MVP)

We move from "Infrastructure-heavy" to "User-Value-heavy."

### **Phase 1: The "Reader" Core (Weeks 1-3)**
*Goal: A student can open a `.alpha` pack (or simple PDF) on their phone and chat with it.*
1.  **Mobile Layout Adaptation:**
    *   Hide `MonacoEditor` and `xterm.js` on mobile.
    *   Implement **"Card Feed"** UI (Swipeable Knowledge Cards).
2.  **Client-Side RAG (No Docker):**
    *   Integrate **Orama** (replaces Qdrant requirement).
    *   Implement `useVectorStore` hook that chunks text in a Web Worker.
3.  **Basic Chat:**
    *   Reuse `useAgentChat` but point it to the local Orama index instead of a mock.

### **Phase 2: The "Creator" Studio (Weeks 4-6)**
*Goal: A teacher on a laptop can drag-and-drop 5 PDFs and create a "Course Pack."*
1.  **Ingestion Pipeline:**
    *   Build `SourceManager`: Drag-drop PDF -> Extract Text -> Chunk -> Orama Index.
2.  **Knowledge Canvas:**
    *   Implement **Notion-like Block Editor** (Text, Image, Embed).
    *   Integrate `React Flow` to visualize connections between Source Cards.
3.  **The `.alpha` Exporter:**
    *   "Publish" button: Zips the Orama Index + Assets + Manifest into a single binary file.

### **Phase 3: The "Synthesis" Intelligence (Weeks 7-9)**
*Goal: The AI doesn't just "search"; it "synthesizes."*
1.  **Graph Extraction:**
    *   Use LLM to extract "Entities" (Concepts) from text chunks.
    *   Store in a lightweight client-side Graph structure (Adjacency List in IndexedDB).
2.  **Artifact Generation:**
    *   **"Generate Quiz":** Agent prompt to create JSON-LD quiz blocks.
    *   **"Flashcard Deck":** Agent prompt to extract Definition/Term pairs.
3.  **Audio Overview:**
    *   Integrate TTS API (OpenAI/ElevenLabs) to read summaries.

### **Phase 4: Monetization & Security (Weeks 10-12)**
*Goal: Protect the IP.*
1.  **Encrypted Container:** Implement AES-GCM encryption for `.alpha` files.
2.  **License Server:** Simple Cloudflare Worker to issue decryption keys.
3.  **Device Fingerprint:** Integrate `@fingerprintjs/fingerprintjs`.

***

## 4. UX/UI Specification (The "Hybrid" Interface)

### **The "Notebook" View (Desktop)**
*   **Left Sidebar:** Sources (PDFs, Links).
*   **Center Stage:** The **"Canvas"** (Infinite whiteboard + Block Document).
    *   *Interaction:* Drag a PDF text selection onto the canvas -> Becomes a "Quote Block."
*   **Right Panel:** The **"Agent Companion"** (Chat, Studio Actions).
    *   *Actions:* "Turn this page into a Quiz," "Summarize inconsistencies."

### **The "Companion" View (Mobile)**
*   **Tab 1: Feed.** Vertical scroll of "Knowledge Cards" (Summaries, Flashcards).
*   **Tab 2: Chat.** Full-screen chat interface.
*   **Tab 3: Library.** List of downloaded `.alpha` packs.

***

## 5. Critical Technical Decisions (The "Brownfield" Fixes)

1.  **Vector Database:** **Decision: Orama.**
    *   *Why:* Qdrant is too heavy for client-side/mobile. Orama runs in-memory, supports hybrid search, and creates serializable indices perfect for `.alpha` packs.
2.  **PDF Parsing:** **Decision: Client-side (pdf.js).**
    *   *Why:* We cannot afford server-side processing costs. All parsing happens on the user's device (Web Worker).
3.  **State Management:** **Decision: Keep Zustand + Dexie.**
    *   *Refinement:* Ensure the "Vector Index" is NOT stored in Redux/Zustand (too big). Store it in IndexedDB/OPFS and load it lazily.

## 6. Success Metrics (MVP)
1.  **"Time to Chat":** < 5 seconds to open a 50MB `.alpha` pack on a mid-range Android phone.
2.  **"Ingest Speed":** < 30 seconds to parse & index a 20-page PDF on a laptop (Creator Mode).
3.  **Retention:** Users return to *review* content (Flashcards/Quizzes) > 2 times per week.

This proposal leverages your existing investment in **Via-gent** (React/Vite/AI-Agents) but refocuses the *runtime* to fit the market reality (Mobile/No-Docker). It turns your tool into a platform for **Knowledge Creators** to sell to **Knowledge Consumers**.
