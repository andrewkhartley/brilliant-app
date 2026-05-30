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
        <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">
                {t('interstellar.modeToggle.label')}
            </p>
            <div
                role="radiogroup"
                aria-label={t('interstellar.modeToggle.ariaLabel')}
                className="inline-flex rounded-md border border-neutral-300 bg-white p-1"
            >
                <button
                    type="button"
                    role="radio"
                    aria-checked={beginnerSelected}
                    onClick={() => onChange('beginner')}
                    className={`rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        beginnerSelected
                            ? 'bg-blue-600 text-white'
                            : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                >
                    {t('interstellar.modeToggle.beginnerLabel')}
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={mathSelected}
                    onClick={() => onChange('math')}
                    className={`rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        mathSelected
                            ? 'bg-blue-600 text-white'
                            : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                >
                    {t('interstellar.modeToggle.mathLabel')}
                </button>
            </div>
            <p className="text-xs text-neutral-500">
                {t('interstellar.modeToggle.hint')}
            </p>
        </div>
    );
}
