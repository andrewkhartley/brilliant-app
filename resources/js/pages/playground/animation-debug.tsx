import { useEffect, useMemo, useState } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

import { CruiseLaunchOverlay } from './cruise/CruiseLaunchOverlay';
import type { Destination, SelectedSlot } from './cruise/DestinationPicker';

interface AnimationDebugPageProps {
    destinations: Destination[];
}

type AnimationKey = 'cruise-launch';

const ANIMATIONS: Array<{
    key: AnimationKey;
    title: string;
    description: string;
}> = [
    {
        key: 'cruise-launch',
        title: 'Cruise launch overlay',
        description: 'Full-frame plotting animation used after trip submit.',
    },
];

export default function AnimationDebugPage({
    destinations,
}: AnimationDebugPageProps) {
    const { t } = useTranslation();
    const [activeAnimation, setActiveAnimation] = useState<AnimationKey | null>(
        null,
    );
    const selected = useMemo(
        () => buildPreviewSlots(destinations),
        [destinations],
    );
    const tripStart = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() + 42);

        return date;
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setActiveAnimation(null);
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <AppLayout pageTitle={t('playground.animationDebug.title')}>
            {activeAnimation === 'cruise-launch' && (
                <CruiseLaunchOverlay
                    destinations={destinations}
                    selected={selected}
                    tripStart={tripStart}
                />
            )}

            <section className="mx-auto max-w-4xl px-4 py-12">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                            {t('playground.animationDebug.title')}
                        </h1>
                        <p className="mt-3 max-w-2xl text-lg text-neutral-700">
                            {t('playground.animationDebug.lead')}
                        </p>
                    </div>
                    <p className="text-sm font-medium text-neutral-500">
                        {t('playground.animationDebug.escapeHint')}
                    </p>
                </div>

                <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                    {ANIMATIONS.map((animation) => (
                        <li
                            key={animation.key}
                            className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
                        >
                            <h2 className="text-xl font-semibold text-neutral-900">
                                {animation.title}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-neutral-600">
                                {animation.description}
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveAnimation(animation.key)
                                }
                                className="mt-5 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                {t('playground.animationDebug.previewButton')}
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </AppLayout>
    );
}

function buildPreviewSlots(destinations: Destination[]): SelectedSlot[] {
    const preferredCodes = ['mar', 'jup', 'sat', 'nep'];
    const preferred = preferredCodes
        .map((code) =>
            destinations.find((destination) => destination.code === code),
        )
        .filter(
            (destination): destination is Destination =>
                destination !== undefined,
        );
    const fallback = destinations.slice(0, 4);
    const previewDestinations = preferred.length >= 3 ? preferred : fallback;

    return previewDestinations.map((destination, index) => ({
        slotId: `preview-${destination.code}-${index}`,
        code: destination.code,
        layoverDays: 5 + index * 4,
    }));
}
