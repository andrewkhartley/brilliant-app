import { useTranslation } from '@/hooks/useTranslation';
import type { Destination } from '@/lib/data/destinations';

interface FuelVisualizationProps {
    destination: Destination;
    acceleration: number;
}

/**
 * FuelVisualization stub. Real visualization lands in P8.T4 (mode
 * toggle behavior + fuel-equivalent visualization).
 *
 * In production: mass-ratio text ("requires X kg of fuel per kg of
 * payload") + a horizontal bar visualization driven by the
 * registry's interstellar-mass-ratio equation (added in P8.T2).
 */
export function FuelVisualization({
    destination,
    acceleration,
}: FuelVisualizationProps) {
    const { t } = useTranslation();
    // Props captured for type-checking; stub renders placeholder only.
    void destination;
    void acceleration;

    return (
        <div className="rounded border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
            {t('interstellar.fuelVisualization.placeholderNote')}
        </div>
    );
}
