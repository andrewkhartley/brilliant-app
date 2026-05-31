import { z } from 'zod';

/**
 * Cruise-form client-side validation schema.
 *
 * Mirrors the rules in `app/Http/Requests/StoreCruiseRequest.php` so
 * the client + server enforce the same shape. The PHP rule is the
 * source of truth (validation MUST hold even if the client bypasses
 * this check); zod just lets us short-circuit a roundtrip when the
 * form is obviously incomplete.
 *
 * Rules:
 *  - `destinations`: 1–8 destination codes (strings). Codes are NOT
 *    validated against the catalog here — the server has the DB and
 *    enforces `exists:solar_system_facts,destination_code`. We just
 *    enforce shape + count. Duplicates ARE allowed (T5.6) — picking
 *    Mercury twice means two layovers at Mercury, and that's now a
 *    supported flow.
 *  - `layovers`: parallel array of integers, 1–90 days each. Length
 *    MUST match `destinations.length` (enforced by the cross-field
 *    `.refine()` on the object) — each entry is the layover for the
 *    same-index destination, so a mismatch would silently mis-pair
 *    bodies and durations.
 *  - `tripStart`: a `Date` no earlier than midnight local-time today.
 *    Trip-builder forbids past launches (Horizons coverage starts
 *    at "now"; backdated trips have no physical meaning).
 *
 * The page hands a `Date` object in; the submit handler converts it
 * to an ISO date string just before the Inertia.post (so the wire
 * payload stays JSON-friendly and PHP's `strtotime()` can parse it).
 */
export const cruiseFormSchema = z
    .object({
        destinations: z.array(z.string()).min(1).max(8),
        layovers: z.array(z.number().int().min(1).max(90)),
        tripStart: z
            .date()
            .refine((d) => d.getTime() >= startOfToday().getTime(), {
                message: 'Trip start cannot be in the past',
            }),
    })
    .refine((data) => data.layovers.length === data.destinations.length, {
        message: 'Layovers must have one entry per destination',
        path: ['layovers'],
    });

export type CruiseFormValues = z.infer<typeof cruiseFormSchema>;

/**
 * Build a `Date` at local-midnight today — the validation floor for
 * `tripStart`. Recomputed at parse-time so the rule stays correct
 * across day boundaries without a module reload.
 */
function startOfToday(): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return now;
}
