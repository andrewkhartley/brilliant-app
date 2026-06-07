import { useMemo, useState } from 'react';

import { EquationCard } from '@/components/equations/EquationCard';
import { SliderInput } from '@/components/equations/SliderInput';
import { StoryStage } from '@/components/story-stage';
import { buildStoryStageLabels } from '@/components/story-stage/labels';
import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { SPEED_OF_LIGHT, STANDARD_GRAVITY } from '@/lib/constants';
import { destinations } from '@/lib/data/destinations';
import { interstellarFuels } from '@/lib/data/interstellar-fuels';
import { computeInterstellarTripPhases } from '@/lib/equations/internal/compute-interstellar-trip-phases';
import { interstellarEffectiveExhaustVelocity } from '@/lib/equations/interstellar-effective-exhaust-velocity';
import { interstellarFuelMassRatio } from '@/lib/equations/interstellar-fuel-mass-ratio';
import { interstellarTripDuration } from '@/lib/equations/interstellar-trip-duration';
import { interstellarTripDurationDilation } from '@/lib/equations/interstellar-trip-duration-dilation';
import { relativisticSpeed } from '@/lib/equations/relativistic-speed';

import { DestinationPicker } from './interstellar/DestinationPicker';
import { FuelPicker } from './interstellar/FuelPicker';
import { MaxSpeedSlider } from './interstellar/MaxSpeedSlider';
import { InterstellarPossibilitiesSection } from './interstellar/PossibilitiesSection';
import { ResultPanel } from './interstellar/ResultPanel';
import type { InterstellarTarget } from './interstellar/StarSearch';
import { StopToggle } from './interstellar/StopToggle';
import { buildInterstellarStoryScenes } from './interstellar/story';

/**
 * One light-year in meters. Constant lives at module scope (rather than
 * @/lib/constants) because it's a unit conversion used only by the
 * Interstellar experience for distance scaling — destinations are
 * authored in light-years for readability, then converted to SI meters
 * here so the equation registry stays in pure SI units.
 *
 * Value: IAU definition (Julian year × c) ≈ 9.461 × 10¹⁵ m.
 */
const LIGHT_YEAR_METERS = 9.4607304725808e15;

/** Seconds per Julian year (365.25 days × 86400 s). */
const SECONDS_PER_YEAR = 31_557_600;

/**
 * Interstellar experience — relativity travel agency.
 *
 * Page-level state (8 fields) coordinates all child controls + the
 * result panel + the fuel visualization:
 *  - destinationId: selected destination
 *  - acceleration: m/s² (default = STANDARD_GRAVITY = 1g)
 *  - maxSpeed: cruise-phase velocity cap (m/s, default = 0.25c)
 *  - stop: true → decelerate to rest; false → fly past
 *  - fuelId: selected fuel (default = antimatter)
 *  - efficiency: 0.01–1.0 fraction (default = 1.0 = 100%)
 * Computation pipeline (T4.8): pure derived values, no useEffect.
 *  1. Resolve destination → distance in meters
 *  2. Resolve fuel → clamp maxSpeed to fuel.maxVelocityMps
 *  3. Trip times via interstellarTripDuration +
 *     interstellarTripDurationDilation (new 3-phase math from T4.6/7)
 *  4. Phase breakdown via computeInterstellarTripPhases (internal
 *     helper — same one the two trip-duration equations share, also
 *     mirrors the PHP ComputesInterstellarTripPhases trait)
 *  5. Effective exhaust velocity via
 *     interstellarEffectiveExhaustVelocity (specificEnergy +
 *     efficiency)
 *  6. Δv = stop ? 2·v_max : v_max → fuel mass ratio via
 *     interstellarFuelMassRatio
 *
 * Replaces T3's limited-case math (interstellarEarthTime /
 * interstellarProperTime — continuous-acceleration only) with the
 * new 3-phase model that respects v_max as a cruise cap. T3's two
 * equations stay in the registry for T4.9's equations-debug page.
 *
 * Copy is PLACEHOLDER; Andrew refines over the weekend.
 */
