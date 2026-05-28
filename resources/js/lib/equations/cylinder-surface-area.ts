import type { Equation } from './types';

/**
 * Surface area of a closed cylinder:
 *   A = 2πr² + 2πrh
 *
 * Conceptually decomposed as: 2 × circle-area (end caps) + 1 × rectangle-area
 * (the lateral surface, unwrapped — length 2πr, width h). The composedFrom
 * field declares this decomposition; in v1 the compute() function hard-codes
 * the formula rather than dispatching through circle-area + rectangle-area's
 * compute() functions. The dispatch-through-composition pattern is a
 * future-extension path documented in the equation-registry memory.
 *
 * No PHP twin: undaunted-app-old's SurfaceArea.php was actually the rectangle-
 * area formula (misnamed), and no Cruise service required cylinder surface area.
 * Fresh-authored here; parity is asserted against hand-computed values in T8.
 *
 * Used by the Habitat experience (Phase 11) to model the O'Neill Cylinder's
 * surface area, with a "Built from" UI affordance that visualizes the
 * decomposition through circle-area + rectangle-area links.
 */
export const cylinderSurfaceArea: Equation = {
    id: 'cylinder-surface-area',
    name: 'Cylinder surface area',
    latex: 'A = 2 \\pi r^2 + 2 \\pi r h',
    variables: [
        { symbol: 'A', label: 'Total surface area', units: 'm²' },
        {
            symbol: 'r',
            label: 'Radius',
            units: 'm',
            default: 3200,
            min: 0.1,
            description:
                "Default: O'Neill Cylinder Island Three (~3.2 km radius)",
        },
        {
            symbol: 'h',
            label: 'Height (length)',
            units: 'm',
            default: 32_000,
            min: 0.1,
            description: "Default: O'Neill Cylinder Island Three (~32 km long)",
        },
    ],
    composedFrom: ['circle-area', 'rectangle-area'],
    compute: ({ r, h }) => 2 * Math.PI * r * r + 2 * Math.PI * r * h,
};
