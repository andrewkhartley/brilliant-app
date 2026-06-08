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
import { CruisePossibilitiesSection } from './cruise/PossibilitiesSection';
import { buildCruiseStoryScenes } from './cruise/story';

interface CruisePageProps {
    /**
     * Destination catalog from the controller — `{code, name}` shape
     * keeps the wire payload small. The full physical facts live
     * server-side in `solar_system_facts` and are only resolved at
     * trip-build time (T5 wiring).
     */
    destinations: Destination[];
    ephemerisDestinations: Destination[];
    cruiseReady?: boolean;
    preparedCruise?: CruiseFormPayload | null;
}

type LaunchState = 'idle' | 'plotting' | 'ready' | 'transitioning';
type PlannerStep = 'date' | 'destinations';
type CruiseDataSource = 'horizons' | 'ephemeris';

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
    ephemerisDestinations,
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
    const [dataSource, setDataSource] = useState<CruiseDataSource>(
        preparedCruise?.dataSource ?? 'horizons',
    );
    const [isStoryOpen, setIsStoryOpen] = useState(false);
    const availableDestinations =
        dataSource === 'ephemeris' ? ephemerisDestinations : destinations;

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
            dataSource,
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
            dataSource: parsed.data.dataSource,
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
                dataSource,
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
                availableDestinations.find(
                    (destination) => destination.code === slot.code,
                )?.name,
        )
        .filter((name): name is string => name !== undefined);
    const selectedRoute = selectedDestinationNames.join(' -> ');
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
                t,
            }),
        [t, tripStart],
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
                    destinations={availableDestinations}
                    selected={selected}
                    tripStart={tripStart}
                    isReady={launchState === 'ready'}
                />
            )}
            <section className="relative overflow-hidden bg-[#08111f] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_14%,rgba(125,211,252,0.18),transparent_30%),radial-gradient(circle_at_18%_74%,rgba(20,184,166,0.12),transparent_26%),linear-gradient(135deg,rgba(8,17,31,0.9),rgba(15,23,42,0.98))]" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.32)_1px,transparent_1px)] bg-size-[44px_44px] opacity-25"
                />

                <section className="relative min-h-[74vh] overflow-hidden">
                    <img
                        src="/assets/img/bg/stars.jpg"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-48"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,17,31,0.98),rgba(8,17,31,0.78)_42%,rgba(8,17,31,0.3)),linear-gradient(180deg,rgba(8,17,31,0.18),rgba(8,17,31,0.98)_92%),radial-gradient(circle_at_72%_42%,rgba(125,211,252,0.18),transparent_34%)]" />
                    <div className="relative mx-auto flex min-h-[74vh] max-w-6xl items-center px-4 py-20 sm:py-24">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.28em] text-cyan-200/78 uppercase">
                                {t('cruise.launchOverlay.kicker')}
                            </p>
                            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                                {t('cruise.title')}
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-9 text-cyan-50/82">
                                {t('cruise.storyIntro.bodyA')}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsStoryOpen(true)}
                                    className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-cyan-100/24 bg-cyan-200 px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-950/24 transition hover:bg-cyan-100 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:outline-none"
                                >
                                    <span className="grid size-7 place-items-center rounded-full bg-slate-950/92 text-cyan-100 shadow-inner shadow-cyan-300/24">
                                        <DialogueIcon />
                                    </span>
                                    <span>{t('cruise.stage.openButton')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pointer-events-none relative h-0.75 bg-linear-to-r from-transparent via-cyan-200/72 to-transparent" />

                <div className="relative mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
                    <section className="mx-auto max-w-5xl py-12 sm:py-16">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.24em] text-cyan-200/76 uppercase">
                                {t('cruise.storyIntro.eyebrow')}
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                                {t('cruise.storyIntro.title')}
                            </h2>
                            <div className="mt-5 max-w-4xl space-y-5 text-base leading-8 text-cyan-50/74">
                                <p>{t('cruise.storyIntro.bodyB')}</p>
                                <p>{t('cruise.storyIntro.bodyC')}</p>
                            </div>
                        </div>

                        <div className="mt-8 rounded-lg border border-cyan-100/18 bg-slate-950/48 p-4 shadow-2xl shadow-black/24 backdrop-blur-md sm:p-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.24em] text-cyan-200/76 uppercase">
                                        {t('cruise.storyIntro.callout.eyebrow')}
                                    </p>
                                    <h3 className="mt-1.5 text-2xl font-semibold tracking-normal text-white">
                                        {t('cruise.storyIntro.callout.title')}
                                    </h3>
                                </div>
                            </div>

                            <ol className="mt-4 grid gap-3 md:grid-cols-3">
                                {['date', 'horizons', 'itinerary'].map(
                                    (stepKey, index) => (
                                        <li
                                            key={stepKey}
                                            className="rounded border border-cyan-100/14 bg-cyan-50/6 p-3.5"
                                        >
                                            <span className="text-xs font-bold tracking-[0.18em] text-cyan-200/74 uppercase">
                                                {String(index + 1).padStart(
                                                    2,
                                                    '0',
                                                )}
                                            </span>
                                            <p className="mt-2 text-sm leading-6 text-cyan-50/78">
                                                {t(
                                                    `cruise.storyIntro.callout.steps.${stepKey}`,
                                                )}
                                            </p>
                                        </li>
                                    ),
                                )}
                            </ol>

                            <div className="mt-4 border-t border-cyan-100/12 pt-4">
                                <p className="max-w-4xl text-sm leading-7 text-cyan-50/68">
                                    {t('cruise.storyIntro.callout.body')}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </section>

            <section className="relative overflow-hidden bg-[#09101d] py-10 text-white sm:py-12">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,31,0.96),rgba(15,23,42,0.98))]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-transparent via-cyan-200/72 to-transparent" />
                <div className="relative mx-auto max-w-6xl px-4">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div className="grid gap-5 lg:grid-cols-[minmax(220px,0.618fr)_minmax(0,1fr)]">
                            <div className="rounded border border-cyan-100/15 bg-slate-900/80 p-4 text-slate-100">
                                <p className="text-xs font-bold tracking-[0.18em] text-cyan-200 uppercase">
                                    {t('cruise.form.planner.kicker')}
                                </p>
                                <SourceToggle
                                    value={dataSource}
                                    onChange={(nextSource) => {
                                        setDataSource(nextSource);
                                        setSelected((current) =>
                                            current.filter((slot) =>
                                                (nextSource === 'ephemeris'
                                                    ? ephemerisDestinations
                                                    : destinations
                                                ).some(
                                                    (destination) =>
                                                        destination.code ===
                                                        slot.code,
                                                ),
                                            ),
                                        );
                                    }}
                                />
                                <div className="mt-5 space-y-3">
                                    <StepButton
                                        step="date"
                                        activeStep={plannerStep}
                                        icon="calendar"
                                        label={t(
                                            'cruise.form.planner.dateStep',
                                        )}
                                        meta={selectedDeparture}
                                        onClick={() => setPlannerStep('date')}
                                    />
                                    <StepButton
                                        step="destinations"
                                        activeStep={plannerStep}
                                        icon="route"
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
                                                destinations={
                                                    availableDestinations
                                                }
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

            <CruisePossibilitiesSection context="planner" />
        </AppLayout>
    );
}

