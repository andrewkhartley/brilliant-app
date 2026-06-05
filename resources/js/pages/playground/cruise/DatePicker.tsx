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
            <h3 className="text-lg font-semibold text-white">
                {t('cruise.form.date.label')}
            </h3>
            <p className="text-sm leading-6 text-slate-300">
                {t('cruise.form.date.hint')}
            </p>
            <div className="w-full overflow-x-auto rounded border border-cyan-100/20 bg-slate-950/70 p-3 text-slate-100 shadow-sm [--rdp-accent-background-color:rgba(103,232,249,0.18)] [--rdp-accent-color:#a5f3fc]">
                <DayPicker
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    startMonth={today}
                    endMonth={fiveYearsOut}
                    disabled={[{ before: today }, { after: fiveYearsOut }]}
                    aria-label={t('cruise.form.date.ariaLabel')}
                    classNames={{
                        root: 'relative w-full',
                        months: 'w-full',
                        month: 'w-full',
                        month_caption:
                            'mb-5 flex min-h-11 items-center pr-28 text-white',
                        caption_label: 'text-xl font-bold',
                        nav: 'absolute right-0 top-0 flex items-center gap-2',
                        button_previous:
                            'inline-flex size-11 cursor-pointer items-center justify-center rounded border border-cyan-100/20 bg-white/5 text-cyan-200 transition-colors hover:bg-cyan-200 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-35',
                        button_next:
                            'inline-flex size-11 cursor-pointer items-center justify-center rounded border border-cyan-100/20 bg-white/5 text-cyan-200 transition-colors hover:bg-cyan-200 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-35',
                        chevron: 'fill-current',
                        month_grid:
                            'w-full table-fixed border-separate border-spacing-y-2',
                        weekdays: 'text-slate-300',
                        weekday:
                            'pb-2 text-center text-sm font-bold text-slate-300',
                        week: '',
                        day: 'text-center align-middle text-slate-300',
                        day_button:
                            'mx-auto flex h-12 w-full max-w-16 cursor-pointer items-center justify-center rounded-full text-lg font-semibold text-slate-300 transition-colors hover:bg-cyan-200/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed',
                        selected:
                            '[&>button]:bg-cyan-200 [&>button]:text-slate-950 [&>button]:shadow-[0_0_18px_rgba(103,232,249,0.35)]',
                        today: '[&>button]:border-2 [&>button]:border-cyan-200/85',
                        disabled: 'opacity-25',
                        outside: 'text-slate-600',
                    }}
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
