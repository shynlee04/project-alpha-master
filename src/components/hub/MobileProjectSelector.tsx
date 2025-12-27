/**
 * Mobile Project Selector Component
 *
 * Provides mobile-optimized project access alternatives since
 * File System Access API is not supported on mobile browsers.
 *
 * Features:
 * - Demo templates for quick start
 * - Clear messaging about desktop requirements
 * - Touch-optimized UI (44px targets)
 *
 * @epic Epic-MFA Mobile File Access
 * @story MFA-1 Demo Mode with Templates
 * @file MobileProjectSelector.tsx
 * @created 2025-12-28T01:55:00+07:00
 */

import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Monitor, Smartphone, Zap, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DemoTemplate {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    files: Record<string, string>;
}

/**
 * Pre-loaded demo templates for mobile users
 */
const DEMO_TEMPLATES: DemoTemplate[] = [
    {
        id: 'html-starter',
        name: 'HTML Starter',
        description: 'Simple HTML/CSS/JS project',
        icon: <FileCode className="h-6 w-6" />,
        files: {
            'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Edit this file to get started.</p>
  <script src="script.js"></script>
</body>
</html>`,
            'style.css': `body {
  font-family: system-ui, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #1a1a1a;
  color: #fff;
}

h1 {
  color: #00ff88;
}`,
            'script.js': `console.log('Hello from JavaScript!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded!');
});`,
        },
    },
    {
        id: 'react-starter',
        name: 'React Preview',
        description: 'View-only React example',
        icon: <Zap className="h-6 w-6" />,
        files: {
            'App.jsx': `import React from 'react';

export default function App() {
  return (
    <div className="app">
      <h1>React App</h1>
      <p>This is a demo React component.</p>
    </div>
  );
}`,
        },
    },
];

interface MobileProjectSelectorProps {
    className?: string;
    onClose?: () => void;
}

/**
 * Mobile-optimized project selector with demo templates
 */
export function MobileProjectSelector({
    className,
    onClose,
}: MobileProjectSelectorProps): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleTemplateSelect = (template: DemoTemplate) => {
        // Store template in sessionStorage for demo mode
        sessionStorage.setItem('demo-template', JSON.stringify(template));
        // Navigate to IDE in demo mode
        navigate({ to: '/ide', search: { demo: template.id } });
    };

    return (
        <div className={cn('bg-card border-2 border-border rounded-none p-4', className)}>
            {/* Desktop Required Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-none p-4 mb-6">
                <div className="flex items-start gap-3">
                    <Monitor className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-amber-500 text-sm">
                            {t('mobile.desktopRequired', 'Desktop Browser Required')}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t(
                                'mobile.desktopRequiredDesc',
                                'Full IDE features including folder access and Node.js require a desktop browser (Chrome, Edge, or Safari).'
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Mobile Options */}
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                {t('mobile.mobileOptions', 'Mobile Options')}
            </h4>

            {/* Demo Templates */}
            <div className="space-y-3">
                {DEMO_TEMPLATES.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={cn(
                            'w-full flex items-center gap-4 p-4 bg-background border border-border',
                            'rounded-none hover:bg-accent transition-colors text-left',
                            // MFA-1: 44px touch target
                            'min-h-[56px] touch-manipulation'
                        )}
                    >
                        <div className="shrink-0 p-2 bg-primary/10 text-primary rounded-none">
                            {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h5 className="font-mono font-semibold text-foreground text-sm">
                                {template.name}
                            </h5>
                            <p className="text-xs text-muted-foreground truncate">
                                {template.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Coming Soon */}
            <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                    {t('mobile.comingSoon', 'Zip upload & offline mode coming soon')}
                </p>
            </div>

            {/* Close Button */}
            {onClose && (
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full mt-4 min-h-[44px] touch-manipulation"
                >
                    {t('common.close', 'Close')}
                </Button>
            )}
        </div>
    );
}

export default MobileProjectSelector;
