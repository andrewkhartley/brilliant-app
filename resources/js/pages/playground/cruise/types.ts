/**
 * Shared types for the Cruise review surface.
 *
 * `Leg` mirrors the slimmed-down per-leg shape returned by
 * `CruiseController::presentTrip()`. Keeping it co-located with the
 * components that consume it (LegScene, LegBreakdown,
 * cruise-review.tsx) makes the wire contract obvious without forcing
 * a sibling-import through the page module.
 *
 * `Trip` and `CruiseInput` mirror the top-level Inertia props. They
 * stay in this file rather than alongside the page entry so the (T6)
 * `HorizonsError` component can import the same types when the
 * fallback view ships.
 */

/**
 * 3D position triplet — solar-system coordinates in kilometers,
 * rounded to the nearest km server-side (sub-meter precision is
 * noise at this scale). `null` when the leg's calculator output
 * didn't expose a coordinate for that endpoint (defensive — every
 * leg in the lifted service does produce both, but the controller's
 * `presentCoordinates()` guards against partial shapes anyway).
 */
export interface Coordinates {
    x: number;
    y: number;
    z: number;
}

export interface Leg {
    /** 1-based leg ordinal — surfaces in the "Leg N" heading. */
    leg: number;
    /** Departure body code, e.g. 'ear'. Drives planet PNG selection. */
    departure: string;
    /** Arrival body code, e.g. 'mer'. Drives planet PNG selection. */
    arrival: string;
    /** Human-readable departure name (e.g. "Earth"). */
    departureName: string;
    /** Human-readable arrival name (e.g. "Mercury"). */
    arrivalName: string;
    /** Departure timestamp string, formatted server-side. */
    departureTime: string;
    /** Arrival timestamp string, formatted server-side. */
    arrivalTime: string;
    /** Numeric leg distance in km (kept for future client-side use). */
    distanceKm: number;
    /** Pre-formatted leg distance with thousands separators. */
    distanceFormatted: string;
    /** Numeric leg duration in seconds (kept for future client-side use). */
    durationSeconds: number;
    /** Pre-formatted leg duration ("3d 4h 12m"). */
    durationFormatted: string;
    /** Pre-formatted peak leg speed. */
    maxSpeedFormatted: string;
    /** Pre-formatted burn (accel + decel) distance. */
    burnDistanceFormatted: string;
    /** Pre-formatted burn (accel + decel) duration. */
    burnDurationFormatted: string;
    /** Numeric cruise/coast distance in km. Zero when the leg flips directly. */
    cruiseDistanceKm: number;
    /** Pre-formatted cruise (coast) distance. */
    cruiseDistanceFormatted: string;
    /** Pre-formatted cruise (coast) duration. */
    cruiseDurationFormatted: string;
    /** Pre-formatted direct flip distance when there is no cruise segment. */
    flipDistanceFormatted: string;
    /** Pre-formatted direct flip duration when there is no cruise segment. */
    flipDurationFormatted: string;
    /** Pre-formatted relativistic time dilation across the leg. */
    dilationFormatted: string;
    /** Pre-formatted layover/orbit distance at the arrival body. */
    layoverDistanceFormatted: string;
    /** Pre-formatted layover/orbit duration at the arrival body. */
    layoverDurationFormatted: string;
    /** Pre-formatted number of orbits completed during the layover. */
    layoverQuantityFormatted: string;
    /** Date for the next leg departure after layover. */
    nextDepartureDate: string;
    /** Time for the next leg departure after layover. */
    nextDepartureTime: string;
    /** 3D departure position in km at leg-start (null when missing). */
    depCoordinates: Coordinates | null;
    /** 3D arrival position in km at leg-end (null when missing). */
    arrCoordinates: Coordinates | null;
}

export interface Trip {
    /** First-leg departure timestamp string (server-formatted). */
    departureTime: string | null;
    /** Final-leg arrival timestamp string (server-formatted). */
    arrivalTime: string | null;
    /** Pre-formatted total trip duration ("11d 6h"). */
    finalDuration: string | null;
    /** Pre-formatted cumulative trip distance. */
    tripDistanceFormatted: string;
    /** Pre-formatted cumulative burn distance. */
    burnDistanceFormatted: string;
    /** Pre-formatted cumulative burn duration. */
    burnDurationFormatted: string;
    /** Pre-formatted cumulative cruise distance. */
    cruiseDistanceFormatted: string;
    /** Pre-formatted cumulative cruise duration. */
    cruiseDurationFormatted: string;
    /** Pre-formatted cumulative orbit/layover distance. */
    orbitDistanceFormatted: string;
    /** Pre-formatted cumulative orbit/layover duration. */
    orbitDurationFormatted: string;
    /** Pre-formatted seconds of time dilation across the trip. */
    tripDilationFormatted: string;
    /** Pre-formatted minutes of time dilation across the trip. */
    tripDilationMinutes: string;
    /** Pre-formatted cumulative orbit/layover time across all legs. */
    totalOrbDurFormatted: string | null;
    /** Pre-formatted cumulative time dilation across all legs. */
    totalDilationFormatted: string | null;
    /** Ordered list of leg breakdowns (Earth → ... → Earth). */
    legs: Leg[];
}

export interface CruiseInput {
    /** Coordinate source chosen on the form. */
    dataSource: 'horizons' | 'ephemeris';
    /** User-picked destination codes, in trip order. */
    destinations: string[];
    /** Per-destination layover days, parallel to destinations. */
    layovers: number[];
    /** Trip-start date as YYYY-MM-DD (what the user picked in the form). */
    tripStart: string;
}
