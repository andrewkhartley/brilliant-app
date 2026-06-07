<?php

namespace App\Data;

/**
 * Interstellar fuel taxonomy: 4 fuels with specific energy and practical
 * max-velocity ceilings.
 *
 * Specific energy values (`specificEnergyJoulesPerKg`) are derived from
 * Andrew's Undaunted prototype by converting MJ/kg to J/kg.
 *
 * The `comparisonPercent` field shows each fuel's specific energy as a
 * percentage of matter-antimatter annihilation.
 *
 * The `maxVelocityMps` field is the practical cruise-speed ceiling surfaced
 * in the UI. Matter-antimatter is capped at 25% c because the mass ratio
 * becomes unreasonable before the theoretical limit near 33% c. Lower-energy
 * fuels are capped below their prior hard limits so switching fuels clearly
 * changes the slider.
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
                'maxVelocityMps' => 74_948_114.0,
            ],
            [
                'id' => 'deuterium-tritium',
                'name' => 'Deuterium-Tritium',
                'specificEnergyJoulesPerKg' => 3.38e14,
                'comparisonPercent' => 0.3761,
                'maxVelocityMps' => 1_005_750.0,
            ],
            [
                'id' => 'uranium-235',
                'name' => 'Uranium-235 Isotope',
                'specificEnergyJoulesPerKg' => 1.44e14,
                'comparisonPercent' => 0.1602,
                'maxVelocityMps' => 518_250.0,
            ],
            [
                'id' => 'natural-uranium',
                'name' => 'Natural Uranium',
                'specificEnergyJoulesPerKg' => 8.6e13,
                'comparisonPercent' => 0.0958,
                'maxVelocityMps' => 309_750.0,
            ],
        ];
    }
}
