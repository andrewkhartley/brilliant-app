import { useTranslation } from '@/hooks/useTranslation';
import { destinations } from '@/lib/data/destinations';

interface DestinationSelectProps {
    destinationId: string;
    onChange: (id: string) => void;
}

/**
 * DestinationSelect — dropdown picker for the 5 interstellar destinations.
 *
 * Each option label is composed via the `optionFormat` translation key so
 * the "name (distance ly)" punctuation/ordering can be localized rather
 * than baked into JSX. `t()` returns a string, which dodges the
 * `react/jsx-no-literals` rule cleanly (the rule fires on literal text
 * nodes, not on string expressions).
 *
 * Selection lifts via `onChange(id)` to the page's `destinationId`
 * state — that state drives the ResultPanel + FuelVisualization
 * recompute via props.
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function DestinationSelect({
    destinationId,
    onChange,
}: DestinationSelectProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-2 rounded-lg border border-cyan-100/15 bg-slate-950/72 p-4 backdrop-blur-md">
            <label
                htmlFor="destination-select"
                className="block text-sm font-semibold text-cyan-100"
            >
                {t('interstellar.destinationSelect.label')}
            </label>
            <div className="relative">
                <select
                    id="destination-select"
                    value={destinationId}
                    onChange={(event) => onChange(event.target.value)}
                    aria-label={t('interstellar.destinationSelect.ariaLabel')}
                    className="block w-full cursor-pointer appearance-none rounded border border-cyan-100/25 bg-slate-950/80 py-2 ps-3 pe-14 text-base text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                >
                    {destinations.map((destination) => (
                        <option key={destination.id} value={destination.id}>
                            {t('interstellar.destinationSelect.optionFormat', {
                                name: destination.name,
                                distance:
                                    destination.distanceLy.toLocaleString(),
                            })}
                        </option>
                    ))}
                </select>
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 end-4 size-2.5 -translate-y-1/2 rotate-45 border-r-2 border-b-2 border-cyan-200/78"
                />
            </div>
            <p className="text-xs text-cyan-100/58">
                {t('interstellar.destinationSelect.hint')}
            </p>
        </div>
    );
}
