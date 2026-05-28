/**
 * Equation registry — single source of truth for all equations used by the
 * site's interactive math UIs.
 *
 * Each equation lives in its own file under this directory and exports a
 * named const conforming to the `Equation` interface. This index re-exports
 * each equation individually (for direct imports) AND collects them into
 * `allEquations[]` for consumers that need to iterate the whole registry.
 *
 * Equations are added here as they're authored. The order in the array
 * is alphabetical-by-id for stability; consumers should not rely on
 * positional ordering.
 */

export type { Equation, EquationVariable } from './types';

export const allEquations: readonly never[] = [] as const;
