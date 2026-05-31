import { Link } from '@inertiajs/react';
import { useState } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { cruise as cruiseRoute } from '@/routes/playground';

import { CruiseLaunchOverlay } from './cruise/CruiseLaunchOverlay';
import type { Destination, SelectedSlot } from './cruise/DestinationPicker';
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
    const [transition] = useState(() =>
        readCruiseReviewTransition(cruise, trip),
    );
    const [showRevealOverlay, setShowRevealOverlay] = useState(
        transition !== null,
    );
    const [isRevealingItinerary, setIsRevealingItinerary] = useState(false);

    return (
        <AppLayout pageTitle={t('cruise.review.title')}>
            {showRevealOverlay && transition !== null && (
                <CruiseLaunchOverlay
                    destinations={transition.destinations}
                    selected={transition.selected}
                    tripStart={transition.tripStart}
                    isReady={!isRevealingItinerary}
                    revealOnMount={isRevealingItinerary}
                    onViewDetails={() => setIsRevealingItinerary(true)}
                    onRevealComplete={() => setShowRevealOverlay(false)}
                />
            )}
            <section className="relative overflow-hidden bg-[#08111f] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(125,211,252,0.16),transparent_28%),linear-gradient(135deg,rgba(8,17,31,0.9),rgba(15,23,42,0.97))]" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.42)_1px,transparent_1px)] [background-size:42px_42px] opacity-35"
                />

                <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/30 bg-cyan-50/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                                <i
                                    aria-hidden="true"
                                    className="fa-solid fa-ticket-airline text-cyan-200"
                                />
                                {t('cruise.review.kicker')}
                            </div>
                            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                                {t('cruise.review.title')}
                            </h1>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                                {t('cruise.review.lead')}
                            </p>
                        </div>
                        <Link
                            href={cruiseRoute.url()}
                            className="inline-flex items-center gap-2 self-start rounded border border-cyan-100/20 bg-cyan-50/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-50/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-solid fa-arrow-left text-xs"
                            />
                            {t('cruise.review.backToForm')}
                        </Link>
                    </div>

                    <div className="mt-10 overflow-hidden rounded-lg border border-cyan-100/20 bg-slate-950/72 p-5 text-cyan-50 shadow-2xl shadow-black/35 backdrop-blur-md sm:p-7">
                        {horizonsError ? (
                            <HorizonsError
                                cruise={cruise}
                                attemptedDestinationNames={
                                    attemptedDestinationNames
                                }
                            />
                        ) : (
                            trip !== null && (
                                <ComputedTripView cruise={cruise} trip={trip} />
                            )
                        )}
                    </div>
                </div>
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
            <section className="rounded-lg border border-cyan-100/25 bg-slate-950 p-6 text-cyan-50">
                <h2 className="text-xl font-semibold text-white">
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
                <h2 className="text-xl font-semibold text-white">
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
            className="cruise-leg-reveal rounded-lg border border-cyan-100/15 bg-cyan-50/8 p-6 text-cyan-50 shadow-sm"
            style={{ animationDelay: `${index * LEG_REVEAL_STAGGER_MS}ms` }}
        >
            <header className="flex flex-wrap items-center gap-4">
                <PlanetIcon code={leg.departure} name={leg.departureName} />
                <span aria-hidden="true" className="text-2xl text-cyan-100/40">
                    {'→'}
                </span>
                <PlanetIcon code={leg.arrival} name={leg.arrivalName} />
                <div className="flex-1">
                    <h3
                        id={`leg-${leg.leg}-heading`}
                        className="text-lg font-semibold text-white"
                    >
                        {t('cruise.review.leg.heading', {
                            number: leg.leg,
                            departure: leg.departureName,
                            arrival: leg.arrivalName,
                        })}
                    </h3>
                    <p className="mt-1 text-sm text-cyan-100/60">
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
        <details className="group mt-5 border-t border-cyan-100/15 pt-4">
            <summary className="cursor-pointer text-sm font-medium text-cyan-100/68 hover:text-white">
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
                <p className="text-xs font-medium tracking-wide text-cyan-100/58 uppercase">
                    {t('cruise.review.leg.details.coordinatesLabel')}
                </p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-cyan-50/82">
                    <CoordinateLine
                        translationKey="cruise.review.leg.details.departureCoordinates"
                        coordinates={leg.depCoordinates}
                    />
                    <span aria-hidden="true" className="mx-2 text-cyan-100/35">
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
            <dt className="text-xs font-medium tracking-wide text-cyan-100/58 uppercase">
                {label}
            </dt>
            <dd className="mt-1 text-cyan-50">{value}</dd>
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
            <dt className="font-medium text-cyan-100/62">{label}</dt>
            <dd className="mt-1 font-semibold text-cyan-50">{value}</dd>
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
            <dt className="text-xs font-medium tracking-wide text-cyan-100/58 uppercase">
                {label}
            </dt>
            <dd className="mt-1 text-xl font-semibold text-white">
                {value}
                {units !== undefined && (
                    <span className="ms-1 text-base font-normal text-cyan-100/58">
                        {units}
                    </span>
                )}
            </dd>
        </div>
    );
}

