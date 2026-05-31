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
        <section className="relative overflow-hidden border-t border-cyan-100/15 bg-[#08111f] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_22%,rgba(125,211,252,0.12),transparent_28%),linear-gradient(135deg,rgba(8,17,31,0.92),rgba(15,23,42,0.97))]" />
            <div className="relative mx-auto max-w-3xl px-4 py-20">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {t('about.disney.heading')}
                </h2>
                <div className="mt-8 space-y-6 text-lg leading-relaxed text-slate-200">
                    <p>{t('about.disney.paragraph1')}</p>
                    <p>{t('about.disney.paragraph2')}</p>
                    <p>{t('about.disney.paragraph3')}</p>
                </div>
            </div>
        </section>
    );
}
