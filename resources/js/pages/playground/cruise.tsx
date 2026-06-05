import { router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { SubmitEvent } from 'react';

import { StoryStage } from '@/components/story-stage';
import { buildStoryStageLabels } from '@/components/story-stage/labels';
import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { cruiseFormSchema } from '@/lib/validation/cruise-form-schema';
import type { CruiseFormValues } from '@/lib/validation/cruise-form-schema';
import cruiseRoutes from '@/routes/playground/cruise';

import { CruiseLaunchOverlay } from './cruise/CruiseLaunchOverlay';
import { DatePicker } from './cruise/DatePicker';
import { DestinationPicker } from './cruise/DestinationPicker';
import type { Destination, SelectedSlot } from './cruise/DestinationPicker';
import { buildCruiseStoryScenes } from './cruise/story';

interface CruisePageProps {
    /**
     * Destination catalog from the controller — `{code, name}` shape
     * keeps the wire payload small. The full physical facts live
     * server-side in `solar_system_facts` and are only resolved at
     * trip-build time (T5 wiring).
     */
    destinations: Destination[];
    cruiseReady?: boolean;
    preparedCruise?: CruiseFormPayload | null;
}

type LaunchState = 'idle' | 'plotting' | 'ready' | 'transitioning';
type PlannerStep = 'date' | 'destinations';

/**
 * Wire shape we hand Inertia.post — derived from the zod-inferred
 * `CruiseFormValues` with `tripStart` stringified to YYYY-MM-DD so
 * PHP's `strtotime()` parses it cleanly and the wire payload stays
 * JSON-friendly. Deriving via `Omit` keeps the payload in sync with
 * the schema: a field added to `cruiseFormSchema` shows up here
 * automatically (caught at compile time if the post-transform path
 * doesn't account for it).
 */
type CruiseFormPayload = Omit<CruiseFormValues, 'tripStart'> & {
    tripStart: string;
};

/**
 * /playground/cruise — Andrew's interplanetary trip planner.
 *
 * T3 made the form interactive; T4 added validation + Inertia.post;
 * T5 wired the review page; T5.6 reshapes the form state from a flat
 * `string[]` of codes into `SelectedSlot[]` so each row can carry its
 * own layover-in-days AND so the same destination can appear twice
 * (dnd-kit keys by `slotId`, not code).
 *
 *  1. zod validates `destinations`, the parallel `layovers` array,
 *     and `tripStart`. The schema enforces matching lengths via a
 *     `.refine()`, so a slot-array mismatch surfaces client-side
 *     before any HTTP round-trip.
 *  2. On a clean parse, the validated payload (with `tripStart`
 *     stringified to YYYY-MM-DD) flies via `router.post` to the named
 *     `playground.cruise.store` route. `onStart` / `onFinish` toggle
 *     `isPlotting` so the submit button shows "Plotting trajectory…"
 *     during the Inertia round-trip — that's a 200 ms cached path and
 *     up to 2 s cold (Horizons-bound), so the indicator earns its
 *     keep even on the fast case.
 *  3. Server-side `StoreCruiseRequest` re-validates with a parallel
 *     `layovers` rule plus a cross-field length-match in
 *     `withValidator()`. On failure, Inertia returns 302 with an
 *     error bag; `onError` mirrors those into the same `errors` map
 *     the zod path uses.
 *  4. On success, the controller redirects to /playground/cruise/review.
 */
export default function CruisePage({
    destinations,
    cruiseReady = false,
    preparedCruise = null,
}: CruisePageProps) {
    const { t } = useTranslation();
    // `usePage().props.errors` is auto-shared by Inertia v3 after any
    // 302-with-error-bag response. Typed as `Errors & ErrorBag` upstream.
    const page = usePage();
    const [selected, setSelected] = useState<SelectedSlot[]>(() =>
        preparedCruise === null
            ? []
            : buildSelectedSlots(
                  preparedCruise.destinations,
                  preparedCruise.layovers,
              ),
    );
    const [tripStart, setTripStart] = useState<Date | undefined>(() =>
        preparedCruise === null
            ? undefined
            : fromISODate(preparedCruise.tripStart),
    );
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );
    const [launchState, setLaunchState] = useState<LaunchState>(
        cruiseReady ? 'ready' : 'idle',
    );
    const [plannerStep, setPlannerStep] = useState<PlannerStep>(() =>
        preparedCruise?.tripStart ? 'destinations' : 'date',
    );
    const [isStoryOpen, setIsStoryOpen] = useState(false);

    // Server-side errors come in via Inertia's shared `errors` prop
    // (Inertia v3 auto-shares them after a 302-with-errors). Merge
    // client-side errors over server-side so a fresh client-validation
    // failure replaces the stale server message for the same field.
    // Client values are translation keys (zod → i18n); server values
    // are already-formatted Laravel validation strings. `displayError`
    // routes each through `t()` (which falls back to the input when
    // lookup fails — so server strings render verbatim).
    const errors: Record<string, string> = {
        ...page.props.errors,
        ...clientErrors,
    };

    function displayError(field: string): string | undefined {
        const raw = errors[field];

        return raw === undefined ? undefined : t(raw);
    }

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        // Block double-submits while a round-trip is in flight. Inertia
        // calls `onFinish` even on error, so this gate releases for the
        // retry-after-failure case too.
        if (launchState === 'plotting') {
            return;
        }

        const parsed = cruiseFormSchema.safeParse({
            destinations: selected.map((slot) => slot.code),
            layovers: selected.map((slot) => slot.layoverDays),
            tripStart,
        });

        if (!parsed.success) {
            const fieldErrors: Record<string, string> = {};

            for (const issue of parsed.error.issues) {
                const path = issue.path.join('.');

                // First message per field wins (matches Laravel's
                // bag-first-message convention).
                if (!fieldErrors[path]) {
                    fieldErrors[path] = mapZodMessage(path, issue.code);
                }
            }

            setClientErrors(fieldErrors);
            setPlannerStep(fieldErrors.tripStart ? 'date' : 'destinations');

            return;
        }

        const payload: CruiseFormPayload = {
            destinations: parsed.data.destinations,
            layovers: parsed.data.layovers,
            tripStart: toISODate(parsed.data.tripStart),
        };

        setLaunchState('plotting');

        router.post(cruiseRoutes.store().url, payload, {
            showProgress: false,
            onStart: () => setLaunchState('plotting'),
            onError: (serverErrors) => {
                setClientErrors(serverErrors);
                setPlannerStep(
                    serverErrors.tripStart ? 'date' : 'destinations',
                );
                setLaunchState('idle');
            },
            onSuccess: () => {
                setClientErrors({});
                visitReviewPage();
            },
        });
    }

    function visitReviewPage() {
        sessionStorage.setItem(
            'cruise-review-transition',
            JSON.stringify({
                selected,
                tripStart:
                    tripStart === undefined ? null : toISODate(tripStart),
            }),
        );

        router.visit(cruiseRoutes.review().url, {
            method: 'get',
            preserveScroll: false,
            showProgress: false,
            onError: () => setLaunchState('ready'),
        });
    }

    const canSubmit =
        selected.length > 0 &&
        tripStart !== undefined &&
        launchState !== 'plotting' &&
        launchState !== 'transitioning';
    const hasErrors = Object.keys(errors).length > 0;
    const selectedDeparture =
        tripStart === undefined
            ? t('cruise.form.planner.noDateSelected')
            : tripStart.toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
              });
    const selectedDestinationNames = selected
        .map(
            (slot) =>
                destinations.find(
                    (destination) => destination.code === slot.code,
                )?.name,
        )
        .filter((name): name is string => name !== undefined);
    const selectedRoute =
        selectedDestinationNames.length > 0
            ? selectedDestinationNames.join(' -> ')
            : t('cruise.form.planner.noRouteSelected');
    const storyLabels = useMemo(() => buildStoryStageLabels(t), [t]);
    const storyScenes = useMemo(
        () =>
            buildCruiseStoryScenes({
                onStartPlanning: () => {
                    setIsStoryOpen(false);
                    setPlannerStep(
                        tripStart === undefined ? 'date' : 'destinations',
                    );
                },
                state: {
                    departure: selectedDeparture,
                    route: selectedRoute,
                },
                t,
            }),
        [selectedDeparture, selectedRoute, t, tripStart],
    );

    return (
        <AppLayout pageTitle={t('cruise.title')}>
            <StoryStage
                active={isStoryOpen}
                labels={storyLabels}
                onClose={() => setIsStoryOpen(false)}
                scenes={storyScenes}
            />

            {launchState !== 'idle' && (
                <CruiseLaunchOverlay
                    destinations={destinations}
                    selected={selected}
                    tripStart={tripStart}
                    isReady={launchState === 'ready'}
                />
            )}
            <section className="relative overflow-hidden bg-[#08111f] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(125,211,252,0.16),transparent_28%),radial-gradient(circle_at_18%_78%,rgba(34,211,238,0.1),transparent_24%),linear-gradient(135deg,rgba(8,17,31,0.88),rgba(15,23,42,0.96))]" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.42)_1px,transparent_1px)] [background-size:42px_42px] opacity-40"
                />

                <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-10">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                        <div>
                            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/30 bg-cyan-50/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                                <i
                                    aria-hidden="true"
                                    className="fa-solid fa-shuttle-space text-cyan-200"
                                />
                                {t('cruise.launchOverlay.kicker')}
                            </div>
                            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                                {t('cruise.title')}
                            </h1>
                            <button
                                type="button"
                                onClick={() => setIsStoryOpen(true)}
                                className="mt-5 cursor-pointer rounded-full border border-cyan-100/24 bg-cyan-200 px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-950/24 transition hover:bg-cyan-100 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:outline-none"
                            >
                                {t('cruise.stage.openButton')}
                            </button>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-7 overflow-hidden rounded-lg border border-cyan-100/20 bg-slate-950/78 p-4 shadow-2xl shadow-black/35 backdrop-blur-md sm:p-5"
                    >
                        <div className="grid gap-5 lg:grid-cols-[minmax(220px,0.618fr)_minmax(0,1fr)]">
                            <div className="rounded border border-cyan-100/15 bg-slate-900/80 p-4 text-slate-100">
                                <p className="text-xs font-bold tracking-[0.18em] text-cyan-200 uppercase">
                                    {t('cruise.form.planner.kicker')}
                                </p>
                                <div className="mt-5 space-y-3">
                                    <StepButton
                                        step="date"
                                        activeStep={plannerStep}
                                        icon="fa-calendar-days"
                                        label={t(
                                            'cruise.form.planner.dateStep',
                                        )}
                                        meta={selectedDeparture}
                                        onClick={() => setPlannerStep('date')}
                                    />
                                    <StepButton
                                        step="destinations"
                                        activeStep={plannerStep}
                                        icon="fa-route"
                                        label={t(
                                            'cruise.form.planner.destinationsStep',
                                        )}
                                        meta={t(
                                            'cruise.form.planner.destinationCount',
                                            {
                                                count: String(selected.length),
                                            },
                                        )}
                                        disabled={tripStart === undefined}
                                        onClick={() =>
                                            setPlannerStep('destinations')
                                        }
                                    />
                                </div>

                                <div className="mt-6 rounded border border-cyan-100/15 bg-cyan-50/8 p-4">
                                    <p className="text-sm font-semibold text-cyan-100">
                                        {t(
                                            'cruise.form.planner.manifestHeading',
                                        )}
                                    </p>
                                    <dl className="mt-3 space-y-3 text-sm">
                                        <div>
                                            <dt className="text-slate-400">
                                                {t(
                                                    'cruise.form.planner.departureLabel',
                                                )}
                                            </dt>
                                            <dd className="font-semibold text-white">
                                                {selectedDeparture}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-400">
                                                {t(
                                                    'cruise.form.planner.routeLabel',
                                                )}
                                            </dt>
                                            <dd className="font-semibold text-white">
                                                {selectedDestinationNames.length >
                                                0
                                                    ? selectedRoute
                                                    : t(
                                                          'cruise.form.planner.noRouteSelected',
                                                      )}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div className="rounded border border-cyan-100/15 bg-slate-900/82 p-5 text-slate-100 shadow-inner shadow-cyan-950/10 sm:p-7">
                                {plannerStep === 'date' ? (
                                    <div>
                                        <DatePicker
                                            value={tripStart}
                                            onChange={setTripStart}
                                        />
                                        {displayError('tripStart') && (
                                            <p
                                                role="alert"
                                                className="mt-2 text-sm text-red-300"
                                            >
                                                {displayError('tripStart')}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <div>
                                                <p className="text-xs font-bold tracking-[0.18em] text-cyan-200 uppercase">
                                                    {t(
                                                        'cruise.form.planner.destinationsEyebrow',
                                                    )}
                                                </p>
                                                <h2 className="mt-2 text-2xl font-bold text-white">
                                                    {t(
                                                        'cruise.form.planner.destinationsPanelHeading',
                                                    )}
                                                </h2>
                                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                                                    {t(
                                                        'cruise.form.planner.destinationsPanelBody',
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded border border-cyan-100/15 bg-slate-950/55 p-4 text-slate-100 shadow-inner shadow-black/20">
                                            <DestinationPicker
                                                destinations={destinations}
                                                selected={selected}
                                                onChange={setSelected}
                                            />
                                        </div>
                                        {displayError('destinations') && (
                                            <p
                                                role="alert"
                                                className="mt-2 text-sm text-red-300"
                                            >
                                                {displayError('destinations')}
                                            </p>
                                        )}
                                        {displayError('layovers') && (
                                            <p
                                                role="alert"
                                                className="mt-2 text-sm text-red-300"
                                            >
                                                {displayError('layovers')}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {hasErrors && (
                                    <div
                                        role="alert"
                                        className="mt-6 rounded border border-red-300/50 bg-red-950/40 p-4 text-sm text-red-100"
                                    >
                                        <p className="font-semibold">
                                            {t(
                                                'cruise.form.errors.summaryHeading',
                                            )}
                                        </p>
                                        <ul className="mt-2 list-disc pl-5">
                                            {Object.keys(errors).map(
                                                (field) => (
                                                    <li key={field}>
                                                        {displayError(field)}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}

                                <div className="mt-7 flex flex-col gap-3 border-t border-cyan-100/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        {plannerStep === 'destinations' && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPlannerStep('date')
                                                }
                                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded border border-cyan-100/25 bg-white/5 px-4 py-3 text-sm font-bold text-cyan-100 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                            >
                                                <i
                                                    aria-hidden="true"
                                                    className="fa-solid fa-arrow-left"
                                                />
                                                <span>
                                                    {t(
                                                        'cruise.form.planner.backToDate',
                                                    )}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                    <span aria-hidden="true" />
                                    {plannerStep === 'date' ? (
                                        <button
                                            type="button"
                                            disabled={tripStart === undefined}
                                            onClick={() =>
                                                setPlannerStep('destinations')
                                            }
                                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-cyan-200 px-6 py-3 text-base font-bold text-slate-950 shadow-[0_0_26px_rgba(103,232,249,0.22)] transition-colors hover:bg-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 disabled:shadow-none"
                                        >
                                            <span>
                                                {t(
                                                    'cruise.form.planner.continueToDestinations',
                                                )}
                                            </span>
                                            <i
                                                aria-hidden="true"
                                                className="fa-solid fa-arrow-right"
                                            />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={!canSubmit}
                                            aria-busy={
                                                launchState === 'plotting'
                                            }
                                            aria-label={
                                                launchState === 'plotting'
                                                    ? t(
                                                          'cruise.form.plottingAriaLabel',
                                                      )
                                                    : undefined
                                            }
                                            className="inline-flex cursor-pointer items-center justify-center gap-3 rounded bg-cyan-200 px-6 py-3 text-base font-bold text-slate-950 shadow-[0_0_26px_rgba(103,232,249,0.22)] transition-colors hover:bg-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 disabled:shadow-none"
                                        >
                                            {launchState === 'plotting' && (
                                                <span
                                                    aria-hidden="true"
                                                    className="cruise-plot-pulse inline-block size-2 rounded-full bg-slate-950"
                                                />
                                            )}
                                            <span>
                                                {launchState === 'plotting'
                                                    ? t(
                                                          'cruise.form.submit.plotting',
                                                      )
                                                    : t(
                                                          'cruise.form.submit.idle',
                                                      )}
                                            </span>
                                        </button>
                                    )}
                                </div>
                                {!canSubmit &&
                                    launchState !== 'plotting' &&
                                    plannerStep === 'destinations' && (
                                        <p className="mt-2 text-sm text-neutral-500 sm:text-right">
                                            {t(
                                                'cruise.form.submitDisabledHint',
                                            )}
                                        </p>
                                    )}
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </AppLayout>
    );
}

interface StepButtonProps {
    step: PlannerStep;
    activeStep: PlannerStep;
    icon: string;
    label: string;
    meta: string;
    disabled?: boolean;
    onClick: () => void;
}

function StepButton({
    step,
    activeStep,
    icon,
    label,
    meta,
    disabled = false,
    onClick,
}: StepButtonProps) {
    const isActive = step === activeStep;

    return (
        <button
            type="button"
            disabled={disabled}
            aria-current={isActive ? 'step' : undefined}
            onClick={onClick}
            className={`grid w-full grid-cols-[40px_1fr] gap-3 rounded border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-45 ${
                isActive
                    ? 'border-cyan-200 bg-cyan-200 text-slate-950 shadow-[0_0_22px_rgba(103,232,249,0.22)]'
                    : 'border-cyan-100/15 bg-white/5 text-slate-100 hover:bg-white/10'
            }`}
        >
            <span
                className={`flex size-10 items-center justify-center rounded ${
                    isActive
                        ? 'bg-slate-950 text-cyan-100'
                        : 'bg-cyan-50/10 text-cyan-200'
                }`}
            >
                <i aria-hidden="true" className={`fa-solid ${icon}`} />
            </span>
            <span>
                <span className="block text-sm font-bold">{label}</span>
                <span
                    className={`mt-1 block text-xs ${
                        isActive ? 'text-slate-700' : 'text-slate-400'
                    }`}
                >
                    {meta}
                </span>
            </span>
        </button>
    );
}

/**
 * Map a zod issue (field path + code) to a friendly translation key.
 * Falls back to a generic per-field message if the (path, code) pair
 * isn't recognized — keeps the UI from showing zod's raw English
 * message ("Array must contain at least 1 element(s)") which would
 * leak the validator's voice into Andrew's locked tone.
 */
function mapZodMessage(path: string, code: string): string {
    if (path === 'destinations' && code === 'too_small') {
        return 'cruise.form.errors.destinations.min';
    }

    if (path === 'destinations' && code === 'too_big') {
        return 'cruise.form.errors.destinations.max';
    }

    if (path === 'tripStart') {
        return 'cruise.form.errors.tripStart.past';
    }

    if (path === 'layovers') {
        // Two reasons we land here: the cross-field length mismatch
        // (object-level `.refine()`, path = ['layovers']) and a
        // top-level `z.array(...)` failure (missing entirely). The
        // first is "size" semantics; the second is "required".
        if (code === 'custom') {
            return 'cruise.form.errors.layovers.size';
        }

        return 'cruise.form.errors.layovers.required';
    }

    if (path.startsWith('layovers.')) {
        // Per-entry failures: out-of-range integer or non-integer.
        return 'cruise.form.errors.layovers.range';
    }

    if (path.startsWith('destinations.')) {
        return 'cruise.form.errors.destinations.invalid';
    }

    return 'cruise.form.errors.destinations.invalid';
}

/**
 * Stringify a `Date` to a YYYY-MM-DD wire format. `toISOString()` would
 * include the time-of-day + UTC offset (and shift the calendar date by
 * a day for users in negative UTC offsets); a plain YYYY-MM-DD avoids
 * both pitfalls and is what PHP's `strtotime()` parses most cleanly.
 */
function toISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function fromISODate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day);
}

function buildSelectedSlots(
    destinations: string[],
    layovers: number[],
): SelectedSlot[] {
    return destinations.map((code, index) => ({
        slotId: `prepared-${code}-${index}`,
        code,
        layoverDays: layovers[index] ?? 5,
    }));
}
