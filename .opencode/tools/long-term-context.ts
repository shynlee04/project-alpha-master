/**
 * LONG-TERM CONTEXT TOOL
 * 
 * Query historical brain artifacts on-demand.
 * Types: decisions, violations, sessions, impacts
 * 
 * @location .opencode/tools/long-term-context.ts
 * @version 1.0.0
 */

import { tool } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";

// Find project root (look for package.json or .opencode)
function findProjectRoot(): string {
    let current = process.cwd();
    while (current !== "/") {
        if (fs.existsSync(path.join(current, "package.json")) ||
            fs.existsSync(path.join(current, ".opencode"))) {
            return current;
        }
        current = path.dirname(current);
    }
    return process.cwd();
}

// Parse YAML-like content (simple parser)
function parseYamlish(content: string): Record<string, unknown> {
    const lines = content.split("\n");
    const result: Record<string, unknown> = {};
    let currentKey = "";

    for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
            currentKey = match[1];
            result[currentKey] = match[2] || "";
        } else if (line.startsWith("  - ") && currentKey) {
            if (!Array.isArray(result[currentKey])) {
                result[currentKey] = [];
            }
            (result[currentKey] as string[]).push(line.replace("  - ", "").trim());
        }
    }

    return result;
}

export default tool({
    description: `Query historical context from the project brain.
    
Types available:
- decisions: Architectural and technical decisions made across sessions
- violations: Governance violations and their remediations
- sessions: Per-session metadata showing delegation chains and outcomes
- impacts: Cross-session impact tracking

Use this tool to:
- Understand why past decisions were made
- Find patterns in governance violations
- Track delegation chains across sessions
- Identify upstream/downstream impacts`,

    args: {
        type: tool.schema.enum(["decisions", "violations", "sessions", "impacts"])
            .describe("Category of brain artifacts to query"),
        query: tool.schema.string().optional()
            .describe("Keyword to filter results (searches content)"),
        limit: tool.schema.number().optional().default(5)
            .describe("Maximum number of results to return"),
    },

    async execute(args) {
        const projectRoot = findProjectRoot();
        const brainPath = path.join(projectRoot, "_bmad-output", ".brain", args.type);

        // Check if brain directory exists
        if (!fs.existsSync(brainPath)) {
            return `No ${args.type} artifacts found in brain. Directory: ${brainPath} does not exist.

To populate the brain:
1. Brain artifacts are auto-recorded by the master-orchestrator plugin
2. Session decisions are archived on session.deleted events
3. Violations are recorded during governance checks

Current brain location: ${path.join(projectRoot, "_bmad-output", ".brain")}`;
        }

        // Read artifacts
        const files = fs.readdirSync(brainPath)
            .filter(f => f.endsWith(".yaml") || f.endsWith(".md"))
            .sort((a, b) => b.localeCompare(a)); // Newest first (assumes date prefix)

        if (files.length === 0) {
            return `No ${args.type} artifacts found. Directory exists but is empty.`;
        }

        const results: Array<{
            file: string;
            preview: string;
            match?: string;
        }> = [];

        for (const file of files) {
            if (results.length >= (args.limit || 5)) break;

            const filePath = path.join(brainPath, file);
            const content = fs.readFileSync(filePath, "utf8");

            // If query specified, filter by content
            if (args.query) {
                const lowerContent = content.toLowerCase();
                const lowerQuery = args.query.toLowerCase();

                if (!lowerContent.includes(lowerQuery)) {
                    continue;
                }

                // Find matching line for context
                const lines = content.split("\n");
                const matchLine = lines.find(l =>
                    l.toLowerCase().includes(lowerQuery)
                );

                results.push({
                    file,
                    preview: content.substring(0, 500) + (content.length > 500 ? "..." : ""),
                    match: matchLine,
                });
            } else {
                results.push({
                    file,
                    preview: content.substring(0, 500) + (content.length > 500 ? "..." : ""),
                });
            }
        }

        if (results.length === 0) {
            return `No ${args.type} artifacts match query "${args.query}".`;
        }

        // Format output
        let output = `## Brain Query: ${args.type}\n`;
        output += args.query ? `Query: "${args.query}"\n` : "";
        output += `Found: ${results.length} artifacts\n\n`;

        for (const result of results) {
            output += `### ${result.file}\n`;
            if (result.match) {
                output += `Match: ${result.match}\n`;
            }
            output += "```yaml\n" + result.preview + "\n```\n\n";
        }

        output += `---\nBrain path: ${brainPath}`;

        return output;
    },
});
