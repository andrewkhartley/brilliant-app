import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { EquationCard } from '@/components/equations/EquationCard';
import { StoryStage } from '@/components/story-stage';
import { buildStoryStageLabels } from '@/components/story-stage/labels';
import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { STANDARD_GRAVITY } from '@/lib/constants';
import { cylinderSurfaceArea } from '@/lib/equations';

import { buildHabitatStoryScenes } from './habitat/story';

const DEFAULT_RADIUS_METERS = 3_200;
const DEFAULT_LENGTH_METERS = 32_000;
const DEFAULT_DENSITY_PER_KM2 = 12_000;

const LAND_COMPARISONS = [
    { id: 'hotelRooms', squareKm: 0.0306580032 },
    { id: 'farm', squareKm: 1.82109 },
    { id: 'bayCity', squareKm: 29.01 },
    { id: 'manhattan', squareKm: 59.1 },
    { id: 'nyc', squareKm: 783.83 },
    { id: 'tokyo', squareKm: 2_193.72 },
    { id: 'rhodeIsland', squareKm: 3_144.25 },
    { id: 'massachusetts', squareKm: 27_363.22 },
    { id: 'france', squareKm: 549_087 },
];

const HEIGHT_COMPARISONS = [
    { id: 'adult', meters: 1.65 },
    { id: 'tenFloorBuilding', meters: 33 },
    { id: 'eiffelTower', meters: 324 },
    { id: 'oneWorldTrade', meters: 541.3 },
    { id: 'mountFuji', meters: 3_776.24 },
    { id: 'denali', meters: 6_190 },
    { id: 'everest', meters: 8_848.86 },
    { id: 'olympusMons', meters: 21_900 },
];

const PRESETS = [
    {
        id: 'oneill',
        radiusMeters: 3_200,
        lengthMeters: 32_000,
        gravityMultiplier: 1,
        densityPerKm2: 12_000,
        accelerationMultiplier: 0.05,
    },
    {
        id: 'largeDrum',
        radiusMeters: 4_000,
        lengthMeters: 32_000,
        gravityMultiplier: 1,
        densityPerKm2: 10_000,
        accelerationMultiplier: 0.1,
    },
    {
        id: 'torus',
        radiusMeters: 895,
        lengthMeters: 8_000,
        gravityMultiplier: 1,
        densityPerKm2: 8_000,
        accelerationMultiplier: 0.02,
    },
    {
        id: 'city',
        radiusMeters: 1_600,
        lengthMeters: 12_000,
        gravityMultiplier: 0.8,
        densityPerKm2: 18_000,
        accelerationMultiplier: 0.04,
    },
];

type EditableControlId =
    | 'radius'
    | 'length'
    | 'gravity'
    | 'density'
    | 'acceleration';

interface EditableControl {
    id: EditableControlId;
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    displayValue: string;
    editValue: number;
    unitLabel: string;
    onChange: (value: number) => void;
    toInternal: (value: number) => number;
    toEdit: (value: number) => number;
}

