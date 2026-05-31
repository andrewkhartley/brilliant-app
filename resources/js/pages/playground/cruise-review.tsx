import { Link } from '@inertiajs/react';

import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { cruise as cruiseRoute } from '@/routes/playground';

import { HorizonsError } from './cruise/HorizonsError';
import type { Coordinates, CruiseInput, Leg, Trip } from './cruise/types';

/**
 * Per-leg stagger delay (ms) for the review-page reveal cascade.
 * A 3-leg trip finishes in ~640ms (0 + 120 + 240 + 400ms animation
 * tail); an 8-leg trip lands at ~1.24s, still inside the "snappy"
 * window for a one-time entrance. CSS-only via the
 * `.cruise-leg-reveal` utility in `resources/css/app.css`; gated
 * behind `prefers-reduced-motion: no-preference` so reduced-motion
 * users get the data instantly.
 */
const LEG_REVEAL_STAGGER_MS = 120;

interface CruiseReviewPageProps {
    /** Original form submission (destinations + tripStart). */
    cruise: CruiseInput;
    /**
     * Server-computed trip data — null on the Horizons-error path so
     * the `<HorizonsError />` fallback (T6) can render in its place.
     */
    trip: Trip | null;
    /**
     * `true` when the controller caught a `GuzzleException` from the
     * Horizons call chain. T6 wires this to the `<HorizonsError />`
     * panel, which tells the user what trip they were attempting and
     * offers a prominent retry CTA.
     */
    horizonsError: boolean;
    /**
     * Destination names parallel to `cruise.destinations` (codes),
     * resolved from the cached destination catalog by the controller's
     * error branch. The success path leaves this empty — names there
     * come through `trip.legs[].departureName` / `arrivalName`.
     */
    attemptedDestinationNames: string[];
}

/**
 * /playground/cruise/review — trip-results page.
 *
 * Modeled on the Interstellar playground's composition rhythm: one
 * page-width column, a summary band, then an itinerary list where
 * every leg is a single scannable row. No per-leg scene heroes — the
 * MultiPlaneScene primitive is the wrong abstraction here: stacking
 * three sticky-frame parallax surfaces breaks the flow and forces
 * users to scroll past 180+vh of decoration to reach their numbers.
 * Planet imagery still appears inline at icon scale (48×48) so the
 * trip feels physical without becoming a slideshow.
 *
 * Data path: form (`/playground/cruise`) → POST → flashes
 * `{destinations, tripStart}` → THIS controller's `review` action
 * pulls the flash, transforms it into the leg-shape DestinationService
 * expects, calls `prepareDestinationsData()` (hits Horizons via T2's
 * cache) + `tripBuild()`, then slims the result via `presentTrip()`.
 * Cold visits (no flash) bounce back to the form.
 *
 * Logical Tailwind classes only — no positional `ml-`/`mr-` etc.
 */
export default function CruiseReviewPage({
    cruise,
    trip,
    horizonsError,
    attemptedDestinationNames,
}: CruiseReviewPageProps) {
    const { t } = useTranslation();

    return (
        <AppLayout pageTitle={t('cruise.review.title')}>
            <section className="mx-auto max-w-4xl px-4 py-12">
                <div className="flex items-baseline justify-between gap-6">
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                        {t('cruise.review.title')}
                    </h1>
                    <Link
                        href={cruiseRoute.url()}
                        className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline"
                    >
                        {t('cruise.review.backToForm')}
                    </Link>
                </div>
                <p className="mt-4 text-lg text-neutral-700">
                    {t('cruise.review.lead')}
                </p>

                {horizonsError ? (
                    <HorizonsError
                        cruise={cruise}
                        attemptedDestinationNames={attemptedDestinationNames}
                    />
                ) : (
                    trip !== null && (
                        <ComputedTripView cruise={cruise} trip={trip} />
                    )
                )}
            </section>
        </AppLayout>
    );
}

interface ComputedTripViewProps {
    cruise: CruiseInput;
    trip: Trip;
}

