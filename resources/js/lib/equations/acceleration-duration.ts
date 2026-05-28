import { SPEED_OF_LIGHT } from '../constants';
import type { Equation } from './types';

/**
 * Acceleration duration to traverse a distance `d` under constant proper
 * acceleration `a`:
 *   t = √(d²/c² + 2d/a)
 *
 * Combines two physical regimes in a single closed form: the `d²/c²` term
 * is the relativistic light-travel floor (you can never beat light), and
 * the `2d/a` term is the classical kinematic `d = ½at²` solved for `t`.
 * At low speeds the relativistic term is negligible and the equation
 * reduces to the familiar `t = √(2d/a)`. Used by the Interstellar travel
 * agency (Phase 8) and as the algebraic capstone of the Habitat physics
 * tour.
 *
 * PHP twin: App\Equations\Physics\AccelerationDuration::calculateDuration
 * (lifted in P2.T2, commit da42dbe). The PHP `calc()` method is bidirectional
 * (solves for t, d, or a); this TS port is forward-only by registry convention.
 * Parity fixture covers (d, a) → t cases only; the inverse cases stay PHP-only.
 */
export const accelerationDuration: Equation = {
    id: 'acceleration-duration',
    name: 'Acceleration duration',
    latex: 't = \\sqrt{\\frac{d^2}{c^2} + \\frac{2 d}{a}}',
    variables: [
        { symbol: 't', label: 'Acceleration duration', units: 'seconds' },
        {
            symbol: 'd',
            label: 'Acceleration distance',
            units: 'm',
            default: 3.844e8,
            min: 1,
            description:
                'Distance traversed under constant acceleration (≈ Earth–Moon at default)',
        },
        {
            symbol: 'a',
            label: 'Acceleration',
            units: 'm/s²',
            default: 9.80665,
            min: 0.1,
            max: 100,
            step: 0.1,
            description: 'Constant proper acceleration (≈ 1g at default)',
        },
    ],
    compute: ({ d, a }) => {
        const relativistic = (d * d) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT);
        const classical = (2 * d) / a;

        return Math.sqrt(relativistic + classical);
    },
};