export default function HabitatPage() {
    const { t } = useTranslation();
    const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_METERS);
    const [lengthMeters, setLengthMeters] = useState(DEFAULT_LENGTH_METERS);
    const [gravityMultiplier, setGravityMultiplier] = useState(1);
    const [densityPerKm2, setDensityPerKm2] = useState(DEFAULT_DENSITY_PER_KM2);
    const [accelerationMultiplier, setAccelerationMultiplier] = useState(0.05);
    const [editingControl, setEditingControl] =
        useState<EditableControlId | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isStoryOpen, setIsStoryOpen] = useState(false);

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

    const controls: EditableControl[] = [
        {
            id: 'radius',
            label: t('habitat.controls.radius'),
            min: 500,
            max: 10_000,
            step: 100,
            value: radiusMeters,
            displayValue: t('habitat.controls.radiusFormat', {
                value: formatNumber(radiusMeters / 1_000, 1),
            }),
            editValue: radiusMeters / 1_000,
            unitLabel: t('habitat.controls.kilometersUnit'),
            onChange: setRadiusMeters,
            toInternal: (value) => value * 1_000,
            toEdit: (value) => value / 1_000,
        },
        {
            id: 'length',
            label: t('habitat.controls.length'),
            min: 2_000,
            max: 80_000,
            step: 1_000,
            value: lengthMeters,
            displayValue: t('habitat.controls.lengthFormat', {
                value: formatNumber(lengthMeters / 1_000, 0),
            }),
            editValue: lengthMeters / 1_000,
            unitLabel: t('habitat.controls.kilometersUnit'),
            onChange: setLengthMeters,
            toInternal: (value) => value * 1_000,
            toEdit: (value) => value / 1_000,
        },
        {
            id: 'gravity',
            label: t('habitat.controls.gravity'),
            min: 0.1,
            max: 1.2,
            step: 0.05,
            value: gravityMultiplier,
            displayValue: t('habitat.controls.gravityFormat', {
                value: formatNumber(gravityMultiplier, 2),
            }),
            editValue: gravityMultiplier,
            unitLabel: t('habitat.controls.gravityUnit'),
            onChange: setGravityMultiplier,
            toInternal: (value) => value,
            toEdit: (value) => value,
        },
        {
            id: 'density',
            label: t('habitat.controls.density'),
            min: 500,
            max: 30_000,
            step: 500,
            value: densityPerKm2,
            displayValue: t('habitat.controls.densityFormat', {
                value: formatNumber(densityPerKm2, 0),
            }),
            editValue: densityPerKm2,
            unitLabel: t('habitat.controls.densityUnit'),
            onChange: setDensityPerKm2,
            toInternal: (value) => value,
            toEdit: (value) => value,
        },
        {
            id: 'acceleration',
            label: t('habitat.controls.acceleration'),
            min: 0,
            max: 0.5,
            step: 0.01,
            value: accelerationMultiplier,
            displayValue: t('habitat.controls.accelerationFormat', {
                value: formatNumber(accelerationMultiplier, 2),
            }),
            editValue: accelerationMultiplier,
            unitLabel: t('habitat.controls.gravityUnit'),
            onChange: setAccelerationMultiplier,
            toInternal: (value) => value,
            toEdit: (value) => value,
        },
    ];

    const activeControl =
        controls.find((control) => control.id === editingControl) ?? null;
    const storyLabels = useMemo(() => buildStoryStageLabels(t), [t]);

    const landComparisons = LAND_COMPARISONS.map((item) => ({
        id: item.id,
        label: t(`habitat.comparisons.land.items.${item.id}`),
        area: t('habitat.results.areaFormat', {
            value: formatNumber(item.squareKm, item.squareKm < 1 ? 2 : 0),
        }),
        ratio: formatLandRatio(t, metrics.innerBandSquareKm / item.squareKm),
    }));
    const heightComparisons = HEIGHT_COMPARISONS.map((item) => {
        const remainingRadius = radiusMeters - item.meters;
        const feltGravityMultiplier =
            (remainingRadius / radiusMeters) * gravityMultiplier;
        const percent =
            remainingRadius < 0
                ? 0
                : (feltGravityMultiplier / gravityMultiplier) * 100;

        return {
            id: item.id,
            label: t(`habitat.comparisons.gravity.items.${item.id}`),
            height: t('habitat.comparisons.metersFormat', {
                value: formatNumber(item.meters, item.meters < 10 ? 2 : 0),
            }),
            gravity:
                remainingRadius < 0
                    ? t('habitat.comparisons.gravity.beyondRadius')
                    : t('habitat.comparisons.gravity.gravityFormat', {
                          percent: formatNumber(percent, 1),
                          g: formatNumber(feltGravityMultiplier, 2),
                      }),
            percent,
            isBeyondRadius: remainingRadius < 0,
        };
    });
    const storyScenes = useMemo(
        () =>
            buildHabitatStoryScenes({
                metrics: {
                    innerBand: t('habitat.results.areaFormat', {
                        value: formatNumber(metrics.innerBandSquareKm, 0),
                    }),
                    population: t('habitat.results.populationFormat', {
                        value: formatNumber(metrics.population, 0),
                    }),
                    spinRate: t('habitat.results.rpmFormat', {
                        value: formatNumber(metrics.rotationsPerMinute, 2),
                    }),
                },
                onOpenControls: () => {
                    setIsStoryOpen(false);
                    setIsSettingsOpen(true);
                },
                t,
            }),
        [
            metrics.innerBandSquareKm,
            metrics.population,
            metrics.rotationsPerMinute,
            t,
        ],
    );

    const applyPreset = (presetId: string) => {
        const preset = PRESETS.find((candidate) => candidate.id === presetId);

        if (!preset) {
            return;
        }

        setRadiusMeters(preset.radiusMeters);
        setLengthMeters(preset.lengthMeters);
        setGravityMultiplier(preset.gravityMultiplier);
        setDensityPerKm2(preset.densityPerKm2);
        setAccelerationMultiplier(preset.accelerationMultiplier);
    };

    return (
        <AppLayout pageTitle={t('habitat.pageTitle')}>
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
                        src="/assets/img/bg/cylinder.jpg"
                        alt={t('habitat.hero.imageAlt')}
                        className="absolute inset-0 h-full w-full object-cover opacity-48"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,17,31,0.98),rgba(8,17,31,0.78)_42%,rgba(8,17,31,0.3)),linear-gradient(180deg,rgba(8,17,31,0.18),rgba(8,17,31,0.98)_92%),radial-gradient(circle_at_72%_42%,rgba(125,211,252,0.18),transparent_34%)]" />
                    <div className="relative mx-auto flex min-h-[74vh] max-w-6xl items-center px-4 py-20 sm:py-24">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.28em] text-cyan-200/78 uppercase">
                                {t('habitat.hero.kicker')}
                            </p>
                            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                                {t('habitat.hero.heading')}
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-9 text-cyan-50/82">
                                {t('habitat.hero.intro')}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <SceneLaunchButton
                                    onClick={() => setIsStoryOpen(true)}
                                >
                                    {t('habitat.stage.openButton')}
                                </SceneLaunchButton>
                                <button
                                    type="button"
                                    onClick={() => setIsSettingsOpen(true)}
                                    className="cursor-pointer rounded-full border border-cyan-100/22 bg-cyan-50/8 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-50/14 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:outline-none"
                                >
                                    {t('habitat.controls.open')}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pointer-events-none relative h-0.75 bg-linear-to-r from-transparent via-cyan-200/72 to-transparent" />

                <div className="relative mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
                    <section className="mx-auto max-w-5xl py-12 sm:py-16">
                        <p className="text-xs font-semibold tracking-[0.24em] text-cyan-200/76 uppercase">
                            {t('habitat.introduction.eyebrow')}
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                            {t('habitat.introduction.title')}
                        </h2>
                        <div className="mt-5 grid gap-6 text-base leading-8 text-cyan-50/74 md:grid-cols-3">
                            <p>{t('habitat.introduction.bodyA')}</p>
                            <p>{t('habitat.introduction.bodyB')}</p>
                            <p>{t('habitat.introduction.bodyC')}</p>
                        </div>
                    </section>

                    <div className="mt-4 space-y-16">
                        <LearningStep
                            step={t('habitat.lesson.stepOne')}
                            eyebrow={t('habitat.builder.kicker')}
                            title={t('habitat.builder.heading')}
                            body={t('habitat.builder.intro')}
                        >
                            <div className="grid gap-4 lg:grid-cols-3">
                                <PrimaryMetric
                                    label={t('habitat.results.innerBand')}
                                    value={t('habitat.results.areaFormat', {
                                        value: formatNumber(
                                            metrics.innerBandSquareKm,
                                            0,
                                        ),
                                    })}
                                    note={t('habitat.story.areaNote')}
                                />
                                <PrimaryMetric
                                    label={t('habitat.results.spinRate')}
                                    value={t('habitat.results.rpmFormat', {
                                        value: formatNumber(
                                            metrics.rotationsPerMinute,
                                            2,
                                        ),
                                    })}
                                    note={t('habitat.story.spinNote')}
                                />
                                <PrimaryMetric
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
                                    note={t('habitat.story.populationNote')}
                                />
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
                                    label={t('habitat.results.closedShell')}
                                    value={t('habitat.results.areaFormat', {
                                        value: formatNumber(
                                            metrics.closedShellSquareKm,
                                            0,
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
                                    label={t('habitat.results.tilt')}
                                    value={t('habitat.results.tiltFormat', {
                                        value: formatNumber(
                                            metrics.tiltDegrees,
                                            1,
                                        ),
                                    })}
                                />
                            </div>
                        </LearningStep>

                        <LearningStep
                            step={t('habitat.lesson.stepTwo')}
                            eyebrow={t('habitat.life.eyebrow')}
                            title={t('habitat.life.title')}
                            body={t('habitat.life.body')}
                        >
                            <div className="grid gap-4 md:grid-cols-3">
                                <LifeCard
                                    title={t('habitat.life.cards.sky.title')}
                                    body={t('habitat.life.cards.sky.body')}
                                />
                                <LifeCard
                                    title={t(
                                        'habitat.life.cards.weather.title',
                                    )}
                                    body={t('habitat.life.cards.weather.body')}
                                />
                                <LifeCard
                                    title={t('habitat.life.cards.body.title')}
                                    body={t('habitat.life.cards.body.body')}
                                />
                            </div>
                        </LearningStep>

                        <LearningStep
                            step={t('habitat.lesson.stepThree')}
                            eyebrow={t('habitat.comparisons.land.eyebrow')}
                            title={t('habitat.comparisons.land.title')}
                            body={t('habitat.comparisons.land.body')}
                        >
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {landComparisons.map((item) => (
                                    <ScaleCard
                                        key={item.id}
                                        label={item.label}
                                        value={item.ratio}
                                        note={item.area}
                                    />
                                ))}
                            </div>
                        </LearningStep>

                        <LearningStep
                            step={t('habitat.lesson.stepFour')}
                            eyebrow={t('habitat.comparisons.gravity.eyebrow')}
                            title={t('habitat.comparisons.gravity.title')}
                            body={t('habitat.comparisons.gravity.body')}
                        >
                            <div className="space-y-3">
                                {heightComparisons.map((item) => (
                                    <GravityRow
                                        key={item.id}
                                        label={item.label}
                                        height={item.height}
                                        gravity={item.gravity}
                                        percent={item.percent}
                                        isBeyondRadius={item.isBeyondRadius}
                                    />
                                ))}
                            </div>
                        </LearningStep>

                    </div>
                </div>

                <section className="relative overflow-hidden bg-[#171106] py-14 sm:py-16">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_20%,rgba(251,191,36,0.18),transparent_30%),radial-gradient(circle_at_18%_72%,rgba(245,158,11,0.12),transparent_28%),linear-gradient(180deg,rgba(30,20,6,0.92),rgba(12,10,6,0.96))]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(251,191,36,0.22)_1px,transparent_1px)] bg-size-[46px_46px] opacity-18" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-transparent via-amber-200/76 to-transparent" />
                    <div className="relative mx-auto grid max-w-6xl gap-5 px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.62fr)]">
                        <div className="rounded-lg border border-amber-100/20 bg-amber-100/10 p-5 shadow-xl shadow-black/24 backdrop-blur-md">
                            <h2 className="text-lg font-semibold tracking-normal text-white">
                                {t('habitat.formula.registryTitle')}
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-amber-50/76">
                                {t('habitat.formula.registryBody')}
                            </p>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <FormulaChip
                                    title={t('habitat.formula.spinTitle')}
                                    formula={t('habitat.formula.spinFormula')}
                                />
                                <FormulaChip
                                    title={t('habitat.formula.bandTitle')}
                                    formula={t('habitat.formula.bandFormula')}
                                />
                                <FormulaChip
                                    title={t('habitat.formula.tiltTitle')}
                                    formula={t('habitat.formula.tiltFormula')}
                                />
                            </div>
                            <p className="mt-4 text-xs leading-6 text-amber-50/62">
                                {t('habitat.formula.bandNote')}
                            </p>
                        </div>

                        <div>
                            <EquationCard
                                equation={cylinderSurfaceArea}
                                theme="amber"
                            />
                            <p className="mt-3 text-xs leading-6 text-amber-50/62">
                                {t('habitat.formula.surfaceAreaNote')}
                            </p>
                        </div>
                    </div>

                    <div className="relative mx-auto mt-10 max-w-6xl px-4">
                        <div className="rounded-lg border border-amber-100/20 bg-amber-100/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-7">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.24em] text-amber-200/78 uppercase">
                                    {t('habitat.possibilities.eyebrow')}
                                </p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                                    {t('habitat.possibilities.title')}
                                </h2>
                                <p className="mt-4 max-w-none text-sm leading-7 text-amber-50/76">
                                    {t('habitat.possibilities.body')}
                                </p>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <PossibilityCard
                                    title={t(
                                        'habitat.possibilities.items.three.title',
                                    )}
                                    body={t(
                                        'habitat.possibilities.items.three.body',
                                    )}
                                />
                                <PossibilityCard
                                    title={t(
                                        'habitat.possibilities.items.community.title',
                                    )}
                                    body={t(
                                        'habitat.possibilities.items.community.body',
                                    )}
                                />
                                <PossibilityCard
                                    title={t(
                                        'habitat.possibilities.items.competitions.title',
                                    )}
                                    body={t(
                                        'habitat.possibilities.items.competitions.body',
                                    )}
                                />
                                <PossibilityCard
                                    title={t(
                                        'habitat.possibilities.items.lesson.title',
                                    )}
                                    body={t(
                                        'habitat.possibilities.items.lesson.body',
                                    )}
                                />
                                <PossibilityCard
                                    title={t(
                                        'habitat.possibilities.items.gallery.title',
                                    )}
                                    body={t(
                                        'habitat.possibilities.items.gallery.body',
                                    )}
                                />
                                <PossibilityCard
                                    title={t(
                                        'habitat.possibilities.items.experts.title',
                                    )}
                                    body={t(
                                        'habitat.possibilities.items.experts.body',
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="fixed right-4 bottom-4 z-40 rounded-full border border-cyan-100/22 bg-cyan-200 px-5 py-3 text-sm font-semibold text-slate-950 shadow-2xl shadow-black/45 transition hover:bg-cyan-100 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:outline-none"
                >
                    {t('habitat.controls.open')}
                </button>

                {isSettingsOpen && (
                    <ControlsModal
                        controls={controls}
                        metrics={metrics}
                        onClose={() => setIsSettingsOpen(false)}
                        onEdit={setEditingControl}
                        onPreset={applyPreset}
                    />
                )}

                {activeControl && (
                    <ExactValueModal
                        control={activeControl}
                        onClose={() => setEditingControl(null)}
                    />
                )}
            </section>
        </AppLayout>
    );
}

