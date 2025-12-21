# Lessons Learned (Retrospectives Synthesis)

### Epic 3: File System Access Layer

| Learning | Detail |
|----------|--------|
| **FSA Permissions Don't Persist** | `queryPermission()` returns `prompt` not `granted` on tab reload |
| **User Gesture Required** | `requestPermission()` needs user click; can't auto-restore |
| **Path Traversal Protection** | Block `..` and absolute paths from day 1 |
| **WorkspaceContext Centralizes State** | Don't spread FSA state across IDELayout and FileTree |

### Epic 5: Persistence Layer

| Learning | Detail |
|----------|--------|
| **Await Transaction Completion** | Always `await tx.done` before continuing |
| **Async vs Sync UI APIs** | Some libs (react-resizable-panels) are sync; use imperative APIs for restore |
| **Vitest Handle Leaks** | Open IndexedDB connections cause timeout warnings |

### Epic 13: Terminal & Sync Stability

| Learning | Detail |
|----------|--------|
| **WebContainers are Window-Bound** | Cannot share across tabs; new tab = new container |
| **Fail Gracefully, Then Innovate** | Provide fallback UI first, then creative solutions (Focus Mode) |
| **User Feedback is Critical** | Invisible processes need visible indicators (Sync Progress) |
| **i18n From Day One** | Ship all new features with translations immediately |

### SSR & Deployment Sessions (2025-12-20)

| Learning | Detail |
|----------|--------|
| **COOP/COEP via Edge Functions** | Static headers in `netlify.toml` cause hydration issues |
| **Client-Only Externalization** | xterm, monaco must use dynamic imports or ssr.external |
| **Nitro Preset Required** | Set `NITRO_PRESET=netlify` for correct output structure |
| **Publish Dir** | Use `.output/public`, not `dist` |

---
