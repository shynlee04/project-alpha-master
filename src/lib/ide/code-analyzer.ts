/**
 * Code Analyzer - IDE → Knowledge Workspace Bridge
 *
 * Analyzes code structure, dependencies, and complexity metrics.
 * Generates code concept nodes for Knowledge workspace Canvas.
 *
 * @module lib/ide/code-analyzer
 * @governance Ralph Loop v3.0, Epic P2-10 AC2
 * @cross_workspace IDE → Knowledge
 */

import * as ts from 'typescript';

/**
 * Code analysis result
 */
export interface CodeAnalysis {
  /** File path */
  filePath: string;
  /** File name */
  fileName: string;
  /** Programming language */
  language: string;
  /** Total lines of code */
  linesOfCode: number;
  /** Function count */
  functionCount: number;
  /** Class count */
  classCount: number;
  /** Complexity metrics */
  complexity: ComplexityMetrics;
  /** Dependencies */
  dependencies: Dependency[];
  /** Key concepts extracted */
  concepts: CodeConcept[];
}

/**
 * Complexity metrics
 */
export interface ComplexityMetrics {
  /** Cyclomatic complexity */
  cyclomaticComplexity: number;
  /** Average nesting depth */
  averageNestingDepth: number;
  /** Maximum nesting depth */
  maxNestingDepth: number;
  /** Longest function length */
  longestFunction: number;
  /** Complexity score (0-100) */
  complexityScore: number;
}

/**
 * Dependency information
 */
export interface Dependency {
  /** Import path */
  importPath: string;
  /** Import type */
  importType: 'local' | 'external' | 'builtin';
  /** Module name */
  moduleName?: string;
}

/**
 * Code concept for Knowledge workspace
 */
export interface CodeConcept {
  /** Concept type */
  type: 'function' | 'class' | 'interface' | 'type' | 'variable' | 'enum';
  /** Concept name */
  name: string;
  /** Line number */
  line: number;
  /** Brief description */
  description?: string;
  /** Related concepts */
  relatedTo: string[];
}

/**
 * Code Analyzer Class
 *
 * Analyzes TypeScript/JavaScript code for IDE → Knowledge bridge.
 *
 * @example
 * ```typescript
 * const analyzer = new CodeAnalyzer();
 * const analysis = analyzer.analyzeCode('src/components/Button.tsx', sourceCode);
 * console.log(`Complexity: ${analysis.complexity.complexityScore}/100`);
 * console.log(`Functions: ${analysis.functionCount}`);
 * console.log(`Concepts: ${analysis.concepts.length}`);
 * ```
 */
