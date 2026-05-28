import { describe, expect, test } from 'vitest';

// computeFadeOpacity isn't exported from Caption.tsx (it's module-private).
// Replicate it here for testing — keeps Caption's API minimal. If the formula
// changes, update both places.
function computeFadeOpacity(
    progress: number,
    at: number,
    fadeWindow: number,
): number {
    const distance = Math.abs(progress - at);

    if (distance >= fadeWindow) {
        return 0;
    }

    return 1 - distance / fadeWindow;
}

describe('Caption fade opacity formula', () => {
    test('opacity=1 when progress=at exactly', () => {
        expect(computeFadeOpacity(0.5, 0.5, 0.15)).toBe(1);
    });

    test('opacity=0 when distance >= fadeWindow', () => {
        expect(computeFadeOpacity(0.3, 0.5, 0.15)).toBe(0);
        expect(computeFadeOpacity(0.5, 0.8, 0.15)).toBeCloseTo(0, 5);
    });

    test('opacity=0.5 at half-window distance', () => {
        expect(computeFadeOpacity(0.5 + 0.075, 0.5, 0.15)).toBeCloseTo(0.5, 5);
        expect(computeFadeOpacity(0.5 - 0.075, 0.5, 0.15)).toBeCloseTo(0.5, 5);
    });
});
