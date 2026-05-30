import { DayPicker } from 'react-day-picker';

import 'react-day-picker/style.css';

import { useTranslation } from '@/hooks/useTranslation';

interface DatePickerProps {
    /** Currently-selected trip-start date (undefined = nothing picked). */
    value: Date | undefined;
    /** Bubble the next selection up to the page. */
    onChange: (date: Date | undefined) => void;
}

/**
 * DatePicker — react-day-picker v10 wrapper for the cruise trip-start
 * date. Min = today; max = today + 5 years (configurable later if the
 * Horizons ephemeris window changes).
 *
 * v10 API notes (vs v8 in older Brilliant docs):
 *  - CSS import path moved to `react-day-picker/style.css` (was
 *    `react-day-picker/dist/style.css` in v8). The dist path 404s in v10.
 *  - `fromDate` / `toDate` props renamed to `startMonth` / `endMonth`;
 *    the "no past dates" / "no far-future dates" constraints now live
 *    on the `disabled` prop via Matchers (`{ before }`, `{ after }`).
 *
 * Phase 10 T3 ships the calendar UX inline; T4 wires it to zod
 * validation + Inertia.post. Copy is PLACEHOLDER.
 */
export function DatePicker({ value, onChange }: DatePickerProps) {
    const { t } = useTranslation();

    const today = startOfToday();
    const fiveYearsOut = new Date(today);
    fiveYearsOut.setFullYear(fiveYearsOut.getFullYear() + 5);

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold text-neutral-900">
                {t('cruise.form.date.label')}
            </h3>
            <p className="text-sm text-neutral-500">
                {t('cruise.form.date.hint')}
            </p>
            <div className="rounded border border-neutral-300 bg-white p-2">
                <DayPicker
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    startMonth={today}
                    endMonth={fiveYearsOut}
                    disabled={[{ before: today }, { after: fiveYearsOut }]}
                    aria-label={t('cruise.form.date.ariaLabel')}
                />
            </div>
        </div>
    );
}

/**
 * Build a Date set to midnight local-time today. Used as the floor of
 * the allowed selection range — react-day-picker's `before` matcher
 * compares whole days, so we normalize to start-of-day to avoid
 * timezone-edge surprises where the boundary day appears disabled.
 */
function startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return today;
}
