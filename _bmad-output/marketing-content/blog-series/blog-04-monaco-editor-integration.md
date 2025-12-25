---
title: "Building Monaco Editor Integration trong Via-gent"
date: 2025-12-24
tags: ["Monaco Editor", "React", "TypeScript", "Code Editor", "VS Code", "Browser IDE"]
author: "Via-gent Team"
series: "Hành Trình Xây Dựng Via-gent"
series_number: 4
---

# Building Monaco Editor Integration

**English Abstract**: This article explores how Via-gent integrates Monaco Editor (VS Code's editor) into a React application. It covers Monaco Editor setup, tab management system, syntax highlighting, and performance optimization strategies for a browser-based IDE.

---

## Giới thiệu Monaco Editor

Monaco Editor là code editor được sử dụng trong VS Code. Nó cung cấp:
- Syntax highlighting cho 100+ languages
- IntelliSense (code completion)
- Error checking và diagnostics
- Multi-cursor editing
- Keyboard shortcuts customizable
- Themes và color schemes

### Tại sao chọn Monaco Editor?

```
Alternatives:
- CodeMirror: Lightweight nhưng ít features
- Ace Editor: Old architecture, limited updates
- Prism.js: Chỉ syntax highlighting, không phải full editor

Monaco Editor:
- Full-featured editor như VS Code
- Active development bởi Microsoft
- Rich API và extensibility
- Excellent performance
```

---

## Monaco Editor Setup trong React

### Installation

```bash
pnpm add @monaco-editor/react monaco-editor
```

### Basic Setup

```typescript
// src/components/ide/MonacoEditor/MonacoEditor.tsx
import Editor from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';

export interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  path?: string;
  readOnly?: boolean;
}

export function MonacoEditor({
  language,
  value,
  onChange,
  path,
  readOnly = false,
}: MonacoEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      fontFamily: "'JetBrains Mono', monospace",
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
    });
  };

  return (
    <div className="monaco-editor-wrapper">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        path={path}
        options={{
          readOnly,
          theme: 'vs-dark',
        }}
        loading={<div className="editor-loading">Loading editor...</div>}
      />
    </div>
  );
}
```

---

## Tab Management System

### Tab State Management

```typescript
// src/components/ide/MonacoEditor/EditorTabBar.tsx
export interface EditorTab {
  id: string;
  path: string;
  name: string;
  language: string;
  content: string;
  isDirty: boolean;
  isActive: boolean;
}

export function EditorTabBar() {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = (path: string, content: string) => {
    const language = getLanguageFromPath(path);
    const name = path.split('/').pop() || path;
    
    setTabs(prev => {
      const existingTab = prev.find(tab => tab.path === path);
      
      if (existingTab) {
        return prev.map(tab => 
          tab.id === existingTab.id 
            ? { ...tab, isActive: true }
            : { ...tab, isActive: false }
        );
      }
      
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        path,
        name,
        language,
        content,
        isDirty: false,
        isActive: true,
      };
      
      return [
        ...prev.map(tab => ({ ...tab, isActive: false })),
        newTab,
      ];
    });
  };

  const closeTab = (tabId: string) => {
    setTabs(prev => {
      const closingTab = prev.find(tab => tab.id === tabId);
      
      if (closingTab?.isDirty) {
        // Show unsaved changes warning
        if (!confirm('You have unsaved changes. Close anyway?')) {
          return prev;
        }
      }
      
      const newTabs = prev.filter(tab => tab.id !== tabId);
      
      // If closing active tab, activate another
      if (closingTab?.isActive && newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        return newTabs.map(tab => 
          tab.id === lastTab.id ? { ...tab, isActive: true } : tab
        );
      }
      
      return newTabs;
    });
  };

  const activeTab = tabs.find(tab => tab.isActive);

  return (
    <div className="editor-tab-bar">
      <div className="tabs">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${tab.isActive ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="tab-name">{tab.name}</span>
            {tab.isDirty && <span className="dirty-indicator">●</span>}
            <button
              className="close-tab"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      {activeTab && (
        <MonacoEditor
          key={activeTab.id}
          language={activeTab.language}
          value={activeTab.content}
          onChange={(value) => {
            setTabs(prev => prev.map(tab => 
              tab.id === activeTab.id 
                ? { ...tab, content: value, isDirty: true }
                : tab
            ));
          }}
          path={activeTab.path}
        />
      )}
    </div>
  );
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'cpp': 'cpp',
    'c': 'c',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'yaml': 'yaml',
    'yml': 'yaml',
  };
  
  return languageMap[ext || ''] || 'plaintext';
}
```

---

## Syntax Highlighting và Language Support

Monaco Editor hỗ trợ syntax highlighting cho 100+ languages out-of-the-box. Tuy nhiên, chúng ta có thể customize:

### Custom Language Configuration

```typescript
// src/lib/editor/language-utils.ts
import * as monaco from 'monaco-editor';

export function configureMonacoLanguages() {
  // Configure TypeScript
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types'],
  });

  // Configure custom theme
  monaco.editor.defineTheme('via-gent-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editor.lineHighlightBackground': '#2A2D2E',
      'editorCursor.foreground': '#AEAFAD',
      'editor.selectionBackground': '#264F78',
      'editor.inactiveSelectionBackground': '#3A3D41',
    },
  });

  // Register custom snippets
  monaco.languages.registerCompletionItemProvider('typescript', {
    provideCompletionItems: (model, position) => {
      const suggestions = [
        {
          label: 'react-component',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'import React from \'react\';',
            '',
            'interface ${1:Props} {',
            '  ${2}',
            '}',
            '',
            'export const ${3:ComponentName}: React.FC<Props> = ({',
            '  ${4}',
            '}) => {',
            '  return (',
            '    <div>',
            '      ${5}',
            '    </div>',
            '  );',
            '};',
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Create a React component with TypeScript',
        },
      ];
      
      return { suggestions };
    },
  });
}
```

---

## Performance Optimization

### Lazy Loading Languages

Monaco Editor có thể nặng (~2MB). Lazy loading giúp giảm initial bundle size:

```typescript
// src/components/ide/MonacoEditor/index.tsx
import { lazy, Suspense } from 'react';

const Editor = lazy(() => import('@monaco-editor/react'));

export function MonacoEditorWrapper(props: MonacoEditorProps) {
  return (
    <Suspense fallback={<div className="editor-loading">Loading editor...</div>}>
      <Editor {...props} />
    </Suspense>
  );
}
```

### Debounce Content Changes

Debounce onChange events để tránh quá nhiều re-renders:

```typescript
import { useDebouncedCallback } from 'use-debounce';

export function MonacoEditor({ value, onChange, ...props }: MonacoEditorProps) {
  const debouncedOnChange = useDebouncedCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    300, // 300ms debounce
    { maxWait: 1000 }
  );

  return (
    <Editor
      value={value}
      onChange={debouncedOnChange}
      {...props}
    />
  );
}
```

### Virtual Scrolling

Monaco Editor có built-in virtual scrolling, nhưng chúng ta có thể optimize thêm:

```typescript
const handleEditorDidMount = (editor: any) => {
  editor.updateOptions({
    // Enable virtual scrolling
    smoothScrolling: true,
    cursorSmoothCaretAnimation: 'on',
    
    // Limit viewport rendering
    largeFileOptimizations: true,
    
    // Disable heavy features for large files
    renderLineHighlight: 'line',
    renderWhitespace: 'selection',
  });
};
```

---

## Key Takeaways

1. **Monaco Editor** là full-featured editor như VS Code
2. **Tab management** cho phép work với multiple files
3. **Syntax highlighting** được hỗ trợ cho 100+ languages
4. **Performance optimization** qua lazy loading và debouncing
5. **Customization** với themes, snippets, và language configs

---

## Suggested Social Media Posts

### LinkedIn
```
Monaco Editor Integration trong Via-gent 💻

VS Code's editor, trong browser!

Features:
✅ Syntax highlighting cho 100+ languages
✅ Tab management system
✅ IntelliSense và code completion
✅ Custom themes và snippets
✅ Performance optimization

Code example:
- Lazy loading languages
- Debounce content changes
- Virtual scrolling

Đọc full article tại: [link]

#ViaGent #MonacoEditor #React #TypeScript #BrowserIDE
```

### Facebook
```
Via-gent sử dụng Monaco Editor - cùng editor với VS Code! 🚀

Tính năng:
🎨 Syntax highlighting
📑 Tab management
💡 IntelliSense
⚡ Performance optimization

Tất cả đều chạy trong browser!

Đọc bài 4 trong series "Hành trình xây dựng Via-gent" tại: [link]

#ViaGent #MonacoEditor #DeveloperTools #BrowserIDE
```

### Twitter/X
```
Via-gent: Monaco Editor Integration 💻

VS Code's editor, browser-based:
- 100+ languages supported
- Tab management
- IntelliSense
- Custom themes
- Performance optimized

Read the deep dive: [link]

#ViaGent #MonacoEditor #React #TypeScript
```

---

## Resources

- **Monaco Editor Docs**: [microsoft.github.io/monaco-editor](https://microsoft.github.io/monaco-editor)
- **@monaco-editor/react**: [github.com/suren-atoyan/monaco-react](https://github.com/suren-atoyan/monaco-react)
- **GitHub**: [github.com/yourusername/via-gent](https://github.com/yourusername/via-gent)

---

*Đây là bài thứ tư trong series "Hành Trình Xây Dựng Via-gent". Hãy theo dõi để không bỏ lỡ các bài tiếp theo!*