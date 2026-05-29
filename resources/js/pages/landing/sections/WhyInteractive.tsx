import { useTranslation } from '@/hooks/useTranslation';

/**
 * WhyInteractive section — philosophy prose, no multi-plane scene.
 *
 * Serves as visual rest between two scrolly sections (Hero, CovidOrigin)
 * and the interactive TryOne demo. Three paragraphs:
 * - Brilliant's "feel the math" framing (attribution to Brilliant)
 * - Disney's 1937 multi-plane camera framing (attribution to Disney —
 *   carries Andrew's craft-lineage acknowledgment per project memory
 *   brilliant-disney-background)
 * - Synthesis: both inventions answer the same question
 *
 * Composition: static prose only. Top border separates from the dark
 * MultiPlaneScene above (CovidOrigin) — first non-dark-scene section,
 * a hairline border reads appropriately here.
 *
 * Copy is placeholder; Andrew refines over the weekend with the full
 * landing arc visible end-to-end.
 */
export function WhyInteractive() {
    const { t } = useTranslation();

    return (
        <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-20">
            <h2 className="text-3xl font-semibold tracking-tight">
                {t('landing.whyInteractive.heading')}
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-neutral-700">
                <p>{t('landing.whyInteractive.feelTheMath')}</p>
                <p>{t('landing.whyInteractive.multiPlaneCamera')}</p>
                <p>{t('landing.whyInteractive.synthesis')}</p>
            </div>
        </section>
    );
}
