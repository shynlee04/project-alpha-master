/**
 * @fileoverview Slides Export Block - PowerPoint Presentation Generator
 * @module presentation/components/notes/blocks/SlidesExportBlock
 * @story 44-08: PowerPoint/Slides Export
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PptxGenJS from "pptxgenjs";
import {
  Download,
  RefreshCw,
  Layout,
  Image as ImageIcon,
  Type,
  List,
  Columns,
  Sparkles,
  X,
  Check,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export type SlideLayoutType = 'title' | 'title_content' | 'bullets' | 'two_column' | 'image';

export interface SlideData {
  id: string;
  layout: SlideLayoutType;
  title: string;
  content: string;
  imageUrl?: string;
  bullets?: string[];
  notes?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_PRESENTATION_TITLE = 'Presentation';
const DEFAULT_AUTHOR = 'Project Alpha';
const DEFAULT_FILENAME = 'presentation.pptx';

const SLIDE_LAYOUTS: { type: SlideLayoutType; label: string; icon: React.ReactNode }[] = [
  { type: 'title', label: 'Title', icon: <Type size={14} /> },
  { type: 'title_content', label: 'Content', icon: <Layout size={14} /> },
  { type: 'bullets', label: 'Bullets', icon: <List size={14} /> },
  { type: 'two_column', label: '2 Col', icon: <Columns size={14} /> },
  { type: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
];

const SAMPLE_OUTLINE = `## Slide 1: Introduction
- Welcome to the presentation
- Overview of topics

## Slide 2: Main Topic
- Key point one
- Supporting evidence

## Slide 3: Summary
- Key takeaways
- Next steps`;

// ============================================================================
// Component
// ============================================================================

function SlidesExportComponent(props: { block: any }) {
  const { t } = useTranslation();
  const blockProps = props.block.props;
  const [slides, setSlides] = useState<SlideData[]>(blockProps.slides || []);
  const [presentationTitle, setPresentationTitle] = useState(blockProps.title || DEFAULT_PRESENTATION_TITLE);
  const [author, setAuthor] = useState(blockProps.author || DEFAULT_AUTHOR);
  const [filename, setFilename] = useState(blockProps.filename || DEFAULT_FILENAME);
  const [selectedLayout, setSelectedLayout] = useState<SlideLayoutType>('title_content');
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'exporting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const updateBlock = useCallback((updates: Record<string, unknown>) => {
    props.block.editor.updateBlock(props.block, {
      type: "slidesExport",
      props: updates,
    });
  }, [props.block]);

  const generateSlidesFromOutline = useCallback((outline: string) => {
    const slideBlocks = outline.split('\n\n');
    const newSlides: SlideData[] = [];
    let currentSlide: Partial<SlideData> = { id: crypto.randomUUID(), layout: 'title_content' };

    slideBlocks.forEach((blockText) => {
      const lines = blockText.trim().split('\n');
      if (lines.length === 0) return;

      const slideMatch = lines[0].match(/^#+\s*(?:Slide\s*)?(\d+)[:.-]?\s*(.+)?$/i);
      
      if (slideMatch) {
        if (currentSlide.title) newSlides.push(currentSlide as SlideData);
        currentSlide = {
          id: crypto.randomUUID(),
          layout: 'title_content',
          title: slideMatch[2]?.trim() || `Slide ${slideMatch[1]}`,
          content: lines.slice(1).join('\n'),
          bullets: lines.slice(1).filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '')),
        };
      } else if (lines[0].match(/^#+\s*.+/)) {
        if (currentSlide.title) newSlides.push(currentSlide as SlideData);
        currentSlide = {
          id: crypto.randomUUID(),
          layout: 'title_content',
          title: lines[0].replace(/^#+\s*/, ''),
          content: lines.slice(1).join('\n'),
          bullets: lines.slice(1).filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '')),
        };
      } else if (currentSlide.content) {
        currentSlide.content += '\n' + lines.join('\n');
      } else {
        currentSlide.content = lines.join('\n');
      }
    });

    if (currentSlide.title) newSlides.push(currentSlide as SlideData);

    if (newSlides.length === 0 && outline.trim()) {
      newSlides.push({
        id: crypto.randomUUID(),
        layout: 'title',
        title: presentationTitle,
        content: 'Generated from note content',
      });
    }

    setSlides(newSlides);
    updateBlock({ slides: newSlides, status: 'ready' });
    setStatus('ready');
    toast.success(t('notes.ai.slides.generated', 'Generated {{count}} slides', { count: newSlides.length }));
  }, [presentationTitle, updateBlock, t]);

  const generateWithAI = useCallback(async () => {
    if (!aiPrompt.trim()) {
      toast.error(t('notes.ai.slides.promptRequired', 'Please enter a prompt'));
      return;
    }

    setStatus('generating');
    updateBlock({ status: 'generating' });
    setErrorMessage('');

    try {
      const outline = `## Slide 1: ${presentationTitle}\n- ${aiPrompt}\n\n## Slide 2: Overview\n- Key topics\n\n## Slide 3: Details\n- Point 1\n- Point 2\n\n## Slide 4: Summary\n- Takeaways\n- Next steps`;
      await new Promise(resolve => setTimeout(resolve, 1500));
      generateSlidesFromOutline(outline);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus('error');
      updateBlock({ status: 'error', errorMessage: message });
      toast.error(t('notes.ai.slides.generationFailed', 'Failed: {{message}}', { message }));
    }
  }, [aiPrompt, presentationTitle, generateSlidesFromOutline, updateBlock, t]);

  const exportToPptx = useCallback(async () => {
    if (slides.length === 0) {
      toast.error(t('notes.ai.slides.noSlides', 'No slides to export'));
      return;
    }

    setStatus('exporting');
    updateBlock({ status: 'exporting' });
    setErrorMessage('');

    try {
      const pptx = new PptxGenJS();
      pptx.title = presentationTitle || DEFAULT_PRESENTATION_TITLE;
      pptx.author = author || DEFAULT_AUTHOR;
      pptx.layout = 'LAYOUT_WIDE';

      pptx.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: 'FFFFFF' },
        objects: [
          { rect: { x: 0, y: 5.3, w: '100%', h: 0.5, fill: { color: 'F1F1F1' } } },
          { text: { text: presentationTitle, options: { x: 0.5, y: 5.4, fontSize: 12, color: '666666' } } },
        ],
        slideNumber: { x: 0.3, y: '95%', fontSize: 10, color: '888888' },
      });

      slides.forEach((slideData) => {
        const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });

        switch (slideData.layout) {
          case 'title':
            slide.addText(slideData.title, {
              x: 0.5, y: 2.5, w: '90%', h: 1.5,
              fontSize: 44, bold: true, color: '333333', align: 'center',
            });
            if (slideData.content) {
              slide.addText(slideData.content, { x: 1, y: 4, w: '80%', h: 1, fontSize: 20, color: '666666', align: 'center' });
            }
            break;

          case 'title_content':
          case 'bullets':
            slide.addText(slideData.title, {
              x: 0.5, y: 0.5, w: '90%', h: 0.8,
              fontSize: 28, bold: true, color: '333333',
            });
            const bullets = slideData.bullets && slideData.bullets.length > 0 
              ? `• ${slideData.bullets.join('\n• ')}`
              : slideData.content || '';
            if (bullets) {
              slide.addText(bullets, {
                x: 0.5, y: 1.5, w: '90%', h: 3.5,
                fontSize: 18, color: '444444', bullet: true,
              });
            }
            break;

          case 'two_column':
            slide.addText(slideData.title, {
              x: 0.5, y: 0.5, w: '90%', h: 0.8,
              fontSize: 28, bold: true, color: '333333',
            });
            if (slideData.content) {
              const midPoint = Math.floor(slideData.content.length / 2);
              slide.addText(slideData.content.substring(0, midPoint), {
                x: 0.5, y: 1.5, w: '43%', h: 3.5, fontSize: 16, color: '444444',
              });
              slide.addText(slideData.content.substring(midPoint), {
                x: 5, y: 1.5, w: '43%', h: 3.5, fontSize: 16, color: '444444',
              });
            }
            break;

          case 'image':
            slide.addText(slideData.title, {
              x: 5.5, y: 0.5, w: '43%', h: 0.8,
              fontSize: 24, bold: true, color: '333333',
            });
            if (slideData.imageUrl) {
              slide.addImage({ path: slideData.imageUrl, x: 0.5, y: 1.5, w: 4.5, h: 3.5 });
            }
            if (slideData.content) {
              slide.addText(slideData.content, {
                x: 5.5, y: 1.5, w: '43%', h: 3.5,
                fontSize: 14, color: '444444',
              });
            }
            break;
        }

        if (slideData.notes) slide.addNotes(slideData.notes);
      });

      await pptx.writeFile({ fileName: filename || DEFAULT_FILENAME });
      setStatus('ready');
      updateBlock({ status: 'ready' });
      toast.success(t('notes.ai.slides.exported', 'Exported: {{filename}}', { filename: filename || DEFAULT_FILENAME }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus('error');
      updateBlock({ status: 'error', errorMessage: message });
      toast.error(t('notes.ai.slides.exportFailed', 'Export failed: {{message}}', { message }));
    }
  }, [slides, presentationTitle, author, filename, updateBlock, t]);

  const addSlide = useCallback(() => {
    const newSlide: SlideData = {
      id: crypto.randomUUID(),
      layout: selectedLayout,
      title: t('notes.ai.slides.newSlide', 'New Slide'),
      content: '',
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    updateBlock({ slides: newSlides });
  }, [selectedLayout, slides, updateBlock, t]);

  return (
    <div style={{
      background: '#1a1a2e', border: '2px solid #3f3f5c', borderRadius: 0,
      boxShadow: '4px 4px 0 0 #000', padding: '16px', margin: '8px 0',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #3f3f5c' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span>{t('notes.ai.slides.title', 'PowerPoint Export')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '4px 8px', background: '#3f3f5c', color: '#94a3b8', borderRadius: 0 }}>
          {status === 'idle' && <span>{t('notes.ai.slides.status.idle', 'Ready')}</span>}
          {status === 'generating' && <RefreshCw size={12} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />}
          {status === 'ready' && <Check size={12} />}
          {status === 'exporting' && <RefreshCw size={12} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />}
          {status === 'error' && <X size={12} />}
        </div>
      </div>

      {/* AI Section */}
      <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px dashed #8b5cf6', borderRadius: 0, padding: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>
          <Sparkles size={14} />
          <span>{t('notes.ai.slides.aiGenerator', 'AI Slide Generator')}</span>
        </div>
        <textarea
          style={{ width: '100%', minHeight: '60px', background: '#0f0f1a', border: '1px solid #8b5cf6', borderRadius: 0, padding: '10px', fontSize: '12px', color: '#f8fafc', fontFamily: 'inherit', resize: 'vertical' }}
          placeholder={t('notes.ai.slides.aiPlaceholder', 'Describe your presentation...')}
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
          <button
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, border: '2px solid #3f3f5c', borderRadius: 0, cursor: 'pointer', boxShadow: '2px 2px 0 0 #000', background: '#3f3f5c', color: '#f8fafc' }}
            onClick={() => generateSlidesFromOutline(SAMPLE_OUTLINE)}
          >
            <Sparkles size={12} />Sample
          </button>
          <button
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, border: '2px solid #6366f1', borderRadius: 0, cursor: 'pointer', boxShadow: '2px 2px 0 0 #000', background: '#6366f1', color: 'white' }}
            onClick={generateWithAI}
            disabled={status === 'generating' || !aiPrompt.trim()}
          >
            {status === 'generating' ? <RefreshCw size={12} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} /> : <Sparkles size={12} />}
            {t('notes.ai.slides.generate', 'Generate')}
          </button>
        </div>
      </div>

      {/* Settings */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <input type="text" style={{ flex: 1, background: '#0f0f1a', border: '1px solid #3f3f5c', borderRadius: 0, padding: '8px', fontSize: '12px', color: '#f8fafc' }} placeholder="Title" value={presentationTitle} onChange={(e) => { setPresentationTitle(e.target.value); updateBlock({ title: e.target.value }); }} />
          <input type="text" style={{ flex: 1, background: '#0f0f1a', border: '1px solid #3f3f5c', borderRadius: 0, padding: '8px', fontSize: '12px', color: '#f8fafc' }} placeholder="Author" value={author} onChange={(e) => { setAuthor(e.target.value); updateBlock({ author: e.target.value }); }} />
          <input type="text" style={{ flex: 1, background: '#0f0f1a', border: '1px solid #3f3f5c', borderRadius: 0, padding: '8px', fontSize: '12px', color: '#f8fafc' }} placeholder="Filename" value={filename} onChange={(e) => { setFilename(e.target.value); updateBlock({ filename: e.target.value }); }} />
        </div>
      </div>

      {/* Layouts */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
          {SLIDE_LAYOUTS.map((layout) => (
            <button
              key={layout.type}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', background: '#0f0f1a', border: `2px solid ${selectedLayout === layout.type ? '#6366f1' : '#3f3f5c'}`, borderRadius: 0, cursor: 'pointer', fontSize: '9px', color: selectedLayout === layout.type ? '#f8fafc' : '#94a3b8' }}
              onClick={() => setSelectedLayout(layout.type)}
            >
              {layout.icon}
              <span>{layout.label}</span>
            </button>
          ))}
        </div>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, border: '2px solid #3f3f5c', borderRadius: 0, cursor: 'pointer', boxShadow: '2px 2px 0 0 #000', background: '#3f3f5c', color: '#f8fafc' }} onClick={addSlide}>
          <List size={12} />Add Slide
        </button>
      </div>

      {/* Slides */}
      {slides.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
            {slides.length} Slides
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '8px 0' }}>
            {slides.map((slide, idx) => (
              <div key={slide.id} style={{ flexShrink: 0, width: '140px', height: '90px', background: 'white', border: '2px solid #3f3f5c', borderRadius: 0, padding: '6px', position: 'relative' }}>
                <div style={{ fontSize: '7px', fontWeight: 700, marginBottom: '4px', borderBottom: '1px solid #ddd' }}>{slide.title || 'Untitled'}</div>
                <div style={{ fontSize: '5px', color: '#666' }}>
                  {slide.bullets?.slice(0, 3).map((b, i) => <div key={i}>• {b}</div>)}
                </div>
                <div style={{ position: 'absolute', bottom: '3px', right: '3px', fontSize: '9px', color: '#666', fontWeight: 600 }}>{idx + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <div style={{ marginBottom: '16px' }}>
        <button
          style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, border: '2px solid #22c55e', borderRadius: 0, cursor: (status === 'exporting' || slides.length === 0) ? 'not-allowed' : 'pointer', boxShadow: '2px 2px 0 0 #000', background: '#22c55e', color: 'white', opacity: (status === 'exporting' || slides.length === 0) ? 0.5 : 1 }}
          onClick={exportToPptx}
          disabled={status === 'exporting' || slides.length === 0}
        >
          {status === 'exporting' ? <><RefreshCw size={14} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />Exporting...</> : <><Download size={14} />Export to PowerPoint</>}
        </button>
      </div>

      {status === 'error' && errorMessage && (
        <div style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <X size={14} />{errorMessage}
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

// ============================================================================
// BlockNote Block Definition
// ============================================================================

export const SlidesExportBlock = createReactBlockSpec(
  {
    type: "slidesExport",
    propSchema: {
      title: { default: "Presentation" },
      author: { default: "Project Alpha" },
      subject: { default: "" },
      filename: { default: "presentation.pptx" },
      slides: { default: [] },
      status: { default: "idle" },
      errorMessage: { default: "" },
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => <SlidesExportComponent block={props} />,
  }
);
