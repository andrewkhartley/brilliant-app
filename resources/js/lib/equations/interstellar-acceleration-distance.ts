import { SPEED_OF_LIGHT } from '../constants';
import type { Equation } from './types';

/**
 * Interstellar acceleration-phase coordinate distance:
 *   d = (c² / a) · (√(1 + (a · t / c)²) − 1)
 *
 * Coordinate (Earth-frame) distance covered during the acceleration
 * phase, given proper acceleration `a` and the coordinate duration
 * `t` of the acceleration burn. Reduces to the Newtonian ½·a·t² at
 * low velocities; diverges linearly with `t` at relativistic speeds.
 *
 * PHP twin: App\Equations\Physics\InterstellarAccelerationDistance::calc
 * (parameter keys: `acceleration`, `duration`). The parity fixture at
 * tests/fixtures/equations-parity.json verifies this TS port matches
 * the PHP twin to within numeric tolerance for the cases the artisan
 * equations:dump command generates.
 *
 * Lifted from Andrew Hartley's 2024 Undaunted prototype
 * (Interstellar-App.js calcTripDetails — header: "Created by Andrew K.
 * Hartley").
 */
export const interstellarAccelerationDistance: Equation = {
    id: 'interstellar-acceleration-distance',
    name: 'Interstellar acceleration distance',
    latex: 'd = \\frac{c^{2}}{a} \\left( \\sqrt{1 + \\left(\\frac{a \\cdot t}{c}\\right)^{2}} - 1 \\right)',
    variables: [
        {
            symbol: 'd',
            label: 'Acceleration-phase coordinate distance',
            units: 'm',
        },
        {
            symbol: 'a',
            label: 'Acceleration',
            units: 'm/s²',
        },
        {
            symbol: 't',
            label: 'Acceleration-phase coordinate duration',
            units: 'seconds',
        },
    ],
    compute: ({ a, t }) => {
        if (a <= 0) {
            return NaN;
        }

        const at = a * t;

        return (
            ((SPEED_OF_LIGHT * SPEED_OF_LIGHT) / a) *
            (Math.sqrt(1 + (at * at) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT)) - 1)
        );
    },
};
