import { motion } from 'framer-motion';
import { SectionContainer } from '../layout/SectionContainer';
import { Terminal } from 'lucide-react';

export function HeroSection() {
    // const { t } = useTranslation();

    return (
        <SectionContainer className="min-h-[90vh] flex flex-col justify-center overflow-hidden">
            {/* Background Decor Elements */}
            <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col items-start max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2 mb-4"
                >
                    <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Available for Hire
                    </div>
                    <span className="text-muted-foreground text-sm font-mono">Based in Vietnam</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                >
                    Building the Future of <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        Digital Intelligence
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl leading-relaxed"
                >
                    Senior AI Agent Developer & Multi-Agent Systems Architect.
                    Transforming complex workflows into autonomous intelligence with the BMAD Framework.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap gap-4"
                >
                    {/* Primary CTA */}
                    <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-primary px-8 font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <span className="mr-2">View Projects</span>
                        <Terminal size={18} />
                    </button>

                    {/* Secondary CTA */}
                    <button className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                        Download CV
                    </button>
                </motion.div>
            </div>

            {/* Tech Stack Ticker (Abstract) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="absolute bottom-10 left-0 w-full overflow-hidden whitespace-nowrap opacity-50"
            >
                <div className="animate-ticker inline-block">
                    <span className="mx-4 font-mono text-sm text-muted-foreground">AGENTS</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">•</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">REACT 18</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">•</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">NEXT.JS</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">•</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">WEBCONTAINERS</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">•</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">TYPESCRIPT</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">•</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">BMAD V6</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">•</span>
                    <span className="mx-4 font-mono text-sm text-muted-foreground">LLM ORCHESTRATION</span>
                </div>
            </motion.div>

        </SectionContainer>
    );
}
