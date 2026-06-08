import { Link } from '@inertiajs/react';

import { ResumeLink } from '@/components/ResumeLink';
import { useTranslation } from '@/hooks/useTranslation';

export function Orientation() {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden border-y border-cyan-100/15 bg-[#07101d] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_16%,rgba(125,211,252,0.17),transparent_30%),radial-gradient(circle_at_82%_84%,rgba(241,197,94,0.1),transparent_28%),linear-gradient(180deg,rgba(8,17,31,0.98),rgba(7,16,29,1))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-200/72 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-200/54 to-transparent" />

            <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[0.72fr_1.18fr] lg:items-start">
                <div data-landing-reveal>
                    <p className="text-xs font-semibold tracking-[0.26em] text-cyan-200/76 uppercase">
                        {t('landing.orientation.kicker')}
                    </p>
                    <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-normal text-white sm:text-4xl">
                        {t('landing.orientation.heading')}
                    </h2>
                    <div
                        data-landing-stagger
                        className="mt-8 grid max-w-md grid-cols-2 gap-3 text-sm font-semibold"
                    >
                        <Link
                            href="/playground"
                            className="inline-flex min-h-11 items-center justify-center rounded border border-cyan-100/25 bg-cyan-100/10 px-4 py-2 text-center text-cyan-100 transition hover:bg-cyan-100/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        >
                            {t('landing.orientation.actions.playgrounds')}
                        </Link>
                        <Link
                            href="/projects"
                            className="inline-flex min-h-11 items-center justify-center rounded border border-cyan-100/20 bg-white/5 px-4 py-2 text-center text-cyan-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        >
                            {t('landing.orientation.actions.projects')}
                        </Link>
                        <ResumeLink
                            href={t('landing.contactFooter.links.cvHref')}
                            ariaLabel={t(
                                'landing.contactFooter.links.cvAriaLabel',
                            )}
                            className="inline-flex min-h-11 items-center justify-center rounded border border-cyan-100/20 bg-white/5 px-4 py-2 text-center text-cyan-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                            label={t('landing.orientation.actions.cv')}
                        />
                        <a
                            href={t('landing.contactFooter.links.emailHref')}
                            className="inline-flex min-h-11 items-center justify-center rounded border border-amber-200/35 bg-amber-200/10 px-4 py-2 text-center text-amber-100 transition hover:bg-amber-200/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                        >
                            {t('landing.orientation.actions.talk')}
                        </a>
                    </div>
                </div>

                <div
                    data-landing-reveal
                    data-landing-delay="0.08"
                    className="text-lg leading-8 text-slate-200"
                >
                    <p>{t('landing.orientation.paragraph1')}</p>
                    <p className="mt-5">
                        {t('landing.orientation.paragraph2Prefix')}{' '}
                        <strong className="story-glow-emphasis">
                            {t('landing.orientation.paragraph2Emphasis')}
                        </strong>
                    </p>
                </div>
            </div>
        </section>
    );
}
