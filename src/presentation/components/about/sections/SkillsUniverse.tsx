import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SectionContainer } from '../layout/SectionContainer';
import { cn } from '@/lib/utils';

interface SkillNode {
    id: string;
    label: string;
    category: 'frontend' | 'backend' | 'agentic' | 'core';
    x: number;
    y: number;
    size: number;
}

const skills: SkillNode[] = [
    // CORE / AGENTIC (Center)
    { id: 'bmad', label: 'BMAD V6', category: 'agentic', x: 50, y: 50, size: 1.5 },
    { id: 'agents', label: 'Multi-Agent', category: 'agentic', x: 35, y: 40, size: 1.2 },
    { id: 'llm', label: 'LLM Ops', category: 'agentic', x: 65, y: 40, size: 1.2 },

    // FRONTEND (Left)
    { id: 'react', label: 'React 18', category: 'frontend', x: 20, y: 30, size: 1.3 },
    { id: 'ts', label: 'TypeScript', category: 'frontend', x: 25, y: 60, size: 1.2 },
    { id: 'tailwind', label: 'Tailwind', category: 'frontend', x: 10, y: 45, size: 1.0 },

    // BACKEND / INFRA (Right)
    { id: 'node', label: 'Node.js', category: 'backend', x: 80, y: 30, size: 1.1 },
    { id: 'wasm', label: 'WebContainer', category: 'backend', x: 75, y: 60, size: 1.3 },
    { id: 'kv', label: 'Vector DB', category: 'backend', x: 90, y: 45, size: 1.1 },
];

export function SkillsUniverse() {
    const { t } = useTranslation();
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'agentic': return 'bg-primary text-primary-foreground';
            case 'frontend': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'backend': return 'bg-green-500/20 text-green-400 border-green-500/50';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <SectionContainer className="min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('about.skills.title')} <span className="text-primary">{t('about.skills.titleHighlight')}</span></h2>
                <p className="text-muted-foreground">{t('about.skills.subtitle')}</p>
            </div>

            <div className="relative w-full max-w-4xl aspect-[4/3] md:aspect-[16/9] border border-border/50 rounded-xl bg-background shadow-2xl overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                {/* Connecting Lines (Decorative) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="currentColor" strokeWidth="1" />
                    <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="currentColor" strokeWidth="1" />
                    <line x1="50%" y1="50%" x2="25%" y2="60%" stroke="currentColor" strokeWidth="1" />
                    <line x1="50%" y1="50%" x2="75%" y2="60%" stroke="currentColor" strokeWidth="1" />
                </svg>

                {/* Nodes */}
                {skills.map((skill) => (
                    <motion.div
                        key={skill.id}
                        className={cn(
                            "absolute flex items-center justify-center rounded-full border cursor-pointer transition-all duration-300 shadow-lg font-mono font-bold text-xs md:text-sm text-center px-4",
                            getCategoryColor(skill.category)
                        )}
                        style={{
                            left: `${skill.x}%`,
                            top: `${skill.y}%`,
                            width: `${skill.size * 5}rem`,
                            height: `${skill.size * 5}rem`,
                            zIndex: hoveredSkill === skill.id ? 20 : 10,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        onHoverStart={() => setHoveredSkill(skill.id)}
                        onHoverEnd={() => setHoveredSkill(null)}
                        drag
                        dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                    >
                        {skill.label}
                    </motion.div>
                ))}
            </div>
        </SectionContainer>
    );
}
