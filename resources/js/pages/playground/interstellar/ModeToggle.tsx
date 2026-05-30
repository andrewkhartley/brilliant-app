import { useTranslation } from '@/hooks/useTranslation';

interface ModeToggleProps {
    mode: 'beginner' | 'math';
    onChange: (mode: 'beginner' | 'math') => void;
}

/**
 * ModeToggle stub. Real interactive toggle lands in P8.T4 (mode
 * toggle behavior + visual treatment).
 *
 * In production: Beginner mode hides the EquationCard; Just the math
 * mode shows it prominently above the ResultPanel.
 */
export function ModeToggle({ mode, onChange }: ModeToggleProps) {
    const { t } = useTranslation();
    // Props captured for type-checking; stub renders placeholder only.
    void mode;
    void onChange;

    return (
        <div className="rounded border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
            {t('interstellar.modeToggle.placeholderNote')}
        </div>
    );
}
