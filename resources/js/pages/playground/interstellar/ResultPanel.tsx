import { useTranslation } from '@/hooks/useTranslation';
import type { Destination } from '@/lib/data/destinations';

interface ResultPanelProps {
    destination: Destination;
    acceleration: number;
    durationMode: 'subjective' | 'earth';
    interfaceMode: 'beginner' | 'math';
}

/**
 * ResultPanel stub. Real result composition lands in P8.T3 (form +
 * result stubs promoted to real interactive components).
 *
 * In production: dilation factor + dual clocks (Earth-frame
 * coordinate time vs ship-frame proper time) + EquationCard with
 * the registry's rocket equations (interstellar-earth-time,
 * interstellar-proper-time — added in P8.T2). Visibility of the
 * EquationCard is gated on interfaceMode === 'math'.
 */
export function ResultPanel({
    destination,
    acceleration,
    durationMode,
    interfaceMode,
}: ResultPanelProps) {
    const { t } = useTranslation();
    // Props captured for type-checking; stub renders placeholder only.
    void destination;
    void acceleration;
    void durationMode;
    void interfaceMode;

    return (
        <div className="rounded border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
            {t('interstellar.resultPanel.placeholderNote')}
        </div>
    );
}
