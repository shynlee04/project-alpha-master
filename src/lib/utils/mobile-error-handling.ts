/**
 * Mobile-Aware Error Handling Utilities
 * @module lib/utils/mobile-error-handling
 *
 * Provides error handling functions that display mobile-specific messages
 * when users are on mobile devices, guiding them to use desktop or
 * Knowledge Hub for IDE features.
 */

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
// import { useDeviceType } from '@/hooks/useMediaQuery'

/**
 * Error type for workspace operations
 */
export type WorkspaceErrorType =
  | 'openFailed'
  | 'permissionDenied'
  | 'notFound'

/**
 * Error type for IDE operations
 */
export type IDEErrorType = 'openOnMobile'

/**
 * Error type for WebContainer operations
 */
export type WebContainerErrorType = 'notSupported' | 'bootFailed'

/**
 * Mobile-specific error messages interface
 */
interface MobileErrorMessages {
  title: string
  description: string
  action: string
}

/**
 * Get mobile-specific error messages for workspace errors
 * 
 * @param type - The type of workspace error
 * @returns Mobile-specific error messages
 */
export function getMobileWorkspaceErrorMessages(type: WorkspaceErrorType): MobileErrorMessages {
  const { t } = useTranslation()

  switch (type) {
    case 'openFailed':
      return {
        title: t('errors.workspace.openFailed.mobileTitle', 'Desktop Feature'),
        description: t('errors.workspace.openFailed.mobileDescription', 'Opening projects requires a desktop browser. Please use Chrome, Edge, or Safari on your computer to access full IDE features.'),
        action: t('errors.workspace.openFailed.mobileAction', 'Go to Knowledge Hub'),
      }
    case 'permissionDenied':
      return {
        title: t('errors.workspace.permissionDenied.mobileTitle', 'Desktop Feature'),
        description: t('errors.workspace.permissionDenied.mobileDescription', 'Folder access requires a desktop browser. Please use Chrome, Edge, or Safari on your computer.'),
        action: t('errors.workspace.permissionDenied.mobileAction', 'Go to Knowledge Hub'),
      }
    case 'notFound':
      return {
        title: t('errors.workspace.notFound.mobileTitle', 'Desktop Feature'),
        description: t('errors.workspace.notFound.mobileDescription', 'Opening projects requires a desktop browser. Please access from a computer to use the IDE.'),
        action: t('errors.workspace.notFound.mobileAction', 'Go to Knowledge Hub'),
      }
  }
}

/**
 * Get mobile-specific error messages for IDE errors
 * 
 * @param type - The type of IDE error
 * @returns Mobile-specific error messages
 */
export function getMobileIDEErrorMessages(type: IDEErrorType): MobileErrorMessages {
  const { t } = useTranslation()

  switch (type) {
    case 'openOnMobile':
      return {
        title: t('errors.ide.openOnMobile.title', 'Desktop Required'),
        description: t('errors.ide.openOnMobile.description', 'Opening the IDE workspace requires a desktop browser with full File System Access API support.'),
        action: t('errors.ide.openOnMobile.action', 'Use Desktop'),
      }
  }
}

/**
 * Get mobile-specific error messages for WebContainer errors
 * 
 * @param type - The type of WebContainer error
 * @returns Mobile-specific error messages
 */
export function getMobileWebContainerErrorMessages(type: WebContainerErrorType): MobileErrorMessages {
  const { t } = useTranslation()

  switch (type) {
    case 'notSupported':
      return {
        title: t('webcontainer.notSupported.mobileTitle', 'Mobile Browser Detected'),
        description: t('webcontainer.notSupported.mobileDescription', 'The full IDE experience requires a desktop browser. Your Knowledge Hub features are still available on mobile.'),
        action: t('webcontainer.notSupported.mobileAction', 'Go to Knowledge Hub'),
      }
    case 'bootFailed':
      return {
        title: t('webcontainer.bootFailed.mobileTitle', 'IDE Initialization Failed'),
        description: t('webcontainer.bootFailed.mobileDescription', 'The IDE failed to initialize. Please refresh the page or try again on a desktop browser.'),
        action: t('webcontainer.bootFailed.mobileAction', 'Refresh Page'),
      }
  }
}