function ComputedTripView({ cruise, trip }: ComputedTripViewProps) {
    const { t } = useTranslation();

    return (
        <>
            <section className="mt-10 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
                <h2 className="text-xl font-semibold text-neutral-900">
                    {t('cruise.review.summary.heading')}
                </h2>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                    <SummaryItem
                        label={t('cruise.review.summary.legsLabel')}
                        value={String(trip.legs.length)}
                    />
                    <SummaryItem
                        label={t('cruise.review.summary.departureLabel')}
                        value={trip.departureTime ?? '—'}
                    />
                    <SummaryItem
                        label={t('cruise.review.summary.arrivalLabel')}
                        value={trip.arrivalTime ?? '—'}
                    />
                    <SummaryItem
                        label={t('cruise.review.summary.durationLabel')}
                        value={trip.finalDuration ?? '—'}
                    />
                    <SummaryItem
                        label={t('cruise.review.summary.orbitDurationLabel')}
                        value={trip.totalOrbDurFormatted ?? '—'}
                    />
                    <SummaryItem
                        label={t('cruise.review.summary.dilationLabel')}
                        value={trip.totalDilationFormatted ?? '—'}
                    />
                </dl>
            </section>

            <section
                aria-label={t('cruise.review.itinerary.label')}
                className="mt-10 space-y-4"
            >
                <h2 className="text-xl font-semibold text-neutral-900">
                    {t('cruise.review.itinerary.heading')}
                </h2>
                {trip.legs.map((leg, index) => (
                    <LegRow
                        key={`${leg.leg}-${leg.departure}-${leg.arrival}`}
                        leg={leg}
                        index={index}
                    />
                ))}
            </section>

            {/* Hidden helper — keeps the `cruise` prop referenced
                so tooling doesn't strip it; T6 uses it for the
                error-path "you picked X, Y, Z" message. */}
            <span className="sr-only">{cruise.destinations.join(' → ')}</span>
        </>
    );
}

interface LegRowProps {
    leg: Leg;
    /**
     * Zero-based position in the itinerary. Multiplied by
     * `LEG_REVEAL_STAGGER_MS` to set each card's `animation-delay`,
     * producing the cascade on first paint. Reduced-motion users
     * never observe the delay because the underlying CSS keyframes
     * are gated behind `@media (prefers-reduced-motion: no-preference)`.
     */
    index: number;
}

/**
 * Single compact row per leg. Header strip carries the two planet
 * icons, the leg name, and the departure/arrival timestamps. The
 * three numbers (distance, travel time, top speed) live in an
 * inline grid below the header — same rhythm whether the trip is
 * three legs or eight. A `<details>` disclosure below the primary
 * stats reveals the deeper math: burn/cruise/dilation breakdowns
 * and the 3D departure/arrival coordinates the trip-builder solved
 * for. Disclosure stays collapsed by default so the scannable rhythm
 * of the primary row isn't compromised.
 *
 * Planet icons use `/assets/img/destinations/{code}.png` at 48×48
 * with `object-contain` so circular planets (Saturn's rings, for
 * instance) don't get clipped by a rounded crop.
 *
 * Reveal animation: `cruise-leg-reveal` utility (defined in app.css)
 * fades + slides each card in on first paint, staggered by index.
 * The inline `animationDelay` is harmless for reduced-motion users
 * because the underlying keyframes never trigger.
 */
function LegRow({ leg, index }: LegRowProps) {
    const { t } = useTranslation();

    return (
        <article
            aria-labelledby={`leg-${leg.leg}-heading`}
            className="cruise-leg-reveal rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
            style={{ animationDelay: `${index * LEG_REVEAL_STAGGER_MS}ms` }}
        >
            <header className="flex flex-wrap items-center gap-4">
                <PlanetIcon code={leg.departure} name={leg.departureName} />
                <span aria-hidden="true" className="text-2xl text-neutral-400">
                    {'→'}
                </span>
                <PlanetIcon code={leg.arrival} name={leg.arrivalName} />
                <div className="flex-1">
                    <h3
                        id={`leg-${leg.leg}-heading`}
                        className="text-lg font-semibold text-neutral-900"
                    >
                        {t('cruise.review.leg.heading', {
                            number: leg.leg,
                            departure: leg.departureName,
                            arrival: leg.arrivalName,
                        })}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                        {t('cruise.review.leg.timeRange', {
                            departure: leg.departureTime,
                            arrival: leg.arrivalTime,
                        })}
                    </p>
                </div>
            </header>
            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Stat
                    label={t('cruise.review.leg.distance.label')}
                    value={leg.distanceFormatted}
                    units={t('cruise.review.leg.distance.units')}
                />
                <Stat
                    label={t('cruise.review.leg.duration.label')}
                    value={leg.durationFormatted}
                />
                <Stat
                    label={t('cruise.review.leg.maxSpeed.label')}
                    value={leg.maxSpeedFormatted}
                    units={t('cruise.review.leg.maxSpeed.units')}
                />
            </dl>
            <LegDetailsDisclosure leg={leg} />
        </article>
    );
}

interface LegDetailsDisclosureProps {
    leg: Leg;
}

