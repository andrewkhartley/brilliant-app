import { useTranslation } from '@/hooks/useTranslation';

interface FuelVisualizationProps {
    massRatio: number;
}

/**
 * FuelVisualization — mass-ratio numeric + horizontal bar.
 *
 * The mass ratio m_initial / m_final is the headline number from the
 * relativistic Tsiolkovsky equation. For Δv ≪ c with antimatter fuel
 * it stays near 1× — manageable. For Δv ≈ c with chemical or fission
 * fuel it explodes into thousands or to infinity. The bar lets the
 * user feel the asymptote.
 *
 * Scale: bar maps mass ratio 1× → 0% width, 100× → 100% width, with
 * the bar capped at 100% even when ratio > 100. Above 100× shows
 * the visual saturation plus a numeric callout. At infinity (Δv ≥ c)
 * the bar fills + the "off the chart" label replaces the number.
 *
 * Accessibility: `role="img"` + an `aria-label` describing the ratio
 * numerically, so screen readers don't try to traverse the decorative
 * bar's children.
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function FuelVisualization({ massRatio }: FuelVisualizationProps) {
    const { t } = useTranslation();

    const isOffChart = !Number.isFinite(massRatio);
    // Bar mapping: 1× → 0%, 100× → 100%, capped above.
    const barPercent = isOffChart
        ? 100
        : Math.min(100, Math.max(0, ((massRatio - 1) / 99) * 100));

    const formattedRatio = isOffChart
        ? null
        : massRatio.toLocaleString(undefined, {
              maximumFractionDigits: 2,
          });

    const ariaLabel = isOffChart
        ? t('interstellar.fuelVisualization.offChartLabel')
        : t('interstellar.fuelVisualization.ariaLabel', {
              value: formattedRatio ?? '',
          });

    return (
        <div className="space-y-2 rounded-lg border border-cyan-100/15 bg-slate-950/72 p-4 backdrop-blur-md">
            <p className="text-xs font-bold tracking-[0.18em] text-cyan-200/70 uppercase">
                {t('interstellar.fuelVisualization.title')}
            </p>
            <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-cyan-100/78">
                    {t('interstellar.fuelVisualization.massRatioLabel')}
                </span>
                <span className="font-mono text-2xl font-semibold text-white">
                    {isOffChart
                        ? t('interstellar.fuelVisualization.offChartLabel')
                        : t('interstellar.fuelVisualization.massRatioFormat', {
                              value: formattedRatio ?? '',
                          })}
                </span>
            </div>
            <div
                role="img"
                aria-label={ariaLabel}
                className="h-3 w-full overflow-hidden rounded-full bg-slate-900/80 ring-1 ring-cyan-100/15"
            >
                <div
                    className={`h-full rounded-full transition-all ${
                        isOffChart
                            ? 'bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.45)]'
                            : 'bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.4)]'
                    }`}
                    style={{ width: `${barPercent}%` }}
                />
            </div>
            <p className="text-xs text-cyan-100/58">
                {t('interstellar.fuelVisualization.caption')}
            </p>
        </div>
    );
}
