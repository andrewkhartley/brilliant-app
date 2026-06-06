import { useTranslation } from '@/hooks/useTranslation';
import { interstellarFuels } from '@/lib/data/interstellar-fuels';

interface FuelSelectorProps {
    fuelId: string;
    onChange: (id: string) => void;
}

/**
 * FuelSelector — dropdown picker for the 4 interstellar fuels.
 *
 * Mirrors DestinationSelect in structure (label + select + hint) so
 * the page reads as a cohesive set of related controls. Each option
 * shows the fuel name + its specific energy as a percentage of
 * matter-antimatter annihilation — that comparison is the headline
 * intuition Andrew's original Undaunted prototype surfaced.
 *
 * Selection lifts via `onChange(id)` to the page; the page then
 * passes the selected fuel's `maxVelocityMps` to MaxSpeedSlider as
 * an upper bound, and the fuel's `specificEnergyJoulesPerKg` into
 * the effective-exhaust-velocity computation.
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function FuelSelector({ fuelId, onChange }: FuelSelectorProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-2 rounded-lg border border-cyan-100/15 bg-slate-950/72 p-4 backdrop-blur-md">
            <label
                htmlFor="fuel-select"
                className="block text-sm font-semibold text-cyan-100"
            >
                {t('interstellar.fuelSelector.label')}
            </label>
            <div className="relative">
                <select
                    id="fuel-select"
                    value={fuelId}
                    onChange={(event) => onChange(event.target.value)}
                    aria-label={t('interstellar.fuelSelector.ariaLabel')}
                    className="block w-full cursor-pointer appearance-none rounded border border-cyan-100/25 bg-slate-950/80 py-2 ps-3 pe-14 text-base text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                >
                    {interstellarFuels.map((fuel) => (
                        <option key={fuel.id} value={fuel.id}>
                            {t('interstellar.fuelSelector.optionFormat', {
                                name: fuel.name,
                                percent:
                                    fuel.comparisonPercent.toLocaleString(
                                        undefined,
                                        { maximumFractionDigits: 4 },
                                    ),
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
                {t('interstellar.fuelSelector.hint')}
            </p>
        </div>
    );
}
