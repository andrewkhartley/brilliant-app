import { SliderInput } from '@/components/equations/SliderInput';
import { useTranslation } from '@/hooks/useTranslation';

interface EfficiencySliderProps {
    efficiency: number;
    onChange: (value: number) => void;
}

/**
 * EfficiencySlider — picks the energy-conversion efficiency η ∈ (0, 1]
 * fed into the effective-exhaust-velocity equation.
 *
 * Range 0.01 → 1.0 (1% → 100%), step 0.01. The slider stores η as a
 * decimal (0.5 = 50%), display formats it as a percentage. 100% is
 * the physics-perfect cap; even matter-antimatter doesn't actually
 * reach it in practice — Andrew's prototype let the user push it
 * there anyway to make the asymptote visible.
 *
 * Hint text below explains what efficiency means physically — a
 * stub of the same explanation we'll surface in the v2 EquationCard
 * for InterstellarEffectiveExhaustVelocity.
 */
export function EfficiencySlider({
    efficiency,
    onChange,
}: EfficiencySliderProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-2">
            <SliderInput
                id="efficiency-slider"
                label={t('interstellar.efficiencySlider.label')}
                min={0.01}
                max={1.0}
                step={0.01}
                value={efficiency}
                onChange={onChange}
                formatValue={(v) =>
                    t('interstellar.efficiencySlider.valueFormat', {
                        value: (v * 100).toFixed(0),
                    })
                }
                formatAriaValueText={(v) =>
                    t('interstellar.efficiencySlider.ariaValueText', {
                        value: (v * 100).toFixed(0),
                    })
                }
            />
            <p className="text-xs text-neutral-500">
                {t('interstellar.efficiencySlider.hint')}
            </p>
        </div>
    );
}
