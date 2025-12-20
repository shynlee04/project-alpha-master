# TanStack AI Orchestration — 2025-12-09

Sources:
- Context7 `/tanstack/ai` — toolDefinition, isomorphic tools, streaming call flow, client/server adapters.
- Context7 (tool architecture docs) — hybrid tools, server/client definitions separation.
- DeepWiki (tanstack/router) — search-param canonical state informs agent context URLs (indirect but relevant).

## Tool Architecture Patterns
- **Define once, implement per environment:** `toolDefinition()` + `.server()`/`.client()` for isomorphic schemas; Zod drives type safety.
- **Organization:** keep schemas in `definitions.ts`; server logic in `server.ts`; client implementations separate for browser-only execution.
- **LLM exposure:** pass tool definitions (not implementations) to LLM; implementations run server/client per `.server()`/`.client()`.
- **Hybrid tools:** choose execution site at runtime; useful for local-only actions (client) vs persistence (server or domain layer).

## Call Flow (tools)
1. Browser sends message to server with tool definitions and history.
2. Server calls provider (e.g., Gemini) with definitions.
3. LLM streams chunks (content + tool calls + done).
4. Server/Client executes tool implementation; results emitted via events; stream continues.

## Multi-Agent / Handoff Considerations (patterns to enforce)
- Represent handoff as a tool (e.g., `handoff` with `toAgent`, `reason`, `context`).
- Guardrails to avoid loops: cap `maxSteps`, detect repeated handoff targets, track phase/agent in state, compress context for specialists.
- Persist agent context (phase, artifacts, constraints) before switching; feed as system prompt to next agent.
- Log tool calls/events for replay (Agent Observability roadmap).

## Streaming & UX
- Stream partial content + tool calls; display tool progress in chat panel.
- Mark `isStreaming` in UI to avoid parallel sends.
- Support multimodal outputs (TanStack AI supports structured content); ensure renderer handles code blocks + structured data.

## Action Items for via-gent
- Define tool schemas once in `src/domains/agent/api/` (or shared) with Zod; keep implementations in domain layer (no UI imports).
- Add explicit `handoff` tool with context payload; include loop guards (`maxCycles`, visited agents).
- Ensure chat hook (`useAgentChat`) surfaces tool call events to UI (progress indicator).
- Persist agent context between sessions (Memory domain) to resume after refresh.
- Document provider adapter usage (Gemini primary) and model selection per task (fast vs reasoning).
