import { SPEED_OF_LIGHT } from '../constants';
import type { Equation } from './types';

/**
 * Interstellar proper time during the cruise phase:
 *   τ = (d / v) · √(1 − v² / c²) = (d / v) / γ
 *
 * Proper (traveler) time experienced during the constant-velocity
 * cruise phase, given cruise distance `d` and cruise velocity `v`.
 * Approaches the Newtonian d/v at low v; shortens by 1/γ at
 * relativistic v.
 *
 * PHP twin: App\Equations\Physics\InterstellarProperTimeCruise::calc
 * (parameter keys: `distance`, `velocity`). The parity fixture at
 * tests/fixtures/equations-parity.json verifies this TS port matches
 * the PHP twin to within numeric tolerance for the cases the artisan
 * equations:dump command generates.
 *
 * Lifted from Andrew Hartley's 2024 Undaunted prototype
 * (Interstellar-App.js calcTripDetails — header: "Created by Andrew K.
 * Hartley"). Guards mirror the PHP twin: zero distance (no-cruise
 * scenario) returns 0; `v ≥ c` returns 0; non-positive `v` with
 * positive distance returns NaN.
 */
export const interstellarProperTimeCruise: Equation = {
    id: 'interstellar-proper-time-cruise',
    name: 'Interstellar proper time (cruise phase)',
    latex: '\\tau = \\frac{d}{v} \\cdot \\sqrt{1 - \\frac{v^{2}}{c^{2}}}',
    variables: [
        {
            symbol: 'τ',
            label: 'Proper time during cruise',
            units: 'seconds',
        },
        {
            symbol: 'd',
            label: 'Cruise distance',
            units: 'm',
        },
        {
            symbol: 'v',
            label: 'Cruise velocity',
            units: 'm/s',
        },
    ],
    compute: ({ d, v }) => {
        // Zero-distance cruise (no-cruise scenario) → zero proper time.
        if (d === 0) {
            return 0;
        }

        if (v <= 0) {
            return NaN;
        }

        if (v >= SPEED_OF_LIGHT) {
            return 0;
        }

        return (
            (d / v) * Math.sqrt(1 - (v * v) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT))
        );
    },
};
