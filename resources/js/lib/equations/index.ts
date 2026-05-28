/**
 * Equation registry — single source of truth for all equations used by the
 * site's interactive math UIs.
 *
 * Each equation lives in its own file and exports a named const conforming
 * to the `Equation` interface. This index re-exports each individually for
 * direct imports AND collects them into `allEquations[]` for consumers
 * that iterate the whole registry.
 */

export type { Equation, EquationVariable } from './types';

import { accelerationDuration } from './acceleration-duration';
import { circleArea } from './circle-area';
import { cylinderSurfaceArea } from './cylinder-surface-area';
import { orbitalPeriod } from './orbital-period';
import { orbitalVelocity } from './orbital-velocity';
import { rectangleArea } from './rectangle-area';
import { relativisticSpeed } from './relativistic-speed';
import type { Equation } from './types';

export {
    accelerationDuration,
    circleArea,
    cylinderSurfaceArea,
    orbitalPeriod,
    orbitalVelocity,
    rectangleArea,
    relativisticSpeed,
};

export const allEquations: readonly Equation[] = [
    accelerationDuration,
    circleArea,
    cylinderSurfaceArea,
    orbitalPeriod,
    orbitalVelocity,
    rectangleArea,
    relativisticSpeed,
] as const;
