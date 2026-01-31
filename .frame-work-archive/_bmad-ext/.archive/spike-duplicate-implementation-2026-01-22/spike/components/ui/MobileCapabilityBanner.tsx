
import { useState } from 'react';
import { WifiOff, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCapabilityDetection } from '@/hooks/useCapabilityDetection';
import { Button } from '@/spike/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/spike/components/ui/dialog';

export function MobileCapabilityBanner() {
    const { t } = useTranslation();
    const { canBootWebContainer } = useCapabilityDetection();
    const [showModal, setShowModal] = useState(false);
    const [isDismissed] = useState(false);

    // If we CAN boot WebContainer, or if user dismissed it, don't show
    if (canBootWebContainer || isDismissed) {
        return null;
    }

    return (
        <>
            <div className="bg-warning/10 border-b border-warning/30 px-4 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-warning">
                    <WifiOff className="h-5 w-5 shrink-0" />
                    <p>
                        <span className="font-semibold block sm:inline">{t('mobileDemo.welcome')}</span>
                        <span className="block sm:inline">{t('mobileDemo.desktopRequired')}</span>
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModal(true)}
                    className="text-warning hover:text-warning/90 hover:bg-warning/20 shrink-0 ml-2"
                >
                    {t('mobileDemo.learnMore')}
                </Button>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-info" />
                            {t('mobileDemo.dialogTitle')}
                        </DialogTitle>
                        <DialogDescription className="pt-2 space-y-2">
                            <p>{t('mobileDemo.dialogDescription1')}</p>
                            <p>{t('mobileDemo.dialogDescription2')}</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>{t('mobileDemo.browserChrome')}</li>
                                <li>{t('mobileDemo.browserEdge')}</li>
                                <li>{t('mobileDemo.browserFirefox')}</li>
                            </ul>
                            <p className="mt-2 text-warning font-medium">
                                {t('mobileDemo.currentDeviceNote')}
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowModal(false)} className="w-full sm:w-auto">
                            {t('mobileDemo.continueDemo')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
