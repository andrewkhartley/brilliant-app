/**
 * 3D Euclidean distance between two points: d = √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)
 *
 * Plain TS utility (NOT a registry entry) — mirrors the PHP class
 * `App\Equations\Geometry\CoordinateDistance::calc(array $p1, array $p2): float`
 * which uses a non-registry signature and is server-only inside
 * CalculatorService. This twin preserves Andrew's "every lifted equation
 * has a TS twin" invariant for future client-side use; v1 Cruise does
 * not invoke it from the browser.
 *
 * Each coordinate is optional and defaults to 0 — matches the PHP
 * `$point['z'] ?? 0` behaviour for 2D-only callers.
 */
export type Point3D = { x?: number; y?: number; z?: number };

export function coordinateDistance(point1: Point3D, point2: Point3D): number {
    const x1 = point1.x ?? 0;
    const y1 = point1.y ?? 0;
    const z1 = point1.z ?? 0;
    const x2 = point2.x ?? 0;
    const y2 = point2.y ?? 0;
    const z2 = point2.z ?? 0;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
