import { SPEED_OF_LIGHT } from '../constants';
import type { Equation } from './types';

/**
 * Interstellar acceleration-phase coordinate duration:
 *   t = (c · v) / √(a²c² − v²a²) = (v / a) · γ
 *
 * Coordinate (Earth-frame) time required to reach a target maximum
 * velocity `v` from rest under constant proper acceleration `a`. The
 * Lorentz factor γ stretches the classical `v/a` Newtonian answer as
 * `v → c`, diverging at `v = c`.
 *
 * PHP twin: App\Equations\Physics\InterstellarAccelerationDuration::calc
 * (parameter keys: `maximumSpeed`, `acceleration`). The parity fixture
 * at tests/fixtures/equations-parity.json verifies this TS port matches
 * the PHP twin to within numeric tolerance for the cases the artisan
 * equations:dump command generates.
 *
 * Lifted from Andrew Hartley's 2024 Undaunted prototype
 * (Interstellar-App.js calcTripDetails — header: "Created by Andrew K.
 * Hartley"). Guards mirror the PHP twin: `v ≥ c` returns `Infinity`.
 */
export const interstellarAccelerationDuration: Equation = {
    id: 'interstellar-acceleration-duration',
    name: 'Interstellar acceleration duration',
    latex: 't = \\frac{c \\cdot v}{\\sqrt{a^{2} c^{2} - v^{2} a^{2}}}',
    variables: [
        {
            symbol: 't',
            label: 'Acceleration-phase coordinate time',
            units: 'seconds',
        },
        {
            symbol: 'v',
            label: 'Target maximum velocity',
            units: 'm/s',
        },
        {
            symbol: 'a',
            label: 'Acceleration',
            units: 'm/s²',
        },
    ],
    compute: ({ v, a }) => {
        if (v >= SPEED_OF_LIGHT) {
            return Infinity;
        }

        const denominator = Math.sqrt(
            a * a * SPEED_OF_LIGHT * SPEED_OF_LIGHT - v * v * a * a,
        );

        if (denominator <= 0) {
            return Infinity;
        }

        return (SPEED_OF_LIGHT * v) / denominator;
    },
};
