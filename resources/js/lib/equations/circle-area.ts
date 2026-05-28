import type { Equation } from './types';

/**
 * Area of a circle: A = π·r²
 *
 * Primitive equation used as a building block for composed equations
 * (e.g. cylinder-surface-area uses 2× circle-area for the two end caps).
 * No PHP twin exists; parity is asserted against hand-computed values.
 */
export const circleArea: Equation = {
    id: 'circle-area',
    name: 'Circle area',
    latex: 'A = \\pi r^2',
    variables: [
        { symbol: 'A', label: 'Area', units: 'm²' },
        {
            symbol: 'r',
            label: 'Radius',
            units: 'm',
            default: 1,
            min: 0,
            step: 0.1,
        },
    ],
    compute: ({ r }) => Math.PI * r * r,
};
