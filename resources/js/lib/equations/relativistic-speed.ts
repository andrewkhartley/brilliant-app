import { SPEED_OF_LIGHT } from '../constants';
import type { Equation } from './types';

/**
 * Relativistic speed under constant proper acceleration:
 *   v = a·t / √(1 + (a·t/c)²)
 *
 * Given a constant proper acceleration `a` applied for coordinate time `t`,
 * computes the resulting speed `v` in the rest frame, capped asymptotically
 * by the speed of light. Used by the Interstellar travel agency (Phase 8).
 *
 * PHP twin: App\Equations\Physics\RelativisticSpeed::calculateMaximumSpeed
 * (lifted in P2.T2, commit da42dbe). The PHP `calc()` method is bidirectional
 * (solves for v, a, or t); this TS port is forward-only by registry convention.
 * Parity fixture covers (a, t) → v cases only; the inverse cases stay PHP-only.
 */
export const relativisticSpeed: Equation = {
    id: 'relativistic-speed',
    name: 'Relativistic speed',
    latex: 'v = \\frac{a \\cdot t}{\\sqrt{1 + \\left(\\frac{a \\cdot t}{c}\\right)^2}}',
    variables: [
        { symbol: 'v', label: 'Maximum speed', units: 'm/s' },
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
        {
            symbol: 't',
            label: 'Acceleration duration',
            units: 'seconds',
            default: 86_400,
            min: 1,
            description: 'How long the acceleration is sustained',
        },
    ],
    compute: ({ a, t }) => {
        const at = a * t;

        return at / Math.sqrt(1 + (at / SPEED_OF_LIGHT) ** 2);
    },
};
