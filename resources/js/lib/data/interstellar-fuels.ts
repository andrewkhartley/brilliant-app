/**
 * Interstellar fuel taxonomy — 4 fuels with specific energy and
 * empirical max-velocity ceilings.
 *
 * Mirror of the PHP-side App\Data\InterstellarFuels (lifted in turn
 * from Andrew Hartley's authoritative Undaunted prototype at
 * undaunted-app-2024-08-14/public/assets/js/defaults/Interstellar.js).
 * Re-authored in TS because the Interstellar page now consumes the
 * data client-side via the T4.7 equation ports — PHP not directly
 * importable from the browser bundle.
 *
 * Specific energy values are J/kg (Andrew's original prototype stored
 * MJ/kg; the PHP twin and this TS file both convert to SI J/kg for
 * registry consistency).
 *
 * `comparisonPercent` shows each fuel's specific energy as a
 * percentage of matter-antimatter annihilation — purely a display
 * convenience, not used by any equation compute.
 *
 * `maxVelocityMps` is Andrew's curated empirical ceiling per fuel
 * at 100% efficiency. Brilliant's Phase 8 UI uses this as the
 * MaxSpeedSlider's upper bound when a fuel is selected. NOT derived
 * from first principles — these are display caps from Andrew's
 * authoritative prototype.
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
        maxVelocityMps: 269_800_000,
    },
    {
        id: 'deuterium-tritium',
        name: 'Deuterium-Tritium',
        specificEnergyJoulesPerKg: 3.38e14,
        comparisonPercent: 0.3761,
        maxVelocityMps: 1_341_000,
    },
    {
        id: 'uranium-235',
        name: 'Uranium-235 Isotope',
        specificEnergyJoulesPerKg: 1.44e14,
        comparisonPercent: 0.1602,
        maxVelocityMps: 691_000,
    },
    {
        id: 'natural-uranium',
        name: 'Natural Uranium',
        specificEnergyJoulesPerKg: 8.6e13,
        comparisonPercent: 0.0958,
        maxVelocityMps: 413_000,
    },
];
