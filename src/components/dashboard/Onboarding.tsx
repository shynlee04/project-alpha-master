import { useTranslation } from 'react-i18next'
import { Github, Mail, Sparkles, User, Phone } from 'lucide-react'

export function Onboarding() {
    const { t } = useTranslation()

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 mb-8 shadow-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Pitch */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-medium">
                        <Sparkles size={14} />
                        <span>v0.1.0 Alpha</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        {t('onboarding.title')}
                    </h1>
                    <p className="text-xl text-slate-400 font-light">
                        {t('onboarding.subtitle')}
                    </p>

                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-lg font-medium text-white mb-2">{t('onboarding.about.title')}</h3>
                        <p className="text-slate-400 leading-relaxed">
                            {t('onboarding.about.description')}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <a href="https://github.com/shynlee04/project-alpha-master" target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-cyan-50 transition-colors shadow-lg shadow-cyan-500/10">
                            <Github size={20} />
                            {t('onboarding.cta.github')}
                        </a>
                        <a href="mailto:shynlee04@gmail.com"
                            className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg font-medium border border-slate-700 hover:bg-slate-700 transition-colors">
                            <Mail size={20} />
                            {t('onboarding.cta.contact')}
                        </a>
                    </div>
                </div>

                {/* Right: Creator Card */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl blur opacity-20 transform rotate-3 scale-105" />
                    <div className="relative p-8 rounded-2xl bg-slate-900/90 border border-slate-700/50 backdrop-blur-md">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">{t('onboarding.contact.title')}</h4>
                                <h2 className="text-2xl font-bold text-white">{t('onboarding.contact.name')}</h2>
                                <p className="text-cyan-400 text-sm mt-1">{t('onboarding.contact.role')}</p>
                            </div>
                            <div className="p-3 bg-slate-800 rounded-full border border-slate-700">
                                <User size={32} className="text-slate-400" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                <Github size={18} className="text-slate-400" />
                                <a href="https://github.com/shynlee04" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white transition-colors text-sm">github.com/shynlee04</a>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                <Mail size={18} className="text-slate-400" />
                                <a href="mailto:shynlee04@gmail.com" className="text-slate-300 hover:text-white transition-colors text-sm">shynlee04@gmail.com</a>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                <Phone size={18} className="text-slate-400" />
                                <span className="text-slate-300 text-sm">+84 896-444-691</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
