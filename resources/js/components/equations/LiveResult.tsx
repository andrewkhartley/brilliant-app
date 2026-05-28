import type { ReactNode } from 'react';

interface LiveResultProps {
    label?: string;
    children: ReactNode;
}

/**
 * Accessible live region for slider-driven result displays.
 *
 * Composition primitive: LiveResult owns AT announcement only. Pair with
 * <EquationCard /> (formula) and <SliderInput /> (input) as siblings in
 * Phase 8's interactive math compositions. Parent owns the computation;
 * LiveResult just announces whatever value gets passed in.
 *
 * Accessibility:
 * - role="status" tags the region as a status-update zone for AT.
 * - aria-live="polite" announces changes when the AT speech queue is
 *   free (vs. "assertive" which interrupts — wrong for this use case
 *   because slider changes are user-initiated and not time-critical).
 * - aria-atomic="true" means the ENTIRE region content is announced on
 *   every change, not just the diff. Appropriate for short result
 *   strings ("Area: 314.16 m²") where the whole value matters.
 *
 * Visual: prominent display so sighted users also see the result clearly.
 * Optional label slot renders inline before the children value.
 *
 * Logical Tailwind classes only — `me-2` (margin-end) flips correctly
 * under RTL without per-locale overrides.
 */
export function LiveResult({ label, children }: LiveResultProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="rounded-lg bg-neutral-50 p-6 text-center text-lg"
        >
            {label && (
                <span className="me-2 text-sm font-medium text-neutral-600">
                    {label}
                </span>
            )}
            <span className="font-mono text-2xl font-semibold text-neutral-900">
                {children}
            </span>
        </div>
    );
}