function ControlsModal({
    controls,
    metrics,
    onClose,
    onEdit,
    onPreset,
}: {
    controls: EditableControl[];
    metrics: {
        innerBandSquareKm: number;
        rotationsPerMinute: number;
        population: number;
    };
    onClose: () => void;
    onEdit: (controlId: EditableControlId) => void;
    onPreset: (presetId: string) => void;
}) {
    const { t } = useTranslation();

    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/64 px-4 py-5 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="habitat-controls-modal-title"
            onClick={onClose}
        >
            <div
                className="mx-auto flex max-h-[calc(100dvh-2.5rem)] max-w-6xl flex-col overflow-hidden rounded-lg border border-cyan-100/18 bg-slate-950 shadow-2xl shadow-black/50"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-cyan-100/12 p-4">
                    <h2
                        id="habitat-controls-modal-title"
                        className="text-lg font-semibold tracking-normal text-white"
                    >
                        {t('habitat.controls.mobileTitle')}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded border border-cyan-100/14 px-3 py-1 text-sm font-semibold text-cyan-50/76 transition hover:bg-cyan-50/8 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                    >
                        {t('habitat.controls.close')}
                    </button>
                </div>
                <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(280px,0.48fr)_minmax(0,1fr)]">
                    <div className="overflow-y-auto border-b border-cyan-100/12 p-5 lg:border-e lg:border-b-0">
                        <p className="text-xs font-semibold tracking-[0.24em] text-cyan-200/76 uppercase">
                            {t('habitat.controls.previewEyebrow')}
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold tracking-normal text-white">
                            {t('habitat.controls.previewTitle')}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-cyan-50/68">
                            {t('habitat.controls.previewBody')}
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
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
                                label={t('habitat.results.spinRate')}
                                value={t('habitat.results.rpmFormat', {
                                    value: formatNumber(
                                        metrics.rotationsPerMinute,
                                        2,
                                    ),
                                })}
                            />
                            <MetricCard
                                label={t('habitat.results.population')}
                                value={t('habitat.results.populationFormat', {
                                    value: formatNumber(metrics.population, 0),
                                })}
                            />
                        </div>
                    </div>
                    <div className="min-h-0 overflow-y-auto p-4">
                        <ControlRail
                            controls={controls}
                            onEdit={onEdit}
                            onPreset={onPreset}
                            compact
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ControlRail({
    compact = false,
    controls,
    onEdit,
    onPreset,
}: {
    compact?: boolean;
    controls: EditableControl[];
    onEdit: (controlId: EditableControlId) => void;
    onPreset: (presetId: string) => void;
}) {
    const { t } = useTranslation();

    return (
        <section
            className={
                compact
                    ? 'rounded-lg border border-cyan-100/12 bg-slate-950/72 p-4'
                    : 'rounded-lg border border-cyan-100/16 bg-slate-950/78 p-5 shadow-2xl shadow-black/35 backdrop-blur-md'
            }
        >
            <p className="text-xs font-semibold tracking-[0.24em] text-cyan-200/76 uppercase">
                {t('habitat.controls.title')}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal text-white">
                {t('habitat.controls.railTitle')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-cyan-50/68">
                {t('habitat.controls.railBody')}
            </p>

            <div
                className={
                    compact
                        ? 'mt-4 grid gap-2 sm:grid-cols-4 lg:grid-cols-2'
                        : 'mt-5 grid grid-cols-2 gap-2'
                }
            >
                {PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        type="button"
                        onClick={() => onPreset(preset.id)}
                        className="cursor-pointer rounded border border-cyan-100/14 bg-cyan-50/7 px-3 py-2 text-start text-xs font-semibold text-cyan-50/78 transition hover:border-cyan-200/40 hover:bg-cyan-100/12 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                    >
                        {t(`habitat.presets.${preset.id}`)}
                    </button>
                ))}
            </div>

            <div
                className={
                    compact
                        ? 'mt-4 grid gap-3 lg:grid-cols-2'
                        : 'mt-5 space-y-4'
                }
            >
                {controls.map((control) => (
                    <EditableSlider
                        key={control.id}
                        control={control}
                        onEdit={() => onEdit(control.id)}
                        compact={compact}
                    />
                ))}
            </div>
        </section>
    );
}

