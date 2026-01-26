/**
 * @fileoverview Chart & Diagram Block - AI-Powered Data Visualization
 * @module presentation/components/notes/blocks/ChartDiagramBlock
 * @story 44-09: Chart/Diagram Generation
 * 
 * Features:
 * - Multiple chart types via Recharts (bar, line, pie, area, scatter)
 * - Mermaid diagram support (flowchart, sequence, class, ER)
 * - AI-powered data parsing and generation
 * - Export to image (PNG/SVG)
 * - 8-bit design system compliance
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import mermaid from "mermaid";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from "recharts";
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  GitBranch,
  Sparkles,
  RefreshCw,
  Download,
  Edit3,
  Eye,
  X,
  Check,
  Copy,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';
export type DiagramType = 'flowchart' | 'sequence' | 'classDiagram' | 'erDiagram' | 'gantt';
export type ContentMode = 'chart' | 'diagram';

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

// ============================================================================
// Constants
// ============================================================================

const CHART_TYPES: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: 'bar', label: 'Bar', icon: <BarChart3 size={14} /> },
  { type: 'line', label: 'Line', icon: <LineChartIcon size={14} /> },
  { type: 'pie', label: 'Pie', icon: <PieChartIcon size={14} /> },
  { type: 'area', label: 'Area', icon: <Activity size={14} /> },
  { type: 'scatter', label: 'Scatter', icon: <GitBranch size={14} /> },
];

const DIAGRAM_TYPES: { type: DiagramType; label: string }[] = [
  { type: 'flowchart', label: 'Flowchart' },
  { type: 'sequence', label: 'Sequence' },
  { type: 'classDiagram', label: 'Class' },
  { type: 'erDiagram', label: 'ER Diagram' },
  { type: 'gantt', label: 'Gantt' },
];

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

const SAMPLE_CHART_DATA: ChartDataPoint[] = [
  { name: 'Jan', value: 400, sales: 240 },
  { name: 'Feb', value: 300, sales: 139 },
  { name: 'Mar', value: 200, sales: 980 },
  { name: 'Apr', value: 278, sales: 390 },
  { name: 'May', value: 189, sales: 480 },
  { name: 'Jun', value: 239, sales: 380 },
];

const SAMPLE_MERMAID = `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`;

// ============================================================================
// Initialize Mermaid
// ============================================================================

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#6366f1',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#3f3f5c',
    lineColor: '#64748b',
    secondaryColor: '#1a1a2e',
    tertiaryColor: '#0f0f1a',
  },
});

// ============================================================================
// Component
// ============================================================================

function ChartDiagramComponent(props: { block: any }) {
  const { t } = useTranslation();
  const blockProps = props.block.props;
  
  // Parse stored data
  const initialData = (() => {
    try {
      return JSON.parse(blockProps.dataJson || "[]") as ChartDataPoint[];
    } catch {
      return SAMPLE_CHART_DATA;
    }
  })();

  const [mode, setMode] = useState<ContentMode>(blockProps.mode || 'chart');
  const [chartType, setChartType] = useState<ChartType>(blockProps.chartType || 'bar');
  const [diagramType, setDiagramType] = useState<DiagramType>(blockProps.diagramType || 'flowchart');
  const [chartData, setChartData] = useState<ChartDataPoint[]>(initialData);
  const [mermaidCode, setMermaidCode] = useState(blockProps.mermaidCode || SAMPLE_MERMAID);
  const [title, setTitle] = useState(blockProps.title || 'Data Visualization');
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [mermaidSvg, setMermaidSvg] = useState('');
  
  const mermaidRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Update block props
  const updateBlock = useCallback((updates: Record<string, unknown>) => {
    const serializedUpdates = { ...updates };
    if ('data' in serializedUpdates && Array.isArray(serializedUpdates.data)) {
      serializedUpdates.dataJson = JSON.stringify(serializedUpdates.data);
      delete serializedUpdates.data;
    }
    props.block.editor.updateBlock(props.block, {
      type: "chartDiagram",
      props: serializedUpdates,
    });
  }, [props.block]);

  // Render Mermaid diagram
  useEffect(() => {
    if (mode === 'diagram' && mermaidCode && viewMode === 'preview') {
      const renderDiagram = async () => {
        try {
          const { svg } = await mermaid.render(`mermaid-${props.block.id}`, mermaidCode);
          setMermaidSvg(svg);
          setErrorMessage('');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Invalid diagram syntax';
          setErrorMessage(message);
          setMermaidSvg('');
        }
      };
      renderDiagram();
    }
  }, [mode, mermaidCode, viewMode, props.block.id]);

  // Generate with AI (simulated)
  const generateWithAI = useCallback(async () => {
    if (!aiPrompt.trim()) {
      toast.error(t('notes.ai.chart.promptRequired', 'Please enter a prompt'));
      return;
    }

    setStatus('generating');
    setErrorMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (mode === 'chart') {
        // Generate sample chart data based on prompt
        const newData: ChartDataPoint[] = [
          { name: 'Q1', value: Math.floor(Math.random() * 500) + 100 },
          { name: 'Q2', value: Math.floor(Math.random() * 500) + 100 },
          { name: 'Q3', value: Math.floor(Math.random() * 500) + 100 },
          { name: 'Q4', value: Math.floor(Math.random() * 500) + 100 },
        ];
        setChartData(newData);
        updateBlock({ data: newData, status: 'ready' });
        toast.success(t('notes.ai.chart.generated', 'Chart data generated'));
      } else {
        // Generate sample Mermaid diagram
        const newCode = `flowchart TD
    A[${aiPrompt.split(' ').slice(0, 2).join(' ')}] --> B{Process}
    B --> C[Step 1]
    B --> D[Step 2]
    C --> E[Result]
    D --> E`;
        setMermaidCode(newCode);
        updateBlock({ mermaidCode: newCode, status: 'ready' });
        toast.success(t('notes.ai.diagram.generated', 'Diagram generated'));
      }
      setStatus('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      setStatus('error');
      setErrorMessage(message);
      toast.error(message);
    }
  }, [aiPrompt, mode, updateBlock, t]);

  // Export to image
  const exportToImage = useCallback(async (format: 'png' | 'svg') => {
    try {
      if (mode === 'diagram' && mermaidSvg) {
        if (format === 'svg') {
          const blob = new Blob([mermaidSvg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/\s+/g, '-')}.svg`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('SVG exported');
        } else {
          // Convert SVG to PNG
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title.replace(/\s+/g, '-')}.png`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('PNG exported');
              }
            }, 'image/png');
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(mermaidSvg);
        }
      } else if (mode === 'chart' && chartContainerRef.current) {
        // Export Recharts as SVG
        const svgElement = chartContainerRef.current.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/\s+/g, '-')}.svg`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Chart exported');
        }
      }
    } catch (error) {
      toast.error('Export failed');
    }
  }, [mode, mermaidSvg, title]);

  // Copy Mermaid code
  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(mermaidCode);
    toast.success('Code copied');
  }, [mermaidCode]);

  // Render chart based on type
  const renderChart = () => {
    const chartProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f5c" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #3f3f5c', borderRadius: 0 }} />
            <Legend />
            <Bar dataKey="value" fill="#6366f1" />
            {chartData[0]?.sales !== undefined && <Bar dataKey="sales" fill="#8b5cf6" />}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f5c" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #3f3f5c', borderRadius: 0 }} />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            {chartData[0]?.sales !== undefined && <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} />}
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#6366f1"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #3f3f5c', borderRadius: 0 }} />
            <Legend />
          </PieChart>
        );
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f5c" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #3f3f5c', borderRadius: 0 }} />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f5c" />
            <XAxis type="number" dataKey="value" name="Value" stroke="#94a3b8" fontSize={12} />
            <YAxis type="number" dataKey="sales" name="Sales" stroke="#94a3b8" fontSize={12} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#1a1a2e', border: '1px solid #3f3f5c', borderRadius: 0 }} />
            <Legend />
            <Scatter name="Data" data={chartData} fill="#6366f1" />
          </ScatterChart>
        );
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
          {mode === 'chart' ? <BarChart3 size={18} /> : <GitBranch size={18} />}
          <input
            type="text"
            style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '14px', fontWeight: 600, outline: 'none', width: '200px' }}
            value={title}
            onChange={(e) => { setTitle(e.target.value); updateBlock({ title: e.target.value }); }}
            placeholder="Chart title..."
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            style={{ padding: '4px 8px', fontSize: '11px', background: viewMode === 'preview' ? '#6366f1' : '#3f3f5c', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
            onClick={() => setViewMode('preview')}
          >
            <Eye size={12} />
          </button>
          <button
            style={{ padding: '4px 8px', fontSize: '11px', background: viewMode === 'edit' ? '#6366f1' : '#3f3f5c', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
            onClick={() => setViewMode('edit')}
          >
            <Edit3 size={12} />
          </button>
          <button
            style={{ padding: '4px 8px', fontSize: '11px', background: '#3f3f5c', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
            onClick={() => exportToImage('svg')}
            title="Export SVG"
          >
            <Download size={12} />
          </button>
          {status === 'ready' && <Check size={14} style={{ color: '#22c55e' }} />}
          {status === 'generating' && <RefreshCw size={14} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />}
        </div>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600, background: mode === 'chart' ? '#6366f1' : '#0f0f1a', border: `2px solid ${mode === 'chart' ? '#6366f1' : '#3f3f5c'}`, color: '#f8fafc', cursor: 'pointer' }}
          onClick={() => { setMode('chart'); updateBlock({ mode: 'chart' }); }}
        >
          <BarChart3 size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Charts
        </button>
        <button
          style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600, background: mode === 'diagram' ? '#6366f1' : '#0f0f1a', border: `2px solid ${mode === 'diagram' ? '#6366f1' : '#3f3f5c'}`, color: '#f8fafc', cursor: 'pointer' }}
          onClick={() => { setMode('diagram'); updateBlock({ mode: 'diagram' }); }}
        >
          <GitBranch size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Diagrams
        </button>
      </div>

      {/* AI Section */}
      <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px dashed #8b5cf6', padding: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>
          <Sparkles size={14} />
          <span>{mode === 'chart' ? t('notes.ai.chart.generator', 'AI Chart Generator') : t('notes.ai.diagram.generator', 'AI Diagram Generator')}</span>
        </div>
        <textarea
          style={{ width: '100%', minHeight: '50px', background: '#0f0f1a', border: '1px solid #8b5cf6', padding: '10px', fontSize: '12px', color: '#f8fafc', fontFamily: 'inherit', resize: 'vertical' }}
          placeholder={mode === 'chart' ? 'Describe your data...' : 'Describe your diagram...'}
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
          <button
            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, border: '2px solid #6366f1', background: '#6366f1', color: 'white', cursor: 'pointer', boxShadow: '2px 2px 0 0 #000' }}
            onClick={generateWithAI}
            disabled={status === 'generating' || !aiPrompt.trim()}
          >
            {status === 'generating' ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />}
            Generate
          </button>
        </div>
      </div>

      {mode === 'chart' ? (
        <>
          {/* Chart Type Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {CHART_TYPES.map((ct) => (
              <button
                key={ct.type}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', background: '#0f0f1a', border: `2px solid ${chartType === ct.type ? '#6366f1' : '#3f3f5c'}`, cursor: 'pointer', fontSize: '9px', color: chartType === ct.type ? '#f8fafc' : '#94a3b8' }}
                onClick={() => { setChartType(ct.type); updateBlock({ chartType: ct.type }); }}
              >
                {ct.icon}
                <span>{ct.label}</span>
              </button>
            ))}
          </div>

          {/* Chart Preview */}
          <div ref={chartContainerRef} style={{ background: '#0f0f1a', border: '1px solid #3f3f5c', padding: '16px', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Data Editor */}
          {viewMode === 'edit' && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>DATA (JSON)</div>
              <textarea
                style={{ width: '100%', minHeight: '100px', background: '#0f0f1a', border: '1px solid #3f3f5c', padding: '10px', fontSize: '11px', color: '#f8fafc', fontFamily: 'monospace' }}
                value={JSON.stringify(chartData, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setChartData(parsed);
                    updateBlock({ data: parsed });
                  } catch {}
                }}
              />
            </div>
          )}
        </>
      ) : (
        <>
          {/* Diagram Type Selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {DIAGRAM_TYPES.map((dt) => (
              <button
                key={dt.type}
                style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 600, background: '#0f0f1a', border: `2px solid ${diagramType === dt.type ? '#6366f1' : '#3f3f5c'}`, cursor: 'pointer', color: diagramType === dt.type ? '#f8fafc' : '#94a3b8' }}
                onClick={() => { setDiagramType(dt.type); updateBlock({ diagramType: dt.type }); }}
              >
                {dt.label}
              </button>
            ))}
          </div>

          {/* Diagram Preview/Editor */}
          {viewMode === 'preview' ? (
            <div ref={mermaidRef} style={{ background: '#0f0f1a', border: '1px solid #3f3f5c', padding: '16px', minHeight: '200px' }}>
              {mermaidSvg ? (
                <div dangerouslySetInnerHTML={{ __html: mermaidSvg }} style={{ display: 'flex', justifyContent: 'center' }} />
              ) : errorMessage ? (
                <div style={{ color: '#ef4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={14} />{errorMessage}
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center' }}>Loading diagram...</div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>MERMAID CODE</div>
                <button
                  style={{ padding: '4px 8px', fontSize: '10px', background: '#3f3f5c', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
                  onClick={copyCode}
                >
                  <Copy size={12} style={{ marginRight: '4px' }} />Copy
                </button>
              </div>
              <textarea
                style={{ width: '100%', minHeight: '150px', background: '#0f0f1a', border: '1px solid #3f3f5c', padding: '10px', fontSize: '11px', color: '#f8fafc', fontFamily: 'monospace' }}
                value={mermaidCode}
                onChange={(e) => { setMermaidCode(e.target.value); updateBlock({ mermaidCode: e.target.value }); }}
                placeholder="Enter Mermaid diagram code..."
              />
            </div>
          )}
        </>
      )}

      {errorMessage && status === 'error' && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <X size={14} />{errorMessage}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================================================
// BlockNote Block Definition
// ============================================================================

export const ChartDiagramBlock = createReactBlockSpec(
  {
    type: "chartDiagram",
    propSchema: {
      title: { default: "Data Visualization" },
      mode: { default: "chart" },
      chartType: { default: "bar" },
      diagramType: { default: "flowchart" },
      // Data stored as JSON string (BlockNote doesn't support array defaults)
      dataJson: { default: "[]" },
      mermaidCode: { default: "" },
      status: { default: "idle" },
      errorMessage: { default: "" },
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => <ChartDiagramComponent block={props} />,
  }
);
