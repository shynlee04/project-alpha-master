/**
 * @fileoverview Project Card Component (Simplified for Spike)
 */
import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Folder, Clock, CheckCircle2 } from 'lucide-react';
import type { Project, WorkspaceBindings } from '@/spike/infrastructure/persistence/stores/project/project-types';
import { cn } from '@/spike/lib/utils';

export interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
  className?: string;
}

function getEnabledWorkspaces(bindings: WorkspaceBindings | undefined): string[] {
  if (!bindings) return [];
  return (Object.entries(bindings) as Array<[string, boolean]>)
    .filter(([_, enabled]) => enabled)
    .map(([workspace]) => workspace);
}

function WorkspaceBadge({ workspace }: { workspace: string }) {
  const icons: Record<string, string> = {
    ide: '💻',
    notes: '📝',
    knowledge: '📚',
    study: '🎓',
  };
  const labels: Record<string, string> = {
    ide: 'IDE',
    notes: 'NOTES',
    knowledge: 'KNOWLEDGE',
    study: 'STUDY',
  };
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] uppercase font-pixel bg-primary/10 text-primary border border-primary/30">
      {icons[workspace] || '📁'} {labels[workspace] || workspace.toUpperCase()}
    </span>
  );
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen, className }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const boundWorkspaces = useMemo(
    () => getEnabledWorkspaces(project.workspaceBindings),
    [project.workspaceBindings]
  );

  const handleWorkspaceClick = (workspace: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: `/${workspace}/$projectId`, params: { projectId: project.id } });
  };

  const lastOpened = project.lastOpened 
    ? new Date(project.lastOpened).toLocaleDateString()
    : 'Never';

  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-4 p-3 items-center hover:bg-primary/5 cursor-pointer group transition-all duration-200 relative',
        className
      )}
      onClick={() => onOpen(project.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="col-span-8 md:col-span-5 flex flex-col gap-2 overflow-hidden pl-2">
        <div className="flex items-center gap-3">
          <Folder className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          <span className="font-mono text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {project.name}
          </span>
        </div>
        {boundWorkspaces.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {boundWorkspaces.map((ws) => (
              <WorkspaceBadge key={ws} workspace={ws} />
            ))}
          </div>
        )}
      </div>
      <div className="col-span-3 md:col-span-2 hidden md:block">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase font-pixel bg-green-500/10 text-success border border-green-500/30">
          <CheckCircle2 className="w-3 h-3" />ACTIVE
        </span>
      </div>
      <div className="col-span-4 md:col-span-3 text-right">
        <span className="text-xs font-mono text-muted-foreground flex items-center justify-end gap-1">
          <Clock className="h-3 w-3" />{lastOpened}
        </span>
      </div>
      <div className="col-span-2 md:col-span-2 text-right hidden md:block pr-2">
        <span className="text-xs font-mono text-muted-foreground">--</span>
      </div>
    </div>
  );
};