/**
 * Show mobile-aware workspace error toast
 * 
 * @param type - The type of workspace error
 * @param onAction - Optional callback when action is clicked
 */
export function showMobileWorkspaceError(
  type: WorkspaceErrorType,
  onAction?: () => void
): void {
  // const { t } = useTranslation()
  const messages = getMobileWorkspaceErrorMessages(type)

  toast.error(messages.title, {
    description: messages.description,
    action: {
      label: messages.action,
      onClick: () => {
        if (onAction) {
          onAction()
        } else {
          // Default action: navigate to Home
          window.location.href = '/'
        }
      },
    },
    duration: 8000,
  })
}

/**
 * Show mobile-aware IDE error toast
 * 
 * @param type - The type of IDE error
 * @param onAction - Optional callback when action is clicked
 */
export function showMobileIDEError(
  type: IDEErrorType,
  onAction?: () => void
): void {
  const messages = getMobileIDEErrorMessages(type)

  toast.error(messages.title, {
    description: messages.description,
    action: {
      label: messages.action,
      onClick: () => {
        if (onAction) {
          onAction()
        }
      },
    },
    duration: 8000,
  })
}

/**
 * Show mobile-aware workspace error with auto-redirect to Notes workspace
 *
 * This function provides a seamless mobile experience by:
 * 1. Showing a toast notification explaining why FSA is unavailable
 * 2. Providing a "Go to Notes" action button
 * 3. Auto-redirecting after a delay if user doesn't click immediately
 *
 * @param navigate - TanStack Router navigate function
 * @param delayMs - Delay before auto-redirect (default: 2000ms)
 */
export function showMobileWorkspaceRedirect(
    navigate: (to: string) => void,
    delayMs: number = 2000
): void {
    const { t } = useTranslation()

    const messages = {
        title: t('workspace.mobileFsaUnavailable', 'Desktop Feature'),
        description: t(
            'workspace.mobileRedirectDescription',
            'File sync requires a desktop browser. Switching to Notes workspace where you can continue working.'
        ),
        action: t('workspace.goToNotes', 'Go to Notes'),
    }

    // Show toast with action
    toast.info(messages.title, {
        description: messages.description,
        action: {
            label: messages.action,
            onClick: () => {
                navigate('/notes')
            },
        },
        duration: delayMs + 1000, // Slightly longer than redirect delay
        id: 'mobile-workspace-redirect', // Prevent duplicate toasts
    })

    // Auto-redirect after delay
    console.log('[MobileWorkspace] Auto-redirecting to /notes in', delayMs, 'ms')
    setTimeout(() => {
        console.log('[MobileWorkspace] Executing auto-redirect to /notes')
        navigate('/notes')
    }, delayMs)
}

/**
 * Show mobile-aware WebContainer error toast
 *
 * @param type - The type of WebContainer error
 * @param onAction - Optional callback when action is clicked
 */
export function showMobileWebContainerError(
    type: WebContainerErrorType,
    onAction?: () => void
): void {
    const messages = getMobileWebContainerErrorMessages(type)

    toast.error(messages.title, {
        description: messages.description,
        action: {
            label: messages.action,
            onClick: () => {
                if (onAction) {
                    onAction()
                } else {
                    // Default action: navigate to Home
                    window.location.href = '/'
                }
            },
        },
        duration: 8000,
    })
}

/**
 * Check if the error is mobile-specific (should show mobile message)
 * 
 * @param error - The error object or message
 * @returns True if error should show mobile-specific message
 */
export function isMobileSpecificError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('mobile') ||
      message.includes('not supported on mobile') ||
      message.includes('requires desktop') ||
      message.includes('file system access') ||
      message.includes('webcontainer') ||
      message.includes('permission denied')
    )
  }
  return false
}
