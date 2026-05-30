import { describe, expect, test } from 'vitest';
import { SPEED_OF_LIGHT } from '@/lib/constants';
import {
    accelerationDuration,
    circleArea,
    cylinderSurfaceArea,
    interstellarEarthTime,
    interstellarFuelRatio,
    interstellarProperTime,
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

describe('interstellar rocket equations (P8.T2)', () => {
    // 1 light-year in meters (Julian year × c). Same convention used to
    // derive the registry default of 4.0114e16 m for Proxima Centauri.
    const LIGHT_YEAR = 9.461e15;
    const ONE_G = 9.80665;
    const JULIAN_YEAR_SECONDS = 365.25 * 86_400;

    describe('interstellar-earth-time', () => {
        test('Proxima Centauri at 1g: ≈ 5.87 Earth years', () => {
            const d = 4.24 * LIGHT_YEAR; // 4.0114e16 m
            const t = interstellarEarthTime.compute({ d, a: ONE_G });
            const years = t / JULIAN_YEAR_SECONDS;
            // Hand-computed reference: 5.8659 years (185.1 megaseconds).
            expect(years).toBeCloseTo(5.866, 2);
        });

        test('one light-year trip at 1g: ≈ 2.21 Earth years', () => {
            // Plan estimated ~1.7 years; actual closed-form is ~2.21
            // because the d²/c² term (light-travel floor) is already
            // ~1 year at d=1ly and the 4d/a kinematic term adds another
            // ~1.97 years before the sqrt — checked against Node.
            const t = interstellarEarthTime.compute({
                d: LIGHT_YEAR,
                a: ONE_G,
            });
            const years = t / JULIAN_YEAR_SECONDS;
            expect(years).toBeCloseTo(2.208, 2);
        });

        test('Andromeda at 1g: ≈ 2.54M Earth years (light-travel floor dominates)', () => {
            // At cosmological distances the d²/c² term dwarfs 4d/a, so
            // t_earth → d/c (just the light-travel time).
            const d = 2.537e6 * LIGHT_YEAR;
            const t = interstellarEarthTime.compute({ d, a: ONE_G });
            const years = t / JULIAN_YEAR_SECONDS;
            // Reference: 2,537,074 Julian years. 1% tolerance.
            expect(years).toBeGreaterThan(2.51e6);
            expect(years).toBeLessThan(2.56e6);
        });
    });

    describe('interstellar-proper-time', () => {
        test('Proxima Centauri at 1g: ≈ 3.54 traveler years', () => {
            const d = 4.24 * LIGHT_YEAR;
            const t = interstellarProperTime.compute({ d, a: ONE_G });
            const years = t / JULIAN_YEAR_SECONDS;
            // Hand-computed reference: 3.540 years.
            expect(years).toBeCloseTo(3.54, 2);
        });

        test('proper time ≤ earth time for every (d, a) pair', () => {
            // The whole point of the dual-clock display: traveler clocks
            // run slow relative to Earth's. Equality only at d → 0.
            const cases: Array<{ d: number; a: number }> = [
                { d: LIGHT_YEAR, a: ONE_G },
                { d: 4.24 * LIGHT_YEAR, a: ONE_G },
                { d: 100 * LIGHT_YEAR, a: ONE_G },
                { d: 2.537e6 * LIGHT_YEAR, a: ONE_G },
                { d: 4.24 * LIGHT_YEAR, a: 2 * ONE_G },
            ];

            for (const { d, a } of cases) {
                const earth = interstellarEarthTime.compute({ d, a });
                const proper = interstellarProperTime.compute({ d, a });
                expect(proper).toBeLessThanOrEqual(earth);
            }
        });

        test('Andromeda at 1g: ≈ 28.6 traveler years (arccosh tames the distance)', () => {
            const d = 2.537e6 * LIGHT_YEAR;
            const t = interstellarProperTime.compute({ d, a: ONE_G });
            const years = t / JULIAN_YEAR_SECONDS;
            // Reference: 28.63 years. 5% tolerance for arccosh at scale.
            expect(years).toBeGreaterThan(27.2);
            expect(years).toBeLessThan(30.1);
        });
    });

    describe('interstellar-fuel-ratio', () => {
        test('v = 0.5c → exactly 3', () => {
            const ratio = interstellarFuelRatio.compute({
                v: 0.5 * SPEED_OF_LIGHT,
            });
            expect(Math.abs(ratio - 3)).toBeLessThan(1e-10);
        });

        test('v = 0.99c → 199 (within floating-point)', () => {
            const ratio = interstellarFuelRatio.compute({
                v: 0.99 * SPEED_OF_LIGHT,
            });
            expect(Math.abs(ratio - 199)).toBeLessThan(1e-9);
        });

        test('v = c → Infinity (asymptotic guard)', () => {
            const ratio = interstellarFuelRatio.compute({
                v: SPEED_OF_LIGHT,
            });
            expect(ratio).toBe(Infinity);
        });
    });
});
