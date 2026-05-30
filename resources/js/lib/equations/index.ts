/**
 * Equation registry — single source of truth for all equations used by the
 * site's interactive math UIs.
 *
 * Each equation lives in its own file and exports a named const conforming
 * to the `Equation` interface. This index re-exports each individually for
 * direct imports AND collects them into `allEquations[]` for consumers
 * that iterate the whole registry.
 *
 * Internal helpers (e.g. `./internal/compute-interstellar-trip-phases`)
 * are deliberately NOT re-exported — they are shared glue between
 * sibling equations, not registry entries.
 */

export type { Equation, EquationVariable } from './types';

import { accelerationDuration } from './acceleration-duration';
import { circleArea } from './circle-area';
import { cylinderSurfaceArea } from './cylinder-surface-area';
import { interstellarAccelerationDistance } from './interstellar-acceleration-distance';
import { interstellarAccelerationDuration } from './interstellar-acceleration-duration';
import { interstellarEarthTime } from './interstellar-earth-time';
import { interstellarEffectiveExhaustVelocity } from './interstellar-effective-exhaust-velocity';
import { interstellarFuelMassRatio } from './interstellar-fuel-mass-ratio';
import { interstellarFuelRatio } from './interstellar-fuel-ratio';
import { interstellarProperTime } from './interstellar-proper-time';
import { interstellarProperTimeAcceleration } from './interstellar-proper-time-acceleration';
import { interstellarProperTimeCruise } from './interstellar-proper-time-cruise';
import { interstellarTripDuration } from './interstellar-trip-duration';
import { interstellarTripDurationDilation } from './interstellar-trip-duration-dilation';
import { orbitalPeriod } from './orbital-period';
import { orbitalVelocity } from './orbital-velocity';
import { rectangleArea } from './rectangle-area';
import { relativisticSpeed } from './relativistic-speed';
import type { Equation } from './types';

export {
    accelerationDuration,
    circleArea,
    cylinderSurfaceArea,
    interstellarAccelerationDistance,
    interstellarAccelerationDuration,
    interstellarEarthTime,
    interstellarEffectiveExhaustVelocity,
    interstellarFuelMassRatio,
    interstellarFuelRatio,
    interstellarProperTime,
    interstellarProperTimeAcceleration,
    interstellarProperTimeCruise,
    interstellarTripDuration,
    interstellarTripDurationDilation,
    orbitalPeriod,
    orbitalVelocity,
    rectangleArea,
    relativisticSpeed,
};

export const allEquations: readonly Equation[] = [
    accelerationDuration,
    circleArea,
    cylinderSurfaceArea,
    interstellarAccelerationDistance,
    interstellarAccelerationDuration,
    interstellarEarthTime,
    interstellarEffectiveExhaustVelocity,
    interstellarFuelMassRatio,
    interstellarFuelRatio,
    interstellarProperTime,
    interstellarProperTimeAcceleration,
    interstellarProperTimeCruise,
    interstellarTripDuration,
    interstellarTripDurationDilation,
    orbitalPeriod,
    orbitalVelocity,
    rectangleArea,
    relativisticSpeed,
] as const;
