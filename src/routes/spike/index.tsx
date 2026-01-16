/**
 * @fileoverview Spike Entry Matrix - Level 1 Front Page
 * @module routes/spike/index
 * @updated 2026-01-22T22:00:00+07:00
 *
 * ============================================================================
 * ENTRY MATRIX ARCHITECTURE
 * ============================================================================
 *
 * This is Level 1 entry point for Spike with complete entry matrix:
 *
 * LEVEL 1 (This Route: /spike/):
 *   - Project Selection Section:
 *     * Show project picker for returning users
 *     * List recent projects
 *     * Allow creating new project (link to /spike/create)
 *
 *   - Device-Aware Direct Entry (Level 2):
 *     * Desktop with FSA: "Enter IDE" and "Enter Notes" buttons
 *     * Desktop without FSA: "Enter Notes" button (show picker first)
 *     * Mobile/Tablet: "Enter Notes" button (IDE blocked)
 *
 *   - New Project Creation:
 *     * Link to /spike/create route
 *
 * ============================================================================
 * ROUTING LOGIC:
 * ============================================================================
 *
 * Platform Detection (via getPlatformContract()):
 * - deviceType: 'desktop' | 'mobile' | 'tablet'
 * - canAccessFSA: boolean (Chrome 122+, desktop only)
 * - canAccessIDE: boolean (canAccessFSA && deviceType === 'desktop')
 * - canAccessIDE is the guard that determines IDE visibility
 *
 * Entry Flow:
 * 1. User opens /spike/
 * 2. ProjectPickerDialog shown (auto-open)
 * 3. User selects project:
 *    - Desktop with FSA → Navigate to /spike/ide/$projectId or /spike/notes/$projectId
 *    - Mobile → Navigate to /spike/notes/$projectId only
 * 4. User clicks direct entry:
 *    - "Enter IDE" → Go to /spike/ide (shows empty state with picker)
 *    - "Enter Notes" → Go to /spike/notes (shows empty state with picker)
 * 5. User clicks "Create Project" → Go to /spike/create
 *
 * ============================================================================
 * ADR-033 COMPLIANCE:
 * ============================================================================
 *   ✅ PlatformContract used for device detection
 *   ✅ Platform guards enforced (mobile IDE blocked)
 *   ✅ Auto-detection of storage type (FSA vs IndexedDB)
 *   ✅ Device-aware routing (desktop-only IDE access)
 *
 * ============================================================================
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { getPlatformContract } from '@/spike/infrastructure/filesystem/platform-contract';
import { ProjectPickerDialog } from '@/spike/components/common/ProjectPickerDialog';
import { Code2, FileText, FolderOpen, Plus, Smartphone } from 'lucide-react';

/**
 * Spike Entry Matrix Route
 *
 * Level 1: Front page with project selection and device-aware direct entry
 * Level 2: Direct workspace entry buttons (guarded by platform capabilities)
 */
export const Route = createFileRoute('/spike/')({
  component: SpikeEntryMatrix,
});

function SpikeEntryMatrix() {
  const navigate = useNavigate();
  const platform = getPlatformContract();
  const [showProjectPicker, setShowProjectPicker] = useState(true);

  return (
    <div className="h-screen w-screen bg-background text-foreground font-sans">
      <div className="flex flex-col items-center justify-center h-full px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Spike Development Hub</h1>
          <p className="text-muted-foreground text-lg">
            Isolated testing environment for ViaGent
          </p>
        </div>

        {/* Project Selection Section */}
        <section className="w-full max-w-md mb-8">
          <ProjectPickerDialog
            open={showProjectPicker}
            onOpenChange={setShowProjectPicker}
            targetWorkspace={platform.canAccessIDE ? 'ide' : 'notes'}
            onCreateNew={() => {
              navigate({ to: '/spike/create' });
            }}
          />
        </section>

        {/* Direct Entry Section - Level 2 */}
        <section className="w-full max-w-md mb-6">
          <div className="border-2 border-border p-6 bg-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Direct Entry
            </h2>

            <div className="flex flex-col gap-3">
              {/* Desktop with FSA: Show IDE and Notes buttons */}
              {platform.canAccessFSA && (
                <>
                  <button
                    onClick={() => navigate({ to: '/spike/ide' })}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-none border-2 border-primary hover:bg-primary/90 font-medium flex items-center justify-center gap-2"
                  >
                    <Code2 className="h-5 w-5" />
                    Enter IDE (Desktop Only)
                  </button>
                  <button
                    onClick={() => navigate({ to: '/spike/notes' })}
                    className="w-full px-6 py-3 bg-muted text-foreground rounded-none border-2 border-border hover:bg-muted/80 font-medium flex items-center justify-center gap-2"
                  >
                    <FileText className="h-5 w-5" />
                    Enter Notes
                  </button>
                </>
              )}

              {/* Desktop without FSA: Show Notes only */}
              {!platform.canAccessFSA && platform.deviceType === 'desktop' && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    IDE requires File System Access API (Chrome 122+)
                  </p>
                  <button
                    onClick={() => navigate({ to: '/spike/notes' })}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-none border-2 border-primary hover:bg-primary/90 font-medium flex items-center justify-center gap-2"
                  >
                    <FileText className="h-5 w-5" />
                    Enter Notes
                  </button>
                </div>
              )}

              {/* Mobile/Tablet: Show Notes only, IDE blocked */}
              {platform.deviceType !== 'desktop' && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    IDE requires desktop with File System Access API
                  </p>
                  <button
                    onClick={() => navigate({ to: '/spike/notes' })}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-none border-2 border-primary hover:bg-primary/90 font-medium flex items-center justify-center gap-2"
                  >
                    <FileText className="h-5 w-5" />
                    Enter Notes (Mobile Only)
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Create New Project Section */}
        <section className="w-full max-w-md">
          <button
            onClick={() => navigate({ to: '/spike/create' })}
            className="w-full px-6 py-3 bg-muted text-foreground rounded-none border-2 border-border hover:bg-muted/80 font-medium flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Project
          </button>
        </section>
      </div>
    </div>
  );
}
