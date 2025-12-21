import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, PlayCircle } from 'lucide-react'
import { PitchDeck } from './PitchDeck'

export function Onboarding() {
    const { t } = useTranslation()
    const [showPitch, setShowPitch] = useState(false)

    return (
        <>
            <div className="relative group overflow-hidden rounded-none bg-card border border-border p-8 mb-8 shadow-2xl transition-all hover:border-primary/30 hover:shadow-primary/10">
                {/* Background Effects - VIA-GENT Orange gradient */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/20 to-amber-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:opacity-100 transition-opacity duration-700 opacity-70" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none bg-orange-950/50 border border-primary/30 text-primary text-sm font-medium animate-fade-in-up">
                            <Sparkles size={14} className="animate-pulse" />
                            <span>v0.1.0 Alpha Release</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                            {t('onboarding.slides.intro.title')}
                        </h1>
                        <p className="text-xl text-muted-foreground font-light max-w-xl leading-relaxed">
                            {t('onboarding.slides.intro.desc')}
                        </p>

                        <button
                            onClick={() => setShowPitch(true)}
                            className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-none font-bold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(194,65,12,1)]"
                        >
                            {t('onboarding.launch')}
                            <PlayCircle size={24} className="group-hover/btn:fill-white group-hover/btn:text-primary transition-colors" />
                        </button>
                    </div>

                    {/* Visual Graphic */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0 animate-float">
                        <img src="/via-gent-logo.svg" alt="Via-gent" className="w-full h-full drop-shadow-[0_0_50px_rgba(249,115,22,0.3)]" />
                        {/* Decorative Rings - Orange themed */}
                        <div className="absolute inset-0 border border-primary/20 rounded-full scale-110 animate-spin-slow-reverse" />
                        <div className="absolute inset-0 border border-amber-500/20 rounded-full scale-150 animate-spin-slow" />
                    </div>
                </div>
            </div>

            <PitchDeck isOpen={showPitch} onClose={() => setShowPitch(false)} />
        </>
    )
}

