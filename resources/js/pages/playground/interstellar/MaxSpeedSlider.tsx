import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { SliderInput } from '@/components/equations/SliderInput';
import { useTranslation } from '@/hooks/useTranslation';
import { SPEED_OF_LIGHT } from '@/lib/constants';

const RELATIVISTIC_LIMIT_MPS = SPEED_OF_LIGHT * 0.99999999;

interface MaxSpeedSliderProps {
    allowRelativisticLimit: boolean;
    fuelMaxVelocityMps: number;
    maxSpeed: number;
    onChange: (value: number) => void;
    onRelativisticLimitChange: (value: boolean) => void;
}

type SpeedEditMode = 'percentC' | 'kmps';

/**
 * MaxSpeedSlider picks the cruise speed cap. Normal mode respects the
 * selected fuel's practical ceiling; expanded mode lets the user explore
 * near-c travel scenarios as a thought experiment.
 */
export function MaxSpeedSlider({
    allowRelativisticLimit,
    fuelMaxVelocityMps,
    maxSpeed,
    onChange,
    onRelativisticLimitChange,
}: MaxSpeedSliderProps) {
    const { t } = useTranslation();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editMode, setEditMode] = useState<SpeedEditMode>('percentC');
    const sliderMax = allowRelativisticLimit
        ? RELATIVISTIC_LIMIT_MPS
        : fuelMaxVelocityMps;
    const sliderValue = Math.min(maxSpeed, sliderMax);
    const step = Math.max(1, Math.round(sliderMax / 200));

    useEffect(() => {
        if (maxSpeed > sliderMax) {
            onChange(sliderMax);
        }
    }, [maxSpeed, onChange, sliderMax]);

    useEffect(() => {
        if (!isEditOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsEditOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditOpen]);

    const editValue = useMemo(
        () =>
            editMode === 'percentC'
                ? ((sliderValue / SPEED_OF_LIGHT) * 100).toFixed(6)
                : (sliderValue / 1000).toFixed(0),
        [editMode, sliderValue],
    );

    const applyEditValue = (rawValue: string) => {
        const numericValue = Number(rawValue);

        if (!Number.isFinite(numericValue)) {
            return;
        }

        const nextSpeed =
            editMode === 'percentC'
                ? (numericValue / 100) * SPEED_OF_LIGHT
                : numericValue * 1000;

        onChange(Math.min(sliderMax, Math.max(1, nextSpeed)));
    };

    return (
        <div className="space-y-5">
            <SliderInput
                id="max-speed-slider"
                label={t('interstellar.maxSpeedSlider.label')}
                min={step}
                max={sliderMax}
                step={step}
                value={sliderValue}
                onChange={onChange}
                stackValue
                onValueClick={() => setIsEditOpen(true)}
                valueButtonLabel={t('interstellar.maxSpeedSlider.editValue')}
                formatValue={(v) =>
                    t('interstellar.maxSpeedSlider.valueFormat', {
                        value: formatKmps(v),
                        c: formatPercentC(v),
                    })
                }
                formatAriaValueText={(v) =>
                    t('interstellar.maxSpeedSlider.ariaValueText', {
                        value: formatKmps(v),
                    })
                }
            />

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-cyan-100/12 bg-cyan-50/5 p-3 text-left transition hover:border-cyan-200/32 hover:bg-cyan-50/8">
                <input
                    type="checkbox"
                    checked={allowRelativisticLimit}
                    onChange={(event) =>
                        onRelativisticLimitChange(event.currentTarget.checked)
                    }
                    className="mt-1 size-4 accent-cyan-300"
                />
                <span>
                    <span className="block text-sm font-semibold text-cyan-100">
                        {t('interstellar.maxSpeedSlider.relativisticLimitLabel')}
                    </span>
                </span>
            </label>

            <p className="text-xs text-cyan-100/58">
                {allowRelativisticLimit
                    ? t('interstellar.maxSpeedSlider.expandedHint')
                    : t('interstellar.maxSpeedSlider.hint')}
            </p>

            {isEditOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('interstellar.maxSpeedSlider.modalTitle')}
                        className="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-xl"
                    >
                        <button
                            type="button"
                            aria-label={t('interstellar.maxSpeedSlider.close')}
                            onClick={() => setIsEditOpen(false)}
                            className="absolute inset-0 cursor-default"
                        />
                        <div className="relative w-full max-w-md rounded-lg border border-cyan-100/18 bg-[#07101d] p-5 text-white shadow-2xl shadow-black/70 sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/72 uppercase">
                                        {t(
                                            'interstellar.maxSpeedSlider.modalEyebrow',
                                        )}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-semibold tracking-normal">
                                        {t(
                                            'interstellar.maxSpeedSlider.modalTitle',
                                        )}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    aria-label={t(
                                        'interstellar.maxSpeedSlider.close',
                                    )}
                                    onClick={() => setIsEditOpen(false)}
                                    className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded border border-cyan-100/12 bg-cyan-50/5 text-cyan-100 transition hover:bg-cyan-50/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <i
                                        aria-hidden="true"
                                        className="fa-solid fa-xmark"
                                    />
                                </button>
                            </div>

                            <div className="mt-5 grid grid-cols-2 rounded border border-cyan-100/18 bg-slate-950/80 p-1">
                                <button
                                    type="button"
                                    onClick={() => setEditMode('percentC')}
                                    className={`cursor-pointer rounded px-3 py-2 text-sm font-semibold transition ${
                                        editMode === 'percentC'
                                            ? 'bg-cyan-200 text-slate-950'
                                            : 'text-cyan-100 hover:bg-white/10'
                                    }`}
                                >
                                    {t(
                                        'interstellar.maxSpeedSlider.percentMode',
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditMode('kmps')}
                                    className={`cursor-pointer rounded px-3 py-2 text-sm font-semibold transition ${
                                        editMode === 'kmps'
                                            ? 'bg-cyan-200 text-slate-950'
                                            : 'text-cyan-100 hover:bg-white/10'
                                    }`}
                                >
                                    {t('interstellar.maxSpeedSlider.kmpsMode')}
                                </button>
                            </div>

                            <label className="mt-5 block">
                                <span className="text-sm font-semibold text-cyan-100">
                                    {editMode === 'percentC'
                                        ? t(
                                              'interstellar.maxSpeedSlider.percentInputLabel',
                                          )
                                        : t(
                                              'interstellar.maxSpeedSlider.kmpsInputLabel',
                                          )}
                                </span>
                                <input
                                    key={editMode}
                                    type="number"
                                    defaultValue={editValue}
                                    min={editMode === 'percentC' ? 0 : 0}
                                    max={
                                        editMode === 'percentC'
                                            ? 99.999999
                                            : sliderMax / 1000
                                    }
                                    step={editMode === 'percentC' ? 0.000001 : 1}
                                    onBlur={(event) =>
                                        applyEditValue(event.currentTarget.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            applyEditValue(
                                                event.currentTarget.value,
                                            );
                                            setIsEditOpen(false);
                                        }
                                    }}
                                    className="mt-2 block w-full rounded border border-cyan-100/25 bg-slate-950/80 px-3 py-2 font-mono text-base text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                                className="mt-5 inline-flex w-full cursor-pointer items-center justify-center rounded border border-cyan-200/44 bg-cyan-200/12 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                            >
                                {t('interstellar.maxSpeedSlider.done')}
                            </button>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}

function formatKmps(speedMps: number): string {
    return (speedMps / 1000).toLocaleString(undefined, {
        maximumFractionDigits: 0,
    });
}

function formatPercentC(speedMps: number): string {
    return ((speedMps / SPEED_OF_LIGHT) * 100).toLocaleString(undefined, {
        maximumFractionDigits: speedMps > SPEED_OF_LIGHT * 0.99 ? 6 : 2,
    });
}
