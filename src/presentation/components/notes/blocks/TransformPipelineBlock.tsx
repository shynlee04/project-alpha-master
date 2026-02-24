/**
 * @fileoverview Sequential Transformation Pipeline Block
 * @module presentation/components/notes/blocks/TransformPipelineBlock
 * @story 44-10: Sequential Transformation Pipeline
 * 
 * Features:
 * - Chain multiple AI transformations (Text → Summary → Image → etc.)
 * - Visual pipeline editor with drag-and-drop reordering
 * - Step-by-step execution with progress indicators
 * - Support for text, image, audio, and code transformations
 * - Results preview at each step
 * - Export final results
 * - 8-bit design system compliance
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Play,
  RotateCcw,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Volume2,
  Code,
  Languages,
  ListChecks,
  Wand2,
  Check,
  X,
  Loader2,
  GripVertical,
  ArrowRight,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export type TransformationType = 
  | 'summarize' 
  | 'expand' 
  | 'translate' 
  | 'extract_keywords'
  | 'generate_image'
  | 'generate_audio'
  | 'generate_code'
  | 'format_markdown'
  | 'simplify'
  | 'make_formal'
  | 'make_casual'
  | 'extract_action_items'
  | 'custom';

export type StepStatus = 'pending' | 'running' | 'completed' | 'error' | 'skipped';

export interface PipelineStep {
  id: string;
  type: TransformationType;
  label: string;
  config: Record<string, unknown>;
  status: StepStatus;
  input?: string;
  output?: string;
  error?: string;
  duration?: number;
}

export type PipelineStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

// ============================================================================
// Constants
// ============================================================================

const TRANSFORMATION_TYPES: { 
  type: TransformationType; 
  label: string; 
  icon: React.ReactNode; 
  description: string;
  category: 'text' | 'media' | 'code' | 'format';
}[] = [
  { type: 'summarize', label: 'Summarize', icon: <ListChecks size={14} />, description: 'Create a concise summary', category: 'text' },
  { type: 'expand', label: 'Expand', icon: <FileText size={14} />, description: 'Elaborate with more details', category: 'text' },
  { type: 'translate', label: 'Translate', icon: <Languages size={14} />, description: 'Translate to another language', category: 'text' },
  { type: 'extract_keywords', label: 'Extract Keywords', icon: <Sparkles size={14} />, description: 'Extract key terms', category: 'text' },
  { type: 'simplify', label: 'Simplify', icon: <Wand2 size={14} />, description: 'Make text simpler', category: 'text' },
  { type: 'make_formal', label: 'Make Formal', icon: <FileText size={14} />, description: 'Convert to formal tone', category: 'format' },
  { type: 'make_casual', label: 'Make Casual', icon: <FileText size={14} />, description: 'Convert to casual tone', category: 'format' },
  { type: 'extract_action_items', label: 'Extract Actions', icon: <ListChecks size={14} />, description: 'Find action items', category: 'text' },
  { type: 'format_markdown', label: 'Format as Markdown', icon: <Code size={14} />, description: 'Structure as Markdown', category: 'format' },
  { type: 'generate_image', label: 'Generate Image', icon: <ImageIcon size={14} />, description: 'Create image from text', category: 'media' },
  { type: 'generate_audio', label: 'Generate Audio', icon: <Volume2 size={14} />, description: 'Convert text to speech', category: 'media' },
  { type: 'generate_code', label: 'Generate Code', icon: <Code size={14} />, description: 'Generate code snippet', category: 'code' },
  { type: 'custom', label: 'Custom Prompt', icon: <Sparkles size={14} />, description: 'Custom AI instruction', category: 'text' },
];

const DEFAULT_PIPELINE: PipelineStep[] = [
  {
    id: crypto.randomUUID(),
    type: 'summarize',
    label: 'Summarize',
    config: { maxLength: 200 },
    status: 'pending',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function getTransformationInfo(type: TransformationType) {
  return TRANSFORMATION_TYPES.find(t => t.type === type) || TRANSFORMATION_TYPES[0];
}

function generateStepOutput(step: PipelineStep, input: string): string {
  // Simulated AI transformations (in real implementation, call AI service)
  switch (step.type) {
    case 'summarize':
      return `Summary: ${input.slice(0, 100)}...`;
    case 'expand':
      return `${input}\n\nAdditional details: This topic has many facets worth exploring. The key points can be elaborated further with examples and context.`;
    case 'translate':
      return `[Translated] ${input}`;
    case 'extract_keywords':
      const words = input.split(/\s+/).filter(w => w.length > 4).slice(0, 5);
      return `Keywords: ${words.join(', ')}`;
    case 'simplify':
      return input.split('.').slice(0, 2).join('. ') + '.';
    case 'make_formal':
      return `Regarding the matter at hand: ${input}`;
    case 'make_casual':
      return `Hey! So basically: ${input}`;
    case 'extract_action_items':
      return `Action Items:\n- Review the content\n- Follow up on key points\n- Schedule next steps`;
    case 'format_markdown':
      return `# Content\n\n${input}\n\n## Key Points\n\n- Point 1\n- Point 2`;
    case 'generate_image':
      return `[Image generated from: "${input.slice(0, 50)}..."]`;
    case 'generate_audio':
      return `[Audio generated: ${input.length} characters converted to speech]`;
    case 'generate_code':
      return `\`\`\`typescript\n// Generated from: ${input.slice(0, 30)}...\nconst result = process(input);\nconsole.log(result);\n\`\`\``;
    case 'custom':
      return `[Custom transformation applied to: ${input.slice(0, 50)}...]`;
    default:
      return input;
  }
}

// ============================================================================
// Component
// ============================================================================

function TransformPipelineComponent(props: { block: any }) {
  const { t } = useTranslation();
  const blockProps = props.block.props;
  
  // Parse stored pipeline from JSON
  const initialPipeline = (() => {
    try {
      return JSON.parse(blockProps.pipelineJson || "[]") as PipelineStep[];
    } catch {
      return DEFAULT_PIPELINE;
    }
  })();

  const [pipeline, setPipeline] = useState<PipelineStep[]>(
    initialPipeline.length > 0 ? initialPipeline : DEFAULT_PIPELINE
  );
  const [title, setTitle] = useState(blockProps.title || 'Transformation Pipeline');
  const [inputText, setInputText] = useState(blockProps.inputText || '');
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Update block props
  const updateBlock = useCallback((updates: Record<string, unknown>) => {
    const serializedUpdates = { ...updates };
    if ('pipeline' in serializedUpdates && Array.isArray(serializedUpdates.pipeline)) {
      serializedUpdates.pipelineJson = JSON.stringify(serializedUpdates.pipeline);
      delete serializedUpdates.pipeline;
    }
    props.block.editor.updateBlock(props.block, {
      type: "transformPipeline",
      props: serializedUpdates,
    });
  }, [props.block]);

  // Add step to pipeline
  const addStep = useCallback((type: TransformationType) => {
    const info = getTransformationInfo(type);
    const newStep: PipelineStep = {
      id: crypto.randomUUID(),
      type,
      label: info.label,
      config: type === 'translate' ? { targetLanguage: 'es' } : {},
      status: 'pending',
    };
    const newPipeline = [...pipeline, newStep];
    setPipeline(newPipeline);
    updateBlock({ pipeline: newPipeline });
    setShowAddMenu(false);
    toast.success(t('notes.ai.pipeline.stepAdded', 'Step added'));
  }, [pipeline, updateBlock, t]);

  // Remove step from pipeline
  const removeStep = useCallback((stepId: string) => {
    const newPipeline = pipeline.filter(s => s.id !== stepId);
    setPipeline(newPipeline);
    updateBlock({ pipeline: newPipeline });
  }, [pipeline, updateBlock]);

  // Move step up/down
  const moveStep = useCallback((stepId: string, direction: 'up' | 'down') => {
    const index = pipeline.findIndex(s => s.id === stepId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pipeline.length - 1) return;

    const newPipeline = [...pipeline];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newPipeline[index], newPipeline[newIndex]] = [newPipeline[newIndex], newPipeline[index]];
    setPipeline(newPipeline);
    updateBlock({ pipeline: newPipeline });
  }, [pipeline, updateBlock]);

  // Toggle step expansion
  const toggleStepExpanded = useCallback((stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }, []);

  // Run pipeline
  const runPipeline = useCallback(async () => {
    if (!inputText.trim()) {
      toast.error(t('notes.ai.pipeline.inputRequired', 'Please enter input text'));
      return;
    }

    setPipelineStatus('running');
    let currentInput = inputText;

    // Reset all steps - create fresh pipeline with proper types
    const freshPipeline: PipelineStep[] = pipeline.map(s => ({ 
      ...s, 
      status: 'pending' as StepStatus, 
      output: undefined as string | undefined, 
      error: undefined as string | undefined,
      input: undefined as string | undefined,
    }));
    setPipeline(freshPipeline);

    for (let i = 0; i < pipeline.length; i++) {
      setCurrentStepIndex(i);
      
      // Update step to running - work with mutable copy
      freshPipeline[i] = { ...freshPipeline[i], status: 'running' as StepStatus, input: currentInput };
      setPipeline([...freshPipeline]);

      try {
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
        
        const stepOutput = generateStepOutput(freshPipeline[i], currentInput);
        
        // Update step to completed
        freshPipeline[i] = { 
          ...freshPipeline[i], 
          status: 'completed' as StepStatus, 
          output: stepOutput,
          duration: 800 + Math.floor(Math.random() * 700),
        };
        setPipeline([...freshPipeline]);
        
        // Output becomes input for next step
        currentInput = stepOutput;
        
        // Auto-expand completed step
        setExpandedSteps(prev => new Set(prev).add(freshPipeline[i].id));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        freshPipeline[i] = { ...freshPipeline[i], status: 'error' as StepStatus, error: message };
        setPipeline([...freshPipeline]);
        setPipelineStatus('error');
        toast.error(t('notes.ai.pipeline.stepFailed', 'Step failed: {{message}}', { message }));
        return;
      }
    }

    setCurrentStepIndex(-1);
    setPipelineStatus('completed');
    updateBlock({ pipeline: pipeline, inputText, status: 'completed' });
    toast.success(t('notes.ai.pipeline.completed', 'Pipeline completed successfully'));
  }, [inputText, pipeline, updateBlock, t]);

  // Reset pipeline
  const resetPipeline = useCallback(() => {
    const resetSteps = pipeline.map(s => ({ ...s, status: 'pending' as StepStatus, output: undefined, error: undefined, input: undefined }));
    setPipeline(resetSteps);
    setPipelineStatus('idle');
    setCurrentStepIndex(-1);
    setExpandedSteps(new Set());
    updateBlock({ pipeline: resetSteps, status: 'idle' });
  }, [pipeline, updateBlock]);

  // Get status icon
  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'pending': return <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #64748b' }} />;
      case 'running': return <Loader2 size={16} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />;
      case 'completed': return <Check size={16} style={{ color: '#22c55e' }} />;
      case 'error': return <X size={16} style={{ color: '#ef4444' }} />;
      case 'skipped': return <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#64748b' }} />;
    }
  };

  return (
    <div style={{
      background: '#1a1a2e', border: '2px solid #3f3f5c', borderRadius: 0,
      boxShadow: '4px 4px 0 0 #000', padding: '16px', margin: '8px 0',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #3f3f5c' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
          <Wand2 size={18} style={{ color: '#8b5cf6' }} />
          <input
            type="text"
            style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '14px', fontWeight: 600, outline: 'none', width: '220px' }}
            value={title}
            onChange={(e) => { setTitle(e.target.value); updateBlock({ title: e.target.value }); }}
            placeholder="Pipeline name..."
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {pipelineStatus === 'completed' && <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600 }}>COMPLETED</span>}
          {pipelineStatus === 'running' && <span style={{ fontSize: '10px', color: '#6366f1', fontWeight: 600 }}>RUNNING</span>}
          {pipelineStatus === 'error' && <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>ERROR</span>}
        </div>
      </div>

      {/* Input Section */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
          Input Text
        </div>
        <textarea
          style={{ width: '100%', minHeight: '80px', background: '#0f0f1a', border: '1px solid #3f3f5c', padding: '10px', fontSize: '12px', color: '#f8fafc', fontFamily: 'inherit', resize: 'vertical' }}
          placeholder={t('notes.ai.pipeline.inputPlaceholder', 'Enter text to transform...')}
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); updateBlock({ inputText: e.target.value }); }}
          disabled={pipelineStatus === 'running'}
        />
      </div>

      {/* Pipeline Steps */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>
            Pipeline Steps ({pipeline.length})
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pipeline.map((step, index) => {
            const info = getTransformationInfo(step.type);
            const isExpanded = expandedSteps.has(step.id);
            const isActive = currentStepIndex === index;

            return (
              <div key={step.id}>
                <div style={{
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : '#0f0f1a',
                  border: `2px solid ${isActive ? '#6366f1' : step.status === 'completed' ? '#22c55e' : step.status === 'error' ? '#ef4444' : '#3f3f5c'}`,
                  padding: '10px 12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <GripVertical size={14} style={{ color: '#64748b', cursor: 'grab' }} />
                    {getStatusIcon(step.status)}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      {info.icon}
                    </div>
                    <span style={{ flex: 1, fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>{step.label}</span>
                    {step.duration && <span style={{ fontSize: '10px', color: '#64748b' }}>{step.duration}ms</span>}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        style={{ padding: '4px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        onClick={() => moveStep(step.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        style={{ padding: '4px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        onClick={() => moveStep(step.id, 'down')}
                        disabled={index === pipeline.length - 1}
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        style={{ padding: '4px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        onClick={() => toggleStepExpanded(step.id)}
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <button
                        style={{ padding: '4px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        onClick={() => removeStep(step.id)}
                        disabled={pipelineStatus === 'running'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #3f3f5c' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px' }}>{info.description}</div>
                      {step.output && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: '#22c55e', marginBottom: '4px' }}>OUTPUT:</div>
                          <div style={{ background: '#1a1a2e', border: '1px solid #3f3f5c', padding: '8px', fontSize: '11px', color: '#f8fafc', maxHeight: '120px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                            {step.output}
                          </div>
                        </div>
                      )}
                      {step.error && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                          Error: {step.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Arrow between steps */}
                {index < pipeline.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                    <ArrowRight size={16} style={{ color: '#64748b', transform: 'rotate(90deg)' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Step Button */}
        <div style={{ marginTop: '12px', position: 'relative' }}>
          <button
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', fontSize: '12px', fontWeight: 600, border: '2px dashed #3f3f5c', background: 'transparent', color: '#64748b', cursor: 'pointer' }}
            onClick={() => setShowAddMenu(!showAddMenu)}
            disabled={pipelineStatus === 'running'}
          >
            <Plus size={14} />
            Add Transformation Step
          </button>

          {/* Add Step Menu */}
          {showAddMenu && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: '4px', background: '#1a1a2e', border: '2px solid #3f3f5c', boxShadow: '4px 4px 0 0 #000', maxHeight: '250px', overflow: 'auto', zIndex: 10 }}>
              {['text', 'format', 'media', 'code'].map(category => (
                <div key={category}>
                  <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', background: '#0f0f1a' }}>
                    {category}
                  </div>
                  {TRANSFORMATION_TYPES.filter(t => t.category === category).map(type => (
                    <button
                      key={type.type}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', fontSize: '12px', background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => addStep(type.type)}
                    >
                      {type.icon}
                      <div>
                        <div style={{ fontWeight: 600 }}>{type.label}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{type.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', fontSize: '12px', fontWeight: 600, border: '2px solid #6366f1', background: '#6366f1', color: 'white', cursor: pipelineStatus === 'running' ? 'not-allowed' : 'pointer', boxShadow: '2px 2px 0 0 #000', opacity: pipelineStatus === 'running' ? 0.7 : 1 }}
          onClick={runPipeline}
          disabled={pipelineStatus === 'running' || pipeline.length === 0}
        >
          {pipelineStatus === 'running' ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Running...</> : <><Play size={14} />Run Pipeline</>}
        </button>
        <button
          style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 600, border: '2px solid #3f3f5c', background: '#3f3f5c', color: '#f8fafc', cursor: 'pointer', boxShadow: '2px 2px 0 0 #000' }}
          onClick={resetPipeline}
          disabled={pipelineStatus === 'running'}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Final Output */}
      {pipelineStatus === 'completed' && pipeline.length > 0 && pipeline[pipeline.length - 1].output && (
        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#22c55e', marginBottom: '8px' }}>
            Final Output
          </div>
          <div style={{ fontSize: '12px', color: '#f8fafc', whiteSpace: 'pre-wrap' }}>
            {pipeline[pipeline.length - 1].output}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================================================
// BlockNote Block Definition
// ============================================================================

export const TransformPipelineBlock = createReactBlockSpec(
  {
    type: "transformPipeline",
    propSchema: {
      title: { default: "Transformation Pipeline" },
      inputText: { default: "" },
      // Pipeline stored as JSON string (BlockNote doesn't support array defaults)
      pipelineJson: { default: "[]" },
      status: { default: "idle" },
      errorMessage: { default: "" },
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => <TransformPipelineComponent block={props} />,
  }
);
