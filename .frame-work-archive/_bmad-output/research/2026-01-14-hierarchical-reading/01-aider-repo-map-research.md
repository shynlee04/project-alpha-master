# Aider Repo Map - Tree-sitter Codebase Understanding

**Source**: https://aider.chat/2023/10/22/repomap.html
**Date**: October 22, 2023
**Research Date**: 2026-01-14

---

## Executive Summary

Aider uses **tree-sitter** to build a repository map that provides GPT with a concise overview of the entire codebase. This map includes the most important classes and functions along with their types and call signatures.

---

## The Problem: Code Context in LLMs

GPT-4 excels at "self-contained" coding tasks but struggles with complex changes in larger codebases because:

1. **Finding** the code that needs to be changed
2. **Understanding** how that code relates to the rest of the codebase
3. **Making** the correct code change

Sending the entire codebase exceeds the context window. Hand-picking files is manual and wasteful (sending full implementations when only signatures are needed).

---

## The Solution: Repository Map

Aider sends GPT a **concise map of your whole git repository** containing:

- List of files in the repo
- Key symbols defined in each file
- Critical lines of code for each definition (signatures only, not bodies)

### Sample Repo Map Output

```
aider/coders/base_coder.py:
⋮...
│class Coder:
│    abs_fnames = None
⋮...
│    @classmethod
│    def create(
│        self,
│        main_model,
│        edit_format,
│        io,
│        skip_model_availabily_check=False,
│        **kwargs,
⋮...
│    def abs_root_path(self, path):
⋮...
│    def run(self, with_message=None):
⋮...

aider/commands.py:
⋮...
│class Commands:
│    voice = None
│
⋮...
│    def get_commands(self):
│    def get_command_completions(self, cmd_name, partial):
│    def run(self, inp):
⋮...
```

---

## Key Benefits

1. **GPT can see classes, methods, and function signatures** from everywhere in the repo - may be enough context for many tasks
2. **GPT can use the map to figure out which files** it needs to examine in more detail
3. **Automatic** - no manual file selection required

---

## Optimization: Graph Ranking

For large repositories, even the repo map might be too large. Aider solves this by:

1. Building a **dependency graph** where each source file is a node
2. Creating edges between files that have dependencies
3. Using **graph ranking algorithm** to select the most important files
4. Respecting user's **token budget** (via `--map-tokens`, defaults to 1k tokens)

Only the most important identifiers (most often referenced by other code) are included.

---

## Tree-sitter Integration

Under the hood, Aider uses **py-tree-sitter-languages** for AST parsing:

- Parses source code into Abstract Syntax Tree (AST)
- Identifies function, class, variable, type definitions
- Identifies references/uses of these definitions
- Determines importance by analyzing reference frequency

### Switching from ctags to tree-sitter provides:

- Richer map showing full function call signatures
- Multi-language support via pip-installable packages
- No external tool dependencies (universal-ctags)
- Foundation for future "auto-find code to change" features

---

## Relevant to Our Stack

| Our Tech | Aider's Approach | Application |
|-----------|------------------|--------------|
| **Monaco Editor** | AST for syntax highlighting | Can use tree-sitter for code navigation |
| **TypeScript/TSX** | Full support via tree-sitter-typescript | Extract symbols, signatures |
| **Markdown** | Supported | Parse frontmatter, sections |
| **YAML/JSON** | Supported | Parse config files |
| **BlockNote** | Could benefit | Use AST for block structure |

---

## Takeaways for HARS Implementation

1. **Signature-only extraction** - Don't include function bodies in repo map
2. **Graph ranking** - Prioritize files by centrality (how much they're referenced)
3. **Token budgeting** - Design for configurable token limits
4. **Language-agnostic queries** - Use tree-sitter's SCM query format

---

## Sources

- Aider Repo Map Documentation: https://aider.chat/docs/repomap.html
- Tree-sitter GitHub: https://github.com/tree-sitter/tree-sitter
- py-tree-sitter-languages: https://github.com/tree-sitter/py-tree-sitter-languages
