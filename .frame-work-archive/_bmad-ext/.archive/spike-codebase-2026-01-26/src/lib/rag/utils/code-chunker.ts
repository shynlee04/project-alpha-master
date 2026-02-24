/**
 * @fileoverview Code Chunker Utility
 * @module lib/rag/utils/code-chunker
 * @governance EPIC-40 MM-10
 *
 * Splits code blocks into semantic chunks for RAG indexing.
 * Preserves function/class boundaries and maintains context.
 *
 * @story MM-10: Code-Aware Chunking
 * @created 2026-01-10
 */

import type { CodeChunk, CodeChunkType, CodeLanguage, ChunkingResult } from '@/domain/entities/code-chunk';
import { estimateTextTokens } from '@/lib/agent/utils/token-estimator';

// Default chunk size limits
const DEFAULT_MAX_CHUNK_TOKENS = 8000;

/**
 * Language detection from fence info or file extension
 */
export function detectLanguage(info: string): CodeLanguage {
  const normalized = info.toLowerCase().trim();

  const languageMap: Record<string, CodeLanguage> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', python: 'python',
    java: 'java', cpp: 'cpp', cxx: 'cpp', cc: 'cpp',
    cs: 'csharp', csharp: 'csharp',
    go: 'go', golang: 'go',
    rs: 'rust', rust: 'rust',
    php: 'php',
    rb: 'ruby', ruby: 'ruby',
    swift: 'swift',
    kt: 'kotlin', kotlin: 'kotlin',
    sql: 'sql',
    json: 'json',
    yaml: 'yaml', yml: 'yaml',
    md: 'markdown', markdown: 'markdown',
    html: 'html', htm: 'html',
    css: 'css', scss: 'css', less: 'css',
    sh: 'bash', bash: 'bash', shell: 'bash',
  };

  return languageMap[normalized] || 'unknown';
}

/**
 * Detect chunk type from content patterns
 */
