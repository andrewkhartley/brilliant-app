import { ExperienceCard } from '@/components/ExperienceCard';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * WhatElse section — 2-card ExperienceCard grid linking to Cruise +
 * Habitat playground experiences.
 *
 * Each card is the whole-rectangle click target Phase 6 established
 * (P6.T6 ExperienceCard). Destinations 404 until Phase 10 (Cruise) and
 * Phase 11 (Habitat) ship. Card images are deferred — when Phase 10/11
 * land their scene art, the cards can pick up thumbnails.
 *
 * Interstellar isn't in this grid because it has its own inline taster
 * upstream in the TryOne section. WhatElse is the "what ELSE I built"
 * beat — the two experiences beyond the inline demo.
 *
 * Copy is placeholder; Andrew refines over the weekend with full landing
 * arc visible end-to-end.
 */
export function WhatElse() {
    const { t } = useTranslation();

    return (
        <section className="mx-auto max-w-5xl border-t border-neutral-200 px-4 py-20">
            <h2 className="text-3xl font-semibold tracking-tight">
                {t('landing.whatElse.heading')}
            </h2>
            <p className="mt-4 text-lg text-neutral-700">
                {t('landing.whatElse.intro')}
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
                <ExperienceCard
                    href="/playground/cruise"
                    title={t('landing.whatElse.cards.cruise.title')}
                    description={t('landing.whatElse.cards.cruise.description')}
                />
                <ExperienceCard
                    href="/playground/habitat"
                    title={t('landing.whatElse.cards.habitat.title')}
                    description={t(
                        'landing.whatElse.cards.habitat.description',
                    )}
                />
            </div>
        </section>
    );
}
