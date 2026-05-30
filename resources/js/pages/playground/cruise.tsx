import { useState } from 'react';
import type { SubmitEvent } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

import { DatePicker } from './cruise/DatePicker';
import { DestinationPicker } from './cruise/DestinationPicker';
import type { Destination } from './cruise/DestinationPicker';

interface CruisePageProps {
    /**
     * Destination catalog from the controller — `{code, name}` shape
     * keeps the wire payload small. The full physical facts live
     * server-side in `solar_system_facts` and are only resolved at
     * trip-build time (T4 wiring).
     */
    destinations: Destination[];
}

/**
 * /playground/cruise — Andrew's interplanetary trip planner.
 *
 * Phase 10 T3 promotes the T1 scaffold stub into a real interactive
 * form. Page-level state:
 *  - `selected: string[]` — ordered destination codes (the itinerary)
 *  - `tripStart: Date | undefined` — departure date
 *
 * Composition:
 *  - <DestinationPicker> — dnd-kit Sortable + add-button rail
 *  - <DatePicker> — react-day-picker v10 wrapper, today → today + 5y
 *  - <Submit> — T3 just console.logs the payload; T4 swaps in
 *    `router.post(route('playground.cruise.store'), …)`
 *
 * The Submit handler intentionally does NO validation in T3 — that
 * lands in T4 alongside the zod schema + the PHP StoreCruiseRequest.
 * The point of T3 is the visible UI scaffold; T4 is the data path.
 *
 * Copy is PLACEHOLDER — Andrew refines over the weekend; the
 * translation key structure is what's load-bearing.
 */
export default function CruisePage({ destinations }: CruisePageProps) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<string[]>([]);
    const [tripStart, setTripStart] = useState<Date | undefined>(undefined);

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        // T4 replaces this with `router.post(route('playground.cruise.store'), {…})`.
        // T3 logs the would-be payload so the form's contract is visible
        // in DevTools during the eyes-on browser check.
        console.log('[cruise:T3] would-submit payload', {
            destinations: selected,
            tripStart: tripStart?.toISOString() ?? null,
        });
    }

    const canSubmit = selected.length > 0 && tripStart !== undefined;

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
                    <DestinationPicker
                        destinations={destinations}
                        selected={selected}
                        onChange={setSelected}
                    />

                    <DatePicker value={tripStart} onChange={setTripStart} />

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
