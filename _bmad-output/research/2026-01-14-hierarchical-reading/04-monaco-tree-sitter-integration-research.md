# Monaco Editor + Tree-sitter Integration Research

**Date**: 2026-01-14
**Sources**: GitHub repositories, StackOverflow discussions

---

## Executive Summary

Monaco Editor can be integrated with **tree-sitter** for:
- AST-based syntax highlighting
- Code navigation and symbol extraction
- Precise code intelligence

However, **Monaco doesn't expose AST directly** - requires custom integration.

---

## Existing Integrations

### 1. monaco-tree-sitter (Menci)

**Repository**: https://github.com/Menci/monaco-tree-sitter

> "This module provides highlighting both for Monaco Editor and without Monaco Editor. For better Webpack code splitting, we don't import monaco-editor module."

Key features:
- Tree-sitter-based highlighting for Monaco
- Webpack code splitting support
- No direct Monaco dependency in bundle

### 2. Monaco-tree-sitter (AdalineL)

**Repository**: https://github.com/AdalineL/monaco-tree-sitter

> "Working Demo of a Monaco Editor integrated with Tree-sitter embedded in an html page."

Features:
- HTML-embedded demo
- Direct Monaco + tree-sitter integration example

---

## Core Challenge: AST Access

From StackOverflow discussion:
> "I'm using monaco editor for TypeScript. Is there a way to get an AST for the current model?"

**Answer**: Monaco doesn't expose AST directly through its public API. Options:

1. **Use Monaco's built-in language services** (`provideDocumentSymbols`)
2. **Run tree-sitter in parallel** with Monaco's model
3. **Use Language Server Protocol** with custom backend

---

## Integration Patterns for Our Stack

### Option 1: Parallel Tree-sitter (Recommended)

```typescript
import * as monaco from 'monaco-editor'
import Parser from 'web-tree-sitter'

// Run tree-sitter alongside Monaco
const parser = await Parser.init()
const language = await Parser.Language.load('tree-sitter-typescript')

const editor = monaco.editor.create(/* ... */)

// When content changes
editor.onDidChangeModelContent(() => {
  const code = editor.getValue()
  const tree = parser.parse(code)
  const rootNode = tree.rootNode

  // Extract symbols
  const symbols = extractSymbols(rootNode)
})
```

### Option 2: Monaco's Document Symbols

```typescript
monaco.languages.ProvideDocumentSymbolsProvider(languageId, {
  provideDocumentSymbols: (model, token) => {
    // Monaco's built-in symbol extraction
    // Returns SymbolInformation[]
  }
})
```

---

## Symbol Extraction with Tree-sitter

From awesome-tree-sitter curated list:
> "Tree-sitter is an incremental parsing system that produces concrete syntax trees suitable for fast syntax highlighting, code navigation..."

### SCM Query Pattern

```scm
;; Extract class declarations
(class_declaration
  name: (type_identifier) @name
  ) @class

;; Extract function declarations
(function_declaration
  name: (identifier) @name
  parameters: (formal_parameters (parameter_list)?)
  ) @function

;; Extract method definitions
(method_definition
  name: (property_identifier) @name
  parameters: (formal_parameters (parameter_list)?)
  ) @method
```

---

## Web-tree-sitter for Browser

**Key finding**: `web-tree-sitter` is the browser-compatible version:

```typescript
import * as awilfrom 'https://esm.sh/tree-sitter@0.20.2'
import TypeScript from 'https://esm.sh/tree-sitter-typescript@0.20.2/wasm'

const parser = new Parser()
const language = await TypeScript.load(parser)
```

This is **production-ready** and used by:
- Aider (repo map generation)
- Factory.ai (context compression)
- Various online IDEs

---

## Takeaways for HARS

| Feature | Implementation |
|---------|----------------|
| **AST Parsing** | Use web-tree-sitter (browser-compatible) |
| **Symbol Extraction** | SCM query patterns for each language |
| **Integration** | Run parallel to Monaco, don't replace its services |
| **Performance** | Incremental parsing (tree-sitter specialty) |

---

## Sources

- monaco-tree-sitter (Menci): https://github.com/Menci/monaco-tree-sitter
- monaco-tree-sitter (AdalineL): https://github.com/AdalineL/monaco-tree-sitter
- awesome-tree-sitter: https://github.com/HerringtonDarkholme/awesome-tree-sitter
- StackOverflow: Monaco editor get access to AST
