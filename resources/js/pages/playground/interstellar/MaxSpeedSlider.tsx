import { SliderInput } from '@/components/equations/SliderInput';
import { useTranslation } from '@/hooks/useTranslation';
import { SPEED_OF_LIGHT } from '@/lib/constants';

interface MaxSpeedSliderProps {
    maxSpeed: number;
    fuelMaxVelocityMps: number;
    onChange: (value: number) => void;
}

/**
 * MaxSpeedSlider — picks the cruise speed cap v_max fed into both
 * the trip-duration equations and the Δv fuel budget.
 *
 * The slider's upper bound is set by the selected fuel's
 * `maxVelocityMps` (Andrew's curated empirical ceiling per fuel).
 * When the user switches to a lower-energy fuel, the parent page
 * clamps `maxSpeed` to the new ceiling before re-rendering this
 * slider — preserves invariant "slider value ≤ slider max".
 *
 * Step size adapts to the fuel ceiling: small fuels (Uranium @
 * ~400 km/s) want fine grain, antimatter (@ ~0.9c) wants coarse.
 * Uses 1/200th of the max as a heuristic step, rounded to a
 * meaningful integer.
 *
 * Display shows both km/s (visible scale) and percent of c
 * (relativity context). Logical Tailwind classes only.
 */
export function MaxSpeedSlider({
    maxSpeed,
    fuelMaxVelocityMps,
    onChange,
}: MaxSpeedSliderProps) {
    const { t } = useTranslation();

    // Heuristic step: ~200 ticks across the range. Round to keep the
    // slider's "tick to integer kmps" behavior intuitive.
    const step = Math.max(1, Math.round(fuelMaxVelocityMps / 200));

    return (
        <div className="space-y-2">
            <SliderInput
                id="max-speed-slider"
                label={t('interstellar.maxSpeedSlider.label')}
                min={step}
                max={fuelMaxVelocityMps}
                step={step}
                value={maxSpeed}
                onChange={onChange}
                formatValue={(v) =>
                    t('interstellar.maxSpeedSlider.valueFormat', {
                        value: (v / 1000).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                        }),
                        c: ((v / SPEED_OF_LIGHT) * 100).toLocaleString(
                            undefined,
                            { maximumFractionDigits: 2 },
                        ),
                    })
                }
                formatAriaValueText={(v) =>
                    t('interstellar.maxSpeedSlider.ariaValueText', {
                        value: (v / 1000).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                        }),
                    })
                }
            />
            <p className="text-xs text-neutral-500">
                {t('interstellar.maxSpeedSlider.hint')}
            </p>
        </div>
    );
}
