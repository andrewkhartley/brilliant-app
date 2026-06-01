import { useMemo, useState } from 'react';

import { EquationCard } from '@/components/equations/EquationCard';
import { SliderInput } from '@/components/equations/SliderInput';
import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { STANDARD_GRAVITY } from '@/lib/constants';
import { cylinderSurfaceArea } from '@/lib/equations';

const DEFAULT_RADIUS_METERS = 3_200;
const DEFAULT_LENGTH_METERS = 32_000;
const DEFAULT_DENSITY_PER_KM2 = 12_000;

export default function HabitatPage() {
    const { t } = useTranslation();
    const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_METERS);
    const [lengthMeters, setLengthMeters] = useState(DEFAULT_LENGTH_METERS);
    const [gravityMultiplier, setGravityMultiplier] = useState(1);
    const [densityPerKm2, setDensityPerKm2] = useState(DEFAULT_DENSITY_PER_KM2);
    const [accelerationMultiplier, setAccelerationMultiplier] = useState(0.05);

    const metrics = useMemo(() => {
        const targetGravity = gravityMultiplier * STANDARD_GRAVITY;
        const circumferenceMeters = 2 * Math.PI * radiusMeters;
        const innerBandSquareMeters = circumferenceMeters * lengthMeters;
        const innerBandSquareKm = innerBandSquareMeters / 1_000_000;
        const closedShellSquareKm =
            cylinderSurfaceArea.compute({
                r: radiusMeters,
                h: lengthMeters,
            }) / 1_000_000;
        const angularVelocity = Math.sqrt(targetGravity / radiusMeters);
        const rotationsPerMinute = (angularVelocity * 60) / (2 * Math.PI);
        const rotationSeconds = (2 * Math.PI) / angularVelocity;
        const rimSpeedMetersPerSecond = angularVelocity * radiusMeters;
        const population = innerBandSquareKm * densityPerKm2;
        const acceleration = accelerationMultiplier * STANDARD_GRAVITY;
        const tiltDegrees =
            (Math.atan2(acceleration, targetGravity) * 180) / Math.PI;

        return {
            circumferenceKm: circumferenceMeters / 1_000,
            innerBandSquareKm,
            closedShellSquareKm,
            rotationsPerMinute,
            rotationSeconds,
            rimSpeedMetersPerSecond,
            population,
            tiltDegrees,
        };
    }, [
        accelerationMultiplier,
        densityPerKm2,
        gravityMultiplier,
        lengthMeters,
        radiusMeters,
    ]);

    return (
        <AppLayout pageTitle={t('habitat.pageTitle')}>
            <section className="relative overflow-hidden bg-[#08111f] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_14%,rgba(125,211,252,0.18),transparent_30%),radial-gradient(circle_at_18%_74%,rgba(20,184,166,0.12),transparent_26%),linear-gradient(135deg,rgba(8,17,31,0.9),rgba(15,23,42,0.98))]" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.32)_1px,transparent_1px)] bg-size-[44px_44px] opacity-25"
                />

                <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
                    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.28em] text-cyan-200/78 uppercase">
                                {t('habitat.hero.kicker')}
                            </p>
                            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                                {t('habitat.hero.heading')}
                            </h1>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-cyan-50/78">
                                {t('habitat.hero.intro')}
                            </p>
                        </div>

                        <figure className="relative overflow-hidden rounded-lg border border-cyan-100/16 bg-slate-950/68 shadow-2xl shadow-black/35">
                            <img
                                src="/assets/img/bg/cylinder.jpg"
                                alt={t('habitat.hero.imageAlt')}
                                className="h-full min-h-70 w-full object-cover opacity-90"
                            />
                            <figcaption className="absolute inset-x-0 bottom-0 border-t border-cyan-100/12 bg-slate-950/76 p-4 text-sm leading-6 text-cyan-50/82 backdrop-blur-md">
                                {t('habitat.scene.caption')}
                            </figcaption>
                        </figure>
                    </div>

                    <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.618fr)]">
                        <div className="space-y-6">
                            <section className="rounded-lg border border-cyan-100/14 bg-slate-950/58 p-6 shadow-2xl shadow-black/28 backdrop-blur-md">
                                <p className="text-xs font-semibold tracking-[0.24em] text-cyan-200/76 uppercase">
                                    {t('habitat.builder.kicker')}
                                </p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white">
                                    {t('habitat.builder.heading')}
                                </h2>
                                <p className="mt-4 max-w-3xl text-sm leading-7 text-cyan-50/72">
                                    {t('habitat.builder.intro')}
                                </p>
                            </section>

                            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <MetricCard
                                    label={t('habitat.results.circumference')}
                                    value={t('habitat.results.kmFormat', {
                                        value: formatNumber(
                                            metrics.circumferenceKm,
                                            1,
                                        ),
                                    })}
                                />
                                <MetricCard
                                    label={t('habitat.results.innerBand')}
                                    value={t('habitat.results.areaFormat', {
                                        value: formatNumber(
                                            metrics.innerBandSquareKm,
                                            0,
                                        ),
                                    })}
                                />
                                <MetricCard
                                    label={t('habitat.results.closedShell')}
                                    value={t('habitat.results.areaFormat', {
                                        value: formatNumber(
                                            metrics.closedShellSquareKm,
                                            0,
                                        ),
                                    })}
                                />
                                <MetricCard
                                    label={t('habitat.results.spinRate')}
                                    value={t('habitat.results.rpmFormat', {
                                        value: formatNumber(
                                            metrics.rotationsPerMinute,
                                            2,
                                        ),
                                    })}
                                />
                                <MetricCard
                                    label={t('habitat.results.dayLength')}
                                    value={t('habitat.results.secondsFormat', {
                                        value: formatNumber(
                                            metrics.rotationSeconds,
                                            1,
                                        ),
                                    })}
                                />
                                <MetricCard
                                    label={t('habitat.results.rimSpeed')}
                                    value={t('habitat.results.speedFormat', {
                                        value: formatNumber(
                                            metrics.rimSpeedMetersPerSecond,
                                            0,
                                        ),
                                    })}
                                />
                                <MetricCard
                                    label={t('habitat.results.population')}
                                    value={t(
                                        'habitat.results.populationFormat',
                                        {
                                            value: formatNumber(
                                                metrics.population,
                                                0,
                                            ),
                                        },
                                    )}
                                />
                                <MetricCard
                                    label={t('habitat.results.tilt')}
                                    value={t('habitat.results.tiltFormat', {
                                        value: formatNumber(
                                            metrics.tiltDegrees,
                                            1,
                                        ),
                                    })}
                                />
                            </section>

                            <section className="grid gap-4 md:grid-cols-3">
                                <FormulaCard
                                    title={t('habitat.formula.spinTitle')}
                                    formula={t('habitat.formula.spinFormula')}
                                    body={t('habitat.formula.spinBody')}
                                />
                                <FormulaCard
                                    title={t('habitat.formula.bandTitle')}
                                    formula={t('habitat.formula.bandFormula')}
                                    body={t('habitat.formula.bandBody')}
                                />
                                <FormulaCard
                                    title={t('habitat.formula.tiltTitle')}
                                    formula={t('habitat.formula.tiltFormula')}
                                    body={t('habitat.formula.tiltBody')}
                                />
                            </section>
                        </div>

                        <aside className="space-y-5">
                            <section className="rounded-lg border border-cyan-100/16 bg-slate-950/72 p-5 shadow-2xl shadow-black/32 backdrop-blur-md">
                                <h2 className="text-xl font-semibold tracking-normal text-white">
                                    {t('habitat.controls.title')}
                                </h2>
                                <div className="mt-5 space-y-4">
                                    <SliderInput
                                        id="habitat-radius"
                                        label={t('habitat.controls.radius')}
                                        min={500}
                                        max={10_000}
                                        step={100}
                                        value={radiusMeters}
                                        onChange={setRadiusMeters}
                                        formatValue={(value) =>
                                            t('habitat.controls.radiusFormat', {
                                                value: formatNumber(
                                                    value / 1_000,
                                                    1,
                                                ),
                                            })
                                        }
                                        formatAriaValueText={(value) =>
                                            t('habitat.controls.radiusAria', {
                                                value: formatNumber(
                                                    value / 1_000,
                                                    1,
                                                ),
                                            })
                                        }
                                    />
                                    <SliderInput
                                        id="habitat-length"
                                        label={t('habitat.controls.length')}
                                        min={2_000}
                                        max={80_000}
                                        step={1_000}
                                        value={lengthMeters}
                                        onChange={setLengthMeters}
                                        formatValue={(value) =>
                                            t('habitat.controls.lengthFormat', {
                                                value: formatNumber(
                                                    value / 1_000,
                                                    0,
                                                ),
                                            })
                                        }
                                        formatAriaValueText={(value) =>
                                            t('habitat.controls.lengthAria', {
                                                value: formatNumber(
                                                    value / 1_000,
                                                    0,
                                                ),
                                            })
                                        }
                                    />
                                    <SliderInput
                                        id="habitat-gravity"
                                        label={t('habitat.controls.gravity')}
                                        min={0.1}
                                        max={1.2}
                                        step={0.05}
                                        value={gravityMultiplier}
                                        onChange={setGravityMultiplier}
                                        formatValue={(value) =>
                                            t(
                                                'habitat.controls.gravityFormat',
                                                {
                                                    value: formatNumber(
                                                        value,
                                                        2,
                                                    ),
                                                },
                                            )
                                        }
                                        formatAriaValueText={(value) =>
                                            t('habitat.controls.gravityAria', {
                                                value: formatNumber(value, 2),
                                            })
                                        }
                                    />
                                    <SliderInput
                                        id="habitat-density"
                                        label={t('habitat.controls.density')}
                                        min={500}
                                        max={30_000}
                                        step={500}
                                        value={densityPerKm2}
                                        onChange={setDensityPerKm2}
                                        formatValue={(value) =>
                                            t(
                                                'habitat.controls.densityFormat',
                                                {
                                                    value: formatNumber(
                                                        value,
                                                        0,
                                                    ),
                                                },
                                            )
                                        }
                                        formatAriaValueText={(value) =>
                                            t('habitat.controls.densityAria', {
                                                value: formatNumber(value, 0),
                                            })
                                        }
                                    />
                                    <SliderInput
                                        id="habitat-acceleration"
                                        label={t(
                                            'habitat.controls.acceleration',
                                        )}
                                        min={0}
                                        max={0.5}
                                        step={0.01}
                                        value={accelerationMultiplier}
                                        onChange={setAccelerationMultiplier}
                                        formatValue={(value) =>
                                            t(
                                                'habitat.controls.accelerationFormat',
                                                {
                                                    value: formatNumber(
                                                        value,
                                                        2,
                                                    ),
                                                },
                                            )
                                        }
                                        formatAriaValueText={(value) =>
                                            t(
                                                'habitat.controls.accelerationAria',
                                                {
                                                    value: formatNumber(
                                                        value,
                                                        2,
                                                    ),
                                                },
                                            )
                                        }
                                    />
                                </div>
                            </section>

                            <section className="rounded-lg border border-cyan-100/14 bg-cyan-50/7 p-5 shadow-xl shadow-black/24 backdrop-blur-md">
                                <h2 className="text-lg font-semibold tracking-normal text-white">
                                    {t('habitat.formula.registryTitle')}
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-cyan-50/72">
                                    {t('habitat.formula.registryBody')}
                                </p>
                            </section>

                            <EquationCard equation={cylinderSurfaceArea} />
                        </aside>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <article className="rounded-lg border border-cyan-100/14 bg-slate-950/64 p-4 shadow-lg shadow-black/22 backdrop-blur-md">
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-200/70 uppercase">
                {label}
            </p>
            <p className="mt-2 font-mono text-xl font-semibold text-white">
                {value}
            </p>
        </article>
    );
}

function FormulaCard({
    body,
    formula,
    title,
}: {
    body: string;
    formula: string;
    title: string;
}) {
    return (
        <article className="rounded-lg border border-cyan-100/14 bg-slate-950/58 p-5 shadow-xl shadow-black/24 backdrop-blur-md">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="mt-3 font-mono text-sm font-semibold text-cyan-100">
                {formula}
            </p>
            <p className="mt-3 text-sm leading-7 text-cyan-50/70">{body}</p>
        </article>
    );
}

function formatNumber(value: number, maximumFractionDigits: number): string {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits,
        minimumFractionDigits: maximumFractionDigits,
    }).format(value);
}
