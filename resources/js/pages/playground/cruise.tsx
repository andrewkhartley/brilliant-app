import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { SubmitEvent } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { cruiseFormSchema } from '@/lib/validation/cruise-form-schema';
import type { CruiseFormValues } from '@/lib/validation/cruise-form-schema';
import cruiseRoutes from '@/routes/playground/cruise';

import { DatePicker } from './cruise/DatePicker';
import { DestinationPicker } from './cruise/DestinationPicker';
import type { Destination } from './cruise/DestinationPicker';

interface CruisePageProps {
    /**
     * Destination catalog from the controller — `{code, name}` shape
     * keeps the wire payload small. The full physical facts live
     * server-side in `solar_system_facts` and are only resolved at
     * trip-build time (T5 wiring).
     */
    destinations: Destination[];
}

/**
 * Wire shape we hand Inertia.post — derived from the zod-inferred
 * `CruiseFormValues` with `tripStart` stringified to YYYY-MM-DD so
 * PHP's `strtotime()` parses it cleanly and the wire payload stays
 * JSON-friendly. Deriving via `Omit` keeps the payload in sync with
 * the schema: a field added to `cruiseFormSchema` shows up here
 * automatically (caught at compile time if the post-transform path
 * doesn't account for it).
 */
type CruiseFormPayload = Omit<CruiseFormValues, 'tripStart'> & {
    tripStart: string;
};

/**
 * /playground/cruise — Andrew's interplanetary trip planner.
 *
 * T3 made the form interactive (state + visible UI); T4 wires the
 * data path:
 *  1. zod validates the local form state on submit; failures populate
 *     the `errors` map and short-circuit before any HTTP request.
 *  2. On a clean parse, the validated payload (with `tripStart`
 *     stringified to YYYY-MM-DD) flies via `router.post` to the named
 *     `playground.cruise.store` route.
 *  3. Server-side `StoreCruiseRequest` re-validates (defense in depth).
 *     On failure, Inertia returns 302 with an error bag; `onError`
 *     mirrors those into the same `errors` map the zod path uses.
 *  4. On success, the controller redirects to `/playground/cruise/review`
 *     (T5's territory — currently 404s by design).
 *
 * Error display surface: per-field inline messages below each
 * picker, plus a summary block above the submit button so screen
 * readers find the failure announcement first.
 *
 * Copy is PLACEHOLDER — Andrew refines over the weekend; the
 * translation key structure is what's load-bearing.
 */
export default function CruisePage({ destinations }: CruisePageProps) {
    const { t } = useTranslation();
    // `usePage().props.errors` is auto-shared by Inertia v3 after any
    // 302-with-error-bag response. Typed as `Errors & ErrorBag` upstream.
    const page = usePage();
    const [selected, setSelected] = useState<string[]>([]);
    const [tripStart, setTripStart] = useState<Date | undefined>(undefined);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );

    // Server-side errors come in via Inertia's shared `errors` prop
    // (Inertia v3 auto-shares them after a 302-with-errors). Merge
    // client-side errors over server-side so a fresh client-validation
    // failure replaces the stale server message for the same field.
    // Client values are translation keys (zod → i18n); server values
    // are already-formatted Laravel validation strings. `displayError`
    // routes each through `t()` (which falls back to the input when
    // lookup fails — so server strings render verbatim).
    const errors: Record<string, string> = {
        ...page.props.errors,
        ...clientErrors,
    };

    function displayError(field: string): string | undefined {
        const raw = errors[field];

        return raw === undefined ? undefined : t(raw);
    }

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const parsed = cruiseFormSchema.safeParse({
            destinations: selected,
            tripStart,
        });

        if (!parsed.success) {
            const fieldErrors: Record<string, string> = {};

            for (const issue of parsed.error.issues) {
                const path = issue.path.join('.');

                // First message per field wins (matches Laravel's
                // bag-first-message convention).
                if (!fieldErrors[path]) {
                    fieldErrors[path] = mapZodMessage(path, issue.code);
                }
            }

            setClientErrors(fieldErrors);

            return;
        }

        const payload: CruiseFormPayload = {
            destinations: parsed.data.destinations,
            tripStart: toISODate(parsed.data.tripStart),
        };

        router.post(cruiseRoutes.store().url, payload, {
            onError: (serverErrors) => setClientErrors(serverErrors),
            onSuccess: () => setClientErrors({}),
        });
    }

    const canSubmit = selected.length > 0 && tripStart !== undefined;
    const hasErrors = Object.keys(errors).length > 0;

    return (
        <AppLayout pageTitle={t('cruise.title')}>
            <section className="mx-auto max-w-3xl px-4 py-12">
                <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                    {t('cruise.title')}
                </h1>
                <p className="mt-4 text-lg text-neutral-700">
                    {t('cruise.lead')}
                </p>

                <form onSubmit={handleSubmit} className="mt-10 space-y-10">
                    <div>
                        <DestinationPicker
                            destinations={destinations}
                            selected={selected}
                            onChange={setSelected}
                        />
                        {displayError('destinations') && (
                            <p
                                role="alert"
                                className="mt-2 text-sm text-red-700"
                            >
                                {displayError('destinations')}
                            </p>
                        )}
                    </div>

                    <div>
                        <DatePicker value={tripStart} onChange={setTripStart} />
                        {displayError('tripStart') && (
                            <p
                                role="alert"
                                className="mt-2 text-sm text-red-700"
                            >
                                {displayError('tripStart')}
                            </p>
                        )}
                    </div>

                    {hasErrors && (
                        <div
                            role="alert"
                            className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800"
                        >
                            <p className="font-semibold">
                                {t('cruise.form.errors.summaryHeading')}
                            </p>
                            <ul className="mt-2 list-disc pl-5">
                                {Object.keys(errors).map((field) => (
                                    <li key={field}>{displayError(field)}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="rounded bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
                        >
                            {t('cruise.form.submit')}
                        </button>
                        {!canSubmit && (
                            <p className="mt-2 text-sm text-neutral-500">
                                {t('cruise.form.submitDisabledHint')}
                            </p>
                        )}
                    </div>
                </form>
            </section>
        </AppLayout>
    );
}

/**
 * Map a zod issue (field path + code) to a friendly translation key.
 * Falls back to a generic per-field message if the (path, code) pair
 * isn't recognized — keeps the UI from showing zod's raw English
 * message ("Array must contain at least 1 element(s)") which would
 * leak the validator's voice into Andrew's locked tone.
 */
function mapZodMessage(path: string, code: string): string {
    if (path === 'destinations' && code === 'too_small') {
        return 'cruise.form.errors.destinations.min';
    }

    if (path === 'destinations' && code === 'too_big') {
        return 'cruise.form.errors.destinations.max';
    }

    if (path === 'tripStart') {
        return 'cruise.form.errors.tripStart.past';
    }

    if (path.startsWith('destinations.')) {
        return 'cruise.form.errors.destinations.invalid';
    }

    return 'cruise.form.errors.destinations.invalid';
}

/**
 * Stringify a `Date` to a YYYY-MM-DD wire format. `toISOString()` would
 * include the time-of-day + UTC offset (and shift the calendar date by
 * a day for users in negative UTC offsets); a plain YYYY-MM-DD avoids
 * both pitfalls and is what PHP's `strtotime()` parses most cleanly.
 */
function toISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
