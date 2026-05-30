import { SPEED_OF_LIGHT } from '../constants';
import type { Equation } from './types';

/**
 * Earth-frame (coordinate) time for a one-way interstellar trip under
 * constant proper acceleration:
 *   t_earth = √(d²/c² + 4d/a)
 *
 * Models the canonical interstellar trip profile: accelerate at constant
 * proper acceleration `a` from rest to the midpoint at distance `d/2`,
 * then decelerate at `-a` from midpoint to rest at the destination at
 * distance `d`. The `d²/c²` term is the relativistic light-travel floor
 * (you can never beat light over distance `d` in any frame), and the
 * `4d/a` term is the classical kinematic cost of two `d/2` half-trips
 * (since `d/2 = ½·a·(t/2)²` solved for `t` gives `t = 2·√(d/a)`, so
 * `t² = 4d/a`).
 *
 * Companion to `interstellar-proper-time` (traveler's clock for the same
 * trip); `t_earth ≥ t_proper` always, by time dilation. No PHP twin —
 * this equation is Phase 8-specific (P8.T2). Used by the Interstellar
 * experience page's dual-clock display.
 */
export const interstellarEarthTime: Equation = {
    id: 'interstellar-earth-time',
    name: 'Interstellar trip time (Earth frame)',
    latex: 't_{earth} = \\sqrt{\\frac{d^2}{c^2} + \\frac{4 d}{a}}',
    variables: [
        { symbol: 't', label: 'Earth coordinate time', units: 'seconds' },
        {
            symbol: 'd',
            label: 'One-way distance',
            units: 'm',
            default: 4.0114e16,
            min: 1,
            description:
                'Distance from Earth to destination (≈ 4.24 ly to Proxima Centauri at default)',
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
    compute: ({ d, a }) =>
        Math.sqrt((d * d) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT) + (4 * d) / a),
};
