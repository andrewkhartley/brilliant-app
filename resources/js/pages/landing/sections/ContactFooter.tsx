import { useTranslation } from '@/hooks/useTranslation';

/**
 * ContactFooter section stub. Real content lands in P7.T8.
 *
 * This stub renders only a section heading + a "coming in P7.TN" note so the
 * landing page's overall composition is visible end-to-end during the section
 * arc. Subsequent tasks (T2-T8) swap each stub for real section content.
 */
export function ContactFooter() {
    const { t } = useTranslation();

    return (
        <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-16">
            <h2 className="text-2xl font-semibold">
                {t('landing.contactFooter.placeholderTitle')}
            </h2>
            <p className="mt-3 text-neutral-700">
                {t('landing.contactFooter.placeholderNote')}
            </p>
        </section>
    );
}
