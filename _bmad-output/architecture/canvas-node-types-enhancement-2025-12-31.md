---
date: 2025-12-31
time: 02:15:00
phase: Implementation
team: Team-A
agent_mode: bmad-bmm-architect
---

# Canvas Node Types Enhancement Architecture for The Brain

## Executive Summary

This architecture specification defines the enhanced node types and functionality for the knowledge canvas in The Brain feature (EPIC-26). The enhancement extends the existing `SourceNode` and `ConceptNode` with new specialized nodes for study artifacts, AI insights, and learning paths. The implementation leverages React Flow for canvas rendering, Orama WASM for vector search integration, and follows the 8-bit gaming aesthetic established in the design system.

**Confidence Score: 85%**

---

## 1. Current State Analysis

### 1.1 Existing Node Types

| Node Type | Purpose | Theme | Features |
|-----------|---------|-------|----------|
| `SourceNode` | Source content (PDF, URL, markdown) | Blue (#3b82f6) | Type icons, resizable, excerpts |
| `ConceptNode` | Knowledge concepts | Purple (#a855f7) | Inline editing, description |

### 1.2 Limitations Identified

- No support for study artifacts (flashcards, quizzes)
- No AI-generated insight visualization
- No learning path visualization
- Limited node interaction patterns
- No RAG integration for node recommendations
- No real-time collaboration indicators

---

## 2. Enhanced Node Architecture

### 2.1 New Node Type Definitions

```typescript
// src/components/canvas/nodes/nodeTypes.ts (Enhanced)

import { NodeTypes } from '@xyflow/react';
import { SourceNode } from './SourceNode';
import { ConceptNode } from './ConceptNode';
import { FlashcardNode } from './FlashcardNode';
import { QuizNode } from './QuizNode';
import { AIInsightNode } from './AIInsightNode';
import { LearningPathNode } from './LearningPathNode';
import { ConnectionNode } from './ConnectionNode';

/**
 * Extended node types map for The Brain canvas
 */
export const nodeTypes: NodeTypes = {
  source: SourceNode as never,
  concept: ConceptNode as never,
  flashcard: FlashcardNode as never,
  quiz: QuizNode as never,
  aiInsight: AIInsightNode as never,
  learningPath: LearningPathNode as never,
  connection: ConnectionNode as never,
};

/**
 * All available canvas node types
 */
export type CanvasNodeType = 
  | 'source' 
  | 'concept' 
  | 'flashcard' 
  | 'quiz' 
  | 'aiInsight' 
  | 'learningPath'
  | 'connection';

/**
 * Base interface for all canvas node data
 */
export interface BaseNodeData {
  nodeType: CanvasNodeType;
  id: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Flashcard node data structure
 */
export interface FlashcardNodeData extends BaseNodeData {
  nodeType: 'flashcard';
  front: string;
  back: string;
  tags: string[];
  masteryLevel: number; // 0-100
  nextReviewDate?: string;
  easeFactor?: number; // SM-2 algorithm
  interval?: number; // Days until next review
}

/**
 * Quiz node data structure
 */
export interface QuizNodeData extends BaseNodeData {
  nodeType: 'quiz';
  question: string;
  options: QuizOption[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface QuizOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

/**
 * AI Insight node data structure
 */
export interface AIInsightNodeData extends BaseNodeData {
  nodeType: 'aiInsight';
  title: string;
  summary: string;
  confidence: number; // 0-1
  sources: string[]; // Node IDs
  generatedAt: string;
  modelUsed: string;
  relevanceScore?: number;
}

/**
 * Learning Path node data structure
 */
export interface LearningPathNodeData extends BaseNodeData {
  nodeType: 'learningPath';
  title: string;
  description: string;
  steps: LearningStep[];
  progress: number; // 0-100
  estimatedTime: number; // Minutes
  prerequisites: string[]; // Node IDs
}

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'video' | 'quiz' | 'practice';
  duration: number; // Minutes
  completed: boolean;
  resources: string[];
}
```

### 2.2 Node Type Categorization

```
Canvas Nodes
├── Content Nodes
│   ├── SourceNode (existing)
│   └── ConceptNode (existing)
├── Study Artifact Nodes (NEW)
│   ├── FlashcardNode
│   ├── QuizNode
│   └── AIInsightNode (hybrid)
└── Structure Nodes (NEW)
    ├── LearningPathNode
    └── ConnectionNode (enhanced)
```

---

## 3. FlashcardNode Implementation

### 3.1 Component Architecture

```typescript
// src/components/canvas/nodes/FlashcardNode.tsx

import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { FlipHorizontal, RotateCcw, Check, X } from 'lucide-react';
import { FlashcardNodeData } from './nodeTypes';

interface FlashcardNodeProps extends NodeProps {
  data: FlashcardNodeData;
  onFlip?: (id: string) => void;
  onMarkCorrect?: (id: string) => void;
  onMarkIncorrect?: (id: string) => void;
  onEdit?: (id: string, updates: Partial<FlashcardNodeData>) => void;
}

const FlashcardNodeComponent = ({
  id,
  data,
  selected,
  onFlip,
  onMarkCorrect,
  onMarkIncorrect,
  onEdit,
}: FlashcardNodeProps) => {
  const { front, back, masteryLevel, tags } = data;
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    onFlip?.(id);
  }, [id, onFlip]);

  // Determine color based on mastery level
  const getMasteryColor = (level: number): string => {
    if (level >= 80) return '#22c55e'; // Green - mastery
    if (level >= 50) return '#eab308'; // Yellow - learning
    return '#ef4444'; // Red - new
  };

  const masteryColor = getMasteryColor(masteryLevel);

  return (
    <div
      className={`
        w-[280px] min-h-[180px] bg-gray-900 border-2 rounded-lg overflow-hidden
        transition-all duration-200
        ${selected ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-gray-700'}
        hover:border-gray-600
      `}
    >
      {/* Mastery indicator bar */}
      <div className="h-1 w-full bg-gray-800">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${masteryLevel}%`,
            backgroundColor: masteryColor,
          }}
        />
      </div>

      {/* Header with tags */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-medium text-green-400 uppercase tracking-wider">
          Flashcard
        </span>
        <div className="flex gap-1">
          {tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs bg-gray-800 text-gray-300 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        <div
          className="min-h-[80px] flex items-center justify-center text-center cursor-pointer"
          onClick={handleFlip}
        >
          <p className="text-sm text-gray-200">
            {isFlipped ? back : front}
          </p>
        </div>

        {/* Flip indicator */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
          <FlipHorizontal className="w-4 h-4" />
          <span>Click to flip</span>
        </div>

        {/* Review actions (visible when flipped) */}
        {isFlipped && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => onMarkCorrect?.(id)}
              className="p-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
              aria-label="Mark correct"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => onMarkIncorrect?.(id)}
              className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              aria-label="Mark incorrect"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleFlip}
              className="p-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
              aria-label="Flip back"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-gray-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-gray-900"
      />

      {/* Selection resizer */}
      {selected && (
        <NodeResizer minWidth={200} minHeight={150} />
      )}
    </div>
  );
};

