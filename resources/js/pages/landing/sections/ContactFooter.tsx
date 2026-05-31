import { useTranslation } from '@/hooks/useTranslation';

/**
 * ContactFooter section — page-specific CTA close above AppLayout's
 * chrome Footer.
 *
 * Sits at the end of the landing scroll arc as a deliberate "let's
 * talk" moment. AppLayout's <Footer /> (P6.T2) provides the universal
 * copyright + GitHub + Email + source-available text on EVERY page;
 * this ContactFooter is the page-LEVEL CTA specifically for the
 * landing.
 *
 * Four contact methods:
 * - Email (mailto:)
 * - GitHub (link to public repo)
 * - LinkedIn (professional profile)
 * - CV (PDF download — will 404 until Phase 14 uploads the file)
 *
 * Some duplication with AppLayout's Footer (Email + GitHub) is
 * intentional. The page-level CTA is the strong close; the chrome
 * Footer is the persistent reach-out throughout the site. The CV
 * href value is itself a translation key so a future locale could
 * swap to a localized CV.
 *
 * The border-t against ClosingScene is intentional: it marks the
 * dark → light transition from the O'Neill dawn into the CTA close.
 *
 * Copy is placeholder; Andrew refines over the weekend.
 */
export function ContactFooter() {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden border-t border-cyan-100/15 bg-[#08111f] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(125,211,252,0.16),transparent_30%),linear-gradient(135deg,rgba(8,17,31,0.9),rgba(15,23,42,0.97))]" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.42)_1px,transparent_1px)] [background-size:42px_42px] opacity-30"
            />
            <div className="relative mx-auto max-w-3xl px-4 py-20 text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {t('landing.contactFooter.heading')}
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">
                    {t('landing.contactFooter.pitch')}
                </p>

                <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-4 text-base font-semibold">
                    <li>
                        <a
                            href={t('landing.contactFooter.links.emailHref')}
                            className="inline-flex items-center gap-2 rounded border border-cyan-100/25 bg-white/5 px-4 py-2 text-cyan-100 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-solid fa-envelope text-cyan-200"
                            />
                            {t('landing.contactFooter.links.email')}
                        </a>
                    </li>
                    <li>
                        <a
                            href={t('landing.contactFooter.links.githubHref')}
                            className="inline-flex items-center gap-2 rounded border border-cyan-100/25 bg-white/5 px-4 py-2 text-cyan-100 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-brands fa-github text-cyan-200"
                            />
                            {t('landing.contactFooter.links.github')}
                        </a>
                    </li>
                    <li>
                        <a
                            href={t('landing.contactFooter.links.linkedinHref')}
                            className="inline-flex items-center gap-2 rounded border border-cyan-100/25 bg-white/5 px-4 py-2 text-cyan-100 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-brands fa-linkedin text-cyan-200"
                            />
                            {t('landing.contactFooter.links.linkedin')}
                        </a>
                    </li>
                    <li>
                        <a
                            href={t('landing.contactFooter.links.cvHref')}
                            className="inline-flex items-center gap-2 rounded border border-cyan-100/25 bg-white/5 px-4 py-2 text-cyan-100 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-solid fa-file-lines text-cyan-200"
                            />
                            {t('landing.contactFooter.links.cv')}
                        </a>
                    </li>
                </ul>
            </div>
        </section>
    );
}
