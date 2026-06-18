/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { ResumeLine } from '../ResumeLine';

describe('ResumeLine', () => {
    afterEach(() => {
        cleanup();
    });

    test('renders both the corporate and honest text in the DOM', () => {
        // The wipe is purely visual; both full lines must always be present
        // so screen readers read everything regardless of handle position.
        render(
            <ResumeLine
                corporate="Drove $1M+ in operational cost efficiencies."
                honest="I did the work of a team that was never hired."
            />,
        );

        expect(
            screen.queryByText('Drove $1M+ in operational cost efficiencies.'),
        ).not.toBeNull();
        expect(
            screen.queryByText('I did the work of a team that was never hired.'),
        ).not.toBeNull();
    });

    test('clips the corporate layer from the right using the --wipe var', () => {
        const { container } = render(
            <ResumeLine corporate="Corp text" honest="Honest text" />,
        );
        const corp = container.querySelector('[data-layer="corporate"]');

        expect(corp).not.toBeNull();
        expect(corp?.getAttribute('style')).toContain('inset(0 calc(100% - var(--wipe))');
    });

    test('clips the honest layer from the left using the --wipe var', () => {
        const { container } = render(
            <ResumeLine corporate="Corp text" honest="Honest text" />,
        );
        const honest = container.querySelector('[data-layer="honest"]');

        expect(honest).not.toBeNull();
        expect(honest?.getAttribute('style')).toContain('inset(0 0 0 var(--wipe))');
    });

    test('uses logical Tailwind classes (no physical left/right)', () => {
        const { container } = render(
            <ResumeLine corporate="Corp" honest="Honest" />,
        );

        expect(container.innerHTML).not.toMatch(/\b(ml|mr|pl|pr|left|right)-/);
    });
});
