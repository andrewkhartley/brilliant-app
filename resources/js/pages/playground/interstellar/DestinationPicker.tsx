import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTranslation } from '@/hooks/useTranslation';

import { DestinationSelect } from './DestinationSelect';
import { StarSearch } from './StarSearch';
import type { InterstellarTarget } from './StarSearch';

interface DestinationPickerProps {
    activeDistanceLy: number;
    activeName: string;
    activeSource: string;
    destinationId: string;
    onDestinationChange: (id: string) => void;
    onTargetSelect: (target: InterstellarTarget) => void;
    selectedTarget: InterstellarTarget | null;
}

export function DestinationPicker({
    activeDistanceLy,
    activeName,
    activeSource,
    destinationId,
    onDestinationChange,
    onTargetSelect,
    selectedTarget,
}: DestinationPickerProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="block w-full cursor-pointer rounded-lg border border-cyan-100/15 bg-slate-950/72 p-4 text-left shadow-lg shadow-black/18 backdrop-blur-md transition hover:border-cyan-200/38 hover:bg-cyan-50/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
                <span className="flex items-center justify-between gap-4">
                    <span>
                        <span className="block text-sm font-semibold text-cyan-100">
                            {t('interstellar.destinationPicker.label')}
                        </span>
                        <span className="mt-2 block text-lg font-semibold text-white">
                            {activeName}
                        </span>
                    </span>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-cyan-100/18 bg-cyan-200/12 text-cyan-100">
                        <i aria-hidden="true" className="fa-solid fa-stars" />
                    </span>
                </span>
                <span className="mt-3 block font-mono text-xs leading-5 text-cyan-50/62">
                    {t('interstellar.destinationPicker.summary', {
                        distance: activeDistanceLy.toFixed(2),
                        source: activeSource,
                    })}
                </span>
            </button>

            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={t(
                            'interstellar.destinationPicker.modalTitle',
                        )}
                        className="fixed inset-0 z-[240] flex items-center justify-center bg-slate-950/92 p-4 backdrop-blur-xl"
                    >
                        <button
                            type="button"
                            aria-label={t(
                                'interstellar.destinationPicker.close',
                            )}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 cursor-default"
                        />
                        <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-cyan-100/18 bg-[#07101d] p-5 shadow-2xl shadow-black/70 sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/72 uppercase">
                                        {t(
                                            'interstellar.destinationPicker.modalEyebrow',
                                        )}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-semibold tracking-normal text-white">
                                        {t(
                                            'interstellar.destinationPicker.modalTitle',
                                        )}
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-cyan-50/64">
                                        {t(
                                            'interstellar.destinationPicker.modalBody',
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    aria-label={t(
                                        'interstellar.destinationPicker.close',
                                    )}
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded border border-cyan-100/12 bg-cyan-50/5 text-cyan-100 transition hover:bg-cyan-50/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <i
                                        aria-hidden="true"
                                        className="fa-solid fa-xmark"
                                    />
                                </button>
                            </div>

                            <div className="mt-6 space-y-4">
                                <DestinationSelect
                                    destinationId={destinationId}
                                    onChange={(id) => {
                                        onDestinationChange(id);
                                        setIsOpen(false);
                                    }}
                                />
                                <StarSearch
                                    selectedTarget={selectedTarget}
                                    onSelect={(target) => {
                                        onTargetSelect(target);
                                        setIsOpen(false);
                                    }}
                                />
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
