# Linkage/Relationship Visualization UI Patterns - 2026

**Document ID**: UI-2026-001
**Date**: 2026-01-02
**Phase**: Epic 28 - Canvas Linkage System
**Team**: UI/UX Design
**Agent Mode**: @bmad-bmm-ux-designer

---

## Executive Summary

This document provides comprehensive UI patterns for visualizing AI-proposed linkages between canvas nodes, based on research into modern React visualization libraries, confidence badge patterns, proposal card interactions, and 2026 design trends.

**Key Technologies Researched:**
- React Flow (node-edge visualization)
- Confidence badge visual encoding
- Swipe-based proposal interactions
- Tooltip/hover card patterns
- Progress indicators for linkage analysis

---

## 1. Core Visualization Component Architecture

### 1.1 Technology Stack Recommendations

Based on research findings, the recommended stack for linkage visualization:

**Primary Library**: [React Flow](https://reactflow.dev/)
- Most mature React library for node-based UIs
- Built-in support for custom node/edge types
- Excellent TypeScript support
- Performance-optimized for large graphs
- Active community and documentation

**Alternative Libraries**:
- [Syncfusion React Diagram](https://www.syncfusion.com/react-components/react-diagram) - For more comprehensive diagramming needs
- [Grafana Node Graph](https://grafana.com/docs/grafana-cloud/visualizations/panels-visualizations/visualizations/node-graph/) - For monitoring-style visualizations

### 1.2 Component Structure

```typescript
// LinkageVisualization.tsx
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';

import 'reactflow/dist/style.css';

interface LinkageVisualizationProps {
  nodes: CanvasNode[];
  proposedLinkages: ProposedLinkage[];
  acceptedLinkages: Linkage[];
  onAcceptLinkage: (proposalId: string) => void;
  onRejectLinkage: (proposalId: string) => void;
  onLinkageClick: (linkageId: string) => void;
}

export const LinkageVisualization: React.FC<LinkageVisualizationProps> = ({
  nodes,
  proposedLinkages,
  acceptedLinkages,
  onAcceptLinkage,
  onRejectLinkage,
  onLinkageClick,
}) => {
  const [flowNodes, setFlowNodes] = useNodesState([]);
  const [flowEdges, setFlowEdges] = useEdgesState([]);

  // Transform canvas nodes to React Flow nodes
  // Transform linkages to React Flow edges with confidence badges
  // Handle proposal state management

  return (
    <div className="linkage-visualization">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
```

---

## 2. Confidence Badge System

### 2.1 Visual Encoding Framework

Based on research from [Visualization Badges Research (2025)](https://hal.science/hal-05199752/file/Visualization_Badges_VIS_2025%2520%25283%2529.pdf), confidence badges should use **multi-dimensional encoding**:

**Visual Elements** (from [Data Visualization Best Practices 2025](https://kpinfo.tech/data-visualization-best-practices/)):
- ✅ Color (primary)
- ✅ Icons (secondary reinforcement)
- ✅ Text labels (accessibility)
- ✅ Patterns (for color-blind users)

### 2.2 Confidence Level Design Specification

```typescript
// confidence-badge.tsx
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  score: number; // 0-100
  showScore?: boolean;
}

const CONFIDENCE_CONFIG = {
  [ConfidenceLevel.HIGH]: {
    label: 'High Confidence',
    color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    icon: CheckCircle2,
    threshold: 75,
  },
  [ConfidenceLevel.MEDIUM]: {
    label: 'Medium Confidence',
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    icon: AlertTriangle,
    threshold: 50,
  },
  [ConfidenceLevel.LOW]: {
    label: 'Low Confidence',
    color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    icon: XCircle,
    threshold: 0,
  },
};

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  level,
  score,
  showScore = false,
}) => {
  const config = CONFIDENCE_CONFIG[level];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.color} flex items-center gap-1.5 font-medium`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      {showScore && (
        <span className="text-xs opacity-75">({score}%)</span>
      )}
    </Badge>
  );
};
```

### 2.3 Connection Type Badges

Based on [badge color coding research](https://www.weareconflux.com/en/blog/art-of-badge-creating-event-passes-that-foster-connection-and-boost-roi/):

```typescript
// connection-type-badge.tsx
export enum ConnectionType {
  SEMANTIC = 'semantic',      // Conceptual similarity
  CITATION = 'citation',       // Direct citation/reference
  DERIVATION = 'derivation',   // Derived from/related to
  TEMPORAL = 'temporal',       // Time-based relationship
  HIERARCHICAL = 'hierarchical', // Parent-child
}

const CONNECTION_TYPE_CONFIG = {
  [ConnectionType.SEMANTIC]: {
    label: 'Semantic',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    icon: Link2,
    description: 'Conceptually related content',
  },
  [ConnectionType.CITATION]: {
    label: 'Citation',
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    icon: Quote,
    description: 'Direct reference or citation',
  },
  [ConnectionType.DERIVATION]: {
    label: 'Derived',
    color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
    icon: GitBranch,
    description: 'Derived or evolved from',
  },
  [ConnectionType.TEMPORAL]: {
    label: 'Temporal',
    color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    icon: Clock,
    description: 'Time-based relationship',
  },
  [ConnectionType.HIERARCHICAL]: {
    label: 'Hierarchy',
    color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
    icon: Network,
    description: 'Parent-child relationship',
  },
};
```

---

## 3. Proposal Card Component

### 3.1 Accept/Reject Interaction Pattern

Based on research into [Tinder-esque swipe interfaces](https://medium.com/@phillfarrugia/building-a-tinder-esque-card-interface-5afa63c6d3db) and [UX Stack Exchange best practices](https://ux.stackexchange.com/questions/122857/accept-reject-cta-buttons-on-cards):

```typescript
// linkage-proposal-card.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from './confidence-badge';
import { ConnectionTypeBadge } from './connection-type-badge';
import { Check, X, Info } from 'lucide-react';

interface LinkageProposal {
  id: string;
  sourceNode: CanvasNode;
  targetNode: CanvasNode;
  confidence: number;
  connectionType: ConnectionType;
  reasoning: string;
  evidence: string[];
  suggestedLabel: string;
}

interface LinkageProposalCardProps {
  proposal: LinkageProposal;
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  onShowDetails: (proposalId: string) => void;
}

export const LinkageProposalCard: React.FC<LinkageProposalCardProps> = ({
  proposal,
  onAccept,
  onReject,
  onShowDetails,
}) => {
  const confidenceLevel = getConfidenceLevel(proposal.confidence);

  return (
    <Card className="linkage-proposal-card hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            {/* Connection Type Badge */}
            <ConnectionTypeBadge type={proposal.connectionType} />

            {/* Node Names */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{proposal.sourceNode.title}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{proposal.targetNode.title}</span>
            </div>

            {/* Confidence Badge */}
            <ConfidenceBadge
              level={confidenceLevel}
              score={proposal.confidence}
              showScore
            />
          </div>

          {/* Details Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onShowDetails(proposal.id)}
            aria-label="Show linkage details"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Suggested Label */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Suggested Label
          </label>
          <p className="text-sm mt-1">{proposal.suggestedLabel}</p>
        </div>

        {/* AI Reasoning */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            AI Reasoning
          </label>
          <p className="text-sm mt-1 leading-relaxed">
            {proposal.reasoning}
          </p>
        </div>

        {/* Evidence List */}
        {proposal.evidence.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Supporting Evidence ({proposal.evidence.length})
            </label>
            <ul className="text-sm mt-1 space-y-1 list-disc list-inside">
              {proposal.evidence.slice(0, 3).map((evidence, idx) => (
                <li key={idx} className="text-muted-foreground">
                  {evidence}
                </li>
              ))}
              {proposal.evidence.length > 3 && (
                <li className="text-muted-foreground">
                  +{proposal.evidence.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {/* Reject - Secondary/Destructive */}
          <Button
            variant="outline"
            className="flex-1 border-red-500/20 hover:bg-red-500/10 hover:text-red-600"
            onClick={() => onReject(proposal.id)}
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>

          {/* Accept - Primary/Emphasized */}
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => onAccept(proposal.id)}
          >
            <Check className="w-4 h-4 mr-2" />
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 3.2 Swipe Interaction (Mobile)

Based on [Tinder-style swipe patterns](https://codingartistweb.com/2025/06/creating-a-tinder-style-swipe-card-ui-with-html-css-javascript):

```typescript
// swipeable-proposal-card.tsx (Mobile)
import { useSwipeable } from 'react-swipeable';

export const SwipeableProposalCard: React.FC<LinkageProposalCardProps> = ({
  proposal,
  onAccept,
  onReject,
  onShowDetails,
}) => {
  const handlers = useSwipeable({
    onSwipedRight: () => onAccept(proposal.id),
    onSwipedLeft: () => onReject(proposal.id),
    onSwipedUp: () => onShowDetails(proposal.id),
    trackMouse: true,
  });

  return (
    <div {...handlers} className="touch-none">
      <LinkageProposalCard
        proposal={proposal}
        onAccept={onAccept}
        onReject={onReject}
        onShowDetails={onShowDetails}
      />
      <p className="text-xs text-center text-muted-foreground mt-2">
        Swipe right to accept • left to reject • up for details
      </p>
    </div>
  );
};
```

---

## 4. Edge Visualization with Labels

### 4.1 React Flow Custom Edge

Based on [React Flow examples](https://reactflow.dev/examples) and [graph visualization UX research](https://cambridge-intelligence.com/graph-visualization-ux-how-to-avoid-wrecking-your-graph-visualization/):

```typescript
// custom-edge-with-label.tsx
import {
  EdgeLabelRenderer,
  EdgeProps,
  getMarkerEnd,
  useReactFlow,
} from 'reactflow';
import { ConfidenceBadge } from './confidence-badge';
import { ConnectionTypeBadge } from './connection-type-badge';

interface CustomEdgeData {
  confidence: number;
  connectionType: ConnectionType;
  isProposed: boolean;
  label?: string;
}

export const CustomEdgeWithLabel: React.FC<EdgeProps<CustomEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  source,
  target,
  data,
  markerEnd,
}) => {
  const { getEdge } = useReactFlow();
  const edge = getEdge(id);

  // Calculate edge path
  const edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  // Calculate label position (midpoint)
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  // Style based on proposal state
  const edgeStyle = data?.isProposed
    ? 'stroke-dasharray: 5,5; stroke: #f59e0b;' // Dashed amber for proposed
    : 'stroke: #10b981;'; // Solid green for accepted

  return (
    <>
      <path
        id={id}
        style={edgeStyle}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Edge Label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className="flex flex-col items-center gap-1 bg-background/95 backdrop-blur border rounded-lg p-2 shadow-md">
            {/* Connection Type */}
            <ConnectionTypeBadge type={data?.connectionType} size="sm" />

            {/* Confidence Badge (if proposed) */}
            {data?.isProposed && (
              <ConfidenceBadge
                level={getConfidenceLevel(data.confidence)}
                score={data.confidence}
              />
            )}

            {/* Label (if provided) */}
            {data?.label && (
              <span className="text-xs font-medium text-center max-w-32">
                {data.label}
              </span>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
```

### 4.2 Edge Label Styling

Based on [Material Design data visualization guidelines](https://m2.material.io/design/communication/data-visualization.html):

```css
/* edge-labels.css */
.edge-label {
  /* Background with backdrop blur for readability */
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);

  /* Rounded corners */
  border-radius: 8px;

  /* Padding for visual breathing room */
  padding: 6px 10px;

  /* Subtle border */
  border: 1px solid rgba(255, 255, 255, 0.1);

  /* Shadow for depth */
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(0, 0, 0, 0.1);

  /* Maximum width to prevent overflow */
  max-width: 150px;

  /* Center alignment */
  text-align: center;
}

.edge-label-proposed {
  /* Dashed border for proposed edges */
  border-style: dashed;

  /* Amber color accent */
  border-color: rgba(245, 158, 11, 0.5);
}

.edge-label-accepted {
  /* Solid border for accepted edges */
  border-style: solid;

  /* Green color accent */
  border-color: rgba(16, 185, 129, 0.5);
}
```

---

## 5. Tooltip/Hover Card Pattern

### 5.1 Rich Tooltip with Linkage Details

Based on [shadcn hover card patterns](https://www.shadcn.io/patterns/hover-card-info-1) and [AI-powered tooltip trends for 2026](https://vocal.media/journal/react-native-tooltip-implementation-tips-and-best-practices-2026):

```typescript
// linkage-tooltip.tsx
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ConfidenceBadge } from './confidence-badge';
import { ConnectionTypeBadge } from './connection-type-badge';

interface LinkageTooltipProps {
  children: React.ReactNode;
  linkage: Linkage | ProposedLinkage;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const LinkageTooltip: React.FC<LinkageTooltipProps> = ({
  children,
  linkage,
  onEdit,
  onDelete,
}) => {
  const isProposed = 'confidence' in linkage;

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80"
        side="top"
        align="center"
        sideOffset={8}
      >
        <div className="space-y-3">
          {/* Header with Badges */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <ConnectionTypeBadge type={linkage.connectionType} />
              {isProposed && (
                <ConfidenceBadge
                  level={getConfidenceLevel(linkage.confidence)}
                  score={linkage.confidence}
                  showScore
                />
              )}
            </div>

            {/* Status Indicator */}
            <Badge variant={isProposed ? 'outline' : 'default'}>
              {isProposed ? 'Proposed' : 'Accepted'}
            </Badge>
          </div>

          {/* Node Information */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{linkage.sourceNode.title}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium">{linkage.targetNode.title}</span>
            </div>
          </div>

          {/* Linkage Label */}
          {linkage.label && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Label
              </label>
              <p className="text-sm">{linkage.label}</p>
            </div>
          )}

          {/* AI Reasoning (for proposed linkages) */}
          {isProposed && linkage.reasoning && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Why This Connection?
              </label>
              <p className="text-sm leading-relaxed">
                {linkage.reasoning}
              </p>
            </div>
          )}

          {/* Evidence List (if available) */}
          {isProposed && linkage.evidence && linkage.evidence.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Evidence ({linkage.evidence.length})
              </label>
              <ul className="text-sm mt-1 space-y-1 list-disc list-inside">
                {linkage.evidence.slice(0, 3).map((evidence, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    {evidence}
                  </li>
                ))}
                {linkage.evidence.length > 3 && (
                  <li className="text-muted-foreground">
                    +{linkage.evidence.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created {formatDistanceToNow(linkage.createdAt)} ago</span>
              {!isProposed && (
                <div className="flex gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={onEdit}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={onDelete}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
```

### 5.2 Keyboard Accessibility

Based on [ARIA tooltip role guidelines](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tooltip_role):

```typescript
// Accessible tooltip wrapper
export const AccessibleTooltip: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
}> = ({ content, children }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          role="tooltip"
          side="top"
          className="max-w-sm"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
```

---

## 6. Progress Indicators for Linkage Analysis

### 6.1 Analysis Progress Component

Based on [Nielsen Norman Group progress indicators research](https://www.nngroup.com/articles/progress-indicators/) and [Material Design 3 guidelines](https://m3.material.io/components/progress-indicators/overview):

```typescript
// linkage-analysis-progress.tsx
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface AnalysisStage {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
}

interface LinkageAnalysisProgressProps {
  stages: AnalysisStage[];
  currentStage: number;
  totalNodes: number;
  analyzedNodes: number;
  estimatedTimeRemaining?: number; // seconds
}

export const LinkageAnalysisProgress: React.FC<LinkageAnalysisProgressProps> = ({
  stages,
  currentStage,
  totalNodes,
  analyzedNodes,
  estimatedTimeRemaining,
}) => {
  const progress = (analyzedNodes / totalNodes) * 100;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <div>
            <h3 className="font-semibold">Analyzing Linkages</h3>
            <p className="text-sm text-muted-foreground">
              {analyzedNodes} of {totalNodes} nodes analyzed
            </p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Time Estimate */}
        {estimatedTimeRemaining && (
          <p className="text-xs text-muted-foreground">
            Estimated time remaining: {formatTime(estimatedTimeRemaining)}
          </p>
        )}

        {/* Stage Breakdown */}
        <div className="space-y-3">
          {stages.map((stage, idx) => (
            <AnalysisStageRow
              key={stage.id}
              stage={stage}
              isActive={idx === currentStage}
            />
          ))}
        </div>

        {/* Current Stage Detail */}
        {stages[currentStage] && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm font-medium">
              {stages[currentStage].label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stages[currentStage].description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Stage Row Component
const AnalysisStageRow: React.FC<{
  stage: AnalysisStage;
  isActive: boolean;
}> = ({ stage, isActive }) => {
  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-muted-foreground" />,
    'in-progress': <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
    complete: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${isActive ? 'font-medium' : ''}`}>
      {statusIcons[stage.status]}
      <span className={stage.status === 'complete' ? 'text-muted-foreground' : ''}>
        {stage.label}
      </span>
    </div>
  );
};
```

### 6.2 Skeleton Loading State

Based on [loading states design guide](https://teamtreehouse.com/library/designing-dynamic-ui-states/loading-states):

```typescript
// proposal-skeleton.tsx
export const ProposalCardSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            {/* Badges skeleton */}
            <div className="h-6 w-24 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-6 w-32 bg-muted rounded" />
          </div>
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-4 w-1/2 bg-muted rounded" />

        <div className="flex gap-2 pt-2">
          <div className="h-10 flex-1 bg-muted rounded" />
          <div className="h-10 flex-1 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 7. Interactive Elements

### 7.1 Edge Selection Actions

```typescript
// edge-actions-menu.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';

interface EdgeActionsProps {
  edgeId: string;
  onEdit: (edgeId: string) => void;
  onDelete: (edgeId: string) => void;
  onViewDetails: (edgeId: string) => void;
}

export const EdgeActionsMenu: React.FC<EdgeActionsProps> = ({
  edgeId,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreVertical className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(edgeId)}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(edgeId)}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit Connection
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(edgeId)}
          className="text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Connection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

### 7.2 Proposal Stack Navigation

```typescript
// proposal-stack.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProposalStackProps {
  proposals: LinkageProposal[];
  currentIndex: number;
  onSelectProposal: (index: number) => void;
}

export const ProposalStack: React.FC<ProposalStackProps> = ({
  proposals,
  currentIndex,
  onSelectProposal,
}) => {
  const currentProposal = proposals[currentIndex];

  return (
    <div className="relative">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSelectProposal(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-sm font-medium">
          {currentIndex + 1} of {proposals.length}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onSelectProposal(currentIndex + 1)}
          disabled={currentIndex === proposals.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Proposal Card */}
      {currentProposal && (
        <LinkageProposalCard
          proposal={currentProposal}
          onAccept={(id) => handleAccept(id)}
          onReject={(id) => handleReject(id)}
          onShowDetails={(id) => handleShowDetails(id)}
        />
      )}

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {proposals.map((_, idx) => (
          <button
            key={idx}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted hover:bg-muted-foreground/50'
            }`}
            onClick={() => onSelectProposal(idx)}
            aria-label={`Go to proposal ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## 8. Responsive Design

### 8.1 Mobile Layout Adjustments

Based on [Cards UI Design Best Practices](https://www.halo-lab.com/blog/card-ui-design):

```typescript
// responsive-proposal-panel.tsx
import { useResponsive } from '@/hooks/useResponsive';

export const ResponsiveProposalPanel: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 bg-background border-t">
        {/* Mobile swipe cards */}
        <SwipeableProposalCard {...props} />
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="w-96 border-l">
        {/* Tablet - single column */}
        <ProposalStack {...props} />
      </div>
    );
  }

  return (
    <div className="w-[480px] border-l">
      {/* Desktop - wider panel */}
      <ProposalStack {...props} />
    </div>
  );
};
```

---

## 9. Accessibility Considerations

### 9.1 Keyboard Navigation

```typescript
// Keyboard-accessible edge selection
export const KeyboardAccessibleEdge: React.FC<EdgeProps> = (props) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleEdgeSelect(props.id);
        break;
      case 'Escape':
        e.preventDefault();
        handleEdgeDeselect();
        break;
    }
  };

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={`Connection from ${props.source} to ${props.target}`}
      onKeyDown={handleKeyDown}
      className="focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {/* Edge path */}
    </g>
  );
};
```

### 9.2 Screen Reader Support

```typescript
// Screen reader announcements for proposal actions
export const useProposalAnnouncer = () => {
  const announce = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  };

  return { announce };
};

// Usage
const { announce } = useProposalAnnouncer();

const handleAccept = (proposalId: string) => {
  onAccept(proposalId);
  announce('Linkage proposal accepted');
};
```

---

## 10. Animation and Transitions

### 10.1 Proposal Accept/Reject Animations

```css
/* proposal-animations.css */

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-left {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.proposal-card-accept {
  animation: slide-out-right 0.3s ease-out forwards;
}

.proposal-card-reject {
  animation: slide-out-left 0.3s ease-out forwards;
}

.proposal-card-enter {
  animation: slide-in-right 0.3s ease-out;
}
```

### 10.2 Edge Creation Animation

```typescript
// animated-edge.tsx
import { motion } from 'framer-motion';

export const AnimatedEdge: React.FC<EdgeProps> = (props) => {
  return (
    <motion.g
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Edge path */}
    </motion.g>
  );
};
```

---

## 11. Color System & Theming

### 11.1 Confidence Color Palette

```css
/* confidence-colors.css */

:root {
  /* High Confidence - Green */
  --confidence-high-bg: rgb(34 197 94 / 0.1);
  --confidence-high-fg: rgb(21 128 61);
  --confidence-high-border: rgb(34 197 94 / 0.2);

  /* Medium Confidence - Amber */
  --confidence-medium-bg: rgb(245 158 11 / 0.1);
  --confidence-medium-fg: rgb(180 83 9);
  --confidence-medium-border: rgb(245 158 11 / 0.2);

  /* Low Confidence - Red */
  --confidence-low-bg: rgb(239 68 68 / 0.1);
  --confidence-low-fg: rgb(185 28 28);
  --confidence-low-border: rgb(239 68 68 / 0.2);

  /* Connection Type Colors */
  --connection-semantic-bg: rgb(59 130 246 / 0.1);
  --connection-semantic-fg: rgb(30 64 175);

  --connection-citation-bg: rgb(168 85 247 / 0.1);
  --connection-citation-fg: rgb(107 33 168);

  --connection-derivation-bg: rgb(6 182 212 / 0.1);
  --connection-derivation-fg: rgb(8 145 178);

  --connection-temporal-bg: rgb(249 115 22 / 0.1);
  --connection-temporal-fg: rgb(194 65 12);

  --connection-hierarchical-bg: rgb(99 102 241 / 0.1);
  --connection-hierarchical-fg: rgb(67 56 202);
}

.dark {
  --confidence-high-fg: rgb(74 222 128);
  --confidence-medium-fg: rgb(251 191 36);
  --confidence-low-fg: rgb(248 113 113);
  --connection-semantic-fg: rgb(96 165 250);
  --connection-citation-fg: rgb(192 132 252);
  --connection-derivation-fg: rgb(103 232 249);
  --connection-temporal-fg: rgb(251 146 60);
  --connection-hierarchical-fg: rgb(129 140 248);
}
```

---

## 12. Implementation Checklist

### 12.1 Core Components

- [ ] **LinkageVisualization** - Main React Flow container
- [ ] **ConfidenceBadge** - Visual confidence indicator (high/medium/low)
- [ ] **ConnectionTypeBadge** - Connection type indicator (5 types)
- [ ] **LinkageProposalCard** - Proposal card with accept/reject
- [ ] **SwipeableProposalCard** - Mobile swipe interactions
- [ ] **CustomEdgeWithLabel** - Labeled edge component
- [ ] **LinkageTooltip** - Rich hover card with details
- [ ] **LinkageAnalysisProgress** - Progress indicator for analysis
- [ ] **ProposalCardSkeleton** - Loading state placeholder
- [ ] **EdgeActionsMenu** - Context menu for edge actions
- [ ] **ProposalStack** - Stack navigation for multiple proposals

### 12.2 Utilities

- [ ] **getConfidenceLevel** - Convert score to level enum
- [ ] **formatTime** - Format seconds to human-readable
- [ ] **useProposalAnnouncer** - Screen reader announcements
- [ ] **useResponsive** - Breakpoint detection for layouts

### 12.3 Testing

- [ ] Unit tests for all components
- [ ] Keyboard navigation tests
- [ ] Screen reader tests
- [ ] Mobile swipe gesture tests
- [ ] Performance tests with 100+ nodes
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## 13. Design Tokens

### 13.1 Spacing

```css
/* proposal-card spacing */
--proposal-card-padding: 1.5rem;
--proposal-card-gap: 1rem;
--proposal-badge-spacing: 0.375rem;
--proposal-action-gap: 0.5rem;
```

### 13.2 Typography

```css
/* proposal-card typography */
--proposal-title-size: 0.875rem;
--proposal-title-weight: 500;
--proposal-body-size: 0.875rem;
--proposal-label-size: 0.75rem;
--proposal-label-weight: 500;
```

### 13.3 Border Radius

```css
/* border radius */
--proposal-card-radius: 0.75rem;
--badge-radius: 0.375rem;
--edge-label-radius: 0.5rem;
```

---

## 14. Research Sources

This specification is based on research from the following sources:

### Node-Edge Visualization
- [React Flow - Node-Based UIs](https://reactflow.dev/)
- [12 React Libraries for Visual Builders (Medium)](https://medium.com/@somendradev23/12-react-libraries-for-visual-builders-flows-charts-interactive-ui-that-feel-like-magic-53373af910e5)
- [Syncfusion React Diagram](https://www.syncfusion.com/react-components/react-diagram)
- [15 Best Graph Visualization Tools (Neo4j)](https://neo4j.com/blog/graph-visualization/neo4j-graph-visualization-tools/)

### Confidence Badge Patterns
- [Visualization Badges Research Paper (2025)](https://hal.science/hal-05199752/file/Visualization_Badges_VIS_2025%2520%25283%2529.pdf)
- [Badges: System Thinking and Research (Medium)](https://medium.com/emplifi-design/badges-16699337948b)
- [7 Data Visualization Best Practices 2025](https://kpinfo.tech/data-visualization-best-practices/)
- [The Psychology of Trust Seals in UI Design](https://eriksfiala.com/blog/psychology-trust-seals-badges-ui-design/)

### Proposal Card Interactions
- [Building Tinder-esque Card Interface (Medium)](https://medium.com/@phillfarrugia/building-a-tinder-esque-card-interface-5afa63c6d3db)
- [Accept/Reject CTA Buttons on Cards (UX Stack Exchange)](https://ux.stackexchange.com/questions/122857/accept-reject-cta-buttons-on-cards)
- [Creating Tinder-Style Swipe Card UI](https://codingartistweb.com/2025/06/creating-a-tinder-style-swipe-card-ui-with-html-css-javascript)
- [Cards UI Design Best Practices](https://www.halo-lab.com/blog/card-ui-design)

### Tooltip/Hover Cards
- [React Hover Card - Simple Info Tooltip (shadcn)](https://www.shadcn.io/patterns/hover-card-info-1)
- [React Tooltip Implementation Tips 2026](https://vocal.media/journal/react-native-tooltip-implementation-tips-and-best-practices-2026)
- [ARIA Tooltip Role (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tooltip_role)
- [How to Design a Good Tooltip (UX Planet)](https://uxplanet.org/how-to-design-a-good-tooltip-in-ui-design-110bb30bd8e2)

### Graph Visualization
- [Create Meaningful UX in Graph Visualization (Cambridge Intelligence)](https://cambridge-intelligence.com/graph-visualization-ux-how-to-avoid-wrecking-your-graph-visualization/)
- [Visualizing Graphs with Node and Edge Labels (ResearchGate)](https://www.researchgate.net/publication/45882227_Visualizing_Graphs_with_Node_and_Edge_Labels)
- [Material Design Data Visualization](https://m2.material.io/design/communication/data-visualization.html)

### Progress Indicators
- [Progress Indicators Explained (Dev.to)](https://dev.to/lollypopdesign/progress-indicators-explained-types-variations-best-practices-for-saas-design-392n)
- [Progress Indicators - Nielsen Norman Group](https://www.nngroup.com/articles/progress-indicators/)
- [Material Design 3 - Progress Indicators](https://m3.material.io/components/progress-indicators/overview)
- [Loading States Design Guide (Treehouse)](https://teamtreehouse.com/library/designing-dynamic-ui-states/loading-states)

---

## 15. Next Steps

1. **Prototype Development** - Create Figma prototype based on these patterns
2. **User Testing** - Test proposal card interactions with target users
3. **Accessibility Audit** - WCAG 2.1 AA compliance validation
4. **Performance Testing** - Test with 100+ nodes and edges
5. **Documentation** - Component storybook and usage examples

---

**Document Status**: Draft v1.0
**Last Updated**: 2026-01-02
**Next Review**: After user testing completion
