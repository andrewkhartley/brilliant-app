<?php

namespace App\Data;

/**
 * Interstellar fuel taxonomy — 4 fuels with specific energy and
 * empirical max-velocity ceilings.
 *
 * Data lifted verbatim from Andrew Hartley's authoritative Undaunted
 * prototype at:
 * undaunted-app-2024-08-14/public/assets/js/defaults/Interstellar.js
 *
 * Specific energy values (`specificEnergyJoulesPerKg`) are derived
 * from the original `size` field by multiplying by 10⁶ (Andrew stored
 * the values in MJ/kg; we use J/kg for SI consistency with the rest
 * of the registry).
 *
 * The `comparisonPercent` field shows each fuel's specific energy as
 * a percentage of matter-antimatter annihilation, matching Andrew's
 * original UI display.
 *
 * The `maxVelocityMps` field is the empirical maximum velocity Andrew
 * chose to surface in his UI at 100% efficiency. These are NOT derived
 * from first principles in his source — they're his curated display
 * caps. Brilliant's Phase 8 UI uses these as slider upper bounds when
 * a fuel is selected.
 */
class InterstellarFuels
{
    /**
     * @return array<int, array{
     *     id: string,
     *     name: string,
     *     specificEnergyJoulesPerKg: float,
     *     comparisonPercent: float,
     *     maxVelocityMps: float,
     * }>
     */
    public static function all(): array
    {
        return [
            [
                'id' => 'matter-antimatter',
                'name' => 'Matter-Antimatter',
                'specificEnergyJoulesPerKg' => 8.9875517874e16,
                'comparisonPercent' => 100.00,
                'maxVelocityMps' => 269_800_000.0,
            ],
            [
                'id' => 'deuterium-tritium',
                'name' => 'Deuterium-Tritium',
                'specificEnergyJoulesPerKg' => 3.38e14,
                'comparisonPercent' => 0.3761,
                'maxVelocityMps' => 1_341_000.0,
            ],
            [
                'id' => 'uranium-235',
                'name' => 'Uranium-235 Isotope',
                'specificEnergyJoulesPerKg' => 1.44e14,
                'comparisonPercent' => 0.1602,
                'maxVelocityMps' => 691_000.0,
            ],
            [
                'id' => 'natural-uranium',
                'name' => 'Natural Uranium',
                'specificEnergyJoulesPerKg' => 8.6e13,
                'comparisonPercent' => 0.0958,
                'maxVelocityMps' => 413_000.0,
            ],
        ];
    }
}
