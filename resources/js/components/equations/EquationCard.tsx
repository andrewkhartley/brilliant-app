import katex from 'katex';
import { useMemo } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import type { Equation } from '@/lib/equations/types';

interface EquationCardProps {
    equation: Equation;
    showLegend?: boolean;
    theme?: 'cyan' | 'amber';
}

/**
 * Renders an equation as KaTeX HTML+MathML plus a variable legend table.
 *
 * Composition:
 * - Card owns presentation only. SliderInput + LiveResult are sibling
 *   components in Phase 8's interactive composition — EquationCard does NOT
 *   know about input values or computation. A static About-page equation
 *   card therefore doesn't drag in slider machinery.
 *
 * KaTeX output mode:
 * - `output: 'htmlAndMathml'` emits BOTH the visual HTML and a hidden <math>
 *   element. The HTML renders the equation; the MathML is what assistive
 *   tech reads. Losing either half breaks one audience — never change this
 *   without thinking about both.
 * - `throwOnError: false` degrades malformed LaTeX to a visible error string
 *   instead of crashing the React tree. Defense in depth: the registry is
 *   trusted input today, but a typo in a future hand-authored equation
 *   shouldn't take down the page.
 * - `displayMode: true` renders in block-display style (centered, larger,
 *   with `\displaystyle` defaults) — appropriate for a card's hero element.
 *
 * Security — `dangerouslySetInnerHTML` is intentional and safe here:
 * - KaTeX's `renderToString()` returns an HTML string; the React-idiomatic
 *   mounting is `dangerouslySetInnerHTML` (no alternative exists without
 *   shipping an HTML parser).
 * - Trust boundary: `equation.latex` is a hand-authored LaTeX string from
 *   the Phase 3 registry (`resources/js/lib/equations/*.ts`), baked into
 *   the bundle at build time. It is NOT user input, NOT modifiable at
 *   runtime, NOT fetched from a remote API.
 * - Do NOT add a DOMPurify sanitizer — it would strip the MathML elements
 *   KaTeX emits, breaking the screen-reader accessibility that is the
 *   entire point of `output: 'htmlAndMathml'`.
 * - If a future change introduces user-supplied LaTeX (e.g. a "try your
 *   own equation" feature), the trust boundary moves and sanitization
 *   must be added at that new boundary, not here.
 *
 * i18n fallback strategy:
 * - The project's `useTranslation` hook returns the lookup key itself when
 *   a translation is missing (intentional surface-the-bug design). For the
 *   per-equation `name` and per-variable `label` strings, the registry
 *   already contains hand-authored English values; we want THOSE rather
 *   than a raw `equations.testEq.name` string if translation coverage
 *   hasn't been added yet. The `translate()` helper below detects the
 *   key-equals-value case and falls back to the registry-source string.
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function EquationCard({
    equation,
    showLegend = true,
    theme = 'cyan',
}: EquationCardProps) {
    const { t } = useTranslation();
    const styles = equationCardStyles[theme];

    // KaTeX render is input-stable: equation.latex never changes after mount
    // (the registry is bundle-time data). useMemo prevents re-renders from
    // re-running renderToString unnecessarily.
    const html = useMemo(
        () =>
            katex.renderToString(equation.latex, {
                output: 'htmlAndMathml',
                throwOnError: false,
                displayMode: true,
            }),
        [equation.latex],
    );

    const nameKey = `equations.${equation.id}.name`;
    const displayName = translate(t(nameKey), nameKey, equation.name);

    return (
        <article className={styles.card}>
            <header className="mb-4">
                <h3 className="text-lg font-semibold text-white">
                    {displayName}
                </h3>
            </header>
            <div
                className={styles.formula}
                aria-label={t('common.equations.formulaAriaLabel')}
                dangerouslySetInnerHTML={{ __html: html }}
            />
            {showLegend && (
                <table className="w-full text-sm">
                    <thead className="sr-only">
                        <tr>
                            <th>{t('common.equations.symbolHeading')}</th>
                            <th>{t('common.equations.descriptionHeading')}</th>
                            <th>{t('common.equations.unitHeading')}</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                        {equation.variables.map((v) => {
                            const labelKey = `equations.${equation.id}.variables.${v.symbol}`;

                            return (
                                <tr key={v.symbol}>
                                    <td className={styles.symbol}>
                                        {v.symbol}
                                    </td>
                                    <td className={styles.label}>
                                        {translate(
                                            t(labelKey),
                                            labelKey,
                                            v.label,
                                        )}
                                    </td>
                                    <td className={styles.unit}>
                                        {v.units ?? ''}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </article>
    );
}

const equationCardStyles = {
    cyan: {
        card: 'rounded-lg border border-cyan-100/20 bg-slate-950/78 p-6 text-cyan-50 shadow-2xl shadow-black/35 backdrop-blur-md',
        formula: 'my-4 overflow-x-auto text-center text-cyan-50',
        tableBody: 'divide-y divide-cyan-100/10',
        symbol: 'py-2 font-serif font-bold text-cyan-100',
        label: 'py-2 text-slate-200',
        unit: 'py-2 text-cyan-100/58',
    },
    amber: {
        card: 'rounded-lg border border-amber-100/18 bg-[#100d08]/78 p-6 text-amber-50 shadow-2xl shadow-black/35 backdrop-blur-md',
        formula: 'my-4 overflow-x-auto text-center text-amber-50',
        tableBody: 'divide-y divide-amber-100/10',
        symbol: 'py-2 font-serif font-bold text-amber-100',
        label: 'py-2 text-amber-50/82',
        unit: 'py-2 text-amber-100/58',
    },
} as const;

/**
 * Translation fallback shim. The project's useTranslation hook returns the
 * lookup key itself for missing entries (intentional surface-the-bug design).
 * For registry-source strings (equation name, variable label) we already have
 * a hand-authored English value — prefer that over the raw key.
 */
function translate(
    translated: string,
    lookupKey: string,
    fallback: string,
): string {
    return translated === lookupKey ? fallback : translated;
}
