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
    /** Pre-formatted burn (accel + decel) duration. */
    burnDurationFormatted: string;
    /** Pre-formatted cruise (coast) duration. */
    cruiseDurationFormatted: string;
}

export interface Trip {
    /** First-leg departure timestamp string (server-formatted). */
    departureTime: string | null;
    /** Final-leg arrival timestamp string (server-formatted). */
    arrivalTime: string | null;
    /** Pre-formatted total trip duration ("11d 6h"). */
    finalDuration: string | null;
    /** Ordered list of leg breakdowns (Earth → ... → Earth). */
    legs: Leg[];
}

export interface CruiseInput {
    /** User-picked destination codes, in trip order. */
    destinations: string[];
    /** Trip-start date as YYYY-MM-DD (what the user picked in the form). */
    tripStart: string;
}
