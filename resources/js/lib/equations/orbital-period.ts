import type { Equation } from './types';

/**
 * Orbital period for a circular orbit at radius `r` and orbital speed `v`:
 *   T = 2π·r / v
 *
 * Given the orbital radius (measured from the center of the central body)
 * and the tangential orbital velocity, returns the time for one complete
 * revolution. Used by the Habitat page to introduce the relationship
 * between orbital geometry and period.
 *
 * PHP twin: App\Equations\Physics\OrbitalPeriod::calculatePeriod
 * (lifted in P2.T2, commit da42dbe). The PHP `calc()` method is bidirectional
 * (solves for T, r, or v); this TS port is forward-only by registry convention.
 * Parity fixture covers (r, v) → T cases only; the inverse cases stay PHP-only.
 */
export const orbitalPeriod: Equation = {
    id: 'orbital-period',
    name: 'Orbital period',
    latex: 'T = \\frac{2 \\pi r}{v}',
    variables: [
        { symbol: 'T', label: 'Orbital period', units: 'seconds' },
        {
            symbol: 'r',
            label: 'Orbital radius',
            units: 'm',
            default: 6.778e6,
            min: 1e3,
            description:
                'Distance from the center of the central body (≈ ISS altitude at default)',
        },
        {
            symbol: 'v',
            label: 'Orbital velocity',
            units: 'm/s',
            default: 7660,
            min: 1,
            description:
                'Tangential speed along the orbit (≈ ISS speed at default)',
        },
    ],
    compute: ({ r, v }) => (2 * Math.PI * r) / v,
};
