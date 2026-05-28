/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import type { Equation } from '@/lib/equations/types';
import { EquationCard } from '../EquationCard';

// Mock @inertiajs/react: usePage() returns the translations bundle shape that
// useTranslation() reads. Mirrors the canonical Laravel namespace structure
// (translations.common.*) so the dot-pathed t() lookups resolve correctly.
//
// Note: translations.common.equations exists here (the four heading/aria keys),
// but no per-equation keys (e.g. translations.equations.testEq.name) are
// defined. That gap drives the fallback-to-registry-source test.
vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            locale: 'en',
            dir: 'ltr',
            translations: {
                common: {
                    equations: {
                        formulaAriaLabel: 'Equation in mathematical notation',
                        symbolHeading: 'Symbol',
                        descriptionHeading: 'Description',
                        unitHeading: 'Unit',
                    },
                },
            },
        },
    }),
}));

// Inline test fixture. Three variables so column-rendering coverage is meaningful.
// `compute` returns a constant — never invoked by the component (the card is
// presentation-only); declared to satisfy the Equation interface.
const testEquation: Equation = {
    id: 'testEq',
    name: 'Test Equation',
    latex: 'a^2 + b^2 = c^2',
    variables: [
        { symbol: 'a', label: 'Side a', units: 'm' },
        { symbol: 'b', label: 'Side b', units: 'm' },
        { symbol: 'c', label: 'Hypotenuse', units: 'm' },
    ],
    compute: () => 0,
};

describe('EquationCard', () => {
    afterEach(() => {
        cleanup();
    });

    test('renders the equation name (fallback to registry source)', () => {
        // The mock provides no translations.equations.testEq.name entry, so the
        // component must fall back to equation.name from the registry.
        render(<EquationCard equation={testEquation} />);

        expect(screen.queryByText('Test Equation')).not.toBeNull();
    });

    test('renders KaTeX HTML output (<span class="katex">)', () => {
        // KaTeX's HTML output is wrapped in <span class="katex">. Asserting on
        // the wrapper proves the dangerouslySetInnerHTML mount worked AND that
        // KaTeX's renderToString returned valid HTML rather than an error string.
        const { container } = render(<EquationCard equation={testEquation} />);

        expect(container.querySelector('.katex')).not.toBeNull();
    });

    test('renders MathML output (<math> element) for screen-reader a11y', () => {
        // output: 'htmlAndMathml' makes KaTeX emit BOTH the visual HTML AND a
        // sibling <math> element wrapped in <span class="katex-mathml">. The
        // MathML half is what assistive tech reads — losing it would break the
        // entire a11y rationale for using KaTeX with that option.
        const { container } = render(<EquationCard equation={testEquation} />);

        expect(container.querySelector('math')).not.toBeNull();
    });

    test('renders legend table with every variable symbol, label, and unit', () => {
        const { container } = render(<EquationCard equation={testEquation} />);

        // Scope to the legend <table>. KaTeX's rendered equation also contains
        // the letters 'a', 'b', 'c' as text nodes inside <span class="katex">,
        // so a screen-wide queryByText would hit duplicates. The legend's
        // <tbody> rows are the canonical source for symbol/label/unit data.
        const table = container.querySelector('table');
        expect(table).not.toBeNull();
        const rows = table!.querySelectorAll('tbody tr');
        expect(rows).toHaveLength(3);

        // Row order matches variables[] order: a, b, c.
        const cellTexts = Array.from(rows).map((row) =>
            Array.from(row.querySelectorAll('td')).map(
                (cell) => cell.textContent,
            ),
        );

        expect(cellTexts[0]).toEqual(['a', 'Side a', 'm']);
        expect(cellTexts[1]).toEqual(['b', 'Side b', 'm']);
        expect(cellTexts[2]).toEqual(['c', 'Hypotenuse', 'm']);
    });

    test('hides the legend table when showLegend={false}', () => {
        const { container } = render(
            <EquationCard equation={testEquation} showLegend={false} />,
        );

        expect(container.querySelector('table')).toBeNull();
    });

    test('falls back to registry equation.name when translation key missing', () => {
        // The mock deliberately omits translations.equations.testEq.name. The
        // useTranslation hook returns the key itself ('equations.testEq.name')
        // for missing lookups, so the component must detect that and substitute
        // equation.name from the registry. This test asserts the fallback fires
        // by confirming the rendered name is the registry value, NOT the raw
        // dot-pathed key.
        render(<EquationCard equation={testEquation} />);

        expect(screen.queryByText('Test Equation')).not.toBeNull();
        expect(screen.queryByText('equations.testEq.name')).toBeNull();
    });
});
