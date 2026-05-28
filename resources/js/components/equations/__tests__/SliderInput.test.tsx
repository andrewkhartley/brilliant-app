/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { SliderInput } from '../SliderInput';

// SliderInput requires no @inertiajs/react mock — it has no useTranslation
// dependency. All strings (label + formatted value) come from props, which
// keeps the primitive layout-agnostic and trivially testable.
//
// JSDOM constraint: native <input type="range"> keyboard behavior (arrow keys,
// PageUp/Down, Home/End) is browser-default and NOT implemented by jsdom.
// Firing keyDown events here would not change the input's value or fire
// onChange. Those keyboard interactions are verified later by Andrew with
// eyes-on testing in the browser at /playground/components-debug (T7).
// Here we test what the COMPONENT does, not what the BROWSER does.

describe('SliderInput', () => {
    afterEach(() => {
        cleanup();
    });

    test('renders label associated with input via htmlFor/id', () => {
        // <label htmlFor={id}> is the foundational a11y association — without
        // it, screen readers announce the slider without context.
        render(
            <SliderInput
                id="velocity"
                label="Velocity"
                min={0}
                max={100}
                value={50}
                onChange={() => {}}
            />,
        );
        const label = screen.queryByText('Velocity');
        expect(label?.tagName).toBe('LABEL');
        expect(label?.getAttribute('for')).toBe('velocity');
    });

    test('renders current value via default formatValue (Number.toString)', () => {
        // When no formatValue is supplied, the value renders as its plain
        // string representation. This is the zero-config baseline.
        render(
            <SliderInput
                id="x"
                label="X"
                min={0}
                max={100}
                value={42}
                onChange={() => {}}
            />,
        );

        expect(screen.queryByText('42')).not.toBeNull();
    });

    test('renders custom formatValue output', () => {
        // formatValue lets the consumer attach units, percent signs, or any
        // domain-specific rendering — proving the formatter is actually
        // invoked rather than the default Number.toString winning.
        const format = (v: number) => `${v}%`;

        render(
            <SliderInput
                id="x"
                label="X"
                min={0}
                max={100}
                value={42}
                onChange={() => {}}
                formatValue={format}
            />,
        );

        expect(screen.queryByText('42%')).not.toBeNull();
    });

    test('aria-valuetext reflects formatValue by default', () => {
        // When only formatValue is provided, aria-valuetext should fall back
        // to it — guaranteeing AT users always hear the formatted value, not
        // the bare numeric the browser would otherwise announce.
        render(
            <SliderInput
                id="x"
                label="X"
                min={0}
                max={100}
                value={42}
                onChange={() => {}}
                formatValue={(v) => `${v}%`}
            />,
        );
        const input = screen.queryByRole('slider');

        expect(input?.getAttribute('aria-valuetext')).toBe('42%');
    });

    test('custom formatAriaValueText overrides formatValue for the announcement', () => {
        // Visual and audio formatting can diverge — "42%" reads cleanly on
        // screen but "42 percent" announces more naturally. The override
        // proves the fallback chain prefers the explicit aria formatter.
        render(
            <SliderInput
                id="x"
                label="X"
                min={0}
                max={100}
                value={42}
                onChange={() => {}}
                formatValue={(v) => `${v}%`}
                formatAriaValueText={(v) => `${v} percent`}
            />,
        );
        const input = screen.queryByRole('slider');

        expect(input?.getAttribute('aria-valuetext')).toBe('42 percent');
    });

    test('onChange fires with parsed numeric value when input changes', () => {
        // The DOM event carries event.target.value as a string. The component
        // must coerce to Number before invoking onChange so consumers get a
        // typed numeric — the typeof assertion guards against a future
        // refactor accidentally passing the raw string through.
        const onChange = vi.fn();

        render(
            <SliderInput
                id="x"
                label="X"
                min={0}
                max={100}
                value={50}
                onChange={onChange}
            />,
        );
        const input = screen.getByRole('slider');
        fireEvent.change(input, { target: { value: '75' } });

        expect(onChange).toHaveBeenCalledWith(75);
        expect(typeof onChange.mock.calls[0][0]).toBe('number');
    });

    test('renders correct min, max, step attributes on the native input', () => {
        // min/max/step flow straight through to the native element. The
        // browser uses these for keyboard increments and bounds clamping;
        // dropping any of them would silently break native behavior.
        render(
            <SliderInput
                id="x"
                label="X"
                min={10}
                max={200}
                step={5}
                value={50}
                onChange={() => {}}
            />,
        );
        const input = screen.getByRole('slider');

        expect(input.getAttribute('min')).toBe('10');
        expect(input.getAttribute('max')).toBe('200');
        expect(input.getAttribute('step')).toBe('5');
    });
});
