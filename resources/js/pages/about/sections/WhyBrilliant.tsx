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
        <section className="relative overflow-hidden border-t border-cyan-100/15 bg-[#08111f] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_82%,rgba(125,211,252,0.12),transparent_28%),linear-gradient(135deg,rgba(8,17,31,0.92),rgba(15,23,42,0.97))]" />
            <div className="relative mx-auto max-w-3xl px-4 py-20">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {t('about.whyBrilliant.heading')}
                </h2>
                <div className="mt-8 space-y-6 text-lg leading-relaxed text-slate-200">
                    <p>{t('about.whyBrilliant.paragraph1')}</p>
                    <p>{t('about.whyBrilliant.paragraph2')}</p>
                    <p>{t('about.whyBrilliant.paragraph3')}</p>
                </div>
            </div>
        </section>
    );
}
