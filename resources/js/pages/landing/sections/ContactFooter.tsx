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
        <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-20 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
                {t('landing.contactFooter.heading')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-700">
                {t('landing.contactFooter.pitch')}
            </p>

            <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-base font-medium">
                <li>
                    <a
                        href={t('landing.contactFooter.links.emailHref')}
                        className="text-blue-700 underline-offset-4 hover:underline focus-visible:underline"
                    >
                        {t('landing.contactFooter.links.email')}
                    </a>
                </li>
                <li>
                    <a
                        href={t('landing.contactFooter.links.githubHref')}
                        className="text-blue-700 underline-offset-4 hover:underline focus-visible:underline"
                    >
                        {t('landing.contactFooter.links.github')}
                    </a>
                </li>
                <li>
                    <a
                        href={t('landing.contactFooter.links.linkedinHref')}
                        className="text-blue-700 underline-offset-4 hover:underline focus-visible:underline"
                    >
                        {t('landing.contactFooter.links.linkedin')}
                    </a>
                </li>
                <li>
                    <a
                        href={t('landing.contactFooter.links.cvHref')}
                        className="text-blue-700 underline-offset-4 hover:underline focus-visible:underline"
                    >
                        {t('landing.contactFooter.links.cv')}
                    </a>
                </li>
            </ul>
        </section>
    );
}
