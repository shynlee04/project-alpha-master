import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SectionContainer } from '../layout/SectionContainer';
import { Terminal, Copy, Check } from 'lucide-react';

export function ContactSection() {
    const { t } = useTranslation();
    const [command, setCommand] = useState('');
    const [output, setOutput] = useState<string[]>(['> Initializing secure connection...', '> Ready. Type a message to contact.']);
    const [copied, setCopied] = useState(false);
    const email = "contact@via-gent.dev";

    const handleCopy = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        // Simulate terminal response
        const newOutput = [...output, `> ${command}`, '> Sending transmission...', '> Error: SMTP server not found (Just kidding, click the email below!)'];
        setOutput(newOutput.slice(-5)); // Keep last 5 lines
        setCommand('');
    };

    return (
        <SectionContainer className="min-h-[60dvh] flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full max-w-2xl"
            >
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="ml-2 font-mono text-sm text-muted-foreground">{t('about.contact.terminal.title')}</span>
                </div>

                <div className="bg-[var(--color-overlay)] rounded-lg border border-primary/20 p-6 shadow-2xl font-mono text-sm md:text-base relative overflow-hidden">
                    {/* Scanline effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]" />

                    <div className="relative z-20 space-y-2 text-primary/80">
                        {output.map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}

                        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4 text-primary">
                            <span>{'>'}</span>
                            <input
                                type="text"
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                                className="bg-transparent border-none outline-none flex-1 font-mono text-primary placeholder-primary/30"
                                placeholder="echo 'Hello World'"
                                autoFocus
                            />
                        </form>
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <p className="text-muted-foreground">{t('about.contact.connect')}</p>

                    <div className="flex gap-4">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                        >
                            <span className="font-mono">{email}</span>
                            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        </button>

                        <a
                            href="https://github.com/viagent"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                            <Terminal size={14} />
                            <span>GitHub</span>
                        </a>
                    </div>
                </div>

            </motion.div>
        </SectionContainer>
    );
}
