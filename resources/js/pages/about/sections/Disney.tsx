import { useTranslation } from '@/hooks/useTranslation';

/**
 * Disney chapter section — craft lineage.
 *
 * Three paragraphs about Andrew's Disney Cast Member background and
 * how the multi-plane sensibility was inherited from that environment.
 * Concrete details ground the section; the abstract "craft lineage"
 * framing comes through specifics.
 *
 * Copy is placeholder; Andrew refines.
 */
export function Disney() {
    const { t } = useTranslation();

    return (
        <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-20">
            <h2 className="text-3xl font-semibold tracking-tight">
                {t('about.disney.heading')}
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-neutral-700">
                <p>{t('about.disney.paragraph1')}</p>
                <p>{t('about.disney.paragraph2')}</p>
                <p>{t('about.disney.paragraph3')}</p>
            </div>
        </section>
    );
}
