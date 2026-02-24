/**
 * Command Sanitizer Tests
 * @module lib/agent/facades/__tests__/command-sanitizer
 */

import { CommandSanitizer, createDefaultSanitizer } from '../command-sanitizer';

describe('Command Sanitizer', () => {
    describe('validate - Safe Commands', () => {
        it('should allow safe commands like ls', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('ls', ['-la']);
            expect(result.allowed).toBe(true);
        });

        it('should allow safe commands like cat', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('cat', ['file.txt']);
            expect(result.allowed).toBe(true);
        });

        it('should allow npm commands', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('npm', ['install', '--save-dev']);
            expect(result.allowed).toBe(true);
        });

        it('should allow git commands', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('git', ['status', 'branch']);
            expect(result.allowed).toBe(true);
        });

        it('should allow node commands', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('node', ['script.js']);
            expect(result.allowed).toBe(true);
        });

        it('should allow commands with path', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('/usr/bin/ls', ['-la']);
            expect(result.allowed).toBe(true);
        });

        it('should be case-insensitive for commands', () => {
            const sanitizer = createDefaultSanitizer();
            expect(sanitizer.validate('LS', ['-la']).allowed).toBe(true);
            expect(sanitizer.validate('Cat', ['file.txt']).allowed).toBe(true);
            expect(sanitizer.validate('NPM', ['install']).allowed).toBe(true);
        });
    });

    describe('validate - Dangerous Commands (Blocklist Mode)', () => {
        it('should block rm command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('rm', ['-rf', '/tmp/test']);
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('dangerous_command');
        });

        it('should block chmod command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('chmod', ['777', 'file.txt']);
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('blocked_by_policy');
        });

        it('should block chown command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('chown', ['root:root', 'file.txt']);
            expect(result.allowed).toBe(false);
        });

        it('should block sudo command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('sudo', ['ls', '/root']);
            expect(result.allowed).toBe(false);
        });

        it('should block kill command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('kill', ['-9', '1234']);
            expect(result.allowed).toBe(false);
        });

        it('should block dd command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('dd', ['if=/dev/zero', 'of=/tmp/test.img']);
            expect(result.allowed).toBe(false);
        });

        it('should block su command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('su', ['-', 'root']);
            expect(result.allowed).toBe(false);
        });

        it('should block mkfs command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('mkfs.ext4', ['/dev/sda1']);
            expect(result.allowed).toBe(false);
        });
    });

    describe('validate - Shell Injection Patterns', () => {
        it('should block semicolon injection', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('cat', ['file.txt;', 'rm', '-rf', '/']);
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('suspicious_argument');
        });

        it('should block pipe injection', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('cat', ['file.txt', '|', 'sh']);
            expect(result.allowed).toBe(false);
        });

        it('should block command substitution', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('cat', ['$(whoami)']);
            expect(result.allowed).toBe(false);
        });

        it('should block backtick substitution', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('cat', ['`ls`']);
            expect(result.allowed).toBe(false);
        });

        it('should block variable expansion', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('cat', ['$HOME/.ssh/id_rsa']);
            expect(result.allowed).toBe(false);
        });

        it('should block AND operator injection', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('echo', ['test', '&&', 'rm', '-rf', '/']);
            expect(result.allowed).toBe(false);
        });

        it('should block OR operator injection', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('echo', ['test', '||', 'rm', '-rf', '/']);
            expect(result.allowed).toBe(false);
        });

        it('should block newline injection', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('echo', ['test\nrm -rf /']);
            expect(result.allowed).toBe(false);
        });
    });

    describe('validate - Path Traversal', () => {
        it('should block access to /etc/passwd', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('cat', ['/etc/passwd']);
            expect(result.allowed).toBe(false);
        });

        it('should block access to /etc/shadow', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('cat', ['/etc/shadow']);
            expect(result.allowed).toBe(false);
        });

        it('should block path traversal with ..', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('cat', ['../../etc/passwd']);
            expect(result.allowed).toBe(false);
        });
    });

    describe('validate - Invalid Input', () => {
        it('should reject empty command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('');
            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('invalid_input');
        });

        it('should reject non-string command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate(123 as unknown as string);
            expect(result.allowed).toBe(false);
        });

        it('should reject whitespace-only command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('   ');
            expect(result.allowed).toBe(false);
        });

        it('should reject absolute path commands', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('/bin/rm', ['-rf', '/tmp']);
            expect(result.allowed).toBe(false);
        });

        it('should reject path traversal in command', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('../../bin/rm');
            expect(result.allowed).toBe(false);
        });

        it('should reject non-string arguments', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('ls', [123 as unknown as string]);
            expect(result.allowed).toBe(false);
        });
    });

    describe('validateOrThrow', () => {
        it('should not throw for safe commands', () => {
            const sanitizer = createDefaultSanitizer();
            expect(() => sanitizer.validateOrThrow('ls', ['-la'])).not.toThrow();
        });

        it('should throw for dangerous commands', () => {
            const sanitizer = createDefaultSanitizer();
            expect(() => sanitizer.validateOrThrow('rm', ['-rf', '/'])).toThrow();
        });
    });

    describe('Allowlist Mode', () => {
        it('should only allow specified commands in allowlist mode', () => {
            const sanitizer = new CommandSanitizer({
                mode: 'allowlist',
                allowedCommands: ['ls', 'cat', 'echo'],
            });

            expect(sanitizer.validate('ls').allowed).toBe(true);
            expect(sanitizer.validate('cat').allowed).toBe(true);
            expect(sanitizer.validate('echo').allowed).toBe(true);
            expect(sanitizer.validate('rm').allowed).toBe(false);
        });

        it('should provide suggested command when blocking', () => {
            const sanitizer = new CommandSanitizer({
                mode: 'allowlist',
                allowedCommands: ['ls', 'cat'],
            });

            const result = sanitizer.validate('rm');
            expect(result.allowed).toBe(false);
            expect(result.suggestedCommand).toBe('ls');
        });
    });

    describe('Configuration', () => {
        it('should allow custom blocked commands', () => {
            const sanitizer = new CommandSanitizer({
                additionalBlockedCommands: ['custom-dangerous'],
            });

            expect(sanitizer.validate('custom-dangerous').allowed).toBe(false);
        });

        it('should get allowed commands list', () => {
            const sanitizer = createDefaultSanitizer();
            const allowed = sanitizer.getAllowedCommands();
            expect(allowed).toContain('ls');
            expect(allowed).toContain('cat');
        });

        it('should get blocked commands list', () => {
            const sanitizer = createDefaultSanitizer();
            const blocked = sanitizer.getBlockedCommands();
            expect(blocked).toContain('rm');
            expect(blocked).toContain('chmod');
        });

        it('should update configuration dynamically', () => {
            const sanitizer = new CommandSanitizer({
                mode: 'blocklist',
                additionalBlockedCommands: [],
            });

            sanitizer.updateConfig({
                additionalBlockedCommands: ['my-custom-blocked'],
            });

            expect(sanitizer.validate('my-custom-blocked').allowed).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty args array', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('ls', []);
            expect(result.allowed).toBe(true);
        });

        it('should handle commands without arguments', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('pwd');
            expect(result.allowed).toBe(true);
        });

        it('should handle undefined args', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('ls', undefined as unknown as string[]);
            expect(result.allowed).toBe(true);
        });

        it('should handle quoted arguments with shell chars', () => {
            const sanitizer = createDefaultSanitizer();
            // Single quotes around semicolon should not bypass detection
            const result = sanitizer.validate('echo', ["'; rm -rf /'"]);
            expect(result.allowed).toBe(false);
        });
    });

    describe('Safe Commands Edge Cases', () => {
        it('should allow find with common options', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('find', ['.', '-name', '*.ts']);
            expect(result.allowed).toBe(true);
        });

        it('should allow grep with common options', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('grep', ['-r', 'pattern', '.']);
            expect(result.allowed).toBe(true);
        });

        it('should allow sed with common options', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('sed', ['-i', 's/old/new/g', 'file.txt']);
            expect(result.allowed).toBe(true);
        });

        it('should allow curl with URLs', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('curl', ['https://example.com/api']);
            expect(result.allowed).toBe(true);
        });

        it('should allow wget with URLs', () => {
            const sanitizer = createDefaultSanitizer();
            const result = sanitizer.validate('wget', ['https://example.com/file.zip']);
            expect(result.allowed).toBe(true);
        });
    });
});
