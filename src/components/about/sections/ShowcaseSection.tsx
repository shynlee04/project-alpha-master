import { motion } from 'framer-motion';
import { SectionContainer } from '../layout/SectionContainer';
import { Terminal, Database, Cloud, Code } from 'lucide-react';

export function ShowcaseSection() {
    return (
        <SectionContainer className="bg-secondary/10">
            <div className="flex flex-col md:flex-row gap-12 items-center">

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-mono">
                        <Terminal size={14} />
                        <span>Featured Project</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                        Via-gent: <br />
                        <span className="text-primary">The IDE that builds itself.</span>
                    </h2>

                    <p className="text-muted-foreground text-lg leading-relaxed">
                        A fully browser-based Integrated Development Environment capable of running Node.js, editing code, and deploying applications directly from your browser.
                        Powered by WebContainers and multi-agent orchestration.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-lg bg-background border border-border">
                            <Database className="mb-2 text-primary" size={24} />
                            <h4 className="font-bold">Local-First</h4>
                            <p className="text-xs text-muted-foreground">IndexedDB & OPFS for persistent storage.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-background border border-border">
                            <Cloud className="mb-2 text-primary" size={24} />
                            <h4 className="font-bold">Edge Capable</h4>
                            <p className="text-xs text-muted-foreground">Deploys to Cloudflare Workers in seconds.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Interactive/Visual Side */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex-1 w-full"
                >
                    <div className="relative rounded-xl border border-border/50 bg-background/50 shadow-2xl overflow-hidden aspect-video group">
                        {/* Mock UI of the IDE itself */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />

                        <div className="absolute top-0 left-0 w-full h-8 bg-muted/80 border-b border-border flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="ml-4 w-64 h-4 rounded-md bg-background/50" />
                        </div>

                        <div className="absolute inset-0 top-8 p-6 flex items-center justify-center">
                            <div className="text-center">
                                <Code size={64} className="mx-auto mb-4 text-primary/20 group-hover:text-primary/80 transition-colors duration-500" />
                                <p className="font-mono text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                    You are currently using this project.
                                </p>
                                <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    View Source Code
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </SectionContainer>
    );
}
