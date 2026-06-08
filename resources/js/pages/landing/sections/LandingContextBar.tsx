import { Link } from '@inertiajs/react';

import { ResumeLink } from '@/components/ResumeLink';
import { useTranslation } from '@/hooks/useTranslation';

export function LandingContextBar() {
    const { t } = useTranslation();

    return (
        <div
            aria-label={t('landing.contextBar.label')}
            className="sticky top-[5.75rem] z-40 border-y border-cyan-100/14 bg-[#08111f]/92 text-white shadow-[0_10px_34px_rgba(0,0,0,0.28)] backdrop-blur-md sm:top-[4rem]"
        >
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-cyan-50">
                        {t('landing.contextBar.title')}
                    </p>
                    <p className="text-xs text-cyan-100/68">
                        {t('landing.contextBar.summary')}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <Link
                        href="/playground"
                        className="rounded border border-cyan-100/18 bg-cyan-100/8 px-3 py-1.5 text-cyan-100 transition hover:bg-cyan-100/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                    >
                        {t('landing.contextBar.actions.playgrounds')}
                    </Link>
                    <Link
                        href="/projects"
                        className="rounded border border-cyan-100/18 bg-white/5 px-3 py-1.5 text-cyan-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                    >
                        {t('landing.contextBar.actions.projects')}
                    </Link>
                    <ResumeLink
                        href={t('landing.contactFooter.links.cvHref')}
                        ariaLabel={t('landing.contactFooter.links.cvAriaLabel')}
                        className="rounded border border-cyan-100/18 bg-white/5 px-3 py-1.5 text-cyan-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        label={t('landing.contextBar.actions.cv')}
                    />
                    <a
                        href={t('landing.contactFooter.links.emailHref')}
                        className="rounded border border-amber-200/35 bg-amber-200/12 px-3 py-1.5 text-amber-100 transition hover:bg-amber-200/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                    >
                        {t('landing.contextBar.actions.talk')}
                    </a>
                </div>
            </div>
        </div>
    );
}
