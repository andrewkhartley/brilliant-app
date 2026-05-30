import { useTranslation } from '@/hooks/useTranslation';
import type { Destination } from '@/lib/data/destinations';

import { FuelVisualization } from './FuelVisualization';

interface ResultPanelProps {
    destination: Destination;
    acceleration: number;
    durationMode: 'subjective' | 'earth';
    interfaceMode: 'beginner' | 'math';
    earthTimeYears: number;
    properTimeYears: number;
    dilationFactor: number;
    peakVelocityMps: number;
}

/**
 * ResultPanel — 4-zone display of the trip's computed values.
 *
 * Zones (1 col mobile, 2 cols md+):
 *  1. Dilation factor (γ ≈ X.XX)
 *  2. Earth coordinate time (years)
 *  3. Traveler proper time (years)
 *  4. Fuel-equivalent visualization (delegated to FuelVisualization;
 *     stub in T3, real in T4 — props pass through unchanged)
 *
 * `durationMode` highlights either the Earth or traveler clock with a
 * blue border + light fill. The other clock stays visible but reads as
 * secondary — both numbers are always on screen because the headline
 * insight is the divergence between them.
 *
 * `interfaceMode` and `peakVelocityMps` are accepted for future use
 * (T4 may surface peak velocity in the Just-the-math view); the panel's
 * current layout doesn't branch on them, so they're captured via `void`
 * to keep TypeScript happy without inventing UI that isn't specified.
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function ResultPanel({
    destination,
    acceleration,
    durationMode,
    interfaceMode,
    earthTimeYears,
    properTimeYears,
    dilationFactor,
    peakVelocityMps,
}: ResultPanelProps) {
    const { t } = useTranslation();
    void interfaceMode;
    void peakVelocityMps;

    const earthIsPrimary = durationMode === 'earth';
    const travelerIsPrimary = !earthIsPrimary;

    const formatYears = (years: number) =>
        years.toLocaleString(undefined, { maximumFractionDigits: 2 });

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">
                {t('interstellar.resultPanel.title')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
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

                {/* Fuel-equivalent visualization (real in T4) */}
                <FuelVisualization
                    destination={destination}
                    acceleration={acceleration}
                />
            </div>
        </div>
    );
}
