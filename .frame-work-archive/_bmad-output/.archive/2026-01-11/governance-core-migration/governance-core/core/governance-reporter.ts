/**
 * Governance Reporter
 *
 * Generates Governance Reports that signal the orchestrator
 * with ALLOW/WARN/BLOCK status based on three enforcement checks.
 *
 * @module governance-core/core/governance-reporter
 */

export interface GovernanceReport {
  status: "ALLOW" | "WARN" | "BLOCK";
  timestamp: string;
  checks: {
    context_first: CheckResult;
    expert_analysis: CheckResult;
    research: CheckResult;
  };
  recommendation: string;
  override_allowed: boolean;
  debt_ticket?: string;
}

export interface CheckResult {
  status: "PASS" | "WARN" | "FAIL" | "SKIP";
  message: string;
  details?: Record<string, unknown>;
}

export interface ContextFirstResult extends CheckResult {
  details: {
    domains: string[];
    files: number;
    tokens: number;
    cache_hit: boolean;
  };
}

export interface ExpertAnalysisResult extends CheckResult {
  details: {
    category: "quick_patch" | "independent_feature" | "architectural_conflict";
    confidence: number;
    affected_domains: string[];
    estimated_hours: number;
  };
}

export interface ResearchResult extends CheckResult {
  details: {
    required: boolean;
    sources?: number;
    confidence?: number;
    triggers?: string[];
  };
}

/**
 * Governance Reporter
 *
 * Consolidates results from three enforcement checks
 * and produces a governance report for the orchestrator.
 */
export class GovernanceReporter {
  /**
   * Generate a governance report from check results
   */
  generateReport(params: {
    contextResult: ContextFirstResult;
    expertResult: ExpertAnalysisResult;
    researchResult: ResearchResult;
    userPrompt: string;
  }): GovernanceReport {
    const { contextResult, expertResult, researchResult, userPrompt } = params;

    // Determine overall status
    const status = this.determineStatus(
      contextResult,
      expertResult,
      researchResult
    );

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      status,
      contextResult,
      expertResult,
      researchResult
    );

    // Determine if override is allowed
    const override_allowed = this.isOverrideAllowed(
      status,
      expertResult.details.category
    );