export class CodeAnalyzer {
  /**
   * Analyze code file and extract metrics
   *
   * @param filePath - File path relative to project root
   * @param content - File content
   * @returns Code analysis result
   */
  analyzeCode(filePath: string, content: string): CodeAnalysis {
    const fileName = filePath.split('/').pop() || filePath;
    const language = this.detectLanguage(filePath);

    // Create TypeScript compiler host
    const sourceFile = ts.createSourceFile(
      fileName,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    // Extract metrics
    const linesOfCode = content.split('\n').length;
    const dependencies = this.extractDependencies(sourceFile);
    const concepts = this.extractConcepts(sourceFile);
    const functionCount = concepts.filter(c => c.type === 'function').length;
    const classCount = concepts.filter(c => c.type === 'class').length;
    const complexity = this.calculateComplexity(sourceFile, content);

    return {
      filePath,
      fileName,
      language,
      linesOfCode,
      functionCount,
      classCount,
      complexity,
      dependencies,
      concepts,
    };
  }

  /**
   * Extract dependencies from source file
   *
   * @param sourceFile - TypeScript source file
   * @returns Array of dependencies
   */
  extractDependencies(sourceFile: ts.SourceFile): Dependency[] {
    const dependencies: Dependency[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) {
        const importPath = node.moduleSpecifier.getText().replace(/['"]/g, '');
        const importType = this.classifyImport(importPath);

        dependencies.push({
          importPath,
          importType,
          moduleName: this.extractModuleName(importPath),
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return dependencies;
  }

  /**
   * Calculate complexity metrics
   *
   * @param sourceFile - TypeScript source file
   * @param content - File content
   * @returns Complexity metrics
   */
  calculateComplexity(sourceFile: ts.SourceFile, content: string): ComplexityMetrics {
    let cyclomaticComplexity = 1; // Base complexity
    let maxNestingDepth = 0;
    let currentNestingDepth = 0;
    let longestFunction = 0;
    let functionCount = 0; // Count functions for complexity calculation
    const lines = content.split('\n');

    const visit = (node: ts.Node) => {
      // Count functions
      if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
        functionCount++;
        const start = node.getStart(sourceFile);
        const end = node.getEnd();
        const startLine = sourceFile.getLineAndCharacterOfPosition(start).line;
        const endLine = sourceFile.getLineAndCharacterOfPosition(end).line;
        const functionLength = endLine - startLine + 1;
        longestFunction = Math.max(longestFunction, functionLength);
      }

      // Count decision points
      if (
        ts.isIfStatement(node) ||
        ts.isForStatement(node) ||
        ts.isWhileStatement(node) ||
        ts.isDoStatement(node) ||
        ts.isSwitchStatement(node) ||
        ts.isCatchClause(node)
      ) {
        cyclomaticComplexity++;
        currentNestingDepth++;
        maxNestingDepth = Math.max(maxNestingDepth, currentNestingDepth);
      }

      ts.forEachChild(node, (child) => {
        visit(child);
        // Decrease nesting depth after visiting children
        if (
          ts.isIfStatement(node) ||
          ts.isForStatement(node) ||
          ts.isWhileStatement(node) ||
          ts.isDoStatement(node)
        ) {
          currentNestingDepth--;
        }
      });
    };

    visit(sourceFile);

    const averageNestingDepth = lines.length > 0
      ? maxNestingDepth / Math.max(1, functionCount || 1)
      : 0;

    // Calculate complexity score (0-100, higher is more complex)
    const complexityScore = Math.min(
      100,
      Math.round(
        (cyclomaticComplexity * 2) +
        (maxNestingDepth * 5) +
        (longestFunction / 10)
      )
    );

    return {
      cyclomaticComplexity,
      averageNestingDepth: Math.round(averageNestingDepth * 10) / 10,
      maxNestingDepth,
      longestFunction,
      complexityScore,
    };
  }

  /**
   * Extract code concepts from source file
   *
   * @param sourceFile - TypeScript source file
   * @returns Array of code concepts
   */
  extractConcepts(sourceFile: ts.SourceFile): CodeConcept[] {
    const concepts: CodeConcept[] = [];

    const visit = (node: ts.Node) => {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line;

      if (ts.isFunctionDeclaration(node)) {
        const name = node.name?.getText() || '<anonymous>';
        concepts.push({
          type: 'function',
          name,
          line,
          description: this.generateFunctionDescription(node),
          relatedTo: this.extractRelatedTypes(node),
        });
      } else if (ts.isClassDeclaration(node)) {
        const name = node.name?.getText() || '<anonymous>';
        concepts.push({
          type: 'class',
          name,
          line,
          description: 'Class definition',
          relatedTo: this.extractRelatedTypes(node),
        });
      } else if (ts.isInterfaceDeclaration(node)) {
        const name = node.name.getText();
        concepts.push({
          type: 'interface',
          name,
          line,
          description: 'Type interface',
          relatedTo: this.extractRelatedTypes(node),
        });
      } else if (ts.isTypeAliasDeclaration(node)) {
        const name = node.name.getText();
        concepts.push({
          type: 'type',
          name,
          line,
          description: 'Type alias',
          relatedTo: [],
        });
      } else if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach(declaration => {
          if (ts.isVariableDeclaration(declaration) && declaration.name) {
            const name = declaration.name.getText();
            concepts.push({
              type: 'variable',
              name,
              line,
              description: 'Variable declaration',
              relatedTo: [],
            });
          }
        });
      } else if (ts.isEnumDeclaration(node)) {
        const name = node.name.getText();
        concepts.push({
          type: 'enum',
          name,
          line,
          description: 'Enum definition',
          relatedTo: [],
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return concepts;
  }

  /**
   * Detect programming language from file path
   *
   * @private
   */
  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'TypeScript';
      case 'js':
      case 'jsx':
        return 'JavaScript';
      case 'vue':
        return 'Vue';
      case 'svelte':
        return 'Svelte';
      default:
        return 'Unknown';
    }
  }

  /**
   * Classify import type
   *
   * @private
   */
  private classifyImport(importPath: string): 'local' | 'external' | 'builtin' {
    if (importPath.startsWith('.') || importPath.startsWith('/')) {
      return 'local';
    }
    if (importPath.startsWith('node:')) {
      return 'builtin';
    }
    return 'external';
  }

  /**
   * Extract module name from import path
   *
   * @private
   */
  private extractModuleName(importPath: string): string | undefined {
    if (importPath.startsWith('node:')) {
      return importPath.substring(5);
    }
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      return importPath.split('/').shift();
    }
    return undefined;
  }

  /**
   * Generate function description
   *
   * @private
   */
  private generateFunctionDescription(node: ts.FunctionDeclaration): string {
    const params = node.parameters.map(p => p.name.getText()).join(', ');
    const returnType = node.type?.getText() || 'unknown';
    return `Function(${params}): ${returnType}`;
  }

  /**
   * Extract related types from node
   *
   * @private
   */
  private extractRelatedTypes(node: ts.Node): string[] {
    const related: string[] = [];

    const visit = (child: ts.Node) => {
      if (ts.isTypeReferenceNode(child)) {
        const typeName = child.typeName.getText();
        related.push(typeName);
      }
      ts.forEachChild(child, visit);
    };

    visit(node);
    return related;
  }
}
