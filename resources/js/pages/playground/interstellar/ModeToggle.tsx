import { useTranslation } from '@/hooks/useTranslation';

interface ModeToggleProps {
    mode: 'beginner' | 'math';
    onChange: (mode: 'beginner' | 'math') => void;
}

/**
 * ModeToggle — Beginner ⇄ Just the math toggle for the Interstellar page.
 *
 * In Beginner mode, the EquationCard is hidden (the page reads as
 * sliders + plain-language result). In Just the math mode, the
 * EquationCard renders prominently above the ResultPanel.
 *
 * Toggle is an ARIA radiogroup with two role="radio" buttons. Active
 * state shown via filled background + bold weight. Visible focus ring
 * per project's focus-visible discipline.
 */
export function ModeToggle({ mode, onChange }: ModeToggleProps) {
    const { t } = useTranslation();
    const beginnerSelected = mode === 'beginner';
    const mathSelected = mode === 'math';

    return (
        <div className="space-y-2 rounded-lg border border-cyan-100/15 bg-slate-950/72 p-4 backdrop-blur-md">
            <p className="text-sm font-semibold text-cyan-100">
                {t('interstellar.modeToggle.label')}
            </p>
            <div
                role="radiogroup"
                aria-label={t('interstellar.modeToggle.ariaLabel')}
                className="inline-flex rounded border border-cyan-100/25 bg-slate-950/80 p-1"
            >
                <button
                    type="button"
                    role="radio"
                    aria-checked={beginnerSelected}
                    onClick={() => onChange('beginner')}
                    className={`cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                        beginnerSelected
                            ? 'bg-cyan-200 text-slate-950 shadow-[0_0_18px_rgba(103,232,249,0.22)]'
                            : 'text-cyan-100 hover:bg-white/10'
                    }`}
                >
                    {t('interstellar.modeToggle.beginnerLabel')}
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={mathSelected}
                    onClick={() => onChange('math')}
                    className={`cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                        mathSelected
                            ? 'bg-cyan-200 text-slate-950 shadow-[0_0_18px_rgba(103,232,249,0.22)]'
                            : 'text-cyan-100 hover:bg-white/10'
                    }`}
                >
                    {t('interstellar.modeToggle.mathLabel')}
                </button>
            </div>
            <p className="text-xs text-cyan-100/58">
                {t('interstellar.modeToggle.hint')}
            </p>
        </div>
    );
}
