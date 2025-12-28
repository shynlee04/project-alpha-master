
import React, { useState } from 'react';
import { WifiOff, Info } from 'lucide-react';
import { useCapabilityDetection } from '@/hooks/useCapabilityDetection';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

export function MobileCapabilityBanner() {
    const { canBootWebContainer } = useCapabilityDetection();
    const [showModal, setShowModal] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    // If we CAN boot WebContainer, or if user dismissed it, don't show
    if (canBootWebContainer || isDismissed) {
        return null;
    }

    return (
        <>
            <div className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                    <WifiOff className="h-5 w-5 shrink-0" />
                    <p>
                        <span className="font-semibold block sm:inline">Welcome! Chat & review works here. </span>
                        <span className="block sm:inline">Editing requires a desktop browser.</span>
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModal(true)}
                    className="text-amber-800 hover:text-amber-900 hover:bg-amber-200/50 dark:text-amber-200 dark:hover:text-amber-100 dark:hover:bg-amber-800/50 shrink-0 ml-2"
                >
                    Learn more
                </Button>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            Browser Capabilities
                        </DialogTitle>
                        <DialogDescription className="pt-2 space-y-2">
                            <p>
                                To provide a full VS Code-like experience, this application uses <strong>WebContainer</strong> technology.
                            </p>
                            <p>
                                This requires a browser with <strong>SharedArrayBuffer</strong> support and strict security isolation (COOP/COEP headers), which are typically available on:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Desktop Chrome 86+</li>
                                <li>Desktop Edge 86+</li>
                                <li>Desktop Firefox 115+ (Limited)</li>
                            </ul>
                            <p className="mt-2 text-amber-600 dark:text-amber-400 font-medium">
                                Your current device supports AI Chat and Code Review, but cannot run the Node.js development environment.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowModal(false)} className="w-full sm:w-auto">
                            Continue in Demo Mode
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
