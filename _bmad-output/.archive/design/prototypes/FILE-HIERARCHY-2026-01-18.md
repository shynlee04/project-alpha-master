# Complete File Hierarchy - UX Prototypes

**Generated**: 2026-01-18  
**Location**: `_bmad-output/design/prototypes/`

---

## Full Directory Tree

```
prototypes/
│
├── 📁 desktop/                           # Desktop (1024px+)
│   │
│   ├── 📁 ide/                            # IDE workspace
│   │   ├── 📄 stack-2-tree-editor.html
│   │   ├── 📄 stack-3-tree-editor-preview.html
│   │   ├── 📄 stack-3-tree-editor-terminal.html
│   │   ├── 📄 stack-3-tree-editor-chat.html
│   │   ├── 📄 stack-4-tree-editor-preview-terminal.html
│   │   ├── 📄 stack-4-tree-editor-preview-chat.html
│   │   ├── 📄 stack-4-tree-editor-terminal-chat.html
│   │   └── 📄 stack-5-tree-editor-preview-terminal-chat.html
│   │
│   ├── 📁 notes/                          # Notes workspace
│   │   ├── 📄 stack-2-tree-editor.html
│   │   ├── 📄 stack-3-tree-editor-preview.html
│   │   ├── 📄 stack-3-tree-editor-chat.html
│   │   ├── 📄 stack-4-tree-editor-preview-chat.html
│   │   └── 📄 stack-5-tree-editor-preview-terminal-chat.html
│   │
│   ├── 📁 knowledge/                      # Knowledge workspace
│   │   ├── 📄 stack-2-tree-sources.html
│   │   ├── 📄 stack-3-tree-sources-preview.html
│   │   ├── 📄 stack-3-tree-sources-chat.html
│   │   ├── 📄 stack-4-tree-sources-preview-chat.html
│   │   └── 📄 stack-5-tree-sources-preview-terminal-chat.html
│   │
│   ├── 📁 study/                          # Study workspace
│   │   ├── 📄 stack-2-tree-dashboard.html
│   │   ├── 📄 stack-3-tree-dashboard-quiz.html
│   │   ├── 📄 stack-3-tree-dashboard-flashcards.html
│   │   ├── 📄 stack-4-tree-dashboard-quiz-flashcards.html
│   │   └── 📄 stack-5-tree-dashboard-quiz-flashcards-chat.html
│   │
│   ├── 📁 workspace-mix/                  # Hybrid layouts
│   │   ├── 📄 ide-notes-hybrid.html
│   │   ├── 📄 ide-knowledge-hybrid.html
│   │   └── 📄 notes-knowledge-split.html
│   │
│   ├── 📁 en/                             # English (default)
│   │   ├── 📁 ide/                        # Same structure as desktop/ide
│   │   ├── 📁 notes/                      # Same structure as desktop/notes
│   │   ├── 📁 knowledge/                  # Same structure as desktop/knowledge
│   │   └── 📁 study/                      # Same structure as desktop/study
│   │
│   └── 📁 vi/                             # Vietnamese translations
│       ├── 📁 ide/                        # Mirror of en/ide with Vietnamese
│       ├── 📁 notes/                      # Mirror of en/notes with Vietnamese
│       ├── 📁 knowledge/                  # Mirror of en/knowledge with Vietnamese
│       └── 📁 study/                      # Mirror of en/study with Vietnamese
│
├── 📁 tablet/                           # Tablet (768-1024px)
│   ├── 📁 ide/                            # Optimized stack 2-5 for tablet
│   ├── 📁 notes/                          # Optimized stack 2-5 for tablet
│   ├── 📁 knowledge/                      # Optimized stack 2-5 for tablet
│   └── 📁 study/                          # Optimized stack 2-5 for tablet
│
└── 📁 mobile/                            # Mobile (<768px)
    ├── 📁 ide/                            # 2 interfaces max, tab-based
    ├── 📁 notes/                          # 2 interfaces max, tab-based
    ├── 📁 knowledge/                      # 2 interfaces max, tab-based
    └── 📁 study/                          # 2 interfaces max, tab-based
```

---

## File Count Summary

### Desktop (English)
- **IDE**: 8 files (stack 2-5)
- **Notes**: 5 files (stack 2-5)
- **Knowledge**: 5 files (stack 2-5)
- **Study**: 5 files (stack 2-5)
- **Workspace Mix**: 3 files
- **Total Desktop (En)**: 26 files

