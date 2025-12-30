/**
 * @fileoverview Via-gent Project Card Component
 * @module components/about/projects/ViaGentCard
 * @governance EPIC-29-6
 *
 * Featured project card for Via-gent with stats, features, tech stack, and links.
 *
 * Story 29.6: Project Showcase Implementation
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Github, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProjectFeature {
  id: string;
  title: string;
  description: string;
}

export interface ViaGentCardProps {
  /**
   * Project features for carousel
   */
  features?: ProjectFeature[];

  /**
   * Whether to show architecture diagram
   */
  showArchitecture?: boolean;
}

export function ViaGentCard({
  features = [],
  showArchitecture = false,
}: ViaGentCardProps) {
  const { t } = useTranslation();
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  // Default features if not provided
  const defaultFeatures: ProjectFeature[] = [
    {
      id: 'browser-ide',
      title: 'Browser-Based IDE',
      description: 'Complete development environment running locally in your browser with WebContainer technology',
    },
    {
      id: 'ai-agents',
      title: '15+ AI Agents',
      description: 'Specialized autonomous agents for development, code review, testing, and documentation',
    },
    {
      id: 'local-first',
      title: 'Local-First Architecture',
      description: 'Workspace syncs with your local file system via File System Access API',
    },
    {
      id: 'multimodal',
      title: 'Multimodal AI',
      description: 'Agents understand and generate text, images, audio, and video content',
    },
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  const nextFeature = () => {
    setActiveFeatureIndex((prev) => (prev + 1) % displayFeatures.length);
  };

  const prevFeature = () => {
    setActiveFeatureIndex((prev) => (prev - 1 + displayFeatures.length) % displayFeatures.length);
  };

  const activeFeature = displayFeatures[activeFeatureIndex];

  return (
    <div className="via-gent-card bg-card border border-border rounded-lg overflow-hidden">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 md:p-8 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Via-gent
            </h3>
            <p className="text-base text-muted-foreground">
              A Browser-Based IDE with AI Agent Capabilities
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="https://github.com/viagent/via-gent"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md bg-background hover:bg-muted transition-colors"
              aria-label="View on GitHub"
            >
              <Github className="w-5 h-5 text-foreground" />
            </a>
            <button
              className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              aria-label="View Live Demo"
            >
              <Play className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b border-border">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-primary mb-1">15+</div>
          <div className="text-xs text-muted-foreground">AI Agents</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-success mb-1">&lt;1</div>
          <div className="text-xs text-muted-foreground">Month</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-info mb-1">10+</div>
          <div className="text-xs text-muted-foreground">Technologies</div>
        </div>
      </div>

      {/* Feature Carousel */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground">Key Features</h4>
          <div className="flex gap-1">
            <button
              onClick={prevFeature}
              className="p-1 rounded hover:bg-muted transition-colors"
              aria-label="Previous feature"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextFeature}
              className="p-1 rounded hover:bg-muted transition-colors"
              aria-label="Next feature"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Feature Display */}
        <div className="min-h-[120px]">
          <h5 className="text-base font-semibold text-primary mb-2">
            {activeFeature.title}
          </h5>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {activeFeature.description}
          </p>
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-1 mt-4 justify-center">
          {displayFeatures.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveFeatureIndex(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                index === activeFeatureIndex
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted hover:bg-muted-foreground'
              )}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Tech Stack Tags */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-foreground mb-3">Technology Stack</h4>
        <div className="flex flex-wrap gap-2">
          {['React 18', 'TypeScript', 'TanStack Router', 'Zustand', 'Dexie', 'WebContainer', 'TailwindCSS', 'Radix UI'].map(
            (tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </div>

      {/* CTA Links */}
      <div className="p-6 border-t border-border bg-muted/30">
        <div className="flex gap-3">
          <a
            href="https://github.com/viagent/via-gent"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            <span className="text-sm font-medium">View Source</span>
          </a>
          <a
            href="#demo"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">Live Demo</span>
          </a>
        </div>
      </div>
    </div>
  );
}
