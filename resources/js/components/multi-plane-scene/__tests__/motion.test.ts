import { describe, expect, test } from 'vitest';

import { computeMotion } from '../motion';
import type {MotionInputs} from '../types';

function baseInputs(overrides: Partial<MotionInputs> = {}): MotionInputs {
    return {
        position: 'full',
        depth: 0.5,
        sectionHeight: 1000,
        progress: 0.5,
        parallaxStrength: 1,
        motion: 'track',
        ...overrides,
    };
}

describe('computeMotion — static motion', () => {
    test('returns y=0 regardless of inputs', () => {
        expect(computeMotion(baseInputs({ motion: 'static' })).y).toBe(0);
        expect(
            computeMotion(
                baseInputs({ motion: 'static', depth: 0.05, progress: 0 }),
            ).y,
        ).toBe(0);
        expect(
            computeMotion(
                baseInputs({ motion: 'static', position: 'top', progress: 1 }),
            ).y,
        ).toBe(0);
    });
});

describe('computeMotion — position="full"', () => {
    test('y=0 at scroll midpoint (p=0.5)', () => {
        expect(
            computeMotion(baseInputs({ position: 'full', progress: 0.5 })).y,
        ).toBe(0);
    });

    test('foreground layer (depth=0.05) sweeps wide range', () => {
        // baseShift = (1 - 0.05) * 1000 * 1 = 950
        // At p=0: y = 950 * (0 - 0.5) = -475
        const { y } = computeMotion(
            baseInputs({ position: 'full', depth: 0.05, progress: 0 }),
        );

        expect(y).toBe(-475);
    });

    test('far layer (depth=0.92) sweeps narrow range', () => {
        // baseShift = (1 - 0.92) * 1000 * 1 = 80
        // At p=0: y = 80 * (0 - 0.5) = -40
        const { y } = computeMotion(
            baseInputs({ position: 'full', depth: 0.92, progress: 0 }),
        );

        expect(y).toBeCloseTo(-40, 5);
    });

    test('depth=1 (effective infinity) produces zero motion at all progresses', () => {
        const result0 = computeMotion(
            baseInputs({ position: 'full', depth: 1, progress: 0 }),
        );
        const result1 = computeMotion(
            baseInputs({ position: 'full', depth: 1, progress: 1 }),
        );

        expect(result0.y).toBe(0);
        expect(result1.y).toBe(0);
    });
});

describe('computeMotion — position="top"', () => {
    test('y=0 at scroll end (p=1)', () => {
        expect(
            computeMotion(baseInputs({ position: 'top', progress: 1 })).y,
        ).toBe(0);
    });

    test('top-anchored layer micro-shifts inward at scroll start', () => {
        // baseShift = (1 - 0.05) * 1000 = 950
        // At p=0: y = -950 * 0.2 * 1 = -190
        const { y } = computeMotion(
            baseInputs({ position: 'top', depth: 0.05, progress: 0 }),
        );

        expect(y).toBe(-190);
    });
});

describe('computeMotion — position="bottom"', () => {
    test('y=0 at scroll end (p=1)', () => {
        expect(
            computeMotion(baseInputs({ position: 'bottom', progress: 1 })).y,
        ).toBe(0);
    });

    test('bottom-anchored layer micro-shifts inward at scroll start', () => {
        // baseShift = (1 - 0.05) * 1000 = 950
        // At p=0: y = 950 * 0.2 * 1 = 190
        const { y } = computeMotion(
            baseInputs({ position: 'bottom', depth: 0.05, progress: 0 }),
        );

        expect(y).toBe(190);
    });
});

describe('computeMotion — parallaxStrength multiplier', () => {
    test('scales y proportionally', () => {
        const half = computeMotion(
            baseInputs({ depth: 0.05, parallaxStrength: 0.5, progress: 0 }),
        );
        const full = computeMotion(
            baseInputs({ depth: 0.05, parallaxStrength: 1, progress: 0 }),
        );
        const oneAndHalf = computeMotion(
            baseInputs({ depth: 0.05, parallaxStrength: 1.5, progress: 0 }),
        );

        expect(half.y).toBeCloseTo(full.y * 0.5, 5);
        expect(oneAndHalf.y).toBeCloseTo(full.y * 1.5, 5);
    });
});

describe('computeMotion — depth clamping', () => {
    test('depth=1.5 is clamped to 1 (zero motion)', () => {
        const { y } = computeMotion(baseInputs({ depth: 1.5, progress: 0 }));

        expect(y).toBe(0);
    });

    test('depth=-0.5 is clamped to 0 (max motion)', () => {
        // After clamp(depth, 0, 1) = 0, baseShift = 1000.
        // At progress=0: y = 1000 * (0 - 0.5) = -500
        const { y } = computeMotion(baseInputs({ depth: -0.5, progress: 0 }));

        expect(y).toBe(-500);
    });
});
