import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SectionContainer } from '../layout/SectionContainer';
import { Terminal } from 'lucide-react';

export function HeroSection() {
    const { t } = useTranslation();

    return (
        <SectionContainer className="min-h-screen flex flex-col justify-center overflow-hidden py-20 lg:py-0">
            {/* Background Decor Elements */}
            <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col items-start max-w-4xl mx-auto w-full px-4 md:px-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-wrap items-center gap-3 mb-6"
                >
                    <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        {t('about.hero.available')}
                    </div>
                    <span className="text-muted-foreground text-sm font-mono hidden sm:inline-block">/</span>
                    <span className="text-muted-foreground text-sm font-mono">{t('about.hero.location')}</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
                >
                    {t('about.hero.title')} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent bg-[200%_auto] hover:animate-shine transition-all">
                        {t('about.hero.titleHighlight')}
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
                >
                    {t('about.hero.subtitle')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    {/* Primary CTA */}
                    <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-primary px-8 font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <span className="mr-2">{t('about.hero.viewProjects')}</span>
                        <Terminal size={18} />
                    </button>

                    {/* Secondary CTA */}
                    <button className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                        {t('about.hero.downloadCV')}
                    </button>
                </motion.div>
            </div>

            {/* Tech Stack Ticker (Abstract) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="absolute bottom-10 left-0 w-full overflow-hidden whitespace-nowrap opacity-30 select-none pointer-events-none"
            >
                <div className="animate-ticker inline-block">
                    {['AGENTS', 'REACT 18', 'NEXT.JS', 'WEBCONTAINERS', 'TYPESCRIPT', 'BMAD V6', 'LLM ORCHESTRATION', 'AGENTS', 'REACT 18', 'NEXT.JS'].map((item, i) => (
                        <span key={i} className="mx-4 font-mono text-xs md:text-sm text-muted-foreground">
                            {item} •
                        </span>
                    ))}
                </div>
            </motion.div>

        </SectionContainer>
    );
}
