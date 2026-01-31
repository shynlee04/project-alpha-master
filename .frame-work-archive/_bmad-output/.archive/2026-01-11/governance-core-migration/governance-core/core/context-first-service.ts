/**
 * Context First Service
 *
 * Implements the two-step hook for progressive context loading:
 * Step A: Gather Context (scan domains, slice by relevance)
 * Step B: Contextualize Prompt (transform with gathered context)
 *
 * @module governance-core/core/context-first-service
 */

export interface DomainConfig {
  id: string;
  name: string;
  priority: "P0" | "P1" | "P2";
  path: string;
  scan_patterns: string[];
}

export interface IntentKeywords {
  keywords: string[];
  domains: string[];
  file_patterns: string[];
}

export interface FileRelevance {
  path: string;
  score: number;
  reasons: string[];
  line_ranges?: { start: number; end: number }[];
}

export interface GatheredContext {
  domains: string[];
  files: FileRelevance[];
  total_lines: number;
  estimated_tokens: number;
  cache_hit: boolean;
  timestamp: string;
}

export interface EnhancedPrompt {
  original: string;
  enhanced: string;
  added_context: string[];
  file_references: string[];
  domain_context: string[];
}

export interface ContextLevel {
  level: 0 | 1 | 2 | 3 | 4 | 5;
  name: string;
  max_tokens: number;
  description: string;
}

/**
 * Context First Service
 *
 * Provides progressive context loading based on user intent.
 */
export class ContextFirstService {
  private domains: Map<string, DomainConfig>;
  private intentMap: Map<string, IntentKeywords>;
  private cache: Map<string, { context: GatheredContext; timestamp: number }>;
  private readonly CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

  constructor() {
    this.domains = new Map();
    this.intentMap = new Map();
    this.cache = new Map();
    this.initializeDomains();
    this.initializeIntentMap();
  }

  /**
   * Step A: Gather Context
   *
   * Parse user prompt, map to domains, scan for relevant files
   */
  async gatherContext(params: {
    userPrompt: string;
    contextLevel?: number;
    forceRefresh?: boolean;
  }): Promise<GatheredContext> {
    const { userPrompt, contextLevel = 3, forceRefresh = false } = params;

    // Extract keywords from prompt
    const keywords = this.extractKeywords(userPrompt);

    // Map keywords to domains
    const targetDomains = this.mapKeywordsToDomains(keywords);

    // Check cache first
    const cacheKey = this.generateCacheKey(targetDomains, keywords);
    if (!forceRefresh) {
      const cached = this.getCached(cacheKey);
      if (cached) {
        return { ...cached, cache_hit: true };
      }
    }

    // Scan domains for relevant files
    const relevantFiles = await this.scanDomains(targetDomains, keywords);

    // Calculate totals
    const total_lines = relevantFiles.reduce((sum, f) => sum + (f.line_ranges?.reduce((s, r) => s + (r.end - r.start), 0) || 500), 0);
    const estimated_tokens = Math.round(total_lines * 1.5); // Rough estimate

    const context: GatheredContext = {
      domains: targetDomains,
      files: relevantFiles,
      total_lines,
      estimated_tokens,
      cache_hit: false,
      timestamp: new Date().toISOString(),
    };

    // Cache the result
    this.setCached(cacheKey, context);

    return context;
  }

  /**
   * Step B: Contextualize Prompt
   *
   * Transform user prompt with gathered context
   */
  async contextualizePrompt(params: {
    userPrompt: string;
    context: GatheredContext;
    includeFileReferences?: boolean;
    includeDomainInfo?: boolean;
  }): Promise<EnhancedPrompt> {
    const { userPrompt, context, includeFileReferences = true, includeDomainInfo = true } = params;

    const added_context: string[] = [];
    const file_references: string[] = [];
    const domain_context: string[] = [];

    // Add domain information
    if (includeDomainInfo && context.domains.length > 0) {
      domain_context.push(`## Domains: ${context.domains.join(", ")}`);
      for (const domainId of context.domains) {
        const domain = this.domains.get(domainId);
        if (domain) {
          domain_context.push(`- **${domain.name}** (${domain.priority}): ${domain.path}`);
        }
      }
      added_context.push(...domain_context);
    }

    // Add file references
    if (includeFileReferences && context.files.length > 0) {
      file_references.push(`## Relevant Files (${context.files.length})`);
      for (const file of context.files.slice(0, 20)) { // Limit to 20 files
        const lineInfo = file.line_ranges
          ? ` (${file.line_ranges.length} range${file.line_ranges.length > 1 ? "s" : ""})`
          : "";
        file_references.push(`- ${file.path}${lineInfo} [score: ${file.score.toFixed(2)}]`);
      }
      if (context.files.length > 20) {
        file_references.push(`- ... and ${context.files.length - 20} more files`);
      }
      added_context.push(...file_references);
    }

    // Build enhanced prompt
    const enhanced = this.buildEnhancedPrompt(userPrompt, {
      domainInfo: includeDomainInfo ? domain_context : [],
      fileRefs: includeFileReferences ? file_references : [],
      considerations: this.generateConsiderations(context),
    });

    return {
      original: userPrompt,
      enhanced,
      added_context,
      file_references: context.files.map((f) => f.path),
      domain_context,
    };
  }

