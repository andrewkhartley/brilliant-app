import { useState } from 'react';

import { useTranslation } from '@/hooks/useTranslation';

/** Below this, the relativistic phase math stops being meaningful. */
export const MINIMUM_DISTANCE_LY = 0.01;

/** Roughly 20x the radius of the observable universe — a sanity ceiling, not physics. */
export const MAXIMUM_DISTANCE_LY = 1e9;

/**
 * Parses raw input into a usable light-year distance, or null.
 *
 * Null rather than NaN is deliberate: NaN would propagate silently through
 * the trip-duration equations and blank the entire result panel. Null lets
 * the page fall back to its default destination.
 */
export function parseDistanceInput(raw: string): number | null {
    const trimmed = raw.trim();

    if (trimmed === '') {
        return null;
    }

    const parsed = Number(trimmed);

    if (!Number.isFinite(parsed)) {
        return null;
    }

    if (parsed < MINIMUM_DISTANCE_LY || parsed > MAXIMUM_DISTANCE_LY) {
        return null;
    }

    return parsed;
}

interface CustomDistanceInputProps {
    distanceLy: number | null;
    onChange: (distanceLy: number | null) => void;
}

/**
 * Free numeric distance entry for the Interstellar planner.
 *
 * Local `draft` state holds exactly what the user typed so partial input
 * ("4.", "2e", "12.50") stays editable; only a valid parse lifts through
 * onChange.
 *
 * There is deliberately NO effect syncing `draft` back from `distanceLy`.
 * The picker renders this component only in custom mode, so switching modes
 * unmounts it and `useState`'s initializer handles resync on the way back
 * in. A sync effect would also actively corrupt input mid-type: entering
 * "12.50" would parse to 12.5 and rewrite the field, eating the trailing
 * zero as the user typed it.
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function CustomDistanceInput({
    distanceLy,
    onChange,
}: CustomDistanceInputProps) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState(
        distanceLy === null ? '' : String(distanceLy),
    );

    const isInvalid = draft.trim() !== '' && parseDistanceInput(draft) === null;

    const handleChange = (value: string) => {
        setDraft(value);
        onChange(parseDistanceInput(value));
    };

    return (
        <div className="space-y-3 rounded-lg border border-cyan-100/15 bg-slate-950/72 p-4 backdrop-blur-md">
            <label
                htmlFor="interstellar-custom-distance"
                className="block text-sm font-semibold text-cyan-100"
            >
                {t('interstellar.customDistance.inputLabel')}
            </label>
            <div className="relative">
                <input
                    id="interstellar-custom-distance"
                    type="number"
                    inputMode="decimal"
                    min={MINIMUM_DISTANCE_LY}
                    max={MAXIMUM_DISTANCE_LY}
                    step="any"
                    value={draft}
                    onChange={(event) => handleChange(event.target.value)}
                    placeholder={t('interstellar.customDistance.placeholder')}
                    aria-invalid={isInvalid}
                    aria-describedby="interstellar-custom-distance-hint"
                    className="block w-full rounded border border-cyan-100/25 bg-slate-950/80 py-2 ps-3 pe-28 text-base text-white placeholder:text-cyan-50/38 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                />
                <span className="pointer-events-none absolute top-1/2 end-3 -translate-y-1/2 font-mono text-xs text-cyan-100/62">
                    {t('interstellar.customDistance.unit')}
                </span>
            </div>

            <p
                id="interstellar-custom-distance-hint"
                className="text-xs leading-5 text-cyan-100/58"
            >
                {t('interstellar.customDistance.hint')}
            </p>

            {isInvalid && (
                <p role="alert" className="text-xs font-semibold text-rose-200">
                    {t('interstellar.customDistance.invalid', {
                        min: String(MINIMUM_DISTANCE_LY),
                        max: MAXIMUM_DISTANCE_LY.toLocaleString(),
                    })}
                </p>
            )}
        </div>
    );
}
