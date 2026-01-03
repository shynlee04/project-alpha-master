/**
 * Code Analysis Bridge - IDE → Knowledge Workspace
 *
 * Handles code analysis requests from IDE and creates concept nodes in Knowledge workspace.
 *
 * @module lib/ide/code-analysis-bridge
 * @governance Ralph Loop v3.0, Epic P2-10 AC2
 * @cross_workspace IDE → Knowledge
 */

import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import { CodeAnalyzer } from './code-analyzer';
import { useCanvasStore } from '@/infrastructure/persistence/stores';
import type { CodeAnalysisData } from '@/infrastructure/events/event-bus';
import type { CodeAnalysis } from './code-analyzer';

/**
 * Code Analysis Bridge Service
 *
 * Singleton service that:
 * - Listens for IDE_CODE_ANALYSIS_REQUESTED events
 * - Analyzes code using CodeAnalyzer
 * - Creates CodeConceptNode in Knowledge workspace Canvas
 */
export class CodeAnalysisBridge {
  private analyzer: CodeAnalyzer;
  private unsubscribers: Array<() => void> = [];

  constructor() {
    this.analyzer = new CodeAnalyzer();
  }

  /**
   * Initialize the bridge
   *
   * Subscribe to code analysis events and handle them
   */
  initialize(): void {
    console.log('[CodeAnalysisBridge] Initializing IDE → Knowledge bridge...');

    // Subscribe to code analysis requests
    const unsubscribe = eventBus.on<CodeAnalysisData>(
      DomainEventType.IDE_CODE_ANALYSIS_REQUESTED,
      (event) => {
        const { payload } = event;
        console.log('[CodeAnalysisBridge] Code analysis requested:', payload);

        this.handleCodeAnalysis(payload);
      }
    );

    this.unsubscribers.push(unsubscribe);

    console.log('[CodeAnalysisBridge] IDE → Knowledge bridge initialized');
  }

  /**
   * Handle code analysis request
   *
   * @param data - Code analysis data from IDE
   */
  private handleCodeAnalysis(data: CodeAnalysisData): void {
    const { filePath, fileName, sourceCode, projectId } = data;

    if (!sourceCode) {
      console.warn('[CodeAnalysisBridge] No source code provided, skipping analysis');
      return;
    }

    try {
      // Analyze the code
      const analysis: CodeAnalysis = this.analyzer.analyzeCode(filePath, sourceCode);

      console.log('[CodeAnalysisBridge] Analysis complete:', {
        file: fileName,
        complexity: analysis.complexity.complexityScore,
        concepts: analysis.concepts.length,
      });

      // Create concept node in Knowledge workspace Canvas
      this.createCodeConceptNode(fileName, filePath, analysis, projectId);

      // Optionally emit success event
      eventBus.emit(
        DomainEventType.IDE_CODE_ANALYSIS_REQUESTED,
        {
          ...data,
          analysis: analysis as any,
        } as CodeAnalysisData,
        `analysis-${Date.now()}`
      );
    } catch (error) {
      console.error('[CodeAnalysisBridge] Analysis failed:', error);
    }
  }

  /**
   * Create code concept node in Knowledge workspace Canvas
   *
   * @param fileName - File name
   * @param filePath - File path
   * @param analysis - Code analysis result
   * @param projectId - Project ID
   */
  private createCodeConceptNode(
    fileName: string,
    filePath: string,
    analysis: CodeAnalysis,
    projectId: string
  ): void {
    const canvasStore = useCanvasStore.getState();

    // Generate unique node ID
    const nodeId = `code-concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate position (spread nodes out)
    const nodes = canvasStore.nodes;
    const offsetX = 100 + (nodes.length % 5) * 300;
    const offsetY = 100 + Math.floor(nodes.length / 5) * 300;

    // Create the node
    canvasStore.addNode({
      id: nodeId,
      type: 'codeConcept',
      position: { x: offsetX, y: offsetY },
      data: {
        nodeType: 'codeConcept',
        title: fileName,
        filePath,
        analysis,
      },
    });

    console.log('[CodeAnalysisBridge] Created CodeConceptNode:', nodeId);
  }

  /**
   * Request code analysis for a file
   *
   * Call this from IDE when user clicks "Analyze in Knowledge"
   *
   * @param filePath - File path relative to project root
   * @param sourceCode - File content
   * @param projectId - Project ID
   */
  requestCodeAnalysis(filePath: string, sourceCode: string, projectId: string): void {
    const fileName = filePath.split('/').pop() || filePath;

    const data: CodeAnalysisData = {
      workspaceType: 'ide',
      projectId,
      timestamp: new Date(),
      filePath,
      fileName,
      sourceCode,
      analysis: null as any, // Will be filled by bridge
    };

    // Emit event
    eventBus.emit(
      DomainEventType.IDE_CODE_ANALYSIS_REQUESTED,
      data,
      `request-${Date.now()}`
    );

    console.log('[CodeAnalysisBridge] Code analysis requested for:', fileName);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    console.log('[CodeAnalysisBridge] Destroying IDE → Knowledge bridge...');

    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }

    this.unsubscribers = [];
    console.log('[CodeAnalysisBridge] Bridge destroyed');
  }
}

// Export singleton instance
export const codeAnalysisBridge = new CodeAnalysisBridge();

/**
 * Initialize code analysis bridge on app mount
 *
 * Call this once during application initialization
 */
export function initializeCodeAnalysisBridge(): void {
  if (typeof window !== 'undefined') {
    codeAnalysisBridge.initialize();
  }
}
