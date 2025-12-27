# Epic 23: UX/UI Modernization (NEW - Course Correction v6)

**Goal:** Complete UX/UI redesign with ShadcnUI + TailwindCSS 4.x for improved user experience.

**Priority:** 🟠 P1 | **Stories:** 8 | **Points:** 34 | **Duration:** 2-3 weeks

### Tech Stack

- **Styling:** TailwindCSS 4.x with `@tailwindcss/vite` plugin
- **Components:** ShadcnUI (60+ pre-built accessible components)
- **Theming:** Dark/Light mode toggle with CSS variables

### Stories

| Story | Title | Points |
|-------|-------|--------|
| 23-1 | Install TailwindCSS 4.x + Vite Plugin | 2 |
| 23-2 | Initialize ShadcnUI + Theme Configuration | 3 |
| 23-3 | Migrate Layout Components (Header, Panels) | 5 |
| 23-4 | Migrate IDE Panel Components (FileTree, Editor, Terminal) | 8 |
| 23-5 | Implement Dark/Light Theme Toggle | 3 |
| 23-6 | Migrate Form & Dialog Components | 5 |
| 23-7 | Accessibility Audit (WCAG AA) | 5 |
| 23-8 | Component Documentation | 3 |

### ShadcnUI Components to Install

```bash
pnpm dlx shadcn@latest add --all
```

**Priority Components for IDE:**
- `button`, `card`, `dialog`, `dropdown-menu`, `tabs`, `scroll-area`
- `resizable`, `tooltip`, `toast`, `sidebar`, `context-menu`
- `input`, `label`, `separator`, `sonner`, `spinner`

---
