import { describe, expect, test } from 'vitest';
import {
    accelerationDuration,
    circleArea,
    cylinderSurfaceArea,
    orbitalPeriod,
    orbitalVelocity,
    rectangleArea,
    relativisticSpeed,
} from '@/lib/equations';
import fixture from '../../../../../tests/fixtures/equations-parity.json';

type ParityCase = { inputs: Record<string, number>; expected: number };
type ParityFixture = Record<string, ParityCase[]>;

const f = fixture as ParityFixture;

describe('PHP-twin parity (TS compute matches PHP calc to 6 decimal places)', () => {
    test.each(f['relativistic-speed'])(
        'relativistic-speed: $inputs',
        ({ inputs, expected }) => {
            expect(relativisticSpeed.compute(inputs)).toBeCloseTo(expected, 6);
        },
    );

    test.each(f['orbital-period'])(
        'orbital-period: $inputs',
        ({ inputs, expected }) => {
            expect(orbitalPeriod.compute(inputs)).toBeCloseTo(expected, 6);
        },
    );

    test.each(f['orbital-velocity'])(
        'orbital-velocity: $inputs',
        ({ inputs, expected }) => {
            expect(orbitalVelocity.compute(inputs)).toBeCloseTo(expected, 6);
        },
    );

    test.each(f['acceleration-duration'])(
        'acceleration-duration: $inputs',
        ({ inputs, expected }) => {
            expect(accelerationDuration.compute(inputs)).toBeCloseTo(
                expected,
                6,
            );
        },
    );
});

describe('TS-only primitives (hand-computed expected values)', () => {
    test('circle-area: r=1 → π', () => {
        expect(circleArea.compute({ r: 1 })).toBeCloseTo(Math.PI, 10);
    });

    test('circle-area: r=2 → 4π', () => {
        expect(circleArea.compute({ r: 2 })).toBeCloseTo(4 * Math.PI, 10);
    });

    test('rectangle-area: 3×4 → 12', () => {
        expect(rectangleArea.compute({ l: 3, w: 4 })).toBe(12);
    });

    test('rectangle-area: 0.5×0.5 → 0.25', () => {
        expect(rectangleArea.compute({ l: 0.5, w: 0.5 })).toBeCloseTo(0.25, 10);
    });

    test('cylinder-surface-area: r=1, h=1 → 4π', () => {
        // A = 2π(1)² + 2π(1)(1) = 2π + 2π = 4π
        expect(cylinderSurfaceArea.compute({ r: 1, h: 1 })).toBeCloseTo(
            4 * Math.PI,
            10,
        );
    });

    test("cylinder-surface-area: O'Neill Island Three defaults match decomposition", () => {
        // A = 2πr² + 2πrh, with r=3200, h=32000
        // = 2 × circle-area(r=3200) + rectangle-area(l=2πr, w=h)
        const direct = cylinderSurfaceArea.compute({ r: 3200, h: 32000 });
        const composed =
            2 * circleArea.compute({ r: 3200 }) +
            rectangleArea.compute({ l: 2 * Math.PI * 3200, w: 32000 });
        expect(direct).toBeCloseTo(composed, 6);
    });
});
