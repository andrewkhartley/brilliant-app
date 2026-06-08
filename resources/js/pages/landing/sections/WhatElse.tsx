import { ExperienceCard } from '@/components/ExperienceCard';
import { useTranslation } from '@/hooks/useTranslation';

export function WhatElse() {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden border-t border-cyan-100/15 bg-[#07101d] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(125,211,252,0.18),transparent_30%),radial-gradient(circle_at_14%_72%,rgba(34,211,238,0.12),transparent_26%),linear-gradient(180deg,rgba(8,17,31,0.94),rgba(7,16,29,0.98)_72%,rgba(7,16,29,1))]" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.34)_1px,transparent_1px)] [background-size:52px_52px] opacity-30"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#07101d] to-transparent"
            />

            <div className="relative mx-auto max-w-6xl px-4 py-20">
                <div data-landing-reveal>
                    <p className="text-xs font-semibold tracking-[0.26em] text-cyan-200/76 uppercase">
                        {t('landing.whatElse.kicker')}
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                        {t('landing.whatElse.heading')}
                    </h2>
                    <p className="mt-4 flex w-full items-center gap-3 text-lg leading-8 text-slate-200">
                        <img
                            src="/assets/brand/undaunted/logo.svg"
                            alt={t('landing.whatElse.undauntedLogoAlt')}
                            className="h-6 w-auto shrink-0"
                        />
                        <span>{t('landing.whatElse.intro')}</span>
                    </p>
                </div>

                <div
                    data-landing-stagger
                    className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    <ExperienceCard
                        href="/playground/interstellar"
                        title={t('landing.whatElse.cards.interstellar.title')}
                        description={t(
                            'landing.whatElse.cards.interstellar.description',
                        )}
                        imageSrc="/assets/img/bg/color-nebula.jpg"
                        imageAlt=""
                    />
                    <ExperienceCard
                        href="/playground/cruise"
                        title={t('landing.whatElse.cards.cruise.title')}
                        description={t(
                            'landing.whatElse.cards.cruise.description',
                        )}
                        imageSrc="/assets/img/bg/muted-nebula.png"
                        imageAlt=""
                    />
                    <ExperienceCard
                        href="/playground/habitat"
                        title={t('landing.whatElse.cards.habitat.title')}
                        description={t(
                            'landing.whatElse.cards.habitat.description',
                        )}
                        imageSrc="/assets/img/bg/cylinder.jpg"
                        imageAlt=""
                    />
                </div>
            </div>
        </section>
    );
}
