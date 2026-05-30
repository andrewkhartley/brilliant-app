import { useState } from 'react';

import { EquationCard } from '@/components/equations/EquationCard';
import { SliderInput } from '@/components/equations/SliderInput';
import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { STANDARD_GRAVITY } from '@/lib/constants';
import { destinations } from '@/lib/data/destinations';
import { interstellarEarthTime } from '@/lib/equations/interstellar-earth-time';
import { interstellarProperTime } from '@/lib/equations/interstellar-proper-time';
import { relativisticSpeed } from '@/lib/equations/relativistic-speed';

import { DestinationSelect } from './interstellar/DestinationSelect';
import { DurationToggle } from './interstellar/DurationToggle';
import { ModeToggle } from './interstellar/ModeToggle';
import { ResultPanel } from './interstellar/ResultPanel';

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
 * Page-level state coordinates form components + result panel:
 * - destinationId: selected destination (default = first in list)
 * - acceleration: m/s² (default = STANDARD_GRAVITY = 1g)
 * - durationMode: which clock the ResultPanel highlights as primary
 * - interfaceMode: Beginner (hide math) vs Just the math (show equation
 *   card prominent)
 *
 * Acceleration is the sole user-input lever. Both times (Earth +
 * proper) are derived via the registry's rocket equations
 * (interstellar-earth-time, interstellar-proper-time — added in
 * P8.T2). Distance comes from the selected destination, converted from
 * light-years to meters at the page boundary so the registry can
 * keep its SI contract.
 *
 * The peak velocity at the trip's midpoint is computed via the existing
 * `relativisticSpeed` equation at half the Earth coordinate time — the
 * canonical "flip and burn" trajectory accelerates to the midpoint
 * then decelerates symmetrically.
 *
 * Status:
 * - P8.T1: scaffold + 5 stub children
 * - P8.T2: 3 rocket equations added to registry
 * - P8.T3 (current): 4 stubs promoted to real interactive components;
 *   computation logic wired here; AccelerationSlider added inline via
 *   the existing <SliderInput>; <EquationCard> conditionally rendered
 *   when interfaceMode === 'math'
 * - P8.T4 (next): ModeToggle + FuelVisualization stubs become real
 *
 * Copy is PLACEHOLDER; Andrew refines over the weekend.
 */
export default function InterstellarPage() {
    const { t } = useTranslation();
    const [destinationId, setDestinationId] = useState(destinations[0].id);
    const [acceleration, setAcceleration] = useState(STANDARD_GRAVITY);
    const [durationMode, setDurationMode] = useState<'subjective' | 'earth'>(
        'subjective',
    );
    const [interfaceMode, setInterfaceMode] = useState<'beginner' | 'math'>(
        'beginner',
    );

    const destination =
        destinations.find((d) => d.id === destinationId) ?? destinations[0];
    const distanceMeters = destination.distanceLy * LIGHT_YEAR_METERS;

    const earthTimeSeconds = interstellarEarthTime.compute({
        d: distanceMeters,
        a: acceleration,
    });
    const properTimeSeconds = interstellarProperTime.compute({
        d: distanceMeters,
        a: acceleration,
    });
    const earthTimeYears = earthTimeSeconds / SECONDS_PER_YEAR;
    const properTimeYears = properTimeSeconds / SECONDS_PER_YEAR;
    const dilationFactor = earthTimeSeconds / properTimeSeconds;

    // Peak velocity occurs at the midpoint (t_earth / 2), where the ship
    // flips from accelerating to decelerating. relativisticSpeed gives
    // the asymptotic-to-c velocity at constant proper acceleration `a`
    // after Earth-frame time `t`.
    const peakVelocityMps = relativisticSpeed.compute({
        a: acceleration,
        t: earthTimeSeconds / 2,
    });

    return (
        <AppLayout pageTitle={t('interstellar.pageTitle')}>
            <section className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="text-4xl font-bold tracking-tight">
                    {t('interstellar.heading')}
                </h1>
                <p className="mt-4 text-lg text-neutral-700">
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
                    <SliderInput
                        id="acceleration-slider"
                        label={t('interstellar.accelerationSlider.label')}
                        min={0.1}
                        max={100}
                        step={0.1}
                        value={acceleration}
                        onChange={setAcceleration}
                        formatValue={(v) =>
                            t('interstellar.accelerationSlider.valueFormat', {
                                value: v.toFixed(1),
                                g: (v / STANDARD_GRAVITY).toFixed(2),
                            })
                        }
                        formatAriaValueText={(v) =>
                            t('interstellar.accelerationSlider.ariaValueText', {
                                value: v.toFixed(1),
                            })
                        }
                    />
                    <DurationToggle
                        mode={durationMode}
                        onChange={setDurationMode}
                    />

                    {interfaceMode === 'math' && (
                        <EquationCard equation={relativisticSpeed} />
                    )}

                    <ResultPanel
                        destination={destination}
                        acceleration={acceleration}
                        durationMode={durationMode}
                        interfaceMode={interfaceMode}
                        earthTimeYears={earthTimeYears}
                        properTimeYears={properTimeYears}
                        dilationFactor={dilationFactor}
                        peakVelocityMps={peakVelocityMps}
                    />
                </div>
            </section>
        </AppLayout>
    );
}
