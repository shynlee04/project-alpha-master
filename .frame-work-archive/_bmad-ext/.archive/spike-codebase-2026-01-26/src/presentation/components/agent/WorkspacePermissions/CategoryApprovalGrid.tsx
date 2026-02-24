/**
 * @fileoverview Category Approval Grid Component
 * @module presentation/components/agent/WorkspacePermissions/CategoryApprovalGrid
 *
 * Category-based tool approval for workspace permissions
 * When a category is approved, all tools in that category execute without approval
 *
 * ARCH-01.4 - Agent Tool Permission Matrix
 *
 * Features:
 * - Grid layout with category switches
 * - Category icons and descriptions
 * - Workspace-specific approvals
 * - 8-bit styled UI
 */

import { useToolPermissionStore, type ToolCategory } from '@/infrastructure/persistence/stores/permissions/tool-permission-store';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import { Switch } from '@radix-ui/react-switch';

/**
 * Tool category metadata
 */
interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  tools: string[];
}

/**
 * Category definitions with icons and descriptions
 */
const TOOL_CATEGORIES_INFO: CategoryInfo[] = [
  {
    id: 'files',
    name: 'Files',
    description: 'Read, write, create, and delete files',
    icon: '📁',
    tools: ['read_file', 'write_file', 'create_directory', 'delete_file'],
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Execute shell commands',
    icon: '⌨️',
    tools: ['execute_command'],
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    description: 'Search and add to knowledge base',
    icon: '🧠',
    tools: ['search_knowledge', 'add_to_knowledge'],
  },
  {
    id: 'vision',
    name: 'Vision',
    description: 'Analyze images and screenshots',
    icon: '👁️',
    tools: ['analyze_image', 'capture_screen'],
  },
  {
    id: 'search',
    name: 'Search',
    description: 'Search files and web',
    icon: '🔍',
    tools: ['web_search', 'search_files'],
  },
  {
    id: 'web',
    name: 'Web',
    description: 'Fetch and browse web pages',
    icon: '🌐',
    tools: ['fetch_url', 'browse_web'],
  },
];

/**
 * Props for CategoryApprovalGrid component
 */
export interface CategoryApprovalGridProps {
  /** Workspace to manage approvals for */
  workspaceType: WorkspaceType;
  /** Optional className for styling */
  className?: string;
}

/**
 * Category Approval Grid Component
 *
 * Allows users to approve/disapprove tool categories for a workspace
 * When a category is approved, all tools in that category bypass permission checks
 */
export function CategoryApprovalGrid({ workspaceType, className = '' }: CategoryApprovalGridProps) {
  const categoryApprovals = useToolPermissionStore((s) => s.categoryApprovals[workspaceType]);
  const setCategoryApproval = useToolPermissionStore((s) => s.setCategoryApproval);

  const handleToggle = (category: ToolCategory) => {
    const currentValue = categoryApprovals?.[category] ?? false;
    setCategoryApproval(category, workspaceType, !currentValue);
  };

  const isApproved = (category: ToolCategory) => {
    return categoryApprovals?.[category] ?? false;
  };

  return (
    <div className={`category-approval-grid ${className}`}>
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-pixel text-muted-foreground mb-1">
          Category Approvals
        </h3>
        <p className="text-xs text-muted-foreground">
          Approve categories to bypass approval prompts for all tools in that category.
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-2">
        {TOOL_CATEGORIES_INFO.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            approved={isApproved(category.id)}
            onToggle={() => handleToggle(category.id)}
          />
        ))}
      </div>

      {/* Reset All Button */}
      <button
        onClick={() => {
          TOOL_CATEGORIES_INFO.forEach((cat) => {
            setCategoryApproval(cat.id, workspaceType, false);
          });
        }}
        className="mt-3 w-full py-1.5 text-xs bg-secondary hover:bg-muted rounded border border-border text-muted-foreground"
      >
        Reset All
      </button>

      {/* Styles */}
      <style>{`
        .category-card {
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 8px;
          padding: 10px;
          transition: all 0.2s;
        }
        .category-card:hover {
          border-color: #4b5563;
        }
        .category-card-approved {
          background: #065f46;
          border-color: #10b981;
        }
        .category-switch {
          width: 36px;
          height: 20px;
          background: #374151;
          border-radius: 10px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
        }
        .category-switch[data-state="checked"] {
          background: #10b981;
        }
        .category-switch::before {
          content: '';
          position: absolute;
          width: 14px;
          height: 14px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: transform 0.2s;
        }
        .category-switch[data-state="checked"]::before {
          transform: translateX(16px);
        }
      `}</style>
    </div>
  );
}

/**
 * Category Card Component
 */
interface CategoryCardProps {
  category: CategoryInfo;
  approved: boolean;
  onToggle: () => void;
}

function CategoryCard({ category, approved, onToggle }: CategoryCardProps) {
  return (
    <div
      className={`category-card ${approved ? 'category-card-approved' : ''}`}
    >
      {/* Header: Icon + Switch */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{category.icon}</span>
          <span className="text-sm font-medium text-foreground">
            {category.name}
          </span>
        </div>

        <Switch
          checked={approved}
          onCheckedChange={onToggle}
          className="category-switch"
        />
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground">
        {category.description}
      </p>

      {/* Tool count */}
      <p className="text-xs text-muted-foreground mt-1">
        {category.tools.length} {category.tools.length === 1 ? 'tool' : 'tools'}
      </p>

      {/* Approved indicator */}
      {approved && (
        <div className="mt-2 flex items-center gap-1 text-xs text-success">
          <span>✓</span>
          <span>Auto-approved</span>
        </div>
      )}
    </div>
  );
}
