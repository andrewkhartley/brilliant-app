import { useTranslation } from '@/hooks/useTranslation';

/**
 * Why Brilliant section — synthesis + why this application is built
 * as itself.
 *
 * Three paragraphs: Brilliant's "feel the math" engineering principle,
 * the argument-is-the-artifact framing for this application, and the
 * close that leads into the Contact section.
 *
 * Copy is placeholder; Andrew refines.
 */
export function WhyBrilliant() {
    const { t } = useTranslation();

    return (
        <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-20">
            <h2 className="text-3xl font-semibold tracking-tight">
                {t('about.whyBrilliant.heading')}
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-neutral-700">
                <p>{t('about.whyBrilliant.paragraph1')}</p>
                <p>{t('about.whyBrilliant.paragraph2')}</p>
                <p>{t('about.whyBrilliant.paragraph3')}</p>
            </div>
        </section>
    );
}
