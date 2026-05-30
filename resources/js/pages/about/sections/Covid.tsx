import { useTranslation } from '@/hooks/useTranslation';

/**
 * Covid talks section — the 2020 pivot.
 *
 * Three paragraphs covering the March 2020 47-person Zoom, the
 * overnight rebuild from explanation-mode to lever-pulling, and the
 * pattern that surfaced across the year — the discovery this site
 * is built around.
 *
 * Copy is placeholder; Andrew refines.
 */
export function Covid() {
    const { t } = useTranslation();

    return (
        <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-20">
            <h2 className="text-3xl font-semibold tracking-tight">
                {t('about.covid.heading')}
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-neutral-700">
                <p>{t('about.covid.paragraph1')}</p>
                <p>{t('about.covid.paragraph2')}</p>
                <p>{t('about.covid.paragraph3')}</p>
            </div>
        </section>
    );
}
