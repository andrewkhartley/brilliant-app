import type { ChangeEvent } from 'react';

interface SliderInputProps {
    id: string;
    label: string;
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (value: number) => void;
    formatValue?: (value: number) => string;
    formatAriaValueText?: (value: number) => string;
}

/**
 * Accessible controlled range input — label + slider + live numeric display.
 *
 * Composition primitive: SliderInput owns interaction only. Pair with
 * <EquationCard /> (renders the formula) and <LiveResult /> (announces the
 * computed result) as siblings in Phase 8's interactive math compositions.
 * Keeping these three components independent means a static About-page
 * equation can mount EquationCard alone without dragging in slider machinery,
 * and a sliders-only demo can mount SliderInput without KaTeX.
 *
 * Accessibility:
 * - `aria-valuetext` on the input announces the formatted value (with units)
 *   on every change — e.g. "150 megabytes" instead of the bare numeric
 *   "150000000" that screen readers would otherwise read from the raw value.
 *   Set unconditionally with a fallback chain (`formatAriaValueText ?? formatValue`)
 *   so AT always gets a sensible announcement even if the consumer only
 *   supplies the visual formatter.
 * - Browser-default keyboard handling: arrow keys step by `step`, PageUp/Down
 *   step by ~10*step, Home/End jump to min/max. We deliberately do NOT bind
 *   an `onKeyDown` ourselves — adding one would risk intercepting or
 *   double-firing these defaults. Tested by Andrew with eyes-on in the
 *   browser (jsdom doesn't simulate native range-input keyboard behavior).
 * - `<label htmlFor={id}>` associates the visible label with the input so
 *   screen readers announce them together.
 * - `<output htmlFor={id}>` semantically links the live numeric display to
 *   the slider; some browsers expose this association to AT.
 *
 * Controlled component: the parent owns `value` and rerenders on `onChange`.
 * SliderInput holds no internal state — single source of truth lives upstream
 * (typically a useState in the composition page, soon a useEquation hook).
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function SliderInput({
    id,
    label,
    min,
    max,
    step = 1,
    value,
    onChange,
    formatValue = (v) => v.toString(),
    formatAriaValueText,
}: SliderInputProps) {
    const formatted = formatValue(value);
    const ariaValueText = (formatAriaValueText ?? formatValue)(value);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(Number(event.target.value));
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label
                    htmlFor={id}
                    className="text-sm font-medium text-neutral-700"
                >
                    {label}
                </label>
                <output
                    htmlFor={id}
                    className="font-mono text-sm text-neutral-900"
                >
                    {formatted}
                </output>
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                aria-valuetext={ariaValueText}
                className="mt-2 w-full"
            />
        </div>
    );
}
