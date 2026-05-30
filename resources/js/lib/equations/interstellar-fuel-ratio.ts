import { SPEED_OF_LIGHT } from '../constants';
import type { Equation } from './types';

/**
 * Initial-to-final mass ratio for an ideal photon rocket reaching peak
 * velocity `v` at the trip midpoint, under the canonical interstellar
 * trip profile (accelerate to midpoint, decelerate to destination):
 *   m₀/m₁ = (1 + v/c) / (1 - v/c)
 *
 * This is the relativistic rocket equation specialized to exhaust
 * velocity `v_e = c` (the photon-rocket limit — the most fuel-efficient
 * rocket physically allowed) and to the symmetric accelerate-then-
 * decelerate one-way trip. The peak velocity `v` is computed externally
 * from `interstellar-earth-time` and the trip kinematics; this equation
 * just turns that `v` into the fuel ratio it implies.
 *
 * Diverges as `v → c` — which is why interstellar travel at large
 * `v/c` is brutal even in the most generous physics. For a round
 * trip (out + back) the ratio squares; the Interstellar page surfaces
 * that ouch separately.
 *
 * Asymptotic guard: returns `Infinity` for `v ≥ c` rather than
 * propagating NaN or a negative ratio. No PHP twin — Phase 8-specific
 * (P8.T2). Drives the "fuel-equivalent" display on the Interstellar
 * experience page.
 */
export const interstellarFuelRatio: Equation = {
    id: 'interstellar-fuel-ratio',
    name: 'Photon-rocket fuel mass ratio',
    latex: '\\frac{m_0}{m_1} = \\frac{1 + v/c}{1 - v/c}',
    variables: [
        {
            symbol: 'massRatio',
            label: 'Initial-to-final mass ratio',
            units: 'dimensionless',
        },
        {
            symbol: 'v',
            label: 'Peak velocity',
            units: 'm/s',
            default: 0.5 * SPEED_OF_LIGHT,
            min: 0,
            max: SPEED_OF_LIGHT,
            description:
                'Peak velocity reached at the trip midpoint (asymptotic at c)',
        },
    ],
    compute: ({ v }) => {
        const beta = v / SPEED_OF_LIGHT;

        if (beta >= 1) {
            return Infinity;
        }

        return (1 + beta) / (1 - beta);
    },
};
