import { describe, expect, it } from 'vitest';

import { cruiseFormSchema } from '../cruise-form-schema';

/**
 * Helper — a Date at local-midnight today. Matches the floor the
 * schema's refine() uses, so "today" is always a valid trip start.
 */
function today(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);

    return d;
}

/**
 * Helper — a Date `offsetDays` from today at noon. Noon avoids any
 * midnight/DST edge cases the comparison might trip on; the schema
 * compares Date.getTime() so the time component only matters for the
 * "past vs today" boundary, which we cover via the past-date case.
 */
function daysFromNow(offsetDays: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(12, 0, 0, 0);

    return d;
}

describe('cruiseFormSchema', () => {
    it('accepts a valid trip — non-empty destinations and a future date', () => {
        const result = cruiseFormSchema.safeParse({
            destinations: ['mer', 'ven', 'mar'],
            tripStart: daysFromNow(7),
        });

        expect(result.success).toBe(true);
    });

    it('rejects an empty destinations list (min 1)', () => {
        const result = cruiseFormSchema.safeParse({
            destinations: [],
            tripStart: daysFromNow(7),
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(
                result.error.issues.some((i) => i.path[0] === 'destinations'),
            ).toBe(true);
        }
    });

    it('rejects more than 8 destinations (max 8)', () => {
        const result = cruiseFormSchema.safeParse({
            destinations: [
                'mer',
                'ven',
                'ear',
                'mar',
                'jup',
                'sat',
                'ura',
                'nep',
                'plu',
            ],
            tripStart: daysFromNow(7),
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(
                result.error.issues.some((i) => i.path[0] === 'destinations'),
            ).toBe(true);
        }
    });

    it('rejects a past trip-start date', () => {
        const result = cruiseFormSchema.safeParse({
            destinations: ['mer'],
            tripStart: daysFromNow(-1),
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(
                result.error.issues.some((i) => i.path[0] === 'tripStart'),
            ).toBe(true);
        }
    });

    it('accepts a trip starting at midnight today (boundary case)', () => {
        const result = cruiseFormSchema.safeParse({
            destinations: ['mer'],
            tripStart: today(),
        });

        expect(result.success).toBe(true);
    });
});
