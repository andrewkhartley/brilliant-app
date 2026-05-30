import { SPEED_OF_LIGHT } from '../constants';
import type { Equation } from './types';

/**
 * Interstellar proper time during the acceleration phase:
 *   τ = (c / a) · arcsinh(a · t / c)
 *
 * Proper (traveler) time experienced onboard the ship during the
 * acceleration phase, given the coordinate (Earth-frame) duration `t`
 * and proper acceleration `a`. Grows only logarithmically with `t` at
 * relativistic speeds — this is what makes 1g constant-acceleration
 * trips feel survivable on board even over cosmological distances.
 *
 * PHP twin: App\Equations\Physics\InterstellarProperTimeAcceleration::calc
 * (parameter keys: `acceleration`, `duration`). The parity fixture at
 * tests/fixtures/equations-parity.json verifies this TS port matches
 * the PHP twin to within numeric tolerance for the cases the artisan
 * equations:dump command generates.
 *
 * Lifted from Andrew Hartley's 2024 Undaunted prototype
 * (Interstellar-App.js calcTripDetails — header: "Created by Andrew K.
 * Hartley"). JS exposes Math.asinh, matching PHP's asinh().
 */
export const interstellarProperTimeAcceleration: Equation = {
    id: 'interstellar-proper-time-acceleration',
    name: 'Interstellar proper time (acceleration phase)',
    latex: '\\tau = \\frac{c}{a} \\cdot \\operatorname{arcsinh}\\!\\left(\\frac{a \\cdot t}{c}\\right)',
    variables: [
        {
            symbol: 'τ',
            label: 'Proper time during acceleration',
            units: 'seconds',
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

        return (SPEED_OF_LIGHT / a) * Math.asinh((a * t) / SPEED_OF_LIGHT);
    },
};
