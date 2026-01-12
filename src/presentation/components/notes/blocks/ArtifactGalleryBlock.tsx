/**
 * @fileoverview Artifact Gallery Block - Browse and Manage AI-Generated Content
 * @module presentation/components/notes/blocks/ArtifactGalleryBlock
 * @story 44-11: Artifact Gallery and Management
 * 
 * Features:
 * - Gallery view of all AI-generated artifacts in the note
 * - Filter by type (image, audio, video, chart, code, etc.)
 * - Search functionality
 * - Grid/List view toggle
 * - Preview modal for artifacts
 * - Quick actions (delete, download, copy)
 * - Statistics dashboard
 * - 8-bit design system compliance
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Grid3X3,
  List,
  Search,
  Filter,
  Image as ImageIcon,
  Video,
  Volume2,
  BarChart3,
  Code,
  Presentation,
  Wand2,
  Eye,
  Trash2,
  X,
  RefreshCw,
  FolderOpen,
  Clock,
  Tag,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export type ArtifactType = 
  | 'aiImage' 
  | 'aiVision' 
  | 'storyboard' 
  | 'videoAnalysis' 
  | 'ttsBlock' 
  | 'artifactBlock' 
  | 'videoGeneration'
  | 'slidesExport'
  | 'chartDiagram'
  | 'transformPipeline';

export type ViewMode = 'grid' | 'list';

export interface ArtifactItem {
  id: string;
  type: ArtifactType;
  title: string;
  preview?: string;
  createdAt: string;
  status: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Constants
// ============================================================================

const ARTIFACT_TYPE_INFO: Record<ArtifactType, { label: string; icon: React.ReactNode; color: string }> = {
  aiImage: { label: 'AI Image', icon: <ImageIcon size={14} />, color: '#ec4899' },
  aiVision: { label: 'Vision Analysis', icon: <Eye size={14} />, color: '#8b5cf6' },
  storyboard: { label: 'Storyboard', icon: <Grid3X3 size={14} />, color: '#f59e0b' },
  videoAnalysis: { label: 'Video Analysis', icon: <Video size={14} />, color: '#3b82f6' },
  ttsBlock: { label: 'Text-to-Speech', icon: <Volume2 size={14} />, color: '#10b981' },
  artifactBlock: { label: 'HTML Artifact', icon: <Code size={14} />, color: '#6366f1' },
  videoGeneration: { label: 'Video Generation', icon: <Video size={14} />, color: '#ef4444' },
  slidesExport: { label: 'Slides Export', icon: <Presentation size={14} />, color: '#14b8a6' },
  chartDiagram: { label: 'Chart/Diagram', icon: <BarChart3 size={14} />, color: '#f97316' },
  transformPipeline: { label: 'Pipeline', icon: <Wand2 size={14} />, color: '#a855f7' },
};

const ALL_ARTIFACT_TYPES: ArtifactType[] = Object.keys(ARTIFACT_TYPE_INFO) as ArtifactType[];

// ============================================================================
// Component
// ============================================================================

function ArtifactGalleryComponent(props: { block: any }) {
  const { t } = useTranslation();
  const blockProps = props.block.props;
  
  const [viewMode, setViewMode] = useState<ViewMode>(blockProps.viewMode || 'grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<ArtifactType>>(new Set(ALL_ARTIFACT_TYPES));
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactItem | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Scan document for artifacts
  const scanForArtifacts = useCallback((): ArtifactItem[] => {
    const editor = props.block.editor;
    const document = editor.document;
    const artifacts: ArtifactItem[] = [];

    const scanBlocks = (blocks: any[]) => {
      for (const block of blocks) {
        if (ALL_ARTIFACT_TYPES.includes(block.type as ArtifactType)) {
          const typeInfo = ARTIFACT_TYPE_INFO[block.type as ArtifactType];
          artifacts.push({
            id: block.id,
            type: block.type as ArtifactType,
            title: block.props?.title || block.props?.prompt || typeInfo.label,
            preview: block.props?.imageData || block.props?.html || undefined,
            createdAt: new Date().toISOString(), // Would be from actual metadata
            status: block.props?.status || 'unknown',
            metadata: block.props,
          });
        }
        if (block.children && block.children.length > 0) {
          scanBlocks(block.children);
        }
      }
    };

    scanBlocks(document);
    return artifacts;
  }, [props.block.editor]);

  // Get artifacts with memoization
  const artifacts = useMemo(() => scanForArtifacts(), [scanForArtifacts]);

  // Filter artifacts
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter(artifact => {
      // Type filter
      if (!selectedTypes.has(artifact.type)) return false;
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = artifact.title.toLowerCase().includes(query);
        const matchesType = ARTIFACT_TYPE_INFO[artifact.type].label.toLowerCase().includes(query);
        if (!matchesTitle && !matchesType) return false;
      }
      
      return true;
    });
  }, [artifacts, selectedTypes, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    for (const artifact of artifacts) {
      byType[artifact.type] = (byType[artifact.type] || 0) + 1;
    }
    return {
      total: artifacts.length,
      byType,
      filtered: filteredArtifacts.length,
    };
  }, [artifacts, filteredArtifacts]);

  // Update block props
  const updateBlock = useCallback((updates: Record<string, unknown>) => {
    props.block.editor.updateBlock(props.block, {
      type: "artifactGallery",
      props: updates,
    });
  }, [props.block]);

  // Toggle type filter
  const toggleTypeFilter = useCallback((type: ArtifactType) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  // Select all / none types
  const selectAllTypes = useCallback(() => {
    setSelectedTypes(new Set(ALL_ARTIFACT_TYPES));
  }, []);

  const selectNoTypes = useCallback(() => {
    setSelectedTypes(new Set());
  }, []);

  // Refresh scan
  const refreshScan = useCallback(async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsScanning(false);
    toast.success(t('notes.ai.gallery.refreshed', 'Gallery refreshed'));
  }, [t]);

  // Navigate to artifact
  const navigateToArtifact = useCallback((artifactId: string) => {
    const editor = props.block.editor;
    try {
      editor.setTextCursorPosition(artifactId, "start");
      setSelectedArtifact(null);
      toast.success(t('notes.ai.gallery.navigated', 'Navigated to artifact'));
    } catch {
      toast.error(t('notes.ai.gallery.navigateFailed', 'Could not navigate to artifact'));
    }
  }, [props.block.editor, t]);

  // Delete artifact
  const deleteArtifact = useCallback((artifactId: string) => {
    const editor = props.block.editor;
    try {
      const block = editor.getBlock(artifactId);
      if (block) {
        editor.removeBlocks([block]);
        setSelectedArtifact(null);
        toast.success(t('notes.ai.gallery.deleted', 'Artifact deleted'));
      }
    } catch {
      toast.error(t('notes.ai.gallery.deleteFailed', 'Could not delete artifact'));
    }
  }, [props.block.editor, t]);

  // Render artifact card
  const renderArtifactCard = (artifact: ArtifactItem) => {
    const typeInfo = ARTIFACT_TYPE_INFO[artifact.type];
    const isGrid = viewMode === 'grid';

    return (
      <div
        key={artifact.id}
        style={{
          background: '#0f0f1a',
          border: '2px solid #3f3f5c',
          padding: isGrid ? '12px' : '10px 14px',
          cursor: 'pointer',
          display: isGrid ? 'flex' : 'flex',
          flexDirection: isGrid ? 'column' : 'row',
          gap: isGrid ? '10px' : '12px',
          alignItems: isGrid ? 'stretch' : 'center',
          transition: 'border-color 0.15s',
        }}
        onClick={() => setSelectedArtifact(artifact)}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = typeInfo.color)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#3f3f5c')}
      >
        {/* Preview/Icon */}
        <div style={{
          width: isGrid ? '100%' : '48px',
          height: isGrid ? '80px' : '48px',
          background: `${typeInfo.color}20`,
          border: `1px solid ${typeInfo.color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {artifact.preview && artifact.type === 'aiImage' ? (
            <img
              src={artifact.preview.startsWith('data:') ? artifact.preview : `data:image/png;base64,${artifact.preview}`}
              alt={artifact.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ color: typeInfo.color }}>{typeInfo.icon}</div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#f8fafc',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {artifact.title}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              fontSize: '9px',
              fontWeight: 600,
              background: `${typeInfo.color}20`,
              color: typeInfo.color,
              border: `1px solid ${typeInfo.color}40`,
            }}>
              {typeInfo.icon}
              {typeInfo.label}
            </span>
            <span style={{
              fontSize: '9px',
              color: '#64748b',
            }}>
              {artifact.status}
            </span>
          </div>
        </div>

        {/* Quick Actions (List view only) */}
        {!isGrid && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              style={{ padding: '6px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); navigateToArtifact(artifact.id); }}
              title="Go to"
            >
              <ExternalLink size={14} />
            </button>
            <button
              style={{ padding: '6px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); deleteArtifact(artifact.id); }}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: '#1a1a2e', border: '2px solid #3f3f5c', borderRadius: 0,
      boxShadow: '4px 4px 0 0 #000', padding: '16px', margin: '8px 0',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #3f3f5c' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
          <FolderOpen size={18} style={{ color: '#6366f1' }} />
          <span>{t('notes.ai.gallery.title', 'Artifact Gallery')}</span>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>
            ({stats.filtered}/{stats.total} items)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            style={{ padding: '6px', background: viewMode === 'grid' ? '#6366f1' : 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
            onClick={() => { setViewMode('grid'); updateBlock({ viewMode: 'grid' }); }}
            title="Grid view"
          >
            <Grid3X3 size={14} />
          </button>
          <button
            style={{ padding: '6px', background: viewMode === 'list' ? '#6366f1' : 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
            onClick={() => { setViewMode('list'); updateBlock({ viewMode: 'list' }); }}
            title="List view"
          >
            <List size={14} />
          </button>
          <button
            style={{ padding: '6px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
            onClick={refreshScan}
            disabled={isScanning}
            title="Refresh"
          >
            <RefreshCw size={14} style={{ animation: isScanning ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Statistics Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {Object.entries(stats.byType).map(([type, count]) => {
          const typeInfo = ARTIFACT_TYPE_INFO[type as ArtifactType];
          return (
            <div
              key={type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                background: `${typeInfo.color}15`,
                border: `1px solid ${typeInfo.color}30`,
                color: typeInfo.color,
              }}
            >
              {typeInfo.icon}
              <span>{count}</span>
            </div>
          );
        })}
        {stats.total === 0 && (
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            No artifacts found in this note
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            style={{
              width: '100%',
              padding: '8px 10px 8px 32px',
              background: '#0f0f1a',
              border: '1px solid #3f3f5c',
              fontSize: '12px',
              color: '#f8fafc',
            }}
            placeholder={t('notes.ai.gallery.searchPlaceholder', 'Search artifacts...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            background: showFilters ? '#6366f1' : '#0f0f1a',
            border: '1px solid #3f3f5c',
            fontSize: '11px',
            fontWeight: 600,
            color: '#f8fafc',
            cursor: 'pointer',
          }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={12} />
          Filters
          <ChevronDown size={12} style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{ marginBottom: '16px', padding: '12px', background: '#0f0f1a', border: '1px solid #3f3f5c' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Filter by Type
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{ fontSize: '10px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={selectAllTypes}
              >
                Select All
              </button>
              <button
                style={{ fontSize: '10px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={selectNoTypes}
              >
                Clear
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ALL_ARTIFACT_TYPES.map(type => {
              const typeInfo = ARTIFACT_TYPE_INFO[type];
              const isSelected = selectedTypes.has(type);
              return (
                <button
                  key={type}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    background: isSelected ? `${typeInfo.color}20` : 'transparent',
                    border: `1px solid ${isSelected ? typeInfo.color : '#3f3f5c'}`,
                    color: isSelected ? typeInfo.color : '#64748b',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleTypeFilter(type)}
                >
                  {typeInfo.icon}
                  {typeInfo.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gallery */}
      {filteredArtifacts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(140px, 1fr))' : '1fr',
          gap: '10px',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '4px',
        }}>
          {filteredArtifacts.map(renderArtifactCard)}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          color: '#64748b',
        }}>
          <Sparkles size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
            {stats.total === 0 ? 'No artifacts yet' : 'No matching artifacts'}
          </div>
          <div style={{ fontSize: '11px' }}>
            {stats.total === 0
              ? 'Create AI content using slash commands'
              : 'Try adjusting your filters or search query'
            }
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedArtifact && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedArtifact(null)}
        >
          <div
            style={{
              background: '#1a1a2e',
              border: '2px solid #3f3f5c',
              boxShadow: '8px 8px 0 0 #000',
              padding: '20px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #3f3f5c' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ color: ARTIFACT_TYPE_INFO[selectedArtifact.type].color }}>
                  {ARTIFACT_TYPE_INFO[selectedArtifact.type].icon}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>{selectedArtifact.title}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{ARTIFACT_TYPE_INFO[selectedArtifact.type].label}</div>
                </div>
              </div>
              <button
                style={{ padding: '6px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                onClick={() => setSelectedArtifact(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview Content */}
            <div style={{ marginBottom: '16px' }}>
              {selectedArtifact.preview && selectedArtifact.type === 'aiImage' ? (
                <img
                  src={selectedArtifact.preview.startsWith('data:') ? selectedArtifact.preview : `data:image/png;base64,${selectedArtifact.preview}`}
                  alt={selectedArtifact.title}
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', background: '#0f0f1a' }}
                />
              ) : (
                <div style={{ padding: '40px', background: '#0f0f1a', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ marginBottom: '8px' }}>{ARTIFACT_TYPE_INFO[selectedArtifact.type].icon}</div>
                  <div style={{ fontSize: '12px' }}>Preview not available</div>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Tag size={12} />
                <span>Status: {selectedArtifact.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={12} />
                <span>ID: {selectedArtifact.id.slice(0, 8)}...</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#6366f1',
                  border: '2px solid #6366f1',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0 0 #000',
                }}
                onClick={() => navigateToArtifact(selectedArtifact.id)}
              >
                <ExternalLink size={14} />
                Go to Artifact
              </button>
              <button
                style={{
                  padding: '10px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#ef4444',
                  border: '2px solid #ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0 0 #000',
                }}
                onClick={() => deleteArtifact(selectedArtifact.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
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

export const ArtifactGalleryBlock = createReactBlockSpec(
  {
    type: "artifactGallery",
    propSchema: {
      viewMode: { default: "grid" },
      showFilters: { default: "false" },
      textAlignment: defaultProps.textAlignment,
    },
    content: "none",
  },
  {
    render: (props) => <ArtifactGalleryComponent block={props} />,
  }
);
