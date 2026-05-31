import { Link } from '@inertiajs/react';

import { useTranslation } from '@/hooks/useTranslation';
import { cruise as cruiseRoute } from '@/routes/playground';

import type { CruiseInput } from './types';

interface HorizonsErrorProps {
    /** The trip the user was attempting when Horizons timed out. */
    cruise: CruiseInput;
    /**
     * Destination names resolved from `cruise.destinations` (codes) by
     * the controller's error branch — the catalog lookup happens
     * server-side so the panel doesn't have to ship the full
     * destination catalog just to render an attempted-trip summary.
     */
    attemptedDestinationNames: string[];
}

/**
 * Friendly fallback rendered on the review page when the
 * `CruiseController::review` action catches a `GuzzleException` from
 * the JPL Horizons call chain (T5 wired the controller; T6 ships this
 * surface). Three jobs:
 *
 *  1. **Explain what happened** in plain language — Horizons is
 *     transient-flaky, not broken, and the tone should match that. No
 *     alarming red panel; a neutral amber surface reads as "pause +
 *     retry" rather than "failure".
 *  2. **Show the trip the user lost** so they don't have to remember
 *     what they typed. The destinations + departure date come in via
 *     props (`cruise` carries the codes + date; `attemptedDestinationNames`
 *     carries the resolved human names from the server-side catalog).
 *  3. **Offer a prominent retry** that goes back to the form.
 *     Inertia preserves session, but the form state itself resets —
 *     the attempted-trip summary above gives users everything they
 *     need to re-enter quickly.
 *
 * Animation: the outer panel reuses `cruise-leg-reveal` for its
 * entrance (fade + slide-up, motion-safe gated). The decorative
 * planet icon at the top of the panel uses a NEW `cruise-error-drift`
 * keyframe — slow horizontal drift to suggest "the planet is just out
 * of reach right now". Both are gated behind
 * `prefers-reduced-motion: no-preference`.
 *
 * Logical Tailwind classes only — `ms-`/`me-` over `ml-`/`mr-` — so
 * the layout flips cleanly for RTL locales in Phase 11.
 */
export function HorizonsError({
    cruise,
    attemptedDestinationNames,
}: HorizonsErrorProps) {
    const { t } = useTranslation();

    // Fall back to the raw codes if the controller couldn't resolve
    // them (defensive — `Destination::getCachedFacts()->keyBy(...)`
    // covers every seeded body, but a malformed manual session-write
    // could slip past). The display-only join doesn't need to match
    // the wire payload exactly; it just needs to be readable.
    const displayedDestinations =
        attemptedDestinationNames.length > 0
            ? attemptedDestinationNames
            : cruise.destinations;

    return (
        <div
            role="alert"
            aria-labelledby="horizons-error-heading"
            className="cruise-leg-reveal mt-10 overflow-hidden rounded-lg border border-amber-300 bg-amber-50 shadow-sm"
        >
            <div className="flex flex-wrap items-center gap-4 border-b border-amber-200 bg-amber-100/60 px-6 py-5">
                <span
                    aria-label={t('cruise.review.horizonsError.iconAriaLabel')}
                    className="cruise-error-drift inline-flex h-12 w-12 items-center justify-center"
                >
                    <img
                        src="/assets/img/destinations/sat.png"
                        alt=""
                        aria-hidden="true"
                        className="h-12 w-12 object-contain opacity-80"
                    />
                </span>
                <h2
                    id="horizons-error-heading"
                    className="text-xl font-semibold text-amber-900"
                >
                    {t('cruise.review.horizonsError.heading')}
                </h2>
            </div>

            <div className="px-6 py-6">
                <p className="text-base text-amber-900">
                    {t('cruise.review.horizonsError.body')}
                </p>

                <section
                    aria-label={t(
                        'cruise.review.horizonsError.attemptedHeading',
                    )}
                    className="mt-6 rounded border border-amber-200 bg-white/70 px-4 py-4"
                >
                    <h3 className="text-sm font-semibold tracking-wide text-amber-900 uppercase">
                        {t('cruise.review.horizonsError.attemptedHeading')}
                    </h3>
                    <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-xs font-medium tracking-wide text-amber-700 uppercase">
                                {t(
                                    'cruise.review.horizonsError.attemptedDestinationsLabel',
                                )}
                            </dt>
                            <dd className="mt-1 font-medium text-neutral-900">
                                {displayedDestinations.join(
                                    t(
                                        'cruise.review.horizonsError.attemptedDestinationsSeparator',
                                    ),
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium tracking-wide text-amber-700 uppercase">
                                {t(
                                    'cruise.review.horizonsError.attemptedDateLabel',
                                )}
                            </dt>
                            <dd className="mt-1 font-medium text-neutral-900">
                                {cruise.tripStart}
                            </dd>
                        </div>
                    </dl>
                </section>

                <div className="mt-6">
                    <Link
                        href={cruiseRoute.url()}
                        className="inline-flex items-center rounded-md bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                    >
                        {t('cruise.review.horizonsError.ctaLabel')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
