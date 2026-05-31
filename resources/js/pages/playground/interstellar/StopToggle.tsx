import { useTranslation } from '@/hooks/useTranslation';

interface StopToggleProps {
    stop: boolean;
    onChange: (stop: boolean) => void;
}

/**
 * StopToggle — picks the arrival profile fed into the 3-phase trip
 * math: decelerate to rest at the destination (`stop = true`) vs
 * fly past at v_max (`stop = false`).
 *
 * Δv consequence (the reason this toggle exists):
 *   stop = true  → Δv = 2 · v_max  (accelerate up, decelerate down)
 *   stop = false → Δv =     v_max  (accelerate only)
 *
 * Since the fuel mass ratio scales as `((1+β)/(1−β))^(c/2v_e)`, the
 * stop-vs-flyby choice can collapse a 3× mass ratio into a 1.5× one
 * for the same v_max. Surfaces that tradeoff to the user.
 *
 * Mirrors DurationToggle structurally (ARIA radiogroup, two
 * role="radio" buttons, blue-filled active state). Logical Tailwind
 * classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function StopToggle({ stop, onChange }: StopToggleProps) {
    const { t } = useTranslation();
    const stopSelected = stop;
    const flybySelected = !stop;

    return (
        <div className="space-y-2 rounded-lg border border-cyan-100/15 bg-slate-950/72 p-4 backdrop-blur-md">
            <p className="text-sm font-semibold text-cyan-100">
                {t('interstellar.stopToggle.label')}
            </p>
            <div
                role="radiogroup"
                aria-label={t('interstellar.stopToggle.ariaLabel')}
                className="inline-flex rounded border border-cyan-100/25 bg-slate-950/80 p-1"
            >
                <button
                    type="button"
                    role="radio"
                    aria-checked={stopSelected}
                    onClick={() => onChange(true)}
                    className={`cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                        stopSelected
                            ? 'bg-cyan-200 text-slate-950 shadow-[0_0_18px_rgba(103,232,249,0.22)]'
                            : 'text-cyan-100 hover:bg-white/10'
                    }`}
                >
                    {t('interstellar.stopToggle.stopLabel')}
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={flybySelected}
                    onClick={() => onChange(false)}
                    className={`cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                        flybySelected
                            ? 'bg-cyan-200 text-slate-950 shadow-[0_0_18px_rgba(103,232,249,0.22)]'
                            : 'text-cyan-100 hover:bg-white/10'
                    }`}
                >
                    {t('interstellar.stopToggle.flybyLabel')}
                </button>
            </div>
            <p className="text-xs text-cyan-100/58">
                {t('interstellar.stopToggle.hint')}
            </p>
        </div>
    );
}
