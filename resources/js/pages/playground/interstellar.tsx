import { useState } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { STANDARD_GRAVITY } from '@/lib/constants';
import { destinations } from '@/lib/data/destinations';

import { DestinationSelect } from './interstellar/DestinationSelect';
import { DurationToggle } from './interstellar/DurationToggle';
import { FuelVisualization } from './interstellar/FuelVisualization';
import { ModeToggle } from './interstellar/ModeToggle';
import { ResultPanel } from './interstellar/ResultPanel';

/**
 * Interstellar experience — relativity travel agency.
 *
 * Page-level state coordinates form components + result panel:
 * - destinationId: selected destination (default = first in list)
 * - acceleration: m/s² (default = STANDARD_GRAVITY = 1g)
 * - durationMode: which clock is highlighted as primary
 * - interfaceMode: Beginner (hide math) vs Just the math (show
 *   equation card prominent)
 *
 * Acceleration is the only user-input lever. Both times (Earth +
 * proper) are derived via the registry's rocket equations
 * (interstellar-earth-time, interstellar-proper-time — added in
 * P8.T2). Distance comes from the selected destination.
 *
 * P8.T1 ships the scaffold with stub child components; P8.T3
 * promotes stubs to real interactive components; P8.T4 adds the
 * mode toggle behavior + fuel-equivalent visualization.
 *
 * Copy is placeholder; Andrew refines over the weekend.
 */
export default function InterstellarPage() {
    const { t } = useTranslation();
    const [destinationId, setDestinationId] = useState(destinations[0].id);
    const [acceleration, setAcceleration] = useState(STANDARD_GRAVITY);
    const [durationMode, setDurationMode] = useState<'subjective' | 'earth'>(
        'subjective',
    );
    const [interfaceMode, setInterfaceMode] = useState<'beginner' | 'math'>(
        'beginner',
    );
    // setAcceleration captured for P8.T3 — the real DestinationSelect/
    // ResultPanel slider lifts acceleration via this setter. Stub
    // composition doesn't update it yet.
    void setAcceleration;

    const destination =
        destinations.find((d) => d.id === destinationId) ?? destinations[0];

    return (
        <AppLayout pageTitle={t('interstellar.pageTitle')}>
            <section className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="text-4xl font-bold tracking-tight">
                    {t('interstellar.heading')}
                </h1>
                <p className="mt-4 text-lg text-neutral-700">
                    {t('interstellar.intro')}
                </p>

                <div className="mt-8">
                    <ModeToggle
                        mode={interfaceMode}
                        onChange={setInterfaceMode}
                    />
                </div>

                <div className="mt-8 space-y-6">
                    <DestinationSelect
                        destinationId={destinationId}
                        onChange={setDestinationId}
                    />
                    <DurationToggle
                        mode={durationMode}
                        onChange={setDurationMode}
                    />
                    <ResultPanel
                        destination={destination}
                        acceleration={acceleration}
                        durationMode={durationMode}
                        interfaceMode={interfaceMode}
                    />
                    <FuelVisualization
                        destination={destination}
                        acceleration={acceleration}
                    />
                </div>
            </section>
        </AppLayout>
    );
}