  /**
   * Extract keywords from user prompt
   */
  private extractKeywords(prompt: string): string[] {
    const keywords: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Common keyword patterns
    const patterns = {
      store: ["store", "state", "zustand", "persistence", "storage"],
      component: ["component", "ui", "split", "extract", "hook"],
      sync: ["sync", "fsa", "indexeddb", "workspace", "adapter"],
      agent: ["agent", "tool", "permission", "crud"],
      artifact: ["artifact", "document", "governance", "claude"],
      journey: ["journey", "flow", "user", "ux"],
      api: ["api", "endpoint", "contract", "model"],
      schema: ["schema", "database", "dexie"],
      routing: ["route", "router", "navigation"],
    };

    for (const [category, words] of Object.entries(patterns)) {
      for (const word of words) {
        if (lowerPrompt.includes(word)) {
          keywords.push(word);
          keywords.push(category); // Also add category keyword
        }
      }
    }

    return [...new Set(keywords)];
  }

  /**
   * Map keywords to domains
   */
  private mapKeywordsToDomains(keywords: string[]): string[] {
    const domains = new Set<string>();

    for (const [intent, mapping] of this.intentMap.entries()) {
      for (const keyword of keywords) {
        if (mapping.keywords.includes(keyword) || mapping.keywords.some((k) => keyword.includes(k))) {
          mapping.domains.forEach((d) => domains.add(d));
        }
      }
    }

    return domains.size > 0 ? Array.from(domains) : ["domain"]; // Default to domain
  }

  /**
   * Scan domains for relevant files
   */
  private async scanDomains(
    targetDomains: string[],
    keywords: string[]
  ): Promise<FileRelevance[]> {
    const relevantFiles: FileRelevance[] = [];

    for (const domainId of targetDomains) {
      const domain = this.domains.get(domainId);
      if (!domain) continue;

      // In a real implementation, this would scan the actual filesystem
      // For now, we'll return a mock result
      const files = await this.mockScanDomain(domain, keywords);
      relevantFiles.push(...files);
    }

    // Sort by relevance score
    return relevantFiles.sort((a, b) => b.score - a.score);
  }

  /**
   * Mock domain scan (replace with actual filesystem scan)
   */
  private async mockScanDomain(
    domain: DomainConfig,
    keywords: string[]
  ): Promise<FileRelevance[]> {
    // This is a placeholder - in real implementation, use Glob/Grep to scan
    const mockFiles: FileRelevance[] = [];

    // Generate some plausible file paths based on domain
    const patterns = {
      state_persistence: [
        "src/infrastructure/persistence/stores/project-store.ts",
        "src/infrastructure/persistence/stores/note-store.ts",
        "src/infrastructure/persistence/stores/agent-store.ts",
        "src/infrastructure/persistence/dexie-db.ts",
      ],
      ux_ui: [
        "src/presentation/components/NoteEditor.tsx",
        "src/presentation/components/AgentConfigDialog.tsx",
        "src/routes/notes.lazy.tsx",
      ],
      workspace: [
        "src/infrastructure/sync/file-sync-service.ts",
        "src/infrastructure/persistence/adapters/fsa-adapter.ts",
        "src/infrastructure/persistence/adapters/indexeddb-adapter.ts",
      ],
      domain: [
        "src/domain/entities/Note.ts",
        "src/domain/entities/Agent.ts",
        "src/domain/services/FileLockService.ts",
      ],
      artifact: [
        "CLAUDE.md",
        "AGENTS.md",
      ],
      document: [
        "_bmad/state/bmm-workflow-status.yaml",
        "_bmad/state/sprint-status.yaml",
      ],
    };

    const domainFiles = patterns[domain.id as keyof typeof patterns] || [];

    for (const filePath of domainFiles) {
      const score = this.calculateRelevanceScore(filePath, keywords);
      if (score > 0.3) {
        mockFiles.push({
          path: filePath,
          score,
          reasons: this.getScoreReasons(filePath, keywords),
        });
      }
    }

    return mockFiles;
  }

