<?php

namespace App\Equations\Physics\Concerns;

use App\Equations\Physics\InterstellarAccelerationDistance;
use App\Equations\Physics\InterstellarAccelerationDuration;

/**
 * Shared 3-phase trip-decomposition logic for the Interstellar trip
 * duration equations. Both InterstellarTripDuration (Earth-frame total)
 * and InterstellarTripDurationDilation (proper-time total) need the
 * same branching: validate inputs, compute the unbounded acceleration
 * phase, decide whether the acceleration distance exceeds the budgeted
 * trip distance, recompute a bounded acceleration phase if so, and
 * compute the cruise phase from whatever distance is left over.
 *
 * The two consumer equations then compose their final answer
 * differently from the same per-phase numbers:
 *   - TripDuration sums coordinate times directly
 *   - TripDurationDilation runs each phase through the proper-time
 *     equations before summing
 *
 * Extracted from inline copies in both consumer equations to satisfy
 * the project's DRY discipline (PHPStorm flagged 21-line duplicates
 * across the two original implementations).
 */
trait ComputesInterstellarTripPhases
{
    /**
     * Compute the 3-phase trip breakdown.
     *
     * Returns null when inputs are invalid (null or non-positive distance,
     * acceleration, or maximum speed) — callers propagate the null to
     * their own return value to indicate "no result."
     *
     * @return array{
     *     accelerationDuration: float,
     *     cruiseDistance: float,
     *     cruiseDuration: float,
     *     isNoCruise: bool,
     * }|null
     */
    private function computeInterstellarTripPhases(
        $distance,
        $acceleration,
        $maximumSpeed,
        bool $stop,
        $speedOfLight,
    ): ?array {
        if ($distance === null || $acceleration === null || $maximumSpeed === null) {
            return null;
        }

        if ($distance <= 0.0 || $acceleration <= 0.0 || $maximumSpeed <= 0.0) {
            return null;
        }

        $accelerationDuration = (new InterstellarAccelerationDuration)->calc('duration', [
            ['maximumSpeed', $maximumSpeed],
            ['acceleration', $acceleration],
        ]);

        $accelerationDistance = (new InterstellarAccelerationDistance)->calc('distance', [
            ['acceleration', $acceleration],
            ['duration', $accelerationDuration],
        ]);

        // No-cruise branch: the acceleration phase alone consumes the
        // budgeted distance. Recompute acceleration duration directly
        // from the half-trip (stop) or full-trip (no-stop) distance.
        $noCruise = $stop
            ? ($accelerationDistance > $distance / 2)
            : ($accelerationDistance > $distance);

        if ($noCruise) {
            $boundedDistance = $stop ? $distance / 2 : $distance;
            $accelerationDuration = sqrt(
                (($boundedDistance * $boundedDistance) / ($speedOfLight * $speedOfLight))
                + (2 * $boundedDistance / $acceleration)
            );

            return [
                'accelerationDuration' => $accelerationDuration,
                'cruiseDistance' => 0.0,
                'cruiseDuration' => 0.0,
                'isNoCruise' => true,
            ];
        }

        $cruiseDistance = $stop
            ? $distance - (2 * $accelerationDistance)
            : $distance - $accelerationDistance;

        return [
            'accelerationDuration' => $accelerationDuration,
            'cruiseDistance' => $cruiseDistance,
            'cruiseDuration' => $cruiseDistance / $maximumSpeed,
            'isNoCruise' => false,
        ];
    }
}
