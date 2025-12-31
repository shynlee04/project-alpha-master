/**
 * Command Injection Protection Module
 * @module lib/agent/facades/command-sanitizer
 *
 * Provides command validation and sanitization to prevent command injection attacks.
 *
 * Security features:
 * - Dangerous command blocklist
 * - Shell metacharacter detection in arguments
 * - Configurable allowlist/blocklist modes
 * - Detailed logging of blocked attempts
 */

import type { WorkspaceEventEmitter } from '../../events/workspace-events';

export interface CommandValidationResult {
    /** Whether the command is allowed */
    allowed: boolean;
    /** Error message if not allowed */
    error?: string;
    /** Reason for rejection */
    reason?: 'dangerous_command' | 'suspicious_argument' | 'blocked_by_policy' | 'invalid_input';
    /** Suggested safe alternative if available */
    suggestedCommand?: string;
}

/**
 * Dangerous commands that should be blocked by default
 */
const DANGEROUS_COMMANDS = new Set([
    'rm', 'rmdir', 'del', 'erase', 'unlink', 'shred',  // File deletion
    'chmod', 'chown', 'chgrp', 'setfacl', 'setfattr',  // Permission changes
    'dd',  // Direct disk operations
    'mkfs', 'mke2fs', 'mkfs.ext4', 'mkfs.ntfs',       // Filesystem creation
    'mount', 'umount',                                 // Mount operations
    'su', 'sudo', 'doas', 'pkexec',                   // Privilege escalation
    'passwd', 'useradd', 'userdel', 'usermod',        // User management
    'groupadd', 'groupdel', 'groupmod',               // Group management
    'crontab', 'at', 'batch',                         // Scheduled tasks
    'service', 'systemctl', 'init', 'shutdown',       // System services
    'reboot', 'halt', 'poweroff',                     // System control
    'kill', 'killall', 'pkill', 'killall5',           // Process termination
    'export', 'env', 'unset', 'source', '.'           // Environment/shell sourcing
]);

/**
 * Shell metacharacters that can be used for shell injection
 * NOTE: When args are passed as array to spawn(), * and ? are safe (no shell interpretation)
 * We focus on characters that can chain commands or inject new ones
 */
