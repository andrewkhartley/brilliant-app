import type { Equation } from './types';

/**
 * Area of a rectangle: A = l·w
 *
 * Primitive equation used as a building block for composed equations
 * (e.g. cylinder-surface-area uses 1× rectangle-area for the unwrapped
 * lateral surface, where l = 2πr and w = h). No PHP twin exists;
 * parity is asserted against hand-computed values.
 *
 * Note: undaunted-app-old shipped a SurfaceArea.php that was actually
 * this formula (misnamed). Phase 2 skipped lifting it; this is the
 * fresh-authored TS replacement.
 */
export const rectangleArea: Equation = {
    id: 'rectangle-area',
    name: 'Rectangle area',
    latex: 'A = l \\cdot w',
    variables: [
        { symbol: 'A', label: 'Area', units: 'm²' },
        {
            symbol: 'l',
            label: 'Length',
            units: 'm',
            default: 1,
            min: 0,
            step: 0.1,
        },
        {
            symbol: 'w',
            label: 'Width',
            units: 'm',
            default: 1,
            min: 0,
            step: 0.1,
        },
    ],
    compute: ({ l, w }) => l * w,
};
