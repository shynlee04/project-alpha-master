/**
 * @fileoverview Multi-Step Generation Block with Blur Animation
 * @module presentation/components/notes/blocks/MultiStepGenerationBlock
 * @story 44-12: Multi-step generation with blur animation (FINAL)
 * @created 2026-01-14
 *
 * Custom BlockNote block for multi-step AI content generation with progressive
 * blur-to-reveal animation. Each step generates content that reveals with a
 * cinematic blur effect.
 * 
 * Features:
 * - Define multiple generation steps (text, code, image, list, etc.)
 * - Progressive blur-to-reveal animation for each completed step
 * - Real-time step progress visualization
 * - Orchestrated AI generation with context chaining
 * - 8-bit design system compliance
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { 
  Layers, Play, Pause, RotateCcw, Plus, Trash2, 
  CheckCircle2, Loader2, AlertCircle,
  Settings, Eye, EyeOff, Sparkles, FileText, Code,
  Image, ListOrdered, Quote, Table
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import "./MultiStepGenerationBlock.css";

// ============================================================================
// Types
// ============================================================================

type StepType = 'text' | 'code' | 'image' | 'list' | 'quote' | 'table';
type StepStatus = 'pending' | 'running' | 'completed' | 'error' | 'skipped';
type PipelineStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

interface GenerationStep {
  id: string;
  type: StepType;
  prompt: string;
  status: StepStatus;
  output: string;
  error?: string;
  duration?: number;
  blurLevel: number; // 0-20, where 0 is fully revealed
}

interface PipelineConfig {
  autoReveal: boolean; // Automatically reveal after completion
  revealDelay: number; // Delay in ms before reveal animation
  chainContext: boolean; // Pass previous outputs to next step
}

// ============================================================================
// Step Type Configuration
// ============================================================================

const STEP_TYPES: { type: StepType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'text', label: 'Text', icon: <FileText size={14} />, description: 'Generate prose or paragraphs' },
  { type: 'code', label: 'Code', icon: <Code size={14} />, description: 'Generate code snippets' },
  { type: 'image', label: 'Image', icon: <Image size={14} />, description: 'Generate image descriptions' },
  { type: 'list', label: 'List', icon: <ListOrdered size={14} />, description: 'Generate bullet points' },
  { type: 'quote', label: 'Quote', icon: <Quote size={14} />, description: 'Generate quotations' },
  { type: 'table', label: 'Table', icon: <Table size={14} />, description: 'Generate tabular data' },
];

// ============================================================================
// Simulated AI Generation (will be replaced with real API in future)
// ============================================================================

function generateSimulatedContent(
  step: GenerationStep,
  previousOutputs: string[],
  config: PipelineConfig
): string {
  const context = config.chainContext && previousOutputs.length > 0 
    ? `Building on: ${previousOutputs[previousOutputs.length - 1].slice(0, 50)}...\n\n`
    : '';
  
  switch (step.type) {
    case 'text':
      return `${context}Generated text content for: "${step.prompt}"\n\nThis is a thoughtful paragraph that explores the topic in depth. The AI has analyzed the request and produced meaningful prose that addresses the key points. Each sentence flows naturally into the next, creating a cohesive narrative.`;
    
    case 'code':
      return `${context}\`\`\`typescript
// Generated code for: ${step.prompt}
interface DataModel {
  id: string;
  name: string;
  createdAt: Date;
}

export function processData(input: DataModel[]): DataModel[] {
  return input
    .filter(item => item.name.length > 0)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
\`\`\``;
    
    case 'image':
      return `${context}🎨 **Image Description**: A stunning visual representation of "${step.prompt}".\n\n*Composition*: The image features a central subject with dynamic lighting, set against a gradient background that transitions from deep blue to warm amber. The overall mood is contemplative yet energetic.`;
    
    case 'list':
      return `${context}**Key Points for: ${step.prompt}**\n\n• First important consideration with detailed explanation\n• Second crucial element that builds on the previous point\n• Third key insight that provides additional depth\n• Fourth actionable item with clear next steps\n• Final summary point that ties everything together`;
    
    case 'quote':
      return `${context}> "${step.prompt ? step.prompt.split(' ').slice(0, 3).join(' ') + '...' : 'In the pursuit of'} true understanding, we must first embrace the complexity of the question before seeking the simplicity of an answer."\n\n— *Generated Wisdom*`;
    
    case 'table':
      return `${context}| Category | Value | Status | Notes |
|----------|-------|--------|-------|
| Primary | 95% | ✅ Active | ${step.prompt.slice(0, 20)}... |
| Secondary | 78% | ⚠️ Review | Needs attention |
| Tertiary | 100% | ✅ Complete | Fully processed |
| Quaternary | 45% | 🔄 Progress | In development |`;
    
    default:
      return `Generated content for: ${step.prompt}`;
  }
}

// ============================================================================
// Helper Components
// ============================================================================

function StepCard({ 
  step, 
  index, 
  isEditing,
  onUpdate, 
  onRemove, 
  onToggleReveal 
}: { 
  step: GenerationStep;
  index: number;
  isEditing: boolean;
  onUpdate: (updates: Partial<GenerationStep>) => void;
  onRemove: () => void;
  onToggleReveal: () => void;
}) {
  const stepConfig = STEP_TYPES.find(t => t.type === step.type) || STEP_TYPES[0];
  
  const getStatusIcon = () => {
    switch (step.status) {
      case 'pending': return <div className="multistep-status multistep-status--pending" />;
      case 'running': return <Loader2 size={16} className="multistep-status multistep-status--running" />;
      case 'completed': return <CheckCircle2 size={16} className="multistep-status multistep-status--completed" />;
      case 'error': return <AlertCircle size={16} className="multistep-status multistep-status--error" />;
      case 'skipped': return <div className="multistep-status multistep-status--skipped">—</div>;
      default: return null;
    }
  };

  return (
    <div 
      className={cn(
        "multistep-block__step-card",
        `multistep-block__step-card--${step.status}`
      )}
    >
      {/* Step Header */}
      <div className="multistep-block__step-header">
        <div className="multistep-block__step-meta">
          <span className="multistep-block__step-number">{index + 1}</span>
          {getStatusIcon()}
          <span className="multistep-block__step-type">
            {stepConfig.icon}
            {stepConfig.label}
          </span>
        </div>
        
        <div className="multistep-block__step-actions">
          {step.status === 'completed' && (
            <button 
              className="multistep-block__icon-btn"
              onClick={onToggleReveal}
              title={step.blurLevel > 0 ? "Reveal" : "Blur"}
            >
              {step.blurLevel > 0 ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}
          {isEditing && (
            <button 
              className="multistep-block__icon-btn multistep-block__icon-btn--danger"
              onClick={onRemove}
              title="Remove step"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Step Prompt (editable) */}
      {isEditing ? (
        <div className="multistep-block__step-prompt-edit">
          <select 
            value={step.type}
            onChange={(e) => onUpdate({ type: e.target.value as StepType })}
            className="multistep-block__type-select"
          >
            {STEP_TYPES.map(t => (
              <option key={t.type} value={t.type}>{t.label}</option>
            ))}
          </select>
          <textarea
            value={step.prompt}
            onChange={(e) => onUpdate({ prompt: e.target.value })}
            placeholder="Enter prompt for this step..."
            className="multistep-block__prompt-input"
            rows={2}
          />
        </div>
      ) : (
        <div className="multistep-block__step-prompt">
          {step.prompt || <span className="multistep-block__placeholder">No prompt</span>}
        </div>
      )}

      {/* Step Output with Blur Animation */}
      {step.output && (
        <div 
          className={cn(
            "multistep-block__step-output",
            step.type === 'code' && "multistep-block__step-output--code"
          )}
          style={{
            filter: `blur(${step.blurLevel}px)`,
            transition: 'filter 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {step.type === 'code' ? (
            <pre className="multistep-block__code-output">
              <code>{step.output}</code>
            </pre>
          ) : (
            <div className="multistep-block__text-output">
              {step.output}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {step.error && (
        <div className="multistep-block__step-error">
          <AlertCircle size={14} />
          {step.error}
        </div>
      )}

      {/* Duration Badge */}
      {step.duration && step.status === 'completed' && (
        <div className="multistep-block__step-duration">
          {(step.duration / 1000).toFixed(1)}s
        </div>
      )}
    </div>
  );
}

function ProgressBar({ steps }: { steps: GenerationStep[] }) {
  const completed = steps.filter(s => s.status === 'completed').length;
  const running = steps.filter(s => s.status === 'running').length;
  const errors = steps.filter(s => s.status === 'error').length;
  const total = steps.length;
  
  if (total === 0) return null;
  
  const completedPercent = (completed / total) * 100;
  const runningPercent = (running / total) * 100;
  const errorPercent = (errors / total) * 100;

  return (
    <div className="multistep-block__progress">
      <div className="multistep-block__progress-bar">
        <div 
          className="multistep-block__progress-fill multistep-block__progress-fill--completed"
          style={{ width: `${completedPercent}%` }}
        />
        <div 
          className="multistep-block__progress-fill multistep-block__progress-fill--running"
          style={{ width: `${runningPercent}%`, left: `${completedPercent}%` }}
        />
        <div 
          className="multistep-block__progress-fill multistep-block__progress-fill--error"
          style={{ width: `${errorPercent}%`, left: `${completedPercent + runningPercent}%` }}
        />
      </div>
      <span className="multistep-block__progress-text">
        {completed}/{total} steps
      </span>
    </div>
  );
}

// ============================================================================
// Main Block Component
// ============================================================================

function MultiStepGenerationComponent(props: { block: any }) {
  const blockProps = props.block.props;
  
  // Parse JSON data
  const [steps, setSteps] = useState<GenerationStep[]>(() => {
    try {
      return JSON.parse(blockProps.stepsJson || '[]');
    } catch {
      return [];
    }
  });
  
  const [config, setConfig] = useState<PipelineConfig>(() => {
    try {
      return JSON.parse(blockProps.configJson || '{}');
    } catch {
      return { autoReveal: true, revealDelay: 300, chainContext: true };
    }
  });

  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>(
    (blockProps.pipelineStatus as PipelineStatus) || 'idle'
  );
  const [isEditing, setIsEditing] = useState(blockProps.isEditing === 'true');
  const [showConfig, setShowConfig] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const revealTimeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Update block props
  const updateBlock = useCallback((updates: Record<string, unknown>) => {
    // Convert arrays/objects to JSON strings
    const processedUpdates = { ...updates };
    if ('steps' in processedUpdates && Array.isArray(processedUpdates.steps)) {
      processedUpdates.stepsJson = JSON.stringify(processedUpdates.steps);
      delete processedUpdates.steps;
    }
    if ('config' in processedUpdates && typeof processedUpdates.config === 'object') {
      processedUpdates.configJson = JSON.stringify(processedUpdates.config);
      delete processedUpdates.config;
    }
    
    props.block.editor.updateBlock(props.block, {
      type: "multiStepGeneration",
      props: processedUpdates,
    });
  }, [props.block]);

  // Save steps to block
  useEffect(() => {
    updateBlock({ stepsJson: JSON.stringify(steps) });
  }, [steps, updateBlock]);

  // Add new step
  const addStep = useCallback(() => {
    const newStep: GenerationStep = {
      id: `step-${Date.now()}`,
      type: 'text',
      prompt: '',
      status: 'pending',
      output: '',
      blurLevel: 20,
    };
    setSteps(prev => [...prev, newStep]);
  }, []);

  // Remove step
  const removeStep = useCallback((stepId: string) => {
    setSteps(prev => prev.filter(s => s.id !== stepId));
  }, []);

  // Update step
  const updateStep = useCallback((stepId: string, updates: Partial<GenerationStep>) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, ...updates } : s
    ));
  }, []);

  // Toggle step reveal
  const toggleStepReveal = useCallback((stepId: string) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, blurLevel: s.blurLevel > 0 ? 0 : 20 } : s
    ));
  }, []);

  // Reveal step with animation
  const revealStep = useCallback((stepId: string, delay: number = 0) => {
    const timeout = setTimeout(() => {
      setSteps(prev => prev.map(s => {
        if (s.id !== stepId) return s;
        return { ...s, blurLevel: 0 };
      }));
    }, delay);
    revealTimeoutRefs.current.push(timeout);
  }, []);

  // Run pipeline
  const runPipeline = useCallback(async () => {
    if (steps.length === 0) {
      toast.error('Add at least one step to run the pipeline');
      return;
    }

    // Reset all steps
    setSteps(prev => prev.map(s => ({
      ...s,
      status: 'pending' as StepStatus,
      output: '',
      error: undefined,
      duration: undefined,
      blurLevel: 20,
    })));

    setPipelineStatus('running');
    abortControllerRef.current = new AbortController();

    const previousOutputs: string[] = [];

    for (let i = 0; i < steps.length; i++) {
      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        setPipelineStatus('paused');
        return;
      }

      const step = steps[i];
      
      // Mark as running
      setSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'running' as StepStatus } : s
      ));

      const startTime = Date.now();
      
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
      
      // Generate content
      const output = generateSimulatedContent(step, previousOutputs, config);
      const duration = Date.now() - startTime;

      // Update step with result
      setSteps(prev => prev.map((s, idx) => 
        idx === i ? { 
          ...s, 
          status: 'completed' as StepStatus, 
          output, 
          duration,
          blurLevel: config.autoReveal ? 20 : 0,
        } : s
      ));

      previousOutputs.push(output);

      // Auto-reveal with animation
      if (config.autoReveal) {
        revealStep(step.id, config.revealDelay);
      }
    }

    setPipelineStatus('completed');
    toast.success('Pipeline completed!');
    updateBlock({ pipelineStatus: 'completed' });
  }, [steps, config, revealStep, updateBlock]);

  // Pause pipeline
  const pausePipeline = useCallback(() => {
    abortControllerRef.current?.abort();
    setPipelineStatus('paused');
  }, []);

  // Reset pipeline
  const resetPipeline = useCallback(() => {
    // Clear all reveal timeouts
    revealTimeoutRefs.current.forEach(clearTimeout);
    revealTimeoutRefs.current = [];
    
    setSteps(prev => prev.map(s => ({
      ...s,
      status: 'pending' as StepStatus,
      output: '',
      error: undefined,
      duration: undefined,
      blurLevel: 20,
    })));
    setPipelineStatus('idle');
    updateBlock({ pipelineStatus: 'idle' });
  }, [updateBlock]);

  // Reveal all
  const revealAll = useCallback(() => {
    setSteps(prev => prev.map(s => ({ ...s, blurLevel: 0 })));
  }, []);

  // Blur all
  const blurAll = useCallback(() => {
    setSteps(prev => prev.map(s => 
      s.output ? { ...s, blurLevel: 20 } : s
    ));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revealTimeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div 
      className={cn(
        "multistep-block",
        `multistep-block--${pipelineStatus}`
      )}
      contentEditable={false}
    >
      {/* Header */}
      <div className="multistep-block__header">
        <div className="multistep-block__title">
          <Layers size={18} />
          <span>Multi-Step Generation</span>
          {steps.length > 0 && (
            <span className="multistep-block__count">{steps.length} steps</span>
          )}
        </div>
        
        <div className="multistep-block__header-actions">
          <button 
            className="multistep-block__icon-btn"
            onClick={() => setShowConfig(!showConfig)}
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button 
            className="multistep-block__icon-btn"
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Done editing" : "Edit steps"}
          >
            {isEditing ? <CheckCircle2 size={16} /> : <Settings size={16} />}
          </button>
        </div>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="multistep-block__config">
          <label className="multistep-block__config-option">
            <input 
              type="checkbox" 
              checked={config.autoReveal}
              onChange={(e) => setConfig(prev => ({ ...prev, autoReveal: e.target.checked }))}
            />
            <span>Auto-reveal with blur animation</span>
          </label>
          <label className="multistep-block__config-option">
            <span>Reveal delay (ms):</span>
            <input 
              type="number" 
              value={config.revealDelay}
              onChange={(e) => setConfig(prev => ({ ...prev, revealDelay: parseInt(e.target.value) || 300 }))}
              min={0}
              max={2000}
              step={100}
              className="multistep-block__config-input"
            />
          </label>
          <label className="multistep-block__config-option">
            <input 
              type="checkbox" 
              checked={config.chainContext}
              onChange={(e) => setConfig(prev => ({ ...prev, chainContext: e.target.checked }))}
            />
            <span>Chain context between steps</span>
          </label>
        </div>
      )}

      {/* Progress Bar */}
      {steps.length > 0 && pipelineStatus !== 'idle' && (
        <ProgressBar steps={steps} />
      )}

      {/* Steps List */}
      <div className="multistep-block__steps">
        {steps.length === 0 ? (
          <div className="multistep-block__empty">
            <Sparkles size={32} />
            <p>No steps defined yet.</p>
            <p>Click "Add Step" to create a multi-step generation pipeline.</p>
          </div>
        ) : (
          steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isEditing={isEditing}
              onUpdate={(updates) => updateStep(step.id, updates)}
              onRemove={() => removeStep(step.id)}
              onToggleReveal={() => toggleStepReveal(step.id)}
            />
          ))
        )}
      </div>

      {/* Actions */}
      <div className="multistep-block__actions">
        {isEditing && (
          <button 
            className="multistep-block__btn multistep-block__btn--secondary"
            onClick={addStep}
          >
            <Plus size={14} />
            Add Step
          </button>
        )}
        
        {pipelineStatus === 'idle' || pipelineStatus === 'paused' || pipelineStatus === 'error' ? (
          <button 
            className="multistep-block__btn multistep-block__btn--primary"
            onClick={runPipeline}
            disabled={steps.length === 0}
          >
            <Play size={14} />
            {pipelineStatus === 'paused' ? 'Resume' : 'Run Pipeline'}
          </button>
        ) : pipelineStatus === 'running' ? (
          <button 
            className="multistep-block__btn multistep-block__btn--warning"
            onClick={pausePipeline}
          >
            <Pause size={14} />
            Pause
          </button>
        ) : null}

        {pipelineStatus === 'completed' && (
          <>
            <button 
              className="multistep-block__btn multistep-block__btn--secondary"
              onClick={revealAll}
            >
              <Eye size={14} />
              Reveal All
            </button>
            <button 
              className="multistep-block__btn multistep-block__btn--secondary"
              onClick={blurAll}
            >
              <EyeOff size={14} />
              Blur All
            </button>
          </>
        )}

        {pipelineStatus !== 'idle' && (
          <button 
            className="multistep-block__btn multistep-block__btn--ghost"
            onClick={resetPipeline}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Block Specification
// ============================================================================

export const MultiStepGenerationBlock = createReactBlockSpec(
  {
    type: "multiStepGeneration",
    propSchema: {
      // Steps as JSON string (BlockNote doesn't support arrays)
      stepsJson: { default: "[]" },
      // Config as JSON string
      configJson: { default: '{"autoReveal":true,"revealDelay":300,"chainContext":true}' },
      // Pipeline status
      pipelineStatus: { default: "idle" },
      // Edit mode
      isEditing: { default: "true" },
      // Text alignment
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => <MultiStepGenerationComponent block={props} />,
  }
);

export default MultiStepGenerationBlock;