const SHELL_METACHARACTERS = /[;&|`$(){}[\]\\!#<>"'\n\r]/;

/**
 * Command injection patterns to detect in arguments
 * These are dangerous regardless of how arguments are passed
 */
const SUSPICIOUS_PATTERNS = [
    /;\s*(cat|ls|echo|rm|mkdir|touch)/i,
    /\|\s*(cat|ls|echo|rm|sh|bash)/i,
    /&&\s*(cat|ls|echo|rm)/i,
    /\|\|\s*(cat|ls|echo|rm)/i,
    /\$(?:\(|[`])/,
    /`[^`]+`/,
    /\$\w+/,  // Variable expansion
    /%0[0-9]/,  // URL encoding
    /\\[nr]/,  // Escape sequences
    /\/etc\/passwd/,
    /\/etc\/shadow/,
    /\.{2,5}\/.{2,10}\//,  // Path traversal patterns
];

/**
 * Configuration for command sanitizer
 */
export interface CommandSanitizerConfig {
    /** Mode: 'blocklist' (default) blocks dangerous commands, 'allowlist' only allows safe commands */
    mode: 'blocklist' | 'allowlist';
    /** Commands to allow (used in allowlist mode) */
    allowedCommands?: string[];
    /** Additional dangerous commands to block */
    additionalBlockedCommands?: string[];
    /** Whether to block commands that modify permissions */
    blockPermissionChanges?: boolean;
    /** Whether to block commands that delete files */
    blockFileDeletion?: boolean;
    /** Custom event bus for logging blocked attempts */
    eventBus?: WorkspaceEventEmitter;
}

/**
 * Default safe commands for allowlist mode
 */
const SAFE_COMMANDS = new Set([
    'ls', 'cat', 'head', 'tail', 'wc', 'grep', 'find', 'pwd', 'cd',
    'echo', 'printf', 'date', 'whoami', 'hostname', 'uname', 'id',
    'mkdir', 'touch', 'cp', 'mv', 'test', '[', ']', 'true', 'false',
    'npm', 'pnpm', 'yarn', 'node', 'python3', 'python', 'bun', 'deno',
    'git', 'hg', 'svn', 'curl', 'wget', 'sha256sum', 'md5sum',
    'sort', 'uniq', 'cut', 'awk', 'sed', 'tr', 'column', 'paste',
]);

/**
 * Default configuration
 */
const DEFAULT_CONFIG: CommandSanitizerConfig = {
    mode: 'blocklist',
    allowedCommands: Array.from(SAFE_COMMANDS),
    additionalBlockedCommands: [],
    blockPermissionChanges: true,
    blockFileDeletion: true,
    eventBus: undefined,
};

/**
 * CommandSanitizer - Validates and sanitizes commands to prevent injection
 */
export class CommandSanitizer {
    private config: CommandSanitizerConfig;
    private blockedCommands: Set<string>;

    constructor(config: Partial<CommandSanitizerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.blockedCommands = new Set([
            ...DANGEROUS_COMMANDS,
            ...(this.config.additionalBlockedCommands || []),
        ]);
    }

    /**
     * Validate a command and its arguments
     *
     * @param command - The command to validate
     * @param args - Command arguments
     * @returns Validation result with allowed status and error if not allowed
     */
    validate(command: string, args: string[] = []): CommandValidationResult {
        // Validate command is a string and not empty
        if (typeof command !== 'string' || command.trim() === '') {
            return {
                allowed: false,
                reason: 'invalid_input',
                error: 'Command must be a non-empty string',
            };
        }

        // Get base command (remove path)
        const baseCommand = command.split('/').pop()?.toLowerCase() || command;

        // Check for path traversal in command - reject if:
        // 1. Command starts with ".." (relative path traversal)
        // 2. Command is absolute path with embedded ".." (e.g., /usr/../etc)
        if (command.startsWith('..') || (command.startsWith('/') && command.includes('..'))) {
            return {
                allowed: false,
                reason: 'blocked_by_policy',
                error: 'Command path traversal not allowed',
            };
        }

        // Mode-specific validation
        if (this.config.mode === 'allowlist') {
            // Allowlist mode: only allow specified commands
            const allowedCommands = this.config.allowedCommands || [];
            if (!allowedCommands.map(c => c.toLowerCase()).includes(baseCommand)) {
                return {
                    allowed: false,
                    reason: 'blocked_by_policy',
                    error: `Command '${baseCommand}' is not in the allowed list`,
                    suggestedCommand: allowedCommands[0],
                };
            }
        } else {
            // Blocklist mode: check against dangerous commands
            if (this.blockedCommands.has(baseCommand)) {
                let reason: 'dangerous_command' | 'blocked_by_policy' = 'dangerous_command';
                let error = `Command '${baseCommand}' is blocked for security reasons`;

                // Special handling for permission changes - blocked by policy (not inherently dangerous)
                if (['chmod', 'chown', 'chgrp'].includes(baseCommand) && this.config.blockPermissionChanges) {
                    error = `Permission modification command '${baseCommand}' is blocked`;
                    reason = 'blocked_by_policy';
                }

                // Note: rm and file deletion commands remain 'dangerous_command' (inherently dangerous)

                return {
                    allowed: false,
                    reason,
                    error,
                };
            }
        }

        // Validate arguments for injection patterns
        for (const arg of args) {
            if (typeof arg !== 'string') {
                return {
                    allowed: false,
                    reason: 'invalid_input',
                    error: 'Arguments must be strings',
                };
            }

            // Check for shell metacharacters
            if (SHELL_METACHARACTERS.test(arg)) {
                return {
                    allowed: false,
                    reason: 'suspicious_argument',
                    error: `Argument contains suspicious shell metacharacters: ${arg}`,
                };
            }

            // Check for specific injection patterns
            for (const pattern of SUSPICIOUS_PATTERNS) {
                if (pattern.test(arg)) {
                    return {
                        allowed: false,
                        reason: 'suspicious_argument',
                        error: `Argument matches suspicious pattern: ${arg}`,
                    };
                }
            }

            // Check for path traversal in arguments
            if (arg.includes('..') && (arg.includes('/etc/') || arg.includes('/root/'))) {
                return {
                    allowed: false,
                    reason: 'suspicious_argument',
                    error: `Argument attempts path traversal to sensitive location: ${arg}`,
                };
            }
        }

        return { allowed: true };
    }

    /**
     * Validate and throw if invalid
     *
     * @param command - The command to validate
     * @param args - Command arguments
     * @throws Error with validation details if command is not allowed
     */
    validateOrThrow(command: string, args: string[] = []): void {
        const result = this.validate(command, args);

        if (!result.allowed) {
            // Log blocked attempt if event bus is configured
            this.config.eventBus?.emit('security:command:blocked' as any, {
                command,
                args,
                reason: result.reason,
                error: result.error,
            });

            throw new Error(`Command validation failed: ${result.error}`);
        }
    }

    /**
     * Get the list of allowed commands (for display to user)
     */
    getAllowedCommands(): string[] {
        if (this.config.mode === 'allowlist') {
            return this.config.allowedCommands || [];
        }
        return Array.from(SAFE_COMMANDS);
    }

    /**
     * Get the list of blocked commands (for display to user)
     */
    getBlockedCommands(): string[] {
        return Array.from(this.blockedCommands);
    }

    /**
     * Update configuration dynamically
     */
    updateConfig(updates: Partial<CommandSanitizerConfig>): void {
        this.config = { ...this.config, ...updates };

        // Rebuild blocked commands set if additional ones were added
        if (updates.additionalBlockedCommands) {
            for (const cmd of updates.additionalBlockedCommands) {
                this.blockedCommands.add(cmd);
            }
        }
    }
}

/**
 * Create a default command sanitizer with blocklist mode
 */
export function createDefaultSanitizer(eventBus?: WorkspaceEventEmitter): CommandSanitizer {
    return new CommandSanitizer({
        mode: 'blocklist',
        blockPermissionChanges: true,
        blockFileDeletion: true,
        eventBus,
    });
}
