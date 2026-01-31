import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SectionContainer } from '../layout/SectionContainer';
import { GraduationCap, Brain, Code2, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineItemProps {
    icon: React.ElementType;
    year: string;
    title: string;
    description: string;
    skills: string[];
    align: 'left' | 'right';
    delay: number;
}

const TimelineItem = ({ icon: Icon, year, title, description, skills, align, delay }: TimelineItemProps) => {
    return (
        <div className={cn("relative flex items-center justify-between w-full mb-8 md:mb-12",
            align === 'left' ? 'flex-row-reverse' : '')}>

            {/* Spacer for opposite side */}
            <div className="hidden md:block w-5/12" />

            {/* Center Line visual */}
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 flex flex-col items-center h-full">
                <div className="w-px h-full bg-border/50 absolute top-0" />
                <div className="z-10 p-2 rounded-full bg-background border border-primary/20 shadow-lg shadow-primary/5">
                    <Icon size={20} className="text-primary" />
                </div>
            </div>

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, x: align === 'left' ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay }}
                className={cn("w-full md:w-5/12 pl-12 md:pl-0",
                    align === 'left' ? 'md:pr-8 text-right' : 'md:pl-8 text-left')}
            >
                <div className="bg-card border border-border/50 p-6 rounded-xl hover:border-primary/20 transition-colors">
                    <div className={cn("flex items-center gap-3 mb-2", align === 'left' ? 'md:flex-row-reverse' : '')}>
                        <span className="font-mono text-sm text-primary/80">{year}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{description}</p>
                    <div className={cn("flex flex-wrap gap-2", align === 'left' ? 'md:justify-end' : '')}>
                        {skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground font-mono">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export function JourneySection() {
    const { t } = useTranslation();

    return (
        <SectionContainer className="bg-background/50">
            <div className="text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-bold mb-4"
                >
                    {t('about.journey.title')} <span className="text-primary">{t('about.journey.titleHighlight1')}</span> {t('about.journey.titleHighlight2')} <span className="text-accent">{t('about.journey.titleHighlight3')}</span>
                </motion.h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t('about.journey.subtitle')}
                </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
                <TimelineItem
                    icon={GraduationCap}
                    year="2018 - 2023"
                    title={t('about.journey.item1.title')}
                    description={t('about.journey.item1.desc')}
                    skills={['System Design', 'Human Logic', 'Process Optimization']}
                    align="right"
                    delay={0}
                />

                <TimelineItem
                    icon={Brain}
                    year="2023 - 2024"
                    title={t('about.journey.item2.title')}
                    description={t('about.journey.item2.desc')}
                    skills={['Linguistic Logic', 'Prompt Engineering', 'Semantic Analysis']}
                    align="left"
                    delay={0.2}
                />

                <TimelineItem
                    icon={Code2}
                    year="2024 - 2025"
                    title={t('about.journey.item3.title')}
                    description={t('about.journey.item3.desc')}
                    skills={['React 18', 'TypeScript', 'Vector DB', 'RAG']}
                    align="right"
                    delay={0.4}
                />

                <TimelineItem
                    icon={Rocket}
                    year="Now"
                    title={t('about.journey.item4.title')}
                    description={t('about.journey.item4.desc')}
                    skills={['Orchestration', 'BMAD Framework', 'Agentic Patterns']}
                    align="left"
                    delay={0.6}
                />
            </div>
        </SectionContainer>
    );
}
