/**
 * Interstellar fuel taxonomy: 4 fuels with specific energy and practical
 * max-velocity ceilings.
 *
 * Mirror of the PHP-side App\Data\InterstellarFuels. Specific energy values
 * are J/kg; Andrew's original Undaunted prototype stored these as MJ/kg.
 *
 * `comparisonPercent` shows each fuel's specific energy as a percentage of
 * matter-antimatter annihilation for display.
 *
 * `maxVelocityMps` is the practical cruise-speed ceiling surfaced in the UI.
 * Matter-antimatter is capped at 25% c because the mass ratio becomes
 * unreasonable before the theoretical limit near 33% c. The lower-energy
 * fuels are capped below their prior hard limits for the same "still useful
 * to reason about" purpose, so switching fuels clearly changes the slider.
 */

export interface InterstellarFuel {
    id: string;
    name: string;
    specificEnergyJoulesPerKg: number;
    comparisonPercent: number;
    maxVelocityMps: number;
}

export const interstellarFuels: readonly InterstellarFuel[] = [
    {
        id: 'matter-antimatter',
        name: 'Matter-Antimatter',
        specificEnergyJoulesPerKg: 8.9875517874e16,
        comparisonPercent: 100.0,
        maxVelocityMps: 74_948_114,
    },
    {
        id: 'deuterium-tritium',
        name: 'Deuterium-Tritium',
        specificEnergyJoulesPerKg: 3.38e14,
        comparisonPercent: 0.3761,
        maxVelocityMps: 1_005_750,
    },
    {
        id: 'uranium-235',
        name: 'Uranium-235 Isotope',
        specificEnergyJoulesPerKg: 1.44e14,
        comparisonPercent: 0.1602,
        maxVelocityMps: 518_250,
    },
    {
        id: 'natural-uranium',
        name: 'Natural Uranium',
        specificEnergyJoulesPerKg: 8.6e13,
        comparisonPercent: 0.0958,
        maxVelocityMps: 309_750,
    },
];