function EditableSlider({
    compact = false,
    control,
    onEdit,
}: {
    compact?: boolean;
    control: EditableControl;
    onEdit: () => void;
}) {
    const { t } = useTranslation();

    return (
        <div
            className={
                compact
                    ? 'rounded-lg border border-cyan-100/12 bg-slate-950/72 p-3'
                    : 'rounded-lg border border-cyan-100/12 bg-slate-950/72 p-4'
            }
        >
            <div className="flex items-baseline justify-between gap-3">
                <label
                    htmlFor={`habitat-${control.id}`}
                    className="text-sm font-semibold text-cyan-100"
                >
                    {control.label}
                </label>
                <button
                    type="button"
                    onClick={onEdit}
                    className="cursor-pointer rounded border border-cyan-100/14 bg-cyan-50/7 px-2 py-1 font-mono text-xs font-semibold text-white transition hover:border-cyan-200/40 hover:bg-cyan-100/12 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                    aria-label={t('habitat.controls.editAria', {
                        label: control.label,
                    })}
                >
                    {control.displayValue}
                </button>
            </div>
            <input
                id={`habitat-${control.id}`}
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={control.value}
                onChange={(event) =>
                    control.onChange(Number(event.target.value))
                }
                className={
                    compact
                        ? 'brilliant-slider mt-2 w-full cursor-pointer accent-cyan-300'
                        : 'brilliant-slider mt-3 w-full cursor-pointer accent-cyan-300'
                }
            />
        </div>
    );
}

