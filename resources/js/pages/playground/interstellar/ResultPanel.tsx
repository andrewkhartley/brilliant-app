import { useTranslation } from '@/hooks/useTranslation';
import { SPEED_OF_LIGHT } from '@/lib/constants';

interface ResultPanelProps {
    durationMode: 'subjective' | 'earth';
    earthTimeYears: number;
    properTimeYears: number;
    dilationFactor: number;
    effectiveExhaustVelocityMps: number;
    accelerationDistanceLy: number;
    accelerationDurationYears: number;
    cruiseDistanceLy: number;
    cruiseDurationYears: number;
    isNoCruise: boolean;
}

/**
 * ResultPanel — primary 4-zone display + secondary trip breakdown.
 *
 * Primary zones (1 col mobile, 2 cols md+, 4 cols lg+):
 *  1. Earth coordinate time (years)
 *  2. Traveler proper time (years)
 *  3. Dilation factor (γ ≈ X.XX)
 *  4. Effective exhaust velocity (fraction of c + km/s)
 *
 * `durationMode` highlights either the Earth or traveler clock with a
 * blue border + light fill. The other clock stays visible because the
 * headline insight is the divergence between them.
 *
 * Secondary "Trip breakdown" section below the primary grid shows the
 * acceleration distance + duration and cruise distance + duration
 * pulled from the 3-phase decomposition. When `isNoCruise` is true
 * (the acceleration phase alone consumes the budgeted distance), the
 * cruise rows collapse into a single explanatory line.
 *
 * FuelVisualization is rendered separately at the page level — it's
 * conceptually a peer of the trip-time panel, not a zone inside it.
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function ResultPanel({
    durationMode,
    earthTimeYears,
    properTimeYears,
    dilationFactor,
    effectiveExhaustVelocityMps,
    accelerationDistanceLy,
    accelerationDurationYears,
    cruiseDistanceLy,
    cruiseDurationYears,
    isNoCruise,
}: ResultPanelProps) {
    const { t } = useTranslation();

    const earthIsPrimary = durationMode === 'earth';
    const travelerIsPrimary = !earthIsPrimary;

    const formatYears = (years: number) =>
        years.toLocaleString(undefined, { maximumFractionDigits: 2 });

    const formatLy = (ly: number) =>
        ly.toLocaleString(undefined, { maximumFractionDigits: 2 });

    const exhaustVelocityFraction = (
        effectiveExhaustVelocityMps / SPEED_OF_LIGHT
    ).toLocaleString(undefined, { maximumFractionDigits: 4 });

    const exhaustVelocityKmps = (
        effectiveExhaustVelocityMps / 1000
    ).toLocaleString(undefined, { maximumFractionDigits: 0 });

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">
                {t('interstellar.resultPanel.title')}
            </h2>

            {/* Primary zones */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Earth coordinate time */}
                <div
                    className={`rounded-lg border p-4 ${
                        earthIsPrimary
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-neutral-200 bg-white'
                    }`}
                >
                    <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                        {t('interstellar.resultPanel.earthTimeLabel')}
                    </p>
                    <p className="mt-2 font-mono text-3xl font-semibold text-neutral-900">
                        {t('interstellar.resultPanel.yearsFormat', {
                            value: formatYears(earthTimeYears),
                        })}
                    </p>
                </div>

                {/* Traveler proper time */}
                <div
                    className={`rounded-lg border p-4 ${
                        travelerIsPrimary
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-neutral-200 bg-white'
                    }`}
                >
                    <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                        {t('interstellar.resultPanel.properTimeLabel')}
                    </p>
                    <p className="mt-2 font-mono text-3xl font-semibold text-neutral-900">
                        {t('interstellar.resultPanel.yearsFormat', {
                            value: formatYears(properTimeYears),
                        })}
                    </p>
                </div>

                {/* Dilation factor */}
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                        {t('interstellar.resultPanel.dilationLabel')}
                    </p>
                    <p className="mt-2 font-mono text-3xl font-semibold text-neutral-900">
                        {t('interstellar.resultPanel.dilationFormat', {
                            value: dilationFactor.toFixed(2),
                        })}
                    </p>
                </div>

                {/* Effective exhaust velocity */}
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                        {t('interstellar.resultPanel.exhaustVelocityLabel')}
                    </p>
                    <p className="mt-2 font-mono text-3xl font-semibold text-neutral-900">
                        {t('interstellar.resultPanel.exhaustVelocityFormat', {
                            fraction: exhaustVelocityFraction,
                            mps: exhaustVelocityKmps,
                        })}
                    </p>
                </div>
            </div>

            {/* Secondary breakdown */}
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
                <h3 className="text-sm font-semibold tracking-tight text-neutral-700">
                    {t('interstellar.resultPanel.cruiseBreakdownTitle')}
                </h3>
                {isNoCruise ? (
                    <p className="mt-2 text-sm text-neutral-600">
                        {t('interstellar.resultPanel.noCruiseLabel')}
                    </p>
                ) : (
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                            <dt className="text-xs tracking-wide text-neutral-500 uppercase">
                                {t(
                                    'interstellar.resultPanel.accelDistanceLabel',
                                )}
                            </dt>
                            <dd className="font-mono text-base text-neutral-900">
                                {t(
                                    'interstellar.resultPanel.lightYearsFormat',
                                    {
                                        value: formatLy(accelerationDistanceLy),
                                    },
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs tracking-wide text-neutral-500 uppercase">
                                {t(
                                    'interstellar.resultPanel.accelDurationLabel',
                                )}
                            </dt>
                            <dd className="font-mono text-base text-neutral-900">
                                {t('interstellar.resultPanel.yearsFormat', {
                                    value: formatYears(
                                        accelerationDurationYears,
                                    ),
                                })}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs tracking-wide text-neutral-500 uppercase">
                                {t(
                                    'interstellar.resultPanel.cruiseDistanceLabel',
                                )}
                            </dt>
                            <dd className="font-mono text-base text-neutral-900">
                                {t(
                                    'interstellar.resultPanel.lightYearsFormat',
                                    {
                                        value: formatLy(cruiseDistanceLy),
                                    },
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs tracking-wide text-neutral-500 uppercase">
                                {t(
                                    'interstellar.resultPanel.cruiseDurationLabel',
                                )}
                            </dt>
                            <dd className="font-mono text-base text-neutral-900">
                                {t('interstellar.resultPanel.yearsFormat', {
                                    value: formatYears(cruiseDurationYears),
                                })}
                            </dd>
                        </div>
                    </dl>
                )}
            </div>
        </div>
    );
}
