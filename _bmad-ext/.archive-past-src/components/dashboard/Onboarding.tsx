import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, PlayCircle } from 'lucide-react'
import { PitchDeck } from './PitchDeck'

export function Onboarding() {
    const { t } = useTranslation()
    const [showPitch, setShowPitch] = useState(false)

    return (
        <>
            <div className="relative group overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 mb-8 shadow-2xl transition-all hover:border-cyan-500/30 hover:shadow-cyan-500/10">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:opacity-100 transition-opacity duration-700 opacity-70" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-sm font-medium animate-fade-in-up">
                            <Sparkles size={14} className="animate-pulse" />
                            <span>v0.1.0 Alpha Release</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                            {t('onboarding.slides.intro.title')}
                        </h1>
                        <p className="text-xl text-slate-400 font-light max-w-xl leading-relaxed">
                            {t('onboarding.slides.intro.desc')}
                        </p>

                        <button
                            onClick={() => setShowPitch(true)}
                            className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-full font-bold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
                        >
                            {t('onboarding.launch')}
                            <PlayCircle size={24} className="group-hover/btn:fill-slate-950 group-hover/btn:text-white transition-colors" />
                        </button>
                    </div>

                    {/* Visual Graphic */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0 animate-float">
                        <img src="/via-gent-logo.svg" alt="Via-gent" className="w-full h-full drop-shadow-[0_0_50px_rgba(6,182,212,0.3)]" />
                        {/* Decorative Rings */}
                        <div className="absolute inset-0 border border-cyan-500/20 rounded-full scale-110 animate-spin-slow-reverse" />
                        <div className="absolute inset-0 border border-violet-500/20 rounded-full scale-150 animate-spin-slow" />
                    </div>
                </div>
            </div>

            <PitchDeck isOpen={showPitch} onClose={() => setShowPitch(false)} />
        </>
    )
}