export const FlashcardNode = memo(FlashcardNodeComponent);
```

### 3.2 SM-2 Spaced Repetition Integration

```typescript
// src/lib/learning/sm2-algorithm.ts

/**
 * SM-2 Spaced Repetition Algorithm implementation
 * Based on SuperMemo 2 algorithm by Piotr Wozniak
 */

export interface SM2Data {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export const calculateNextReview = (
  quality: number, // 0-5 quality of response
  previous: SM2Data
): SM2Data => {
  let { easeFactor, interval, repetitions } = previous;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor); // Minimum ease factor

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
  };
};

export const calculateMasteryLevel = (sm2Data: SM2Data): number => {
  // Convert SM-2 metrics to a 0-100 mastery score
  const repetitionScore = Math.min(sm2Data.repetitions * 10, 50);
  const intervalScore = Math.min(Math.log2(sm2Data.interval + 1) * 10, 50);
  return Math.min(repetitionScore + intervalScore, 100);
};
```

---

## 4. QuizNode Implementation

### 4.1 Component Architecture

```typescript
// src/components/canvas/nodes/QuizNode.tsx

import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { QuizNodeData, QuizOption } from './nodeTypes';

interface QuizNodeProps extends NodeProps {
  data: QuizNodeData;
  onAnswer?: (id: string, selectedOption: number, isCorrect: boolean) => void;
  onRevealAnswer?: (id: string) => void;
}

