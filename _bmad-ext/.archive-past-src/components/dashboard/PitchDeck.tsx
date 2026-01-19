import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronRight, ChevronLeft, Shield, Network, Building2, Rocket, Repeat } from 'lucide-react'
import { createPortal } from 'react-dom'

interface PitchDeckProps {
    isOpen: boolean
    onClose: () => void
}

export function PitchDeck({ isOpen, onClose }: PitchDeckProps) {
    const { t } = useTranslation()
    const [currentSlide, setCurrentSlide] = useState(0)
    const slides = ['intro', 'privacy', 'agents', 'workflows', 'roadmap', 'contact']

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return
            if (e.key === 'ArrowRight') nextSlide()
            if (e.key === 'ArrowLeft') prevSlide()
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, currentSlide])

    if (!isOpen) return null

    const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))
    const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0))

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
            >
                <X size={24} />
            </button>

            <div className="w-full max-w-6xl aspect-video relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-slate-900/50">
                {/* Abstract Backgrounds */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.15),_transparent_70%)]" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" /> {/* Assuming generic grid pattern or just keeping simple */}

                {/* Navigation Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-600 hover:bg-slate-500'}`}
                        />
                    ))}
                </div>

                {/* Slide Content */}
                <div className="relative z-10 w-full h-full flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}>

                    {/* Slide 1: Intro */}
                    <SlideWrapper active={currentSlide === 0}>
                        <div className="text-center space-y-8">
                            <img src="/via-gent-logo.svg" className="h-48 mx-auto animate-pulse-slow drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]" alt="Logo" />
                            <div>
                                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 tracking-tight mb-4">
                                    {t('onboarding.slides.intro.title')}
                                </h1>
                                <p className="text-2xl text-slate-300 font-light max-w-2xl mx-auto">
                                    {t('onboarding.slides.intro.desc')}
                                </p>
                            </div>
                            <button onClick={nextSlide} className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2 mx-auto">
                                {t('onboarding.controls.next')} <ChevronRight size={20} />
                            </button>
                        </div>
                    </SlideWrapper>

                    {/* Slide 2: Privacy */}
                    <SlideWrapper active={currentSlide === 1}>
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="p-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/5">
                                <Shield size={80} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-5xl font-bold text-white">{t('onboarding.slides.privacy.title')}</h2>
                            <h3 className="text-2xl text-emerald-400 font-medium tracking-widest uppercase">{t('onboarding.slides.privacy.subtitle')}</h3>
                            <p className="text-xl text-slate-400 max-w-2xl">{t('onboarding.slides.privacy.desc')}</p>
                        </div>
                    </SlideWrapper>

                    {/* Slide 3: Agents */}
                    <SlideWrapper active={currentSlide === 2}>
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="p-8 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 ring-4 ring-violet-500/5 relative">
                                <Network size={80} strokeWidth={1.5} />
                                <div className="absolute inset-0 animate-ping opacity-20 bg-violet-500 rounded-full" />
                            </div>
                            <h2 className="text-5xl font-bold text-white">{t('onboarding.slides.agents.title')}</h2>
                            <h3 className="text-2xl text-violet-400 font-medium tracking-widest uppercase">{t('onboarding.slides.agents.subtitle')}</h3>
                            <p className="text-xl text-slate-400 max-w-2xl">{t('onboarding.slides.agents.desc')}</p>
                        </div>
                    </SlideWrapper>

                    {/* Slide 4: Workflows */}
                    <SlideWrapper active={currentSlide === 3}>
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="p-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 ring-4 ring-cyan-500/5">
                                <Building2 size={80} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-5xl font-bold text-white">{t('onboarding.slides.workflows.title')}</h2>
                            <h3 className="text-2xl text-cyan-400 font-medium tracking-widest uppercase">{t('onboarding.slides.workflows.subtitle')}</h3>
                            <p className="text-xl text-slate-400 max-w-2xl">{t('onboarding.slides.workflows.desc')}</p>
                        </div>
                    </SlideWrapper>

                    {/* Slide 5: Roadmap */}
                    <SlideWrapper active={currentSlide === 4}>
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="p-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 ring-4 ring-amber-500/5">
                                <Rocket size={80} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-5xl font-bold text-white">{t('onboarding.slides.roadmap.title')}</h2>
                            <p className="text-xl text-slate-400 max-w-2xl">{t('onboarding.slides.roadmap.desc')}</p>
                            <div className="flex gap-4 mt-8">
                                {['Collaborative', 'Mobile', 'Plugin'].map(item => (
                                    <div key={item} className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-slate-300">{item}</div>
                                ))}
                            </div>
                        </div>
                    </SlideWrapper>

                    {/* Slide 6: Contact */}
                    <SlideWrapper active={currentSlide === 5}>
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg shadow-blue-500/30">
                                LN
                            </div>
                            <h2 className="text-5xl font-bold text-white">{t('onboarding.slides.contact.title')}</h2>
                            <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 w-full max-w-md">
                                <h3 className="text-xl font-semibold text-white mb-1">{t('onboarding.slides.contact.name')}</h3>
                                <p className="text-cyan-400 mb-6">{t('onboarding.slides.contact.roles')}</p>

                                <div className="space-y-4 text-left">
                                    <a href="https://github.com/shynlee04" className="block p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">GitHub</span>
                                        <div className="text-white font-medium">github.com/shynlee04</div>
                                    </a>
                                    <a href="mailto:shynlee04@gmail.com" className="block p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">Email</span>
                                        <div className="text-white font-medium">shynlee04@gmail.com</div>
                                    </a>
                                    <a className="block p-4 rounded-xl bg-slate-800 border border-slate-700">
                                        <span className="text-slate-400 text-xs uppercase tracking-wider">Phone / Zalo</span>
                                        <div className="text-white font-medium">+84 896-444-691</div>
                                    </a>
                                </div>
                            </div>
                            <button onClick={() => setCurrentSlide(0)} className="text-slate-400 hover:text-white flex items-center gap-2 mt-8">
                                <Repeat size={16} /> {t('onboarding.controls.restart')}
                            </button>
                        </div>
                    </SlideWrapper>

                </div>

                {/* Nav Arrows */}
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={32} />
                </button>
                <button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight size={32} />
                </button>

            </div>
        </div>,
        document.body
    )
}

function SlideWrapper({ children, active }: { children: React.ReactNode, active: boolean }) {
    return (
        <div className={`w-full h-full flex-shrink-0 flex items-center justify-center p-16 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0 scale-95'}`}>
            {children}
        </div>
    )
}
