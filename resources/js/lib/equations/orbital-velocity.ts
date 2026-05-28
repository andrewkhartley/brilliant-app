import { GRAVITATIONAL_CONSTANT } from '../constants';
import type { Equation } from './types';

/**
 * Orbital velocity for a circular orbit of radius `r` around a body of mass `M`:
 *   v = √(G·M / r)
 *
 * Given the mass of the central body and the orbital radius (measured from
 * the center of that body), returns the tangential speed required to
 * maintain a circular orbit. Used by the Habitat page alongside orbital
 * period to introduce the geometry-speed relationship.
 *
 * PHP twin: App\Equations\Physics\OrbitalVelocity::calculateVelocity
 * (lifted in P2.T2, commit da42dbe). The PHP `calc()` method is bidirectional
 * (solves for v, M, or r); this TS port is forward-only by registry convention.
 * Parity fixture covers (M, r) → v cases only; the inverse cases stay PHP-only.
 *
 * Naming note: PHP uses input keys `'mass'` and `'radius'` (descriptive names),
 * but the registry convention from P3.T1 binds `variables[].symbol` and
 * `compute()`'s destructured keys to the LaTeX symbols verbatim. The LaTeX
 * here is `M` (capital) and `r`, so `compute({ M, r })` uses an uppercase
 * destructured identifier — unusual for JS but correct per convention.
 */
export const orbitalVelocity: Equation = {
    id: 'orbital-velocity',
    name: 'Orbital velocity',
    latex: 'v = \\sqrt{\\frac{G M}{r}}',
    variables: [
        { symbol: 'v', label: 'Orbital velocity', units: 'm/s' },
        {
            symbol: 'M',
            label: 'Mass of central body',
            units: 'kg',
            default: 5.972e24,
            min: 1,
            description: 'Mass of the body being orbited (≈ Earth at default)',
        },
        {
            symbol: 'r',
            label: 'Orbital radius',
            units: 'm',
            default: 6.778e6,
            min: 1e3,
            description:
                'Distance from the center of the central body (≈ ISS altitude at default)',
        },
    ],
    compute: ({ M, r }) => Math.sqrt((GRAVITATIONAL_CONSTANT * M) / r),
};