interface CruiseReviewTransition {
    destinations: Destination[];
    selected: SelectedSlot[];
    tripStart: Date | undefined;
}

interface StoredCruiseReviewTransition {
    selected?: SelectedSlot[];
    tripStart?: string | null;
}

function readCruiseReviewTransition(
    cruise: CruiseInput,
    trip: Trip | null,
): CruiseReviewTransition | null {
    if (typeof sessionStorage === 'undefined') {
        return null;
    }

    const raw = sessionStorage.getItem('cruise-review-transition');

    if (raw === null) {
        return null;
    }

    sessionStorage.removeItem('cruise-review-transition');

    const stored = parseStoredTransition(raw);
    const selected =
        stored.selected ??
        buildSelectedSlots(cruise.destinations, cruise.layovers);

    return {
        destinations: buildDestinationCatalog(cruise, trip),
        selected,
        tripStart:
            stored.tripStart === null || stored.tripStart === undefined
                ? fromISODate(cruise.tripStart)
                : fromISODate(stored.tripStart),
    };
}

function parseStoredTransition(raw: string): StoredCruiseReviewTransition {
    try {
        const parsed = JSON.parse(raw) as StoredCruiseReviewTransition;

        return {
            selected: Array.isArray(parsed.selected)
                ? parsed.selected.filter(isSelectedSlot)
                : undefined,
            tripStart:
                typeof parsed.tripStart === 'string' ||
                parsed.tripStart === null
                    ? parsed.tripStart
                    : undefined,
        };
    } catch {
        return {};
    }
}

function isSelectedSlot(value: unknown): value is SelectedSlot {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const slot = value as Partial<SelectedSlot>;

    return (
        typeof slot.slotId === 'string' &&
        typeof slot.code === 'string' &&
        typeof slot.layoverDays === 'number'
    );
}

function buildDestinationCatalog(
    cruise: CruiseInput,
    trip: Trip | null,
): Destination[] {
    const catalog = new Map<string, string>();

    if (trip !== null) {
        for (const leg of trip.legs) {
            catalog.set(leg.departure, leg.departureName);
            catalog.set(leg.arrival, leg.arrivalName);
        }
    }

    for (const code of cruise.destinations) {
        if (!catalog.has(code)) {
            catalog.set(code, code.toUpperCase());
        }
    }

    return Array.from(catalog, ([code, name]) => ({ code, name }));
}

function buildSelectedSlots(
    destinations: string[],
    layovers: number[] = [],
): SelectedSlot[] {
    return destinations.map((code, index) => ({
        slotId: `review-transition-${code}-${index}`,
        code,
        layoverDays: layovers[index] ?? 5,
    }));
}

function fromISODate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day);
}
