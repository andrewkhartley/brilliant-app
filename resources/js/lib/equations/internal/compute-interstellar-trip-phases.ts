import { interstellarAccelerationDistance } from '@/lib/equations';
import { interstellarAccelerationDuration } from '@/lib/equations';
import { SPEED_OF_LIGHT } from '../../constants';

/**
 * Per-phase breakdown of a 3-phase interstellar trip (accelerate →
 * optional cruise → optional deceleration). `isNoCruise` flags the
 * branch where the acceleration phase alone consumes the budgeted
 * trip distance; in that case `cruiseDistance` and `cruiseDuration`
 * are both zero and `accelerationDuration` is recomputed from the
 * budgeted distance.
 */
export interface InterstellarTripPhases {
    accelerationDuration: number;
    cruiseDistance: number;
    cruiseDuration: number;
    isNoCruise: boolean;
}

/**
 * Shared 3-phase trip decomposition. Mirror of the PHP trait
 * App\Equations\Physics\Concerns\ComputesInterstellarTripPhases — see
 * that file's PHPDoc for the design rationale (DRY across the two
 * trip-duration equations that compose their final answers from these
 * per-phase numbers).
 *
 * Returns `null` when inputs are invalid (non-finite or non-positive
 * distance, acceleration, or maximum speed). Callers
 * (interstellar-trip-duration, interstellar-trip-duration-dilation)
 * propagate null upstream as their own NaN/null result.
 *
 * Not re-exported from the equations barrel: this is internal glue
 * between two consumer equations, not a registry entry.
 */
export function computeInterstellarTripPhases({
    distance,
    acceleration,
    maximumSpeed,
    stop,
}: {
    distance: number;
    acceleration: number;
    maximumSpeed: number;
    stop: boolean;
}): InterstellarTripPhases | null {
    if (
        !Number.isFinite(distance) ||
        !Number.isFinite(acceleration) ||
        !Number.isFinite(maximumSpeed)
    ) {
        return null;
    }

    if (distance <= 0 || acceleration <= 0 || maximumSpeed <= 0) {
        return null;
    }

    const accelerationDuration = interstellarAccelerationDuration.compute({
        v: maximumSpeed,
        a: acceleration,
    });

    const accelerationDistance = interstellarAccelerationDistance.compute({
        a: acceleration,
        t: accelerationDuration,
    });

    // No-cruise branch: the acceleration phase alone consumes the
    // budgeted distance. Recompute acceleration duration directly from
    // the half-trip (stop) or full-trip (no-stop) distance using the
    // same closed form that AccelerationDuration (Phase 2) uses.
    const noCruise = stop
        ? accelerationDistance > distance / 2
        : accelerationDistance > distance;

    if (noCruise) {
        const boundedDistance = stop ? distance / 2 : distance;
        const boundedAccelerationDuration = Math.sqrt(
            (boundedDistance * boundedDistance) /
                (SPEED_OF_LIGHT * SPEED_OF_LIGHT) +
                (2 * boundedDistance) / acceleration,
        );

        return {
            accelerationDuration: boundedAccelerationDuration,
            cruiseDistance: 0,
            cruiseDuration: 0,
            isNoCruise: true,
        };
    }

    const cruiseDistance = stop
        ? distance - 2 * accelerationDistance
        : distance - accelerationDistance;

    return {
        accelerationDuration,
        cruiseDistance,
        cruiseDuration: cruiseDistance / maximumSpeed,
        isNoCruise: false,
    };
}
