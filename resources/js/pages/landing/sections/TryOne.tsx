import { Link } from '@inertiajs/react';
import { useState } from 'react';

import { EquationCard } from '@/components/equations/EquationCard';
import { LiveResult } from '@/components/equations/LiveResult';
import { SliderInput } from '@/components/equations/SliderInput';
import { useTranslation } from '@/hooks/useTranslation';
import { SPEED_OF_LIGHT, STANDARD_GRAVITY } from '@/lib/constants';
import { relativisticSpeed } from '@/lib/equations/relativistic-speed';

/**
 * TryOne section — inline Interstellar relativity demo on the landing page.
 *
 * First landing-page consumer of the Phase 6 equation primitives. Composes
 * EquationCard + SliderInput + LiveResult as siblings around the Phase 3
 * registry equation `relativisticSpeed`, giving the visitor a taste of
 * interactive math without leaving the scroll.
 *
 * Composition decisions:
 * - Single-slider v1. The full multi-slider experience (destination,
 *   acceleration, desired duration) lives at /playground/interstellar
 *   (Phase 8). Surfacing one slider on the landing keeps the cognitive
 *   load light — a "taste," not the meal.
 * - The exposed variable is `a` (proper acceleration). It's the most
 *   pedagogically vivid lever for the equation: small changes near 1g
 *   move the result a lot; large values asymptote toward c and visibly
 *   demonstrate the speed-of-light cap.
 * - The held constant is `t` (acceleration duration) at 1 year of
 *   coordinate time. 1 year is large enough that even modest acceleration
 *   produces relativistic speeds, so the asymptotic approach to c
 *   becomes legible across the slider's range.
 * - Slider range is [0.1, 100] m/s² in 0.1 steps — the same min/max/step
 *   the registry already declares for `a`. The default seeded value is
 *   STANDARD_GRAVITY (1g, ≈ 9.80665 m/s²), so the first thing the visitor
 *   sees is "1g for a year gets you about 72% of light speed" — Andrew's
 *   single most-asked physics question in the Covid talks.
 * - Result is displayed as a fraction of c (e.g. "0.7174 c"). Raw m/s is
 *   unreadable at relativistic scales; expressing as `v/c` makes the
 *   asymptote and the equation's behavior immediately legible. The
 *   aria-live region announces the same formatted string so AT users hear
 *   "Peak velocity: 0.72 c" rather than a 9-digit number.
 *
 * Bundle impact (load-bearing):
 * - This section is the first landing-page consumer of EquationCard,
 *   which statically imports KaTeX (~80 kB gzipped). Vite splits each
 *   landing section into its own chunk via the dynamic import in
 *   Landing.tsx, so KaTeX lands in TryOne-*.js (not app-*.js). The
 *   `npm run build` audit verifies this; if KaTeX ever appears in
 *   app-*.js, the section-level code splitting has regressed.
 *
 * Copy: keys are PLACEHOLDER pending Andrew's weekend pass. Structure is
 * what matters here — heading, framing intro, the composition, a link
 * out to the full Interstellar playground.
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function TryOne() {
    const { t } = useTranslation();
    const [acceleration, setAcceleration] = useState<number>(STANDARD_GRAVITY);

    // Hold duration constant at 1 year of coordinate time so the slider's
    // sweep reveals the asymptotic approach to c clearly.
    const oneYearSeconds = 365.25 * 24 * 60 * 60;

    const velocityMetersPerSecond = relativisticSpeed.compute({
        a: acceleration,
        t: oneYearSeconds,
    });
    const fractionOfLightSpeed = velocityMetersPerSecond / SPEED_OF_LIGHT;
    const formattedFraction = fractionOfLightSpeed.toFixed(4);

    return (
        <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-20">
            <h2 className="text-3xl font-semibold tracking-tight">
                {t('landing.tryOne.heading')}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-700">
                {t('landing.tryOne.intro')}
            </p>

            <div className="mt-8 space-y-6">
                <EquationCard equation={relativisticSpeed} />

                <SliderInput
                    id="try-one-acceleration"
                    label={t('landing.tryOne.sliderLabel')}
                    min={0.1}
                    max={100}
                    step={0.1}
                    value={acceleration}
                    onChange={setAcceleration}
                    formatValue={(v) => `${v.toFixed(1)} m/s²`}
                    formatAriaValueText={(v) =>
                        `${v.toFixed(1)} meters per second squared`
                    }
                />

                <LiveResult label={t('landing.tryOne.resultLabel')}>
                    {`${formattedFraction} c`}
                </LiveResult>
            </div>

            <p className="mt-8 text-center">
                <Link
                    href="/playground/interstellar"
                    className="text-blue-700 underline-offset-4 hover:underline focus-visible:underline"
                >
                    {t('landing.tryOne.fullLink')}
                </Link>
            </p>
        </section>
    );
}