/**
 * Secondary detail surface for a single leg, collapsed by default.
 * Reveals the burn/cruise breakdown that adds up to the headline
 * "Travel time", the relativistic time dilation across the leg, and
 * the 3D departure/arrival coordinates the calculator solved for —
 * the same numbers the underlying `tripBuild()` service uses to
 * place the spacecraft in the solar system.
 *
 * Native `<details>` chosen over a custom toggle to inherit
 * keyboard support, screen-reader semantics, and "find in page"
 * text search for free. The summary text swaps between
 * `details.show` / `details.hide` so the affordance reads the same
 * whether expanded or not.
 */
function LegDetailsDisclosure({ leg }: LegDetailsDisclosureProps) {
    const { t } = useTranslation();

    return (
        <details className="group mt-5 border-t border-neutral-100 pt-4">
            <summary className="cursor-pointer text-sm font-medium text-neutral-600 hover:text-neutral-900">
                <span className="group-open:hidden">
                    {t('cruise.review.leg.details.show')}
                </span>
                <span className="hidden group-open:inline">
                    {t('cruise.review.leg.details.hide')}
                </span>
            </summary>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <DetailItem
                    label={t('cruise.review.leg.details.burnLabel')}
                    value={leg.burnDurationFormatted}
                />
                <DetailItem
                    label={t('cruise.review.leg.details.cruiseLabel')}
                    value={leg.cruiseDurationFormatted}
                />
                <DetailItem
                    label={t('cruise.review.leg.details.dilationLabel')}
                    value={leg.dilationFormatted}
                />
            </dl>
            <div className="mt-4">
                <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                    {t('cruise.review.leg.details.coordinatesLabel')}
                </p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-700">
                    <CoordinateLine
                        translationKey="cruise.review.leg.details.departureCoordinates"
                        coordinates={leg.depCoordinates}
                    />
                    <span aria-hidden="true" className="mx-2 text-neutral-400">
                        {'·'}
                    </span>
                    <CoordinateLine
                        translationKey="cruise.review.leg.details.arrivalCoordinates"
                        coordinates={leg.arrCoordinates}
                    />
                </p>
            </div>
        </details>
    );
}

interface CoordinateLineProps {
    /** Translation key carrying the "Label: :x, :y, :z km" template. */
    translationKey: string;
    coordinates: Coordinates | null;
}

/**
 * Localized "Departure/Arrival: x, y, z km" line. The label, units,
 * comma separators, AND glyph order all live in the lang file so RTL
 * locales (Phase 11) can reorder the template without touching JSX.
 * `Intl.NumberFormat` handles the per-locale thousands separator
 * (`1.000.000` vs `1,000,000`) — the lang template just supplies
 * the rendered string back via Laravel's `:placeholder` syntax.
 *
 * Falls back to a localized "unavailable" string when the calculator
 * didn't expose coordinates for that endpoint (defensive — every
 * leg in the lifted service does produce both).
 */
function CoordinateLine({ translationKey, coordinates }: CoordinateLineProps) {
    const { t } = useTranslation();

    if (coordinates === null) {
        return <>{t('cruise.review.leg.details.coordinatesUnavailable')}</>;
    }

    const formatter = new Intl.NumberFormat();

    return (
        <>
            {t(translationKey, {
                x: formatter.format(coordinates.x),
                y: formatter.format(coordinates.y),
                z: formatter.format(coordinates.z),
            })}
        </>
    );
}

interface DetailItemProps {
    label: string;
    value: string;
}

function DetailItem({ label, value }: DetailItemProps) {
    return (
        <div>
            <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                {label}
            </dt>
            <dd className="mt-1 text-neutral-800">{value}</dd>
        </div>
    );
}

interface PlanetIconProps {
    code: string;
    name: string;
}

function PlanetIcon({ code, name }: PlanetIconProps) {
    return (
        <img
            src={`/assets/img/destinations/${code}.png`}
            alt={name}
            className="h-12 w-12 object-contain"
        />
    );
}

interface SummaryItemProps {
    label: string;
    value: string;
}

function SummaryItem({ label, value }: SummaryItemProps) {
    return (
        <div>
            <dt className="font-medium text-neutral-500">{label}</dt>
            <dd className="mt-1 font-semibold text-neutral-900">{value}</dd>
        </div>
    );
}

interface StatProps {
    label: string;
    value: string;
    units?: string;
}

function Stat({ label, value, units }: StatProps) {
    return (
        <div>
            <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                {label}
            </dt>
            <dd className="mt-1 text-xl font-semibold text-neutral-900">
                {value}
                {units !== undefined && (
                    <span className="ms-1 text-base font-normal text-neutral-500">
                        {units}
                    </span>
                )}
            </dd>
        </div>
    );
}
