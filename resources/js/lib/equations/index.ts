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

import { circleArea } from './circle-area';
import { orbitalPeriod } from './orbital-period';
import { rectangleArea } from './rectangle-area';
import { relativisticSpeed } from './relativistic-speed';
import type { Equation } from './types';

export { circleArea, orbitalPeriod, rectangleArea, relativisticSpeed };

export const allEquations: readonly Equation[] = [
    circleArea,
    orbitalPeriod,
    rectangleArea,
    relativisticSpeed,
] as const;
