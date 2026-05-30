import { useTranslation } from '@/hooks/useTranslation';

/**
 * Disney section stub. Real content lands in P12.T2.
 *
 * This stub renders only a section heading + a "coming in P12.T2" note
 * so the About page's overall composition is visible end-to-end during
 * the section arc. P12.T2 swaps for real Disney chapter content
 * (heading + 3 paragraphs).
 */
export function Disney() {
    const { t } = useTranslation();

    return (
        <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-16">
            <h2 className="text-2xl font-semibold">
                {t('about.disney.placeholderTitle')}
            </h2>
            <p className="mt-3 text-neutral-700">
                {t('about.disney.placeholderNote')}
            </p>
        </section>
    );
}