  /**
   * Calculate relevance score for a file
   */
  private calculateRelevanceScore(filePath: string, keywords: string[]): number {
    let score = 0;
    const lowerPath = filePath.toLowerCase();

    // Keyword matches
    for (const keyword of keywords) {
      if (lowerPath.includes(keyword)) {
        score += 0.5;
      }
    }

    // Domain relevance
    if (lowerPath.includes("store") && keywords.includes("store")) {
      score += 0.3;
    }
    if (lowerPath.includes("component") && keywords.includes("component")) {
      score += 0.3;
    }

    // File type relevance
    if (filePath.endsWith(".tsx") && keywords.includes("ui")) {
      score += 0.2;
    }
    if (filePath.endsWith(".store.ts") && keywords.includes("state")) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Get reasons for score
   */
  private getScoreReasons(filePath: string, keywords: string[]): string[] {
    const reasons: string[] = [];
    const lowerPath = filePath.toLowerCase();

    for (const keyword of keywords) {
      if (lowerPath.includes(keyword)) {
        reasons.push(`Matches keyword "${keyword}"`);
      }
    }

    return reasons;
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(domains: string[], keywords: string[]): string {
    return `${domains.sort().join(",")}-${keywords.sort().join(",")}`;
  }

  /**
   * Get cached context
   */
  private getCached(key: string): GatheredContext | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.context;
  }

  /**
   * Set cached context
   */
  private setCached(key: string, context: GatheredContext): void {
    this.cache.set(key, {
      context,
      timestamp: Date.now(),
    });
  }

  /**
   * Build enhanced prompt
   */
  private buildEnhancedPrompt(
    original: string,
    parts: {
      domainInfo: string[];
      fileRefs: string[];
      considerations: string[];
    }
  ): string {
    const sections: string[] = [];

    sections.push(`# Task: ${original}`);

    if (parts.domainInfo.length > 0) {
      sections.push("\n## Context from Domain Analysis");
      sections.push(...parts.domainInfo);
    }

    if (parts.fileRefs.length > 0) {
      sections.push(...parts.fileRefs);
    }

    if (parts.considerations.length > 0) {
      sections.push("\n## Considerations");
      sections.push(...parts.considerations);
    }

    return sections.join("\n");
  }

  /**
   * Generate considerations based on context
   */
  private generateConsiderations(context: GatheredContext): string[] {
    const considerations: string[] = [];

    // Check for architectural implications
    if (context.domains.includes("state_persistence")) {
      considerations.push("- This affects STATE domain - check for cross-store dependencies");
    }

    if (context.domains.includes("workspace")) {
      considerations.push("- This affects SYNC/WORKSPACE - consider FSA vs IndexedDB implications");
    }

    // Check for file count
    if (context.files.length > 20) {
      considerations.push(`- High file count (${context.files.length}) - consider scoping down`);
    }

    // Check for token count
    if (context.estimated_tokens > 10000) {
      considerations.push("- Large context - may need iterative approach");
    }

    return considerations;
  }

  /**
   * Initialize domain configurations
   */
  private initializeDomains(): void {
    const domains: DomainConfig[] = [
      {
        id: "artifact",
        name: "Artifact Validation",
        priority: "P0",
        path: "CLAUDE.md, AGENTS.md",
        scan_patterns: ["**/CLAUDE.md", "**/AGENTS.md"],
      },
      {
        id: "document",
        name: "Document Validation",
        priority: "P0",
        path: "_bmad/**/*.yaml",
        scan_patterns: ["_bmad/**/*.yaml", "_bmad-ext/**/*.yaml"],
      },
      {
        id: "state_persistence",
        name: "State & Persistence",
        priority: "P0",
        path: "src/infrastructure/persistence",
        scan_patterns: ["src/infrastructure/persistence/**/*.ts"],
      },
      {
        id: "domain",
        name: "Domain Layer",
        priority: "P1",
        path: "src/domain",
        scan_patterns: ["src/domain/**/*.ts"],
      },
      {
        id: "ux_ui",
        name: "UX/UI",
        priority: "P2",
        path: "src/presentation",
        scan_patterns: ["src/presentation/**/*.tsx"],
      },
      {
        id: "workspace",
        name: "Workspace",
        priority: "P1",
        path: "src/infrastructure/sync",
        scan_patterns: ["src/infrastructure/sync/**/*.ts"],
      },
    ];

    for (const domain of domains) {
      this.domains.set(domain.id, domain);
    }
  }

  /**
   * Initialize intent keyword mapping
   */
  private initializeIntentMap(): void {
    const mappings: Record<string, IntentKeywords> = {
      store_refactoring: {
        keywords: ["store", "state", "zustand", "persistence", "split", "refactor"],
        domains: ["state_persistence"],
        file_patterns: ["**/stores/**/*.ts"],
      },
      component_splitting: {
        keywords: ["component", "ui", "split", "extract", "large", "god"],
        domains: ["ux_ui"],
        file_patterns: ["**/components/**/*.tsx"],
      },
      sync_strategy: {
        keywords: ["sync", "fsa", "indexeddb", "storage", "adapter", "workspace"],
        domains: ["workspace", "state_persistence"],
        file_patterns: ["**/sync/**/*.ts", "**/adapters/**/*.ts"],
      },
      agent_management: {
        keywords: ["agent", "tool", "permission", "crud"],
        domains: ["domain", "api_contract"],
        file_patterns: ["**/agents/**/*.ts", "**/tools/**/*.ts"],
      },
      artifact_validation: {
        keywords: ["artifact", "document", "claude", "agents", "governance"],
        domains: ["artifact", "document"],
        file_patterns: ["CLAUDE.md", "AGENTS.md", "**/*.yaml"],
      },
      journey_mapping: {
        keywords: ["journey", "flow", "user", "ux", "trace"],
        domains: ["ux_ui", "domain"],
        file_patterns: ["**/routes/**/*.tsx", "**/components/**/*.tsx"],
      },
    };

    for (const [key, value] of Object.entries(mappings)) {
      this.intentMap.set(key, value);
    }
  }

  /**
   * Get context level configuration
   */
  static getContextLevels(): ContextLevel[] {
    return [
      { level: 0, name: "Nothing", max_tokens: 0, description: "Session idle" },
      { level: 1, name: "Frontmatter Only", max_tokens: 500, description: "Agent selection" },
      { level: 2, name: "Structure", max_tokens: 2000, description: "Domain structure" },
      { level: 3, name: "Key Files", max_tokens: 5000, description: "Starting work" },
      { level: 4, name: "Full Domain", max_tokens: 10000, description: "Deep work" },
      { level: 5, name: "Cross-Domain", max_tokens: 20000, description: "Remediation" },
    ];
  }

  /**
   * Invalidate cache for a domain
   */
  invalidateDomain(domainId: string): void {
    for (const [key, cached] of this.cache.entries()) {
      if (cached.context.domains.includes(domainId)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Context First Hook Adapter
 *
 * Adapts the service for use with Claude Code hooks
 */
export class ContextFirstHookAdapter {
  private service: ContextFirstService;

  constructor() {
    this.service = new ContextFirstService();
  }

  /**
   * SessionStart hook handler
   *
   * Called when a new session starts - gather initial context
   */
  async onSessionStart(params: {
    userPrompt: string;
  }): Promise<GatheredContext> {
    return this.service.gatherContext({
      userPrompt: params.userPrompt,
      contextLevel: 2, // Start with structure level
    });
  }

  /**
   * UserPromptSubmit hook handler
   *
   * Called when user submits a prompt - contextualize and enhance
   */
  async onUserPromptSubmit(params: {
    userPrompt: string;
    existingContext?: GatheredContext;
  }): Promise<EnhancedPrompt> {
    // If we have existing context, check if it's still relevant
    if (params.existingContext) {
      const keywords = this.service["extractKeywords"](params.userPrompt);
      const domainsMatch = params.existingContext.domains.some((d) =>
        this.service["mapKeywordsToDomains"](keywords).includes(d)
      );

      if (domainsMatch) {
        // Reuse existing context
        return this.service.contextualizePrompt({
          userPrompt: params.userPrompt,
          context: params.existingContext,
        });
      }
    }

    // Gather new context
    const context = await this.service.gatherContext({
      userPrompt: params.userPrompt,
    });

    return this.service.contextualizePrompt({
      userPrompt: params.userPrompt,
      context,
    });
  }
}
