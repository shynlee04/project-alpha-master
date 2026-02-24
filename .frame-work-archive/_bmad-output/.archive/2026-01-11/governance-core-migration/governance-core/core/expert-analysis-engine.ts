/**
 * Expert Analysis Engine
 *
 * Implements the "Agent as Expert" enforcement check:
 * - Compare and reason with ACTUAL codebase
 * - Detect user approach flaws (overlaps, conflicts, wrong category)
 * - Decide: proceed / warn / block / redirect
 *
 * @module governance-core/core/expert-analysis-engine
 */

export interface ExpertAnalysisInput {
  userPrompt: string;
  proposedChange: {
    files: string[];
    category?: "quick_patch" | "independent_feature" | "architectural_conflict";
    estimated_hours?: number;
  };
  context: {
    domains: string[];
    files: string[];
  };
}

export interface ExpertAnalysisResult {
  status: "PASS" | "WARN" | "FAIL" | "SKIP";
  message: string;
  details: {
    category: "quick_patch" | "independent_feature" | "architectural_conflict";
    confidence: number;
    affected_domains: string[];
    estimated_hours: number;
    detected_issues: DetectedIssue[];
    recommendations: string[];
  };
}

export interface DetectedIssue {
  type: "overlap" | "conflict" | "missing_dependency" | "wrong_category" | "boundary_violation";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence?: string[];
}

/**
 * Expert Analysis Engine
 *
 * Analyzes proposed changes against actual codebase to detect issues
 */
export class ExpertAnalysisEngine {
  /**
   * Analyze a proposed change
   */
  async analyze(input: ExpertAnalysisInput): Promise<ExpertAnalysisResult> {
    const { userPrompt, proposedChange, context } = input;

    // Detect issues with the proposed change
    const detectedIssues = await this.detectIssues({
      userPrompt,
      proposedChange,
      context,
    });

    // Determine actual category (may differ from user's proposal)
    const actualCategory = this.determineCategory({
      proposedChange,
      detectedIssues,
      context,
    });

    // Calculate affected domains
    const affectedDomains = this.calculateAffectedDomains({
      proposedChange,
      context,
      detectedIssues,
    });

    // Estimate hours based on category and issues
    const estimatedHours = this.estimateEffort({
      category: actualCategory,
      issues: detectedIssues,
      fileCount: proposedChange.files.length,
    });

    // Determine status
    const status = this.determineStatus({
      category: actualCategory,
      issues: detectedIssues,
      userProposedCategory: proposedChange.category,
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      category: actualCategory,
      issues: detectedIssues,
      userProposedCategory: proposedChange.category,
    });

    // Calculate confidence
    const confidence = this.calculateConfidence({
      issues: detectedIssues,
      category: actualCategory,
      contextCompleteness: this.assessContextCompleteness(context),
    });

    return {
      status,
      message: this.generateMessage(status, actualCategory, detectedIssues),
      details: {
        category: actualCategory,
        confidence,
        affected_domains,
        estimated_hours: estimatedHours,
        detected_issues: detectedIssues,
        recommendations,
      },
    };
  }

  /**
   * Detect issues with the proposed change
   */
  private async detectIssues(params: {
    userPrompt: string;
    proposedChange: ExpertAnalysisInput["proposedChange"];
    context: ExpertAnalysisInput["context"];
  }): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = [];

    // Check for overlaps (work that overlaps with in-progress changes)
    const overlaps = await this.detectOverlaps(params);
    issues.push(...overlaps);

    // Check for conflicts (changes that conflict with existing code)
    const conflicts = await this.detectConflicts(params);
    issues.push(...conflicts);

    // Check for missing dependencies
    const missingDeps = await this.detectMissingDependencies(params);
    issues.push(...missingDeps);

    // Check for wrong category (user's proposed category doesn't match actual)
    const wrongCategory = this.detectWrongCategory(params);
    if (wrongCategory) {
      issues.push(wrongCategory);
    }

    // Check for boundary violations
    const boundaryViolations = await this.detectBoundaryViolations(params);
    issues.push(...boundaryViolations);

