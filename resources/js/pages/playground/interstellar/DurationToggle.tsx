import { useTranslation } from '@/hooks/useTranslation';

interface DurationToggleProps {
    mode: 'subjective' | 'earth';
    onChange: (mode: 'subjective' | 'earth') => void;
}

/**
 * DurationToggle stub. Real toggle lands in P8.T3 (form + result
 * stubs promoted to real interactive components).
 *
 * In production: a two-state toggle that highlights which clock
 * (subjective/proper time aboard the ship, or Earth/coordinate
 * time) is treated as the primary result in the ResultPanel.
 */
export function DurationToggle({ mode, onChange }: DurationToggleProps) {
    const { t } = useTranslation();
    // Props captured for type-checking; stub renders placeholder only.
    void mode;
    void onChange;

    return (
        <div className="rounded border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
            {t('interstellar.durationToggle.placeholderNote')}
        </div>
    );
}
