import { useTranslation } from '@/hooks/useTranslation';

interface DurationToggleProps {
    mode: 'subjective' | 'earth';
    onChange: (mode: 'subjective' | 'earth') => void;
}

/**
 * DurationToggle — picks which clock is highlighted as primary in the
 * ResultPanel (subjective/traveler time vs Earth/coordinate time).
 *
 * Both clocks render in the panel regardless of toggle state; this
 * control only governs the visual treatment that marks one as the
 * headline. Implemented as a true ARIA radio group rather than two
 * buttons so AT users understand it as a single bi-state choice
 * (vs. two independent toggles).
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function DurationToggle({ mode, onChange }: DurationToggleProps) {
    const { t } = useTranslation();
    const subjectiveSelected = mode === 'subjective';
    const earthSelected = mode === 'earth';

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">
                {t('interstellar.durationToggle.label')}
            </p>
            <div
                role="radiogroup"
                aria-label={t('interstellar.durationToggle.label')}
                className="inline-flex rounded-md border border-neutral-300 bg-white p-1"
            >
                <button
                    type="button"
                    role="radio"
                    aria-checked={subjectiveSelected}
                    onClick={() => onChange('subjective')}
                    className={`rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        subjectiveSelected
                            ? 'bg-blue-600 text-white'
                            : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                >
                    {t('interstellar.durationToggle.subjectiveLabel')}
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={earthSelected}
                    onClick={() => onChange('earth')}
                    className={`rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        earthSelected
                            ? 'bg-blue-600 text-white'
                            : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                >
                    {t('interstellar.durationToggle.earthLabel')}
                </button>
            </div>
            <p className="text-xs text-neutral-500">
                {t('interstellar.durationToggle.hint')}
            </p>
        </div>
    );
}
