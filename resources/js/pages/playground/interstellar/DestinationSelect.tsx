import { useTranslation } from '@/hooks/useTranslation';

interface DestinationSelectProps {
    destinationId: string;
    onChange: (id: string) => void;
}

/**
 * DestinationSelect stub. Real dropdown picker lands in P8.T3
 * (form + result stubs promoted to real interactive components).
 *
 * In production: a labeled <select> bound to the destinations
 * registry; selection drives the ResultPanel + FuelVisualization
 * via lifted page state.
 */
export function DestinationSelect({
    destinationId,
    onChange,
}: DestinationSelectProps) {
    const { t } = useTranslation();
    // Props captured for type-checking; stub renders placeholder only.
    void destinationId;
    void onChange;

    return (
        <div className="rounded border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
            {t('interstellar.destinationSelect.placeholderNote')}
        </div>
    );
}
