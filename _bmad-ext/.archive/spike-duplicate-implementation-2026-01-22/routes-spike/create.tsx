/**
 * @fileoverview Spike Project Creation Route
 * @module routes/spike/create
 * @updated 2026-01-22T22:30:00+07:00
 *
 * ============================================================================
 * PROJECT CREATION ROUTE
 * ============================================================================
 *
 * Device-aware project creation:
 * - Desktop with FSA: Show folder picker dialog
 * - Mobile/Tablet: Show project name form (IndexedDB)
 * - On success: Navigate to /spike/notes/$projectId
 *
 * ============================================================================
 * ROUTING LOGIC:
 * ============================================================================
 *
 * Platform Detection (via getPlatformContract()):
 * - deviceType: 'desktop' | 'mobile' | 'tablet'
 * - canAccessFSA: boolean (Chrome 122+, desktop only)
 *
 * Creation Flow:
 * 1. User opens /spike/create
 * 2. Desktop with FSA: Show FolderPickerDialog
 * 3. Mobile/Tablet: Show CreateProjectForm
 * 4. On success: Navigate to /spike/notes/$projectId
 *
 * ============================================================================
 * ADR-033 COMPLIANCE:
 * ============================================================================
 *   ✅ PlatformContract used for device detection
 *   ✅ Auto-detection of storage type (FSA vs IndexedDB)
 *   ✅ Device-aware routing (desktop-only FSA access)
 *
 * ============================================================================
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { getPlatformContract } from '@/spike/infrastructure/filesystem/platform-contract';
import { FolderPickerDialog } from '@/spike/components/common/FolderPickerDialog';
import { toast } from 'sonner';
import { FileText, Loader2 } from 'lucide-react';

/**
 * Spike Project Creation Route
 *
 * Device-aware project creation with proper navigation
 */
export const Route = createFileRoute('/spike/create')({
  component: SpikeCreateProject,
});

function SpikeCreateProject() {
  const navigate = useNavigate();
  const platform = getPlatformContract();
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleFolderPickerSuccess = (projectId: string) => {
    console.log('[Spike/Create] Folder selected, project ID:', projectId);
    toast.success('Project created successfully');
    navigate({ to: `/spike/notes/${projectId}` });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsCreating(true);

    try {
      // TODO: Implement IndexedDB project creation
      // For now, just show a message
      toast.info('IndexedDB project creation coming soon');
      console.log('[Spike/Create] Would create IndexedDB project:', projectName);
    } catch (error) {
      console.error('[Spike/Create] Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground font-sans">
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Create New Project</h1>
            <p className="text-muted-foreground text-lg">
              {platform.canAccessFSA
                ? 'Select a folder to use as your project workspace'
                : 'Create a project with IndexedDB storage'}
            </p>
          </div>

          {/* Desktop with FSA: Show folder picker */}
          {platform.canAccessFSA ? (
            <div className="border-2 border-border p-6 bg-card">
              <div className="flex flex-col gap-4">
                <div className="text-center mb-4">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Select a folder on your computer to use as the project root.
                  </p>
                </div>

                <button
                  onClick={() => setShowFolderPicker(true)}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-none border-2 border-primary hover:bg-primary/90 font-medium flex items-center justify-center gap-2"
                >
                  Select Project Folder
                </button>

                <button
                  onClick={() => navigate({ to: '/spike' })}
                  className="w-full px-6 py-3 bg-muted text-foreground rounded-none border-2 border-border hover:bg-muted/80 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Mobile/Tablet: Show form */
            <form onSubmit={handleFormSubmit} className="border-2 border-border p-6 bg-card">
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium mb-2">
                    Project Name
                  </label>
                  <input
                    id="projectName"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Project"
                    className="w-full px-4 py-2 border-2 border-border bg-background text-foreground rounded-none focus:outline-none focus:border-primary"
                    disabled={isCreating}
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Project will be stored in IndexedDB.</p>
                  <p className="mt-1">
                    For file system access, use a desktop device with Chrome 122+.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isCreating || !projectName.trim()}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-none border-2 border-primary hover:bg-primary/90 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate({ to: '/spike' })}
                  disabled={isCreating}
                  className="w-full px-6 py-3 bg-muted text-foreground rounded-none border-2 border-border hover:bg-muted/80 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Folder Picker Dialog (Desktop only) */}
      {platform.canAccessFSA && (
        <FolderPickerDialog
          open={showFolderPicker}
          onOpenChange={setShowFolderPicker}
          onSuccess={handleFolderPickerSuccess}
          onCancel={() => {
            console.log('[Spike/Create] Folder picker cancelled');
          }}
        />
      )}
    </div>
  );
}
