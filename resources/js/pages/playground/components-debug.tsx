import { useState } from 'react';

import { EquationCard } from '@/components/equations/EquationCard';
import { LiveResult } from '@/components/equations/LiveResult';
import { SliderInput } from '@/components/equations/SliderInput';
import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { circleArea } from '@/lib/equations/circle-area';
import { cylinderSurfaceArea } from '@/lib/equations/cylinder-surface-area';
import { relativisticSpeed } from '@/lib/equations/relativistic-speed';

/**
 * Phase 6 shared-UI-components debug surface.
 *
 * Mirrors the Phase 5 scene-debug pattern: one playground subpage that
 * composes each shipped component in isolation so its real-browser behavior
 * can be eyes-on verified before consuming pages (Phase 7+) ship. Pulled
 * forward from end-of-phase to T7 so each newly shipped component lands
 * with a verification surface; sections grow as T5 (LiveResult) and T6
 * (ExperienceCard) ship.
 *
 * Survives into v1 as an unlisted route at /playground/components-debug;
 * Phase 14 (Launch hygiene) can remove it if desired.
 */
export default function ComponentsDebug() {
    const { t } = useTranslation();
    const [demoValue, setDemoValue] = useState(50);
    const [radius, setRadius] = useState(10);
    const area = Math.PI * radius * radius;

    return (
        <AppLayout pageTitle={t('playground.componentsDebug.title')}>
            <header className="mx-auto max-w-3xl px-4 py-12">
                <h1 className="text-3xl font-bold tracking-tight">
                    {t('playground.componentsDebug.title')}
                </h1>
                <p className="mt-4 text-neutral-700">
                    {t('playground.componentsDebug.intro')}
                </p>
            </header>

            <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-8">
                <h2 className="text-2xl font-semibold">
                    {t('playground.componentsDebug.chromeSection.title')}
                </h2>
                <p className="mt-3 text-neutral-700">
                    {t('playground.componentsDebug.chromeSection.note')}
                </p>
            </section>

            <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-8">
                <h2 className="text-2xl font-semibold">
                    {t('playground.componentsDebug.equationsSection.title')}
                </h2>
                <p className="mt-3 text-neutral-700">
                    {t('playground.componentsDebug.equationsSection.intro')}
                </p>
                <div className="mt-6 space-y-6">
                    <EquationCard equation={circleArea} />
                    <EquationCard equation={relativisticSpeed} />
                    <EquationCard equation={cylinderSurfaceArea} />
                </div>
            </section>

            <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-8">
                <h2 className="text-2xl font-semibold">
                    {t('playground.componentsDebug.sliderSection.title')}
                </h2>
                <p className="mt-3 text-neutral-700">
                    {t('playground.componentsDebug.sliderSection.intro')}
                </p>
                <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                    <SliderInput
                        id="demo-slider"
                        label={t(
                            'playground.componentsDebug.sliderSection.sliderLabel',
                        )}
                        min={0}
                        max={100}
                        step={1}
                        value={demoValue}
                        onChange={setDemoValue}
                        formatValue={(v) => `${v}%`}
                        formatAriaValueText={(v) => `${v} percent`}
                    />
                </div>
            </section>

            <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-8">
                <h2 className="text-2xl font-semibold">
                    {t('playground.componentsDebug.liveResultSection.title')}
                </h2>
                <p className="mt-3 text-neutral-700">
                    {t('playground.componentsDebug.liveResultSection.intro')}
                </p>
                <div className="mt-6 space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                    <SliderInput
                        id="radius-slider"
                        label={t(
                            'playground.componentsDebug.liveResultSection.sliderLabel',
                        )}
                        min={1}
                        max={100}
                        step={1}
                        value={radius}
                        onChange={setRadius}
                        formatValue={(v) => `${v} m`}
                        formatAriaValueText={(v) => `${v} meters`}
                    />
                    <LiveResult
                        label={t(
                            'playground.componentsDebug.liveResultSection.resultLabel',
                        )}
                    >
                        {`${area.toFixed(2)} m²`}
                    </LiveResult>
                </div>
            </section>

            <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-8">
                <h2 className="text-2xl font-semibold">
                    {t(
                        'playground.componentsDebug.experienceCardPlaceholder.title',
                    )}
                </h2>
                <p className="mt-3 text-neutral-700">
                    {t(
                        'playground.componentsDebug.experienceCardPlaceholder.note',
                    )}
                </p>
            </section>
        </AppLayout>
    );
}