    return issues;
  }

  /**
   * Detect overlaps with in-progress work
   */
  private async detectOverlaps(params: {
    userPrompt: string;
    proposedChange: ExpertAnalysisInput["proposedChange"];
    context: ExpertAnalysisInput["context"];
  }): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = [];
    const { proposedChange } = params;

    // Check if proposed files are in active sprint
    // In real implementation, check sprint-status.yaml
    const activeSprintFiles = [
      "src/infrastructure/persistence/stores/project-store.ts",
      "src/presentation/components/NoteEditor.tsx",
    ];

    for (const file of proposedChange.files) {
      if (activeSprintFiles.includes(file)) {
        issues.push({
          type: "overlap",
          severity: "high",
          description: `File ${file} is in active sprint`,
          evidence: [`File appears in sprint-story: FS-05`],
        });
      }
    }

    return issues;
  }

  /**
   * Detect conflicts with existing code
   */
  private async detectConflicts(params: {
    userPrompt: string;
    proposedChange: ExpertAnalysisInput["proposedChange"];
    context: ExpertAnalysisInput["context"];
  }): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = [];
    const { proposedChange, context } = params;

    // Check for store-related conflicts
    const storeFiles = proposedChange.files.filter((f) => f.includes("store"));
    if (storeFiles.length > 0) {
      // Check if other stores depend on these
      const dependencies = await this.findStoreDependencies(storeFiles);
      for (const dep of dependencies) {
        issues.push({
          type: "conflict",
          severity: "medium",
          description: `Store ${storeFiles[0]} is used by ${dep}`,
          evidence: [`Import found in ${dep}`],
        });
      }
    }

    // Check for API contract conflicts
    if (proposedChange.files.some((f) => f.includes("api") || f.includes("endpoint"))) {
      issues.push({
        type: "conflict",
        severity: "high",
        description: "API change may affect consumers",
        evidence: ["Check for API consumers before proceeding"],
      });
    }

    return issues;
  }

  /**
   * Detect missing dependencies
   */
  private async detectMissingDependencies(params: {
    userPrompt: string;
    proposedChange: ExpertAnalysisInput["proposedChange"];
    context: ExpertAnalysisInput["context"];
  }): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = [];

    // Check if user mentions testing but no test files are included
    const { userPrompt, proposedChange } = params;
    const mentionsTesting = /\b(test|spec|coverage)\b/i.test(userPrompt);
    const hasTestFiles = proposedChange.files.some((f) =>
      f.includes(".test.") || f.includes(".spec.")
    );

    if (mentionsTesting && !hasTestFiles) {
      issues.push({
        type: "missing_dependency",
        severity: "low",
        description: "Testing mentioned but no test files included",
        evidence: ["Consider adding test coverage"],
      });
    }

    return issues;
  }

  /**
   * Detect if user's proposed category is wrong
   */
  private detectWrongCategory(params: {
    userPrompt: string;
    proposedChange: ExpertAnalysisInput["proposedChange"];
    context: ExpertAnalysisInput["context"];
  }): DetectedIssue | null {
    const { proposedChange, context } = params;

    if (!proposedChange.category) {
      return null; // No category proposed by user
    }

    const actualCategory = this.determineCategory({
      proposedChange,
      detectedIssues: [],
      context,
    });

    if (actualCategory !== proposedChange.category) {
      return {
        type: "wrong_category",
        severity: "high",
        description: `Proposed category "${proposedChange.category}" doesn't match actual "${actualCategory}"`,
        evidence: [
          `Actual: ${actualCategory}`,
          `Proposed: ${proposedChange.category}`,
        ],
      };
    }

    return null;
  }

  /**
   * Detect boundary violations
   */
  private async detectBoundaryViolations(params: {
    userPrompt: string;
    proposedChange: ExpertAnalysisInput["proposedChange"];
    context: ExpertAnalysisInput["context"];
  }): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = [];
    const { proposedChange, context } = params;

    // Check for cross-domain imports
    for (const file of proposedChange.files) {
      // Check if file imports from another domain
      const hasCrossDomainImport = await this.checkCrossDomainImports(file);
      if (hasCrossDomainImport) {
        issues.push({
          type: "boundary_violation",
          severity: "medium",
          description: `File ${file} has cross-domain imports`,
          evidence: ["Consider using event bus for cross-domain communication"],
        });
      }
    }

    // Check for cross-store imports
    const storeFiles = proposedChange.files.filter((f) => f.includes("store"));
    if (storeFiles.length > 1) {
      issues.push({
        type: "boundary_violation",
        severity: "high",
        description: "Multiple store files modified - may indicate cross-store dependency",
        evidence: [
          "Consider consolidating into single source of truth",
          "Use event bus for cross-store communication",
        ],
      });
    }

    return issues;
  }

  /**
   * Determine the actual category of the change
   */
  private determineCategory(params: {
    proposedChange: ExpertAnalysisInput["proposedChange"];
    detectedIssues: DetectedIssue[];
    context: ExpertAnalysisInput["context"];
  }): "quick_patch" | "independent_feature" | "architectural_conflict" {
    const { proposedChange, detectedIssues, context } = params;

    // Check for architectural conflict indicators
    const hasCriticalIssue = detectedIssues.some((i) => i.severity === "critical");
    const hasHighIssue = detectedIssues.some((i) => i.severity === "high");

    // Multiple domains affected
    const multipleDomains = context.domains.length > 1;

    // God store or large file changes
    const hasGodStore = proposedChange.files.some((f) =>
      f.includes("store") && this.isGodStore(f)
    );

    // Storage/sync changes
    const hasStorageChange = proposedChange.files.some((f) =>
      f.includes("storage") || f.includes("sync") || f.includes("adapter")
    );

    if (
      hasCriticalIssue ||
      (hasHighIssue && multipleDomains) ||
      hasGodStore ||
      hasStorageChange ||
      multipleDomains
    ) {
      return "architectural_conflict";
    }

    // Check for independent feature indicators
    const singleFile = proposedChange.files.length === 1;
    const noCriticalOrHighIssues = !detectedIssues.some(
      (i) => i.severity === "critical" || i.severity === "high"
    );
    const clearlyIsolated = singleFile && noCriticalOrHighIssues;

    if (clearlyIsolated || proposedChange.category === "independent_feature") {
      return "independent_feature";
    }

    // Default to quick patch for small changes
    if (singleFile && noCriticalOrHighIssues) {
      return "quick_patch";
    }

    // If unclear, default to independent feature
    return "independent_feature";
  }

  /**
   * Check if a file is a god store (>120 lines)
   */
  private isGodStore(filePath: string): boolean {
    // In real implementation, check actual file size
    // For now, use a heuristic based on known god stores
    const knownGodStores = [
      "useWorkspaceFileSystem",
      "unified-chat-store",
      "agent-config-store",
      "conversation-store",
    ];

    return knownGodStores.some((store) => filePath.includes(store));
  }

  /**
   * Calculate affected domains
   */
  private calculateAffectedDomains(params: {
    proposedChange: ExpertAnalysisInput["proposedChange"];
    context: ExpertAnalysisInput["context"];
    detectedIssues: DetectedIssue[];
  }): string[] {
    const { context, detectedIssues } = params;
    const domains = new Set(context.domains);

    // Add domains from boundary violation issues
    for (const issue of detectedIssues) {
      if (issue.type === "boundary_violation") {
        // Boundary violations typically cross domains
        domains.add("domain");
        domains.add("state_persistence");
      }
    }

    return Array.from(domains);
  }

  /**
   * Estimate effort based on category and issues
   */
  private estimateEffort(params: {
    category: "quick_patch" | "independent_feature" | "architectural_conflict";
    issues: DetectedIssue[];
    fileCount: number;
  }): number {
    const { category, issues, fileCount } = params;

    // Base hours by category
    const baseHours = {
      quick_patch: 0.5,
      independent_feature: 2,
      architectural_conflict: 6,
    };

    let hours = baseHours[category];

    // Add time for issues
    for (const issue of issues) {
      switch (issue.severity) {
        case "critical":
          hours += 4;
          break;
        case "high":
          hours += 2;
          break;
        case "medium":
          hours += 1;
          break;
        case "low":
          hours += 0.25;
          break;
      }
    }

    // Add time for multiple files
    if (fileCount > 1) {
      hours += fileCount * 0.5;
    }

    return Math.round(hours * 10) / 10; // Round to 1 decimal
  }

  /**
   * Determine status based on analysis
   */
  private determineStatus(params: {
    category: "quick_patch" | "independent_feature" | "architectural_conflict";
    issues: DetectedIssue[];
    userProposedCategory?: "quick_patch" | "independent_feature" | "architectural_conflict";
  }): "PASS" | "WARN" | "FAIL" | "SKIP" {
    const { category, issues, userProposedCategory } = params;

    // FAIL for architectural conflicts without journey mapping
    if (category === "architectural_conflict") {
      return "FAIL"; // Requires correct-course workflow
    }

    // WARN if category differs from user's proposal
    if (userProposedCategory && userProposedCategory !== category) {
      return "WARN";
    }

    // WARN for high severity issues
    if (issues.some((i) => i.severity === "high")) {
      return "WARN";
    }

    // PASS for quick patches with no issues
    if (category === "quick_patch" && issues.length === 0) {
      return "PASS";
    }

    // WARN for independent features
    if (category === "independent_feature") {
      return "WARN";
    }

    return "PASS";
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(params: {
    category: "quick_patch" | "independent_feature" | "architectural_conflict";
    issues: DetectedIssue[];
    userProposedCategory?: "quick_patch" | "independent_feature" | "architectural_conflict";
  }): string[] {
    const { category, issues, userProposedCategory } = params;
    const recommendations: string[] = [];

    // Category mismatch recommendation
    if (userProposedCategory && userProposedCategory !== category) {
      recommendations.push(
        `This change is categorized as "${category}" (not "${userProposedCategory}")`
      );
    }

    // Category-specific recommendations
    if (category === "architectural_conflict") {
      recommendations.push("Required: Comprehensive remediation via Journey Mapper");
      recommendations.push("Consider: Run correct-course workflow first");
    } else if (category === "independent_feature") {
      recommendations.push("Ensure: Clear boundaries and isolated testing");
      recommendations.push("Consider: Adding tests before implementation");
    }

    // Issue-specific recommendations
    for (const issue of issues) {
      if (issue.evidence) {
        recommendations.push(...issue.evidence);
      }
    }

    return recommendations;
  }

  /**
   * Calculate confidence in the analysis
   */
  private calculateConfidence(params: {
    issues: DetectedIssue[];
    category: "quick_patch" | "independent_feature" | "architectural_conflict";
    contextCompleteness: number;
  }): number {
    const { issues, category, contextCompleteness } = params;

    let confidence = 0.5; // Base confidence

    // More issues = higher confidence (patterns are clearer)
    confidence += Math.min(issues.length * 0.1, 0.3);

    // Architectural conflicts are easier to detect
    if (category === "architectural_conflict") {
      confidence += 0.2;
    }

    // Context completeness affects confidence
    confidence += contextCompleteness * 0.2;

    return Math.min(confidence, 0.95);
  }

  /**
   * Assess context completeness
   */
  private assessContextCompleteness(context: ExpertAnalysisInput["context"]): number {
    if (context.domains.length === 0) return 0.2;
    if (context.domains.length === 1) return 0.6;
    if (context.domains.length >= 2) return 0.9;
    return 0.5;
  }

  /**
   * Generate human-readable message
   */
  private generateMessage(
    status: "PASS" | "WARN" | "FAIL" | "SKIP",
    category: "quick_patch" | "independent_feature" | "architectural_conflict",
    issues: DetectedIssue[]
  ): string {
    const statusMessages = {
      PASS: "✅ Approved for direct implementation",
      WARN: "⚠️ Review recommendations before proceeding",
      FAIL: "🚫 Requires correct-course workflow",
      SKIP: "⊘ Skipped",
    };

    const categoryMessages = {
      quick_patch: "Quick Patch (direct fix allowed)",
      independent_feature: "Independent Feature (isolated workflow)",
      architectural_conflict: "Architectural Conflict (comprehensive remediation required)",
    };

    let message = statusMessages[status];
    message += `\nCategory: ${categoryMessages[category]}`;

    if (issues.length > 0) {
      message += `\n\nIssues Detected:`;
      for (const issue of issues.slice(0, 5)) {
        message += `\n- [${issue.severity.toUpperCase()}] ${issue.description}`;
      }
      if (issues.length > 5) {
        message += `\n- ... and ${issues.length - 5} more issues`;
      }
    }

    return message;
  }

  /**
   * Find store dependencies
   */
  private async findStoreDependencies(storeFiles: string[]): Promise<string[]> {
    // In real implementation, scan codebase for imports
    // For now, return mock data
    const dependencies: string[] = [];

    for (const storeFile of storeFiles) {
      if (storeFile.includes("project")) {
        dependencies.push("src/presentation/components/ProjectList.tsx");
        dependencies.push("src/routes/projects.lazy.tsx");
      }
      if (storeFile.includes("agent")) {
        dependencies.push("src/presentation/components/AgentConfigDialog.tsx");
        dependencies.push("src/presentation/components/AgentSelector.tsx");
      }
    }

    return dependencies;
  }

  /**
   * Check for cross-domain imports
   */
  private async checkCrossDomainImports(filePath: string): Promise<boolean> {
    // In real implementation, parse file and check imports
    // For now, use heuristic
    const storeFiles = ["store.ts", "-store.ts"];
    const isStoreFile = storeFiles.some((s) => filePath.includes(s));

    if (isStoreFile) {
      // Store files should only import from same domain
      return false;
    }

    // Component files might have cross-domain imports
    const isComponentFile = filePath.includes(".tsx");
    return isComponentFile;
  }

  /**
   * Quick analysis for simple prompts
   */
  async quickAnalyze(userPrompt: string): Promise<{
    suggestedCategory: "quick_patch" | "independent_feature" | "architectural_conflict";
    domains: string[];
    confidence: number;
  }> {
    const keywords = userPrompt.toLowerCase().split(/\s+/);

    // Detect keywords that suggest categories
    const architecturalKeywords = [
      "refactor",
      "split",
      "consolidate",
      "migration",
      "strategy",
      "storage",
      "sync",
      "store",
    ];

    const independentFeatureKeywords = [
      "add",
      "create",
      "new",
      "implement",
      "feature",
    ];

    const quickPatchKeywords = [
      "fix",
      "typo",
      "bug",
      "wiring",
      "import",
    ];

    let suggestedCategory: "quick_patch" | "independent_feature" | "architectural_conflict" =
      "independent_feature";
    let confidence = 0.5;

    if (architecturalKeywords.some((k) => keywords.includes(k))) {
      suggestedCategory = "architectural_conflict";
      confidence = 0.7;
    } else if (independentFeatureKeywords.some((k) => keywords.includes(k))) {
      suggestedCategory = "independent_feature";
      confidence = 0.6;
    } else if (quickPatchKeywords.some((k) => keywords.includes(k))) {
      suggestedCategory = "quick_patch";
      confidence = 0.8;
    }

    // Map to domains
    const domains: string[] = [];
    if (keywords.some((k) => k.includes("store") || k.includes("state"))) {
      domains.push("state_persistence");
    }
    if (keywords.some((k) => k.includes("component") || k.includes("ui"))) {
      domains.push("ux_ui");
    }
    if (keywords.some((k) => k.includes("sync") || k.includes("storage"))) {
      domains.push("workspace");
    }

    return { suggestedCategory, domains, confidence };
  }
}

