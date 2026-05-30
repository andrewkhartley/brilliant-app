import { describe, expect, test } from 'vitest';
import { SPEED_OF_LIGHT } from '@/lib/constants';
import {
    accelerationDuration,
    circleArea,
    cylinderSurfaceArea,
    interstellarAccelerationDistance,
    interstellarAccelerationDuration,
    interstellarEarthTime,
    interstellarEffectiveExhaustVelocity,
    interstellarFuelMassRatio,
    interstellarFuelRatio,
    interstellarProperTime,
    interstellarProperTimeAcceleration,
    interstellarProperTimeCruise,
    interstellarTripDuration,
    interstellarTripDurationDilation,
    orbitalPeriod,
    orbitalVelocity,
    rectangleArea,
    relativisticSpeed,
} from '@/lib/equations';
import fixture from '../../../../../tests/fixtures/equations-parity.json';

// The Phase 2 legacy equations have purely-numeric inputs and outputs.
// The Phase 8 T4.6 additions (interstellar-trip-*, fuel-mass-ratio)
// introduce boolean inputs (e.g. `stop`) and a "Infinity" string
// sentinel on output (JSON can't encode ±Infinity natively). The TS
// twin signatures keep inputs strictly `number` (booleans round-trip
// as 0 / 1 through `Boolean(...)`); the parity test below normalises
// both directions at the boundary.
type RawParityCase = {
    inputs: Record<string, number | boolean>;
    expected: number | string;
};
type ParityFixture = Record<string, RawParityCase[]>;

const fParity = fixture as ParityFixture;

/**
 * Deserialise the JSON "Infinity" sentinel back to a native float.
 * The PHP `artisan equations:dump` command serialises PHP's `INF` as
 * the string `"Infinity"` because JSON cannot encode ±∞. We swap it
 * back here so `.toBe(Infinity)` and `.toBeCloseTo()` both work.
 */
function deserialiseExpected(expected: number | string): number {
    if (expected === 'Infinity') {
        return Number.POSITIVE_INFINITY;
    }

    if (expected === '-Infinity') {
        return Number.NEGATIVE_INFINITY;
    }

    return expected as number;
}

/**
 * Normalise a fixture input record into the strictly-numeric record
 * the Equation.compute signature expects. JSON booleans round-trip
 * as 0 (false) / 1 (true); the trip-duration equations coerce these
 * back to bool via `Boolean(...)` inside compute, matching PHP's
 * `(bool) $stop` cast on the parity-test boundary.
 */
function normaliseInputs(
    inputs: Record<string, number | boolean>,
): Record<string, number> {
    const out: Record<string, number> = {};

    for (const [key, value] of Object.entries(inputs)) {
        out[key] = typeof value === 'boolean' ? (value ? 1 : 0) : value;
    }

    return out;
}

/**
 * Assert that a TS compute matches a fixture expected value. Uses
 * `toBe` for ±Infinity (exact identity) and `toBeCloseTo` with 6
 * decimal places for finite values — matching the existing
 * Phase 2 parity discipline.
 */
function expectParity(actual: number, expected: number): void {
    if (!Number.isFinite(expected)) {
        expect(actual).toBe(expected);

        return;
    }

    // Magnitude-aware tolerance: `toBeCloseTo(expected, 6)` checks
    // |actual − expected| < 5e-7, which is too strict for large
    // magnitudes (e.g. trip durations of ~6e8 seconds where the
    // last bits of mantissa already diverge from PHP's float64).
    // We fall back to a 1e-9 relative tolerance for those, which
    // is well under the 6-decimal precision floor for small values
    // and matches the artisan equations:dump round-trip precision.
    const magnitude = Math.max(Math.abs(actual), Math.abs(expected));

    if (magnitude > 1) {
        expect(Math.abs(actual - expected) / magnitude).toBeLessThan(1e-9);

        return;
    }

    expect(actual).toBeCloseTo(expected, 6);
}

describe('PHP-twin parity (TS compute matches PHP calc to 6 decimal places)', () => {
    test.each(fParity['relativistic-speed'])(
        'relativistic-speed: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                relativisticSpeed.compute(normaliseInputs(inputs)),
                deserialiseExpected(expected),
            );
        },
    );

    test.each(fParity['orbital-period'])(
        'orbital-period: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                orbitalPeriod.compute(normaliseInputs(inputs)),
                deserialiseExpected(expected),
            );
        },
    );

    test.each(fParity['orbital-velocity'])(
        'orbital-velocity: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                orbitalVelocity.compute(normaliseInputs(inputs)),
                deserialiseExpected(expected),
            );
        },
    );

    test.each(fParity['acceleration-duration'])(
        'acceleration-duration: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                accelerationDuration.compute(normaliseInputs(inputs)),
                deserialiseExpected(expected),
            );
        },
    );
});

describe('PHP-twin parity — Phase 8 interstellar additions (T4.7)', () => {
    test.each(fParity['interstellar-acceleration-duration'])(
        'interstellar-acceleration-duration: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                interstellarAccelerationDuration.compute(
                    normaliseInputs(inputs),
                ),
                deserialiseExpected(expected),
            );
        },
    );

    test.each(fParity['interstellar-acceleration-distance'])(
        'interstellar-acceleration-distance: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                interstellarAccelerationDistance.compute(
                    normaliseInputs(inputs),
                ),
                deserialiseExpected(expected),
            );
        },
    );

    test.each(fParity['interstellar-proper-time-acceleration'])(
        'interstellar-proper-time-acceleration: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                interstellarProperTimeAcceleration.compute(
                    normaliseInputs(inputs),
                ),
                deserialiseExpected(expected),
            );
        },
    );

    test.each(fParity['interstellar-proper-time-cruise'])(
        'interstellar-proper-time-cruise: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                interstellarProperTimeCruise.compute(normaliseInputs(inputs)),
                deserialiseExpected(expected),
            );
        },
    );

    test.each(fParity['interstellar-trip-duration'])(
        'interstellar-trip-duration: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                interstellarTripDuration.compute(normaliseInputs(inputs)),
                deserialiseExpected(expected),
            );
        },
    );

    test.each(fParity['interstellar-trip-duration-dilation'])(
        'interstellar-trip-duration-dilation: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                interstellarTripDurationDilation.compute(
                    normaliseInputs(inputs),
                ),
                deserialiseExpected(expected),
            );
        },
    );

    test.each(fParity['interstellar-effective-exhaust-velocity'])(
        'interstellar-effective-exhaust-velocity: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                interstellarEffectiveExhaustVelocity.compute(
                    normaliseInputs(inputs),
                ),
                deserialiseExpected(expected),
            );
        },
    );

    test.each(fParity['interstellar-fuel-mass-ratio'])(
        'interstellar-fuel-mass-ratio: $inputs',
        ({ inputs, expected }) => {
            expectParity(
                interstellarFuelMassRatio.compute(normaliseInputs(inputs)),
                deserialiseExpected(expected),
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
