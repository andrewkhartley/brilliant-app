import type { ReactNode } from 'react';
import { useState } from 'react';

import { EquationCard } from '@/components/equations/EquationCard';
import { LiveResult } from '@/components/equations/LiveResult';
import { SliderInput } from '@/components/equations/SliderInput';
import { useTranslation } from '@/hooks/useTranslation';
import {
    GRAVITATIONAL_CONSTANT,
    SPEED_OF_LIGHT,
    STANDARD_GRAVITY,
} from '@/lib/constants';
import { orbitalVelocity, relativisticSpeed } from '@/lib/equations';

type FormulaTab = 'orbitalVelocity' | 'orbitalPeriod' | 'relativity';

const EARTH_MASS = 5.972e24;
const EARTH_RADIUS = 6_371_000;
const DAY_SECONDS = 24 * 60 * 60;
const MAX_HUMAN_SCALE_ACCELERATION = STANDARD_GRAVITY * 3;
const GEOSTATIONARY_ORBIT_RADIUS = Math.cbrt(
    (GRAVITATIONAL_CONSTANT * EARTH_MASS * DAY_SECONDS * DAY_SECONDS) /
        (4 * Math.PI * Math.PI),
);

export function TryOne() {
    const { t } = useTranslation();
    const [activeFormula, setActiveFormula] =
        useState<FormulaTab>('orbitalVelocity');
    const [orbitalRadius, setOrbitalRadius] = useState<number>(6.778e6);
    const [acceleration, setAcceleration] = useState<number>(STANDARD_GRAVITY);
    const [accelerationDays, setAccelerationDays] = useState<number>(365.25);

    const accelerationSeconds = accelerationDays * 24 * 60 * 60;
    const orbitalVelocityMetersPerSecond = orbitalVelocity.compute({
        M: EARTH_MASS,
        r: orbitalRadius,
    });
    const orbitalPeriodSeconds =
        2 *
        Math.PI *
        Math.sqrt(
            (orbitalRadius * orbitalRadius * orbitalRadius) /
                (GRAVITATIONAL_CONSTANT * EARTH_MASS),
        );
    const velocityMetersPerSecond = relativisticSpeed.compute({
        a: acceleration,
        t: accelerationSeconds,
    });
    const fractionOfLightSpeed = velocityMetersPerSecond / SPEED_OF_LIGHT;
    const lorentzFactor =
        1 / Math.sqrt(1 - Math.min(fractionOfLightSpeed, 0.999_999) ** 2);
    const formulaTabs: FormulaTab[] = [
        'orbitalVelocity',
        'orbitalPeriod',
        'relativity',
    ];
    const handleAccelerationChange = (value: number) => {
        const isNearOneGravity = Math.abs(value - STANDARD_GRAVITY) <= 0.11;

        setAcceleration(isNearOneGravity ? STANDARD_GRAVITY : value);
    };
    const isAtGeostationaryOrbit =
        orbitalRadius >= GEOSTATIONARY_ORBIT_RADIUS - 1000;
    const isAtOneGravity = Math.abs(acceleration - STANDARD_GRAVITY) <= 0.01;
    const eras = [
        t('landing.tryOne.era1900'),
        t('landing.tryOne.era1940'),
        t('landing.tryOne.era1980'),
        t('landing.tryOne.era2020'),
        t('landing.tryOne.eraFuture'),
    ];

    return (
        <section className="relative overflow-hidden border-t border-cyan-100/15 bg-[#08111f] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(125,211,252,0.17),transparent_30%),radial-gradient(circle_at_16%_70%,rgba(34,211,238,0.1),transparent_26%),linear-gradient(135deg,rgba(8,17,31,0.94),rgba(15,23,42,0.98))]" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[72px_72px] opacity-35"
            />

            <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24">
                <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.26em] text-cyan-200/76 uppercase">
                            {t('landing.tryOne.kicker')}
                        </p>
                        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                            {t('landing.tryOne.heading')}
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-cyan-50/78">
                            {t('landing.tryOne.intro')}
                        </p>

                        <div className="mt-7 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                            {eras.map((era) => (
                                <span
                                    key={era}
                                    className="rounded border border-cyan-100/12 bg-cyan-50/6 px-3 py-2 text-center font-semibold text-cyan-50/78"
                                >
                                    {era}
                                </span>
                            ))}
                        </div>

                        <div className="mt-7 space-y-4 text-sm leading-7 text-cyan-50/72 sm:text-base sm:leading-8">
                            <p>{t('landing.tryOne.paragraph1')}</p>
                            <p>{t('landing.tryOne.paragraph2')}</p>
                            <p>{t('landing.tryOne.paragraph3')}</p>
                        </div>
                        <p className="mt-6 rounded border border-cyan-100/14 bg-cyan-50/7 p-4 text-sm leading-7 font-semibold text-cyan-50/86 shadow-lg shadow-black/20">
                            {t('landing.tryOne.capstone')}
                        </p>
                    </div>

                    <div className="relative">
                        <div
                            aria-hidden="true"
                            className="absolute -inset-4 rounded-xl bg-cyan-300/7 blur-2xl"
                        />
                        <div className="relative overflow-hidden rounded-lg border border-cyan-100/16 bg-slate-950/68 p-5 shadow-2xl shadow-black/35 backdrop-blur-md sm:p-6">
                            <p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/78 uppercase">
                                {t('landing.tryOne.demoKicker')}
                            </p>
                            <h3 className="mt-3 text-2xl font-semibold tracking-normal text-white">
                                {t('landing.tryOne.demoHeading')}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-cyan-50/70">
                                {t('landing.tryOne.demoIntro')}
                            </p>

                            <div className="mt-6 space-y-6">
                                <div
                                    role="tablist"
                                    aria-label={t(
                                        'landing.tryOne.formulaTabs.label',
                                    )}
                                    className="grid grid-cols-3 gap-2"
                                >
                                    {formulaTabs.map((formula) => (
                                        <button
                                            key={formula}
                                            type="button"
                                            role="tab"
                                            aria-selected={
                                                activeFormula === formula
                                            }
                                            onClick={() =>
                                                setActiveFormula(formula)
                                            }
                                            className="cursor-pointer rounded border border-cyan-100/12 bg-cyan-50/6 px-3 py-2 text-left text-xs font-semibold tracking-[0.12em] text-cyan-50/72 uppercase transition hover:border-cyan-200/36 hover:bg-cyan-50/10 aria-selected:border-cyan-200/55 aria-selected:bg-cyan-200/14 aria-selected:text-white"
                                        >
                                            {t(
                                                `landing.tryOne.formulaTabs.${formula}.tab`,
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {activeFormula === 'orbitalVelocity' && (
                                    <FormulaPanel
                                        equation={
                                            <EquationCard
                                                equation={orbitalVelocity}
                                            />
                                        }
                                        description={t(
                                            'landing.tryOne.formulaTabs.orbitalVelocity.description',
                                        )}
                                        resultLabel={t(
                                            'landing.tryOne.formulaTabs.orbitalVelocity.resultLabel',
                                        )}
                                        result={`${(orbitalVelocityMetersPerSecond / 1000).toFixed(2)} km/s`}
                                    >
                                        <SliderInput
                                            id="try-one-orbital-radius"
                                            label={t(
                                                'landing.tryOne.formulaTabs.orbitalVelocity.radiusLabel',
                                            )}
                                            min={6.4e6}
                                            max={GEOSTATIONARY_ORBIT_RADIUS}
                                            step={1000}
                                            value={orbitalRadius}
                                            onChange={setOrbitalRadius}
                                            formatValue={(v) =>
                                                formatOrbitRadius(v)
                                            }
                                            formatAriaValueText={(v) =>
                                                `${(v / 1000).toFixed(0)} kilometers from Earth's core, ${Math.max(0, (v - EARTH_RADIUS) / 1000).toFixed(0)} kilometers above Earth's surface`
                                            }
                                        />
                                        {isAtGeostationaryOrbit && (
                                            <GeostationaryMessage />
                                        )}
                                    </FormulaPanel>
                                )}

                                {activeFormula === 'orbitalPeriod' && (
                                    <FormulaPanel
                                        equation={<GravityOrbitPeriodCard />}
                                        description={t(
                                            'landing.tryOne.formulaTabs.orbitalPeriod.description',
                                        )}
                                        resultLabel={t(
                                            'landing.tryOne.formulaTabs.orbitalPeriod.resultLabel',
                                        )}
                                        result={formatDuration(
                                            orbitalPeriodSeconds,
                                        )}
                                    >
                                        <SliderInput
                                            id="try-one-period-radius"
                                            label={t(
                                                'landing.tryOne.formulaTabs.orbitalPeriod.radiusLabel',
                                            )}
                                            min={6.4e6}
                                            max={GEOSTATIONARY_ORBIT_RADIUS}
                                            step={1000}
                                            value={orbitalRadius}
                                            onChange={setOrbitalRadius}
                                            formatValue={(v) =>
                                                formatOrbitRadius(v)
                                            }
                                            formatAriaValueText={(v) =>
                                                `${(v / 1000).toFixed(0)} kilometers from Earth's core, ${Math.max(0, (v - EARTH_RADIUS) / 1000).toFixed(0)} kilometers above Earth's surface`
                                            }
                                        />
                                        {isAtGeostationaryOrbit && (
                                            <GeostationaryMessage />
                                        )}
                                    </FormulaPanel>
                                )}

                                {activeFormula === 'relativity' && (
                                    <FormulaPanel
                                        equation={
                                            <EquationCard
                                                equation={relativisticSpeed}
                                            />
                                        }
                                        description={t(
                                            'landing.tryOne.formulaTabs.relativity.description',
                                        )}
                                        resultLabel={t(
                                            'landing.tryOne.formulaTabs.relativity.resultLabel',
                                        )}
                                        result={`${fractionOfLightSpeed.toFixed(4)} c`}
                                    >
                                        <SliderInput
                                            id="try-one-acceleration"
                                            label={t(
                                                'landing.tryOne.formulaTabs.relativity.accelerationLabel',
                                            )}
                                            min={0.1}
                                            max={MAX_HUMAN_SCALE_ACCELERATION}
                                            step={0.1}
                                            value={acceleration}
                                            onChange={handleAccelerationChange}
                                            formatValue={(v) =>
                                                `${v.toFixed(1)} m/s^2`
                                            }
                                            formatAriaValueText={(v) =>
                                                `${v.toFixed(1)} meters per second squared`
                                            }
                                        />
                                        {isAtOneGravity && (
                                            <OneGravityMessage />
                                        )}
                                        <SliderInput
                                            id="try-one-acceleration-days"
                                            label={t(
                                                'landing.tryOne.formulaTabs.relativity.durationLabel',
                                            )}
                                            min={1}
                                            max={365.25}
                                            step={1}
                                            value={accelerationDays}
                                            onChange={setAccelerationDays}
                                            formatValue={(v) =>
                                                `${v.toFixed(0)} days`
                                            }
                                            formatAriaValueText={(v) =>
                                                `${v.toFixed(0)} days`
                                            }
                                        />
                                        <TimeDilationSummary
                                            lorentzFactor={lorentzFactor}
                                        />
                                    </FormulaPanel>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FormulaPanel({
    children,
    description,
    equation,
    result,
    resultLabel,
}: {
    children: ReactNode;
    description: string;
    equation: ReactNode;
    result: string;
    resultLabel: string;
}) {
    return (
        <div className="space-y-5">
            <p className="rounded border border-cyan-100/12 bg-cyan-50/5 p-3 text-sm leading-6 text-cyan-50/72">
                {description}
            </p>
            {equation}
            <div className="space-y-4">{children}</div>
            <LiveResult label={resultLabel}>{result}</LiveResult>
        </div>
    );
}

function GeostationaryMessage() {
    return (
        <p className="rounded border border-cyan-200/28 bg-cyan-200/12 px-3 py-2 text-sm font-semibold text-cyan-50 shadow-lg shadow-cyan-950/30">
            {'Hello, Geostationary!'}
        </p>
    );
}

function OneGravityMessage() {
    return (
        <p className="rounded border border-cyan-200/28 bg-cyan-200/12 px-3 py-2 text-sm font-semibold text-cyan-50 shadow-lg shadow-cyan-950/30">
            {'1g: Earthlike acceleration'}
        </p>
    );
}

function TimeDilationSummary({ lorentzFactor }: { lorentzFactor: number }) {
    const intervals = [
        { label: '1 minute', seconds: 60 },
        { label: '1 hour', seconds: 3600 },
        { label: '1 day', seconds: 86_400 },
        { label: '1 year', seconds: 365.25 * 86_400 },
    ];

    return (
        <div className="rounded border border-cyan-100/12 bg-slate-950/56 p-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-200/70 uppercase">
                {'Time dilation'}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {intervals.map((interval) => (
                    <div
                        key={interval.label}
                        className="rounded border border-cyan-100/10 bg-cyan-50/5 p-3"
                    >
                        <p className="text-xs text-cyan-50/56">
                            {interval.label}
                            {' outside'}
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-white">
                            {formatDilatedTime(
                                interval.seconds / lorentzFactor,
                            )}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GravityOrbitPeriodCard() {
    return (
        <div className="rounded border border-cyan-100/12 bg-slate-950/50 p-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-200/70 uppercase">
                {'Circular orbit period'}
            </p>
            <div className="mt-3 overflow-x-auto text-center text-xl text-white">
                {'T = 2π √(r³ / GM)'}
            </div>
            <p className="mt-3 text-xs leading-5 text-cyan-50/58">
                {
                    "M is Earth's mass in this example. For natural orbits, period follows from radius, central mass, and gravity."
                }
            </p>
        </div>
    );
}

function formatDuration(seconds: number): string {
    const hours = seconds / 3600;

    if (hours < 48) {
        return `${hours.toFixed(1)} hours`;
    }

    return `${(hours / 24).toFixed(1)} days`;
}

function formatDilatedTime(seconds: number): string {
    if (seconds < 60) {
        return `${seconds.toFixed(1)} sec`;
    }

    const minutes = seconds / 60;

    if (minutes < 60) {
        return `${minutes.toFixed(1)} min`;
    }

    const hours = minutes / 60;

    if (hours < 48) {
        return `${hours.toFixed(1)} hr`;
    }

    const days = hours / 24;

    if (days < 365.25) {
        return `${days.toFixed(1)} days`;
    }

    return `${(days / 365.25).toFixed(2)} years`;
}

function formatOrbitRadius(radiusMeters: number): string {
    const radiusKilometers = radiusMeters / 1000;
    const altitudeKilometers = Math.max(0, radiusMeters - EARTH_RADIUS) / 1000;

    return `${radiusKilometers.toFixed(0)} km from core (${altitudeKilometers.toFixed(0)} km up)`;
}
