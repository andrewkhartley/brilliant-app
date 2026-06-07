import { useTranslation } from '@/hooks/useTranslation';
import { SPEED_OF_LIGHT } from '@/lib/constants';

interface ResultPanelProps {
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
        <div className="space-y-6 rounded-lg border border-cyan-100/20 bg-slate-950/78 p-5 shadow-2xl shadow-black/35 backdrop-blur-md sm:p-7">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
                {t('interstellar.resultPanel.title')}
            </h2>

            <div className="rounded-lg border border-cyan-100/15 bg-cyan-50/8 p-4">
                <h3 className="text-sm font-semibold tracking-tight text-cyan-100">
                    {t('interstellar.resultPanel.cruiseBreakdownTitle')}
                </h3>
                {isNoCruise ? (
                    <p className="mt-2 text-sm text-cyan-100/78">
                        {t('interstellar.resultPanel.noCruiseLabel')}
                    </p>
                ) : (
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                            <dt className="text-xs font-medium tracking-wide text-cyan-100/58 uppercase">
                                {t(
                                    'interstellar.resultPanel.accelDistanceLabel',
                                )}
                            </dt>
                            <dd className="font-mono text-base text-white">
                                {t(
                                    'interstellar.resultPanel.lightYearsFormat',
                                    {
                                        value: formatLy(accelerationDistanceLy),
                                    },
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium tracking-wide text-cyan-100/58 uppercase">
                                {t(
                                    'interstellar.resultPanel.accelDurationLabel',
                                )}
                            </dt>
                            <dd className="font-mono text-base text-white">
                                {t('interstellar.resultPanel.yearsFormat', {
                                    value: formatYears(
                                        accelerationDurationYears,
                                    ),
                                })}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium tracking-wide text-cyan-100/58 uppercase">
                                {t(
                                    'interstellar.resultPanel.cruiseDistanceLabel',
                                )}
                            </dt>
                            <dd className="font-mono text-base text-white">
                                {t(
                                    'interstellar.resultPanel.lightYearsFormat',
                                    {
                                        value: formatLy(cruiseDistanceLy),
                                    },
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium tracking-wide text-cyan-100/58 uppercase">
                                {t(
                                    'interstellar.resultPanel.cruiseDurationLabel',
                                )}
                            </dt>
                            <dd className="font-mono text-base text-white">
                                {t('interstellar.resultPanel.yearsFormat', {
                                    value: formatYears(cruiseDurationYears),
                                })}
                            </dd>
                        </div>
                    </dl>
                )}
            </div>

            <div className="rounded-lg border border-cyan-100/15 bg-cyan-50/8 p-4">
                <h3 className="text-sm font-semibold tracking-tight text-cyan-100">
                    {t('interstellar.resultPanel.relativityTitle')}
                </h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                        <dt className="text-xs font-medium tracking-wide text-cyan-100/58 uppercase">
                            {t('interstellar.resultPanel.earthTimeLabel')}
                        </dt>
                        <dd className="font-mono text-base text-white">
                            {t('interstellar.resultPanel.yearsFormat', {
                                value: formatYears(earthTimeYears),
                            })}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-medium tracking-wide text-cyan-100/58 uppercase">
                            {t('interstellar.resultPanel.properTimeLabel')}
                        </dt>
                        <dd className="font-mono text-base text-white">
                            {t('interstellar.resultPanel.yearsFormat', {
                                value: formatYears(properTimeYears),
                            })}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-medium tracking-wide text-cyan-100/58 uppercase">
                            {t('interstellar.resultPanel.dilationLabel')}
                        </dt>
                        <dd className="font-mono text-base text-white">
                            {t('interstellar.resultPanel.dilationFormat', {
                                value: dilationFactor.toFixed(2),
                            })}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-medium tracking-wide text-cyan-100/58 uppercase">
                            {t(
                                'interstellar.resultPanel.exhaustVelocityLabel',
                            )}
                        </dt>
                        <dd className="font-mono text-base text-white">
                            {t('interstellar.resultPanel.exhaustVelocityFormat', {
                                fraction: exhaustVelocityFraction,
                                mps: exhaustVelocityKmps,
                            })}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
