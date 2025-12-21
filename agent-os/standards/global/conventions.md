# Development Conventions

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Project Structure

```
project-alpha-master/
├── src/                    # Application source
│   ├── components/         # React components (ide/, ui/, layout/)
│   ├── lib/               # Core logic (filesystem/, webcontainer/, agent/)
│   ├── routes/            # TanStack Router files
│   ├── i18n/              # Translation files (en.json, vi.json)
│   └── types/             # Shared TypeScript types
├── _bmad-output/          # BMAD workflow artifacts
├── agent-os/              # Agent OS configuration
│   ├── product/           # Mission, roadmap, tech-stack
│   └── standards/         # These standards documents
└── tests/                 # Test files
```

---

## Git Workflow

### Commit Message Format

```bash
# Story completion
feat(epic-13): Story 13-1 - Fix Terminal Working Directory

# Bug fix
fix(epic-13): Story 13-2 - Fix Auto-Sync on Project Load

# Documentation
docs(governance): Update sprint-status.yaml with Epic 24-26

# Chore
chore(bmad): Course correction - Add Story 13-6
```

### Branch Strategy

- Epic branches created after retrospective, not per-story
- Branch naming: `epic-N/descriptive-name`
- Main branch protected

---

## Environment Configuration

```env
# .env.local (never commit)
VITE_GEMINI_API_KEY=your-key
VITE_SENTRY_DSN=your-dsn
```

---

## General Practices

- **Consistent Structure**: Follow directory organization exactly
- **Clear Documentation**: Keep AGENTS.md updated
- **Version Control**: Meaningful commits per story
- **Dependency Management**: Use pnpm, document why deps added
- **Code Review**: Use `/code-review` workflow
- **Feature Flags**: Not needed (client-side only)
- **Changelog**: Updated in sprint-status.yaml
