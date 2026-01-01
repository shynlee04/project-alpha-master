/**
 * Agent Creation Success Feedback - User Onboarding Celebration
 *
 * Displays success notification when agent is created, with auto-switch
 * to new agent and brief tutorial tooltip for next steps.
 *
 * User Journey:
 * 1. User fills out agent form and clicks "Create Agent"
 * 2. Form submits → Success toast appears: "✅ Agent created! Switching to 'My Agent'..."
 * 3. Auto-switch happens → Agent selector shows new agent as active
 * 4. Tutorial tooltip appears: "💡 Tip: Configure tools to give your agent superpowers"
 *
 * @module presentation/components/agent/AgentCreationSuccess
 * @priority P0 - Event Activity Indicator
 * @story P0-4 - Agent Creation Success Feedback
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Lightbulb, X } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';

/**
 * Agent Creation Success Props
 */
interface AgentCreationSuccessProps {
  agentName: string;
  agentId: string;
  onDismiss: () => void;
  onConfigureTools?: () => void;
}

/**
 * Agent Creation Success Component
 */
export function AgentCreationSuccess({
  agentName,
  agentId,
  onDismiss,
  onConfigureTools,
}: AgentCreationSuccessProps) {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(true);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  /**
   * Handle configure tools click
   */
  const handleConfigureTools = () => {
    setShowTooltip(false);
    onDismiss();
    if (onConfigureTools) {
      onConfigureTools();
    }
  };

  return (
    <div className="agent-creation-success fixed bottom-4 right-4 max-w-md p-4 bg-green-500 text-white rounded-lg shadow-lg animate-in slide-in-from-bottom">
      {/* Dismiss button */}
      <button
        onClick={() => {
          setShowTooltip(false);
          onDismiss();
        }}
        className="absolute top-2 right-2 p-1 hover:bg-green-600 rounded"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Success message */}
      <div className="flex items-start gap-3 mb-3">
        <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm mb-1">
            {t('agentCreated.title')}
          </h4>
          <p className="text-xs text-green-100">
            {t('agentCreated.message', { agent: agentName })}
          </p>
        </div>
      </div>

      {/* Tutorial tooltip */}
      {showTooltip && (
        <div className="p-3 bg-green-600/50 rounded border border-green-400/50">
          <div className="flex items-start gap-2 mb-2">
            <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 text-yellow-300" />
            <div className="text-xs">
              <p className="font-medium text-green-100 mb-1">
                {t('agentCreated.tip.title')}
              </p>
              <p className="text-green-100">
                {t('agentCreated.tip.message')}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleConfigureTools}
              className="h-7 text-xs bg-white text-green-700 hover:bg-green-50"
            >
              {t('agentCreated.configureTools')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTooltip(false)}
              className="h-7 text-xs text-green-100 hover:text-white hover:bg-green-600"
            >
              {t('agentCreated.dismiss')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * i18n Translation Keys (add to en.json and vi.json)
 *
 * {
 *   "agentCreated": {
 *     "title": "Agent Created Successfully!",
 *     "message": "{{agent}} is ready to use. Switched to new agent automatically.",
 *     "tip": {
 *       "title": "Next Step: Configure Tools",
 *       "message": "Give your agent access to file operations, terminal commands, and workspace-specific capabilities."
 *     },
 *     "configureTools": "Configure Tools",
 *     "dismiss": "Dismiss"
 *   }
 * }
 */
