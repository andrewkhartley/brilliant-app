import { computeInterstellarTripPhases } from './internal/compute-interstellar-trip-phases';
import type { Equation } from './types';

/**
 * Interstellar trip total coordinate (Earth-frame) duration:
 *   t_total = k · t_accel + t_cruise,    k ∈ {1, 2}
 *
 * Composes the 3-phase trip profile (accelerate → cruise → optionally
 * decelerate) into a single coordinate-time total. `k = 2` if the
 * ship decelerates to rest at the destination (`stop = true`);
 * `k = 1` if it flies past (`stop = false`).
 *
 * PHP twin: App\Equations\Physics\InterstellarTripDuration::calc
 * (parameter keys: `distance`, `acceleration`, `maximumSpeed`, `stop`).
 * The parity fixture at tests/fixtures/equations-parity.json verifies
 * this TS port matches the PHP twin to within numeric tolerance for
 * the cases the artisan equations:dump command generates.
 *
 * Lifted from Andrew Hartley's 2024 Undaunted prototype
 * (Interstellar-App.js calcTripDetails — header: "Created by Andrew K.
 * Hartley"). Shared phase decomposition lives in
 * `./internal/compute-interstellar-trip-phases.ts`, mirroring the
 * PHP ComputesInterstellarTripPhases trait.
 *
 * Returns NaN when inputs are invalid (matches the PHP twin's null
 * return at the type-erased TS boundary).
 */
export const interstellarTripDuration: Equation = {
    id: 'interstellar-trip-duration',
    name: 'Interstellar trip duration (Earth frame)',
    latex: 't_{\\text{total}} = k \\cdot t_{\\text{accel}} + t_{\\text{cruise}}, \\quad k \\in \\{1, 2\\}',
    variables: [
        {
            symbol: 't',
            label: 'Total coordinate trip time',
            units: 'seconds',
        },
        {
            symbol: 'd',
            label: 'One-way distance',
            units: 'm',
        },
        {
            symbol: 'a',
            label: 'Acceleration',
            units: 'm/s²',
        },
        {
            symbol: 'vMax',
            label: 'Maximum cruise velocity',
            units: 'm/s',
        },
        {
            symbol: 'stop',
            label: 'Decelerate to rest at destination',
        },
    ],
    compute: ({ d, a, vMax, stop }) => {
        // `stop` is registry-typed `number` (0 / 1) per the Equation
        // contract; the parity fixture serialises it as a JSON boolean,
        // and the test boundary coerces booleans to 0 / 1 before this
        // compute is called. Truthiness here matches the PHP twin's
        // `(bool) $stop` cast.
        const stopFlag = Boolean(stop);

        const phases = computeInterstellarTripPhases({
            distance: d,
            acceleration: a,
            maximumSpeed: vMax,
            stop: stopFlag,
        });

        if (phases === null) {
            return NaN;
        }

        return stopFlag
            ? 2 * phases.accelerationDuration + phases.cruiseDuration
            : phases.accelerationDuration + phases.cruiseDuration;
    },
};
