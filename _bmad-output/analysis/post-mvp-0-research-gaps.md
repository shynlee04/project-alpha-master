# Post-MVP-0 Research Gaps & Requirements

**Generated:** 2025-12-10T10:45:00+07:00  
**Source:** `issues-enlisting-09-dec-2025.md` analysis  
**Status:** Planning Document

---

## Overview

This document captures the research and planning gaps that must be addressed **after MVP-0 remediation** to enable the advanced features described in the user's vision for via-gent.

---

## 1. Multi-Agent Orchestration

### Current State
- Single agent chat flow via `useAgentChat` hook
- No agent profiles, roles, or domain specialization
- No workflow pipeline support

### Research Gaps
| Gap | Required Research | Priority |
|-----|-------------------|----------|
| Agent Profiles | How to define system prompts, constraints, tool sets per agent type | 🔴 Critical |
| Agent Switching | UX patterns for switching agents mid-conversation | 🟠 High |
| Workflow Pipelines | Orchestration patterns for multi-step agent workflows | 🟠 High |
| Agent Memory | Per-agent context and memory isolation | 🟡 Medium |

### Recommended Research Sources
- TanStack AI multi-agent patterns (Context7 MCP)
- LangGraph orchestration patterns (Tavily MCP)
- AutoGen multi-agent examples (DeepWiki MCP)

---

## 2. Role-Based Workspaces

### Current State
- Single IDE workspace for all users
- No role differentiation (developer, PM, designer)
- No specialized interfaces per role

### Research Gaps
| Gap | Required Research | Priority |
|-----|-------------------|----------|
| Workspace Layouts | How to define role-specific layouts and panels | 🔴 Critical |
| Role Switching | UX for switching between roles/workspaces | 🟠 High |
| Data Sharing | How workspaces share project data while having different views | 🟠 High |
| Permissions | Role-based access to tools and features | 🟡 Medium |

### Recommended Approach
1. Create product brief for workspace roles
2. Design UX wireframes per role
3. Define shared vs. role-specific state boundaries

---

## 3. Asset Studio

### Current State
- No asset management UI
- No image generation integration
- No media storage layer

### Research Gaps
| Gap | Required Research | Priority |
|-----|-------------------|----------|
| AI Image Generation | Integration patterns for Stable Diffusion, DALL-E, etc. | 🟠 High |
| Asset Storage | Client-side storage for generated assets (IndexedDB, OPFS) | 🟠 High |
| Asset-to-Code Pipeline | How generated assets integrate into coding workflow | 🟡 Medium |
| Light Photo Editing | Browser-based image editing capabilities | 🟡 Medium |

### Recommended Research Sources
- Stability AI SDK patterns (Exa MCP)
- Browser canvas/image manipulation APIs
- OPFS (Origin Private File System) for large file storage

---

## 4. Multimodal Input & Output

### Current State
- Text-only chat input
- No image/file upload to agent
- No structured output rendering

### Research Gaps
| Gap | Required Research | Priority |
|-----|-------------------|----------|
| Image Input | How to send images to Gemini/Claude via TanStack AI | 🔴 Critical |
| File Upload | Drag-drop file input for agent context | 🟠 High |
| Structured Output | Rendering agent responses as cards, tables, code diffs | 🟠 High |
| Reasoning Visualization | How to display agent thought process/reasoning | 🟡 Medium |

### Recommended Research Sources
- TanStack AI multimodal content guide (Context7 MCP)
- Gemini Pro Vision API patterns
- Claude 3 vision capabilities

---

## 5. Advanced Chat UX

### Current State
- Basic chat thread display
- No conversation topics/threads
- No chat history organization

### Research Gaps
| Gap | Required Research | Priority |
|-----|-------------------|----------|
| Conversation Topics | How to organize chats by topic/project | 🟠 High |
| Thread Branching | Allow branching conversations from any point | 🟡 Medium |
| Event Mirroring | Mirror terminal/editor events in chat | 🟡 Medium |
| Agent Config UI | Quick-access agent settings in chat header | 🟠 High |

---

## 6. Local Machine Integration

### Current State
- WebContainers for isolated runtime
- File System Access API for folder access
- No VS Code extension bridge

### Research Gaps
| Gap | Required Research | Priority |
|-----|-------------------|----------|
| VS Code Extension Bridge | How to communicate between browser and VS Code | 🟡 Medium |
| Native Node.js Fallback | Option to use local Node.js instead of WebContainers | 🟡 Medium |
| SSH/Remote Dev | Browser-based SSH to remote machines | 🔵 Low |

---

## 7. Project Management Features

### Current State
- Basic project creation
- No sprint/task tracking
- No BMAD workflow integration

### Research Gaps
| Gap | Required Research | Priority |
|-----|-------------------|----------|
| Sprint Tracking | UI for agile sprint management | 🟡 Medium |
| Task Board | Kanban-style task visualization | 🟡 Medium |
| BMAD Workflow UI | Visual workflow execution interface | 🟠 High |
| Document Generation | AI-assisted PRD/spec generation | 🟠 High |

---

## Prioritized Research Roadmap

### Phase 1: Foundation (Post-MVP-0, Week 1-2)
1. **Multimodal Input** - Enable image upload to agents
2. **Structured Output** - Render agent responses as rich content
3. **Agent Profiles** - Define agent roles and system prompts

### Phase 2: Workspaces (Week 3-4)
1. **Role-Based Layouts** - Developer, PM, Designer workspaces
2. **Workspace State** - Shared vs. isolated state boundaries
3. **Conversation Topics** - Organize chats by project/topic

### Phase 3: Advanced Features (Week 5-8)
1. **Multi-Agent Orchestration** - Workflow pipelines
2. **Asset Studio** - Basic image generation and management
3. **BMAD Workflow UI** - Visual workflow execution

---

## BMAD Workflow Recommendation

For each major feature area above, initiate a **full BMAD product brief** workflow:

1. `/workflow` - Collaborative product brief discovery
2. `/create-tech-spec` - Technical specification
3. `/create-story` - Epics and user stories
4. `/dev-story` - Implementation tasks

This ensures each advanced feature is properly scoped before development begins.

---

## Related Documents

- `docs/issues-enlisting-09-dec-2025.md` - Original issues document
- `docs/analysis/spike-to-cluster-mapping.md` - Spike patterns reference
- `agent-os/product/mvp-0-scope.md` - MVP-0 scope definition
- `docs/bmm-workflow-status.yaml` - Current execution status
