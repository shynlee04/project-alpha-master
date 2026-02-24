/**
 * Dynamic Import Utilities for Large Dependencies
 *
 * This module provides lazy loading for heavy client-side dependencies
 * to reduce initial bundle size and improve deployment success rates.
 */

import * as React from 'react';

// Monaco Editor (lazy load)
export const loadMonacoEditor = async () => {
  const { default: Editor } = await import('@monaco-editor/react');
  return Editor;
};

// XTerm Terminal (lazy load)
export const loadXTerm = async () => {
  const { Terminal } = await import('@xterm/xterm');
  const { FitAddon } = await import('@xterm/addon-fit');
  return { Terminal, FitAddon };
};

// WebContainer (lazy load)
export const loadWebContainer = async () => {
  const { WebContainer } = await import('@webcontainer/api');
  return WebContainer;
};

// AI Transformers (lazy load)
export const loadTransformers = async () => {
  const transformers = await import('@xenova/transformers');
  return transformers;
};

// PDF.js (lazy load)
// TODO: Uncomment after installing pdfjs-dist package
// @see https://www.npmjs.com/package/pdfjs-dist
// export const loadPDFJS = async () => {
//   const pdfjs = await import('pdfjs-dist');
//   return pdfjs;
// };

// BlockNote Editor (lazy load)
export const loadBlockNote = async () => {
  const { BlockNoteEditor } = await import('@blocknote/core');
  const { BlockNoteView } = await import('@blocknote/mantine');
  return { BlockNoteEditor, BlockNoteView };
};

// React Flow (lazy load)
export const loadReactFlow = async () => {
  const ReactFlow = await import('@xyflow/react');
  return ReactFlow;
};

// Mermaid (lazy load)
export const loadMermaid = async () => {
  const mermaid = await import('mermaid');
  return mermaid;
};

/**
 * Client-side only guard
 * Use this to prevent SSR issues with client-only dependencies
 */
export const isClient = typeof window !== 'undefined';

/**
 * Lazy component wrapper
 * Wraps heavy components in React.lazy for code splitting
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  return React.lazy(importFn);
};

/**
 * Feature detection for WebContainer support
 */
export const supportsWebContainer = () => {
  return isClient && typeof SharedArrayBuffer !== 'undefined';
};

/**
 * Feature detection for File System Access API
 */
export const supportsFileSystemAccess = () => {
  return isClient && 'showDirectoryPicker' in window;
};