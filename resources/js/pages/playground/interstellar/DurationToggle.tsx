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
        <div className="space-y-2 rounded-lg border border-cyan-100/15 bg-slate-950/72 p-4 text-center backdrop-blur-md">
            <p className="text-sm font-semibold text-cyan-100">
                {t('interstellar.durationToggle.label')}
            </p>
            <div
                role="radiogroup"
                aria-label={t('interstellar.durationToggle.label')}
                className="mx-auto inline-flex rounded border border-cyan-100/25 bg-slate-950/80 p-1"
            >
                <button
                    type="button"
                    role="radio"
                    aria-checked={subjectiveSelected}
                    onClick={() => onChange('subjective')}
                    className={`cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                        subjectiveSelected
                            ? 'bg-cyan-200 text-slate-950 shadow-[0_0_18px_rgba(103,232,249,0.22)]'
                            : 'text-cyan-100 hover:bg-white/10'
                    }`}
                >
                    {t('interstellar.durationToggle.subjectiveLabel')}
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={earthSelected}
                    onClick={() => onChange('earth')}
                    className={`cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                        earthSelected
                            ? 'bg-cyan-200 text-slate-950 shadow-[0_0_18px_rgba(103,232,249,0.22)]'
                            : 'text-cyan-100 hover:bg-white/10'
                    }`}
                >
                    {t('interstellar.durationToggle.earthLabel')}
                </button>
            </div>
            <p className="text-xs text-cyan-100/58">
                {t('interstellar.durationToggle.hint')}
            </p>
        </div>
    );
}
