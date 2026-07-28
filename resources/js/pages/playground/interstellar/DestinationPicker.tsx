import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTranslation } from '@/hooks/useTranslation';

import { CustomDistanceInput } from './CustomDistanceInput';
import { StarSearch } from './StarSearch';
import type { InterstellarTarget } from './StarSearch';

type PickerMode = 'search' | 'custom';

interface DestinationPickerProps {
    activeDistanceLy: number;
    activeName: string;
    activeSource: string;
    customDistanceLy: number | null;
    onCustomDistanceChange: (distanceLy: number | null) => void;
    onTargetSelect: (target: InterstellarTarget) => void;
    selectedTarget: InterstellarTarget | null;
}

export function DestinationPicker({
    activeDistanceLy,
    activeName,
    activeSource,
    customDistanceLy,
    onCustomDistanceChange,
    onTargetSelect,
    selectedTarget,
}: DestinationPickerProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    // Opening straight into the mode the current selection came from means
    // reopening the picker never silently discards what the user set.
    const [mode, setMode] = useState<PickerMode>(
        customDistanceLy === null ? 'search' : 'custom',
    );

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
                        distance: formatLightYears(activeDistanceLy),
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
                                <div
                                    role="radiogroup"
                                    aria-label={t(
                                        'interstellar.destinationPicker.modeLabel',
                                    )}
                                    className="flex gap-2 rounded-lg border border-cyan-100/12 bg-cyan-50/5 p-1"
                                >
                                    <ModeButton
                                        isActive={mode === 'search'}
                                        label={t(
                                            'interstellar.destinationPicker.modeSearch',
                                        )}
                                        onSelect={() => setMode('search')}
                                    />
                                    <ModeButton
                                        isActive={mode === 'custom'}
                                        label={t(
                                            'interstellar.destinationPicker.modeCustom',
                                        )}
                                        onSelect={() => setMode('custom')}
                                    />
                                </div>

                                {/*
                                 * The custom panel deliberately does not close
                                 * the modal on change — typing "1", "12",
                                 * "12.5" would slam it shut on the first
                                 * keystroke. Escape, the close button, and the
                                 * backdrop all still work.
                                 */}
                                {mode === 'search' ? (
                                    <StarSearch
                                        selectedTarget={selectedTarget}
                                        onSelect={(target) => {
                                            onTargetSelect(target);
                                            setIsOpen(false);
                                        }}
                                    />
                                ) : (
                                    <CustomDistanceInput
                                        distanceLy={customDistanceLy}
                                        onChange={onCustomDistanceChange}
                                    />
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}

interface ModeButtonProps {
    isActive: boolean;
    label: string;
    onSelect: () => void;
}

function ModeButton({ isActive, label, onSelect }: ModeButtonProps) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={onSelect}
            className={`flex-1 cursor-pointer rounded px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                isActive
                    ? 'bg-cyan-200 text-slate-950'
                    : 'text-cyan-100 hover:bg-cyan-50/10'
            }`}
        >
            {label}
        </button>
    );
}

function formatLightYears(distanceLy: number): string {
    return distanceLy.toLocaleString(undefined, {
        maximumFractionDigits: distanceLy >= 1000 ? 0 : 2,
    });
}