export default function InterstellarPage() {
    const { t } = useTranslation();
    const [destinationId, setDestinationId] = useState(destinations[0].id);
    const [acceleration, setAcceleration] = useState(STANDARD_GRAVITY);
    const [maxSpeed, setMaxSpeed] = useState(SPEED_OF_LIGHT * 0.25);
    const [stop, setStop] = useState(true);
    const [fuelId, setFuelId] = useState(interstellarFuels[0].id);
    const [efficiency, setEfficiency] = useState(1.0);
    const [isStoryOpen, setIsStoryOpen] = useState(false);
    const [selectedTarget, setSelectedTarget] =
        useState<InterstellarTarget | null>(null);

    const destination =
        destinations.find((d) => d.id === destinationId) ?? destinations[0];
    const activeDestinationName = selectedTarget?.name ?? destination.name;
    const activeDistanceLy = selectedTarget?.distanceLy ?? destination.distanceLy;
    const activeDestinationSource =
        selectedTarget?.source ?? t('interstellar.destinationPicker.presetSource');
    const distanceMeters = activeDistanceLy * LIGHT_YEAR_METERS;

    const fuel =
        interstellarFuels.find((f) => f.id === fuelId) ?? interstellarFuels[0];

    // Clamp at render so the slider's value ≤ slider max invariant
    // always holds when the user switches to a lower-energy fuel.
    // Pure derivation — no useEffect, no state sync surprises.
    const clampedMaxSpeed = Math.min(maxSpeed, fuel.maxVelocityMps);

    // Trip times — new 3-phase math from T4.6/T4.7.
    const earthTimeSeconds = interstellarTripDuration.compute({
        d: distanceMeters,
        a: acceleration,
        vMax: clampedMaxSpeed,
        stop: stop ? 1 : 0,
    });
    const properTimeSeconds = interstellarTripDurationDilation.compute({
        d: distanceMeters,
        a: acceleration,
        vMax: clampedMaxSpeed,
        stop: stop ? 1 : 0,
    });

    // Phase breakdown for the "Trip breakdown" zone in ResultPanel.
    const phases = computeInterstellarTripPhases({
        distance: distanceMeters,
        acceleration,
        maximumSpeed: clampedMaxSpeed,
        stop,
    });

    const earthTimeYears = earthTimeSeconds / SECONDS_PER_YEAR;
    const properTimeYears = properTimeSeconds / SECONDS_PER_YEAR;
    const dilationFactor = earthTimeSeconds / properTimeSeconds;

    // Fuel budget.
    const effectiveExhaustVelocityMps =
        interstellarEffectiveExhaustVelocity.compute({
            specificEnergy: fuel.specificEnergyJoulesPerKg,
            efficiency,
        });
    const deltaV = stop ? 2 * clampedMaxSpeed : clampedMaxSpeed;
    const massRatio = interstellarFuelMassRatio.compute({
        deltaV,
        effectiveExhaustVelocity: effectiveExhaustVelocityMps,
    });

    // Phase-derived display values (light-years + years) for
    // ResultPanel's secondary breakdown section. Acceleration distance
    // is back-derived from the total trip distance and the cruise
    // distance — exact in both the cruise and no-cruise branches
    // because the trip-phases helper sets cruiseDistance = 0 in
    // no-cruise. `k` is the number of acceleration legs (2 with stop,
    // 1 with flyby).
    const k = stop ? 2 : 1;
    const accelDistanceMeters = phases
        ? (distanceMeters - phases.cruiseDistance) / k
        : 0;
    const accelDistanceLy = accelDistanceMeters / LIGHT_YEAR_METERS;
    const accelDurationYears = phases
        ? phases.accelerationDuration / SECONDS_PER_YEAR
        : 0;
    const cruiseDistanceLy = phases
        ? phases.cruiseDistance / LIGHT_YEAR_METERS
        : 0;
    const cruiseDurationYears = phases
        ? phases.cruiseDuration / SECONDS_PER_YEAR
        : 0;
    const storyLabels = useMemo(() => buildStoryStageLabels(t), [t]);
    const storyScenes = useMemo(
        () =>
            buildInterstellarStoryScenes({
                metrics: {
                    destination: activeDestinationName,
                    earthTime: t('interstellar.resultPanel.yearsFormat', {
                        value: formatStoryYears(earthTimeYears),
                    }),
                    fuel: fuel.name,
                    massRatio:
                        massRatio > 100_000
                            ? t('interstellar.fuelVisualization.offChartLabel')
                            : t(
                                  'interstellar.fuelVisualization.massRatioFormat',
                                  {
                                      value: formatStoryNumber(massRatio),
                                  },
                              ),
                    travelerTime: t('interstellar.resultPanel.yearsFormat', {
                        value: formatStoryYears(properTimeYears),
                    }),
                },
                onReturnToCalculator: () => setIsStoryOpen(false),
                t,
            }),
        [
            activeDestinationName,
            earthTimeYears,
            fuel.name,
            massRatio,
            properTimeYears,
            t,
        ],
    );

    return (
        <AppLayout pageTitle={t('interstellar.pageTitle')}>
            <StoryStage
                active={isStoryOpen}
                labels={storyLabels}
                onClose={() => setIsStoryOpen(false)}
                scenes={storyScenes}
            />

            <section className="relative overflow-hidden bg-[#08111f] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_14%,rgba(125,211,252,0.18),transparent_30%),radial-gradient(circle_at_18%_74%,rgba(20,184,166,0.12),transparent_26%),linear-gradient(135deg,rgba(8,17,31,0.9),rgba(15,23,42,0.98))]" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.32)_1px,transparent_1px)] bg-size-[44px_44px] opacity-25"
                />

                <section className="relative min-h-[74vh] overflow-hidden">
                    <img
                        src="/assets/img/bg/jwst-nebula.jpg"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-48"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,17,31,0.98),rgba(8,17,31,0.78)_42%,rgba(8,17,31,0.32)),linear-gradient(180deg,rgba(8,17,31,0.12),rgba(8,17,31,0.98)_92%),radial-gradient(circle_at_72%_42%,rgba(125,211,252,0.18),transparent_34%)]" />
                    <div className="relative mx-auto flex min-h-[74vh] max-w-6xl items-center px-4 py-20 sm:py-24">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.28em] text-cyan-200/78 uppercase">
                                {t('interstellar.planner.eyebrow')}
                            </p>
                            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                                {t('interstellar.heading')}
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-9 text-cyan-50/82">
                                {t('interstellar.intro')}
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
                                    <span>
                                        {t('interstellar.stage.openButton')}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pointer-events-none relative h-0.75 bg-linear-to-r from-transparent via-cyan-200/72 to-transparent" />

                <div className="relative mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
                    <section className="mx-auto max-w-5xl py-12 sm:py-16">
                        <p className="text-xs font-semibold tracking-[0.24em] text-cyan-200/76 uppercase">
                            {t('interstellar.introduction.eyebrow')}
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                            {t('interstellar.introduction.title')}
                        </h2>
                        <div className="mt-5 grid gap-6 text-base leading-8 text-cyan-50/74 md:grid-cols-3">
                            <p>{t('interstellar.introduction.bodyA')}</p>
                            <p>{t('interstellar.introduction.bodyB')}</p>
                            <p>{t('interstellar.introduction.bodyC')}</p>
                        </div>
                    </section>
                </div>
            </section>

            <section className="relative overflow-hidden bg-[#09101d] py-10 text-white sm:py-12">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,31,0.96),rgba(15,23,42,0.98))]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-transparent via-cyan-200/72 to-transparent" />
                <div className="relative mx-auto max-w-6xl px-4">
                    <div className="mb-8 max-w-4xl">
                        <p className="text-xs font-semibold tracking-[0.24em] text-cyan-200/76 uppercase">
                            {t('interstellar.planner.eyebrow')}
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                            {t('interstellar.planner.title')}
                        </h2>
                        <p className="mt-4 text-base leading-8 text-cyan-50/74">
                            {t('interstellar.planner.body')}
                        </p>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.618fr)_minmax(0,1fr)] xl:items-start">
                        <div className="rounded-lg border border-cyan-100/16 bg-slate-950/72 p-5 shadow-2xl shadow-black/28 backdrop-blur-md sm:p-6">
                            <p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/76 uppercase">
                                {t('interstellar.planner.controlsEyebrow')}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold tracking-normal text-white">
                                {t('interstellar.planner.controlsTitle')}
                            </h3>

                            <div className="mt-5 grid gap-5">
                                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
                                    <DestinationPicker
                                        activeDistanceLy={activeDistanceLy}
                                        activeName={activeDestinationName}
                                        activeSource={activeDestinationSource}
                                        destinationId={destinationId}
                                        selectedTarget={selectedTarget}
                                        onDestinationChange={(id) => {
                                            setDestinationId(id);
                                            setSelectedTarget(null);
                                        }}
                                        onTargetSelect={setSelectedTarget}
                                    />
                                    <StopToggle
                                        stop={stop}
                                        onChange={setStop}
                                    />
                                </div>
                                <FuelPicker
                                    efficiency={efficiency}
                                    fuel={fuel}
                                    fuelId={fuelId}
                                    massRatio={massRatio}
                                    onEfficiencyChange={setEfficiency}
                                    onFuelChange={setFuelId}
                                />
                                <SliderInput
                                    id="acceleration-slider"
                                    label={t(
                                        'interstellar.accelerationSlider.label',
                                    )}
                                    min={0.1}
                                    max={100}
                                    step={0.1}
                                    value={acceleration}
                                    onChange={setAcceleration}
                                    formatValue={(v) =>
                                        t(
                                            'interstellar.accelerationSlider.valueFormat',
                                            {
                                                value: v.toFixed(1),
                                                g: (
                                                    v / STANDARD_GRAVITY
                                                ).toFixed(2),
                                            },
                                        )
                                    }
                                    formatAriaValueText={(v) =>
                                        t(
                                            'interstellar.accelerationSlider.ariaValueText',
                                            {
                                                value: v.toFixed(1),
                                            },
                                        )
                                    }
                                />
                                <MaxSpeedSlider
                                    maxSpeed={clampedMaxSpeed}
                                    fuelMaxVelocityMps={fuel.maxVelocityMps}
                                    onChange={setMaxSpeed}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <EquationCard equation={relativisticSpeed} />

                            <ResultPanel
                                earthTimeYears={earthTimeYears}
                                properTimeYears={properTimeYears}
                                dilationFactor={dilationFactor}
                                effectiveExhaustVelocityMps={
                                    effectiveExhaustVelocityMps
                                }
                                accelerationDistanceLy={accelDistanceLy}
                                accelerationDurationYears={accelDurationYears}
                                cruiseDistanceLy={cruiseDistanceLy}
                                cruiseDurationYears={cruiseDurationYears}
                                isNoCruise={phases?.isNoCruise ?? true}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <InterstellarPossibilitiesSection />
        </AppLayout>
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

function formatStoryNumber(value: number): string {
    if (value >= 1000) {
        return value.toExponential(2);
    }

    return value.toFixed(value < 10 ? 2 : 1);
}

function formatStoryYears(value: number): string {
    if (value >= 100_000) {
        return value.toExponential(2);
    }

    if (value >= 100) {
        return value.toFixed(0);
    }

    return value.toFixed(value < 10 ? 2 : 1);
}
