import { useState } from 'react';

import { EquationCard } from '@/components/equations/EquationCard';
import { SliderInput } from '@/components/equations/SliderInput';
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

import { DestinationSelect } from './interstellar/DestinationSelect';
import { DurationToggle } from './interstellar/DurationToggle';
import { EfficiencySlider } from './interstellar/EfficiencySlider';
import { FuelSelector } from './interstellar/FuelSelector';
import { FuelVisualization } from './interstellar/FuelVisualization';
import { MaxSpeedSlider } from './interstellar/MaxSpeedSlider';
import { ModeToggle } from './interstellar/ModeToggle';
import { ResultPanel } from './interstellar/ResultPanel';
import { StopToggle } from './interstellar/StopToggle';

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
 *  - durationMode: highlight Earth vs traveler clock in ResultPanel
 *  - interfaceMode: Beginner (hide math) vs Just the math (show
 *    EquationCard prominent)
 *
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
    const [durationMode, setDurationMode] = useState<'subjective' | 'earth'>(
        'subjective',
    );
    const [interfaceMode, setInterfaceMode] = useState<'beginner' | 'math'>(
        'beginner',
    );

    const destination =
        destinations.find((d) => d.id === destinationId) ?? destinations[0];
    const distanceMeters = destination.distanceLy * LIGHT_YEAR_METERS;

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

    return (
        <AppLayout pageTitle={t('interstellar.pageTitle')}>
            <section className="relative overflow-hidden bg-[#08111f] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(125,211,252,0.16),transparent_28%),radial-gradient(circle_at_18%_78%,rgba(34,211,238,0.1),transparent_24%),linear-gradient(135deg,rgba(8,17,31,0.88),rgba(15,23,42,0.96))]" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.42)_1px,transparent_1px)] [background-size:42px_42px] opacity-40"
                />
                <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
                    <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                        {t('interstellar.heading')}
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                        {t('interstellar.intro')}
                    </p>

                    <div className="mt-8">
                        <ModeToggle
                            mode={interfaceMode}
                            onChange={setInterfaceMode}
                        />
                    </div>

                    <div className="mt-8 space-y-6">
                        <DestinationSelect
                            destinationId={destinationId}
                            onChange={setDestinationId}
                        />

                        <div className="grid gap-6 md:grid-cols-2">
                            <FuelSelector
                                fuelId={fuelId}
                                onChange={setFuelId}
                            />
                            <EfficiencySlider
                                efficiency={efficiency}
                                onChange={setEfficiency}
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <StopToggle stop={stop} onChange={setStop} />
                            <DurationToggle
                                mode={durationMode}
                                onChange={setDurationMode}
                            />
                        </div>

                        <SliderInput
                            id="acceleration-slider"
                            label={t('interstellar.accelerationSlider.label')}
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
                                        g: (v / STANDARD_GRAVITY).toFixed(2),
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

                        {interfaceMode === 'math' && (
                            <EquationCard equation={relativisticSpeed} />
                        )}

                        <ResultPanel
                            durationMode={durationMode}
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

                        <FuelVisualization massRatio={massRatio} />
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
