import { useMemo } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';
import { allEquations } from '@/lib/equations';
import type { Equation } from '@/lib/equations/types';

/**
 * Phase 8 Task 4.9 — visible PHP-vs-TypeScript parity verification page.
 *
 * Renders the parity fixture (tests/fixtures/equations-parity.json) as a
 * browseable comparison table: for each registry equation, every fixture
 * case is shown with its inputs, the PHP-computed expected value, the live
 * TS-computed value, the diff, and a pass/fail status badge.
 *
 * This is the visible twin of resources/js/lib/equations/__tests__/equations.test.ts:
 * - The test suite is the gate (CI fails red if anything diverges).
 * - This page is the showcase (anyone curious can see the rigor at a glance).
 *
 * Mirrors the established /playground/{scene,components}-debug convention:
 * unlisted route, AppLayout shell, every string flows through useTranslation.
 *
 * v1 is BROWSEABLE not interactive — inputs come from the fixture verbatim.
 * Future enhancement: user-adjustable inputs with live PHP via XHR.
 *
 * Tolerance is magnitude-aware, mirroring the parity test's expectParity():
 *  - For ±Infinity sentinels: exact identity check
 *  - For |expected| > 1: relative diff < 1e-9
 *  - For |expected| ≤ 1: absolute diff < 1e-6 (the toBeCloseTo(_, 6) floor)
 * This is why trip-duration cases show tiny non-zero diffs at the ulp scale
 * (~2 × 10^-8 at magnitudes near 6e8) while still passing — the diff column
 * surfaces the divergence honestly without flagging it as failure.
 */

/**
 * Raw fixture shape — JSON booleans for `stop`, "Infinity" string sentinel
 * for unbounded outputs (JSON cannot encode ±∞ natively). The page
 * normalises both directions at the render boundary, the same way the
 * parity test does.
 */
type FixtureExpected = number | string | null;
type FixtureInputs = Record<string, number | boolean>;
type FixtureCase = { inputs: FixtureInputs; expected: FixtureExpected };
type FixturePayload = Record<string, FixtureCase[]>;

interface Props {
    fixture: FixturePayload;
    fixturePath: string;
}

/**
 * Deserialise the JSON "Infinity" sentinel back to a native float.
 * Matches the parity test's deserialiseExpected() shim. Returns NaN for
 * unknown string sentinels so they fall through to the "fail" branch
 * rather than silently passing on accident.
 */
function deserialiseExpected(expected: FixtureExpected): number {
    if (expected === 'Infinity') {
        return Number.POSITIVE_INFINITY;
    }

    if (expected === '-Infinity') {
        return Number.NEGATIVE_INFINITY;
    }

    if (typeof expected === 'number') {
        return expected;
    }

    return Number.NaN;
}

/**
 * Normalise fixture booleans → 0/1, matching the parity test's
 * normaliseInputs() shim. The TS compute signature is strictly numeric;
 * boolean-flag inputs (the `stop` parameter on trip-duration equations)
 * are coerced via Boolean(...) inside compute, matching PHP's (bool) cast.
 */
function normaliseInputs(inputs: FixtureInputs): Record<string, number> {
    const out: Record<string, number> = {};

    for (const [key, value] of Object.entries(inputs)) {
        out[key] = typeof value === 'boolean' ? (value ? 1 : 0) : value;
    }

    return out;
}

/**
 * Magnitude-aware tolerance: identical to the parity test's expectParity().
 * Returns { passes, diff } so the table can render both the boolean status
 * and the numeric divergence in adjacent columns.
 */
function evaluateParity(
    actual: number,
    expected: number,
): { passes: boolean; diff: number } {
    if (!Number.isFinite(expected)) {
        return {
            passes: actual === expected,
            diff: actual === expected ? 0 : Number.NaN,
        };
    }

    const diff = actual - expected;
    const absDiff = Math.abs(diff);
    const magnitude = Math.max(Math.abs(actual), Math.abs(expected));

    if (magnitude > 1) {
        return { passes: absDiff / magnitude < 1e-9, diff };
    }

    return { passes: absDiff < 1e-6, diff };
}