/**
 * Expert Analysis Orchestrator
 *
 * Coordinates the expert analysis with other governance checks
 */
export class ExpertAnalysisOrchestrator {
  private engine: ExpertAnalysisEngine;

  constructor() {
    this.engine = new ExpertAnalysisEngine();
  }

  /**
   * Run full expert analysis
   */
  async analyze(params: ExpertAnalysisInput): Promise<ExpertAnalysisResult> {
    return this.engine.analyze(params);
  }

  /**
   * Quick analysis for session start
   */
  async quickAnalyze(userPrompt: string) {
    return this.engine.quickAnalyze(userPrompt);
  }

  /**
   * Validate a proposed fix category
   */
  async validateCategory(params: {
    userPrompt: string;
    files: string[];
    proposedCategory: "quick_patch" | "independent_feature" | "architectural_conflict";
  }): Promise<{
    valid: boolean;
    actualCategory: "quick_patch" | "independent_feature" | "architectural_conflict";
    reason?: string;
  }> {
    const analysis = await this.engine.analyze({
      userPrompt: params.userPrompt,
      proposedChange: {
        files: params.files,
        category: params.proposedCategory,
      },
      context: {
        domains: [],
        files: params.files,
      },
    });

    return {
      valid: analysis.details.category === params.proposedCategory,
      actualCategory: analysis.details.category,
      reason: analysis.details.category !== params.proposedCategory
        ? `Category mismatch: proposed "${params.proposedCategory}" but actual is "${analysis.details.category}"`
        : undefined,
    };
  }
}