function ExactValueModal({
    control,
    onClose,
}: {
    control: EditableControl;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const [value, setValue] = useState(control.toEdit(control.value));
    const minimum = control.toEdit(control.min);
    const maximum = control.toEdit(control.max);

    const applyValue = () => {
        const nextValue = Math.max(minimum, Math.min(maximum, value));
        control.onChange(control.toInternal(nextValue));
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/64 px-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="habitat-exact-value-title"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-lg border border-cyan-100/18 bg-slate-950 p-5 text-white shadow-2xl shadow-black/50"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3">
                    <h2
                        id="habitat-exact-value-title"
                        className="text-xl font-semibold tracking-normal"
                    >
                        {t('habitat.controls.exactTitle', {
                            label: control.label,
                        })}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded border border-cyan-100/14 px-3 py-1 text-sm font-semibold text-cyan-50/76 transition hover:bg-cyan-50/8 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                    >
                        {t('habitat.controls.close')}
                    </button>
                </div>
                <label
                    htmlFor="habitat-exact-value"
                    className="mt-5 block text-sm font-semibold text-cyan-100"
                >
                    {control.unitLabel}
                </label>
                <input
                    id="habitat-exact-value"
                    type="number"
                    min={minimum}
                    max={maximum}
                    step={control.toEdit(control.step)}
                    value={value}
                    onChange={(event) => setValue(Number(event.target.value))}
                    className="mt-2 w-full rounded border border-cyan-100/18 bg-slate-900 px-3 py-2 font-mono text-white focus:ring-2 focus:ring-cyan-200 focus:outline-none"
                />
                <p className="mt-2 text-xs leading-5 text-cyan-50/58">
                    {t('habitat.controls.exactRange', {
                        min: formatNumber(minimum, 2),
                        max: formatNumber(maximum, 2),
                        unit: control.unitLabel,
                    })}
                </p>
                <div className="mt-5 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded border border-cyan-100/14 px-4 py-2 text-sm font-semibold text-cyan-50/76 transition hover:bg-cyan-50/8 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                    >
                        {t('habitat.controls.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={applyValue}
                        className="cursor-pointer rounded bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                    >
                        {t('habitat.controls.apply')}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SceneLaunchButton({
    children,
    className = '',
    onClick,
}: {
    children: ReactNode;
    className?: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'group inline-flex cursor-pointer items-center gap-3 rounded-full border border-fuchsia-200/32 bg-fuchsia-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-fuchsia-950/28 transition hover:border-fuchsia-100/70 hover:bg-fuchsia-200 focus-visible:ring-2 focus-visible:ring-fuchsia-100 focus-visible:outline-none',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <span className="grid size-7 place-items-center rounded-full bg-slate-950/92 text-fuchsia-100 shadow-inner shadow-fuchsia-300/24 transition group-hover:bg-slate-900">
                <i aria-hidden="true" className="fa-solid fa-message-lines" />
            </span>
            <span>{children}</span>
        </button>
    );
}

function LearningStep({
    body,
    children,
    eyebrow,
    step,
    title,
}: {
    body: string;
    children: ReactNode;
    eyebrow: string;
    step: string;
    title: string;
}) {
    return (
        <section className="relative overflow-hidden border-t border-cyan-100/18 pt-10">
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)]">
                <div className="lg:self-start">
                    <div className="inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-1 rounded border border-cyan-100/16 bg-cyan-50/8 px-3 py-2 shadow-lg shadow-black/18 backdrop-blur-sm">
                        <p className="font-mono text-sm font-semibold text-cyan-100">
                            {step}
                        </p>
                        <span
                            aria-hidden="true"
                            className="h-4 w-px bg-cyan-100/24"
                        />
                        <p className="text-xs font-semibold tracking-[0.2em] text-cyan-50/78 uppercase">
                            {eyebrow}
                        </p>
                    </div>
                    <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white">
                        {title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-cyan-50/72">
                        {body}
                    </p>
                </div>
                <div>{children}</div>
            </div>
        </section>
    );
}

function PrimaryMetric({
    label,
    note,
    value,
}: {
    label: string;
    note: string;
    value: string;
}) {
    return (
        <article className="rounded-lg border border-cyan-100/16 bg-cyan-50/8 p-5 shadow-xl shadow-black/24">
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-200/76 uppercase">
                {label}
            </p>
            <p className="mt-3 font-mono text-3xl font-semibold text-white">
                {value}
            </p>
            <p className="mt-3 text-sm leading-6 text-cyan-50/68">{note}</p>
        </article>
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

function LifeCard({ body, title }: { body: string; title: string }) {
    return (
        <article className="rounded-lg border border-cyan-100/14 bg-slate-950/64 p-5 shadow-lg shadow-black/22">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-cyan-50/70">{body}</p>
        </article>
    );
}

function ScaleCard({
    label,
    note,
    value,
}: {
    label: string;
    note: string;
    value: string;
}) {
    return (
        <article className="rounded-lg border border-cyan-100/14 bg-slate-950/62 p-4 shadow-lg shadow-black/22 backdrop-blur-md">
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="mt-3 font-mono text-2xl font-semibold text-cyan-100">
                {value}
            </p>
            <p className="mt-2 font-mono text-xs text-cyan-50/52">{note}</p>
        </article>
    );
}

function GravityRow({
    gravity,
    height,
    isBeyondRadius,
    label,
    percent,
}: {
    gravity: string;
    height: string;
    isBeyondRadius: boolean;
    label: string;
    percent: number;
}) {
    const clampedPercent = Math.max(0, Math.min(percent, 100));

    return (
        <article className="grid gap-3 rounded-lg border border-cyan-100/12 bg-slate-950/62 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(130px,0.38fr)] sm:items-center">
            <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">
                        {label}
                    </h3>
                    <p className="font-mono text-xs text-cyan-50/58">
                        {height}
                    </p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-cyan-50/10">
                    <div
                        className={
                            isBeyondRadius
                                ? 'h-full rounded-full bg-slate-600'
                                : 'h-full rounded-full bg-cyan-300'
                        }
                        style={{ width: `${clampedPercent}%` }}
                    />
                </div>
            </div>
            <p className="font-mono text-sm font-semibold text-cyan-100 sm:text-end">
                {gravity}
            </p>
        </article>
    );
}

function FormulaChip({ formula, title }: { formula: string; title: string }) {
    return (
        <article className="rounded border border-amber-100/16 bg-[#120e08]/62 p-3 shadow-inner shadow-amber-950/20">
            <h3 className="text-xs font-semibold tracking-[0.14em] text-amber-200/72 uppercase">
                {title}
            </h3>
            <p className="mt-2 font-mono text-sm font-semibold text-amber-100">
                {formula}
            </p>
        </article>
    );
}

function PossibilityCard({ body, title }: { body: string; title: string }) {
    return (
        <article className="rounded-lg border border-amber-100/16 bg-[#140f08]/58 p-4 shadow-lg shadow-black/18">
            <h3 className="text-sm font-semibold tracking-normal text-white">
                {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-amber-50/72">{body}</p>
        </article>
    );
}

function formatLandRatio(
    t: ReturnType<typeof useTranslation>['t'],
    ratio: number,
): string {
    if (ratio < 0.01) {
        return t('habitat.comparisons.land.lessThanOnePercent');
    }

    return t('habitat.comparisons.land.ratioFormat', {
        value: formatNumber(ratio, ratio < 10 ? 2 : 1),
    });
}

function formatNumber(value: number, maximumFractionDigits: number): string {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits,
        minimumFractionDigits: maximumFractionDigits,
    }).format(value);
}