### Desktop (Vietnamese)
- **IDE**: 8 files (translated)
- **Notes**: 5 files (translated)
- **Knowledge**: 5 files (translated)
- **Study**: 5 files (translated)
- **Total Desktop (Vi)**: 23 files

### Tablet
- **IDE**: ~8 files (optimized)
- **Notes**: ~5 files (optimized)
- **Knowledge**: ~5 files (optimized)
- **Study**: ~5 files (optimized)
- **Total Tablet**: ~23 files

### Mobile
- **IDE**: 2 files (max)
- **Notes**: 2 files (max)
- **Knowledge**: 2 files (max)
- **Study**: 2 files (max)
- **Total Mobile**: 8 files

### Grand Total
**Total HTML Prototypes**: ~80 files

---

## Panel Combinations

### IDE Workspace (8 variants)
1. `tree-editor` (stack 2)
2. `tree-editor-preview` (stack 3)
3. `tree-editor-terminal` (stack 3)
4. `tree-editor-chat` (stack 3)
5. `tree-editor-preview-terminal` (stack 4)
6. `tree-editor-preview-chat` (stack 4)
7. `tree-editor-terminal-chat` (stack 4)
8. `tree-editor-preview-terminal-chat` (stack 5)

### Notes Workspace (5 variants)
1. `tree-editor` (stack 2)
2. `tree-editor-preview` (stack 3)
3. `tree-editor-chat` (stack 3)
4. `tree-editor-preview-chat` (stack 4)
5. `tree-editor-preview-terminal-chat` (stack 5)

### Knowledge Workspace (5 variants)
1. `tree-sources` (stack 2)
2. `tree-sources-preview` (stack 3)
3. `tree-sources-chat` (stack 3)
4. `tree-sources-preview-chat` (stack 4)
5. `tree-sources-preview-terminal-chat` (stack 5)

### Study Workspace (5 variants)
1. `tree-dashboard` (stack 2)
2. `tree-dashboard-quiz` (stack 3)
3. `tree-dashboard-flashcards` (stack 3)
4. `tree-dashboard-quiz-flashcards` (stack 4)
5. `tree-dashboard-quiz-flashcards-chat` (stack 5)

### Workspace Mix (3 variants)
1. `ide-notes-hybrid`
2. `ide-knowledge-hybrid`
3. `notes-knowledge-split`

---

## Device-Specific Guidelines

### Desktop (1024px+)
- Full panel visibility
- Side-by-side layouts
- Hover states enabled
- Keyboard navigation focus
- Maximum information density

### Tablet (768-1024px)
- Responsive resizing
- Touch-optimized interactions
- Simplified layouts
- Reduced padding
- Optimized spacing

### Mobile (<768px)
- Tab-based navigation
- Single-panel focus
- Stacked layouts
- Minimum 44x44px touch targets
- Progressive disclosure

---

## Naming Conventions

### File Names
```
stack-{count}-{panels}.html
```

- `stack`: Always present
- `{count}`: Number of panels (2-5)
- `{panels}`: Hyphen-separated panel names
- `.html`: File extension

### Panel Naming Rules
- `tree` - Always first if present
- `editor` - Second panel in IDE/Notes
- `preview` - Third panel if present
- `terminal` - Fourth panel if present
- `chat` - Always last if present
- `sources` - Second panel in Knowledge
- `dashboard` - Second panel in Study
- `quiz` - Third panel in Study
- `flashcards` - Fourth panel in Study

---

## Legacy Structure (Do Not Modify)

```
prototypes/
├── agent/           # Legacy agent prototypes
├── hub/             # Legacy hub prototypes
├── ide/             # Legacy IDE prototypes
├── knowledge/       # Legacy knowledge prototypes
├── nav/             # Legacy navigation prototypes
└── notes/           # Legacy notes prototypes
```

**Status**: Preserve as reference, migrate content to new structure when needed.

---

## Quick Reference

| Workspace | Panels Available | Desktop (En) | Desktop (Vi) | Tablet | Mobile |
|-----------|------------------|---------------|---------------|---------|---------|
| IDE       | tree, editor, preview, terminal, chat | 8 files | 8 files | ~8 files | 2 files |
| Notes     | tree, editor, preview, terminal, chat | 5 files | 5 files | ~5 files | 2 files |
| Knowledge | tree, sources, preview, terminal, chat | 5 files | 5 files | ~5 files | 2 files |
| Study     | tree, dashboard, quiz, flashcards, chat | 5 files | 5 files | ~5 files | 2 files |
| Mix       | hybrid combinations | 3 files | - | - | - |

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-01-18