    const report: GovernanceReport = {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        context_first: contextResult,
        expert_analysis: expertResult,
        research: researchResult,
      },
      recommendation,
      override_allowed,
    };

    // Log debt ticket if override would be used
    if (status !== "ALLOW" && override_allowed) {
      report.debt_ticket = this.generateDebtTicket(report);
    }

    return report;
  }

  /**
   * Determine overall status from check results
   */
  private determineStatus(
    context: ContextFirstResult,
    expert: ExpertAnalysisResult,
    research: ResearchResult
  ): "ALLOW" | "WARN" | "BLOCK" {
    // BLOCK conditions
    if (
      context.status === "FAIL" ||
      expert.status === "FAIL" ||
      research.status === "FAIL" ||
      expert.details.category === "architectural_conflict" && !this.hasJourneyMapping(expert)
    ) {
      return "BLOCK";
    }

    // WARN conditions
    if (
      context.status === "WARN" ||
      expert.status === "WARN" ||
      research.status === "WARN" ||
      expert.details.category === "independent_feature"
    ) {
      return "WARN";
    }

    // ALLOW if all checks pass
    if (
      context.status === "PASS" &&
      expert.status === "PASS" &&
      research.status !== "FAIL"
    ) {
      return "ALLOW";
    }

    return "WARN"; // Default to warn
  }

  /**
   * Generate human-readable recommendation
   */
  private generateRecommendation(
    status: "ALLOW" | "WARN" | "BLOCK",
    context: ContextFirstResult,
    expert: ExpertAnalysisResult,
    research: ResearchResult
  ): string {
    const parts: string[] = [];

    // Context check message
    parts.push(`Context: ${context.details.domains.length} domains, ${context.details.files} files, ${context.details.tokens}K tokens`);

    // Expert analysis message
    const category = expert.details.category;
    if (category === "architectural_conflict") {
      parts.push(`⚠️ Affects: ${expert.details.affected_domains.join(", ")}`);
      parts.push(`Estimated: ${expert.details.estimated_hours}h vs ${this.getQuickFixEstimate()}h for quick patch`);
    } else if (category === "independent_feature") {
      parts.push(`✓ Isolated feature with clear boundaries`);
    }

    // Research message
    if (research.details.required) {
      parts.push(`📊 Research: ${research.details.sources} sources, ${(research.details.confidence! * 100).toFixed(0)}% confidence`);
    }

    // Status-specific messages
    if (status === "BLOCK") {
      if (category === "architectural_conflict") {
        parts.push("\n\nRequired: Comprehensive remediation via Journey Mapper");
      }
      parts.push("\n\nType 'I am aware but...' to proceed with warning");
    } else if (status === "WARN") {
      parts.push("\n\nProceed with caution or use correct-course workflow");
    }

    return parts.join("\n");
  }

  /**
   * Check if override is allowed
   */
  private isOverrideAllowed(
    status: "ALLOW" | "WARN" | "BLOCK",
    category: "quick_patch" | "independent_feature" | "architectural_conflict"
  ): boolean {
    // ALLOW always allows (no override needed)
    if (status === "ALLOW") return false;

    // WARN always allows override
    if (status === "WARN") return true;

    // BLOCK for quick_patch is unusual but allow
    if (category === "quick_patch") return true;

    // BLOCK for independent_feature allows override
    if (category === "independent_feature") return true;

    // BLOCK for architectural_conflict allows override with justification
    if (category === "architectural_conflict") return true;

    return false;
  }

  /**
   * Generate technical debt ticket for overrides
   */
  private generateDebtTicket(report: GovernanceReport): string {
    const uuid = this.generateUUID();
    const category = report.checks.expert_analysis.details.category;
    const hours = report.checks.expert_analysis.details.estimated_hours;
    const multiplier = this.getRiskMultiplier(category);

    return `DEBT-${uuid.substring(0, 8)}`;
  }

  /**
   * Check if journey mapping exists for architectural conflict
   */
  private hasJourneyMapping(expert: ExpertAnalysisResult): boolean {
    // TODO: Implement actual journey mapping check
    // For now, assume it doesn't exist
    return false;
  }

  /**
   * Get quick fix estimate for comparison
   */
  private getQuickFixEstimate(): number {
    return 0.5; // 30 minutes
  }

  /**
   * Get risk multiplier for debt tracking
   */
  private getRiskMultiplier(
    category: "quick_patch" | "independent_feature" | "architectural_conflict"
  ): number {
    switch (category) {
      case "quick_patch":
        return 1.0;
      case "independent_feature":
        return 1.3;
      case "architectural_conflict":
        return 1.5;
    }
  }

  /**
   * Generate UUID for debt ticket
   */
  private generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Format report for display
   */
  formatDisplay(report: GovernanceReport): string {
    const statusIcon = {
      ALLOW: "✅",
      WARN: "⚠️",
      BLOCK: "🚫",
    }[report.status];

    return `
┌─────────────────────────────────────────────────────────────┐
│                    GOVERNANCE REPORT                        │
├─────────────────────────────────────────────────────────────┤
│ Status: ${report.status.padEnd(8)} ${statusIcon}                      │
│                                                              │
│ Context Check:    ${this.formatCheckStatus(report.checks.context_first.status)}  │
│ Expert Analysis:  ${this.formatCheckStatus(report.checks.expert_analysis.status)}  │
│ Research Status:  ${this.formatCheckStatus(report.checks.research.status)}  │
│                                                              │
${this.wordWrap(report.recommendation, 60).split("\n").map(line => `│ ${line.padEnd(60)} │`).join("\n")}
│                                                              │
${report.override_allowed ? "│ Human Override: Type 'I am aware but...' to proceed    │" : ""}
└─────────────────────────────────────────────────────────────┘
`.trim();
  }

  /**
   * Format check status for display
   */
  private formatCheckStatus(status: string): string {
    const icon = {
      PASS: "✅ PASS",
      WARN: "⚠️ WARN",
      FAIL: "❌ FAIL",
      SKIP: "⊘ SKIP",
    }[status] || status;
    return icon.padEnd(20);
  }

  /**
   * Word wrap text to fit in box
   */
  private wordWrap(text: string, width: number): string {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + " " + word).length > width) {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + " " + word : word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join("\n");
  }
}

/**
 * Report formatters for different output formats
 */
export class ReportFormatters {
  static toJSON(report: GovernanceReport): string {
    return JSON.stringify(report, null, 2);
  }

  static toYAML(report: GovernanceReport): string {
    // Simplified YAML output
    const yaml = `
status: ${report.status}
timestamp: ${report.timestamp}
context_check: ${report.checks.context_first.status}
expert_analysis: ${report.checks.expert_analysis.status}
research: ${report.checks.research.status}
recommendation: |
  ${report.recommendation.split("\n").join("\n  ")}
override_allowed: ${report.override_allowed}
${report.debt_ticket ? `debt_ticket: ${report.debt_ticket}` : ""}
`.trim();
    return yaml;
  }

  static toMarkdown(report: GovernanceReport): string {
    const statusBadge = {
      ALLOW: "✅ **ALLOW**",
      WARN: "⚠️ **WARN**",
      BLOCK: "🚫 **BLOCK**",
    }[report.status];

    return `
# Governance Report

**Status:** ${statusBadge}
**Timestamp:** ${report.timestamp}

## Check Results

| Check | Status |
|-------|--------|
| Context First | \`${report.checks.context_first.status}\` |
| Expert Analysis | \`${report.checks.expert_analysis.status}\` |
| Research | \`${report.checks.research.status}\` |

## Recommendation

${report.recommendation}

${report.override_allowed ? "## Override\n\nType \"I am aware but...\" to proceed with warning.\n" : ""}
${report.debt_ticket ? `## Technical Debt\n\nDebt Ticket: \`${report.debt_ticket}\`\n` : ""}
`.trim();
  }
}
