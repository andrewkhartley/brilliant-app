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
        <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-20 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
                {t('about.contact.heading')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-700">
                {t('about.contact.pitch')}
            </p>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-base font-medium">
                <li>
                    <a
                        href={t('about.contact.links.emailHref')}
                        className="text-blue-700 underline-offset-4 hover:underline focus-visible:underline"
                    >
                        {t('about.contact.links.email')}
                    </a>
                </li>
                <li>
                    <a
                        href={t('about.contact.links.linkedinHref')}
                        className="text-blue-700 underline-offset-4 hover:underline focus-visible:underline"
                    >
                        {t('about.contact.links.linkedin')}
                    </a>
                </li>
            </ul>
        </section>
    );
}
