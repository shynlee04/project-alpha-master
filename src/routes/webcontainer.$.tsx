/**
 * WebContainer Catch-All Route
 * 
 * Displays an informative page when users try to access WebContainer
 * preview URLs directly (e.g., via "Open in New Tab").
 * 
 * WebContainer previews are bound to the IDE session and cannot work
 * in separate browser tabs.
 * 
 * @module routes/webcontainer.$
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/webcontainer/$')({
  component: WebContainerNotSupported,
})

/**
 * Informative error page for WebContainer routes
 * 
 * Displays when users navigate to /webcontainer/* paths,
 * typically after clicking "Open in New Tab" in the preview panel.
 */
function WebContainerNotSupported() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleBackToDashboard = () => {
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-lg text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-amber-500/10 rounded-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-pixel text-foreground mb-2">
          {t('webcontainer.notSupported.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-amber-400 font-medium mb-4">
          {t('webcontainer.notSupported.subtitle')}
        </p>

        {/* Description */}
        <p className="text-muted-foreground mb-4">
          {t('webcontainer.notSupported.description')}
        </p>

        {/* Explanation */}
        <p className="text-sm text-muted-foreground/70 mb-8 px-4">
          {t('webcontainer.notSupported.explanation')}
        </p>

        {/* Action Button */}
        <button
          onClick={handleBackToDashboard}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-none font-medium transition-colors shadow-[2px_2px_0px_0px_rgba(194,65,12,1)]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('webcontainer.notSupported.backToDashboard')}
        </button>

        {/* Brand footer */}
        <div className="mt-12 text-muted-foreground text-sm">
          <span className="text-primary font-pixel">VIA-GENT</span>
          <span className="mx-2">•</span>
          <span>Intelligent Local Dev</span>
        </div>
      </div>
    </div>
  )
}