const QuizNodeComponent = ({
  id,
  data,
  selected,
  onAnswer,
  onRevealAnswer,
}: QuizNodeProps) => {
  const { question, options, correctAnswer, explanation, difficulty } = data;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleOptionSelect = useCallback(
    (optionId: number) => {
      if (isAnswered) return;
      setSelectedOption(optionId);
      setIsAnswered(true);
      onAnswer?.(id, optionId, optionId === correctAnswer);
    },
    [id, correctAnswer, isAnswered, onAnswer]
  );

  const handleReveal = useCallback(() => {
    setIsAnswered(true);
    setSelectedOption(correctAnswer);
    onRevealAnswer?.(id);
  }, [id, correctAnswer, onRevealAnswer]);

  // Difficulty color mapping
  const difficultyColors = {
    easy: { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', text: '#22c55e' },
    medium: { bg: 'rgba(234, 179, 8, 0.1)', border: '#eab308', text: '#eab308' },
    hard: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' },
  };

  const colors = difficultyColors[difficulty];

  return (
    <div
      className={`
        w-[300px] bg-gray-900 border-2 rounded-lg overflow-hidden
        transition-all duration-200
        ${selected ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-gray-700'}
        hover:border-gray-600
      `}
    >
      {/* Header with difficulty */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-gray-700"
        style={{ backgroundColor: colors.bg }}
      >
        <span
          className="text-xs font-medium uppercase tracking-wider flex items-center gap-1"
          style={{ color: colors.text }}
        >
          <HelpCircle className="w-3 h-3" />
          Quiz
        </span>
        <span
          className="text-xs font-medium uppercase"
          style={{ color: colors.text }}
        >
          {difficulty}
        </span>
      </div>

      {/* Question */}
      <div className="px-4 py-3 border-b border-gray-800">
        <h4 className="text-sm font-medium text-gray-200">{question}</h4>
      </div>

      {/* Options */}
      <div className="p-3 space-y-2">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === correctAnswer;
          
          let optionClass = 'bg-gray-800 border-gray-700 hover:bg-gray-750';
          if (isAnswered) {
            if (isCorrect) {
              optionClass = 'bg-green-900/30 border-green-500';
            } else if (isSelected && !isCorrect) {
              optionClass = 'bg-red-900/30 border-red-500';
            }
          } else if (isSelected) {
            optionClass = 'bg-blue-900/30 border-blue-500';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={isAnswered}
              className={`
                w-full px-3 py-2 text-left text-sm rounded border transition-all
                ${optionClass}
                ${!isAnswered && 'cursor-pointer hover:border-gray-500'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-300">{option.text}</span>
                {isAnswered && isCorrect && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after answering) */}
      {isAnswered && explanation && (
        <div className="px-4 py-3 border-t border-gray-800 bg-gray-800/50">
          <p className="text-xs text-gray-400">{explanation}</p>
        </div>
      )}

      {/* Actions */}
      {!isAnswered && (
        <div className="px-4 py-2 border-t border-gray-800">
          <button
            onClick={handleReveal}
            className="w-full py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Reveal Answer
          </button>
        </div>
      )}

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-yellow-500 !w-3 !h-3 !border-2 !border-gray-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-yellow-500 !w-3 !h-3 !border-2 !border-gray-900"
      />

      {/* Selection resizer */}
      {selected && (
        <NodeResizer minWidth={250} minHeight={200} />
      )}
    </div>
  );
};

export const QuizNode = memo(QuizNodeComponent);
```

---

## 5. AIInsightNode Implementation

### 5.1 Component Architecture

```typescript
// src/components/canvas/nodes/AIInsightNode.tsx

import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { Sparkles, Brain, TrendingUp } from 'lucide-react';
import { AIInsightNodeData } from './nodeTypes';

interface AIInsightNodeProps extends NodeProps {
  data: AIInsightNodeData;
  onRegenerate?: (id: string) => void;
  onExpand?: (id: string) => void;
}

const AIInsightNodeComponent = ({
  id,
  data,
  selected,
  onRegenerate,
  onExpand,
}: AIInsightNodeProps) => {
  const { title, summary, confidence, sources, modelUsed } = data;

  // Confidence color gradient
  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return '#22c55e'; // High confidence - green
    if (conf >= 0.6) return '#eab308'; // Medium - yellow
    return '#ef4444'; // Low - red
  };

  const confidenceColor = getConfidenceColor(confidence);

  return (
    <div
      className={`
        w-[320px] bg-gradient-to-br from-gray-900 to-gray-800 
        border-2 rounded-lg overflow-hidden
        transition-all duration-200
        ${selected ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700'}
        hover:border-gray-600
      `}
    >
      {/* Header with AI indicator */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 bg-purple-900/20">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
          AI Insight
        </span>
        <span className="ml-auto text-xs text-gray-500">{modelUsed}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          {title}
        </h4>

        {/* Summary */}
        <p className="mt-2 text-xs text-gray-400 leading-relaxed">
          {summary}
        </p>

        {/* Confidence meter */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Confidence</span>
            <span style={{ color: confidenceColor }}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${confidence * 100}%`,
                backgroundColor: confidenceColor,
              }}
            />
          </div>
        </div>

        {/* Source connections */}
        {sources.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">
              Based on {sources.length} sources
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-700">
        <button
          onClick={() => onExpand?.(id)}
          className="flex-1 py-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          Expand
        </button>
        <button
          onClick={() => onRegenerate?.(id)}
          className="flex-1 py-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          Regenerate
        </button>
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-gray-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-gray-900"
      />

      {/* Selection resizer */}
      {selected && (
        <NodeResizer minWidth={280} minHeight={180} />
      )}
    </div>
  );
};

export const AIInsightNode = memo(AIInsightNodeComponent);
```

---

## 6. Node Type Registry

### 6.1 Factory Pattern

```typescript
// src/components/canvas/nodes/nodeFactory.ts

import { Node, NodeTypes } from '@xyflow/react';
import {
  CanvasNodeType,
  BaseNodeData,
  FlashcardNodeData,
  QuizNodeData,
  AIInsightNodeData,
  LearningPathNodeData,
} from './nodeTypes';

/**
 * Node creation factory
 */
export const createNode = (
  type: CanvasNodeType,
  id: string,
  position: { x: number; y: number },
  data?: Partial<BaseNodeData>
): Node => {
  const baseData = {
    id,
    nodeType: type,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  };

  switch (type) {
    case 'flashcard':
      return {
        id,
        type: 'flashcard',
        position,
        data: {
          ...baseData,
          front: 'Front of card',
          back: 'Back of card',
          tags: [],
          masteryLevel: 0,
        } as FlashcardNodeData,
      };

    case 'quiz':
      return {
        id,
        type: 'quiz',
        position,
        data: {
          ...baseData,
          question: 'Your question here',
          options: [
            { id: 1, text: 'Option A', isCorrect: true },
            { id: 2, text: 'Option B', isCorrect: false },
            { id: 3, text: 'Option C', isCorrect: false },
            { id: 4, text: 'Option D', isCorrect: false },
          ],
          correctAnswer: 1,
          difficulty: 'medium',
          topic: 'General',
        } as QuizNodeData,
      };

    case 'aiInsight':
      return {
        id,
        type: 'aiInsight',
        position,
        data: {
          ...baseData,
          title: 'AI Generated Insight',
          summary: 'Insight summary will appear here...',
          confidence: 0.85,
          sources: [],
          modelUsed: 'gemini-2.5',
        } as AIInsightNodeData,
      };

    default:
      throw new Error(`Unknown node type: ${type}`);
  }
};

/**
 * Validate node data structure
 */
export const validateNodeData = (
  type: CanvasNodeType,
  data: unknown
): data is BaseNodeData => {
  // Type guards for each node type
  switch (type) {
    case 'flashcard':
      return 'front' in (data as FlashcardNodeData) && 'back' in (data as FlashcardNodeData);
    case 'quiz':
      return 'question' in (data as QuizNodeData) && 'options' in (data as QuizNodeData);
    case 'aiInsight':
      return 'title' in (data as AIInsightNodeData) && 'summary' in (data as AIInsightNodeData);
    default:
      return true;
  }
};
```

---

## 7. Integration Points

### 7.1 RAG Integration

```typescript
// src/components/canvas/hooks/useCanvasRAG.ts

import { useCallback } from 'react';
import { useStore } from '@xyflow/react';
import { createNode } from '../nodes/nodeFactory';
import { CanvasNodeType } from '../nodes/nodeTypes';

/**
 * Hook for RAG-powered node operations
 */
export const useCanvasRAG = () => {
  const { addNodes, getNodes } = useStore((state) => state);

  /**
   * Generate AI insights for selected nodes
   */
  const generateInsights = useCallback(async (nodeIds: string[]) => {
    const nodes = getNodes().filter((n) => nodeIds.includes(n.id));
    
    // Extract content from nodes for RAG query
    const content = nodes
      .map((n) => {
        const data = n.data as { title?: string; description?: string; summary?: string };
        return `${data.title || ''} ${data.description || data.summary || ''}`;
      })
      .join('\n\n');

    // TODO: Call RAG pipeline with content
    // This would use the Orama WASM vector store and Gemini 2.5
    const response = await fetch('/api/rag/generate-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, context: nodes.length }),
    });

    const insights = await response.json();

    // Create AI insight nodes for each insight
    insights.forEach((insight: { title: string; summary: string; confidence: number }) => {
      const node = createNode(
        'aiInsight',
        `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        { x: Math.random() * 500, y: Math.random() * 500 },
        insight
      );
      addNodes([node]);
    });

    return insights;
  }, [addNodes, getNodes]);

  /**
   * Find related nodes using vector search
   */
  const findRelatedNodes = useCallback(async (nodeId: string) => {
    const node = getNodes().find((n) => n.id === nodeId);
    if (!node) return [];

    const data = node.data as { title?: string; description?: string };
    const query = `${data.title || ''} ${data.description || ''}`;

    // TODO: Query Orama WASM vector store
    const response = await fetch('/api/rag/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 5 }),
    });

    const results = await response.json();
    return results;
  }, [getNodes]);

  return {
    generateInsights,
    findRelatedNodes,
  };
};
```

### 7.2 Canvas Store Integration

```typescript
// src/lib/canvas/canvas-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';
import { CanvasNodeType, FlashcardNodeData, QuizNodeData } from '@/components/canvas/nodes/nodeTypes';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  
  // Node operations
  addNode: (type: CanvasNodeType, position: { x: number; y: number }) => void;
  updateNodeData: <T extends BaseNodeData>(id: string, data: Partial<T>) => void;
  deleteNode: (id: string) => void;
  
  // Study operations
  markFlashcardCorrect: (id: string) => void;
  markFlashcardIncorrect: (id: string) => void;
  answerQuiz: (id: string, selectedOption: number) => void;
  
  // Batch operations
  importNodes: (nodes: Node[]) => void;
  exportNodes: () => Node[];
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],

      addNode: (type, position) => {
        const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const node = createNode(type, id, position);
        set((state) => ({
          nodes: [...state.nodes, node],
        }));
      },

      updateNodeData: (id, data) => {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id
              ? { ...n, data: { ...n.data, ...data }, updatedAt: new Date().toISOString() }
              : n
          ),
        }));
      },

      deleteNode: (id) => {
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
        }));
      },

      markFlashcardCorrect: (id) => {
        // TODO: Update SM-2 data and recalculate mastery
        const node = get().nodes.find((n) => n.id === id);
        if (!node) return;

        const data = node.data as FlashcardNodeData;
        const newSm2Data = calculateNextReview(5, {
          easeFactor: data.easeFactor || 2.5,
          interval: data.interval || 0,
          repetitions: 0,
        });

        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    ...newSm2Data,
                    masteryLevel: calculateMasteryLevel(newSm2Data),
                    nextReviewDate: new Date(Date.now() + newSm2Data.interval * 86400000).toISOString(),
                  },
                }
              : n
          ),
        }));
      },

      answerQuiz: (id, selectedOption) => {
        // Track quiz performance
        const node = get().nodes.find((n) => n.id === id);
        if (!node) return;

        const data = node.data as QuizNodeData;
        const isCorrect = selectedOption === data.correctAnswer;

        // TODO: Update learning analytics

        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    answered: true,
                    selectedAnswer: selectedOption,
                    isCorrect,
                  },
                }
              : n
          ),
        }));
      },

      importNodes: (nodes) => {
        set({ nodes: [...get().nodes, ...nodes] });
      },

      exportNodes: () => {
        return get().nodes;
      },
    }),
    {
      name: 'canvas-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
);
```

---

## 8. Styling System

### 8.1 Design Token Integration

```typescript
// src/styles/canvas-tokens.css

:root {
  /* Canvas-specific design tokens */
  --canvas-bg: var(--color-gray-950);
  --canvas-grid: var(--color-gray-800);
  
  /* Node colors */
  --node-source-border: var(--color-blue-500);
  --node-concept-border: var(--color-purple-500);
  --node-flashcard-border: var(--color-green-500);
  --node-quiz-border: var(--color-yellow-500);
  --node-ai-insight-border: var(--color-purple-400);
  
  /* Node shadows */
  --node-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --node-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --node-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
  
  /* Handle colors */
  --handle-source: var(--color-blue-500);
  --handle-target: var(--color-purple-500);
  
  /* Animation */
  --canvas-transition-fast: 150ms ease;
  --canvas-transition-normal: 250ms ease;
  --canvas-transition-slow: 350ms ease;
}
```

---

## 9. Testing Strategy

### 9.1 Test Coverage Matrix

| Component | Unit Tests | Integration Tests | E2E Tests |
|-----------|------------|-------------------|-----------|
| FlashcardNode | ✓ | ✓ | ✓ |
| QuizNode | ✓ | ✓ | ✓ |
| AIInsightNode | ✓ | ✓ | - |
| NodeFactory | ✓ | - | - |
| CanvasStore | ✓ | ✓ | - |
| SM2 Algorithm | ✓ | - | - |

### 9.2 Key Test Scenarios

```typescript
// src/components/canvas/nodes/__tests__/FlashcardNode.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardNode } from '../FlashcardNode';

describe('FlashcardNode', () => {
  const mockData = {
    nodeType: 'flashcard' as const,
    id: 'test-flashcard',
    front: 'What is 2+2?',
    back: '4',
    tags: ['math', 'basic'],
    masteryLevel: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders front content by default', () => {
    render(<FlashcardNode id="test" data={mockData} selected={false} />);
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });

  it('flips to show back content on click', () => {
    render(<FlashcardNode id="test" data={mockData} selected={false} />);
    fireEvent.click(screen.getByText('What is 2+2?'));
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows mastery level indicator', () => {
    render(<FlashcardNode id="test" data={mockData} selected={false} />);
    const masteryBar = screen.getByTestId('mastery-bar');
    expect(masteryBar).toHaveStyle({ width: '50%' });
  });

  it('calls onFlip callback when flipped', () => {
    const onFlip = vi.fn();
    render(<FlashcardNode id="test" data={mockData} selected={false} onFlip={onFlip} />);
    fireEvent.click(screen.getByText('What is 2+2?'));
    expect(onFlip).toHaveBeenCalledWith('test');
  });
});
```

---

## 10. Implementation Roadmap

### 10.1 Story Breakdown

| Story | Description | Effort | Priority |
|-------|-------------|--------|----------|
| 26-1 | FlashcardNode with SM-2 integration | 5 | P0 |
| 26-2 | QuizNode with multiple choice | 5 | P0 |
| 26-3 | AIInsightNode for RAG visualization | 5 | P1 |
| 26-4 | NodeFactory and type system | 3 | P0 |
| 26-5 | CanvasStore with study tracking | 4 | P0 |
| 26-6 | RAG integration hooks | 4 | P1 |
| 26-7 | Styling and animations | 3 | P1 |
| 26-8 | E2E tests | 3 | P2 |

### 10.2 Dependencies

```
Story 26-4 (NodeFactory)
    ↓
Story 26-1 (FlashcardNode)
Story 26-2 (QuizNode)
Story 26-3 (AIInsightNode)
    ↓
Story 26-5 (CanvasStore)
    ↓
Story 26-6 (RAG Integration)
```

---

## 11. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| RAG API latency | Medium | Medium | Implement caching and optimistic updates |
| SM-2 edge cases | Low | Low | Extensive unit testing |
| Performance with many nodes | Medium | Low | Virtual scrolling, lazy loading |
| Cross-browser compatibility | Low | Low | Test on Chrome, Firefox, Safari |

---

## 12. References

- [React Flow Documentation](https://reactflow.dev/docs/api-reference/node)
- [SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- [Orama WASM Vector Store](https://oramasearch.com/)
- [Design Tokens System](/src/styles/design-tokens.css)

---

**Document Version:** 1.0  
**Created:** 2025-12-31 02:15:00 UTC  
**Author:** @bmad-bmm-architect  
**Status:** Ready for Implementation