/**
 * Pretty-print a number for the table cells. Uses exponential notation for
 * very large or very small magnitudes (the parity fixture covers both — trip
 * durations are ~6e8 seconds, fuel mass ratios are ~1.2 to 1.9, the diff
 * column is often ~1e-8). Renders ±Infinity as the i18n'd ∞ glyph.
 */
function formatNumber(value: number, infinityLabel: string): string {
    if (value === Number.POSITIVE_INFINITY) {
        return infinityLabel;
    }

    if (value === Number.NEGATIVE_INFINITY) {
        return `-${infinityLabel}`;
    }

    if (Number.isNaN(value)) {
        return 'NaN';
    }

    const magnitude = Math.abs(value);

    if (magnitude !== 0 && (magnitude >= 1e6 || magnitude < 1e-3)) {
        return value.toExponential(6);
    }

    return value.toPrecision(8);
}

/**
 * Format a single fixture input record as a compact `key=value, ...` string.
 * Booleans stay as `true`/`false` (not 0/1) so the human-facing column
 * reflects the fixture's JSON shape, not the post-normalisation form.
 */
function formatInputs(inputs: FixtureInputs, infinityLabel: string): string {
    return Object.entries(inputs)
        .map(([key, value]) => {
            if (typeof value === 'boolean') {
                return `${key}=${value ? 'true' : 'false'}`;
            }

            return `${key}=${formatNumber(value, infinityLabel)}`;
        })
        .join(', ');
}

/**
 * One row per fixture case: inputs, PHP expected, TS computed, diff, status.
 * Pulled out so the table body stays declarative and the row-level
 * computation (expected/actual deserialise + parity check) is colocated
 * with the row's render.
 */
interface ComparisonRowProps {
    fixtureCase: FixtureCase;
    equation: Equation;
}

function ComparisonRow({ fixtureCase, equation }: ComparisonRowProps) {
    const { t } = useTranslation();
    const infinityLabel = t('playground.equationsDebug.infinityLabel');

    const expected = deserialiseExpected(fixtureCase.expected);
    const actual = equation.compute(normaliseInputs(fixtureCase.inputs));
    const { passes, diff } = evaluateParity(actual, expected);

    return (
        <tr className={passes ? '' : 'bg-red-50'}>
            <td className="px-3 py-2 font-mono text-xs text-neutral-700">
                {formatInputs(fixtureCase.inputs, infinityLabel)}
            </td>
            <td className="px-3 py-2 text-end font-mono text-xs text-neutral-700">
                {formatNumber(expected, infinityLabel)}
            </td>
            <td className="px-3 py-2 text-end font-mono text-xs text-neutral-700">
                {formatNumber(actual, infinityLabel)}
            </td>
            <td className="px-3 py-2 text-end font-mono text-xs text-neutral-500">
                {formatNumber(diff, infinityLabel)}
            </td>
            <td className="px-3 py-2 text-center">
                <span
                    className={
                        passes
                            ? 'inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800'
                            : 'inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800'
                    }
                >
                    {passes
                        ? t('playground.equationsDebug.statusPass')
                        : t('playground.equationsDebug.statusFail')}
                </span>
            </td>
        </tr>
    );
}

interface EquationBlockProps {
    equationId: string;
    cases: FixtureCase[];
}

