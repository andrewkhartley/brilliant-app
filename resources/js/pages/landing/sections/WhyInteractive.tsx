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
        <section className="relative overflow-hidden bg-[#08111f] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(125,211,252,0.16),transparent_28%),radial-gradient(circle_at_18%_78%,rgba(34,211,238,0.1),transparent_24%),linear-gradient(135deg,rgba(8,17,31,0.88),rgba(15,23,42,0.96))]" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.42)_1px,transparent_1px)] [background-size:42px_42px] opacity-40"
            />
            <div className="relative mx-auto max-w-3xl px-4 py-20">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {t('landing.whyInteractive.heading')}
                </h2>
                <div className="mt-8 space-y-6 text-lg leading-relaxed text-slate-200">
                    <p>{t('landing.whyInteractive.feelTheMath')}</p>
                    <p>{t('landing.whyInteractive.multiPlaneCamera')}</p>
                    <p>{t('landing.whyInteractive.synthesis')}</p>
                </div>
            </div>
        </section>
    );
}
