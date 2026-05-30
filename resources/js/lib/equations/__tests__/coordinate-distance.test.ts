import { expect, test } from 'vitest';

import { coordinateDistance } from '@/lib/equations/coordinate-distance';

/**
 * Parity with the PHP twin `App\Equations\Geometry\CoordinateDistance::calc`.
 * The PHP class lives outside the registry contract, so there is no
 * generated parity fixture; instead we assert two hand-computed triplets
 * — a classic 3-4-5 triangle in the xy-plane (z = 0) and a 1-2-2 → 3
 * full-3D case — both producing integer distances. The missing-z
 * fallback is also exercised, matching PHP's `$point['z'] ?? 0`.
 */
test('coordinateDistance matches the PHP twin for known 3D triplets', () => {
    expect(coordinateDistance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBe(
        5,
    );
    expect(coordinateDistance({ x: 0, y: 0, z: 0 }, { x: 1, y: 2, z: 2 })).toBe(
        3,
    );
    expect(coordinateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
});