function EquationBlock({ equationId, cases }: EquationBlockProps) {
    const { t } = useTranslation();
    const equation = allEquations.find((eq) => eq.id === equationId);

    if (!equation) {
        return (
            <section className="mt-8 rounded-lg border border-red-300 bg-red-50 p-4">
                <h2 className="text-sm font-semibold text-red-800">
                    {equationId}
                </h2>
                <p className="mt-1 text-xs text-red-700">
                    {t('playground.equationsDebug.statusFail')}
                </p>
            </section>
        );
    }

    return (
        <section className="mt-8 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <header className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
                <h2 className="font-mono text-sm font-semibold text-neutral-900">
                    {equation.id}
                </h2>
                <p className="mt-1 text-xs text-neutral-600">{equation.name}</p>
                <p className="mt-1 font-mono text-xs text-neutral-500">
                    {equation.latex}
                </p>
            </header>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-neutral-100 text-xs tracking-wide text-neutral-600 uppercase">
                        <tr>
                            <th
                                scope="col"
                                className="px-3 py-2 text-start font-semibold"
                            >
                                {t('playground.equationsDebug.columnInputs')}
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-2 text-end font-semibold"
                            >
                                {t(
                                    'playground.equationsDebug.columnPhpExpected',
                                )}
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-2 text-end font-semibold"
                            >
                                {t(
                                    'playground.equationsDebug.columnTsComputed',
                                )}
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-2 text-end font-semibold"
                            >
                                {t('playground.equationsDebug.columnDiff')}
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-2 text-center font-semibold"
                            >
                                {t('playground.equationsDebug.columnStatus')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {cases.map((fixtureCase, index) => (
                            <ComparisonRow
                                key={index}
                                fixtureCase={fixtureCase}
                                equation={equation}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default function EquationsDebugPage({ fixture, fixturePath }: Props) {
    const { t } = useTranslation();

    /**
     * Aggregate pass/fail counters across every fixture case. Memoised on
     * the fixture identity — props don't change between renders for a v1
     * browseable page, but useMemo keeps the future "live inputs" enhancement
     * cheap to add (a single dependency swap, not a render-cost rewrite).
     */
    const { totalCases, passingCases, failingCases, equationCount } =
        useMemo(() => {
            let total = 0;
            let passing = 0;

            for (const [equationId, cases] of Object.entries(fixture)) {
                const equation = allEquations.find(
                    (eq) => eq.id === equationId,
                );

                if (!equation) {
                    total += cases.length;

                    continue;
                }

                for (const fixtureCase of cases) {
                    total += 1;
                    const expected = deserialiseExpected(fixtureCase.expected);
                    const actual = equation.compute(
                        normaliseInputs(fixtureCase.inputs),
                    );

                    if (evaluateParity(actual, expected).passes) {
                        passing += 1;
                    }
                }
            }

            return {
                totalCases: total,
                passingCases: passing,
                failingCases: total - passing,
                equationCount: Object.keys(fixture).length,
            };
        }, [fixture]);

    return (
        <AppLayout pageTitle={t('playground.equationsDebug.pageTitle')}>
            <section className="mx-auto max-w-6xl px-4 py-12">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('playground.equationsDebug.heading')}
                    </h1>
                    <p className="mt-4 text-neutral-700">
                        {t('playground.equationsDebug.intro')}
                    </p>
                    <p className="mt-2 text-sm text-neutral-500">
                        {t('playground.equationsDebug.fixturePathLabel')}
                        {': '}
                        <code className="font-mono text-xs">{fixturePath}</code>
                    </p>
                </header>

                <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                        <dt className="text-xs tracking-wide text-neutral-500 uppercase">
                            {t('playground.equationsDebug.columnStatus')}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-neutral-900">
                            {t('playground.equationsDebug.totalCasesFormat', {
                                count: totalCases,
                                equations: equationCount,
                            })}
                        </dd>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <dt className="text-xs tracking-wide text-emerald-700 uppercase">
                            {t('playground.equationsDebug.statusPass')}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-emerald-900">
                            {t('playground.equationsDebug.passingFormat', {
                                count: passingCases,
                            })}
                        </dd>
                    </div>
                    <div
                        className={
                            failingCases > 0
                                ? 'rounded-lg border border-red-200 bg-red-50 px-4 py-3'
                                : 'rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3'
                        }
                    >
                        <dt
                            className={
                                failingCases > 0
                                    ? 'text-xs tracking-wide text-red-700 uppercase'
                                    : 'text-xs tracking-wide text-neutral-500 uppercase'
                            }
                        >
                            {t('playground.equationsDebug.statusFail')}
                        </dt>
                        <dd
                            className={
                                failingCases > 0
                                    ? 'mt-1 text-sm font-semibold text-red-900'
                                    : 'mt-1 text-sm font-semibold text-neutral-900'
                            }
                        >
                            {t('playground.equationsDebug.failingFormat', {
                                count: failingCases,
                            })}
                        </dd>
                    </div>
                </dl>

                {Object.entries(fixture).map(([equationId, cases]) => (
                    <EquationBlock
                        key={equationId}
                        equationId={equationId}
                        cases={cases}
                    />
                ))}
            </section>
        </AppLayout>
    );
}
