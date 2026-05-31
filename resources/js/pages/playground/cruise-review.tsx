import { Link } from '@inertiajs/react';

import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { cruise as cruiseRoute } from '@/routes/playground';

import type { CruiseInput, Leg, Trip } from './cruise/types';

interface CruiseReviewPageProps {
    /** Original form submission (destinations + tripStart). */
    cruise: CruiseInput;
    /**
     * Server-computed trip data — null on the Horizons-error path so
     * the (T6) `<HorizonsError />` fallback can render in its place.
     */
    trip: Trip | null;
    /**
     * `true` when the controller caught a `GuzzleException` from the
     * Horizons call chain. T5 ships a placeholder error block; T6
     * replaces it with the proper friendly fallback panel.
     */
    horizonsError: boolean;
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
                    <HorizonsErrorPlaceholder />
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
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
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
                </dl>
            </section>

            <section
                aria-label={t('cruise.review.itinerary.label')}
                className="mt-10 space-y-4"
            >
                <h2 className="text-xl font-semibold text-neutral-900">
                    {t('cruise.review.itinerary.heading')}
                </h2>
                {trip.legs.map((leg) => (
                    <LegRow
                        key={`${leg.leg}-${leg.departure}-${leg.arrival}`}
                        leg={leg}
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
}

/**
 * Single compact row per leg. Header strip carries the two planet
 * icons, the leg name, and the departure/arrival timestamps. The
 * three numbers (distance, travel time, top speed) live in an
 * inline grid below the header — same rhythm whether the trip is
 * three legs or eight.
 *
 * Planet icons use `/assets/img/destinations/{code}.png` at 48×48
 * with `object-contain` so circular planets (Saturn's rings, for
 * instance) don't get clipped by a rounded crop.
 */
function LegRow({ leg }: LegRowProps) {
    const { t } = useTranslation();

    return (
        <article
            aria-labelledby={`leg-${leg.leg}-heading`}
            className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
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
        </article>
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

/**
 * T5 placeholder for the (T6) `<HorizonsError />` component.
 * Renders the friendly-fallback copy so the page is intelligible if
 * Horizons fails today, but with no decorative chrome — T6 replaces
 * this with the proper panel + retry visuals.
 */
function HorizonsErrorPlaceholder() {
    const { t } = useTranslation();

    return (
        <div
            role="alert"
            className="mt-10 rounded border border-amber-300 bg-amber-50 p-6"
        >
            <h2 className="text-xl font-semibold text-amber-900">
                {t('cruise.review.horizonsError.heading')}
            </h2>
            <p className="mt-2 text-amber-900">
                {t('cruise.review.horizonsError.body')}
            </p>
            <Link
                href={cruiseRoute.url()}
                className="mt-4 inline-block text-sm font-medium text-amber-900 underline hover:text-amber-700"
            >
                {t('cruise.review.horizonsError.retry')}
            </Link>
        </div>
    );
}
