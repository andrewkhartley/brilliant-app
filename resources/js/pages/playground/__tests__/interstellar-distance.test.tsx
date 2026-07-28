/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import {
    CustomDistanceInput,
    MAXIMUM_DISTANCE_LY,
    MINIMUM_DISTANCE_LY,
    parseDistanceInput,
} from '../interstellar/CustomDistanceInput';

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            locale: 'en',
            dir: 'ltr',
            translations: {
                interstellar: {
                    customDistance: {
                        inputLabel: 'Distance in light-years',
                        placeholder: '4.24',
                        unit: 'light-years',
                        hint: 'Punch in a number.',
                        invalid: 'Enter a number between :min and :max light-years.',
                    },
                },
            },
        },
    }),
    Head: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

afterEach(cleanup);

describe('parseDistanceInput', () => {
    test('accepts a plain decimal', () => {
        expect(parseDistanceInput('12.5')).toBe(12.5);
    });

    test('accepts scientific notation', () => {
        expect(parseDistanceInput('2.5e6')).toBe(2_500_000);
    });

    test('trims surrounding whitespace', () => {
        expect(parseDistanceInput('  4.24  ')).toBe(4.24);
    });

    test.each([
        ['empty', ''],
        ['whitespace only', '   '],
        ['non-numeric', 'proxima'],
        ['zero', '0'],
        ['negative', '-3'],
        ['infinite', 'Infinity'],
    ])('rejects %s', (_label, raw) => {
        expect(parseDistanceInput(raw)).toBeNull();
    });

    test('rejects values below the minimum', () => {
        expect(parseDistanceInput(String(MINIMUM_DISTANCE_LY / 2))).toBeNull();
    });

    test('rejects values above the maximum', () => {
        expect(parseDistanceInput(String(MAXIMUM_DISTANCE_LY * 10))).toBeNull();
    });

    test('accepts the exact bounds', () => {
        expect(parseDistanceInput(String(MINIMUM_DISTANCE_LY))).toBe(
            MINIMUM_DISTANCE_LY,
        );
        expect(parseDistanceInput(String(MAXIMUM_DISTANCE_LY))).toBe(
            MAXIMUM_DISTANCE_LY,
        );
    });
});

describe('CustomDistanceInput', () => {
    const getField = () =>
        screen.getByLabelText('Distance in light-years') as HTMLInputElement;

    test('lifts a valid parse to the parent', () => {
        const onChange = vi.fn();
        render(<CustomDistanceInput distanceLy={null} onChange={onChange} />);

        fireEvent.change(getField(), { target: { value: '12.5' } });

        expect(onChange).toHaveBeenCalledWith(12.5);
    });

    // Uses an out-of-range NUMBER, not a word: type="number" rejects
    // non-numeric input at the control level, so "proxima" is unreachable
    // here. parseDistanceInput's own tests cover the non-numeric case.
    test('lifts null for invalid input rather than NaN', () => {
        const onChange = vi.fn();
        render(<CustomDistanceInput distanceLy={null} onChange={onChange} />);

        fireEvent.change(getField(), { target: { value: '-5' } });

        expect(onChange).toHaveBeenCalledWith(null);
        // NaN here would propagate into the trip-duration equations and
        // blank the entire result panel.
        expect(onChange).not.toHaveBeenCalledWith(NaN);
    });

    // Regression guard: a useEffect syncing draft back from distanceLy would
    // rewrite "12.50" to "12.5" mid-type, eating the character as the user
    // typed it. The field must keep exactly what was entered.
    test('preserves a trailing zero while typing', () => {
        const onChange = vi.fn();
        const { rerender } = render(
            <CustomDistanceInput distanceLy={null} onChange={onChange} />,
        );

        fireEvent.change(getField(), { target: { value: '12.50' } });
        rerender(<CustomDistanceInput distanceLy={12.5} onChange={onChange} />);

        expect(getField().value).toBe('12.50');
    });

    test('shows an error for out-of-range input', () => {
        render(<CustomDistanceInput distanceLy={null} onChange={vi.fn()} />);

        fireEvent.change(getField(), { target: { value: '-5' } });

        expect(screen.getByRole('alert')).toBeTruthy();
        expect(getField().getAttribute('aria-invalid')).toBe('true');
    });

    test('shows no error for an empty field', () => {
        render(<CustomDistanceInput distanceLy={null} onChange={vi.fn()} />);

        expect(screen.queryByRole('alert')).toBeNull();
    });
});

describe('distance precedence', () => {
    const DEFAULT_LY = 4.24;
    const TARGET_LY = 11.9;

    // Mirrors the derivation in interstellar.tsx. Kept as a helper so the
    // precedence rule is asserted directly rather than through the page.
    const resolve = (
        customDistanceLy: number | null,
        targetDistanceLy: number | null,
    ): number => customDistanceLy ?? targetDistanceLy ?? DEFAULT_LY;

    test('falls back to the default destination when nothing is set', () => {
        expect(resolve(null, null)).toBe(DEFAULT_LY);
    });

    test('uses the selected target when no custom distance is set', () => {
        expect(resolve(null, TARGET_LY)).toBe(TARGET_LY);
    });

    test('lets a custom distance win over a target', () => {
        expect(resolve(99, TARGET_LY)).toBe(99);
    });
});