export function detectChunkType(content: string, language: CodeLanguage): CodeChunkType {
  const trimmed = content.trim();

  // Check for configuration data
  if (language === 'json' || language === 'yaml') {
    return 'config';
  }

  // Check for class definition
  if (/^(class|interface|type|enum)\s/.test(trimmed)) {
    return 'class';
  }

  // Check for function definition
  if (/^(function|func|def|const\s+\w+\s*=\s*(?:async\s+)?\(?\(|=>\s*{)/.test(trimmed)) {
    return 'function';
  }

  // Check for import/export
  if (/^(import|export|from|require|#include)\s/.test(trimmed)) {
    return 'import';
  }

  // Check for comment block
  if (/^\/\*\*?\s*|^<!--\s*|^#.*$/m.test(trimmed.substring(0, 100))) {
    return 'comment';
  }

  return 'statement';
}

/**
 * Generate hash for chunk content (for deduplication)
 */
function generateHash(content: string, messageId: string, index: number): string {
  const str = `${messageId}-${index}-${content}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `chk_${Math.abs(hash).toString(36)}`;
}

/**
 * Find semantic split points in code
 *
 * Splits at function/class/statement boundaries while preserving context.
 */
export function findSplitPoints(code: string, _language: CodeLanguage): number[] {
  const lines = code.split('\n');
  const splitPoints: number[] = [];
  let currentLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Split before top-level definitions
    if (/^(class|interface|type|enum|function|func|def)\s+\w+/.test(trimmed)) {
      if (currentLine > 0) {
        splitPoints.push(i);
      }
      currentLine = i;
    }

    // Split before import blocks
    if (/^(import|export|from)\s/.test(trimmed)) {
      if (currentLine > 0 && splitPoints[splitPoints.length - 1] !== i) {
        splitPoints.push(i);
      }
    }
  }

  return splitPoints;
}

/**
 * Split code into chunks at semantic boundaries
 */
export function splitCodeAtBoundaries(
  code: string,
  language: CodeLanguage,
  maxTokens: number = DEFAULT_MAX_CHUNK_TOKENS
): string[] {
  const chunks: string[] = [];
  const splitPoints = findSplitPoints(code, language);
  const lines = code.split('\n');

  if (splitPoints.length === 0) {
    // No semantic boundaries found, split by line count
    const estimatedTokens = estimateTextTokens(code);
    if (estimatedTokens <= maxTokens) {
      return [code];
    }

    // Rough split - every 200 lines
    const linesPerChunk = Math.floor((lines.length * maxTokens) / estimatedTokens);
    for (let i = 0; i < lines.length; i += linesPerChunk) {
      chunks.push(lines.slice(i, i + linesPerChunk).join('\n'));
    }
    return chunks;
  }

  // Split at semantic boundaries
  let startIdx = 0;
  for (let i = 0; i <= splitPoints.length; i++) {
    const endIdx = i < splitPoints.length ? splitPoints[i] : lines.length;
    const chunk = lines.slice(startIdx, endIdx).join('\n');

    if (estimateTextTokens(chunk) > maxTokens && startIdx < endIdx - 1) {
      // Chunk too large, subdivide
      const midIdx = Math.floor((startIdx + endIdx) / 2);
      chunks.push(lines.slice(startIdx, midIdx).join('\n'));
      chunks.push(lines.slice(midIdx, endIdx).join('\n'));
    } else {
      chunks.push(chunk);
    }

    startIdx = endIdx;
  }

  return chunks.filter(c => c.trim().length > 0);
}

/**
 * Extract code blocks from markdown text
 */
export function extractCodeBlocks(text: string): Array<{ code: string; language: string; start: number; end: number }> {
  const blocks: Array<{ code: string; language: string; start: number; end: number }> = [];
  const fenceRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match;

  while ((match = fenceRegex.exec(text)) !== null) {
    blocks.push({
      code: match[2],
      language: match[1] || 'unknown',
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return blocks;
}

/**
 * Extract inline code from markdown text
 */
export function extractInlineCode(text: string): string[] {
  const inlineRegex = /`([^`\n]+)`/g;
  const codes: string[] = [];
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    codes.push(match[1]);
  }

  return codes;
}

/**
 * Create code chunk from content
 */
function createCodeChunk(
  content: string,
  messageId: string,
  threadId: string,
  conversationId: string,
  language: CodeLanguage,
  type: CodeChunkType,
  index: number,
  filePath?: string
): CodeChunk {
  const tokenCount = estimateTextTokens(content);
  const hash = generateHash(content, messageId, index);

  return {
    id: `chunk_${Date.now()}_${index}`,
    messageId,
    threadId,
    conversationId,
    content,
    language,
    type,
    filePath,
    tokenCount,
    hash,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Chunk a code block into semantic pieces
 */
export function chunkCodeBlock(
  code: string,
  language: CodeLanguage,
  messageId: string,
  threadId: string,
  conversationId: string,
  options?: {
    maxTokens?: number;
    filePath?: string;
  }
): CodeChunk[] {
  const maxTokens = options?.maxTokens ?? DEFAULT_MAX_CHUNK_TOKENS;
  const codePieces = splitCodeAtBoundaries(code, language, maxTokens);

  return codePieces.map((piece, index) => {
    const type = detectChunkType(piece, language);
    return createCodeChunk(
      piece,
      messageId,
      threadId,
      conversationId,
      language,
      type,
      index,
      options?.filePath
    );
  });
}

/**
 * Chunk a message containing code
 *
 * Main entry point for code-aware chunking.
 */
export function chunkMessage(
  messageContent: string,
  messageId: string,
  threadId: string,
  conversationId: string,
  options?: {
    maxTokens?: number;
    filePath?: string;
  }
): ChunkingResult {
  const codeBlocks = extractCodeBlocks(messageContent);
  const allChunks: CodeChunk[] = [];
  const languages = new Set<CodeLanguage>();
  let totalTokens = 0;

  // Process each code block
  for (const block of codeBlocks) {
    const language = detectLanguage(block.language);
    languages.add(language);

    const chunks = chunkCodeBlock(
      block.code,
      language,
      messageId,
      threadId,
      conversationId,
      options
    );

    allChunks.push(...chunks);
    totalTokens += chunks.reduce((sum, c) => sum + c.tokenCount, 0);
  }

  return {
    chunks: allChunks,
    totalTokens,
    chunkCount: allChunks.length,
    languages: Array.from(languages),
  };
}

/**
 * Get optimal chunk size based on context window usage
 *
 * Returns smaller chunks when context is nearly full.
 */
export function getOptimalChunkSize(
  currentUsage: number,
  maxTokens: number,
  defaultMaxTokens: number = DEFAULT_MAX_CHUNK_TOKENS
): number {
  const availableRatio = 1 - (currentUsage / maxTokens);

  if (availableRatio < 0.1) {
    // Context nearly full - use smallest chunks
    return Math.floor(defaultMaxTokens * 0.25);
  } else if (availableRatio < 0.3) {
    return Math.floor(defaultMaxTokens * 0.5);
  } else if (availableRatio < 0.5) {
    return Math.floor(defaultMaxTokens * 0.75);
  }

  return defaultMaxTokens;
}
