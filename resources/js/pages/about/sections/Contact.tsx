import { useTranslation } from '@/hooks/useTranslation';

/**
 * Contact section — page-specific CTA at the end of the About page.
 *
 * Email + LinkedIn links. GitHub + CV live in AppLayout's chrome
 * Footer; this section is the page-level "let's talk" moment.
 *
 * Mirrors landing/ContactFooter's pattern but simpler — two links
 * instead of four, because the About page's CTA is deliberately
 * lower-friction than the landing's close.
 *
 * Copy is placeholder; Andrew refines.
 */
export function Contact() {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden border-t border-cyan-100/15 bg-[#08111f] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(125,211,252,0.14),transparent_30%),linear-gradient(135deg,rgba(8,17,31,0.92),rgba(15,23,42,0.97))]" />
            <div className="relative mx-auto max-w-3xl px-4 py-20 text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {t('about.contact.heading')}
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">
                    {t('about.contact.pitch')}
                </p>
                <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-base font-semibold">
                    <li>
                        <a
                            href={t('about.contact.links.emailHref')}
                            className="inline-flex items-center gap-2 rounded border border-cyan-100/25 bg-white/5 px-4 py-2 text-cyan-100 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-solid fa-envelope text-cyan-200"
                            />
                            {t('about.contact.links.email')}
                        </a>
                    </li>
                    <li>
                        <a
                            href={t('about.contact.links.linkedinHref')}
                            className="inline-flex items-center gap-2 rounded border border-cyan-100/25 bg-white/5 px-4 py-2 text-cyan-100 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-brands fa-linkedin text-cyan-200"
                            />
                            {t('about.contact.links.linkedin')}
                        </a>
                    </li>
                </ul>
            </div>
        </section>
    );
}
