import { SPEED_OF_LIGHT } from '../constants';
import type { Equation } from './types';

/**
 * Traveler-frame (proper) time for a one-way interstellar trip under
 * constant proper acceleration:
 *   t_proper = (2c/a) · arccosh(1 + a·d/(2c²))
 *
 * Models the same trip profile as `interstellar-earth-time` —
 * accelerate at proper acceleration `a` from rest to the midpoint at
 * `d/2`, then decelerate to rest at the destination at `d` — but
 * measured by a clock co-moving with the rocket. This is the clock
 * the crew ages by.
 *
 * The arccosh expression collapses to ≈ √(2d/a) at low `d` (classical
 * kinematics) and grows only logarithmically as `d → ∞`, which is what
 * makes 1g constant-acceleration trips to even distant galaxies feel
 * survivable on board (≈ 29 years to Andromeda, 2.5M Earth years).
 * The Earth/proper-time divergence is the relativistic time dilation
 * the experience page surfaces with its dual-clock display.
 *
 * `t_proper ≤ t_earth` always (verified by parity tests).
 * No PHP twin — Phase 8-specific (P8.T2).
 */
export const interstellarProperTime: Equation = {
    id: 'interstellar-proper-time',
    name: 'Interstellar trip time (traveler frame)',
    latex: 't_{proper} = \\frac{2c}{a} \\, \\operatorname{arccosh}\\!\\left(1 + \\frac{a \\cdot d}{2 c^2}\\right)',
    variables: [
        { symbol: 't', label: 'Traveler proper time', units: 'seconds' },
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
        ((2 * SPEED_OF_LIGHT) / a) *
        Math.acosh(1 + (a * d) / (2 * SPEED_OF_LIGHT * SPEED_OF_LIGHT)),
};