interface StepButtonProps {
    step: PlannerStep;
    activeStep: PlannerStep;
    icon: 'calendar' | 'route';
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
            className={`grid w-full cursor-pointer grid-cols-[40px_1fr] gap-3 rounded border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-45 ${
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
                <StepIcon icon={icon} />
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

interface SourceToggleProps {
    value: CruiseDataSource;
    onChange: (source: CruiseDataSource) => void;
}

function SourceToggle({ value, onChange }: SourceToggleProps) {
    const { t } = useTranslation();
    const options: Array<{ value: CruiseDataSource; icon: string }> = [
        { value: 'horizons', icon: 'fa-satellite-dish' },
        { value: 'ephemeris', icon: 'fa-map-location-dot' },
    ];

    return (
        <fieldset className="mt-4 rounded border border-cyan-100/15 bg-slate-950/44 p-3">
            <legend className="px-1 text-xs font-bold tracking-[0.18em] text-cyan-200 uppercase">
                {t('cruise.form.dataSource.label')}
            </legend>
            <div className="mt-2 grid gap-2">
                {options.map((option) => {
                    const isActive = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => onChange(option.value)}
                            className={`flex cursor-pointer items-start gap-3 rounded border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                                isActive
                                    ? 'border-cyan-200 bg-cyan-200 text-slate-950 shadow-[0_0_22px_rgba(103,232,249,0.22)]'
                                    : 'border-cyan-100/14 bg-white/5 text-slate-100 hover:bg-white/10'
                            }`}
                        >
                            <span
                                className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded ${
                                    isActive
                                        ? 'bg-slate-950 text-cyan-100'
                                        : 'bg-cyan-50/10 text-cyan-200'
                                }`}
                            >
                                <i
                                    aria-hidden="true"
                                    className={`fa-solid ${option.icon}`}
                                />
                            </span>
                            <span>
                                <span className="block text-sm font-bold">
                                    {t(
                                        `cruise.form.dataSource.${option.value}.title`,
                                    )}
                                </span>
                                <span
                                    className={`mt-1 block text-xs leading-5 ${
                                        isActive
                                            ? 'text-slate-700'
                                            : 'text-slate-400'
                                    }`}
                                >
                                    {t(
                                        `cruise.form.dataSource.${option.value}.body`,
                                    )}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}

function StepIcon({ icon }: { icon: 'calendar' | 'route' }) {
    if (icon === 'calendar') {
        return (
            <span
                aria-hidden="true"
                className="relative block size-5 rounded-[3px] border-2 border-current"
            >
                <span className="absolute -top-1 left-1 h-2 w-0.5 rounded-full bg-current" />
                <span className="absolute -top-1 right-1 h-2 w-0.5 rounded-full bg-current" />
                <span className="absolute top-1.5 left-0 h-0.5 w-full bg-current" />
                <span className="absolute top-3 left-1 h-0.5 w-2.5 bg-current opacity-75" />
            </span>
        );
    }

    return (
        <span aria-hidden="true" className="relative block size-5">
            <span className="absolute top-0.5 left-1/2 size-3.5 -translate-x-1/2 rounded-full border-2 border-current bg-current/12" />
            <span className="absolute top-2.5 left-1/2 h-3 w-2.5 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-current" />
            <span className="absolute top-[0.38rem] left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-current" />
        </span>
    );
}

function DialogueIcon() {
    return (
        <span aria-hidden="true" className="relative block h-4 w-4">
            <span className="absolute inset-x-0 top-0 h-3 rounded-sm border-2 border-current" />
            <span className="absolute bottom-0 left-1 h-1.5 w-1.5 rotate-45 border-r-2 border-b-2 border-current bg-slate-950/92" />
            <span className="absolute top-1.5 left-1 h-0.5 w-2.5 rounded-full bg-current" />
            <span className="absolute top-2.5 left-1 h-0.5 w-1.5 rounded-full bg-current" />
        </span>
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
