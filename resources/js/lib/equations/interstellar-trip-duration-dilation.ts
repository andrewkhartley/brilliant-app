import { computeInterstellarTripPhases } from './internal/compute-interstellar-trip-phases';
import { interstellarProperTimeAcceleration } from './interstellar-proper-time-acceleration';
import { interstellarProperTimeCruise } from './interstellar-proper-time-cruise';
import type { Equation } from './types';

/**
 * Interstellar trip total proper (traveler) duration:
 *   τ_total = k · τ_accel + τ_cruise,    k ∈ {1, 2}
 *
 * Parallel in structure to `interstellarTripDuration` but composes
 * the dilated proper-time formulae for each phase. `k = 2` if the
 * ship decelerates to rest at the destination (`stop = true`);
 * `k = 1` if it flies past (`stop = false`).
 *
 * PHP twin: App\Equations\Physics\InterstellarTripDurationDilation::calc
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
 * Returns NaN when inputs are invalid.
 */
export const interstellarTripDurationDilation: Equation = {
    id: 'interstellar-trip-duration-dilation',
    name: 'Interstellar trip duration (traveler frame)',
    latex: '\\tau_{\\text{total}} = k \\cdot \\tau_{\\text{accel}} + \\tau_{\\text{cruise}}, \\quad k \\in \\{1, 2\\}',
    variables: [
        {
            symbol: 'τ',
            label: 'Total proper (traveler) trip time',
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

        const accelerationProperTime =
            interstellarProperTimeAcceleration.compute({
                a,
                t: phases.accelerationDuration,
            });

        const cruiseProperTime = phases.isNoCruise
            ? 0
            : interstellarProperTimeCruise.compute({
                  d: phases.cruiseDistance,
                  v: vMax,
              });

        return stopFlag
            ? 2 * accelerationProperTime + cruiseProperTime
            : accelerationProperTime + cruiseProperTime;
    },
};
