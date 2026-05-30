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
 * Undaunted brand first-mention (P7.T9):
 * - The Undaunted icon mark renders inline at the head of the intro
 *   paragraph, sized small (h-6) to read as part of the reading flow
 *   rather than as a brand drop. This is the first visual surfacing of
 *   the Undaunted name on the landing.
 * - Placement rationale: of the three options considered (wordmark
 *   above heading; icon inline with intro; wordmark below cards as
 *   attribution), the inline-icon option lets visitors *discover* the
 *   Undaunted attribution as part of reading the section's setup
 *   sentence rather than seeing the brand drop before the content —
 *   matches the landing's demonstrative-not-declarative posture. The
 *   wordmark (788x100 aspect) is reserved for future contexts where a
 *   wider banner placement makes sense; the icon (100x100) is the
 *   right shape inline with body text.
 * - Asset path: /assets/brand/undaunted/logo-on-light.svg — the icon
 *   variant designed for light backgrounds (darker, more saturated
 *   sky-blue and amber tones). The original /assets/brand/undaunted/
 *   logo.svg uses the brand's brighter sky-blue + golden-yellow
 *   gradients designed for dark backgrounds (used in dark scenes if
 *   they need branding later). Both icon and wordmark variants live
 *   side-by-side: logo.svg + logo-text.svg are the dark-bg defaults;
 *   logo-on-light.svg + logo-text-on-light.svg are the light-bg
 *   variants. Pick the variant matching the section's background tone.
 * - Accessibility: alt text "Undaunted" flows through t() so the
 *   image carries the brand name for AT users even if the placeholder
 *   intro copy doesn't yet mention Undaunted by name. When Andrew's
 *   weekend copy names Undaunted explicitly in the intro, this alt
 *   can be flipped to "" (decorative) to avoid double-announcement.
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
            <p className="mt-4 flex items-center gap-3 text-lg text-neutral-700">
                <img
                    src="/assets/brand/undaunted/logo-on-light.svg"
                    alt={t('landing.whatElse.undauntedLogoAlt')}
                    className="h-6 w-auto shrink-0"
                />
                <span>{t('landing.whatElse.intro')}</span>
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
